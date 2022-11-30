import { cssPrefix } from '../../config';
import { t } from '../../locale';
import { h } from '../element';
import GeneralProperty from './general';

/**
 * 单元格属性。
 * @ignore
 * @class
 */
class Property {
  constructor() {
    this.cell = null;
    this.change = () => {};
    this.items = [
      h('li', `${cssPrefix}-property-item ${cssPrefix}-property-title`).child(t(`format.category`)),
      (this.generalProperty = new GeneralProperty()),
    ];

    this.el = h('div', `${cssPrefix}-property`);
    this.tabs = h('ul', `${cssPrefix}-property-items`);

    this.items.forEach((it) => {
      this.tabs.child(it.el);
      it.change = (tag, args) => {
        this.resetOther({ tag, ...args });
        this.change(tag, args);
      };
    });
    this.el.child(this.tabs);
  }

  /**
   * 当选择“设置单元格格式”时，根据其单元格内容判断显示内容。
   * 如果是空单元格则显示默认。
   * @param cell
   */
  resetCell(cell) {
    this.reset();
    if (cell) {
      this.generalProperty.setState(cell);
    }
  }

  reset() {
    this.generalProperty.setState();
  }

  resetOther(data) {
    const { tag, ...rest } = data;
    const set = new Set(['general']);
    set.delete(tag);
    set.forEach((item) => {
      this[`${item}Property`]?.setState();
    });
    this[`${tag}Property`].setState({ ...this.cell, ...rest });
  }
}

export default Property;
