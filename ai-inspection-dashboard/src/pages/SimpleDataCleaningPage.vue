<template>
  <div class="simple-data-cleaning-page">
    <div class="page-header">
      <h1>数据清洗治理系统</h1>
      <p>智能化数据处理与质量管控平台</p>
    </div>

    <div class="page-content">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="数据上传" name="upload">
          <div class="tab-content">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>文件上传</span>
                  <el-button type="primary" size="small">
                    <el-icon><Upload /></el-icon>
                    选择文件
                  </el-button>
                </div>
              </template>

              <el-upload
                class="upload-demo"
                drag
                :auto-upload="false"
                multiple
                :file-list="fileList"
                @change="handleFileChange"
              >
                <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                <div class="el-upload__text">
                  将文件拖到此处，或<em>点击上传</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip">
                    支持 Excel、CSV、PDF、Word、TXT 等格式，单个文件不超过50MB
                  </div>
                </template>
              </el-upload>

              <div v-if="fileList.length > 0" class="file-preview">
                <h4>已选择文件：</h4>
                <el-table :data="fileList" style="width: 100%">
                  <el-table-column prop="name" label="文件名" />
                  <el-table-column prop="size" label="大小" :formatter="formatFileSize" />
                  <el-table-column label="操作">
                    <template #default="scope">
                      <el-button type="primary" size="small" @click="startProcessing(scope.row)">
                        开始处理
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-card>
          </div>
        </el-tab-pane>

        <el-tab-pane label="规则配置" name="rules">
          <div class="tab-content">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>数据清洗规则</span>
                  <el-button type="success" size="small">
                    <el-icon><Plus /></el-icon>
                    添加规则
                  </el-button>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="12">
                  <h4>基础清洗规则</h4>
                  <el-checkbox-group v-model="selectedRules">
                    <el-checkbox label="removeEmpty">去除空值</el-checkbox>
                    <el-checkbox label="trimWhitespace">去除空白字符</el-checkbox>
                    <el-checkbox label="removeDuplicates">去除重复数据</el-checkbox>
                    <el-checkbox label="standardizeFormat">格式标准化</el-checkbox>
                  </el-checkbox-group>
                </el-col>

                <el-col :span="12">
                  <h4>高级清洗规则</h4>
                  <el-checkbox-group v-model="selectedAdvancedRules">
                    <el-checkbox label="dataValidation">数据验证</el-checkbox>
                    <el-checkbox label="smartRepair">智能修复</el-checkbox>
                    <el-checkbox label="anomalyDetection">异常检测</el-checkbox>
                    <el-checkbox label="qualityScoring">质量评分</el-checkbox>
                  </el-checkbox-group>
                </el-col>
              </el-row>

              <div class="rule-actions">
                <el-button type="primary" @click="applyRules">应用规则</el-button>
                <el-button @click="resetRules">重置</el-button>
                <el-button type="info" @click="previewRules">预览效果</el-button>
              </div>
            </el-card>
          </div>
        </el-tab-pane>

        <el-tab-pane label="流程监控" name="monitor">
          <div class="tab-content">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>处理流程监控</span>
                  <el-tag :type="processingStatus === 'running' ? 'success' : 'info'">
                    {{ processingStatus === 'running' ? '处理中' : '待处理' }}
                  </el-tag>
                </div>
              </template>

              <div class="process-steps">
                <el-steps :active="currentStep" finish-status="success">
                  <el-step title="数据上传" description="文件验证和存储" />
                  <el-step title="数据解析" description="内容解析和结构分析" />
                  <el-step title="数据清洗" description="应用清洗规则" />
                  <el-step title="信息提取" description="提取关键数据信息" />
                  <el-step title="结果汇总" description="生成处理报告" />
                  <el-step title="AI总结" description="智能分析和建议" />
                </el-steps>
              </div>

              <div v-if="processingStatus === 'running'" class="progress-info">
                <h4>当前进度</h4>
                <el-progress :percentage="processingProgress" :status="progressStatus" />
                <p>{{ currentStepDescription }}</p>
              </div>

              <div class="monitor-actions">
                <el-button
                  type="primary"
                  :loading="processingStatus === 'running'"
                  @click="startMonitoring"
                >
                  {{ processingStatus === 'running' ? '处理中...' : '开始处理' }}
                </el-button>
                <el-button v-if="processingStatus === 'running'" type="danger" @click="stopProcessing">
                  停止处理
                </el-button>
              </div>
            </el-card>
          </div>
        </el-tab-pane>

        <el-tab-pane label="处理结果" name="results">
          <div class="tab-content">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>处理结果</span>
                  <el-button type="success" size="small">
                    <el-icon><Download /></el-icon>
                    导出结果
                  </el-button>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="6">
                  <el-statistic title="处理文件数" :value="resultStats.processedFiles" />
                </el-col>
                <el-col :span="6">
                  <el-statistic title="清洗记录数" :value="resultStats.cleanedRecords" />
                </el-col>
                <el-col :span="6">
                  <el-statistic title="数据质量分" :value="resultStats.qualityScore" suffix="%" />
                </el-col>
                <el-col :span="6">
                  <el-statistic title="处理时间" :value="resultStats.processingTime" suffix="秒" />
                </el-col>
              </el-row>

              <div class="result-summary">
                <h4>处理摘要</h4>
                <el-table :data="processingResults" style="width: 100%">
                  <el-table-column prop="operation" label="操作" />
                  <el-table-column prop="before" label="处理前" />
                  <el-table-column prop="after" label="处理后" />
                  <el-table-column prop="improvement" label="改善率" />
                </el-table>
              </div>

              <div class="ai-insights">
                <h4>AI 智能分析</h4>
                <el-alert
                  title="数据质量良好"
                  type="success"
                  description="经过清洗处理，数据完整性提升了85%，建议进行进一步的质量验证。"
                  show-icon
                  :closable="false"
                />
              </div>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Upload,
  UploadFilled,
  Setting,
  DataAnalysis,
  Document,
  Plus,
  Download
} from '@element-plus/icons-vue'

export default {
  name: 'SimpleDataCleaningPage',
  components: {
    Upload,
    UploadFilled,
    Setting,
    DataAnalysis,
    Document,
    Plus,
    Download
  },
  setup() {
    const activeTab = ref('upload')
    const fileList = ref([])
    const selectedRules = ref(['removeEmpty', 'trimWhitespace'])
    const selectedAdvancedRules = ref(['dataValidation'])
    const processingStatus = ref('idle')
    const currentStep = ref(0)
    const processingProgress = ref(0)
    const progressStatus = ref('')
    const currentStepDescription = ref('')

    const resultStats = ref({
      processedFiles: 0,
      cleanedRecords: 0,
      qualityScore: 0,
      processingTime: 0
    })

    const processingResults = ref([
      { operation: '去除空值', before: '1000', after: '950', improvement: '5%' },
      { operation: '去除重复', before: '950', after: '920', improvement: '3.2%' },
      { operation: '格式标准化', before: '920', after: '920', improvement: '0%' },
      { operation: '数据验证', before: '920', after: '915', improvement: '0.5%' }
    ])

    const handleFileChange = (file, fileList) => {
      ElMessage.success(`已选择文件: ${file.name}`)
    }

    const formatFileSize = (row, column, cellValue) => {
      if (cellValue < 1024) return cellValue + ' B'
      if (cellValue < 1024 * 1024) return (cellValue / 1024).toFixed(1) + ' KB'
      return (cellValue / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const startProcessing = (file) => {
      ElMessage.info(`开始处理文件: ${file.name}`)
      activeTab.value = 'monitor'
      startMonitoring()
    }

    const applyRules = () => {
      ElMessage.success('清洗规则已应用')
    }

    const resetRules = () => {
      selectedRules.value = []
      selectedAdvancedRules.value = []
      ElMessage.info('规则已重置')
    }

    const previewRules = () => {
      ElMessage.info('预览功能开发中...')
    }

    const startMonitoring = () => {
      processingStatus.value = 'running'
      currentStep.value = 0
      processingProgress.value = 0

      const steps = [
        '正在上传文件...',
        '正在解析数据...',
        '正在清洗数据...',
        '正在提取信息...',
        '正在汇总结果...',
        '正在生成AI分析...'
      ]

      const interval = setInterval(() => {
        processingProgress.value += 16.67
        currentStepDescription.value = steps[currentStep.value] || '处理完成'

        if (processingProgress.value >= 100) {
          clearInterval(interval)
          processingStatus.value = 'completed'
          currentStep.value = 6
          progressStatus.value = 'success'

          // 更新结果统计
          resultStats.value = {
            processedFiles: 1,
            cleanedRecords: 915,
            qualityScore: 92,
            processingTime: 6
          }

          ElMessage.success('数据处理完成！')
          activeTab.value = 'results'
        } else {
          currentStep.value = Math.floor(processingProgress.value / 16.67)
        }
      }, 1000)
    }

    const stopProcessing = () => {
      processingStatus.value = 'stopped'
      ElMessage.warning('处理已停止')
    }

    return {
      activeTab,
      fileList,
      selectedRules,
      selectedAdvancedRules,
      processingStatus,
      currentStep,
      processingProgress,
      progressStatus,
      currentStepDescription,
      resultStats,
      processingResults,
      handleFileChange,
      formatFileSize,
      startProcessing,
      applyRules,
      resetRules,
      previewRules,
      startMonitoring,
      stopProcessing
    }
  }
}
</script>

<style scoped>
.simple-data-cleaning-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
}

.page-header h1 {
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
}

.tab-content {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-demo {
  margin: 20px 0;
}

.file-preview {
  margin-top: 20px;
}

.file-preview h4 {
  margin-bottom: 15px;
  color: #333;
}

.rule-actions {
  margin-top: 20px;
  text-align: center;
}

.process-steps {
  margin: 20px 0;
}

.progress-info {
  margin: 20px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.progress-info h4 {
  margin-bottom: 15px;
  color: #333;
}

.monitor-actions {
  margin-top: 20px;
  text-align: center;
}

.result-summary {
  margin: 20px 0;
}

.result-summary h4 {
  margin-bottom: 15px;
  color: #333;
}

.ai-insights {
  margin-top: 20px;
}

.ai-insights h4 {
  margin-bottom: 15px;
  color: #333;
}

.page-header h1 {
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
}

.tab-content {
  padding: 40px;
  text-align: center;
}

.tab-content h3 {
  margin-bottom: 20px;
  color: #333;
}

.tab-content p {
  margin-bottom: 30px;
  color: #666;
  font-size: 16px;
}
</style>
