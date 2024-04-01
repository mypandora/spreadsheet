/* eslint-disable no-restricted-syntax */
import axios from 'axios';

/**
 * 参数处理
 * @param {*} params  参数
 */
function tansParams(params) {
  let result = '';
  for (const propName of Object.keys(params)) {
    const value = params[propName];
    const part = `${encodeURIComponent(propName)}=`;
    if (value !== null && value !== '' && typeof value !== 'undefined') {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== '' && typeof value[key] !== 'undefined') {
            const p = `${propName}[${key}]`;
            const subPart = `${encodeURIComponent(p)}=`;
            result += `${subPart + encodeURIComponent(value[key])}&`;
          }
        }
      } else {
        result += `${part + encodeURIComponent(value)}&`;
      }
    }
  }
  return result;
}

// sessionStorage存储
const sessionCache = {
  set(key, value) {
    if (!sessionStorage) {
      return;
    }
    if (key !== null && value !== null) {
      sessionStorage.setItem(key, value);
    }
  },
  get(key) {
    if (!sessionStorage) {
      return null;
    }
    if (key == null) {
      return null;
    }
    return sessionStorage.getItem(key);
  },
  setJSON(key, jsonValue) {
    if (jsonValue !== null) {
      this.set(key, JSON.stringify(jsonValue));
    }
  },
  getJSON(key) {
    const value = this.get(key);
    if (value !== null) {
      return JSON.parse(value);
    }
    return undefined;
  },
  remove(key) {
    sessionStorage.removeItem(key);
  },
};

// 错误码
const errorCode = {
  401: '认证失败，无法访问系统资源',
  403: '当前操作没有权限',
  404: '访问资源不存在',
  default: '系统未知错误，请反馈给管理员',
};

// 是否显示重新登录
export const isRelogin = { show: false };

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: '/',
  // 超时
  timeout: 10000,
});
// request拦截器
service.interceptors.request.use(
  (config) => {
    // 是否需要防止数据重复提交
    const isRepeatSubmit = (config.headers || {}).repeatSubmit === false;
    // get请求映射params参数
    if (config.method === 'get' && config.params) {
      let url = `${config.url}?${tansParams(config.params)}`;
      url = url.slice(0, -1);
      config.params = {};
      config.url = url;
    }
    if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
      const requestObj = {
        url: config.url,
        data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
        time: new Date().getTime(),
      };
      const sessionObj = sessionCache.getJSON('sessionObj');
      if (sessionObj === undefined || sessionObj === null || sessionObj === '') {
        sessionCache.setJSON('sessionObj', requestObj);
      } else {
        const sUrl = sessionObj.url; // 请求地址
        const sData = sessionObj.data; // 请求数据
        const sTime = sessionObj.time; // 请求时间
        const interval = 1000; // 间隔时间(ms)，小于此时间视为重复提交
        if (sData === requestObj.data && requestObj.time - sTime < interval && sUrl === requestObj.url) {
          const message = '数据正在处理，请勿重复提交';
          return Promise.reject(new Error(message));
        }
        sessionCache.setJSON('sessionObj', requestObj);
      }
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (res) => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200;
    // 获取错误信息
    const msg = errorCode[code] || res.data.msg || errorCode.default;
    // 二进制数据则直接返回
    if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
      return res.data;
    }
    if (code === 401) {
      return Promise.reject(new Error('无效的会话，或者会话已过期，请重新登录。'));
    }
    if (code !== 200) {
      return Promise.reject(new Error(msg));
    }
    return res.data;
  },
  (error) => {
    let { message } = error;
    if (message === 'Network Error') {
      message = '后端接口连接异常';
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时';
    } else if (message.includes('Request failed with status code')) {
      message = `系统接口${message.substr(message.length - 3)}异常`;
    }
    return Promise.reject(error);
  }
);

export default service;
