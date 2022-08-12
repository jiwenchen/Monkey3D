import React, { useEffect, useRef } from 'react';
import { connect } from 'umi';
import classnames from 'classnames';
import { decodeMPR, decodeVR } from '@/utils/decodeImage';
import * as cornerstone from 'cornerstone-core';
import styles from './VesselViewport.less';
import { cornerstoneToolsInit } from '@/common/cornerstone/cornerstoneToolsManager';

const VesselViewport: React.FC<any> = (props) => {
  const { imgId, imageData, dispatch, currentViewPort } = props;
  const imageInfo = imageData[imgId];
  const canvasId = `vesselImage-${imgId}`;
  const elementRef = useRef<any | HTMLDivElement>(null);

  useEffect(() => {
    if (imgId === 'plane_type_vr') {
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
    const { base64Data } = imageInfo;
    if (base64Data) {
      cornerstone.enable(elementRef.current);
      const cornerstoneMetaData: any = imgId.includes('vr')
        ? decodeVR(base64Data, imgId)
        : decodeMPR(base64Data, imgId);
      cornerstone.displayImage(elementRef.current, cornerstoneMetaData);
      cornerstoneToolsInit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageInfo]);

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
    const { currentViewPort } = viewport3DModel;
    return { imageData, currentViewPort };
  },
)(VesselViewport);
