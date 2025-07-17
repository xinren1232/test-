<template>
  <div class="data-cleaning-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <!-- 左侧：图标和标题 -->
        <div class="header-left">
          <div class="title-icon-wrapper">
            <el-icon class="title-icon"><Tools /></el-icon>
          </div>
          <div class="title-info">
            <h1 class="main-title">数据清洗治理</h1>
          </div>
        </div>
        
        <!-- 中间：描述文字 -->
        <div class="header-center">
          <p class="description">智能化历史案例数据清洗与转换平台，支持多格式文件处理和AI增强提取</p>
        </div>
        
        <!-- 右侧：操作按钮 -->
        <div class="header-right">
          <el-button type="info" size="default" plain>
            <el-icon><Setting /></el-icon>
            全局参数管理
          </el-button>
          <el-button type="primary" size="default">
            <el-icon><Plus /></el-icon>
            新建清洗规则
          </el-button>
          <el-button type="success" size="default">
            <el-icon><Upload /></el-icon>
            导出规则模板
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 第一行：三列布局 -->
      <div class="top-row">
        <!-- 步骤1：文件上传 -->
        <el-card class="step-card upload-card" :class="{ active: currentStep >= 0 }">
          <template #header>
            <div class="card-header">
              <div class="step-indicator">
                <span class="step-number">1</span>
              </div>
              <div class="step-info">
                <h3>文件上传</h3>
                <p>上传需要处理的数据文件</p>
              </div>
              <div class="step-status">
                <el-tag v-if="fileList.length > 0" type="success" size="small">
                  {{ fileList.length }} 个文件
                </el-tag>
                <el-tag v-else type="info" size="small">待上传</el-tag>
              </div>
            </div>
          </template>

          <!-- 文件上传内容 -->
          <div class="upload-content">
            <el-upload
              class="upload-dragger"
              drag
              :action="uploadUrl"
              multiple
              :on-success="handleUploadSuccess"
              :before-upload="beforeUpload"
              :file-list="fileList"
              :on-remove="handleRemove"
            >
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <div class="feature-list">
                <div class="feature-item">
                  <el-icon><Document /></el-icon>
                  <span>多格式支持</span>
                </div>
                <div class="feature-item">
                  <el-icon><DataAnalysis /></el-icon>
                  <span>智能识别</span>
                </div>
                <div class="feature-item">
                  <el-icon><Setting /></el-icon>
                  <span>安全处理</span>
                </div>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持 PDF、Word、Excel、CSV 等格式，单个文件不超过 10MB
                </div>
              </template>
            </el-upload>

            <!-- 文件列表 -->
            <div v-if="fileList.length > 0" class="file-list">
              <h4>已上传文件</h4>
              <div class="file-items">
                <div v-for="file in fileList" :key="file.id" class="file-item">
                  <el-icon><Document /></el-icon>
                  <span class="file-name">{{ file.name }}</span>
                  <el-tag :type="getFileStatusType(file.status)" size="small">
                    {{ file.status }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 步骤2：处理配置 -->
        <el-card class="step-card config-card" :class="{ active: currentStep >= 1 }">
          <template #header>
            <div class="card-header">
              <div class="step-indicator">
                <span class="step-number">2</span>
              </div>
              <div class="step-info">
                <h3>处理配置</h3>
                <p>设置数据清洗规则和字段提取</p>
              </div>
              <div class="step-actions">
                <el-button size="small" :icon="RefreshRight" @click="resetConfig">
                  重置
                </el-button>
              </div>
            </div>
          </template>

          <!-- 处理配置内容 -->
          <div class="config-content">
            <!-- 处理模式选择 -->
            <div class="process-modes">
              <h4>处理模式</h4>
              <div class="mode-options">
                <div class="mode-item" :class="{ active: processMode === 'standard' }" @click="processMode = 'standard'">
                  <div class="mode-icon">
                    <el-icon><DataAnalysis /></el-icon>
                  </div>
                  <div class="mode-info">
                    <div class="mode-title">标准模式</div>
                    <div class="mode-desc">快速清洗，基础字段提取</div>
                  </div>
                </div>
                <div class="mode-item" :class="{ active: processMode === 'deep' }" @click="processMode = 'deep'">
                  <div class="mode-icon">
                    <el-icon><Setting /></el-icon>
                  </div>
                  <div class="mode-info">
                    <div class="mode-title">深度模式</div>
                    <div class="mode-desc">AI增强，全字段提取</div>
                  </div>
                </div>
                <div class="mode-item" :class="{ active: processMode === 'custom' }" @click="processMode = 'custom'">
                  <div class="mode-icon">
                    <el-icon><Tools /></el-icon>
                  </div>
                  <div class="mode-info">
                    <div class="mode-title">自定义</div>
                    <div class="mode-desc">个性化配置规则</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 字段提取配置 -->
            <div class="field-extraction">
              <h4>字段提取</h4>
              <el-checkbox-group v-model="extractFields" class="field-checkboxes">
                <el-checkbox label="MaterialCode">物料编码</el-checkbox>
                <el-checkbox label="MaterialName">物料名称</el-checkbox>
                <el-checkbox label="Supplier">供应商</el-checkbox>
                <el-checkbox label="IssueType">问题类型</el-checkbox>
                <el-checkbox label="Description">问题描述</el-checkbox>
                <el-checkbox label="TemporaryAction">临时对策</el-checkbox>
                <el-checkbox label="ResponsibleDept">责任部门</el-checkbox>
                <el-checkbox label="ProcessResult">处理结果</el-checkbox>
              </el-checkbox-group>
            </div>

            <!-- AI增强选项 -->
            <div class="ai-enhancement">
              <h4>AI增强</h4>
              <el-switch
                v-model="enableAI"
                active-text="启用AI增强提取"
                inactive-text="仅使用传统提取"
                size="default"
              />
            </div>
          </div>
        </el-card>

        <!-- 步骤4：结果分析 -->
        <el-card class="step-card result-card" :class="{ active: currentStep >= 3 }">
          <template #header>
            <div class="card-header">
              <div class="step-indicator">
                <span class="step-number">4</span>
              </div>
              <div class="step-info">
                <h3>结果分析</h3>
                <p>查看处理结果和统计分析</p>
              </div>
              <div class="step-actions">
                <el-button size="small" @click="downloadResult" :disabled="!hasResults">
                  下载结果
                </el-button>
              </div>
            </div>
          </template>

          <!-- 结果分析内容 -->
          <div class="result-content" v-if="hasResults">
            <!-- 关键指标 -->
            <div class="key-metrics">
              <div class="metric-item">
                <span class="metric-value">{{ processResult.totalRecords }}</span>
                <span class="metric-label">处理记录</span>
              </div>
              <div class="metric-item">
                <span class="metric-value">{{ processResult.successRate }}%</span>
                <span class="metric-label">成功率</span>
              </div>
              <div class="metric-item">
                <span class="metric-value">{{ processResult.extractedFields }}</span>
                <span class="metric-label">提取字段</span>
              </div>
            </div>

            <!-- 字段提取结果 -->
            <div class="extraction-results">
              <h4>字段提取结果</h4>
              <div class="field-results">
                <div class="field-result" v-for="field in processResult.fieldResults" :key="field.name">
                  <div class="field-header">
                    <span class="field-name">{{ field.label }}</span>
                    <span class="field-rate">{{ field.extractionRate }}%</span>
                  </div>
                  <div class="field-bar">
                    <div class="field-fill" :style="{ width: field.extractionRate + '%' }"></div>
                  </div>
                  <div class="field-sample">
                    <span class="sample-label">示例:</span>
                    <span class="sample-value">{{ field.sampleValue }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 无结果提示 -->
          <div class="no-results" v-else>
            <el-empty description="暂无处理结果">
              <el-button type="primary" @click="currentStep = 0">开始处理</el-button>
            </el-empty>
          </div>
        </el-card>
      </div>

      <!-- 第二行：执行处理（独占一行） -->
      <div class="bottom-row">
        <!-- 步骤3：处理执行区域 -->
        <el-card class="step-card process-card full-width" :class="{ active: currentStep >= 2 }">
          <template #header>
            <div class="card-header">
              <div class="step-indicator">
                <span class="step-number">3</span>
              </div>
              <div class="step-info">
                <h3>执行处理</h3>
                <p>运行数据清洗和字段提取 - 核心处理流程展示</p>
              </div>
              <div class="step-actions">
                <el-button
                  type="primary"
                  size="default"
                  :loading="processing"
                  @click="startProcessing"
                  :disabled="fileList.length === 0 || extractFields.length === 0"
                >
                  {{ processing ? '处理中...' : '开始处理' }}
                </el-button>
              </div>
            </div>
          </template>

          <!-- 处理执行内容 - 核心展示区域 -->
          <div class="process-execution">
            <!-- 处理状态总览 -->
            <div class="process-overview">
              <div class="overview-stats">
                <div class="stat-card">
                  <div class="stat-icon">
                    <el-icon><Document /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ fileList.length }}</div>
                    <div class="stat-label">待处理文件</div>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">
                    <el-icon><Tools /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ extractFields.length }}</div>
                    <div class="stat-label">提取字段</div>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">
                    <el-icon><Setting /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ getModeLabel(processMode) }}</div>
                    <div class="stat-label">处理模式</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 处理流程可视化 -->
            <div class="process-flow" v-if="processing">
              <div class="flow-header">
                <h4>数据处理流程</h4>
                <div class="flow-progress">
                  <span class="progress-text">{{ processSteps[currentProcessStep] }}</span>
                  <span class="progress-percent">{{ progressPercentage }}%</span>
                </div>
              </div>

              <!-- 流程步骤可视化 -->
              <div class="flow-steps">
                <div class="flow-step" v-for="(step, index) in processSteps" :key="index"
                     :class="{
                       active: index === currentProcessStep,
                       completed: index < currentProcessStep,
                       pending: index > currentProcessStep
                     }">
                  <div class="step-circle">
                    <el-icon v-if="index < currentProcessStep" class="step-icon completed">
                      <Check />
                    </el-icon>
                    <el-icon v-else-if="index === currentProcessStep" class="step-icon active">
                      <Loading />
                    </el-icon>
                    <span v-else class="step-number">{{ index + 1 }}</span>
                  </div>
                  <div class="step-content">
                    <div class="step-title">{{ step }}</div>
                    <div class="step-description">{{ getStepDescription(step) }}</div>
                  </div>
                  <div class="step-connector" v-if="index < processSteps.length - 1"></div>
                </div>
              </div>

              <!-- 总体进度条 -->
              <div class="overall-progress">
                <el-progress
                  :percentage="progressPercentage"
                  :status="progressStatus"
                  :stroke-width="8"
                  :show-text="false"
                />
              </div>
            </div>

            <!-- 实时处理详情 -->
            <div class="process-details" v-if="processing">
              <div class="details-grid">
                <!-- 左侧：实时日志 -->
                <div class="detail-panel logs-panel">
                  <div class="panel-header">
                    <el-icon><Document /></el-icon>
                    <h4>实时日志</h4>
                    <el-tag size="small" type="info">{{ processLogs.length }} 条</el-tag>
                  </div>
                  <div class="log-container">
                    <div class="log-item" v-for="(log, index) in processLogs" :key="index">
                      <div class="log-indicator"></div>
                      <div class="log-content">
                        <span class="log-time">{{ log.time }}</span>
                        <span class="log-message">{{ log.message }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 右侧：处理统计 -->
                <div class="detail-panel stats-panel">
                  <div class="panel-header">
                    <el-icon><DataAnalysis /></el-icon>
                    <h4>处理统计</h4>
                  </div>
                  <div class="stats-content">
                    <div class="stat-row">
                      <span class="stat-label">当前步骤:</span>
                      <el-tag type="primary" size="small">{{ processSteps[currentProcessStep] }}</el-tag>
                    </div>
                    <div class="stat-row">
                      <span class="stat-label">已处理:</span>
                      <span class="stat-value">{{ Math.round(progressPercentage) }}%</span>
                    </div>
                    <div class="stat-row">
                      <span class="stat-label">预计剩余:</span>
                      <span class="stat-value">{{ Math.max(0, 100 - progressPercentage) }}%</span>
                    </div>
                    <div class="stat-row">
                      <span class="stat-label">处理速度:</span>
                      <span class="stat-value">{{ getProcessingSpeed() }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 待处理状态展示 -->
            <div class="ready-state" v-if="!processing">
              <div class="ready-content">
                <div class="ready-icon">
                  <el-icon><Tools /></el-icon>
                </div>
                <h3>准备开始数据处理</h3>
                <p>已配置 {{ extractFields.length }} 个提取字段，{{ fileList.length }} 个文件待处理</p>

                <!-- 配置预览卡片 -->
                <div class="config-cards">
                  <div class="config-card">
                    <div class="config-icon">
                      <el-icon><Setting /></el-icon>
                    </div>
                    <div class="config-info">
                      <div class="config-title">处理模式</div>
                      <div class="config-value">{{ getModeLabel(processMode) }}</div>
                    </div>
                  </div>
                  <div class="config-card">
                    <div class="config-icon">
                      <el-icon><Document /></el-icon>
                    </div>
                    <div class="config-info">
                      <div class="config-title">文件数量</div>
                      <div class="config-value">{{ fileList.length }} 个文件</div>
                    </div>
                  </div>
                  <div class="config-card">
                    <div class="config-icon">
                      <el-icon><DataAnalysis /></el-icon>
                    </div>
                    <div class="config-info">
                      <div class="config-title">提取字段</div>
                      <div class="config-value">{{ extractFields.length }} 个字段</div>
                    </div>
                  </div>
                </div>

                <!-- 预估信息 -->
                <div class="estimation-info">
                  <div class="estimation-item">
                    <span class="estimation-label">预计处理时间:</span>
                    <span class="estimation-value">{{ getEstimatedTime() }}</span>
                  </div>
                  <div class="estimation-item">
                    <span class="estimation-label">预计生成记录:</span>
                    <span class="estimation-value">{{ getEstimatedRecords() }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Tools, Upload, Document, Setting, DataAnalysis, Loading, UploadFilled,
  Plus, RefreshRight, Check, Download
} from '@element-plus/icons-vue'

export default {
  name: 'DataCleaningPage',
  components: {
    Tools, Upload, Document, Setting, DataAnalysis, Loading, UploadFilled,
    Plus, RefreshRight, Check, Download
  },
  setup() {
    // 基础数据
    const uploadUrl = ref('http://localhost:3001/api/data-cleaning/upload')
    const fileList = ref([])
    const currentStep = ref(0)
    const processMode = ref('standard')
    const extractFields = ref(['MaterialCode', 'MaterialName', 'Supplier'])
    const enableAI = ref(true)

    // 处理状态
    const processing = ref(false)
    const hasResults = ref(false)
    const progressPercentage = ref(0)
    const currentProcessStep = ref(0)
    const progressStatus = ref('')
    const processSteps = ref([
      '文件解析',
      '内容提取',
      '数据清洗',
      '字段识别',
      '结果生成'
    ])
    const processLogs = ref([])
    const processResult = ref({
      totalRecords: 0,
      successRate: 0,
      extractedFields: 0,
      fieldResults: []
    })

    // 文件上传处理
    const handleUploadSuccess = (response, file) => {
      fileList.value.push({
        id: Date.now(),
        name: file.name,
        status: '待处理',
        size: file.size
      })
      currentStep.value = Math.max(currentStep.value, 1)
      ElMessage.success('文件上传成功')
    }

    const beforeUpload = (file) => {
      const isValidType = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/csv'].includes(file.type)
      if (!isValidType) {
        ElMessage.error('只支持 PDF、Word、CSV 格式文件')
        return false
      }
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        ElMessage.error('文件大小不能超过 10MB')
        return false
      }
      return true
    }

    const handleRemove = (file) => {
      const index = fileList.value.findIndex(f => f.name === file.name)
      if (index > -1) {
        fileList.value.splice(index, 1)
      }
    }

    const getFileStatusType = (status) => {
      const statusMap = {
        '待处理': 'info',
        '处理中': 'warning',
        '已完成': 'success',
        '处理失败': 'danger'
      }
      return statusMap[status] || 'info'
    }

    // 配置重置
    const resetConfig = () => {
      processMode.value = 'standard'
      extractFields.value = ['MaterialCode', 'MaterialName', 'Supplier']
      enableAI.value = true
      ElMessage.success('配置已重置')
    }

    // 获取模式标签
    const getModeLabel = (mode) => {
      const labels = {
        'standard': '标准模式',
        'deep': '深度模式',
        'custom': '自定义模式'
      }
      return labels[mode] || mode
    }

    // 获取步骤描述
    const getStepDescription = (step) => {
      const descriptions = {
        '文件解析': '解析上传文件，提取原始内容',
        '内容提取': '从文档中提取文本和结构信息',
        '数据清洗': '应用清洗规则，去除噪声数据',
        '字段识别': '识别并提取目标字段信息',
        '结果生成': '生成最终的结构化数据结果'
      }
      return descriptions[step] || '处理中...'
    }

    // 获取处理速度
    const getProcessingSpeed = () => {
      if (progressPercentage.value === 0) return '计算中...'
      const speed = Math.round(progressPercentage.value / 5) // 假设每秒处理20%
      return `${speed} 记录/秒`
    }

    // 获取预估时间
    const getEstimatedTime = () => {
      const baseTime = fileList.value.length * 2 // 每个文件2秒基础时间
      const fieldMultiplier = extractFields.value.length * 0.5 // 每个字段增加0.5秒
      const totalSeconds = Math.round(baseTime + fieldMultiplier)
      return `约 ${totalSeconds} 秒`
    }

    // 获取预估记录数
    const getEstimatedRecords = () => {
      const recordsPerFile = 15 // 假设每个文件平均15条记录
      const totalRecords = fileList.value.length * recordsPerFile
      return `约 ${totalRecords} 条`
    }

    // 开始处理
    const startProcessing = () => {
      if (fileList.value.length === 0) {
        ElMessage.warning('请先上传文件')
        return
      }
      if (extractFields.value.length === 0) {
        ElMessage.warning('请选择要提取的字段')
        return
      }

      processing.value = true
      currentStep.value = 2
      progressPercentage.value = 0
      currentProcessStep.value = 0
      processLogs.value = []

      // 更新文件状态
      fileList.value.forEach(file => {
        file.status = '处理中'
      })

      // 模拟处理过程
      const processInterval = setInterval(() => {
        if (currentProcessStep.value < processSteps.value.length) {
          progressPercentage.value = Math.round((currentProcessStep.value + 1) / processSteps.value.length * 100)

          const now = new Date().toLocaleTimeString()
          processLogs.value.push({
            time: now,
            message: `正在执行: ${processSteps.value[currentProcessStep.value]}`
          })

          currentProcessStep.value++
        } else {
          clearInterval(processInterval)
          processing.value = false
          hasResults.value = true
          currentStep.value = 3

          // 更新文件状态
          fileList.value.forEach(file => {
            file.status = '已完成'
          })

          // 生成模拟结果
          processResult.value = {
            totalRecords: 156,
            successRate: 92,
            extractedFields: extractFields.value.length,
            fieldResults: extractFields.value.map(field => ({
              name: field,
              label: getFieldLabel(field),
              extractionRate: Math.floor(85 + Math.random() * 15),
              sampleValue: getSampleValue(field)
            }))
          }

          processLogs.value.push({
            time: new Date().toLocaleTimeString(),
            message: '处理完成！'
          })

          ElMessage.success('数据处理完成')
        }
      }, 1000)
    }

    // 下载结果
    const downloadResult = () => {
      if (!hasResults.value) {
        ElMessage.warning('暂无处理结果')
        return
      }
      ElMessage.success('结果下载中...')
    }

    // 辅助函数
    const getFieldLabel = (field) => {
      const labels = {
        'MaterialCode': '物料编码',
        'MaterialName': '物料名称',
        'Supplier': '供应商',
        'IssueType': '问题类型',
        'Description': '问题描述',
        'TemporaryAction': '临时对策',
        'ResponsibleDept': '责任部门',
        'ProcessResult': '处理结果'
      }
      return labels[field] || field
    }

    const getSampleValue = (field) => {
      const samples = {
        'MaterialCode': 'AXX-H1234',
        'MaterialName': '螺丝组件',
        'Supplier': '华星光电',
        'IssueType': '尺寸偏差',
        'Description': '螺丝孔位偏差导致治具无法安装',
        'TemporaryAction': '更换螺丝型号',
        'ResponsibleDept': '装配车间',
        'ProcessResult': '已整改完成'
      }
      return samples[field] || '示例数据'
    }

    return {
      uploadUrl,
      fileList,
      currentStep,
      processMode,
      extractFields,
      enableAI,
      processing,
      hasResults,
      progressPercentage,
      currentProcessStep,
      progressStatus,
      processSteps,
      processLogs,
      processResult,
      handleUploadSuccess,
      beforeUpload,
      handleRemove,
      getFileStatusType,
      resetConfig,
      getModeLabel,
      getStepDescription,
      getProcessingSpeed,
      getEstimatedTime,
      getEstimatedRecords,
      startProcessing,
      downloadResult,
      getFieldLabel,
      getSampleValue
    }
  }
}
</script>

<style scoped>
.data-cleaning-container {
  padding: 0;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px 40px;
  color: white;
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon-wrapper {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-icon {
  font-size: 24px;
  color: white;
}

.main-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.header-center {
  flex: 1;
  text-align: center;
  padding: 0 40px;
}

.description {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.5;
}

.header-right {
  display: flex;
  gap: 12px;
}

/* 主要内容区域 */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 40px 40px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 第一行：三列布局 */
.top-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}

/* 第二行：独占一行 */
.bottom-row {
  width: 100%;
}

/* 步骤卡片 */
.step-card {
  border: 2px solid #e4e7ed;
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.step-card.active {
  border-color: #6366f1;
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.15);
  background: linear-gradient(145deg, #ffffff 0%, #f0f4ff 100%);
}

.step-card.full-width {
  min-height: 500px;
}

/* 确保卡片内容填满高度 */
.step-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 三列布局中的卡片优化 */
.top-row .step-card {
  min-height: 400px;
}

.top-row .upload-card {
  min-height: 450px;
}

.top-row .result-card {
  min-height: 400px;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 4px 0;
}

.step-indicator {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
}

.step-info {
  flex: 1;
  min-width: 0;
}

.step-info h3 {
  margin: 0 0 4px 0;
  font-size: 15px;
  color: #303133;
  font-weight: 600;
  line-height: 1.3;
}

.step-info p {
  margin: 0;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.step-status {
  flex-shrink: 0;
}

.step-actions {
  flex-shrink: 0;
}

/* 底部行的步骤信息样式 */
.bottom-row .step-info h3 {
  font-size: 18px;
}

.bottom-row .step-info p {
  font-size: 13px;
}

/* 处理执行样式 - 核心展示区域 */
.process-execution {
  padding: 24px;
  background: linear-gradient(145deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 12px;
  min-height: 400px;
}

/* 处理状态总览 */
.process-overview {
  margin-bottom: 24px;
}

.overview-stats {
  display: flex;
  gap: 16px;
  justify-content: space-around;
}

.overview-stats .stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  flex: 1;
  transition: all 0.3s ease;
}

.overview-stats .stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.overview-stats .stat-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.overview-stats .stat-info {
  flex: 1;
}

.overview-stats .stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
}

.overview-stats .stat-label {
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;
}

/* 处理流程可视化 */
.process-flow {
  margin-bottom: 24px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.flow-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.flow-header h4 {
  margin: 0;
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
}

.flow-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-text {
  font-size: 14px;
  color: #6b7280;
}

.progress-percent {
  font-size: 16px;
  font-weight: 600;
  color: #6366f1;
}

.flow-steps {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  position: relative;
}

.flow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.step-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.flow-step.pending .step-circle {
  background: #f3f4f6;
  border: 2px solid #d1d5db;
}

.flow-step.active .step-circle {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: 2px solid #6366f1;
  animation: pulse 2s infinite;
}

.flow-step.completed .step-circle {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: 2px solid #10b981;
}

.step-number {
  font-size: 16px;
  font-weight: 600;
  color: #6b7280;
}

.step-icon {
  font-size: 20px;
}

.step-icon.active {
  color: white;
}

.step-icon.completed {
  color: white;
}

.step-content {
  text-align: center;
  max-width: 120px;
}

.step-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.step-description {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

.step-connector {
  position: absolute;
  top: 24px;
  left: 60%;
  right: -40%;
  height: 2px;
  background: #e5e7eb;
  z-index: 1;
}

.flow-step.completed + .flow-step .step-connector {
  background: linear-gradient(90deg, #10b981 0%, #e5e7eb 100%);
}

.flow-step.active .step-connector {
  background: linear-gradient(90deg, #6366f1 0%, #e5e7eb 100%);
}

.overall-progress {
  margin-top: 16px;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(99, 102, 241, 0);
  }
}

/* 上传内容样式 */
.upload-content {
  padding: 20px 0;
}

.upload-dragger {
  width: 100%;
}

.feature-list {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.file-list {
  margin-top: 20px;
}

.file-list h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #374151;
}

.file-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.file-name {
  flex: 1;
  font-size: 13px;
  color: #374151;
}

/* 配置内容样式 */
.config-content {
  padding: 20px 0;
}

.process-modes h4,
.field-extraction h4,
.ai-enhancement h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #374151;
}

.mode-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.mode-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-item:hover {
  border-color: #6366f1;
  background: #f8fafc;
}

.mode-item.active {
  border-color: #6366f1;
  background: #f0f4ff;
}

.mode-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
}

.mode-info {
  flex: 1;
}

.mode-title {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 2px;
}

.mode-desc {
  font-size: 11px;
  color: #6b7280;
}

.field-checkboxes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.field-checkboxes .el-checkbox {
  margin-right: 0;
}

/* 结果分析样式 */
.result-content {
  padding: 20px 0;
}

.key-metrics {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 24px;
}

.metric-item {
  text-align: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  flex: 1;
}

.metric-value {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: #6366f1;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 12px;
  color: #6b7280;
}

.extraction-results h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #374151;
}

.field-results {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field-result {
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.field-name {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.field-rate {
  font-size: 12px;
  font-weight: 600;
  color: #6366f1;
}

.field-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.field-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  transition: width 0.3s ease;
}

.field-sample {
  display: flex;
  gap: 8px;
  font-size: 11px;
}

.sample-label {
  color: #6b7280;
}

.sample-value {
  color: #374151;
  font-weight: 500;
}

.no-results {
  padding: 40px 20px;
  text-align: center;
}

/* 处理详情网格 */
.process-details {
  margin-bottom: 24px;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.detail-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.panel-header h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
}

.panel-header .el-icon {
  color: #6366f1;
  font-size: 16px;
}

.logs-panel .log-container {
  max-height: 200px;
  overflow-y: auto;
}

.logs-panel .log-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f9fafb;
}

.logs-panel .log-item:last-child {
  border-bottom: none;
}

.log-indicator {
  width: 8px;
  height: 8px;
  background: #6366f1;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.log-content {
  flex: 1;
}

.logs-panel .log-time {
  font-size: 12px;
  color: #6b7280;
  display: block;
  margin-bottom: 2px;
}

.logs-panel .log-message {
  font-size: 13px;
  color: #374151;
  line-height: 1.4;
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
}

.stat-row .stat-label {
  font-size: 13px;
  color: #6b7280;
}

.stat-row .stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

/* 待处理状态展示 */
.ready-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.ready-content {
  text-align: center;
  max-width: 600px;
}

.ready-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
  font-size: 32px;
}

.ready-content h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.ready-content p {
  margin: 0 0 24px 0;
  color: #6b7280;
  font-size: 14px;
}

.config-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.config-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.config-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.config-info {
  flex: 1;
}

.config-title {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 2px;
}

.config-value {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.estimation-info {
  display: flex;
  justify-content: center;
  gap: 32px;
}

.estimation-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.estimation-label {
  font-size: 12px;
  color: #6b7280;
}

.estimation-value {
  font-size: 14px;
  font-weight: 600;
  color: #6366f1;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .top-row {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
  }

  .top-row .step-card {
    min-height: 380px;
  }
}

@media (max-width: 1200px) {
  .main-content {
    padding: 0 20px 20px 20px;
  }

  .top-row {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .top-row .step-card {
    min-height: 300px;
  }

  .bottom-row .step-card.full-width {
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 0 16px 16px 16px;
  }

  .page-header {
    padding: 16px 20px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .step-card .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .step-indicator {
    width: 36px;
    height: 36px;
  }

  .step-info h3 {
    font-size: 14px;
  }

  .step-info p {
    font-size: 11px;
  }
}
</style>
