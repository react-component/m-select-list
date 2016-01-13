export const isTouchable = 'ontouchstart' in window;
export const START = isTouchable ? 'touchstart' : 'mousedown';
export const MOVE = isTouchable ? 'touchmove' : 'mousemove';
export const END = isTouchable ? 'touchend' : 'mouseup';
export const CANCEL = isTouchable ? 'touchcancel' : 'mousecancel';
export const CLICK = isTouchable ? 'touchstart' : 'click';

function addEvent(el, type, callback) {
  type = type.split(' ');
  for ( var i = 0, len = type.length; i < len; i++ ) {
    el.addEventListener(type[i], callback, false);
  }
}

function removeEvent(el, type, callback) {
  type = type.split(' ');
  for ( var i = 0, len = type.length; i < len; i++ ) {
    el.removeEventListener(type[i], callback, false);
  }
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
    event.start && this._startEvents.push(event.start);
    event.move && this._moveEvents.push(event.move);
    event.end && this._endEvents.push(event.end);
  },
  startEvent: function() {
    var self = this;

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
          !callback._isEnded && callback.call(self, e);
          callback._isEnded = true;
        });

        self.endEvent(true);
      }, false);
    }
  },
  endEvent: function(keepStart) {
    if ( !keepStart && this._start ) {
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
  }
};
