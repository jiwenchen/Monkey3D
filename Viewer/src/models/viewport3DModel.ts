import type { ImmerReducer, Subscription } from 'umi';

interface viewport3DModelType {
  namespace: string;
  state: viewport3DStateType;
  reducers: {
    InitState: ImmerReducer<viewport3DStateType>;
    setLayout: ImmerReducer<viewport3DStateType>;
    setViewPortActive: ImmerReducer<viewport3DStateType>;
    setCurrentTool: ImmerReducer<viewport3DStateType>;
    setCrosshairsManager: ImmerReducer<viewport3DStateType>;
  };
  subscriptions: {
    setup: Subscription;
  };
}

const viewport3DModelState = () => ({
  currentViewPort: { imgId: 'vr' },
  layout: [2, 2],
  currentTool: '',
  crosshairsManager: {
    0: null,
    1: null,
    2: null,
  },
});

const viewport3DModel: viewport3DModelType = {
  namespace: 'viewport3DModel',
  state: viewport3DModelState(),
  reducers: {
    InitState(state: viewport3DStateType) {
      return viewport3DModelState();
    },
    setLayout(state: viewport3DStateType, action) {
      state.layout = action.payload;
    },
    setViewPortActive(state: viewport3DStateType, action) {
      state.currentViewPort = Object.assign({}, state.currentViewPort, action.payload);
    },
    setCurrentTool(state, action) {
      state.currentTool = action.payload;
    },
    setCrosshairsManager(state: viewport3DStateType, { payload: { crosshairs } }) {
      const obj = {};
      obj[crosshairs.imgId] = crosshairs;
      return { ...state, crosshairsManager: { ...state.crosshairsManager, ...obj } };
    },
  },
  subscriptions: {
    /**
     * 监听路由并记录
     */
    setup({ dispatch, history }) {
      history.listen(({ pathname }: { pathname: any }) => {});
    },
  },
};
export default viewport3DModel;
