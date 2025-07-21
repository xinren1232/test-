<template>
  <div class="data-processing-center">
    <div class="page-header">
      <h1>数据处理中心</h1>
      <p>完整的数据处理流程：上传 → 解析 → 清洗 → 提取 → 汇总 → AI分析</p>
    </div>

    <!-- 数据上传区域 -->
    <el-card class="upload-card" v-if="!isProcessing && !processCompleted">
      <template #header>
        <div class="upload-header">
          <h3>数据上传</h3>
          <el-button type="primary" @click="showRulesConfig = true" plain>
            <el-icon><Setting /></el-icon>
            配置清洗规则
          </el-button>
        </div>
      </template>
      
      <el-upload
        class="upload-dragger"
        drag
        :auto-upload="false"
        :on-change="handleFileChange"
        :show-file-list="false"
        accept=".xlsx,.xls,.csv,.json"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 Excel (.xlsx, .xls)、CSV (.csv)、JSON (.json) 格式文件，最大 10MB
          </div>
        </template>
      </el-upload>
      
      <div v-if="selectedFile" class="file-info">
        <h4>已选择文件:</h4>
        <div class="file-details">
          <span class="file-name">{{ selectedFile.name }}</span>
          <span class="file-size">({{ formatFileSize(selectedFile.size) }})</span>
          <span class="file-type">{{ selectedFile.type }}</span>
        </div>
        
        <div class="processing-options">
          <h4>处理选项:</h4>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-card class="option-card">
                <div class="option-item">
                  <el-icon><Brush /></el-icon>
                  <span>清洗规则: {{ selectedRules.length }} 项</span>
                </div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card class="option-card">
                <div class="option-item">
                  <el-icon><Cpu /></el-icon>
                  <span>AI分析: 启用</span>
                </div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card class="option-card">
                <div class="option-item">
                  <el-icon><DocumentCopy /></el-icon>
                  <span>生成报告: 启用</span>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
        
        <div class="upload-actions">
          <el-button type="primary" size="large" @click="startProcessing" :loading="isProcessing">
            <el-icon><Play /></el-icon>
            开始处理
          </el-button>
          <el-button @click="clearFile">清除文件</el-button>
        </div>
      </div>
    </el-card>

    <!-- 流程监控组件 -->
    <ProcessMonitor 
      v-if="isProcessing || processCompleted"
      :pipeline="pipeline" 
      :statistics="processingStatistics"
    />

    <!-- 清洗规则配置对话框 -->
    <el-dialog 
      v-model="showRulesConfig" 
      title="配置清洗规则" 
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="rules-config">
        <div class="rules-categories">
          <h4>选择清洗规则:</h4>
          
          <el-tabs v-model="activeRuleCategory" type="card">
            <el-tab-pane label="基础清洗" name="basic">
              <div class="rules-grid">
                <div 
                  v-for="rule in basicRules" 
                  :key="rule.id"
                  class="rule-item"
                  :class="{ active: selectedRules.includes(rule.id) }"
                  @click="toggleRule(rule.id)"
                >
                  <div class="rule-header">
                    <el-checkbox 
                      :model-value="selectedRules.includes(rule.id)"
                      @change="toggleRule(rule.id)"
                    />
                    <span class="rule-name">{{ rule.name }}</span>
                  </div>
                  <p class="rule-description">{{ rule.description }}</p>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="格式化" name="format">
              <div class="rules-grid">
                <div 
                  v-for="rule in formatRules" 
                  :key="rule.id"
                  class="rule-item"
                  :class="{ active: selectedRules.includes(rule.id) }"
                  @click="toggleRule(rule.id)"
                >
                  <div class="rule-header">
                    <el-checkbox 
                      :model-value="selectedRules.includes(rule.id)"
                      @change="toggleRule(rule.id)"
                    />
                    <span class="rule-name">{{ rule.name }}</span>
                  </div>
                  <p class="rule-description">{{ rule.description }}</p>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="高级处理" name="advanced">
              <div class="rules-grid">
                <div 
                  v-for="rule in advancedRules" 
                  :key="rule.id"
                  class="rule-item"
                  :class="{ active: selectedRules.includes(rule.id) }"
                  @click="toggleRule(rule.id)"
                >
                  <div class="rule-header">
                    <el-checkbox 
                      :model-value="selectedRules.includes(rule.id)"
                      @change="toggleRule(rule.id)"
                    />
                    <span class="rule-name">{{ rule.name }}</span>
                  </div>
                  <p class="rule-description">{{ rule.description }}</p>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="验证规则" name="validation">
              <div class="rules-grid">
                <div 
                  v-for="rule in validationRules" 
                  :key="rule.id"
                  class="rule-item"
                  :class="{ active: selectedRules.includes(rule.id) }"
                  @click="toggleRule(rule.id)"
                >
                  <div class="rule-header">
                    <el-checkbox 
                      :model-value="selectedRules.includes(rule.id)"
                      @change="toggleRule(rule.id)"
                    />
                    <span class="rule-name">{{ rule.name }}</span>
                  </div>
                  <p class="rule-description">{{ rule.description }}</p>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
        
        <div class="selected-rules-summary">
          <h4>已选择规则 ({{ selectedRules.length }}):</h4>
          <div class="selected-rules-list">
            <el-tag 
              v-for="ruleId in selectedRules" 
              :key="ruleId"
              closable
              @close="toggleRule(ruleId)"
              style="margin: 4px;"
            >
              {{ getRuleName(ruleId) }}
            </el-tag>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetRules">重置为默认</el-button>
          <el-button @click="showRulesConfig = false">取消</el-button>
          <el-button type="primary" @click="saveRulesConfig">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 处理结果展示 -->
    <ProcessingResults
      v-if="processCompleted && processingResults"
      :results="processingResults"
      @download="downloadResults"
      @export="exportToExcel"
      @share="shareResults"
      @restart="startNewProcess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  UploadFilled, Setting, Brush, Cpu, DocumentCopy, Play, 
  Download, Refresh
} from '@element-plus/icons-vue'
import ProcessMonitor from '../components/ProcessMonitor.vue'
import ProcessingResults from '../components/ProcessingResults.vue'
import { CLEANING_RULES } from '../utils/dataCleaningEngine.js'
import DataProcessingPipeline from '../utils/dataProcessingPipeline.js'

// Reactive data
const selectedFile = ref(null)
const isProcessing = ref(false)
const processCompleted = ref(false)
const showRulesConfig = ref(false)
const activeRuleCategory = ref('basic')
const selectedRules = ref([
  'REMOVE_EMPTY',
  'TRIM_WHITESPACE', 
  'REMOVE_DUPLICATES',
  'STANDARDIZE_TERMS',
  'FORMAT_DATE',
  'FORMAT_NUMBER'
])

const pipeline = reactive(DataProcessingPipeline)
const processingResults = ref(null)
const processingStatistics = ref({
  recordsProcessed: 0,
  qualityScore: 0,
  totalTime: 0,
  issuesFound: 0
})

// Computed
const basicRules = computed(() => {
  return Object.values(CLEANING_RULES).filter(rule => rule.category === 'basic')
})

const formatRules = computed(() => {
  return Object.values(CLEANING_RULES).filter(rule => rule.category === 'format')
})

const advancedRules = computed(() => {
  return Object.values(CLEANING_RULES).filter(rule => rule.category === 'advanced')
})

const validationRules = computed(() => {
  return Object.values(CLEANING_RULES).filter(rule => rule.category === 'validation')
})

// Methods
const handleFileChange = (file) => {
  selectedFile.value = file.raw
}

const clearFile = () => {
  selectedFile.value = null
}

const formatFileSize = (size) => {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const toggleRule = (ruleId) => {
  const index = selectedRules.value.indexOf(ruleId)
  if (index > -1) {
    selectedRules.value.splice(index, 1)
  } else {
    selectedRules.value.push(ruleId)
  }
}

const getRuleName = (ruleId) => {
  const rule = Object.values(CLEANING_RULES).find(r => r.id === ruleId)
  return rule ? rule.name : ruleId
}

const resetRules = () => {
  selectedRules.value = [
    'REMOVE_EMPTY',
    'TRIM_WHITESPACE', 
    'REMOVE_DUPLICATES',
    'STANDARDIZE_TERMS',
    'FORMAT_DATE',
    'FORMAT_NUMBER'
  ]
}

const saveRulesConfig = () => {
  showRulesConfig.value = false
  ElMessage.success('清洗规则配置已保存')
}

const startProcessing = async () => {
  if (!selectedFile.value) {
    ElMessage.error('请先选择文件')
    return
  }

  isProcessing.value = true
  processCompleted.value = false
  
  try {
    const options = {
      clean: {
        rules: selectedRules.value,
        ruleOptions: {}
      }
    }
    
    const result = await pipeline.start(selectedFile.value, options)
    
    processingResults.value = result
    processCompleted.value = true
    
    // 更新统计信息
    processingStatistics.value = {
      recordsProcessed: result.results?.clean?.data?.length || 0,
      qualityScore: result.results?.clean?.report?.qualityScore || 0,
      totalTime: result.summary?.totalDuration || 0,
      issuesFound: result.results?.extract?.keyMetrics?.dataQuality?.issues?.length || 0
    }
    
    if (result.success) {
      ElMessage.success('数据处理完成')
    } else {
      ElMessage.error(`处理失败: ${result.error}`)
    }
    
  } catch (error) {
    ElMessage.error(`处理失败: ${error.message}`)
    console.error('Processing error:', error)
  } finally {
    isProcessing.value = false
  }
}

const downloadResults = () => {
  if (!processingResults.value) return

  const data = JSON.stringify(processingResults.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `processing-results-${new Date().toISOString().slice(0, 19)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const exportToExcel = () => {
  if (!processingResults.value?.results?.clean?.data) {
    ElMessage.warning('没有可导出的数据')
    return
  }

  try {
    // 这里可以集成xlsx库来导出Excel
    const data = processingResults.value.results.clean.data
    const csvContent = convertToCSV(data)

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cleaned-data-${new Date().toISOString().slice(0, 19)}.csv`
    a.click()
    URL.revokeObjectURL(url)

    ElMessage.success('数据导出成功')
  } catch (error) {
    ElMessage.error('导出失败: ' + error.message)
  }
}

const shareResults = () => {
  if (!processingResults.value) {
    ElMessage.warning('没有可分享的结果')
    return
  }

  // 生成分享链接或复制摘要到剪贴板
  const summary = processingResults.value.results?.ai_analysis?.executiveSummary
  if (summary) {
    const shareText = `数据处理结果摘要：

${summary.overview}

质量评分：${processingResults.value.summary?.qualityScore || 0}%
处理记录：${processingResults.value.summary?.finalDataCount || 0}条

主要发现：
${summary.keyFindings?.map(f => `• ${f}`).join('\n') || '无'}
    `

    navigator.clipboard.writeText(shareText).then(() => {
      ElMessage.success('结果摘要已复制到剪贴板')
    }).catch(() => {
      ElMessage.error('复制失败')
    })
  } else {
    ElMessage.warning('暂无可分享的摘要')
  }
}

const convertToCSV = (data) => {
  if (!data || data.length === 0) return ''

  const headers = Object.keys(data[0])
  const csvRows = []

  // 添加标题行
  csvRows.push(headers.join(','))

  // 添加数据行
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header]
      // 处理包含逗号或引号的值
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value || ''
    })
    csvRows.push(values.join(','))
  })

  return csvRows.join('\n')
}

const startNewProcess = () => {
  selectedFile.value = null
  isProcessing.value = false
  processCompleted.value = false
  processingResults.value = null
  pipeline.reset()
}

const formatDuration = (duration) => {
  if (!duration) return '-'
  
  const seconds = Math.floor(duration / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

// Lifecycle
onMounted(() => {
  // 初始化
})
</script>

<style scoped>
.data-processing-center {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  text-align: center;
}

.page-header h1 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 28px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: #606266;
  font-size: 16px;
}

/* 上传区域 */
.upload-card {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.upload-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-header h3 {
  margin: 0;
  color: #303133;
}

.upload-dragger {
  width: 100%;
}

.upload-dragger .el-upload-dragger {
  width: 100%;
  height: 200px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.upload-dragger .el-upload-dragger:hover {
  border-color: #409EFF;
  background: #f0f9ff;
}

.file-info {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.file-info h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
}

.file-details {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
}

.file-name {
  font-weight: 600;
  color: #303133;
}

.file-size {
  color: #909399;
  font-size: 14px;
}

.file-type {
  padding: 2px 8px;
  background: #e1f3d8;
  color: #67c23a;
  border-radius: 4px;
  font-size: 12px;
}

.processing-options {
  margin: 20px 0;
}

.processing-options h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
}

.option-card {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.option-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
}

.upload-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

/* 规则配置对话框 */
.rules-config {
  max-height: 600px;
  overflow-y: auto;
}

.rules-categories h4 {
  margin: 0 0 16px 0;
  color: #303133;
}

.rules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.rule-item {
  padding: 16px;
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.rule-item:hover {
  border-color: #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.rule-item.active {
  border-color: #409EFF;
  background: #f0f9ff;
}

.rule-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.rule-name {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.rule-description {
  margin: 0;
  color: #606266;
  font-size: 12px;
  line-height: 1.4;
}

.selected-rules-summary {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.selected-rules-summary h4 {
  margin: 0 0 12px 0;
  color: #303133;
}

.selected-rules-list {
  min-height: 40px;
}

/* 结果展示 */
.results-section {
  margin-top: 24px;
}

.results-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.results-header h3 {
  margin: 0;
  color: #303133;
}

.results-actions {
  display: flex;
  gap: 8px;
}

.results-content {
  padding: 20px 0;
}

.result-summary h4,
.ai-insights h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #EBEEF5;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item .label {
  color: #606266;
  font-size: 14px;
}

.summary-item .value {
  color: #303133;
  font-weight: 600;
  font-size: 14px;
}

.quality-score {
  color: #67C23A;
  font-size: 16px;
}

.insights-content {
  color: #606266;
  line-height: 1.6;
}

.insights-content p {
  margin: 0 0 12px 0;
}

.insights-content ul {
  margin: 0;
  padding-left: 20px;
}

.insights-content li {
  margin-bottom: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .data-processing-center {
    padding: 12px;
  }

  .upload-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .file-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .rules-grid {
    grid-template-columns: 1fr;
  }

  .results-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .results-actions {
    justify-content: center;
  }
}
</style>
