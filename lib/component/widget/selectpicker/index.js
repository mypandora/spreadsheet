import request from '../../../core/request';
import { cssPrefix } from '../../../config';
import { h } from '../../element';
import { unbindClickoutside } from '../../event';
import './index.css';

class Select {
  constructor() {
    this.data = {};
    this.options = []; // 下拉框所有数据，当我们异步请求时，为了实现可搜索功能，把异步的所有数据先保存下来，方便匹配生成新options
    this.optionEl = h('li', 'lds-dual-ring');
    this.buildAll();
    this.el = h('ul', `${cssPrefix}-select`).children(this.optionEl);
    this.selectChange = () => {};
  }

  setData(data) {
    this.data = data;
    this.el.html('').child(this.optionEl);
    this.buildAll();
  }

  resetData(dataProxy) {
    this.dataProxy = dataProxy;
  }

  buildAll() {
    const { data } = this;
    const { selectAsync } = data;

    if (selectAsync === undefined) {
      return;
    }

    if (selectAsync) {
      this.renderAsyncItem();
    } else {
      this.renderSyncItem();
    }
  }

  buildByParam(value) {
    const { data, options } = this;
    const { selectFilterable = true, selectAsync, selectOptions } = data;

    if (selectFilterable) {
      const opts = selectAsync ? options : selectOptions;
      const lis = this.renderItem(opts.filter((item) => item.label.includes(value)));
      this.el.html('').children(...lis);
    }
  }

  /**
   * 使用同步数据
   */
  renderSyncItem() {
    const { data } = this;
    const { selectOptions } = data;

    const lis = this.renderItem(selectOptions);
    this.el.html('').children(...lis);
  }

  /**
   * 使用异步数据
   */
  async renderAsyncItem() {
    const { data, dataProxy } = this;
    const { selectInterface, selectMethod = 'get', selectParams, selectParentId, selectParentKey, ...rest } = data;
    const headers = dataProxy.settings.remote?.headers;
    const baseURL = dataProxy.settings.remote?.baseURL;

    // 获取参数
    const params = {};
    if (Array.isArray(selectParams)) {
      selectParams.forEach((item) => {
        const { key, value } = item;
        if (key) {
          if (value !== undefined && value !== null) {
            params[key] = value;
          } else if (selectParentId) {
            // 如果selectParentId有值，表示它是要获取父级单元格的值
            // selectParentValue主要是为了回显方便
            // selectParentKey，取父级单元格的那个属性，因为有时候父级单元格不一定存储码，而有可能存储名称，
            // 而真实值在其它属性中，我们设置这个属性方便配置从那个属性中取到值
            const val = this.getParentValue(selectParentId, selectParentKey);
            if (val) {
              params[item.key] = val;
            }
          }
        }
      });
    }

    const config = {
      ...rest,
      url: selectInterface,
      method: selectMethod,
    };

    // 根据不同方法类型
    if (selectMethod.toLowerCase() === 'get') {
      config.params = params;
    } else {
      config.data = params;
    }

    //
    if (headers) {
      config.headers = headers;
    }
    if (baseURL) {
      config.baseURL = baseURL;
    }

    const res = await request(config);
    let lis = [];
    if (res.code === 200) {
      this.options = res.data;
      lis = this.renderItem(res.data);
    }
    this.el.html('').children(...lis);
  }

  /**
   * 渲染列表项。
   * 在这里使用代码把获取数据写死了，这就要求数据接口必须统一，是不是可以考虑把方法放到外面去？
   * @param {*} response
   * @returns 所有下拉框选项
   */
  renderItem(options) {
    const { data } = this;
    const { value, selectProps = { label: 'label', value: 'value' }, selectLinkId } = data;
    const lis = [];

    for (let i = 0; i < options.length; i += 1) {
      const item = options[i];
      const liConfig = {
        isSelected: value === item[selectProps.value],
        label: this.getLabel(item, selectProps.label),
        value: this.getValue(item, selectProps.value),
      };

      let ariaSelected = 'false';
      let cls = '';
      if (liConfig.isSelected) {
        cls += 'is-selected';
        ariaSelected = 'true';
      }

      lis.push(
        h('li', cls)
          .on('click.stop', () => {
            this.handleLink(selectLinkId, item.value);
            this.selectChange({ ...item, ...liConfig });
          })
          .attr({ 'aria-selected': ariaSelected, role: 'option' })
          .val(liConfig.value)
          .child(liConfig.label)
      );
    }

    // 如果为空，使用一个默认值
    if (lis.length === 0) {
      lis.push(h('li', '').attr({ 'aria-selected': false, role: 'option' }).val('').child('无匹配数据'));
    }

    return lis;
  }

  getLabel(item, key) {
    let label = '';
    if (key === 'label') {
      label = item.label;
    } else if (key === 'value') {
      label = item.value;
    } else if (key === 'value&label') {
      label = `${item.value}  ${item.label}`;
    } else if (key === 'label&value') {
      label = `${item.label}  ${item.value}`;
    }
    return `${label}`;
  }

  getValue(item, key) {
    let value = '';
    if (key === 'label') {
      value = item.label;
    } else if (key === 'value') {
      value = item.value;
    }
    return `${value}`;
  }

  getParentValue(id, key = 'value') {
    let value;
    let exit = false;
    const { rows } = this.dataProxy;
    Object.keys(rows._).some((ri) => {
      const row = rows._[ri];
      const { cells } = row;
      Object.keys(cells).some((ci) => {
        const cell = cells[ci];
        if (cell.componentId === id) {
          value = cell[key];
          exit = true;
          return exit;
        }
        return false;
      });
      return exit;
    });
    return value;
  }

  /**
   * 当选择下拉框一项时，要把对应的值写入关联的单元格。
   * 这种功能如何实现呢？
   * 1，直接在本组件中实现某个单元格的赋值；
   * 2，将关联单元格及值抛出去。
   * 考虑到上层是编辑组件，只修改当前单元格的值，想实现要继续上抛到 sheet.js 组件，感觉会让不知所措。
   * 所以在这里，当下拉框选项变化时，直接在本组件中实现了。
   * @param {*} componentId 目标单元格 id
   * @param {*} value 目标单元格要设置的值
   */
  handleLink(componentId, value) {
    if (!componentId) {
      return;
    }

    const { dataProxy } = this;
    const { rows } = dataProxy;
    Object.keys(rows._).forEach((ri) => {
      const row = rows._[ri];
      const { cells } = row;
      Object.keys(cells).forEach((ci) => {
        const cell = cells[ci];
        if (cell.componentId === componentId) {
          cell.text = value;
        }
      });
    });
  }

  /**
   * 获取上次正确的值。
   * 当用户自己输入了一些值，而非我们下拉列表中的值，当失去焦点时，我们应该使用上次的旧值还原。
   */
  getText(text) {
    const { data, options } = this;
    const { selectAsync, selectOptions, selectProps = {} } = data;

    if (selectAsync) {
      // 如果值在我们的选项中，使用它；如果不在，使用上次的值。
      const result = options.find((item) => {
        const { label } = selectProps;
        if (label === 'lable') {
          return item.label === text;
        }
        if (label === 'value') {
          return item.value === text;
        }
        if (label === 'value&label') {
          return `${item.value}  ${item.label}` === text; // 注意使用了2个空格，与 getLabel 要一致。
        }
        if (label === 'label&value') {
          return `${item.label}  ${item.value}` === text;
        }
        return item.label === text;
      });
      if (result) {
        return text;
      }
      return options.find((item) => String(item[selectProps.value]) === String(data.value))?.label;
    }
    const result = selectOptions.find((item) => item.label === text);
    if (result) {
      return text;
    }
    return selectOptions.find((item) => String(item.value) === String(data.value))?.label;
  }
}

export default class Selectpicker {
  constructor() {
    this.select = new Select();
    this.el = h('div', `${cssPrefix}-selectpicker`).child(this.select.el).hide();
  }

  /**
   * 初始化selectpicker
   * @param {Object} cell
   */
  setData(cell) {
    const { select } = this;
    select.setData(cell);
    return this;
  }

  setParam(value) {
    const { select } = this;
    select.buildByParam(value);
    return this;
  }

  getText(value) {
    const { select } = this;
    return select.getText(value);
  }

  change(cb) {
    this.select.selectChange = (value) => {
      cb(value);
      this.hide();
    };
  }

  show() {
    const { el } = this;
    el.show();
    // bindClickoutside(el);
  }

  hide() {
    const { el } = this;
    el.hide();
    unbindClickoutside(el);
  }

  /**
   * 刷新数据
   * @param {DataProxy} data 数据
   */
  resetData(data) {
    this.select.resetData(data);
  }
}
