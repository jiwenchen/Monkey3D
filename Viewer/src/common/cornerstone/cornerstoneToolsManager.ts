import { getDvaApp } from 'umi';
import * as cornerstoneTools from 'cornerstone-tools';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneMath from 'cornerstone-math';
import Hammer from 'hammerjs';
import RotateVrTool from '@/common/cornerstone/rotateVr';
import ZoomVrTool from './zoomVr';
import WwwcVrTool from './wwwcVr';
import StackScroll3dMouseWheelTool from './stackScroll3dMouseWheelTool';
import PanVrTool from './panVr';
cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.init();
cornerstoneTools.ZoomVrTool = ZoomVrTool;
cornerstoneTools.RotateVrTool = RotateVrTool;
cornerstoneTools.WwwcVrTool = WwwcVrTool;
cornerstoneTools.PanVrTool = PanVrTool;
cornerstoneTools.StackScroll3dMouseWheelTool = StackScroll3dMouseWheelTool;

export const resetElement = (element: null | HTMLElement) => {
  if (!element) return;
  cornerstone.reset(element);
};

export const resetVr = () => {
  const dva = getDvaApp()._store;
  const uid = dva.getState().image3DModel.uid;
  dva.dispatch({
    type: 'image3DModel/getRestVr',
    payload: { uid },
  });
};

export const cornerstoneTools3D = {
  vr: ['ZoomVr', 'PanVr', 'WwwcVr', 'RotateVr'],
  mpr: ['Zoom', 'Pan', 'Wwwc', 'Length', 'Probe'],
};
