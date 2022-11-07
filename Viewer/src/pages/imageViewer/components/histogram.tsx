import _ from 'lodash';
import { InputNumber } from 'antd';
import * as echarts from 'echarts';
import React, { useEffect, useRef, useState } from 'react';
import { HuePicker } from 'react-color';
import styles from './histogram.less';
type EChartsOption = echarts.EChartsOption;

interface HistogramProps {}
let myChart: any;
const Histogram: React.FC<HistogramProps> = (props) => {
  const chartDom = useRef(null);
  const symbolSize = 20;
  const color = ['black', 'yellow', 'blue', 'green', 'red'];
  const data = [
    [0, 0.5],
    [30, 0.7],
    [50, 0.3],
    [70, 0.6],
    [100, 1],
  ];
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

  const graphic = (myChart: any) => {
    return data.map(function (item, dataIndex) {
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
    });
  };

  useEffect(() => {
    if (chartDom.current) {
      myChart = echarts.init(chartDom.current);
      window.addEventListener('resize', updatePosition);
      myChart.on('dataZoom', updatePosition);
      option && myChart.setOption(option);
      //设置拖拽
      setTimeout(() => {
        myChart.setOption({
          graphic: graphic(myChart),
        });
      }, 0);

      // 增加点
      const zr = myChart.getZr();
      zr.on('click', function (params: any) {
        const pointInPixel = [params.offsetX, params.offsetY];
        const pointInGrid = myChart.convertFromPixel('grid', pointInPixel);
        if (myChart.containPixel('grid', pointInPixel)) {
          data.push(pointInGrid);
          const sortData = data.sort((a, b) => {
            return a[0] - b[0];
          });
          myChart.setOption({
            graphic: graphic(myChart),
            series: [
              {
                id: 'a',
                type: 'line',
                smooth: false,
                symbolSize: symbolSize,
                data: sortData,
              },
            ],
          });
        }
      });
      zr.on('mousemove', function (params: any) {
        const pointInPixel = [params.offsetX, params.offsetY];
        zr.setCursorStyle(myChart.containPixel('grid', pointInPixel) ? 'copy' : 'default');
      });
    }
  }, [chartDom]);

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
