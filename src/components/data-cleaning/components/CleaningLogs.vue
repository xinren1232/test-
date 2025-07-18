<template>
  <div class="cleaning-logs">
    <!-- 日志控制栏 -->
    <div class="log-controls">
      <div class="control-group">
        <el-select v-model="logLevel" placeholder="日志级别" @change="filterLogs">
          <el-option label="全部" value="all" />
          <el-option label="信息" value="info" />
          <el-option label="警告" value="warn" />
          <el-option label="错误" value="error" />
          <el-option label="调试" value="debug" />
        </el-select>
        
        <el-select v-model="logCategory" placeholder="日志分类" @change="filterLogs">
          <el-option label="全部" value="all" />
          <el-option label="规则执行" value="rule_execution" />
          <el-option label="数据处理" value="data_processing" />
          <el-option label="验证检查" value="validation" />
          <el-option label="系统操作" value="system" />
        </el-select>
      </div>

      <div class="control-group">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索日志..."
          prefix-icon="Search"
          clearable
          @input="filterLogs"
        />
        
        <el-button @click="clearLogs">
          <el-icon><Delete /></el-icon>
          清空日志
        </el-button>
        
        <el-button type="primary" @click="exportLogs">
          <el-icon><Download /></el-icon>
          导出日志
        </el-button>
      </div>
    </div>

    <!-- 日志统计 -->
    <div class="log-statistics">
      <el-row :gutter="15">
        <el-col :span="6">
          <div class="stat-card info">
            <el-icon class="stat-icon"><InfoFilled /></el-icon>
            <div class="stat-content">
              <div class="stat-number">{{ logStats.info }}</div>
              <div class="stat-label">信息</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-card warning">
            <el-icon class="stat-icon"><WarningFilled /></el-icon>
            <div class="stat-content">
              <div class="stat-number">{{ logStats.warn }}</div>
              <div class="stat-label">警告</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-card error">
            <el-icon class="stat-icon"><CircleCloseFilled /></el-icon>
            <div class="stat-content">
              <div class="stat-number">{{ logStats.error }}</div>
              <div class="stat-label">错误</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-card debug">
            <el-icon class="stat-icon"><Tools /></el-icon>
            <div class="stat-content">
              <div class="stat-number">{{ logStats.debug }}</div>
              <div class="stat-label">调试</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 日志列表 -->
    <div class="log-list">
      <div class="log-header">
        <span>清洗日志 ({{ filteredLogs.length }}条)</span>
        <el-switch
          v-model="autoScroll"
          active-text="自动滚动"
          inactive-text="手动滚动"
        />
      </div>
      
      <div 
        ref="logContainer"
        class="log-container"
        :class="{ 'auto-scroll': autoScroll }"
      >
        <div
          v-for="(log, index) in filteredLogs"
          :key="index"
          class="log-entry"
          :class="[`log-${log.level}`, { 'log-expanded': log.expanded }]"
          @click="toggleLogExpansion(log)"
        >
          <div class="log-main">
            <div class="log-time">{{ formatTime(log.time) }}</div>
            
            <div class="log-level">
              <el-tag :type="getLevelTagType(log.level)" size="small">
                {{ getLevelText(log.level) }}
              </el-tag>
            </div>
            
            <div class="log-category">
              <el-tag type="info" size="small" plain>
                {{ getCategoryText(log.category) }}
              </el-tag>
            </div>
            
            <div class="log-message">{{ log.message }}</div>
            
            <div v-if="log.data || log.details" class="log-expand-icon">
              <el-icon><ArrowDown /></el-icon>
            </div>
          </div>
          
          <div v-if="log.expanded && (log.data || log.details)" class="log-details">
            <div v-if="log.details" class="detail-section">
              <h5>详细信息:</h5>
              <p>{{ log.details }}</p>
            </div>
            
            <div v-if="log.data" class="detail-section">
              <h5>相关数据:</h5>
              <pre class="log-data">{{ formatLogData(log.data) }}</pre>
            </div>
            
            <div v-if="log.stack" class="detail-section">
              <h5>堆栈信息:</h5>
              <pre class="log-stack">{{ log.stack }}</pre>
            </div>
          </div>
        </div>
        
        <div v-if="filteredLogs.length === 0" class="empty-logs">
          <el-empty description="暂无日志记录" />
        </div>
      </div>
    </div>

    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="logDetailVisible"
      title="日志详情"
      width="70%"
      :before-close="handleLogDetailClose"
    >
      <div v-if="selectedLog" class="log-detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="时间">
            {{ formatFullTime(selectedLog.time) }}
          </el-descriptions-item>
          <el-descriptions-item label="级别">
            <el-tag :type="getLevelTagType(selectedLog.level)">
              {{ getLevelText(selectedLog.level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="分类">
            {{ getCategoryText(selectedLog.category) }}
          </el-descriptions-item>
          <el-descriptions-item label="来源">
            {{ selectedLog.source || '系统' }}
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="detail-message">
          <h4>消息内容</h4>
          <p>{{ selectedLog.message }}</p>
        </div>
        
        <div v-if="selectedLog.data" class="detail-data">
          <h4>相关数据</h4>
          <el-input
            v-model="selectedLogData"
            type="textarea"
            :rows="10"
            readonly
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Delete,
  Download,
  InfoFilled,
  WarningFilled,
  CircleCloseFilled,
  Tools,
  ArrowDown
} from '@element-plus/icons-vue'

const props = defineProps({
  logs: {
    type: Array,
    default: () => []
  },
  realTime: {
    type: Boolean,
    default: false
  }
})

// 响应式数据
const logLevel = ref('all')
const logCategory = ref('all')
const searchKeyword = ref('')
const autoScroll = ref(true)
const logDetailVisible = ref(false)
const selectedLog = ref(null)
const logContainer = ref(null)

// 内部日志数据
const internalLogs = ref([
  {
    time: new Date().toISOString(),
    level: 'info',
    category: 'system',
    message: '数据清洗引擎初始化完成',
    source: 'DataCleaningEngine'
  },
  {
    time: new Date(Date.now() - 1000).toISOString(),
    level: 'info',
    category: 'rule_execution',
    message: '开始执行清洗规则: 移除空值',
    data: { ruleType: 'remove_empty', config: { replaceWith: null } }
  },
  {
    time: new Date(Date.now() - 2000).toISOString(),
    level: 'warn',
    category: 'data_processing',
    message: '发现3条重复数据记录',
    details: '在字段"name"中发现重复值，已自动去重处理',
    data: { duplicateCount: 3, field: 'name' }
  },
  {
    time: new Date(Date.now() - 3000).toISOString(),
    level: 'error',
    category: 'validation',
    message: '数据验证失败: 日期格式错误',
    details: '字段"date"包含无效的日期格式',
    data: { field: 'date', invalidValue: '2023/13/45', expectedFormat: 'YYYY-MM-DD' },
    stack: 'Error: Invalid date format\n    at validateDate (validator.js:45)\n    at processField (processor.js:123)'
  },
  {
    time: new Date(Date.now() - 4000).toISOString(),
    level: 'info',
    category: 'rule_execution',
    message: '规则执行完成: 格式化日期',
    data: { ruleType: 'format_date', processedCount: 156, changedCount: 23 }
  },
  {
    time: new Date(Date.now() - 5000).toISOString(),
    level: 'debug',
    category: 'system',
    message: '内存使用情况检查',
    data: { memoryUsage: '45.2MB', heapUsed: '32.1MB', heapTotal: '64.0MB' }
  }
])

// 计算属性
const allLogs = computed(() => {
  return [...internalLogs.value, ...props.logs].sort((a, b) => 
    new Date(b.time) - new Date(a.time)
  )
})

const filteredLogs = computed(() => {
  let logs = allLogs.value

  // 按级别过滤
  if (logLevel.value !== 'all') {
    logs = logs.filter(log => log.level === logLevel.value)
  }

  // 按分类过滤
  if (logCategory.value !== 'all') {
    logs = logs.filter(log => log.category === logCategory.value)
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    logs = logs.filter(log => 
      log.message.toLowerCase().includes(keyword) ||
      (log.details && log.details.toLowerCase().includes(keyword))
    )
  }

  return logs
})

const logStats = computed(() => {
  const stats = { info: 0, warn: 0, error: 0, debug: 0 }
  allLogs.value.forEach(log => {
    if (stats.hasOwnProperty(log.level)) {
      stats[log.level]++
    }
  })
  return stats
})

const selectedLogData = computed(() => {
  return selectedLog.value?.data ? JSON.stringify(selectedLog.value.data, null, 2) : ''
})

// 方法
const filterLogs = () => {
  // 过滤逻辑已在计算属性中处理
}

const clearLogs = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有日志吗？', '确认操作', {
      type: 'warning'
    })
    internalLogs.value = []
    ElMessage.success('日志已清空')
  } catch {
    // 用户取消操作
  }
}

const exportLogs = () => {
  const logsText = filteredLogs.value.map(log => {
    let logLine = `[${formatFullTime(log.time)}] [${log.level.toUpperCase()}] [${log.category}] ${log.message}`
    if (log.details) {
      logLine += `\n  详情: ${log.details}`
    }
    if (log.data) {
      logLine += `\n  数据: ${JSON.stringify(log.data)}`
    }
    return logLine
  }).join('\n\n')

  const blob = new Blob([logsText], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `cleaning_logs_${Date.now()}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  ElMessage.success('日志导出成功')
}

const toggleLogExpansion = (log) => {
  if (log.data || log.details || log.stack) {
    log.expanded = !log.expanded
  }
}

const formatTime = (timeString) => {
  const date = new Date(timeString)
  return date.toLocaleTimeString('zh-CN', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatFullTime = (timeString) => {
  const date = new Date(timeString)
  return date.toLocaleString('zh-CN')
}

const formatLogData = (data) => {
  return JSON.stringify(data, null, 2)
}

const getLevelTagType = (level) => {
  const typeMap = {
    info: '',
    warn: 'warning',
    error: 'danger',
    debug: 'info'
  }
  return typeMap[level] || ''
}

const getLevelText = (level) => {
  const textMap = {
    info: '信息',
    warn: '警告',
    error: '错误',
    debug: '调试'
  }
  return textMap[level] || level
}

const getCategoryText = (category) => {
  const textMap = {
    rule_execution: '规则执行',
    data_processing: '数据处理',
    validation: '验证检查',
    system: '系统操作'
  }
  return textMap[category] || category
}

const handleLogDetailClose = () => {
  logDetailVisible.value = false
  selectedLog.value = null
}

const scrollToBottom = () => {
  if (autoScroll.value && logContainer.value) {
    nextTick(() => {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    })
  }
}

// 监听日志变化，自动滚动到底部
watch(() => allLogs.value.length, () => {
  scrollToBottom()
})

// 监听实时日志
watch(() => props.logs, (newLogs) => {
  if (props.realTime && newLogs.length > 0) {
    scrollToBottom()
  }
}, { deep: true })

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.cleaning-logs {
  padding: 20px;
}

.log-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.control-group {
  display: flex;
  gap: 15px;
  align-items: center;
}

.log-statistics {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-card.info {
  border-left: 4px solid #409eff;
}

.stat-card.warning {
  border-left: 4px solid #e6a23c;
}

.stat-card.error {
  border-left: 4px solid #f56c6c;
}

.stat-card.debug {
  border-left: 4px solid #909399;
}

.stat-icon {
  font-size: 24px;
  margin-right: 15px;
}

.stat-card.info .stat-icon {
  color: #409eff;
}

.stat-card.warning .stat-icon {
  color: #e6a23c;
}

.stat-card.error .stat-icon {
  color: #f56c6c;
}

.stat-card.debug .stat-icon {
  color: #909399;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  font-size: 12px;
  color: #606266;
  margin-top: 2px;
}

.log-list {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  font-weight: 500;
  color: #2c3e50;
}

.log-container {
  height: 500px;
  overflow-y: auto;
  padding: 10px;
}

.log-container.auto-scroll {
  scroll-behavior: smooth;
}

.log-entry {
  margin-bottom: 8px;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.log-entry:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.log-entry.log-info {
  border-left: 4px solid #409eff;
  background-color: #f0f9ff;
}

.log-entry.log-warn {
  border-left: 4px solid #e6a23c;
  background-color: #fdf6ec;
}

.log-entry.log-error {
  border-left: 4px solid #f56c6c;
  background-color: #fef0f0;
}

.log-entry.log-debug {
  border-left: 4px solid #909399;
  background-color: #f4f4f5;
}

.log-main {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  gap: 15px;
}

.log-time {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #606266;
  min-width: 80px;
}

.log-level {
  min-width: 60px;
}

.log-category {
  min-width: 80px;
}

.log-message {
  flex: 1;
  color: #2c3e50;
  font-size: 14px;
  line-height: 1.4;
}

.log-expand-icon {
  color: #909399;
  transition: transform 0.3s ease;
}

.log-expanded .log-expand-icon {
  transform: rotate(180deg);
}

.log-details {
  padding: 15px 20px;
  background-color: rgba(255, 255, 255, 0.8);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.detail-section {
  margin-bottom: 15px;
}

.detail-section h5 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 13px;
}

.detail-section p {
  margin: 0;
  color: #606266;
  line-height: 1.5;
}

.log-data,
.log-stack {
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  color: #2c3e50;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
}

.empty-logs {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.log-detail-content {
  max-height: 600px;
  overflow-y: auto;
}

.detail-message,
.detail-data {
  margin-top: 20px;
}

.detail-message h4,
.detail-data h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.detail-message p {
  margin: 0;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 6px;
  line-height: 1.6;
}
</style>
