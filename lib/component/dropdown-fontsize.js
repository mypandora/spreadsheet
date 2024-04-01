import { cssPrefix } from '../config';
import { FONT_SIZES } from '../core/font';
import Dropdown from './dropdown';
import { h } from './element';

export default class DropdownFontsize extends Dropdown {
  constructor() {
    const fontSizes = FONT_SIZES.map((fontSize) =>
      h('div', `${cssPrefix}-item`)
        .on('click', () => {
          this.setTitle(`${fontSize.pt}`);
          this.change(fontSize);
        })
        .child(`${fontSize.pt}`)
    );
    super('10', '60px', true, 'bottom-left', ...fontSizes);
  }
}
