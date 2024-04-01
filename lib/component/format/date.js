import PaneItem from './pane-item';
import PaneDate from './pane-date';

/**
 * 格式化单元格：类型：日期
 * @ignore
 * @class
 */
class DateCategory extends PaneItem {
  constructor() {
    super('date');
  }

  pane() {
    const { tag, title } = this;
    return new PaneDate(tag, title);
  }

  show() {
    this.el.show();
  }
}

export default DateCategory;
