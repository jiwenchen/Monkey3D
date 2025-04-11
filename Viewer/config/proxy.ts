/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */
const proxyDev = 'http://192.168.6.37:7799';
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
    '/mprinfo': {
      target: proxyIPs.dev,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/vrdata': {
      target: proxyIPs.dev,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/rotatevr': {
      target: proxyIPs.dev,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/mprbrowse': {
      target: proxyIPs.dev,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/zoomvr': {
      target: proxyIPs.dev,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/panvr': {
      target: proxyIPs.dev,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/wwwl': {
      target: proxyIPs.dev,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/reset': {
      target: proxyIPs.dev,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/panch': {
      target: proxyIPs.dev,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/rotatech': {
      target: proxyIPs.dev,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/setrendertype': {
      target: proxyIPs.dev,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/orientation': {
      target: proxyIPs.dev,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/setvrsize': {
      target: proxyIPs.dev,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/initserver': {
      target: proxyIPs.dev,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/setthickness': {
      target: proxyIPs.dev,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/releaseserver': {
      target: proxyIPs.dev,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/updatemprtype': {
      target: proxyIPs.dev,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/setmprindex': {
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
    '/mprinfo': {
      target: proxyIPs.pre || proxyIPs.dev,
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/vrdata': {
      target: proxyIPs.pre || proxyIPs.dev,
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/rotatevr': {
      target: proxyIPs.pre || proxyIPs.dev,
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/mprbrowse': {
      target: proxyIPs.pre || proxyIPs.dev,
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/zoomvr': {
      target: proxyIPs.pre || proxyIPs.dev,
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/panvr': {
      target: proxyIPs.pre || proxyIPs.dev,
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/wwwl': {
      target: proxyIPs.pre || proxyIPs.dev,
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/reset': {
      target: proxyIPs.pre || proxyIPs.dev,
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/panch': {
      target: proxyIPs.pre || proxyIPs.dev,
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/rotatech': {
      target: proxyIPs.pre || proxyIPs.dev,
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/setrendertype': {
      target: proxyIPs.pre || proxyIPs.dev,
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/orientation': {
      target: proxyIPs.pre || proxyIPs.dev,
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/setvrsize': {
      target: proxyIPs.pre || proxyIPs.dev,
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/initserver': {
      target: proxyIPs.pre || proxyIPs.dev,
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/setthickness': {
      target: proxyIPs.pre || proxyIPs.dev,
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/releaseserver': {
      target: proxyIPs.pre || proxyIPs.dev,
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/updatemprtype': {
      target: proxyIPs.pre || proxyIPs.dev,
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/setmprindex': {
      target: proxyIPs.pre || proxyIPs.dev,
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};
