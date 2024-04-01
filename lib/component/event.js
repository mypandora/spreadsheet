export function bind(target, name, fn, capture) {
  target.addEventListener(name, fn, !!capture);
}

export function unbind(target, name, fn, capture) {
  target.removeEventListener(name, fn, !!capture);
}

/**
 * 实现对 div 的监听渲染表格。
 * @ignore
 * @param {*} selectors 当前实例的类选择器，在这里固定为 .mypandora-spreadsheet 了
 * @param {*} fn div 变化时，要执行的回调函数
 */
export function bindResize(selectors, fn) {
  const target = document.querySelector(selectors);
  const resizeObserver = new ResizeObserver(() => {
    fn();
  });
  if (target) {
    resizeObserver.observe(target);
  }
}

export function unbindClickoutside(el) {
  if (el.xclickoutside) {
    unbind(window.document.body, 'click', el.xclickoutside);
    delete el.xclickoutside;
  }
}

// the left mouse button: mousedown -> mouseup -> click
// the right mouse button: mousedown -> contextmenu -> mouseup
// the right mouse button in firefox(>65.0): mousedown -> contextmenu -> mouseup -> click on window
export function bindClickoutside(el, cb) {
  // eslint-disable-next-line no-param-reassign
  el.xclickoutside = (evt) => {
    // ignore double click
    if (evt.detail === 2 || el.contains(evt.target)) {
      return;
    }
    if (cb) {
      cb(el);
    } else {
      el.hide();
      unbindClickoutside(el);
    }
  };
  bind(window.document.body, 'click', el.xclickoutside);
}

// 鼠标按下移动方法
export function mouseMoveUp(target, moveFunc, upfunc) {
  bind(target, 'mousemove', moveFunc);
  target.xEvtUp = (evt) => {
    unbind(target, 'mousemove', moveFunc);
    unbind(target, 'mouseup', target.xEvtUp);
    upfunc(evt);
  };
  bind(target, 'mouseup', target.xEvtUp);
}

function calTouchDirection(spanx, spany, evt, cb) {
  let direction = '';
  if (Math.abs(spanx) > Math.abs(spany)) {
    // horizontal
    direction = spanx > 0 ? 'right' : 'left';
    cb(direction, spanx, evt);
  } else {
    // vertical
    direction = spany > 0 ? 'down' : 'up';
    cb(direction, spany, evt);
  }
}
// cb = (direction, distance) => {}
export function bindTouch(target, { move, end }) {
  let startx = 0;
  let starty = 0;
  bind(target, 'touchstart', (evt) => {
    const { pageX, pageY } = evt.touches[0];
    startx = pageX;
    starty = pageY;
  });
  bind(target, 'touchmove', (evt) => {
    if (!move) {
      return;
    }
    const { pageX, pageY } = evt.changedTouches[0];
    const spanx = pageX - startx;
    const spany = pageY - starty;
    if (Math.abs(spanx) > 10 || Math.abs(spany) > 10) {
      calTouchDirection(spanx, spany, evt, move);
      startx = pageX;
      starty = pageY;
    }
    evt.preventDefault();
  });
  bind(target, 'touchend', (evt) => {
    if (!end) {
      return;
    }
    const { pageX, pageY } = evt.changedTouches[0];
    const spanx = pageX - startx;
    const spany = pageY - starty;
    calTouchDirection(spanx, spany, evt, end);
  });
}

export function createEventEmitter() {
  const listeners = new Map();

  function on(eventName, callback) {
    const push = () => {
      const currentListener = listeners.get(eventName);
      return (Array.isArray(currentListener) && currentListener.push(callback)) || false;
    };

    const create = () => listeners.set(eventName, [].concat(callback));

    return (listeners.has(eventName) && push()) || create();
  }

  function fire(eventName, args) {
    const exec = () => {
      const currentListener = listeners.get(eventName);
      currentListener.forEach((callback) => {
        callback.call(null, ...args);
      });
    };

    return listeners.has(eventName) && exec();
  }

  function removeListener(eventName, callback) {
    const remove = () => {
      const currentListener = listeners.get(eventName);
      const idx = currentListener.indexOf(callback);
      return (
        idx >= 0 &&
        currentListener.splice(idx, 1) &&
        listeners.get(eventName).length === 0 &&
        listeners.delete(eventName)
      );
    };

    return listeners.has(eventName) && remove();
  }

  function once(eventName, callback) {
    const execCallback = (...args) => {
      callback.call(null, ...args);
      removeListener(eventName, execCallback);
    };

    return on(eventName, execCallback);
  }

  function removeAllListeners() {
    listeners.clear();
  }

  return {
    get current() {
      return listeners;
    },
    on,
    once,
    fire,
    removeListener,
    removeAllListeners,
  };
}
