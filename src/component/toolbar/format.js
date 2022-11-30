import DropdownItem from './dropdown-item';
import DropdownFormat from '../dropdown-format';

/**
 * 数据格式按钮。
 * @ignore
 * @class
 */
class Format extends DropdownItem {
  constructor() {
    super('format', undefined, undefined);
  }

  getValue(it) {
    return it.key;
  }

  /**
   * 覆盖父类方法，注入具体的下拉菜单实现类。
   * @returns {DropdownFormat}
   */
  dropdown() {
    return new DropdownFormat();
  }
}

export default Format;
