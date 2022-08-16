import React from 'react';
import styles from './Tool.less';
import type { Dispatch } from '@@/plugin-dva/connect';
import classNames from 'classnames';
import { connect } from 'umi';
import { resetElement } from '@/common/cornerstone/cornerstoneToolsManager';
import { Button } from 'antd';
import Upload from './upload';

interface ImageViewerProps {
  dispatch: Dispatch;
  usToolsState: any;
  currentViewPort: any;
}

const Tool: React.FC<ImageViewerProps> = (props) => {
  const { dispatch, usToolsState, currentViewPort } = props;
  const clickHandler = (tool: string) => {
    dispatch({
      type: 'viewport3DModel/setUsToolsState',
      payload: tool,
    });
  };

  const handelReset = () => {
    resetElement(currentViewPort.element);
  };

  return (
    <>
      <Upload />
      {Object.keys(usToolsState).map((tool) => (
        <div
          key={tool}
          className={classNames(styles.button, {
            [styles.active]: usToolsState[tool],
          })}
          onClick={() => clickHandler(tool)}
        >
          {tool}
        </div>
      ))}
      <div className={styles.button} onClick={() => handelReset()}>
        <Button>reset</Button>
      </div>
    </>
  );
};

export default connect(({ viewport3DModel }: { viewport3DModel: viewport3DStateType }) => {
  const { usToolsState, currentViewPort } = viewport3DModel;
  return { usToolsState, currentViewPort };
})(Tool);
