<template>
  <div class="chartjs-renderer">
    <div class="chart-header" v-if="title">
      <h4 class="chart-title">{{ title }}</h4>
      <div class="chart-controls">
        <el-button-group size="small">
          <el-button 
            v-for="type in availableTypes" 
            :key="type"
            :type="currentType === type ? 'primary' : 'default'"
            @click="changeChartType(type)"
          >
            {{ getTypeLabel(type) }}
          </el-button>
        </el-button-group>
      </div>
    </div>
    
    <div class="chart-container" :style="{ height: chartHeight + 'px' }">
      <canvas ref="chartCanvas"></canvas>
    </div>
    
    <div class="chart-footer" v-if="description">
      <p class="chart-description">{{ description }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ElButton, ElButtonGroup } from 'element-plus'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Props定义
const props = defineProps({
  chartData: {
    type: Object,
    required: true
  },
  title: {
    type: String,
    default: ''
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
  options: {
    type: Object,
    default: () => ({})
  }
})

// Emits定义
const emit = defineEmits(['chart-ready', 'chart-click', 'type-change'])

// 响应式数据
const chartCanvas = ref(null)
const chartInstance = ref(null)
const currentType = ref(props.defaultChartType)

// 可用的图表类型
const availableTypes = ['bar', 'line', 'pie', 'doughnut', 'radar']

// 获取类型标签
const getTypeLabel = (type) => {
  const labels = {
    bar: '柱状图',
    line: '折线图',
    pie: '饼图',
    doughnut: '环形图',
    radar: '雷达图'
  }
  return labels[type] || type
}

// 默认配置
const getDefaultOptions = (type) => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: !!props.title,
        text: props.title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const element = elements[0]
        const datasetIndex = element.datasetIndex
        const index = element.index
        const data = chartInstance.value.data.datasets[datasetIndex].data[index]
        const label = chartInstance.value.data.labels[index]
        
        emit('chart-click', {
          datasetIndex,
          index,
          data,
          label,
          event
        })
      }
    }
  }

  // 根据图表类型添加特定配置
  switch (type) {
    case 'bar':
      return {
        ...baseOptions,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    
    case 'line':
      return {
        ...baseOptions,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        elements: {
          line: {
            tension: 0.4
          },
          point: {
            radius: 4,
            hoverRadius: 6
          }
        }
      }
    
    case 'pie':
    case 'doughnut':
      return {
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          legend: {
            display: true,
            position: 'right'
          }
        }
      }
    
    case 'radar':
      return {
        ...baseOptions,
        scales: {
          r: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        }
      }
    
    default:
      return baseOptions
  }
}

// 转换数据格式
const transformDataForType = (data, type) => {
  if (!data || !data.labels || !data.datasets) {
    return {
      labels: [],
      datasets: []
    }
  }

  const transformedData = {
    labels: data.labels,
    datasets: data.datasets.map((dataset, index) => {
      const colors = [
        '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
        '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#2f54eb'
      ]
      
      const baseDataset = {
        ...dataset,
        backgroundColor: type === 'line' 
          ? `rgba(${hexToRgb(colors[index % colors.length])}, 0.1)`
          : colors.map((color, i) => `rgba(${hexToRgb(color)}, 0.8)`),
        borderColor: type === 'line' 
          ? colors[index % colors.length]
          : colors.map(color => color),
        borderWidth: type === 'line' ? 2 : 1
      }

      // 特殊处理不同图表类型
      switch (type) {
        case 'line':
          return {
            ...baseDataset,
            fill: false,
            tension: 0.4
          }
        
        case 'pie':
        case 'doughnut':
          return {
            ...baseDataset,
            backgroundColor: colors.slice(0, dataset.data.length).map(color => 
              `rgba(${hexToRgb(color)}, 0.8)`
            ),
            borderColor: colors.slice(0, dataset.data.length),
            borderWidth: 2
          }
        
        default:
          return baseDataset
      }
    })
  }

  return transformedData
}

// 颜色转换工具
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0'
}

// 创建图表
const createChart = async () => {
  if (!chartCanvas.value) return

  // 销毁现有图表
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }

  await nextTick()

  const ctx = chartCanvas.value.getContext('2d')
  const transformedData = transformDataForType(props.chartData, currentType.value)
  const options = {
    ...getDefaultOptions(currentType.value),
    ...props.options
  }

  chartInstance.value = new ChartJS(ctx, {
    type: currentType.value,
    data: transformedData,
    options
  })

  emit('chart-ready', chartInstance.value)
}

// 更改图表类型
const changeChartType = async (type) => {
  if (type === currentType.value) return
  
  currentType.value = type
  emit('type-change', type)
  await createChart()
}

// 更新图表数据
const updateChart = () => {
  if (!chartInstance.value) return

  const transformedData = transformDataForType(props.chartData, currentType.value)
  chartInstance.value.data = transformedData
  chartInstance.value.update('active')
}

// 监听数据变化
watch(() => props.chartData, updateChart, { deep: true })
watch(() => props.defaultChartType, (newType) => {
  if (newType !== currentType.value) {
    changeChartType(newType)
  }
})

// 生命周期
onMounted(() => {
  createChart()
})

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
})

// 暴露方法
defineExpose({
  chartInstance,
  updateChart,
  changeChartType
})
</script>

<style scoped>
.chartjs-renderer {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.chart-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.chart-controls {
  display: flex;
  gap: 8px;
}

.chart-container {
  position: relative;
  width: 100%;
}

.chart-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.chart-description {
  margin: 0;
  font-size: 14px;
  color: #8c8c8c;
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
  
  .chart-controls .el-button-group {
    width: 100%;
  }
  
  .chart-controls .el-button {
    flex: 1;
    font-size: 12px;
  }
}
</style>
