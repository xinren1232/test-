<template>
  <div class="process-monitor">
    <!-- 流程概览 -->
    <div class="process-overview">
      <el-card class="overview-card">
        <template #header>
          <div class="card-header">
            <h3>📊 数据处理流程监控</h3>
            <div class="process-status">
              <el-tag :type="getOverallStatusType()" size="large">
                {{ getOverallStatusText() }}
              </el-tag>
            </div>
          </div>
        </template>

        <!-- 流程进度条 -->
        <div class="process-progress">
          <el-steps :active="currentStepIndex" finish-status="success" align-center>
            <el-step
              v-for="(stage, index) in processStages"
              :key="stage.key"
              :title="stage.title"
              :description="stage.description"
              :status="getStepStatus(stage, index)"
            >
              <template #icon>
                <el-icon v-if="stage.status === 'processing'">
                  <Loading />
                </el-icon>
                <el-icon v-else-if="stage.status === 'completed'">
                  <CircleCheck />
                </el-icon>
                <el-icon v-else-if="stage.status === 'error'">
                  <CircleClose />
                </el-icon>
                <el-icon v-else>
                  <component :is="stage.icon" />
                </el-icon>
              </template>
            </el-step>
          </el-steps>
        </div>

        <!-- 总体进度 -->
        <div class="overall-progress">
          <div class="progress-info">
            <span>总体进度</span>
            <span>{{ overallProgress }}%</span>
          </div>
          <el-progress 
            :percentage="overallProgress" 
            :status="overallProgress === 100 ? 'success' : 'primary'"
            :stroke-width="8"
          />
        </div>
      </el-card>
    </div>

    <!-- 详细阶段信息 -->
    <div class="stages-detail">
      <el-row :gutter="20">
        <el-col 
          v-for="stage in processStages" 
          :key="stage.key"
          :span="8"
        >
          <el-card 
            class="stage-card"
            :class="{ 
              'active': stage.status === 'processing',
              'completed': stage.status === 'completed',
              'error': stage.status === 'error'
            }"
          >
            <template #header>
              <div class="stage-header">
                <div class="stage-title">
                  <el-icon><component :is="stage.icon" /></el-icon>
                  <span>{{ stage.title }}</span>
                </div>
                <div class="stage-status">
                  <el-tag :type="getStageStatusType(stage.status)" size="small">
                    {{ getStageStatusText(stage.status) }}
                  </el-tag>
                </div>
              </div>
            </template>

            <div class="stage-content">
              <div class="stage-progress">
                <el-progress 
                  :percentage="stage.progress" 
                  :status="getProgressStatus(stage.status)"
                  :stroke-width="6"
                />
              </div>

              <div class="stage-details">
                <div class="detail-item">
                  <span class="label">开始时间:</span>
                  <span class="value">{{ formatTime(stage.startTime) }}</span>
                </div>
                <div class="detail-item" v-if="stage.endTime">
                  <span class="label">结束时间:</span>
                  <span class="value">{{ formatTime(stage.endTime) }}</span>
                </div>
                <div class="detail-item" v-if="stage.duration">
                  <span class="label">耗时:</span>
                  <span class="value">{{ formatDuration(stage.duration) }}</span>
                </div>
                <div class="detail-item" v-if="stage.processedCount !== undefined">
                  <span class="label">处理记录:</span>
                  <span class="value">{{ stage.processedCount }} / {{ stage.totalCount }}</span>
                </div>
              </div>

              <!-- 阶段特定信息 -->
              <div v-if="stage.details" class="stage-specific">
                <el-divider />
                <div v-if="stage.key === 'upload'" class="upload-details">
                  <div class="files-info">
                    <div class="info-item">
                      <el-icon><Document /></el-icon>
                      <span>文件数量: {{ stage.details.fileCount }}</span>
                    </div>
                    <div class="info-item">
                      <el-icon><FolderOpened /></el-icon>
                      <span>总大小: {{ formatFileSize(stage.details.totalSize) }}</span>
                    </div>
                  </div>
                </div>

                <div v-else-if="stage.key === 'parsing'" class="parsing-details">
                  <div class="parsing-info">
                    <div class="info-item">
                      <el-icon><DataLine /></el-icon>
                      <span>解析行数: {{ stage.details.parsedRows }}</span>
                    </div>
                    <div class="info-item">
                      <el-icon><Grid /></el-icon>
                      <span>字段数: {{ stage.details.columnCount }}</span>
                    </div>
                  </div>
                </div>

                <div v-else-if="stage.key === 'cleaning'" class="cleaning-details">
                  <div class="cleaning-stats">
                    <div class="stat-item">
                      <span class="stat-label">应用规则:</span>
                      <span class="stat-value">{{ stage.details.appliedRules }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">清洗记录:</span>
                      <span class="stat-value">{{ stage.details.cleanedRecords }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">错误记录:</span>
                      <span class="stat-value error">{{ stage.details.errorRecords }}</span>
                    </div>
                  </div>
                </div>

                <div v-else-if="stage.key === 'extraction'" class="extraction-details">
                  <div class="extraction-info">
                    <div class="info-item">
                      <el-icon><Key /></el-icon>
                      <span>提取字段: {{ stage.details.extractedFields }}</span>
                    </div>
                    <div class="info-item">
                      <el-icon><PieChart /></el-icon>
                      <span>结构化率: {{ stage.details.structureRate }}%</span>
                    </div>
                  </div>
                </div>

                <div v-else-if="stage.key === 'summary'" class="summary-details">
                  <div class="summary-info">
                    <div class="info-item">
                      <el-icon><TrendCharts /></el-icon>
                      <span>生成图表: {{ stage.details.chartsGenerated }}</span>
                    </div>
                    <div class="info-item">
                      <el-icon><Notebook /></el-icon>
                      <span>报告页数: {{ stage.details.reportPages }}</span>
                    </div>
                  </div>
                </div>

                <div v-else-if="stage.key === 'ai-summary'" class="ai-details">
                  <div class="ai-info">
                    <div class="info-item">
                      <el-icon><MagicStick /></el-icon>
                      <span>AI模型: {{ stage.details.aiModel }}</span>
                    </div>
                    <div class="info-item">
                      <el-icon><ChatDotRound /></el-icon>
                      <span>置信度: {{ stage.details.confidence }}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 错误信息 -->
              <div v-if="stage.status === 'error' && stage.error" class="error-info">
                <el-alert
                  :title="stage.error.message"
                  type="error"
                  :description="stage.error.details"
                  show-icon
                  :closable="false"
                />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 实时日志 -->
    <div class="process-logs">
      <el-card>
        <template #header>
          <div class="logs-header">
            <h4>📝 处理日志</h4>
            <div class="logs-actions">
              <el-button size="small" @click="clearLogs">
                <el-icon><Delete /></el-icon>
                清空日志
              </el-button>
              <el-button size="small" @click="exportLogs">
                <el-icon><Download /></el-icon>
                导出日志
              </el-button>
            </div>
          </div>
        </template>

        <div class="logs-content">
          <div 
            v-for="(log, index) in processLogs" 
            :key="index"
            class="log-item"
            :class="log.level"
          >
            <span class="log-time">{{ formatTime(log.timestamp) }}</span>
            <span class="log-level">{{ log.level.toUpperCase() }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 操作按钮 -->
    <div class="process-actions">
      <el-button 
        v-if="canPause" 
        type="warning" 
        @click="pauseProcess"
      >
        <el-icon><VideoPause /></el-icon>
        暂停处理
      </el-button>
      
      <el-button 
        v-if="canResume" 
        type="primary" 
        @click="resumeProcess"
      >
        <el-icon><VideoPlay /></el-icon>
        继续处理
      </el-button>
      
      <el-button 
        v-if="canStop" 
        type="danger" 
        @click="stopProcess"
      >
        <el-icon><Close /></el-icon>
        停止处理
      </el-button>
      
      <el-button 
        v-if="isCompleted" 
        type="success" 
        @click="viewResults"
      >
        <el-icon><View /></el-icon>
        查看结果
      </el-button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Loading,
  CircleCheck,
  CircleClose,
  Upload,
  DataAnalysis,
  Setting,
  MagicStick,
  TrendCharts,
  ChatDotRound,
  Document,
  FolderOpened,
  DataLine,
  Grid,
  Key,
  PieChart,
  Notebook,
  Delete,
  Download,
  VideoPause,
  VideoPlay,
  Close,
  View
} from '@element-plus/icons-vue'

export default {
  name: 'ProcessMonitor',
  components: {
    Loading,
    CircleCheck,
    CircleClose,
    Upload,
    DataAnalysis,
    Setting,
    MagicStick,
    TrendCharts,
    ChatDotRound,
    Document,
    FolderOpened,
    DataLine,
    Grid,
    Key,
    PieChart,
    Notebook,
    Delete,
    Download,
    VideoPause,
    VideoPlay,
    Close,
    View
  },
  props: {
    processingData: {
      type: Object,
      default: null
    },
    currentStage: {
      type: String,
      default: ''
    }
  },
  emits: ['stage-completed'],
  setup(props, { emit }) {
    const processTimer = ref(null)
    const processLogs = ref([])

    // 处理阶段定义
    const processStages = ref([
      {
        key: 'upload',
        title: '数据上传',
        description: '文件上传和验证',
        icon: 'Upload',
        status: 'pending',
        progress: 0,
        startTime: null,
        endTime: null,
        duration: null,
        details: null
      },
      {
        key: 'parsing',
        title: '数据解析',
        description: '解析文件内容',
        icon: 'DataAnalysis',
        status: 'pending',
        progress: 0,
        startTime: null,
        endTime: null,
        duration: null,
        details: null
      },
      {
        key: 'cleaning',
        title: '数据清洗',
        description: '应用清洗规则',
        icon: 'Setting',
        status: 'pending',
        progress: 0,
        startTime: null,
        endTime: null,
        duration: null,
        details: null
      },
      {
        key: 'extraction',
        title: '信息提取',
        description: '提取关键信息',
        icon: 'Key',
        status: 'pending',
        progress: 0,
        startTime: null,
        endTime: null,
        duration: null,
        details: null
      },
      {
        key: 'summary',
        title: '结果汇总',
        description: '生成处理报告',
        icon: 'TrendCharts',
        status: 'pending',
        progress: 0,
        startTime: null,
        endTime: null,
        duration: null,
        details: null
      },
      {
        key: 'ai-summary',
        title: 'AI总结',
        description: 'AI智能分析',
        icon: 'MagicStick',
        status: 'pending',
        progress: 0,
        startTime: null,
        endTime: null,
        duration: null,
        details: null
      }
    ])

    // 计算属性
    const currentStepIndex = computed(() => {
      const currentIndex = processStages.value.findIndex(stage => stage.status === 'processing')
      return currentIndex >= 0 ? currentIndex : processStages.value.findIndex(stage => stage.status === 'pending')
    })

    const overallProgress = computed(() => {
      const completedStages = processStages.value.filter(stage => stage.status === 'completed').length
      const totalStages = processStages.value.length
      return Math.round((completedStages / totalStages) * 100)
    })

    const canPause = computed(() => {
      return processStages.value.some(stage => stage.status === 'processing')
    })

    const canResume = computed(() => {
      return processStages.value.some(stage => stage.status === 'paused')
    })

    const canStop = computed(() => {
      return processStages.value.some(stage => ['processing', 'paused'].includes(stage.status))
    })

    const isCompleted = computed(() => {
      return processStages.value.every(stage => stage.status === 'completed')
    })

    // 方法
    const getOverallStatusType = () => {
      if (processStages.value.some(stage => stage.status === 'error')) return 'danger'
      if (processStages.value.some(stage => stage.status === 'processing')) return 'warning'
      if (isCompleted.value) return 'success'
      return 'info'
    }

    const getOverallStatusText = () => {
      if (processStages.value.some(stage => stage.status === 'error')) return '处理失败'
      if (processStages.value.some(stage => stage.status === 'processing')) return '处理中'
      if (isCompleted.value) return '处理完成'
      return '等待开始'
    }

    const getStepStatus = (stage, index) => {
      if (stage.status === 'completed') return 'finish'
      if (stage.status === 'processing') return 'process'
      if (stage.status === 'error') return 'error'
      return 'wait'
    }

    const getStageStatusType = (status) => {
      const types = {
        pending: 'info',
        processing: 'warning',
        completed: 'success',
        error: 'danger',
        paused: 'warning'
      }
      return types[status] || 'info'
    }

    const getStageStatusText = (status) => {
      const texts = {
        pending: '等待中',
        processing: '处理中',
        completed: '已完成',
        error: '失败',
        paused: '已暂停'
      }
      return texts[status] || status
    }

    const getProgressStatus = (status) => {
      if (status === 'completed') return 'success'
      if (status === 'error') return 'exception'
      return undefined
    }

    const formatTime = (timestamp) => {
      if (!timestamp) return '-'
      return new Date(timestamp).toLocaleTimeString()
    }

    const formatDuration = (duration) => {
      if (!duration) return '-'
      const seconds = Math.floor(duration / 1000)
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    const formatFileSize = (bytes) => {
      if (!bytes) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const addLog = (level, message) => {
      processLogs.value.push({
        timestamp: Date.now(),
        level,
        message
      })

      // 保持日志数量在合理范围内
      if (processLogs.value.length > 1000) {
        processLogs.value = processLogs.value.slice(-500)
      }
    }

    const clearLogs = () => {
      processLogs.value = []
      ElMessage.success('日志已清空')
    }

    const exportLogs = () => {
      const logsText = processLogs.value.map(log =>
        `[${formatTime(log.timestamp)}] ${log.level.toUpperCase()}: ${log.message}`
      ).join('\n')

      const blob = new Blob([logsText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'process-logs.txt'
      a.click()
      URL.revokeObjectURL(url)
      ElMessage.success('日志已导出')
    }

    const pauseProcess = () => {
      const processingStage = processStages.value.find(stage => stage.status === 'processing')
      if (processingStage) {
        processingStage.status = 'paused'
        addLog('warning', `阶段 "${processingStage.title}" 已暂停`)
        ElMessage.warning('处理已暂停')
      }
    }

    const resumeProcess = () => {
      const pausedStage = processStages.value.find(stage => stage.status === 'paused')
      if (pausedStage) {
        pausedStage.status = 'processing'
        addLog('info', `阶段 "${pausedStage.title}" 已恢复`)
        ElMessage.info('处理已恢复')
      }
    }

    const stopProcess = () => {
      processStages.value.forEach(stage => {
        if (['processing', 'paused'].includes(stage.status)) {
          stage.status = 'error'
          stage.error = {
            message: '用户手动停止',
            details: '处理流程被用户手动停止'
          }
        }
      })
      addLog('error', '处理流程已停止')
      ElMessage.error('处理已停止')
    }

    const viewResults = () => {
      emit('stage-completed', 'ai-summary', {
        success: true,
        message: '所有阶段已完成'
      })
    }

    // 模拟处理流程
    const startProcessing = () => {
      if (!props.processingData) return

      addLog('info', '开始数据处理流程')

      // 模拟各个阶段的处理
      simulateStage('upload', 2000)
    }

    const simulateStage = (stageKey, duration) => {
      const stage = processStages.value.find(s => s.key === stageKey)
      if (!stage) return

      stage.status = 'processing'
      stage.startTime = Date.now()
      stage.progress = 0

      addLog('info', `开始 ${stage.title}`)

      const interval = setInterval(() => {
        stage.progress += Math.random() * 20
        if (stage.progress >= 100) {
          stage.progress = 100
          stage.status = 'completed'
          stage.endTime = Date.now()
          stage.duration = stage.endTime - stage.startTime

          addLog('success', `${stage.title} 完成`)
          clearInterval(interval)

          // 设置阶段详细信息
          setStageDetails(stage)

          // 开始下一个阶段
          const nextStageIndex = processStages.value.findIndex(s => s.key === stageKey) + 1
          if (nextStageIndex < processStages.value.length) {
            const nextStage = processStages.value[nextStageIndex]
            setTimeout(() => simulateStage(nextStage.key, duration), 1000)
          } else {
            addLog('success', '所有阶段处理完成')
            emit('stage-completed', 'ai-summary', { success: true })
          }
        }
      }, duration / 10)
    }

    const setStageDetails = (stage) => {
      switch (stage.key) {
        case 'upload':
          stage.details = {
            fileCount: 3,
            totalSize: 15728640 // 15MB
          }
          break
        case 'parsing':
          stage.details = {
            parsedRows: 1250,
            columnCount: 12
          }
          break
        case 'cleaning':
          stage.details = {
            appliedRules: 8,
            cleanedRecords: 1180,
            errorRecords: 15
          }
          break
        case 'extraction':
          stage.details = {
            extractedFields: 25,
            structureRate: 92
          }
          break
        case 'summary':
          stage.details = {
            chartsGenerated: 6,
            reportPages: 12
          }
          break
        case 'ai-summary':
          stage.details = {
            aiModel: 'GPT-4',
            confidence: 94
          }
          break
      }
    }

    // 生命周期
    onMounted(() => {
      if (props.currentStage) {
        startProcessing()
      }
    })

    onUnmounted(() => {
      if (processTimer.value) {
        clearInterval(processTimer.value)
      }
    })

    return {
      processTimer,
      processLogs,
      processStages,
      currentStepIndex,
      overallProgress,
      canPause,
      canResume,
      canStop,
      isCompleted,
      getOverallStatusType,
      getOverallStatusText,
      getStepStatus,
      getStageStatusType,
      getStageStatusText,
      getProgressStatus,
      formatTime,
      formatDuration,
      formatFileSize,
      clearLogs,
      exportLogs,
      pauseProcess,
      resumeProcess,
      stopProcess,
      viewResults
    }
  }
}
</script>

<style scoped>
.process-monitor {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.overview-card {
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.process-progress {
  margin: 30px 0;
}

.overall-progress {
  margin-top: 30px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-weight: 500;
}

.stages-detail {
  margin-bottom: 30px;
}

.stage-card {
  height: 100%;
  transition: all 0.3s;
}

.stage-card.active {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.stage-card.completed {
  border-color: #67c23a;
}

.stage-card.error {
  border-color: #f56c6c;
}

.stage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stage-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.stage-content {
  padding: 15px 0;
}

.stage-progress {
  margin-bottom: 20px;
}

.stage-details {
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.label {
  color: #606266;
}

.value {
  font-weight: 500;
}

.stage-specific {
  margin-top: 15px;
}

.files-info,
.parsing-info,
.extraction-info,
.summary-info,
.ai-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.cleaning-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.stat-value.error {
  color: #f56c6c;
}

.error-info {
  margin-top: 15px;
}

.process-logs {
  margin-bottom: 30px;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logs-content {
  max-height: 300px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.log-item {
  display: flex;
  gap: 10px;
  padding: 5px 0;
  border-bottom: 1px solid #f0f0f0;
}

.log-item.info {
  color: #409eff;
}

.log-item.warning {
  color: #e6a23c;
}

.log-item.error {
  color: #f56c6c;
}

.log-item.success {
  color: #67c23a;
}

.log-time {
  color: #909399;
  min-width: 80px;
}

.log-level {
  min-width: 60px;
  font-weight: 600;
}

.process-actions {
  text-align: center;
}

.process-actions .el-button {
  margin: 0 10px;
}
</style>
