<template>
  <div class="data-cleaning-governance">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>📊 数据清洗治理</h1>
      <p class="subtitle">支持常规案例和8D报告的智能数据清洗与治理</p>
    </div>

    <!-- 文件上传区域 -->
    <div class="upload-section">
      <el-card class="upload-card">
        <template #header>
          <div class="card-header">
            <span>📁 文件上传</span>
            <el-tag :type="fileTypeTagType">{{ fileTypeDisplay }}</el-tag>
          </div>
        </template>
        
        <el-upload
          ref="uploadRef"
          class="upload-dragger"
          drag
          :auto-upload="false"
          :on-change="handleFileChange"
          :before-upload="beforeUpload"
          accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 PDF、Word、Excel、TXT 格式，自动识别常规案例和8D报告
            </div>
          </template>
        </el-upload>
      </el-card>
    </div>

    <!-- 文件分析结果 -->
    <div v-if="analysisResult" class="analysis-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>🔍 文件分析结果</span>
            <el-button type="primary" size="small" @click="startCleaning">
              开始清洗
            </el-button>
          </div>
        </template>
        
        <div class="analysis-content">
          <div class="file-info">
            <h3>文件信息</h3>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="文件名">{{ analysisResult.fileName }}</el-descriptions-item>
              <el-descriptions-item label="文件类型">{{ analysisResult.fileType }}</el-descriptions-item>
              <el-descriptions-item label="文件大小">{{ analysisResult.fileSize }}</el-descriptions-item>
              <el-descriptions-item label="识别类型">
                <el-tag :type="analysisResult.documentType === '8D报告' ? 'warning' : 'success'">
                  {{ analysisResult.documentType }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 8D报告结构预览 -->
          <div v-if="analysisResult.documentType === '8D报告'" class="structure-preview">
            <h3>8D报告结构</h3>
            <div class="d-steps">
              <div 
                v-for="step in analysisResult.structure" 
                :key="step.step"
                class="d-step"
                :class="{ 'has-content': step.hasContent }"
              >
                <div class="step-header">
                  <el-icon><document /></el-icon>
                  <span>{{ step.step }}: {{ step.title }}</span>
                  <el-tag v-if="step.hasContent" type="success" size="small">有内容</el-tag>
                  <el-tag v-else type="info" size="small">待完善</el-tag>
                </div>
                <div v-if="step.preview" class="step-preview">
                  {{ step.preview }}
                </div>
              </div>
            </div>
          </div>

          <!-- 常规案例内容预览 -->
          <div v-else class="content-preview">
            <h3>内容预览</h3>
            <div class="preview-sections">
              <div v-for="section in analysisResult.sections" :key="section.title" class="section">
                <h4>{{ section.title }}</h4>
                <p>{{ section.preview }}</p>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 清洗进度 -->
    <div v-if="cleaningProgress.show" class="cleaning-section">
      <el-card>
        <template #header>
          <span>🧹 数据清洗进度</span>
        </template>
        
        <div class="progress-content">
          <el-steps :active="cleaningProgress.currentStep" align-center>
            <el-step title="文件解析" description="解析文件内容"></el-step>
            <el-step title="数据提取" description="提取关键数据"></el-step>
            <el-step title="数据清洗" description="清洗和标准化"></el-step>
            <el-step title="质量验证" description="验证数据质量"></el-step>
            <el-step title="完成" description="生成清洗报告"></el-step>
          </el-steps>
          
          <div class="progress-details">
            <el-progress 
              :percentage="cleaningProgress.percentage" 
              :status="cleaningProgress.status"
            />
            <p class="progress-text">{{ cleaningProgress.message }}</p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 清洗结果 -->
    <div v-if="cleaningResult" class="result-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>✅ 清洗结果</span>
            <div class="header-actions">
              <el-button type="success" @click="downloadResult">下载结果</el-button>
              <el-button type="primary" @click="exportReport">导出报告</el-button>
            </div>
          </div>
        </template>
        
        <div class="result-content">
          <!-- 清洗统计 -->
          <div class="cleaning-stats">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-statistic title="原始记录数" :value="cleaningResult.stats.originalCount" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="清洗后记录数" :value="cleaningResult.stats.cleanedCount" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="数据质量分" :value="cleaningResult.stats.qualityScore" suffix="%" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="处理时间" :value="cleaningResult.stats.processingTime" suffix="秒" />
              </el-col>
            </el-row>
          </div>

          <!-- 清洗详情 -->
          <div class="cleaning-details">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="清洗概览" name="overview">
                <CleaningOverview :data="cleaningResult.overview" />
              </el-tab-pane>
              <el-tab-pane label="数据预览" name="preview">
                <DataPreview :data="cleaningResult.cleanedData" />
              </el-tab-pane>
              <el-tab-pane label="质量报告" name="quality">
                <QualityReport :data="cleaningResult.qualityReport" />
              </el-tab-pane>
              <el-tab-pane label="清洗日志" name="logs">
                <CleaningLogs :logs="cleaningResult.logs" />
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled, Document } from '@element-plus/icons-vue'
import CleaningOverview from './components/CleaningOverview.vue'
import DataPreview from './components/DataPreview.vue'
import QualityReport from './components/QualityReport.vue'
import CleaningLogs from './components/CleaningLogs.vue'

// 响应式数据
const uploadRef = ref()
const analysisResult = ref(null)
const cleaningProgress = ref({
  show: false,
  currentStep: 0,
  percentage: 0,
  status: '',
  message: ''
})
const cleaningResult = ref(null)
const activeTab = ref('overview')

// 计算属性
const fileTypeDisplay = computed(() => {
  if (!analysisResult.value) return '未识别'
  return analysisResult.value.documentType || '常规文档'
})

const fileTypeTagType = computed(() => {
  if (!analysisResult.value) return 'info'
  return analysisResult.value.documentType === '8D报告' ? 'warning' : 'success'
})

// 方法
const handleFileChange = (file) => {
  console.log('文件选择:', file)
  analyzeFile(file)
}

const beforeUpload = (file) => {
  const isValidType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(file.type)
  
  if (!isValidType) {
    ElMessage.error('只支持 PDF、Word、Excel、TXT 格式的文件!')
    return false
  }
  
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!')
    return false
  }
  
  return true
}

const analyzeFile = async (file) => {
  try {
    ElMessage.info('正在分析文件...')
    
    // 模拟文件分析
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 模拟分析结果
    const is8DReport = file.name.includes('8D') || file.name.includes('报告')
    
    analysisResult.value = {
      fileName: file.name,
      fileType: file.type,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      documentType: is8DReport ? '8D报告' : '常规案例',
      structure: is8DReport ? [
        { step: 'D1', title: '建立团队', hasContent: true, preview: '团队成员：张三、李四...' },
        { step: 'D2', title: '问题描述', hasContent: true, preview: '产品质量问题描述...' },
        { step: 'D3', title: '实施临时措施', hasContent: false, preview: '' },
        { step: 'D4', title: '根本原因分析', hasContent: true, preview: '通过鱼骨图分析...' },
        { step: 'D5', title: '选择永久纠正措施', hasContent: false, preview: '' },
        { step: 'D6', title: '实施永久纠正措施', hasContent: false, preview: '' },
        { step: 'D7', title: '预防再发生', hasContent: false, preview: '' },
        { step: 'D8', title: '团队祝贺', hasContent: false, preview: '' }
      ] : null,
      sections: !is8DReport ? [
        { title: '问题描述', preview: '产品在使用过程中出现...' },
        { title: '数据分析', preview: '根据收集的数据显示...' },
        { title: '解决方案', preview: '建议采取以下措施...' }
      ] : null
    }
    
    ElMessage.success('文件分析完成!')
  } catch (error) {
    console.error('文件分析失败:', error)
    ElMessage.error('文件分析失败，请重试')
  }
}

const startCleaning = async () => {
  try {
    cleaningProgress.value = {
      show: true,
      currentStep: 0,
      percentage: 0,
      status: 'active',
      message: '开始解析文件...'
    }
    
    // 模拟清洗过程
    const steps = [
      { step: 0, message: '正在解析文件内容...', percentage: 20 },
      { step: 1, message: '正在提取关键数据...', percentage: 40 },
      { step: 2, message: '正在清洗和标准化数据...', percentage: 60 },
      { step: 3, message: '正在验证数据质量...', percentage: 80 },
      { step: 4, message: '正在生成清洗报告...', percentage: 100 }
    ]
    
    for (const stepInfo of steps) {
      await new Promise(resolve => setTimeout(resolve, 1500))
      cleaningProgress.value.currentStep = stepInfo.step
      cleaningProgress.value.percentage = stepInfo.percentage
      cleaningProgress.value.message = stepInfo.message
    }
    
    cleaningProgress.value.status = 'success'
    cleaningProgress.value.message = '数据清洗完成!'
    
    // 生成清洗结果
    cleaningResult.value = {
      stats: {
        originalCount: 1250,
        cleanedCount: 1180,
        qualityScore: 92.5,
        processingTime: 8.5
      },
      overview: {
        // 清洗概览数据
      },
      cleanedData: {
        // 清洗后的数据
      },
      qualityReport: {
        // 质量报告数据
      },
      logs: [
        { time: '2025-01-18 10:30:01', level: 'INFO', message: '开始文件解析' },
        { time: '2025-01-18 10:30:03', level: 'WARN', message: '发现3条重复数据' },
        { time: '2025-01-18 10:30:05', level: 'INFO', message: '数据清洗完成' }
      ]
    }
    
    ElMessage.success('数据清洗完成!')
  } catch (error) {
    console.error('数据清洗失败:', error)
    cleaningProgress.value.status = 'exception'
    cleaningProgress.value.message = '清洗过程中出现错误'
    ElMessage.error('数据清洗失败，请重试')
  }
}

const downloadResult = () => {
  ElMessage.success('正在准备下载文件...')
}

const exportReport = () => {
  ElMessage.success('正在生成清洗报告...')
}
</script>

<style scoped>
.data-cleaning-governance {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.subtitle {
  color: #7f8c8d;
  font-size: 16px;
}

.upload-section {
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-dragger {
  width: 100%;
}

.analysis-section,
.cleaning-section,
.result-section {
  margin-bottom: 30px;
}

.file-info {
  margin-bottom: 20px;
}

.structure-preview {
  margin-top: 20px;
}

.d-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.d-step {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s;
}

.d-step.has-content {
  border-color: #67c23a;
  background-color: #f0f9ff;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.step-preview {
  color: #606266;
  font-size: 14px;
}

.content-preview .section {
  margin-bottom: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.progress-content {
  text-align: center;
}

.progress-details {
  margin-top: 30px;
}

.progress-text {
  margin-top: 10px;
  color: #606266;
}

.cleaning-stats {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.header-actions {
  display: flex;
  gap: 10px;
}
</style>
