import PaneItem from './pane-item';
import PaneText from './pane-text';

/**
 * 格式化单元格：类型：文本
 * @ignore
 * @class
 */
class TextCategory extends PaneItem {
  constructor() {
    super('text');
  }

  pane() {
    const { tag, title } = this;
    return new PaneText(tag, title);
  }
}

export default TextCategory;
