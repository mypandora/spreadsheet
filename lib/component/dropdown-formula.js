import { cssPrefix } from '../config';
import { BASE_FORMULAS } from '../core/formula';
import Dropdown from './dropdown';
import { h } from './element';
import Icon from './icon';

export default class DropdownFormula extends Dropdown {
  constructor() {
    const formulas = BASE_FORMULAS.map((formula) =>
      h('div', `${cssPrefix}-item`)
        .on('click', () => {
          this.hide();
          this.change(formula);
        })
        .child(formula.key)
    );
    super(new Icon('formula'), '180px', true, 'bottom-left', ...formulas);
  }
}
