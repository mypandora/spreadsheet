import { cssPrefix } from '../../config';
import tooltip from '../tooltip';
import { h } from '../element';
import { t } from '../../locale';

/**
 * 工具栏 toolbar 基类，封装通用属性与方法，方便各子类继承实现。<br>
 * 所有工具栏按钮类型的父类，其含有三个主要的子类：<br>
 * dropdown-item<br>
 * icon-item<br>
 * toggle-item<br>
 * 其余所有按钮继承自这三个子类<br>
 * @ignore
 * @class
 */
class Item {
  /**
   *
   * @param {string} tag 标签名称，原始的英文名，一般在整个系统中最为识别名使用
   * @param {string} shortcut 快捷键，快捷键对应的字符串类型 eg."Ctrl+B"
   * @param {*} value 值，些按钮元素存储了当前的值，一般会在初始化时设定一个系统默认的初始值，在data_proxy中可以看到
   */
  constructor(tag, shortcut, value) {
    this.tip = '';
    if (tag) {
      // font-size ===> fontSize
      this.tip = t(`toolbar.${tag.replace(/-[a-z]/g, (c) => c[1].toUpperCase())}`);
    }
    if (shortcut) {
      this.tip += ` (${shortcut})`;
    }
    this.tag = tag;
    this.shortcut = shortcut;
    this.value = value;
    this.el = this.element(); // 注意 this 对象
    this.change = () => {};
  }

  /**
   * 生成 document 元素，并绑定事件，实现 tooltip 功能。
   * @returns {string|Element}
   */
  element() {
    const { tip } = this;
    return h('div', `${cssPrefix}-toolbar-btn`)
      .on('mouseenter', (evt) => {
        if (this.tip) {
          tooltip(this.tip, evt.target);
        }
      })
      .attr('data-tooltip', tip);
  }

  /**
   * 定义按钮状态：disabled|enabled, active, selected...由各子类具体实现。
   */
  setState() {}

  /**
   * 设置工具栏按钮是否为禁用。当只读模式、禁用选项时，禁用该按钮。
   * 按钮类型有三种：icon-item, dropdown-item, toggle-item；而这三种类型按钮的 setState 实现的作用而不相同。😂
   * 为了统一禁用按钮，只好新添加一个方法。
   */
  setDisabled(disabled) {
    this.el.disabled(disabled);
  }
}

export default Item;
