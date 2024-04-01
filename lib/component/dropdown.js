import { cssPrefix } from '../config';
import { Element, h } from './element';
import { bindClickoutside, unbindClickoutside } from './event';

/**
 * 下拉菜单类。
 * @ignore
 * @extends Element
 */
class Dropdown extends Element {
  constructor(title, width, showArrow, placement, ...children) {
    super('div', `${cssPrefix}-dropdown ${placement}`);
    this.title = title;
    this.change = () => {};
    this.headerClick = () => {};
    if (typeof title === 'string') {
      this.title = h('div', `${cssPrefix}-dropdown-title`).child(title);
    } else if (showArrow) {
      this.title.addClass('arrow-left');
    }
    this.contentEl = h('div', `${cssPrefix}-dropdown-content`);
    this.setContentStyle(width);
    this.setContentChildren(...children);

    this.headerEl = h('div', `${cssPrefix}-dropdown-header`);
    this.headerEl
      .on('click', () => {
        if (this.contentEl.css('display') !== 'block') {
          this.show();
        } else {
          this.hide();
        }
      })
      .children(
        this.title,
        showArrow ? h('div', `${cssPrefix}-icon arrow-right`).child(h('div', `${cssPrefix}-icon-img arrow-down`)) : ''
      );
    this.children(this.headerEl, this.contentEl);
  }

  /**
   * 设置下拉菜单超出样式
   */
  setContentStyle(width) {
    let maxHeghit = 550;
    const cHeight = document.documentElement.clientHeight;
    if (cHeight < maxHeghit) {
      maxHeghit = cHeight;
    }

    this.contentEl.css('max-height', `${maxHeghit}px`).css('width', width).hide();
  }

  /**
   * 设置下拉菜单内容项
   * @param children
   */
  setContentChildren(...children) {
    this.contentEl.html('');
    if (children.length > 0) {
      this.contentEl.children(...children);
    }
  }

  setTitle(title) {
    this.title.html(title);
    this.hide();
  }

  /**
   * 覆盖父类自定义 Element 的 show 方法
   */
  show() {
    const { contentEl } = this;
    contentEl.show();
    this.parent().active();
    bindClickoutside(this.parent(), () => {
      this.hide();
    });
  }

  /**
   * 覆盖父类自定义 Element 的 hide 方法
   */
  hide() {
    this.parent().active(false);
    this.contentEl.hide();
    unbindClickoutside(this.parent());
  }
}

export default Dropdown;
