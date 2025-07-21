<template>
  <div class="cleaning-logs">
    <!-- 日志控制栏 -->
    <div class="logs-header">
      <div class="logs-controls">
        <el-select v-model="selectedLevel" placeholder="选择日志级别" size="small" style="width: 120px">
          <el-option label="全部" value="all" />
          <el-option label="信息" value="info" />
          <el-option label="警告" value="warn" />
          <el-option label="错误" value="error" />
          <el-option label="调试" value="debug" />
        </el-select>
        
        <el-input
          v-model="searchText"
          placeholder="搜索日志..."
          size="small"
          style="width: 200px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-button size="small" @click="refreshLogs">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        
        <el-button size="small" @click="clearLogs">
          <el-icon><Delete /></el-icon>
          清空
        </el-button>
        
        <el-button size="small" @click="exportLogs">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
      
      <div class="logs-stats">
        <el-tag size="small" type="info">总计: {{ filteredLogs.length }}</el-tag>
        <el-tag size="small" type="success">信息: {{ getLogCount('info') }}</el-tag>
        <el-tag size="small" type="warning">警告: {{ getLogCount('warn') }}</el-tag>
        <el-tag size="small" type="danger">错误: {{ getLogCount('error') }}</el-tag>
      </div>
    </div>

    <!-- 日志列表 -->
    <div class="logs-container">
      <div class="logs-list" ref="logsContainer">
        <div
          v-for="(log, index) in paginatedLogs"
          :key="index"
          class="log-item"
          :class="[`log-${log.level}`, { 'log-highlighted': isHighlighted(log) }]"
        >
          <div class="log-indicator" :class="`indicator-${log.level}`"></div>
          
          <div class="log-content">
            <div class="log-header">
              <span class="log-time">{{ formatTime(log.time) }}</span>
              <el-tag :type="getLevelType(log.level)" size="small">{{ log.level.toUpperCase() }}</el-tag>
              <span v-if="log.category" class="log-category">[{{ log.category }}]</span>
            </div>
            
            <div class="log-message">{{ log.message }}</div>
            
            <div v-if="log.details" class="log-details">
              <el-collapse>
                <el-collapse-item title="详细信息" name="details">
                  <pre class="log-details-content">{{ formatDetails(log.details) }}</pre>
                </el-collapse-item>
              </el-collapse>
            </div>
            
            <div v-if="log.data" class="log-data">
              <el-collapse>
                <el-collapse-item title="相关数据" name="data">
                  <pre class="log-data-content">{{ JSON.stringify(log.data, null, 2) }}</pre>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
          
          <div class="log-actions">
            <el-button size="small" text @click="copyLog(log)">
              <el-icon><CopyDocument /></el-icon>
            </el-button>
            <el-button size="small" text @click="showLogDetails(log)">
              <el-icon><View /></el-icon>
            </el-button>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="filteredLogs.length === 0" class="empty-logs">
          <el-empty description="暂无日志记录">
            <el-button type="primary" @click="refreshLogs">刷新日志</el-button>
          </el-empty>
        </div>
      </div>
      
      <!-- 分页 -->
      <div v-if="filteredLogs.length > pageSize" class="logs-pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredLogs.length"
          layout="prev, pager, next, sizes, total"
          :page-sizes="[20, 50, 100, 200]"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="detailsVisible"
      title="日志详情"
      width="60%"
      :before-close="closeDetails"
    >
      <div v-if="selectedLog" class="log-details-dialog">
        <div class="detail-section">
          <h4>基本信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">时间:</span>
              <span class="detail-value">{{ formatTime(selectedLog.time) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">级别:</span>
              <el-tag :type="getLevelType(selectedLog.level)" size="small">
                {{ selectedLog.level.toUpperCase() }}
              </el-tag>
            </div>
            <div class="detail-item">
              <span class="detail-label">分类:</span>
              <span class="detail-value">{{ selectedLog.category || '无' }}</span>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h4>消息内容</h4>
          <div class="message-content">{{ selectedLog.message }}</div>
        </div>
        
        <div v-if="selectedLog.details" class="detail-section">
          <h4>详细信息</h4>
          <pre class="details-content">{{ formatDetails(selectedLog.details) }}</pre>
        </div>
        
        <div v-if="selectedLog.data" class="detail-section">
          <h4>相关数据</h4>
          <pre class="data-content">{{ JSON.stringify(selectedLog.data, null, 2) }}</pre>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="closeDetails">关闭</el-button>
        <el-button type="primary" @click="copyLog(selectedLog)">复制日志</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, 
  Refresh, 
  Delete, 
  Download, 
  CopyDocument, 
  View 
} from '@element-plus/icons-vue'

export default {
  name: 'CleaningLogs',
  components: {
    Search,
    Refresh,
    Delete,
    Download,
    CopyDocument,
    View
  },
  props: {
    logs: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const selectedLevel = ref('all')
    const searchText = ref('')
    const currentPage = ref(1)
    const pageSize = ref(50)
    const logsContainer = ref()
    const detailsVisible = ref(false)
    const selectedLog = ref(null)

    // 模拟更多日志数据
    const allLogs = ref([
      ...props.logs,
      {
        time: new Date().toISOString(),
        level: 'info',
        category: 'system',
        message: '开始数据清洗流程',
        data: { step: 1, progress: 0 }
      },
      {
        time: new Date().toISOString(),
        level: 'info',
        category: 'parser',
        message: '正在解析文件内容',
        details: '解析器已启动，开始处理上传的文件'
      },
      {
        time: new Date().toISOString(),
        level: 'warn',
        category: 'validation',
        message: '发现部分字段缺失',
        details: '物料编码字段在第3行缺失',
        data: { row: 3, field: 'materialCode' }
      },
      {
        time: new Date().toISOString(),
        level: 'info',
        category: 'cleaning',
        message: '应用清洗规则: 去除空值',
        data: { rule: 'remove_empty', affected: 12 }
      },
      {
        time: new Date().toISOString(),
        level: 'error',
        category: 'validation',
        message: '数据格式验证失败',
        details: '日期格式不符合标准: 2025/01/18 应为 2025-01-18',
        data: { row: 5, field: 'date', value: '2025/01/18' }
      },
      {
        time: new Date().toISOString(),
        level: 'info',
        category: 'system',
        message: '数据清洗完成',
        data: { totalRecords: 1250, cleanedRecords: 1180, duration: 8500 }
      }
    ])

    // 计算属性
    const filteredLogs = computed(() => {
      let logs = allLogs.value

      // 按级别过滤
      if (selectedLevel.value !== 'all') {
        logs = logs.filter(log => log.level === selectedLevel.value)
      }

      // 按搜索文本过滤
      if (searchText.value) {
        const search = searchText.value.toLowerCase()
        logs = logs.filter(log => 
          log.message.toLowerCase().includes(search) ||
          (log.category && log.category.toLowerCase().includes(search)) ||
          (log.details && log.details.toLowerCase().includes(search))
        )
      }

      return logs.sort((a, b) => new Date(b.time) - new Date(a.time))
    })

    const paginatedLogs = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredLogs.value.slice(start, end)
    })

    // 方法
    const getLogCount = (level) => {
      return allLogs.value.filter(log => log.level === level).length
    }

    const getLevelType = (level) => {
      const types = {
        info: 'info',
        warn: 'warning',
        error: 'danger',
        debug: 'success'
      }
      return types[level] || 'info'
    }

    const formatTime = (time) => {
      return new Date(time).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    const formatDetails = (details) => {
      if (typeof details === 'string') {
        return details
      }
      return JSON.stringify(details, null, 2)
    }

    const isHighlighted = (log) => {
      return searchText.value && 
             log.message.toLowerCase().includes(searchText.value.toLowerCase())
    }

    const refreshLogs = () => {
      ElMessage.success('日志已刷新')
    }

    const clearLogs = async () => {
      try {
        await ElMessageBox.confirm('确定要清空所有日志吗？', '确认清空', {
          type: 'warning'
        })
        allLogs.value = []
        ElMessage.success('日志已清空')
      } catch {
        // 用户取消
      }
    }

    const exportLogs = () => {
      const logsData = filteredLogs.value.map(log => ({
        time: formatTime(log.time),
        level: log.level,
        category: log.category,
        message: log.message,
        details: log.details,
        data: log.data
      }))
      
      const dataStr = JSON.stringify(logsData, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `cleaning_logs_${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
      
      ElMessage.success('日志导出成功')
    }

    const copyLog = (log) => {
      const logText = `[${formatTime(log.time)}] [${log.level.toUpperCase()}] ${log.message}`
      navigator.clipboard.writeText(logText).then(() => {
        ElMessage.success('日志已复制到剪贴板')
      }).catch(() => {
        ElMessage.error('复制失败')
      })
    }

    const showLogDetails = (log) => {
      selectedLog.value = log
      detailsVisible.value = true
    }

    const closeDetails = () => {
      detailsVisible.value = false
      selectedLog.value = null
    }

    const handleSizeChange = (size) => {
      pageSize.value = size
      currentPage.value = 1
    }

    return {
      selectedLevel,
      searchText,
      currentPage,
      pageSize,
      logsContainer,
      detailsVisible,
      selectedLog,
      filteredLogs,
      paginatedLogs,
      getLogCount,
      getLevelType,
      formatTime,
      formatDetails,
      isHighlighted,
      refreshLogs,
      clearLogs,
      exportLogs,
      copyLog,
      showLogDetails,
      closeDetails,
      handleSizeChange
    }
  }
}
</script>

<style scoped>
.cleaning-logs {
  padding: 20px 0;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.logs-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.logs-stats {
  display: flex;
  gap: 8px;
  align-items: center;
}

.logs-container {
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  overflow: hidden;
}

.logs-list {
  max-height: 600px;
  overflow-y: auto;
}

.log-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px;
  border-bottom: 1px solid #f0f2f5;
  transition: background-color 0.2s ease;
}

.log-item:hover {
  background-color: #f8f9fa;
}

.log-item:last-child {
  border-bottom: none;
}

.log-item.log-highlighted {
  background-color: #fff7e6;
}

.log-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.indicator-info {
  background-color: #409eff;
}

.indicator-warn {
  background-color: #e6a23c;
}

.indicator-error {
  background-color: #f56c6c;
}

.indicator-debug {
  background-color: #67c23a;
}

.log-content {
  flex: 1;
  min-width: 0;
}

.log-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.log-time {
  font-size: 12px;
  color: #909399;
  font-family: monospace;
}

.log-category {
  font-size: 12px;
  color: #606266;
  font-weight: 500;
}

.log-message {
  color: #2c3e50;
  line-height: 1.5;
  margin-bottom: 8px;
}

.log-details,
.log-data {
  margin-top: 10px;
}

.log-details-content,
.log-data-content {
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.log-actions {
  display: flex;
  gap: 5px;
  flex-shrink: 0;
}

.empty-logs {
  padding: 40px;
  text-align: center;
}

.logs-pagination {
  padding: 15px;
  border-top: 1px solid #f0f2f5;
  background-color: #fafafa;
}

.log-details-dialog {
  max-height: 60vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 600;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.detail-label {
  font-weight: 500;
  color: #606266;
}

.detail-value {
  color: #2c3e50;
}

.message-content {
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  line-height: 1.5;
}

.details-content,
.data-content {
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 200px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .logs-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .logs-controls {
    flex-wrap: wrap;
  }
  
  .logs-stats {
    justify-content: center;
  }
  
  .log-item {
    flex-direction: column;
    gap: 10px;
  }
  
  .log-actions {
    align-self: flex-end;
  }
}
</style>
