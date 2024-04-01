import DropdownItem from './dropdown-item';
import DropdownColor from '../dropdown-color';

/**
 * 填充颜色按钮。
 * @ignore
 * @class
 */
class FillColor extends DropdownItem {
  constructor(color) {
    super('bgcolor', undefined, color);
  }

  dropdown() {
    const { tag, value } = this;
    return new DropdownColor(tag, value);
  }
}

export default FillColor;
