import DropdownItem from './dropdown-item';
import DropdownFontsize from '../dropdown-fontsize';

/**
 * 字号按钮。
 * @ignore
 * @class
 */
class FontSize extends DropdownItem {
  constructor() {
    super('font-size', undefined, undefined);
  }

  getValue(it) {
    return it.pt;
  }

  dropdown() {
    return new DropdownFontsize();
  }
}

export default FontSize;
