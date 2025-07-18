<template>
  <div class="quality-report">
    <!-- 质量概览 -->
    <div class="quality-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="quality-metric">
            <div class="metric-value" :class="getScoreClass(overallScore)">
              {{ overallScore }}
            </div>
            <div class="metric-label">总体质量分</div>
            <div class="metric-trend">
              <el-icon v-if="scoreTrend > 0" class="trend-up"><ArrowUp /></el-icon>
              <el-icon v-else-if="scoreTrend < 0" class="trend-down"><ArrowDown /></el-icon>
              <span>{{ Math.abs(scoreTrend) }}%</span>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="quality-metric">
            <div class="metric-value">{{ completenessScore }}%</div>
            <div class="metric-label">完整性</div>
            <el-progress :percentage="completenessScore" :show-text="false" />
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="quality-metric">
            <div class="metric-value">{{ accuracyScore }}%</div>
            <div class="metric-label">准确性</div>
            <el-progress :percentage="accuracyScore" :show-text="false" />
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="quality-metric">
            <div class="metric-value">{{ consistencyScore }}%</div>
            <div class="metric-label">一致性</div>
            <el-progress :percentage="consistencyScore" :show-text="false" />
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 质量维度分析 -->
    <div class="quality-dimensions">
      <el-card title="质量维度分析">
        <div class="dimensions-grid">
          <div
            v-for="dimension in qualityDimensions"
            :key="dimension.name"
            class="dimension-item"
          >
            <div class="dimension-header">
              <span class="dimension-name">{{ dimension.name }}</span>
              <el-tag :type="getDimensionTag(dimension.score)">
                {{ getDimensionLevel(dimension.score) }}
              </el-tag>
            </div>
            
            <div class="dimension-score">
              <el-progress
                :percentage="dimension.score"
                :color="getDimensionColor(dimension.score)"
                :show-text="false"
              />
              <span class="score-text">{{ dimension.score }}%</span>
            </div>
            
            <div class="dimension-details">
              <div class="detail-item">
                <span class="detail-label">检查项:</span>
                <span class="detail-value">{{ dimension.checks }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">通过率:</span>
                <span class="detail-value">{{ dimension.passRate }}%</span>
              </div>
            </div>
            
            <div v-if="dimension.issues.length > 0" class="dimension-issues">
              <el-collapse>
                <el-collapse-item title="发现的问题" :name="dimension.name">
                  <div
                    v-for="issue in dimension.issues"
                    :key="issue.id"
                    class="issue-item"
                  >
                    <el-alert
                      :title="issue.title"
                      :description="issue.description"
                      :type="getIssueType(issue.severity)"
                      :closable="false"
                      show-icon
                    />
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 数据质量趋势 -->
    <div class="quality-trends">
      <el-card title="数据质量趋势">
        <div class="trend-chart">
          <div class="chart-placeholder">
            <el-icon class="chart-icon"><TrendCharts /></el-icon>
            <p>质量趋势图表</p>
            <p class="chart-note">显示数据质量随时间的变化趋势</p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 问题分布 -->
    <div class="issue-distribution">
      <el-card title="问题分布分析">
        <div class="distribution-content">
          <div class="distribution-chart">
            <div class="chart-container">
              <div
                v-for="category in issueCategories"
                :key="category.name"
                class="category-bar"
              >
                <div class="category-info">
                  <span class="category-name">{{ category.name }}</span>
                  <span class="category-count">{{ category.count }}个</span>
                </div>
                <div class="category-progress">
                  <div
                    class="progress-bar"
                    :style="{
                      width: `${category.percentage}%`,
                      backgroundColor: category.color
                    }"
                  ></div>
                </div>
                <span class="category-percentage">{{ category.percentage }}%</span>
              </div>
            </div>
          </div>
          
          <div class="distribution-summary">
            <h4>问题汇总</h4>
            <div class="summary-stats">
              <div class="stat-item">
                <span class="stat-label">总问题数:</span>
                <span class="stat-value">{{ totalIssues }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">严重问题:</span>
                <span class="stat-value critical">{{ criticalIssues }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">一般问题:</span>
                <span class="stat-value warning">{{ warningIssues }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">轻微问题:</span>
                <span class="stat-value info">{{ infoIssues }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 改进建议 -->
    <div class="improvement-suggestions">
      <el-card title="改进建议">
        <div class="suggestions-list">
          <div
            v-for="suggestion in suggestions"
            :key="suggestion.id"
            class="suggestion-item"
          >
            <div class="suggestion-header">
              <el-icon class="suggestion-icon"><Lightbulb /></el-icon>
              <span class="suggestion-title">{{ suggestion.title }}</span>
              <el-tag :type="getPriorityTag(suggestion.priority)" size="small">
                {{ suggestion.priority }}
              </el-tag>
            </div>
            
            <div class="suggestion-content">
              <p class="suggestion-description">{{ suggestion.description }}</p>
              
              <div v-if="suggestion.actions.length > 0" class="suggestion-actions">
                <h5>建议措施:</h5>
                <ul class="action-list">
                  <li v-for="action in suggestion.actions" :key="action" class="action-item">
                    {{ action }}
                  </li>
                </ul>
              </div>
              
              <div class="suggestion-impact">
                <span class="impact-label">预期效果:</span>
                <span class="impact-value">{{ suggestion.expectedImpact }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 质量报告导出 -->
    <div class="report-actions">
      <el-button type="primary" @click="exportReport">
        <el-icon><Download /></el-icon>
        导出质量报告
      </el-button>
      <el-button @click="generateDetailedReport">
        生成详细报告
      </el-button>
      <el-button @click="scheduleReport">
        定期报告设置
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  ArrowUp, 
  ArrowDown, 
  TrendCharts, 
  Lightbulb, 
  Download 
} from '@element-plus/icons-vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})

// 响应式数据
const reportData = ref(props.data || {})

// 计算属性
const overallScore = computed(() => {
  return reportData.value.overallScore || 85
})

const scoreTrend = computed(() => {
  return reportData.value.scoreTrend || 5
})

const completenessScore = computed(() => {
  return reportData.value.completeness || 92
})

const accuracyScore = computed(() => {
  return reportData.value.accuracy || 88
})

const consistencyScore = computed(() => {
  return reportData.value.consistency || 75
})

const qualityDimensions = computed(() => {
  return reportData.value.dimensions || [
    {
      name: '数据完整性',
      score: 92,
      checks: 15,
      passRate: 87,
      issues: [
        {
          id: 1,
          title: '缺失必填字段',
          description: '发现3个记录缺少必填的"负责人"字段',
          severity: 'medium'
        }
      ]
    },
    {
      name: '数据准确性',
      score: 88,
      checks: 12,
      passRate: 92,
      issues: [
        {
          id: 2,
          title: '日期格式不一致',
          description: '部分日期使用了不同的格式',
          severity: 'low'
        }
      ]
    },
    {
      name: '数据一致性',
      score: 75,
      checks: 10,
      passRate: 80,
      issues: [
        {
          id: 3,
          title: '术语使用不统一',
          description: '同一概念使用了多种不同的表述',
          severity: 'medium'
        }
      ]
    },
    {
      name: '数据时效性',
      score: 95,
      checks: 8,
      passRate: 100,
      issues: []
    }
  ]
})

const issueCategories = computed(() => {
  return [
    { name: '格式问题', count: 15, percentage: 35, color: '#f56c6c' },
    { name: '缺失数据', count: 12, percentage: 28, color: '#e6a23c' },
    { name: '重复记录', count: 8, percentage: 19, color: '#409eff' },
    { name: '逻辑错误', count: 5, percentage: 12, color: '#67c23a' },
    { name: '其他问题', count: 3, percentage: 6, color: '#909399' }
  ]
})

const totalIssues = computed(() => {
  return issueCategories.value.reduce((sum, cat) => sum + cat.count, 0)
})

const criticalIssues = computed(() => {
  return reportData.value.criticalIssues || 3
})

const warningIssues = computed(() => {
  return reportData.value.warningIssues || 12
})

const infoIssues = computed(() => {
  return reportData.value.infoIssues || 28
})

const suggestions = computed(() => {
  return reportData.value.suggestions || [
    {
      id: 1,
      title: '建立数据录入规范',
      description: '制定统一的数据录入标准和格式要求，减少格式不一致问题',
      priority: '高优先级',
      actions: [
        '制定数据录入手册',
        '培训相关人员',
        '建立数据验证机制'
      ],
      expectedImpact: '预计可提升数据一致性20%'
    },
    {
      id: 2,
      title: '完善必填字段检查',
      description: '在数据录入时增加必填字段的强制检查',
      priority: '中优先级',
      actions: [
        '更新录入系统',
        '添加字段验证规则',
        '设置提醒机制'
      ],
      expectedImpact: '预计可减少缺失数据80%'
    },
    {
      id: 3,
      title: '定期数据质量审查',
      description: '建立定期的数据质量检查和清理机制',
      priority: '低优先级',
      actions: [
        '制定审查计划',
        '分配责任人员',
        '建立报告机制'
      ],
      expectedImpact: '持续保持数据质量水平'
    }
  ]
})

// 方法
const getScoreClass = (score) => {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 70) return 'fair'
  return 'poor'
}

const getDimensionTag = (score) => {
  if (score >= 90) return 'success'
  if (score >= 80) return 'warning'
  return 'danger'
}

const getDimensionLevel = (score) => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '一般'
  return '较差'
}

const getDimensionColor = (score) => {
  if (score >= 90) return '#67c23a'
  if (score >= 80) return '#e6a23c'
  return '#f56c6c'
}

const getIssueType = (severity) => {
  const typeMap = {
    high: 'error',
    medium: 'warning',
    low: 'info'
  }
  return typeMap[severity] || 'info'
}

const getPriorityTag = (priority) => {
  const tagMap = {
    '高优先级': 'danger',
    '中优先级': 'warning',
    '低优先级': 'info'
  }
  return tagMap[priority] || 'info'
}

const exportReport = () => {
  // 导出报告逻辑
  ElMessage.success('质量报告导出成功')
}

const generateDetailedReport = () => {
  // 生成详细报告逻辑
  ElMessage.info('正在生成详细报告...')
}

const scheduleReport = () => {
  // 定期报告设置逻辑
  ElMessage.info('报告设置功能开发中...')
}
</script>

<style scoped>
.quality-report {
  padding: 20px;
}

.quality-overview {
  margin-bottom: 30px;
}

.quality-metric {
  text-align: center;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.metric-value {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 8px;
}

.metric-value.excellent {
  color: #67c23a;
}

.metric-value.good {
  color: #409eff;
}

.metric-value.fair {
  color: #e6a23c;
}

.metric-value.poor {
  color: #f56c6c;
}

.metric-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.metric-trend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 12px;
}

.trend-up {
  color: #67c23a;
}

.trend-down {
  color: #f56c6c;
}

.quality-dimensions {
  margin-bottom: 30px;
}

.dimensions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.dimension-item {
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #fafafa;
}

.dimension-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.dimension-name {
  font-weight: 500;
  color: #2c3e50;
}

.dimension-score {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.score-text {
  font-weight: 500;
  color: #2c3e50;
}

.dimension-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.detail-item {
  font-size: 12px;
  color: #606266;
}

.detail-label {
  font-weight: 500;
}

.dimension-issues {
  margin-top: 15px;
}

.issue-item {
  margin-bottom: 10px;
}

.quality-trends {
  margin-bottom: 30px;
}

.trend-chart {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #909399;
}

.chart-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.chart-note {
  font-size: 12px;
  margin-top: 5px;
}

.issue-distribution {
  margin-bottom: 30px;
}

.distribution-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  margin-top: 20px;
}

.chart-container {
  space-y: 15px;
}

.category-bar {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.category-info {
  min-width: 120px;
  display: flex;
  justify-content: space-between;
}

.category-name {
  font-weight: 500;
  color: #2c3e50;
}

.category-count {
  color: #606266;
  font-size: 12px;
}

.category-progress {
  flex: 1;
  height: 20px;
  background-color: #f5f7fa;
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  transition: width 0.3s ease;
}

.category-percentage {
  min-width: 40px;
  text-align: right;
  font-size: 12px;
  color: #909399;
}

.distribution-summary h4 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.summary-stats {
  space-y: 10px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-label {
  color: #606266;
}

.stat-value {
  font-weight: 500;
}

.stat-value.critical {
  color: #f56c6c;
}

.stat-value.warning {
  color: #e6a23c;
}

.stat-value.info {
  color: #409eff;
}

.improvement-suggestions {
  margin-bottom: 30px;
}

.suggestions-list {
  margin-top: 20px;
  space-y: 20px;
}

.suggestion-item {
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #fafafa;
  margin-bottom: 20px;
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.suggestion-icon {
  color: #e6a23c;
}

.suggestion-title {
  font-weight: 500;
  color: #2c3e50;
  flex: 1;
}

.suggestion-content {
  margin-left: 30px;
}

.suggestion-description {
  color: #606266;
  margin-bottom: 15px;
  line-height: 1.6;
}

.suggestion-actions h5 {
  margin-bottom: 10px;
  color: #2c3e50;
}

.action-list {
  margin: 0;
  padding-left: 20px;
  margin-bottom: 15px;
}

.action-item {
  color: #606266;
  margin-bottom: 5px;
  line-height: 1.5;
}

.suggestion-impact {
  padding: 10px;
  background-color: #f0f9ff;
  border-radius: 6px;
  font-size: 12px;
}

.impact-label {
  font-weight: 500;
  color: #2c3e50;
}

.impact-value {
  color: #409eff;
}

.report-actions {
  text-align: center;
  padding: 20px;
  border-top: 1px solid #e4e7ed;
}

.report-actions .el-button {
  margin: 0 10px;
}
</style>
