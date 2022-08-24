import React, { useEffect, useRef } from 'react';
import { connect } from 'umi';
import classnames from 'classnames';
import styles from './VesselViewport.less';
import {
  initPostPrcsViewport,
  updateActiveTool,
  updatePostPrcsViewport,
} from '@/utils/vesselManager';

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
  }, []);

  const imgPaneClicked = (event: any, id: string) => {
    event.preventDefault();
    dispatch({
      type: 'viewport3DModel/setViewPortActive',
      payload: { imgId: id, element: elementRef.current },
    });
  };

  useEffect(() => {
    if (base64Data) {
      updatePostPrcsViewport(elementRef.current, imgId, base64Data);
    }
  }, [base64Data]);

  useEffect(() => {
    updateActiveTool(elementRef.current, imgId, currentTool);
  }, [currentTool]);

  return (
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
      onWheel={() => {
        imgPaneClicked(event, imgId);
      }}
    />
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
