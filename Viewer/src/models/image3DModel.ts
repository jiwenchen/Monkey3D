import {
  getMprData,
  getMprInfo,
  getOrientation,
  getVolumetype,
  getVrData,
  initServer,
  mprBrowse,
  panMpr,
  panVr,
  releaseServer,
  resetVr,
  rotatech,
  rotateVr,
  setMprIndex,
  setRenderType,
  setThickness,
  setVrSize,
  updatemprType,
  wwwlVr,
  zoomVr,
} from '@/services/imageViewer/ImageHttpService';
import { setImageData } from '@/utils/vesselManager';
import type { Effect, ImmerReducer, Subscription } from 'umi';

interface image3DModelType {
  namespace: string;
  state: image3DStateType;
  reducers: {
    InitState: ImmerReducer<image3DStateType>;
    setImageData: ImmerReducer<image3DStateType>;
    setMprInfo: ImmerReducer<image3DStateType>;
    setUid: ImmerReducer<image3DStateType>;
  };
  effects: {
    initServer: Effect;
    getVolumetype: Effect;
    getMprData: Effect;
    getMprInfo: Effect;
    panMpr: Effect;
    rotatech: Effect;
    getVrData: Effect;
    getZoomVr: Effect;
    getPanVr: Effect;
    getRotateVr: Effect;
    getRestVr: Effect;
    getWwwlVr: Effect;
    setRenderType: Effect;
    orientation: Effect;
    setVrSize: Effect;
    setThickness: Effect;
    setMprIndex: Effect;
    releaseServer: Effect;
    updatemprType: Effect;
  };
  subscriptions: {
    setup: Subscription;
  };
}
const image3DModelState = () => ({
  imageData: {},
  mprInfo: {},
  uid: '',
});

const image3DModel: image3DModelType = {
  namespace: 'image3DModel',
  state: image3DModelState(),
  reducers: {
    InitState() {
      return image3DModelState();
    },
    setImageData: function (state, action) {
      state.imageData = action.payload;
    },
    setMprInfo: function (state, action) {
      state.mprInfo = action.payload;
    },
    setUid: function (state, action) {
      state.uid = action.payload;
    },
  },
  effects: {
    *initServer({}, { call, put }) {
      const result: { message: string; uid: string } = yield call(initServer);
      if (!result?.uid || !result.message) {
        console.error('request failed');
        return;
      }
      yield put({ type: 'setUid', payload: result?.uid });
      return result?.uid;
    },
    *getVolumetype({ payload }, { call }) {
      const result: { message: string } = yield call(getVolumetype, payload);
      return result?.message;
    },
    *getMprData({ payload }, { call, put, select }) {
      const { plane_type, delta } = payload;
      const result: { data: any; message: boolean } = yield call(
        delta ? mprBrowse : getMprData,
        payload,
      );
      if (!result?.data || !result.message) {
        console.error('request failed');
        return;
      }
      let mprInfo = yield select(
        (state: { image3DModel: { mprInfo: any } }) => state.image3DModel.mprInfo,
      );
      if (result.data.index && result.data.total_num) {
        mprInfo = {
          ...mprInfo,
          [plane_type]: {
            x: result.data.x,
            y: result.data.y,
            index: result.data.index,
            total_num: result.data.total_num,
          },
        };
        yield put({ type: 'setMprInfo', payload: mprInfo });
      }
      let imageData = yield select(
        (state: { image3DModel: { imageData: any } }) => state.image3DModel.imageData,
      );
      imageData = { ...imageData, [plane_type]: result.data.image };
      yield put({ type: 'setImageData', payload: imageData });
      return true;
    },

    *getMprInfo({ payload }, { call, select, put }) {
      const { plane_type } = payload;
      const result: { data: any; message: boolean } = yield call(getMprInfo, payload);
      if (!result?.data || !result.message) {
        console.error('request failed');
        return;
      }
      let mprInfo = yield select(
        (state: { image3DModel: { mprInfo: any } }) => state.image3DModel.mprInfo,
      );
      mprInfo = {
        ...mprInfo,
        [plane_type]: result.data,
      };
      yield put({ type: 'setMprInfo', payload: mprInfo });
      return result.data;
    },
    *setMprIndex({ payload }, { call }) {
      const result: { message: boolean } = yield call(setMprIndex, payload);
      return result?.message;
    },
    *panMpr({ payload }, { call }) {
      yield call(panMpr, payload);
    },
    *rotatech({ payload }, { call }) {
      yield call(rotatech, payload);
    },
    *getVrData({ payload }, { call }) {
      const result: { data: any; message: boolean } = yield call(getVrData, payload);
      if (!result?.data || !result.message) {
        console.error('request failed');
        return;
      }
      setImageData(result.data.image);
    },
    *getZoomVr({ payload }, { call }) {
      const result: { data: any; message: boolean } = yield call(zoomVr, payload);
      if (!result?.data || !result.message) {
        console.error('request failed');
        return;
      }
      setImageData(result.data.image);
    },
    *getPanVr({ payload }, { call }) {
      const result: { data: any; message: boolean } = yield call(panVr, payload);
      if (!result?.data || !result.message) {
        console.error('request failed');
        return;
      }
      setImageData(result.data.image);
    },
    *getRotateVr({ payload }, { call }) {
      const result: { data: any; message: boolean } = yield call(rotateVr, payload);
      if (!result?.data || !result.message) {
        console.error('request failed');
        return;
      }
      setImageData(result.data.image);
    },
    *getRestVr({ payload }, { call }) {
      const result: { data: any; message: boolean } = yield call(resetVr, payload);
      if (!result?.data || !result.message) {
        console.error('request failed');
        return;
      }
      setImageData(result.data.image);
    },
    *getWwwlVr({ payload }, { call }) {
      const result: { data: any; message: boolean } = yield call(wwwlVr, payload);
      if (!result?.data || !result.message) {
        console.error('request failed');
        return;
      }
      setImageData(result.data.image);
    },
    *setRenderType({ payload }, { call }) {
      const result: { data: any; message: boolean } = yield call(setRenderType, payload);
      if (!result?.data || !result.message) {
        console.error('request failed');
        return;
      }
      setImageData(result.data.image);
    },
    *orientation({ payload }, { call }) {
      const result: { data: any; message: boolean } = yield call(getOrientation, payload);
      if (!result?.data || !result.message) {
        console.error('request failed');
        return;
      }
      setImageData(result.data.image);
    },
    *setVrSize({ payload }, { call }) {
      const result: { message: boolean } = yield call(setVrSize, payload);
      return result?.message;
    },
    *setThickness({ payload }, { call }) {
      yield call(setThickness, payload);
    },
    *releaseServer({ payload }, { call }) {
      yield call(releaseServer, payload);
    },
    *updatemprType({ payload }, { call }) {
      const result: { message: boolean } = yield call(updatemprType, payload);
      return result?.message;
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(({ pathname }) => {});
    },
  },
};
export default image3DModel;
