import { cssPrefix } from '../../config';
import { h } from '../element';
import Icon from '../icon';
import FormInput from '../form-input';
import DropdownMore from './dropdown';
import Contextmenu from './contextmenu';

function buildOption(scale, value = 1) {
  const arr = [];
  for (let i = 0; i < scale.length; i += 1) {
    if (scale[i] === value) {
      arr.push(
        h('option', 'active')
          .attr('selected', true)
          .val(scale[i])
          .html(`${scale[i] * 100}%`)
      );
    } else {
      arr.push(
        h('option', '')
          .val(scale[i])
          .html(`${scale[i] * 100}%`)
      );
    }
  }
  return arr;
}

/**
 * 底部状态栏：新建、重命名、删除、切换、显示所有sheet工作表等功能。<br>
 * “+”组件：新建sheet工作表<br>
 * “...“组件：显示所有sheet工作表下拉菜单<br>
 * “sheet”组件：sheet工作表<br>
 */
class BottomBar {
  /**
   * @hideconstructor
   * @param addFunc
   * @param swapFunc
   * @param deleteFunc
   * @param updateFunc
   */
  constructor(addFunc = () => {}, swapFunc = () => {}, deleteFunc = () => {}, updateFunc = () => {}) {
    this.swapFunc = swapFunc;
    this.updateFunc = updateFunc;
    this.dataNames = []; // sheet 名称数组?
    this.activeEl = null; // 当前激活的 sheet
    this.deleteEl = null; // 准备删除的 sheet
    this.items = []; // sheet 数组?
    this.scale = 1; // 缩放比例
    // 更多下拉菜单
    this.moreEl = new DropdownMore((i) => {
      this.clickSwap2(this.items[i]);
    });
    // 右键菜单
    this.contextmenu = new Contextmenu();
    this.contextmenu.itemClick = deleteFunc;
    // 缩放比例下拉菜单
    this.optionEl = buildOption([0.5, 0.75, 1, 1.2, 1.5, 2, 3, 4], this.scale);
    // 将 新建按钮、更多下拉菜单、右键菜单添加到底部状态栏上
    this.el = h('div', `${cssPrefix}-bottombar`).children(
      this.contextmenu.el,
      (this.menuEl = h('ul', `${cssPrefix}-menu`).child(
        h('li', '').children(
          new Icon('add').on('click', () => {
            addFunc();
          }),
          h('span', '').child(this.moreEl)
        )
      )),
      (this.scaleEl = h('div', `${cssPrefix}-scale`)
        .child(
          (this.selectEl = h('select', '')
            .attr({ name: 'scale', 'aria-label': 'scale' })
            .on('change', (evt) => {
              const { value } = evt.target;
              this.change(+value);
            })
            .children(...this.optionEl))
        )
        .hide())
    );
    this.change = () => {};
  }

  /**
   * 新建sheet工作表。
   * @param {string} name  sheet工作表的名称
   * @param {boolean} active  sheet工作表是否激活
   * @param {Object} options  参数
   */
  addItem(name, active, options) {
    this.dataNames.push(name);
    const item = h('li', active ? 'active' : '').child(name);
    item
      .on('click', () => {
        this.clickSwap2(item);
      })
      .on('contextmenu', (evt) => {
        if (options.mode !== 'edit') {
          return;
        }
        const { offsetLeft, offsetHeight } = evt.target;
        this.contextmenu.setOffset({
          left: offsetLeft,
          bottom: offsetHeight + 1,
        });
        this.deleteEl = item;
      })
      .on('dblclick', () => {
        if (options.mode !== 'edit') {
          return;
        }
        const v = item.html();
        const input = new FormInput('auto', '');
        input.val(v);
        input.input.on('blur', ({ target }) => {
          const { value } = target;
          const newIndex = this.dataNames.findIndex((it) => it === v);
          this.renameItem(newIndex, value);
        });
        item.html('').child(input.el);
        input.focus();
      });
    if (active) {
      this.clickSwap(item);
    }
    this.items.push(item);
    this.menuEl.child(item);
    this.moreEl.reset(this.dataNames);
  }

  /**
   * 重命名sheet工作表。
   * @param {number} index 被重命名sheet工作表的索引
   * @param {string} value 被重命名sheet工作表的新名称
   */
  renameItem(index, value) {
    this.dataNames.splice(index, 1, value);
    this.moreEl.reset(this.dataNames);
    this.items[index].html('').child(value);
    this.updateFunc(index, value);
  }

  /**
   * 清空底部状态栏。
   * 比如当重新加载数据时，底部状态栏需要清空。
   */
  clear() {
    this.items.forEach((it) => {
      this.menuEl.removeChild(it.el);
    });
    this.items = [];
    this.dataNames = [];
    this.moreEl.reset(this.dataNames);
  }

  /**
   * 删除sheet工作表。
   * @returns {number[]}
   */
  deleteItem() {
    const { activeEl, deleteEl } = this;
    if (this.items.length > 1) {
      const index = this.items.findIndex((it) => it === deleteEl);
      this.items.splice(index, 1);
      this.dataNames.splice(index, 1);
      this.menuEl.removeChild(deleteEl.el);
      this.moreEl.reset(this.dataNames);
      if (activeEl === deleteEl) {
        const [f] = this.items;
        this.activeEl = f;
        this.activeEl.toggle();
        return [index, 0];
      }
      return [index, -1];
    }
    return [-1];
  }

  /**
   * 切换sheet工作表，通过更多下拉菜单进行切换。
   * @param item
   */
  clickSwap2(item) {
    const index = this.items.findIndex((it) => it === item);
    this.clickSwap(item);
    this.activeEl.toggle();
    this.swapFunc(index);
  }

  /**
   * 切换sheet工作表，通过点击sheet工作表标签直接进行切换。
   * @param item
   */
  clickSwap(item) {
    if (this.activeEl !== null) {
      this.activeEl.toggle();
    }
    this.activeEl = item;
  }

  /**
   * 重置缩放比例。
   * @param {*} scale
   */
  resetScale(scale) {
    this.scale = scale;
    this.optionEl = buildOption([0.5, 0.75, 1, 1.2, 1.5, 2, 3, 4], this.scale);
    this.selectEl.html('').children(...this.optionEl);
  }
}

export default BottomBar;
