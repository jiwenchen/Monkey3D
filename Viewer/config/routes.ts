export default [
  {
    path: '/',
    redirect: '/imageViewer/',
  },
  {
    path: '/imageViewer/',
    name: 'imageViewer',
    component: './imageViewer/index',
  },
  {
    component: './404',
  },
];
