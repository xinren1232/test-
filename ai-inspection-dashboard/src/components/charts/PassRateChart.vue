<template>
  <div class="chart-container" ref="chartContainer" :style="{ height: height }"></div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue';
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
    default: '300px'  // 设置默认高度，确保容器有高度
  }
});

const chartContainer = ref(null);
let chart = null;

// 初始化图表
const initChart = async () => {
  if (!chartContainer.value) return;
  
  // 确保DOM已渲染并有尺寸
  await nextTick();
  
  // 如果容器宽高为0，则设置默认尺寸
  const containerStyle = getComputedStyle(chartContainer.value);
  const containerWidth = parseInt(containerStyle.width);
  const containerHeight = parseInt(containerStyle.height);
  
  if (containerWidth === 0 || containerHeight === 0) {
    console.warn('图表容器尺寸为0，设置默认尺寸');
    if (containerWidth === 0) chartContainer.value.style.width = '100%';
    if (containerHeight === 0) chartContainer.value.style.height = props.height;
    // 再次等待DOM更新
    await nextTick();
  }
  
  try {
    // 创建图表实例，如果存在则销毁重建
    if (chart) {
      chart.dispose();
    }
    chart = echarts.init(chartContainer.value);
    
    // 更新图表
    updateChart();
    
    // 窗口大小改变时自动调整图表大小
    window.addEventListener('resize', handleResize);
  } catch (error) {
    console.error('图表初始化失败:', error);
  }
};

// 更新图表数据和配置
const updateChart = () => {
  if (!chart) return;
  
  try {
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
  } catch (error) {
    console.error('更新图表失败:', error);
  }
};

// 窗口大小改变处理
const handleResize = () => {
  if (chart) {
    try {
      chart.resize();
    } catch (error) {
      console.error('调整图表大小失败:', error);
    }
  }
};

// 监听数据变化
watch(() => props.chartData, () => {
  if (chart) {
    updateChart();
  } else {
    // 如果图表尚未初始化，则初始化
    initChart();
  }
}, { deep: true });

// 组件挂载时初始化图表
onMounted(() => {
  // 使用setTimeout允许DOM完全渲染
  setTimeout(() => {
    initChart();
  }, 100);
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
  min-height: 300px; /* 设置最小高度 */
}
</style> 