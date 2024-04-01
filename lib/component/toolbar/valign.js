import DropdownItem from './dropdown-item';
import DropdownAlign from '../dropdown-align';

/**
 * 水平对齐按钮。
 * @ignore
 * @class
 */
class Valign extends DropdownItem {
  constructor(value) {
    super('valign', undefined, value);
  }

  dropdown() {
    const { value } = this;
    return new DropdownAlign(['top', 'middle', 'bottom'], value);
  }
}

export default Valign;
