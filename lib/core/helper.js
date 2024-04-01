/* eslint-disable no-restricted-syntax */
/**
 * 深拷贝，仿照 lodash
 * @ignore
 * @param {*} obj
 * @returns {*} 拷贝后的对象
 */
function cloneDeep(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  const result = Array.isArray(obj) ? [] : {};
  Object.keys(obj).forEach((key) => {
    result[key] = cloneDeep(obj[key]);
  });
  return result;
}

function isDate(obj) {
  return /Date/.test(Object.prototype.toString.call(obj)) && !Number.isNaN(obj.getTime());
}

function extend(to, from, overwirte) {
  let prop;
  let hasProp;
  for (prop in from) {
    if (Object.hasOwn(from, prop)) {
      hasProp = to[prop] !== undefined;
      if (hasProp && typeof from[prop] === 'object' && from[prop] !== null && from[prop].nodeName === undefined) {
        if (isDate(from[prop])) {
          if (overwirte) {
            to[prop] = new Date(from[prop].getTime());
          }
        } else if (Array.isArray(from[prop])) {
          if (overwirte) {
            to[prop] = from[prop].slice(0);
          }
        } else {
          to[prop] = extend({}, from[prop], overwirte);
        }
      } else if (overwirte || !hasProp) {
        to[prop] = from[prop];
      }
    }
  }
  return to;
}

const mergeDeep = (object = {}, ...sources) => {
  sources.forEach((source) => {
    Object.keys(source).forEach((key) => {
      const v = source[key];
      // console.log('k:', key, ', v:', source[key], typeof v, v instanceof Object);
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
        object[key] = v;
      } else if (typeof v !== 'function' && !Array.isArray(v) && v instanceof Object) {
        object[key] = object[key] || {};
        mergeDeep(object[key], v);
      } else {
        object[key] = v;
      }
    });
  });
  // console.log('::', object);
  return object;
};

function equals(obj1, obj2) {
  const keys = Object.keys(obj1);
  if (keys.length !== Object.keys(obj2).length) {
    return false;
  }
  for (let i = 0; i < keys.length; i += 1) {
    const k = keys[i];
    const v1 = obj1[k];
    const v2 = obj2[k];
    if (v2 === undefined) {
      return false;
    }
    if (typeof v1 === 'string' || typeof v1 === 'number' || typeof v1 === 'boolean') {
      if (v1 !== v2) {
        return false;
      }
    } else if (Array.isArray(v1)) {
      if (v1.length !== v2.length) {
        return false;
      }
      for (let ai = 0; ai < v1.length; ai += 1) {
        if (!equals(v1[ai], v2[ai])) {
          return false;
        }
      }
    } else if (typeof v1 !== 'function' && !Array.isArray(v1) && v1 instanceof Object) {
      if (!equals(v1, v2)) {
        return false;
      }
    }
  }
  return true;
}

/*
  objOrAry: obejct or Array
  cb: (value, index | key) => { return value }
*/
const sum = (objOrArr, cb = (value) => value) => {
  let total = 0;
  let size = 0;
  Object.keys(objOrArr).forEach((key) => {
    total += cb(objOrArr[key], key);
    size += 1;
  });
  return [total, size];
};

function deleteProperty(obj, property) {
  const oldv = obj[`${property}`];
  delete obj[`${property}`];
  return oldv;
}

function rangeReduceIf(min, max, inits, initv, ifv, getv) {
  let s = inits;
  let v = initv;
  let i = min;
  for (; i < max; i += 1) {
    if (s > ifv) break;
    v = getv(i);
    s += v;
  }
  return [i, s - v, v];
}

function rangeSum(min, max, getv) {
  let s = 0;
  for (let i = min; i < max; i += 1) {
    s += getv(i);
  }
  return s;
}

function rangeEach(min, max, cb) {
  for (let i = min; i < max; i += 1) {
    cb(i);
  }
}

function arrayEquals(a1, a2) {
  if (a1.length === a2.length) {
    for (let i = 0; i < a1.length; i += 1) {
      if (a1[i] !== a2[i]) {
        return false;
      }
    }
  } else {
    return false;
  }
  return true;
}

function digits(number) {
  const v = `${number}`;
  let result = 0;
  let flag = false;
  for (let i = 0; i < v.length; i += 1) {
    if (flag === true) {
      result += 1;
    }
    if (v.charAt(i) === '.') {
      flag = true;
    }
  }
  return result;
}

export function numberCalc(type, n1, n2) {
  if (Number.isNaN(n1) || Number.isNaN(n2)) {
    return n1 + type + n2;
  }
  const al1 = digits(n1);
  const al2 = digits(n2);
  const num1 = Number(n1);
  const num2 = Number(n2);
  let result = 0;
  switch (type) {
    case '-':
      result = num1 - num2;
      break;
    case '+':
      result = num1 + num2;
      break;
    case '*':
      result = num1 * num2;
      break;
    case '/':
      result = num1 / num2;
      if (digits(result) > 5) {
        result = result.toFixed(2);
      }
      break;
    default:
      result = result.toFixed(Math.max(al1, al2));
  }
  return result;
}

export default {
  cloneDeep,
  merge: (...source) => mergeDeep({}, ...source),
  equals,
  arrayEquals,
  sum,
  rangeEach,
  rangeSum,
  rangeReduceIf,
  deleteProperty,
  numberCalc,
};

export { extend, isDate };
