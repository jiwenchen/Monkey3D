import React, { useEffect, useRef } from 'react';
import { connect } from 'umi';
import classnames from 'classnames';
import styles from './VesselViewport.less';
import {
  getAllMprData,
  initPostPrcsViewport,
  revertName,
  updateActiveTool,
  updatePostPrcsViewport,
} from '@/utils/vesselManager';
import Operation3D from '@/pages/imageViewer/components/Operation3D';
import mprOperateLine from '@/common/cornerstone/mprOperateLine';
import _ from 'lodash';

const VesselViewport: React.FC<any> = (props) => {
  const { imgId, imageData, dispatch, currentViewPort, currentTool } = props;
  const base64Data = imageData[imgId];
  const canvasId = `vesselImage-${imgId}`;
  const elementRef = useRef<any | HTMLDivElement>(null);

  useEffect(() => {
    initPostPrcsViewport(elementRef.current, imgId);
    if (imgId === 'vr') {
      dispatch({
        type: 'viewport3DModel/setViewPortActive',
        payload: { element: elementRef.current },
      });
    }
    elementRef.current?.removeEventListener(
      'CornerstoneToolsMprOperatePositionModified',
      manuallyModifyCoordinates,
    );
    elementRef.current?.addEventListener(
      'CornerstoneToolsMprOperatePositionModified',
      manuallyModifyCoordinates,
    );
    return () =>
      elementRef.current?.removeEventListener(
        'CornerstoneToolsMprOperatePositionModified',
        manuallyModifyCoordinates,
      );
  }, []);

  const imgPaneClicked = (event: any, id: string) => {
    // event.preventDefault();
    dispatch({
      type: 'viewport3DModel/setViewPortActive',
      payload: { imgId: id, element: elementRef.current },
    });
  };

  useEffect(() => {
    if (base64Data) {
      updatePostPrcsViewport(elementRef.current, imgId, base64Data);
      const length = Object.keys(imageData).filter((i) => i !== 'vr').length;
      // 防止重复渲染十字线
      if (imgId !== 'vr' && mprOperateLine.mprOperateLines.length < length) {
        mprOperateLine.active(elementRef.current, revertName(imgId));
      }
    }
  }, [base64Data]);

  const manuallyModifyCoordinates = _.throttle((e: any) => {
    const { imagePoint, changeType, sliceType } = e.detail;
    if (
      changeType === 'centerRect' ||
      changeType === 'horizontalLine' ||
      changeType === 'verticalLine'
    ) {
      dispatch({
        type: 'image3DModel/panMpr',
        payload: {
          plane_type: imgId,
          x: imagePoint.x,
          y: imagePoint.y,
        },
      });
      getAllMprData(sliceType);
    }
  }, 100);

  useEffect(() => {
    updateActiveTool(elementRef.current, imgId, currentTool);
  }, [currentTool]);

  return (
    <>
      <div
        id={canvasId}
        className={classnames('vessel-cornerstone-image', styles.box, {
          [styles.focused]: currentViewPort.imgId === imgId,
        })}
        ref={elementRef}
        onClick={(event) => {
          imgPaneClicked(event, imgId);
        }}
        onMouseDown={(event) => {
          imgPaneClicked(event, imgId);
        }}
        onWheel={(event) => {
          imgPaneClicked(event, imgId);
        }}
      />
      {imgId === 'vr' && <Operation3D />}
    </>
  );
};
export default connect(
  ({
    image3DModel,
    viewport3DModel,
  }: {
    image3DModel: image3DStateType;
    viewport3DModel: viewport3DStateType;
  }) => {
    const { imageData } = image3DModel;
    const { currentViewPort, currentTool } = viewport3DModel;
    return { imageData, currentViewPort, currentTool };
  },
)(VesselViewport);
