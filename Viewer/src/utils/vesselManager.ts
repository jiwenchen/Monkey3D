import cornerstone from 'cornerstone-core';
import { decodeMPR, decodeVR } from './decodeImage';
import * as cornerstoneTools from 'cornerstone-tools';
import { cornerstoneTools3D } from '@/common/cornerstone/cornerstoneToolsManager';
import { enableElement } from '@/common/cornerstone/cornerstoneManager';
import { getDvaApp } from 'umi';

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

export const getAllMprData = (sliceType?: string) => {
  let data = [0, 1, 2];
  if (sliceType) {
    data = data.filter((i: number) => i !== revertNumber(sliceType));
  }
  const dva = getDvaApp()._store;
  const uid = dva.getState().image3DModel.uid;
  data.forEach((num) => {
    getDvaApp()._store.dispatch({
      type: 'image3DModel/getMprData',
      payload: { plane_type: num, uid },
    });
  });
};

// 0:Axial,1:Sagittal,2:Coronal
export const revertName = (imgId: number) => {
  let name = 'Axial';
  if (imgId === 0) {
    name = 'Axial';
  } else if (imgId === 1) {
    name = 'Sagittal';
  } else {
    name = 'Coronal';
  }
  return name;
};

// 0:Axial,1:Sagittal,2:Coronal
export const revertNumber = (sliceType: string) => {
  let number = 0;
  if (sliceType === 'Axial') {
    number = 0;
  } else if (sliceType === 'Sagittal') {
    number = 1;
  } else {
    number = 2;
  }
  return number;
};

// 0:Axial,1:Sagittal,2:Coronal
export const revertDataName = (name: string) => {
  let type = 0;
  if (name === 'VR') {
    type = 0;
  } else if (name === 'MIP') {
    type = 1;
  } else {
    type = 2;
  }
  return type;
};
