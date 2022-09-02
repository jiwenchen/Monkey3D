import {
  getMprData,
  getOrientation,
  getVolumetype,
  getVrData,
  mprBrowse,
  panMpr,
  resetVr,
  rotatech,
  rotateVr,
  setRenderType,
  setVrSize,
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
  };
  effects: {
    getVolumetype: Effect;
    getMprData: Effect;
    panMpr: Effect;
    rotatech: Effect;
    getVrData: Effect;
    getZoomVr: Effect;
    getRotateVr: Effect;
    getRestVr: Effect;
    getWwwlVr: Effect;
    setRenderType: Effect;
    orientation: Effect;
    setVrSize: Effect;
  };
  subscriptions: {
    setup: Subscription;
  };
}
const image3DModelState = () => ({
  imageData: {},
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
  },
  effects: {
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
      let imageData = yield select(
        (state: { image3DModel: { imageData: any } }) => state.image3DModel.imageData,
      );
      imageData = { ...imageData, [plane_type]: result.data.image };
      yield put({ type: 'setImageData', payload: imageData });
      return { x: result.data.x, y: result.data.y };
    },
    *panMpr({ payload }, { call }) {
      yield call(panMpr, payload);
    },
    *rotatech({ payload }, { call }) {
      yield call(rotatech, payload);
    },
    *getVrData(_, { call }) {
      const result: { data: any; message: boolean } = yield call(getVrData);
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
    *getRotateVr({ payload }, { call }) {
      const result: { data: any; message: boolean } = yield call(rotateVr, payload);
      if (!result?.data || !result.message) {
        console.error('request failed');
        return;
      }
      setImageData(result.data.image);
    },
    *getRestVr(_, { call }) {
      const result: { data: any; message: boolean } = yield call(resetVr);
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
      yield call(setVrSize, payload);
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(({ pathname }) => {});
    },
  },
};
export default image3DModel;
