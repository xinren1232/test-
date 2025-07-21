<template>
  <div class="data-preview">
    <div class="preview-header">
      <div class="view-controls">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button label="table">表格视图</el-radio-button>
          <el-radio-button label="card">卡片视图</el-radio-button>
          <el-radio-button label="json">JSON视图</el-radio-button>
        </el-radio-group>
      </div>

      <div class="preview-actions">
        <el-switch
          v-model="editMode"
          active-text="编辑模式"
          inactive-text="查看模式"
          size="small"
          style="margin-right: 10px"
        />
        <el-input
          v-model="searchText"
          placeholder="搜索数据..."
          size="small"
          style="width: 200px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button v-if="editMode && hasUnsavedChanges" size="small" type="primary" @click="saveChanges">
          <el-icon><Check /></el-icon>
          保存更改
        </el-button>
        <el-button v-if="editMode && hasUnsavedChanges" size="small" @click="discardChanges">
          <el-icon><Close /></el-icon>
          取消更改
        </el-button>
        <el-button v-if="editMode" size="small" type="warning" @click="openBatchEditor">
          <el-icon><Operation /></el-icon>
          批量编辑
        </el-button>
        <el-button size="small" @click="exportData">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <!-- 表格视图 -->
    <div v-if="viewMode === 'table'" class="table-view">
      <el-table :data="filteredData" stripe style="width: 100%" row-key="id">
        <!-- 操作列 -->
        <el-table-column v-if="editMode" label="操作" width="120" fixed="left">
          <template #default="{ row, $index }">
            <el-button-group>
              <el-button
                size="small"
                type="primary"
                :icon="Edit"
                @click="editRow(row, $index)"
                v-if="!row._editing"
              />
              <el-button
                size="small"
                type="success"
                :icon="Check"
                @click="saveRow(row, $index)"
                v-if="row._editing"
              />
              <el-button
                size="small"
                type="info"
                :icon="Close"
                @click="cancelEdit(row, $index)"
                v-if="row._editing"
              />
            </el-button-group>
          </template>
        </el-table-column>

        <!-- 数据列 -->
        <el-table-column
          v-for="column in tableColumns"
          :key="column.prop"
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          show-overflow-tooltip
        >
          <template #default="{ row, $index }">
            <!-- 编辑模式 -->
            <div v-if="editMode && row._editing" class="editable-cell">
              <el-input
                v-if="getColumnType(column.prop) === 'text'"
                v-model="row[column.prop]"
                size="small"
                @blur="validateField(row, column.prop)"
                @keyup.enter="saveRow(row, $index)"
                @keyup.esc="cancelEdit(row, $index)"
              />
              <el-input-number
                v-else-if="getColumnType(column.prop) === 'number'"
                v-model="row[column.prop]"
                size="small"
                @blur="validateField(row, column.prop)"
                @keyup.enter="saveRow(row, $index)"
                @keyup.esc="cancelEdit(row, $index)"
              />
              <el-date-picker
                v-else-if="getColumnType(column.prop) === 'date'"
                v-model="row[column.prop]"
                type="date"
                size="small"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="validateField(row, column.prop)"
              />
              <el-select
                v-else-if="getColumnType(column.prop) === 'select'"
                v-model="row[column.prop]"
                size="small"
                @change="validateField(row, column.prop)"
              >
                <el-option
                  v-for="option in getSelectOptions(column.prop)"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
              <el-input
                v-else
                v-model="row[column.prop]"
                size="small"
                @blur="validateField(row, column.prop)"
                @keyup.enter="saveRow(row, $index)"
                @keyup.esc="cancelEdit(row, $index)"
              />
            </div>

            <!-- 查看模式 -->
            <div v-else class="view-cell">
              <span
                :class="{
                  'changed-value': hasChanges(row, column.prop),
                  'invalid-value': hasValidationError(row, column.prop)
                }"
              >
                {{ formatCellValue(row[column.prop], column.prop) }}
                <el-icon v-if="hasChanges(row, column.prop)" class="change-icon"><Edit /></el-icon>
                <el-icon v-if="hasValidationError(row, column.prop)" class="error-icon"><Warning /></el-icon>
              </span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 卡片视图 -->
    <div v-if="viewMode === 'card'" class="card-view">
      <div class="cards-grid">
        <el-card v-for="(item, index) in filteredData" :key="index" class="data-card">
          <template #header>
            <div class="card-header">
              <span>记录 #{{ index + 1 }}</span>
              <el-tag v-if="hasAnyChanges(item)" type="warning" size="small">已修改</el-tag>
            </div>
          </template>
          
          <div class="card-content">
            <div v-for="column in tableColumns" :key="column.prop" class="card-field">
              <span class="field-label">{{ column.label }}:</span>
              <span 
                class="field-value"
                :class="{ 'changed-value': hasChanges(item, column.prop) }"
              >
                {{ item[column.prop] }}
                <el-icon v-if="hasChanges(item, column.prop)" class="change-icon"><Edit /></el-icon>
              </span>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- JSON视图 -->
    <div v-if="viewMode === 'json'" class="json-view">
      <el-card>
        <template #header>
          <div class="json-header">
            <span>JSON 数据</span>
            <el-button size="small" @click="copyJson">
              <el-icon><CopyDocument /></el-icon>
              复制
            </el-button>
          </div>
        </template>
        
        <pre class="json-content">{{ formattedJson }}</pre>
      </el-card>
    </div>

    <!-- 数据统计 -->
    <div class="data-stats">
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <div class="stat-value">{{ totalRecords }}</div>
            <div class="stat-label">总记录数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <div class="stat-value">{{ validRecords }}</div>
            <div class="stat-label">有效记录</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔄</div>
          <div class="stat-info">
            <div class="stat-value">{{ changedRecords }}</div>
            <div class="stat-label">已修改记录</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-info">
            <div class="stat-value">{{ completenessRate }}%</div>
            <div class="stat-label">完整性</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 批量编辑器 -->
    <BatchEditor
      v-model="batchEditorVisible"
      :data="mockData"
      @save-changes="handleBatchSaveChanges"
      @delete-rows="handleBatchDeleteRows"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Download,
  Edit,
  CopyDocument,
  Check,
  Close,
  Warning,
  Operation
} from '@element-plus/icons-vue'
import BatchEditor from './BatchEditor.vue'

export default {
  name: 'DataPreview',
  components: {
    Search,
    Download,
    Edit,
    CopyDocument,
    Check,
    Close,
    Warning,
    Operation,
    BatchEditor
  },
  emits: ['row-updated', 'save-changes'],
  props: {
    cleaningResult: {
      type: Object,
      required: true
    }
  },
  setup(props, { emit }) {
    const viewMode = ref('table')
    const searchText = ref('')
    const editMode = ref(false)
    const hasUnsavedChanges = ref(false)
    const originalData = ref([])
    const validationErrors = ref({})
    const batchEditorVisible = ref(false)

    // 表格列配置
    const tableColumns = ref([
      { prop: 'materialCode', label: '物料编码', width: 120, type: 'text', required: true },
      { prop: 'materialName', label: '物料名称', width: 150, type: 'text', required: true },
      { prop: 'supplier', label: '供应商', width: 120, type: 'select', required: true },
      { prop: 'issueType', label: '问题类型', width: 100, type: 'select', required: true },
      { prop: 'description', label: '问题描述', width: 200, type: 'text', required: false },
      { prop: 'status', label: '状态', width: 80, type: 'select', required: true }
    ])

    // 下拉选项配置
    const selectOptions = ref({
      supplier: [
        { label: '华星光电', value: '华星光电' },
        { label: '京东方', value: '京东方' },
        { label: '比亚迪', value: '比亚迪' },
        { label: '宁德时代', value: '宁德时代' },
        { label: '富士康', value: '富士康' }
      ],
      issueType: [
        { label: '尺寸偏差', value: '尺寸偏差' },
        { label: '性能问题', value: '性能问题' },
        { label: '外观缺陷', value: '外观缺陷' },
        { label: '材料问题', value: '材料问题' },
        { label: '工艺问题', value: '工艺问题' }
      ],
      status: [
        { label: '待处理', value: '待处理' },
        { label: '处理中', value: '处理中' },
        { label: '已处理', value: '已处理' },
        { label: '已关闭', value: '已关闭' }
      ]
    })

    // 模拟数据
    const mockData = ref([
      {
        materialCode: 'AXX-H1234',
        materialName: '螺丝组件',
        supplier: '华星光电',
        issueType: '尺寸偏差',
        description: '螺丝孔位偏差导致治具无法安装',
        status: '已处理',
        _changes: ['materialName', 'description'] // 标记哪些字段被修改了
      },
      {
        materialCode: 'BXX-H5678',
        materialName: '电容器',
        supplier: '京东方',
        issueType: '性能问题',
        description: '电容值不稳定',
        status: '处理中',
        _changes: ['status']
      },
      {
        materialCode: 'CXX-H9012',
        materialName: '连接器',
        supplier: '比亚迪',
        issueType: '外观缺陷',
        description: '表面有划痕',
        status: '待处理',
        _changes: []
      }
    ])

    // 计算属性
    const filteredData = computed(() => {
      if (!searchText.value) {
        return mockData.value
      }
      
      return mockData.value.filter(item => {
        return Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchText.value.toLowerCase())
        )
      })
    })

    const formattedJson = computed(() => {
      return JSON.stringify(filteredData.value, null, 2)
    })

    const totalRecords = computed(() => mockData.value.length)
    
    const validRecords = computed(() => {
      return mockData.value.filter(item => item.status !== '无效').length
    })
    
    const changedRecords = computed(() => {
      return mockData.value.filter(item => item._changes && item._changes.length > 0).length
    })
    
    const completenessRate = computed(() => {
      const totalFields = tableColumns.value.length
      let totalCompleteness = 0
      
      mockData.value.forEach(item => {
        let completeness = 0
        tableColumns.value.forEach(column => {
          if (item[column.prop] && item[column.prop] !== '') {
            completeness++
          }
        })
        totalCompleteness += (completeness / totalFields) * 100
      })
      
      return Math.round(totalCompleteness / mockData.value.length)
    })

    // 方法
    const hasChanges = (row, prop) => {
      return row._changes && row._changes.includes(prop)
    }

    const hasAnyChanges = (row) => {
      return row._changes && row._changes.length > 0
    }

    const hasValidationError = (row, prop) => {
      const key = `${row.id || row.materialCode}_${prop}`
      return validationErrors.value[key]
    }

    const getColumnType = (prop) => {
      const column = tableColumns.value.find(col => col.prop === prop)
      return column ? column.type : 'text'
    }

    const getSelectOptions = (prop) => {
      return selectOptions.value[prop] || []
    }

    const formatCellValue = (value, prop) => {
      if (value === null || value === undefined) return ''
      if (getColumnType(prop) === 'date' && value) {
        return new Date(value).toLocaleDateString()
      }
      return String(value)
    }

    // 编辑功能方法
    const editRow = (row, index) => {
      // 保存原始数据
      if (!originalData.value[index]) {
        originalData.value[index] = { ...row }
      }

      // 设置编辑状态
      row._editing = true
      row._originalValues = { ...row }
    }

    const saveRow = (row, index) => {
      // 验证数据
      if (validateRow(row)) {
        // 标记为已修改
        if (!row._changes) row._changes = []

        // 检查哪些字段被修改了
        const original = originalData.value[index] || {}
        tableColumns.value.forEach(column => {
          if (row[column.prop] !== original[column.prop]) {
            if (!row._changes.includes(column.prop)) {
              row._changes.push(column.prop)
            }
          }
        })

        row._editing = false
        hasUnsavedChanges.value = true

        ElMessage.success('行数据已保存')
        emit('row-updated', { row, index })
      }
    }

    const cancelEdit = (row, index) => {
      // 恢复原始值
      if (row._originalValues) {
        Object.keys(row._originalValues).forEach(key => {
          if (key !== '_editing' && key !== '_originalValues') {
            row[key] = row._originalValues[key]
          }
        })
      }

      row._editing = false
      delete row._originalValues

      // 清除验证错误
      const rowKey = row.id || row.materialCode
      Object.keys(validationErrors.value).forEach(key => {
        if (key.startsWith(rowKey)) {
          delete validationErrors.value[key]
        }
      })
    }

    const validateField = (row, prop) => {
      const column = tableColumns.value.find(col => col.prop === prop)
      const value = row[prop]
      const key = `${row.id || row.materialCode}_${prop}`

      // 清除之前的错误
      delete validationErrors.value[key]

      // 必填验证
      if (column.required && (!value || String(value).trim() === '')) {
        validationErrors.value[key] = `${column.label}不能为空`
        return false
      }

      // 特定字段验证
      if (prop === 'materialCode' && value) {
        const codePattern = /^[A-Z]{2,3}-[A-Z0-9]{4,6}$/
        if (!codePattern.test(value)) {
          validationErrors.value[key] = '物料编码格式不正确'
          return false
        }
      }

      return true
    }

    const validateRow = (row) => {
      let isValid = true
      tableColumns.value.forEach(column => {
        if (!validateField(row, column.prop)) {
          isValid = false
        }
      })
      return isValid
    }

    const saveChanges = () => {
      ElMessageBox.confirm(
        '确定要保存所有更改吗？',
        '确认保存',
        {
          confirmButtonText: '保存',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 发送保存事件
        emit('save-changes', mockData.value)
        hasUnsavedChanges.value = false
        ElMessage.success('所有更改已保存')
      }).catch(() => {
        ElMessage.info('已取消保存')
      })
    }

    const discardChanges = () => {
      ElMessageBox.confirm(
        '确定要取消所有更改吗？这将丢失所有未保存的修改。',
        '确认取消',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 恢复原始数据
        originalData.value.forEach((original, index) => {
          if (original) {
            Object.keys(original).forEach(key => {
              mockData.value[index][key] = original[key]
            })
            mockData.value[index]._editing = false
            delete mockData.value[index]._originalValues
          }
        })

        originalData.value = []
        hasUnsavedChanges.value = false
        validationErrors.value = {}
        ElMessage.success('已恢复原始数据')
      }).catch(() => {
        ElMessage.info('已取消操作')
      })
    }

    const exportData = () => {
      // 模拟导出功能
      const dataStr = JSON.stringify(filteredData.value, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'cleaned_data.json'
      link.click()
      URL.revokeObjectURL(url)
      
      ElMessage.success('数据导出成功')
    }

    const copyJson = () => {
      navigator.clipboard.writeText(formattedJson.value).then(() => {
        ElMessage.success('JSON数据已复制到剪贴板')
      }).catch(() => {
        ElMessage.error('复制失败')
      })
    }

    // 批量编辑相关方法
    const openBatchEditor = () => {
      batchEditorVisible.value = true
    }

    const handleBatchSaveChanges = (updatedData) => {
      mockData.value = [...updatedData]
      hasUnsavedChanges.value = true
      ElMessage.success('批量编辑已应用')
      emit('save-changes', mockData.value)
    }

    const handleBatchDeleteRows = (deletedIndices) => {
      hasUnsavedChanges.value = true
      ElMessage.success(`已删除 ${deletedIndices.length} 行数据`)
      emit('save-changes', mockData.value)
    }

    return {
      viewMode,
      searchText,
      editMode,
      hasUnsavedChanges,
      tableColumns,
      filteredData,
      formattedJson,
      totalRecords,
      validRecords,
      changedRecords,
      completenessRate,
      hasChanges,
      hasAnyChanges,
      hasValidationError,
      getColumnType,
      getSelectOptions,
      formatCellValue,
      editRow,
      saveRow,
      cancelEdit,
      validateField,
      saveChanges,
      discardChanges,
      exportData,
      copyJson,
      batchEditorVisible,
      openBatchEditor,
      handleBatchSaveChanges,
      handleBatchDeleteRows
    }
  }
}
</script>

<style scoped>
.data-preview {
  padding: 20px 0;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.preview-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.table-view {
  margin-bottom: 20px;
}

.changed-value {
  color: #e6a23c;
  font-weight: 500;
}

.invalid-value {
  color: #f56c6c;
  font-weight: 500;
}

.change-icon {
  margin-left: 4px;
  font-size: 12px;
  color: #e6a23c;
}

.error-icon {
  margin-left: 4px;
  font-size: 12px;
  color: #f56c6c;
}

.editable-cell {
  min-width: 120px;
}

.editable-cell .el-input,
.editable-cell .el-input-number,
.editable-cell .el-date-picker,
.editable-cell .el-select {
  width: 100%;
}

.view-cell {
  min-height: 32px;
  display: flex;
  align-items: center;
}

.card-view {
  margin-bottom: 20px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.data-card {
  border: 1px solid #e4e7ed;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  padding: 10px 0;
}

.card-field {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-bottom: 1px solid #f5f7fa;
}

.card-field:last-child {
  border-bottom: none;
}

.field-label {
  font-weight: 500;
  color: #606266;
  min-width: 80px;
}

.field-value {
  color: #2c3e50;
  flex: 1;
  text-align: right;
}

.json-view {
  margin-bottom: 20px;
}

.json-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.json-content {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  max-height: 400px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.data-stats {
  margin-top: 20px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  border: 1px solid #e4e7ed;
}

.stat-icon {
  font-size: 24px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

@media (max-width: 768px) {
  .preview-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .preview-actions {
    justify-content: space-between;
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
