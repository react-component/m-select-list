import assign from 'object-assign';

export const isTouchable = 'ontouchstart' in window;
export const START = isTouchable ? 'touchstart' : 'mousedown';
export const MOVE = isTouchable ? 'touchmove' : 'mousemove';
export const END = isTouchable ? 'touchend' : 'mouseup';
export const CANCEL = isTouchable ? 'touchcancel' : 'mousecancel';
export const CLICK = isTouchable ? 'touchstart' : 'click';

const VALVE = 10;
const isBadMobile = (/Android[^\d]*(1|2|3|4\.0)/.test(window.navigator.appVersion) ||
  /iPhone[^\d]*(5)/.test(window.navigator.appVersion));

const getTime = Date.now || function() {
  return +new Date();
};

function addEvent(el, type, callback) {
  const t = type.split(' ');
  for (let i = 0; i < t.length; i++) {
    el.addEventListener(t[i], callback, false);
  }
}
function removeEvent(el, type, callback) {
  const t = type.split(' ');
  for (let i = 0; i < t.length; i++) {
    el.removeEventListener(t[i], callback, false);
  }
}

function _event(e) {
  if (e.touches && e.touches.length) {
    return e.touches[0];
  }
  if (e.changedTouches && e.changedTouches.length) {
    return e.changedTouches[0];
  }
  return e;
}
function _pageX(e) {
  return _event(e).pageX;
}
function _getPageY(e) {
  return _event(e).pageY;
}
function momentum(current, start, time, deceleration) {
  const distance = current - start;
  const speed = Math.abs(distance) / time;
  const d = deceleration === undefined ? 0.0006 : deceleration;

  const destination = current + (speed * speed) / (2 * d) * (distance < 0 ? -1 : 1);
  const duration = speed / d;

  return {
    destination: Math.round(destination),
    duration: duration,
  };
}

// event management helper
export function EventManager(target) {
  this.target = target;
  this._startEvents = [];
  this._moveEvents = [];
  this._endEvents = [];
  this.startEvent();
}

EventManager.prototype = {
  addHandler: function(event) {
    if (event.start) {
      this._startEvents.push(event.start);
    }
    if (event.move) {
      this._moveEvents.push(event.move);
    }
    if (event.end) {
      this._endEvents.push(event.end);
    }
  },
  startEvent: function() {
    const self = this;
    function _startEvent() {
      addEvent(window, MOVE, self._move = function(e) {
        self._moveEvents.forEach(function(callback) {
          callback.call(self, e);
        });
      }, false);

      addEvent(window, END, self._end = function(e) {
        self._endEvents.forEach(function(callback) {
          callback.call(self, e);
          callback._isEnded = true;
        });
        self.endEvent(true);
      }, false);

      addEvent(window, CANCEL, self._cancel = function(e) {
        self._endEvents.forEach(function(callback) {
          if (!callback._isEnded) {
            callback.call(self, e);
          }
          callback._isEnded = true;
        });
        self.endEvent(true);
      }, false);
    }
    // catch event starting from target
    addEvent(self.target, START, self._start = function(e) {
      self._startEvents.forEach(function(callback) {
        callback.call(self, e);
      });
      self._endEvents.forEach(function(callback) {
        callback._isEnded = false;
      });
      _startEvent();
    });
  },
  endEvent: function(keepStart) {
    if (!keepStart && this._start) {
      removeEvent(this.target, START, this._start, false);
      this._start = null;
    }
    if ( this._move ) {
      removeEvent(window, MOVE, this._move, false);
      this._move = null;
    }
    if ( this._end ) {
      removeEvent(window, END, this._end, false);
      this._end = null;
    }
    if ( this._cancel ) {
      removeEvent(window, CANCEL, this._cancel, false);
      this._cancel = null;
    }
  },
};


export function handleScrolling(eventManager, instance) {
  let _lastEl;
  let _startY;
  let _pageY;
  let _distY;
  let _isAnimating;
  let _startTime;
  let _endTime;

  instance._y = 0;
  instance.refs.viewport.style.overflow = 'hidden';

  const rException = /^(INPUT|TEXTAREA|BUTTON|SELECT)$/;
  const rAF = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };

  function _easing(k) {
    let kk = k;
    return Math.sqrt(1 - (--kk * kk));
  }

  function _translate(y) {
    let _currentPos = y;
    const MAX_HEIGHT = instance.refs.container.offsetHeight - instance.refs.viewport.offsetHeight;

    if (_currentPos < -MAX_HEIGHT) {
      _currentPos = -MAX_HEIGHT;
    }
    if (_currentPos > 0) {
      _currentPos = 0;
    }

    instance._y = Math.round(_currentPos);
    instance.refs.container.style.top = instance._y + 'px';
  }

  function _animate(destY, startY, duration) {
    const startTime = getTime();
    const destTime = startTime + duration;

    function step() {
      let now = getTime();
      let newY;
      let easing;

      if (now >= destTime) {
        _translate(destY);
        return;
      }

      now = (now - startTime) / duration;
      easing = _easing(now);
      newY = (destY - startY) * easing + startY;
      _translate(newY);

      if (_isAnimating) {
        rAF(step);
      }
    }

    _isAnimating = true;
    step();
  }

  function _start(e) {
    const target = e.target;
    if (rException.test(target.tagName) || target.getAttribute('data-cid') === 'sinput') {
      return;
    }
    if (target.getAttribute('data-cid') === 'clear' || target.parentNode.getAttribute('data-cid') === 'clear') {
      instance.onClear();
      return;
    }

    const _e = _event(e);
    _lastEl = _e.target;
    _startTime = getTime();
    _startY = instance._y;
    _pageY = _e.pageY;
    _distY = 0;

    if (_isAnimating) {
      _isAnimating = false;
      _translate(_startY);
    }

    e.preventDefault();
  }

  function _move(e) {
    if (!_lastEl) {
      return;
    }
    const _e = _event(e);
    const _diff = Math.round(_e.pageY - _pageY);

    _distY += _diff;
    _pageY = _e.pageY;
    instance._y += _diff;
    _translate(instance._y);
  }

  function _end() {
    if (!_lastEl) {
      return;
    }
    _lastEl = null;
    if (Math.abs(_distY) < VALVE) {
      return;
    }
    _endTime = getTime();
    let _duration = _endTime - _startTime;
    if (_duration < 300) {
      const _momentum = momentum(instance._y, _startY, _duration);

      if (Math.abs(_momentum.destination) > 0) {
        instance._y = _momentum.destination;
        _duration = Math.max(_duration, _momentum.duration);
        _animate(instance._y, _startY, _duration);
      }
    }
  }

  eventManager.addHandler({
    start: _start,
    move: _move,
    end: _end,
  });
}

export function handleTapping(eventManager, instance) {
  let _el = null;
  let _isEnded = false;
  let _deltaX = 0;
  let _deltaY = 0;
  let _lastPageX = 0;
  let _lastPageY = 0;
  let _noop = false;

  function _touchStart(e) {
    if ((e.touches || [e]).length !== 1) {
      _noop = true;
      return;
    }
    let target = e.target;
    while (target) {
      if (!target.getAttribute || target.getAttribute('data-key')) {
        break;
      }
      target = target.parentNode;
    }
    if (!target.getAttribute) {
      target = e.target;
    }

    _el = {
      _src: target,
      target: target,
      pageX: _pageX(e),
      pageY: _getPageY(e),
      time: getTime(),
    };

    _noop = false;
    _lastPageX = _el.pageX;
    _lastPageY = _el.pageY;
    _isEnded = false;
    _deltaX = 0;
    _deltaY = 0;
  }

  function _touchMove(e) {
    if (_isEnded || _noop || !_el) {
      return;
    }
    _deltaX += _pageX(e) - _lastPageX;
    _deltaY += _getPageY(e) - _lastPageY;
    _lastPageX = _pageX(e);
    _lastPageY = _getPageY(e);

    if (Math.abs(_deltaY) > VALVE || Math.abs(_deltaX) > VALVE) {
      _el = null;
    }
  }

  function _touchEnd(e) {
    _isEnded = true;
    if (_noop || !_el) {
      return;
    }
    _deltaX += _pageX(e) - _lastPageX;
    _deltaY += _getPageY(e) - _lastPageY;
    _lastPageX = _pageX(e);
    _lastPageY = _getPageY(e);

    if (Math.abs(_deltaY) > VALVE || Math.abs(_deltaX) > VALVE) {
      _el = null;
      return;
    }

    const target = _el.target;
    const id = target.getAttribute('data-key');
    let isHit = false;

    if (id) {
      setTimeout(function() {
        instance.onSelect(instance.cache[`${id}_${target.getAttribute('data-spell')}`]);
      }, 0);
      isHit = true;
    } else if (target.getAttribute('data-cid') === 'sinput') {
      setTimeout(function() {
        target.focus();
        instance.onSearch();
      }, 0);
    } else if (target.getAttribute('data-cid') === 'clear' || target.parentNode.getAttribute('data-cid') === 'clear') {
      instance.onClear();
      isHit = true;
    }

    _el = null;
    if (isHit) {
      e.preventDefault();
    }
  }

  eventManager.addHandler({
    start: _touchStart,
    move: _touchMove,
    end: _touchEnd,
  });

  if (isBadMobile || !isTouchable) {
    return handleScrolling(eventManager, instance);
  }

  instance._useNative = true;
  assign(instance.refs.viewport.style, {
    '-webkit-overflow-scrolling': 'touch',
    'z-index': '998',
    'overflow': 'auto',
  });
}

export function handleQuickBar(instance, element) {
  const hCache = [];
  const qfList = instance.refs.qfList;
  const height = qfList.offsetHeight;

  [].slice.call(qfList.querySelectorAll('[data-qf-target]')).forEach(function(d) {
    hCache.push([d]);
  });

  const _avgH = height / hCache.length;
  let _top = 0;

  for (let i = 0, len = hCache.length; i < len; i++) {
    _top = i * _avgH;
    hCache[i][1] = [_top, _top + _avgH];
  }

  // relative to container
  function _getEle(e, basePos) {
    let _pos;
    if (e.pageY >= basePos.top && e.pageY <= (basePos.top + height)) {
      _pos = Math.floor((e.pageY - basePos.top) / _avgH);
      if (_pos in hCache) {
        return hCache[_pos][0];
      }
    }
    return null;
  }

  let _inMoving = false;
  let _isProcessed = false;
  let _basePos;
  const tAttr = 'data-qf-target';

  function _updatePosition(ele) {
    const pos = ele.offsetTop;
    if (instance._useNative) {
      setTimeout(function() {
        instance.refs.viewport.scrollTop = pos;
      }, 20);
    } else {
      instance._y = -pos;
      instance.refs.container.style.top = -pos + 'px';
    }
  }
  let _timer;
  function _updateLighter(ele, isEnd) {
    let el = ele;
    if (!el.getAttribute(tAttr)) {
      el = el.parentNode;
    }
    instance.refs.lighter.innerText = el.innerText.trim();
    instance.setState({
      showLighter: true,
    });
    clearTimeout(_timer);
    _timer = setTimeout(function() {
      instance.setState({
        showLighter: false,
      });
    }, 1000);

    const cls = 'quick-search-over';
    hCache.forEach(function(d) {
      d[0].className = d[0].className.replace(cls, '');
    });
    if (!isEnd) {
      el.className = `${el.className} ${cls}`;
    }
  }

  let _target;
  function _start(e) {
    _target = e.target;
    if (_target.getAttribute(tAttr) || _target.parentNode.getAttribute(tAttr)) {
      _inMoving = true;
      _isProcessed = false;
      _basePos = qfList.getBoundingClientRect();
      _updateLighter(_target);
    }
    e.preventDefault();
    instance.setState({
      clickFeedBack: true,
    });
  }
  function _move(e) {
    let ele;
    let id;
    let target;

    if (_inMoving && _target) {
      target = _getEle(_event(e), _basePos);
      if (target) {
        _isProcessed = true;
        id = target.getAttribute(tAttr);
        ele = element.querySelector(id);
        if (ele) {
          _updatePosition(ele);
        }
        _updateLighter(target);
        _target = target;
      }
    }
    e.preventDefault();
  }
  function _end() {
    if (!_target) {
      return;
    }
    const id = _target.getAttribute(tAttr) || _target.parentNode.getAttribute(tAttr);
    let ele;
    if (id) {
      if (_inMoving && !_isProcessed) {
        ele = element.querySelector(id);
        if (ele) {
          _updatePosition(ele);
        }
      }
      _updateLighter(_target, true);
    }
    _isProcessed = true;
    _inMoving = false;
    _target = null;
    instance.setState({
      clickFeedBack: false,
    });
  }

  new EventManager(qfList).addHandler({
    start: _start,
    move: _move,
    end: _end,
  });
}
