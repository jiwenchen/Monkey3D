import _ from 'lodash';
import { InputNumber } from 'antd';
import * as echarts from 'echarts';
import React, { useEffect, useRef, useState } from 'react';
import { HuePicker } from 'react-color';
import styles from './histogram.less';
type EChartsOption = echarts.EChartsOption;

interface HistogramProps {}

const Histogram: React.FC<HistogramProps> = (props) => {
  const chartDom = useRef(null);
  const symbolSize = 20;
  let data = [
    [0, 0.5],
    [30, 0.7],
    [50, 0.3],
    [70, 0.6],
    [100, 1],
  ];
  const color = ['black', 'yellow', 'blue', 'green', 'red'];
  const [hueColor, setHueColor] = useState({ background: '#fff' });

  const option: EChartsOption = {
    title: {
      text: 'Try Dragging these Points',
      left: 'center',
    },
    tooltip: {
      triggerOn: 'none',
      formatter: function (params: any) {
        return 'X: ' + params.data[0].toFixed(2) + '<br>Y: ' + params.data[1].toFixed(2);
      },
    },
    grid: {
      top: '8%',
      bottom: '12%',
    },
    xAxis: {
      min: 0,
      max: 100,
      type: 'value',
      axisLine: { onZero: false },
    },
    yAxis: {
      min: 0,
      max: 1,
      type: 'value',
      axisLine: { onZero: false },
    },
    // visualMap: {
    //   type: 'piecewise',
    //   dimension: 0,
    //   seriesIndex: 0,
    //   pieces: [
    //     {
    //       gte: 0,
    //       lte: 15,
    //       color: 'rgba(0, 0, 180)',
    //     },
    //     {
    //       gte: 15,
    //       lte: 30,
    //       color: 'rgba(255, 0, 0)',
    //     },
    //     {
    //       gte: 30,
    //       lte: 40,
    //       color: 'rgba(240, 230, 140)',
    //     },
    //     {
    //       gte: 40,
    //       lte: 70,
    //       color: 'rgba(160, 32, 240)',
    //     },
    //     {
    //       gte: 70,
    //       lte: 80,
    //       color: 'rgba(221, 160, 221)',
    //     },
    //     {
    //       gte: 80,
    //       lte: 100,
    //       color: 'rgba(124, 252, 0)',
    //     },
    //   ],
    // },
    series: [
      {
        id: 'a',
        type: 'line',
        smooth: false,
        symbolSize: symbolSize,
        data: data,
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(
            1,
            0,
            0,
            0,
            data.map((item: any, index) => {
              return {
                offset: item[0] / 100,
                color: color[index],
              };
            }),
          ),
        },
      },
    ],
  };

  useEffect(() => {
    if (chartDom.current) {
      const myChart = echarts.init(chartDom.current);
      setTimeout(function () {
        // Add shadow circles (which is not visible) to enable drag.
        myChart.setOption({
          graphic: data.map(function (item, dataIndex) {
            return {
              type: 'circle',
              position: myChart.convertToPixel('grid', item),
              shape: {
                cx: 0,
                cy: 0,
                r: symbolSize / 2,
              },
              invisible: true,
              draggable: true,
              bouding: 'raw',
              ondrag: function (dx: number, dy: number) {
                onPointDragging(dataIndex, [(this as any).x, (this as any).y]);
              },
              onmousemove: function () {
                showTooltip(dataIndex);
              },
              onmouseout: function () {
                hideTooltip(dataIndex);
              },
              z: 100,
            };
          }),
        });
      }, 0);

      const zr = myChart.getZr();
      zr.on('click', function (params: any) {
        const pointInPixel = [params.offsetX, params.offsetY];
        const pointInGrid = myChart.convertFromPixel('grid', pointInPixel);
        if (myChart.containPixel('grid', pointInPixel)) {
          data.push(pointInGrid);
          data = data.sort((a, b) => {
            return a[0] - b[0];
          });
          myChart.setOption({
            graphic: data.map(function (item, dataIndex) {
              return {
                type: 'circle',
                position: myChart.convertToPixel('grid', item),
                shape: {
                  cx: 0,
                  cy: 0,
                  r: symbolSize / 2,
                },
                invisible: true,
                draggable: true,
                bouding: 'raw',
                ondrag: function (dx: number, dy: number) {
                  onPointDragging(dataIndex, [(this as any).x, (this as any).y]);
                },
                onmousemove: function () {
                  showTooltip(dataIndex);
                },
                onmouseout: function () {
                  hideTooltip(dataIndex);
                },
                z: 100,
              };
            }),
            series: [
              {
                id: 'a',
                type: 'line',
                smooth: false,
                symbolSize: symbolSize,
                data: data,
              },
            ],
          });
        }
      });
      zr.on('mousemove', function (params: any) {
        const pointInPixel = [params.offsetX, params.offsetY];
        zr.setCursorStyle(myChart.containPixel('grid', pointInPixel) ? 'copy' : 'default');
      });

      window.addEventListener('resize', updatePosition);
      myChart.on('dataZoom', updatePosition);
      function updatePosition() {
        myChart.setOption({
          graphic: data.map(function (item, dataIndex) {
            return {
              position: myChart.convertToPixel('grid', item),
            };
          }),
        });
      }
      function showTooltip(dataIndex: number) {
        myChart.dispatchAction({
          type: 'showTip',
          seriesIndex: 0,
          dataIndex: dataIndex,
        });
      }
      function hideTooltip(dataIndex: number) {
        myChart.dispatchAction({
          type: 'hideTip',
        });
      }
      function onPointDragging(dataIndex: number, pos: number[]) {
        const revertData = myChart.convertFromPixel('grid', pos);
        if (revertData[0] >= data[dataIndex + 1]?.[0] || revertData[0] <= data[dataIndex - 1]?.[0])
          return;
        data[dataIndex] = revertData;
        // Update data
        myChart.setOption({
          series: [
            {
              id: 'a',
              type: 'line',
              smooth: false,
              symbolSize: symbolSize,
              data: data,
            },
          ],
        });
      }
      option && myChart.setOption(option);
    }
  }, [chartDom]);

  const handleChangeComplete = (color: any) => {
    console.log('color', color);
    setHueColor({ background: color.hex });
  };

  const onWWChange = (value: number) => {
    console.log('changed', value);
  };
  const onWCChange = (value: number) => {
    console.log('changed', value);
  };

  return (
    <>
      <div>
        <div ref={chartDom} className={styles.chartHistogram} />
        <div className={styles.picker}>
          <HuePicker width={755} color={hueColor} onChangeComplete={handleChangeComplete} />
        </div>
        <div className={styles.inputNum}>
          <span>
            WW:
            <InputNumber defaultValue={0} onChange={onWWChange} />
          </span>
          <span className={styles.wc}>
            WC:
            <InputNumber defaultValue={0} onChange={onWCChange} />
          </span>
        </div>
      </div>
    </>
  );
};
export default Histogram;
