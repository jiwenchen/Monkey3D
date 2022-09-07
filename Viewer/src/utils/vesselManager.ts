import cornerstone from 'cornerstone-core';
import { decodeMPR, decodeVR } from './decodeImage';
import * as cornerstoneTools from 'cornerstone-tools';
import { cornerstoneTools3D } from '@/common/cornerstone/cornerstoneToolsManager';
import { enableElement } from '@/common/cornerstone/cornerstoneManager';
import { getDvaApp } from 'umi';
import mprOperateLine from '@/common/cornerstone/mprOperateLine';

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
// 蓝：Axial 红：Sagittal，黄：Coronal，
export const revertName = (imgId: number) => {
  if (imgId === 0) {
    return 'Axial';
  } else if (imgId === 1) {
    return 'Sagittal';
  } else {
    return 'Coronal';
  }
};

// 0:Axial,1:Sagittal,2:Coronal
// 蓝：Axial 红：Sagittal，黄：Coronal，
export const revertNumber = (sliceType: string) => {
  if (sliceType === 'Axial') {
    return 0;
  } else if (sliceType === 'Sagittal') {
    return 1;
  } else {
    return 2;
  }
};

// 0:Axial,1:Sagittal,2:Coronal
// 蓝：Axial 红：Sagittal，黄：Coronal，
export const revertDataName = (name: string) => {
  if (name === 'VR') {
    return 0;
  } else if (name === 'MIP') {
    return 1;
  } else {
    return 2;
  }
};

// 0:Axial,1:Sagittal,2:Coronal
// 蓝：Axial 红：Sagittal，黄：Coronal，
export const changeSliceType = (sliceType: string, lineType: string) => {
  if (sliceType === 'Axial') {
    if (lineType === 'Coronal') {
      return 'Sagittal';
    } else {
      return 'Coronal';
    }
  } else if (sliceType === 'Sagittal') {
    if (lineType === 'Coronal') {
      return 'Axial';
    } else {
      return 'Coronal';
    }
  } else {
    if (lineType === 'Sagittal') {
      return 'Axial';
    } else {
      return 'Sagittal';
    }
  }
};

// 0:Axial,1:Sagittal,2:Coronal
// 蓝：Axial 红：Sagittal，黄：Coronal，
export const changeAllSliceThickness = (sliceType: string, lineType: string, data: any) => {
  const linePointSliceType = changeSliceType(sliceType, lineType);
  const operateLine = mprOperateLine.mprOperateLines.find(
    (line: any) => line.getSliceType() === linePointSliceType,
  );
  if (
    (sliceType === 'Axial' && linePointSliceType === 'Sagittal') ||
    (sliceType === 'Sagittal' && linePointSliceType === 'Axial')
  ) {
    if (data.type.includes('horizontal')) {
      operateLine['verticalBottomSliceLine'].sliceThick = data.data.sliceThick;
      operateLine['verticalBottomSliceLine'].sliceNumber = data.data.sliceNumber;
      operateLine['verticalTopSliceLine'].sliceThick = data.data.sliceThick;
      operateLine['verticalTopSliceLine'].sliceNumber = data.data.sliceNumber;
    } else {
      operateLine['horizontalBottomSliceLine'].sliceThick = data.data.sliceThick;
      operateLine['horizontalBottomSliceLine'].sliceNumber = data.data.sliceNumber;
      operateLine['horizontalTopSliceLine'].sliceThick = data.data.sliceThick;
      operateLine['horizontalTopSliceLine'].sliceNumber = data.data.sliceNumber;
    }
  } else {
    if (data.type.includes('horizontal')) {
      operateLine['horizontalBottomSliceLine'].sliceThick = data.data.sliceThick;
      operateLine['horizontalBottomSliceLine'].sliceNumber = data.data.sliceNumber;
      operateLine['horizontalTopSliceLine'].sliceThick = data.data.sliceThick;
      operateLine['horizontalTopSliceLine'].sliceNumber = data.data.sliceNumber;
    } else {
      operateLine['verticalBottomSliceLine'].sliceThick = data.data.sliceThick;
      operateLine['verticalBottomSliceLine'].sliceNumber = data.data.sliceNumber;
      operateLine['verticalTopSliceLine'].sliceThick = data.data.sliceThick;
      operateLine['verticalTopSliceLine'].sliceNumber = data.data.sliceNumber;
    }
  }
  cornerstone.updateImage(operateLine.element);
};
