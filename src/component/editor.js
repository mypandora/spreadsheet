import { cssPrefix } from '../config';
import { h } from './element';
import Suggest from './suggest';
import Datepicker from './datepicker';
import Selectpicker from './widget/selectpicker';

/**
 * 动态刷新编辑框宽高设定函数
 * @ignore
 */
function resetTextareaSize() {
  let { inputText } = this;
  if (!/^\s*$/.test(inputText)) {
    // 因为我们扩展之后 inputText 有可能是数字类型，在这里要最好进行类型转换
    if (typeof inputText === 'number') {
      inputText = String(inputText);
    }
    const { textlineEl, textEl, areaOffset } = this;
    const txts = inputText.split('\n');
    const maxTxtSize = Math.max(...txts.map((it) => it.length));
    const tlOffset = textlineEl.offset();
    const fontWidth = tlOffset.width / inputText.length;
    const tlineWidth = (maxTxtSize + 1) * fontWidth + 5;
    const maxWidth = this.viewFn().width - areaOffset.left - fontWidth;
    let h1 = txts.length;
    if (tlineWidth > areaOffset.width) {
      let twidth = tlineWidth;
      if (tlineWidth > maxWidth) {
        twidth = maxWidth;
        h1 += parseInt(tlineWidth / maxWidth, 10);
        h1 += tlineWidth % maxWidth > 0 ? 1 : 0;
      }
      textEl.css('width', `${twidth}px`);
    }
    h1 *= this.rowHeight;
    if (h1 > areaOffset.height) {
      textEl.css('height', `${h1}px`);
    }
  }
}

/**
 * 插入文本值
 * @ignore
 * @param target
 * @param itxt
 */
function insertText({ target }, itxt) {
  const { value, selectionEnd } = target;
  const ntxt = `${value.slice(0, selectionEnd)}${itxt}${value.slice(selectionEnd)}`;
  target.value = ntxt;
  target.setSelectionRange(selectionEnd + 1, selectionEnd + 1);

  this.inputText = ntxt;
  this.textlineEl.html(ntxt);
  resetTextareaSize.call(this);
}

/**
 * 监听键盘按下事件触发函数
 * 注意：对 IME 无效 😂
 * @ignore
 * @param evt
 */
function keydownEventHandler(evt) {
  const { key, altKey } = evt;
  const { textEl, cell } = this;

  // 处理数字，仅允许数字输入
  if (cell?.type?.toLowerCase() === 'number') {
    // 负数，negative，简写为neg
    // 浮点数，floating point，简写为FP
    // 有效位数，Significant Figures, 简写为Sig. Fig
    const { numberNeg, numberFP, numberSig, numberMin, numberMax } = cell;
    const printableCharacters = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', '-'];
    const controlCcharacters = ['ArrowLeft', 'ArrowRight', 'Backspace', 'Home', 'End', 'Tab', 'Enter'];
    const allow = [...printableCharacters, ...controlCcharacters];
    // 如果输入禁止字符，退出；
    if (!allow.includes(key)) {
      evt.stopPropagation();
      evt.preventDefault();
    }

    if (printableCharacters.includes(key)) {
      const pos = textEl.el.selectionStart;
      let newVal = '';
      if (cell.text) {
        newVal = String(cell.text).split('');
        newVal.splice(pos, 0, key);
        newVal = newVal.join('');
      } else {
        newVal = String(key);
      }
      newVal = newVal?.trim();
      const reg = /^\d+$/;
      const regNeg = /^-?\d+$/; // 匹配负数
      const regFP = new RegExp(`^(([1-9]{1}\\d*)|(0{1}))(\\.\\d{0,${numberSig}})?$`); // 匹配指定精度浮点数
      const regNegFP = new RegExp(`^-?(([1-9]{1}\\d*)|(0{1}))(\\.\\d{0,${numberSig}})?$`); // 匹配指定精度的正负浮点数

      // 可负、可浮点
      if (numberNeg && numberFP) {
        if (!regNegFP.test(newVal) && newVal !== '-') {
          evt.stopPropagation();
          evt.preventDefault();
        }
      } else if (numberFP) {
        // 浮点
        if (!regFP.test(newVal)) {
          evt.stopPropagation();
          evt.preventDefault();
        }
      } else if (numberNeg) {
        // 负数
        if (newVal !== '-') {
          if (!regNeg.test(newVal)) {
            evt.stopPropagation();
            evt.preventDefault();
          }
        }
      } else {
        // 正数
        if (!reg.test(newVal)) {
          evt.stopPropagation();
          evt.preventDefault();
        }
      }

      // 如果是正确数字，但范围超出限制也退出
      if (+newVal && (newVal > numberMax || newVal < numberMin)) {
        evt.stopPropagation();
        evt.preventDefault();
      }
    }
  }

  if (key !== 'Enter' && key !== 'Tab') evt.stopPropagation();
  if (key === 'Enter' && altKey) {
    insertText.call(this, evt, '\n');
    evt.stopPropagation();
  }
  if (key === 'Enter' && !altKey) evt.preventDefault();
}

/**
 * 监听编辑框 textarea 输入事件触发函数
 * @ignore
 * @param evt
 */
function inputEventHandler(evt) {
  let v = evt.target.value;
  const { suggest, textEl, textlineEl, selectpicker, validator } = this;
  const { cell } = this;
  if (cell !== null) {
    if (('editable' in cell && cell.editable === true) || cell.editable === undefined) {
      // 因为在 IME 时，我们的数字类型判断将失效，所以在这里”事后补救“一下。
      // 先类型判断，如果为数字组件，且输入了非法字符，那我们就把非法字符删除，使用符合的数字显示。
      if (cell?.type === 'number') {
        const allowCharacters = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', '-'];
        v = String(v)
          .split('')
          .filter((item) => allowCharacters.includes(item))
          .join('');
        // 当它为空时，将无法被写入，我们使用一个特殊值代替一下。
        if (v === '') {
          v = ' ';
        }
        textEl.val(v?.trim());
      }

      // 因为我们要实现下拉框的可搜索功能，所以在这里把输入的内容传递给它。
      if (cell?.type === 'select') {
        selectpicker.setParam(v);
      }

      this.inputText = v;
      if (validator) {
        if (validator.type === 'select') {
          suggest.search(v);
        } else {
          suggest.hide();
        }
      } else {
        const start = String(v).lastIndexOf('=');
        if (start !== -1) {
          suggest.search(String(v).substring(start + 1));
        } else {
          suggest.hide();
        }
      }
      textlineEl.html(v);
      resetTextareaSize.call(this);
      this.change('input', { ...cell, text: v });
    } else {
      evt.target.value = cell.text || '';
    }
  } else {
    this.inputText = v;
    if (validator) {
      if (validator.type === 'select') {
        suggest.search(v);
      } else {
        suggest.hide();
      }
    } else {
      const start = v.lastIndexOf('=');
      if (start !== -1) {
        suggest.search(v.substring(start + 1));
      } else {
        suggest.hide();
      }
    }
    textlineEl.html(v);
    resetTextareaSize.call(this);
    this.change('input', v);
  }
}

/**
 * 设置编辑框 textarea 中的光标位置
 * @ignore
 * @param position
 */
function setTextareaRange(position) {
  const { el } = this.textEl;
  setTimeout(() => {
    el.focus();
    el.setSelectionRange(position, position);
  }, 0);
}

/**
 * 设置编辑框 textarea 中的光标位置，并且设定值
 * @ignore
 * @param text
 * @param position
 */
function setText(text, position) {
  const { textEl, textlineEl } = this;
  // firefox bug
  textEl.el.blur();

  textEl.val(text);
  textlineEl.html(text);
  setTextareaRange.call(this, position);
}

/**
 * 设置输入状态下提示框点击事件
 * @ignore
 * @param it
 */
function suggestItemClick(it) {
  const { inputText, validator } = this;
  let position = 0;
  if (validator && validator.type === 'select') {
    this.inputText = typeof it === 'object' ? it.name : it;
    if (typeof it === 'object') {
      this.cell = { ...it, text: it.name };
    }
    position = this.inputText.length;
  } else {
    const start = inputText.lastIndexOf('=');
    const sit = inputText.substring(0, start + 1);
    let eit = inputText.substring(start + 1);
    if (eit.indexOf(')') !== -1) {
      eit = eit.substring(eit.indexOf(')'));
    } else {
      eit = '';
    }
    this.inputText = `${sit + it.key}(`;
    position = this.inputText.length;
    this.inputText += `)${eit}`;
  }
  setText.call(this, this.inputText, position);
}

/**
 * 重置提示框内容设置函数
 * @ignore
 */
function resetSuggestItems() {
  this.suggest.setItems(this.formulas);
}

/**
 * 日期格式化
 * @ignore
 * @param d
 * @returns {string}
 */
function dateFormat(d) {
  let month = d.getMonth() + 1;
  let date = d.getDate();
  if (month > 10) {
    month = `0${month}`;
  }
  if (date < 10) {
    date = `0${date}`;
  }
  return `${d.getFullYear()}-${month}-${date}`;
}

/**
 * 页面编辑框，动态更新位置，换行，设定表格值，提示建议触发处，验证器相关。
 */
class Editor {
  /**
   * @hideconstructor
   * @param formulas
   * @param viewFn
   * @param rowHeight
   */
  constructor(formulas, viewFn, rowHeight) {
    this.viewFn = viewFn;
    this.rowHeight = rowHeight;
    this.formulas = formulas;
    this.suggest = new Suggest(formulas, (it) => {
      suggestItemClick.call(this, it);
    });
    this.datepicker = new Datepicker();
    this.datepicker.change((d) => {
      this.setText(dateFormat(d));
      this.clear();
    });
    // 仿照datepicker
    this.selectpicker = new Selectpicker();
    this.selectpicker.change((it) => {
      this.setText(it.label, it.value);
      this.clear();
    });
    this.areaEl = h('div', `${cssPrefix}-editor-area`)
      .children(
        (this.textEl = h('textarea', '')
          .attr('title', '编辑')
          .on('input', (evt) => inputEventHandler.call(this, evt))
          .on('paste.stop', () => {})
          .on('keydown', (evt) => keydownEventHandler.call(this, evt))),
        (this.textlineEl = h('div', 'textline')),
        this.suggest.el,
        this.datepicker.el,
        this.selectpicker.el
      )
      .on('mousemove.stop', () => {})
      .on('mousedown.stop', () => {});
    this.el = h('div', `${cssPrefix}-editor`).child(this.areaEl).hide();
    this.suggest.bindInputEvents(this.textEl);

    this.areaOffset = null;
    this.freeze = { w: 0, h: 0 };
    this.cell = null;
    this.inputText = '';
    this.change = () => {}; // 等待外部注入事件，比如注入 setSelectedCellText 设置选中单元格文字方法。
  }

  /**
   * 保存冻结行列设定的宽高到配置中，便于计算
   * @param width
   * @param height
   */
  setFreezeLengths(width, height) {
    this.freeze.w = width;
    this.freeze.h = height;
  }

  /**
   * 清除所有输入状态，设定为默认值
   */
  clear() {
    if (this.inputText !== '') {
      // 在这里做个判断，为什么判断呢？
      // 当我们的单元格类型为下拉框时，用户输入了值而不是我们下拉列表中的值，这时候就可能导致值不对。
      // 当用户输入了非下拉框的值时，我们使用上一次正确的值。
      if (this.cell?.type === 'select') {
        // 获取旧值，查看是否匹配
        const oldValue = this.selectpicker.getText(this.inputText);
        this.change('finished', { ...this.cell, text: oldValue?.trim() });
      } else if (this.cell?.type === 'number') {
        this.change('finished', { ...this.cell, text: String(this.inputText).trim() });
      } else {
        this.change('finished', { ...this.cell, text: this.inputText });
      }
    }
    this.cell = null;
    this.areaOffset = null;
    this.inputText = '';
    this.el.hide();
    this.textEl.val('');
    this.textlineEl.html('');
    resetSuggestItems.call(this);
    this.datepicker.hide();
    this.selectpicker.hide();
  }

  /**
   * 设定编辑器偏移量，定位
   * @param offset
   * @param suggestPosition
   */
  setOffset(offset, suggestPosition = 'top') {
    const { textEl, areaEl, suggest, freeze, el } = this;
    if (offset) {
      this.areaOffset = offset;
      const { left, top, width, height, l, t } = offset;
      const elOffset = { left: 0, top: 0 };
      // top left
      if (freeze.w > l && freeze.h > t) {
        //
      } else if (freeze.w < l && freeze.h < t) {
        elOffset.left = freeze.w;
        elOffset.top = freeze.h;
      } else if (freeze.w > l) {
        elOffset.top = freeze.h;
      } else if (freeze.h > t) {
        elOffset.left = freeze.w;
      }
      el.offset(elOffset);
      areaEl.offset({ left: left - elOffset.left - 0.8, top: top - elOffset.top - 0.8 });
      textEl.offset({ width: width - 9 + 0.8, height: height - 3 + 0.8 });
      const sOffset = { left: 0 };
      sOffset[suggestPosition] = height;
      suggest.setOffset(sOffset);
      suggest.hide();
    }
  }

  /**
   * 设置单元格的值，并加载验证器
   * @param cell
   * @param validator
   */
  setCell(cell, validator) {
    if (cell && cell.editable === false) return;

    const { el, datepicker, selectpicker } = this;
    el.show();
    this.cell = cell;
    const text = (cell && cell.text) || '';
    this.setText(text);

    this.validator = validator;
    // 原版代码中，日期与下拉框是通过数据验证功能设置之后才显示，而我们的代码中，类型是直接添加到单元格属性当中的，这么做的一个原因是方便渲染时，在单元格中直接渲染相应的图标。
    if (cell) {
      const { type } = cell;
      if (type === 'date') {
        datepicker.show();
        if (!/^\s*$/.test(text)) {
          datepicker.setValue(text);
        }
      }
      if (type === 'select') {
        selectpicker.show();
        selectpicker.setData(cell);
      }
    }

    // 暂时先关闭验证
    // if (validator) {
    //   const { type } = validator;
    //   if (type === 'date') {
    //     datepicker.show();
    //     if (!/^\s*$/.test(text)) {
    //       datepicker.setValue(text);
    //     }
    //   }
    //   if (type === 'select') {
    //     suggest.setItems(validator.values());
    //     suggest.search('');
    //   }
    // }
  }

  /**
   * 设定值，并更新输入框大小
   * 因为我们扩展了原单元格属性，导致原方法 #setText(text) 不能满足我们的需求，故扩展了此方法为#setText(text, value)。
   * @param {*} text 单元格文本值，用于显示
   * @param {*} value 单元格值，当类型为select这种时，text用于显示，value用于存储
   */
  setText(text, value) {
    this.inputText = text;

    // 扩展
    if (value) {
      Object.assign(this.cell, { text, value });
    }
    // 因为我们扩展之后，text 有可能是数字
    setText.call(this, text, String(text).length);
    resetTextareaSize.call(this);
  }

  resetData(data) {
    this.selectpicker.resetData(data);
  }
}

export default Editor;
