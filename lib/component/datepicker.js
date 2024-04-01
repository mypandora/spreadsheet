import { cssPrefix } from '../config';
import Calendar from './calendar';
import { h } from './element';

/**
 * 日期选择器，它这里定义的组件因为是作为spreadsheet的一部分，所以与常规的组件不同，比如常规组件初始化时需要指定一个dom元素，而这里的组件却不需要。
 */
export default class Datepicker {
  constructor() {
    this.calendar = new Calendar(new Date());
    this.el = h('div', `${cssPrefix}-datepicker`).child(this.calendar.el).hide();
  }

  setValue(date) {
    const { calendar } = this;
    if (typeof date === 'string') {
      if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(date)) {
        calendar.setValue(new Date(date.replace(/-/g, '/')));
      }
    } else if (date instanceof Date) {
      calendar.setValue(date);
    }
    return this;
  }

  change(cb) {
    this.calendar.selectChange = (d) => {
      cb(d);
      this.hide();
    };
  }

  show() {
    this.el.show();
  }

  hide() {
    this.el.hide();
  }
}
