import { Layout } from 'antd';
import React, { useState } from 'react';
import styles from './index.less';
import ViewportGrid from './viewPanel/ViewportGrid';
const { Content, Sider } = Layout;
import { usToolsState, setActiveTool } from '@/common/cornerstone/cornerstoneToolsManager';
import classNames from 'classnames';

interface ImageViewerProps {}

const ImageViewer: React.FC<ImageViewerProps> = (props) => {
  const [tools, setTools] = useState(usToolsState);
  const clickHandler = (tool: string) => {
    const obj = { ...tools };
    for (const key in obj) {
      if (key === tool) {
        obj[key] = true;
      } else {
        obj[key] = false;
      }
    }
    setTools(obj);
    setActiveTool(tool);
  };

  return (
    <Layout className={styles.content}>
      <Sider width="100" theme={'light'}>
        {Object.keys(tools).map((tool) => (
          <div
            key={tool}
            className={classNames(styles.button, {
              [styles.active]: tools[tool],
            })}
            onClick={() => clickHandler(tool)}
          >
            {tool}
          </div>
        ))}
      </Sider>
      <Content>{<ViewportGrid />}</Content>
    </Layout>
  );
};

export default ImageViewer;
