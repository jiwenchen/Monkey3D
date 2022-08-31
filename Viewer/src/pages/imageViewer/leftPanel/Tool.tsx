import React from 'react';
import styles from './Tool.less';
import type { Dispatch } from '@@/plugin-dva/connect';
import { connect } from 'umi';
import {
  cornerstoneTools3D,
  resetElement,
  resetVr,
} from '@/common/cornerstone/cornerstoneToolsManager';
import { Button } from 'antd';
import Upload from './upload';

interface ImageViewerProps {
  dispatch: Dispatch;
  currentViewPort: any;
}

const Tool: React.FC<ImageViewerProps> = (props) => {
  const { dispatch, currentViewPort } = props;
  const clickHandler = (tool: string) => {
    dispatch({
      type: 'viewport3DModel/setCurrentTool',
      payload: tool,
    });
  };

  const handelReset = () => {
    if (currentViewPort?.imgId === 'vr') {
      resetVr();
      resetElement(currentViewPort.element);
    } else {
      resetElement(currentViewPort.element);
    }
  };

  const openEcharts = () => {
    return <></>;
  };

  return (
    <>
      <Upload />
      <div className={styles.button}>
        {cornerstoneTools3D[currentViewPort?.imgId === 'vr' ? 'vr' : 'mpr']?.map((tool: string) => (
          <Button key={tool} onClick={() => clickHandler(tool)}>
            {tool}
          </Button>
        ))}
        <Button onClick={() => handelReset()}>reset</Button>
        <Button onClick={() => openEcharts()}>echarts</Button>
      </div>
    </>
  );
};

export default connect(({ viewport3DModel }: { viewport3DModel: viewport3DStateType }) => {
  const { currentViewPort } = viewport3DModel;
  return { currentViewPort };
})(Tool);
