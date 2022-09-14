import React from 'react';
import { useState } from 'react';
import GridLayout from 'react-grid-layout';
import VesselViewport from '@/pages/imageViewer/viewPanel/VesselViewport';

const ReactGridLayout = GridLayout;

const GridLayouts: React.FC<any> = (props) => {
  const { cols, rowHeight, width, layout } = props;
  const imageID = ['vr', 0, 1, 2];

  const [layoutProps] = useState<any>({
    className: 'layout',
    onLayoutChange: function () {},
    isDraggable: false,
    isResizable: false,
    margin: [2, 2],
  });

  return (
    <>
      {width && (
        <ReactGridLayout
          cols={cols}
          layout={layout}
          rowHeight={rowHeight}
          width={width}
          {...layoutProps}
        >
          {layout.map((item: any, index: number) => {
            return (
              <div key={item.i}>
                <VesselViewport imgId={imageID[index] !== null ? imageID[index] : index} />
              </div>
            );
          })}
        </ReactGridLayout>
      )}
    </>
  );
};
export default GridLayouts;
