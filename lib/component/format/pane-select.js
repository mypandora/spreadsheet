import { t } from '../../locale';
import Pane from './pane';

class PaneSelect extends Pane {
  constructor(type, title, example = '') {
    const prompt = t(`format.prompt.${type}`);

    super(type, title, example, prompt);
  }

  setContent(data) {
    const { text, value } = data;
    this.show();
    this.exampleEl.el.childNodes[1].innerText = value || text;
  }
}

export default PaneSelect;
