<template>
  <div class="inventory-page">
    <div class="page-header">
      <h1>IQE物料流动风险管控平台</h1>
      <div class="header-actions">
        <el-button type="primary" @click="refreshData">
          <el-icon><Refresh /></el-icon>刷新数据
        </el-button>
        <el-button type="info" @click="showAIAssistant">
          <el-icon><ChatDotSquare /></el-icon>智能助手
        </el-button>
      </div>
    </div>

    <!-- 统计概览卡片 -->
    <el-row :gutter="20" class="dashboard-cards">
      <el-col :span="8">
        <el-card shadow="hover" class="dashboard-card normal-items">
          <template #header><div class="card-header"><h3>正常物料批次</h3><el-icon><CircleCheck /></el-icon></div></template>
          <div class="card-value-container">
            <div class="card-value">{{ normalItemsCount }}</div>
            <div class="card-info">
              <div class="info-item"><span class="info-label">主要区域</span><span class="info-value">{{ mainStorageArea }}</span></div>
              <div class="info-item"><span class="info-label">仓库物料</span><span class="info-value success-text">原料仓物料</span></div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="dashboard-card risk-items">
          <template #header><div class="card-header"><h3>风险物料批次</h3><el-icon><Warning /></el-icon></div></template>
          <div class="card-value-container">
            <div class="card-value">{{ riskItemsCount }}</div>
            <div class="card-info">
              <div class="info-item"><span class="info-label">风险厂商</span><span class="info-value warning-text">{{ topRiskSupplier }}</span></div>
              <div class="info-item"><span class="info-label">预警等级</span><span class="info-value warning-text">{{ riskLevel }}<el-tooltip :content="riskLevelDescription" placement="top"><el-icon><InfoFilled /></el-icon></el-tooltip></span></div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="dashboard-card problem-items">
          <template #header><div class="card-header"><h3>冻结物料批次</h3><el-icon><Lock /></el-icon></div></template>
          <div class="card-value-container">
            <div class="card-value">{{ frozenItemsCount }}</div>
            <div class="card-info">
              <div class="info-item"><span class="info-label">所在仓库</span><span class="info-value">{{ frozenItemsWarehouse }}</span></div>
              <div class="info-item"><span class="info-label">处理方针</span><span class="info-value" :class="frozenItemsCount > 0 ? 'warning-text' : 'neutral-text'">{{ frozenItemsCount > 0 ? '等待解冻' : '暂无操作' }}</span></div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 物料供应商分析卡片 -->
    <el-row :gutter="20" class="dashboard-cards">
      <el-col :span="24">
        <el-card shadow="hover" class="supplier-card">
          <template #header>
            <div class="card-header">
              <h3>物料风险供应商分析</h3>
              <div class="header-controls">
                <el-radio-group v-model="supplierAnalysisType" size="small">
                  <el-radio-button label="quality">质量状况</el-radio-button>
                  <el-radio-button label="risk">风险指数</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </template>
          <div class="supplier-analysis">
            <div v-if="supplierAnalysisType === 'quality'" class="supplier-list-container">
              <div v-for="(supplier, index) in topQualitySuppliers" :key="index" class="supplier-item" :class="getQualityLevelClass(supplier.qualityLevel)">
                <div class="supplier-rank">{{ index + 1 }}</div>
                <div class="supplier-info">
                  <div class="supplier-name">{{ supplier.name }}</div>
                  <div class="supplier-stats"><span>不合格率: {{ supplier.defectRate }}%</span><span>样本批次: {{ supplier.batchCount }}</span></div>
                </div>
                <div class="supplier-tag"><el-tag :type="getQualityTagType(supplier.qualityLevel)" effect="light">{{ supplier.qualityLevel }}</el-tag></div>
              </div>
            </div>
            <div v-if="supplierAnalysisType === 'risk'" class="supplier-list-container">
              <div v-for="(supplier, index) in topRiskSuppliers" :key="index" class="supplier-item" :class="getRiskLevelClass(supplier.riskScore)">
                <div class="supplier-rank">{{ index + 1 }}</div>
                <div class="supplier-info">
                  <div class="supplier-name">{{ supplier.name }}</div>
                  <div class="supplier-stats"><span>风险批次: {{ supplier.issues }}</span><span>总批次数: {{ supplier.totalItems }}</span></div>
                </div>
                <div class="supplier-tag"><el-tag :type="getRiskTagType(supplier.riskScore)" effect="light">{{ supplier.riskScore }}%</el-tag></div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 风险管控图表区域 (重构后这里可以放真实图表) -->
    <el-row :gutter="20">
       <el-col :span="8">
        <el-card shadow="hover">
          <template #header>冻结原因分布</template>
          <div ref="reasonDistChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card shadow="hover">
           <template #header>近期物料风险管控</template>
            <div class="risk-control-container">
            <!-- 风险物料区域 -->
            <div class="risk-section">
              <h4 class="section-title"><el-icon><Warning /></el-icon> 风险物料</h4>
              <div class="action-list">
                <div v-for="(item, index) in riskOnlyMaterials" :key="`risk-${index}`" class="action-item">
                  <div class="action-content">
                    <div class="action-title">{{ item.type }}: <strong>{{ item.materialName }}</strong> ({{ item.code }})</div>
                    <div class="action-details">{{ item.details }}</div>
                  </div>
                  <el-tag type="warning">{{ item.status }}</el-tag>
                </div>
                <div v-if="!riskOnlyMaterials.length" class="empty-text">暂无风险物料</div>
              </div>
            </div>
            <!-- 冻结物料区域 -->
            <div class="frozen-section">
              <h4 class="section-title"><el-icon><Lock /></el-icon> 冻结物料</h4>
              <div class="action-list">
                <div v-for="(item, index) in frozenOnlyMaterials" :key="`frozen-${index}`" class="action-item">
                  <div class="action-content">
                    <div class="action-title">{{ item.type }}: <strong>{{ item.materialName }}</strong> ({{ item.code }})</div>
                    <div class="action-freeze-reason" v-if="item.freezeReason"><span class="reason-label">冻结原因:</span> {{ item.freezeReason }}</div>
                  </div>
                   <div class="action-status">
                    <el-tag type="danger">{{ item.status }}</el-tag>
                    <el-button size="small" type="primary" @click="handleFreezeToggle(item)" class="unfreeze-btn">解冻处理</el-button>
                  </div>
                </div>
                 <div v-if="!frozenOnlyMaterials.length" class="empty-text">暂无冻结物料</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 物料表格区域 -->
    <el-card shadow="hover" class="table-card">
      <template #header>
        <div class="card-header">
          <h3>库存批次管理</h3>
          <div class="table-actions">
            <el-input v-model="searchQuery" placeholder="搜索物料、批次或供应商" prefix-icon="Search" clearable @change="handleSearch" style="width: 300px"/>
            <el-select v-model="statusFilter" placeholder="物料状态" @change="handleSearch" style="width: 120px">
              <el-option label="全部" value=""></el-option>
              <el-option label="正常" value="normal"></el-option>
              <el-option label="风险" value="risk"></el-option>
              <el-option label="冻结" value="frozen"></el-option>
            </el-select>
          </div>
        </div>
      </template>

      <el-table :data="pagedInventoryData" style="width: 100%" v-loading="tableLoading" height="450" stripe :row-class-name="tableRowClassName">
        <el-table-column prop="factory" label="工厂" width="100" sortable />
        <el-table-column prop="warehouse" label="仓库" width="100" sortable />
        <el-table-column prop="materialCode" label="物料编号" width="140" sortable />
        <el-table-column prop="materialName" label="物料名称" width="180" />
        <el-table-column prop="supplier" label="供应商" width="150" sortable />
        <el-table-column prop="batchNumber" label="批次" width="150" sortable />
        <el-table-column prop="quantity" label="数量" sortable width="80" />
        <el-table-column label="状态" width="110" sortable prop="status">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="入库时间" width="120" sortable prop="receiveDate" />
        <el-table-column label="到期日期" width="120" sortable prop="expiryDate" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewDetails(scope.row)">详情</el-button>
            <el-button :type="scope.row.status === 'frozen' ? 'success' : 'warning'" size="small" @click="handleFreezeToggle(scope.row)">
              {{ scope.row.status === 'frozen' ? '解冻' : '冻结' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
      </div>
    </el-card>

  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed, nextTick, watch } from 'vue';
import { ElMessage, ElNotification, ElMessageBox } from 'element-plus';
import { Refresh, Warning, Lock, Search, CircleCheck, InfoFilled, ChatDotSquare } from '@element-plus/icons-vue';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { safeInitChart, setupChartResize } from '../utils/chartHelper.js';
import UnifiedDataService from '../services/UnifiedDataService.ts';
import { useInventoryAnalysis } from '../composables/useInventoryAnalysis';
import { v4 as uuidv4 } from 'uuid';

// Echarts 注册
echarts.use([TitleComponent, TooltipComponent, LegendComponent, GridComponent, PieChart, CanvasRenderer]);

// --- 核心状态 ---
const inventoryData = ref([]);
const tableLoading = ref(false);

// --- 筛选与分页 ---
const searchQuery = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
const pageSize = ref(20);

// --- 业务逻辑与计算属性 (来自Composable) ---
const {
  normalItemsCount, riskItemsCount, frozenItemsCount,
  mainStorageArea, frozenItemsWarehouse, topRiskSupplier, riskLevel, riskLevelDescription,
  topRiskSuppliers, topQualitySuppliers,
  riskOnlyMaterials, frozenOnlyMaterials,
  freezeReasonChartData,
} = useInventoryAnalysis(inventoryData);

// --- 筛选后的数据 ---
const filteredInventoryData = computed(() => {
  let data = inventoryData.value;
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    data = data.filter(item =>
      item.materialCode.toLowerCase().includes(query) ||
      item.materialName.toLowerCase().includes(query) ||
      item.batchNumber.toLowerCase().includes(query) ||
      item.supplier.toLowerCase().includes(query)
    );
  }
  if (statusFilter.value) {
    data = data.filter(item => item.status === statusFilter.value);
  }
  return data;
});

const total = computed(() => filteredInventoryData.value.length);

const pagedInventoryData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredInventoryData.value.slice(start, end);
});

// --- 数据获取 ---
const fetchInventoryData = async () => {
  tableLoading.value = true;
  try {
    inventoryData.value = await UnifiedDataService.getInventoryData();
    // 首次加载，如果数据为空，可以触发一次数据迁移（仅用于开发）
    if (inventoryData.value.length === 0) {
      ElMessageBox.confirm('本地没有找到标准格式的库存数据，是否尝试从旧格式迁移?', '数据迁移提示', {
          confirmButtonText: '开始迁移',
          cancelButtonText: '取消',
          type: 'info',
        }).then(() => {
          UnifiedDataService.runMigration();
          refreshData(); // 迁移后刷新
          ElMessage.success('数据迁移成功！');
        });
    }
  } catch (error) {
    ElMessage.error('获取库存数据失败: ' + error.message);
  } finally {
    tableLoading.value = false;
  }
};

const refreshData = () => {
  fetchInventoryData();
};

// --- 生命周期 ---
onMounted(() => {
  fetchInventoryData();
});

// --- 图表渲染 ---
const reasonDistChart = ref(null);
let reasonChartInstance = null;

const renderReasonDistChart = () => {
  if (!reasonDistChart.value) return;
  reasonChartInstance = safeInitChart(reasonDistChart.value);
  const option = {
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', left: 10, data: freezeReasonChartData.value.map(d => d.name) },
    series: [{
      name: '冻结原因',
      type: 'pie',
      radius: ['40%', '70%'],
      data: freezeReasonChartData.value,
    }]
  };
  reasonChartInstance.setOption(option);
  setupChartResize(reasonChartInstance);
};

// 监听图表数据变化并重新渲染
watch(freezeReasonChartData, () => {
  renderReasonDistChart();
}, { deep: true });

// --- UI 辅助函数 ---
const supplierAnalysisType = ref('quality');

const getStatusTagType = (status) => {
  switch (status) {
    case 'frozen': return 'danger';
    case 'risk': return 'warning';
    case 'inspection': return 'info';
    default: return 'success';
  }
};

const tableRowClassName = ({ row }) => {
  if (row.status === 'frozen') return 'frozen-row';
  if (row.status === 'risk') return 'risk-row';
  return '';
};

const getQualityLevelClass = (level) => {
  if (level === '较差') return 'poor-quality';
  if (level === '一般') return 'average-quality';
  return 'good-quality';
};

const getRiskLevelClass = (score) => {
  if (score >= 70) return 'high-risk';
  if (score >= 40) return 'medium-risk';
  return 'low-risk';
};

const getQualityTagType = (level) => {
  if (level === '较差') return 'danger';
  if (level === '一般') return 'warning';
  return 'success';
};

const getRiskTagType = (score) => {
  if (score >= 70) return 'danger';
  if (score >= 40) return 'warning';
  return 'success';
};

// --- 交互处理 ---
const handleSearch = () => {
  currentPage.value = 1;
};

const handleSizeChange = (val) => {
  pageSize.value = val;
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
};

const handleFreezeToggle = async (item) => {
  const index = inventoryData.value.findIndex(i => i.id === item.id);
  if (index === -1) return;

  const isFreezing = inventoryData.value[index].status !== 'frozen';
  inventoryData.value[index].status = isFreezing ? 'frozen' : 'normal';

  if (isFreezing && !inventoryData.value[index].freezeReason) {
     const { value } = await ElMessageBox.prompt('请输入冻结原因', '冻结物料', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '冻结原因不能为空',
     });
     inventoryData.value[index].freezeReason = value;
  } else if (!isFreezing) {
    inventoryData.value[index].freezeReason = undefined;
  }

  await UnifiedDataService.saveInventoryData(inventoryData.value);
  ElMessage.success(`物料已${isFreezing ? '冻结' : '解冻'}`);
};

const viewDetails = (row) => {
  // 可以在这里导航到详情页或弹出对话框
  ElNotification({
    title: '物料详情',
    message: `正在查看 ${row.materialName} (${row.batchNumber}) 的详细信息。`,
    type: 'info',
  });
};

const showAIAssistant = () => {
   ElMessage.info('智能助手功能正在开发中...');
}

</script>

<style scoped>
.inventory-page {
  padding: 20px;
  background-color: #f0f2f5;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.dashboard-cards {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-value-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-value {
  font-size: 36px;
  font-weight: bold;
}
.card-info {
  text-align: right;
}
.info-item {
  margin-bottom: 5px;
}
.info-label {
  color: #909399;
  margin-right: 8px;
}
.supplier-card .supplier-list-container {
  display: flex;
  justify-content: space-around;
}
.supplier-item {
  padding: 10px;
  border-radius: 8px;
  width: 18%;
  text-align: center;
  border: 1px solid #e0e0e0;
}
.good-quality { background-color: #f0f9eb; }
.average-quality { background-color: #fdf6ec; }
.poor-quality { background-color: #fef0f0; }
.low-risk { background-color: #f0f9eb; }
.medium-risk { background-color: #fdf6ec; }
.high-risk { background-color: #fef0f0; }

.risk-control-container {
  display: flex;
  gap: 20px;
}
.risk-section, .frozen-section {
  flex: 1;
}
.action-list {
  max-height: 250px;
  overflow-y: auto;
}
.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}
.action-content {
  flex-grow: 1;
}
.action-title { font-weight: bold; }
.action-details, .action-freeze-reason { font-size: 12px; color: #909399; margin-top: 4px; }

.table-card {
  margin-top: 20px;
}
.table-actions {
  display: flex;
  gap: 10px;
}
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
:deep(.el-table .risk-row) {
  background: #fdf6ec !important;
}
:deep(.el-table .frozen-row) {
  background: #fef0f0 !important;
}
.empty-text {
  color: #909399;
  text-align: center;
  padding: 20px;
}
</style>