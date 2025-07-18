<template>
  <div class="data-preview">
    <!-- 预览控制栏 -->
    <div class="preview-controls">
      <div class="control-group">
        <el-select v-model="viewMode" placeholder="选择视图模式" @change="handleViewModeChange">
          <el-option label="表格视图" value="table" />
          <el-option label="卡片视图" value="card" />
          <el-option label="JSON视图" value="json" />
          <el-option label="统计视图" value="stats" />
        </el-select>
        
        <el-select v-model="dataType" placeholder="数据类型" @change="handleDataTypeChange">
          <el-option label="全部数据" value="all" />
          <el-option label="清洗前" value="original" />
          <el-option label="清洗后" value="cleaned" />
          <el-option label="变更记录" value="changes" />
        </el-select>
      </div>

      <div class="control-group">
        <el-input
          v-model="searchText"
          placeholder="搜索数据..."
          prefix-icon="Search"
          clearable
          @input="handleSearch"
        />
        
        <el-button type="primary" @click="exportData">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 数据统计概览 -->
    <div v-if="showStats" class="data-stats">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-statistic title="总记录数" :value="statistics.totalRecords" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="有效记录" :value="statistics.validRecords" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="清洗修复" :value="statistics.fixedRecords" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="数据质量" :value="statistics.qualityScore" suffix="%" />
        </el-col>
      </el-row>
    </div>

    <!-- 表格视图 -->
    <div v-if="viewMode === 'table'" class="table-view">
      <el-table
        :data="filteredData"
        :height="tableHeight"
        stripe
        border
        :loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="80" />
        
        <el-table-column
          v-for="column in tableColumns"
          :key="column.prop"
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :show-overflow-tooltip="true"
        >
          <template #default="{ row }">
            <div class="cell-content">
              <span v-if="!column.isChanged" class="cell-value">{{ row[column.prop] }}</span>
              <div v-else class="cell-changed">
                <div class="original-value">原值: {{ row.original?.[column.prop] || '-' }}</div>
                <div class="new-value">新值: {{ row[column.prop] }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row, $index }">
            <el-button type="text" size="small" @click="viewDetails(row, $index)">
              详情
            </el-button>
            <el-button type="text" size="small" @click="viewChanges(row, $index)">
              变更
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalRecords"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="viewMode === 'card'" class="card-view">
      <div class="card-grid">
        <el-card
          v-for="(item, index) in filteredData"
          :key="index"
          class="data-card"
          shadow="hover"
        >
          <template #header>
            <div class="card-header">
              <span class="card-title">记录 #{{ index + 1 }}</span>
              <el-tag v-if="item._isChanged" type="warning" size="small">已修改</el-tag>
            </div>
          </template>
          
          <div class="card-content">
            <div
              v-for="(value, key) in item"
              :key="key"
              class="field-item"
            >
              <div v-if="!key.startsWith('_')" class="field-row">
                <span class="field-label">{{ getFieldLabel(key) }}:</span>
                <span class="field-value">{{ formatValue(value) }}</span>
              </div>
            </div>
          </div>
          
          <template #footer>
            <div class="card-actions">
              <el-button type="text" @click="viewDetails(item, index)">查看详情</el-button>
              <el-button v-if="item._isChanged" type="text" @click="viewChanges(item, index)">
                查看变更
              </el-button>
            </div>
          </template>
        </el-card>
      </div>
    </div>

    <!-- JSON视图 -->
    <div v-if="viewMode === 'json'" class="json-view">
      <div class="json-controls">
        <el-switch
          v-model="jsonPretty"
          active-text="格式化"
          inactive-text="压缩"
          @change="updateJsonDisplay"
        />
        <el-button type="text" @click="copyJson">
          <el-icon><CopyDocument /></el-icon>
          复制JSON
        </el-button>
      </div>
      
      <div class="json-content">
        <pre v-if="jsonPretty" class="json-pretty">{{ jsonDisplay }}</pre>
        <div v-else class="json-compact">{{ jsonDisplay }}</div>
      </div>
    </div>

    <!-- 统计视图 -->
    <div v-if="viewMode === 'stats'" class="stats-view">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card title="字段统计">
            <div class="field-stats">
              <div
                v-for="stat in fieldStatistics"
                :key="stat.field"
                class="field-stat-item"
              >
                <div class="stat-header">
                  <span class="field-name">{{ stat.field }}</span>
                  <el-tag :type="getFieldTypeTag(stat.type)" size="small">{{ stat.type }}</el-tag>
                </div>
                <div class="stat-details">
                  <span>有效值: {{ stat.validCount }}/{{ stat.totalCount }}</span>
                  <span>完整率: {{ stat.completeness }}%</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card title="数据质量分布">
            <div class="quality-distribution">
              <div
                v-for="quality in qualityDistribution"
                :key="quality.level"
                class="quality-item"
              >
                <div class="quality-bar">
                  <div 
                    class="quality-fill" 
                    :style="{ width: `${quality.percentage}%`, backgroundColor: quality.color }"
                  ></div>
                </div>
                <div class="quality-info">
                  <span class="quality-level">{{ quality.level }}</span>
                  <span class="quality-count">{{ quality.count }}条</span>
                  <span class="quality-percentage">{{ quality.percentage }}%</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="数据详情"
      width="60%"
      :before-close="handleDetailClose"
    >
      <div v-if="selectedRecord" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item
            v-for="(value, key) in selectedRecord"
            :key="key"
            :label="getFieldLabel(key)"
          >
            <span v-if="!key.startsWith('_')">{{ formatValue(value) }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 变更对话框 -->
    <el-dialog
      v-model="changesDialogVisible"
      title="数据变更记录"
      width="70%"
      :before-close="handleChangesClose"
    >
      <div v-if="selectedChanges" class="changes-content">
        <el-table :data="selectedChanges" border>
          <el-table-column prop="field" label="字段" width="150" />
          <el-table-column prop="originalValue" label="原始值" />
          <el-table-column prop="newValue" label="新值" />
          <el-table-column prop="changeType" label="变更类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getChangeTypeTag(row.changeType)">{{ row.changeType }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Search, CopyDocument } from '@element-plus/icons-vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  showStatistics: {
    type: Boolean,
    default: true
  }
})

// 响应式数据
const viewMode = ref('table')
const dataType = ref('all')
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const jsonPretty = ref(true)
const detailDialogVisible = ref(false)
const changesDialogVisible = ref(false)
const selectedRecord = ref(null)
const selectedChanges = ref([])
const selectedRows = ref([])

// 计算属性
const showStats = computed(() => props.showStatistics && viewMode.value !== 'stats')

const tableHeight = computed(() => {
  return window.innerHeight - 400
})

const filteredData = computed(() => {
  let data = getCurrentData()
  
  if (searchText.value) {
    data = data.filter(item => {
      return Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchText.value.toLowerCase())
      )
    })
  }
  
  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return data.slice(start, end)
})

const totalRecords = computed(() => {
  return getCurrentData().length
})

const tableColumns = computed(() => {
  const data = getCurrentData()
  if (data.length === 0) return []
  
  const firstRecord = data[0]
  return Object.keys(firstRecord)
    .filter(key => !key.startsWith('_'))
    .map(key => ({
      prop: key,
      label: getFieldLabel(key),
      width: getColumnWidth(key),
      isChanged: checkIfFieldChanged(key)
    }))
})

const statistics = computed(() => {
  const data = getCurrentData()
  return {
    totalRecords: data.length,
    validRecords: data.filter(item => !item._isEmpty).length,
    fixedRecords: data.filter(item => item._isChanged).length,
    qualityScore: calculateQualityScore(data)
  }
})

const fieldStatistics = computed(() => {
  const data = getCurrentData()
  if (data.length === 0) return []
  
  const fields = Object.keys(data[0]).filter(key => !key.startsWith('_'))
  return fields.map(field => {
    const values = data.map(item => item[field])
    const validValues = values.filter(value => value !== null && value !== undefined && value !== '')
    
    return {
      field,
      type: getFieldType(values),
      totalCount: values.length,
      validCount: validValues.length,
      completeness: Math.round((validValues.length / values.length) * 100)
    }
  })
})

const qualityDistribution = computed(() => {
  const data = getCurrentData()
  const distribution = {
    high: { count: 0, color: '#67c23a' },
    medium: { count: 0, color: '#e6a23c' },
    low: { count: 0, color: '#f56c6c' }
  }
  
  data.forEach(item => {
    const quality = calculateRecordQuality(item)
    if (quality >= 80) {
      distribution.high.count++
    } else if (quality >= 60) {
      distribution.medium.count++
    } else {
      distribution.low.count++
    }
  })
  
  const total = data.length
  return Object.keys(distribution).map(level => ({
    level: level === 'high' ? '高质量' : level === 'medium' ? '中等质量' : '低质量',
    count: distribution[level].count,
    percentage: total > 0 ? Math.round((distribution[level].count / total) * 100) : 0,
    color: distribution[level].color
  }))
})

const jsonDisplay = computed(() => {
  const data = getCurrentData()
  return jsonPretty.value ? JSON.stringify(data, null, 2) : JSON.stringify(data)
})

// 方法
const getCurrentData = () => {
  switch (dataType.value) {
    case 'original':
      return props.data.originalData || []
    case 'cleaned':
      return props.data.cleanedData || []
    case 'changes':
      return props.data.changes || []
    default:
      return props.data.cleanedData || props.data.originalData || []
  }
}

const handleViewModeChange = () => {
  currentPage.value = 1
}

const handleDataTypeChange = () => {
  currentPage.value = 1
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const viewDetails = (row, index) => {
  selectedRecord.value = row
  detailDialogVisible.value = true
}

const viewChanges = (row, index) => {
  // 构建变更记录
  const changes = []
  if (row.original) {
    Object.keys(row).forEach(key => {
      if (!key.startsWith('_') && row.original[key] !== row[key]) {
        changes.push({
          field: key,
          originalValue: row.original[key],
          newValue: row[key],
          changeType: getChangeType(row.original[key], row[key])
        })
      }
    })
  }
  selectedChanges.value = changes
  changesDialogVisible.value = true
}

const exportData = () => {
  const data = getCurrentData()
  const csv = convertToCSV(data)
  downloadCSV(csv, `data_export_${Date.now()}.csv`)
  ElMessage.success('数据导出成功')
}

const copyJson = () => {
  navigator.clipboard.writeText(jsonDisplay.value).then(() => {
    ElMessage.success('JSON已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

const updateJsonDisplay = () => {
  // JSON显示更新逻辑
}

const handleDetailClose = () => {
  detailDialogVisible.value = false
  selectedRecord.value = null
}

const handleChangesClose = () => {
  changesDialogVisible.value = false
  selectedChanges.value = []
}

// 辅助函数
const getFieldLabel = (key) => {
  const labelMap = {
    id: 'ID',
    name: '名称',
    title: '标题',
    description: '描述',
    date: '日期',
    status: '状态'
  }
  return labelMap[key] || key
}

const formatValue = (value) => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const getColumnWidth = (key) => {
  const widthMap = {
    id: 80,
    name: 150,
    title: 200,
    description: 300
  }
  return widthMap[key] || 120
}

const checkIfFieldChanged = (field) => {
  const data = getCurrentData()
  return data.some(item => item.original && item.original[field] !== item[field])
}

const getFieldType = (values) => {
  const sample = values.find(v => v !== null && v !== undefined && v !== '')
  if (typeof sample === 'number') return '数字'
  if (typeof sample === 'boolean') return '布尔'
  if (sample instanceof Date) return '日期'
  return '文本'
}

const getFieldTypeTag = (type) => {
  const tagMap = {
    '数字': 'success',
    '布尔': 'info',
    '日期': 'warning',
    '文本': ''
  }
  return tagMap[type] || ''
}

const getChangeType = (oldValue, newValue) => {
  if (oldValue === null || oldValue === undefined || oldValue === '') {
    return '新增'
  }
  if (newValue === null || newValue === undefined || newValue === '') {
    return '删除'
  }
  return '修改'
}

const getChangeTypeTag = (type) => {
  const tagMap = {
    '新增': 'success',
    '删除': 'danger',
    '修改': 'warning'
  }
  return tagMap[type] || ''
}

const calculateQualityScore = (data) => {
  if (data.length === 0) return 0
  
  const scores = data.map(calculateRecordQuality)
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
}

const calculateRecordQuality = (record) => {
  const fields = Object.keys(record).filter(key => !key.startsWith('_'))
  const validFields = fields.filter(key => {
    const value = record[key]
    return value !== null && value !== undefined && value !== ''
  })
  
  return Math.round((validFields.length / fields.length) * 100)
}

const convertToCSV = (data) => {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0]).filter(key => !key.startsWith('_'))
  const csvRows = [headers.join(',')]
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header]
      return typeof value === 'string' ? `"${value}"` : value
    })
    csvRows.push(values.join(','))
  })
  
  return csvRows.join('\n')
}

const downloadCSV = (csv, filename) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  // 组件挂载后的初始化逻辑
})
</script>

<style scoped>
.data-preview {
  padding: 20px;
}

.preview-controls {
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

.data-stats {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f0f9ff;
  border-radius: 8px;
}

.table-view {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}

.cell-content {
  min-height: 20px;
}

.cell-changed {
  font-size: 12px;
}

.original-value {
  color: #f56c6c;
  text-decoration: line-through;
}

.new-value {
  color: #67c23a;
  font-weight: 500;
}

.pagination-wrapper {
  padding: 20px;
  text-align: center;
  border-top: 1px solid #e4e7ed;
}

.card-view {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.data-card {
  height: fit-content;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-weight: 500;
  color: #2c3e50;
}

.field-item {
  margin-bottom: 8px;
}

.field-row {
  display: flex;
  justify-content: space-between;
}

.field-label {
  font-weight: 500;
  color: #606266;
  min-width: 80px;
}

.field-value {
  color: #2c3e50;
  word-break: break-all;
}

.card-actions {
  display: flex;
  gap: 10px;
}

.json-view {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
}

.json-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.json-content {
  max-height: 600px;
  overflow: auto;
}

.json-pretty {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}

.json-compact {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  word-break: break-all;
}

.stats-view {
  padding: 20px;
}

.field-stats {
  max-height: 400px;
  overflow-y: auto;
}

.field-stat-item {
  padding: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.field-name {
  font-weight: 500;
  color: #2c3e50;
}

.stat-details {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #606266;
}

.quality-distribution {
  padding: 10px 0;
}

.quality-item {
  margin-bottom: 15px;
}

.quality-bar {
  height: 20px;
  background-color: #f5f7fa;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 8px;
}

.quality-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.quality-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.quality-level {
  font-weight: 500;
  color: #2c3e50;
}

.quality-count {
  color: #606266;
}

.quality-percentage {
  color: #909399;
  font-size: 12px;
}

.detail-content {
  max-height: 500px;
  overflow-y: auto;
}

.changes-content {
  max-height: 400px;
  overflow-y: auto;
}
</style>
