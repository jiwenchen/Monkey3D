import { setActiveTool } from '@/common/cornerstone/cornerstoneToolsManager';
import type { ImmerReducer, Subscription } from 'umi';

interface viewport3DModelType {
  namespace: string;
  state: viewport3DStateType;
  reducers: {
    InitState: ImmerReducer<viewport3DStateType>;
    setLayout: ImmerReducer<viewport3DStateType>;
    setViewPortActive: ImmerReducer<viewport3DStateType>;
    setUsToolsState: ImmerReducer<viewport3DStateType>;
  };
  subscriptions: {
    setup: Subscription;
  };
}

const viewport3DModelState = () => ({
  currentViewPort: { imgId: 'plane_type_vr' },
  layout: [2, 2],
  usToolsState: {
    Wwwc: false,
    Zoom: false,
    Pan: false,
    Length: false,
    Angle: false,
    Probe: false,
    EllipticalRoi: false,
    RectangleRoi: false,
    ArrowAnnotate: false,
    Magnify: false,
  },
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
    setUsToolsState(state: viewport3DStateType, action) {
      const tool = action.payload;
      const obj = { ...state.usToolsState };
      // ReferenceLines和usToolsState中其他工具互不影响
      for (const key in obj) {
        if (key === tool && !obj[key]) {
          obj[key] = true;
        } else {
          obj[key] = false;
        }
      }
      setActiveTool(obj);
      state.usToolsState = obj;
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
