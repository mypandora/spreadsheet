import ToggleItem from './toggle-item';

/**
 * 下划线按钮。
 * @ignore
 * @class
 */
class Underline extends ToggleItem {
  constructor() {
    super('underline', 'Ctrl+U', undefined);
  }
}

export default Underline;
