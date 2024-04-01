import PaneItem from './pane-item';
import PaneGeneral from './pane-general';

/**
 * 格式化单元格：类型：常规
 * @ignore
 * @class
 */
class GeneralCategory extends PaneItem {
  constructor() {
    super('general');
  }

  pane() {
    const { tag, title } = this;
    return new PaneGeneral(tag, title);
  }
}

export default GeneralCategory;
