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
      <el-button size="small" @click="showChartSettings = true" type="info">
        <el-icon><el-icon-setting /></el-icon> 设置
      </el-button>
    </div>

    <!-- 图表设置对话框 -->
    <el-dialog
      v-model="showChartSettings"
      title="图表设置"
      width="500px"
      destroy-on-close
    >
      <el-form label-position="top">
        <el-form-item label="图表类型">
          <el-select v-model="chartConfig.chartType" style="width: 100%">
            <el-option label="折线图" value="line" />
            <el-option label="柱状图" value="bar" />
            <el-option label="饼图" value="pie" />
            <el-option label="散点图" value="scatter" />
            <el-option label="热力图" value="heatmap" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="标题">
          <el-input v-model="chartConfig.title" />
        </el-form-item>
        
        <el-form-item label="显示图例" v-if="['line', 'bar', 'pie'].includes(chartConfig.chartType)">
          <el-switch v-model="chartConfig.showLegend" />
        </el-form-item>
        
        <el-form-item label="平滑曲线" v-if="chartConfig.chartType === 'line'">
          <el-switch v-model="chartConfig.smooth" />
        </el-form-item>
        
        <el-form-item label="显示面积" v-if="chartConfig.chartType === 'line'">
          <el-switch v-model="chartConfig.showArea" />
        </el-form-item>
        
        <el-form-item label="堆叠图表" v-if="chartConfig.chartType === 'bar'">
          <el-switch v-model="chartConfig.stack" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showChartSettings = false">取消</el-button>
        <el-button type="primary" @click="applyChartSettings">应用</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, toRaw, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import {
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  HeatmapChart
} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  VisualMapComponent
} from 'echarts/components';
import VChart from 'vue-echarts';

// 注册必要的组件
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  HeatmapChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  VisualMapComponent
]);

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: '数据图表'
  },
  chartType: {
    type: String,
    default: 'line',
    validator: (value) => ['line', 'bar', 'pie', 'scatter', 'heatmap'].includes(value)
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
    default: '数据'
  },
  showActions: {
    type: Boolean,
    default: true
  },
  colorPalette: {
    type: Array,
    default: () => [
      '#5470c6', '#91cc75', '#fac858', '#ee6666', 
      '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'
    ]
  }
});

const emit = defineEmits(['insert-chart', 'config-changed']);

// 图表配置
const chartConfig = reactive({
  chartType: props.chartType,
  title: props.title,
  showLegend: true,
  smooth: true,
  showArea: false,
  stack: false
});

const showChartSettings = ref(false);

// 应用图表设置
const applyChartSettings = () => {
  // 更新配置并通知父组件
  emit('config-changed', { ...chartConfig });
  showChartSettings.value = false;
};

// 监听属性变化，更新本地配置
watch(() => props.chartType, (newVal) => {
  chartConfig.chartType = newVal;
});

watch(() => props.title, (newVal) => {
  chartConfig.title = newVal;
});

// 计算图表选项
const chartOption = computed(() => {
  // 根据数据和配置生成图表选项
  if (!props.data || !props.data.length) {
    return {
      title: {
        text: chartConfig.title,
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          type: chartConfig.chartType,
          data: [{ name: '暂无数据', value: 100 }]
        }
      ]
    };
  }

  // 根据图表类型生成不同的配置
  switch (chartConfig.chartType) {
    case 'pie':
      return generatePieChartOption();
    case 'bar':
      return generateBarChartOption();
    case 'scatter':
      return generateScatterChartOption();
    case 'heatmap':
      return generateHeatmapChartOption();
    case 'line':
    default:
      return generateLineChartOption();
  }
});

// 生成饼图配置
const generatePieChartOption = () => {
  return {
    title: {
      text: chartConfig.title,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      show: chartConfig.showLegend,
      orient: 'horizontal',
      bottom: 10
    },
    color: props.colorPalette,
    series: [
      {
        name: props.seriesName,
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: props.data
      }
    ]
  };
};

// 生成柱状图配置
const generateBarChartOption = () => {
  // 提取X轴和Y轴数据
  const xAxisData = props.data.map(item => item[props.xField]);
  const seriesData = props.data.map(item => item[props.yField]);

  return {
    title: {
      text: chartConfig.title,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      show: chartConfig.showLegend,
      bottom: 10
    },
    color: props.colorPalette,
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        rotate: xAxisData.length > 6 ? 45 : 0
      }
    },
    yAxis: {
      type: 'value'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    series: [
      {
        name: props.seriesName,
        type: 'bar',
        data: seriesData,
        stack: chartConfig.stack ? 'total' : undefined,
        emphasis: {
          focus: 'series'
        }
      }
    ]
  };
};

// 生成折线图配置
const generateLineChartOption = () => {
  // 提取X轴和Y轴数据
  const xAxisData = props.data.map(item => item[props.xField]);
  const seriesData = props.data.map(item => item[props.yField]);

  return {
    title: {
      text: chartConfig.title,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      show: chartConfig.showLegend,
      bottom: 10
    },
    color: props.colorPalette,
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        rotate: xAxisData.length > 6 ? 45 : 0
      }
    },
    yAxis: {
      type: 'value'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    series: [
      {
        name: props.seriesName,
        type: 'line',
        data: seriesData,
        smooth: chartConfig.smooth,
        symbol: 'circle',
        symbolSize: 6,
        areaStyle: chartConfig.showArea ? {} : undefined
      }
    ]
  };
};

// 生成散点图配置
const generateScatterChartOption = () => {
  return {
    title: {
      text: chartConfig.title,
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    xAxis: {
      type: 'value',
      scale: true
    },
    yAxis: {
      type: 'value',
      scale: true
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    series: [
      {
        name: props.seriesName,
        type: 'scatter',
        data: props.data.map(item => [item[props.xField], item[props.yField]]),
        emphasis: {
          focus: 'series'
        }
      }
    ]
  };
};

// 生成热力图配置
const generateHeatmapChartOption = () => {
  // 热力图需要特殊的数据格式 [x, y, value]
  const heatmapData = props.data.map(item => [
    item.x || item[props.xField],
    item.y || item[props.yField],
    item.value || item[props.yField] || item.count || 0
  ]);
  
  return {
    title: {
      text: chartConfig.title,
      left: 'center'
    },
    tooltip: {
      position: 'top'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: Array.from(new Set(heatmapData.map(item => item[0]))).sort()
    },
    yAxis: {
      type: 'category',
      data: Array.from(new Set(heatmapData.map(item => item[1]))).sort()
    },
    visualMap: {
      min: 0,
      max: Math.max(...heatmapData.map(item => item[2])),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0
    },
    series: [
      {
        name: props.seriesName,
        type: 'heatmap',
        data: heatmapData,
        label: {
          show: true
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
};

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
    link.download = `${chartConfig.title}-${new Date().toISOString().split('T')[0]}.png`;
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