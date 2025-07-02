<template>
  <div class="business-chart-container">
    <!-- 图表头部 -->
    <div class="chart-header">
      <div class="chart-title">
        <span class="chart-icon">{{ chartIcon }}</span>
        <h3>{{ chartTitle }}</h3>
      </div>
      <div class="chart-actions">
        <el-button size="small" @click="refreshChart" :loading="loading">
          <el-icon><Refresh /></el-icon>
        </el-button>
        <el-button size="small" @click="downloadChart">
          <el-icon><Download /></el-icon>
        </el-button>
        <el-button size="small" @click="showSettings = true">
          <el-icon><Setting /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 图表内容 -->
    <div class="chart-content">
      <div v-if="loading" class="chart-loading">
        <el-skeleton :rows="6" animated />
      </div>
      
      <div v-else-if="error" class="chart-error">
        <el-alert
          :title="error"
          type="error"
          show-icon
          :closable="false"
        />
        <el-button @click="refreshChart" type="primary" style="margin-top: 16px;">
          重新加载
        </el-button>
      </div>

      <div v-else-if="chartData" class="chart-wrapper">
        <v-chart 
          class="chart" 
          :option="chartOption" 
          autoresize 
          @click="handleChartClick"
        />
      </div>

      <div v-else class="chart-empty">
        <el-empty description="暂无图表数据" />
      </div>
    </div>

    <!-- 图表设置对话框 -->
    <el-dialog
      v-model="showSettings"
      title="图表设置"
      width="500px"
      destroy-on-close
    >
      <el-form label-position="top">
        <el-form-item label="图表标题">
          <el-input v-model="settings.title" />
        </el-form-item>
        
        <el-form-item label="显示图例">
          <el-switch v-model="settings.showLegend" />
        </el-form-item>
        
        <el-form-item label="显示数据标签">
          <el-switch v-model="settings.showDataLabels" />
        </el-form-item>
        
        <el-form-item label="启用缩放">
          <el-switch v-model="settings.enableZoom" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showSettings = false">取消</el-button>
        <el-button type="primary" @click="applySettings">应用</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Download, Setting } from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import {
  LineChart,
  BarChart,
  PieChart,
  RadarChart,
  ScatterChart
} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  ToolboxComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

// 注册ECharts组件
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  RadarChart,
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  ToolboxComponent
])

// Props
const props = defineProps({
  chartType: {
    type: String,
    required: true
  },
  chartTitle: {
    type: String,
    default: '业务图表'
  },
  chartIcon: {
    type: String,
    default: '📊'
  },
  autoLoad: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['chart-click', 'chart-loaded', 'chart-error'])

// 响应式数据
const loading = ref(false)
const error = ref(null)
const chartData = ref(null)
const showSettings = ref(false)

// 图表设置
const settings = ref({
  title: props.chartTitle,
  showLegend: true,
  showDataLabels: false,
  enableZoom: false
})

// 计算图表配置
const chartOption = computed(() => {
  if (!chartData.value) return null

  const baseOption = {
    title: {
      text: settings.value.title,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: chartData.value.chartType === 'pie' ? 'item' : 'axis',
      confine: true
    },
    legend: {
      show: settings.value.showLegend,
      bottom: 10
    },
    toolbox: {
      show: true,
      feature: {
        saveAsImage: { show: true, title: '保存为图片' },
        dataZoom: settings.value.enableZoom ? { show: true, title: { zoom: '区域缩放', back: '区域缩放还原' } } : undefined,
        restore: { show: true, title: '还原' }
      }
    }
  }

  // 根据图表类型合并配置
  if (chartData.value.config) {
    Object.assign(baseOption, chartData.value.config)
  }

  // 处理不同图表类型的数据
  switch (chartData.value.chartType) {
    case 'pie':
      return {
        ...baseOption,
        series: chartData.value.data.series
      }
    
    case 'radar':
      return {
        ...baseOption,
        radar: {
          indicator: chartData.value.data.indicators
        },
        series: [{
          type: 'radar',
          data: chartData.value.data.series
        }]
      }
    
    default: // line, bar, scatter
      return {
        ...baseOption,
        xAxis: {
          type: 'category',
          data: chartData.value.data.categories,
          axisLabel: {
            rotate: chartData.value.data.categories?.length > 6 ? 45 : 0
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
        series: chartData.value.data.series.map(s => ({
          ...s,
          type: chartData.value.chartType,
          label: {
            show: settings.value.showDataLabels,
            position: 'top'
          }
        }))
      }
  }
})

// 加载图表数据
const loadChartData = async () => {
  loading.value = true
  error.value = null

  try {
    console.log(`📊 加载图表数据: ${props.chartType}`)
    
    const response = await fetch('/api/charts/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chartType: props.chartType
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    
    if (result.success) {
      chartData.value = result.data
      emit('chart-loaded', result.data)
      ElMessage.success(`${props.chartType}图表加载成功`)
    } else {
      throw new Error(result.error || '图表数据加载失败')
    }

  } catch (err) {
    console.error('图表加载失败:', err)
    error.value = err.message
    emit('chart-error', err)
    ElMessage.error(`图表加载失败: ${err.message}`)
  } finally {
    loading.value = false
  }
}

// 刷新图表
const refreshChart = () => {
  loadChartData()
}

// 下载图表
const downloadChart = () => {
  if (chartData.value) {
    // 这里可以实现图表下载逻辑
    ElMessage.info('图表下载功能开发中...')
  }
}

// 应用设置
const applySettings = () => {
  showSettings.value = false
  ElMessage.success('图表设置已应用')
}

// 处理图表点击事件
const handleChartClick = (params) => {
  console.log('图表点击事件:', params)
  emit('chart-click', params)
}

// 监听图表类型变化
watch(() => props.chartType, () => {
  if (props.autoLoad) {
    loadChartData()
  }
})

// 组件挂载时自动加载
onMounted(() => {
  if (props.autoLoad) {
    loadChartData()
  }
})

// 暴露方法给父组件
defineExpose({
  loadChartData,
  refreshChart
})
</script>

<style scoped>
.business-chart-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-icon {
  font-size: 20px;
}

.chart-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.chart-actions {
  display: flex;
  gap: 8px;
}

.chart-content {
  padding: 20px;
  min-height: 400px;
}

.chart-wrapper {
  width: 100%;
  height: 400px;
}

.chart {
  width: 100%;
  height: 100%;
}

.chart-loading,
.chart-error,
.chart-empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 360px;
}

.chart-error .el-alert {
  margin-bottom: 16px;
}
</style>
