import { cssPrefix } from '../config';
import { h } from './element';
import Icon from './icon';
import { bind, unbind } from './event';

export default class Modal {
  constructor(title, content, width = '600px') {
    this.title = title;
    this.el = h('div', `${cssPrefix}-modal`)
      .css('width', width)
      .children(
        h('div', `${cssPrefix}-modal-header`).children(
          new Icon('close').on('click.stop', () => this.hide()),
          this.title
        ),
        h('div', `${cssPrefix}-modal-content`).children(...content)
      )
      .hide();
  }

  show() {
    // dimmer
    this.dimmer = h('div', `${cssPrefix}-dimmer active`);
    document.body.appendChild(this.dimmer.el);
    const { width, height } = this.el.show().box();
    const { clientHeight, clientWidth } = document.documentElement;
    this.el.offset({
      left: (clientWidth - width) / 2,
      top: (clientHeight - height) / 3,
    });
    window.xkeydownEsc = (evt) => {
      // 在这里没有使用不再推荐的keyCode，考虑到特殊键盘布局也没有使用code。
      if (evt.key === 'Escape') {
        this.hide();
      }
    };
    bind(window, 'keydown', window.xkeydownEsc);
  }

  hide() {
    this.el.hide();
    document.body.removeChild(this.dimmer.el);
    unbind(window, 'keydown', window.xkeydownEsc);
    delete window.xkeydownEsc;
  }
}
