<template>
  <div class="processing-progress">
    <!-- 进度概览 -->
    <div class="progress-overview">
      <div class="overview-header">
        <h3>数据处理进度</h3>
        <div class="progress-status" :class="statusClass">
          <el-icon><component :is="statusIcon" /></el-icon>
          <span>{{ statusText }}</span>
        </div>
      </div>
      
      <!-- 总体进度条 -->
      <div class="overall-progress">
        <div class="progress-info">
          <span class="progress-label">总体进度</span>
          <span class="progress-percentage">{{ Math.round(overallProgress) }}%</span>
        </div>
        <el-progress
          :percentage="overallProgress"
          :status="progressStatus"
          :stroke-width="12"
          :show-text="false"
        />
        <div class="progress-time">
          <span>已用时: {{ formatTime(elapsedTime) }}</span>
          <span v-if="estimatedTime > 0">预计剩余: {{ formatTime(estimatedTime) }}</span>
        </div>
      </div>
    </div>

    <!-- 详细步骤 -->
    <div class="progress-steps">
      <div class="steps-header">
        <h4>处理步骤详情</h4>
        <el-button 
          type="text" 
          size="small" 
          @click="toggleDetails"
        >
          {{ showDetails ? '收起详情' : '展开详情' }}
          <el-icon><component :is="showDetails ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
        </el-button>
      </div>
      
      <div class="steps-container" :class="{ collapsed: !showDetails }">
        <div 
          v-for="(step, index) in processingSteps" 
          :key="step.id"
          class="step-item"
          :class="getStepClass(step)"
        >
          <!-- 步骤指示器 -->
          <div class="step-indicator">
            <div class="step-number" v-if="step.status === 'pending'">{{ index + 1 }}</div>
            <el-icon v-else-if="step.status === 'running'" class="step-icon running">
              <Loading />
            </el-icon>
            <el-icon v-else-if="step.status === 'completed'" class="step-icon completed">
              <CircleCheck />
            </el-icon>
            <el-icon v-else-if="step.status === 'error'" class="step-icon error">
              <CircleClose />
            </el-icon>
            <el-icon v-else-if="step.status === 'warning'" class="step-icon warning">
              <Warning />
            </el-icon>
          </div>
          
          <!-- 步骤内容 -->
          <div class="step-content">
            <div class="step-header">
              <h5 class="step-title">{{ step.title }}</h5>
              <div class="step-meta">
                <span v-if="step.duration" class="step-duration">{{ formatTime(step.duration) }}</span>
                <span v-if="step.progress !== undefined" class="step-progress">{{ step.progress }}%</span>
              </div>
            </div>
            
            <div class="step-description">{{ step.description }}</div>
            
            <!-- 步骤进度条 -->
            <div v-if="step.status === 'running' && step.progress !== undefined" class="step-progress-bar">
              <el-progress
                :percentage="step.progress"
                :stroke-width="6"
                :show-text="false"
              />
            </div>
            
            <!-- 步骤详细信息 -->
            <div v-if="step.details && showDetails" class="step-details">
              <div v-for="detail in step.details" :key="detail.key" class="detail-item">
                <span class="detail-label">{{ detail.label }}:</span>
                <span class="detail-value">{{ detail.value }}</span>
              </div>
            </div>
            
            <!-- 步骤日志 -->
            <div v-if="step.logs && step.logs.length > 0 && showDetails" class="step-logs">
              <div class="logs-header">
                <span>处理日志</span>
                <el-button type="text" size="small" @click="toggleStepLogs(step.id)">
                  {{ step.showLogs ? '隐藏' : '显示' }}
                </el-button>
              </div>
              <div v-if="step.showLogs" class="logs-content">
                <div 
                  v-for="log in step.logs.slice(-5)" 
                  :key="log.id"
                  class="log-item"
                  :class="log.level"
                >
                  <span class="log-time">{{ formatLogTime(log.time) }}</span>
                  <span class="log-message">{{ log.message }}</span>
                </div>
              </div>
            </div>
            
            <!-- 错误信息 -->
            <div v-if="step.error" class="step-error">
              <el-alert
                :title="step.error.title || '处理错误'"
                :description="step.error.message"
                type="error"
                :closable="false"
                show-icon
              />
              <div v-if="step.error.suggestion" class="error-suggestion">
                <strong>建议:</strong> {{ step.error.suggestion }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 实时统计 -->
    <div class="progress-stats">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.processedFiles }}</div>
            <div class="stat-label">已处理文件</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><DataLine /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.extractedRecords }}</div>
            <div class="stat-label">提取记录</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.cleanedRecords }}</div>
            <div class="stat-label">清洗记录</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.issuesFound }}</div>
            <div class="stat-label">发现问题</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="progress-actions">
      <el-button 
        v-if="canPause" 
        @click="pauseProcessing"
        :disabled="currentStatus === 'paused'"
      >
        <el-icon><VideoPause /></el-icon>
        {{ currentStatus === 'paused' ? '已暂停' : '暂停' }}
      </el-button>
      
      <el-button 
        v-if="currentStatus === 'paused'" 
        type="primary"
        @click="resumeProcessing"
      >
        <el-icon><VideoPlay /></el-icon>
        继续
      </el-button>
      
      <el-button 
        v-if="canCancel" 
        type="danger"
        @click="cancelProcessing"
      >
        <el-icon><Close /></el-icon>
        取消
      </el-button>
      
      <el-button 
        v-if="currentStatus === 'completed'" 
        type="success"
        @click="viewResults"
      >
        <el-icon><View /></el-icon>
        查看结果
      </el-button>
      
      <el-button 
        v-if="currentStatus === 'error'" 
        @click="retryProcessing"
      >
        <el-icon><Refresh /></el-icon>
        重试
      </el-button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Loading,
  CircleCheck,
  CircleClose,
  Warning,
  ArrowUp,
  ArrowDown,
  Document,
  DataLine,
  VideoPause,
  VideoPlay,
  Close,
  View,
  Refresh
} from '@element-plus/icons-vue'

export default {
  name: 'ProcessingProgress',
  components: {
    Loading,
    CircleCheck,
    CircleClose,
    Warning,
    ArrowUp,
    ArrowDown,
    Document,
    DataLine,
    VideoPause,
    VideoPlay,
    Close,
    View,
    Refresh
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    processingData: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['pause', 'resume', 'cancel', 'retry', 'view-results'],
  setup(props, { emit }) {
    // 响应式数据
    const showDetails = ref(true)
    const currentStatus = ref('running')
    const overallProgress = ref(0)
    const elapsedTime = ref(0)
    const estimatedTime = ref(0)
    const timer = ref(null)
    
    // 处理步骤
    const processingSteps = ref([
      {
        id: 'upload',
        title: '文件上传',
        description: '正在上传文件到服务器...',
        status: 'completed',
        progress: 100,
        duration: 1200,
        details: [
          { key: 'fileSize', label: '文件大小', value: '2.5 MB' },
          { key: 'fileType', label: '文件类型', value: 'PDF' }
        ],
        logs: []
      },
      {
        id: 'detection',
        title: '文档类型检测',
        description: '正在分析文档类型和结构...',
        status: 'running',
        progress: 75,
        details: [
          { key: 'confidence', label: '识别置信度', value: '92%' },
          { key: 'docType', label: '文档类型', value: '8D报告' }
        ],
        logs: [
          { id: 1, time: new Date(), level: 'info', message: '开始文档类型检测' },
          { id: 2, time: new Date(), level: 'info', message: '检测到8D报告特征' }
        ]
      },
      {
        id: 'parsing',
        title: '内容解析',
        description: '正在解析文档内容和结构...',
        status: 'pending',
        progress: 0,
        details: [],
        logs: []
      },
      {
        id: 'extraction',
        title: '数据提取',
        description: '正在提取结构化数据...',
        status: 'pending',
        progress: 0,
        details: [],
        logs: []
      },
      {
        id: 'cleaning',
        title: '数据清洗',
        description: '正在应用清洗规则...',
        status: 'pending',
        progress: 0,
        details: [],
        logs: []
      },
      {
        id: 'validation',
        title: '质量验证',
        description: '正在验证数据质量...',
        status: 'pending',
        progress: 0,
        details: [],
        logs: []
      },
      {
        id: 'completion',
        title: '处理完成',
        description: '正在生成最终报告...',
        status: 'pending',
        progress: 0,
        details: [],
        logs: []
      }
    ])
    
    // 统计数据
    const stats = ref({
      processedFiles: 1,
      extractedRecords: 0,
      cleanedRecords: 0,
      issuesFound: 0
    })

    // 计算属性
    const statusClass = computed(() => {
      const classes = {
        running: 'status-running',
        paused: 'status-paused',
        completed: 'status-completed',
        error: 'status-error'
      }
      return classes[currentStatus.value] || 'status-running'
    })

    const statusIcon = computed(() => {
      const icons = {
        running: 'Loading',
        paused: 'VideoPause',
        completed: 'CircleCheck',
        error: 'CircleClose'
      }
      return icons[currentStatus.value] || 'Loading'
    })

    const statusText = computed(() => {
      const texts = {
        running: '处理中',
        paused: '已暂停',
        completed: '处理完成',
        error: '处理失败'
      }
      return texts[currentStatus.value] || '处理中'
    })

    const progressStatus = computed(() => {
      if (currentStatus.value === 'error') return 'exception'
      if (currentStatus.value === 'completed') return 'success'
      return undefined
    })

    const canPause = computed(() => {
      return ['running'].includes(currentStatus.value)
    })

    const canCancel = computed(() => {
      return ['running', 'paused'].includes(currentStatus.value)
    })

    // 方法
    const getStepClass = (step) => {
      return {
        'step-pending': step.status === 'pending',
        'step-running': step.status === 'running',
        'step-completed': step.status === 'completed',
        'step-error': step.status === 'error',
        'step-warning': step.status === 'warning'
      }
    }

    const formatTime = (milliseconds) => {
      const seconds = Math.floor(milliseconds / 1000)
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      
      if (minutes > 0) {
        return `${minutes}分${remainingSeconds}秒`
      }
      return `${remainingSeconds}秒`
    }

    const formatLogTime = (time) => {
      return new Date(time).toLocaleTimeString()
    }

    const toggleDetails = () => {
      showDetails.value = !showDetails.value
    }

    const toggleStepLogs = (stepId) => {
      const step = processingSteps.value.find(s => s.id === stepId)
      if (step) {
        step.showLogs = !step.showLogs
      }
    }

    const updateProgress = () => {
      const completedSteps = processingSteps.value.filter(s => s.status === 'completed').length
      const runningSteps = processingSteps.value.filter(s => s.status === 'running')
      
      let progress = (completedSteps / processingSteps.value.length) * 100
      
      // 加上正在运行步骤的进度
      if (runningSteps.length > 0) {
        const runningProgress = runningSteps.reduce((sum, step) => sum + (step.progress || 0), 0)
        progress += (runningProgress / runningSteps.length / processingSteps.value.length)
      }
      
      overallProgress.value = Math.min(100, progress)
    }

    const startTimer = () => {
      timer.value = setInterval(() => {
        elapsedTime.value += 1000
        
        // 模拟进度更新
        simulateProgress()
      }, 1000)
    }

    const stopTimer = () => {
      if (timer.value) {
        clearInterval(timer.value)
        timer.value = null
      }
    }

    const simulateProgress = () => {
      // 模拟步骤进度更新
      const runningStep = processingSteps.value.find(s => s.status === 'running')
      if (runningStep && runningStep.progress < 100) {
        runningStep.progress = Math.min(100, runningStep.progress + Math.random() * 10)
        
        // 添加模拟日志
        if (Math.random() > 0.7) {
          runningStep.logs.push({
            id: Date.now(),
            time: new Date(),
            level: 'info',
            message: `${runningStep.title}进度: ${Math.round(runningStep.progress)}%`
          })
        }
        
        // 步骤完成时切换到下一步
        if (runningStep.progress >= 100) {
          runningStep.status = 'completed'
          runningStep.duration = Math.random() * 3000 + 1000
          
          const currentIndex = processingSteps.value.findIndex(s => s.id === runningStep.id)
          if (currentIndex < processingSteps.value.length - 1) {
            processingSteps.value[currentIndex + 1].status = 'running'
          } else {
            currentStatus.value = 'completed'
            stopTimer()
          }
        }
      }
      
      updateProgress()
      updateStats()
    }

    const updateStats = () => {
      const completedSteps = processingSteps.value.filter(s => s.status === 'completed').length
      stats.value.extractedRecords = completedSteps * 15 + Math.floor(Math.random() * 10)
      stats.value.cleanedRecords = Math.max(0, stats.value.extractedRecords - 5)
      stats.value.issuesFound = Math.floor(Math.random() * 8)
    }

    const pauseProcessing = () => {
      currentStatus.value = 'paused'
      stopTimer()
      emit('pause')
      ElMessage.info('处理已暂停')
    }

    const resumeProcessing = () => {
      currentStatus.value = 'running'
      startTimer()
      emit('resume')
      ElMessage.success('处理已继续')
    }

    const cancelProcessing = () => {
      currentStatus.value = 'cancelled'
      stopTimer()
      emit('cancel')
      ElMessage.warning('处理已取消')
    }

    const retryProcessing = () => {
      // 重置所有步骤
      processingSteps.value.forEach((step, index) => {
        if (index === 0) {
          step.status = 'completed'
        } else if (index === 1) {
          step.status = 'running'
          step.progress = 0
        } else {
          step.status = 'pending'
          step.progress = 0
        }
        step.logs = []
        step.error = null
      })
      
      currentStatus.value = 'running'
      overallProgress.value = 0
      elapsedTime.value = 0
      startTimer()
      emit('retry')
      ElMessage.success('重新开始处理')
    }

    const viewResults = () => {
      emit('view-results')
    }

    // 生命周期
    onMounted(() => {
      if (props.visible) {
        startTimer()
      }
    })

    onUnmounted(() => {
      stopTimer()
    })

    // 监听器
    watch(() => props.visible, (newVal) => {
      if (newVal) {
        startTimer()
      } else {
        stopTimer()
      }
    })

    return {
      showDetails,
      currentStatus,
      overallProgress,
      elapsedTime,
      estimatedTime,
      processingSteps,
      stats,
      statusClass,
      statusIcon,
      statusText,
      progressStatus,
      canPause,
      canCancel,
      getStepClass,
      formatTime,
      formatLogTime,
      toggleDetails,
      toggleStepLogs,
      pauseProcessing,
      resumeProcessing,
      cancelProcessing,
      retryProcessing,
      viewResults
    }
  }
}
</script>

<style scoped>
.processing-progress {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.progress-overview {
  padding: 24px;
  border-bottom: 1px solid #f0f2f5;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.overview-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.progress-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.status-running {
  background: #e6f7ff;
  color: #1890ff;
}

.status-paused {
  background: #fff7e6;
  color: #fa8c16;
}

.status-completed {
  background: #f6ffed;
  color: #52c41a;
}

.status-error {
  background: #fff2f0;
  color: #ff4d4f;
}

.overall-progress {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-label {
  font-size: 14px;
  color: #606266;
}

.progress-percentage {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.progress-time {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.progress-steps {
  padding: 24px;
}

.steps-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.steps-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.steps-container {
  max-height: 600px;
  overflow-y: auto;
  transition: max-height 0.3s ease;
}

.steps-container.collapsed {
  max-height: 200px;
}

.step-item {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f2f5;
  transition: all 0.3s ease;
}

.step-item:last-child {
  border-bottom: none;
}

.step-item.step-running {
  background: linear-gradient(90deg, rgba(24, 144, 255, 0.05) 0%, transparent 100%);
  border-radius: 8px;
  padding: 16px;
  margin: 0 -16px;
}

.step-indicator {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  position: relative;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f0f2f5;
  color: #909399;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.step-icon {
  font-size: 20px;
}

.step-icon.running {
  color: #1890ff;
  animation: spin 1s linear infinite;
}

.step-icon.completed {
  color: #52c41a;
}

.step-icon.error {
  color: #ff4d4f;
}

.step-icon.warning {
  color: #fa8c16;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.step-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.step-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.step-description {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 12px;
}

.step-progress-bar {
  margin-bottom: 12px;
}

.step-details {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 12px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  color: #606266;
}

.detail-value {
  color: #2c3e50;
  font-weight: 500;
}

.step-logs {
  margin-top: 12px;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: #606266;
}

.logs-content {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 8px;
  max-height: 120px;
  overflow-y: auto;
}

.log-item {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 11px;
  line-height: 1.4;
}

.log-item:last-child {
  margin-bottom: 0;
}

.log-time {
  color: #909399;
  flex-shrink: 0;
}

.log-message {
  color: #606266;
}

.log-item.error .log-message {
  color: #ff4d4f;
}

.log-item.warning .log-message {
  color: #fa8c16;
}

.step-error {
  margin-top: 12px;
}

.error-suggestion {
  margin-top: 8px;
  padding: 8px;
  background: #fff2f0;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
}

.progress-stats {
  padding: 20px 24px;
  background: #f8f9fa;
  border-top: 1px solid #f0f2f5;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #e6f7ff;
  color: #1890ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #606266;
  margin-top: 4px;
}

.progress-actions {
  padding: 20px 24px;
  border-top: 1px solid #f0f2f5;
  display: flex;
  gap: 12px;
  justify-content: center;
}

@media (max-width: 768px) {
  .processing-progress {
    margin: 0 -10px;
    border-radius: 0;
  }

  .progress-overview,
  .progress-steps,
  .progress-stats,
  .progress-actions {
    padding: 16px;
  }

  .overview-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .steps-header {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .step-item {
    flex-direction: column;
    gap: 8px;
  }

  .step-indicator {
    align-self: flex-start;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .progress-actions {
    flex-wrap: wrap;
    gap: 8px;
  }

  .progress-actions .el-button {
    flex: 1;
    min-width: 120px;
  }
}

/* 滚动条样式 */
.steps-container::-webkit-scrollbar,
.logs-content::-webkit-scrollbar {
  width: 6px;
}

.steps-container::-webkit-scrollbar-track,
.logs-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.steps-container::-webkit-scrollbar-thumb,
.logs-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.steps-container::-webkit-scrollbar-thumb:hover,
.logs-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
