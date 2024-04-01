import DropdownItem from './dropdown-item';
import DropdownFormula from '../dropdown-formula';

/**
 * 函数按钮。
 * @ignore
 * @class
 */
class Formula extends DropdownItem {
  constructor() {
    super('formula', undefined, undefined);
  }

  getValue(it) {
    return it.key;
  }

  dropdown() {
    return new DropdownFormula();
  }
}

export default Formula;
