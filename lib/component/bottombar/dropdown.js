import { cssPrefix } from '../../config';
import Dropdown from '../dropdown';
import Icon from '../icon';
import { h } from '../element';

/**
 * 底部状态栏下拉菜单组件
 * @ignore
 * @extends Dropdown
 */
class DropdownMore extends Dropdown {
  constructor(click) {
    const icon = new Icon('ellipsis');
    super(icon, 'auto', false, 'top-left');
    this.contentClick = click;
  }

  /**
   * 重置下拉表单选项。
   * 当删除某个 sheet 标签时。
   * @param items
   */
  reset(items) {
    const eles = items.map((it, i) =>
      h('div', `${cssPrefix}-item`)
        .css('width', '150px')
        .css('font-weight', 'normal')
        .on('click', () => {
          this.contentClick(i);
          this.hide();
        })
        .child(it)
    );
    this.setContentChildren(...eles);
  }

  setTitle() {
    // pass
    return this;
  }
}

export default DropdownMore;
