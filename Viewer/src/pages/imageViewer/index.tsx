import { Layout } from 'antd';
import React from 'react';
import styles from './index.less';
import ViewportGrid from './viewPanel/ViewportGrid';
import type { Dispatch } from '@@/plugin-dva/connect';
import Tool from './leftPanel/Tool';
const { Content, Sider } = Layout;

interface ImageViewerProps {
  dispatch: Dispatch;
  usToolsState: any;
}

const ImageViewer: React.FC<ImageViewerProps> = (props) => {
  return (
    <Layout className={styles.content}>
      <Sider width="100" theme={'light'}>
        <Tool />
      </Sider>
      <Content>{<ViewportGrid />}</Content>
    </Layout>
  );
};

export default ImageViewer;
