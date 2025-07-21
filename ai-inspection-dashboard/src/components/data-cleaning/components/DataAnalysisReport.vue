<template>
  <div class="data-analysis-report">
    <!-- 分析概览 -->
    <div class="analysis-overview">
      <div class="overview-header">
        <h3>数据分析报告</h3>
        <div class="analysis-actions">
          <el-button size="small" @click="refreshAnalysis">
            <el-icon><Refresh /></el-icon>
            刷新分析
          </el-button>
          <el-button size="small" @click="exportReport">
            <el-icon><Download /></el-icon>
            导出报告
          </el-button>
        </div>
      </div>
      
      <!-- 统计摘要卡片 -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="card-icon">
            <el-icon><DataBoard /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ analysisData.statisticalSummary?.totalRecords || 0 }}</div>
            <div class="card-label">总记录数</div>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="card-icon">
            <el-icon><Grid /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ analysisData.statisticalSummary?.totalFields || 0 }}</div>
            <div class="card-label">字段数量</div>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="card-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ analysisData.statisticalSummary?.dataQualityScore || 0 }}%</div>
            <div class="card-label">数据质量</div>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="card-icon">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ analysisData.qualityIssues?.length || 0 }}</div>
            <div class="card-label">质量问题</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详细分析标签页 -->
    <div class="analysis-tabs">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 字段分析 -->
        <el-tab-pane label="字段分析" name="fields">
          <div class="fields-analysis">
            <div class="analysis-controls">
              <el-input
                v-model="fieldSearchText"
                placeholder="搜索字段..."
                style="width: 300px"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              
              <el-select v-model="fieldFilterType" placeholder="筛选类型" style="width: 150px">
                <el-option label="全部" value="" />
                <el-option label="有问题" value="issues" />
                <el-option label="缺失严重" value="missing" />
                <el-option label="重复较多" value="duplicate" />
              </el-select>
            </div>
            
            <div class="fields-table">
              <el-table :data="filteredFields" style="width: 100%" max-height="500">
                <el-table-column prop="fieldName" label="字段名称" width="150" fixed="left">
                  <template #default="{ row }">
                    <div class="field-name">
                      <span>{{ row.fieldName }}</span>
                      <el-tag v-if="row.issues.length > 0" type="warning" size="small">
                        {{ row.issues.length }}个问题
                      </el-tag>
                    </div>
                  </template>
                </el-table-column>
                
                <el-table-column prop="completenessRate" label="完整性" width="100">
                  <template #default="{ row }">
                    <div class="completeness-cell">
                      <el-progress
                        :percentage="row.completenessRate"
                        :color="getCompletenessColor(row.completenessRate)"
                        :stroke-width="6"
                        :show-text="false"
                      />
                      <span class="percentage-text">{{ row.completenessRate }}%</span>
                    </div>
                  </template>
                </el-table-column>
                
                <el-table-column prop="dataTypes" label="数据类型" width="120">
                  <template #default="{ row }">
                    <div class="data-types">
                      <el-tag
                        v-for="(count, type) in row.dataTypes"
                        :key="type"
                        v-show="count > 0"
                        size="small"
                        :type="getTypeTagType(type)"
                      >
                        {{ type }}({{ count }})
                      </el-tag>
                    </div>
                  </template>
                </el-table-column>
                
                <el-table-column prop="uniqueValues" label="唯一值" width="80" />
                
                <el-table-column prop="duplicateValues" label="重复情况" width="120">
                  <template #default="{ row }">
                    <div v-if="row.duplicateValues.length > 0" class="duplicate-info">
                      <el-popover placement="top" width="300" trigger="hover">
                        <template #reference>
                          <el-tag type="warning" size="small">
                            {{ row.duplicateValues.length }}个重复值
                          </el-tag>
                        </template>
                        <div class="duplicate-details">
                          <div v-for="dup in row.duplicateValues.slice(0, 5)" :key="dup.value" class="duplicate-item">
                            <span class="dup-value">{{ dup.value }}</span>
                            <span class="dup-count">{{ dup.count }}次</span>
                          </div>
                          <div v-if="row.duplicateValues.length > 5" class="more-duplicates">
                            还有 {{ row.duplicateValues.length - 5 }} 个...
                          </div>
                        </div>
                      </el-popover>
                    </div>
                    <span v-else class="no-duplicates">无重复</span>
                  </template>
                </el-table-column>
                
                <el-table-column prop="formatConsistency" label="格式一致性" width="120">
                  <template #default="{ row }">
                    <div class="format-consistency">
                      <el-progress
                        :percentage="row.formatConsistency.score"
                        :color="getConsistencyColor(row.formatConsistency.score)"
                        :stroke-width="6"
                        :show-text="false"
                      />
                      <span class="percentage-text">{{ row.formatConsistency.score }}%</span>
                    </div>
                  </template>
                </el-table-column>
                
                <el-table-column label="统计信息" width="150">
                  <template #default="{ row }">
                    <div v-if="row.statistics" class="statistics-info">
                      <div class="stat-item">
                        <span class="stat-label">均值:</span>
                        <span class="stat-value">{{ row.statistics.mean }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">范围:</span>
                        <span class="stat-value">{{ row.statistics.min }} - {{ row.statistics.max }}</span>
                      </div>
                    </div>
                    <span v-else class="no-stats">非数值字段</span>
                  </template>
                </el-table-column>
                
                <el-table-column label="操作" width="120" fixed="right">
                  <template #default="{ row }">
                    <el-button type="text" size="small" @click="viewFieldDetails(row)">
                      详情
                    </el-button>
                    <el-button type="text" size="small" @click="cleanField(row)">
                      清洗
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>

        <!-- 重复数据分析 -->
        <el-tab-pane label="重复数据" name="duplicates">
          <div class="duplicates-analysis">
            <div class="duplicate-summary">
              <div class="summary-item">
                <span class="summary-label">总记录数:</span>
                <span class="summary-value">{{ analysisData.duplicateAnalysis?.totalRecords || 0 }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">唯一记录:</span>
                <span class="summary-value">{{ analysisData.duplicateAnalysis?.uniqueRecords || 0 }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">重复记录:</span>
                <span class="summary-value warning">{{ analysisData.duplicateAnalysis?.duplicateRecords || 0 }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">重复组数:</span>
                <span class="summary-value">{{ analysisData.duplicateAnalysis?.duplicateGroups?.length || 0 }}</span>
              </div>
            </div>
            
            <!-- 重复记录组 -->
            <div v-if="analysisData.duplicateAnalysis?.duplicateGroups?.length > 0" class="duplicate-groups">
              <h4>重复记录组</h4>
              <div
                v-for="(group, index) in analysisData.duplicateAnalysis.duplicateGroups"
                :key="index"
                class="duplicate-group"
              >
                <div class="group-header">
                  <span class="group-title">重复组 {{ index + 1 }}</span>
                  <el-tag type="warning">{{ group.count }} 条记录</el-tag>
                  <el-tag type="info">相似度: {{ group.similarity }}%</el-tag>
                  <el-button type="text" size="small" @click="resolveDuplicateGroup(group)">
                    处理重复
                  </el-button>
                </div>
                
                <div class="group-records">
                  <div
                    v-for="(record, recordIndex) in group.records.slice(0, 3)"
                    :key="recordIndex"
                    class="duplicate-record"
                  >
                    <div class="record-index">记录 {{ record.index + 1 }}</div>
                    <div class="record-content">
                      <div
                        v-for="(value, key) in record.record"
                        :key="key"
                        class="record-field"
                      >
                        <span class="field-name">{{ key }}:</span>
                        <span class="field-value">{{ value }}</span>
                      </div>
                    </div>
                  </div>
                  <div v-if="group.records.length > 3" class="more-records">
                    还有 {{ group.records.length - 3 }} 条记录...
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 相似记录 -->
            <div v-if="analysisData.duplicateAnalysis?.similarRecords?.length > 0" class="similar-records">
              <h4>相似记录</h4>
              <div
                v-for="(group, index) in analysisData.duplicateAnalysis.similarRecords"
                :key="index"
                class="similar-group"
              >
                <div class="group-header">
                  <span class="group-title">相似组 {{ index + 1 }}</span>
                  <el-tag type="info">{{ group.count }} 条记录</el-tag>
                  <el-tag>相似度: {{ group.similarity }}%</el-tag>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 质量问题 -->
        <el-tab-pane label="质量问题" name="issues">
          <div class="quality-issues">
            <div class="issues-summary">
              <div class="severity-stats">
                <div class="severity-item high">
                  <div class="severity-count">{{ getIssuesBySeverity('high').length }}</div>
                  <div class="severity-label">严重问题</div>
                </div>
                <div class="severity-item medium">
                  <div class="severity-count">{{ getIssuesBySeverity('medium').length }}</div>
                  <div class="severity-label">中等问题</div>
                </div>
                <div class="severity-item low">
                  <div class="severity-count">{{ getIssuesBySeverity('low').length }}</div>
                  <div class="severity-label">轻微问题</div>
                </div>
              </div>
            </div>
            
            <div class="issues-list">
              <div
                v-for="(issue, index) in analysisData.qualityIssues"
                :key="index"
                class="issue-item"
                :class="issue.severity"
              >
                <div class="issue-icon">
                  <el-icon v-if="issue.severity === 'high'"><CircleCloseFilled /></el-icon>
                  <el-icon v-else-if="issue.severity === 'medium'"><WarningFilled /></el-icon>
                  <el-icon v-else><InfoFilled /></el-icon>
                </div>
                
                <div class="issue-content">
                  <div class="issue-title">{{ issue.message }}</div>
                  <div class="issue-details">
                    <span class="issue-type">类型: {{ getIssueTypeLabel(issue.type) }}</span>
                    <span v-if="issue.affectedRecords" class="affected-records">
                      影响记录: {{ issue.affectedRecords }}
                    </span>
                    <span v-if="issue.field" class="affected-field">
                      字段: {{ issue.field }}
                    </span>
                  </div>
                </div>
                
                <div class="issue-actions">
                  <el-button type="text" size="small" @click="viewIssueDetails(issue)">
                    详情
                  </el-button>
                  <el-button type="text" size="small" @click="fixIssue(issue)">
                    修复
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 建议措施 -->
        <el-tab-pane label="建议措施" name="recommendations">
          <div class="recommendations">
            <div
              v-for="(recommendation, index) in analysisData.recommendations"
              :key="index"
              class="recommendation-item"
            >
              <div class="recommendation-header">
                <div class="recommendation-title">{{ recommendation.title }}</div>
                <el-tag :type="getPriorityType(recommendation.priority)">
                  {{ recommendation.priority }}优先级
                </el-tag>
              </div>
              
              <div class="recommendation-content">
                <p>{{ recommendation.description }}</p>
                <div v-if="recommendation.steps" class="recommendation-steps">
                  <h5>建议步骤:</h5>
                  <ol>
                    <li v-for="step in recommendation.steps" :key="step">{{ step }}</li>
                  </ol>
                </div>
              </div>
              
              <div class="recommendation-actions">
                <el-button size="small" @click="applyRecommendation(recommendation)">
                  应用建议
                </el-button>
                <el-button size="small" type="text" @click="ignoreRecommendation(recommendation)">
                  忽略
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  Download,
  Search,
  DataBoard,
  Grid,
  TrendCharts,
  Warning,
  CircleCloseFilled,
  WarningFilled,
  InfoFilled
} from '@element-plus/icons-vue'

export default {
  name: 'DataAnalysisReport',
  components: {
    Refresh,
    Download,
    Search,
    DataBoard,
    Grid,
    TrendCharts,
    Warning,
    CircleCloseFilled,
    WarningFilled,
    InfoFilled
  },
  props: {
    analysisData: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['refresh', 'export', 'clean-field', 'fix-issue', 'apply-recommendation'],
  setup(props, { emit }) {
    // 响应式数据
    const activeTab = ref('fields')
    const fieldSearchText = ref('')
    const fieldFilterType = ref('')

    // 计算属性
    const filteredFields = computed(() => {
      if (!props.analysisData.fieldAnalysis) return []
      
      let fields = Object.entries(props.analysisData.fieldAnalysis).map(([fieldName, analysis]) => ({
        fieldName,
        ...analysis
      }))
      
      // 搜索过滤
      if (fieldSearchText.value) {
        const search = fieldSearchText.value.toLowerCase()
        fields = fields.filter(field => 
          field.fieldName.toLowerCase().includes(search)
        )
      }
      
      // 类型过滤
      if (fieldFilterType.value) {
        switch (fieldFilterType.value) {
          case 'issues':
            fields = fields.filter(field => field.qualityIssues.length > 0)
            break
          case 'missing':
            fields = fields.filter(field => field.completenessRate < 80)
            break
          case 'duplicate':
            fields = fields.filter(field => field.duplicateValues.length > 0)
            break
        }
      }
      
      return fields
    })

    // 方法
    const getCompletenessColor = (percentage) => {
      if (percentage >= 90) return '#67c23a'
      if (percentage >= 70) return '#e6a23c'
      return '#f56c6c'
    }

    const getConsistencyColor = (percentage) => {
      if (percentage >= 85) return '#67c23a'
      if (percentage >= 60) return '#e6a23c'
      return '#f56c6c'
    }

    const getTypeTagType = (type) => {
      const typeMap = {
        string: '',
        number: 'success',
        date: 'warning',
        boolean: 'info',
        email: 'primary',
        phone: 'primary',
        url: 'primary'
      }
      return typeMap[type] || ''
    }

    const getIssuesBySeverity = (severity) => {
      return (props.analysisData.qualityIssues || []).filter(issue => issue.severity === severity)
    }

    const getIssueTypeLabel = (type) => {
      const typeLabels = {
        high_missing_rate: '高缺失率',
        inconsistent_types: '类型不一致',
        unusual_length: '异常长度',
        incomplete_required_field: '必填字段不完整',
        incomplete_records: '记录不完整',
        inconsistent_terminology: '术语不一致'
      }
      return typeLabels[type] || type
    }

    const getPriorityType = (priority) => {
      const priorityTypes = {
        high: 'danger',
        medium: 'warning',
        low: 'info'
      }
      return priorityTypes[priority] || 'info'
    }

    const refreshAnalysis = () => {
      emit('refresh')
      ElMessage.success('分析已刷新')
    }

    const exportReport = () => {
      emit('export')
      ElMessage.success('报告导出中...')
    }

    const viewFieldDetails = (field) => {
      ElMessage.info(`查看字段 ${field.fieldName} 的详细信息`)
    }

    const cleanField = (field) => {
      emit('clean-field', field)
      ElMessage.success(`开始清洗字段 ${field.fieldName}`)
    }

    const resolveDuplicateGroup = async (group) => {
      try {
        await ElMessageBox.confirm(
          `确定要处理这个包含 ${group.count} 条记录的重复组吗？`,
          '处理重复数据',
          { type: 'warning' }
        )
        ElMessage.success('重复数据处理完成')
      } catch {
        // 用户取消
      }
    }

    const viewIssueDetails = (issue) => {
      ElMessage.info(`查看问题详情: ${issue.message}`)
    }

    const fixIssue = (issue) => {
      emit('fix-issue', issue)
      ElMessage.success('开始修复问题')
    }

    const applyRecommendation = (recommendation) => {
      emit('apply-recommendation', recommendation)
      ElMessage.success('应用建议成功')
    }

    const ignoreRecommendation = (recommendation) => {
      ElMessage.info('已忽略该建议')
    }

    return {
      activeTab,
      fieldSearchText,
      fieldFilterType,
      filteredFields,
      getCompletenessColor,
      getConsistencyColor,
      getTypeTagType,
      getIssuesBySeverity,
      getIssueTypeLabel,
      getPriorityType,
      refreshAnalysis,
      exportReport,
      viewFieldDetails,
      cleanField,
      resolveDuplicateGroup,
      viewIssueDetails,
      fixIssue,
      applyRecommendation,
      ignoreRecommendation
    }
  }
}
</script>

<style scoped>
.data-analysis-report {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.analysis-overview {
  padding: 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #f0f2f5;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.overview-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.analysis-actions {
  display: flex;
  gap: 10px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.summary-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #e6f7ff;
  color: #1890ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
}

.card-label {
  font-size: 14px;
  color: #606266;
  margin-top: 4px;
}

.analysis-tabs {
  padding: 0;
}

.analysis-controls {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 20px 20px 0;
}

.fields-table {
  padding: 0 20px 20px;
}

.field-name {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.completeness-cell,
.format-consistency {
  display: flex;
  align-items: center;
  gap: 8px;
}

.percentage-text {
  font-size: 12px;
  color: #606266;
  min-width: 35px;
}

.data-types {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.duplicate-info {
  cursor: pointer;
}

.duplicate-details {
  max-height: 200px;
  overflow-y: auto;
}

.duplicate-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid #f0f2f5;
}

.duplicate-item:last-child {
  border-bottom: none;
}

.dup-value {
  flex: 1;
  font-size: 12px;
  color: #2c3e50;
}

.dup-count {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

.more-duplicates {
  text-align: center;
  font-size: 12px;
  color: #909399;
  padding: 8px 0;
}

.no-duplicates {
  font-size: 12px;
  color: #67c23a;
}

.statistics-info {
  font-size: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
}

.stat-label {
  color: #909399;
}

.stat-value {
  color: #2c3e50;
  font-weight: 500;
}

.no-stats {
  font-size: 12px;
  color: #909399;
}

.duplicates-analysis {
  padding: 20px;
}

.duplicate-summary {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 12px;
  color: #606266;
}

.summary-value {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.summary-value.warning {
  color: #e6a23c;
}

.duplicate-groups h4,
.similar-records h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.duplicate-group,
.similar-group {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
}

.group-title {
  font-weight: 500;
  color: #2c3e50;
}

.group-records {
  padding: 16px;
}

.duplicate-record {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
}

.duplicate-record:last-child {
  margin-bottom: 0;
}

.record-index {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  min-width: 60px;
}

.record-content {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.record-field {
  display: flex;
  gap: 4px;
  font-size: 12px;
}

.field-name {
  color: #606266;
  font-weight: 500;
}

.field-value {
  color: #2c3e50;
}

.more-records {
  text-align: center;
  font-size: 12px;
  color: #909399;
  padding: 8px;
  background: #f0f2f5;
  border-radius: 4px;
}

.quality-issues {
  padding: 20px;
}

.issues-summary {
  margin-bottom: 24px;
}

.severity-stats {
  display: flex;
  gap: 24px;
  justify-content: center;
}

.severity-item {
  text-align: center;
  padding: 16px;
  border-radius: 8px;
  min-width: 100px;
}

.severity-item.high {
  background: #fef0f0;
  color: #f56c6c;
}

.severity-item.medium {
  background: #fdf6ec;
  color: #e6a23c;
}

.severity-item.low {
  background: #f0f9ff;
  color: #409eff;
}

.severity-count {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
}

.severity-label {
  font-size: 12px;
  margin-top: 4px;
  opacity: 0.8;
}

.issues-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.issue-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid;
}

.issue-item.high {
  background: #fef0f0;
  border-left-color: #f56c6c;
}

.issue-item.medium {
  background: #fdf6ec;
  border-left-color: #e6a23c;
}

.issue-item.low {
  background: #f0f9ff;
  border-left-color: #409eff;
}

.issue-icon {
  font-size: 20px;
  margin-top: 2px;
}

.issue-content {
  flex: 1;
}

.issue-title {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
}

.issue-details {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #606266;
}

.issue-actions {
  display: flex;
  gap: 8px;
}

.recommendations {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recommendation-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
}

.recommendation-title {
  font-size: 16px;
  font-weight: 500;
  color: #2c3e50;
}

.recommendation-content {
  padding: 16px;
}

.recommendation-content p {
  margin: 0 0 12px 0;
  color: #606266;
  line-height: 1.6;
}

.recommendation-steps h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #2c3e50;
}

.recommendation-steps ol {
  margin: 0;
  padding-left: 20px;
}

.recommendation-steps li {
  margin-bottom: 4px;
  color: #606266;
  line-height: 1.5;
}

.recommendation-actions {
  padding: 16px;
  border-top: 1px solid #f0f2f5;
  display: flex;
  gap: 12px;
}

@media (max-width: 768px) {
  .analysis-overview {
    padding: 16px;
  }

  .overview-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .summary-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .analysis-controls {
    flex-direction: column;
    gap: 12px;
  }

  .duplicate-summary {
    flex-direction: column;
    gap: 12px;
  }

  .severity-stats {
    flex-direction: column;
    gap: 12px;
  }

  .issue-details {
    flex-direction: column;
    gap: 4px;
  }

  .recommendation-header {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
}

/* 滚动条样式 */
.duplicate-details::-webkit-scrollbar {
  width: 6px;
}

.duplicate-details::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.duplicate-details::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.duplicate-details::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
