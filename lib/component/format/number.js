import PaneItem from './pane-item';
import PaneNumber from './pane-number';

/**
 * 格式化单元格：类型：数值
 * @ignore
 * @class
 */
class NumberCategory extends PaneItem {
  constructor() {
    super('number');
  }

  pane() {
    const { tag, title } = this;
    return new PaneNumber(tag, title);
  }
}

export default NumberCategory;
