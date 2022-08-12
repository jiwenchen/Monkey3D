/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */
const proxyDev = 'http://192.168.6.34';
export const proxyIPs = {
  dev: proxyDev,
  production: '/',
  // 如果使用dev，ip 则test， pre不需要配置
  test: '',
  pre: '',
};

export default {
  dev: {
    // localhost:8000/api/** -> https://preview.pro.ant.design/api/**
    '/apiv3': {
      // 要代理的地址
      target: proxyIPs.dev,
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能需要 listViewer、imageViewer 共享 cookie
      changeOrigin: true,
      secure: false,
    },
    '/png/': {
      // 要代理的地址
      target: proxyIPs.dev,
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能需要 listViewer、imageViewer 共享 cookie
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/bm/': {
      // 要代理的地址
      target: proxyIPs.dev,
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能需要 listViewer、imageViewer 共享 cookie
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/oauth': {
      // 要代理的地址
      target: proxyIPs.dev,
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能需要 listViewer、imageViewer 共享 cookie
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/orthanc/': {
      // 要代理的地址
      target: proxyIPs.dev,
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能需要 listViewer、imageViewer 共享 cookie
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
  },
  test: {
    '/apiv3/': {
      target: proxyIPs.test || proxyIPs.dev,
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  pre: {
    '/apiv3/': {
      target: proxyIPs.pre || proxyIPs.dev,
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};
