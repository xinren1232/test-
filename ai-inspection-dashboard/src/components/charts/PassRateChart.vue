<template>
  <div class="chart-container" ref="chartContainer"></div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册必须的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer
]);

const props = defineProps({
  chartData: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: '质量合格率趋势'
  },
  height: {
    type: String,
    default: '100%'
  }
});

const chartContainer = ref(null);
let chart = null;

// 初始化图表
const initChart = () => {
  if (!chartContainer.value) return;
  
  // 创建图表实例
  chart = echarts.init(chartContainer.value);
  
  // 更新图表
  updateChart();
  
  // 窗口大小改变时自动调整图表大小
  window.addEventListener('resize', handleResize);
};

// 更新图表数据和配置
const updateChart = () => {
  if (!chart) return;
  
  // 提取数据
  const timeData = props.chartData.map(item => item.time);
  const passRateData = props.chartData.map(item => item.passRate);
  
  // 设置图表配置项
  const option = {
    title: {
      text: props.title,
      left: 'center',
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const data = params[0];
        return `${data.name}<br>${data.seriesName}: ${data.value}%`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timeData,
      axisLabel: {
        rotate: 0
      }
    },
    yAxis: {
      type: 'value',
      name: '合格率(%)',
      min: (value) => {
        return Math.max(0, Math.floor(value.min) - 5);
      },
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '合格率',
        type: 'line',
        data: passRateData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: '#409EFF'
        },
        lineStyle: {
          width: 3
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.4)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        }
      }
    ]
  };
  
  // 应用配置项
  chart.setOption(option);
};

// 窗口大小改变处理
const handleResize = () => {
  if (chart) {
    chart.resize();
  }
};

// 监听数据变化
watch(() => props.chartData, () => {
  updateChart();
}, { deep: true });

// 组件挂载时初始化图表
onMounted(() => {
  initChart();
});

// 组件卸载前清理
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  if (chart) {
    chart.dispose();
    chart = null;
  }
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
}
</style> 