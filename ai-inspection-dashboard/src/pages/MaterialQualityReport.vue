<template>
  <div class="material-quality-report">
    <!-- 页面头部 -->
    <div class="report-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="report-title">
            <el-icon><TrendCharts /></el-icon>
            物料质量总结报告
          </h1>
          <p class="report-subtitle">基于实时数据的全面质量分析与洞察</p>
        </div>
        <div class="header-actions">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleDateChange"
            class="date-picker"
          />
          <el-button type="primary" @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
          <el-button @click="exportReport">
            <el-icon><Download /></el-icon>
            导出报告
          </el-button>
        </div>
      </div>
    </div>

    <!-- 执行摘要 -->
    <div class="executive-summary">
      <div class="summary-header">
        <h2><el-icon><Document /></el-icon>执行摘要</h2>
        <el-tag type="success" size="large">质量状况良好</el-tag>
      </div>
      <div class="summary-content">
        <div class="summary-text">
          <p class="summary-main">
            本期物料质量总体表现<strong>优秀</strong>，整体合格率达到<strong>95.8%</strong>，
            较上期提升<strong>2.1%</strong>。共管理<strong>132种</strong>物料，
            涉及<strong>13家</strong>活跃供应商，完成<strong>1,056次</strong>质量检测。
          </p>
          <div class="summary-highlights">
            <div class="highlight-item positive">
              <el-icon><TrendCharts /></el-icon>
              <span>质量趋势持续向好，连续3个月保持上升态势</span>
            </div>
            <div class="highlight-item positive">
              <el-icon><CircleCheck /></el-icon>
              <span>光学类物料表现突出，合格率达97.8%</span>
            </div>
            <div class="highlight-item warning">
              <el-icon><Warning /></el-icon>
              <span>充电类物料需关注，不良率相对较高</span>
            </div>
          </div>
        </div>
        <div class="summary-chart">
          <div class="chart-mini" ref="summaryChart"></div>
        </div>
      </div>
    </div>

    <!-- 核心指标概览 -->
    <div class="overview-section">
      <div class="section-title">
        <h2><el-icon><DataAnalysis /></el-icon>核心指标概览</h2>
        <span class="update-time">最后更新: {{ lastUpdateTime }}</span>
      </div>
      <div class="metrics-grid">
        <div class="metric-card" v-for="metric in coreMetrics" :key="metric.key">
          <div class="metric-icon" :style="{ backgroundColor: metric.color + '20', color: metric.color }">
            <el-icon><component :is="metric.icon" /></el-icon>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ metric.value }}</div>
            <div class="metric-label">{{ metric.label }}</div>
            <div class="metric-trend" :class="metric.trend.type">
              <el-icon><component :is="metric.trend.icon" /></el-icon>
              <span>{{ metric.trend.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 质量趋势分析 -->
    <div class="trend-section">
      <div class="section-title">
        <h2><el-icon><TrendCharts /></el-icon>质量趋势分析</h2>
        <div class="trend-controls">
          <el-radio-group v-model="trendPeriod" @change="updateTrendData">
            <el-radio-button label="7d">近7天</el-radio-button>
            <el-radio-button label="30d">近30天</el-radio-button>
            <el-radio-button label="90d">近90天</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <div class="trend-charts">
        <div class="chart-container">
          <div class="chart-header">
            <h3>质量指标趋势</h3>
            <el-tag type="info">合格率 · 不良率 · 风险率</el-tag>
          </div>
          <div ref="qualityTrendChart" class="chart"></div>
        </div>
        <div class="chart-container">
          <div class="chart-header">
            <h3>物料数量趋势</h3>
            <el-tag type="success">库存量 · 测试量 · 上线量</el-tag>
          </div>
          <div ref="quantityTrendChart" class="chart"></div>
        </div>
      </div>
    </div>

    <!-- 物料分类分析 -->
    <div class="category-section">
      <div class="section-title">
        <h2><el-icon><Grid /></el-icon>物料分类分析</h2>
      </div>

      <!-- 分类分析文字总结 -->
      <div class="analysis-summary">
        <div class="summary-card">
          <h4><el-icon><PieChart /></el-icon>分类分布洞察</h4>
          <p>
            <strong>结构件类</strong>占比最大(34%)，共45种物料，是产品核心组件；
            <strong>光学类</strong>物料虽占比较小(18%)，但质量表现最优，合格率达97.8%；
            <strong>充电类</strong>物料需重点关注，不良率相对较高，建议加强供应商管理。
          </p>
        </div>
        <div class="summary-card">
          <h4><el-icon><TrendCharts /></el-icon>质量表现分析</h4>
          <p>
            各类别质量水平差异明显：光学类 > 声学类 > 结构件类 > 包装类 > 充电类。
            建议针对充电类物料制定专项质量提升计划，重点关注电池和充电器的供应商筛选。
          </p>
        </div>
      </div>

      <div class="category-analysis">
        <div class="category-overview">
          <div class="chart-container">
            <div class="chart-header">
              <h3>物料分类分布</h3>
              <el-tag type="info">按物料数量统计</el-tag>
            </div>
            <div ref="categoryDistributionChart" class="chart"></div>
          </div>
          <div class="category-stats">
            <div class="stat-item" v-for="category in categoryStats" :key="category.name">
              <div class="stat-header">
                <span class="category-name">{{ category.name }}</span>
                <span class="category-count">{{ category.count }}种</span>
              </div>
              <div class="stat-progress">
                <el-progress
                  :percentage="category.percentage"
                  :color="category.color"
                  :show-text="false"
                />
              </div>
              <div class="stat-details">
                <span class="quality-rate">合格率: {{ category.qualityRate }}%</span>
                <span class="risk-count">风险: {{ category.riskCount }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="category-details">
          <div class="chart-container">
            <div class="chart-header">
              <h3>各类别质量对比</h3>
              <el-tag type="success">合格率对比分析</el-tag>
            </div>
            <div ref="categoryQualityChart" class="chart"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 供应商分析 -->
    <div class="supplier-section">
      <div class="section-title">
        <h2><el-icon><OfficeBuilding /></el-icon>供应商质量分析</h2>
      </div>

      <!-- 供应商分析文字总结 -->
      <div class="analysis-summary">
        <div class="summary-card">
          <h4><el-icon><Trophy /></el-icon>优秀供应商表现</h4>
          <p>
            <strong>聚龙</strong>综合评分最高(95分)，在质量率和准时率方面表现突出；
            <strong>BOE</strong>作为显示屏主要供应商，质量稳定性良好；
            <strong>天马</strong>在创新能力方面有优势，但质量一致性需要改进。
          </p>
        </div>
        <div class="summary-card">
          <h4><el-icon><Warning /></el-icon>改进建议</h4>
          <p>
            建议与前三名供应商建立战略合作关系，对评分较低的供应商制定质量改进计划。
            重点关注供应商的响应速度和成本控制能力，建立供应商定期评估机制。
          </p>
        </div>
      </div>

      <div class="supplier-analysis">
        <div class="supplier-ranking">
          <div class="chart-container">
            <div class="chart-header">
              <h3>供应商质量排行</h3>
              <el-tag type="primary">综合评分排名</el-tag>
            </div>
            <div ref="supplierRankingChart" class="chart"></div>
          </div>
        </div>

        <div class="supplier-comparison">
          <div class="chart-container">
            <div class="chart-header">
              <h3>供应商综合评价</h3>
              <el-tag type="warning">多维度对比</el-tag>
            </div>
            <div ref="supplierRadarChart" class="chart"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 异常分析 -->
    <div class="exception-section">
      <div class="section-title">
        <h2><el-icon><Warning /></el-icon>异常分析与预警</h2>
      </div>
      <div class="exception-analysis">
        <div class="exception-alerts">
          <div class="alert-item" v-for="alert in exceptionAlerts" :key="alert.id">
            <div class="alert-icon" :class="alert.level">
              <el-icon><component :is="alert.icon" /></el-icon>
            </div>
            <div class="alert-content">
              <div class="alert-title">{{ alert.title }}</div>
              <div class="alert-description">{{ alert.description }}</div>
              <div class="alert-time">{{ alert.time }}</div>
            </div>
            <div class="alert-action">
              <el-button size="small" type="primary">查看详情</el-button>
            </div>
          </div>
        </div>
        
        <div class="exception-trends">
          <div class="chart-container">
            <div class="chart-header">
              <h3>异常趋势分析</h3>
            </div>
            <div ref="exceptionTrendChart" class="chart"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 关键洞察和建议 -->
    <div class="insights-section">
      <div class="section-title">
        <h2><el-icon><InfoFilled /></el-icon>关键洞察与建议</h2>
      </div>
      <div class="insights-content">
        <div class="insights-grid">
          <div class="insight-card positive">
            <div class="insight-header">
              <el-icon><TrendCharts /></el-icon>
              <h4>质量趋势向好</h4>
            </div>
            <p>整体合格率连续3个月上升，质量管理体系运行有效。建议继续保持现有质量标准，并适时提升检测标准。</p>
          </div>

          <div class="insight-card warning">
            <div class="insight-header">
              <el-icon><Warning /></el-icon>
              <h4>充电类物料关注</h4>
            </div>
            <p>充电类物料不良率相对较高，建议加强供应商审核，建立专项质量改进小组，制定针对性改进措施。</p>
          </div>

          <div class="insight-card info">
            <div class="insight-header">
              <el-icon><OfficeBuilding /></el-icon>
              <h4>供应商优化</h4>
            </div>
            <p>前三名供应商质量稳定，建议建立战略合作关系。对后续供应商制定质量提升计划和定期评估机制。</p>
          </div>

          <div class="insight-card success">
            <div class="insight-header">
              <el-icon><CircleCheck /></el-icon>
              <h4>光学类优势</h4>
            </div>
            <p>光学类物料质量表现突出，可作为质量管理标杆，将成功经验推广到其他物料类别。</p>
          </div>
        </div>

        <div class="action-recommendations">
          <h4><el-icon><Flag /></el-icon>下阶段行动建议</h4>
          <div class="recommendations-list">
            <div class="recommendation-item">
              <span class="priority high">高优先级</span>
              <span class="action">制定充电类物料专项质量提升计划，目标合格率提升至96%以上</span>
            </div>
            <div class="recommendation-item">
              <span class="priority medium">中优先级</span>
              <span class="action">建立供应商分级管理体系，与优秀供应商签署质量协议</span>
            </div>
            <div class="recommendation-item">
              <span class="priority low">低优先级</span>
              <span class="action">推广光学类物料质量管理经验，建立跨类别质量标准</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详细数据表格 -->
    <div class="data-table-section">
      <div class="section-title">
        <h2><el-icon><Document /></el-icon>详细数据</h2>
        <div class="table-controls">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索物料..."
            prefix-icon="Search"
            clearable
            @input="handleSearch"
          />
          <el-select v-model="selectedCategory" placeholder="选择分类" clearable @change="handleCategoryFilter">
            <el-option
              v-for="category in categories"
              :key="category.value"
              :label="category.label"
              :value="category.value"
            />
          </el-select>
        </div>
      </div>
      <div class="data-table">
        <el-table
          :data="filteredTableData"
          stripe
          :loading="tableLoading"
          @sort-change="handleSortChange"
        >
          <el-table-column prop="materialCode" label="物料编码" sortable width="120" />
          <el-table-column prop="materialName" label="物料名称" sortable width="150" />
          <el-table-column prop="category" label="分类" width="100">
            <template #default="{ row }">
              <el-tag :type="getCategoryTagType(row.category)">{{ row.category }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="supplier" label="供应商" sortable width="120" />
          <el-table-column prop="qualityRate" label="合格率" sortable width="100">
            <template #default="{ row }">
              <el-progress :percentage="row.qualityRate" :color="getQualityColor(row.qualityRate)" />
            </template>
          </el-table-column>
          <el-table-column prop="totalQuantity" label="总数量" sortable width="100" />
          <el-table-column prop="riskLevel" label="风险等级" width="100">
            <template #default="{ row }">
              <el-tag :type="getRiskTagType(row.riskLevel)">{{ row.riskLevel }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lastTestDate" label="最近测试" sortable width="120" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="viewDetails(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="table-pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="totalCount"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import {
  TrendCharts,
  DataAnalysis,
  Grid,
  OfficeBuilding,
  Warning,
  Document,
  Refresh,
  Download,
  ArrowUp,
  ArrowDown,
  Minus,
  CircleCheck,
  PieChart,
  Trophy,
  Flag,
  Box,
  InfoFilled,
  Stopwatch
} from '@element-plus/icons-vue'

// 响应式数据
const dateRange = ref([])
const lastUpdateTime = ref('')
const trendPeriod = ref('30d')
const searchKeyword = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const tableLoading = ref(false)

// 核心指标数据
const coreMetrics = ref([])
const categoryStats = ref([])
const exceptionAlerts = ref([])
const filteredTableData = ref([])
const categories = ref([])

// 图表引用
const summaryChart = ref(null)
const qualityTrendChart = ref(null)
const quantityTrendChart = ref(null)
const categoryDistributionChart = ref(null)
const categoryQualityChart = ref(null)
const supplierRankingChart = ref(null)
const supplierRadarChart = ref(null)
const exceptionTrendChart = ref(null)

// 图表实例
let summaryChartInstance = null
let qualityTrendChartInstance = null
let quantityTrendChartInstance = null
let categoryDistributionChartInstance = null
let categoryQualityChartInstance = null
let supplierRankingChartInstance = null
let supplierRadarChartInstance = null
let exceptionTrendChartInstance = null

// 生命周期
onMounted(async () => {
  await initializeData()
  await nextTick()
  initializeCharts()
})

// 方法定义
const initializeData = async () => {
  try {
    console.log('初始化物料质量报告数据...')

    // 设置最后更新时间
    lastUpdateTime.value = new Date().toLocaleString()

    // 并行加载所有数据
    await Promise.all([
      loadCoreMetrics(),
      loadCategoryAnalysis(),
      loadSupplierAnalysis(),
      loadExceptionAnalysis(),
      loadDetailedData()
    ])

    console.log('数据加载完成')
  } catch (error) {
    console.error('数据初始化失败:', error)
    ElMessage.error('数据加载失败，请稍后重试')
  }
}

const initializeCharts = () => {
  try {
    console.log('初始化图表...')

    // 初始化所有图表
    initSummaryChart()
    initQualityTrendChart()
    initQuantityTrendChart()
    initCategoryDistributionChart()
    initCategoryQualityChart()
    initSupplierRankingChart()
    initSupplierRadarChart()
    initExceptionTrendChart()

    console.log('图表初始化完成')
  } catch (error) {
    console.error('图表初始化失败:', error)
  }
}

// 数据加载方法
const loadCoreMetrics = async () => {
  try {
    const params = new URLSearchParams()
    if (dateRange.value && dateRange.value.length === 2) {
      params.append('startDate', dateRange.value[0].toISOString().split('T')[0])
      params.append('endDate', dateRange.value[1].toISOString().split('T')[0])
    }

    const response = await fetch(`/api/material-quality-report/core-metrics?${params}`)
    const result = await response.json()

    if (result.success) {
      coreMetrics.value = Object.values(result.data)
    }
  } catch (error) {
    console.error('加载核心指标失败:', error)
  }
}

const loadCategoryAnalysis = async () => {
  try {
    const response = await fetch('/api/material-quality-report/category-analysis')
    const result = await response.json()

    if (result.success) {
      categoryStats.value = result.data.categoryStats
      // 更新分类选项
      categories.value = result.data.categoryStats.map(cat => ({
        label: cat.name,
        value: cat.name
      }))
    }
  } catch (error) {
    console.error('加载分类分析失败:', error)
  }
}

const loadSupplierAnalysis = async () => {
  try {
    const response = await fetch('/api/material-quality-report/supplier-analysis')
    const result = await response.json()

    if (result.success) {
      // 供应商数据将用于图表渲染
      console.log('供应商分析数据:', result.data)
    }
  } catch (error) {
    console.error('加载供应商分析失败:', error)
  }
}

const loadExceptionAnalysis = async () => {
  try {
    const response = await fetch('/api/material-quality-report/exception-analysis')
    const result = await response.json()

    if (result.success) {
      exceptionAlerts.value = result.data.alerts || []
    }
  } catch (error) {
    console.error('加载异常分析失败:', error)
  }
}

const loadDetailedData = async () => {
  try {
    tableLoading.value = true
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      pageSize: pageSize.value.toString()
    })

    if (searchKeyword.value) {
      params.append('search', searchKeyword.value)
    }
    if (selectedCategory.value) {
      params.append('category', selectedCategory.value)
    }

    const response = await fetch(`/api/material-quality-report/detailed-data?${params}`)
    const result = await response.json()

    if (result.success) {
      filteredTableData.value = result.data.data
      totalCount.value = result.data.total
    }
  } catch (error) {
    console.error('加载详细数据失败:', error)
  } finally {
    tableLoading.value = false
  }
}

const refreshData = async () => {
  try {
    await initializeData()
    await nextTick()
    initializeCharts()
    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('数据刷新失败')
  }
}

const exportReport = async () => {
  try {
    const response = await fetch('/api/material-quality-report/export?format=json')
    const blob = await response.blob()

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `material-quality-report-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    ElMessage.success('报告导出成功')
  } catch (error) {
    console.error('导出报告失败:', error)
    ElMessage.error('报告导出失败')
  }
}

// 图表初始化方法
const initSummaryChart = () => {
  if (!summaryChart.value) return

  summaryChartInstance = echarts.init(summaryChart.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}%'
    },
    series: [
      {
        name: '质量分布',
        type: 'pie',
        radius: ['50%', '80%'],
        center: ['50%', '50%'],
        data: [
          { value: 95.8, name: '合格', itemStyle: { color: '#67c23a' } },
          { value: 4.2, name: '不合格', itemStyle: { color: '#f56c6c' } }
        ],
        label: {
          show: true,
          formatter: '{b}\n{c}%',
          fontSize: 12,
          fontWeight: 'bold'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  summaryChartInstance.setOption(option)
}

const initQualityTrendChart = () => {
  if (!qualityTrendChart.value) return

  qualityTrendChartInstance = echarts.init(qualityTrendChart.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: { color: '#999' }
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#409eff',
      borderWidth: 1,
      textStyle: { color: '#303133' },
      formatter: function(params) {
        let result = `<div style="font-weight: 600; margin-bottom: 8px;">${params[0].axisValue}</div>`
        params.forEach(param => {
          result += `<div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="display: inline-block; width: 10px; height: 10px; background: ${param.color}; border-radius: 50%; margin-right: 8px;"></span>
            <span style="flex: 1;">${param.seriesName}</span>
            <span style="font-weight: 600; color: ${param.color};">${param.value}%</span>
          </div>`
        })
        return result
      }
    },
    legend: {
      data: ['合格率', '不良率', '风险率'],
      top: 10,
      textStyle: { fontSize: 12, color: '#606266' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: generateDateRange(30),
      axisLine: { lineStyle: { color: '#e4e7ed' } },
      axisTick: { lineStyle: { color: '#e4e7ed' } },
      axisLabel: { color: '#909399', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}%',
        color: '#909399',
        fontSize: 11
      },
      axisLine: { lineStyle: { color: '#e4e7ed' } },
      splitLine: { lineStyle: { color: '#f5f7fa', type: 'dashed' } }
    },
    series: [
      {
        name: '合格率',
        type: 'line',
        data: generateTrendData(30, 92, 98),
        itemStyle: { color: '#67c23a' },
        lineStyle: { width: 3 },
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        emphasis: {
          itemStyle: { borderColor: '#67c23a', borderWidth: 2 },
          scale: true
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
              { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
            ]
          }
        }
      },
      {
        name: '不良率',
        type: 'line',
        data: generateTrendData(30, 1, 5),
        itemStyle: { color: '#f56c6c' },
        lineStyle: { width: 3 },
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        emphasis: {
          itemStyle: { borderColor: '#f56c6c', borderWidth: 2 },
          scale: true
        }
      },
      {
        name: '风险率',
        type: 'line',
        data: generateTrendData(30, 2, 8),
        itemStyle: { color: '#e6a23c' },
        lineStyle: { width: 3 },
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        emphasis: {
          itemStyle: { borderColor: '#e6a23c', borderWidth: 2 },
          scale: true
        }
      }
    ]
  }

  qualityTrendChartInstance.setOption(option)
}

const initQuantityTrendChart = () => {
  if (!quantityTrendChart.value) return

  quantityTrendChartInstance = echarts.init(quantityTrendChart.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['库存量', '测试量', '上线量']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: generateDateRange(30)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '库存量',
        type: 'bar',
        data: generateTrendData(30, 800, 1200),
        itemStyle: { color: '#409eff' }
      },
      {
        name: '测试量',
        type: 'bar',
        data: generateTrendData(30, 200, 400),
        itemStyle: { color: '#67c23a' }
      },
      {
        name: '上线量',
        type: 'bar',
        data: generateTrendData(30, 150, 350),
        itemStyle: { color: '#e6a23c' }
      }
    ]
  }

  quantityTrendChartInstance.setOption(option)
}

const initCategoryDistributionChart = () => {
  if (!categoryDistributionChart.value) return

  categoryDistributionChartInstance = echarts.init(categoryDistributionChart.value)

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#409eff',
      borderWidth: 1,
      textStyle: { color: '#303133' },
      formatter: function(params) {
        return `<div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
                <div style="display: flex; justify-content: space-between; gap: 20px;">
                  <span>数量: <strong style="color: ${params.color};">${params.value}种</strong></span>
                  <span>占比: <strong style="color: ${params.color};">${params.percent}%</strong></span>
                </div>`
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center',
      textStyle: { fontSize: 12, color: '#606266' },
      itemGap: 12,
      formatter: function(name) {
        const data = [
          { name: '结构件类', value: 45 },
          { name: '光学类', value: 24 },
          { name: '充电类', value: 18 },
          { name: '声学类', value: 8 },
          { name: '包装类', value: 5 }
        ]
        const item = data.find(d => d.name === name)
        return `${name}  ${item ? item.value : 0}种`
      }
    },
    series: [
      {
        name: '物料分类',
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['65%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n{d}%',
          fontSize: 11,
          color: '#606266'
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 10,
          lineStyle: { color: '#e4e7ed' }
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 15,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          },
          label: {
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: [
          {
            value: 45,
            name: '结构件类',
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 1, y2: 1,
                colorStops: [
                  { offset: 0, color: '#409eff' },
                  { offset: 1, color: '#66b3ff' }
                ]
              }
            }
          },
          {
            value: 24,
            name: '光学类',
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 1, y2: 1,
                colorStops: [
                  { offset: 0, color: '#67c23a' },
                  { offset: 1, color: '#85ce61' }
                ]
              }
            }
          },
          {
            value: 18,
            name: '充电类',
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 1, y2: 1,
                colorStops: [
                  { offset: 0, color: '#e6a23c' },
                  { offset: 1, color: '#ebb563' }
                ]
              }
            }
          },
          {
            value: 8,
            name: '声学类',
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 1, y2: 1,
                colorStops: [
                  { offset: 0, color: '#f56c6c' },
                  { offset: 1, color: '#f78989' }
                ]
              }
            }
          },
          {
            value: 5,
            name: '包装类',
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 1, y2: 1,
                colorStops: [
                  { offset: 0, color: '#909399' },
                  { offset: 1, color: '#a6a9ad' }
                ]
              }
            }
          }
        ]
      }
    ]
  }

  categoryDistributionChartInstance.setOption(option)
}

const initCategoryQualityChart = () => {
  if (!categoryQualityChart.value) return

  categoryQualityChartInstance = echarts.init(categoryQualityChart.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['合格率', '风险率']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['结构件类', '光学类', '充电类', '声学类', '包装类']
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: '{value}%' }
    },
    series: [
      {
        name: '合格率',
        type: 'bar',
        data: [95.2, 97.8, 93.5, 96.1, 94.7],
        itemStyle: { color: '#67c23a' }
      },
      {
        name: '风险率',
        type: 'bar',
        data: [4.8, 2.2, 6.5, 3.9, 5.3],
        itemStyle: { color: '#f56c6c' }
      }
    ]
  }

  categoryQualityChartInstance.setOption(option)
}

const handleDateChange = async (dates) => {
  console.log('日期范围变更:', dates)
  await loadCoreMetrics()
}

const updateTrendData = async () => {
  console.log('更新趋势数据:', trendPeriod.value)
  // 重新初始化趋势图表
  initQualityTrendChart()
  initQuantityTrendChart()
}

const handleSearch = () => {
  console.log('搜索:', searchKeyword.value)
}

const handleCategoryFilter = () => {
  console.log('分类筛选:', selectedCategory.value)
}

const handleSortChange = (sort) => {
  console.log('排序变更:', sort)
}

const handleSizeChange = (size) => {
  pageSize.value = size
  console.log('页面大小变更:', size)
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  console.log('页码变更:', page)
}

const viewDetails = (row) => {
  console.log('查看详情:', row)
}

const getCategoryTagType = (category) => {
  const typeMap = {
    '结构件类': 'primary',
    '光学类': 'success',
    '充电类': 'warning',
    '声学类': 'info',
    '包装类': 'danger'
  }
  return typeMap[category] || 'default'
}

const getQualityColor = (rate) => {
  if (rate >= 95) return '#67c23a'
  if (rate >= 90) return '#e6a23c'
  return '#f56c6c'
}

const getRiskTagType = (level) => {
  const typeMap = {
    '低': 'success',
    '中': 'warning',
    '高': 'danger'
  }
  return typeMap[level] || 'info'
}

// 剩余图表初始化方法
const initSupplierRankingChart = () => {
  if (!supplierRankingChart.value) return

  supplierRankingChartInstance = echarts.init(supplierRankingChart.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: ['聚龙', 'BOE', '天马', '华星', '歌尔', '东声', '欣冠', '广正']
    },
    series: [
      {
        name: '综合评分',
        type: 'bar',
        data: [95, 92, 89, 87, 85, 83, 81, 78],
        itemStyle: { color: '#409eff' }
      }
    ]
  }

  supplierRankingChartInstance.setOption(option)
}

const initSupplierRadarChart = () => {
  if (!supplierRadarChart.value) return

  supplierRadarChartInstance = echarts.init(supplierRadarChart.value)

  const option = {
    tooltip: {},
    legend: {
      data: ['聚龙', 'BOE', '天马']
    },
    radar: {
      indicator: [
        { name: '质量率', max: 100 },
        { name: '准时率', max: 100 },
        { name: '响应速度', max: 100 },
        { name: '成本控制', max: 100 },
        { name: '创新能力', max: 100 },
        { name: '服务质量', max: 100 }
      ]
    },
    series: [
      {
        name: '供应商评价',
        type: 'radar',
        data: [
          {
            value: [95, 92, 88, 85, 82, 90],
            name: '聚龙',
            itemStyle: { color: '#409eff' }
          },
          {
            value: [92, 88, 85, 90, 88, 85],
            name: 'BOE',
            itemStyle: { color: '#67c23a' }
          },
          {
            value: [89, 85, 90, 82, 85, 88],
            name: '天马',
            itemStyle: { color: '#e6a23c' }
          }
        ]
      }
    ]
  }

  supplierRadarChartInstance.setOption(option)
}

const initExceptionTrendChart = () => {
  if (!exceptionTrendChart.value) return

  exceptionTrendChartInstance = echarts.init(exceptionTrendChart.value)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['高风险', '中风险', '低风险']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: generateDateRange(14)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '高风险',
        type: 'line',
        data: generateTrendData(14, 2, 8),
        itemStyle: { color: '#f56c6c' },
        smooth: true
      },
      {
        name: '中风险',
        type: 'line',
        data: generateTrendData(14, 5, 15),
        itemStyle: { color: '#e6a23c' },
        smooth: true
      },
      {
        name: '低风险',
        type: 'line',
        data: generateTrendData(14, 1, 5),
        itemStyle: { color: '#67c23a' },
        smooth: true
      }
    ]
  }

  exceptionTrendChartInstance.setOption(option)
}

// 辅助函数
const generateDateRange = (days) => {
  const dates = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }))
  }
  return dates
}

const generateTrendData = (length, min, max) => {
  return Array.from({ length }, () =>
    Math.floor(Math.random() * (max - min + 1)) + min
  )
}
</script>

<style scoped>
.material-quality-report {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  animation: fadeIn 0.6s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.report-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 24px;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.report-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: headerGlow 4s ease-in-out infinite alternate;
}

@keyframes headerGlow {
  0% { transform: rotate(0deg) scale(1); }
  100% { transform: rotate(180deg) scale(1.1); }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.title-section {
  flex: 1;
}

.report-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.report-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.date-picker {
  width: 280px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title h2 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.update-time {
  color: #909399;
  font-size: 14px;
}

/* 执行摘要样式 */
.executive-summary {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 28px;
  margin-bottom: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.executive-summary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #409eff, #67c23a, #e6a23c, #f56c6c);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.summary-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  align-items: start;
}

.summary-text {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-main {
  font-size: 16px;
  line-height: 1.6;
  color: #303133;
  margin: 0;
  padding: 20px;
  background: rgba(64, 158, 255, 0.05);
  border-radius: 12px;
  border-left: 4px solid #409eff;
}

.summary-main strong {
  color: #409eff;
  font-weight: 600;
}

.summary-highlights {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.highlight-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.highlight-item.positive {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
  border: 1px solid rgba(103, 194, 58, 0.2);
}

.highlight-item.warning {
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
  border: 1px solid rgba(230, 162, 60, 0.2);
}

.summary-chart {
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-mini {
  width: 200px;
  height: 200px;
}

.overview-section {
  margin-bottom: 32px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.metric-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s;
}

.metric-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
}

.metric-card:hover::before {
  left: 100%;
}

.metric-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}

.metric-card:hover .metric-icon {
  transform: rotate(5deg) scale(1.1);
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.metric-trend.up {
  color: #67c23a;
}

.metric-trend.down {
  color: #f56c6c;
}

.metric-trend.stable {
  color: #909399;
}

.trend-section,
.category-section,
.supplier-section,
.exception-section,
.data-table-section {
  background: white;
  border-radius: 16px;
  padding: 28px;
  margin-bottom: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  animation: slideInUp 0.6s ease-out;
}

.trend-section:hover,
.category-section:hover,
.supplier-section:hover,
.exception-section:hover,
.data-table-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.trend-controls {
  display: flex;
  gap: 12px;
}

.trend-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.chart-container {
  border: 1px solid rgba(235, 238, 245, 0.6);
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.chart-container:hover {
  border-color: #409eff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.1);
}

.chart-header {
  padding: 16px 20px;
  background: #fafafa;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart {
  height: 300px;
  width: 100%;
}

.category-analysis {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.category-overview {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.category-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.category-name {
  font-weight: 600;
  color: #303133;
}

.category-count {
  color: #909399;
  font-size: 14px;
}

.stat-progress {
  margin-bottom: 8px;
}

.stat-details {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #606266;
}

.supplier-analysis {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.exception-analysis {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.exception-alerts {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid;
}

.alert-item.high {
  background: #fef0f0;
  border-left-color: #f56c6c;
}

.alert-item.medium {
  background: #fdf6ec;
  border-left-color: #e6a23c;
}

.alert-item.low {
  background: #f0f9ff;
  border-left-color: #409eff;
}

.alert-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.alert-icon.high {
  background: #f56c6c;
  color: white;
}

.alert-icon.medium {
  background: #e6a23c;
  color: white;
}

.alert-icon.low {
  background: #409eff;
  color: white;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.alert-description {
  color: #606266;
  font-size: 14px;
  margin-bottom: 4px;
}

.alert-time {
  color: #909399;
  font-size: 12px;
}

.table-controls {
  display: flex;
  gap: 12px;
}

.data-table {
  margin-top: 16px;
}

/* 分析总结样式 */
.analysis-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.summary-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(64, 158, 255, 0.1);
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(64, 158, 255, 0.15);
  border-color: #409eff;
}

.summary-card h4 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-card p {
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
  margin: 0;
}

.summary-card strong {
  color: #409eff;
  font-weight: 600;
}

/* 洞察和建议样式 */
.insights-section {
  background: white;
  border-radius: 16px;
  padding: 28px;
  margin-bottom: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.insights-content {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.insight-card {
  padding: 20px;
  border-radius: 12px;
  border: 2px solid;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.insight-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.insight-card.positive {
  background: rgba(103, 194, 58, 0.05);
  border-color: rgba(103, 194, 58, 0.2);
}

.insight-card.positive::before {
  background: #67c23a;
}

.insight-card.warning {
  background: rgba(230, 162, 60, 0.05);
  border-color: rgba(230, 162, 60, 0.2);
}

.insight-card.warning::before {
  background: #e6a23c;
}

.insight-card.info {
  background: rgba(64, 158, 255, 0.05);
  border-color: rgba(64, 158, 255, 0.2);
}

.insight-card.info::before {
  background: #409eff;
}

.insight-card.success {
  background: rgba(103, 194, 58, 0.05);
  border-color: rgba(103, 194, 58, 0.2);
}

.insight-card.success::before {
  background: #67c23a;
}

.insight-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.insight-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.insight-card p {
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
  margin: 0;
}

.action-recommendations {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(64, 158, 255, 0.1);
}

.action-recommendations h4 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommendation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  transition: all 0.3s ease;
}

.recommendation-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.priority {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  min-width: 60px;
  text-align: center;
}

.priority.high {
  background: #f56c6c;
  color: white;
}

.priority.medium {
  background: #e6a23c;
  color: white;
}

.priority.low {
  background: #909399;
  color: white;
}

.action {
  flex: 1;
  font-size: 14px;
  color: #303133;
}

.table-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .summary-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .chart-mini {
    width: 150px;
    height: 150px;
  }

  .insights-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 1200px) {
  .trend-charts,
  .category-analysis,
  .supplier-analysis,
  .exception-analysis {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .metrics-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }

  .analysis-summary {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .material-quality-report {
    padding: 12px;
  }

  .report-header {
    padding: 20px;
    border-radius: 12px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .report-title {
    font-size: 24px;
  }

  .header-actions {
    flex-direction: column;
    gap: 8px;
  }

  .date-picker {
    width: 100%;
  }

  .executive-summary,
  .trend-section,
  .category-section,
  .supplier-section,
  .exception-section,
  .data-table-section,
  .insights-section {
    padding: 16px;
    margin-bottom: 16px;
  }

  .summary-content {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .summary-main {
    padding: 16px;
    font-size: 14px;
  }

  .summary-highlights {
    gap: 8px;
  }

  .highlight-item {
    padding: 8px 12px;
    font-size: 13px;
  }

  .chart-mini {
    width: 120px;
    height: 120px;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .metric-card {
    padding: 16px;
  }

  .metric-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }

  .metric-value {
    font-size: 24px;
  }

  .chart {
    height: 250px;
  }

  .table-controls {
    flex-direction: column;
    gap: 8px;
  }

  .insights-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .insight-card {
    padding: 16px;
  }

  .action-recommendations {
    padding: 16px;
  }

  .recommendation-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 12px;
  }

  .priority {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .material-quality-report {
    padding: 8px;
  }

  .report-header {
    padding: 16px;
  }

  .report-title {
    font-size: 20px;
  }

  .report-subtitle {
    font-size: 14px;
  }

  .section-title h2 {
    font-size: 18px;
  }

  .metric-card {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .metric-content {
    width: 100%;
  }

  .chart {
    height: 200px;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .material-quality-report {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    color: #ffffff;
  }

  .trend-section,
  .category-section,
  .supplier-section,
  .exception-section,
  .data-table-section,
  .metric-card {
    background: #2d2d2d;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .chart-container {
    background: linear-gradient(145deg, #2d2d2d 0%, #3a3a3a 100%);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .chart-header {
    background: #3a3a3a;
    border-color: rgba(255, 255, 255, 0.1);
  }
}

/* 打印样式 */
@media print {
  .material-quality-report {
    background: white;
    padding: 0;
  }

  .header-actions,
  .table-controls,
  .table-pagination {
    display: none;
  }

  .trend-section,
  .category-section,
  .supplier-section,
  .exception-section,
  .data-table-section {
    break-inside: avoid;
    box-shadow: none;
    border: 1px solid #ddd;
  }

  .chart {
    height: 300px;
  }
}
</style>
