import helper from './helper';

/**
 * 列功能类
 */
class Cols {
  constructor({ len, width, indexWidth, minWidth }) {
    this._ = {};
    this.len = len;
    this.width = width;
    this.indexWidth = indexWidth;
    this.minWidth = minWidth;
  }

  /**
   * 设置所有列单元格数据。<br>
   * 因为数据都挂载到 Rows 类上了，所以在列 Cols 上没有保留数据。
   * @param {Object} d 传入的 data 数据
   */
  setData(d) {
    if (d.len) {
      this.len = d.len;
      delete d.len;
    }
    this._ = d;
  }

  /**
   * 获取所有列数据。<br>
   * 因为数据都挂载到 Rows 类上了，所以在列 Cols 上没有保留数据。
   * @returns {Object}
   */
  getData() {
    const { len } = this;
    return { len, ...this._ };
  }

  /**
   * 获取指定列的宽度。
   * @param {number} ci 列索引
   * @returns {number} 列宽
   */
  getWidth(ci) {
    if (this.isHide(ci)) {
      return 0;
    }
    const col = this._[ci];
    if (col && col.width) {
      return col.width;
    }
    return this.width;
  }

  /**
   * 获取某列，如果未找到，返回默认配置。
   * @param {number} ci 列索引
   * @returns {Object} 某列数据，一般为空对象{}。
   */
  getOrNew(ci) {
    this._[ci] = this._[ci] || {};
    return this._[ci];
  }

  /**
   * 设置列的宽度。
   * @param {number} ci 列索引
   * @param {number} width 列宽度
   */
  setWidth(ci, width) {
    const col = this.getOrNew(ci);
    col.width = width;
  }

  /**
   * 取消隐藏列。
   * @param {number} idx 列索引
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
   * 判断指定列是否隐藏。
   * @param {number} ci 列索引
   * @returns {boolean} true: 隐藏；false: 显示
   */
  isHide(ci) {
    const col = this._[ci];
    return col && col.hide;
  }

  /**
   * 设置隐藏列。
   * @param {number} ci 列索引
   * @param {boolean} v true: 隐藏；false: 显示
   */
  setHide(ci, v) {
    const col = this.getOrNew(ci);
    if (v === true) {
      col.hide = true;
    } else {
      delete col.hide;
    }
  }

  /**
   * 设置列样式。
   * @param {number} ci 列索引
   * @param {Object} style 样式对象
   */
  setStyle(ci, style) {
    const col = this.getOrNew(ci);
    col.style = style;
  }

  /**
   * 获取起止范围内列的总宽度。
   * @param {number} startIndex 开始列索引
   * @param {number} endIndex 结束列索引
   * @returns {number}
   */
  sumWidth(startIndex, endIndex) {
    return helper.rangeSum(startIndex, endIndex, (index) => this.getWidth(index));
  }

  /**
   * 获取所有列宽度的总和。
   * @returns {number} 所有列宽度总和。
   */
  totalWidth() {
    return this.sumWidth(0, this.len);
  }
}

export default {};

export { Cols };
