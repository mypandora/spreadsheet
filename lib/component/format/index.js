import { cssPrefix } from '../../config';
import { t } from '../../locale';
import { h } from '../element';
import GeneralCategory from './general';
import NumberCategory from './number';
import PercentCategory from './percent';
import DateCategory from './date';
import TextCategory from './text';

/**
 * 单元格格式化设置：数值分类设置。即设置单元格的类型为：文本、数字、单选框、复选框、日期等等。
 *
 * 在这里数据传递很费劲。
 * 作者的目标是轻量级。这就导致当你扩展时，如果代码与作者源码风格一致，则扩展麻烦。
 * 为了传递数据，借用了 change 事件，了解请跟踪源码。
 * @ignore
 * @class
 */
class Category {
  constructor() {
    this.cell = null;
    this.change = () => {};
    this.items = [
      h('li', `${cssPrefix}-format-item ${cssPrefix}-format-title`).child(t(`format.category`)),
      (this.generalCategory = new GeneralCategory()),
      (this.numberCategory = new NumberCategory()),
      (this.percentCategory = new PercentCategory()),
      (this.dateCategory = new DateCategory()),
      (this.textCategory = new TextCategory()),
      // (this.selectCategory = new SelectCategory()),
    ];

    this.el = h('div', `${cssPrefix}-format`);
    this.tabs = h('ul', `${cssPrefix}-format-items`);

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
      this.cell = cell;
      const { type = 'general' } = cell;
      this[`${type}Category`]?.setState(cell);
    } else {
      this.generalCategory.setState();
    }
  }

  reset() {
    this.generalCategory.setState();
    this.numberCategory.setState();
    this.percentCategory.setState();
    this.dateCategory.setState();
    this.textCategory.setState();
    // this.selectCategory.setState();
  }

  resetOther(data) {
    const { tag, ...rest } = data;
    const set = new Set(['general', 'number', 'percent', 'date', 'text', 'select']);
    set.delete(tag);
    set.forEach((item) => {
      this[`${item}Category`]?.setState();
    });
    this[`${tag}Category`].setState({ ...this.cell, ...rest });
  }
}

export default Category;
