/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend } from 'umi-request';

export const formRequest = extend({ credentials: 'include' });
const request = extend({
  credentials: 'include', // 默认请求是否带上cookie
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
  },
});

// 响应拦截 导出报告获取文件名
request.interceptors.response.use(async (response: any) => {
  const disposition = response.headers.get('Content-Disposition'); // 获取Content-Disposition
  return disposition
    ? {
        blob: await response.blob(), // 将二进制的数据转为blob对象
        fileName: disposition.split('filename=')[1], // 获取文件名
      }
    : response;
});

export default request;

export const reqGet = (endpoint: string, payload?: any) => {
  return request(endpoint, {
    method: 'GET',
    params: payload,
  });
};

export const reqPost = (endpoint: string, payload: any) => {
  return request(endpoint, {
    method: 'POST',
    data: payload,
  });
};

export const reqPut = (endpoint: string, payload: any) => {
  return request(endpoint, {
    method: 'PUT',
    data: payload,
  });
};

export const reqDelete = (endpoint: string, payload?: any) => {
  return request(endpoint, {
    method: 'DELETE',
    data: payload,
  });
};

export const reqArrayBuffer = (endpoint: string) => {
  return request(endpoint, {
    method: 'GET',
    responseType: 'arrayBuffer',
  });
};
