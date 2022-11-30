import DropdownItem from './dropdown-item';
import DropdownBorder from '../dropdown-border';

/**
 * 边框按钮。
 * @ignore
 * @class
 */
class Border extends DropdownItem {
  constructor() {
    super('border', undefined, undefined);
  }

  dropdown() {
    return new DropdownBorder();
  }
}

export default Border;
