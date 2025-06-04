<template>
  <div class="chart-container">
    <v-chart class="chart" :option="chartOption" autoresize />
    <div class="chart-actions" v-if="showActions">
      <el-button size="small" @click="downloadChart" type="primary">
        <el-icon><el-icon-download /></el-icon> 导出
      </el-button>
      <el-button size="small" @click="$emit('insert-chart')" type="success">
        <el-icon><el-icon-picture /></el-icon> 插入对话
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed, toRaw } from 'vue';
import { ElMessage } from 'element-plus';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';

// 注册必要的组件
use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
]);

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: '缺陷率趋势'
  },
  xField: {
    type: String,
    default: 'date'
  },
  yField: {
    type: String,
    default: 'value'
  },
  seriesName: {
    type: String,
    default: '缺陷率'
  },
  showActions: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    default: '#ee6666'
  },
  smooth: {
    type: Boolean,
    default: true
  },
  showDataZoom: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['insert-chart']);

// 计算图表选项
const chartOption = computed(() => {
  // 没有数据时显示空数据
  if (!props.data || !props.data.length) {
    return {
      title: {
        text: props.title,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['暂无数据']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: props.seriesName,
          type: 'line',
          data: [0]
        }
      ]
    };
  }

  // 提取X轴和Y轴数据
  const xAxisData = props.data.map(item => item[props.xField]);
  const seriesData = props.data.map(item => item[props.yField]);

  // 构建图表配置
  const option = {
    title: {
      text: props.title,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        rotate: xAxisData.length > 6 ? 45 : 0
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}%'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: props.showDataZoom ? '15%' : '3%',
      containLabel: true
    },
    series: [
      {
        name: props.seriesName,
        type: 'line',
        data: seriesData,
        smooth: props.smooth,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: props.color
        },
        lineStyle: {
          color: props.color,
          width: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: props.color + '80' }, // 半透明颜色
              { offset: 1, color: props.color + '10' }  // 几乎透明
            ]
          }
        }
      }
    ]
  };

  // 根据需要添加数据缩放组件
  if (props.showDataZoom || xAxisData.length > 10) {
    option.dataZoom = [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        start: 0,
        end: 100
      }
    ];
  }

  return option;
});

// 下载图表为图片
const downloadChart = () => {
  try {
    // 获取图表实例
    const chart = toRaw(document.querySelector('.chart').__vue__.$refs.root.chart);
    
    // 获取图表的base64数据URL
    const dataURL = chart.getDataURL({
      type: 'png',
      backgroundColor: '#fff',
      pixelRatio: 2
    });
    
    // 创建下载链接
    const link = document.createElement('a');
    link.download = `${props.title}-${new Date().toISOString().split('T')[0]}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    ElMessage.success('图表已下载');
  } catch (error) {
    console.error('下载图表失败:', error);
    ElMessage.error('下载图表失败');
  }
};
</script>

<style scoped>
.chart-container {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.chart {
  height: 300px;
  width: 100%;
}

.chart-actions {
  display: flex;
  justify-content: center;
  margin-top: 8px;
  gap: 8px;
}
</style> 