import { nanoid } from 'nanoid';
import helper from './helper';
import { expr2expr } from './alphabet';

/**
 * 主要为行、列操作设置相关，设置高度、隐藏行列等。<br>
 * 这个类被挂载到 data 实例下了，所以在全局的调用属性方法为：<br>
 * instance.datas[i].rows.publicFn(args)
 */
class Rows {
  /**
   * @hideconstructor
   * @param {Object} option
   * @param {number} option.len 总行数
   * @param {number} option.height 单行高度
   */
  constructor({ len, height, indexHeight }) {
    this._ = {};
    this.len = len;
    // default row height
    this.height = height;
    this.indexHeight = indexHeight;
  }

  /**
   * 获取指定行高度。
   * @param {number} ri 行索引
   * @returns {number} 行高
   */
  getHeight(ri) {
    if (this.isHide(ri)) {
      return 0;
    }
    const row = this.get(ri);
    if (row && row.height) {
      return row.height;
    }
    return this.height;
  }

  /**
   * 设置行的高度。
   * @param {number} ri 行索引
   * @param {number} v 行高度
   */
  setHeight(ri, v) {
    const row = this.getOrNew(ri);
    row.height = v;
  }

  /**
   * 取消隐藏行。
   * @param {number} idx 行索引
   */
  unhide(idx) {
    let index = idx;
    while (index > 0) {
      index -= 1;
      if (this.isHide(index)) {
        this.setHide(index, false);
      } else {
        break;
      }
    }
  }

  /**
   * 判断指定行是否隐藏。
   * @param {number} ri 行索引
   * @returns {boolean} true: 隐藏；false: 显示
   */
  isHide(ri) {
    const row = this.get(ri);
    return row && row.hide;
  }

  /**
   * 设置隐藏行。
   * @param {number} ri 行索引
   * @param {boolean} v true: 隐藏；false: 显示
   */
  setHide(ri, v) {
    const row = this.getOrNew(ri);
    if (v === true) {
      row.hide = true;
    } else {
      delete row.hide;
    }
  }

  /**
   * 设置行样式。
   * @param {number} ri 行索引
   * @param {Object} style 样式对象
   */
  setStyle(ri, style) {
    const row = this.getOrNew(ri);
    row.style = style;
  }

  /**
   * 获取起止范围内行的总高度。
   * @param {number} startIndex 开始行索引
   * @param {number} endIndex 结束行索引
   * @param {Object} exceptSet 排除计算区域
   * @returns {number} 两个行之间的间距。
   */
  sumHeight(startIndex, endIndex, exceptSet) {
    return helper.rangeSum(startIndex, endIndex, (index) => {
      if (exceptSet && exceptSet.has(index)) {
        return 0;
      }
      return this.getHeight(index);
    });
  }

  /**
   * 获取所有行高度的总和。
   * @returns {number} 所有行高度总和。
   */
  totalHeight() {
    return this.sumHeight(0, this.len, undefined);
  }

  /**
   * 获取指定行数据。
   * @param {number} ri 行索引
   * @returns {Object} 某行数据
   */
  get(ri) {
    return this._[ri];
  }

  /**
   * 获取某行，如果未找到，返回默认配置。
   * @param {number} ri 行索引
   * @returns {Object} 某行数据
   */
  getOrNew(ri) {
    this._[ri] = this._[ri] || { cells: {} };
    return this._[ri];
  }

  /**
   * 获取单元格数据。
   * @param {number} ri 行索引
   * @param {number} ci 列索引
   * @returns {null|Object} 单元格数据。
   */
  getCell(ri, ci) {
    const row = this.get(ri);
    if (row !== undefined && row.cells !== undefined && row.cells[ci] !== undefined) {
      const cell = row.cells[ci];
      // 当控件文本为空时不显示控件图标
      // if (cell.text || cell.type === 'date') {
      //   return cell;
      // }
      return cell;
    }
    return null;
  }

  /**
   * 获取单元格合并信息。
   * @param {number} ri 行索引
   * @param {number} ci 列索引
   * @returns {Object}
   */
  getCellMerge(ri, ci) {
    const cell = this.getCell(ri, ci);
    if (cell && cell.merge) {
      return cell.merge;
    }
    return [0, 0];
  }

  /**
   * 获取单元格，未找到，返回默认值。
   * @param {number} ri 行索引
   * @param {number} ci 列索引
   * @returns {Object}
   */
  getCellOrNew(ri, ci) {
    const row = this.getOrNew(ri);
    row.cells[ci] = row.cells[ci] || {};
    return row.cells[ci];
  }

  /**
   * 设置单元格数据，对象形式。
   * @param {number} ri 行索引
   * @param {number} ci 列索引
   * @param {Object} cell 单元格对象
   * @param {string} what='all' all | text | format
   */
  setCell(ri, ci, cell, what = 'all') {
    const row = this.getOrNew(ri);
    // console.log(ri, ci, cell, )
    if (what === 'all') {
      row.cells[ci] = cell;
    } else if (what === 'rest') {
      const old = row.cells[ci];
      row.cells[ci] = {
        ...old,
        ...cell,
      };
    } else if (what === 'text') {
      row.cells[ci] = row.cells[ci] || {};
      row.cells[ci].text = cell.text;
    } else if (what === 'format') {
      row.cells[ci] = row.cells[ci] || {};
      row.cells[ci].style = cell.style;
      if (cell.merge) {
        row.cells[ci].merge = cell.merge;
      }
    }
  }

  /**
   * 设置单元格文本，值形式。
   * @param {number} ri 行索引
   * @param {number} ci 列索引
   * @param {(string|number)} text 文本内容
   * @param {string} value 文本值
   */
  setCellText(ri, ci, text, value) {
    const cell = this.getCellOrNew(ri, ci);
    if (cell.editable !== false) {
      cell.text = text;
      // 这里统一转换为字符串，避免精度丢失
      cell.value = String(value);
    }
  }

  /**
   * 复制粘贴。
   * @param {Object} srcCellRange 输入复制区域
   * @param {Object} destCellRange 输出粘贴区域
   * @param {string} what type: all | format | text
   * @param {boolean} autofill=false 自动填充
   * @param {function} cb 回调函数
   */
  copyPaste(srcCellRange, destCellRange, what, autofill = false, cb = () => {}) {
    const { sri, sci, eri, eci } = srcCellRange;
    const dsri = destCellRange.sri;
    const dsci = destCellRange.sci;
    const deri = destCellRange.eri;
    const deci = destCellRange.eci;
    const [rn, cn] = srcCellRange.size(); // 选中范围的横向格子数和竖向格子数
    const [drn, dcn] = destCellRange.size(); // 选中范围的横向格子数和竖向格子数

    let isAdd = true;
    let dn = 0;
    if (deri < sri || deci < sci) {
      isAdd = false;
      if (deri < sri) {
        dn = drn;
      } else {
        dn = dcn;
      }
    }

    for (let i = sri; i <= eri; i += 1) {
      // 复制起始行到末尾行
      if (this._[i]) {
        for (let j = sci; j <= eci; j += 1) {
          // 复制起始列到末尾列
          if (this._[i].cells && this._[i].cells[j]) {
            for (let ii = dsri; ii <= deri; ii += rn) {
              // 粘贴起始行到末尾行
              for (let jj = dsci; jj <= deci; jj += cn) {
                // 粘贴起始列到末尾列
                const nri = ii + (i - sri); // 目标位置行索引
                const nci = jj + (j - sci); // 目标位置列索引
                const ncell = helper.cloneDeep(this._[i].cells[j]); // 目标位置即将填入的数据
                // 在这里要作特殊处理，因为我们在单元格中扩展了一些自己的属性，比如id，我们要求id唯一，再复制粘贴时，要保证唯一性，所以对id特殊处理。
                if (ncell.componentId) {
                  ncell.componentId = nanoid();
                }
                // ncell.text
                if (autofill && ncell && ncell.text && ncell.text.length > 0) {
                  const { text } = ncell;
                  let n = jj - dsci + (ii - dsri) + 2;
                  if (!isAdd) {
                    n -= dn + 1;
                  }
                  if (text[0] === '=') {
                    ncell.text = text.replace(/[a-zA-Z]{1,3}\d+/g, (word) => {
                      let [xn, yn] = [0, 0];
                      if (sri === dsri) {
                        xn = n - 1;
                      } else {
                        yn = n - 1;
                      }
                      if (/^\d+$/.test(word)) {
                        return word;
                      }
                      return expr2expr(word, xn, yn);
                    });
                  } else if (
                    (rn <= 1 && cn > 1 && (dsri > eri || deri < sri)) ||
                    (cn <= 1 && rn > 1 && (dsci > eci || deci < sci)) ||
                    (rn <= 1 && cn <= 1)
                  ) {
                    const result = /[\\.\d]+$/.exec(text);
                    if (result !== null) {
                      const index = Number(result[0]) + n - 1;
                      ncell.text = text.substring(0, result.index) + index;
                    }
                  }
                }
                this.setCell(nri, nci, ncell, what);
                cb(nri, nci, ncell);
              }
            }
          }
        }
      }
    }
  }

  /**
   * 剪切粘贴。
   * @param {Object} srcCellRange 输入复制区域
   * @param {Object} destCellRange 输出粘贴区域
   */
  cutPaste(srcCellRange, destCellRange) {
    const ncellmm = {};
    this.each((ri) => {
      this.eachCells(ri, (ci) => {
        let nri = parseInt(ri, 10);
        let nci = parseInt(ci, 10);
        if (srcCellRange.includes(ri, ci)) {
          nri = destCellRange.sri + (nri - srcCellRange.sri);
          nci = destCellRange.sci + (nci - srcCellRange.sci);
        }
        ncellmm[nri] = ncellmm[nri] || { cells: {} };
        ncellmm[nri].cells[nci] = this._[ri].cells[ci];
      });
    });
    this._ = ncellmm;
  }

  /**
   * 复制功能。
   * @param {Array<Array<string>>} src 输入复制的选区范围
   * @param {Object} dstCellRange 输出的复制选区范围
   */
  paste(src, dstCellRange) {
    if (src.length <= 0) {
      return;
    }
    const { sri, sci } = dstCellRange;
    src.forEach((row, i) => {
      const ri = sri + i;
      row.forEach((cell, j) => {
        const ci = sci + j;
        this.setCellText(ri, ci, cell);
      });
    });
  }

  /**
   * 插入行。<br>
   * 需要考虑多种情况：边框区域中插入新行、公式区域中插入新行、普通插入。<br>
   * 目前源码只处理了公式区域中插入新行。<br>
   * @param {number} sri 插入起始位置行坐标
   * @param {number} n=1 插入的行数
   * @param {string} direction='above' 方向：above(上方)|below(下方)
   */
  insert(sri, n = 1) {
    const newData = {}; // 插入新行后的数据
    this.each((ri, row) => {
      let nri = parseInt(ri, 10);
      let isAfter = false;
      // 是否是插入行之后的行，如果是要特殊处理。
      if (nri > sri) {
        nri += n;
        isAfter = true;
      }
      // 插入行之后的行都要特殊处理，因为公式、边框之类的属性会变化。
      if (isAfter) {
        // 这里迭代时依旧使用的是未改变之前的数据，请注意。
        this.eachCells(ri, (ci, cell) => {
          // 公式处理
          if (cell?.text && cell?.text[0] === '=') {
            cell.text = cell.text.replace(/[a-zA-Z]{1,3}\d+/g, (word) => expr2expr(word, 0, n, (x, y) => y >= sri));
          }
          // TODO 边框处理
        });
      }
      newData[nri] = row;
    });
    this._ = newData;
    this.len += n;
  }

  /**
   * 删除行。
   * @param {number} sri 开始行坐标
   * @param {number} eri 结束行坐标
   */
  delete(sri, eri) {
    const n = eri - sri + 1;
    const ndata = {};
    this.each((ri, row) => {
      const nri = parseInt(ri, 10);
      if (nri < sri) {
        ndata[nri] = row;
      } else if (ri > eri) {
        ndata[nri - n] = row;
        this.eachCells(ri, (ci, cell) => {
          if (cell.text && cell.text[0] === '=') {
            cell.text = cell.text.replace(/[a-zA-Z]{1,3}\d+/g, (word) => expr2expr(word, 0, -n, (x, y) => y > eri));
          }
        });
      }
    });
    this._ = ndata;
    this.len -= n;
  }

  /**
   * 插入列。
   * 在这里插入列也在行类中操作，插入列可以看成重新绘制每一行。
   * @param {number} sci 插入起始位置列坐标
   * @param {number} n=1 插入的列数
   * @param {string} direction='left' 方向：left(左方)|right(右方)
   */
  insertColumn(sci, n = 1) {
    this.each((ri, row) => {
      const rndata = {};
      this.eachCells(ri, (ci, cell) => {
        let nci = parseInt(ci, 10);
        let isAfter = false;
        if (nci > sci) {
          nci += n;
          isAfter = true;
        }
        if (isAfter) {
          if (cell.text && cell.text[0] === '=') {
            cell.text = cell.text.replace(/[a-zA-Z]{1,3}\d+/g, (word) => expr2expr(word, n, 0, (x) => x >= sci));
          }
        }
        rndata[nci] = cell;
      });
      row.cells = rndata;
    });
  }

  /**
   * 删除列。
   * @param {number} sci 开始列坐标
   * @param {number} eci 结束列坐标
   */
  deleteColumn(sci, eci) {
    const n = eci - sci + 1;
    this.each((ri, row) => {
      const rndata = {};
      this.eachCells(ri, (ci, cell) => {
        const nci = parseInt(ci, 10);
        if (nci < sci) {
          rndata[nci] = cell;
        } else if (nci >= sci && nci <= eci) {
          if (cell.merge) {
            const mergeCi = cell.merge[1];
            if (mergeCi > n - 1) {
              cell.merge[1] = mergeCi - n;
              rndata[nci] = cell;
            }
          }
        } else if (nci > eci) {
          if (!rndata[nci - n]) {
            rndata[nci - n] = cell;
            if (cell.text && cell.text[0] === '=') {
              cell.text = cell.text.replace(/[a-zA-Z]{1,3}\d+/g, (word) => expr2expr(word, -n, 0, (x) => x > eci));
            }
          }
        }
      });
      row.cells = rndata;
    });
  }

  /**
   * 清除区域单元格。
   * @param {Array} cellRange 单元格选区
   * @param {string} what 删除类型：all | text | format | merge
   */
  deleteCells(cellRange, what = 'all') {
    cellRange.each((i, j) => {
      this.deleteCell(i, j, what);
    });
  }

  /**
   * 清除单个单元格。
   * @param {number} ri 行索引
   * @param {number} ci 列索引
   * @param {string} what 删除类型：all | text | format | merge
   */
  deleteCell(ri, ci, what = 'all') {
    const row = this.get(ri);
    if (row !== null) {
      const cell = this.getCell(ri, ci);
      if (cell !== null && cell.editable !== false) {
        if (what === 'all') {
          delete row.cells[ci];
        } else if (what === 'text') {
          if (cell.text) {
            delete cell.text;
          }
          if (cell.value) {
            delete cell.value;
          }
        } else if (what === 'format') {
          if (cell.style !== undefined) {
            delete cell.style;
          }
          if (cell.merge) {
            delete cell.merge;
          }
        } else if (what === 'merge') {
          if (cell.merge) {
            delete cell.merge;
          }
        }
      }
    }
  }

  /**
   * 返回最右下角单元格坐标。
   * @returns {number[]}
   */
  maxCell() {
    const keys = Object.keys(this._);
    const ri = keys[keys.length - 1];
    const col = this._[ri];
    if (col) {
      const { cells } = col;
      const ks = Object.keys(cells);
      const ci = ks[ks.length - 1];
      return [parseInt(ri, 10), parseInt(ci, 10)];
    }
    return [0, 0];
  }

  /**
   * 针对于 row 做的增强版 each 函数。
   * @param {function} cb 回调函数，接受两个参数 ri, row
   */
  each(cb) {
    Object.entries(this._).forEach(([ri, row]) => {
      cb(ri, row);
    });
  }

  /**
   * 针对于单元格做的增强版 each 函数。
   * @param {number} ri 行索引
   * @param {function} cb 回调函数，接受两个参数 ci, cell
   */
  eachCells(ri, cb) {
    if (this._[ri] && this._[ri].cells) {
      Object.entries(this._[ri].cells).forEach(([ci, cell]) => {
        cb(ci, cell);
      });
    }
  }

  /**
   * 设置所有单元格数据。
   * @param {Object} d 传入的 data 数据
   */
  setData(d) {
    // console.log(d)
    if (d.len) {
      this.len = d.len;
      delete d.len;
    }
    this._ = d;
  }

  /**
   * 获取所有行数据。
   * @returns {Object}
   */
  getData() {
    const { len } = this;
    return {len, ...this._};
  }
}

export default {};
export { Rows };
