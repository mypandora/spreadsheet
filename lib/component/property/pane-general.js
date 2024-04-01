import Pane from './pane';
import { h } from '../element';

const buildLi = (data) =>
  Object.keys(data).map((key) =>
    h('div', 'item').children(h('span', 'label').html(key), h('span', 'content').html(JSON.stringify(data[key])))
  );

class PaneGeneral extends Pane {
  setContent(data) {
    const title = h('div', '').children(h('strong', 'w50').html('属性'), h('strong', 'w50').html('值'));
    const content = h('div', 'box').children(...buildLi(data));

    this.setContentChildren(title, content);
    this.show();
  }
}

export default PaneGeneral;
