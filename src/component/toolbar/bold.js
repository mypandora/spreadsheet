import ToggleItem from './toggle-item';

/**
 * 加粗按钮。
 * @ignore
 * @class
 */
class Bold extends ToggleItem {
  constructor() {
    super('font-bold', 'Ctrl+B', undefined);
  }
}

export default Bold;
