<template>
  <div class="plotly-renderer">
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
    
    <div 
      ref="plotlyContainer" 
      class="plotly-container" 
      :style="{ height: chartHeight + 'px' }"
    ></div>
    
    <div class="chart-footer" v-if="description">
      <p class="chart-description">{{ description }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ElButton, ElButtonGroup } from 'element-plus'
import Plotly from 'plotly.js-dist-min'

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
const plotlyContainer = ref(null)
const currentType = ref(props.defaultChartType)
const plotlyInstance = ref(null)

// 可用的图表类型
const availableTypes = ['bar', 'line', 'scatter', 'pie', 'heatmap', 'surface', 'box']

// 获取类型标签
const getTypeLabel = (type) => {
  const labels = {
    bar: '柱状图',
    line: '折线图',
    scatter: '散点图',
    pie: '饼图',
    heatmap: '热力图',
    surface: '3D曲面',
    box: '箱线图'
  }
  return labels[type] || type
}

// 颜色配置
const colors = [
  '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
  '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#2f54eb'
]

// 转换数据为Plotly格式
const transformDataForPlotly = (data, type) => {
  if (!data || !data.labels || !data.datasets) {
    return []
  }

  const { labels, datasets } = data

  switch (type) {
    case 'bar':
      return datasets.map((dataset, index) => ({
        x: labels,
        y: dataset.data,
        type: 'bar',
        name: dataset.label || `数据集 ${index + 1}`,
        marker: {
          color: colors[index % colors.length]
        }
      }))

    case 'line':
      return datasets.map((dataset, index) => ({
        x: labels,
        y: dataset.data,
        type: 'scatter',
        mode: 'lines+markers',
        name: dataset.label || `数据集 ${index + 1}`,
        line: {
          color: colors[index % colors.length],
          width: 2
        },
        marker: {
          color: colors[index % colors.length],
          size: 6
        }
      }))

    case 'scatter':
      return datasets.map((dataset, index) => ({
        x: dataset.data.map((_, i) => i),
        y: dataset.data,
        type: 'scatter',
        mode: 'markers',
        name: dataset.label || `数据集 ${index + 1}`,
        marker: {
          color: colors[index % colors.length],
          size: 8
        }
      }))

    case 'pie':
      // 饼图只使用第一个数据集
      const firstDataset = datasets[0]
      return [{
        labels: labels,
        values: firstDataset.data,
        type: 'pie',
        marker: {
          colors: colors.slice(0, labels.length)
        },
        textinfo: 'label+percent',
        textposition: 'outside'
      }]

    case 'heatmap':
      // 热力图需要二维数据
      const heatmapData = datasets[0].data
      const size = Math.ceil(Math.sqrt(heatmapData.length))
      const matrix = []
      
      for (let i = 0; i < size; i++) {
        matrix[i] = []
        for (let j = 0; j < size; j++) {
          const index = i * size + j
          matrix[i][j] = index < heatmapData.length ? heatmapData[index] : 0
        }
      }

      return [{
        z: matrix,
        type: 'heatmap',
        colorscale: 'Viridis',
        showscale: true
      }]

    case 'surface':
      // 3D曲面图需要二维数据
      const surfaceData = datasets[0].data
      const surfaceSize = Math.ceil(Math.sqrt(surfaceData.length))
      const surfaceMatrix = []
      
      for (let i = 0; i < surfaceSize; i++) {
        surfaceMatrix[i] = []
        for (let j = 0; j < surfaceSize; j++) {
          const index = i * surfaceSize + j
          surfaceMatrix[i][j] = index < surfaceData.length ? surfaceData[index] : 0
        }
      }

      return [{
        z: surfaceMatrix,
        type: 'surface',
        colorscale: 'Viridis',
        showscale: true
      }]

    case 'box':
      return datasets.map((dataset, index) => ({
        y: dataset.data,
        type: 'box',
        name: dataset.label || `数据集 ${index + 1}`,
        marker: {
          color: colors[index % colors.length]
        }
      }))

    default:
      return transformDataForPlotly(data, 'bar')
  }
}

// 获取布局配置
const getLayoutConfig = (type) => {
  const baseLayout = {
    title: {
      text: props.title,
      font: {
        size: 16,
        color: '#262626'
      }
    },
    font: {
      family: 'Arial, sans-serif',
      size: 12,
      color: '#595959'
    },
    paper_bgcolor: 'white',
    plot_bgcolor: 'white',
    margin: {
      l: 50,
      r: 30,
      t: props.title ? 50 : 20,
      b: 40
    }
  }

  switch (type) {
    case 'bar':
    case 'line':
    case 'scatter':
      return {
        ...baseLayout,
        xaxis: {
          title: 'X轴',
          gridcolor: 'rgba(0,0,0,0.1)',
          zerolinecolor: 'rgba(0,0,0,0.2)'
        },
        yaxis: {
          title: 'Y轴',
          gridcolor: 'rgba(0,0,0,0.1)',
          zerolinecolor: 'rgba(0,0,0,0.2)'
        }
      }

    case 'pie':
      return {
        ...baseLayout,
        showlegend: true,
        legend: {
          orientation: 'v',
          x: 1.02,
          y: 0.5
        }
      }

    case 'heatmap':
      return {
        ...baseLayout,
        xaxis: {
          title: 'X轴'
        },
        yaxis: {
          title: 'Y轴'
        }
      }

    case 'surface':
      return {
        ...baseLayout,
        scene: {
          xaxis: { title: 'X轴' },
          yaxis: { title: 'Y轴' },
          zaxis: { title: 'Z轴' }
        }
      }

    case 'box':
      return {
        ...baseLayout,
        yaxis: {
          title: '数值',
          gridcolor: 'rgba(0,0,0,0.1)',
          zerolinecolor: 'rgba(0,0,0,0.2)'
        }
      }

    default:
      return baseLayout
  }
}

// 获取配置选项
const getPlotlyConfig = () => {
  return {
    displayModeBar: true,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
    displaylogo: false,
    responsive: true,
    ...props.options
  }
}

// 创建图表
const createChart = async () => {
  if (!plotlyContainer.value || !props.chartData) return

  await nextTick()

  const traces = transformDataForPlotly(props.chartData, currentType.value)
  const layout = getLayoutConfig(currentType.value)
  const config = getPlotlyConfig()

  try {
    plotlyInstance.value = await Plotly.newPlot(
      plotlyContainer.value,
      traces,
      layout,
      config
    )

    // 添加点击事件监听
    plotlyContainer.value.on('plotly_click', (data) => {
      const point = data.points[0]
      emit('chart-click', {
        data: point.y || point.value,
        index: point.pointIndex,
        label: point.x || point.label,
        trace: point.curveNumber
      })
    })

    emit('chart-ready', plotlyInstance.value)
  } catch (error) {
    console.error('创建Plotly图表失败:', error)
  }
}

// 更改图表类型
const changeChartType = async (type) => {
  if (type === currentType.value) return
  
  currentType.value = type
  emit('type-change', type)
  await createChart()
}

// 更新图表
const updateChart = async () => {
  if (!plotlyInstance.value || !plotlyContainer.value) return

  const traces = transformDataForPlotly(props.chartData, currentType.value)
  const layout = getLayoutConfig(currentType.value)

  try {
    await Plotly.react(plotlyContainer.value, traces, layout)
  } catch (error) {
    console.error('更新Plotly图表失败:', error)
    // 如果更新失败，重新创建图表
    await createChart()
  }
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
  if (plotlyContainer.value && plotlyInstance.value) {
    Plotly.purge(plotlyContainer.value)
  }
})

// 暴露方法
defineExpose({
  plotlyInstance,
  updateChart,
  changeChartType
})
</script>

<style scoped>
.plotly-renderer {
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

.plotly-container {
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

/* Plotly特定样式覆盖 */
:deep(.plotly .modebar) {
  background: transparent !important;
}

:deep(.plotly .modebar-btn) {
  color: #595959 !important;
}

:deep(.plotly .modebar-btn:hover) {
  background: rgba(0, 0, 0, 0.1) !important;
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
