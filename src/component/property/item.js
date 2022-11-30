import { t } from '../../locale';
import { h } from '../element';
import { cssPrefix } from '../../config';

/**
 * 该类的实现思路参考在 src/component/toolbar/item.js，以保持与原作者写作风格一致。
 * @ignore
 * @class
 */
class Item {
  constructor(tag) {
    this.title = '';
    if (tag) {
      this.title = t(`property.${tag.replace(/-[a-z]/g, (c) => c[1].toUpperCase())}`);
    }
    this.tag = tag;
    this.el = this.element();
    this.change = () => {};
  }

  element() {
    const { tag } = this;
    return h('li', `${cssPrefix}-property-item`).attr('data-type', tag);
  }

  setState() {}
}

export default Item;
