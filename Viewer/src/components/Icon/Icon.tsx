import React from 'react';
import classNames from 'classnames';
import './Icon.less';
const prefixCls = 'radia-custom-icon';

/**
 * Icon使用说明:
 * 1. 当设计师将新的iconfont 上传至阿里的iconfont 之后，下载新的iconfont替换掉src/assets/ionfont文件
 * 2. Icon.less 中添加相对应的样式伪类和相对应的content码值
 * 3. 引入 Icon.tsx 文件，指定 <Icon type="样式类" />
 * 4. 示例:
 *      如：&&-add-case:before {
                content: "\e78a";
            }
        使用: <Icon type="add-case" />
 * 5. Icon 支持传入className 重新设置Icon的样式，color修改icon颜色
 *
 */

interface Iconprops {
  className?: any;
  type: string;
  onClick?: (arg: any) => void;
  color?: string;
  fontSize?: string;
  style?: any;
}
const Icon: React.FC<Iconprops> = (props) => {
  const { className, type, color, fontSize, style, ...others } = props;
  const cls = classNames({
    [prefixCls]: true,
    [`${prefixCls}-${type}`]: true,
    'neuro-icon': true,
    [className]: className,
  });
  const iconStyle = style ? style : { color: color, fontSize: fontSize };
  return (
    <>
      <i className={cls} style={iconStyle} {...others} />
    </>
  );
};

export default Icon;
