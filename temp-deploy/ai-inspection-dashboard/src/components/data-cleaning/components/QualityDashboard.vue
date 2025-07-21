<template>
  <div class="quality-dashboard">
    <!-- 仪表板头部 -->
    <div class="dashboard-header">
      <div class="header-info">
        <h3>数据质量监控仪表板</h3>
        <p>实时监控数据质量指标，提供全面的质量分析和趋势预测</p>
      </div>
      <div class="header-controls">
        <el-select v-model="timeRange" size="small" style="width: 120px">
          <el-option label="今天" value="today" />
          <el-option label="本周" value="week" />
          <el-option label="本月" value="month" />
          <el-option label="本季度" value="quarter" />
        </el-select>
        <el-button size="small" @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button size="small" @click="exportReport">
          <el-icon><Download /></el-icon>
          导出报告
        </el-button>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="metrics-cards">
      <div class="metric-card overall-score">
        <div class="card-header">
          <div class="card-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="card-title">
            <h4>总体质量评分</h4>
            <span class="card-subtitle">综合质量指标</span>
          </div>
        </div>
        <div class="card-content">
          <div class="score-display">
            <div class="score-value">{{ overallScore }}</div>
            <div class="score-unit">分</div>
          </div>
          <div class="score-trend">
            <el-icon :class="trendIcon"><component :is="trendIcon" /></el-icon>
            <span :class="trendClass">{{ trendText }}</span>
          </div>
        </div>
        <div class="card-progress">
          <el-progress
            :percentage="overallScore"
            :color="getScoreColor(overallScore)"
            :stroke-width="8"
            :show-text="false"
          />
        </div>
      </div>

      <div class="metric-card">
        <div class="card-header">
          <div class="card-icon completeness">
            <el-icon><PieChart /></el-icon>
          </div>
          <div class="card-title">
            <h4>数据完整性</h4>
            <span class="card-subtitle">字段完整度</span>
          </div>
        </div>
        <div class="card-content">
          <div class="metric-value">{{ completenessScore }}%</div>
          <div class="metric-change positive">+2.3%</div>
        </div>
      </div>

      <div class="metric-card">
        <div class="card-header">
          <div class="card-icon accuracy">
            <el-icon><Aim /></el-icon>
          </div>
          <div class="card-title">
            <h4>数据准确性</h4>
            <span class="card-subtitle">格式准确度</span>
          </div>
        </div>
        <div class="card-content">
          <div class="metric-value">{{ accuracyScore }}%</div>
          <div class="metric-change positive">+1.8%</div>
        </div>
      </div>

      <div class="metric-card">
        <div class="card-header">
          <div class="card-icon consistency">
            <el-icon><Connection /></el-icon>
          </div>
          <div class="card-title">
            <h4>数据一致性</h4>
            <span class="card-subtitle">标准一致度</span>
          </div>
        </div>
        <div class="card-content">
          <div class="metric-value">{{ consistencyScore }}%</div>
          <div class="metric-change negative">-0.5%</div>
        </div>
      </div>

      <div class="metric-card">
        <div class="card-header">
          <div class="card-icon timeliness">
            <el-icon><Timer /></el-icon>
          </div>
          <div class="card-title">
            <h4>数据时效性</h4>
            <span class="card-subtitle">更新及时度</span>
          </div>
        </div>
        <div class="card-content">
          <div class="metric-value">{{ timelinessScore }}%</div>
          <div class="metric-change positive">+3.2%</div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <!-- 质量趋势图 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>质量趋势分析</span>
                <el-button type="text" size="small" @click="toggleChartType">
                  切换视图
                </el-button>
              </div>
            </template>
            <div class="chart-container">
              <div class="trend-chart">
                <div class="chart-legend">
                  <div class="legend-item">
                    <div class="legend-color completeness"></div>
                    <span>完整性</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color accuracy"></div>
                    <span>准确性</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color consistency"></div>
                    <span>一致性</span>
                  </div>
                </div>
                <div class="chart-area">
                  <div class="chart-placeholder">
                    <div class="chart-lines">
                      <div v-for="(point, index) in trendData" :key="index" class="data-point">
                        <div class="point-date">{{ point.date }}</div>
                        <div class="point-values">
                          <div class="value-bar completeness" :style="{ height: point.completeness + '%' }"></div>
                          <div class="value-bar accuracy" :style="{ height: point.accuracy + '%' }"></div>
                          <div class="value-bar consistency" :style="{ height: point.consistency + '%' }"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 问题分布图 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>问题分布统计</span>
                <el-button type="text" size="small" @click="viewIssueDetails">
                  查看详情
                </el-button>
              </div>
            </template>
            <div class="chart-container">
              <div class="issue-distribution">
                <div class="distribution-chart">
                  <div v-for="issue in issueDistribution" :key="issue.type" class="issue-item">
                    <div class="issue-info">
                      <div class="issue-icon" :class="issue.severity">
                        <el-icon><Warning /></el-icon>
                      </div>
                      <div class="issue-details">
                        <div class="issue-type">{{ issue.type }}</div>
                        <div class="issue-count">{{ issue.count }} 个问题</div>
                      </div>
                    </div>
                    <div class="issue-bar">
                      <div 
                        class="issue-fill" 
                        :class="issue.severity"
                        :style="{ width: (issue.count / maxIssueCount * 100) + '%' }"
                      ></div>
                    </div>
                    <div class="issue-percentage">{{ Math.round(issue.count / totalIssues * 100) }}%</div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 详细统计 -->
    <div class="statistics-section">
      <el-row :gutter="20">
        <!-- 处理统计 -->
        <el-col :span="8">
          <el-card class="stats-card">
            <template #header>
              <span>处理统计</span>
            </template>
            <div class="stats-content">
              <div class="stat-row">
                <span class="stat-label">今日处理文件:</span>
                <span class="stat-value">{{ todayProcessed }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">本周处理文件:</span>
                <span class="stat-value">{{ weekProcessed }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">平均处理时间:</span>
                <span class="stat-value">{{ avgProcessingTime }}s</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">成功率:</span>
                <span class="stat-value success">{{ successRate }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 规则统计 -->
        <el-col :span="8">
          <el-card class="stats-card">
            <template #header>
              <span>规则统计</span>
            </template>
            <div class="stats-content">
              <div class="stat-row">
                <span class="stat-label">活跃规则数:</span>
                <span class="stat-value">{{ activeRules }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">自定义规则:</span>
                <span class="stat-value">{{ customRules }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">规则执行次数:</span>
                <span class="stat-value">{{ ruleExecutions }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">规则成功率:</span>
                <span class="stat-value success">{{ ruleSuccessRate }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 质量改进 -->
        <el-col :span="8">
          <el-card class="stats-card">
            <template #header>
              <span>质量改进</span>
            </template>
            <div class="stats-content">
              <div class="stat-row">
                <span class="stat-label">质量提升:</span>
                <span class="stat-value improvement">+{{ qualityImprovement }}%</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">错误减少:</span>
                <span class="stat-value improvement">-{{ errorReduction }}%</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">效率提升:</span>
                <span class="stat-value improvement">+{{ efficiencyGain }}%</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">用户满意度:</span>
                <span class="stat-value success">{{ userSatisfaction }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 最近活动 -->
    <div class="activity-section">
      <el-card class="activity-card">
        <template #header>
          <div class="activity-header">
            <span>最近活动</span>
            <el-button type="text" size="small" @click="viewAllActivities">
              查看全部
            </el-button>
          </div>
        </template>
        <div class="activity-list">
          <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
            <div class="activity-icon" :class="activity.type">
              <el-icon><component :is="getActivityIcon(activity.type)" /></el-icon>
            </div>
            <div class="activity-content">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-description">{{ activity.description }}</div>
              <div class="activity-time">{{ formatTime(activity.time) }}</div>
            </div>
            <div class="activity-status">
              <el-tag :type="getStatusType(activity.status)" size="small">
                {{ activity.status }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Refresh,
  Download,
  TrendCharts,
  PieChart,
  Aim,
  Connection,
  Timer,
  Warning,
  SuccessFilled,
  InfoFilled,
  CircleClose
} from '@element-plus/icons-vue'

export default {
  name: 'QualityDashboard',
  components: {
    Refresh,
    Download,
    TrendCharts,
    PieChart,
    Aim,
    Connection,
    Timer,
    Warning,
    SuccessFilled,
    InfoFilled,
    CircleClose
  },
  setup() {
    // 响应式数据
    const timeRange = ref('week')
    const overallScore = ref(87)
    const completenessScore = ref(92)
    const accuracyScore = ref(89)
    const consistencyScore = ref(85)
    const timelinessScore = ref(91)

    // 统计数据
    const todayProcessed = ref(156)
    const weekProcessed = ref(1247)
    const avgProcessingTime = ref(8.5)
    const successRate = ref(96.8)
    const activeRules = ref(24)
    const customRules = ref(8)
    const ruleExecutions = ref(15420)
    const ruleSuccessRate = ref(98.2)
    const qualityImprovement = ref(15.3)
    const errorReduction = ref(23.7)
    const efficiencyGain = ref(31.2)
    const userSatisfaction = ref(94.5)

    // 趋势数据
    const trendData = ref([
      { date: '周一', completeness: 88, accuracy: 85, consistency: 82 },
      { date: '周二', completeness: 90, accuracy: 87, consistency: 84 },
      { date: '周三', completeness: 89, accuracy: 88, consistency: 83 },
      { date: '周四', completeness: 91, accuracy: 89, consistency: 85 },
      { date: '周五', completeness: 92, accuracy: 89, consistency: 85 },
      { date: '周六', completeness: 93, accuracy: 90, consistency: 86 },
      { date: '周日', completeness: 92, accuracy: 89, consistency: 85 }
    ])

    // 问题分布数据
    const issueDistribution = ref([
      { type: '数据缺失', count: 45, severity: 'high' },
      { type: '格式错误', count: 32, severity: 'medium' },
      { type: '重复数据', count: 28, severity: 'low' },
      { type: '异常值', count: 15, severity: 'medium' },
      { type: '编码错误', count: 12, severity: 'high' }
    ])

    // 最近活动
    const recentActivities = ref([
      {
        id: 1,
        type: 'success',
        title: '8D报告处理完成',
        description: '成功处理质量问题分析报告，提取关键信息',
        time: new Date(Date.now() - 5 * 60 * 1000),
        status: '成功'
      },
      {
        id: 2,
        type: 'warning',
        title: '数据清洗规则更新',
        description: '术语标准化规则已更新，影响3个数据源',
        time: new Date(Date.now() - 15 * 60 * 1000),
        status: '警告'
      },
      {
        id: 3,
        type: 'info',
        title: '质量报告生成',
        description: '本周数据质量报告已生成，总体评分87分',
        time: new Date(Date.now() - 30 * 60 * 1000),
        status: '信息'
      },
      {
        id: 4,
        type: 'error',
        title: '文件解析失败',
        description: '图像文档OCR识别失败，建议检查文件质量',
        time: new Date(Date.now() - 45 * 60 * 1000),
        status: '失败'
      }
    ])

    // 计算属性
    const trendIcon = computed(() => {
      return overallScore.value > 85 ? 'ArrowUp' : 'ArrowDown'
    })

    const trendClass = computed(() => {
      return overallScore.value > 85 ? 'trend-up' : 'trend-down'
    })

    const trendText = computed(() => {
      return overallScore.value > 85 ? '较上周 +2.3%' : '较上周 -1.2%'
    })

    const maxIssueCount = computed(() => {
      return Math.max(...issueDistribution.value.map(issue => issue.count))
    })

    const totalIssues = computed(() => {
      return issueDistribution.value.reduce((sum, issue) => sum + issue.count, 0)
    })

    // 方法
    const getScoreColor = (score) => {
      if (score >= 90) return '#67c23a'
      if (score >= 80) return '#e6a23c'
      if (score >= 70) return '#f56c6c'
      return '#909399'
    }

    const getActivityIcon = (type) => {
      const icons = {
        success: 'SuccessFilled',
        warning: 'Warning',
        info: 'InfoFilled',
        error: 'CircleClose'
      }
      return icons[type] || 'InfoFilled'
    }

    const getStatusType = (status) => {
      const types = {
        '成功': 'success',
        '警告': 'warning',
        '信息': 'info',
        '失败': 'danger'
      }
      return types[status] || 'info'
    }

    const formatTime = (time) => {
      const now = new Date()
      const diff = now - time
      const minutes = Math.floor(diff / (1000 * 60))
      
      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`
      
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours}小时前`
      
      const days = Math.floor(hours / 24)
      return `${days}天前`
    }

    const refreshData = () => {
      ElMessage.success('数据已刷新')
      // 这里可以实现数据刷新逻辑
    }

    const exportReport = () => {
      ElMessage.success('正在导出质量报告...')
      // 这里可以实现报告导出逻辑
    }

    const toggleChartType = () => {
      ElMessage.info('切换图表视图')
      // 这里可以实现图表类型切换
    }

    const viewIssueDetails = () => {
      ElMessage.info('查看问题详情')
      // 这里可以实现问题详情查看
    }

    const viewAllActivities = () => {
      ElMessage.info('查看全部活动')
      // 这里可以实现活动列表查看
    }

    // 生命周期
    onMounted(() => {
      // 初始化数据
      refreshData()
    })

    return {
      timeRange,
      overallScore,
      completenessScore,
      accuracyScore,
      consistencyScore,
      timelinessScore,
      todayProcessed,
      weekProcessed,
      avgProcessingTime,
      successRate,
      activeRules,
      customRules,
      ruleExecutions,
      ruleSuccessRate,
      qualityImprovement,
      errorReduction,
      efficiencyGain,
      userSatisfaction,
      trendData,
      issueDistribution,
      recentActivities,
      trendIcon,
      trendClass,
      trendText,
      maxIssueCount,
      totalIssues,
      getScoreColor,
      getActivityIcon,
      getStatusType,
      formatTime,
      refreshData,
      exportReport,
      toggleChartType,
      viewIssueDetails,
      viewAllActivities
    }
  }
}
</script>

<style scoped>
.quality-dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-info h3 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
}

.header-info p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.header-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.metrics-cards {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
}

.metric-card.overall-score {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.overall-score .card-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.card-icon.completeness {
  background: #e8f5e8;
  color: #67c23a;
}

.card-icon.accuracy {
  background: #fef0e6;
  color: #e6a23c;
}

.card-icon.consistency {
  background: #e6f7ff;
  color: #409eff;
}

.card-icon.timeliness {
  background: #f0f0ff;
  color: #722ed1;
}

.card-title h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.card-subtitle {
  font-size: 12px;
  opacity: 0.8;
}

.overall-score .card-subtitle {
  color: rgba(255, 255, 255, 0.8);
}

.card-content {
  margin-bottom: 15px;
}

.score-display {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
}

.score-value {
  font-size: 32px;
  font-weight: 700;
}

.score-unit {
  font-size: 14px;
  opacity: 0.8;
}

.score-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.trend-up {
  color: #67c23a;
}

.trend-down {
  color: #f56c6c;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.metric-change {
  font-size: 12px;
  font-weight: 500;
}

.metric-change.positive {
  color: #67c23a;
}

.metric-change.negative {
  color: #f56c6c;
}

.card-progress {
  margin-top: 10px;
}

.charts-section {
  margin-bottom: 30px;
}

.chart-card {
  height: 400px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 320px;
  padding: 10px 0;
}

.trend-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-legend {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.completeness {
  background-color: #67c23a;
}

.legend-color.accuracy {
  background-color: #e6a23c;
}

.legend-color.consistency {
  background-color: #409eff;
}

.chart-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  width: 100%;
  height: 200px;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.chart-lines {
  display: flex;
  justify-content: space-between;
  align-items: end;
  height: 100%;
  gap: 10px;
}

.data-point {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.point-date {
  font-size: 10px;
  color: #909399;
  margin-bottom: 8px;
}

.point-values {
  display: flex;
  gap: 2px;
  align-items: end;
  flex: 1;
}

.value-bar {
  width: 8px;
  border-radius: 2px;
  transition: height 0.3s ease;
}

.value-bar.completeness {
  background-color: #67c23a;
}

.value-bar.accuracy {
  background-color: #e6a23c;
}

.value-bar.consistency {
  background-color: #409eff;
}

.issue-distribution {
  height: 100%;
  padding: 20px 0;
}

.distribution-chart {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.issue-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.issue-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 120px;
}

.issue-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.issue-icon.high {
  background-color: #fef0f0;
  color: #f56c6c;
}

.issue-icon.medium {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.issue-icon.low {
  background-color: #f0f9ff;
  color: #409eff;
}

.issue-details {
  flex: 1;
}

.issue-type {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.issue-count {
  font-size: 12px;
  color: #909399;
}

.issue-bar {
  flex: 1;
  height: 8px;
  background-color: #f0f2f5;
  border-radius: 4px;
  overflow: hidden;
}

.issue-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.issue-fill.high {
  background-color: #f56c6c;
}

.issue-fill.medium {
  background-color: #e6a23c;
}

.issue-fill.low {
  background-color: #409eff;
}

.issue-percentage {
  min-width: 40px;
  text-align: right;
  font-size: 12px;
  color: #606266;
}

.statistics-section {
  margin-bottom: 30px;
}

.stats-card {
  height: 200px;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f2f5;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.stat-value.success {
  color: #67c23a;
}

.stat-value.improvement {
  color: #409eff;
}

.activity-section {
  margin-bottom: 30px;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid #f0f2f5;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.activity-icon.success {
  background-color: #f0f9ff;
  color: #67c23a;
}

.activity-icon.warning {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.activity-icon.info {
  background-color: #e6f7ff;
  color: #409eff;
}

.activity-icon.error {
  background-color: #fef0f0;
  color: #f56c6c;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
}

.activity-description {
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 11px;
  color: #909399;
}

.activity-status {
  flex-shrink: 0;
}

@media (max-width: 1200px) {
  .metrics-cards {
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }

  .metric-card.overall-score {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .header-controls {
    justify-content: space-between;
  }

  .metrics-cards {
    grid-template-columns: 1fr;
  }

  .chart-lines {
    gap: 5px;
  }

  .issue-item {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .activity-item {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
