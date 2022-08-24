import csTools from 'cornerstone-tools';
const BaseTool = csTools.importInternal('base/BaseTool');
import _ from 'lodash';
import { getDvaApp } from 'umi';

export default class RotateVrTool extends BaseTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'RotateVr',
      supportedInteractionTypes: ['Mouse'],
      svgCursor: undefined,
      configuration: {
        throttleWait: 110,
        minDelta: 1,
      },
    };

    super(props, defaultProps);
  }

  mouseDragCallback(evt: any) {
    this.throttleDragCallback(evt);
  }

  throttleDragCallback = _.throttle(this.dragCallback, this.configuration.throttleWait);

  dragCallback(evt: any) {
    const {
      deltaPoints: {
        image: { x, y },
      },
    } = evt.detail;
    if (
      (x && Math.abs(x) > this.configuration.minDelta) ||
      (y && Math.abs(y) > this.configuration.minDelta)
    ) {
      getDvaApp()._store.dispatch({
        type: 'image3DModel/getVrData',
        payload: { x_angle: x, y_angle: y },
      });
    }
  }
}
