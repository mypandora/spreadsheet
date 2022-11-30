import { cssPrefix } from '../config';
import { BASE_FORMATS } from '../core/format';
import Dropdown from './dropdown';
import { h } from './element';

export default class DropdownFormat extends Dropdown {
  constructor() {
    let formats = BASE_FORMATS.slice(0);
    formats.splice(2, 0, { key: 'divider' });
    formats.splice(8, 0, { key: 'divider' });
    formats = formats.map((format) => {
      const item = h('div', `${cssPrefix}-item`);
      if (format.key === 'divider') {
        item.addClass('divider');
      } else {
        item.child(format.title()).on('click', () => {
          this.setTitle(format.title());
          this.change(format);
        });
        if (format.label) {
          item.child(h('div', 'label').html(format.label));
        }
      }
      return item;
    });
    super('Normal', '220px', true, 'bottom-left', ...formats);
  }

  setTitle(key) {
    for (let i = 0; i < BASE_FORMATS.length; i += 1) {
      if (BASE_FORMATS[i].key === key) {
        this.title.html(BASE_FORMATS[i].title());
      }
    }
    this.hide();
  }
}
