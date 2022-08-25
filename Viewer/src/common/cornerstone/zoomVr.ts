import _ from 'lodash';
import csTools from 'cornerstone-tools';
const BaseTool = csTools.importInternal('base/BaseTool');
import { getDvaApp } from 'umi';

export default class ZoomVrTool extends BaseTool {
  constructor(configuration = {}) {
    const defaultConfig = {
      name: 'ZoomVr',
      supportedInteractionTypes: ['Mouse'],
      configuration: {
        minScale: 0.25,
        maxScale: 20.0,
        throttleWait: 110,
        zoomInScale: 1.05,
        zoomOutScale: 0.95,
      },
      svgCursor: undefined,
    };
    super({ ...configuration, ...defaultConfig });
  }

  mouseDragCallback(evt: any) {
    this.throttleDragCallback(evt);
  }
  throttleDragCallback = _.throttle(this.dragCallback, this.configuration.throttleWait);
  dragCallback(evt: any) {
    const deltaY = evt.detail.deltaPoints.page.y;

    if (!deltaY) {
      return false;
    }
    const { zoomInScale, zoomOutScale } = this.configuration;
    const scale = deltaY > 0 ? zoomInScale : zoomOutScale;
    getDvaApp()._store.dispatch({
      type: 'image3DModel/getZoomVr',
      payload: { delta: scale },
    });

    return false;
  }
}
