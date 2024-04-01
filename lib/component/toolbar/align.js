import DropdownItem from './dropdown-item';
import DropdownAlign from '../dropdown-align';

/**
 * 水平对齐按钮。
 * @ignore
 * @class
 */
class Align extends DropdownItem {
  constructor(value) {
    super('align', undefined, value);
  }

  dropdown() {
    const { value } = this;
    return new DropdownAlign(['left', 'center', 'right'], value);
  }
}

export default Align;
