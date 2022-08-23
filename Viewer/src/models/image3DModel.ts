import { getMprData, getVolumetype } from '@/services/imageViewer/ImageHttpService';
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
      const { plane_type } = payload;
      const result: { data: any; message: boolean } = yield call(getMprData, payload);
      if (!result?.data || !result.message) {
        console.log('request failed');
        return;
      }
      const imageData = { [plane_type]: result.data.image };
      yield put({ type: 'setImageData', payload: imageData });
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(({ pathname }) => {});
    },
  },
};
export default image3DModel;
