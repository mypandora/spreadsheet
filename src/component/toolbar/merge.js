import ToggleItem from './toggle-item';

/**
 * 合并单元格按钮。
 * @ignore
 * @class
 */
class Merge extends ToggleItem {
  constructor() {
    super('merge', undefined, undefined);
  }

  setState(active, disabled) {
    this.el.active(active).disabled(disabled);
  }
}

export default Merge;
