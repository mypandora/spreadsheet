import { cssPrefix } from '../config';
import { t } from '../locale';
import Modal from './modal';
import FormInput from './form-input';
import FormSelect from './form-select';
import FormField from './form-field';
import Button from './button';
import { h } from './element';

const fieldLabelWidth = 100;

/**
 * 数据验证
 * @ignore
 * @class
 */
class ModalValidation extends Modal {
  constructor() {
    const mf = new FormField(
      new FormSelect(
        'cell',
        ['cell'], // cell|row|column
        '100%',
        (it) => t(`dataValidation.modeType.${it}`)
      ),
      { required: true },
      `${t('dataValidation.range')}:`,
      fieldLabelWidth
    );
    const rf = new FormField(new FormInput('120px', 'E3 or E3:F12'), {
      required: true,
      pattern: /^([A-Z]{1,2}[1-9]\d*)(:[A-Z]{1,2}[1-9]\d*)?$/,
    });
    const cf = new FormField(
      new FormSelect(
        'select',
        ['select', 'checkbox', 'radio', 'number', 'date', 'phone', 'email'],
        '100%',
        (it) => t(`dataValidation.type.${it}`),
        (it) => this.criteriaSelected(it)
      ),
      { required: true },
      `${t('dataValidation.criteria')}:`,
      fieldLabelWidth
    );

    // operator
    const of = new FormField(
      new FormSelect(
        'be',
        ['t', 'be', 'nbe', 'eq', 'neq', 'lt', 'lte', 'gt', 'gte'],
        '160px',
        (it) => t(`dataValidation.operator.${it}`),
        (it) => this.criteriaOperatorSelected(it)
      ),
      { required: true }
    ).hide();
    // min, max
    const minvf = new FormField(new FormInput('70px', '10'), { required: true }).hide();
    const maxvf = new FormField(new FormInput('70px', '100'), { required: true, type: 'number' }).hide();
    // value
    const svf = new FormField(new FormInput('120px', 'a,b,c'), { required: true });
    const vf = new FormField(new FormInput('70px', '10'), { required: true, type: 'number' }).hide();
    const ivf = new FormField(new FormInput('150px', '请输入输入框个数'), { required: false }).hide();

    super(t('contextmenu.validation'), [
      h('div', `${cssPrefix}-form-fields`).children(mf.el, rf.el),
      h('div', `${cssPrefix}-form-fields`).children(cf.el, of.el, minvf.el, maxvf.el, vf.el, svf.el, ivf.el),
      h('div', `${cssPrefix}-buttons`).children(
        new Button('cancel').on('click', () => this.btnClick('cancel')),
        new Button('remove').on('click', () => this.btnClick('remove')),
        new Button('save', 'primary').on('click', () => this.btnClick('save'))
      ),
    ]);
    this.mf = mf;
    this.rf = rf;
    this.cf = cf;
    this.of = of;
    this.minvf = minvf;
    this.maxvf = maxvf;
    this.vf = vf;
    this.svf = svf;
    this.ivf = ivf;
    this.change = () => {};
    this.getUrlData = () => {};
  }

  showVf(it) {
    const hint = it === 'date' ? '2018-11-12' : '10';
    const { vf } = this;
    vf.input.hint(hint);
    vf.show();
  }

  criteriaSelected(it) {
    const { of, minvf, maxvf, vf, svf, ivf } = this;
    if (it === 'date' || it === 'number') {
      of.val('be');
      of.show();
      minvf.rule.type = it;
      maxvf.rule.type = it;
      if (it === 'date') {
        minvf.hint('2018-11-12');
        maxvf.hint('2019-11-12');
      } else {
        minvf.hint('10');
        maxvf.hint('100');
      }
      minvf.show();
      maxvf.show();
      vf.hide();
      svf.hide();
      ivf.hide();
    } else {
      if (it === 'select') {
        svf.show();
        ivf.hide();
      } else {
        svf.hide();
        ivf.hide();
      }
      vf.hide();
      of.hide();
      minvf.hide();
      maxvf.hide();
    }
  }

  criteriaOperatorSelected(it) {
    if (!it) return;
    const { minvf, maxvf, vf } = this;
    if (it === 't') {
      minvf.hide();
      maxvf.hide();
      vf.hide();
    } else if (it === 'be' || it === 'nbe') {
      minvf.show();
      maxvf.show();
      vf.hide();
    } else {
      const type = this.cf.val();
      vf.rule.type = type;
      if (type === 'date') {
        vf.hint('2018-11-12');
      } else {
        vf.hint('10');
      }
      vf.show();
      minvf.hide();
      maxvf.hide();
    }
  }

  btnClick(action) {
    if (action === 'cancel') {
      this.hide();
    } else if (action === 'remove') {
      this.change('remove');
      this.hide();
    } else if (action === 'save') {
      // validate
      const attrs = ['mf', 'rf', 'cf', 'of', 'svf', 'vf', 'ivf', 'minvf', 'maxvf'];
      for (let i = 0; i < attrs.length; i += 1) {
        const field = this[attrs[i]];
        if (field.isShow()) {
          if (!field.validate()) return;
        }
      }
      const mode = this.mf.val();
      const ref = this.rf.val();
      const type = this.cf.val();
      const operator = type === 'date' || type === 'number' ? this.of.val() : '';
      let value = this.svf.val();
      if (type === 'select' && /^http[s]{0,1}:\/\/([\w.]+\/?)\S*/.test(value)) {
        this.getUrlData(this.svf.val(), (data) => {
          this.change('save', mode, ref, {
            type,
            operator,
            required: false,
            value: data,
            url: value,
          });
          this.hide();
        });
      } else {
        if (type === 'number' || type === 'date') {
          if (operator === 'be' || operator === 'nbe') {
            value = [this.minvf.val(), this.maxvf.val()];
          } else {
            value = this.vf.val();
          }
        }
        this.change('save', mode, ref, {
          type,
          operator,
          required: false,
          value,
          url: '',
        });
        this.hide();
      }
    }
  }

  // validation: { mode, ref, validator }
  setValue(v) {
    if (v) {
      const { mf, rf, cf, of, svf, vf, minvf, maxvf } = this;
      const { mode, ref, validator } = v;
      const { type, operator, value, url } = validator || { type: 'select' };
      mf.val(mode || 'cell');
      rf.val(ref);
      cf.val(type);
      of.val(operator || '');
      if (Array.isArray(value)) {
        if (type === 'select') {
          svf.val(url);
        } else {
          minvf.val(value[0]);
          maxvf.val(value[1]);
        }
      } else {
        svf.val(value || '');
        vf.val(value || '');
      }
      this.criteriaSelected(type);
      if (type === 'date' || type === 'number') {
        this.criteriaOperatorSelected(operator);
      }
    }
    this.show();
  }
}

export default ModalValidation;
