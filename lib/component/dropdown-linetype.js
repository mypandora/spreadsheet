import { cssPrefix } from '../config';
import Icon from './icon';
import { h } from './element';
import Dropdown from './dropdown';

const lineTypes = [
  [
    'thin',
    '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="1" style="user-select: none;"><line x1="0" y1="0.5" x2="50" y2="0.5" stroke-width="1" stroke="black" style="user-select: none;"></line></svg>',
  ],
  [
    'medium',
    '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="2" style="user-select: none;"><line x1="0" y1="1.0" x2="50" y2="1.0" stroke-width="2" stroke="black" style="user-select: none;"></line></svg>',
  ],
  [
    'thick',
    '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="3" style="user-select: none;"><line x1="0" y1="1.5" x2="50" y2="1.5" stroke-width="3" stroke="black" style="user-select: none;"></line></svg>',
  ],
  [
    'dashed',
    '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="1" style="user-select: none;"><line x1="0" y1="0.5" x2="50" y2="0.5" stroke-width="1" stroke="black" stroke-dasharray="2" style="user-select: none;"></line></svg>',
  ],
  [
    'dotted',
    '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="1" style="user-select: none;"><line x1="0" y1="0.5" x2="50" y2="0.5" stroke-width="1" stroke="black" stroke-dasharray="1" style="user-select: none;"></line></svg>',
  ],
  [
    'double',
    '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="3" style="user-select: none;"><line x1="0" y1="0.5" x2="50" y2="0.5" stroke-width="1" stroke="black" style="user-select: none;"></line><line x1="0" y1="2.5" x2="50" y2="2.5" stroke-width="1" stroke="black" style="user-select: none;"></line></svg>',
  ],
];

class DropdownLineType extends Dropdown {
  constructor(type) {
    const icon = new Icon('line-type');
    let oldIndex = 0;
    const lineTypeEls = lineTypes.map((it, index) =>
      h('div', `${cssPrefix}-item state ${type === it[0] ? 'checked' : ''}`)
        .on('click', () => {
          lineTypeEls[oldIndex].toggle('checked');
          lineTypeEls[index].toggle('checked');
          oldIndex = index;
          this.hide();
          this.change(it);
        })
        .child(h('div', `${cssPrefix}-line-type`).html(it[1]))
    );
    super(icon, 'auto', false, 'bottom-left', ...lineTypeEls);
  }
}

export default DropdownLineType;
