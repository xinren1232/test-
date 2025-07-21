<template>
  <div class="chart-renderer">
    <!-- 图表容器 -->
    <div 
      ref="chartContainer" 
      :style="{ width: chartWidth, height: chartHeight }"
      class="chart-container"
    ></div>
    
    <!-- 图表说明 -->
    <div v-if="chartDescription" class="chart-description">
      <el-icon><InfoFilled /></el-icon>
      <span>{{ chartDescription }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { InfoFilled } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  chartType: {
    type: String,
    required: true,
    validator: (value) => [
      'line', 'bar', 'pie', 'area', 'scatter', 'radar', 
      'box', 'column', 'forecast_line', 'forecast_area', 'dashboard'
    ].includes(value)
  },
  chartData: {
    type: Object,
    required: true
  },
  chartTitle: {
    type: String,
    default: ''
  },
  chartDescription: {
    type: String,
    default: ''
  },
  chartWidth: {
    type: String,
    default: '100%'
  },
  chartHeight: {
    type: String,
    default: '400px'
  },
  theme: {
    type: String,
    default: 'light'
  }
})

// Refs
const chartContainer = ref(null)
let chartInstance = null

// 图表配置生成器
const chartConfigGenerators = {
  // 折线图
  line: (data) => ({
    title: {
      text: props.chartTitle,
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: data.series?.map(s => s.name) || [],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.categories || [],
      axisLabel: { rotate: 45 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: '{value}' }
    },
    series: data.series?.map(s => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 2 }
    })) || []
  }),

  // 柱状图
  bar: (data) => ({
    title: {
      text: props.chartTitle,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: data.series?.map(s => s.name) || [],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.categories || []
    },
    yAxis: {
      type: 'value'
    },
    series: data.series?.map(s => ({
      name: s.name,
      type: 'bar',
      data: s.data,
      itemStyle: {
        borderRadius: [4, 4, 0, 0]
      }
    })) || []
  }),

  // 饼图
  pie: (data) => {
    // 默认颜色方案
    const defaultColors = [
      '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
      '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#ff9f7f'
    ];

    // 处理数据，确保有颜色
    const processedData = (data.data || []).map((item, index) => ({
      ...item,
      itemStyle: {
        color: item.color || defaultColors[index % defaultColors.length]
      }
    }));

    return {
      title: {
        text: props.chartTitle,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#333'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: 'transparent',
        textStyle: {
          color: '#fff'
        }
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'middle',
        itemGap: 12,
        textStyle: {
          fontSize: 12,
          color: '#666'
        }
      },
      series: [{
        name: data.name || '数据分布',
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['65%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n{c} ({d}%)',
          fontSize: 11,
          color: '#666'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          },
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 10,
          smooth: true
        },
        data: processedData
      }]
    };
  },

  // 面积图
  area: (data) => ({
    title: {
      text: props.chartTitle,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: data.series?.map(s => s.name) || [],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.categories || []
    },
    yAxis: {
      type: 'value'
    },
    series: data.series?.map(s => ({
      name: s.name,
      type: 'line',
      data: s.data,
      areaStyle: {
        opacity: 0.6
      },
      smooth: true
    })) || []
  }),

  // 雷达图
  radar: (data) => ({
    title: {
      text: props.chartTitle,
      left: 'center'
    },
    tooltip: {},
    legend: {
      data: data.series?.map(s => s.name) || [],
      top: 30
    },
    radar: {
      indicator: data.indicators || [],
      radius: '60%'
    },
    series: [{
      type: 'radar',
      data: data.series?.map(s => ({
        value: s.data,
        name: s.name,
        areaStyle: {
          opacity: 0.3
        }
      })) || []
    }]
  })
}

// 生成图表配置
const generateChartConfig = (type, data) => {
  const generator = chartConfigGenerators[type]
  if (!generator) {
    console.warn(`不支持的图表类型: ${type}`)
    return null
  }
  return generator(data)
}

// 初始化图表
const initChart = async () => {
  if (!chartContainer.value) return
  
  await nextTick()
  
  // 销毁现有实例
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  // 创建新实例
  chartInstance = echarts.init(chartContainer.value, props.theme)
  
  // 生成配置
  const config = generateChartConfig(props.chartType, props.chartData)
  if (config) {
    chartInstance.setOption(config)
  }
  
  // 响应式调整
  window.addEventListener('resize', handleResize)
}

// 处理窗口大小变化
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 监听数据变化
watch(() => [props.chartType, props.chartData], () => {
  initChart()
}, { deep: true })

// 生命周期
onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.chart-renderer {
  width: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chart-container {
  min-height: 300px;
}

.chart-description {
  padding: 12px 16px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.chart-description .el-icon {
  color: #409eff;
}
</style>
