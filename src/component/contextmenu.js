import { cssPrefix } from '../config';
import { tf } from '../locale';
import { h } from './element';
import { bindClickoutside, unbindClickoutside } from './event';
import FormInput from './form-input';

const menuItems = [
  { key: 'cell-slash', title: tf('contextmenu.cellSlash') },
  { key: 'cell-non-slash', title: tf('contextmenu.cellNonSlash') },
  { key: 'divider' },
  { key: 'copy', title: tf('contextmenu.copy'), label: 'Ctrl+C' },
  { key: 'cut', title: tf('contextmenu.cut'), label: 'Ctrl+X' },
  { key: 'paste', title: tf('contextmenu.paste'), label: 'Ctrl+V' },
  { key: 'paste-value', title: tf('contextmenu.pasteValue'), label: 'Ctrl+Shift+V' },
  { key: 'paste-format', title: tf('contextmenu.pasteFormat'), label: 'Ctrl+Alt+V' },
  { key: 'divider' },
  // { key: 'insert-row', title: tf('contextmenu.insertRow') }, // 默认插入为在上方插入1行，扩展使其为可在上下动态调整插入行数
  { key: 'insert-row-above', title: tf('contextmenu.insertRowAbove'), input: true },
  { key: 'insert-row-below', title: tf('contextmenu.insertRowBelow'), input: true },
  { key: 'delete-row', title: tf('contextmenu.deleteRow') },
  { key: 'divider' },
  // { key: 'insert-column', title: tf('contextmenu.insertColumn') }, // 同行 L:17
  { key: 'insert-column-left', title: tf('contextmenu.insertColumnLeft'), input: true },
  { key: 'insert-column-right', title: tf('contextmenu.insertColumnRight'), input: true },
  { key: 'delete-column', title: tf('contextmenu.deleteColumn') },
  { key: 'divider' },
  { key: 'delete-cell-text', title: tf('contextmenu.deleteCellText') },
  { key: 'hide', title: tf('contextmenu.hide') },
  { key: 'divider' },
  { key: 'validation', title: tf('contextmenu.validation') },
  { key: 'divider' },
  // 屏蔽打印
  // { key: 'cell-printable', title: tf('contextmenu.cellprintable') },
  // { key: 'cell-non-printable', title: tf('contextmenu.cellnonprintable') },
  { key: 'cell-format', title: tf('contextmenu.cellformat') },
  { key: 'delete-cell', title: tf('contextmenu.deleteCell') },
  { key: 'divider' },
  { key: 'cell-editable', title: tf('contextmenu.celleditable') },
  { key: 'cell-non-editable', title: tf('contextmenu.cellnoneditable') },
  { key: 'cell-hidden', title: tf('contextmenu.cellhidden') },
  { key: 'cell-no-hidden', title: tf('contextmenu.cellnohidden') },
  { key: 'divider' },
  { key: 'row-height', title: tf('contextmenu.rowHeight'), input: true },
  { key: 'col-width', title: tf('contextmenu.colWidth'), input: true },
  { key: 'divider' },
  { key: 'property', title: tf('contextmenu.property') },
];

function buildMenuItemInput(item) {
  if (!item.input) {
    return;
  }
  // 在这里构造 input 输入框时直接借用了源码中已经存在的 FormInput
  this[item.key] = new FormInput('40px', '最大999');
  // 给 input 添加一个class方便后续判断
  this[item.key].addClass('col-row-input');
  this[item.key].val(1);
  this[item.key].vchange = (evt) => {
    evt.stopPropagation();
    const val = this[item.key].val();
    const reg = /^\d+$/;
    if (val) {
      if (!reg.test(val)) {
        this[item.key].val(1);
      } else if (val > 999) {
        this[item.key].val(999);
      } else {
        this[item.key].val(+val);
      }
    }
  };
  // return this[item.key].el;
}

function buildMenuItem(item) {
  if (item.key === 'divider') {
    return h('div', `${cssPrefix}-item divider`);
  }
  return h('div', `${cssPrefix}-item`)
    .attr('data-name', item.key) // 在这里添加一个名字，方便根据名字判断而不是顺序。因为右键菜单项可隐藏后，顺序会变化。
    .on('click', (e) => {
      const { target } = e;
      // 当单击目标不是输入框时，
      if (target.nodeName !== 'INPUT' && !target.classList.contains('col-row-input')) {
        // 当菜单项是特殊的带输入框时，获取其中的数值
        let inputVal = 1;
        if (item.input) {
          inputVal = +this[item.key].val();
        }
        this.itemClick(item.key, inputVal);
        this.hide();
      }
    })
    .children(item.title(), h('div', 'label').child(item.label || buildMenuItemInput.call(this, item) || ''));
}

function buildMenu() {
  const { hideContextmenuItem } = this;
  return menuItems.filter((it) => !hideContextmenuItem.includes(it.key)).map((it) => buildMenuItem.call(this, it));
}

export default class Contextmenu {
  constructor(viewFn, isHide = false, hideContextmenuItem = []) {
    this.hideContextmenuItem = hideContextmenuItem;
    this.menuItems = buildMenu.call(this);
    this.el = h('div', `${cssPrefix}-contextmenu`)
      .children(...this.menuItems)
      .hide();
    this.viewFn = viewFn;
    this.itemClick = () => {};
    this.isHide = isHide;
    this.setMode('range');
  }

  // row-col: the whole rows or the whole cols
  // range: select range
  setMode(mode) {
    const { hideContextmenuItem } = this;
    // 在这里根据名称而不是顺序来进行判断，因为右键菜单项可隐藏后，顺序会变化。
    const temp = {
      insertRowAboveEl: this.menuItems.find((it) => it.attr('data-name') === 'insert-row-above'),
      insertRowBelowEl: this.menuItems.find((it) => it.attr('data-name') === 'insert-row-below'),
      deleteRowEl: this.menuItems.find((it) => it.attr('data-name') === 'delete-row'),
      insertColumnLeftEl: this.menuItems.find((it) => it.attr('data-name') === 'insert-column-left'),
      insertColumnRightEl: this.menuItems.find((it) => it.attr('data-name') === 'insert-column-right'),
      deleteColumnEl: this.menuItems.find((it) => it.attr('data-name') === 'delete-column'),
      propertyEl: this.menuItems.find((it) => it.attr('data-name') === 'property'),
      hideEl: this.menuItems.find((it) => it.attr('data-name') === 'hide'),
      rowHeightEl: this.menuItems.find((it) => it.attr('data-name') === 'row-height'),
      colwidthEl: this.menuItems.find((it) => it.attr('data-name') === 'col-width'),
    };

    if (mode === 'row') {
      ['insertRowAboveEl', 'insertRowBelowEl', 'deleteRowEl', 'hideEl', 'rowHeightEl'].forEach((el) => {
        if (!hideContextmenuItem.includes(el)) {
          temp[el].show();
        }
      });

      ['insertColumnLeftEl', 'insertColumnRightEl', 'deleteColumnEl', 'propertyEl', 'hideEl', 'colwidthEl'].forEach(
        (el) => temp[el].hide()
      );
    } else if (mode === 'col') {
      ['insertRowAboveEl', 'insertRowBelowEl', 'deleteRowEl', 'propertyEl', 'rowHeightEl'].forEach((el) =>
        temp[el].hide()
      );

      ['insertColumnLeftEl', 'insertColumnRightEl', 'deleteColumnEl', 'hideEl', 'colwidthEl'].forEach((el) => {
        if (!hideContextmenuItem.includes(el)) {
          temp[el].show();
        }
      });
    } else {
      [
        'insertRowAboveEl',
        'insertRowBelowEl',
        'deleteRowEl',
        'insertColumnLeftEl',
        'insertColumnRightEl',
        'deleteColumnEl',
        'propertyEl',
        'rowHeightEl',
        'colwidthEl',
      ].forEach((el) => {
        if (!hideContextmenuItem.includes(el)) {
          temp[el].show();
        }
      });

      temp.hideEl.hide();
    }
  }

  hide() {
    const { el } = this;
    // 因为扩展了右键菜单，添加了带输入框的菜单项，故隐藏时将输入框重置为默认值。
    this['insert-row-above']?.val(1);
    this['insert-row-below']?.val(1);
    this['insert-column-left']?.val(1);
    this['insert-column-right']?.val(1);
    this['row-height']?.val(25);
    this['col-width']?.val(100);
    el.hide();
    unbindClickoutside(el);
  }

  setPosition(x, y) {
    if (this.isHide) return;
    const { el } = this;
    const { width } = el.show().offset();
    const view = this.viewFn();
    const vhf = view.height / 2;
    let left = x;
    if (view.width - x <= width) {
      left -= width;
    }
    el.css('left', `${left}px`);
    if (y > vhf) {
      el.css('bottom', `${view.height - y}px`)
        .css('max-height', `${y}px`)
        .css('top', 'auto');
    } else {
      el.css('top', `${y}px`)
        .css('max-height', `${view.height - y}px`)
        .css('bottom', 'auto');
    }
    bindClickoutside(el);
  }
}
