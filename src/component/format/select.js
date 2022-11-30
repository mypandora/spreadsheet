import PaneItem from './pane-item';
import PaneSelect from './pane-select';

/**
 * 格式化单元格：类型：单选按钮
 * @ignore
 * @class
 */
class SelectCategory extends PaneItem {
  constructor() {
    super('select', '');
  }

  pane() {
    const { type, title, data } = this;
    return new PaneSelect(type, title, data);
  }

  show() {
    this.el.show();
  }
}

export default SelectCategory;
