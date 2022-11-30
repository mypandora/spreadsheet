// eslint-disable-next-line max-len
const alphabets = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

/**
 * index number 2 letters <br>
 * 将数值转换为工作表对应的字母表示。
 * @ignore
 * @example stringAt(26) ==> 'AA'
 * @param {number} index 数值
 * @returns {string} 字母
 */
export function stringAt(index) {
  let str = '';
  let cindex = index;
  while (cindex >= alphabets.length) {
    cindex /= alphabets.length;
    cindex -= 1;
    str = alphabets[parseInt(cindex, 10) % alphabets.length] + str;
  }
  const last = index % alphabets.length;
  str += alphabets[last];
  return str;
}

/**
 * translate letter in A1-tag to number <br>
 * 将工作表列的字母表示法转换为相应的数值。
 * @ignore
 * @example indexAt('AA') ==>26
 * @param {string} str 字母 "AA" in A1-tag "AA1"
 * @returns {number} 数值
 */
export function indexAt(str) {
  let ret = 0;
  for (let i = 0; i !== str.length; i+=1) ret = 26 * ret + str.charCodeAt(i) - 64;
  return ret - 1;
}

/**
 * translate A1-tag to XY-tag <br>
 * 将工作表中单元格的坐标转为对应的数组形式。
 * @ignore
 * @example expr2xy('A1') ==> [0, 0]
 * @example expr2xy('B10') ==> [1, 9]
 * @param {string} src 单元格坐标
 * @returns {number[]} 一维数组
 */
export function expr2xy(src) {
  let x = '';
  let y = '';
  for (let i = 0; i < src.length; i += 1) {
    if (src.charAt(i) >= '0' && src.charAt(i) <= '9') {
      y += src.charAt(i);
    } else {
      x += src.charAt(i);
    }
  }
  return [indexAt(x), parseInt(y, 10) - 1];
}

/**
 * translate XY-tag to A1-tag
 * 将数值转为工作表中对应的单元格形式。
 * @ignore
 * @example x,y => B10
 * @param {number} x 行索引
 * @param {number} y 列索引
 * @returns {string} 单元格形式
 */
export function xy2expr(x, y) {
  return `${stringAt(parseInt(x, 10))}${parseInt(y, 10) + 1}`;
}

/**
 * translate A1-tag src by (xn, yn)
 * 将原单元格坐标在水平与垂直方向偏移后得到新坐标。
 * @ignore
 * @example expr2expr('B10', 2, 2) ==> 'D12'
 * @example expr2expr('B10', 0, 0) ==> 'B10'
 * @example expr2expr('B10', -1, -1) ==> 'A9'
 * @example expr2expr('B10', -2, -2) ==> 'undefined8'
 * @param {string} src 原单元格坐标
 * @param {number} xn 行偏移量
 * @param {number} yn 列偏移量
 * @param {function} condition 自定义判断条件函数
 * @returns {string} 新单元格坐标
 */
export function expr2expr(src, xn, yn, condition = () => true) {
  if (xn === 0 && yn === 0) {
    return src;
  }
  const [x, y] = expr2xy(src);
  if (!condition(x, y)) {
    return src;
  }
  return xy2expr(x + xn, y + yn);
}

export default {
  stringAt,
  indexAt,
  expr2xy,
  xy2expr,
  expr2expr,
};
