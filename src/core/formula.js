import { tf } from '../locale';
import { numberCalc } from './helper';

const BASE_FORMULAS = [
  {
    key: 'SUM',
    title: tf('formula.sum'),
    render: (ary) => ary.reduce((a, b) => numberCalc('+', a, b), 0),
  },
  {
    key: 'AVERAGE',
    title: tf('formula.average'),
    render: (arr) => arr.reduce((a, b) => Number(a) + Number(b), 0) / arr.length,
  },
  {
    key: 'MAX',
    title: tf('formula.max'),
    render: (arr) => Math.max(...arr.map((v) => Number(v))),
  },
  {
    key: 'MIN',
    title: tf('formula.min'),
    render: (arr) => Math.min(...arr.map((v) => Number(v))),
  },
  {
    key: 'IF',
    title: tf('formula._if'),
    render: ([b, t, f]) => (b ? t : f),
  },
  {
    key: 'AND',
    title: tf('formula.and'),
    render: (arr) => arr.every((it) => it),
  },
  {
    key: 'OR',
    title: tf('formula.or'),
    render: (arr) => arr.some((it) => it),
  },
  {
    key: 'CONCAT',
    title: tf('formula.concat'),
    render: (arr) => arr.join(''),
  },
];

// 默认的本地的公式转换
const formula = {};
BASE_FORMULAS.forEach((f) => {
  formula[f.key] = f;
});

export default {};

export { BASE_FORMULAS, formula };
