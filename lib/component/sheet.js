import { fileOpen } from 'browser-fs-access';
import { BASE_FORMULAS } from '../core/formula';
import request from '../core/request';
import { cssPrefix } from '../config';
import { h } from './element';
import { bind, bindResize, bindTouch, createEventEmitter, mouseMoveUp } from './event';
import Toolbar from './toolbar';
import Print from './print';
import Resizer from './resizer';
import Scrollbar from './scrollbar';
import Editor from './editor';
import Contextmenu from './contextmenu';
import Selector from './selector';
import SortFilter from './sort-filter';
import ModalValidation from './modal-validation';
import ModalFormat from './modal-format';
import ModalProperty from './modal-property';
import Table from './table';
import { xtoast } from './message';

/**
 * 节流函数
 * @ignore
 * @param func function
 * @param wait Delay in milliseconds
 */
function throttle(func, wait) {
  let timeout;
  return (...arg) => {
    const that = this;
    const args = arg;
    if (!timeout) {
      timeout = setTimeout(() => {
        timeout = null;
        func.apply(that, args);
      }, wait);
    }
  };
}

/**
 * 防抖函数
 * @param {*} func
 * @param {*} wait
 * @param {*} immediate
 * @return {*} 带有防抖功能的函数
 */
function debounce(func, wait, immediate) {
  let timeout;
  return function foo(...args) {
    const that = this;
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
 * 判断单元格是否可输入。
 * 当单元格类型为数字时，根据数字的相关属性进行判断
 * 只能输入0~9、-、.
 * @param {*} evt
 */
function canWrite(evt) {
  const { data } = this;
  const cell = data.getSelectedCell();
  if (cell?.type?.toLowerCase() === 'number') {
    const value = evt.key;
    if (!['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].includes(value)) {
      return false;
    }
  }
  return true;
}

/**
 * 滚动条滚动事件。
 * @ignore
 */
function scrollbarMove() {
  const { data, verticalScrollbar, horizontalScrollbar } = this;
  const { l, t, left, top, width, height } = data.getSelectedRect();
  const tableOffset = this.getTableOffset();
  if (Math.abs(left) + width > tableOffset.width) {
    horizontalScrollbar.move({ left: l + width - tableOffset.width });
  } else {
    const fsw = data.freezeTotalWidth();
    if (left < fsw) {
      horizontalScrollbar.move({ left: l - 1 - fsw });
    }
  }

  if (Math.abs(top) + height > tableOffset.height) {
    verticalScrollbar.move({ top: t + height - tableOffset.height - 1 });
  } else {
    const fsh = data.freezeTotalHeight();
    if (top < fsh) {
      verticalScrollbar.move({ top: t - 1 - fsh });
    }
  }
}

/**
 * sheet工作表选择器设定。
 * @ignore
 * @param multiple
 * @param ri
 * @param ci
 * @param indexesUpdated
 * @param moving
 */
function selectorSet(multiple, ri, ci, indexesUpdated = true, moving = false) {
  if (ri === -1 && ci === -1) {
    return;
  }
  const { table, selector, toolbar, data, contextmenu } = this;
  const cell = data.getCell(ri, ci);
  // console.log('multiple', multiple)
  if (multiple) {
    selector.setEnd(ri, ci, moving); // 生成selector的range范围, ri, ci为结束位置
    this.trigger('cells-selected', cell, selector.range); // 拖动选择的时候返回selector的
  } else {
    selector.set(ri, ci, indexesUpdated); // 生成selector的range范围, ri, ci为开始位置
    this.trigger('cell-selected', cell, ri, ci);
  }
  let mode = 'range';
  if (ri === -1) {
    // 鼠标在列索引上
    mode = 'col';
  } else if (ci === -1) {
    // 鼠标在行索引上
    mode = 'row';
  }
  contextmenu.setMode(mode);
  toolbar.reset();
  table.render();
}

// multiple: boolean
// direction: left | right | up | down | row-first | row-last | col-first | col-last
/**
 * sheet工作表选择器移动时设定。
 * @ignore
 * @param multiple
 * @param direction
 */
function selectorMove(multiple, direction) {
  const { selector, data } = this;
  const { rows, cols } = data;
  let [ri, ci] = selector.indexes;
  const { eri, eci } = selector.range;
  if (multiple) {
    [ri, ci] = selector.moveIndexes;
  }

  if (direction === 'left') {
    if (ci > 0) {
      ci -= 1;
    }
  } else if (direction === 'right') {
    if (eci !== ci) {
      ci = eci;
    }
    if (ci < cols.len - 1) {
      ci += 1;
    }
  }

  if (direction === 'up') {
    if (ri > 0) {
      ri -= 1;
    }
  } else if (direction === 'down') {
    if (eri !== ri) {
      ri = eri;
    }
    if (ri < rows.len - 1) {
      ri += 1;
    }
  } else if (direction === 'row-first') {
    ci = 0;
  } else if (direction === 'row-last') {
    ci = cols.len - 1;
  } else if (direction === 'col-first') {
    ri = 0;
  } else if (direction === 'col-last') {
    ri = rows.len - 1;
  }
  if (multiple) {
    selector.moveIndexes = [ri, ci];
  }
  selectorSet.call(this, multiple, ri, ci);

  scrollbarMove.call(this);
}

// private methods
/**
 * 表格覆盖层鼠标按下移动事件。
 * @ignore
 * @param evt
 */
function overlayerMousemove(evt) {
  // 没有按键或者没有初始化
  if (evt.buttons !== 0) {
    return;
  }
  if (evt.target.className === `${cssPrefix}-resizer-hover`) {
    return;
  }
  const { offsetX, offsetY } = evt;
  const { rowResizer, colResizer, tableEl, data } = this;
  const { rows, cols } = data;
  // 当前鼠标坐标在 sheet(即单元格) 上时，隐藏标尺，并直接返回。
  if (offsetX > cols.indexWidth && offsetY > rows.indexHeight) {
    rowResizer.hide();
    colResizer.hide();
    return;
  }
  // 当前鼠标坐标在
  const tRect = tableEl.box(); // 获取整个 canvas 的大小及其相对于视口的位置：
  const cRect = data.getCellRectByXY(evt.offsetX, evt.offsetY);
  if (cRect.ri >= 0 && cRect.ci === -1) {
    cRect.width = cols.indexWidth;
    rowResizer.show(cRect, {
      width: tRect.width,
    });
    if (rows.isHide(cRect.ri - 1)) {
      rowResizer.showUnhide(cRect.ri);
    } else {
      rowResizer.hideUnhide();
    }
  } else {
    rowResizer.hide();
  }
  // 当前鼠标坐标在左侧索引列时
  if (cRect.ri === -1 && cRect.ci >= 0) {
    cRect.height = rows.indexHeight;
    colResizer.show(cRect, {
      height: tRect.height,
    });
    if (cols.isHide(cRect.ci - 1)) {
      colResizer.showUnhide(cRect.ci);
    } else {
      colResizer.hideUnhide();
    }
  } else {
    // 当前鼠标坐标在研上部字母行时
    colResizer.hide();
  }
}

/**
 * 表格覆盖层鼠标滚动事件
 * @ignore
 * @param evt
 */
function overlayerMousescroll(evt) {
  // scrollThreshold -= 1;
  // if (scrollThreshold > 0) return;
  // scrollThreshold = 15;

  const { verticalScrollbar, horizontalScrollbar, data } = this;
  const { top } = verticalScrollbar.scroll();
  const { left } = horizontalScrollbar.scroll();
  const { rows, cols } = data;

  // deltaY for vertical delta
  const { deltaY, deltaX } = evt;
  const loopValue = (ii, vFunc) => {
    let i = ii;
    let v = 0;
    do {
      v = vFunc(i);
      i += 1;
    } while (v <= 0);
    return v;
  };
  // console.log('deltaX', deltaX, 'evt.detail', evt.detail);
  // if (evt.detail) deltaY = evt.detail * 40;
  const moveY = (vertical) => {
    if (vertical > 0) {
      // up
      const ri = data.scroll.ri + 1;
      if (ri < rows.len) {
        const rh = loopValue(ri, (i) => rows.getHeight(i));
        verticalScrollbar.move({ top: top + rh - 1 });
      }
    } else {
      // down
      const ri = data.scroll.ri - 1;
      if (ri >= 0) {
        const rh = loopValue(ri, (i) => rows.getHeight(i));
        verticalScrollbar.move({ top: ri === 0 ? 0 : top - rh });
      }
    }
  };

  // deltaX for Mac horizontal scroll
  const moveX = (horizontal) => {
    if (horizontal > 0) {
      // left
      const ci = data.scroll.ci + 1;
      if (ci < cols.len) {
        const cw = loopValue(ci, (i) => cols.getWidth(i));
        horizontalScrollbar.move({ left: left + cw - 1 });
      }
    } else {
      // right
      const ci = data.scroll.ci - 1;
      if (ci >= 0) {
        const cw = loopValue(ci, (i) => cols.getWidth(i));
        horizontalScrollbar.move({ left: ci === 0 ? 0 : left - cw });
      }
    }
  };
  const tempY = Math.abs(deltaY);
  const tempX = Math.abs(deltaX);
  const temp = Math.max(tempY, tempX);
  // detail for windows/mac firefox vertical scroll
  if (/Firefox/i.test(window.navigator.userAgent)) {
    throttle(moveY(evt.detail), 50);
  }
  if (temp === tempX) {
    throttle(moveX(deltaX), 50);
  }
  if (temp === tempY) {
    throttle(moveY(deltaY), 50);
  }
}

/**
 * 表格覆盖层拖动结束事件
 * @ignore
 * @param evt
 */
function overlayerMouseDrop(evt) {
  const { selector, data, toolbar } = this;
  if (data.settings.mode === 'read') return;
  const { offsetX, offsetY } = evt;
  const cellRect = data.getCellRectByXY(offsetX, offsetY);
  const { ri, ci } = cellRect;

  // 触发拖动结束事件
  const cell = data.getCell(ri, ci);
  selector.set(ri, ci, true);
  this.trigger('cell-drop', cell, ri, ci, evt);
  toolbar.reset();
  // selectorSet.call(this, false, ri, ci);
  this.trigger('cell-selected', data.getCell(ri, ci), ri, ci);
}

/**
 * 表格覆盖层触摸事件
 * @ignore
 * @param direction
 * @param distance
 */
function overlayerTouch(direction, distance) {
  const { verticalScrollbar, horizontalScrollbar } = this;
  const { top } = verticalScrollbar.scroll();
  const { left } = horizontalScrollbar.scroll();

  if (direction === 'left' || direction === 'right') {
    horizontalScrollbar.move({ left: left - distance });
  } else if (direction === 'up' || direction === 'down') {
    verticalScrollbar.move({ top: top - distance });
  }
}

/**
 * 设置垂直滚动条。
 * @ignore
 */
function verticalScrollbarSet() {
  const { data, verticalScrollbar } = this;
  const { height } = this.getTableOffset();
  const erth = data.exceptRowTotalHeight(0, -1);
  // console.log('erth:', erth);
  verticalScrollbar.set(height, data.rows.totalHeight() - erth);
}

/**
 * 设置水平滚动条。
 * @ignore
 */
function horizontalScrollbarSet() {
  const { data, horizontalScrollbar } = this;
  const { width } = this.getTableOffset();
  if (data) {
    horizontalScrollbar.set(width, data.cols.totalWidth());
  }
}

/**
 * 冻结行列设置函数
 * @ignore
 */
function sheetFreeze() {
  const { selector, data, editor } = this;
  const [ri, ci] = data.freeze;
  if (ri > 0 || ci > 0) {
    const fwidth = data.freezeTotalWidth();
    const fheight = data.freezeTotalHeight();
    editor.setFreezeLengths(fwidth, fheight);
  }
  selector.resetAreaOffset();
}

/**
 * 表格重置刷新函数
 * @ignore
 */
function sheetReset() {
  const { tableEl, overlayerEl, overlayerContentEl, table, toolbar, selector, el } = this;
  const tOffset = this.getTableOffset();
  const vRect = this.getRect();
  tableEl.attr(vRect);
  overlayerEl.offset(vRect);
  overlayerContentEl.offset(tOffset);
  el.css('width', `${vRect.width}px`);
  verticalScrollbarSet.call(this);
  horizontalScrollbarSet.call(this);
  sheetFreeze.call(this);
  table.render();
  toolbar.reset();
  selector.reset();
}

/**
 * 清空剪切板
 * @ignore
 */
function clearClipboard() {
  const { data, selector } = this;
  data.clearClipboard();
  selector.hideClipboard();
}

/**
 * 【右键菜单】添加与删除斜线<br>
 * 斜线的实现逻辑参考了工具栏中的边框。
 * @ignore
 * @param flag true：添加；false：删除
 */
function slash(flag = true) {
  const { data } = this;
  if (data.settings.mode !== 'edit') return;
  data.setSelectedCellAttr('slash', flag);
  sheetReset.call(this);
}

/**
 * 【右键菜单】复制
 * @ignore
 * @param evt
 */
function copy(evt) {
  const { data, selector } = this;
  if (data.settings.mode === 'read') return;
  data.copy();
  data.copyToSystemClipboard(evt);
  selector.showClipboard();
}

/**
 * 【右键菜单】剪切
 * @ignore
 */
function cut() {
  const { data, selector } = this;
  if (data.settings.mode === 'read') return;
  data.cut();
  selector.showClipboard();
}

/**
 * 【右键菜单】粘贴数据|粘贴格式
 * @ignore
 * @param what
 * @param evt
 */
function paste(what, evt) {
  const { data } = this;
  if (data.settings.mode === 'read') return;
  if (data.clipboard.isClear()) {
    const resetSheet = () => sheetReset.call(this);
    const eventTrigger = (rows) => {
      this.trigger('pasted-clipboard', rows);
    };
    // pastFromSystemClipboard is async operation, need to tell it how to reset sheet and trigger event after it finishes
    // pasting content from system clipboard
    data.pasteFromSystemClipboard(resetSheet, eventTrigger);
  } else if (data.paste(what, (msg) => xtoast('Tip', msg))) {
    sheetReset.call(this);
  } else if (evt) {
    const cdata = evt.clipboardData.getData('text/plain');
    this.data.pasteFromText(cdata);
    sheetReset.call(this);
  }
}

/**
 * 【右键菜单】隐藏选中列或者行。
 * @ignore
 */
function hideRowsOrCols() {
  const { data } = this;
  if (data.settings.mode !== 'edit') return;
  data.hideRowsOrCols();
  sheetReset.call(this);
}

/**
 * 【右键菜单】取消隐藏行或者列。
 * @ignore
 * @param type “行”或者“列”
 * @param index 索引
 */
function unhideRowsOrCols(type, index) {
  const { data } = this;
  if (data.settings.mode !== 'edit') return;
  data.unhideRowsOrCols(type, index);
  sheetReset.call(this);
}

/**
 * 自动过滤函数。
 * @ignore
 */
function autofilter() {
  const { data } = this;
  data.autofilter();
  sheetReset.call(this);
}

/**
 * 格式粘贴。
 * @ignore
 */
function toolbarChangePaintformatPaste() {
  const { toolbar } = this;
  if (toolbar.paintFormatActive()) {
    paste.call(this, 'format');
    clearClipboard.call(this);
    toolbar.paintFormatToggle();
  }
}

// 获取树结构的孩子节点
function getChildren(data, id, pid) {
  const result = [];
  data.forEach((item) => {
    if (item[pid] === id) {
      result.push(item);
    }
  });
  return result;
}

// 获取树结构的所有后代节点
function getDescendants(data, id, pid) {
  let result = [];
  data.forEach((item) => {
    if (item[pid] === id) {
      result.push(item);
      result = result.concat(getDescendants(data, item.componentId, pid));
    }
  });
  return result;
}

function enhanceSelect(cell, selects) {
  const { data } = this;

  // 获取树结构的孩子节点
  const children = getChildren(selects, cell.componentId, 'selectParentId');
  // 获取树结构的所有后代节点
  const descendants = getDescendants(selects, cell.componentId, 'selectParentId');
  // 将所有后代节点的值设置为空
  descendants.forEach(({ componentId, ri, ci }) => {
    let editable = false;
    if (children.map((c) => c.componentId).includes(componentId)) {
      editable = true;
    }
    data.rows.setCell(+ri, +ci, { editable, text: '', value: '' }, 'rest'); // 直接修改，不要历史记录
  });
}

function enhanceRadio(cell, radios) {
  const { data, table } = this;

  // 首先筛选出与它同组的单选框
  const filterRadios = radios.filter((item) => item.group && item.group === cell.group);

  // 如果没有，那就是说明点击的单元格没有name属性，把自身加上
  if (filterRadios.length === 0) {
    filterRadios.push(cell);
  }

  // 将所有单选框的值设置为未选中
  filterRadios.forEach(({ componentId, ri, ci }) => {
    let checked = false;
    if (filterRadios.length === 1) {
      checked = true;
    } else if (cell?.componentId === componentId) {
      checked = true;
    }
    data.rows.setCell(+ri, +ci, { checked }, 'rest');
  });

  // 重新渲染表格
  table.render();
}

function enhanceChcekbox(cell) {
  const { data, table } = this;
  const { ri, ci, checked } = cell;

  data.rows.setCell(+ri, +ci, { checked: !checked }, 'rest');

  // 重新渲染表格
  table.render();
}

// 后置增强
function postEnhance(cell) {
  const { data } = this;

  const selects = [];
  const radios = [];

  if (['select', 'radio', 'checkbox'].includes(cell?.type)) {
    // 把一些其它值都设置为合适的值
    // 筛选出级联组件
    const rows = data.rows._;
    Object.keys(rows).forEach((ri) => {
      if (Number.isInteger(+ri)) {
        const row = rows[ri];
        const { cells } = row;
        Object.keys(cells).forEach((ci) => {
          const item = cells[ci];
          // 筛选下拉框组件，并且是异步的，因为可用它实现级联
          if (item?.type === 'select' && item.selectAsync === true) {
            selects.push({ ...item, ri, ci });
          } else if (item?.type === 'radio') {
            // 筛选中单选框组件
            radios.push({ ...item, ri, ci });
          }
        });
      }
    });

    // 只有当选中的是下拉框组件时，才增强
    if (cell?.type === 'select') {
      enhanceSelect.call(this, cell, selects);
      this.trigger('cell-edited', undefined, undefined, undefined, cell);
    }
    // 只有当选中的是单选框组件时，才增强，并且单元格不被隐藏
    if (cell?.type === 'radio' && !cell?.hidden) {
      enhanceRadio.call(this, cell, radios);
      this.trigger('cell-edited', undefined, undefined, undefined, cell);
    }
    // 只有当选中的是复选框组件时，才增强
    if (cell?.type === 'checkbox' && !cell?.hidden) {
      enhanceChcekbox.call(this, cell);
      this.trigger('cell-edited', undefined, undefined, undefined, cell);
    }
  }
}

// 当在单元格上点击鼠标时
/**
 * 覆盖层鼠标按下事件。
 * @ignore
 * @param evt
 */
function overlayerMousedown(evt) {
  const { selector, data, table, sortFilter } = this;
  if (data.settings.mode === 'read') return;

  const { offsetX, offsetY } = evt;
  const isAutofillEl = evt.target.className === `${cssPrefix}-selector-corner`;
  const cellRect = data.getCellRectByXY(offsetX, offsetY);
  const { left, top, width, height } = cellRect;
  let { ri, ci } = cellRect;

  // 填报模式点击 修改cell 属性直接渲染table
  if (data.settings.mode === 'fill') {
    const cell = data.getCell(ri, ci);
    selector.set(ri, ci, true);
    this.trigger('cell-selected', cell, ri, ci);
    // 当单元格类型为radio, checkbox，且为单击事件时，触发单元格事件
    if (['radio', 'checkbox'].includes(cell?.type)) {
      postEnhance.call(this, { ...cell, ri, ci });
    } else {
      table.render();
    }
    return;
  }

  // sort or filter
  const { autoFilter } = data;
  if (autoFilter.includes(ri, ci)) {
    if (left + width - 20 < offsetX && top + height - 20 < offsetY) {
      const items = autoFilter.items(ci, (r, c) => data.rows.getCell(r, c));
      sortFilter.hide();
      sortFilter.set(ci, items, autoFilter.getFilter(ci), autoFilter.getSort(ci));
      sortFilter.setOffset({
        left,
        top: top + height + 2,
      });
      return;
    }
  }
  // debugger

  if (!evt.shiftKey) {
    if (isAutofillEl) {
      selector.showAutofill(ri, ci);
    } else {
      selectorSet.call(this, false, ri, ci);
      // 当单元格类型为radio, checkbox，且为单击事件时，触发单元格事件
      const cell = data.getCell(ri, ci);
      if (['radio', 'checkbox'].includes(cell?.type)) {
        postEnhance.call(this, { ...cell, ri, ci });
      }
    }

    // 鼠标按下时的鼠标move事件，拖动选择
    mouseMoveUp(
      window,
      (e) => {
        ({ ri, ci } = data.getCellRectByXY(e.offsetX, e.offsetY));
        if (isAutofillEl) {
          selector.showAutofill(ri, ci);
        } else if (e.buttons === 1 && !e.shiftKey) {
          selectorSet.call(this, true, ri, ci, true, true);
        }
      },
      () => {
        if (isAutofillEl && selector.arange && data.settings.mode !== 'read') {
          if (data.autofill(selector.arange, 'all', (msg) => xtoast('Tip', msg))) {
            table.render();
          }
        }
        selector.hideAutofill();
        // eslint-disable-next-line no-use-before-define
        toolbarChangePaintformatPaste.call(this);
      }
    );
  }

  if (!isAutofillEl && evt.buttons === 1) {
    if (evt.shiftKey) {
      selectorSet.call(this, true, ri, ci);
    }
  }
}

/**
 * 编辑层偏移
 * @ignore
 */
function editorSetOffset() {
  const { editor, data } = this;
  const sOffset = data.getSelectedRect();
  const tOffset = this.getTableOffset();
  let sPosition = 'top';
  if (sOffset.top > tOffset.height / 2) {
    sPosition = 'bottom';
  }
  editor.setOffset(sOffset, sPosition);
}

/**
 * 编辑层设定。
 * @ignore
 */
function editorSet() {
  const { editor, data } = this;
  if (data.settings.mode === 'read') return;

  // 隐藏内容的单元格禁止编辑
  const selectedCell = data.getSelectedCell();
  if (selectedCell && selectedCell.hidden) {
    return;
  }
  // 填报模式支持的数据格式列表
  const typeList = ['number', 'date', 'select'];
  if (data.settings.mode === 'edit' || (selectedCell && selectedCell.type && typeList.includes(selectedCell.type))) {
    editorSetOffset.call(this);
    editor.setCell(selectedCell, data.getSelectedValidator());
    clearClipboard.call(this);
  }
}
/**
 * 垂直滚动条拖动事件。<br>
 * 在这里要调用几个方法，以避免滚动后样式错乱。<br>
 * 比如：<br>
 * 如果不调用 selector.resetBRLAreaOffset()，垂直滚动时，将导致单击选中的单元格固定而无垂直滚动效果；<br>
 * 如果不调用 editorSetOffset.call(this)，垂直滚动时，将导致双击选中的编辑单元格固定而无垂直滚动效果；<br>
 * 如果不调用 table.render()，垂直滚动时，将导致表格固定无垂直滚动效果。<br>
 * @ignore
 * @param distance
 */
function verticalScrollbarMove(distance) {
  const { data, table, selector } = this;
  data.scrolly(distance, () => {
    selector.resetBRLAreaOffset();
    editorSetOffset.call(this);
    table.render();
  });
}

/**
 * 水平滚动条拖动事件。<br>
 * 在这里要调用几个方法，以避免滚动后样式错乱。<br>
 * 比如：<br>
 * 如果不调用 selector.resetBRLAreaOffset()，水平滚动时，将导致单击选中的单元格固定而无水平滚动效果；<br>
 * 如果不调用 editorSetOffset.call(this)，水平滚动时，将导致双击选中的编辑单元格固定而无水平滚动效果；<br>
 * 如果不调用 widgetSetOffset.call(this)，水平滚动时，将导致扩展的组件元素固定而无水平滚动效果；<br>
 * 如果不调用 table.render()，水平滚动时，将导致表格固定无水平滚动效果。<br>
 * @ignore
 * @param distance
 */
function horizontalScrollbarMove(distance) {
  const { data, table, selector } = this;
  data.scrollx(distance, () => {
    selector.resetBRTAreaOffset();
    editorSetOffset.call(this);
    table.render();
  });
}

/**
 * 行标尺拖动结束事件，即把行拖高或低
 * @ignore
 * @param cRect
 * @param distance
 */
function rowResizerFinished(cRect, distance) {
  const { ri } = cRect;
  const { table, selector, data } = this;
  const { sri, eri } = selector.range;
  if (ri >= sri && ri <= eri) {
    for (let row = sri; row <= eri; row += 1) {
      data.rows.setHeight(row, distance);
    }
  } else {
    data.rows.setHeight(ri, distance);
  }

  table.render();
  selector.resetAreaOffset();
  verticalScrollbarSet.call(this);
  editorSetOffset.call(this);
}

/**
 * 列标尺拖动结束事件。
 * @ignore
 * @param cRect
 * @param distance
 */
function colResizerFinished(cRect, distance) {
  const { ci } = cRect;
  const { table, selector, data } = this;
  const { sci, eci } = selector.range;
  if (ci >= sci && ci <= eci) {
    for (let col = sci; col <= eci; col += 1) {
      data.cols.setWidth(col, distance);
    }
  } else {
    data.cols.setWidth(ci, distance);
  }

  table.render();
  selector.resetAreaOffset();
  horizontalScrollbarSet.call(this);
  editorSetOffset.call(this);
}

/**
 * 设置 data，并重新刷新表格。
 * 在这里对原方法进行修改，原方法中，第1个参数为字符串 text，而我们扩展之后，单纯地字符串已经无法装载我们所需要的数据，故我们把它扩展为一个对象。
 * 但为了兼容原方法，稍加判断。
 * @ignore
 * @param cell
 * @param state
 */
function dataSetCellText(cell, state = 'finished') {
  const { data, table } = this;
  if (data.settings.mode === 'read') {
    return;
  }

  let text = cell;
  let value = '';
  if ({}.toString.call(cell).slice(-7, -1) === 'Object') {
    text = cell.text;
    value = cell.value;
  }

  // 当单元格为级联组件时，修改自身单元格的值后会影响其它单元格的状态。
  // 比如当省级单元格修改后，市县村等其它单元格的状态应该变为空。
  // 因为没有更好的办法实现监听，在这里把最终的数据结构直接构造好，然后重新渲染一下表格。
  data.setSelectedCellText(text, state, value); // 只设置单元格的值

  // 后置增强
  postEnhance.call(this, cell);

  const { ri, ci } = data.selector;
  if (state === 'finished') {
    table.render();
  } else {
    this.trigger('cell-edited', text, ri, ci, cell);
  }
}

/**
 * 实现表格的功能的整合。
 * @ignore
 * @param type
 * @param value
 */
function insertDeleteRowColumn(type, value) {
  const { data } = this;
  if (data.settings.mode !== 'edit') {
    return;
  }
  switch (type) {
    case 'insert-row':
      // 默认的插入行被扩展之后的可选择方向与行数的插入行代替，故这里其实不再起作用。
      data.insert('row');
      break;
    case 'insert-row-above':
      data.insert('row', value, 'above');
      break;
    case 'insert-row-below':
      data.insert('row', value, 'below');
      break;
    case 'delete-row':
      data.delete('row', (msg) => xtoast('Tip', msg));
      break;
    case 'insert-column':
      // 默认的插入列被扩展之后的可选择方向与列数的插入列代替，故这里其实不再起作用。
      data.insert('column');
      break;
    case 'insert-column-left':
      data.insert('column', value, 'left');
      break;
    case 'insert-column-right':
      data.insert('column', value, 'right');
      break;
    case 'delete-column':
      data.delete('column');
      break;
    case 'delete-cell':
      data.deleteCell('all', (msg) => xtoast('Tip', msg));
      break;
    case 'delete-cell-format':
      data.deleteCell('format', (msg) => xtoast('Tip', msg));
      break;
    case 'delete-cell-text':
      data.deleteCell('text', (msg) => xtoast('Tip', msg));
      break;
    case 'cell-printable':
      data.setSelectedCellAttr('printable', true);
      break;
    case 'cell-non-printable':
      data.setSelectedCellAttr('printable', false);
      break;
    case 'cell-format':
      break;
    case 'cell-editable':
      data.setSelectedCellAttr('editable', true);
      break;
    case 'cell-non-editable':
      data.setSelectedCellAttr('editable', false);
      break;
    case 'cell-hidden':
      data.setSelectedCellAttr('hidden', true);
      break;
    case 'cell-no-hidden':
      data.setSelectedCellAttr('hidden', false);
      break;
    default:
      console.error('未支持的右键菜单：', type);
      break;
  }
  clearClipboard.call(this);
  sheetReset.call(this);
}

/**
 * 实现图片上传功能的整合。
 * @ignore
 * @param type
 */
async function uploadImage(type) {
  try {
    const blob = await fileOpen({
      description: 'Image files',
      mimeTypes: ['image/jpg', 'image/png', 'image/gif', 'image/webp'],
      extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    });
    // 将图片上传到指定的服务器。
    const { data } = this;
    const { settings } = data;
    const { upload } = settings;
    const { url, method, name, success } = upload;

    const formData = new FormData();
    formData.append(name, blob);

    const response = await request({
      url,
      method,
      data: formData,
    });
    if (success && typeof success === 'function') {
      success(response);
    }
    const json = response.json();
    // 具体结构要后台接口提供。
    // const { code, message, data: imageUrl } = json;
    // if (code !== 0) {
    //   throw new Error(message);
    // }
    const { thumbUrl: imageUrl } = json;
    // 其实是设置该单元格 type: 'image'， value: imageUrl，在后面进行渲染。
    // 因为 setSelectedCellAttr 只能设置一个值，所以这里需要先设置 type，再设置 value。
    // 因为原渲染内容使用 text，我们即需要地址，又不像渲染 text，所以使用 value。
    data.setSelectedCellAttr('type', 'image' || type); // 设置类型，方便后面的渲染。
    data.setSelectedCellAttr('value', imageUrl); // 设置图片地址。方面后面使用地址渲染。
    sheetReset.call(this);
  } catch (e) {
    console.error(e);
  }
}

/**
 * 工具栏事件。
 * @ignore
 * @param type 触发事件的按钮类型
 * @param value
 */
function toolbarChange(type, value) {
  const { data } = this;
  switch (type) {
    case 'download':
      this.download();
      break;
    case 'undo':
      this.undo();
      break;
    case 'redo':
      this.redo();
      break;
    case 'print':
      this.print.preview();
      break;
    case 'paintformat':
      if (value === true) {
        copy.call(this);
      } else {
        clearClipboard.call(this);
      }
      break;
    case 'clearformat':
      insertDeleteRowColumn.call(this, 'delete-cell-format');
      break;
    case 'link':
      break;
    case 'chart':
      uploadImage.call(this, type);
      break;
    case 'autofilter':
      autofilter.call(this);
      break;
    case 'freeze':
      if (value) {
        const { ri, ci } = data.selector;
        this.freeze(ri, ci);
      } else {
        this.freeze(0, 0);
      }
      break;
    default:
      data.setSelectedCellAttr(type, value);
      // 如果是格式化为数值，则将小数位默认为2位
      // 因为有可能在”单元格设置“中将默认2位设置成其它值了，故在这里也还原一下了。
      if (value === 'number') {
        data.setSelectedCellAttr('decimalPlaces', 2);
      }
      if (type === 'formula' && !data.selector.multiple()) {
        editorSet.call(this);
      }
      sheetReset.call(this);
  }
}

function formatChange(args) {
  const { tag, decimalPlaces, percentPlaces, dateFormat } = args;
  if (!tag) {
    return;
  }
  switch (tag) {
    case 'number':
      // 在原有代码基础上设置格式类型
      this.data.setSelectedCellAttr('format', tag);
      // 添加一个新属性
      this.data.setSelectedCellAttr('decimalPlaces', decimalPlaces);
      // 上面设置完成后，在渲染单元格时获取这些值，格式化页面的显示。具体可参考 table.je L:89
      break;
    case 'percent':
      this.data.setSelectedCellAttr('format', tag);
      this.data.setSelectedCellAttr('percentPlaces', percentPlaces);
      break;
    case 'date':
      this.data.setSelectedCellAttr('format', tag);
      this.data.setSelectedCellAttr('dateFormat', dateFormat);
      break;
    default:
  }

  sheetReset.call(this);
}

/**
 * 筛选发生改变事件。
 * @ignore
 * @param ci
 * @param order
 * @param operator
 * @param value
 */
function sortFilterChange(ci, order, operator, value) {
  this.data.setAutoFilter(ci, order, operator, value);
  sheetReset.call(this);
}

/**
 * 初始化表格事件。<br>
 *
 * MouseEvent.button只读属性，它返回一个值，代表用户按下并触发了事件的鼠标按键。<br>
 * 这个属性只能够表明在触发事件的单个或多个按键下或释放过程中哪些按键按下了。因些，它对判断 mouseenter,mouseleave,mouseover,mouseout,mousemove<br>
 * 这些事件并不可靠。<br>
 * 用户可能会改变鼠标按键的配置，因此当一个事件的 MouseEvent.button 值为0时，它可能不是由物理上设备最左边的按键触发的。<br>
 * 但是对于一个标准按键布局的鼠标来说就会是左键。<br>
 * 0: 主按键，通常指鼠标左键或默认值<br>
 * 1: 辅助按键，通常指鼠标滚轮中键<br>
 * 2: 次按键，通常指鼠标右键<br>
 * 3: 第四个按钮，通常指浏览器后退按钮<br>
 * 4: 第五个按钮，通常指浏览器前进按钮<br>
 * 对于配置为左手使用的鼠标，按键操作将正好相反。此种情况下，从右至左读取值。<br>
 * <br>
 * MouseEvent.buttons只读属性，指示事件触发时哪些鼠标按键被按下。<br>
 * 每一个按键都有一个给定的数表示。如果同时多个按键被按下，buttons的值为各键的对应值做加计算（+）后的值。<br>
 * 0: 没有按键或者没有初始化<br>
 * 1: 鼠标左键<br>
 * 2: 鼠标右键<br>
 * 4: 鼠标滚轮或者中键<br>
 * 8: 第四按键（通常是浏览器后退按键）<br>
 * 16: 第五按键（通常是浏览器前进按键）<br>
 * <br>
 * UIEvent.detail只读属性，当值为非空的时候，提供当前点击数（和环境有关）<br>
 * 对 click 或者 dblclick 事件，UIEvent.detail 是当前点击数量。<br>
 * 对 mousedown 或者 mouseup 事件，UIEvent.detail 是1加上当前点击数。<br>
 * 对所有的其它 UIEvent 对象，UIEvent.detail 总是零。<br>
 * @ignore
 *
 */
function sheetInitEvents() {
  const {
    data,
    selector,
    overlayerEl,
    rowResizer,
    colResizer,
    verticalScrollbar,
    horizontalScrollbar,
    editor,
    contextmenu,
    toolbar,
    modalValidation,
    modalFormat,
    modalProperty,
    sortFilter,
    mode,
  } = this;
  // 覆盖层绑定事件
  overlayerEl
    .on('mousemove', (evt) => {
      if (mode !== 'edit') return;
      overlayerMousemove.call(this, evt);
    })
    .on('mousedown', (evt) => {
      editor.clear();
      contextmenu.hide();
      // the left mouse button: mousedown -> mouseup -> click
      // the right mouse button: mousedown -> contextmenu -> mouseup
      if (evt.buttons === 2) {
        if (mode !== 'edit') return; // 非设计模式，屏蔽鼠标右键事件
        // 计算一下当前坐标区域，因为右键菜单增加了一个设置行高列宽的功能，需要使用它。
        this.currrentRect = data.getCellRectByXY(evt.offsetX, evt.offsetY);
        // 鼠标右键逻辑
        if (this.data.xyInSelectedRect(evt.offsetX, evt.offsetY)) {
          contextmenu.setPosition(evt.offsetX, evt.offsetY);
        } else {
          // 如果点击事件坐标不在激活单元格中，则重新定位当前单元格坐标
          overlayerMousedown.call(this, evt);
          contextmenu.setPosition(evt.offsetX, evt.offsetY);
        }
        evt.stopPropagation();
      } else if (evt.detail === 2) {
        // 双击逻辑
        if (mode === 'edit') {
          editorSet.call(this);
        }
      } else {
        // 单击逻辑
        // 扩展添加组件之后，只能把响应组件的逻辑放到单击事件中去判断了。
        overlayerMousedown.call(this, evt);
      }
    })
    .on('mousewheel.stop', (evt) => {
      overlayerMousescroll.call(this, evt);
    })
    .on('mouseout', (evt) => {
      const { offsetX, offsetY } = evt;
      if (offsetY <= 0) {
        colResizer.hide();
      }
      if (offsetX <= 0) {
        rowResizer.hide();
      }
    })
    .on('drop', (evt) => {
      evt.preventDefault();
      overlayerMouseDrop.call(this, evt);
    });

  selector.inputChange = (v) => {
    dataSetCellText.call(this, v, 'input');
    editorSet.call(this);
  };

  // slide on mobile
  bindTouch(overlayerEl.el, {
    move: (direction, d) => {
      overlayerTouch.call(this, direction, d);
    },
  });

  // toolbar change
  // 将真正的事件传递进工具栏中。
  toolbar.change = (type, value) => toolbarChange.call(this, type, value);

  // sort filter ok
  sortFilter.ok = (ci, order, o, v) => sortFilterChange.call(this, ci, order, o, v);

  // resizer finished callback
  rowResizer.finishedFn = (cRect, distance) => {
    rowResizerFinished.call(this, cRect, distance);
  };
  colResizer.finishedFn = (cRect, distance) => {
    colResizerFinished.call(this, cRect, distance);
  };
  // resizer unhide callback
  // 将取消行方法注入标尺中。
  // 鼠标 mouseover 时，显示被隐藏行的 div，如果双击则显示被隐藏的行。
  rowResizer.unhideFn = (index) => {
    unhideRowsOrCols.call(this, 'row', index);
  };
  // 将取消列方法注入标尺中。
  // 鼠标 mouseover 时，显示被隐藏列的 div，如果双击则显示被隐藏的列。
  colResizer.unhideFn = (index) => {
    unhideRowsOrCols.call(this, 'col', index);
  };
  // scrollbar move callback
  // 将滚动条拖动事件注入垂直滚动条对象中。
  verticalScrollbar.moveFn = (distance, evt) => {
    verticalScrollbarMove.call(this, distance, evt);
    // this.tableBtnLayer.offset()
  };
  // 将滚动条拖动事件注入水平滚动条对象中。
  horizontalScrollbar.moveFn = (distance, evt) => {
    horizontalScrollbarMove.call(this, distance, evt);
  };
  // editor
  // 将事件注入编辑实例对象中
  editor.change = (state, cell) => {
    dataSetCellText.call(this, cell, state);
  };
  // modal validation
  modalValidation.change = (action, ...args) => {
    if (action === 'save') {
      this.data.addValidation(...args);
    } else {
      this.data.removeValidation();
    }
  };
  // modal format
  modalFormat.change = (action, value) => {
    if (action === 'save') {
      // 在这里有多种方式，一种方式是修改 setSelectedCellAttr 的实现；
      // 另一种是可以多次调用 setSelectedCellAttr 。
      // 为了兼容源码……，好吧，因为懒。
      formatChange.call(this, value);
    }
  };
  // contextmenu
  // type 为菜单项的类型，value 为带输入框菜单项的输入值
  contextmenu.itemClick = (type, value) => {
    // console.log('type:', type);
    const { currrentRect } = this;
    switch (type) {
      case 'cell-slash':
        slash.call(this, true);
        break;
      case 'cell-non-slash':
        slash.call(this, false);
        break;
      case 'validation':
        // 因为是直接调用了相关方法，故也在此直接判断是否启用
        if (this.data.settings.mode === 'edit') {
          // console.log(this.data.getSelectedValidation())
          modalValidation.setValue(this.data.getSelectedValidation());
        }
        break;
      case 'copy':
        copy.call(this);
        break;
      case 'cut':
        cut.call(this);
        break;
      case 'paste':
        paste.call(this, 'all');
        break;
      case 'paste-value':
        paste.call(this, 'text');
        break;
      case 'paste-format':
        paste.call(this, 'format');
        break;
      case 'hide':
        hideRowsOrCols.call(this);
        break;
      case 'cell-format':
        if (this.data.settings.mode === 'edit') {
          modalFormat.setValue(this.data.getSelectedCell());
        }
        break;
      case 'row-height':
        rowResizerFinished.call(this, currrentRect, value);
        break;
      case 'col-width':
        colResizerFinished.call(this, currrentRect, value);
        break;
      case 'property':
        modalProperty.setValue(this.data.getSelectedCell());
        break;
      default:
        insertDeleteRowColumn.call(this, type, value);
    }
  };

  // 自定义一个方法，实现对 div 尺寸变化的监听。
  bindResize(
    '.mypandora-spreadsheet',
    debounce(() => {
      this.reload();
    }, 300)
  );

  bind(
    window,
    'resize',
    debounce(() => {
      this.reload();
    }, 300)
  );

  bind(window, 'click', (evt) => {
    this.focusing = overlayerEl.contains(evt.target);
  });

  bind(window, 'paste', (evt) => {
    if (!this.focusing) return;
    paste.call(this, 'all', evt);
    evt.preventDefault();
  });

  bind(window, 'copy', (evt) => {
    if (!this.focusing) return;
    copy.call(this, evt);
    evt.preventDefault();
  });

  // for selector
  bind(window, 'keydown', (evt) => {
    if (!this.focusing) return;
    const keyCode = evt.keyCode || evt.which;
    const { key, ctrlKey, shiftKey, metaKey } = evt;
    // console.log('keydown.evt: ', keyCode);
    if (ctrlKey || metaKey) {
      // const { sIndexes, eIndexes } = selector;
      // let what = 'all';
      // if (shiftKey) what = 'text';
      // if (altKey) what = 'format';
      switch (keyCode) {
        case 90:
          // undo: ctrl + z
          this.undo();
          evt.preventDefault();
          break;
        case 89:
          // redo: ctrl + y
          this.redo();
          evt.preventDefault();
          break;
        case 67:
          // ctrl + c
          // => copy
          // copy.call(this);
          // evt.preventDefault();
          break;
        case 88:
          // ctrl + x
          cut.call(this);
          evt.preventDefault();
          break;
        case 85:
          // ctrl + u
          toolbar.trigger('underline');
          evt.preventDefault();
          break;
        case 86:
          // ctrl + v
          // => paste
          // evt.preventDefault();
          break;
        case 37:
          // ctrl + left
          selectorMove.call(this, shiftKey, 'row-first');
          evt.preventDefault();
          break;
        case 38:
          // ctrl + up
          selectorMove.call(this, shiftKey, 'col-first');
          evt.preventDefault();
          break;
        case 39:
          // ctrl + right
          selectorMove.call(this, shiftKey, 'row-last');
          evt.preventDefault();
          break;
        case 40:
          // ctrl + down
          selectorMove.call(this, shiftKey, 'col-last');
          evt.preventDefault();
          break;
        case 32:
          // ctrl + space, all cells in col
          selectorSet.call(this, false, -1, this.data.selector.ci, false);
          evt.preventDefault();
          break;
        case 66:
          // ctrl + B
          toolbar.trigger('bold');
          break;
        case 73:
          // ctrl + I
          toolbar.trigger('italic');
          break;
        default:
          break;
      }
    } else {
      // console.log('evt.keyCode:', evt.keyCode);
      switch (keyCode) {
        case 32:
          if (shiftKey) {
            // shift + space, all cells in row
            selectorSet.call(this, false, this.data.selector.ri, -1, false);
          }
          break;
        case 27: // esc
          contextmenu.hide();
          clearClipboard.call(this);
          break;
        case 37: // left
          selectorMove.call(this, shiftKey, 'left');
          evt.preventDefault();
          break;
        case 38: // up
          selectorMove.call(this, shiftKey, 'up');
          evt.preventDefault();
          break;
        case 39: // right
          selectorMove.call(this, shiftKey, 'right');
          evt.preventDefault();
          break;
        case 40: // down
          selectorMove.call(this, shiftKey, 'down');
          evt.preventDefault();
          break;
        case 9: // tab
          editor.clear();
          // shift + tab => move left
          // tab => move right
          selectorMove.call(this, false, shiftKey ? 'left' : 'right');
          evt.preventDefault();
          break;
        case 13: // enter
          editor.clear();
          // shift + enter => move up
          // enter => move down
          selectorMove.call(this, false, shiftKey ? 'up' : 'down');
          evt.preventDefault();
          break;
        case 8: // backspace
          insertDeleteRowColumn.call(this, 'delete-cell-text');
          evt.preventDefault();
          break;
        default:
          break;
      }

      if (key === 'Delete') {
        insertDeleteRowColumn.call(this, 'delete-cell-text');
        evt.preventDefault();
      } else if (
        (keyCode >= 65 && keyCode <= 90) ||
        (keyCode >= 48 && keyCode <= 57) ||
        (keyCode >= 96 && keyCode <= 105) ||
        evt.key === '='
      ) {
        if (canWrite.call(this, evt)) {
          dataSetCellText.call(this, evt.key, 'input');
          editorSet.call(this);
        }
      } else if (keyCode === 113) {
        // F2
        editorSet.call(this);
      }
    }
  });
}

/**
 * 重中之重，负责整个表格的渲染：工具栏、表格、底部状态栏、绑定事件等等
 */
class Sheet {
  /**
   * @hideconstructor
   * @param targetEl 目标 element
   * @param {DataProxy} data 一般初始化各组件时都会传递 DataProxy 实例，以方便调用挂载在其上的各种方法。可以把它理解为Vuex或者Redux。
   */
  constructor(targetEl, data) {
    // 为表格添加事件监听功能
    this.eventMap = createEventEmitter();
    // 初始化表格各部分
    const { view, showToolbar, showContextmenu, mode, hideContextmenuItem } = data.settings;

    this.el = h('div', `${cssPrefix}-sheet`);
    this.toolbar = new Toolbar(data, view.width, !showToolbar);
    this.print = new Print(data);
    targetEl.children(this.toolbar.el, this.el, this.print.el);

    this.data = data;
    this.mode = mode;
    // table
    this.tableEl = h('canvas', `${cssPrefix}-table`);
    // resizer
    this.rowResizer = new Resizer(false, data.rows.minHeight); // 纵向
    this.colResizer = new Resizer(true, data.cols.minWidth);

    // scrollbar
    this.verticalScrollbar = new Scrollbar(true);
    this.horizontalScrollbar = new Scrollbar(false);
    // editor
    this.editor = new Editor(BASE_FORMULAS, () => this.getTableOffset(), data.rows.height);
    // data validation
    this.modalValidation = new ModalValidation();
    // data format
    this.modalFormat = new ModalFormat();
    // cell property
    this.modalProperty = new ModalProperty();
    // contextmenu
    this.contextmenu = new Contextmenu(() => this.getRect(), !showContextmenu, hideContextmenuItem);
    // selector
    this.selector = new Selector(data);
    this.overlayerContentEl = h('div', `${cssPrefix}-overlayer-content`).children(this.editor.el, this.selector.el);
    this.overlayerEl = h('div', `${cssPrefix}-overlayer`).child(this.overlayerContentEl);

    // sortFilter
    this.sortFilter = new SortFilter();
    // root element
    this.el.children(
      this.tableEl,
      this.overlayerEl.el,
      this.rowResizer.el,
      this.colResizer.el,
      this.verticalScrollbar.el,
      this.horizontalScrollbar.el,
      this.contextmenu.el,
      this.modalValidation.el,
      this.modalFormat.el,
      this.modalProperty.el,
      this.sortFilter.el
    );
    // table
    this.table = new Table(this.tableEl.el, data);
    sheetInitEvents.call(this);
    sheetReset.call(this);
    // init selector [0, 0]
    selectorSet.call(this, false, 0, 0);
  }

  /**
   * 可以通过实例化后的 Sheet 实例调用，绑定事件函数
   * @param eventName
   * @param func
   * @returns {Sheet}
   */
  on(eventName, func) {
    this.eventMap.on(eventName, func);
    return this;
  }

  /**
   * 可以通过实例化后的 Sheet 实例调用，监听触发函数
   * @param {string} eventName 事件名称
   * @param args
   */
  trigger(eventName, ...args) {
    const { eventMap } = this;
    eventMap.fire(eventName, args);
  }

  /**
   * 可以通过实例化后的 Sheet 实例调用，重置刷新表格。
   * @param {DataProxy} data 代理类实例
   */
  resetData(data) {
    // before
    this.editor.clear();
    // after
    this.data = data;
    verticalScrollbarSet.call(this);
    horizontalScrollbarSet.call(this);
    this.toolbar.resetData(data);
    this.print.resetData(data);
    this.selector.resetData(data);
    this.editor.resetData(data);
    this.table.resetData(data);
  }

  /**
   * 可以通过实例化后的 Sheet 实例调用，加载必要数据
   * @param data
   * @returns {Sheet}
   */
  loadData(data) {
    this.data.setData(data);
    sheetReset.call(this);
    return this;
  }

  // freeze rows or cols
  /**
   * 可以通过实例化后的 Sheet 实例调用，设定冻结行/列
   * @param ri
   * @param ci
   * @returns {Sheet}
   */
  freeze(ri, ci) {
    const { data } = this;
    data.setFreeze(ri, ci);
    sheetReset.call(this);
    return this;
  }

  /**
   * 撤销函数
   */
  undo() {
    this.data.undo();
    sheetReset.call(this);
  }

  /**
   * 重做函数
   */
  redo() {
    this.data.redo();
    sheetReset.call(this);
  }

  /**
   * 重新加载表格，初始化事件等
   * @returns {Sheet}
   */
  reload() {
    sheetReset.call(this);
    return this;
  }

  /**
   * 获得当前表格的宽和高
   * width: 不包括垂直滚动条（如果有的话）
   * height: 不包括工具栏、底部状态栏、水平滚动条（如果有的话）
   * @returns {{width, height: number}}
   */
  getRect() {
    const { data } = this;
    return {
      width: data.viewWidth(),
      height: data.viewHeight(),
    };
  }

  /**
   * 获得当前 sheet 的宽度、高度和偏移量
   * width: 不包含 index 索引列，即最左侧 1、2、3... 列
   * height: 不包含 title 行，即 最上面 A、B、C... 行
   * left: 左偏移量
   * top: 顶偏移量
   * @returns {{top, left: (number|*), width: number, height: number}}
   */
  getTableOffset() {
    const {
      rows,
      cols,
      settings: { scale },
    } = this.data;
    const { width, height } = this.getRect();
    return {
      width: width - Math.floor(cols.indexWidth * scale),
      height: height - Math.floor(rows.indexHeight * scale),
      left: Math.floor(cols.indexWidth * scale),
      top: Math.floor(rows.indexHeight * scale),
    };
  }
}

export default Sheet;
