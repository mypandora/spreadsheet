import { cssPrefix } from '../config';
import { t } from '../locale';
import { h } from './element';
import Modal from './modal';
import Button from './button';
import Property from './property';

/**
 * 显示单元格的属性
 * @ignore
 * @class
 */
class ModalProperty extends Modal {
  constructor() {
    const property = new Property();
    super(t('contextmenu.property').replaceAll('.', ''), [
      property.el,
      h('div', `${cssPrefix}-buttons`).children(
        new Button('cancel').on('click', () => this.btnClick()),
        new Button('ok', 'primary').on('click', () => this.btnClick())
      ),
    ]);
    this.value = null;
    this.property = property;
    this.property.change = (tag, args) => {
      this.value = {
        tag,
        ...args,
      };
    };
    this.change = () => {};
  }

  btnClick() {
    this.hide();
  }

  setValue(cell) {
    this.show();
    this.property.resetCell(cell);
  }
}

export default ModalProperty;
