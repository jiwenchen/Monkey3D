import csTools from 'cornerstone-tools';
const BaseTool = csTools.importInternal('base/BaseTool');
import _ from 'lodash';
import { getDvaApp } from 'umi';
/**
 * @public
 * @class WwwcTool
 * @memberof Tools
 *
 * @classdesc Tool for setting wwwc by dragging with mouse/touch.
 * @extends Tools.Base.BaseTool
 */
export default class WwwcVrTool extends BaseTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'WwwcVr',
      supportedInteractionTypes: ['Mouse'],
      configuration: {
        throttleWait: 120,
        windowWidth: undefined, // 记录上次更新数据
        windowCenter: undefined, // 记录上次更新数据
      },
      svgCursor: undefined,
    };

    super(props, defaultProps);
  }

  mouseDragCallback(evt: any) {
    this.throttleDragCallback(evt);
  }

  throttleDragCallback = _.throttle(this.dragCallback, this.configuration.throttleWait);

  dragCallback(evt: any) {
    const eventData = evt.detail;
    if (this.configuration.windowCenter === undefined) {
      this.configuration.windowCenter = eventData.viewport.voi.windowCenter;
      this.configuration.windowWidth = eventData.viewport.voi.windowWidth;
    }
    const deltaX = eventData.deltaPoints.page.x;
    const deltaY = eventData.deltaPoints.page.y;
    if (deltaX === 0 && deltaY === 0) {
      return false;
    }

    this.configuration.windowWidth += deltaX;
    this.configuration.windowCenter += deltaY;
    const dva = getDvaApp()._store;
    const uid = dva.getState().image3DModel.uid;
    dva.dispatch({
      type: 'image3DModel/getWwwlVr',
      payload: { ww: this.configuration.windowWidth, wl: this.configuration.windowCenter, uid },
    });
    return false;
  }
}
