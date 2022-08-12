import type { ImmerReducer, Subscription } from 'umi';

interface viewport3DModelType {
  namespace: string;
  state: viewport3DStateType;
  reducers: {
    InitState: ImmerReducer<viewport3DStateType>;
    setLayout: ImmerReducer<viewport3DStateType>;
    setViewPortActive: ImmerReducer<viewport3DStateType>;
  };
  subscriptions: {
    setup: Subscription;
  };
}

const viewport3DModelState = () => ({
  currentViewPort: { imgId: 'plane_type_vr' },
  layout: [2, 2],
});

const viewport3DModel: viewport3DModelType = {
  namespace: 'viewport3DModel',
  state: viewport3DModelState(),
  reducers: {
    InitState(state: viewport3DStateType) {
      state = viewport3DModelState();
    },
    setLayout(state: viewport3DStateType, action) {
      state.layout = action.payload;
    },
    setViewPortActive(state: viewport3DStateType, action) {
      state.currentViewPort = Object.assign({}, state.currentViewPort, action.payload);
    },
  },
  subscriptions: {
    /**
     * 监听路由并记录
     */
    setup({ dispatch, history }) {
      history.listen(({ pathname }: { pathname: any }) => {
        if (pathname.indexOf('/listViewer') > -1) {
          dispatch({ type: 'InitState' });
        }
      });
    },
  },
};
export default viewport3DModel;
