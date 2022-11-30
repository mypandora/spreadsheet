import { cssPrefix } from '../config';
import { h } from './element';
import { mouseMoveUp } from './event';

/**
 * 标尺。
 * 调整列宽与行高、显示隐藏的行与列的辅助尺。
 * @ignore
 * @class
 */
class Resizer {
  /**
   *
   * @param vertical 是否为垂直标尺
   * @param minDistance 最小距离：水平时，即为最小高度；垂直时，为最小宽度。
   */
  constructor(vertical = false, minDistance) {
    this.moving = false; // 鼠标是否拖动中
    this.vertical = vertical;
    this.el = h('div', `${cssPrefix}-resizer ${vertical ? 'vertical' : 'horizontal'}`)
      .children(
        (this.unhideHoverEl = h('div', `${cssPrefix}-resizer-hover`)
          .on('dblclick.stop', (evt) => this.handleDblclick(evt))
          .css('position', 'absolute')
          .hide()), // 只有某行或者列隐藏时，才可以看到这个效果，双击即可将隐藏的行或者列变为显示
        (this.hoverEl = h('div', `${cssPrefix}-resizer-hover`).on('mousedown.stop', (evt) =>
          this.mousedownHandler(evt)
        )),
        (this.lineEl = h('div', `${cssPrefix}-resizer-line`).hide()) // 虚线
      )
      .hide();
    // cell rect
    this.cRect = null;
    this.finishedFn = null;
    this.minDistance = minDistance;
    this.unhideFn = () => {}; // 取消隐藏的某行或者列，该实际方法由外部 (sheet.js)注入。
  }

  showUnhide(index) {
    this.unhideIndex = index;
    this.unhideHoverEl.show();
  }

  hideUnhide() {
    this.unhideHoverEl.hide();
  }

  // rect : {top, left, width, height}
  // line : {width, height}
  show(rect, line) {
    const { moving, vertical, hoverEl, lineEl, el, unhideHoverEl } = this;
    if (moving) {
      return;
    }
    this.cRect = rect;
    const { left, top, width, height } = rect;
    el.offset({
      left: vertical ? left + width - 5 : left,
      top: vertical ? top : top + height - 5,
    }).show();
    hoverEl.offset({
      width: vertical ? 5 : width,
      height: vertical ? height : 5,
    });
    lineEl.offset({
      width: vertical ? 0 : line.width,
      height: vertical ? line.height : 0,
    });
    unhideHoverEl.offset({
      left: vertical ? 5 - width : left,
      top: vertical ? top : 5 - height,
      width: vertical ? 5 : width,
      height: vertical ? height : 5,
    });
  }

  hide() {
    this.el
      .offset({
        left: 0,
        top: 0,
      })
      .hide();
    this.hideUnhide();
  }

  /**
   * 双击显示被隐藏的行或者列
   */
  handleDblclick() {
    if (this.unhideIndex) {
      this.unhideFn(this.unhideIndex);
    }
  }

  /**
   * 鼠标按下时触发标尺事件。
   * @param evt
   */
  mousedownHandler(evt) {
    let startEvt = evt;
    const { el, lineEl, cRect, vertical, minDistance } = this;
    let distance = vertical ? cRect.width : cRect.height;
    lineEl.show();
    mouseMoveUp(
      window,
      (e) => {
        this.moving = true;
        if (startEvt !== null && e.buttons === 1) {
          if (vertical) {
            distance += e.movementX;
            if (distance > minDistance) {
              el.css('left', `${cRect.left + distance}px`);
            }
          } else {
            distance += e.movementY;
            if (distance > minDistance) {
              el.css('top', `${cRect.top + distance}px`);
            }
          }
          startEvt = e;
        }
      },
      () => {
        startEvt = null;
        lineEl.hide();
        this.moving = false;
        this.hide();
        if (this.finishedFn) {
          if (distance < minDistance) {
            distance = minDistance;
          }
          this.finishedFn(cRect, distance);
        }
      }
    );
  }
}

export default Resizer;
