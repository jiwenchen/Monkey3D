//  开发-develop,发布-production
export const env_type = document.location.hostname === 'localhost' ? 'develop' : 'production';
//  系统语言
export const language =
  env_type === 'develop' ? 'cn' : navigator.language === 'zh-CN' ? 'cn' : 'en';

export const Configuration = {};
