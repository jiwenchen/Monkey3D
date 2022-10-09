import * as echarts from 'echarts';
import React, { useEffect, useRef } from 'react';
type EChartsOption = echarts.EChartsOption;

interface HistogramProps {}

const Histogram: React.FC<HistogramProps> = (props) => {
  const chartDom = useRef(null);
  const symbolSize = 20;
  const data = [
    [0, 0.5],
    [30, 0.7],
    [50, 0.3],
    [70, 0.6],
    [100, 1],
  ];
  const color = ['black', 'yellow', 'blue', 'green', 'red'];

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
    dataZoom: [
      {
        type: 'slider',
        xAxisIndex: 0,
        filterMode: 'none',
      },
      {
        type: 'slider',
        yAxisIndex: 0,
        filterMode: 'none',
      },
      {
        type: 'inside',
        xAxisIndex: 0,
        filterMode: 'none',
      },
      {
        type: 'inside',
        yAxisIndex: 0,
        filterMode: 'none',
      },
    ],
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
        data[dataIndex] = myChart.convertFromPixel('grid', pos);
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

  return <div ref={chartDom} style={{ height: '650px', width: '950px' }} />;
};
export default Histogram;
