import Icon from '@/components/Icon/Icon';
import { Popover } from 'antd';
import styles from '@/pages/imageViewer/components/ThicknessType.less';
import React, { useState } from 'react';
import { connect, useDispatch } from 'umi';
import { getAllMprData } from '@/utils/vesselManager';

const ThicknessType: React.FC<any> = ({ uid }) => {
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const listOrients = [0, 1, 2];
  const handChange = (newVisible: boolean) => {
    setVisible(newVisible);
  };
  const checkLocation = (res: any) => {
    setVisible(false);
    dispatch({
      type: 'image3DModel/updatemprType',
      payload: { mpr_type: res, uid },
      // @ts-ignore
    }).then((res: any) => {
      if (res === 'successful') {
        getAllMprData();
      }
    });
  };

  const revertnumberToName = (number: number) => {
    if (number === 0) {
      return '平均';
    } else if (number === 1) {
      return '最大';
    } else {
      return '最小';
    }
  };

  const content = () => {
    return (
      <div className={styles.directionlist}>
        {listOrients.map((res) => {
          return (
            <span
              key={res}
              onClick={() => {
                checkLocation(res);
              }}
              className={styles.them}
            >
              {revertnumberToName(res)}
            </span>
          );
        })}
      </div>
    );
  };
  return (
    <div>
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

export default connect(
  ({ image3DModel }: { image3DModel: image3DStateType; viewport3DModel: viewport3DStateType }) => {
    const { uid } = image3DModel;
    return { uid };
  },
)(ThicknessType);
