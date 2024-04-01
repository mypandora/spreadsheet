import { h } from './element';
import { cssPrefix } from '../config';
import CellRange from '../core/cell-range';

let startZIndex = 10;
const selectorHeightBorderWidth = 2 * 2 - 1;

class SelectorElement {
  constructor(useHideInput = false, autoFocus = true) {
    this.useHideInput = useHideInput;
    this.autoFocus = autoFocus;
    this.inputChange = () => {};
    this.cornerEl = h('div', `${cssPrefix}-selector-corner`);
    this.areaEl = h('div', `${cssPrefix}-selector-area`).child(this.cornerEl).hide();
    this.clipboardEl = h('div', `${cssPrefix}-selector-clipboard`).hide();
    this.autofillEl = h('div', `${cssPrefix}-selector-autofill`).hide();
    this.el = h('div', `${cssPrefix}-selector`)
      .css('z-index', `${startZIndex}`)
      .children(this.areaEl, this.clipboardEl, this.autofillEl)
      .hide();
    if (useHideInput) {
      this.hideInput = h('input', '').on('compositionend', (evt) => {
        this.inputChange(evt.target.value);
      });
      this.el.child((this.hideInputDiv = h('div', 'hide-input').child(this.hideInput)));
      this.el.child((this.hideInputDiv = h('div', 'hide-input').child(this.hideInput)));
    }
    startZIndex += 1;
  }

  setOffset(v) {
    this.el.offset(v).show();
    return this;
  }

  hide() {
    this.el.hide();
    return this;
  }

  setAreaOffset(v) {
    const { left, top, width, height } = v;
    const of = {
      width: width - selectorHeightBorderWidth + 0.8,
      height: height - selectorHeightBorderWidth + 0.8,
      left: left - 0.8,
      top: top - 0.8,
    };
    this.areaEl.offset(of).show();
    if (this.useHideInput) {
      this.hideInputDiv.offset(of);
      if (this.autoFocus) {
        this.hideInput.val('').focus();
      } else {
        this.hideInput.val('');
      }
    }
  }

  setClipboardOffset(v) {
    const { left, top, width, height } = v;
    this.clipboardEl.offset({
      left,
      top,
      width: width - 5,
      height: height - 5,
    });
  }

  showAutofill(v) {
    const { left, top, width, height } = v;
    this.autofillEl
      .offset({
        width: width - selectorHeightBorderWidth,
        height: height - selectorHeightBorderWidth,
        left,
        top,
      })
      .show();
  }

  hideAutofill() {
    this.autofillEl.hide();
  }

  showClipboard() {
    this.clipboardEl.show();
  }

  hideClipboard() {
    this.clipboardEl.hide();
  }
}

/**
 * 计算第四象限文本区域偏移量
 * @ignore
 * @param offset
 * @returns {{top: number, left: number, width, height}}
 */
function calFourthQuadrantAreaOffset(offset) {
  const { data } = this;
  const { left, top, width, height, scroll, l, t } = offset;
  const ftwidth = data.freezeTotalWidth();
  const ftheight = data.freezeTotalHeight();
  let left0 = left - ftwidth;
  if (ftwidth > l) left0 -= scroll.x;
  let top0 = top - ftheight;
  if (ftheight > t) top0 -= scroll.y;
  return {
    left: left0,
    top: top0,
    width,
    height,
  };
}

/**
 * 计算第一象限文本区域偏移量
 * @ignore
 * @param offset
 * @returns {{top, left: number, width, height}}
 */
function calFirstQuadrantAreaOffset(offset) {
  const { data } = this;
  const { left, width, height, l, t, scroll } = offset;
  const ftwidth = data.freezeTotalWidth();
  let left0 = left - ftwidth;
  if (ftwidth > l) left0 -= scroll.x;
  return {
    left: left0,
    top: t,
    width,
    height,
  };
}

/**
 * 计算第三象限文本区域偏移量
 * @ignore
 * @param offset
 * @returns {{top: number, left, width, height}}
 */
function calThirdQuadrantAreaOffset(offset) {
  const { data } = this;
  const { top, width, height, l, t, scroll } = offset;
  const ftheight = data.freezeTotalHeight();
  let top0 = top - ftheight;
  // console.log('ftheight:', ftheight, ', t:', t);
  if (ftheight > t) top0 -= scroll.y;
  return {
    left: l,
    top: top0,
    width,
    height,
  };
}

/**
 * 设置第四象限文本区域偏移量
 * @ignore
 * @param offset
 */
function setFourthQuadrantAreaOffset(offset) {
  const { fourthQuadrant } = this;
  fourthQuadrant.setAreaOffset(calFourthQuadrantAreaOffset.call(this, offset));
}

/**
 * 设置第二象限文本区域偏移量
 * @ignore
 * @param offset
 */
function setSecondQuadrantAreaOffset(offset) {
  const { secondQuadrant } = this;
  secondQuadrant.setAreaOffset(offset);
}

/**
 * 设置第一象限文本区域偏移量
 * @ignore
 * @param offset
 */
function setFirstQuadrantAreaOffset(offset) {
  const { firstQuadrant } = this;
  firstQuadrant.setAreaOffset(calFirstQuadrantAreaOffset.call(this, offset));
}

/**
 * 设置第三象限文本区域偏移量
 * @ignore
 * @param offset
 */
function setThirdQuadrantAreaOffset(offset) {
  const { thirdQuadrant } = this;
  thirdQuadrant.setAreaOffset(calThirdQuadrantAreaOffset.call(this, offset));
}

/**
 * 设置第三象限剪切区域偏移量
 * @ignore
 * @param offset
 */
function setThirdQuadrantClipboardOffset(offset) {
  const { thirdQuadrant } = this;
  thirdQuadrant.setClipboardOffset(calThirdQuadrantAreaOffset.call(this, offset));
}

/**
 * 设置第四象限剪切区域偏移量
 * @ignore
 * @param offset
 */
function setFourthQuadrantClipboardOffset(offset) {
  const { fourthQuadrant } = this;
  fourthQuadrant.setClipboardOffset(calFourthQuadrantAreaOffset.call(this, offset));
}

/**
 * 设置第二象限剪切区域偏移量
 * @ignore
 * @param offset
 */
function setSecondQuadrantClipboardOffset(offset) {
  const { secondQuadrant } = this;
  secondQuadrant.setClipboardOffset(offset);
}

/**
 * 设置第一象限剪切区域偏移量
 * @ignore
 * @param offset
 */
function setFirstQuadrantClipboardOffset(offset) {
  const { firstQuadrant } = this;
  firstQuadrant.setClipboardOffset(calFirstQuadrantAreaOffset.call(this, offset));
}

/**
 * 设置4个象限的文本区域偏移量
 * @ignore
 * @param offset
 */
function setAllAreaOffset(offset) {
  setFourthQuadrantAreaOffset.call(this, offset);
  setSecondQuadrantAreaOffset.call(this, offset);
  setFirstQuadrantAreaOffset.call(this, offset);
  setThirdQuadrantAreaOffset.call(this, offset);
}

/**
 * 设置4个象限的剪切区域偏移量
 * @ignore
 * @param offset
 */
function setAllClipboardOffset(offset) {
  setFourthQuadrantClipboardOffset.call(this, offset);
  setSecondQuadrantClipboardOffset.call(this, offset);
  setFirstQuadrantClipboardOffset.call(this, offset);
  setThirdQuadrantClipboardOffset.call(this, offset);
}

/**
 * @ignore
 * @class
 */
class Selector {
  constructor(data) {
    const { autoFocus } = data.settings;
    this.inputChange = () => {};
    this.data = data;
    // 当冻结时，以当前单元格上边和左边两端画延长线，形成一个十字，这个十字线把表格分成4个部分。
    // 你可以理解为平面直角坐标第中的4个象限。（对，就是那个判断一个人是否穿越的暗号“奇变偶不变，符号看象限“使用的的坐标系。）
    // 没有冻结单元格的情况下，第一、二、三象限没什么作用，只专注第四象限即可。
    this.secondQuadrant = new SelectorElement(); // 第二象限
    this.firstQuadrant = new SelectorElement(); // 第一象限
    this.thirdQuadrant = new SelectorElement(); // 第三象限
    this.fourthQuadrant = new SelectorElement(true, autoFocus); // 第四象限
    this.fourthQuadrant.inputChange = (v) => {
      this.inputChange(v);
    };
    this.fourthQuadrant.el.show();
    this.offset = null;
    this.areaOffset = null;
    this.indexes = null;
    this.range = null;
    this.arange = null;
    this.el = h('div', `${cssPrefix}-selectors`)
      .children(this.secondQuadrant.el, this.firstQuadrant.el, this.thirdQuadrant.el, this.fourthQuadrant.el)
      .hide();

    // for performance
    this.lastri = -1;
    this.lastci = -1;

    startZIndex += 1;
  }

  resetData(data) {
    this.data = data;
    this.range = data.selector.range;
    this.resetAreaOffset();
  }

  hide() {
    this.el.hide();
  }

  resetOffset() {
    const { data, secondQuadrant, firstQuadrant, thirdQuadrant, fourthQuadrant } = this;
    const freezeHeight = data.freezeTotalHeight();
    const freezeWidth = data.freezeTotalWidth();
    if (freezeHeight > 0 || freezeWidth > 0) {
      secondQuadrant.setOffset({ width: freezeWidth, height: freezeHeight });
      firstQuadrant.setOffset({ left: freezeWidth, height: freezeHeight });
      thirdQuadrant.setOffset({ top: freezeHeight, width: freezeWidth });
      fourthQuadrant.setOffset({ left: freezeWidth, top: freezeHeight });
    } else {
      secondQuadrant.hide();
      firstQuadrant.hide();
      thirdQuadrant.hide();
      fourthQuadrant.setOffset({ left: 0, top: 0 });
    }
  }

  resetAreaOffset() {
    const offset = this.data.getSelectedRect();
    const coffset = this.data.getClipboardRect();
    setAllAreaOffset.call(this, offset);
    setAllClipboardOffset.call(this, coffset);
    this.resetOffset();
  }

  resetBRTAreaOffset() {
    const offset = this.data.getSelectedRect();
    const coffset = this.data.getClipboardRect();
    setFourthQuadrantAreaOffset.call(this, offset);
    setFirstQuadrantAreaOffset.call(this, offset);
    setFourthQuadrantClipboardOffset.call(this, coffset);
    setFirstQuadrantClipboardOffset.call(this, coffset);
    this.resetOffset();
  }

  resetBRLAreaOffset() {
    const offset = this.data.getSelectedRect();
    const coffset = this.data.getClipboardRect();
    setFourthQuadrantAreaOffset.call(this, offset);
    setThirdQuadrantAreaOffset.call(this, offset);
    setFourthQuadrantClipboardOffset.call(this, coffset);
    setThirdQuadrantClipboardOffset.call(this, coffset);
    this.resetOffset();
  }

  set(ri, ci, indexesUpdated = true) {
    const { data } = this;
    const cellRange = data.calSelectedRangeByStart(ri, ci);
    const { sri, sci } = cellRange;
    if (indexesUpdated) {
      let [cri, cci] = [ri, ci];
      if (ri < 0) cri = 0;
      if (ci < 0) cci = 0;
      data.selector.setIndexes(cri, cci);
      this.indexes = [cri, cci];
    }

    this.moveIndexes = [sri, sci];
    // this.sIndexes = sIndexes;
    // this.eIndexes = eIndexes;
    this.range = cellRange;

    const cell = data.getCell(ri, ci);
    if (this.data.settings.mode !== 'edit' && !cell) return;
    if (this.data.settings.mode !== 'edit' && !['number', 'tableBlank', 'date', 'select'].includes(cell?.type)) return;
    this.resetAreaOffset();
    this.el.show();
  }

  // 生成selector的range范围
  setEnd(ri, ci, moving = true) {
    const { data, lastri, lastci } = this;
    if (moving) {
      if (ri === lastri && ci === lastci) {
        return;
      }
      this.lastri = ri;
      this.lastci = ci;
    }
    this.range = data.calSelectedRangeByEnd(ri, ci);
    setAllAreaOffset.call(this, this.data.getSelectedRect());
  }

  reset() {
    const { eri, eci } = this.data.selector.range;
    this.setEnd(eri, eci);
  }

  showAutofill(ri, ci) {
    if (ri === -1 && ci === -1) return;
    // console.log('ri:', ri, ', ci:', ci);
    // const [sri, sci] = this.sIndexes;
    // const [eri, eci] = this.eIndexes;
    const { sri, sci, eri, eci } = this.range;
    const [nri, nci] = [ri, ci];
    // const rn = eri - sri;
    // const cn = eci - sci;
    const srn = sri - ri;
    const scn = sci - ci;
    const ern = eri - ri;
    const ecn = eci - ci;
    if (scn > 0) {
      // left
      // console.log('left');
      this.arange = new CellRange(sri, nci, eri, sci - 1);
      // this.saIndexes = [sri, nci];
      // this.eaIndexes = [eri, sci - 1];
      // data.calRangeIndexes2(
    } else if (srn > 0) {
      // top
      // console.log('top');
      // nri = sri;
      this.arange = new CellRange(nri, sci, sri - 1, eci);
      // this.saIndexes = [nri, sci];
      // this.eaIndexes = [sri - 1, eci];
    } else if (ecn < 0) {
      // right
      // console.log('right');
      // nci = eci;
      this.arange = new CellRange(sri, eci + 1, eri, nci);
      // this.saIndexes = [sri, eci + 1];
      // this.eaIndexes = [eri, nci];
    } else if (ern < 0) {
      // bottom
      // console.log('bottom');
      // nri = eri;
      this.arange = new CellRange(eri + 1, sci, nri, eci);
      // this.saIndexes = [eri + 1, sci];
      // this.eaIndexes = [nri, eci];
    } else {
      // console.log('else:');
      this.arange = null;
      // this.saIndexes = null;
      // this.eaIndexes = null;
      return;
    }
    if (this.arange !== null) {
      const offset = this.data.getRect(this.arange);
      offset.width += 2;
      offset.height += 2;
      const { fourthQuadrant, thirdQuadrant, firstQuadrant, secondQuadrant } = this;
      fourthQuadrant.showAutofill(calFourthQuadrantAreaOffset.call(this, offset));
      thirdQuadrant.showAutofill(calThirdQuadrantAreaOffset.call(this, offset));
      firstQuadrant.showAutofill(calFirstQuadrantAreaOffset.call(this, offset));
      secondQuadrant.showAutofill(offset);
    }
  }

  hideAutofill() {
    ['fourthQuadrant', 'thirdQuadrant', 'firstQuadrant', 'secondQuadrant'].forEach((property) => {
      this[property].hideAutofill();
    });
  }

  showClipboard() {
    const coffset = this.data.getClipboardRect();
    setAllClipboardOffset.call(this, coffset);
    ['fourthQuadrant', 'thirdQuadrant', 'firstQuadrant', 'secondQuadrant'].forEach((property) => {
      this[property].showClipboard();
    });
  }

  hideClipboard() {
    ['fourthQuadrant', 'thirdQuadrant', 'firstQuadrant', 'secondQuadrant'].forEach((property) => {
      this[property].hideClipboard();
    });
  }
}

export default Selector;
