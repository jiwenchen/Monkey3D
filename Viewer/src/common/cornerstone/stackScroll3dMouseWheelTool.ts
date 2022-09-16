import csTools from 'cornerstone-tools';
const BaseTool = csTools.importInternal('base/BaseTool');
import cornerstone from 'cornerstone-core';
import _ from 'lodash';
import { getDvaApp } from 'umi';
import { scrollBarsetMprInfo } from '@/utils/vesselManager';

/**
 * @public
 * @class StackScroll3dMouseWheelTool
 * @memberof Tools
 *
 * @classdesc Tool for scrolling through a series using the mouse wheel.
 * @extends Tools.Base.BaseTool
 */
export default class StackScroll3dMouseWheelTool extends BaseTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'StackScroll3dMouseWheel',
      supportedInteractionTypes: ['MouseWheel'],
      configuration: {
        loop: false,
        allowSkipping: true,
        invert: false,
        throttleWait: 150,
      },
    };

    super(props, defaultProps);
  }

  throttleCallback = _.throttle(this.doMouseWheel, this.configuration.throttleWait);

  mouseWheelCallback(evt: any) {
    this.throttleCallback(evt);
  }

  doMouseWheel(evt: any) {
    const { direction: images, element } = evt.detail;
    const { invert } = this.configuration;
    const direction = invert ? -images : images;
    const { imageId } = cornerstone.getImage(element);
    const dva = getDvaApp()._store;
    const uid = dva.getState().image3DModel.uid;
    dva
      .dispatch({
        type: 'image3DModel/getMprData',
        payload: { plane_type: imageId.split('//')[1], delta: direction, uid },
      })
      .then((res: boolean) => {
        //更新其他图片中心坐标
        if (res) scrollBarsetMprInfo(Number(imageId.split('//')[1]));
      });
  }
}
