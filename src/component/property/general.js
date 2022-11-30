import PaneItem from './pane-item';
import PaneGeneral from './pane-general';

/**
 * 格式化属性：常规
 * @ignore
 * @class
 */
class GeneralProperty extends PaneItem {
  constructor() {
    super('general');
  }

  pane() {
    const { tag, title } = this;
    return new PaneGeneral(tag, title);
  }
}

export default GeneralProperty;
