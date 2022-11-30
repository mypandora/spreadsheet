import { cssPrefix } from '../../config';
import { Element, h } from '../element';

/**
 * 属性单元格右边窗格。
 * @ignore
 * @class
 * @extends Element
 */
class Pane extends Element {
  constructor(tag, title, ...children) {
    super('div', `${cssPrefix}-pane`);
    this.tag = tag;
    this.title = title;
    this.change = () => {};

    this.contentEl = h('div', `${cssPrefix}-pane-content`).hide();

    this.setContentChildren(...children);

    this.headerEl = h('div', `${cssPrefix}-pane-header`);
    this.headerEl
      .on('click', () => {
        this.change({ tag: this.tag });
        if (this.contentEl.css('display', undefined) !== 'block') {
          this.show();
        }
      })
      .child(this.title);
    this.children(this.headerEl, this.contentEl);
  }

  setContentChildren(...children) {
    this.contentEl.html('');
    if (children.length > 0) {
      this.contentEl.children(...children);
    }
  }

  show() {
    const { contentEl } = this;
    contentEl.show();
    this.parent().active();
  }

  hide() {
    this.parent().active(false);
    this.contentEl.hide();
  }
}

export default Pane;
