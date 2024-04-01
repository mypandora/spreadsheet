import { t } from '../../locale';
import Pane from './pane';

class PaneText extends Pane {
  constructor(tag, title) {
    const prompt = t(`format.prompt.${tag}`);

    super(tag, title, prompt);
  }

  setContent(data) {
    const { text } = data;
    this.exampleCEl.html(text);
    this.show();
  }
}

export default PaneText;
