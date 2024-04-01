import { cssPrefix } from '../config';
import { t } from '../locale';
import { h } from './element';
import Modal from './modal';
import Button from './button';
import Category from './format';

/**
 * 设置单元格格式
 * 此为右键菜单中的设置单元格选择之后的弹框。
 * @ignore
 * @class
 */
class ModalFormat extends Modal {
  constructor() {
    const category = new Category();
    super(t('contextmenu.cellformat').replaceAll('.', ''), [
      category.el,
      h('div', `${cssPrefix}-buttons`).children(
        new Button('cancel').on('click', () => this.btnClick('cancel')),
        new Button('save', 'primary').on('click', () => this.btnClick('save'))
      ),
    ]);
    this.value = null;
    this.category = category;
    this.category.change = (tag, args) => {
      this.value = {
        tag,
        ...args,
      };
    };
    this.change = () => {};
  }

  btnClick(action) {
    switch (action) {
      case 'cancel':
        this.hide();
        break;
      case 'save':
        this.change('save', this.value);
        this.hide();
        break;
      default:
        this.hide();
        break;
    }
  }

  setValue(cell) {
    this.show();
    this.category.resetCell(cell);
  }
}

export default ModalFormat;
