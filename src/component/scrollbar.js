/*
 * @Author: liushengyan
 * @Date: 2022-08-01 09:46:09
 * @LastEditTime: 2022-10-24 11:38:38
 * @LastEditors: liushengyan
 * @Descripttion:
 */
import { cssPrefix } from '../config';
import { h } from './element';

/**
 * 滚动条。<br>
 * 实现逻辑为外层div为与表格可视区域等高，内层div为计算出的表格实际高度。
 * @ignore
 * @class
 */
class Scrollbar {
  /**
   *
   * @param vertical 是否为垂直滚动条
   */
  constructor(vertical) {
    this.vertical = vertical;
    this.moveFn = null;
    this.el = h('div', `${cssPrefix}-scrollbar ${vertical ? 'vertical' : 'horizontal'}`)
      .child((this.contentEl = h('div', '')))
      .on('mousemove.stop', () => {})
      .on('scroll.stop', (evt) => {
        const { scrollTop, scrollLeft } = evt.target;
        if (this.moveFn) {
          this.moveFn(this.vertical ? scrollTop : scrollLeft, evt);
        }
      });
  }

  move(v) {
    this.el.scroll(v);
    return this;
  }

  scroll() {
    return this.el.scroll();
  }

  /**
   * 设置滚动条
   * @param distance
   * @param contentDistance 宽度或高度
   * @returns {Scrollbar}
   */
  set(distance, contentDistance) {
    const d = distance - 1;
    if (contentDistance > d) {
      const cssKey = this.vertical ? 'height' : 'width';
      this.el.css(cssKey, `${d - 15}px`).show();
      this.contentEl.css(this.vertical ? 'width' : 'height', '1px').css(cssKey, `${contentDistance}px`);
    } else {
      this.el.hide();
    }
    return this;
  }
}

export default Scrollbar;
