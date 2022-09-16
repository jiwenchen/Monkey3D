import React, { useRef } from 'react';
import $ from 'jquery';
import classnames from 'classnames';
import styles from './Scrollbar.less';
import { connect, Dispatch } from 'umi';
import _ from 'lodash';
import { scrollBarsetMprInfo } from '@/utils/vesselManager';
interface ScrollbarPropType {
  dispatch: Dispatch;
  mprInfo: any;
  uid: string;
  planeType: number;
}

const Scrollbar: React.FC<ScrollbarPropType> = ({ dispatch, mprInfo, uid, planeType }) => {
  const currentMprInfo = mprInfo[planeType];
  const imageIndex = currentMprInfo.index;
  const imageCount = currentMprInfo.total_num;
  const height = 100 / imageCount;
  const wrapper = useRef<any>(null);

  const gotoImge = (index: number) => {
    dispatch({
      type: 'image3DModel/setMprIndex',
      payload: { index: index, plane_type: planeType, uid },
      // @ts-ignore
    }).then((res: string) => {
      if (res === 'successful') {
        // 更新图片
        dispatch({
          type: 'image3DModel/getMprData',
          payload: { plane_type: planeType, uid },
        }).then((res: boolean) => {
          //更新其他图片中心坐标
          if (res) scrollBarsetMprInfo(planeType);
        });
      }
    });
  };

  const handleDrag = (e: any) => {
    e.preventDefault();
    const wrapperTop: any = $(wrapper.current).offset()?.top;
    let index: any;
    document.onmousemove = _.throttle((evt: any) => {
      const y = (evt.clientY - wrapperTop) / wrapper.current.offsetHeight;
      index = Math.round(imageCount * y);
      if (index < 0) {
        index = 0;
      } else if (index > imageCount - 1) {
        index = imageCount - 1;
      }
      gotoImge(index);
    }, 150);
    document.onmouseup = () => {
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };

  const getLeft = function (index: number) {
    return height * (index + 0.5) + '%';
  };

  return (
    <>
      {imageCount && imageIndex && (
        <div className={styles.wrapper} ref={wrapper}>
          {_.range(imageCount).map((i: number) => (
            <div
              className={styles.react}
              style={{ height: height + '%' }}
              key={i}
              onClick={() => gotoImge(i)}
            />
          ))}
          <div
            className={classnames(styles.current)}
            style={{ top: getLeft(imageIndex) }}
            onMouseDown={handleDrag}
          />
        </div>
      )}
    </>
  );
};

export default connect(({ image3DModel }: { image3DModel: image3DStateType }) => {
  const { mprInfo, uid } = image3DModel;
  return { mprInfo, uid };
})(Scrollbar);
