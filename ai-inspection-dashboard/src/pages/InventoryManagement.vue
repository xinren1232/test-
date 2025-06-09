<template>
  <div>
    <el-card>
      <h2>库存管理系统</h2>
      
      <!-- 顶部工具栏 -->
      <div class="toolbar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索物料编码/批次号/库位"
          clearable
          style="width: 300px; margin-right: 16px;"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><search /></el-icon>
          </template>
        </el-input>
        
        <el-select v-model="factoryFilter" placeholder="工厂/库位" style="width: 150px; margin-right: 16px;" @change="handleFilters">
          <el-option label="全部" value="" />
          <el-option v-for="factory in factoryOptions" :key="factory" :label="factory" :value="factory" />
        </el-select>
        
        <el-select v-model="statusFilter" placeholder="库存状态" style="width: 120px; margin-right: 16px;" @change="handleFilters">
          <el-option label="全部" value="" />
          <el-option label="正常" value="normal" />
          <el-option label="冻结" value="frozen" />
          <el-option label="待检" value="pending" />
          <el-option label="不合格" value="rejected" />
        </el-select>
        
        <el-select v-model="sortBy" placeholder="排序方式" style="width: 180px;" @change="handleSort">
          <el-option label="入库时间 (新→旧)" value="arrival_time_desc" />
          <el-option label="入库时间 (旧→新)" value="arrival_time_asc" />
          <el-option label="库存量 (多→少)" value="quantity_desc" />
          <el-option label="库存量 (少→多)" value="quantity_asc" />
        </el-select>
      </div>
      
      <!-- 数据统计卡片 -->
      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="6">
          <el-card shadow="hover" class="statistic-card">
            <div class="statistic-title">总库存物料</div>
            <div class="statistic-value">{{ statisticsData.totalItems }}</div>
            <div class="statistic-subtitle">{{ statisticsData.totalQuantity }} 件</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="statistic-card">
            <div class="statistic-title">正常库存</div>
            <div class="statistic-value">{{ statisticsData.normalItems }}</div>
            <div class="statistic-subtitle">{{ statisticsData.normalQuantity }} 件</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="statistic-card">
            <div class="statistic-title">冻结库存</div>
            <div class="statistic-value">{{ statisticsData.frozenItems }}</div>
            <div class="statistic-subtitle">{{ statisticsData.frozenQuantity }} 件</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="statistic-card">
            <div class="statistic-title">待检/不合格</div>
            <div class="statistic-value">{{ statisticsData.pendingItems }}</div>
            <div class="statistic-subtitle">{{ statisticsData.pendingQuantity }} 件</div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 在表格上方添加智能预警模块 -->
      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="24">
          <el-card shadow="hover" class="ai-recommendation-card" v-if="aiRecommendations.length > 0">
            <template #header>
              <div class="card-header">
                <h3><el-icon><warning /></el-icon> AI物料预警</h3>
              </div>
            </template>
            <el-alert
              v-for="(rec, index) in aiRecommendations"
              :key="index"
              :title="rec.title"
              :type="rec.type"
              :description="rec.description"
              :closable="false"
              show-icon
              style="margin-bottom: 10px;"
            >
              <template #default>
                <div class="ai-recommendation-actions">
                  <el-button size="small" @click="handleRecommendation(rec)">查看详情</el-button>
                  <el-button size="small" type="text" @click="dismissRecommendation(index)">忽略</el-button>
                </div>
              </template>
            </el-alert>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 在原有统计卡片下方添加智能预测卡片 -->
      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="12">
          <el-card shadow="hover" class="prediction-card">
            <template #header>
              <div class="card-header">
                <h3>库存智能预测</h3>
                <el-tooltip content="基于历史数据的AI预测模型">
                  <el-icon><info-filled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            <div id="inventoryPredictionChart" style="height: 300px;"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="hover" class="recommendation-card">
            <template #header>
              <div class="card-header">
                <h3>智能挪库建议</h3>
                <el-tooltip content="基于库存利用率和物流效率的优化建议">
                  <el-icon><info-filled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            <el-table :data="moveSuggestions" style="width: 100%" size="small">
              <el-table-column prop="material_code" label="物料编码" width="120"></el-table-column>
              <el-table-column prop="batch_id" label="批次号" width="120"></el-table-column>
              <el-table-column prop="current_location" label="当前库位" width="100"></el-table-column>
              <el-table-column prop="suggested_location" label="建议库位" width="100"></el-table-column>
              <el-table-column prop="reason" label="建议原因"></el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="handleMoveSuggestion(scope.row)">执行</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 库存表格 -->
      <el-table 
        :data="displayData" 
        style="width: 100%" 
        v-loading="loading"
        :row-class-name="tableRowClassName">
        <el-table-column prop="material_code" label="物料编码" width="120" sortable />
        <el-table-column prop="material_name" label="物料名称" width="150" />
        <el-table-column prop="batch_id" label="批次号" width="120" sortable />
        <el-table-column prop="location" label="库位" width="100" />
        <el-table-column prop="factory" label="工厂" width="100" />
        <el-table-column prop="quantity" label="数量" width="80" sortable />
        <el-table-column prop="unit" label="单位" width="60" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="arrival_time" label="入库时间" width="160" sortable />
        <el-table-column label="操作" fixed="right" width="220">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              @click="viewDetails(scope.row)">
              详情
            </el-button>
            <el-button 
              :type="scope.row.status === 'frozen' ? 'success' : 'warning'"
              size="small" 
              @click="toggleFreezeStatus(scope.row)">
              {{ scope.row.status === 'frozen' ? '释放' : '冻结' }}
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="showConfirmDialog(scope.row)">
              移库
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredData.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 物料详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="物料详情"
      width="60%">
      <div v-if="selectedMaterial">
        <el-tabs v-model="activeTab">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="物料编码">{{ selectedMaterial.material_code }}</el-descriptions-item>
              <el-descriptions-item label="物料名称">{{ selectedMaterial.material_name }}</el-descriptions-item>
              <el-descriptions-item label="批次号">{{ selectedMaterial.batch_id }}</el-descriptions-item>
              <el-descriptions-item label="库存状态">
                <el-tag :type="getStatusTagType(selectedMaterial.status)">
                  {{ getStatusText(selectedMaterial.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="工厂">{{ selectedMaterial.factory }}</el-descriptions-item>
              <el-descriptions-item label="库位">{{ selectedMaterial.location }}</el-descriptions-item>
              <el-descriptions-item label="数量">{{ selectedMaterial.quantity }} {{ selectedMaterial.unit }}</el-descriptions-item>
              <el-descriptions-item label="供应商">{{ selectedMaterial.supplier || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="入库时间">{{ selectedMaterial.arrival_time }}</el-descriptions-item>
              <el-descriptions-item label="保质期">{{ selectedMaterial.expiry_date || '无' }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
          
          <!-- 检验信息 -->
          <el-tab-pane label="检验信息" name="inspection">
            <div v-if="selectedMaterial.inspections && selectedMaterial.inspections.length > 0">
              <el-timeline>
                <el-timeline-item 
                  v-for="(inspection, index) in selectedMaterial.inspections" 
                  :key="index"
                  :type="inspection.result === 'pass' ? 'success' : inspection.result === 'fail' ? 'danger' : 'warning'"
                  :timestamp="inspection.date">
                  <h4>{{ inspection.type }} 检验</h4>
                  <p>结果: {{ inspection.result === 'pass' ? '通过' : inspection.result === 'fail' ? '不通过' : '待处理' }}</p>
                  <p>检验人: {{ inspection.inspector }}</p>
                  <p v-if="inspection.notes">备注: {{ inspection.notes }}</p>
                </el-timeline-item>
              </el-timeline>
            </div>
            <el-empty v-else description="暂无检验记录" />
          </el-tab-pane>
          
          <!-- 库存变动记录 -->
          <el-tab-pane label="库存记录" name="records">
            <div v-if="selectedMaterial.history && selectedMaterial.history.length > 0">
              <el-table :data="selectedMaterial.history" style="width: 100%">
                <el-table-column prop="date" label="操作时间" width="160" />
                <el-table-column prop="operation" label="操作类型" width="120" />
                <el-table-column prop="quantity" label="数量变动" width="100" />
                <el-table-column prop="location" label="库位" width="100" />
                <el-table-column prop="operator" label="操作人" width="120" />
                <el-table-column prop="notes" label="备注" />
              </el-table>
            </div>
            <el-empty v-else description="暂无库存变动记录" />
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="printMaterialDetails">打印详情</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 移库对话框 -->
    <el-dialog
      v-model="moveDialogVisible"
      title="物料移库"
      width="40%">
      <div v-if="selectedMaterial">
        <el-form :model="moveForm" label-width="100px">
          <el-form-item label="物料编码">
            <el-input v-model="selectedMaterial.material_code" disabled />
          </el-form-item>
          <el-form-item label="批次号">
            <el-input v-model="selectedMaterial.batch_id" disabled />
          </el-form-item>
          <el-form-item label="当前库位">
            <el-input v-model="selectedMaterial.location" disabled />
          </el-form-item>
          <el-form-item label="移动数量">
            <el-input-number v-model="moveForm.quantity" :min="1" :max="selectedMaterial.quantity" />
          </el-form-item>
          <el-form-item label="目标工厂">
            <el-select v-model="moveForm.targetFactory" placeholder="选择目标工厂" style="width: 100%">
              <el-option v-for="factory in factoryOptions" :key="factory" :label="factory" :value="factory" />
            </el-select>
          </el-form-item>
          <el-form-item label="目标库位">
            <el-select v-model="moveForm.targetLocation" placeholder="选择目标库位" style="width: 100%">
              <el-option v-for="location in locationOptions" :key="location" :label="location" :value="location" />
            </el-select>
          </el-form-item>
          <el-form-item label="移库原因">
            <el-input type="textarea" v-model="moveForm.reason" :rows="3" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="moveDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmMove">确认移库</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, WarningFilled, CircleCheckFilled, Clock, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import factoryDataJson from '../data/factory_data.json'
import * as echarts from 'echarts'

// 数据状态
const inventoryData = ref([])
const loading = ref(true)
const searchQuery = ref('')
const factoryFilter = ref('')
const statusFilter = ref('')
const sortBy = ref('arrival_time_desc')
const currentPage = ref(1)
const pageSize = ref(20)
const detailDialogVisible = ref(false)
const moveDialogVisible = ref(false)
const selectedMaterial = ref(null)
const activeTab = ref('basic')
const statisticsData = ref({
  totalItems: 0,
  totalQuantity: 0,
  normalItems: 0,
  normalQuantity: 0,
  frozenItems: 0,
  frozenQuantity: 0,
  pendingItems: 0,
  pendingQuantity: 0
})

// 移库表单
const moveForm = ref({
  quantity: 0,
  targetFactory: '',
  targetLocation: '',
  reason: ''
})

// 工厂和库位选项
const factoryOptions = ref(['深圳工厂', '惠州工厂', '东莞工厂', '中央仓库'])
const locationOptions = ref(['原料区', '成品区', '半成品区', '待检区', '不良品区'])

// 在setup中添加AI相关数据和功能
const aiRecommendations = ref([
  {
    title: "库存预警：3个批次即将过期",
    type: "warning",
    description: "批次ID: BT2023-008, BT2023-012, BT2023-015将在7天内到期，建议优先使用",
    action: "checkExpiry"
  },
  {
    title: "库存优化建议",
    type: "info",
    description: "检测到5个物料存在多库位存储情况，建议整合以提高库位利用率",
    action: "optimizeStorage"
  },
  {
    title: "供应风险预警",
    type: "error",
    description: "物料M2023-056的供应商已连续3次延期交付，建议寻找备选供应商",
    action: "supplierRisk"
  }
]);

// 移库建议数据
const moveSuggestions = ref([
  {
    material_code: "M2023-056",
    batch_id: "BT2023-056",
    current_location: "A-12-03",
    suggested_location: "B-05-01",
    reason: "靠近生产线，减少物料搬运时间"
  },
  {
    material_code: "M2023-102",
    batch_id: "BT2023-102",
    current_location: "C-08-05",
    suggested_location: "C-02-02",
    reason: "合并同类物料，提高库位利用率"
  },
  {
    material_code: "M2023-078",
    batch_id: "BT2023-078",
    current_location: "D-15-07",
    suggested_location: "A-03-04",
    reason: "当前环境温度过高，建议移至温控区"
  }
]);

// 根据搜索条件过滤数据
const filteredData = computed(() => {
  let result = inventoryData.value
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => {
      return item.material_code.toLowerCase().includes(query) || 
             item.batch_id.toLowerCase().includes(query) ||
             (item.location && item.location.toLowerCase().includes(query)) ||
             (item.material_name && item.material_name.toLowerCase().includes(query))
    })
  }
  
  // 工厂过滤
  if (factoryFilter.value) {
    result = result.filter(item => item.factory === factoryFilter.value)
  }
  
  // 状态过滤
  if (statusFilter.value) {
    result = result.filter(item => item.status === statusFilter.value)
  }
  
  return result
})

// 排序数据
const sortedData = computed(() => {
  const data = [...filteredData.value]
  
  switch (sortBy.value) {
    case 'arrival_time_asc':
      return data.sort((a, b) => new Date(a.arrival_time) - new Date(b.arrival_time))
    case 'arrival_time_desc':
      return data.sort((a, b) => new Date(b.arrival_time) - new Date(a.arrival_time))
    case 'quantity_asc':
      return data.sort((a, b) => a.quantity - b.quantity)
    case 'quantity_desc':
      return data.sort((a, b) => b.quantity - a.quantity)
    default:
      return data
  }
})

// 分页数据
const displayData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return sortedData.value.slice(start, end)
})

// 根据状态返回标签类型
function getStatusTagType(status) {
  switch (status) {
    case 'normal':
      return 'success'
    case 'frozen':
      return 'info'
    case 'pending':
      return 'warning'
    case 'rejected':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取状态文本
function getStatusText(status) {
  switch (status) {
    case 'normal':
      return '正常'
    case 'frozen':
      return '冻结'
    case 'pending':
      return '待检'
    case 'rejected':
      return '不合格'
    default:
      return '未知'
  }
}

// 根据状态设置行样式
function tableRowClassName({ row }) {
  switch (row.status) {
    case 'frozen':
      return 'frozen-row'
    case 'pending':
      return 'pending-row'
    case 'rejected':
      return 'rejected-row'
    default:
      return ''
  }
}

// 搜索处理
function handleSearch() {
  currentPage.value = 1
}

// 筛选处理
function handleFilters() {
  currentPage.value = 1
}

// 排序处理
function handleSort() {
  currentPage.value = 1
}

// 分页大小变化
function handleSizeChange(val) {
  pageSize.value = val
  currentPage.value = 1
}

// 当前页变化
function handleCurrentChange(val) {
  currentPage.value = val
}

// 查看物料详情
function viewDetails(row) {
  selectedMaterial.value = row
  activeTab.value = 'basic'
  detailDialogVisible.value = true
}

// 打印物料详情
function printMaterialDetails() {
  ElMessage.success('正在打印物料详情...')
  // 实际打印逻辑...
}

// 冻结/释放物料
function toggleFreezeStatus(row) {
  const action = row.status === 'frozen' ? '释放' : '冻结'
  
  ElMessageBox.confirm(
    `确定要${action}物料 ${row.material_code}(批次:${row.batch_id}) 吗?`, 
    `${action}确认`,
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 更新物料状态
    row.status = row.status === 'frozen' ? 'normal' : 'frozen'
    
    // 更新统计数据
    calculateStatistics()
    
    ElMessage({
      type: 'success',
      message: `已${action}物料 ${row.material_code}`
    })
  }).catch(() => {
    // 用户取消操作
  })
}

// 显示移库对话框
function showConfirmDialog(row) {
  selectedMaterial.value = row
  moveForm.value.quantity = row.quantity
  moveForm.value.targetFactory = row.factory
  moveForm.value.targetLocation = ''
  moveForm.value.reason = ''
  moveDialogVisible.value = true
}

// 确认移库
function confirmMove() {
  if (!moveForm.value.targetLocation) {
    ElMessage.warning('请选择目标库位')
    return
  }
  
  ElMessage.success(`已将 ${moveForm.value.quantity} ${selectedMaterial.value.unit} ${selectedMaterial.value.material_code} 移至 ${moveForm.value.targetFactory} ${moveForm.value.targetLocation}`)
  
  // 更新物料记录
  // 实际操作应该调用API更新数据库

  // 如果移库全部数量，更新库位信息
  if (moveForm.value.quantity === selectedMaterial.value.quantity) {
    selectedMaterial.value.location = moveForm.value.targetLocation
    selectedMaterial.value.factory = moveForm.value.targetFactory
  } else {
    // 如果只移动部分，应创建一条新记录
    const newItem = { ...selectedMaterial.value }
    newItem.quantity = moveForm.value.quantity
    newItem.location = moveForm.value.targetLocation
    newItem.factory = moveForm.value.targetFactory
    
    // 更新原记录数量
    selectedMaterial.value.quantity -= moveForm.value.quantity
    
    // 添加新记录
    inventoryData.value.push(newItem)
  }
  
  // 添加历史记录
  if (!selectedMaterial.value.history) {
    selectedMaterial.value.history = []
  }
  
  selectedMaterial.value.history.unshift({
    date: new Date().toLocaleString(),
    operation: '移库',
    quantity: moveForm.value.quantity,
    location: `${selectedMaterial.value.location} → ${moveForm.value.targetLocation}`,
    operator: '当前用户',
    notes: moveForm.value.reason
  })
  
  moveDialogVisible.value = false
}

// 计算统计数据
function calculateStatistics() {
  const stats = {
    totalItems: inventoryData.value.length,
    totalQuantity: 0,
    normalItems: 0,
    normalQuantity: 0,
    frozenItems: 0,
    frozenQuantity: 0,
    pendingItems: 0,
    pendingQuantity: 0
  }
  
  inventoryData.value.forEach(item => {
    stats.totalQuantity += item.quantity
    
    switch (item.status) {
      case 'normal':
        stats.normalItems++
        stats.normalQuantity += item.quantity
        break
      case 'frozen':
        stats.frozenItems++
        stats.frozenQuantity += item.quantity
        break
      case 'pending':
      case 'rejected':
        stats.pendingItems++
        stats.pendingQuantity += item.quantity
        break
    }
  })
  
  statisticsData.value = stats
}

// 处理AI建议
function handleRecommendation(rec) {
  switch(rec.action) {
    case 'checkExpiry':
      ElMessage({
        message: '正在为您筛选即将过期的批次...',
        type: 'info'
      });
      // 这里可以添加筛选逻辑
      break;
    case 'optimizeStorage':
      ElMessage({
        message: '正在分析库位优化方案...',
        type: 'info'
      });
      // 这里可以添加库位优化逻辑
      break;
    case 'supplierRisk':
      ElMessage({
        message: '正在加载供应商风险详情...',
        type: 'info'
      });
      // 这里可以添加供应商风险分析逻辑
      break;
  }
}

// 忽略AI建议
function dismissRecommendation(index) {
  aiRecommendations.value.splice(index, 1);
  ElMessage({
    message: '已忽略该建议',
    type: 'success'
  });
}

// 处理移库建议
function handleMoveSuggestion(suggestion) {
  moveForm.targetFactory = suggestion.suggested_location.split('-')[0];
  moveForm.targetLocation = suggestion.suggested_location;
  moveForm.quantity = getItemQuantity(suggestion.material_code, suggestion.batch_id);
  moveForm.reason = suggestion.reason;
  
  // 找到对应物料
  const material = inventoryData.value.find(item => 
    item.material_code === suggestion.material_code && 
    item.batch_id === suggestion.batch_id
  );
  
  if (material) {
    selectedMaterial.value = material;
    moveDialogVisible.value = true;
  }
}

// 辅助函数：获取物料数量
function getItemQuantity(materialCode, batchId) {
  const item = inventoryData.value.find(i => 
    i.material_code === materialCode && 
    i.batch_id === batchId
  );
  return item ? item.quantity : 0;
}

// 添加onMounted中初始化图表的代码
onMounted(() => {
  // ... 已有的onMounted代码 ...
  
  // 初始化库存预测图表
  initInventoryPredictionChart();
});

// 初始化库存预测图表
function initInventoryPredictionChart() {
  const chartDom = document.getElementById('inventoryPredictionChart');
  if (!chartDom) return;
  
  const myChart = echarts.init(chartDom);
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['当前库存', '预测用量', '预测补货', '建议库存']
    },
    xAxis: {
      type: 'category',
      data: ['本周', '下周', '第3周', '第4周', '第5周', '第6周']
    },
    yAxis: {
      type: 'value',
      name: '数量'
    },
    series: [
      {
        name: '当前库存',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: [320, 280, 230, 180, 120, 70]
      },
      {
        name: '预测用量',
        type: 'line',
        emphasis: {
          focus: 'series'
        },
        data: [40, 50, 50, 60, 50, 40]
      },
      {
        name: '预测补货',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: [0, 0, 0, 0, 150, 0]
      },
      {
        name: '建议库存',
        type: 'line',
        emphasis: {
          focus: 'series'
        },
        lineStyle: {
          type: 'dashed'
        },
        data: [300, 300, 300, 300, 300, 300]
      }
    ]
  };
  
  option && myChart.setOption(option);
  
  // 监听窗口大小变化，调整图表大小
  window.addEventListener('resize', () => {
    myChart.resize();
  });
}

// 初始化数据
function initData() {
  // 转换工厂数据为库存数据
  const existingData = factoryDataJson.map(item => {
    // 为演示加入更多字段
    return {
      material_code: item.material_code,
      material_name: `物料${item.material_code.substring(item.material_code.length - 4)}`,
      batch_id: item.batch_id,
      location: ['原料区', '成品区', '半成品区', '待检区'][Math.floor(Math.random() * 4)],
      factory: ['深圳工厂', '惠州工厂', '东莞工厂', '中央仓库'][Math.floor(Math.random() * 4)],
      quantity: Math.floor(Math.random() * 1000) + 1,
      unit: ['件', '个', 'kg', 'pcs'][Math.floor(Math.random() * 4)],
      status: ['normal', 'normal', 'normal', 'frozen', 'pending', 'rejected'][Math.floor(Math.random() * 6)],
      arrival_time: item.arrival_time,
      supplier: ['供应商A', '供应商B', '供应商C'][Math.floor(Math.random() * 3)],
      expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString(),
      // 随机添加检验记录
      inspections: Math.random() > 0.3 ? [
        {
          type: '入厂',
          date: new Date(item.arrival_time).toLocaleString(),
          result: Math.random() > 0.2 ? 'pass' : 'fail',
          inspector: '检验员' + Math.floor(Math.random() * 10),
          notes: Math.random() > 0.5 ? '常规检验' : '抽检合格'
        },
        ...(Math.random() > 0.5 ? [{
          type: '质量抽检',
          date: new Date(new Date(item.arrival_time).getTime() + 86400000).toLocaleString(),
          result: Math.random() > 0.2 ? 'pass' : 'pending',
          inspector: '检验员' + Math.floor(Math.random() * 10),
          notes: ''
        }] : [])
      ] : [],
      // 随机添加历史记录
      history: [
        {
          date: new Date(item.arrival_time).toLocaleString(),
          operation: '入库',
          quantity: Math.floor(Math.random() * 1000) + 1,
          location: ['原料区', '成品区', '半成品区'][Math.floor(Math.random() * 3)],
          operator: '操作员' + Math.floor(Math.random() * 5),
          notes: '正常入库'
        },
        ...(Math.random() > 0.7 ? [{
          date: new Date(new Date(item.arrival_time).getTime() + 172800000).toLocaleString(),
          operation: '领用',
          quantity: -Math.floor(Math.random() * 100),
          location: '生产线',
          operator: '操作员' + Math.floor(Math.random() * 5),
          notes: '生产领用'
        }] : [])
      ]
    }
  })
  
  // 添加更多模拟数据
  const additionalMaterials = [
    { code: 'A001', name: '塑料外壳'},
    { code: 'A002', name: '金属外壳'},
    { code: 'B001', name: '液晶屏幕'},
    { code: 'B002', name: '触控面板'},
    { code: 'C001', name: '主板'},
    { code: 'C002', name: '电池'},
    { code: 'C003', name: '摄像头模组'},
    { code: 'D001', name: '扬声器'},
    { code: 'D002', name: '麦克风'},
    { code: 'E001', name: '后壳组件'},
    { code: 'E002', name: '前盖组件'},
    { code: 'F001', name: '包装盒'},
    { code: 'F002', name: '说明书'},
    { code: 'G001', name: '螺丝'},
    { code: 'G002', name: '固定卡扣'},
    { code: 'H001', name: '耳机'},
    { code: 'H002', name: '充电线'},
    { code: 'I001', name: '缓冲材料'},
    { code: 'I002', name: '保护膜'},
    { code: 'J001', name: '装饰件'},
  ]
  
  // 生成额外的库存数据
  const additionalData = []
  
  for (let i = 0; i < additionalMaterials.length; i++) {
    const material = additionalMaterials[i]
    
    // 为每种物料生成1-3条记录，代表不同批次
    const batchCount = Math.floor(Math.random() * 3) + 1
    
    for (let j = 0; j < batchCount; j++) {
      const today = new Date()
      const arrivalDate = new Date(today)
      arrivalDate.setDate(today.getDate() - Math.floor(Math.random() * 30))
      
      const factory = ['深圳工厂', '惠州工厂', '东莞工厂', '中央仓库'][Math.floor(Math.random() * 4)]
      const location = ['原料区', '成品区', '半成品区', '待检区', '不良品区'][Math.floor(Math.random() * 5)]
      const batchId = `B${Math.floor(Math.random() * 900) + 100}`
      const quantity = Math.floor(Math.random() * 5000) + 50
      const unit = ['件', '个', 'kg', 'pcs', '箱'][Math.floor(Math.random() * 5)]
      const status = ['normal', 'normal', 'normal', 'normal', 'frozen', 'pending', 'rejected'][Math.floor(Math.random() * 7)]
      
      additionalData.push({
        material_code: material.code,
        material_name: material.name,
        batch_id: batchId,
        location: location,
        factory: factory,
        quantity: quantity,
        unit: unit,
        status: status,
        arrival_time: arrivalDate.toLocaleDateString('zh-CN'),
        supplier: ['供应商A', '供应商B', '供应商C', '供应商D', '供应商E'][Math.floor(Math.random() * 5)],
        expiry_date: new Date(new Date().setFullYear(arrivalDate.getFullYear() + 2)).toLocaleDateString('zh-CN'),
        inspections: status !== 'normal' ? [
          {
            type: '入厂',
            date: new Date(arrivalDate).toLocaleString('zh-CN'),
            result: status === 'rejected' ? 'fail' : status === 'pending' ? 'pending' : 'pass',
            inspector: '检验员' + Math.floor(Math.random() * 10 + 1),
            notes: status === 'rejected' ? '不合格品，待处理' : status === 'pending' ? '待复检' : '合格'
          }
        ] : [],
        history: [
          {
            date: new Date(arrivalDate).toLocaleString('zh-CN'),
            operation: '入库',
            quantity: quantity,
            location: location,
            operator: '操作员' + Math.floor(Math.random() * 5 + 1),
            notes: '正常入库'
          }
        ]
      })
      
      // 对冻结的物料添加冻结记录
      if (status === 'frozen') {
        const freezeDate = new Date(arrivalDate)
        freezeDate.setDate(arrivalDate.getDate() + Math.floor(Math.random() * 5) + 1)
        
        additionalData[additionalData.length - 1].history.push({
          date: freezeDate.toLocaleString('zh-CN'),
          operation: '冻结',
          quantity: 0,
          location: location,
          operator: '质检员' + Math.floor(Math.random() * 3 + 1),
          notes: ['质量问题待确认', '供应商质量追溯', '客户投诉调查'][Math.floor(Math.random() * 3)]
        })
      }
      
      // 随机添加一些领用记录
      if (Math.random() > 0.6) {
        const useDate = new Date(arrivalDate) 
        useDate.setDate(arrivalDate.getDate() + Math.floor(Math.random() * 10) + 1)
        const useQuantity = Math.floor(quantity * (Math.random() * 0.5 + 0.1))
        
        additionalData[additionalData.length - 1].history.push({
          date: useDate.toLocaleString('zh-CN'),
          operation: '领用',
          quantity: -useQuantity,
          location: '生产线',
          operator: '生产员' + Math.floor(Math.random() * 5 + 1),
          notes: '生产领用'
        })
        
        additionalData[additionalData.length - 1].quantity -= useQuantity
      }
    }
  }
  
  // 合并原有数据和新增数据
  inventoryData.value = [...existingData, ...additionalData]
  calculateStatistics()
}

onMounted(() => {
  // 模拟加载延迟
  setTimeout(() => {
    initData()
    loading.value = false
  }, 500)
  
  // 初始化库存预测图表
  initInventoryPredictionChart();
})
</script>
<style scoped>
.el-card {
  margin: 32px auto;
  max-width: 1200px;
}

.toolbar {
  display: flex;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.frozen-row) {
  background-color: rgba(144, 147, 153, 0.1);
}

:deep(.pending-row) {
  background-color: rgba(230, 162, 60, 0.1);
}

:deep(.rejected-row) {
  background-color: rgba(245, 108, 108, 0.1);
}

.statistic-card {
  text-align: center;
  padding: 10px;
  height: 100%;
}

.statistic-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.statistic-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.statistic-subtitle {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

@media screen and (max-width: 768px) {
  .toolbar {
    flex-direction: column;
  }
  
  .toolbar .el-input,
  .toolbar .el-select {
    width: 100% !important;
    margin-right: 0 !important;
    margin-bottom: 10px;
  }
}

.ai-recommendation-card {
  margin-bottom: 20px;
}

.ai-recommendation-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.prediction-card {
  margin-bottom: 20px;
}

.recommendation-card {
  margin-bottom: 20px;
}
</style> 
 
 
 