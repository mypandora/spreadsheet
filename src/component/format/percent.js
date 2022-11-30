import PaneItem from './pane-item';
import PanePercent from './pane-percent';

/**
 * 格式化单元格：类型：百分比
 * @ignore
 * @class
 */
class PercentCategory extends PaneItem {
  constructor() {
    super('percent');
  }

  pane() {
    const { tag, title } = this;
    return new PanePercent(tag, title);
  }
}

export default PercentCategory;
