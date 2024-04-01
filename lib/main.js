import { cssPrefix } from './config';
import { locale } from './locale';
import DataProxy from './core/data-proxy';
import { h } from './component/element';
import Sheet from './component/sheet';
import BottomBar from './component/bottombar';
import './styles/index.css';
/**
 * 主要入口类，涉及表格初始化，代理类初始化等。
 */
class Spreadsheet {
  /**
   * 表格构造方法
   * @param {(string|element)} selectors CSS3选择器或者Element元素
   * @param {Object} options={} 自定义配置信息
   */
  constructor(selectors, options = {}) {
    // 目标 element
    this.targetEl = selectors;
    this.options = { showBottomBar: true, ...options }; // 合并表格配置
    const { language, message } = this.options;
    if (language) {
      // 默认为中文简体
      this.locale(language, message);
    }
    this.sheetIndex = 1; // 表格 sheet 默认索引
    this.currentSheetIndex = 0; // 当前显示的表格索引
    this.datas = []; // 表格所有 sheet 的数据数组
    if (typeof selectors === 'string') {
      // 如果是 string 则转为 DOM 节点实例
      this.targetEl = document.querySelector(selectors);
    }
    // 表格底部状态栏
    // 这里通过传递回调函数实现相关功能
    this.bottomBar = this.options.showBottomBar
      ? new BottomBar(
          () => {
            if (this.options.mode !== 'edit') {
              return;
            }
            // 为 bottomBar 的 '+' 按钮传入新建事件
            const d = this.addSheet();
            this.data = d;
            this.sheet.resetData(d);
          },
          (index) => {
            this.currentSheetIndex = index;
            // 为 bottomBar 的 sheet 标签传入点击选中事件
            const d = this.datas[index];
            this.data = d;
            // 重置缩放比例
            this.bottomBar.resetScale(d.settings.scale);
            // 如果使用缩放，单纯靠 resetData 无法达到重绘所有组件的目的，只能换其它方法
            // 重绘布局
            this.sheet.data = d;
            this.sheet.reload();
            // 渲染数据
            this.sheet.resetData(d);
          },
          () => {
            // 为 bottomBar 的 sheet 标签传入删除事件
            this.deleteSheet();
          },
          (index, value) => {
            // 为 bottomBar 的 sheet 标签传入重命名事件
            this.datas[index].name = value;
            this.sheet.trigger('change');
          }
        )
      : null;
    this.data = this.addSheet(undefined); // 表格默认 sheet 的数据
    // 准备在目标元素下挂载的表格根元素
    // 在这里禁用默认的右键菜单事件，方便使用自定义事件
    const rootEl = h('div', `${cssPrefix}`).on('contextmenu', (evt) => evt.preventDefault());
    this.targetEl.appendChild(rootEl.el);

    // create canvas element
    this.sheet = new Sheet(rootEl, this.data); // 【重点】工具类等由 sheet 初始化时渲染
    // 如果底部状态栏也存在，则加上
    if (this.bottomBar !== null) {
      this.bottomBar.change = (value) => this.changeSheetScale(value);
      rootEl.child(this.bottomBar.el);
    }
  }

  /**
   * 添加 sheet（工作表）。
   * @param {string} name sheet（工作表）名称
   * @param {boolean} active=true 添加sheet（工作表）是否为激活状态，默认是
   * @returns {DataProxy} sheet（工作表）所需的全部数据，这个数据是一个 DataProxy 对象。
   */
  addSheet(name, active = true) {
    const n = name || `sheet${this.sheetIndex}`;
    const d = new DataProxy(n, this.options);
    d.change = (...args) => {
      this.sheet.trigger('change', ...args);
    };
    this.datas.push(d);
    if (this.bottomBar !== null) {
      this.bottomBar.addItem(n, active, this.options);
    }
    this.sheetIndex += 1;
    return d;
  }

  /**
   * 删除 sheet（工作表）。
   */
  deleteSheet() {
    if (this.bottomBar === null) {
      return;
    }
    const [oldIndex, newIndex] = this.bottomBar.deleteItem();
    if (oldIndex >= 0) {
      this.datas.splice(oldIndex, 1);
      if (newIndex >= 0) {
        this.data = this.datas[newIndex];
        this.sheet.resetData(this.datas[newIndex]);
      }
      this.sheet.trigger('change');
    }
  }

  /**
   * 缩放 sheet（工作表）。
   * @param {*} value 缩放比例 0.5~4
   */
  changeSheetScale(value) {
    if (typeof value === 'number' && value >= 0.1 && value <= 4) {
      const d = this.datas[this.currentSheetIndex];
      d.settings.scale = value;
      this.sheet.data = d;
      this.sheet.reload();
    }
  }

  /**
   * 加载数据。<br>
   * 一开始只支持单 sheet（工作表），后来添加了多 sheet（工作表）的支持，所以特意判断一下是否需要转为数组。
   * @param {object|array} data 数据
   * @returns {Spreadsheet} 当前实例
   */
  loadData(data) {
    const ds = Array.isArray(data) ? data : [data];
    if (this.bottomBar !== null) {
      this.bottomBar.clear();
    }
    this.formatData(ds);
    // this.datas 的数据将在 this.addSheet 中被添加
    this.datas = [];
    if (ds.length > 0) {
      for (let i = 0; i < ds.length; i += 1) {
        const it = ds[i];
        const dataProxy = this.addSheet(it.name, i === 0);
        dataProxy.setData(it); // 通过dataProxy.setData方法将后台传过来的值和配置注入到表格中去
        if (i === 0) {
          this.data = dataProxy;
          this.sheet.resetData(dataProxy);
        }
      }
    }
    return this;
  }

  /**
   * 格式化代码
   * 比如级联组件，当省级单元格为空时，把它作为父级的单元格应该是不可选，即禁用状态。
   * 是在这里格式数据好还是dataProxy.setData中格式数据好？
   * @param {*} data
   */
  formatData(data) {
    const selects = [];

    // 筛选出级联组件
    data.forEach((it) => {
      const { rows } = it;
      Object.keys(rows).forEach((ri) => {
        if (Number.isInteger(+ri)) {
          const row = rows[ri];
          const { cells } = row;
          Object.keys(cells).forEach((ci) => {
            const cell = cells[ci];
            if (cell?.type === 'select') {
              selects.push(cell);
            }
          });
        }
      });
    });
    // 将父级单元格值为空的单元格禁用
    selects.forEach((it) => {
      const { selectParentId, selectParentValue } = it;
      if (selectParentId && !selectParentValue) {
        const parentCell = selects.find((item) => item.componentId === selectParentId);
        if (parentCell.value) {
          it.editable = true;
        } else {
          it.editable = false;
        }
      }
    });
  }

  /**
   *
   * @returns {array} 实例所有数据集合
   */
  getData() {
    return this.datas.map((it) => it.getData());
  }

  /**
   * 设置选定表格中的单元格的值
   * @param {number} ri 行坐标
   * @param {number} ci 列坐标
   * @param {string} text 单元格内容
   * @param {number} sheetIndex=0 工作表索引
   * @returns {Spreadsheet} 当前实例
   */
  cellText(ri, ci, text, sheetIndex = 0) {
    this.datas[sheetIndex].setCellText(ri, ci, text, 'finished');
    return this;
  }

  /**
   * 获得单元格内容
   * @param {number} ri 行坐标
   * @param {number} ci 列坐标
   * @param {number} sheetIndex=0 工作表索引
   * @returns {object|null} 空或者单元格内容
   */
  cell(ri, ci, sheetIndex = 0) {
    return this.datas[sheetIndex].getCell(ri, ci);
  }

  /**
   * 获得单元格样式属性
   * @param {number} ri 行坐标
   * @param {number} ci 列坐标
   * @param {number} sheetIndex=0 工作表索引
   * @returns {object|null} 空或者单元格样式
   */
  cellStyle(ri, ci, sheetIndex = 0) {
    return this.datas[sheetIndex].getCellStyle(ri, ci);
  }

  /**
   * 重新刷新当前表格
   * @returns {Spreadsheet} 当前实例
   */
  reRender() {
    this.sheet.table.render();
    return this;
  }

  /**
   * sheet（工作表）绑定事件
   * @param {string} eventName 事件类型
   * @param {function} func 回调事件
   * @returns {Spreadsheet} 当前实例
   */
  on(eventName, func) {
    this.sheet.on(eventName, func);
    return this;
  }

  /**
   *
   * @returns {boolean}
   */
  validate() {
    const { validations } = this.data;
    return validations.errors.size <= 0;
  }

  /**
   * sheet（工作表）change 事件
   * @param {function} cb 回调事件，这个方法可由我们在初始化之后注入
   * @returns {Spreadsheet} 当前实例
   */
  change(cb) {
    this.sheet.on('change', cb);
    return this;
  }

  /**
   * 本地化支持，默认中文
   * @static
   * @param {string} lang 本地化语言配置项
   * @param {Object} message 本地化语言数据，覆盖默认的值。除了在这里指定外，也可以在
   */
  locale(lang, message) {
    locale(lang, message);
  }
}

const spreadsheet = (el, options = {}) => new Spreadsheet(el, options);

export default spreadsheet;
