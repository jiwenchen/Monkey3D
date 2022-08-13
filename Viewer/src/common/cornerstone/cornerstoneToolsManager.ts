import { getDvaApp } from 'umi';
import * as cornerstoneTools from 'cornerstone-tools';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneMath from 'cornerstone-math';
import Hammer from 'hammerjs';
import $ from 'jquery';
cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.init();

export const resetElement = (element: null | HTMLElement) => {
  if (!element) return;
  cornerstone.reset(element);
};

export const setActiveTool = (usToolsState: any) => {
  for (const tool in usToolsState) {
    $('.vessel-cornerstone-image').each((i: number, element: HTMLElement) => {
      if (usToolsState[tool]) {
        cornerstoneTools.setToolActive(tool, { mouseButtonMask: 1 });
      } else {
        cornerstoneTools.setToolEnabledForElement(element, tool);
      }
    });
  }
};

export const cornerstoneToolsInit = () => {
  // 滚轮滚动
  const apiTool = cornerstoneTools.StackScrollMouseWheelTool;
  cornerstoneTools.addTool(apiTool, { configuration: { loop: true } });
  cornerstoneTools.setToolActive('StackScrollMouseWheel', {});

  const dva = getDvaApp()._store;
  const usToolsState = dva.getState().viewport3DModel.usToolsState;
  Object.keys(usToolsState).map((item: string, index: number) => {
    const api = cornerstoneTools[`${item}Tool`];
    cornerstoneTools.addTool(api);
  });
};
