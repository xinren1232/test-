<template>
  <div class="data-cleaning-governance">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>📊 数据清洗治理</h1>
      <p class="subtitle">支持常规案例和8D报告的智能数据清洗与治理</p>
    </div>

    <!-- 数据源选择区域 -->
    <div class="data-source-section">
      <div class="source-selector">
        <h2>选择数据源类型</h2>
        <p class="selector-subtitle">不同的数据源将使用专门的处理逻辑进行解析和清洗</p>

        <div class="source-options">
          <div
            v-for="source in dataSources"
            :key="source.type"
            class="source-option"
            :class="{ active: selectedDataSource === source.type }"
            @click="selectDataSource(source.type)"
          >
            <div class="source-icon">
              <el-icon :size="32">
                <component :is="source.icon" />
              </el-icon>
            </div>
            <div class="source-info">
              <h3>{{ source.title }}</h3>
              <p>{{ source.description }}</p>
              <div class="source-features">
                <el-tag
                  v-for="feature in source.features"
                  :key="feature"
                  size="small"
                  type="info"
                  class="feature-tag"
                >
                  {{ feature }}
                </el-tag>
              </div>
            </div>
            <div class="source-formats">
              <span class="formats-label">支持格式:</span>
              <div class="formats-list">
                <span
                  v-for="format in source.formats"
                  :key="format"
                  class="format-item"
                >
                  {{ format }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 文件上传区域 -->
    <div v-if="selectedDataSource" class="upload-section">
      <el-card class="upload-card">
        <template #header>
          <div class="card-header">
            <span>📁 {{ getSelectedSourceTitle() }}</span>
            <div class="header-tags">
              <el-tag type="primary">{{ selectedDataSource }}</el-tag>
              <el-tag v-if="analysisResult" :type="fileTypeTagType">{{ fileTypeDisplay }}</el-tag>
            </div>
          </div>
        </template>

        <div class="upload-content">
          <!-- 数据源特定说明 -->
          <div class="source-instructions">
            <div class="instruction-item">
              <el-icon class="instruction-icon"><InfoFilled /></el-icon>
              <span>{{ getSelectedSourceInstructions() }}</span>
            </div>
            <div class="processing-info">
              <span class="processing-label">处理方式:</span>
              <span class="processing-method">{{ getSelectedProcessingMethod() }}</span>
            </div>
          </div>

          <el-upload
            ref="uploadRef"
            class="upload-dragger"
            drag
            :auto-upload="false"
            :on-change="handleFileChange"
            :before-upload="beforeUpload"
            :accept="getSelectedAcceptTypes()"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将{{ getSelectedSourceTitle() }}拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                {{ getSelectedUploadTip() }}
              </div>
            </template>
          </el-upload>

          <!-- 示例文件 -->
          <div class="example-files">
            <h4>📋 示例文件</h4>
            <div class="example-list">
              <div
                v-for="example in getSelectedExamples()"
                :key="example.name"
                class="example-item"
                @click="loadExampleFile(example)"
              >
                <el-icon><Document /></el-icon>
                <span class="example-name">{{ example.name }}</span>
                <span class="example-desc">{{ example.description }}</span>
              </div>
            </div>
          </div>
        </div>
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
import {
  UploadFilled,
  Document,
  InfoFilled,
  Files,
  Notebook,
  DataAnalysis,
  PictureRounded,
  Connection
} from '@element-plus/icons-vue'
import CleaningOverview from './components/CleaningOverview.vue'
import DataPreview from './components/DataPreview.vue'
import QualityReport from './components/QualityReport.vue'
import CleaningLogs from './components/CleaningLogs.vue'
import { detectFileType } from '../../utils/fileTypeDetector.js'
import { parseD8Report } from '../../utils/parsers/d8ReportParser.js'
import { parseRegularCase } from '../../utils/parsers/regularCaseParser.js'
import { processMediaContent } from '../../utils/mediaContentProcessor.js'
import { DataCleaningEngine } from '../../utils/dataCleaningEngine.js'
import {
  getAllDataSourceConfigs,
  getDataSourceConfig,
  validateFileForDataSource,
  getCleaningRulesForDataSource
} from '../../utils/dataSourceConfig.js'

// 响应式数据
const uploadRef = ref()
const selectedDataSource = ref('')
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

// 数据源配置
const dataSources = ref(getAllDataSourceConfigs())

// 初始化数据清洗引擎
const cleaningEngine = new DataCleaningEngine({
  strictMode: false,
  preserveOriginal: true,
  logLevel: 'info'
})

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
const selectDataSource = (sourceType) => {
  selectedDataSource.value = sourceType
  // 清除之前的分析结果
  analysisResult.value = null
  cleaningResult.value = null
  cleaningProgress.value.show = false
}

const getSelectedSourceTitle = () => {
  const config = getDataSourceConfig(selectedDataSource.value)
  return config ? config.title : '文件上传'
}

const getSelectedSourceInstructions = () => {
  const config = getDataSourceConfig(selectedDataSource.value)
  return config ? config.instructions : ''
}

const getSelectedProcessingMethod = () => {
  const config = getDataSourceConfig(selectedDataSource.value)
  return config ? config.processingMethod : ''
}

const getSelectedAcceptTypes = () => {
  const config = getDataSourceConfig(selectedDataSource.value)
  return config ? config.acceptTypes : '.pdf,.doc,.docx,.txt,.xlsx,.xls'
}

const getSelectedUploadTip = () => {
  const config = getDataSourceConfig(selectedDataSource.value)
  return config ? config.uploadTip : '支持多种文件格式'
}

const getSelectedExamples = () => {
  const config = getDataSourceConfig(selectedDataSource.value)
  return config ? config.examples : []
}

const loadExampleFile = (example) => {
  ElMessage.info(`正在加载示例文件: ${example.name}`)
  // 这里可以加载预设的示例文件进行演示
  // 实际项目中可以从服务器获取示例文件
}

const handleFileChange = (file) => {
  console.log('文件选择:', file)
  console.log('选择的数据源:', selectedDataSource.value)
  analyzeFile(file)
}

const beforeUpload = (file) => {
  if (!selectedDataSource.value) {
    ElMessage.error('请先选择数据源类型!')
    return false
  }

  // 使用统一的文件验证函数
  const validation = validateFileForDataSource(file, selectedDataSource.value)

  if (!validation.valid) {
    ElMessage.error(validation.message)
    return false
  }

  return true
}

const analyzeFile = async (file) => {
  try {
    ElMessage.info(`正在分析${selectedDataSource.value}文件...`)

    let parseResult = null
    let detectionResult = null
    let mediaResult = null

    // 根据选择的数据源类型使用不同的处理逻辑
    switch (selectedDataSource.value) {
      case '8D报告':
        // 8D报告专用处理
        detectionResult = await detectFileType(file)
        const d8Content = await extractFileContent(file)
        parseResult = parseD8Report(d8Content)
        ElMessage.info('使用8D报告专用解析器处理')
        break

      case '常规案例':
        // 常规案例专用处理
        detectionResult = await detectFileType(file)
        const caseContent = await extractFileContent(file)
        parseResult = parseRegularCase(caseContent)
        ElMessage.info('使用常规案例解析器处理')
        break

      case '数据表格':
        // 表格数据专用处理
        parseResult = await processTableData(file)
        detectionResult = { documentType: '数据表格', confidence: 95 }
        ElMessage.info('使用表格数据解析器处理')
        break

      case '图像文档':
        // 图像文档专用处理
        mediaResult = await processMediaContent('', [file])
        parseResult = await processImageDocument(file)
        detectionResult = { documentType: '图像文档', confidence: 90 }
        ElMessage.info('使用图像文档处理器处理')
        break

      case '在线数据':
        // 在线数据专用处理
        parseResult = await processOnlineData(file)
        detectionResult = { documentType: '在线数据', confidence: 100 }
        ElMessage.info('使用在线数据处理器处理')
        break

      default:
        // 自动检测模式（兼容旧版本）
        detectionResult = await detectFileType(file)
        const content = await extractFileContent(file)
        if (detectionResult.documentType === '8D报告') {
          parseResult = parseD8Report(content)
        } else {
          parseResult = parseRegularCase(content)
        }
        ElMessage.info('使用自动检测模式处理')
    }

    // 如果还没有处理多媒体内容，则处理
    if (!mediaResult) {
      mediaResult = await processMediaContent('', [file])
    }

    analysisResult.value = {
      fileName: file.name,
      fileType: file.type,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      dataSource: selectedDataSource.value,
      documentType: detectionResult?.documentType || selectedDataSource.value,
      confidence: detectionResult?.confidence || 95,
      structure: parseResult?.structure || detectionResult?.structure,
      sections: parseResult?.structure ? Object.values(parseResult.structure) : null,
      mediaContent: mediaResult,
      parseResult,
      issues: parseResult?.issues || [],
      recommendations: parseResult?.recommendations || [],
      processingMethod: getSelectedProcessingMethod()
    }

    ElMessage.success(`${selectedDataSource.value}文件分析完成!`)
  } catch (error) {
    console.error('文件分析失败:', error)
    ElMessage.error(`${selectedDataSource.value}文件分析失败，请重试`)
  }
}

// 提取文件内容的辅助函数
const extractFileContent = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      // 这里应该根据文件类型进行不同的处理
      // 简化处理，实际应该使用专门的库来解析PDF、Word等
      resolve(e.target.result || '模拟文件内容')
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

// 表格数据专用处理函数
const processTableData = async (file) => {
  try {
    ElMessage.info('正在解析表格数据...')

    // 模拟表格数据解析
    const mockTableData = {
      reportType: '数据表格',
      parseTime: new Date().toISOString(),
      structure: {
        headers: ['序号', '产品名称', '检验日期', '检验结果', '备注'],
        rows: [
          ['1', '产品A', '2025-01-15', '合格', '无异常'],
          ['2', '产品B', '2025-01-16', '不合格', '尺寸超差'],
          ['3', '产品C', '2025-01-17', '合格', '无异常']
        ],
        rowCount: 3,
        columnCount: 5
      },
      extractedData: {
        totalRecords: 3,
        qualifiedCount: 2,
        unqualifiedCount: 1,
        qualificationRate: 66.7
      },
      issues: [
        {
          type: 'data_quality',
          message: '发现1条不合格记录',
          severity: 'medium'
        }
      ],
      recommendations: [
        {
          type: 'quality_improvement',
          title: '提升产品质量',
          description: '针对不合格产品进行原因分析和改进'
        }
      ]
    }

    return mockTableData
  } catch (error) {
    console.error('表格数据处理失败:', error)
    throw error
  }
}

// 图像文档专用处理函数
const processImageDocument = async (file) => {
  try {
    ElMessage.info('正在处理图像文档...')

    // 模拟图像文档处理
    const mockImageData = {
      reportType: '图像文档',
      parseTime: new Date().toISOString(),
      structure: {
        imageCount: 1,
        textBlocks: [
          { type: 'title', content: '检验报告', confidence: 95 },
          { type: 'content', content: '产品检验结果显示...', confidence: 88 },
          { type: 'signature', content: '检验员签名', confidence: 92 }
        ],
        extractedText: '通过OCR识别的文本内容...'
      },
      extractedData: {
        ocrConfidence: 90,
        textLength: 256,
        imageQuality: 'high'
      },
      issues: [
        {
          type: 'ocr_quality',
          message: '部分文字识别置信度较低',
          severity: 'low'
        }
      ],
      recommendations: [
        {
          type: 'image_quality',
          title: '提升图像质量',
          description: '建议使用更高分辨率的扫描设备'
        }
      ]
    }

    return mockImageData
  } catch (error) {
    console.error('图像文档处理失败:', error)
    throw error
  }
}

// 在线数据专用处理函数
const processOnlineData = async (file) => {
  try {
    ElMessage.info('正在处理在线数据...')

    // 模拟在线数据处理
    const mockOnlineData = {
      reportType: '在线数据',
      parseTime: new Date().toISOString(),
      structure: {
        dataSource: 'API接口',
        recordCount: 1000,
        fields: ['id', 'timestamp', 'value', 'status'],
        sampleData: [
          { id: 1, timestamp: '2025-01-18T10:00:00Z', value: 98.5, status: 'normal' },
          { id: 2, timestamp: '2025-01-18T10:01:00Z', value: 97.8, status: 'normal' },
          { id: 3, timestamp: '2025-01-18T10:02:00Z', value: 102.1, status: 'warning' }
        ]
      },
      extractedData: {
        totalRecords: 1000,
        normalCount: 950,
        warningCount: 45,
        errorCount: 5,
        dataQuality: 95.0
      },
      issues: [
        {
          type: 'data_anomaly',
          message: '发现5条异常数据',
          severity: 'medium'
        }
      ],
      recommendations: [
        {
          type: 'real_time_monitoring',
          title: '建立实时监控',
          description: '建议建立实时数据质量监控机制'
        }
      ]
    }

    return mockOnlineData
  } catch (error) {
    console.error('在线数据处理失败:', error)
    throw error
  }
}

const startCleaning = async () => {
  try {
    if (!analysisResult.value || !analysisResult.value.parseResult) {
      ElMessage.error('请先分析文件')
      return
    }

    cleaningProgress.value = {
      show: true,
      currentStep: 0,
      percentage: 0,
      status: 'active',
      message: '开始数据清洗...'
    }

    // 步骤1: 准备数据
    cleaningProgress.value.message = '正在准备数据...'
    cleaningProgress.value.percentage = 20
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 步骤2: 执行清洗规则
    cleaningProgress.value.currentStep = 1
    cleaningProgress.value.message = '正在执行清洗规则...'
    cleaningProgress.value.percentage = 40

    const dataToClean = analysisResult.value.parseResult.extractedData || {}

    // 根据数据源类型获取特定的清洗规则
    const cleaningRules = getCleaningRulesForDataSource(selectedDataSource.value)
    const cleaningOptions = {
      onlyRequired: false,
      includeCustom: true,
      rules: cleaningRules
    }

    const cleaningResult_temp = await cleaningEngine.cleanData(
      dataToClean,
      selectedDataSource.value,
      cleaningOptions
    )

    // 步骤3: 处理多媒体内容
    cleaningProgress.value.currentStep = 2
    cleaningProgress.value.message = '正在处理多媒体内容...'
    cleaningProgress.value.percentage = 60
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 步骤4: 生成质量报告
    cleaningProgress.value.currentStep = 3
    cleaningProgress.value.message = '正在生成质量报告...'
    cleaningProgress.value.percentage = 80
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 步骤5: 完成
    cleaningProgress.value.currentStep = 4
    cleaningProgress.value.message = '正在生成最终报告...'
    cleaningProgress.value.percentage = 100
    await new Promise(resolve => setTimeout(resolve, 500))

    cleaningProgress.value.status = 'success'
    cleaningProgress.value.message = '数据清洗完成!'

    // 生成最终结果
    cleaningResult.value = {
      stats: {
        originalCount: cleaningResult_temp.statistics.dataPoints || 0,
        cleanedCount: cleaningResult_temp.statistics.dataPoints - cleaningResult_temp.statistics.errorsFixed || 0,
        qualityScore: cleaningResult_temp.quality.after || 0,
        processingTime: cleaningResult_temp.statistics.processingTime / 1000 || 0
      },
      overview: {
        appliedRules: cleaningResult_temp.appliedRules,
        qualityImprovement: cleaningResult_temp.quality.improvement,
        issues: cleaningResult_temp.issues
      },
      cleanedData: cleaningResult_temp.cleanedData,
      originalData: cleaningResult_temp.originalData,
      qualityReport: {
        overallScore: cleaningResult_temp.quality.after,
        completeness: 92,
        accuracy: 88,
        consistency: 85,
        issues: cleaningResult_temp.issues,
        suggestions: analysisResult.value.recommendations
      },
      logs: generateCleaningLogs(cleaningResult_temp),
      mediaContent: analysisResult.value.mediaContent
    }

    ElMessage.success('数据清洗完成!')
  } catch (error) {
    console.error('数据清洗失败:', error)
    cleaningProgress.value.status = 'exception'
    cleaningProgress.value.message = '清洗过程中出现错误'
    ElMessage.error('数据清洗失败，请重试')
  }
}

// 生成清洗日志
const generateCleaningLogs = (cleaningResult) => {
  const logs = []

  logs.push({
    time: new Date().toISOString(),
    level: 'info',
    category: 'system',
    message: '开始数据清洗流程'
  })

  cleaningResult.appliedRules.forEach(rule => {
    logs.push({
      time: new Date().toISOString(),
      level: rule.success ? 'info' : 'error',
      category: 'rule_execution',
      message: `规则执行: ${rule.type}`,
      data: {
        changes: rule.changes,
        issues: rule.issues.length,
        processingTime: rule.processingTime
      }
    })
  })

  cleaningResult.issues.forEach(issue => {
    logs.push({
      time: new Date().toISOString(),
      level: issue.severity === 'high' ? 'error' : 'warn',
      category: 'validation',
      message: issue.message || '发现数据质量问题',
      details: issue.description
    })
  })

  logs.push({
    time: new Date().toISOString(),
    level: 'info',
    category: 'system',
    message: '数据清洗流程完成',
    data: {
      qualityImprovement: cleaningResult.quality.improvement,
      totalChanges: cleaningResult.statistics.errorsFixed
    }
  })

  return logs
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

.data-source-section {
  margin-bottom: 30px;
}

.source-selector {
  text-align: center;
  margin-bottom: 30px;
}

.source-selector h2 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 24px;
}

.selector-subtitle {
  color: #7f8c8d;
  font-size: 16px;
  margin-bottom: 30px;
}

.source-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.source-option {
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: white;
  position: relative;
  overflow: hidden;
}

.source-option:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.source-option.active {
  border-color: #409eff;
  background-color: #f0f9ff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.source-option.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #409eff, #67c23a);
}

.source-icon {
  text-align: center;
  margin-bottom: 15px;
  color: #409eff;
}

.source-info h3 {
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 18px;
  font-weight: 600;
}

.source-info p {
  color: #606266;
  margin-bottom: 15px;
  line-height: 1.6;
  font-size: 14px;
}

.source-features {
  margin-bottom: 15px;
}

.feature-tag {
  margin-right: 8px;
  margin-bottom: 5px;
}

.source-formats {
  border-top: 1px solid #f0f0f0;
  padding-top: 15px;
}

.formats-label {
  font-size: 12px;
  color: #909399;
  display: block;
  margin-bottom: 8px;
}

.formats-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.format-item {
  background-color: #f5f7fa;
  color: #606266;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.upload-section {
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-tags {
  display: flex;
  gap: 10px;
  align-items: center;
}

.upload-content {
  padding: 10px 0;
}

.source-instructions {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  border-left: 4px solid #409eff;
}

.instruction-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}

.instruction-icon {
  color: #409eff;
  margin-top: 2px;
}

.processing-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.processing-label {
  font-weight: 500;
  color: #606266;
}

.processing-method {
  color: #2c3e50;
  flex: 1;
  line-height: 1.5;
}

.example-files {
  margin-top: 30px;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 8px;
}

.example-files h4 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 16px;
}

.example-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 10px;
}

.example-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e4e7ed;
}

.example-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.example-name {
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
}

.example-desc {
  color: #909399;
  font-size: 12px;
  flex: 1;
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
