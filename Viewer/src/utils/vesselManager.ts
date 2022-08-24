import cornerstone from 'cornerstone-core';
import { decodeMPR, decodeVR } from './decodeImage';
import * as cornerstoneTools from 'cornerstone-tools';
import { cornerstoneTools3D } from '@/common/cornerstone/cornerstoneToolsManager';
import { enableElement } from '@/common/cornerstone/cornerstoneManager';

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
