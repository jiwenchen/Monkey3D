import React, { useState } from 'react';
import styles from './Tool.less';
import type { Dispatch } from '@@/plugin-dva/connect';
import { connect } from 'umi';
import {
  cornerstoneTools3D,
  resetElement,
  resetVr,
} from '@/common/cornerstone/cornerstoneToolsManager';
import { Button, Modal } from 'antd';
import Upload from './upload';
import Histogram from '../components/histogram';

interface ImageViewerProps {
  dispatch: Dispatch;
  currentViewPort: any;
  uid: string;
}

const Tool: React.FC<ImageViewerProps> = (props) => {
  const { dispatch, currentViewPort, uid } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 页面关闭、刷新
  window.onbeforeunload = (e) => {
    dispatch({
      type: 'image3DModel/releaseServer',
      payload: { uid },
    });
  };

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

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const openEcharts = () => {
    setIsModalOpen(true);
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
        <Modal visible={isModalOpen} onOk={handleOk} onCancel={handleCancel} width={1000}>
          <Histogram />
        </Modal>
      </div>
    </>
  );
};

export default connect(
  ({
    viewport3DModel,
    image3DModel,
  }: {
    viewport3DModel: viewport3DStateType;
    image3DModel: image3DStateType;
  }) => {
    const { uid } = image3DModel;
    const { currentViewPort } = viewport3DModel;
    return { currentViewPort, uid };
  },
)(Tool);
