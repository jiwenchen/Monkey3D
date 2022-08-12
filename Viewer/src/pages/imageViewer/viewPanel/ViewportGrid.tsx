import React from 'react';
import { useEffect, useState } from 'react';
import GridLayout from './GridLayout';
import $ from 'jquery';
import { connect } from 'umi';
import { resizeAllImage } from '@/common/cornerstone/cornerstoneManager';
import { generateLayout } from '@/utils/generateLayout';

interface ViewportGridProps {
  layout: number[];
}

function ViewportGrid(props: ViewportGridProps) {
  const { layout } = props;
  const [rowHeight, setRowHeight] = useState<number>();
  const [layouts, setLayouts] = useState<any>();
  const [width, setWidth] = useState<any>();
  const [cols, setCols] = useState<any>();
  const [numRows, numColumns] = layout;

  useEffect(() => {
    //切换布局，重新设置行高, cols和layout
    setRowHeight(Math.floor($('.gridContainer').height() / numRows));
    setLayouts(generateLayout(numRows, numColumns));
    setCols(numColumns);
    setWidth($('.gridContainer').width() - 95);
  }, [numRows, numColumns]);

  useEffect(() => {
    window.addEventListener('resize', () => {
      setRowHeight(Math.floor($('.gridContainer').height() / numRows));
      setWidth($('.gridContainer').width());
      resizeAllImage();
    });
    return () => {
      window.removeEventListener('resize', () => {});
    };
  }, []);

  return (
    <div style={{ position: 'relative', height: 'calc(100vh - 2px)' }} className={'gridContainer'}>
      {rowHeight && <GridLayout layout={layouts} cols={cols} rowHeight={rowHeight} width={width} />}
    </div>
  );
}

export default connect(({ viewport3DModel }: { viewport3DModel: viewport3DStateType }) => {
  const { layout } = viewport3DModel;
  return { layout };
})(ViewportGrid);
