import csTools from 'cornerstone-tools';
const BaseTool = csTools.importInternal('base/BaseTool');
import _ from 'lodash';
import { getDvaApp } from 'umi';
/**
 * @public
 * @class PanVrTool
 * @memberof Tools
 *
 * @classdesc Tool for setting wwwc by dragging with mouse/touch.
 * @extends Tools.Base.BaseTool
 */
export default class PanVrTool extends BaseTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'PanVr',
      supportedInteractionTypes: ['Mouse'],
      configuration: {
        throttleWait: 120,
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
    const deltaX = eventData.deltaPoints.image.x;
    const deltaY = eventData.deltaPoints.image.y;
    if (deltaX === 0 && deltaY === 0) {
      return false;
    }
    const dva = getDvaApp()._store;
    const uid = dva.getState().image3DModel.uid;
    dva.dispatch({
      type: 'image3DModel/getPanVr',
      payload: { x_shift: deltaX, y_shift: deltaY, uid },
    });
    return false;
  }
}
