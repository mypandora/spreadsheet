import { cssPrefix } from '../../config';
import { t } from '../../locale';
import Pane from './pane';
import { h } from '../element';
import { formatDateRender } from '../../core/format';

class PaneDate extends Pane {
  constructor(tag, title) {
    const prompt = t(`format.prompt.${tag}`);

    const main = h('div', `${cssPrefix}-pane-content-main`);
    const list = h('ul', `${cssPrefix}-items`)
      .children(
        h('li', `${cssPrefix}-item`).html('2012-03-14').attr('data-format', 'YYYY-MM-DD'),
        h('li', `${cssPrefix}-item`).html('2012年3月14日').attr('data-format', 'YYYY年MM月DD日')
      )
      .on('click', (evt) => {
        const { target } = evt;
        const { dataset } = target;
        const { format } = dataset;
        // 将数据向上传递出去。
        this.change({
          tag,
          dateFormat: format,
        });
      });

    main.children(list.el);
    super(tag, title, prompt, main);
  }

  setContent(data) {
    this.data = data;
    const { format } = data;
    this.setExample(format);
    this.show();
  }

  setExample(format) {
    const { data } = this;
    const { text } = data;
    this.exampleCEl.html(formatDateRender(text, format));
  }
}

export default PaneDate;
