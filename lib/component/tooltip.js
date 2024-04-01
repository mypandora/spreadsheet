import { cssPrefix } from '../config';
import { h } from './element';
import { bind } from './event';

/**
 * 为工具栏 toolbar 按钮显示 tooltip 提示
 * @param html 显示内容
 * @param target 目标元素
 */
export default function tooltip(html, target) {
  // Element.classList 是一个只读属性，返回一个元素的类属性的实时 DOMTokenList 集合。
  if (target.classList.contains('active')) {
    return;
  }
  const { left, top, width, height } = target.getBoundingClientRect();
  const el = h('div', `${cssPrefix}-tooltip`).html(html).show();
  document.body.appendChild(el.el);
  const elBox = el.box();
  el.css('left', `${left + width / 2 - elBox.width / 2}px`).css('top', `${top + height + 2}px`);

  bind(target, 'mouseleave', () => {
    if (document.body.contains(el.el)) {
      document.body.removeChild(el.el);
    }
  });

  bind(target, 'click', () => {
    if (document.body.contains(el.el)) {
      document.body.removeChild(el.el);
    }
  });
}
