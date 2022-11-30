import { expr2xy, xy2expr } from './alphabet';

/**
 * @ignore
 * @class
 */
class CellRange {
  /**
   *
   * @param {number} sri 可视区域开始行索引
   * @param {number} sci 可视区域开始列索引
   * @param {number} eri 可视区域结束行索引
   * @param {number} eci 可视区域结束列索引
   * @param {number} w 可视区域宽度
   * @param {number} h 可视区域高度
   */
  constructor(sri, sci, eri, eci, w = 0, h = 0) {
    this.sri = sri;
    this.sci = sci;
    this.eri = eri;
    this.eci = eci;
    this.w = w;
    this.h = h;
  }

  set(sri, sci, eri, eci) {
    this.sri = sri;
    this.sci = sci;
    this.eri = eri;
    this.eci = eci;
  }

  multiple() {
    return this.eri - this.sri > 0 || this.eci - this.sci > 0;
  }

  // cell-index: ri, ci
  // cell-ref: A10
  includes(...args) {
    let [ri, ci] = [0, 0];
    if (args.length === 1) {
      [ci, ri] = expr2xy(args[0]);
    } else if (args.length === 2) {
      [ri, ci] = args;
    }
    const { sri, sci, eri, eci } = this;
    return sri <= ri && ri <= eri && sci <= ci && ci <= eci;
  }

  each(cb, rowFilter = () => true) {
    const { sri, sci, eri, eci } = this;
    for (let i = sri; i <= eri; i += 1) {
      if (rowFilter(i)) {
        for (let j = sci; j <= eci; j += 1) {
          cb(i, j);
        }
      }
    }
  }

  // other是否包含cellrange定义的区域
  contains(other) {
    return this.sri <= other.sri && this.sci <= other.sci && this.eri >= other.eri && this.eci >= other.eci;
  }

  // other范围是否在cellrange定义的区域内
  within(other) {
    return this.sri >= other.sri && this.sci >= other.sci && this.eri <= other.eri && this.eci <= other.eci;
  }

  // 两个范围相离
  disjoint(other) {
    return this.sri > other.eri || this.sci > other.eci || other.sri > this.eri || other.sci > this.eci;
  }

  // 两个范围交叉
  intersects(other) {
    return this.sri <= other.eri && this.sci <= other.eci && other.sri <= this.eri && other.sci <= this.eci;
  }

  // 求两个范围相交的范围
  union(other) {
    const { sri, sci, eri, eci } = this;
    return new CellRange(
      other.sri < sri ? other.sri : sri,
      other.sci < sci ? other.sci : sci,
      other.eri > eri ? other.eri : eri,
      other.eci > eci ? other.eci : eci
    );
  }

  difference(other) {
    const ret = [];
    const addRet = (sri, sci, eri, eci) => {
      ret.push(new CellRange(sri, sci, eri, eci));
    };
    const { sri, sci, eri, eci } = this;
    const dsr = other.sri - sri;
    const dsc = other.sci - sci;
    const der = eri - other.eri;
    const dec = eci - other.eci;
    if (dsr > 0) {
      addRet(sri, sci, other.sri - 1, eci);
      if (der > 0) {
        addRet(other.eri + 1, sci, eri, eci);
        if (dsc > 0) {
          addRet(other.sri, sci, other.eri, other.sci - 1);
        }
        if (dec > 0) {
          addRet(other.sri, other.eci + 1, other.eri, eci);
        }
      } else {
        if (dsc > 0) {
          addRet(other.sri, sci, eri, other.sci - 1);
        }
        if (dec > 0) {
          addRet(other.sri, other.eci + 1, eri, eci);
        }
      }
    } else if (der > 0) {
      addRet(other.eri + 1, sci, eri, eci);
      if (dsc > 0) {
        addRet(sri, sci, other.eri, other.sci - 1);
      }
      if (dec > 0) {
        addRet(sri, other.eci + 1, other.eri, eci);
      }
    }
    if (dsc > 0) {
      addRet(sri, sci, eri, other.sci - 1);
      if (dec > 0) {
        addRet(sri, other.eri + 1, eri, eci);
        if (dsr > 0) {
          addRet(sri, other.sci, other.sri - 1, other.eci);
        }
        if (der > 0) {
          addRet(other.sri + 1, other.sci, eri, other.eci);
        }
      } else {
        if (dsr > 0) {
          addRet(sri, other.sci, other.sri - 1, eci);
        }
        if (der > 0) {
          addRet(other.sri + 1, other.sci, eri, eci);
        }
      }
    } else if (dec > 0) {
      addRet(eri, other.eci + 1, eri, eci);
      if (dsr > 0) {
        addRet(sri, sci, other.sri - 1, other.eci);
      }
      if (der > 0) {
        addRet(other.eri + 1, sci, eri, other.eci);
      }
    }
    return ret;
  }

  // 选中范围的横向格子数和竖向格子数
  size() {
    return [this.eri - this.sri + 1, this.eci - this.sci + 1];
  }

  toString() {
    const { sri, sci, eri, eci } = this;
    let ref = xy2expr(sci, sri);
    if (this.multiple()) {
      ref = `${ref}:${xy2expr(eci, eri)}`;
    }
    return ref;
  }

  clone() {
    const { sri, sci, eri, eci, w, h } = this;
    return new CellRange(sri, sci, eri, eci, w, h);
  }

  // 两个区域完全相等
  equals(other) {
    return this.eri === other.eri && this.eci === other.eci && this.sri === other.sri && this.sci === other.sci;
  }

  static valueOf(ref) {
    // B1:B8, B1 => 1 x 1 cell range
    const refs = ref.split(':');
    const [sci, sri] = expr2xy(refs[0]);
    let [eri, eci] = [sri, sci];
    if (refs.length > 1) {
      [eci, eri] = expr2xy(refs[1]);
    }
    // CellRange方法可以用来设置固定区域，可以用来将题设置成一个区域进行选择。 如 return new CellRange(sri, sci, 14, 10)
    return new CellRange(sri, sci, eri, eci);
  }
}

export { CellRange };
export default CellRange;
