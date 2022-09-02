import Icon from '@/components/Icon/Icon';
import { Popover } from 'antd';
import styles from '@/pages/imageViewer/components/Operation3D.less';
import React, { useState } from 'react';
import classNames from 'classnames';
import { useDispatch } from 'umi';
import { revertDataName } from '@/utils/vesselManager';

const Operation3D: React.FC = () => {
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [renderType3D, setRenderType3D] = useState('VR');
  const listOrients = ['anterior', 'posterior', 'left', 'right', 'superior', 'inferior'];
  const VrMipArr = ['VR', 'MIP', 'SR'];

  const handChange = (newVisible: boolean) => {
    setVisible(newVisible);
  };
  const checkLocation = (res: any) => {
    setVisible(false);
    dispatch({
      type: 'image3DModel/orientation',
      payload: { dir: res },
    });
  };

  const change3Dtype = (res: any) => {
    setRenderType3D(res);
    dispatch({
      type: 'image3DModel/setRenderType',
      payload: { type: revertDataName(res) }, //0:vr,1:mip,2:surface
    });
  };
  const content = () => {
    return (
      <div className={styles.directionlist}>
        {listOrients.map((res) => {
          return (
            <span
              key={res}
              onClick={() => {
                checkLocation(res.substring(0, 1).toLocaleUpperCase());
              }}
              className={styles.them}
            >
              {res.substring(0, 1).toLocaleUpperCase()}
            </span>
          );
        })}
      </div>
    );
  };
  return (
    <div>
      <div className={styles.handle}>
        {VrMipArr.map((res) => {
          return (
            <span
              key={res}
              onClick={() => {
                change3Dtype(res);
              }}
              className={classNames(styles.handleSpan, {
                [styles.active]: renderType3D.includes(res),
              })}
            >
              {res}
            </span>
          );
        })}
      </div>
      <div className={styles.opactionBox}>
        <Popover
          placement="right"
          content={content}
          visible={visible}
          onVisibleChange={handChange}
          trigger="click"
        >
          <label className={styles.directionIcon}>
            <Icon type="orientation" fontSize={'24px'} />
          </label>
        </Popover>
      </div>
    </div>
  );
};

export default Operation3D;
