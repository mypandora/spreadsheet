import { cssPrefix } from '../../config';
import { tf } from '../../locale';
import { h } from '../element';
import { bindClickoutside, unbindClickoutside } from '../event';

const menuItems = [{ key: 'delete', title: tf('contextmenu.deleteSheet') }];

function buildMenuItem(item) {
  return h('div', `${cssPrefix}-item`)
    .child(item.title())
    .on('click', () => {
      this.itemClick(item.key);
      this.hide();
    });
}

function buildMenu() {
  return menuItems.map((it) => buildMenuItem.call(this, it));
}

/**
 * 底部状态栏 bottomBar 的右键菜单
 * @ignore
 * @class
 */
class Contextmenu {
  constructor() {
    this.el = h('div', `${cssPrefix}-contextmenu`)
      .css('width', '160px')
      .children(...buildMenu.call(this))
      .hide();
    this.itemClick = () => {};
  }

  hide() {
    const { el } = this;
    el.hide();
    unbindClickoutside(el);
  }

  setOffset(offset) {
    const { el } = this;
    el.offset(offset);
    el.show();
    bindClickoutside(el);
  }
}

export default Contextmenu;
