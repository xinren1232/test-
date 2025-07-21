<template>
  <div class="batch-editor">
    <el-dialog
      v-model="visible"
      title="批量编辑数据"
      width="80%"
      :before-close="handleClose"
      destroy-on-close
    >
      <div class="editor-content">
        <!-- 操作工具栏 -->
        <div class="toolbar">
          <div class="toolbar-left">
            <el-button-group>
              <el-button 
                type="primary" 
                :icon="Select" 
                @click="selectAll"
                size="small"
              >
                全选
              </el-button>
              <el-button 
                :icon="Close" 
                @click="clearSelection"
                size="small"
              >
                清除选择
              </el-button>
            </el-button-group>
            
            <el-divider direction="vertical" />
            
            <span class="selection-info">
              已选择 {{ selectedRows.length }} / {{ tableData.length }} 行
            </span>
          </div>
          
          <div class="toolbar-right">
            <el-button 
              type="success" 
              :icon="Check" 
              @click="applyBatchEdit"
              :disabled="selectedRows.length === 0 || !hasBatchChanges"
              size="small"
            >
              应用批量修改
            </el-button>
            <el-button 
              type="danger" 
              :icon="Delete" 
              @click="deleteSelected"
              :disabled="selectedRows.length === 0"
              size="small"
            >
              删除选中行
            </el-button>
          </div>
        </div>

        <!-- 批量编辑面板 -->
        <el-card class="batch-edit-panel" v-if="selectedRows.length > 0">
          <template #header>
            <span>批量编辑 ({{ selectedRows.length }} 行)</span>
          </template>
          
          <el-form :model="batchEditForm" label-width="100px" size="small">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="供应商">
                  <el-select 
                    v-model="batchEditForm.supplier" 
                    placeholder="选择供应商"
                    clearable
                  >
                    <el-option
                      v-for="option in supplierOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              
              <el-col :span="8">
                <el-form-item label="问题类型">
                  <el-select 
                    v-model="batchEditForm.issueType" 
                    placeholder="选择问题类型"
                    clearable
                  >
                    <el-option
                      v-for="option in issueTypeOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              
              <el-col :span="8">
                <el-form-item label="状态">
                  <el-select 
                    v-model="batchEditForm.status" 
                    placeholder="选择状态"
                    clearable
                  >
                    <el-option
                      v-for="option in statusOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="问题描述">
                  <el-input 
                    v-model="batchEditForm.description" 
                    type="textarea" 
                    :rows="3"
                    placeholder="输入问题描述（将应用到所有选中行）"
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>

        <!-- 数据表格 -->
        <el-table
          ref="tableRef"
          :data="tableData"
          stripe
          border
          style="width: 100%"
          @selection-change="handleSelectionChange"
          max-height="400"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="materialCode" label="物料编码" width="120" />
          <el-table-column prop="materialName" label="物料名称" width="150" />
          <el-table-column prop="supplier" label="供应商" width="120" />
          <el-table-column prop="issueType" label="问题类型" width="100" />
          <el-table-column prop="description" label="问题描述" width="200" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="80" />
          <el-table-column label="操作" width="100">
            <template #default="{ row, $index }">
              <el-button 
                size="small" 
                type="danger" 
                :icon="Delete"
                @click="deleteRow($index)"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="saveChanges">保存更改</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Select, 
  Close, 
  Check, 
  Delete 
} from '@element-plus/icons-vue'

export default {
  name: 'BatchEditor',
  components: {
    Select,
    Close,
    Check,
    Delete
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    data: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'save-changes', 'delete-rows'],
  setup(props, { emit }) {
    const visible = ref(false)
    const tableRef = ref()
    const selectedRows = ref([])
    const tableData = ref([])
    
    // 批量编辑表单
    const batchEditForm = ref({
      supplier: '',
      issueType: '',
      status: '',
      description: ''
    })

    // 选项配置
    const supplierOptions = ref([
      { label: '华星光电', value: '华星光电' },
      { label: '京东方', value: '京东方' },
      { label: '比亚迪', value: '比亚迪' },
      { label: '宁德时代', value: '宁德时代' },
      { label: '富士康', value: '富士康' }
    ])

    const issueTypeOptions = ref([
      { label: '尺寸偏差', value: '尺寸偏差' },
      { label: '性能问题', value: '性能问题' },
      { label: '外观缺陷', value: '外观缺陷' },
      { label: '材料问题', value: '材料问题' },
      { label: '工艺问题', value: '工艺问题' }
    ])

    const statusOptions = ref([
      { label: '待处理', value: '待处理' },
      { label: '处理中', value: '处理中' },
      { label: '已处理', value: '已处理' },
      { label: '已关闭', value: '已关闭' }
    ])

    // 计算属性
    const hasBatchChanges = computed(() => {
      return Object.values(batchEditForm.value).some(value => value && value.trim() !== '')
    })

    // 监听器
    watch(() => props.modelValue, (newVal) => {
      visible.value = newVal
      if (newVal) {
        tableData.value = [...props.data]
        selectedRows.value = []
        resetBatchEditForm()
      }
    })

    watch(visible, (newVal) => {
      emit('update:modelValue', newVal)
    })

    // 方法
    const handleClose = () => {
      visible.value = false
    }

    const handleSelectionChange = (selection) => {
      selectedRows.value = selection
    }

    const selectAll = () => {
      tableRef.value.toggleAllSelection()
    }

    const clearSelection = () => {
      tableRef.value.clearSelection()
    }

    const resetBatchEditForm = () => {
      batchEditForm.value = {
        supplier: '',
        issueType: '',
        status: '',
        description: ''
      }
    }

    const applyBatchEdit = () => {
      if (selectedRows.value.length === 0) {
        ElMessage.warning('请先选择要编辑的行')
        return
      }

      const changes = {}
      Object.keys(batchEditForm.value).forEach(key => {
        if (batchEditForm.value[key] && batchEditForm.value[key].trim() !== '') {
          changes[key] = batchEditForm.value[key]
        }
      })

      if (Object.keys(changes).length === 0) {
        ElMessage.warning('请至少修改一个字段')
        return
      }

      // 应用批量修改
      selectedRows.value.forEach(row => {
        Object.keys(changes).forEach(key => {
          row[key] = changes[key]
        })
        
        // 标记为已修改
        if (!row._changes) row._changes = []
        Object.keys(changes).forEach(key => {
          if (!row._changes.includes(key)) {
            row._changes.push(key)
          }
        })
      })

      ElMessage.success(`已批量修改 ${selectedRows.value.length} 行数据`)
      resetBatchEditForm()
      clearSelection()
    }

    const deleteSelected = () => {
      if (selectedRows.value.length === 0) {
        ElMessage.warning('请先选择要删除的行')
        return
      }

      ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRows.value.length} 行数据吗？`,
        '确认删除',
        {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        const indicesToDelete = selectedRows.value.map(row => 
          tableData.value.findIndex(item => item === row)
        ).sort((a, b) => b - a) // 从后往前删除

        indicesToDelete.forEach(index => {
          tableData.value.splice(index, 1)
        })

        ElMessage.success(`已删除 ${selectedRows.value.length} 行数据`)
        selectedRows.value = []
        emit('delete-rows', indicesToDelete)
      }).catch(() => {
        ElMessage.info('已取消删除')
      })
    }

    const deleteRow = (index) => {
      ElMessageBox.confirm(
        '确定要删除这行数据吗？',
        '确认删除',
        {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        tableData.value.splice(index, 1)
        ElMessage.success('行数据已删除')
        emit('delete-rows', [index])
      }).catch(() => {
        ElMessage.info('已取消删除')
      })
    }

    const saveChanges = () => {
      emit('save-changes', tableData.value)
      visible.value = false
      ElMessage.success('更改已保存')
    }

    return {
      visible,
      tableRef,
      selectedRows,
      tableData,
      batchEditForm,
      supplierOptions,
      issueTypeOptions,
      statusOptions,
      hasBatchChanges,
      handleClose,
      handleSelectionChange,
      selectAll,
      clearSelection,
      applyBatchEdit,
      deleteSelected,
      deleteRow,
      saveChanges
    }
  }
}
</script>

<style scoped>
.batch-editor {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', Arial, sans-serif;
}

.editor-content {
  padding: 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 20px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.toolbar-right {
  display: flex;
  gap: 10px;
}

.selection-info {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.batch-edit-panel {
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
}

.batch-edit-panel :deep(.el-card__header) {
  background-color: #f0f9ff;
  border-bottom: 1px solid #e1f5fe;
}

.batch-edit-panel :deep(.el-card__body) {
  padding: 20px;
}

.dialog-footer {
  text-align: right;
}

.dialog-footer .el-button {
  margin-left: 10px;
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 6px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #fafafa;
  color: #606266;
  font-weight: 600;
}

:deep(.el-table td) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-table tr:hover > td) {
  background-color: #f5f7fa;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 15px;
  }

  .toolbar-left,
  .toolbar-right {
    width: 100%;
    justify-content: center;
  }

  .batch-edit-panel :deep(.el-row) {
    flex-direction: column;
  }

  .batch-edit-panel :deep(.el-col) {
    width: 100% !important;
    margin-bottom: 15px;
  }
}
</style>
