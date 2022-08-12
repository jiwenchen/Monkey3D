import * as cornerstoneTools from 'cornerstone-tools';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneMath from 'cornerstone-math';
import Hammer from 'hammerjs';

cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.init();

export const usToolsState = {
  Wwwc: true,
  Zoom: false,
  Pan: false,
  Length: false,
  Angle: false,
  Probe: false,
  EllipticalRoi: false,
  RectangleRoi: false,
  ArrowAnnotate: false,
  Magnify: false,
};

export const setActiveTool = (tool: string) => {
  Object.keys(usToolsState).map((item) => {
    if (item === tool) {
      cornerstoneTools.setToolActive(item, { mouseButtonMask: 1 });
    } else {
      cornerstoneTools.setToolEnabled(item);
    }
  });
};

export const cornerstoneToolsInit = () => {
  // 滚轮滚动
  const apiTool = cornerstoneTools.StackScrollMouseWheelTool;
  cornerstoneTools.addTool(apiTool, { configuration: { loop: true } });
  cornerstoneTools.setToolActive('StackScrollMouseWheel', {});

  Object.keys(usToolsState).map((item: string, index: number) => {
    const api = cornerstoneTools[`${item}Tool`];
    cornerstoneTools.addTool(api);
  });
  setActiveTool('Wwwc');
};
