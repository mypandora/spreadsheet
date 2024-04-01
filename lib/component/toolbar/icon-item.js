import Item from './item';
import Icon from '../icon';

/**
 * 带图标按钮类，方便 toolbar 非下拉框按钮实现图标。
 * @ignore
 * @class
 * @extends Item
 */
class IconItem extends Item {
  /**
   * 在父类的基础上添加图标功能。
   * @returns {string|Element}
   */
  element() {
    const { tag } = this;
    return super
      .element()
      .child(new Icon(tag))
      .on('click', () => this.change(tag));
  }

  /**
   * 实现父类方法，默认各按钮为 disabled 状态。
   * 即添加 disabled 类。
   * @param disabled
   */
  setState(disabled) {
    this.el.disabled(disabled);
  }
}

export default IconItem;
