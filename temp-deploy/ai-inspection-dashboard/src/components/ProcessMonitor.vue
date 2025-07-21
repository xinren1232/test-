<template>
  <div class="process-monitor">
    <!-- 整体进度概览 -->
    <div class="progress-overview">
      <el-card class="overview-card">
        <template #header>
          <div class="card-header">
            <h3>数据处理流程</h3>
            <el-tag :type="getStatusType(pipeline.status)" size="large">
              {{ getStatusText(pipeline.status) }}
            </el-tag>
          </div>
        </template>
        
        <!-- 整体进度条 -->
        <div class="overall-progress">
          <div class="progress-info">
            <span class="progress-label">整体进度</span>
            <span class="progress-percentage">{{ overallProgress }}%</span>
          </div>
          <el-progress 
            :percentage="overallProgress" 
            :status="getProgressStatus()"
            :stroke-width="12"
            :show-text="false"
          />
        </div>

        <!-- 时间信息 -->
        <div class="time-info" v-if="pipeline.startTime">
          <div class="time-item">
            <span class="label">开始时间:</span>
            <span class="value">{{ formatTime(pipeline.startTime) }}</span>
          </div>
          <div class="time-item" v-if="pipeline.endTime">
            <span class="label">结束时间:</span>
            <span class="value">{{ formatTime(pipeline.endTime) }}</span>
          </div>
          <div class="time-item" v-if="pipeline.duration">
            <span class="label">总耗时:</span>
            <span class="value">{{ formatDuration(pipeline.duration) }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 阶段流程图 -->
    <div class="stages-flow">
      <el-card class="stages-card">
        <template #header>
          <h3>处理阶段</h3>
        </template>
        
        <div class="stages-container">
          <div 
            v-for="(stage, index) in pipeline.stages" 
            :key="stage.id"
            class="stage-item"
            :class="getStageClass(stage.id)"
          >
            <!-- 阶段图标和状态 -->
            <div class="stage-icon">
              <el-icon :size="24" :color="getStageColor(stage.id)">
                <component :is="getStageIcon(stage.icon)" />
              </el-icon>
              <div class="stage-status-indicator" :class="getStageStatus(stage.id)"></div>
            </div>
            
            <!-- 阶段信息 -->
            <div class="stage-info">
              <h4 class="stage-name">{{ stage.name }}</h4>
              <p class="stage-description">{{ stage.description }}</p>
              
              <!-- 阶段进度 -->
              <div class="stage-progress">
                <el-progress 
                  :percentage="getStageProgress(stage.id)" 
                  :status="getStageProgressStatus(stage.id)"
                  :stroke-width="6"
                  :show-text="false"
                />
                <span class="progress-text">{{ getStageProgress(stage.id) }}%</span>
              </div>
              
              <!-- 阶段详情 -->
              <div class="stage-details" v-if="getStageDetails(stage.id)">
                <div class="detail-item" v-if="getStageDetails(stage.id).duration">
                  <span class="detail-label">耗时:</span>
                  <span class="detail-value">{{ formatDuration(getStageDetails(stage.id).duration) }}</span>
                </div>
                <div class="detail-item" v-if="getStageDetails(stage.id).error">
                  <span class="detail-label">错误:</span>
                  <span class="detail-value error">{{ getStageDetails(stage.id).error }}</span>
                </div>
              </div>
            </div>
            
            <!-- 连接线 -->
            <div v-if="index < pipeline.stages.length - 1" class="stage-connector">
              <div class="connector-line" :class="{ active: isStageCompleted(stage.id) }"></div>
              <el-icon class="connector-arrow" :color="isStageCompleted(stage.id) ? '#67C23A' : '#DCDFE6'">
                <ArrowRight />
              </el-icon>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 详细日志 -->
    <div class="logs-section">
      <el-card class="logs-card">
        <template #header>
          <div class="logs-header">
            <h3>处理日志</h3>
            <div class="logs-controls">
              <el-select v-model="logLevel" placeholder="日志级别" size="small" style="width: 120px">
                <el-option label="全部" value="all" />
                <el-option label="信息" value="info" />
                <el-option label="警告" value="warn" />
                <el-option label="错误" value="error" />
                <el-option label="成功" value="success" />
              </el-select>
              <el-button @click="clearLogs" size="small" type="danger" plain>清空日志</el-button>
              <el-button @click="exportLogs" size="small" type="primary" plain>导出日志</el-button>
            </div>
          </div>
        </template>
        
        <div class="logs-container" ref="logsContainer">
          <div 
            v-for="(log, index) in filteredLogs" 
            :key="index"
            class="log-item"
            :class="log.level"
          >
            <span class="log-time">{{ formatLogTime(log.time) }}</span>
            <span class="log-level">{{ log.level.toUpperCase() }}</span>
            <span class="log-stage" v-if="log.stage">[{{ getStageNameById(log.stage) }}]</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
          
          <div v-if="filteredLogs.length === 0" class="no-logs">
            <el-empty description="暂无日志" :image-size="60" />
          </div>
        </div>
      </el-card>
    </div>

    <!-- 实时统计 -->
    <div class="statistics-section">
      <el-row :gutter="16">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon :size="32" color="#409EFF">
                  <Document />
                </el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.recordsProcessed || 0 }}</div>
                <div class="stat-label">已处理记录</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon :size="32" color="#67C23A">
                  <CircleCheck />
                </el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.qualityScore || 0 }}%</div>
                <div class="stat-label">数据质量分数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon :size="32" color="#E6A23C">
                  <Clock />
                </el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ formatDuration(statistics.totalTime || 0) }}</div>
                <div class="stat-label">总处理时间</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon :size="32" color="#F56C6C">
                  <Warning />
                </el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.issuesFound || 0 }}</div>
                <div class="stat-label">发现问题</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { 
  Upload, Document, Brush, Search, DocumentCopy, Cpu,
  ArrowRight, CircleCheck, Clock, Warning
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  pipeline: {
    type: Object,
    required: true
  },
  statistics: {
    type: Object,
    default: () => ({})
  }
})

// Reactive data
const logLevel = ref('all')
const logsContainer = ref(null)

// Computed
const overallProgress = computed(() => {
  return props.pipeline.getOverallProgress ? props.pipeline.getOverallProgress() : 0
})

const filteredLogs = computed(() => {
  if (!props.pipeline.logs) return []
  
  if (logLevel.value === 'all') {
    return props.pipeline.logs
  }
  
  return props.pipeline.logs.filter(log => log.level === logLevel.value)
})

// Methods
const getStatusType = (status) => {
  const statusMap = {
    idle: 'info',
    running: 'warning',
    completed: 'success',
    error: 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    idle: '待开始',
    running: '处理中',
    completed: '已完成',
    error: '处理失败'
  }
  return statusMap[status] || '未知状态'
}

const getProgressStatus = () => {
  if (props.pipeline.status === 'error') return 'exception'
  if (props.pipeline.status === 'completed') return 'success'
  return null
}

const getStageClass = (stageId) => {
  const progress = props.pipeline.stageProgress?.[stageId]
  if (!progress) return ''
  
  return {
    'stage-pending': progress.status === 'pending',
    'stage-running': progress.status === 'running',
    'stage-completed': progress.status === 'completed',
    'stage-error': progress.status === 'error',
    'stage-current': props.pipeline.currentStage === stageId
  }
}

const getStageColor = (stageId) => {
  const stage = props.pipeline.stages?.find(s => s.id === stageId)
  return stage?.color || '#909399'
}

const getStageIcon = (iconName) => {
  const iconMap = {
    upload: Upload,
    document: Document,
    brush: Brush,
    search: Search,
    'document-copy': DocumentCopy,
    cpu: Cpu
  }
  return iconMap[iconName] || Document
}

const getStageStatus = (stageId) => {
  const progress = props.pipeline.stageProgress?.[stageId]
  return progress?.status || 'pending'
}

const getStageProgress = (stageId) => {
  const progress = props.pipeline.stageProgress?.[stageId]
  return progress?.progress || 0
}

const getStageProgressStatus = (stageId) => {
  const progress = props.pipeline.stageProgress?.[stageId]
  if (progress?.status === 'error') return 'exception'
  if (progress?.status === 'completed') return 'success'
  return null
}

const getStageDetails = (stageId) => {
  return props.pipeline.stageProgress?.[stageId] || {}
}

const isStageCompleted = (stageId) => {
  const progress = props.pipeline.stageProgress?.[stageId]
  return progress?.status === 'completed'
}

const getStageNameById = (stageId) => {
  const stage = props.pipeline.stages?.find(s => s.id === stageId)
  return stage?.name || stageId
}

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString()
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

const formatLogTime = (time) => {
  return new Date(time).toLocaleTimeString()
}

const clearLogs = () => {
  if (props.pipeline.logs) {
    props.pipeline.logs.length = 0
  }
}

const exportLogs = () => {
  const logs = filteredLogs.value.map(log => 
    `${formatTime(log.time)} [${log.level.toUpperCase()}] ${log.stage ? '[' + getStageNameById(log.stage) + '] ' : ''}${log.message}`
  ).join('\n')
  
  const blob = new Blob([logs], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `processing-logs-${new Date().toISOString().slice(0, 19)}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

// Watch for new logs and auto-scroll
watch(() => props.pipeline.logs?.length, () => {
  nextTick(() => {
    if (logsContainer.value) {
      logsContainer.value.scrollTop = logsContainer.value.scrollHeight
    }
  })
})
</script>

<style scoped>
.process-monitor {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 进度概览 */
.progress-overview {
  margin-bottom: 20px;
}

.overview-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: #303133;
}

.overall-progress {
  margin: 20px 0;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 14px;
  color: #606266;
}

.progress-percentage {
  font-size: 16px;
  font-weight: bold;
  color: #409EFF;
}

.time-info {
  display: flex;
  gap: 20px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #EBEEF5;
}

.time-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-item .label {
  font-size: 12px;
  color: #909399;
}

.time-item .value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

/* 阶段流程 */
.stages-flow {
  margin-bottom: 20px;
}

.stages-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.stages-container {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 20px 0;
  overflow-x: auto;
}

.stage-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 200px;
  padding: 20px;
  border-radius: 8px;
  border: 2px solid #EBEEF5;
  background: #fff;
  transition: all 0.3s ease;
  position: relative;
}

.stage-item.stage-current {
  border-color: #409EFF;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.stage-item.stage-completed {
  border-color: #67C23A;
  background: #f0f9ff;
}

.stage-item.stage-running {
  border-color: #E6A23C;
  background: #fdf6ec;
}

.stage-item.stage-error {
  border-color: #F56C6C;
  background: #fef0f0;
}

.stage-icon {
  position: relative;
  margin-bottom: 12px;
}

.stage-status-indicator {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
}

.stage-status-indicator.pending {
  background: #DCDFE6;
}

.stage-status-indicator.running {
  background: #E6A23C;
  animation: pulse 2s infinite;
}

.stage-status-indicator.completed {
  background: #67C23A;
}

.stage-status-indicator.error {
  background: #F56C6C;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.stage-info {
  text-align: center;
  width: 100%;
}

.stage-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.stage-description {
  margin: 0 0 16px 0;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.stage-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.progress-text {
  font-size: 12px;
  color: #606266;
  min-width: 30px;
}

.stage-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.detail-label {
  color: #909399;
}

.detail-value {
  color: #303133;
  font-weight: 500;
}

.detail-value.error {
  color: #F56C6C;
}

.stage-connector {
  display: flex;
  align-items: center;
  margin: 0 10px;
}

.connector-line {
  width: 40px;
  height: 2px;
  background: #DCDFE6;
  transition: background 0.3s ease;
}

.connector-line.active {
  background: #67C23A;
}

.connector-arrow {
  margin-left: 8px;
}

/* 日志部分 */
.logs-section {
  margin-bottom: 20px;
}

.logs-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logs-header h3 {
  margin: 0;
  color: #303133;
}

.logs-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.logs-container {
  max-height: 400px;
  overflow-y: auto;
  background: #fafafa;
  border-radius: 4px;
  padding: 12px;
}

.log-item {
  display: flex;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid #EBEEF5;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: #909399;
  min-width: 80px;
}

.log-level {
  min-width: 50px;
  font-weight: bold;
}

.log-item.info .log-level {
  color: #409EFF;
}

.log-item.warn .log-level {
  color: #E6A23C;
}

.log-item.error .log-level {
  color: #F56C6C;
}

.log-item.success .log-level {
  color: #67C23A;
}

.log-stage {
  color: #606266;
  min-width: 60px;
}

.log-message {
  color: #303133;
  flex: 1;
}

.no-logs {
  text-align: center;
  padding: 40px 0;
}

/* 统计部分 */
.statistics-section {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stages-container {
    flex-direction: column;
    align-items: stretch;
  }

  .stage-item {
    min-width: auto;
  }

  .stage-connector {
    transform: rotate(90deg);
    margin: 10px 0;
  }

  .time-info {
    flex-direction: column;
    gap: 12px;
  }

  .logs-controls {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
