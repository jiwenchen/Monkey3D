import { Layout } from 'antd';
import React, { useEffect } from 'react';
import styles from './index.less';
import ViewportGrid from './viewPanel/ViewportGrid';
import type { Dispatch } from 'umi';
import Tool from './leftPanel/Tool';
import { useDispatch } from 'umi';
import { getAllMprData } from '@/utils/vesselManager';
const { Content, Sider } = Layout;

interface ImageViewerProps {
  dispatch: Dispatch;
  usToolsState: any;
}

const ImageViewer: React.FC<ImageViewerProps> = ({}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({
      type: 'image3DModel/getVolumetype',
      payload: { vol_type: 1 },
      // @ts-ignore
    }).then((res: string) => {
      if (res === 'successful') {
        dispatch({
          type: 'image3DModel/switchVrmip',
          payload: { vrmip: true },
        });
        getAllMprData(true);
      }
    });
  }, []);

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
