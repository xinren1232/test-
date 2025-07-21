<template>
  <div class="chart-tool-panel">
    <!-- 图表工具头部 -->
    <div class="panel-header">
      <span class="panel-icon">📊</span>
      <h3 class="panel-title">图表工具</h3>
      <div class="panel-actions">
        <el-button size="small" @click="refreshChartData">
          <el-icon><Refresh /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 图表分类 -->
    <div class="chart-categories">
      <!-- 数据可视化 -->
      <div class="chart-category">
        <div class="category-header" @click="toggleCategory('visualization')">
          <span class="category-icon">📈</span>
          <span class="category-title">数据可视化</span>
          <span class="expand-icon" :class="{ expanded: expandedCategories.visualization }">▼</span>
        </div>
        <div v-show="expandedCategories.visualization" class="category-content">
          <div class="chart-grid">
            <div 
              v-for="chart in visualizationCharts" 
              :key="chart.id"
              class="chart-item"
              @click="generateChart(chart)"
              :title="chart.description"
            >
              <div class="chart-icon">{{ chart.icon }}</div>
              <div class="chart-name">{{ chart.name }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 质量分析 -->
      <div class="chart-category">
        <div class="category-header" @click="toggleCategory('quality')">
          <span class="category-icon">🧪</span>
          <span class="category-title">质量分析</span>
          <span class="expand-icon" :class="{ expanded: expandedCategories.quality }">▼</span>
        </div>
        <div v-show="expandedCategories.quality" class="category-content">
          <div class="chart-grid">
            <div 
              v-for="chart in qualityCharts" 
              :key="chart.id"
              class="chart-item"
              @click="generateChart(chart)"
              :title="chart.description"
            >
              <div class="chart-icon">{{ chart.icon }}</div>
              <div class="chart-name">{{ chart.name }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 供应商分析 -->
      <div class="chart-category">
        <div class="category-header" @click="toggleCategory('supplier')">
          <span class="category-icon">🏭</span>
          <span class="category-title">供应商分析</span>
          <span class="expand-icon" :class="{ expanded: expandedCategories.supplier }">▼</span>
        </div>
        <div v-show="expandedCategories.supplier" class="category-content">
          <div class="chart-grid">
            <div 
              v-for="chart in supplierCharts" 
              :key="chart.id"
              class="chart-item"
              @click="generateChart(chart)"
              :title="chart.description"
            >
              <div class="chart-icon">{{ chart.icon }}</div>
              <div class="chart-name">{{ chart.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表预览区域 -->
    <div v-if="currentChart" class="chart-preview">
      <div class="preview-header">
        <h4>{{ currentChart.name }}</h4>
        <div class="preview-actions">
          <el-button size="small" @click="exportChart">导出</el-button>
          <el-button size="small" @click="fullscreenChart">全屏</el-button>
          <el-button size="small" @click="closePreview">关闭</el-button>
        </div>
      </div>
      <div class="preview-content">
        <div ref="chartContainer" class="chart-container" :style="{ height: chartHeight + 'px' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import RealTimeChartService from '../services/RealTimeChartService.js'

// 响应式数据
const expandedCategories = ref({
  visualization: true,
  quality: false,
  supplier: false
})

const currentChart = ref(null)
const chartContainer = ref(null)
const chartInstance = ref(null)
const chartHeight = ref(300)

// 图表配置
const visualizationCharts = ref([
  {
    id: 'inventory-distribution',
    name: '库存分布',
    icon: '🥧',
    type: 'pie',
    description: '显示各类物料的库存分布情况',
    dataSource: 'inventory'
  },
  {
    id: 'trend-analysis',
    name: '趋势分析',
    icon: '📈',
    type: 'line',
    description: '显示质量指标的时间趋势',
    dataSource: 'quality_trend'
  },
  {
    id: 'risk-heatmap',
    name: '风险热力图',
    icon: '🔥',
    type: 'heatmap',
    description: '显示各区域的风险分布热力图',
    dataSource: 'risk_data'
  },
  {
    id: 'defect-pareto',
    name: '不良帕累托',
    icon: '📊',
    type: 'bar',
    description: '不良类型的帕累托分析图',
    dataSource: 'defect_data'
  }
])

const qualityCharts = ref([
  {
    id: 'quality-control',
    name: '质量控制图',
    icon: '📉',
    type: 'line',
    description: '质量控制过程图表',
    dataSource: 'quality_control'
  },
  {
    id: 'pass-rate',
    name: '合格率统计',
    icon: '✅',
    type: 'bar',
    description: '各产品线合格率统计',
    dataSource: 'pass_rate'
  },
  {
    id: 'defect-distribution',
    name: '不良分布',
    icon: '❌',
    type: 'pie',
    description: '不良类型分布饼图',
    dataSource: 'defect_distribution'
  }
])

const supplierCharts = ref([
  {
    id: 'supplier-radar',
    name: '供应商雷达',
    icon: '🎯',
    type: 'radar',
    description: '供应商综合评价雷达图',
    dataSource: 'supplier_evaluation'
  },
  {
    id: 'supplier-ranking',
    name: '供应商排名',
    icon: '🏆',
    type: 'bar',
    description: '供应商质量排名柱状图',
    dataSource: 'supplier_ranking'
  }
])

// 方法
const toggleCategory = (category) => {
  expandedCategories.value[category] = !expandedCategories.value[category]
}

const generateChart = async (chartConfig) => {
  try {
    currentChart.value = chartConfig
    await nextTick()
    
    if (chartContainer.value) {
      // 销毁现有图表实例
      if (chartInstance.value) {
        chartInstance.value.dispose()
      }
      
      // 创建新的图表实例
      chartInstance.value = echarts.init(chartContainer.value)
      
      // 获取数据并渲染图表
      const data = await fetchChartData(chartConfig.dataSource)
      const options = generateChartOptions(chartConfig, data)
      
      chartInstance.value.setOption(options)
      
      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        if (chartInstance.value) {
          chartInstance.value.resize()
        }
      })
      
      ElMessage.success(`${chartConfig.name} 生成成功`)
    }
  } catch (error) {
    console.error('生成图表失败:', error)
    ElMessage.error('生成图表失败')
  }
}

const fetchChartData = async (dataSource) => {
  try {
    switch (dataSource) {
      case 'inventory':
        return await RealTimeChartService.getInventoryDistribution()
      case 'quality_trend':
        return await RealTimeChartService.getQualityTrend()
      case 'defect_data':
        return await RealTimeChartService.getDefectDistribution()
      case 'risk_data':
        return await RealTimeChartService.getRiskDistribution()
      case 'quality_control':
        return await RealTimeChartService.getQualityTrend()
      case 'pass_rate':
        return await RealTimeChartService.getPassRateStats()
      case 'defect_distribution':
        return await RealTimeChartService.getDefectDistribution()
      case 'supplier_evaluation':
        return await RealTimeChartService.getSupplierEvaluation()
      case 'supplier_ranking':
        const supplierData = await RealTimeChartService.getSupplierEvaluation()
        // 转换为排名数据
        return {
          xAxis: supplierData.series.map(item => item.name),
          series: supplierData.series.map(item =>
            item.value.reduce((sum, val) => sum + val, 0) / item.value.length
          )
        }
      default:
        return []
    }
  } catch (error) {
    console.error('获取图表数据失败:', error)
    return []
  }
}

const generateChartOptions = (chartConfig, data) => {
  const baseOptions = {
    title: {
      text: chartConfig.name,
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      textStyle: {
        color: '#fff'
      }
    },
    legend: {
      bottom: 10,
      textStyle: {
        fontSize: 12
      }
    }
  }

  switch (chartConfig.type) {
    case 'pie':
      return {
        ...baseOptions,
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          data: Array.isArray(data) ? data : [],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            formatter: '{b}: {c} ({d}%)'
          }
        }]
      }

    case 'line':
      const lineData = data.xAxis ? data : { xAxis: data.map(item => item.date || item.name), series: data.map(item => item.value) }
      return {
        ...baseOptions,
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: lineData.xAxis,
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value}%'
          }
        },
        series: [{
          type: 'line',
          data: lineData.series,
          smooth: true,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(24, 144, 255, 0.6)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
            ])
          },
          lineStyle: {
            width: 3
          },
          symbol: 'circle',
          symbolSize: 6
        }]
      }

    case 'bar':
      const barData = data.xAxis ? data : { xAxis: data.map(item => item.type || item.name), series: data.map(item => item.count || item.value) }
      return {
        ...baseOptions,
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: barData.xAxis,
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          type: 'bar',
          data: barData.series,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#409EFF' },
                { offset: 1, color: '#1890ff' }
              ])
            }
          }
        }]
      }

    case 'radar':
      return {
        ...baseOptions,
        radar: {
          indicator: data.indicator || [],
          radius: '70%'
        },
        series: [{
          type: 'radar',
          data: data.series || [],
          areaStyle: {
            opacity: 0.3
          }
        }]
      }

    case 'heatmap':
      return {
        ...baseOptions,
        tooltip: {
          position: 'top'
        },
        grid: {
          height: '50%',
          top: '10%'
        },
        xAxis: {
          type: 'category',
          data: data.xAxis || [],
          splitArea: {
            show: true
          }
        },
        yAxis: {
          type: 'category',
          data: data.yAxis || [],
          splitArea: {
            show: true
          }
        },
        visualMap: {
          min: 0,
          max: 100,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '15%'
        },
        series: [{
          type: 'heatmap',
          data: data.series || [],
          label: {
            show: true
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      }

    default:
      return baseOptions
  }
}

const refreshChartData = () => {
  if (currentChart.value) {
    generateChart(currentChart.value)
  }
}

const exportChart = () => {
  if (chartInstance.value) {
    const url = chartInstance.value.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff'
    })
    
    const link = document.createElement('a')
    link.download = `${currentChart.value.name}.png`
    link.href = url
    link.click()
    
    ElMessage.success('图表导出成功')
  }
}

const fullscreenChart = () => {
  // 实现全屏显示逻辑
  ElMessage.info('全屏功能开发中...')
}

const closePreview = () => {
  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }
  currentChart.value = null
}

onMounted(() => {
  console.log('图表工具面板初始化完成')
})
</script>

<style scoped>
.chart-tool-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e1e5e9;
}

.panel-icon {
  font-size: 16px;
  margin-right: 8px;
}

.panel-title {
  flex: 1;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.chart-categories {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.chart-category {
  margin-bottom: 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  overflow: hidden;
}

.category-header {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: #f8f9fa;
  cursor: pointer;
  transition: background 0.3s;
}

.category-header:hover {
  background: #e9ecef;
}

.category-icon {
  font-size: 14px;
  margin-right: 8px;
}

.category-title {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: #495057;
}

.expand-icon {
  font-size: 10px;
  transition: transform 0.3s;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.category-content {
  padding: 8px;
  background: white;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.chart-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.chart-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.chart-icon {
  font-size: 20px;
  margin-bottom: 6px;
}

.chart-name {
  font-size: 11px;
  text-align: center;
  color: #495057;
  font-weight: 500;
}

.chart-preview {
  border-top: 1px solid #e1e5e9;
  background: white;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e1e5e9;
}

.preview-header h4 {
  margin: 0;
  font-size: 14px;
  color: #2c3e50;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.preview-content {
  padding: 16px;
}

.chart-container {
  width: 100%;
  border-radius: 4px;
  border: 1px solid #e1e5e9;
}
</style>
