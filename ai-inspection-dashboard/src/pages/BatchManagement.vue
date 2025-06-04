<template>
  <div class="batch-management-container">
    <el-page-header @back="goBack" title="返回" content="批次管理" />
    
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <h2>物料批次管理</h2>
          <div class="header-actions">
            <el-button type="primary" @click="dialogVisible = true">
              <el-icon-plus /> 添加新批次
            </el-button>
            <el-button type="success" @click="exportData">
              <el-icon-download /> 导出数据
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 批次筛选区域 -->
      <div class="filter-area">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-select v-model="filters.category" placeholder="物料类别" clearable>
              <el-option 
                v-for="category in materialCategories" 
                :key="category.id" 
                :label="category.name" 
                :value="category.id" 
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filters.supplier" placeholder="供应商" clearable>
              <el-option 
                v-for="supplier in suppliers" 
                :key="supplier.id" 
                :label="supplier.name" 
                :value="supplier.id" 
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filters.status" placeholder="批次状态" clearable>
              <el-option label="待检验" value="pending" />
              <el-option label="检验中" value="processing" />
              <el-option label="已通过" value="passed" />
              <el-option label="已拒绝" value="rejected" />
              <el-option label="已使用" value="used" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-col>
        </el-row>
        <el-row :gutter="20" class="filter-row">
          <el-col :span="8">
            <el-input 
              v-model="filters.keyword" 
              placeholder="批次号/物料编码" 
              prefix-icon="el-icon-search"
            />
          </el-col>
          <el-col :span="8">
            <el-select v-model="filters.sortBy" placeholder="排序方式">
              <el-option label="创建时间（新→旧）" value="createdDesc" />
              <el-option label="创建时间（旧→新）" value="createdAsc" />
              <el-option label="缺陷率（高→低）" value="defectDesc" />
              <el-option label="缺陷率（低→高）" value="defectAsc" />
            </el-select>
          </el-col>
          <el-col :span="8" class="filter-buttons">
            <el-button type="primary" @click="applyFilters">
              <el-icon-search /> 搜索
            </el-button>
            <el-button @click="resetFilters">
              重置
            </el-button>
          </el-col>
        </el-row>
      </div>
      
      <!-- 批次数据表格 -->
      <el-table 
        :data="filteredBatchList" 
        border 
        stripe 
        style="width: 100%"
        v-loading="loading"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="batch_id" label="批次号" sortable />
        <el-table-column prop="material_code" label="物料编码" />
        <el-table-column prop="material_name" label="物料名称" />
        <el-table-column prop="category_name" label="物料类别" />
        <el-table-column prop="supplier_name" label="供应商" />
        <el-table-column prop="quantity" label="数量" sortable />
        <el-table-column prop="created_date" label="创建日期" sortable />
        <el-table-column label="缺陷率" sortable>
          <template #default="scope">
            <el-progress 
              :percentage="parseFloat((scope.row.defect_rate * 100).toFixed(2))" 
              :color="getDefectRateColor(scope.row.defect_rate)"
              :format="percent => percent + '%'"
            />
          </template>
        </el-table-column>
        <el-table-column label="批次状态">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="风险评级">
          <template #default="scope">
            <el-tag :type="getRiskTagType(scope.row.risk_level)" effect="dark">
              {{ getRiskLevelText(scope.row.risk_level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template #default="scope">
            <div class="table-actions">
              <el-button type="primary" size="small" @click="viewBatchDetail(scope.row)">
                详情
              </el-button>
              <el-button type="warning" size="small" @click="editBatch(scope.row)">
                编辑
              </el-button>
              <el-button type="success" size="small" @click="showTraceability(scope.row)">
                追溯
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalItems"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 批次创建对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="添加新批次"
      width="50%"
    >
      <el-form ref="batchForm" :model="batchForm" :rules="rules" label-width="120px">
        <el-form-item label="物料编码" prop="material_code">
          <el-input v-model="batchForm.material_code" />
        </el-form-item>
        <el-form-item label="物料名称" prop="material_name">
          <el-input v-model="batchForm.material_name" />
        </el-form-item>
        <el-form-item label="物料类别" prop="category_id">
          <el-select v-model="batchForm.category_id" placeholder="选择物料类别">
            <el-option 
              v-for="category in materialCategories" 
              :key="category.id" 
              :label="category.name" 
              :value="category.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="供应商" prop="supplier_id">
          <el-select v-model="batchForm.supplier_id" placeholder="选择供应商">
            <el-option 
              v-for="supplier in suppliers" 
              :key="supplier.id" 
              :label="supplier.name" 
              :value="supplier.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="batchForm.quantity" :min="1" :max="10000" />
        </el-form-item>
        <el-form-item label="生产日期" prop="production_date">
          <el-date-picker
            v-model="batchForm.production_date"
            type="date"
            placeholder="选择生产日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="批次备注" prop="notes">
          <el-input 
            type="textarea" 
            v-model="batchForm.notes"
            rows="3"
            placeholder="请输入批次的其他信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitBatchForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 批次追溯对话框 -->
    <el-dialog
      v-model="traceabilityVisible"
      title="批次追溯"
      width="70%"
    >
      <div v-if="selectedBatch" class="traceability-container">
        <el-descriptions
          title="批次基本信息"
          :column="3"
          border
        >
          <el-descriptions-item label="批次号">{{ selectedBatch.batch_id }}</el-descriptions-item>
          <el-descriptions-item label="物料编码">{{ selectedBatch.material_code }}</el-descriptions-item>
          <el-descriptions-item label="物料名称">{{ selectedBatch.material_name }}</el-descriptions-item>
          <el-descriptions-item label="物料类别">{{ selectedBatch.category_name }}</el-descriptions-item>
          <el-descriptions-item label="供应商">{{ selectedBatch.supplier_name }}</el-descriptions-item>
          <el-descriptions-item label="数量">{{ selectedBatch.quantity }}</el-descriptions-item>
          <el-descriptions-item label="创建日期">{{ selectedBatch.created_date }}</el-descriptions-item>
          <el-descriptions-item label="生产日期">{{ selectedBatch.production_date }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(selectedBatch.status)">
              {{ getStatusText(selectedBatch.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        
        <el-divider content-position="center">批次跟踪记录</el-divider>
        
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in batchActivities"
            :key="index"
            :timestamp="activity.timestamp"
            :type="activity.type"
            :color="activity.color"
            :icon="activity.icon"
            :size="activity.size"
          >
            {{ activity.content }}
            <div v-if="activity.details" class="activity-details">
              {{ activity.details }}
            </div>
          </el-timeline-item>
        </el-timeline>
        
        <el-divider content-position="center">关联产品信息</el-divider>
        
        <el-table :data="relatedProducts" border style="width: 100%">
          <el-table-column prop="product_id" label="产品ID" />
          <el-table-column prop="product_name" label="产品名称" />
          <el-table-column prop="production_date" label="生产日期" />
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-tag :type="getProductStatusType(scope.row.status)">
                {{ getProductStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button type="primary" size="small" @click="viewProductDetail(scope.row)">
                查看产品
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { materialCategories } from '../data/material_categories.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

// 模拟供应商数据
const suppliers = [
  { id: 1, name: '富士康科技集团' },
  { id: 2, name: '京东方科技集团' },
  { id: 3, name: '欧菲光科技集团' },
  { id: 4, name: '立讯精密工业' },
  { id: 5, name: '蓝思科技股份' }
]

// 批次管理状态
const loading = ref(false)
const dialogVisible = ref(false)
const traceabilityVisible = ref(false)
const selectedBatch = ref(null)
const batchList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)

// 过滤条件
const filters = ref({
  category: '',
  supplier: '',
  status: '',
  dateRange: [],
  keyword: '',
  sortBy: 'createdDesc'
})

// 新批次表单
const batchForm = ref({
  material_code: '',
  material_name: '',
  category_id: '',
  supplier_id: '',
  quantity: 100,
  production_date: '',
  notes: ''
})

// 表单验证规则
const rules = {
  material_code: [
    { required: true, message: '请输入物料编码', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  material_name: [
    { required: true, message: '请输入物料名称', trigger: 'blur' }
  ],
  category_id: [
    { required: true, message: '请选择物料类别', trigger: 'change' }
  ],
  supplier_id: [
    { required: true, message: '请选择供应商', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: '请输入数量', trigger: 'blur' }
  ],
  production_date: [
    { required: true, message: '请选择生产日期', trigger: 'change' }
  ]
}

// 批次追溯活动记录
const batchActivities = ref([
  {
    content: '批次创建',
    timestamp: '2023-06-01 09:30',
    type: 'primary',
    color: '#0bbd87',
    size: 'large'
  },
  {
    content: '入库检验',
    timestamp: '2023-06-02 11:20',
    type: 'success',
    details: '抽检合格率 98.5%，检验人员: 张工'
  },
  {
    content: '质量抽检',
    timestamp: '2023-06-03 14:00',
    type: 'warning',
    details: '发现2个小问题，已要求供应商改进'
  },
  {
    content: '生产投料',
    timestamp: '2023-06-10 08:15',
    type: 'info'
  },
  {
    content: '用于产品组装',
    timestamp: '2023-06-15 13:45',
    type: 'success'
  }
])

// 关联产品信息
const relatedProducts = ref([
  {
    product_id: 'P2023061501',
    product_name: 'iPhone 14 Pro Max 后盖组件',
    production_date: '2023-06-15',
    status: 'completed'
  },
  {
    product_id: 'P2023061502',
    product_name: 'iPhone 14 Pro 后盖组件',
    production_date: '2023-06-15',
    status: 'completed'
  },
  {
    product_id: 'P2023061601',
    product_name: 'iPhone 14 后盖组件',
    production_date: '2023-06-16',
    status: 'in_progress'
  }
])

// 生成模拟批次数据
function generateBatchData() {
  const result = []
  
  for (let i = 1; i <= 100; i++) {
    const categoryIndex = Math.floor(Math.random() * materialCategories.length)
    const supplierIndex = Math.floor(Math.random() * suppliers.length)
    const category = materialCategories[categoryIndex]
    const supplier = suppliers[supplierIndex]
    
    // 生成随机日期（过去90天内）
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 90))
    const dateStr = date.toISOString().split('T')[0]
    
    // 生成随机缺陷率 (0-3%)
    const defectRate = Math.random() * 0.03
    
    // 生成随机状态
    const statusOptions = ['pending', 'processing', 'passed', 'rejected', 'used']
    const status = statusOptions[Math.floor(Math.random() * statusOptions.length)]
    
    // 基于缺陷率确定风险等级
    let riskLevel = 'low'
    if (defectRate > 0.02) {
      riskLevel = 'high'
    } else if (defectRate > 0.01) {
      riskLevel = 'medium'
    }
    
    result.push({
      id: i,
      batch_id: `B${String(2023000 + i).padStart(7, '0')}`,
      material_code: `M${String(1000 + categoryIndex).padStart(4, '0')}${String(i).padStart(3, '0')}`,
      material_name: `${category.name}${i % 3 === 0 ? '组件' : (i % 3 === 1 ? '配件' : '元件')}`,
      category_id: category.id,
      category_name: category.name,
      supplier_id: supplier.id,
      supplier_name: supplier.name,
      quantity: Math.floor(Math.random() * 1000) + 100,
      created_date: dateStr,
      production_date: dateStr,
      defect_rate: defectRate,
      status: status,
      risk_level: riskLevel,
      notes: `批次${i}测试数据`
    })
  }
  
  return result
}

// 应用过滤和排序后的批次列表
const filteredBatchList = computed(() => {
  let data = [...batchList.value]
  
  // 应用物料类别过滤
  if (filters.value.category) {
    data = data.filter(item => item.category_id === filters.value.category)
  }
  
  // 应用供应商过滤
  if (filters.value.supplier) {
    data = data.filter(item => item.supplier_id === filters.value.supplier)
  }
  
  // 应用状态过滤
  if (filters.value.status) {
    data = data.filter(item => item.status === filters.value.status)
  }
  
  // 应用日期范围过滤
  if (filters.value.dateRange && filters.value.dateRange.length === 2) {
    const startDate = new Date(filters.value.dateRange[0])
    const endDate = new Date(filters.value.dateRange[1])
    
    data = data.filter(item => {
      const itemDate = new Date(item.created_date)
      return itemDate >= startDate && itemDate <= endDate
    })
  }
  
  // 应用关键词搜索
  if (filters.value.keyword) {
    const keyword = filters.value.keyword.toLowerCase()
    data = data.filter(item => 
      item.batch_id.toLowerCase().includes(keyword) || 
      item.material_code.toLowerCase().includes(keyword) ||
      item.material_name.toLowerCase().includes(keyword)
    )
  }
  
  // 应用排序
  switch (filters.value.sortBy) {
    case 'createdDesc':
      data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      break
    case 'createdAsc':
      data.sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
      break
    case 'defectDesc':
      data.sort((a, b) => b.defect_rate - a.defect_rate)
      break
    case 'defectAsc':
      data.sort((a, b) => a.defect_rate - b.defect_rate)
      break
  }
  
  // 更新总数
  totalItems.value = data.length
  
  // 返回当前页的数据
  const startIndex = (currentPage.value - 1) * pageSize.value
  return data.slice(startIndex, startIndex + pageSize.value)
})

// 处理页面大小变化
function handleSizeChange(size) {
  pageSize.value = size
}

// 处理页码变化
function handleCurrentChange(page) {
  currentPage.value = page
}

// 应用过滤器
function applyFilters() {
  currentPage.value = 1 // 重置到第一页
}

// 重置过滤器
function resetFilters() {
  filters.value = {
    category: '',
    supplier: '',
    status: '',
    dateRange: [],
    keyword: '',
    sortBy: 'createdDesc'
  }
  currentPage.value = 1
}

// 处理排序变化
function handleSortChange({ column, prop, order }) {
  if (!order) return
  
  switch (prop) {
    case 'created_date':
      filters.value.sortBy = order === 'ascending' ? 'createdAsc' : 'createdDesc'
      break
    case 'defect_rate':
      filters.value.sortBy = order === 'ascending' ? 'defectAsc' : 'defectDesc'
      break
  }
}

// 获取缺陷率颜色
function getDefectRateColor(rate) {
  if (rate > 0.02) return '#F56C6C'
  if (rate > 0.01) return '#E6A23C'
  return '#67C23A'
}

// 获取状态标签类型
function getStatusTagType(status) {
  switch (status) {
    case 'pending': return 'info'
    case 'processing': return 'warning'
    case 'passed': return 'success'
    case 'rejected': return 'danger'
    case 'used': return 'primary'
    default: return 'info'
  }
}

// 获取状态文本
function getStatusText(status) {
  switch (status) {
    case 'pending': return '待检验'
    case 'processing': return '检验中'
    case 'passed': return '已通过'
    case 'rejected': return '已拒绝'
    case 'used': return '已使用'
    default: return '未知'
  }
}

// 获取风险标签类型
function getRiskTagType(level) {
  switch (level) {
    case 'high': return 'danger'
    case 'medium': return 'warning'
    case 'low': return 'success'
    default: return 'info'
  }
}

// 获取风险等级文本
function getRiskLevelText(level) {
  switch (level) {
    case 'high': return '高风险'
    case 'medium': return '中等风险'
    case 'low': return '低风险'
    default: return '未知'
  }
}

// 获取产品状态类型
function getProductStatusType(status) {
  switch (status) {
    case 'completed': return 'success'
    case 'in_progress': return 'warning'
    case 'planned': return 'info'
    default: return 'info'
  }
}

// 获取产品状态文本
function getProductStatusText(status) {
  switch (status) {
    case 'completed': return '已完成'
    case 'in_progress': return '生产中'
    case 'planned': return '已计划'
    default: return '未知'
  }
}

// 查看批次详情
function viewBatchDetail(batch) {
  router.push(`/batch/${batch.batch_id}`)
}

// 编辑批次
function editBatch(batch) {
  ElMessageBox.confirm(
    '此操作将修改批次信息，是否继续？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage({
      type: 'success',
      message: `批次 ${batch.batch_id} 的信息已更新`
    })
  }).catch(() => {
    // 取消操作
  })
}

// 显示批次追溯
function showTraceability(batch) {
  selectedBatch.value = batch
  traceabilityVisible.value = true
}

// 查看产品详情
function viewProductDetail(product) {
  ElMessage({
    message: `查看产品: ${product.product_name}`,
    type: 'info'
  })
}

// 提交批次表单
function submitBatchForm() {
  ElMessage({
    message: '新批次添加成功',
    type: 'success'
  })
  dialogVisible.value = false
  // 重置表单
  batchForm.value = {
    material_code: '',
    material_name: '',
    category_id: '',
    supplier_id: '',
    quantity: 100,
    production_date: '',
    notes: ''
  }
}

// 导出数据
function exportData() {
  ElMessage({
    message: '数据导出功能开发中',
    type: 'info'
  })
}

// 返回上一页
function goBack() {
  router.go(-1)
}

// 初始化
onMounted(() => {
  loading.value = true
  // 生成模拟数据
  setTimeout(() => {
    batchList.value = generateBatchData()
    loading.value = false
  }, 500)
})
</script>

<style scoped>
.batch-management-container {
  padding: 20px;
}

.main-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 22px;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-area {
  margin-bottom: 20px;
}

.filter-row {
  margin-top: 15px;
}

.filter-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.table-actions {
  display: flex;
  gap: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.traceability-container {
  padding: 10px;
}

.activity-details {
  color: #606266;
  font-size: 14px;
  margin-top: 5px;
  margin-left: 20px;
}

.el-descriptions {
  margin-bottom: 20px;
}

.el-divider {
  margin: 30px 0;
}

.el-timeline {
  margin: 20px 0;
  padding: 0 20px;
}
</style> 
 
 