/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */
const proxyDev = 'http://192.168.6.41:7788';
export const proxyIPs = {
  dev: proxyDev,
  production: '/',
  // 如果使用dev，ip 则test， pre不需要配置
  test: '',
  pre: '',
};

export default {
  dev: {
    '/volumetype': {
      target: proxyIPs.dev,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/mprdata': {
      target: proxyIPs.dev,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
  },
  pre: {
    '/volumetype': {
      target: proxyIPs.pre || proxyIPs.dev,
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/mprdata': {
      target: proxyIPs.pre || proxyIPs.dev,
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};
