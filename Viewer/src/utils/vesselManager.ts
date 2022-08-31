import cornerstone from 'cornerstone-core';
import { decodeMPR, decodeVR } from './decodeImage';
import * as cornerstoneTools from 'cornerstone-tools';
import { cornerstoneTools3D } from '@/common/cornerstone/cornerstoneToolsManager';
import { enableElement } from '@/common/cornerstone/cornerstoneManager';
import { getDvaApp } from 'umi';
// import Crosshairs from '@/common/cornerstone/crosshairs';

export const addToolsForElement = (element: HTMLElement, imgId: string) => {
  const imgType = imgId == 'vr' ? 'vr' : 'mpr';
  const tools = cornerstoneTools3D[imgType];
  tools.forEach((tool) => {
    cornerstoneTools.addToolForElement(element, cornerstoneTools[`${tool}Tool`]);
  });
  if (imgType === 'mpr') {
    const toolName = 'StackScroll3dMouseWheel';
    cornerstoneTools.addToolForElement(element, cornerstoneTools[`${toolName}Tool`]);
    cornerstoneTools.setToolActiveForElement(element, toolName, {});
    // const crosshairs = new Crosshairs(imgId, element);
    // getDvaApp()._store.dispatch({
    //   type: 'viewport3DModel/setCrosshairsManager',
    //   payload: { crosshairs },
    // });
    // crosshairs._activate(element);
  }
};

export const enableAllTools = (element: HTMLElement, imgId: string) => {
  const imgType = imgId == 'vr' ? 'vr' : 'mpr';
  const tools = cornerstoneTools3D[imgType];
  tools.forEach((tool) => {
    cornerstoneTools.setToolEnabledForElement(element, tool);
  });
};

export const updateActiveTool = (element: HTMLElement, imgId: string, tool: string) => {
  enableAllTools(element, imgId);
  const imgType = imgId == 'vr' ? 'vr' : 'mpr';
  const tools = cornerstoneTools3D[imgType];
  if (tools.includes(tool)) {
    cornerstoneTools.setToolActiveForElement(element, tool, {
      mouseButtonMask: 1,
    });
  }
};

export const initPostPrcsViewport = (element: HTMLElement, imgId: string) => {
  enableElement(element);
  addToolsForElement(element, imgId);
};

export const updatePostPrcsViewport = (element: HTMLElement, imgId: string, base64Data: string) => {
  if (!base64Data) return;
  const cornerstoneMetaData: any =
    imgId == 'vr' ? decodeVR(base64Data, imgId) : decodeMPR(base64Data, imgId);
  cornerstone.displayImage(element, cornerstoneMetaData);
  cornerstone.updateImage(element, true);
};

export const setImageData = (data: string) => {
  const dva = getDvaApp()._store;
  let imageData = dva.getState().image3DModel.imageData;
  imageData = { ...imageData, vr: data };
  dva.dispatch({
    type: 'image3DModel/setImageData',
    payload: imageData,
  });
};

export const getAllMprData = (status?: boolean, evt?: any, operation?: any) => {
  [0, 1, 2].forEach((index) => {
    getDvaApp()
      ._store.dispatch({
        type: 'image3DModel/getMprData',
        payload: { plane_type: index },
      })
      .then((res: any) => {
        if (status) return;
        activateCrossharis(res, index, evt, operation);
      });
  });
};

export const activateCrossharis = (point: any, id: number, evt: any, operation: any) => {
  const dva = getDvaApp()._store;
  const crosshairsManager = dva.getState().viewport3DModel.crosshairsManager;
  crosshairsManager[id].crosshairsPoint = point;
  if (operation === 1) {
    crosshairsManager[id]._dragCrosshairs(evt);
  } else {
    crosshairsManager[id]._rotateCrosshairs(evt);
  }
};
