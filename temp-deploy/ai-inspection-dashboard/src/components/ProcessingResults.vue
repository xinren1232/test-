<template>
  <div class="processing-results">
    <!-- 结果概览卡片 -->
    <el-row :gutter="20" class="results-overview">
      <el-col :span="6">
        <el-card class="metric-card success">
          <div class="metric-content">
            <div class="metric-icon">
              <el-icon :size="32"><CircleCheck /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ results.summary?.finalDataCount || 0 }}</div>
              <div class="metric-label">处理记录数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="metric-card primary">
          <div class="metric-content">
            <div class="metric-icon">
              <el-icon :size="32"><Trophy /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ results.summary?.qualityScore || 0 }}%</div>
              <div class="metric-label">质量分数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="metric-card warning">
          <div class="metric-content">
            <div class="metric-icon">
              <el-icon :size="32"><Clock /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ formatDuration(results.summary?.totalDuration) }}</div>
              <div class="metric-label">处理时间</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="metric-card info">
          <div class="metric-content">
            <div class="metric-icon">
              <el-icon :size="32"><Cpu /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ results.summary?.overallProgress || 0 }}%</div>
              <div class="metric-label">完成进度</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细结果展示 -->
    <el-row :gutter="20" class="detailed-results">
      <!-- AI分析洞察 -->
      <el-col :span="12">
        <el-card class="insights-card">
          <template #header>
            <div class="card-header">
              <h3>
                <el-icon><BrainFilled /></el-icon>
                AI分析洞察
              </h3>
              <el-tag type="success" size="small">
                置信度: {{ Math.round((aiResults?.confidence || 0.8) * 100) }}%
              </el-tag>
            </div>
          </template>
          
          <div class="insights-content">
            <div v-if="aiResults?.dataInsights?.length > 0" class="insights-list">
              <div 
                v-for="(insight, index) in aiResults.dataInsights" 
                :key="index"
                class="insight-item"
                :class="insight.level"
              >
                <div class="insight-header">
                  <el-icon class="insight-icon">
                    <component :is="getInsightIcon(insight.level)" />
                  </el-icon>
                  <span class="insight-title">{{ insight.title }}</span>
                  <el-tag 
                    :type="getInsightTagType(insight.level)" 
                    size="small"
                    v-if="insight.confidence"
                  >
                    {{ Math.round(insight.confidence * 100) }}%
                  </el-tag>
                </div>
                <p class="insight-description">{{ insight.description }}</p>
                
                <div v-if="insight.recommendations?.length > 0" class="insight-recommendations">
                  <h5>建议行动:</h5>
                  <ul>
                    <li v-for="rec in insight.recommendations" :key="rec">{{ rec }}</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <el-empty v-else description="暂无AI洞察" :image-size="80" />
          </div>
        </el-card>
      </el-col>
      
      <!-- 执行摘要 -->
      <el-col :span="12">
        <el-card class="summary-card">
          <template #header>
            <div class="card-header">
              <h3>
                <el-icon><Document /></el-icon>
                执行摘要
              </h3>
              <el-button type="primary" size="small" @click="exportSummary">
                <el-icon><Download /></el-icon>
                导出
              </el-button>
            </div>
          </template>
          
          <div class="summary-content">
            <div v-if="aiResults?.executiveSummary" class="executive-summary">
              <!-- 概览 -->
              <div class="summary-section">
                <h4>概览</h4>
                <p>{{ aiResults.executiveSummary.overview }}</p>
              </div>
              
              <!-- 关键发现 -->
              <div class="summary-section" v-if="aiResults.executiveSummary.keyFindings?.length > 0">
                <h4>关键发现</h4>
                <ul class="findings-list">
                  <li v-for="finding in aiResults.executiveSummary.keyFindings" :key="finding">
                    {{ finding }}
                  </li>
                </ul>
              </div>
              
              <!-- 建议 -->
              <div class="summary-section" v-if="aiResults.executiveSummary.recommendations?.length > 0">
                <h4>主要建议</h4>
                <ul class="recommendations-list">
                  <li v-for="rec in aiResults.executiveSummary.recommendations" :key="rec">
                    {{ rec }}
                  </li>
                </ul>
              </div>
              
              <!-- 下一步行动 -->
              <div class="summary-section" v-if="aiResults.executiveSummary.nextSteps?.length > 0">
                <h4>下一步行动</h4>
                <ol class="next-steps-list">
                  <li v-for="step in aiResults.executiveSummary.nextSteps" :key="step">
                    {{ step }}
                  </li>
                </ol>
              </div>
              
              <!-- 业务影响 -->
              <div class="summary-section" v-if="aiResults.executiveSummary.businessImpact">
                <h4>业务影响</h4>
                <div class="business-impact">
                  <div class="impact-item">
                    <span class="impact-label">当前价值:</span>
                    <el-tag :type="getImpactType(aiResults.executiveSummary.businessImpact.current)">
                      {{ getImpactText(aiResults.executiveSummary.businessImpact.current) }}
                    </el-tag>
                  </div>
                  <div class="impact-item">
                    <span class="impact-label">潜在价值:</span>
                    <el-tag :type="getImpactType(aiResults.executiveSummary.businessImpact.potential)">
                      {{ getImpactText(aiResults.executiveSummary.businessImpact.potential) }}
                    </el-tag>
                  </div>
                  <p class="impact-description">{{ aiResults.executiveSummary.businessImpact.description }}</p>
                </div>
              </div>
            </div>
            
            <el-empty v-else description="暂无执行摘要" :image-size="80" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- AI建议详情 -->
    <el-row :gutter="20" class="recommendations-section">
      <el-col :span="24">
        <el-card class="recommendations-card">
          <template #header>
            <div class="card-header">
              <h3>
                <el-icon><Lightbulb /></el-icon>
                AI智能建议
              </h3>
              <div class="recommendations-filter">
                <el-select v-model="selectedPriority" placeholder="优先级筛选" size="small" style="width: 120px">
                  <el-option label="全部" value="all" />
                  <el-option label="高优先级" value="high" />
                  <el-option label="中优先级" value="medium" />
                  <el-option label="低优先级" value="low" />
                </el-select>
              </div>
            </div>
          </template>
          
          <div class="recommendations-content">
            <div v-if="filteredRecommendations.length > 0" class="recommendations-list">
              <div 
                v-for="(rec, index) in filteredRecommendations" 
                :key="index"
                class="recommendation-item"
                :class="rec.priority"
              >
                <div class="recommendation-header">
                  <div class="rec-title-section">
                    <h4 class="rec-title">{{ rec.title }}</h4>
                    <div class="rec-meta">
                      <el-tag :type="getPriorityType(rec.priority)" size="small">
                        {{ getPriorityText(rec.priority) }}
                      </el-tag>
                      <el-tag type="info" size="small" v-if="rec.category">
                        {{ getCategoryText(rec.category) }}
                      </el-tag>
                      <span class="rec-confidence" v-if="rec.confidence">
                        置信度: {{ Math.round(rec.confidence * 100) }}%
                      </span>
                    </div>
                  </div>
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="toggleRecommendation(index)"
                    :icon="expandedRecs.includes(index) ? 'ArrowUp' : 'ArrowDown'"
                  >
                    {{ expandedRecs.includes(index) ? '收起' : '详情' }}
                  </el-button>
                </div>
                
                <p class="rec-description">{{ rec.description }}</p>
                
                <div v-if="expandedRecs.includes(index)" class="rec-details">
                  <div class="rec-impact" v-if="rec.estimatedImpact">
                    <strong>预期影响:</strong> {{ rec.estimatedImpact }}
                  </div>
                  <div class="rec-timeline" v-if="rec.timeToImplement">
                    <strong>实施周期:</strong> {{ rec.timeToImplement }}
                  </div>
                  
                  <div v-if="rec.suggestions?.length > 0" class="rec-suggestions">
                    <h5>具体建议:</h5>
                    <div class="suggestions-grid">
                      <div 
                        v-for="(suggestion, sIndex) in rec.suggestions" 
                        :key="sIndex"
                        class="suggestion-item"
                      >
                        <div class="suggestion-header">
                          <span class="suggestion-action">{{ suggestion.action }}</span>
                          <div class="suggestion-badges">
                            <el-tag size="small" v-if="suggestion.difficulty">
                              {{ getDifficultyText(suggestion.difficulty) }}
                            </el-tag>
                            <el-tag type="warning" size="small" v-if="suggestion.cost">
                              {{ getCostText(suggestion.cost) }}
                            </el-tag>
                          </div>
                        </div>
                        <p class="suggestion-description">{{ suggestion.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <el-empty v-else description="暂无AI建议" :image-size="80" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 操作按钮 -->
    <div class="results-actions">
      <el-button type="primary" size="large" @click="downloadResults">
        <el-icon><Download /></el-icon>
        下载完整报告
      </el-button>
      <el-button size="large" @click="exportToExcel">
        <el-icon><DocumentCopy /></el-icon>
        导出Excel
      </el-button>
      <el-button size="large" @click="shareResults">
        <el-icon><Share /></el-icon>
        分享结果
      </el-button>
      <el-button type="success" size="large" @click="startNewProcess">
        <el-icon><Refresh /></el-icon>
        重新处理
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  CircleCheck, Trophy, Clock, Cpu, BrainFilled, Document, Download,
  Lightbulb, ArrowUp, ArrowDown, DocumentCopy, Share, Refresh,
  SuccessFilled, WarningFilled, InfoFilled, CircleCloseFilled
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  results: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['download', 'export', 'share', 'restart'])

// Reactive data
const selectedPriority = ref('all')
const expandedRecs = ref([])

// Computed
const aiResults = computed(() => {
  return props.results.results?.ai_analysis || {}
})

const filteredRecommendations = computed(() => {
  const recommendations = aiResults.value.aiRecommendations || []
  
  if (selectedPriority.value === 'all') {
    return recommendations
  }
  
  return recommendations.filter(rec => rec.priority === selectedPriority.value)
})

// Methods
const formatDuration = (duration) => {
  if (!duration) return '-'
  
  const seconds = Math.floor(duration / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

const getInsightIcon = (level) => {
  const iconMap = {
    success: SuccessFilled,
    warning: WarningFilled,
    info: InfoFilled,
    error: CircleCloseFilled
  }
  return iconMap[level] || InfoFilled
}

const getInsightTagType = (level) => {
  const typeMap = {
    success: 'success',
    warning: 'warning',
    info: 'info',
    error: 'danger'
  }
  return typeMap[level] || 'info'
}

const getImpactType = (impact) => {
  const typeMap = {
    high: 'success',
    medium: 'warning',
    low: 'info'
  }
  return typeMap[impact] || 'info'
}

const getImpactText = (impact) => {
  const textMap = {
    high: '高价值',
    medium: '中等价值',
    low: '低价值'
  }
  return textMap[impact] || impact
}

const getPriorityType = (priority) => {
  const typeMap = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return typeMap[priority] || 'info'
}

const getPriorityText = (priority) => {
  const textMap = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }
  return textMap[priority] || priority
}

const getCategoryText = (category) => {
  const textMap = {
    performance: '性能优化',
    quality: '质量提升',
    insights: '洞察分析',
    architecture: '架构优化',
    general: '通用建议'
  }
  return textMap[category] || category
}

const getDifficultyText = (difficulty) => {
  const textMap = {
    low: '简单',
    medium: '中等',
    high: '困难'
  }
  return textMap[difficulty] || difficulty
}

const getCostText = (cost) => {
  const textMap = {
    low: '低成本',
    medium: '中等成本',
    high: '高成本'
  }
  return textMap[cost] || cost
}

const toggleRecommendation = (index) => {
  const pos = expandedRecs.value.indexOf(index)
  if (pos > -1) {
    expandedRecs.value.splice(pos, 1)
  } else {
    expandedRecs.value.push(index)
  }
}

const exportSummary = () => {
  const summary = aiResults.value.executiveSummary
  if (!summary) {
    ElMessage.warning('暂无执行摘要可导出')
    return
  }
  
  const content = `
数据处理执行摘要

概览：
${summary.overview}

关键发现：
${summary.keyFindings?.map(f => `• ${f}`).join('\n') || '无'}

主要建议：
${summary.recommendations?.map(r => `• ${r}`).join('\n') || '无'}

下一步行动：
${summary.nextSteps?.map((s, i) => `${i + 1}. ${s}`).join('\n') || '无'}

业务影响：
${summary.businessImpact?.description || '无'}
  `.trim()
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `executive-summary-${new Date().toISOString().slice(0, 19)}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

const downloadResults = () => {
  emit('download')
}

const exportToExcel = () => {
  emit('export')
}

const shareResults = () => {
  emit('share')
}

const startNewProcess = () => {
  emit('restart')
}
</script>

<style scoped>
.processing-results {
  padding: 20px;
}

/* 结果概览 */
.results-overview {
  margin-bottom: 24px;
}

.metric-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.metric-card.success {
  background: linear-gradient(135deg, #67C23A, #85CE61);
  color: white;
}

.metric-card.primary {
  background: linear-gradient(135deg, #409EFF, #66B1FF);
  color: white;
}

.metric-card.warning {
  background: linear-gradient(135deg, #E6A23C, #EEBE77);
  color: white;
}

.metric-card.info {
  background: linear-gradient(135deg, #909399, #B1B3B8);
  color: white;
}

.metric-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
}

.metric-icon {
  flex-shrink: 0;
  opacity: 0.8;
}

.metric-info {
  flex: 1;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 14px;
  opacity: 0.9;
}

/* 详细结果 */
.detailed-results {
  margin-bottom: 24px;
}

.insights-card,
.summary-card,
.recommendations-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

/* 洞察内容 */
.insights-content {
  max-height: 500px;
  overflow-y: auto;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.insight-item {
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #DCDFE6;
  background: #FAFAFA;
}

.insight-item.success {
  border-left-color: #67C23A;
  background: #F0F9FF;
}

.insight-item.warning {
  border-left-color: #E6A23C;
  background: #FDF6EC;
}

.insight-item.error {
  border-left-color: #F56C6C;
  background: #FEF0F0;
}

.insight-item.info {
  border-left-color: #409EFF;
  background: #F0F9FF;
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.insight-icon {
  font-size: 16px;
}

.insight-title {
  font-weight: 600;
  color: #303133;
  flex: 1;
}

.insight-description {
  margin: 0 0 12px 0;
  color: #606266;
  line-height: 1.6;
}

.insight-recommendations {
  margin-top: 12px;
}

.insight-recommendations h5 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 14px;
}

.insight-recommendations ul {
  margin: 0;
  padding-left: 20px;
  color: #606266;
}

.insight-recommendations li {
  margin-bottom: 4px;
}

/* 执行摘要 */
.summary-content {
  max-height: 500px;
  overflow-y: auto;
}

.executive-summary {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.summary-section h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 2px solid #E4E7ED;
  padding-bottom: 8px;
}

.summary-section p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

.findings-list,
.recommendations-list {
  margin: 0;
  padding-left: 20px;
  color: #606266;
}

.findings-list li,
.recommendations-list li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.next-steps-list {
  margin: 0;
  padding-left: 20px;
  color: #606266;
}

.next-steps-list li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.business-impact {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.impact-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.impact-label {
  font-weight: 500;
  color: #303133;
  min-width: 80px;
}

.impact-description {
  margin-top: 8px !important;
  font-style: italic;
}

/* AI建议 */
.recommendations-section {
  margin-bottom: 24px;
}

.recommendations-filter {
  display: flex;
  gap: 8px;
  align-items: center;
}

.recommendations-content {
  max-height: 600px;
  overflow-y: auto;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.recommendation-item {
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #EBEEF5;
  background: #FAFAFA;
  transition: all 0.3s ease;
}

.recommendation-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.recommendation-item.high {
  border-left: 4px solid #F56C6C;
}

.recommendation-item.medium {
  border-left: 4px solid #E6A23C;
}

.recommendation-item.low {
  border-left: 4px solid #909399;
}

.recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.rec-title-section {
  flex: 1;
}

.rec-title {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.rec-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.rec-confidence {
  font-size: 12px;
  color: #909399;
}

.rec-description {
  margin: 0 0 16px 0;
  color: #606266;
  line-height: 1.6;
}

.rec-details {
  padding-top: 16px;
  border-top: 1px solid #EBEEF5;
}

.rec-impact,
.rec-timeline {
  margin-bottom: 12px;
  color: #606266;
}

.rec-suggestions h5 {
  margin: 16px 0 12px 0;
  color: #303133;
  font-size: 14px;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 12px;
}

.suggestion-item {
  padding: 12px;
  border-radius: 6px;
  background: #F5F7FA;
  border: 1px solid #E4E7ED;
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.suggestion-action {
  font-weight: 500;
  color: #303133;
  flex: 1;
}

.suggestion-badges {
  display: flex;
  gap: 4px;
}

.suggestion-description {
  margin: 0;
  color: #606266;
  font-size: 12px;
  line-height: 1.4;
}

/* 操作按钮 */
.results-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding: 24px;
  background: #F8F9FA;
  border-radius: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .processing-results {
    padding: 12px;
  }

  .results-overview .el-col {
    margin-bottom: 12px;
  }

  .detailed-results .el-col {
    margin-bottom: 20px;
  }

  .metric-content {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .recommendation-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .suggestions-grid {
    grid-template-columns: 1fr;
  }

  .results-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .results-actions .el-button {
    width: 100%;
  }
}
</style>
