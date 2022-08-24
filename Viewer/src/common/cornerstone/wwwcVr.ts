import csTools from 'cornerstone-tools';
const BaseTool = csTools.importInternal('base/BaseTool');
import _ from 'lodash';
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
        throttleWait: 110,
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
  mouseUpCallback(evt: any) {
    this.configuration.windowCenter = undefined;
    this.configuration.windowWidth = undefined;
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

    // getVrWwwcImage(this.configuration.windowWidth, this.configuration.windowCenter);
    return false;
  }
}
