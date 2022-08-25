import { getDvaApp } from 'umi';
import * as cornerstoneTools from 'cornerstone-tools';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneMath from 'cornerstone-math';
import Hammer from 'hammerjs';
import RotateVrTool from '@/common/cornerstone/rotateVr';
import ZoomVrTool from './zoomVr';
import WwwcVrTool from './wwwcVr';
import StackScroll3dMouseWheelTool from './stackScroll3dMouseWheelTool';
cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.init();
cornerstoneTools.ZoomVrTool = ZoomVrTool;
cornerstoneTools.RotateVrTool = RotateVrTool;
cornerstoneTools.WwwcVrTool = WwwcVrTool;
cornerstoneTools.StackScroll3dMouseWheelTool = StackScroll3dMouseWheelTool;

export const resetElement = (element: null | HTMLElement) => {
  if (!element) return;
  cornerstone.reset(element);
};

export const resetVr = () => {
  getDvaApp()._store.dispatch({
    type: 'image3DModel/getRestVr',
  });
};

export const cornerstoneTools3D = {
  vr: ['ZoomVr', 'Pan', 'WwwcVr', 'RotateVr'],
  mpr: ['Zoom', 'Pan', 'Wwwc', 'Length', 'Probe'],
};
