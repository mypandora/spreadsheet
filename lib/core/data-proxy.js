import { t } from '../locale';
import helper from './helper';
import CellRange from './cell-range';
import { Rows } from './row';
import { Cols } from './col';
import Scroll from './scroll';
import Selector from './selector';
import { Merges } from './merge';
import { Validations } from './validation';
import AutoFilter from './auto-filter';
import Clipboard from './clipboard';
import History from './history';
import { expr2xy, xy2expr } from './alphabet';

const defaultSettings = {
  language: 'zh',
  mode: 'edit', // edit | read
  scale: 1, // 缩放比例
  // 配置上传
  upload: {
    url: '',
    method: 'POST',
    headers: {},
    params: {},
    name: 'file',
    success: () => {
      // console.log(res);
    },
  },
  // 配置远程搜索
  // 该配置其实与 upload.headers 重复。
  // 当我们设置了N多异步下拉框时，请求接口需要 token 认证，又不能在具体单元格中写死 token，因为会过期，所以在这里配置一下，每个下拉框都从初始配置中获取 token。
  remote: {
    headers: {},
  },
  view: {
    height: () => document.documentElement.clientHeight,
    width: () => document.documentElement.clientWidth,
  },
  showGrid: true,
  showToolbar: true,
  showContextmenu: true,
  hideContextmenuItem: [],
  showBottomBar: true,
  disableToolbar: [],
  row: {
    len: 100,
    height: 25,
    indexHeight: 25, // 索引行高度
  },
  col: {
    len: 26,
    width: 100,
    indexWidth: 60, // 索引列宽度
    minWidth: 60,
  },
  style: {
    bgcolor: '#ffffff',
    align: 'left',
    valign: 'middle',
    textwrap: false,
    strike: false,
    underline: false,
    color: '#0a0a0a',
    font: {
      name: '宋体',
      size: 10,
      bold: false,
      italic: false,
    },
    format: 'normal',
  },
};

const toolbarHeight = 41;
const bottombarHeight = 41;

// src: cellRange
// dst: cellRange
/**
 * 粘贴前调用，用以判断是否可以粘贴。
 * @ignore
 * @param {Object} src 由 cellRange 包装的对象，源单元格
 * @param {Object} dst 由 cellRange 包装的对象，目标单元格
 * @param {function} error 错误回调 当目标单元格包含 merge 时调用
 * @returns {boolean} 是否可以粘贴
 */
function canPaste(src, dst, error = () => {}) {
  const { merges } = this;
  const cellRange = dst.clone();
  const [srn, scn] = src.size();
  const [drn, dcn] = dst.size();
  if (srn > drn) {
    cellRange.eri = dst.sri + srn - 1;
  }
  if (scn > dcn) {
    cellRange.eci = dst.sci + scn - 1;
  }
  if (merges.intersects(cellRange)) {
    error(t('error.pasteForMergedCell'));
    return false;
  }
  return true;
}

/**
 * 粘贴复制的单元格时使用，用以将源单元格复制到目标单元格。
 * @ignore
 * @param {Object} srcCellRange 由 cellRange 包装的对象，源单元格
 * @param {Object} dstCellRange 由 cellRange 包装的对象，目标单元格
 * @param {string} what 复制条件 all 全部 | format 仅格式
 * @param {boolean} autofill 是否自动填充，默认 false
 */
function copyPaste(srcCellRange, dstCellRange, what, autofill = false) {
  // console.log(srcCellRange, dstCellRange)
  const { rows, merges } = this;
  // delete dest merge
  if (what === 'all' || what === 'format') {
    rows.deleteCells(dstCellRange, what);
    merges.deleteWithin(dstCellRange);
  }
  rows.copyPaste(srcCellRange, dstCellRange, what, autofill, (ri, ci, cell) => {
    if (cell && cell.merge) {
      // 执行合并
      const [rn, cn] = cell.merge;
      if (rn <= 0 && cn <= 0) {
        return;
      }
      merges.add(new CellRange(ri, ci, ri + rn, ci + cn));
    }
  });
}

/**
 * 粘贴剪切的单元格时使用，用以将源单元格复制到目标单元格。
 * @ignore
 * @param {Object} srcCellRange 由 cellRange 包装的对象，源单元格
 * @param {Object} destCellRange 由 cellRange 包装的对象，目标单元格
 */
function cutPaste(srcCellRange, destCellRange) {
  const { clipboard, rows, merges } = this;

  rows.cutPaste(srcCellRange, destCellRange);
  merges.move(srcCellRange, destCellRange.sri - srcCellRange.sri, destCellRange.sci - srcCellRange.sci);
  clipboard.clear();
}
// bss: { top, bottom, left, right }
/**
 * 设置指定的单元格边框。
 * @ignore
 * @param {number} ri 行下标
 * @param {number} ci 列下标
 * @param {Object} bss 边框样式
 */
function setStyleBorder(ri, ci, bss) {
  const { styles, rows } = this;
  const cell = rows.getCellOrNew(ri, ci);
  let cstyle = {};
  if (cell.style !== undefined) {
    cstyle = helper.cloneDeep(styles[cell.style]);
  }
  cstyle = helper.merge(cstyle, { border: bss });
  cell.style = this.addStyle(cstyle);
}

/**
 * 根据当前选区（this.selector）批量设置多个单元格的边框
 * @ignore
 * @param {Object} selector
 * @param {string} selector.mode all, inside, outside, horizontal, vertical, none, nonleft, nontop, nonright, nonbottom
 * @param {string} selector.style 边框样式
 * @param {string} selector.color 边框样式
 */
function setStyleBorders({ mode, style, color }) {
  const { styles, selector, rows } = this;
  const { sri, sci, eri, eci } = selector.range;
  const multiple = !this.isSingleSelected();
  if (!multiple) {
    if (mode === 'inside' || mode === 'horizontal' || mode === 'vertical') {
      return;
    }
  }
  if (mode === 'outside' && !multiple) {
    setStyleBorder.call(this, sri, sci, {
      top: [style, color],
      bottom: [style, color],
      left: [style, color],
      right: [style, color],
    });
  } else if (mode === 'none') {
    selector.range.each((ri, ci) => {
      const cell = rows.getCell(ri, ci);
      if (cell && cell.style !== undefined) {
        const ns = helper.cloneDeep(styles[cell.style]);
        delete ns.border;
        // ['bottom', 'top', 'left', 'right'].forEach((prop) => {
        //   if (ns[prop]) delete ns[prop];
        // });
        cell.style = this.addStyle(ns);
      }
    });
  } else if (
    mode === 'all' ||
    mode === 'inside' ||
    mode === 'outside' ||
    mode === 'horizontal' ||
    mode === 'vertical'
  ) {
    const merges = [];
    for (let ri = sri; ri <= eri; ri += 1) {
      for (let ci = sci; ci <= eci; ci += 1) {
        // jump merges -- start
        const mergeIndexes = [];
        for (let ii = 0; ii < merges.length; ii += 1) {
          const [mri, mci, rn, cn] = merges[ii];
          if (ri === mri + rn + 1) mergeIndexes.push(ii);
          if (mri <= ri && ri <= mri + rn) {
            if (ci === mci) {
              ci += cn + 1;
              break;
            }
          }
        }
        mergeIndexes.forEach((it) => merges.splice(it, 1));
        if (ci > eci) break;
        // jump merges -- end
        const cell = rows.getCell(ri, ci);
        let [rn, cn] = [0, 0];
        if (cell && cell.merge) {
          [rn, cn] = cell.merge;
          merges.push([ri, ci, rn, cn]);
        }
        const mrl = rn > 0 && ri + rn === eri;
        const mcl = cn > 0 && ci + cn === eci;
        let bss = {};
        if (mode === 'all') {
          bss = {
            bottom: [style, color],
            top: [style, color],
            left: [style, color],
            right: [style, color],
          };
        } else if (mode === 'inside') {
          if (!mcl && ci < eci) bss.right = [style, color];
          if (!mrl && ri < eri) bss.bottom = [style, color];
        } else if (mode === 'horizontal') {
          if (!mrl && ri < eri) bss.bottom = [style, color];
        } else if (mode === 'vertical') {
          if (!mcl && ci < eci) bss.right = [style, color];
        } else if (mode === 'outside' && multiple) {
          if (sri === ri) bss.top = [style, color];
          if (mrl || eri === ri) bss.bottom = [style, color];
          if (sci === ci) bss.left = [style, color];
          if (mcl || eci === ci) bss.right = [style, color];
        }
        if (Object.keys(bss).length > 0) {
          setStyleBorder.call(this, ri, ci, bss);
        }
        ci += cn;
      }
    }
  } else if (mode === 'top' || mode === 'bottom') {
    for (let ci = sci; ci <= eci; ci += 1) {
      if (mode === 'top') {
        setStyleBorder.call(this, sri, ci, { top: [style, color] });
        ci += rows.getCellMerge(sri, ci)[1];
      }
      if (mode === 'bottom') {
        setStyleBorder.call(this, eri, ci, { bottom: [style, color] });
        ci += rows.getCellMerge(eri, ci)[1];
      }
    }
  } else if (mode === 'left' || mode === 'right') {
    for (let ri = sri; ri <= eri; ri += 1) {
      if (mode === 'left') {
        setStyleBorder.call(this, ri, sci, { left: [style, color] });
        ri += rows.getCellMerge(ri, sci)[0];
      }
      if (mode === 'right') {
        setStyleBorder.call(this, ri, eci, { right: [style, color] });
        ri += rows.getCellMerge(ri, eci)[0];
      }
    }
  } else if (mode === 'nonleft') {
    // TODO 有bug需要修改 扩展的快捷方式
    for (let ci = sci; ci <= eci; ci += 1) {
      setStyleBorder.call(this, sri, ci, { top: [style, color] });
      ci += rows.getCellMerge(sri, ci)[1];
      setStyleBorder.call(this, eri, ci, { bottom: [style, color] });
      ci += rows.getCellMerge(eri, ci)[1];
    }
    for (let ri = sri; ri <= eri; ri += 1) {
      setStyleBorder.call(this, ri, eci, { right: [style, color] });
      ri += rows.getCellMerge(ri, eci)[0];
    }
    // for (let ri = sri; ri <= eri; ri += 1) {
    //   setStyleBorder.call(this, ri, sci, { top: [style, color], right: [style, color], bottom: [style, color] });
    //   ri += rows.getCellMerge(ri, sci)[0];
    // }
  } else if (mode === 'nontop') {
    // 扩展的快捷方式
    for (let ci = sci; ci <= eci; ci += 1) {
      setStyleBorder.call(this, eri, ci, { bottom: [style, color] });
      ci += rows.getCellMerge(eri, ci)[1];
    }
    for (let ri = sri; ri <= eri; ri += 1) {
      setStyleBorder.call(this, ri, sci, { left: [style, color] });
      ri += rows.getCellMerge(ri, sci)[0];
      setStyleBorder.call(this, ri, eci, { right: [style, color] });
      ri += rows.getCellMerge(ri, eci)[0];
    }
    // for (let ri = sri; ri <= eri; ri += 1) {
    //   setStyleBorder.call(this, ri, sci, { right: [style, color], bottom: [style, color], left: [style, color] });
    //   ri += rows.getCellMerge(ri, sci)[0];
    // }
  } else if (mode === 'nonright') {
    // 扩展的快捷方式
    for (let ci = sci; ci <= eci; ci += 1) {
      setStyleBorder.call(this, sri, ci, { top: [style, color] });
      ci += rows.getCellMerge(sri, ci)[1];
      setStyleBorder.call(this, eri, ci, { bottom: [style, color] });
      ci += rows.getCellMerge(eri, ci)[1];
    }
    for (let ri = sri; ri <= eri; ri += 1) {
      setStyleBorder.call(this, ri, sci, { left: [style, color] });
      ri += rows.getCellMerge(ri, sci)[0];
    }
    // for (let ri = sri; ri <= eri; ri += 1) {
    //   setStyleBorder.call(this, ri, sci, { top: [style, color], bottom: [style, color], left: [style, color] });
    //   ri += rows.getCellMerge(ri, sci)[0];
    // }
  } else if (mode === 'nonbottom') {
    // 扩展的快捷方式
    for (let ci = sci; ci <= eci; ci += 1) {
      setStyleBorder.call(this, sri, ci, { top: [style, color] });
      ci += rows.getCellMerge(sri, ci)[1];
    }
    for (let ri = sri; ri <= eri; ri += 1) {
      setStyleBorder.call(this, ri, sci, { left: [style, color] });
      ri += rows.getCellMerge(ri, sci)[0];
      setStyleBorder.call(this, ri, eci, { right: [style, color] });
      ri += rows.getCellMerge(ri, eci)[0];
    }
    // for (let ri = sri; ri <= eri; ri += 1) {
    //   setStyleBorder.call(this, ri, sci, { top: [style, color], right: [style, color], left: [style, color] });
    //   ri += rows.getCellMerge(ri, sci)[0];
    // }
  }
}

/**
 * 根据 Y 坐标获取所在行的下标
 * @ignore
 * @param {number} y Y坐标
 * @param {number} scrollOffsetY 滚动条 Offset Y
 * @returns {Object} 带有 ri 行下标的对象
 */
function getCellRowByY(y, scrollOffsetY) {
  const { rows } = this;
  const fsh = this.freezeTotalHeight();
  let inits = rows.indexHeight;
  if (fsh + rows.indexHeight < y) {
    inits -= scrollOffsetY;
  }

  const frset = this.exceptRowSet;

  let ri = 0;
  let top = inits;
  let { height } = rows;
  for (; ri < rows.len; ri += 1) {
    if (top > y) {
      break;
    }
    if (!frset.has(ri)) {
      height = rows.getHeight(ri);
      top += height;
    }
  }
  top -= height;

  // 表示鼠标在 A B C D 行所在的位置，这时为了标尺功能正确，直接重置 top 为 0
  if (y <= rows.indexHeight) {
    top = 0;
  }

  if (top <= 0 && rows.indexHeight > 0) {
    return { ri: -1, top: 0, height: rows.indexHeight };
  }
  return { ri: ri - 1, top, height };
}

/**
 * 根据 X 坐标获取所在行的下标
 * @ignore
 * @param {number} x X坐标
 * @param {number} scrollOffsetX 滚动条 Offset X
 * @returns {Object} 带有 ri 行下标的对象
 */
function getCellColByX(x, scrollOffsetX) {
  const { cols } = this;
  const fsw = this.freezeTotalWidth();
  let inits = cols.indexWidth;
  if (fsw + cols.indexWidth < x) {
    inits -= scrollOffsetX;
  }
  const [ci, left, width] = helper.rangeReduceIf(0, cols.len, inits, cols.indexWidth, x, (i) => cols.getWidth(i));
  if (left <= 0 && cols.indexWidth > 0) {
    return { ci: -1, left: 0, width: cols.indexWidth };
  }
  return { ci: ci - 1, left, width };
}

/**
 * 代理类，封装一些实用方法。
 * @class
 */
class DataProxy {
  /**
   * @hideconstructor
   * @param {string} name 工作表名称
   * @param {Object} settings 配置项
   */
  constructor(name, settings) {
    this.settings = helper.merge(defaultSettings, settings || {});
    // save data begin
    this.name = name || 'sheet';
    this.freeze = [0, 0];
    this.styles = []; // Array<Style>
    this.merges = new Merges(); // [CellRange, ...]
    this.rows = new Rows(this.settings.row);
    this.cols = new Cols(this.settings.col);
    this.validations = new Validations();
    this.hyperlinks = {};
    this.comments = {};
    // save data end

    // don't save object
    this.selector = new Selector();
    this.scroll = new Scroll();
    this.history = new History();
    this.clipboard = new Clipboard();
    this.autoFilter = new AutoFilter();
    this.change = () => {};
    this.exceptRowSet = new Set();
    this.sortedRowMap = new Map();
    this.unsortedRowMap = new Map();
  }

  /**
   * 添加验证。
   * @param {string} mode 模式
   * @param {Object} ref 参考范围
   * @param {Object} validator 验证器
   */
  addValidation(mode, ref, validator) {
    this.changeData(() => {
      this.validations.add(mode, ref, validator);
    });
  }

  /**
   * 移除验证范围。
   */
  removeValidation() {
    const { range } = this.selector;
    this.changeData(() => {
      this.validations.remove(range);
    });
  }

  /**
   * 获得选中范围内的过滤或验证器。
   * @returns {object|null}
   */
  getSelectedValidator() {
    const { ri, ci } = this.selector;
    const v = this.validations.get(ri, ci);
    return v ? v.validator : null;
  }

  /**
   * 获得选中范围内的过滤或验证器的具体信息。
   * @returns {Object}
   */
  getSelectedValidation() {
    const { ri, ci, range } = this.selector;
    const v = this.validations.get(ri, ci);
    const ret = { ref: range.toString() };
    if (v !== null) {
      ret.mode = v.mode;
      ret.validator = v.validator;
    }
    return ret;
  }

  /**
   * 是否可以执行撤销操作。
   * @returns {boolean}
   */
  canUndo() {
    return this.history.canUndo();
  }

  /**
   * 是否可以执行重做操作。
   * @returns {boolean}
   */
  canRedo() {
    return this.history.canRedo();
  }

  /**
   * 撤销操作。
   */
  undo() {
    this.history.undo(this.getData(), (d) => {
      this.setData(d);
    });
  }

  /**
   * 重做操作。
   */
  redo() {
    this.history.redo(this.getData(), (d) => {
      this.setData(d);
    });
  }

  /**
   * 复制当前的选区。
   */
  copy() {
    this.clipboard.copy(this.selector.range);
    // console.log(this.selector.range)
  }

  /**
   * 复制到系统剪切板。复制文本以数组形式到剪切板
   * @param {Clipboard} evt ClipboardEvent
   */
  copyToSystemClipboard(evt) {
    let copyText = [];
    const { sri, eri, sci, eci } = this.selector.range;

    for (let ri = sri; ri <= eri; ri += 1) {
      const row = [];
      for (let ci = sci; ci <= eci; ci += 1) {
        const cell = this.getCell(ri, ci);
        row.push((cell && cell.text) || '');
      }
      copyText.push(row);
    }

    // console.log(copyText)

    // Adding \n and why not adding \r\n is to support online office and client MS office and WPS
    copyText = copyText.map((row) => row.join('\t')).join('\n');

    // why used this
    // cuz http protocol will be blocked request clipboard by browser
    if (evt) {
      // console.log(evt.clipboardData)
      evt.clipboardData.clearData();
      evt.clipboardData.setData('text/plain', copyText);
      evt.preventDefault();
    }

    // this need https protocol
    // global navigator
    if (navigator.clipboard) {
      navigator.clipboard.writeText(copyText).then(
        () => {},
        (err) => {
          console.error('text copy to the system clipboard error  ', copyText, err);
        }
      );
    }
  }

  /**
   * 剪切事件。
   */
  cut() {
    this.clipboard.cut(this.selector.range);
  }

  /**
   * 粘贴事件。
   * @param {string} what='all' all:所有，text:文字，format: 格式
   * @param {function} error 回调函数
   * @returns {boolean}
   */
  paste(what = 'all', error = () => {}) {
    const { clipboard, selector } = this;
    if (clipboard.isClear()) {
      return false;
    }
    if (!canPaste.call(this, clipboard.range, selector.range, error)) {
      return false;
    }

    this.changeData(() => {
      if (clipboard.isCopy()) {
        copyPaste.call(this, clipboard.range, selector.range, what);
      } else if (clipboard.isCut()) {
        cutPaste.call(this, clipboard.range, selector.range);
      }
    });
    return true;
  }

  pasteFromSystemClipboard(resetSheet, eventTrigger) {
    const { selector } = this;
    navigator.clipboard.readText().then((content) => {
      const contentToPaste = this.parseClipboardContent(content);
      let startRow = selector.ri;
      contentToPaste.forEach((row) => {
        let startColumn = selector.ci;
        row.forEach((cellContent) => {
          this.setCellText(startRow, startColumn, cellContent, 'input');
          startColumn += 1;
        });
        startRow += 1;
      });
      resetSheet();
      eventTrigger(this.rows.getData());
    });
  }

  parseClipboardContent(clipboardContent) {
    const parsedData = [];

    // first we need to figure out how many rows we need to paste
    const rows = clipboardContent.split('\n');

    // for each row parse cell data
    let i = 0;
    rows.forEach((row) => {
      parsedData[i] = row.split('\t');
      i += 1;
    });
    return parsedData;
  }

  /**
   * 粘贴文字。
   * @param {string} txt
   */
  pasteFromText(txt) {
    let lines = [];

    if (/\r\n/.test(txt)) lines = txt.split('\r\n').map((it) => it.replace(/"/g, '').split('\t'));
    else lines = txt.split('\n').map((it) => it.replace(/"/g, '').split('\t'));

    if (lines.length) {
      const { rows, selector } = this;

      this.changeData(() => {
        rows.paste(lines, selector.range);
      });
    }
  }

  /**
   * 自动填充。
   * @param {Object} cellRange
   * @param {string} what all:所有，text:文字，format: 格式
   * @param {function} error 回调函数
   * @returns {boolean}
   */
  autofill(cellRange, what, error = () => {}) {
    const srcRange = this.selector.range;
    if (!canPaste.call(this, srcRange, cellRange, error)) {
      return false;
    }
    this.changeData(() => {
      copyPaste.call(this, srcRange, cellRange, what, true);
    });
    return true;
  }

  /**
   * 清除剪切板数据。
   */
  clearClipboard() {
    this.clipboard.clear();
  }

  /**
   * 通过结束坐标计算选区范围。
   * @param {number} ri 行索引
   * @param {number} ci 列索引
   * @returns {CellRange}
   */
  calSelectedRangeByEnd(ri, ci) {
    const { selector, rows, cols, merges } = this;
    let { sri, sci, eri, eci } = selector.range;
    const cri = selector.ri;
    const cci = selector.ci;
    let [nri, nci] = [ri, ci];
    if (ri < 0) {
      nri = rows.len - 1;
    }
    if (ci < 0) {
      nci = cols.len - 1;
    }
    if (nri > cri) {
      [sri, eri] = [cri, nri];
    } else {
      [sri, eri] = [nri, cri];
    }
    if (nci > cci) {
      [sci, eci] = [cci, nci];
    } else {
      [sci, eci] = [nci, cci];
    }
    selector.range = merges.union(new CellRange(sri, sci, eri, eci));
    selector.range = merges.union(selector.range);
    return selector.range;
  }

  /**
   * 通过开始坐标计算选区范围。
   * @param {number} ri 行索引
   * @param {number} ci 列索引
   * @returns {CellRange}
   */
  calSelectedRangeByStart(ri, ci) {
    const { selector, rows, cols, merges } = this;
    let cellRange = merges.getFirstIncludes(ri, ci);
    // console.log('cellRange:', cellRange, ri, ci, merges);
    if (cellRange === null) {
      cellRange = new CellRange(ri, ci, ri, ci);
      if (ri === -1) {
        cellRange.sri = 0;
        cellRange.eri = rows.len - 1;
      }
      if (ci === -1) {
        cellRange.sci = 0;
        cellRange.eci = cols.len - 1;
      }
    }
    selector.range = cellRange;
    return cellRange;
  }

  /**
   * 计算选中单元格属性。
   * @param {string} property 属性名称
   * @param {Object} value 属性值
   */
  setSelectedCellAttr(property, value) {
    this.changeData(() => {
      const { selector, styles, rows } = this;
      if (property === 'merge') {
        if (value) this.merge();
        else this.unmerge();
      } else if (property === 'border') {
        setStyleBorders.call(this, value);
      } else if (property === 'formula') {
        // console.log('>>>', selector.multiple());
        const { ri, ci, range } = selector;
        if (selector.multiple()) {
          const [rn, cn] = selector.size();
          const { sri, sci, eri, eci } = range;
          if (rn > 1) {
            for (let i = sci; i <= eci; i += 1) {
              const cell = rows.getCellOrNew(eri + 1, i);
              cell.text = `=${value}(${xy2expr(i, sri)}:${xy2expr(i, eri)})`;
            }
          } else if (cn > 1) {
            const cell = rows.getCellOrNew(ri, eci + 1);
            cell.text = `=${value}(${xy2expr(sci, ri)}:${xy2expr(eci, ri)})`;
          }
        } else {
          const cell = rows.getCellOrNew(ri, ci);
          cell.text = `=${value}()`;
        }
      } else {
        selector.range.each((ri, ci) => {
          const cell = rows.getCellOrNew(ri, ci);
          let cstyle = {};
          if (cell.style !== undefined) {
            cstyle = helper.cloneDeep(styles[cell.style]);
          }
          if (property === 'format') {
            cstyle.format = value;
            cell.style = this.addStyle(cstyle);
          } else if (
            property === 'font-bold' ||
            property === 'font-italic' ||
            property === 'font-name' ||
            property === 'font-size'
          ) {
            const nfont = {};
            nfont[property.split('-')[1]] = value;
            cstyle.font = Object.assign(cstyle.font || {}, nfont);
            cell.style = this.addStyle(cstyle);
          } else if (
            property === 'strike' ||
            property === 'textwrap' ||
            property === 'underline' ||
            property === 'align' ||
            property === 'valign' ||
            property === 'color' ||
            property === 'bgcolor' ||
            property === 'slash'
          ) {
            cstyle[property] = value;
            cell.style = this.addStyle(cstyle);
          } else {
            cell[property] = value;
          }
        });
      }
    });
  }

  /**
   * 设置选中单元格文字。
   * @param {string} text 文本内容
   * @param {string} state='input' input | finished
   * @param {string} value 下拉选择值
   */
  setSelectedCellText(text, state = 'input', value = '') {
    const { autoFilter, selector, rows } = this;
    const { ri, ci } = selector;
    let nri = ri;
    if (this.unsortedRowMap.has(ri)) {
      nri = this.unsortedRowMap.get(ri);
    }
    const oldCell = rows.getCell(nri, ci);
    const oldText = oldCell ? oldCell.text : '';
    this.setCellText(nri, ci, text, state, value);
    // replace filter.value
    if (autoFilter.active()) {
      const filter = autoFilter.getFilter(ci);
      if (filter) {
        const vIndex = filter.value.findIndex((v) => v === oldText);
        if (vIndex >= 0) {
          filter.value.splice(vIndex, 1, text);
        }
      }
    }
  }

  /**
   * 获得当前选中单元格。
   * @returns {Object}
   */
  getSelectedCell() {
    const { ri, ci } = this.selector;
    let nri = ri;
    if (this.unsortedRowMap.has(ri)) {
      nri = this.unsortedRowMap.get(ri);
    }
    return this.rows.getCell(nri, ci);
  }

  /**
   * 判断当前鼠标点击坐标是否在选中范围内。
   * @param {number} x 鼠标X坐标值
   * @param {number} y 鼠标Y坐标值
   * @returns {boolean}
   */
  xyInSelectedRect(x, y) {
    const { left, top, width, height } = this.getSelectedRect();
    const x1 = x - this.cols.indexWidth;
    const y1 = y - this.rows.indexHeight;
    // console.log('x:', x, ',y:', y, 'left:', left, 'top:', top);
    return x1 > left && x1 < left + width && y1 > top && y1 < top + height;
  }

  /**
   * 获得选中的矩形区域。
   * @returns {Object}
   */
  getSelectedRect() {
    return this.getRect(this.selector.range);
  }

  /**
   * 获得当前剪切板选中区域。
   * @returns {Object}
   */
  getClipboardRect() {
    const { clipboard } = this;
    if (!clipboard.isClear()) {
      return this.getRect(clipboard.range);
    }
    return { left: -100, top: -100 };
  }

  /**
   * 获得设定选中范围区域。
   * @param {Object} cellRange
   * @returns {Object}
   */
  getRect(cellRange) {
    const {
      scroll,
      rows,
      cols,
      exceptRowSet,
      settings: { scale },
    } = this;
    const { sri, sci, eri, eci } = cellRange;
    if (sri < 0 && sci < 0) {
      return { left: 0, l: 0, top: 0, t: 0, scroll };
    }
    const left = cols.sumWidth(0, sci);
    const top = rows.sumHeight(0, sri, exceptRowSet);
    const height = rows.sumHeight(sri, eri + 1, exceptRowSet);
    const width = cols.sumWidth(sci, eci + 1);
    let left0 = left - scroll.x;
    let top0 = top - scroll.y;
    const fsh = this.freezeTotalHeight();
    const fsw = this.freezeTotalWidth();
    if (fsw > 0 && fsw > left) {
      left0 = left;
    }
    if (fsh > 0 && fsh > top) {
      top0 = top;
    }
    return {
      l: left * scale,
      t: top * scale,
      left: left0 * scale,
      top: top0 * scale,
      height: height * scale,
      width: width * scale,
      scroll,
    };
  }

  /**
   * 通过鼠标的 x 和 y 坐标,获得当前选中区域。
   * @param {number} x x 坐标
   * @param {number} y y 坐标
   * @returns {*}
   */
  getCellRectByXY(x, y) {
    const {
      scroll,
      merges,
      rows,
      cols,
      settings: { scale },
    } = this;
    let { ri, top, height } = getCellRowByY.call(this, Math.ceil(y / scale), scroll.y);
    let { ci, left, width } = getCellColByX.call(this, Math.ceil(x / scale), scroll.x);
    if (ci === -1) {
      width = cols.totalWidth();
    }
    if (ri === -1) {
      height = rows.totalHeight();
    }
    if (ri >= 0 || ci >= 0) {
      const merge = merges.getFirstIncludes(ri, ci);
      if (merge) {
        ri = merge.sri;
        ci = merge.sci;
        ({ left, top, width, height } = this.cellRect(ri, ci));
      }
    }
    return { ri, ci, left, top, width, height };
  }

  /**
   * 判断是否是单个选中。
   * @returns {boolean}
   */
  isSingleSelected() {
    const { sri, sci, eri, eci } = this.selector.range;
    const cell = this.getCell(sri, sci);
    if (cell && cell.merge) {
      const [rn, cn] = cell.merge;
      if (sri + rn === eri && sci + cn === eci) {
        return true;
      }
    }
    return !this.selector.multiple();
  }

  /**
   * 能否不合并。
   * @returns {boolean}
   */
  canUnmerge() {
    const { sri, sci, eri, eci } = this.selector.range;
    const cell = this.getCell(sri, sci);
    if (cell && cell.merge) {
      const [rn, cn] = cell.merge;
      if (sri + rn === eri && sci + cn === eci) {
        return true;
      }
    }
    return false;
  }

  /**
   * 合并。
   */
  merge() {
    const { selector, rows } = this;
    if (this.isSingleSelected()) {
      return;
    }
    const [rn, cn] = selector.size();
    // console.log('merge:', rn, cn);
    if (rn > 1 || cn > 1) {
      const { sri, sci } = selector.range;
      this.changeData(() => {
        const cell = rows.getCellOrNew(sri, sci);
        cell.merge = [rn - 1, cn - 1];
        this.merges.add(selector.range);
        // delete merge cells
        this.rows.deleteCells(selector.range);
        // console.log('cell:', cell, this.d);
        this.rows.setCell(sri, sci, cell);
      });
    }
  }

  /**
   * 不做合并，撤销合并。
   */
  unmerge() {
    const { selector } = this;
    if (!this.isSingleSelected()) return;
    const { sri, sci } = selector.range;
    this.changeData(() => {
      this.rows.deleteCell(sri, sci, 'merge');
      this.merges.deleteWithin(selector.range);
    });
  }

  /**
   * 能否自动过滤。
   * @returns {boolean}
   */
  canAutoFilter() {
    return !this.autoFilter.active();
  }

  /**
   * 过滤。
   */
  autofilter() {
    const { autoFilter, selector } = this;
    this.changeData(() => {
      if (autoFilter.active()) {
        autoFilter.clear();
        this.exceptRowSet = new Set();
        this.sortedRowMap = new Map();
        this.unsortedRowMap = new Map();
      } else {
        autoFilter.ref = selector.range.toString();
      }
    });
  }

  /**
   * 设置过滤器。
   * @param {number} ci  列索引
   * @param {string} order 排序方式
   * @param {Object} operator 操作
   * @param {Object} value 值
   */
  setAutoFilter(ci, order, operator, value) {
    const { autoFilter } = this;
    autoFilter.addFilter(ci, operator, value);
    autoFilter.setSort(ci, order);
    this.resetAutoFilter();
  }

  /**
   * 重置自动过滤。
   */
  resetAutoFilter() {
    const { autoFilter, rows } = this;
    if (!autoFilter.active()) {
      return;
    }
    const { sort } = autoFilter;
    const { rset, fset } = autoFilter.filteredRows((r, c) => rows.getCell(r, c));
    const fary = Array.from(fset);
    const oldAry = Array.from(fset);
    if (sort) {
      fary.sort((a, b) => {
        if (sort.order === 'asc') {
          return a - b;
        }
        if (sort.order === 'desc') {
          return b - a;
        }
        return 0;
      });
    }
    this.exceptRowSet = rset;
    this.sortedRowMap = new Map();
    this.unsortedRowMap = new Map();
    fary.forEach((it, index) => {
      this.sortedRowMap.set(oldAry[index], it);
      this.unsortedRowMap.set(it, oldAry[index]);
    });
  }

  /**
   * 删除单元格。
   * @param {string} what='all' all(所有) | fomat(格式)
   */
  deleteCell(what = 'all') {
    const { selector } = this;
    this.changeData(() => {
      this.rows.deleteCells(selector.range, what);
      if (what === 'all' || what === 'format') {
        this.merges.deleteWithin(selector.range);
      }
    });
  }

  /**
   * 插入行或者列(基于选中区域)。<br>
   * 这里对原方法进行了扩充，主要是在默认 1 行|列的基础上提供了自定义输入，并提供了方向。
   * @param {string} type row | column
   * @param {number} n=1 插入行|列数
   * @param {string} direction 方向，行：上方|下方；列：左侧|右侧
   */
  insert(type, n = 1, direction = 'below') {
    if (n <= 0) {
      return;
    }
    this.changeData(() => {
      const { sri, sci, eri, eci } = this.selector.range;
      const { rows, merges, cols } = this;
      let si = sri;
      if (type === 'row') {
        // above(上方)|below(下方)
        if (direction === 'below') {
          si = eri + 0.5;
        } else {
          si = sri - 0.5;
        }
        rows.insert(si, n);
      } else if (type === 'column') {
        if (direction === 'right') {
          si = eci + 0.5;
        } else {
          si = sci - 0.5;
        }
        rows.insertColumn(si, n);
        cols.len += n;
      }

      merges.shift(type, si, n, (ri, ci, rn, cn) => {
        const cell = rows.getCell(ri, ci);
        cell.merge[0] += rn;
        cell.merge[1] += cn;
      });
    });
  }

  /**
   * 删除选中行或者列。
   * @param {string} type row | column
   */
  delete(type) {
    this.changeData(() => {
      const { rows, merges, selector, cols } = this;
      const { range } = selector;
      const { sri, sci, eri, eci } = selector.range;
      const [rsize, csize] = selector.range.size();
      let si = sri;
      let size = rsize;
      if (type === 'row') {
        rows.delete(sri, eri);
      } else if (type === 'column') {
        rows.deleteColumn(sci, eci);
        si = range.sci;
        size = csize;
        cols.len -= eci - sci + 1;
      }

      merges.shift(type, si, -size, (ri, ci, rn, cn) => {
        const cell = rows.getCell(ri, ci);
        cell.merge[0] += rn;
        cell.merge[1] += cn;
        if (cell.merge[0] === 0 && cell.merge[1] === 0) {
          delete cell.merge;
        }
      });
    });
  }

  /**
   * 滚动 X 距离触发回调函数。
   * @param {number} x 距离
   * @param {function} cb 回调函数
   */
  scrollx(x, cb) {
    const { scroll, freeze, cols } = this;
    const [, fci] = freeze;
    const [ci, left, width] = helper.rangeReduceIf(fci, cols.len, 0, 0, x, (i) => cols.getWidth(i));
    let x1 = left;
    if (x > 0) {
      x1 += width;
    }
    if (scroll.x !== x1) {
      scroll.ci = x > 0 ? ci : 0;
      scroll.x = x1;
      cb();
    }
  }

  /**
   * 滚动 Y 距离触发回调函数。
   * @param {number} y 距离
   * @param {function} cb 回调函数
   */
  scrolly(y, cb) {
    const { scroll, freeze, rows } = this;
    const [fri] = freeze;
    const [ri, top, height] = helper.rangeReduceIf(fri, rows.len, 0, 0, y, (i) => rows.getHeight(i));
    let y1 = top;
    if (y > 0) {
      y1 += height;
    }
    if (scroll.y !== y1) {
      scroll.ri = y > 0 ? ri : 0;
      scroll.y = y1;
      cb();
    }
  }

  /**
   * 返回当前单元格的具体坐标信息。
   * @param {number} ri 行索引
   * @param {number} ci 列索引
   * @returns {{top: number, left: number, width: number, cell: *, height: (number|*)}}
   */
  cellRect(ri, ci) {
    const { rows, cols } = this;
    const left = cols.sumWidth(0, ci);
    const top = rows.sumHeight(0, ri);
    const cell = rows.getCell(ri, ci);
    let width = cols.getWidth(ci);
    let height = rows.getHeight(ri);
    if (cell !== null) {
      if (cell.merge) {
        const [rn, cn] = cell.merge;
        if (rn > 0) {
          for (let i = 1; i <= rn; i += 1) {
            height += rows.getHeight(ri + i);
          }
        }
        if (cn > 0) {
          for (let i = 1; i <= cn; i += 1) {
            width += cols.getWidth(ci + i);
          }
        }
      }
    }
    return { left, top, width, height, cell };
  }

  /**
   * 通过行列索引获得当前单元格。
   * @param {number} ri 行索引
   * @param {number} ci 列索引
   * @returns {*}
   */
  getCell(ri, ci) {
    return this.rows.getCell(ri, ci);
  }

  /**
   * 通过行列索引获得单元格文字或者默认值。
   * @param {number} ri 行索引
   * @param {number} ci 列索引
   * @returns {*|string}
   */
  getCellTextOrDefault(ri, ci) {
    const cell = this.getCell(ri, ci);
    return cell && cell.text ? cell.text : '';
  }

  /**
   * 通过行列获得单元格样式。
   * @param {number} ri 行索引
   * @param {number} ci 列索引
   * @returns {null|*}
   */
  getCellStyle(ri, ci) {
    const cell = this.getCell(ri, ci);
    if (cell && cell.style !== undefined) {
      return this.styles[cell.style];
    }
    return null;
  }

  /**
   * 通过行列获得单元格样式或者默认值。
   * @param {number} ri 行索引
   * @param {number} ci 列索引
   * @returns {{}}
   */
  getCellStyleOrDefault(ri, ci) {
    const { styles, rows } = this;
    const cell = rows.getCell(ri, ci);
    const cellStyle = cell && cell.style !== undefined ? styles[cell.style] : {};
    return helper.merge(this.defaultStyle(), cellStyle);
  }

  /**
   * 获得当前选中单元格样式。
   * @returns {Object}
   */
  getSelectedCellStyle() {
    const { ri, ci } = this.selector;
    return this.getCellStyleOrDefault(ri, ci);
  }

  /**
   * 设定指定单元格值，并更新输入状态。
   * @param {number} ri 行索引
   * @param {number} ci 列索引
   * @param {string} text 文字
   * @param {string} value 选择值
   * @param {string} state 状态：input | finished
   */
  setCellText(ri, ci, text, state, value = '') {
    const { rows, history, validations } = this;
    if (state === 'finished') {
      rows.setCellText(ri, ci, '', '');
      history.add(this.getData());
      rows.setCellText(ri, ci, text, value);
    } else {
      rows.setCellText(ri, ci, text, value);
      this.change(this.getData());
    }
    // validator
    validations.validate(ri, ci, text);
  }

  /**
   * 冻结是否可以激活。
   * @returns {boolean}
   */
  freezeIsActive() {
    const [ri, ci] = this.freeze;
    return ri > 0 || ci > 0;
  }

  /**
   * 设置冻结栏。
   * @param {number} ri 行索引
   * @param {number} ci 列索引
   */
  setFreeze(ri, ci) {
    this.changeData(() => {
      this.freeze = [ri, ci];
    });
  }

  /**
   * 获得冻结栏的总计宽度。
   * @returns {number}
   */
  freezeTotalWidth() {
    return this.cols.sumWidth(0, this.freeze[1]);
  }

  /**
   * 获得冻结栏总计高度。
   * @returns {number}
   */
  freezeTotalHeight() {
    return this.rows.sumHeight(0, this.freeze[0]);
  }

  /**
   * 设置某一行高度。
   * @param {number} ri 行索引
   * @param {number} height 行高度
   */
  setRowHeight(ri, height) {
    this.changeData(() => {
      this.rows.setHeight(ri, height);
    });
  }

  /**
   * 设置某一列高度。
   * @param {number} ci 列索引
   * @param {number} width 列宽度
   */
  setColWidth(ci, width) {
    this.changeData(() => {
      this.cols.setWidth(ci, width);
    });
  }

  /**
   * 获取表格的高度。
   * 默认为 document.documentElement.clientHeight - 底部状态栏高度 - 顶部工具栏高度
   * @returns {*}
   */
  viewHeight() {
    const { view, showToolbar, showBottomBar } = this.settings;
    let h = view.height();
    if (showBottomBar) {
      h -= bottombarHeight;
    }
    if (showToolbar) {
      h -= toolbarHeight;
    }
    return h;
  }

  /**
   * 获得表格的宽度。
   * @returns {number}
   */
  viewWidth() {
    return this.settings.view.width();
  }

  /**
   * 获得冻结范围。
   * @returns {CellRange}
   */
  freezeViewRange() {
    const [ri, ci] = this.freeze;
    return new CellRange(0, 0, ri - 1, ci - 1, this.freezeTotalWidth(), this.freezeTotalHeight());
  }

  /**
   * 获得文本区域显示范围。
   * @returns {CellRange}
   */
  contentRange() {
    const { rows, cols } = this;
    const [ri, ci] = rows.maxCell();
    const h = rows.sumHeight(0, ri + 1);
    const w = cols.sumWidth(0, ci + 1);
    return new CellRange(0, 0, ri, ci, w, h);
  }

  /**
   * 获得忽略行后的总计高度。
   * @param {number} sri 开始行索引
   * @param {number} eri 结束行索引
   * @returns {number}
   */
  exceptRowTotalHeight(sri, eri) {
    const { exceptRowSet, rows } = this;
    const exceptRows = Array.from(exceptRowSet);
    let exceptRowTH = 0;
    exceptRows.forEach((ri) => {
      if (ri < sri || ri > eri) {
        const height = rows.getHeight(ri);
        exceptRowTH += height;
      }
    });
    return exceptRowTH;
  }

  /**
   * 获得可视区显示范围。
   * @returns {CellRange}
   */
  viewRange() {
    const { scroll, rows, cols, freeze, exceptRowSet } = this;
    let { ri, ci } = scroll;
    if (ri <= 0) {
      [ri] = freeze;
    }
    if (ci <= 0) {
      [, ci] = freeze;
    }

    let [x, y] = [0, 0];
    let [eri, eci] = [rows.len, cols.len];
    for (let i = ri; i < rows.len; i += 1) {
      if (!exceptRowSet.has(i)) {
        y += rows.getHeight(i);
        eri = i;
      }
      if (y > this.viewHeight()) {
        break;
      }
    }
    for (let j = ci; j < cols.len; j += 1) {
      x += cols.getWidth(j);
      eci = j;
      if (x > this.viewWidth()) {
        break;
      }
    }
    return new CellRange(ri, ci, eri, eci, x, y);
  }

  /**
   * 每个合并发生的时候触发的回调。
   * @param {Object} viewRange 显示范围
   * @param {function} cb 回调函数
   */
  eachMergesInView(viewRange, cb) {
    this.merges.filterIntersects(viewRange).forEach((it) => cb(it));
  }

  /**
   * 隐藏选中行或者列。
   */
  hideRowsOrCols() {
    const { rows, cols, selector } = this;
    const [rlen, clen] = selector.size();
    const { sri, sci, eri, eci } = selector.range;
    if (rlen === rows.len) {
      for (let ci = sci; ci <= eci; ci += 1) {
        cols.setHide(ci, true);
      }
    } else if (clen === cols.len) {
      for (let ri = sri; ri <= eri; ri += 1) {
        rows.setHide(ri, true);
      }
    }
  }

  /**
   * 取消隐藏行或者列。
   * @param {string} type  row | col
   * @param {number} index row-index | col-index
   */
  unhideRowsOrCols(type, index) {
    this[`${type}s`].unhide(index);
  }

  /**
   * 行遍历，可以指定范围。
   * @param {number} min 最小行
   * @param {number} max 最大行
   * @param {function} cb 回调函数
   */
  rowEach(min, max, cb) {
    let y = 0;
    const { rows } = this;
    const frset = this.exceptRowSet;
    const frary = [...frset];
    let offset = 0;
    for (let i = 0; i < frary.length; i += 1) {
      if (frary[i] < min) {
        offset += 1;
      }
    }
    for (let i = min + offset; i <= max + offset; i += 1) {
      if (frset.has(i)) {
        offset += 1;
      } else {
        const rowHeight = rows.getHeight(i);
        if (rowHeight > 0) {
          cb(i, y, rowHeight);
          y += rowHeight;
          if (y > this.viewHeight()) {
            break;
          }
        }
      }
    }
  }

  /**
   * 列遍历，可以指定范围。
   * @param {number} min 最小列
   * @param {number} max 最大列
   * @param {function} cb 回调函数
   */
  colEach(min, max, cb) {
    let x = 0;
    const { cols } = this;
    for (let i = min; i <= max; i += 1) {
      const colWidth = cols.getWidth(i);
      if (colWidth > 0) {
        cb(i, x, colWidth);
        x += colWidth;
        if (x > this.viewWidth()) {
          break;
        }
      }
    }
  }

  /**
   * 获得默认样式。
   * @returns {*}
   */
  defaultStyle() {
    return this.settings.style;
  }

  /**
   * 设置多个样式。
   * @param {Object} nstyle 样式对象
   * @returns {number}
   */
  addStyle(nstyle) {
    const { styles } = this;
    for (let i = 0; i < styles.length; i += 1) {
      const style = styles[i];
      if (helper.equals(style, nstyle)) {
        return i;
      }
    }
    styles.push(nstyle);
    return styles.length - 1;
  }

  /**
   * 设置数据变化时的回调函数。
   * @param {function} cb 回调函数
   */
  changeData(cb) {
    this.history.add(this.getData());
    if (cb);
    this.change(this.getData());
  }

  /**
   * 设置表格数据，d 如果不知道可以通过 getData() 方法先获取一份默认的看看。
   * @param {Object} data 对象数据
   * @returns {Object} Sheet对象
   */
  setData(d) {
    Object.keys(d).forEach((key) => {
      if (key === 'merges' || key === 'rows' || key === 'cols' || key === 'validations' || key === 'areas') {
        this[key].setData(d[key]);
      } else if (key === 'freeze') {
        const [x, y] = expr2xy(d[key]);
        this.freeze = [y, x];
      } else if (key === 'autofilter') {
        this.autoFilter.setData(d[key]);
      } else if (d[key] !== undefined) {
        this[key] = d[key];
      }
    });
    return this;
  }

  /**
   * 获得当前工作表的数据。
   * @returns {Object}
   */
  getData() {
    const { name, freeze, styles, merges, rows, cols, validations, autoFilter } = this;
    return {
      name,
      freeze: xy2expr(freeze[1], freeze[0]),
      styles,
      merges: merges.getData(),
      rows: rows.getData(),
      cols: cols.getData(),
      validations: validations.getData(),
      autofilter: autoFilter.getData(),
    };
  }
}

export default DataProxy;
