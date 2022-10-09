import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { connect } from 'umi';
import classnames from 'classnames';
import styles from './VesselViewport.less';
import {
  changeAllSliceThickness,
  getAllMprData,
  initPostPrcsViewport,
  revertName,
  revertNumber,
  updateActiveTool,
  updatePostPrcsViewport,
} from '@/utils/vesselManager';
import Operation3D from '@/pages/imageViewer/components/Operation3D';
import mprOperateLine from '@/common/cornerstone/mprOperateLine';
import _ from 'lodash';
import ThicknessType from '../components/ThicknessType';
import Scrollbar from '../components/Scrollbar';

const VesselViewport: React.FC<any> = forwardRef((props, ref) => {
  const { imgId, imageData, mprInfo, dispatch, currentViewPort, currentTool, uid } = props;
  const base64Data = imageData[imgId];
  const currentPoint = mprInfo[imgId];
  const canvasId = `vesselImage-${imgId}`;
  const elementRef = useRef<any | HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    open() {
      console.log('子组建给父组件传值。。。。');
    },
  }));

  useEffect(() => {
    if (uid) {
      initPostPrcsViewport(elementRef.current, imgId);
      if (imgId === 'vr') {
        dispatch({
          type: 'viewport3DModel/setViewPortActive',
          payload: { element: elementRef.current },
        });
        const width = elementRef.current.clientWidth;
        const height = elementRef.current.clientHeight;
        dispatch({
          type: 'image3DModel/setVrSize',
          payload: { w: width, h: height, uid },
        });
        window.addEventListener('resize', resize);
      }
      elementRef.current?.removeEventListener(
        'CornerstoneToolsMprOperatePositionModified',
        manuallyModifyCoordinates,
      );
      elementRef.current?.addEventListener(
        'CornerstoneToolsMprOperatePositionModified',
        manuallyModifyCoordinates,
      );
    }
    return () => {
      window.removeEventListener('resize', () => {});
      elementRef.current?.removeEventListener(
        'CornerstoneToolsMprOperatePositionModified',
        manuallyModifyCoordinates,
      );
    };
  }, [uid]);

  const resize = _.debounce(() => {
    const width = elementRef.current.clientWidth;
    const height = elementRef.current.clientHeight;
    dispatch({
      type: 'image3DModel/setVrSize',
      payload: { w: width, h: height, uid },
    }).then((res: any) => {
      if (res === 'successful') {
        dispatch({
          type: 'image3DModel/getVrData',
          payload: { uid },
        });
      }
    });
  }, 200);

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
      if (imgId !== 'vr') {
        // 防止重复渲染十字线;
        if (mprOperateLine.mprOperateLines.length < length) {
          mprOperateLine.active(elementRef.current, revertName(imgId));
        }
        if (currentPoint.x && currentPoint.y) {
          mprOperateLine.setMprOperateLinePos(revertName(imgId), currentPoint);
        }
      }
    }
  }, [base64Data]);

  const manuallyModifyCoordinates = _.throttle((e: any) => {
    const { imagePoint, changeType, sliceType, lastAngle, thicknessData } = e.detail;
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
          uid,
        },
      });
      getAllMprData(sliceType);
    } else if (changeType.includes('Rotate')) {
      dispatch({
        type: 'image3DModel/rotatech',
        payload: {
          plane_type: imgId,
          angle: lastAngle,
          uid,
        },
      });
      getAllMprData(sliceType);
    } else if (changeType.includes('Slice')) {
      const lineType = thicknessData.line.type;
      changeAllSliceThickness(sliceType, lineType, thicknessData.data);
      dispatch({
        type: 'image3DModel/setThickness',
        payload: {
          plane_type: revertNumber(lineType),
          thickness: thicknessData.sliceNumber,
          uid,
        },
      });
      dispatch({
        type: 'image3DModel/getMprData',
        payload: { plane_type: revertNumber(lineType), uid },
      });
    }
  }, 200);

  useEffect(() => {
    if (currentTool) {
      updateActiveTool(elementRef.current, imgId, currentTool);
    }
  }, [currentTool]);

  return (
    <>
      <div
        id={canvasId}
        className={classnames('vessel-cornerstone-image', styles.box, {
          [styles.blue]: imgId === 0,
          [styles.pink]: imgId === 1,
          [styles.yellow]: imgId === 2,
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
      {imgId === 0 && <ThicknessType />}
      {mprInfo[imgId] && <Scrollbar planeType={imgId} />}
    </>
  );
});
export default connect(
  ({
    image3DModel,
    viewport3DModel,
  }: {
    image3DModel: image3DStateType;
    viewport3DModel: viewport3DStateType;
  }) => {
    const { imageData, mprInfo, uid } = image3DModel;
    const { currentViewPort, currentTool } = viewport3DModel;
    return { imageData, mprInfo, currentViewPort, currentTool, uid };
  },
  null,
  null,
  { forwardRef: true },
)(VesselViewport);
