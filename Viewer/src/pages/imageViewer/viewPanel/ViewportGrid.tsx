import React from 'react';
import { useEffect, useState } from 'react';
import GridLayout from './GridLayout';
import $ from 'jquery';
import { connect, Dispatch } from 'umi';
import { resizeAllImage } from '@/common/cornerstone/cornerstoneManager';
import { generateSpecialLayout } from '@/utils/generateLayout';

interface ViewportGridProps {
  layout: number[];
  dispatch: Dispatch;
}

function ViewportGrid(props: ViewportGridProps) {
  const { layout } = props;
  const [numRows, numColumns] = layout;
  const [rowHeight, setRowHeight] = useState<number>();
  const [layouts, setLayouts] = useState<any>();
  const [width, setWidth] = useState<any>();
  const [cols, setCols] = useState<any>();

  useEffect(() => {
    //切换布局，重新设置行高, cols和layout
    setRowHeight(Math.floor($('.gridContainer').height() / numRows) - 3);
    setLayouts(generateSpecialLayout(numRows, numColumns, 0, 2));
    setCols(numColumns);
    setWidth($('.gridContainer').width() - 95);
  }, [numRows, numColumns]);

  useEffect(() => {
    window.addEventListener('resize', () => {
      setRowHeight(Math.floor($('.gridContainer').height() / numRows) - 3);
      setWidth($('.gridContainer').width());
      resizeAllImage();
    });
    return () => {
      window.removeEventListener('resize', () => {});
    };
  }, []);

  return (
    <div
      style={{ position: 'relative', height: 'calc(100vh)', background: 'black' }}
      className={'gridContainer'}
    >
      {rowHeight && <GridLayout layout={layouts} cols={cols} rowHeight={rowHeight} width={width} />}
    </div>
  );
}

export default connect(({ viewport3DModel }: { viewport3DModel: viewport3DStateType }) => {
  const { layout } = viewport3DModel;
  return { layout };
})(ViewportGrid);
