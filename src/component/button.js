import { cssPrefix } from '../config';
import { t } from '../locale';
import { Element } from './element';

export default class Button extends Element {
  constructor(title, type = '') {
    super('div', `${cssPrefix}-button ${type}`);
    this.child(t(`button.${title}`));
  }
}
