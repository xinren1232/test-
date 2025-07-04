<template>
  <div class="enhanced-chart-renderer">
    <!-- 图表容器 -->
    <div class="chart-container" v-if="chartData && chartData.length > 0">
      <div class="chart-header">
        <h3 class="chart-title">{{ title }}</h3>
        <div class="chart-controls">
          <el-button-group size="small">
            <el-button 
              v-for="type in availableChartTypes" 
              :key="type.value"
              :type="currentChartType === type.value ? 'primary' : 'default'"
              @click="switchChartType(type.value)"
              :icon="type.icon"
            >
              {{ type.label }}
            </el-button>
          </el-button-group>
        </div>
      </div>
      
      <!-- ECharts 图表 -->
      <div 
        ref="chartContainer" 
        class="chart-canvas"
        :style="{ height: chartHeight + 'px' }"
      ></div>
      
      <!-- 图表说明 -->
      <div class="chart-description" v-if="description">
        <el-text type="info" size="small">{{ description }}</el-text>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <el-empty description="暂无图表数据" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ElButton, ElButtonGroup, ElText, ElEmpty } from 'element-plus'
import {
  Histogram,
  PieChart,
  TrendCharts,
  DataAnalysis,
  DataBoard
} from '@element-plus/icons-vue'

const props = defineProps({
  chartData: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: '数据图表'
  },
  description: {
    type: String,
    default: ''
  },
  defaultChartType: {
    type: String,
    default: 'bar'
  },
  chartHeight: {
    type: Number,
    default: 400
  },
  theme: {
    type: String,
    default: 'light'
  }
})

const emit = defineEmits(['chart-ready', 'chart-click'])

// 响应式数据
const chartContainer = ref(null)
const chartInstance = ref(null)
const currentChartType = ref(props.defaultChartType)

// 可用的图表类型
const availableChartTypes = ref([
  { value: 'bar', label: '柱状图', icon: Histogram },
  { value: 'pie', label: '饼图', icon: PieChart },
  { value: 'line', label: '折线图', icon: TrendCharts },
  { value: 'gauge', label: '仪表盘', icon: DataBoard },
  { value: 'scatter', label: '散点图', icon: DataAnalysis }
])

// 图表配置生成器
const generateChartOption = (type, data) => {
  const baseOption = {
    backgroundColor: props.theme === 'dark' ? '#1a1a1a' : '#ffffff',
    textStyle: {
      color: props.theme === 'dark' ? '#ffffff' : '#333333'
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: props.theme === 'dark' ? '#333' : '#fff',
      borderColor: props.theme === 'dark' ? '#555' : '#ddd',
      textStyle: {
        color: props.theme === 'dark' ? '#fff' : '#333'
      }
    },
    legend: {
      top: '5%',
      textStyle: {
        color: props.theme === 'dark' ? '#ffffff' : '#333333'
      }
    }
  }

  switch (type) {
    case 'bar':
      return {
        ...baseOption,
        xAxis: {
          type: 'category',
          data: data.map(item => item.name || item.label),
          axisLabel: {
            color: props.theme === 'dark' ? '#ffffff' : '#333333'
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: props.theme === 'dark' ? '#ffffff' : '#333333'
          }
        },
        series: [{
          data: data.map(item => item.value || item.count),
          type: 'bar',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          }
        }]
      }

    case 'pie':
      return {
        ...baseOption,
        series: [{
          name: props.title,
          type: 'pie',
          radius: '50%',
          data: data.map(item => ({
            value: item.value || item.count,
            name: item.name || item.label
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      }

    case 'line':
      return {
        ...baseOption,
        xAxis: {
          type: 'category',
          data: data.map(item => item.name || item.label),
          axisLabel: {
            color: props.theme === 'dark' ? '#ffffff' : '#333333'
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: props.theme === 'dark' ? '#ffffff' : '#333333'
          }
        },
        series: [{
          data: data.map(item => item.value || item.count),
          type: 'line',
          smooth: true,
          itemStyle: {
            color: '#5470c6'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(84, 112, 198, 0.3)' },
              { offset: 1, color: 'rgba(84, 112, 198, 0.1)' }
            ])
          }
        }]
      }

    case 'gauge':
      const totalValue = data.reduce((sum, item) => sum + (item.value || item.count), 0)
      const maxValue = Math.max(...data.map(item => item.value || item.count))
      return {
        ...baseOption,
        series: [{
          name: props.title,
          type: 'gauge',
          progress: {
            show: true
          },
          detail: {
            valueAnimation: true,
            formatter: '{value}'
          },
          data: [{
            value: maxValue,
            name: '最大值'
          }]
        }]
      }

    case 'scatter':
      return {
        ...baseOption,
        xAxis: {
          type: 'value',
          axisLabel: {
            color: props.theme === 'dark' ? '#ffffff' : '#333333'
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: props.theme === 'dark' ? '#ffffff' : '#333333'
          }
        },
        series: [{
          symbolSize: 20,
          data: data.map((item, index) => [index, item.value || item.count]),
          type: 'scatter'
        }]
      }

    default:
      return baseOption
  }
}

// 初始化图表
const initChart = async () => {
  if (!chartContainer.value || !props.chartData.length) return

  await nextTick()
  
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }

  chartInstance.value = echarts.init(chartContainer.value, props.theme)
  
  const option = generateChartOption(currentChartType.value, props.chartData)
  chartInstance.value.setOption(option)

  // 绑定点击事件
  chartInstance.value.on('click', (params) => {
    emit('chart-click', params)
  })

  emit('chart-ready', chartInstance.value)
}

// 切换图表类型
const switchChartType = (type) => {
  currentChartType.value = type
  initChart()
}

// 响应式调整
const handleResize = () => {
  if (chartInstance.value) {
    chartInstance.value.resize()
  }
}

// 生命周期
onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }
  window.removeEventListener('resize', handleResize)
})

// 监听数据变化
watch(() => props.chartData, () => {
  initChart()
}, { deep: true })

watch(() => props.theme, () => {
  initChart()
})
</script>

<style scoped>
.enhanced-chart-renderer {
  width: 100%;
  background: var(--el-bg-color);
  border-radius: 8px;
  overflow: hidden;
}

.chart-container {
  padding: 16px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.chart-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.chart-controls {
  display: flex;
  gap: 8px;
}

.chart-canvas {
  width: 100%;
  min-height: 300px;
}

.chart-description {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.empty-state {
  padding: 40px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .chart-controls {
    width: 100%;
    justify-content: center;
  }
  
  .chart-canvas {
    height: 300px !important;
  }
}
</style>
