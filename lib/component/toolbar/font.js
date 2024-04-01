import DropdownItem from './dropdown-item';
import DropdownFont from '../dropdown-font';

/**
 * 字体按钮。
 * @ignore
 * @class
 */
class Font extends DropdownItem {
  constructor() {
    super('font-name', undefined, undefined);
  }

  getValue(it) {
    return it.key;
  }

  dropdown() {
    return new DropdownFont();
  }
}

export default Font;
