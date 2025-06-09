<template>
  <div class="home-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="welcome-card">
          <template #header>
            <div class="card-header">
              <h2>欢迎使用IQE动态检验系统</h2>
            </div>
          </template>
          <div class="welcome-content">
            <p class="system-intro">
              本系统基于各工厂、仓库检验状态，结合上线使用情况和实验室测试情况，智能推荐物料类别动态检验方案。
            </p>
            <el-button type="primary" class="architecture-btn" @click="goToPage('/architecture')">
              查看系统架构图解
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据仪表盘 -->
    <el-row :gutter="20" class="dashboard-row">
      <el-col :span="24">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <h2>系统数据概览</h2>
              <el-tag type="success">实时数据</el-tag>
            </div>
          </template>
          <div class="dashboard-content">
            <el-row :gutter="20">
              <el-col :xs="24" :sm="12" :md="6">
                <div class="data-card">
                  <div class="data-icon factory-icon">
                    <el-icon><el-icon-goods /></el-icon>
                  </div>
                  <div class="data-info">
                    <div class="data-title">工厂物料</div>
                    <div class="data-value">{{ factoryData.length }}</div>
                    <div class="data-desc">
                      <span class="data-label">平均缺陷率:</span>
                      <span class="data-metric">{{ avgFactoryDefectRate }}%</span>
                    </div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6">
                <div class="data-card">
                  <div class="data-icon lab-icon">
                    <el-icon><el-icon-data-analysis /></el-icon>
                  </div>
                  <div class="data-info">
                    <div class="data-title">实验室测试</div>
                    <div class="data-value">{{ labData.length }}</div>
                    <div class="data-desc">
                      <span class="data-label">合格率:</span>
                      <span class="data-metric">{{ labPassRate }}%</span>
                    </div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6">
                <div class="data-card">
                  <div class="data-icon online-icon">
                    <el-icon><el-icon-monitor /></el-icon>
                  </div>
                  <div class="data-info">
                    <div class="data-title">上线使用</div>
                    <div class="data-value">{{ onlineData.length }}</div>
                    <div class="data-desc">
                      <span class="data-label">上线缺陷率:</span>
                      <span class="data-metric">{{ avgOnlineDefectRate }}%</span>
                    </div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6">
                <div class="data-card">
                  <div class="data-icon risk-icon">
                    <el-icon><el-icon-warning /></el-icon>
                  </div>
                  <div class="data-info">
                    <div class="data-title">高风险物料</div>
                    <div class="data-value">{{ highRiskCount }}</div>
                    <div class="data-desc">
                      <span class="data-label">占比:</span>
                      <span class="data-metric">{{ highRiskPercentage }}%</span>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 风险分布图表 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <h2>物料风险分布</h2>
              <el-button type="primary" size="small" @click="goToPage('/analysis')">详细分析</el-button>
            </div>
          </template>
          <div class="chart-content">
            <div ref="riskDistributionChartRef" style="width: 100%; height: 300px;"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <h2>测试合格率趋势</h2>
              <el-button type="primary" size="small" @click="goToPage('/lab')">查看详情</el-button>
            </div>
          </template>
          <div class="chart-content">
            <div ref="passRateChartRef" style="width: 100%; height: 300px;"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速导航 -->
    <el-row :gutter="20" class="feature-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="feature-card" shadow="hover" @click="goToPage('/batch')">
          <div class="feature-icon">
            <el-icon><el-icon-document-copy /></el-icon>
          </div>
          <div class="feature-info">
            <h3>批次管理</h3>
            <p>物料批次的创建、追踪与分析</p>
          </div>
          <div class="feature-action">
            <el-button type="primary" text>进入管理</el-button>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="feature-card" shadow="hover" @click="goToPage('/monitoring')">
          <div class="feature-icon">
            <el-icon><el-icon-monitor /></el-icon>
          </div>
          <div class="feature-info">
            <h3>实时监控</h3>
            <p>生产线与检验过程实时状态</p>
          </div>
          <div class="feature-action">
            <el-button type="success" text>实时查看</el-button>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="feature-card" shadow="hover" @click="goToPage('/dashboard')">
          <div class="feature-icon">
            <el-icon><el-icon-data-board /></el-icon>
          </div>
          <div class="feature-info">
            <h3>监控仪表板</h3>
            <p>质量数据与风险实时监控</p>
          </div>
          <div class="feature-action">
            <el-button type="primary" text>进入仪表板</el-button>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="feature-card" shadow="hover" @click="goToPage('/inventory')">
          <div class="feature-icon">
            <el-icon><el-icon-goods /></el-icon>
          </div>
          <div class="feature-info">
            <h3>库存管理</h3>
            <p>物料库存状态与批次管理</p>
          </div>
          <div class="feature-action">
            <el-button type="warning" text>管理库存</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { materialCategories } from '../data/material_categories.js'
import factoryDataJson from '../data/factory_data.json'
import labDataJson from '../data/lab_data.json'
import onlineDataJson from '../data/online_data.json'
import { recommendInspectionStrategy } from '../logic/recommend.js'
import * as echarts from 'echarts/core'
import { PieChart, BarChart } from 'echarts/charts'
import { 
  TitleComponent, 
  TooltipComponent, 
  LegendComponent,
  GridComponent
} from 'echarts/components'
import { LabelLayout } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { ArrowRight } from '@element-plus/icons-vue'

// 注册必需的组件
echarts.use([
  TitleComponent, 
  TooltipComponent, 
  LegendComponent,
  GridComponent,
  PieChart,
  BarChart,
  LabelLayout,
  CanvasRenderer
])

const router = useRouter()
const factoryData = ref(factoryDataJson)
const labData = ref(labDataJson)
const onlineData = ref(onlineDataJson)
const riskDistributionChartRef = ref(null)
const passRateChartRef = ref(null)
let riskDistributionChart = null
let passRateChart = null

// 计算工厂平均缺陷率
const avgFactoryDefectRate = computed(() => {
  if (factoryData.value.length === 0) return 0
  const total = factoryData.value.reduce((sum, item) => sum + item.defect_rate, 0)
  return (total / factoryData.value.length).toFixed(2)
})

// 计算实验室测试合格率
const labPassRate = computed(() => {
  if (labData.value.length === 0) return 0
  const passCount = labData.value.filter(item => item.result === '合格').length
  return ((passCount / labData.value.length) * 100).toFixed(0)
})

// 计算上线平均缺陷率
const avgOnlineDefectRate = computed(() => {
  if (onlineData.value.length === 0) return 0
  
  let totalDefects = 0
  let totalItems = 0
  
  onlineData.value.forEach(item => {
    totalDefects += item.defect_count
    totalItems += item.total_count
  })
  
  return totalItems > 0 ? ((totalDefects / totalItems) * 100).toFixed(2) : 0
})

// 计算高风险物料数量
const highRiskCount = computed(() => {
  // 简单定义：工厂缺陷率>2%或实验室不合格或上线缺陷率>2%的物料
  const highRiskMaterials = new Set()
  
  factoryData.value.forEach(item => {
    if (item.defect_rate > 2) {
      highRiskMaterials.add(item.material_code)
    }
  })
  
  labData.value.forEach(item => {
    if (item.result === '不合格') {
      highRiskMaterials.add(item.material_code)
    }
  })
  
  onlineData.value.forEach(item => {
    if ((item.defect_count / item.total_count) * 100 > 2) {
      highRiskMaterials.add(item.material_code)
    }
  })
  
  return highRiskMaterials.size
})

// 计算高风险物料占比
const highRiskPercentage = computed(() => {
  const allMaterials = new Set()
  
  factoryData.value.forEach(item => allMaterials.add(item.material_code))
  labData.value.forEach(item => allMaterials.add(item.material_code))
  onlineData.value.forEach(item => allMaterials.add(item.material_code))
  
  return allMaterials.size > 0 
    ? ((highRiskCount.value / allMaterials.size) * 100).toFixed(0) 
    : 0
})

// 计算各类别风险分布
const categoryRiskData = computed(() => {
  const data = []
  
  materialCategories.forEach(category => {
    // 获取该类别的所有物料
    const categoryMaterials = new Set()
    const highRiskMaterials = new Set()
    const mediumRiskMaterials = new Set()
    const lowRiskMaterials = new Set()
    
    // 收集该类别的所有物料
    factoryData.value
      .filter(item => item.category_id === category.id)
      .forEach(item => categoryMaterials.add(item.material_code))
    
    labData.value
      .filter(item => item.category_id === category.id)
      .forEach(item => categoryMaterials.add(item.material_code))
    
    onlineData.value
      .filter(item => item.category_id === category.id)
      .forEach(item => categoryMaterials.add(item.material_code))
    
    // 分析风险等级
    categoryMaterials.forEach(code => {
      const factory = factoryData.value.find(item => item.material_code === code)
      const lab = labData.value.find(item => item.material_code === code)
      const online = onlineData.value.find(item => item.material_code === code)
      
      let isHighRisk = false
      let isMediumRisk = false
      
      // 工厂缺陷率判断
      if (factory && factory.defect_rate > 2) {
        isHighRisk = true
      } else if (factory && factory.defect_rate > 1) {
        isMediumRisk = true
      }
      
      // 实验室测试结果判断
      if (lab && lab.result === '不合格') {
        isHighRisk = true
      } else if (lab && lab.score < 80) {
        isMediumRisk = true
      }
      
      // 上线缺陷率判断
      if (online) {
        const defectRate = (online.defect_count / online.total_count) * 100
        if (defectRate > 2) {
          isHighRisk = true
        } else if (defectRate > 1) {
          isMediumRisk = true
        }
      }
      
      if (isHighRisk) {
        highRiskMaterials.add(code)
      } else if (isMediumRisk) {
        mediumRiskMaterials.add(code)
      } else {
        lowRiskMaterials.add(code)
      }
    })
    
    data.push({
      categoryId: category.id,
      categoryName: category.name,
      totalCount: categoryMaterials.size,
      highRiskCount: highRiskMaterials.size,
      mediumRiskCount: mediumRiskMaterials.size,
      lowRiskCount: lowRiskMaterials.size
    })
  })
  
  return data
})

// AI推荐数据
const recommendationData = computed(() => {
  return categoryRiskData.value
    .filter(item => item.totalCount > 0)
    .map(item => {
      // 计算风险等级
      let riskLevel = '低风险'
      if (item.highRiskCount > 0) {
        riskLevel = '高风险'
      } else if (item.mediumRiskCount > 0) {
        riskLevel = '中风险'
      }
      
      // 生成推荐
      let recommendation = ''
      let specificStrategy = ''
      
      if (riskLevel === '高风险') {
        recommendation = '建议进行严格检验，提高抽样比例'
        specificStrategy = `重点关注${item.categoryName}类不良项`
      } else if (riskLevel === '中风险') {
        recommendation = '建议进行常规检验，关注历史问题点'
        specificStrategy = '保持正常检验频率'
      } else {
        recommendation = '可适当降低检验频率，实施抽检'
        specificStrategy = '维持基本检验项目'
      }
      
      return {
        categoryName: item.categoryName,
        riskLevel,
        recommendation,
        specificStrategy
      }
    })
    .sort((a, b) => {
      // 按风险等级排序
      const riskOrder = { '高风险': 0, '中风险': 1, '低风险': 2 }
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
    })
})

// 获取风险等级对应的标签类型
function getRiskTagType(riskLevel) {
  switch (riskLevel) {
    case '高风险': return 'danger'
    case '中风险': return 'warning'
    case '低风险': return 'success'
    default: return 'info'
  }
}

// 初始化图表
function initCharts() {
  // 初始化风险分布图表
  if (riskDistributionChartRef.value) {
    riskDistributionChart = echarts.init(riskDistributionChartRef.value)
    updateRiskDistributionChart()
  }
  
  // 初始化合格率趋势图表
  if (passRateChartRef.value) {
    passRateChart = echarts.init(passRateChartRef.value)
    updatePassRateChart()
  }
}

// 更新风险分布图表
function updateRiskDistributionChart() {
  if (!riskDistributionChart) return
  
  const categories = categoryRiskData.value
    .filter(item => item.totalCount > 0)
    .map(item => item.categoryName)
  
  const highRiskData = categoryRiskData.value
    .filter(item => item.totalCount > 0)
    .map(item => item.highRiskCount)
  
  const mediumRiskData = categoryRiskData.value
    .filter(item => item.totalCount > 0)
    .map(item => item.mediumRiskCount)
  
  const lowRiskData = categoryRiskData.value
    .filter(item => item.totalCount > 0)
    .map(item => item.lowRiskCount)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
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
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: categories
    },
    series: [
      {
        name: '高风险',
        type: 'bar',
        stack: 'total',
        label: {
          show: true
        },
        emphasis: {
          focus: 'series'
        },
        data: highRiskData,
        itemStyle: {
          color: '#F56C6C'
        }
      },
      {
        name: '中风险',
        type: 'bar',
        stack: 'total',
        label: {
          show: true
        },
        emphasis: {
          focus: 'series'
        },
        data: mediumRiskData,
        itemStyle: {
          color: '#E6A23C'
        }
      },
      {
        name: '低风险',
        type: 'bar',
        stack: 'total',
        label: {
          show: true
        },
        emphasis: {
          focus: 'series'
        },
        data: lowRiskData,
        itemStyle: {
          color: '#67C23A'
        }
      }
    ]
  }
  
  riskDistributionChart.setOption(option)
}

// 更新合格率趋势图表
function updatePassRateChart() {
  if (!passRateChart) return
  
  // 按日期分组计算合格率
  const dateMap = new Map()
  
  labData.value.forEach(item => {
    const date = item.test_date.substring(0, 10)
    if (!dateMap.has(date)) {
      dateMap.set(date, { total: 0, pass: 0 })
    }
    
    const stats = dateMap.get(date)
    stats.total++
    if (item.result === '合格') {
      stats.pass++
    }
  })
  
  // 转换为数组并排序
  const sortedData = Array.from(dateMap.entries())
    .map(([date, stats]) => ({
      date,
      passRate: stats.total > 0 ? (stats.pass / stats.total * 100).toFixed(1) : 0
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
  
  // 最多显示最近10天数据
  const recentData = sortedData.slice(-10)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: recentData.map(item => item.date),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '合格率',
        type: 'line',
        data: recentData.map(item => parseFloat(item.passRate)),
        markLine: {
          data: [
            {
              name: '目标线',
              yAxis: 90,
              lineStyle: {
                color: '#67C23A'
              },
              label: {
                formatter: '目标: 90%',
                position: 'start'
              }
            }
          ]
        },
        itemStyle: {
          color: '#409EFF'
        },
        lineStyle: {
          width: 3
        },
        symbol: 'circle',
        symbolSize: 8
      }
    ]
  }
  
  passRateChart.setOption(option)
}

// 窗口大小变化时重置图表
function handleResize() {
  riskDistributionChart && riskDistributionChart.resize()
  passRateChart && passRateChart.resize()
}

function goToPage(path) {
  router.push(path)
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  riskDistributionChart && riskDistributionChart.dispose()
  passRateChart && passRateChart.dispose()
})
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-card {
  margin-bottom: 24px;
  text-align: center;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 24px;
  color: #409EFF;
}

.welcome-content {
  padding: 20px 0;
}

.system-intro {
  font-size: 16px;
  line-height: 1.6;
  color: #606266;
}

.architecture-btn {
  margin-top: 16px;
}

/* 数据仪表盘样式 */
.dashboard-row {
  margin-bottom: 24px;
}

.dashboard-content {
  padding: 10px 0;
}

.data-card {
  display: flex;
  padding: 16px;
  border-radius: 8px;
  background-color: #f5f7fa;
  transition: all 0.3s;
}

.data-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.data-icon {
  font-size: 40px;
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  color: white;
}

.factory-icon {
  background-color: #409EFF;
}

.lab-icon {
  background-color: #67C23A;
}

.online-icon {
  background-color: #E6A23C;
}

.risk-icon {
  background-color: #F56C6C;
}

.data-info {
  flex: 1;
}

.data-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.data-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.data-desc {
  font-size: 12px;
  color: #606266;
}

.data-label {
  margin-right: 5px;
}

.data-metric {
  font-weight: bold;
}

.feature-row {
  margin-bottom: 24px;
}

.feature-card {
  height: 150px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  font-size: 36px;
  color: #409EFF;
}

.feature-info {
  text-align: center;
}

.feature-info h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
  margin-bottom: 5px;
}

.feature-info p {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.feature-action {
  display: flex;
  justify-content: center;
  margin-top: auto;
  padding-top: 10px;
}

.chart-row {
  margin-bottom: 24px;
}

.chart-content {
  padding: 10px 0;
}

.recommendation-content {
  padding: 10px 0;
}
</style> 