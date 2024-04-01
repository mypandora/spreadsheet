import DOMPurify from 'dompurify';

/**
 * 自定义 Element, 为其添加一些快捷方法。
 * @ignore
 * @class
 */
class Element {
  constructor(tag, className = '') {
    if (typeof tag === 'string') {
      this.el = document.createElement(tag);
      this.el.className = className;
    } else {
      this.el = tag;
    }
    this.data = {};
  }

  /**
   * 设置 data 对象的值
   * @param {string} key
   * @param {Object} value
   * @returns {Element|*}
   */
  data(key, value) {
    if (value !== undefined) {
      this.data[key] = value;
      return this;
    }
    return this.data[key];
  }

  /**
   * 绑定事件
   * @param {string} eventNames 事件名称
   * @param {function} handler 事件方法
   * @returns {Element}
   */
  on(eventNames, handler) {
    // 类似于 Vue 的事修饰符的事件，例如： click.stop
    const [fen, ...modifiers] = eventNames.split('.');
    let eventName = fen;
    if (eventName === 'mousewheel' && /Firefox/i.test(window.navigator.userAgent)) {
      eventName = 'DOMMouseScroll';
    }
    // 在这里为回调函数命名，方便后面对其进行移除。
    const listener = (evt) => {
      handler(evt);
      for (let i = 0; i < modifiers.length; i += 1) {
        const k = modifiers[i];
        if (k === 'left' && evt.button !== 0) {
          return;
        }
        if (k === 'right' && evt.button !== 2) {
          return;
        }
        if (k === 'stop') {
          evt.stopPropagation();
        }
      }
    };
    this.listenerMap = new Map([[eventName, listener]]);
    this.el.addEventListener(eventName, listener);
    return this;
  }

  /**
   * 解绑事件。
   * @param {string} eventName
   * @returns {Element}
   */
  off(eventName) {
    let evtName = eventName;
    if (evtName === 'mousewheel' && /Firefox/i.test(window.navigator.userAgent)) {
      evtName = 'DOMMouseScroll';
    }
    const listener = this.listenerMap.get(evtName);
    this.el.removeEventListener(evtName, listener);
    return this;
  }

  /**
   * 设置偏移
   * @param value
   * @returns {Element|{top: (*|number), left: (*|number), width: (*|number), height: (*|number)}}
   */
  offset(value) {
    if (value !== undefined) {
      Object.keys(value).forEach((k) => {
        this.css(k, `${value[k]}px`);
      });
      return this;
    }
    const { offsetTop, offsetLeft, offsetHeight, offsetWidth } = this.el;
    return {
      top: offsetTop,
      left: offsetLeft,
      height: offsetHeight,
      width: offsetWidth,
    };
  }

  /**
   * 设置滚动
   * @param v
   * @returns {{top: number, left: number}}
   */
  scroll(v) {
    const { el } = this;
    if (v !== undefined) {
      if (v.left !== undefined) {
        el.scrollLeft = v.left;
      }
      if (v.top !== undefined) {
        el.scrollTop = v.top;
      }
    }
    return { left: el.scrollLeft, top: el.scrollTop };
  }

  /**
   * 获取元素相对视口信息
   * @returns {DOMRect}
   */
  box() {
    return this.el.getBoundingClientRect();
  }

  /**
   * 返回一个当前节点 Node的父节点 。如果没有这样的节点，比如说像这个节点是树结构的顶端或者没有插入一棵树中， 这个属性返回null。
   * @returns {Element}
   */
  parent() {
    return new Element(this.el.parentNode);
  }

  /**
   * 添加多个子节点
   * @param eles
   * @returns {Element|NodeListOf<ChildNode>}
   */
  children(...eles) {
    if (arguments.length === 0) {
      return this.el.childNodes;
    }
    eles.forEach((ele) => this.child(ele));
    return this;
  }

  /**
   * 移除子节点
   * @param el
   */
  removeChild(el) {
    this.el.removeChild(el);
  }

  /**
   * 添加单个子节点
   * @param arg
   * @returns {Element}
   */
  child(arg) {
    let ele = arg;
    if (typeof arg === 'string') {
      ele = document.createTextNode(arg);
    } else if (arg instanceof Element) {
      ele = arg.el;
    }
    this.el.appendChild(ele);
    return this;
  }

  /**
   * 用于检测当前DOM对象返回的节点中的子节点是否包含指定节点，返回值为布尔类型
   * @param ele
   * @returns {boolean}
   */
  contains(ele) {
    return this.el.contains(ele);
  }

  /**
   * 获取/设置类名
   * @param v
   * @returns {string|Element}
   */
  className(v) {
    if (v !== undefined) {
      this.el.className = v;
      return this;
    }
    return this.el.className;
  }

  /**
   * 给 element 元素添加指定的class
   * @param name
   * @returns {Element}
   */
  addClass(name) {
    this.el.classList.add(name);
    return this;
  }

  /**
   * 检查类名，返回布尔值
   * @param name
   * @returns {boolean}
   */
  hasClass(name) {
    return this.el.classList.contains(name);
  }

  /**
   * 给 element 元素移除指定的class
   * @param name
   * @returns {Element}
   */
  removeClass(name) {
    this.el.classList.remove(name);
    return this;
  }

  /**
   * 切换类名
   * @param cls
   * @returns {boolean}
   */
  toggle(cls = 'active') {
    return this.toggleClass(cls);
  }

  /**
   * 切换类名
   * @param name
   * @returns {boolean}
   */
  toggleClass(name) {
    return this.el.classList.toggle(name);
  }

  /**
   * 设置激活类名
   * @param flag
   * @param cls
   * @returns {Element}
   */
  active(flag = true, cls = 'active') {
    if (flag) {
      this.addClass(cls);
    } else {
      this.removeClass(cls);
    }
    return this;
  }

  /**
   * 设置选中/激活
   * @param flag
   * @returns {Element}
   */
  checked(flag = true) {
    this.active(flag, 'checked');
    return this;
  }

  /**
   * 设置不可编辑
   * @param flag
   * @returns {Element}
   */
  disabled(flag = true) {
    if (flag) {
      this.addClass('disabled');
    } else {
      this.removeClass('disabled');
    }
    return this;
  }

  // key, value
  // key
  // {k, v}
  /**
   * 设置属性
   * @param key
   * @param value
   * @returns {string|Element}
   */
  attr(key, value = undefined) {
    if (value !== undefined) {
      this.el.setAttribute(key, value);
    } else {
      if (typeof key === 'string') {
        return this.el.getAttribute(key);
      }
      Object.keys(key).forEach((k) => {
        this.el.setAttribute(k, key[k]);
      });
    }
    return this;
  }

  /**
   * 移出属性
   * @param key
   * @returns {Element}
   */
  removeAttr(key) {
    this.el.removeAttribute(key);
    return this;
  }

  /**
   * 设置/获取 html 值
   * @param content
   * @returns {string|Element}
   */
  html(content) {
    if (content !== undefined) {
      // xss 过滤
      this.el.innerHTML = DOMPurify.sanitize(content);
      return this;
    }
    return this.el.innerHTML;
  }

  /**
   * 设置value
   * @param v
   * @returns {Element|*}
   */
  val(v) {
    if (v !== undefined) {
      this.el.value = v;
      return this;
    }
    return this.el.value;
  }

  /**
   * 获取焦点
   */
  focus() {
    this.el.focus();
  }

  /**
   * 移出 css
   * @param keys
   * @returns {Element}
   */
  cssRemoveKeys(...keys) {
    keys.forEach((k) => this.el.style.removeProperty(k));
    return this;
  }

  // css(properties)
  // css(properName, value)
  // css(propertyName)
  /**
   * 设置样式 css
   * @param name
   * @param value
   * @returns {Element|*}
   */
  css(name, value) {
    if (value === undefined && typeof name !== 'string') {
      Object.keys(name).forEach((k) => {
        this.el.style[k] = name[k];
      });
      return this;
    }
    if (value !== undefined) {
      this.el.style[name] = value;
      return this;
    }
    return this.el.style[name];
  }

  /**
   * 获得计算后的样式
   * 返回在应用活动样式表并解析这些值可能包含的任何基本计算后报告元素的所有CSS属性的值
   * @returns {CSSStyleDeclaration}
   */
  computedStyle() {
    return window.getComputedStyle(this.el, null);
  }

  /**
   * 显示 element 元素
   */
  show() {
    this.css('display', 'block');
    return this;
  }

  /**
   * 隐藏当前元素
   * @returns {Element}
   */
  hide() {
    this.css('display', 'none');
    return this;
  }
}

const h = (tag, className = '') => new Element(tag, className);

export { Element, h };
