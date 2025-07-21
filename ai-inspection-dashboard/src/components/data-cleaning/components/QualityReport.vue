<template>
  <div class="quality-report">
    <!-- 质量概览 -->
    <div class="quality-overview">
      <div class="overview-cards">
        <div class="quality-card overall">
          <div class="card-header">
            <h3>总体质量评分</h3>
            <div class="score-circle">
              <div class="score-value">{{ cleaningResult.qualityReport.overallScore }}%</div>
            </div>
          </div>
          <div class="score-bar">
            <el-progress
              :percentage="cleaningResult.qualityReport.overallScore"
              :color="getScoreColor(cleaningResult.qualityReport.overallScore)"
              :stroke-width="8"
            />
          </div>
        </div>

        <div class="quality-card">
          <div class="card-icon">📊</div>
          <div class="card-content">
            <div class="metric-value">{{ cleaningResult.qualityReport.completeness }}%</div>
            <div class="metric-label">完整性</div>
            <div class="metric-bar">
              <div 
                class="metric-fill" 
                :style="{ width: cleaningResult.qualityReport.completeness + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <div class="quality-card">
          <div class="card-icon">🎯</div>
          <div class="card-content">
            <div class="metric-value">{{ cleaningResult.qualityReport.accuracy }}%</div>
            <div class="metric-label">准确性</div>
            <div class="metric-bar">
              <div 
                class="metric-fill" 
                :style="{ width: cleaningResult.qualityReport.accuracy + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <div class="quality-card">
          <div class="card-icon">🔄</div>
          <div class="card-content">
            <div class="metric-value">{{ cleaningResult.qualityReport.consistency }}%</div>
            <div class="metric-label">一致性</div>
            <div class="metric-bar">
              <div 
                class="metric-fill" 
                :style="{ width: cleaningResult.qualityReport.consistency + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 质量详情 -->
    <div class="quality-details">
      <el-row :gutter="20">
        <!-- 问题分布 -->
        <el-col :span="12">
          <el-card class="detail-card">
            <template #header>
              <div class="card-title">
                <el-icon><Warning /></el-icon>
                <span>问题分布</span>
              </div>
            </template>
            
            <div class="issues-chart">
              <div v-if="issueStats.length > 0" class="issues-list">
                <div v-for="issue in issueStats" :key="issue.type" class="issue-item">
                  <div class="issue-info">
                    <span class="issue-type">{{ issue.type }}</span>
                    <span class="issue-count">{{ issue.count }} 个</span>
                  </div>
                  <div class="issue-bar">
                    <div 
                      class="issue-fill" 
                      :style="{ 
                        width: (issue.count / maxIssueCount * 100) + '%',
                        backgroundColor: getIssueColor(issue.severity)
                      }"
                    ></div>
                  </div>
                </div>
              </div>
              <div v-else class="no-issues">
                <el-icon><SuccessFilled /></el-icon>
                <span>未发现质量问题</span>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 改进建议 -->
        <el-col :span="12">
          <el-card class="detail-card">
            <template #header>
              <div class="card-title">
                <el-icon><InfoFilled /></el-icon>
                <span>改进建议</span>
              </div>
            </template>
            
            <div class="suggestions-list">
              <div v-if="suggestions.length > 0">
                <div v-for="(suggestion, index) in suggestions" :key="index" class="suggestion-item">
                  <div class="suggestion-priority">
                    <el-tag :type="getPriorityType(suggestion.priority)" size="small">
                      {{ suggestion.priority }}
                    </el-tag>
                  </div>
                  <div class="suggestion-content">
                    <div class="suggestion-title">{{ suggestion.title }}</div>
                    <div class="suggestion-desc">{{ suggestion.description }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="no-suggestions">
                <span>暂无改进建议</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 质量趋势 -->
    <div class="quality-trends">
      <el-card class="trend-card">
        <template #header>
          <div class="card-title">
            <el-icon><DataAnalysis /></el-icon>
            <span>质量趋势分析</span>
          </div>
        </template>
        
        <div class="trend-content">
          <div class="trend-summary">
            <div class="trend-item">
              <span class="trend-label">质量改进:</span>
              <span class="trend-value positive">+{{ qualityImprovement }}%</span>
            </div>
            <div class="trend-item">
              <span class="trend-label">数据完整性:</span>
              <span class="trend-value">{{ cleaningResult.qualityReport.completeness }}%</span>
            </div>
            <div class="trend-item">
              <span class="trend-label">处理效率:</span>
              <span class="trend-value">{{ processingEfficiency }}%</span>
            </div>
          </div>
          
          <div class="trend-chart">
            <div class="chart-placeholder">
              <div class="chart-bars">
                <div v-for="(value, index) in trendData" :key="index" class="chart-bar">
                  <div 
                    class="bar-fill" 
                    :style="{ height: value + '%' }"
                  ></div>
                  <div class="bar-label">{{ index + 1 }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 导出操作 -->
    <div class="export-actions">
      <el-button type="primary" @click="exportReport">
        <el-icon><Download /></el-icon>
        导出质量报告
      </el-button>
      <el-button @click="printReport">
        <el-icon><Printer /></el-icon>
        打印报告
      </el-button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Warning,
  InfoFilled,
  DataAnalysis,
  SuccessFilled,
  Download,
  Printer
} from '@element-plus/icons-vue'

export default {
  name: 'QualityReport',
  components: {
    Warning,
    InfoFilled,
    DataAnalysis,
    SuccessFilled,
    Download,
    Printer
  },
  props: {
    cleaningResult: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    // 模拟问题统计数据
    const issueStats = ref([
      { type: '数据缺失', count: 12, severity: 'high' },
      { type: '格式错误', count: 8, severity: 'medium' },
      { type: '重复数据', count: 5, severity: 'low' },
      { type: '异常值', count: 3, severity: 'medium' }
    ])

    // 模拟改进建议
    const suggestions = ref([
      {
        priority: '高',
        title: '补充缺失字段',
        description: '建议完善物料编码和供应商信息的录入规范'
      },
      {
        priority: '中',
        title: '统一数据格式',
        description: '建议制定统一的日期和数值格式标准'
      },
      {
        priority: '低',
        title: '优化数据录入',
        description: '建议增加数据录入时的实时验证功能'
      }
    ])

    // 模拟趋势数据
    const trendData = ref([65, 72, 78, 85, 92])

    // 计算属性
    const maxIssueCount = computed(() => {
      return Math.max(...issueStats.value.map(issue => issue.count))
    })

    const qualityImprovement = computed(() => {
      return props.cleaningResult.overview?.qualityImprovement || 15.2
    })

    const processingEfficiency = computed(() => {
      const totalTime = props.cleaningResult.stats.processingTime
      const recordCount = props.cleaningResult.stats.cleanedCount
      // 假设理想处理速度是每秒100条记录
      const idealTime = recordCount / 100
      return Math.min(100, Math.round((idealTime / totalTime) * 100))
    })

    // 方法
    const getScoreColor = (score) => {
      if (score >= 90) return '#67c23a'
      if (score >= 70) return '#e6a23c'
      return '#f56c6c'
    }

    const getIssueColor = (severity) => {
      const colors = {
        high: '#f56c6c',
        medium: '#e6a23c',
        low: '#67c23a'
      }
      return colors[severity] || '#909399'
    }

    const getPriorityType = (priority) => {
      const types = {
        '高': 'danger',
        '中': 'warning',
        '低': 'success'
      }
      return types[priority] || 'info'
    }

    const exportReport = () => {
      // 模拟导出功能
      const reportData = {
        timestamp: new Date().toISOString(),
        qualityScore: props.cleaningResult.qualityReport.overallScore,
        metrics: {
          completeness: props.cleaningResult.qualityReport.completeness,
          accuracy: props.cleaningResult.qualityReport.accuracy,
          consistency: props.cleaningResult.qualityReport.consistency
        },
        issues: issueStats.value,
        suggestions: suggestions.value,
        improvement: qualityImprovement.value
      }
      
      const dataStr = JSON.stringify(reportData, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'quality_report.json'
      link.click()
      URL.revokeObjectURL(url)
      
      ElMessage.success('质量报告导出成功')
    }

    const printReport = () => {
      window.print()
      ElMessage.success('正在打印质量报告')
    }

    return {
      issueStats,
      suggestions,
      trendData,
      maxIssueCount,
      qualityImprovement,
      processingEfficiency,
      getScoreColor,
      getIssueColor,
      getPriorityType,
      exportReport,
      printReport
    }
  }
}
</script>

<style scoped>
.quality-report {
  padding: 20px 0;
}

.quality-overview {
  margin-bottom: 30px;
}

.overview-cards {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 20px;
}

.quality-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e4e7ed;
}

.quality-card.overall {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.score-circle {
  width: 60px;
  height: 60px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-value {
  font-size: 18px;
  font-weight: 700;
}

.score-bar {
  margin-top: 10px;
}

.card-icon {
  font-size: 24px;
  text-align: center;
  margin-bottom: 10px;
}

.card-content {
  text-align: center;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 5px;
}

.metric-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 10px;
}

.metric-bar {
  height: 6px;
  background-color: #f0f2f5;
  border-radius: 3px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  background: linear-gradient(90deg, #409eff, #67c23a);
  transition: width 0.3s ease;
}

.quality-details {
  margin-bottom: 30px;
}

.detail-card {
  height: 100%;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.issues-chart {
  padding: 10px 0;
}

.issues-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.issue-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.issue-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.issue-type {
  font-weight: 500;
  color: #2c3e50;
}

.issue-count {
  font-size: 12px;
  color: #909399;
}

.issue-bar {
  height: 8px;
  background-color: #f0f2f5;
  border-radius: 4px;
  overflow: hidden;
}

.issue-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.no-issues {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px;
  color: #67c23a;
  font-size: 14px;
}

.suggestions-list {
  padding: 10px 0;
}

.suggestion-item {
  display: flex;
  gap: 12px;
  padding: 15px 0;
  border-bottom: 1px solid #f0f2f5;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-priority {
  flex-shrink: 0;
}

.suggestion-content {
  flex: 1;
}

.suggestion-title {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
}

.suggestion-desc {
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
}

.no-suggestions {
  text-align: center;
  padding: 40px;
  color: #909399;
  font-size: 14px;
}

.quality-trends {
  margin-bottom: 30px;
}

.trend-content {
  padding: 20px 0;
}

.trend-summary {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
}

.trend-item {
  text-align: center;
}

.trend-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.trend-value {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.trend-value.positive {
  color: #67c23a;
}

.trend-chart {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  width: 100%;
  height: 150px;
  background-color: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: end;
  justify-content: center;
  padding: 20px;
}

.chart-bars {
  display: flex;
  gap: 20px;
  align-items: end;
  height: 100%;
}

.chart-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.bar-fill {
  width: 30px;
  background: linear-gradient(180deg, #409eff, #67c23a);
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
  margin-bottom: 8px;
}

.bar-label {
  font-size: 12px;
  color: #909399;
}

.export-actions {
  text-align: center;
  padding: 20px 0;
}

.export-actions .el-button {
  margin: 0 10px;
}

@media (max-width: 768px) {
  .overview-cards {
    grid-template-columns: 1fr;
  }
  
  .trend-summary {
    flex-direction: column;
    gap: 15px;
  }
  
  .chart-bars {
    gap: 10px;
  }
}
</style>
