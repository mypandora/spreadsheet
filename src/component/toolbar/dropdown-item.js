import Item from './item';

/**
 * 带图标按钮类，方便 toolbar 按钮实现下拉菜单操作。
 * @ignore
 * @class
 * @extends Item
 */
class DropdownItem extends Item {
  /**
   * 定义父下拉菜单方法，由具体子类实现。
   */
  dropdown() {}

  /**
   * 获取下拉菜单的值
   * @param v
   * @returns {*}
   */
  getValue(v) {
    return v;
  }

  /**
   * 在父类的基础上添加下拉菜单功能。
   * @returns {string|Element}
   */
  element() {
    const { tag } = this;
    this.dd = this.dropdown(); // dd为各种类型的dropdown元素，dropdown()为调用各个dropdown组件中的dropdown()方法
    this.dd.change = (it) => this.change(tag, this.getValue(it));

    return super.element().child(this.dd); // super.element()为包含下拉菜单的父元素
  }

  /**
   * 设置下拉菜单 title
   * @param v
   */
  setState(v) {
    if (v) {
      this.value = v;
      this.dd.setTitle(v);
    }
  }
}

export default DropdownItem;
