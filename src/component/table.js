import { Draw, DrawBox, npx, thinLineWidth } from '../canvas/draw';
import _cell from '../core/cell';
import { getFontSizePxByPt } from '../core/font';
import { stringAt } from '../core/alphabet';
import { formula } from '../core/formula';
import { format } from '../core/format';

// 单元格默认 padding
const cellPaddingWidth = 5;

// 默认填充样式
const tableFixedHeaderCleanStyle = {
  fillStyle: '#f4f5f8',
};
// 默认网格样式声明
const tableGridStyle = {
  fillStyle: '#fff',
  lineWidth: thinLineWidth(),
  strokeStyle: '#e6e6e6',
};

/**
 * 获得默认配置的 table 标题栏和 index 栏选中样式
 * @ignore
 * @returns {{textBaseline: string, strokeStyle: string, textAlign: string, fillStyle: string, lineWidth: *, font: string}}
 */
function tableFixedHeaderStyle() {
  return {
    textAlign: 'center',
    textBaseline: 'middle',
    font: `500 ${npx(12)}px Source Sans Pro`,
    fillStyle: '#585757',
    lineWidth: thinLineWidth(),
    strokeStyle: '#e6e6e6',
  };
}

function getDrawBox(data, rindex, cindex, yoffset = 0) {
  const { left, top, width, height } = data.cellRect(rindex, cindex);
  return new DrawBox(left, top + yoffset, width, height, cellPaddingWidth);
}

/**
 * 渲染单元格
 * @ignore
 * @param draw 绘制 canvas 工具类
 * @param {DataProxy} data 为 data-proxy 生成的对象
 * @param {number} rindex 行坐标, 0 开始
 * @param {number} cindex 列坐标, 0 开始
 * @param {number} yoffset y 轴偏移量
 */
export function renderCell(draw, data, rindex, cindex, yoffset = 0) {
  const { sortedRowMap, rows, cols } = data;
  if (rows.isHide(rindex) || cols.isHide(cindex)) {
    return;
  }
  let nrindex = rindex;
  if (sortedRowMap.has(rindex)) {
    nrindex = sortedRowMap.get(rindex);
  }

  const cell = data.getCell(nrindex, cindex);
  if (cell === null) {
    return;
  }
  let frozen = false;
  if ('editable' in cell && cell.editable === false) {
    frozen = true;
  }

  const style = data.getCellStyleOrDefault(nrindex, cindex);
  const dbox = getDrawBox(data, rindex, cindex, yoffset);
  dbox.bgcolor = style.bgcolor;
  if (style.border !== undefined) {
    dbox.setBorders(style.border);
    draw.strokeBorders(dbox);
  }
  draw.rect(dbox, () => {
    // 在文本之前添加空白占位符方便绘制特殊图形：例如圆形、方形等等
    // 当单元格被隐藏时，不应该再画图形
    if (['number', 'radio', 'checkbox', 'date', 'select', 'image'].includes(cell.type) && !cell.hidden) {
      // console.log(cell)
      // 如果单元格类型是单选框，则添加前缀的圆弧画法
      // 在这里传递一下行坐标与列坐标的宽度，方便异步加载图片时使用
      const fixedIndexWidth = cols.indexWidth;
      const fixedIndexHeight = rows.indexHeight;
      draw.geometry(cell, dbox, { fixedIndexWidth, fixedIndexHeight }, style);
    }
    // render text
    let cellText = '';
    if (!data.settings.evalPaused) {
      cellText = _cell.render(cell, formula, (y, x) => data.getCellTextOrDefault(x, y));
    } else {
      cellText = cell.text || '';
    }
    // 在这里对单元格格式进行扩展，比如小数点可以自由设置
    if (style.format) {
      const { decimalPlaces, percentPlaces, dateFormat } = cell;
      switch (style.format) {
        case 'number':
          cellText = format[style.format].render(cellText, decimalPlaces);
          break;
        case 'percent':
          cellText = format[style.format].render(cellText, percentPlaces);
          break;
        case 'date':
          cellText = format[style.format].render(cellText, dateFormat);
          break;
        default:
          cellText = format[style.format].render(cellText);
      }
    }
    const font = { ...style.font };
    font.size = getFontSizePxByPt(font.size);
    // 文本的偏移量，原本代码无些属性。当我们扩展之后，根据类型在文本前面画单选或者复选框按钮时，文本也要相应的往后偏移。
    // 为了兼容原有方法，特把此参数添加到 text方法的attr对象中。
    let offset;
    switch (cell.type) {
      case 'radio':
        offset = [12, 0];
        break;
      case 'checkbox':
        offset = [15, 0];
        break;
      case 'date':
        offset = [15, 0];
        break;
      default:
        offset = [0, 0];
        if (cell.tableCellType === 'rowHead' && cell.level) {
          offset = [(cell.level - 1) * 14, 0];
        }
    }

    draw.text(
      cellText,
      dbox,
      {
        align: style.align,
        valign: style.valign,
        font,
        color: style.color,
        strike: style.strike,
        underline: style.underline,
        offset,
      },
      style.textwrap,
      cell.type
    );
    const error = data.validations.getError(rindex, cindex);
    if (error || cell.mark) {
      draw.error(dbox);
    }
    if (frozen) {
      draw.frozen(dbox);
    }
  });

  // 画斜线
  // 在这里是通过 data-proxy 把斜线属性放到了样式中，为了兼容旧扩展。
  if (style.slash) {
    draw.slash(dbox);
  }
}

/**
 * 渲染自动过滤函数
 * @ignore
 * @param viewRange
 */
function renderAutofilter(viewRange) {
  const { data, draw } = this;
  if (viewRange) {
    const { autoFilter } = data;
    if (!autoFilter.active()) {
      return;
    }
    const afRange = autoFilter.hrange();
    if (viewRange.intersects(afRange)) {
      afRange.each((ri, ci) => {
        const dbox = getDrawBox(data, ri, ci);
        draw.dropdown(dbox);
      });
    }
  }
}

/**
 * 渲染内容
 * @ignore
 * @param viewRange
 * @param {number} fw 左边index栏宽度
 * @param {number} fh 表格最顶部标题栏高度
 * @param {number} tx 表格中如果存有冻结行列，那么 tx 为冻结行宽度总和
 * @param {number} ty 表格中如果存有冻结行列，那么 ty 为冻结行高度总和
 */
function renderContent(viewRange, fw, fh, tx, ty) {
  const { draw, data } = this;
  draw.save();
  draw.translate(fw, fh).translate(tx, ty);

  const { exceptRowSet } = data;
  const filteredTranslateFunc = (ri) => {
    const ret = exceptRowSet.has(ri);
    if (ret) {
      const height = data.rows.getHeight(ri);
      draw.translate(0, -height);
    }
    return !ret;
  };

  const exceptRowTotalHeight = data.exceptRowTotalHeight(viewRange.sri, viewRange.eri);
  // 1 render cell
  draw.save();
  draw.translate(0, -exceptRowTotalHeight);
  viewRange.each(
    (ri, ci) => {
      renderCell(draw, data, ri, ci);
    },
    (ri) => filteredTranslateFunc(ri)
  );
  draw.restore();

  // 2 render mergeCell
  const rset = new Set();
  draw.save();
  draw.translate(0, -exceptRowTotalHeight);
  data.eachMergesInView(viewRange, ({ sri, sci, eri }) => {
    if (!exceptRowSet.has(sri)) {
      renderCell(draw, data, sri, sci);
    } else if (!rset.has(sri)) {
      rset.add(sri);
      const height = data.rows.sumHeight(sri, eri + 1);
      draw.translate(0, -height);
    }
  });
  draw.restore();

  // 3 render autoFilter
  renderAutofilter.call(this, viewRange);

  draw.restore();
}

/**
 * 渲染选中标题栏和 index 栏样式
 * @ignore
 * @param {number} x 计算值距离左边的距离
 * @param {number} y 计算值距离顶部的距离
 * @param {number} w 列宽
 * @param {number} h 行高
 */
function renderSelectedHeaderCell(x, y, w, h) {
  const { draw } = this;
  draw.save();
  draw.attr({ fillStyle: 'rgba(75, 137, 255, 0.08)' }).fillRect(x, y, w, h);
  draw.restore();
}

/**
 * 渲染标题栏和左侧 index 栏样式
 * @ignore
 * @param {string} type all | left | top
 * @param viewRange
 * @param {number} w: the fixed width of header
 * @param {number} h: the fixed height of header
 * @param {number} tx: moving distance on x-axis
 * @param {number} ty: moving distance on y-axis
 */
function renderFixedHeaders(type, viewRange, w, h, tx, ty) {
  const { draw, data } = this;
  const sumHeight = viewRange.h; // rows.sumHeight(viewRange.sri, viewRange.eri + 1);
  const sumWidth = viewRange.w; // cols.sumWidth(viewRange.sci, viewRange.eci + 1);
  const nty = ty + h;
  const ntx = tx + w;

  // 非编辑模式，不渲染标题栏
  if (data.settings.mode !== 'edit') return;

  // 如果都为0，则不渲染
  if (w === 0 && h === 0) {
    // 画边线
    draw.save();
    draw.attr(tableFixedHeaderStyle());
    draw.line([0, 0], [0, sumHeight]);
    draw.restore();

    return;
  }

  draw.save();
  // draw rect background
  draw.attr(tableFixedHeaderCleanStyle);
  if (type === 'all' || h === 0) {
    draw.fillRect(0, nty, w, sumHeight);
  }
  if (type === 'all' || w === 0) {
    draw.fillRect(ntx, 0, sumWidth, h);
  }

  const { sri, eri, sci, eci } = data.selector.range;
  // draw text
  // text font, align...
  draw.attr(tableFixedHeaderStyle());
  // y-header-text
  if (type === 'all' || type === 'left') {
    data.rowEach(viewRange.sri, viewRange.eri, (i, y1, rowHeight) => {
      const y = nty + y1;
      const ii = i;
      draw.line([0, y], [w, y]);
      if (sri <= ii && ii < eri + 1) {
        renderSelectedHeaderCell.call(this, 0, y, w, rowHeight);
      }
      draw.fillText(ii + 1, w / 2, y + rowHeight / 2);
      if (i > 0 && data.rows.isHide(i - 1)) {
        draw.save();
        draw.attr({ strokeStyle: '#c6c6c6' });
        draw.line([5, y + 5], [w - 5, y + 5]);
        draw.restore();
      }
    });
    draw.line([0, sumHeight + nty], [w, sumHeight + nty]);
    draw.line([w, nty], [w, sumHeight + nty]);
  }
  // x-header-text
  if (type === 'all' || type === 'top') {
    data.colEach(viewRange.sci, viewRange.eci, (i, x1, colWidth) => {
      const x = ntx + x1;
      const ii = i;
      draw.line([x, 0], [x, h]);
      if (sci <= ii && ii < eci + 1) {
        renderSelectedHeaderCell.call(this, x, 0, colWidth, h);
      }
      draw.fillText(stringAt(ii), x + colWidth / 2, h / 2);
      if (i > 0 && data.cols.isHide(i - 1)) {
        draw.save();
        draw.attr({ strokeStyle: '#c6c6c6' });
        draw.line([x + 5, 5], [x + 5, h - 5]);
        draw.restore();
      }
    });
    draw.line([sumWidth + ntx, 0], [sumWidth + ntx, h]);
    draw.line([0, h], [sumWidth + ntx, h]);
  }
  draw.restore();
}

/**
 * 渲染标题栏和 index 栏左上角交界处单元格
 * @ignore
 * @param {number} fw 左边index栏宽度
 * @param {number} fh 表格最顶部标题栏高度
 */
function renderFixedLeftTopCell(fw, fh) {
  const { draw, data } = this;

  if (data.settings.mode !== 'edit') return;

  draw.save();
  // left-top-cell
  draw.attr({ fillStyle: '#f4f5f8' }).fillRect(0, 0, fw, fh);
  draw.restore();
}

/**
 * 渲染网格线
 * @ignore
 * @param {number} sri 开始行坐标
 * @param {number} sci 开始列坐标
 * @param {number} eri 结束行坐标
 * @param {number} eci 结束列坐标
 * @param {number} w 宽度
 * @param {number} h 高度
 * @param {number} fixedIndexWidth 左侧index固定列宽度 (1,2,3,4,5,6……列)
 * @param {number} fixedIndexHeight 顶部固定行高度 (A,B,C,D,E,F……行)
 * @param {number} freezeTotalWidth 表格中如果存有冻结行列，那么 freezeTotalWidth 为冻结行宽度总和
 * @param {number} freezeTotalHeight 表格中如果存有冻结行列，那么 freezeTotalHeight 为冻结行高度总和
 */
function renderContentGrid(
  { sri, sci, eri, eci, w, h },
  fixedIndexWidth,
  fixedIndexHeight,
  freezeTotalWidth,
  freezeTotalHeight
) {
  const { draw, data } = this;
  const { settings } = data;

  draw.save();
  draw.attr(tableGridStyle).translate(fixedIndexWidth + freezeTotalWidth, fixedIndexHeight + freezeTotalHeight);
  // const sumWidth = cols.sumWidth(sci, eci + 1);
  // const sumHeight = rows.sumHeight(sri, eri + 1);
  // console.log('sumWidth:', sumWidth);
  // draw.clearRect(0, 0, w, h);
  if (!settings.showGrid) {
    draw.restore();
    return;
  }

  data.rowEach(sri, eri, (i, y, ch) => {
    if (i !== sri) {
      draw.line([0, y], [w, y]);
    }
    if (i === eri) {
      draw.line([0, y + ch], [w, y + ch]);
    }
  });
  data.colEach(sci, eci, (i, x, cw) => {
    if (i !== sci) {
      draw.line([x, 0], [x, h]);
    }
    if (i === eci) {
      draw.line([x + cw, 0], [x + cw, h]);
    }
  });
  draw.restore();
}

/**
 * 渲染冻结行列高亮线。
 * @ignore
 * @param {number} fw 左边index栏宽度
 * @param {number} fh 表格最顶部标题栏高度
 * @param {number} ftw 表格中如果存有冻结行列，那么 ftw 为冻结行宽度总和
 * @param {number} fth 表格中如果存有冻结行列，那么 fth 为冻结行高度总和
 */
function renderFreezeHighlightLine(fw, fh, ftw, fth) {
  const { draw, data } = this;
  const twidth = data.viewWidth() - fw;
  const theight = data.viewHeight() - fh;
  draw.save().translate(fw, fh).attr({ strokeStyle: 'rgba(75, 137, 255, .6)' });
  draw.line([0, fth], [twidth, fth]);
  draw.line([ftw, 0], [ftw, theight]);
  draw.restore();
}

/**
 * 该类主要负责表格的绘制和渲染。
 */
class Table {
  constructor(el, data) {
    this.el = el;
    this.draw = new Draw(el, data.viewWidth(), data.viewHeight());
    this.data = data;
  }

  /**
   * 刷新数据
   * @param {DataProxy} data 数据
   */
  resetData(data) {
    this.data = data;
    this.render();
  }

  /**
   * 渲染表格
   */
  render() {
    // resize canvas
    const { data } = this;
    const {
      rows,
      cols,
      settings: { scale },
    } = data;
    // fixed width of header
    const fixedIndexWidth = cols.indexWidth;
    // fixed height of header
    const fixedIndexHeight = rows.indexHeight;

    this.draw.resize(data.viewWidth(), data.viewHeight());
    this.clear();
    if (typeof scale === 'number' && Number.parseFloat(scale) !== 1.0) {
      this.draw.scale(scale, scale);
    }

    const viewRange = data.viewRange();
    const freezeTotalWidth = data.freezeTotalWidth();
    const freezeTotalHeight = data.freezeTotalHeight();
    const { x, y } = data.scroll;
    // 1 渲染冻结十字轴右下角
    renderContentGrid.call(this, viewRange, fixedIndexWidth, fixedIndexHeight, freezeTotalWidth, freezeTotalHeight);
    renderContent.call(this, viewRange, fixedIndexWidth, fixedIndexHeight, -x, -y);
    renderFixedHeaders.call(
      this,
      'all',
      viewRange,
      fixedIndexWidth,
      fixedIndexHeight,
      freezeTotalWidth,
      freezeTotalHeight
    );
    renderFixedLeftTopCell.call(this, fixedIndexWidth, fixedIndexHeight);
    const [fri, fci] = data.freeze;
    // 当表格冻结时，十字轴把整个表格分割成4部分，可以相像成平面直角坐标系的4个象限。
    if (fri > 0 || fci > 0) {
      // 2 渲染冻结十字轴右上角
      if (fri > 0) {
        const vr = viewRange.clone();
        vr.sri = 0;
        vr.eri = fri - 1;
        vr.h = freezeTotalHeight;
        renderContentGrid.call(this, vr, fixedIndexWidth, fixedIndexHeight, freezeTotalWidth, 0);
        renderContent.call(this, vr, fixedIndexWidth, fixedIndexHeight, -x, 0);
        renderFixedHeaders.call(this, 'top', vr, fixedIndexWidth, fixedIndexHeight, freezeTotalWidth, 0);
      }
      // 3 渲染冻结十字轴左下角
      if (fci > 0) {
        const vr = viewRange.clone();
        vr.sci = 0;
        vr.eci = fci - 1;
        vr.w = freezeTotalWidth;
        renderContentGrid.call(this, vr, fixedIndexWidth, fixedIndexHeight, 0, freezeTotalHeight);
        renderFixedHeaders.call(this, 'left', vr, fixedIndexWidth, fixedIndexHeight, 0, freezeTotalHeight);
        renderContent.call(this, vr, fixedIndexWidth, fixedIndexHeight, 0, -y);
      }
      // 4 渲染冻结十字轴左上角
      const freezeViewRange = data.freezeViewRange();
      renderContentGrid.call(this, freezeViewRange, fixedIndexWidth, fixedIndexHeight, 0, 0);
      renderFixedHeaders.call(this, 'all', freezeViewRange, fixedIndexWidth, fixedIndexHeight, 0, 0);
      renderContent.call(this, freezeViewRange, fixedIndexWidth, fixedIndexHeight, 0, 0);
      // 5 渲染冻结十字轴线
      renderFreezeHighlightLine.call(this, fixedIndexWidth, fixedIndexHeight, freezeTotalWidth, freezeTotalHeight);
    }
  }

  /**
   * 清除表格绘制画板区域
   */
  clear() {
    this.draw.clear();
  }
}

export default Table;
