import { cssPrefix } from '../../config';
import { t } from '../../locale';
import { formatNumberRender } from '../../core/format';
import Pane from './pane';
import { h } from '../element';

class PaneNumber extends Pane {
  constructor(tag, title, decimalPlaces = 2) {
    const prompt = t(`format.prompt.${tag}`);

    const main = h('div', `${cssPrefix}-pane-content-main`);
    const inputNumber = h('input', 'w60')
      .attr({
        type: 'number',
        step: 1,
        min: 0,
        max: 99,
      })
      .val(decimalPlaces)
      .on('input', (evt) => {
        const { target } = evt;
        const { value } = target;
        // 将数据向上传递出去。
        this.change({
          tag,
          decimalPlaces: value,
        });
      });
    main.children(t('format.decimalPlaces'), inputNumber.el);
    super(tag, title, prompt, main);
  }

  setContent(data) {
    this.data = data;
    const { decimalPlaces } = data;
    // 回显示例区数据
    this.setExample(decimalPlaces);

    this.show();
  }

  setExample(value) {
    const { data } = this;
    const { text } = data;
    this.exampleCEl.html(formatNumberRender(text, value));
  }
}

export default PaneNumber;
