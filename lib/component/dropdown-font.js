import { cssPrefix } from '../config';
import { BASE_FONTS } from '../core/font';
import Dropdown from './dropdown';
import { h } from './element';

export default class DropdownFont extends Dropdown {
  constructor() {
    const fonts = BASE_FONTS.map((font) =>
      h('div', `${cssPrefix}-item`)
        .on('click', () => {
          this.setTitle(font.title);
          this.change(font);
        })
        .child(font.title)
    );
    super(BASE_FONTS[0].title, '160px', true, 'bottom-left', ...fonts);
  }
}
