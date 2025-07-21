<template>
  <div class="data-results-preview">
    <!-- 预览控制 -->
    <div class="preview-controls">
      <div class="controls-left">
        <el-input
          v-model="searchText"
          placeholder="搜索数据..."
          size="small"
          style="width: 250px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select v-model="filterStatus" placeholder="筛选状态" size="small" style="width: 150px">
          <el-option label="全部" value="" />
          <el-option label="已清洗" value="cleaned" />
          <el-option label="已修改" value="modified" />
          <el-option label="有错误" value="error" />
        </el-select>
      </div>
      
      <div class="controls-right">
        <el-button-group size="small">
          <el-button :type="viewMode === 'table' ? 'primary' : ''" @click="viewMode = 'table'">
            <el-icon><Grid /></el-icon>
            表格
          </el-button>
          <el-button :type="viewMode === 'card' ? 'primary' : ''" @click="viewMode = 'card'">
            <el-icon><Postcard /></el-icon>
            卡片
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 数据统计 -->
    <div class="data-stats">
      <el-row :gutter="15">
        <el-col :span="6">
          <div class="stat-item">
            <span class="stat-label">总记录:</span>
            <span class="stat-value">{{ filteredData.length }}</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <span class="stat-label">已清洗:</span>
            <span class="stat-value success">{{ getCleanedCount() }}</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <span class="stat-label">已修改:</span>
            <span class="stat-value warning">{{ getModifiedCount() }}</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <span class="stat-label">有错误:</span>
            <span class="stat-value error">{{ getErrorCount() }}</span>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 表格视图 -->
    <div v-if="viewMode === 'table'" class="table-view">
      <el-table :data="paginatedData" stripe style="width: 100%">
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="materialCode" label="物料编码" width="120">
          <template #default="{ row }">
            <span :class="{ 'modified-field': isFieldModified(row, 'materialCode') }">
              {{ row.materialCode }}
            </span>
            <el-icon v-if="isFieldModified(row, 'materialCode')" class="modified-icon">
              <Edit />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="materialName" label="物料名称" width="150">
          <template #default="{ row }">
            <span :class="{ 'modified-field': isFieldModified(row, 'materialName') }">
              {{ row.materialName }}
            </span>
            <el-icon v-if="isFieldModified(row, 'materialName')" class="modified-icon">
              <Edit />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="supplier" label="供应商" width="120" />
        <el-table-column prop="issueType" label="问题类型" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="清洗操作" width="200">
          <template #default="{ row }">
            <div class="cleaning-actions">
              <el-tag
                v-for="action in row.cleaningActions || []"
                :key="action"
                size="small"
                type="info"
                class="action-tag"
              >
                {{ action }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredData.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-else class="card-view">
      <div class="cards-grid">
        <div 
          v-for="(item, index) in paginatedData" 
          :key="index"
          class="data-card"
          :class="{ 'modified': hasModifications(item), 'error': hasErrors(item) }"
        >
          <div class="card-header">
            <div class="card-title">
              <strong>{{ item.materialCode }}</strong>
              <el-tag :type="getStatusType(item.status)" size="small">
                {{ item.status }}
              </el-tag>
            </div>
            <div class="card-actions">
              <el-icon v-if="hasModifications(item)" class="modified-indicator">
                <Edit />
              </el-icon>
              <el-icon v-if="hasErrors(item)" class="error-indicator">
                <Warning />
              </el-icon>
            </div>
          </div>
          
          <div class="card-content">
            <div class="field-row">
              <span class="field-label">物料名称:</span>
              <span class="field-value">{{ item.materialName }}</span>
            </div>
            <div class="field-row">
              <span class="field-label">供应商:</span>
              <span class="field-value">{{ item.supplier }}</span>
            </div>
            <div class="field-row">
              <span class="field-label">问题类型:</span>
              <span class="field-value">{{ item.issueType }}</span>
            </div>
            <div v-if="item.description" class="field-row">
              <span class="field-label">描述:</span>
              <span class="field-value">{{ item.description }}</span>
            </div>
          </div>
          
          <div v-if="item.cleaningActions && item.cleaningActions.length > 0" class="card-footer">
            <div class="cleaning-actions">
              <span class="actions-label">清洗操作:</span>
              <div class="actions-tags">
                <el-tag
                  v-for="action in item.cleaningActions"
                  :key="action"
                  size="small"
                  type="info"
                >
                  {{ action }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 48, 96]"
          :total="filteredData.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { Search, Grid, Postcard, Edit, Warning } from '@element-plus/icons-vue'

export default {
  name: 'DataResultsPreview',
  components: {
    Search,
    Grid,
    Postcard,
    Edit,
    Warning
  },
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const searchText = ref('')
    const filterStatus = ref('')
    const viewMode = ref('table')
    const currentPage = ref(1)
    const pageSize = ref(20)

    // 计算属性
    const filteredData = computed(() => {
      let filtered = props.data

      // 搜索过滤
      if (searchText.value) {
        const search = searchText.value.toLowerCase()
        filtered = filtered.filter(item =>
          Object.values(item).some(value =>
            String(value).toLowerCase().includes(search)
          )
        )
      }

      // 状态过滤
      if (filterStatus.value) {
        filtered = filtered.filter(item => {
          switch (filterStatus.value) {
            case 'cleaned':
              return item.cleaningActions && item.cleaningActions.length > 0
            case 'modified':
              return hasModifications(item)
            case 'error':
              return hasErrors(item)
            default:
              return true
          }
        })
      }

      return filtered
    })

    const paginatedData = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredData.value.slice(start, end)
    })

    // 方法
    const getCleanedCount = () => {
      return props.data.filter(item => 
        item.cleaningActions && item.cleaningActions.length > 0
      ).length
    }

    const getModifiedCount = () => {
      return props.data.filter(item => hasModifications(item)).length
    }

    const getErrorCount = () => {
      return props.data.filter(item => hasErrors(item)).length
    }

    const hasModifications = (item) => {
      return item.cleaningActions && item.cleaningActions.length > 0
    }

    const hasErrors = (item) => {
      return item.status === '错误' || item.hasErrors
    }

    const isFieldModified = (item, field) => {
      return item.modifiedFields && item.modifiedFields.includes(field)
    }

    const getStatusType = (status) => {
      const types = {
        '已处理': 'success',
        '处理中': 'warning',
        '待处理': 'info',
        '错误': 'danger'
      }
      return types[status] || 'info'
    }

    const handleSizeChange = (size) => {
      pageSize.value = size
      currentPage.value = 1
    }

    const handleCurrentChange = (page) => {
      currentPage.value = page
    }

    return {
      searchText,
      filterStatus,
      viewMode,
      currentPage,
      pageSize,
      filteredData,
      paginatedData,
      getCleanedCount,
      getModifiedCount,
      getErrorCount,
      hasModifications,
      hasErrors,
      isFieldModified,
      getStatusType,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.data-results-preview {
  padding: 20px 0;
}

.preview-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.controls-left {
  display: flex;
  gap: 15px;
  align-items: center;
}

.data-stats {
  margin-bottom: 20px;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  margin-left: 5px;
}

.stat-value.success {
  color: #67c23a;
}

.stat-value.warning {
  color: #e6a23c;
}

.stat-value.error {
  color: #f56c6c;
}

.modified-field {
  color: #e6a23c;
  font-weight: 500;
}

.modified-icon {
  margin-left: 5px;
  color: #e6a23c;
  font-size: 12px;
}

.cleaning-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.action-tag {
  margin: 0;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: center;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.data-card {
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  background: white;
  transition: all 0.3s;
}

.data-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.data-card.modified {
  border-left: 4px solid #e6a23c;
}

.data-card.error {
  border-left: 4px solid #f56c6c;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-actions {
  display: flex;
  gap: 5px;
}

.modified-indicator {
  color: #e6a23c;
}

.error-indicator {
  color: #f56c6c;
}

.card-content {
  margin-bottom: 15px;
}

.field-row {
  display: flex;
  margin-bottom: 8px;
}

.field-label {
  min-width: 80px;
  color: #606266;
  font-size: 14px;
}

.field-value {
  flex: 1;
  font-size: 14px;
}

.card-footer {
  border-top: 1px solid #f0f0f0;
  padding-top: 15px;
}

.actions-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
  display: block;
}

.actions-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
</style>
