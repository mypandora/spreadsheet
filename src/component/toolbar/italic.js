import ToggleItem from './toggle-item';

/**
 * 斜体按钮。
 * @ignore
 * @class
 */
class Italic extends ToggleItem {
  constructor() {
    super('font-italic', 'Ctrl+I', undefined);
  }
}

export default Italic;
