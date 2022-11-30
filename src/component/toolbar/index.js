import { h } from '../element';
import { bind, bindResize } from '../event';
import { cssPrefix } from '../../config';
import Item from './item';
import More from './more';
import Download from './download';
import Undo from './undo';
import Redo from './redo';
import PaintFormat from './paintformat';
import ClearFormat from './clearformat';
import Chart from './chart';
import Format from './format';
import Font from './font';
import FontSize from './font-size';
import Bold from './bold';
import Italic from './italic';
import Underline from './underline';
import Strike from './strike';
import TextColor from './text-color';
import FillColor from './fill-color';
import Border from './border';
import Merge from './merge';
import Align from './align';
import Valign from './valign';
import TextWrap from './text-wrap';
import Freeze from './freeze';
import AutoFilter from './auto-filter';
import Formula from './formula';
import Dropdown from '../dropdown';

/**
 * 防抖函数
 * @param {*} func
 * @param {*} wait
 * @param {*} immediate
 * @return {*} 带有防抖功能的函数
 */
function debounce(func, wait, immediate) {
  let timeout;
  return function () {
    const that = this;
    const args = arguments;
    if (timeout) {
      clearTimeout(timeout);
    }
    if (immediate && !timeout) {
      func.apply(that, args);
    }
    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) {
        func.apply(that, args);
      }
    }, wait);
  };
}

/**
 * 生成分隔竖线。
 * @ignore
 * @returns {Element}
 */
function buildDivider() {
  return h('div', `${cssPrefix}-toolbar-divider`);
}

/**
 * 为了方便在“更多”下拉框保持按钮的样式，在这里提前计算好各个按钮的样式。
 * @ignore
 */
function calcBtnStyle() {
  this.btnsWidthStyle = [];
  this.items.forEach((it) => {
    // 按钮图标
    if (Array.isArray(it)) {
      it.forEach(({ el }) => {
        doCalcStyle.call(this, el);
      });
    } else {
      // 分隔线
      doCalcStyle.call(this, it);
    }
  });
}

/**
 * 计算元素样式。
 * @ignore
 * @param el
 */
function doCalcStyle(el) {
  const rect = el.box();
  const { marginLeft, marginRight } = el.computedStyle();
  this.btnsWidthStyle.push([el, rect.width + parseInt(marginLeft, 10) + parseInt(marginRight, 10)]);
}

/**
 * 根据页面大小调整工具栏显示，当尺寸不够显示全部按钮时，将无法显示的按钮放进“更多”下拉框中。
 * @ignore
 */
function moreResize() {
  const { el, btns, moreEl, btnsWidthStyle } = this;
  const { moreBtns, contentEl } = moreEl.dd;
  el.css('width', `${this.widthFn()}px`);
  const elBox = el.box();

  let sumWidth = 60 + 18 * 2; // 内边距为60，考虑到滚动条18，滚动条右边的区域（不明白为什么会出现）
  let sumWidthMore = 12; // more 的内边距为12，需要多给点宽度以与内边距相抵消防止折行。

  const list = []; // 固定显示的按钮
  const listMore = []; // 更多下拉框中的按钮，默认隐藏，单击展开下拉框
  btnsWidthStyle.forEach(([it, w], index) => {
    sumWidth += w;
    if (index === btnsWidthStyle.length - 1 || sumWidth < elBox.width) {
      list.push(it);
    } else {
      sumWidthMore += w;
      listMore.push(it);
    }
  });
  btns.html('').children(...list);
  moreBtns.html('').children(...listMore);
  contentEl.css('width', `${sumWidthMore}px`);
  if (listMore.length > 0) {
    moreEl.show();
  } else {
    moreEl.hide();
  }
}

/**
 * 生成扩展工具栏按钮。
 * @ignore
 * @param it
 * @returns {Item}
 */
function genBtn(it) {
  let btn;
  switch (it.type) {
    case 'dropdown':
      btn = generateDropdownItem.call(this, it);
      break;
    case 'toggle':
      btn = generateToggleItem.call(this, it);
      break;
    case 'icon':
    default:
      btn = generateIconItem.call(this, it);
  }
  return btn;
}

/**
 * 生成带图标按钮。
 * @ignore
 * @param it
 * @returns {Item}
 */
function generateIconItem(it) {
  let { tag, shortcut, value, tip, icon, el } = it;
  const btn = new Item(tag, shortcut, value);
  btn.el.on('click', () => {
    if (it.onClick) {
      it.onClick(this.data.getData(), this.data);
    }
  });
  btn.tip = tip || '';

  if (icon) {
    el = h('img').attr('src', it.icon);
  }

  if (el) {
    const icon = h('div', `${cssPrefix}-icon`);
    icon.child(el);
    btn.el.child(icon);
  }

  if (it.tag) {
    this[`${it.tag}El`] = btn;
  }

  return btn;
}

/**
 * 生成实现切换状态按钮。
 * @ignore
 * @param it
 */
function generateToggleItem(it) {
  const btn = generateIconItem.call(this, it);

  // 先删除 generateIconItem 绑定的 click 事件，然后再绑定自己的 click 事件。
  btn.el.off('click').on('click', () => {
    if (it.onClick) {
      it.onClick(this.data.getData(), this.data);
      btn.toggle();
    }
  });

  btn.setState = function (active) {
    this.el.active(active);
  };

  btn.toggle = function () {
    return this.el.toggle();
  };

  btn.active = function () {
    return this.el.hasClass('active');
  };

  return btn;
}

/**
 * 生成下拉菜单按钮。
 * @ignore
 * @param it
 */
function generateDropdownItem(it) {
  const { tag, shortcut, value, tip, width, content } = it;
  const btn = new Item(tag, shortcut, value);

  const dd = new Dropdown(value, width, true, 'bottom-left', content);
  dd.change = (it) => this.change(tag, this.getValue(it));
  btn.el.child(dd);

  btn.getValue = function (value) {
    return value;
  };

  btn.tip = tip || '';

  if (it.tag) {
    this[`${it.tag}El`] = btn;
  }

  return btn;
}

/**
 * 工具栏。
 * @ignore
 * @class
 */
class Toolbar {
  /**
   *
   * @param data DataProxy 对象
   * @param widthFn 工具栏宽度函数
   * @param isHide 隐藏|显示工具栏
   */
  constructor(data, widthFn, isHide = false) {
    this.data = data;
    this.change = () => {};
    this.widthFn = widthFn;
    this.isHide = isHide;
    // 只读模式下工具栏直接隐藏了
    // this.isRead = data.settings.mode === 'read'; // 只读模式
    const style = data.defaultStyle(); // 默认样式
    // 工具栏工具
    this.items = [
      [(this.downloadEl = new Download())],
      buildDivider(),
      [
        (this.undoEl = new Undo()),
        (this.redoEl = new Redo()),
        // new Print(),
        (this.paintformatEl = new PaintFormat()),
        (this.clearformatEl = new ClearFormat()),
      ],
      buildDivider(),
      [(this.chartEl = new Chart())],
      buildDivider(),
      [(this.formatEl = new Format())],
      buildDivider(),
      [
        (this.fontEl = new Font()),
        (this.fontSizeEl = new FontSize()),
        (this.boldEl = new Bold()),
        (this.italicEl = new Italic()),
        (this.underlineEl = new Underline()),
        (this.strikeEl = new Strike()),
        (this.textColorEl = new TextColor(style.color)),
        (this.fillColorEl = new FillColor(style.bgcolor)),
        (this.borderEl = new Border()),
      ],
      buildDivider(),
      [
        (this.alignEl = new Align(style.align)),
        (this.valignEl = new Valign(style.valign)),
        (this.textwrapEl = new TextWrap()),
        (this.mergeEl = new Merge()),
      ],
      buildDivider(),
      [(this.freezeEl = new Freeze())],
      buildDivider(),
      [(this.formulaEl = new Formula()), (this.autofilterEl = new AutoFilter())],
    ];

    // this.items.push([(this.formulaEl = new Formula())])
    // 在这里是添加扩展工具栏图标，目前只能在首尾添加。
    const { extendToolbar = {} } = data.settings;
    if (extendToolbar.left && extendToolbar.left.length > 0) {
      this.items.unshift(buildDivider());
      const btns = extendToolbar.left.map(genBtn.bind(this));
      this.items.unshift(btns);
    }
    if (extendToolbar.right && extendToolbar.right.length > 0) {
      this.items.push(buildDivider());
      const btns = extendToolbar.right.map(genBtn.bind(this));
      this.items.push(btns);
    }

    // “更多”按钮，当页面宽度小于阈值时，将无法显示的按钮放到更多下拉框去。
    this.items.push([(this.moreEl = new More())]);

    this.el = h('div', `${cssPrefix}-toolbar`);
    this.btns = h('div', `${cssPrefix}-toolbar-btns`);

    this.bindToolbarEvt();

    if (isHide) {
      this.el.hide();
    } else {
      this.reset();
      setTimeout(() => {
        calcBtnStyle.call(this);
        moreResize.call(this);
      }, 0);
      // 页面大小变化时，判断是否需要在更多按钮中添加无法显示的按钮。
      bind(
        window,
        'resize',
        debounce(() => {
          moreResize.call(this);
        }, 300)
      );
      // 自定义一个方法，实现对 div 尺寸变化的监听。
      bindResize(
        '.mypandora-spreadsheet',
        debounce(() => {
          moreResize.call(this);
        }, 300)
      );
    }
  }

  bindToolbarEvt() {
    // 区分“按钮”与“竖线”，绑定事件。
    this.items.forEach((it) => {
      if (Array.isArray(it)) {
        it.forEach((i) => {
          this.btns.child(i.el);
          i.change = (...args) => {
            this.change(...args);
          };
        });
      } else {
        this.btns.child(it.el);
      }
    });
    this.el.child(this.btns);
  }

  changeItems() {
    this.items[16].splice(0, 1, (this.formulaEl = new Formula()));
    this.bindToolbarEvt();
  }

  paintFormatActive() {
    return this.paintformatEl.active();
  }

  paintFormatToggle() {
    this.paintformatEl.toggle();
  }

  trigger(type) {
    this[`${type}El`].click();
  }

  /**
   * 当loadData时，toolbar也跟随重置data
   * @param data
   */
  resetData(data) {
    this.data = data;
    this.reset();
  }

  reset() {
    if (this.isHide) {
      return;
    }

    const { data } = this;
    const style = data.getSelectedCellStyle();
    this.undoEl.setState(!data.canUndo());
    this.redoEl.setState(!data.canRedo());
    // this.mergeEl.disabled();

    const { font, format } = style;
    this.formatEl.setState(format);

    this.fontEl.setState(font.name);
    this.fontSizeEl.setState(font.size);

    this.boldEl.setState(font.bold);
    this.italicEl.setState(font.italic);
    this.underlineEl.setState(style.underline);
    this.strikeEl.setState(style.strike);
    this.textColorEl.setState(style.color);

    this.fillColorEl.setState(style.bgcolor);
    this.mergeEl.setState(data.canUnmerge(), !data.selector.multiple());

    this.alignEl.setState(style.align);
    this.valignEl.setState(style.valign);
    this.textwrapEl.setState(style.textwrap);

    this.freezeEl.setState(data.freezeIsActive());
    this.autofilterEl.setState(!data.canAutoFilter());

    // 禁用的工具栏按钮
    // 当禁用工具栏在初始化中时，容易导致重置之后部分按钮生效，故把它们的实现放在重置方法中。
    const { disableToolbar = [] } = data.settings;
    if (Array.isArray(disableToolbar) && disableToolbar.length) {
      const map = {
        undo: 'undoEl', // 撤销
        redo: 'redoEl', // 恢复
        paintFormat: 'paintformatEl', // 格式刷
        clearFormat: 'clearformatEl', // 清除格式

        chart: 'chartEl', // 图表

        format: 'formatEl', // 数据格式

        font: 'fontEl', // 字体
        fontSize: 'fontSizeEl', // 字号

        bold: 'boldEl', // 加粗
        italic: 'italicEl', // 倾斜
        underline: 'underlineEl', // 下划线
        strike: 'strikeEl', // 删除线
        textColor: 'textColorEl', // 字体颜色

        fillColor: 'fillColorEl', // 填充颜色
        border: 'borderEl', // 边框
        merge: 'mergeEl', // 合并单元格

        align: 'alignEl', // 水平对齐
        valign: 'valignEl', // 垂直对齐
        textwrap: 'textwrapEl', // 自动换行

        freeze: 'freezeEl', // 冻结
        autoFilter: 'autofilterEl', // 自动筛选
        formula: 'formulaEl', // 函数
      };
      disableToolbar.forEach((item) => {
        const el = map[item];
        if (el) {
          this[el].setDisabled(true);
        }
      });
    }

    // 当我们在工具栏添加了扩展按钮时，为了让新添加的按钮状态正常，也需要做一些操作。
    const { extendToolbar = {} } = data.settings;
    const selectCell = data.getSelectedCell();
    const extra = selectCell?.extra;
    if (extendToolbar.left && extendToolbar.left.length > 0) {
      const toggleBtns = extendToolbar.left.filter((item) => item.type === 'toggle');
      toggleBtns.forEach((item) => {
        // 该方法的作用是回显按钮的切换状态，作用参考 this.boldEl.setState(font.bold)
        const setValue = !!extra?.[item.tag];
        this[`${item.tag}El`]?.setState(setValue);
      });
    }
    if (extendToolbar.right && extendToolbar.right.length > 0) {
      const toggleBtns = extendToolbar.right.filter((item) => item.type === 'toggle');
      toggleBtns.forEach((item) => {
        const setValue = !!extra?.[item.tag];
        this[`${item.tag}El`]?.setState(setValue);
      });
    }
  }
}

export default Toolbar;
