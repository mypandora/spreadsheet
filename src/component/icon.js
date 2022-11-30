import { cssPrefix } from '../config';
import { Element, h } from "./element";

/**
 * 图标元素类。<br>
 * 在自定义 element 的基础上添加图标元素。
 * @ignore
 * @class
 */
class Icon extends Element {
  constructor(name) {
    super('div', `${cssPrefix}-icon`);
    this.iconNameEl = h('div', `${cssPrefix}-icon-img ${name}`);
    this.child(this.iconNameEl);
  }

  /**
   * 设置图标 class 名称
   * @param name
   */
  setName(name) {
    this.iconNameEl.className(`${cssPrefix}-icon-img ${name}`);
  }
}

export default Icon;
