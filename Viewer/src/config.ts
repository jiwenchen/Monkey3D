//  开发-develop,发布-production
export const env_type = document.location.hostname === 'localhost' ? 'develop' : 'production';
//  系统语言
export const language =
  env_type === 'develop' ? 'cn' : navigator.language === 'zh-CN' ? 'cn' : 'en';

const LOCAL_HOSTNAME = 'localhost';
const { NODE_ENV } = process.env;
const EXPIRED_TIME = 10 * 60 * 1e3; // 检测过期时间10分钟
export const DEFALUT_VIEWER = 'brain';

const PORT = document.location.port;
const HOSTNAME = document.location.hostname;
const PROTOCOL = document.location.protocol;
const ORIGIN_URL = PROTOCOL + '//' + (PORT ? HOSTNAME + ':' + PORT : HOSTNAME);
export const isProduction = NODE_ENV === 'production';

const VIEWER_PATH = isProduction ? '/listViewer/' : '/';
const CONFIG_FILE = `${VIEWER_PATH}config.json`;
const BIOMIND_SERVER = '/apiv3';
const BIOMIND_SERVER_LIST_VIEWER = `${BIOMIND_SERVER}/listviewer`;
const BIOMIND_SETTINGS = `${BIOMIND_SERVER}/settings/`;
const USER_SETTINGS = `${BIOMIND_SETTINGS}user_settings/`;
const USERS_ENDPOINT = `${BIOMIND_SERVER}/users`;
const EXPIRED_URL = ORIGIN_URL + '/oauth/expired';

const HOME = ORIGIN_URL + '/home/';

const LOGOUT = ORIGIN_URL + '/oauth/logout-v2';
const REQUESTLOGIN_URL = ORIGIN_URL + '/oauth/login-v2';
const PASSWORDEDIT_URL = ORIGIN_URL + '/oauth/password-v2';
const PLATFORM = 'Radiology';
const MANAGEMENT = isProduction
  ? `${ORIGIN_URL}/management/`
  : `${PROTOCOL}//${HOSTNAME}:8003/management/`;

const REQUIREDSERIES = {
  'brain.hemo_MR': {
    predictor: 'brainmri_predictor',
    required_series: ['AX_T1', 'AX_T2', 'AX_TC', 'DWI_B1000', 'ADC', 'AX_T2Flair', 'SWI'],
  },
  'brain.hemo_CT': {
    predictor: 'brainct_predictor',
    required_series: ['CT_Brain'],
  },
  'brain.skull_CT': {
    predictor: 'brainct_bone_predictor',
    required_series: ['CT_BONE'],
  },
  'vessel.brainVessel_CT': {
    predictor: 'braincta_predictor',
    required_series: ['CTA'],
  },
  'vessel.brainVessel_MR': {
    predictor: 'brainmra_predictor',
    required_series: ['MRA'],
  },
  'vessel.arch_CT': {
    predictor: 'archcta_predictor',
    required_series: ['CTA'],
  },
  'vessel.corocta_CT': {
    predictor: 'corocta_predictor',
    required_series: ['CT_120KV', 'CTA'],
  },
  heart_MR: {
    predictor: 'heartmri_predictor',
    required_series: ['CINE_SHORT', 'CINE_2CH', 'CINE_3CH', 'CINE_4CH', 'LGE_SHORT'],
  },
  perfusion_CT: {
    predictor: 'brainctp_predictor',
    required_series: ['CTP'],
  },
  mrPerfusion_MR: {
    predictor: 'brainmrp_predictor',
    required_series: ['ADC', 'DWI', 'PWI'],
  },
  lung_CT: {
    predictor: 'lungct_predictor',
    required_series: ['CT_Lung'],
  },
  lungCancer_CT: {
    predictor: 'lungct_v2_predictor',
    required_series: ['CT_Lung'],
  },
  breast_MR: {
    predictor: 'breastmri_predictor',
    required_series: ['Breast_AX_T2', 'Breast_DWI', 'DCE', 'Breast_AX_T1'],
  },
  liver_CT: {
    predictor: 'liver_predictor',
    required_series: ['CT_Liver', 'AP_Liver', 'VP_Liver', 'AP&VP_Liver'],
  },
  prostatemri_MR: {
    predictor: 'prostatemri_predictor',
    required_series: ['T2', 'PI-DWI'],
  },
};

export const Configuration = {
  biomindUrl: BIOMIND_SERVER,
  biomindListUrl: BIOMIND_SERVER_LIST_VIEWER,
  biomindSettingUrl: BIOMIND_SETTINGS,
  userSettingsUrl: USER_SETTINGS,
  usersUrl: USERS_ENDPOINT,
  expiredUrl: EXPIRED_URL,
  logout: LOGOUT,
  home: HOME,
  // add SERVER_API_URL
  serverUrl: LOCAL_HOSTNAME,
  configFile: CONFIG_FILE,
  requestloginurl: REQUESTLOGIN_URL,
  passwordEditUrl: PASSWORDEDIT_URL,
  platform: PLATFORM,
  viewerPath: VIEWER_PATH,
  management: MANAGEMENT,
  expiredTime: EXPIRED_TIME,
  requiredSeries: REQUIREDSERIES,
};
