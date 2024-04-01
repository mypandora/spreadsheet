import Icon from './icon';
import BorderPalette from './border-palette';
import Dropdown from './dropdown';

export default class DropdownBorder extends Dropdown {
  constructor() {
    const icon = new Icon('border-all');
    const borderPalette = new BorderPalette();
    borderPalette.change = (v) => {
      this.change(v);
      this.hide();
    };
    super(icon, 'auto', false, 'bottom-left', borderPalette.el);
  }
}
