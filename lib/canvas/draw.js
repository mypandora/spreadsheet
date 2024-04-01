/**
 * Window 接口的devicePixelRatio返回当前显示设备的物理像素分辨率与CSS像素分辨率之比。
 * 此值也可以解释为像素大小的比率：一个CSS像素的大小与一个物理像素的大小。
 * 简单来说，它告诉浏览器应使用多少屏幕实际像素来绘制单个CSS像素。
 * 当处理标准显示器与HiDPI或Retina显示器之间的差异时，这很有用，后者使用更多的屏幕像素绘制相同的对象，从而获得更清晰的图像。
 * @ignore
 * @returns {number} 当前显示设备的物理像素分辨率与CSS像素分辨率之比，默认返回1。
 */
function dpr() {
  return window.devicePixelRatio || 1;
}

function thinLineWidth() {
  return dpr();
}

/**
 * 输入逻辑像素，输出物理像素。
 * @ignore
 * @param {number} px - 逻辑像素
 * @returns {number} 物理像素。
 */
function npx(px) {
  return parseInt(String(px * dpr()), 10);
}

// 添加偏移量
function npxLine(px) {
  const n = npx(px);
  return n > 0 ? n - 0.5 : 0.5;
}

/**
 * @ignore
 * @class
 * 基于canvas元素，使用js在页面上绘制单元格，一个DrawBox对象代表一个单元格，存储样式和方位信息。
 */
class DrawBox {
  /**
   *
   * @param {number} x - 横坐标
   * @param {number} y - 纵坐标
   * @param {number} w - 单元格宽度
   * @param {number} h - 单元格高度
   * @param {number} padding - 单元格内边距
   */
  constructor(x, y, w, h, padding = 0) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.padding = padding;
    this.bgcolor = '#ffffff';
    // border: [width, style, color]
    this.borderTop = null;
    this.borderRight = null;
    this.borderBottom = null;
    this.borderLeft = null;
  }

  /**
   * 设定边框。
   * @param {Object} position - 边框对象
   * @param {*} top - 上边框
   * @param {*} bottom - 下边框
   * @param {*} left - 左边框
   * @param {*} right - 右边框
   */
  setBorders({ top, bottom, left, right }) {
    if (top) {
      this.borderTop = top;
    }
    if (right) {
      this.borderRight = right;
    }
    if (bottom) {
      this.borderBottom = bottom;
    }
    if (left) {
      this.borderLeft = left;
    }
  }

  /**
   * 获取实际内容区域的宽度。
   * @returns {number} 内容区域宽度。
   */
  innerWidth() {
    return this.width - this.padding * 2 - 2;
  }

  /**
   * 获取实际内容区域的高度。
   * @returns {number} 内容区域高度。
   */
  innerHeight() {
    return this.height - this.padding * 2 - 2;
  }

  /**
   * 根据输入判断水平对齐模式。
   * @param {string} align - 水平对齐模式
   * @returns {number} 文本横坐标值。
   */
  textx(align) {
    const { width, padding } = this;
    let { x } = this;
    if (align === 'left') {
      x += padding;
    } else if (align === 'center') {
      x += width / 2;
    } else if (align === 'right') {
      x += width - padding;
    }
    return x;
  }

  /**
   * 根据输入判断垂直对齐模式。
   * @param {string} align - 垂直对齐模式
   * @param h // TODO
   * @returns {number} 文本纵坐标值。
   */
  texty(align, h) {
    const { height, padding } = this;
    let { y } = this;
    if (align === 'top') {
      y += padding;
    } else if (align === 'middle') {
      y += height / 2 - h / 2;
    } else if (align === 'bottom') {
      y += height - padding - h;
    }
    return y;
  }

  /**
   * 获取上边框线的坐标。
   * @returns {number[][]} 上边框线坐标。
   */
  topxys() {
    const { x, y, width } = this;
    return [
      [x, y],
      [x + width, y],
    ];
  }

  /**
   * 获取右边框线的坐标。
   * @returns {number[][]} 右边框线坐标。
   */
  rightxys() {
    const { x, y, width, height } = this;
    return [
      [x + width, y],
      [x + width, y + height],
    ];
  }

  /**
   * 返回下边框线的坐标。
   * @returns {number[][]} 下边框线的坐标。
   */
  bottomxys() {
    const { x, y, width, height } = this;
    return [
      [x, y + height],
      [x + width, y + height],
    ];
  }

  /**
   * 返回左边框线的坐标。
   * @returns {number[][]} 左边框线的坐标。
   */
  leftxys() {
    const { x, y, height } = this;
    return [
      [x, y],
      [x, y + height],
    ];
  }
}

function drawFontLine(type, tx, ty, align, valign, blheight, blwidth) {
  const floffset = {
    x: 0,
    y: 0,
  };
  if (type === 'underline') {
    if (valign === 'bottom') {
      floffset.y = 0;
    } else if (valign === 'top') {
      floffset.y = -(blheight + 2);
    } else {
      floffset.y = -blheight / 2;
    }
  } else if (type === 'strike') {
    if (valign === 'bottom') {
      floffset.y = blheight / 2;
    } else if (valign === 'top') {
      floffset.y = -(blheight / 2 + 2);
    }
  }

  if (align === 'center') {
    floffset.x = blwidth / 2;
  } else if (align === 'right') {
    floffset.x = blwidth;
  }
  this.line([tx - floffset.x, ty - floffset.y], [tx - floffset.x + blwidth, ty - floffset.y]);
}

/**
 * @ignore
 * @class
 * 基于canvas元素，使用js在页面上绘制单元格，封装了 canvas 的 ctx 对象和一些方法。
 */
class Draw {
  constructor(el, width, height) {
    this.el = el;
    this.ctx = el.getContext('2d');
    this.resize(width, height);
    this.ctx.scale(dpr(), dpr()); // 提前根据缩放因子进行缩放
  }

  /**
   * 重置HTMLCanvasElement元素。
   * @param {number} width - 宽度
   * @param {number} height - 高度
   */
  resize(width, height) {
    this.el.style.width = `${width}px`;
    this.el.style.height = `${height}px`;
    this.el.width = npx(width);
    this.el.height = npx(height);
  }

  /**
   * 清除画布。
   * @returns {Draw} CanvasRenderingContext2D 实例
   */
  clear() {
    const { width, height } = this.el;
    this.ctx.clearRect(0, 0, width, height);
    return this;
  }

  /**
   * 设置属性。
   * @param {Object} options - canvasRenderingContext2D 实例属性
   * @returns {Draw} CanvasRenderingContext2D 实例
   */
  attr(options) {
    Object.assign(this.ctx, options);
    return this;
  }

  /**
   * 保存状态。
   * @returns {Draw} CanvasRenderingContext2D 实例
   */
  save() {
    this.ctx.save();
    this.ctx.beginPath();
    return this;
  }

  /**
   * 恢复状态。
   * @returns {Draw}  CanvasRenderingContext2D 实例
   */
  restore() {
    this.ctx.restore();
    return this;
  }

  /**
   * 清空子路径列表开始一个新路径。
   * @returns {Draw}  CanvasRenderingContext2D 实例
   */
  beginPath() {
    this.ctx.beginPath();
    return this;
  }

  /**
   * 平移变换方法。
   * @param {number} x - 水平方向移动距离
   * @param {number} y - 垂直方向移动距离
   * @returns {Draw} CanvasRenderingContext2D 实例
   */
  translate(x, y) {
    this.ctx.translate(npx(x), npx(y));
    return this;
  }

  /**
   *缩放变换方法。
   * @param {number} x - 水平方向绽放因子
   * @param {number} y - 垂直方向绽放因子
   * @returns {Draw} CanvasRenderingContext2D 实例
   */
  scale(x, y) {
    this.ctx.scale(x, y);
    return this;
  }

  /**
   * 清除指定区域画布。
   * @param {number} x - 矩形起点的X轴坐标
   * @param {number} y - 矩形起点的Y轴坐标
   * @param {number} w - 矩形的宽度
   * @param {number} h - 矩形的高度
   * @returns {Draw} CanvasRenderingContext2D 实例
   */
  clearRect(x, y, w, h) {
    this.ctx.clearRect(x, y, w, h);
    return this;
  }

  /**
   * 绘制一个填充了内容的矩形，这个矩形的开始点（左上点）在(x, y) ，它的宽度和高度分别由width 和 height 确定，填充样式由当前的fillStyle 决定
   * @param {number } x - 矩形起始点的 x 轴坐标
   * @param {number } y - 矩形起始点的 y 轴坐标
   * @param {number } w - 矩形的宽度
   * @param {number } h - 矩形的高度
   * @returns {Draw} CanvasRenderingContext2D 实例
   */
  fillRect(x, y, w, h) {
    this.ctx.fillRect(npx(x) - 0.5, npx(y) - 0.5, npx(w), npx(h));
    return this;
  }

  /**
   * 在 (x, y)位置填充文本
   * @param {string} text - 使用当前的 font, textAlign, textBaseline 和 direction 值对文本进行渲染
   * @param {number} x = 文本起点的 x 轴坐标
   * @param {number} y = 文本起点的 y 轴坐标
   * @returns {Draw} CanvasRenderingContext2D 实例
   */
  fillText(text, x, y) {
    this.ctx.fillText(text, npx(x), npx(y));
    return this;
  }

  /**
   * 画一条线组件。为什么我们要提供这么一个组件呢？
   * 这是我们的业务决定的，我们的业务除了设计模式之外，还有一种填报模式，这种模式下，只有设计好的地方才可以编辑，为了让用户能够编辑，我们需要提供一个组件，这个组件就是线。
   * 为什么不直接使用原来的呢？因为要区分有点麻烦，为了简单，直接提供一个新组件了。
   * @param {*} box - 一个 DrawBox 对象
   * @param {*} style - 样式
   * @returns {Draw} CanvasRenderingContext2D 实例
   */
  fillInput(box) {
    const { x, y, width, height } = box;

    // if (style?.border?.bottom && style?.border?.bottom.length > 0) {
    //   return this;
    // }

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.lineWidth = npx(1);
    this.ctx.strokeStyle = '#666';

    // 计算左下角位置
    const sx = x + 3;
    const sy = y + height - 3;

    this.ctx.moveTo(npxLine(sx), npxLine(sy));
    this.ctx.lineTo(npxLine(sx + width - 6), npxLine(sy));
    this.ctx.stroke();

    this.ctx.restore();
    return this;
  }

  /**
   * CanvasRenderingContext2D.arc() 是 Canvas 2D API 绘制圆弧路径的方法。
   * 圆弧路径的圆心在 (x, y) 位置，半径为 r ，根据anticlockwise （默认为顺时针）指定的方向从 startAngle 开始绘制，到 endAngle 结束。
   * @param {*} box - 一个 DrawBox 对象
   * @param {*} cell - cell 对象
   * @param {number} radius - 圆弧的半径
   * @param {number} startAngle - 圆弧的起始点， x轴方向开始计算，单位以弧度表示
   * @param {number} endAngle - 圆弧的终点， 单位以弧度表示
   * @param {boolean} anticlockwise - 可选的Boolean值 ，如果为 true，逆时针绘制圆弧，反之，顺时针绘制
   * @returns {Draw} CanvasRenderingContext2D 实例
   */
  fillRadio(box, { checked }, radius = 6, startAngle = 0, endAngle = 2 * Math.PI, anticlockwise = true) {
    const { x, y, height } = box;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.lineWidth = npx(1);

    // 圆心，x偏移10，y为单元格中高
    const sx = x + 9;
    const sy = y + Math.ceil(height / 2);

    // 外圆
    this.ctx.arc(npx(sx), npx(sy), npx(radius), startAngle, endAngle, anticlockwise);
    this.ctx.strokeStyle = 'rgba(0, 0, 0, .45)';
    this.ctx.stroke();

    if (checked) {
      // 外圆颜色，覆盖默认的颜色
      this.ctx.strokeStyle = '#4b89ff';
      this.ctx.stroke();

      // 圆心
      this.ctx.beginPath();
      // this.ctx.moveTo(npx(sx), npx(sy));
      this.ctx.arc(npx(sx), npx(sy), npx(radius / 2), startAngle, endAngle, anticlockwise);
      this.ctx.fillStyle = '#4b89ff';
      this.ctx.fill();
    }

    this.ctx.restore();
    return this;
  }

  /**
   * CanvasRenderingContext2D.rect() 是 Canvas 2D API 创建矩形路径的方法，
   * 矩形的起点位置是 (x, y) ，尺寸为 width 和 height。矩形的4个点通过直线连接，子路径做为闭合的标记，所以你可以填充或者描边矩形。
   * @param {*} box - 一个 DrawBox 对象
   * @param {*} cell - cell 对象
   */
  fillCheckbox(box, { checked }) {
    const { x, y, height } = box;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.lineWidth = npx(1);

    // 计算左上角位置
    const sx = x + 5;
    const sy = y + Math.ceil(height / 2) - 6;
    // 边长，与圆的直径相等
    const side = 12;
    const offset = 1; // 偏移量

    // 外框
    this.ctx.rect(npx(sx), npx(sy), npx(side), npx(side));
    this.ctx.strokeStyle = 'rgba(0, 0, 0, .45)';
    this.ctx.stroke();

    if (checked) {
      // 实体矩形覆盖默认的外框
      this.ctx.rect(npx(sx), npx(sy), npx(side + 1), npx(side + 1));
      this.ctx.fillStyle = '#4b89ff';
      this.ctx.fill();

      // 空白对勾
      // 1A|  1B|  1C|  1D
      // 2A|  2B|  2C|  2D
      // 3A|  3B|  3C|  3D
      // 4A|  4B|  4C|  4D
      // x,y 默认位于 1A 位置
      // 将画笔移动到 2.5A 位置
      this.ctx.beginPath();
      this.ctx.moveTo(npx(sx + offset), npx(sy + side / 2));
      // 用画笔连接 2.5A 至 4B 两点
      this.ctx.lineTo(npx(sx + side / 4 + offset), npx(sy + side - offset));
      // 最后将线画到 1D 位置
      this.ctx.lineTo(npx(sx + side - offset), npx(sy + offset));
      this.ctx.strokeStyle = 'white';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }

    this.ctx.restore();
    return this;
  }

  /**
   * CanvasRenderingContext2D.rect() 是 Canvas 2D API 创建矩形路径的方法，
   * 矩形的起点位置是 (x, y) ，尺寸为 width 和 height。矩形的4个点通过直线连接，子路径做为闭合的标记，所以你可以填充或者描边矩形。
   * @param {*} box - 一个 DrawBox 对象
   * @param {*} cell - cell 对象
   * @param {number} cell.inputLength - 输入框个数
   */
  fillInputGroup(box, { inputLength }) {
    const { x, y, height } = box;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.lineWidth = npx(1);

    // 计算左上角位置
    const sx = x + 5;
    const sy = y + Math.ceil(height / 2) - 8;
    // 边长，因为要在里面写数字，所以比一般复选框大一点
    const side = 15;
    const offset = 5; // 偏移量

    let everyX;
    for (let i = 0; i < inputLength; i += 1) {
      everyX = sx + i * (side + offset);
      this.ctx.rect(npx(everyX), npx(sy), npx(side), npx(side));
    }
    this.ctx.stroke();

    this.ctx.restore();
    return this;
  }

  /**
   * 画日期图标。
   * @param {*} box - 一个 DrawBox 对象
   * @returns {Draw}
   */
  fillDate(box) {
    const { x, y, height } = box;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.lineWidth = npx(1);

    // 计算左上角位置
    const sx = x + 5;
    const sy = y + Math.ceil(height / 2) - 6;
    // 边长，与圆的直径相等
    const side = 12;

    // 外框及直线
    this.ctx.rect(npx(sx), npx(sy), npx(side), npx(side));
    this.ctx.moveTo(npx(sx), npx(sy + side / 3));
    this.ctx.lineTo(npx(sx + side), npx(sy + side / 3));
    this.ctx.stroke();

    // 虚线
    this.ctx.beginPath();
    this.ctx.setLineDash([2, 2]);
    this.ctx.moveTo(npx(sx), npx(sy + (side * 2) / 3));
    this.ctx.lineTo(npx(sx + side), npx(sy + (side * 2) / 3));
    this.ctx.stroke();

    this.ctx.restore();
    return this;
  }

  /**
   * 画下拉框的倒三角形。
   * @param {*} box - 一个 DrawBox 对象
   */
  fillSelect(box) {
    const { x, y, width, height } = box;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.lineWidth = npx(1);

    const sx = x + width - 15;
    const sy = y + Math.min(height - 15, Math.ceil(height / 2 + 3));

    this.ctx.moveTo(npx(sx), npx(sy));
    this.ctx.lineTo(npx(sx + 8), npx(sy));
    this.ctx.lineTo(npx(sx + 4), npx(sy + 6));
    this.ctx.fillStyle = 'rgba(0, 0, 0, .45)';
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
    return this;
  }

  /**
   * 画图片。
   * @param {*} box - 一个 DrawBox 对象
   * @param {string} src - 图片的路径
   * @param {Object} fixedIndexWidth - 行坐标宽度
   * @param {Object} fixedIndexHeight - 列坐标高度
   */
  fillImage(box, { value: src }, { fixedIndexWidth, fixedIndexHeight }) {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      this.ctx.save();
      const { x, y, width, height } = box;
      // 计算左上角位置，为什么translate没有生效呢？因为异步……
      const sx = x + fixedIndexWidth;
      const sy = y + fixedIndexHeight;
      this.ctx.drawImage(img, npx(sx), npx(sy), npx(width), npx(height));
      this.ctx.restore();
    };

    return this;
  }

  /**
   * 绘制图形。
   * 在这里本方法参考text方法的逻辑，当单元格为 radio, checkbox, date 时，在文字前添加相应的图形。
   * @param {Object} cell - 单元格
   * @param {Object} box - DrawBox
   * @param {Object} fixedIndexWidth - 行坐标宽度
   * @param {Object} fixedIndexHeight - 列坐标高度
   * @returns {Draw} CanvasRenderingContext2D 实例
   */
  geometry(cell, box, { fixedIndexWidth, fixedIndexHeight }) {
    const { type } = cell;

    switch (type) {
      case 'number':
        this.fillInput(box);
        break;
      case 'radio':
        this.fillRadio(box, cell);
        break;
      case 'checkbox':
        this.fillCheckbox(box, cell);
        break;
      case 'date':
        this.fillDate(box);
        break;
      case 'select':
        this.fillSelect(box);
        break;
      case 'image':
        this.fillImage(box, cell, { fixedIndexWidth, fixedIndexHeight });
        break;
      default:
    }

    return this;
  }

  /*
    txt: render text
    box: DrawBox
    attr: {
      align: left | center | right
      valign: top | middle | bottom
      color: '#333333',
      strike: false,
      font: {
        name: 'Arial',
        size: 14,
        bold: false,
        italic: false,
      }
    }
    textWrap: text wrapping
  */
  /**
   * 填充文本
   * @param mtxt
   * @param box
   * @param attr
   * @param textWrap
   * @returns {Draw}
   */
  text(mtxt, box, attr = {}, textWrap = true) {
    const { ctx } = this;
    const { align, valign, font, color, strike, underline, offset } = attr;
    const [txOffset] = offset;
    const tx = box.textx(align) + txOffset;
    ctx.save();
    ctx.beginPath();
    this.attr({
      textAlign: align,
      textBaseline: valign,
      font: `${font.italic ? 'italic' : ''} ${font.bold ? 'bold' : ''} ${npx(font.size)}px ${font.name}`,
      fillStyle: color,
      strokeStyle: color,
    });
    const txts = `${mtxt}`.split('\n');
    const biw = box.innerWidth();
    const ntxts = [];
    txts.forEach((it) => {
      const txtWidth = ctx.measureText(it).width;
      if (textWrap && txtWidth > npx(biw)) {
        let textLine = {
          w: 0,
          len: 0,
          start: 0,
        };
        for (let i = 0; i < it.length; i += 1) {
          if (textLine.w >= npx(biw)) {
            ntxts.push(it.substr(textLine.start, textLine.len));
            textLine = {
              w: 0,
              len: 0,
              start: i,
            };
          }
          textLine.len += 1;
          textLine.w += ctx.measureText(it[i]).width + 1;
        }
        if (textLine.len > 0) {
          ntxts.push(it.substr(textLine.start, textLine.len));
        }
      } else {
        ntxts.push(it);
      }
    });
    const txtHeight = (ntxts.length - 1) * (font.size + 2);
    let ty = box.texty(valign, txtHeight);
    ntxts.forEach((txt) => {
      const txtWidth = ctx.measureText(txt).width;
      this.fillText(txt, tx, ty);
      if (strike) {
        drawFontLine.call(this, 'strike', tx, ty, align, valign, font.size, txtWidth);
      }
      if (underline) {
        drawFontLine.call(this, 'underline', tx, ty, align, valign, font.size, txtWidth);
      }
      ty += font.size + 2;
    });
    ctx.restore();
    return this;
  }

  /**
   * 设置边框样式
   * @param style
   * @param color
   * @returns {Draw}
   */
  border(style, color) {
    const { ctx } = this;
    ctx.lineWidth = thinLineWidth();
    ctx.strokeStyle = color;
    ctx.isDoubleLine = false;
    if (style === 'medium') {
      ctx.lineWidth = npx(2) - 0.5;
    } else if (style === 'thick') {
      ctx.lineWidth = npx(3);
    } else if (style === 'dashed') {
      ctx.setLineDash([npx(3), npx(2)]);
    } else if (style === 'dotted') {
      ctx.setLineDash([npx(1), npx(1)]);
    } else if (style === 'double') {
      // ctx.setLineDash([npx(2), 0]);
      ctx.lineWidth = npx(3);
      ctx.isDoubleLine = true;
    }
    return this;
  }

  /**
   * 画斜线
   * 在这里画的斜线是单元格的对角线，所以只有一条，如果画多条，要计算起始点坐标。
   * @param box 选中的单元格
   */
  slash(box) {
    const { ctx } = this;
    const { x, y, width, height } = box;
    ctx.lineWidth = thinLineWidth();
    this.line([x, y], [x + width, y + height]);
  }

  /**
   * 画直线。
   * 在这里为了处理奇数线宽问题，加了偏移量。
   * 查看发现它的参数只有2个，故特殊处理一下。
   * @see https://usefulangle.com/post/17/html5-canvas-drawing-1px-crisp-straight-lines
   *
   * 关于双连线边框可以参考：
   * @see https://segmentfault.com/a/1190000017459301
   * @param xys [x1,y1],[x2,y2] 起止点坐标
   * @returns {Draw}
   */
  line(...xys) {
    const { ctx } = this;
    if (xys.length > 1) {
      ctx.beginPath();
      const [x, y] = xys[0];
      ctx.moveTo(npxLine(x), npxLine(y));
      for (let i = 1; i < xys.length; i += 1) {
        const [x1, y1] = xys[i];
        ctx.lineTo(npxLine(x1), npxLine(y1));
      }
      ctx.stroke();
      // }
      // if (xys.length > 1) {
      //   ctx.beginPath();
      //   // 起点坐标
      //   let [x, y] = xys[0];
      //   // 终点坐标
      //   let [x1, y1] = xys[1];
      //
      //   const lineWidth = ctx.lineWidth;
      //   if (lineWidth % 2 === 0) {
      //     // 不需要添加偏移量
      //     x = npx(x);
      //     y = npx(y);
      //     x1 = npx(x1);
      //     y1 = npx(y1);
      //   } else {
      //     if (y === y1) {
      //       // 画水平线，为y, y1添加偏移量
      //       y = npxLine(y);
      //       y1 = npxLine(y1);
      //       //
      //       x = npx(x);
      //       x1 = npx(x1);
      //     } else if (x === x1) {
      //       // 画垂直线，为x, x1添加偏移量
      //       x = npxLine(x);
      //       x1 = npxLine(x1);
      //       //
      //       y = npx(y);
      //       y1 = npx(y1);
      //     } else {
      //       x = npx(x);
      //       y = npx(y);
      //       x1 = npx(x1);
      //       y1 = npx(y1);
      //     }
      //   }
      //   ctx.moveTo(x, y);
      //   ctx.lineTo(x1, y1);
      //   ctx.stroke();

      // 在这里可以判断一下，如果是双边框，则再原基础上再画一条线
      // 与上面 L:598 设置一致。
      if (ctx.isDoubleLine) {
        ctx.save();
        ctx.lineWidth = thinLineWidth();
        // 方法一
        ctx.globalCompositeOperation = 'destination-out';
        // 方法二
        // ctx.strokeStyle = 'white';
        // ctx.lineCap = 'square';
        ctx.stroke();
        ctx.restore();
      }
    }
    return this;
  }

  /**
   * 绘制边框
   * @param box
   */
  strokeBorders(box) {
    const { ctx } = this;
    ctx.save();
    ctx.beginPath();
    ctx.lineCap = 'butt';
    // border
    const { borderTop, borderRight, borderBottom, borderLeft } = box;

    if (borderTop && borderRight && borderBottom && borderLeft) {
      const set = new Set([borderTop[0], borderRight[0], borderBottom[0], borderLeft[0]]);
      if (set.size === 1) {
        ctx.lineCap = 'square';
      }
    }

    if (borderTop) {
      this.border(...borderTop);
      this.line(...box.topxys());
    }
    if (borderRight) {
      this.border(...borderRight);
      this.line(...box.rightxys());
    }
    if (borderBottom) {
      this.border(...borderBottom);
      this.line(...box.bottomxys());
    }
    if (borderLeft) {
      this.border(...borderLeft);
      this.line(...box.leftxys());
    }
    ctx.restore();
  }

  dropdown(box) {
    const { ctx } = this;
    const { x, y, width, height } = box;
    const sx = x + width - 15;
    const sy = y + height - 15;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(npx(sx), npx(sy));
    ctx.lineTo(npx(sx + 8), npx(sy));
    ctx.lineTo(npx(sx + 4), npx(sy + 6));
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 0, 0, .45)';
    ctx.fill();
    ctx.restore();
  }

  error(box) {
    const { ctx } = this;
    const { x, y, width } = box;
    const sx = x + width - 1;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(npx(sx - 8), npx(y - 1));
    ctx.lineTo(npx(sx), npx(y - 1));
    ctx.lineTo(npx(sx), npx(y + 8));
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 0, 0, .65)';
    ctx.fill();
    ctx.restore();
  }

  frozen(box) {
    const { ctx } = this;
    const { x, y, width } = box;
    const sx = x + width - 1;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(npx(sx - 8), npx(y - 1));
    ctx.lineTo(npx(sx), npx(y - 1));
    ctx.lineTo(npx(sx), npx(y + 8));
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 255, 0, .85)';
    ctx.fill();
    ctx.restore();
  }

  rect(box, dtextcb) {
    const { ctx } = this;
    const { x, y, width, height, bgcolor } = box;
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = bgcolor || '#fff';
    ctx.rect(npxLine(x + 1), npxLine(y + 1), npx(width - 2), npx(height - 2));
    ctx.clip();
    ctx.fill();
    dtextcb();
    ctx.restore();
  }
}

export { Draw, DrawBox, thinLineWidth, npx };
