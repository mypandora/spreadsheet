import ToggleItem from './toggle-item';

/**
 * 删除线按钮。
 * @ignore
 * @class
 */
class Strike extends ToggleItem {
  constructor() {
    super('strike', 'Ctrl+U', undefined);
  }
}

export default Strike;
