import Item from './item';
import Icon from '../icon';

/**
 * 带图标按钮类，方便 toolbar 按钮实现图标功能及切换操作。
 * @ignore
 * @class
 * @extends Item
 */
class ToggleItem extends Item {
  /**
   * 在父类的基础上添加图标功能。
   * @returns {string|Element}
   */
  element() {
    const { tag } = this;
    return super
      .element()
      .child(new Icon(tag))
      .on('click', () => this.click());
  }

  /**
   * 按钮单击事件
   */
  click() {
    this.change(this.tag, this.toggle());
  }

  /**
   * 实现父类方法，默认各按钮为 active 状态。
   * 即添加 active 类。
   * @param active
   */
  setState(active) {
    this.el.active(active);
  }

  /**
   * 切换按钮的 active
   * @returns {boolean}
   */
  toggle() {
    return this.el.toggle();
  }

  /**
   * 判断当前按钮状态是否为 active
   * @returns {boolean}
   */
  active() {
    return this.el.hasClass('active');
  }
}

export default ToggleItem;
