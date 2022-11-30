const BASE_FONTS = [
  { key: '宋体', title: '宋体' },
  { key: '微软雅黑', title: '微软雅黑' },
  { key: '微软雅黑 Light', title: '微软雅黑 Light' },
  { key: '微软正黑体', title: '微软正黑体' },
  { key: '等线', title: '等线' },
  { key: '等线 Light', title: '等线 Light' },
  { key: '苹方', title: '苹方' },
  { key: '黑体', title: '黑体' },
  { key: '楷体', title: '楷体' },
  { key: '新宋体', title: '新宋体' },
  { key: '仿宋', title: '仿宋' },
  { key: '隶书', title: '隶书' },
  { key: '幼圆', title: '幼圆' },
  { key: '华文细黑', title: '华文细黑' },
  { key: '华文楷体', title: '华文楷体' },
  { key: '华文宋体', title: '华文宋体' },
  { key: '华文中宋', title: '华文中宋' },
  { key: '华文仿宋', title: '华文仿宋' },
  { key: '方正舒体', title: '方正舒体' },
  { key: '方正姚体', title: '方正姚体' },
  { key: '华文彩云', title: '华文彩云' },
  { key: '华文琥珀', title: '华文琥珀' },
  { key: '华文隶书', title: '华文隶书' },
  { key: '华文行楷', title: '华文行楷' },
  { key: '华文新魏', title: '华文新魏' },
  { key: 'Arial', title: 'Arial' },
  { key: 'Helvetica', title: 'Helvetica' },
  { key: 'Source Sans Pro', title: 'Source Sans Pro' },
  { key: 'Comic Sans MS', title: 'Comic Sans MS' },
  { key: 'Courier New', title: 'Courier New' },
  { key: 'Verdana', title: 'Verdana' },
  { key: 'Lato', title: 'Lato' },
];

// pt单位px单位映射表，表格中使用的字体大小的单位是pt（下拉框中是pt，实际显示应该是px），对应系统中的字号如下（可以和本地excel文件进行对应）
// 参见 https://www.runoob.com/w3cnote/px-pt-em-convert-table.html
const FONT_SIZES = [
  { pt: 7.5, px: 10 },
  { pt: 8, px: 11 },
  { pt: 9, px: 12 },
  { pt: 10, px: 13 },
  { pt: 10.5, px: 14 },
  { pt: 11, px: 15 },
  { pt: 12, px: 16 },
  { pt: 14, px: 18.7 },
  { pt: 15, px: 20 },
  { pt: 16, px: 21.3 },
  { pt: 18, px: 24 },
  { pt: 22, px: 29.3 },
  { pt: 24, px: 32 },
  { pt: 26, px: 34.7 },
  { pt: 36, px: 48 },
  { pt: 42, px: 56 },
  // { pt: 54, px: 71.7 },
  // { pt: 63, px: 83.7 },
  // { pt: 72, px: 95.6 },
];

/**
 * map pt to px
 * pt单位转换为px单位
 * @ignore
 * @param {number} pt fontsizePT
 * @returns {number} fontsizePX
 */
function getFontSizePxByPt(pt) {
  for (let i = 0; i < FONT_SIZES.length; i += 1) {
    const fontSize = FONT_SIZES[i];
    if (fontSize.pt === pt) {
      return fontSize.px;
    }
  }
  return pt;
}

/**
 * transform baseFonts to map
 * 将baseFonts这个数组转换成 map 数据结构。
 * @ignore
 * @param {Array} [arr=[]]
 * @returns {Object}
 */
function fonts(arr = []) {
  const map = {};
  BASE_FONTS.concat(arr).forEach((font) => {
    map[font.key] = font;
  });
  return map;
}

export default {};
export { FONT_SIZES, fonts, BASE_FONTS, getFontSizePxByPt };
