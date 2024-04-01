import { tf } from '../locale';

const formatDateRender = (text, format = 'YYYY-MM-DD') => {
  const d = new Date(text);
  if (/Date/.test(Object.prototype.toString.call(d)) && !Number.isNaN(d.getTime())) {
    return text;
  }
  let month = d.getMonth() + 1;
  let date = d.getDate();
  if (month > 10) {
    month = `0${month}`;
  }
  if (date < 10) {
    date = `0${date}`;
  }

  if (format === 'YYYY-MM-DD') {
    return `${d.getFullYear()}-${month}-${date}`;
  }
  return `${d.getFullYear()}年${month}月${date}日`;
};

const formatStringRender = (v) => v;

/**
 * 数值型格式化函数
 * @ignore
 * @see https://segmentfault.com/a/1190000002884224
 * @param {number} v 数字
 * @param {number} decimalPlaces 小数位数
 * @returns {string[]|*} 千分位格式化后的数字
 */
const formatNumberRender = (v, decimalPlaces = 2) => {
  // match '-12.1' or '12' or '12.1'
  if (/^(-?\d*.?\d*)$/.test(v)) {
    const v1 = Number(v).toFixed(decimalPlaces);
    const [first, ...rest] = v1.split('\\.');
    return [first.replace(/(?<=^\d+)(?=(\d{3})+\b)/g, ','), ...rest];
  }
  return v;
};

const formatPercentRender = (v, percentPlaces = 2) => {
  if (/^(-?\d*.?\d*)$/.test(v)) {
    const v1 = Number(v * 100).toFixed(percentPlaces);
    return `${v1}%`;
  }
  return v;
};

// 定义单元格中的值的类型
// key: 关键字的名字
// title: 使用local进行本地化，赋予一个中文名字
// type: 对应js中的类型
// render: 对应的格式化函数
// label: 页面中的显示样例
const BASE_FORMATS = [
  {
    key: 'normal',
    title: tf('format.general'),
    type: 'string',
    render: formatStringRender,
  },
  {
    key: 'text',
    title: tf('format.text'),
    type: 'string',
    render: formatStringRender,
  },
  {
    key: 'number',
    title: tf('format.number'),
    type: 'number',
    label: '1,000.12',
    render: formatNumberRender,
  },
  {
    key: 'percent',
    title: tf('format.percent'),
    type: 'number',
    label: '10.12%',
    render: formatPercentRender,
  },
  {
    key: 'rmb',
    title: tf('format.rmb'),
    type: 'number',
    label: '￥10.00',
    render: (v) => `￥${formatNumberRender(v)}`,
  },
  {
    key: 'usd',
    title: tf('format.usd'),
    type: 'number',
    label: '$10.00',
    render: (v) => `$${formatNumberRender(v)}`,
  },
  {
    key: 'eur',
    title: tf('format.eur'),
    type: 'number',
    label: '€10.00',
    render: (v) => `€${formatNumberRender(v)}`,
  },
  {
    key: 'date',
    title: tf('format.date'),
    type: 'date',
    label: '26/09/2008',
    render: formatStringRender,
  },
  {
    key: 'time',
    title: tf('format.time'),
    type: 'date',
    label: '15:59:00',
    render: formatStringRender,
  },
  {
    key: 'datetime',
    title: tf('format.datetime'),
    type: 'date',
    label: '26/09/2008 15:59:00',
    render: formatStringRender,
  },
  {
    key: 'duration',
    title: tf('format.duration'),
    type: 'date',
    label: '24:01:00',
    render: formatStringRender,
  },
];
const format = {};
BASE_FORMATS.forEach((f) => {
  format[f.key] = f;
});

export default {};
export { format, BASE_FORMATS, formatNumberRender, formatPercentRender, formatDateRender };
