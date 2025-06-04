<template>
  <div class="factory-container">
    <!-- 页面标题与工具栏 -->
    <div class="page-header">
      <h2 class="page-title">库存物料管理</h2>
      <div class="toolbar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索物料编码或名称"
          clearable
          class="search-input"
        >
          <template #prefix>
            <el-icon><el-icon-search /></el-icon>
          </template>
        </el-input>
        
        <el-select v-model="categoryFilter" placeholder="物料分类" clearable class="filter-select">
          <el-option
            v-for="category in materialCategories"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>
        
        <el-select v-model="defectFilter" placeholder="缺陷率" clearable class="filter-select">
          <el-option label="全部" value="" />
          <el-option label="低风险 (0-1%)" value="low" />
          <el-option label="中风险 (1-3%)" value="medium" />
          <el-option label="高风险 (>3%)" value="high" />
        </el-select>
        
        <el-button type="primary" @click="refreshData">
          <el-icon><el-icon-refresh /></el-icon> 刷新
        </el-button>
      </div>
    </div>
    
    <!-- 数据概览卡片 -->
    <div class="statistics-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><el-icon-data-line /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-title">总物料数</div>
                <div class="stat-value">{{ filteredData.length }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card warning" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><el-icon-warning /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-title">高风险物料</div>
                <div class="stat-value">{{ highRiskCount }}</div>
                <div class="stat-rate">{{ highRiskRate }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><el-icon-goods /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-title">总库存数</div>
                <div class="stat-value">{{ totalInventory }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><el-icon-odometer /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-title">平均缺陷率</div>
                <div class="stat-value">{{ avgDefectRate }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 物料分类缺陷分布图表 -->
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>物料分类缺陷分布</h3>
            </div>
          </template>
          <div class="chart-wrapper" ref="categoryChartRef"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 物料数据表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <h3>物料库存清单</h3>
          <el-button-group>
            <el-button size="small" @click="exportData">导出数据</el-button>
            <el-button size="small" type="success" @click="openBatchInspectionDialog">批量检验</el-button>
          </el-button-group>
        </div>
      </template>
      
      <el-table 
        :data="pagedData" 
        style="width: 100%" 
        border 
        stripe 
        highlight-current-row
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
        :row-class-name="defectRowClassName"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="material_code" label="物料编码" sortable width="140" />
        <el-table-column prop="material_name" label="物料名称" width="180" />
        <el-table-column label="物料分类" width="180">
          <template #default="scope">
            {{ getCategoryNameById(scope.row.category_id) }}
          </template>
        </el-table-column>
        <el-table-column prop="supplier" label="供应商" />
        <el-table-column prop="batch_number" label="批次号" width="120" />
        <el-table-column prop="quantity" label="库存数量" sortable width="100" align="right" />
        <el-table-column prop="defect_rate" label="缺陷率" sortable width="100" align="right">
          <template #default="scope">
            <span :class="getDefectRateClass(scope.row.defect_rate)">{{ scope.row.defect_rate }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="last_inspection" label="最后检验" sortable width="120">
          <template #default="scope">
            {{ formatDate(scope.row.last_inspection) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click.stop="viewDetail(scope.row)">详情</el-button>
            <el-button type="success" link size="small" @click.stop="inspectMaterial(scope.row)">检验</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
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
      title="物料详细信息"
      width="70%"
      append-to-body
    >
      <div v-if="selectedMaterial" class="material-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="物料编码">{{ selectedMaterial.material_code }}</el-descriptions-item>
          <el-descriptions-item label="物料名称">{{ selectedMaterial.material_name }}</el-descriptions-item>
          <el-descriptions-item label="物料分类">{{ getCategoryNameById(selectedMaterial.category_id) }}</el-descriptions-item>
          <el-descriptions-item label="供应商">{{ selectedMaterial.supplier }}</el-descriptions-item>
          <el-descriptions-item label="批次号">{{ selectedMaterial.batch_number }}</el-descriptions-item>
          <el-descriptions-item label="库存数量">{{ selectedMaterial.quantity }}</el-descriptions-item>
          <el-descriptions-item label="缺陷率">
            <span :class="getDefectRateClass(selectedMaterial.defect_rate)">{{ selectedMaterial.defect_rate }}%</span>
          </el-descriptions-item>
          <el-descriptions-item label="最后检验日期">{{ formatDate(selectedMaterial.last_inspection) }}</el-descriptions-item>
          <el-descriptions-item label="入库日期">{{ formatDate(selectedMaterial.entry_date) }}</el-descriptions-item>
          <el-descriptions-item label="存放位置">{{ selectedMaterial.location }}</el-descriptions-item>
          <el-descriptions-item label="检验周期" :span="2">{{ selectedMaterial.inspection_cycle }} 天</el-descriptions-item>
          <el-descriptions-item label="附加说明" :span="2">
            {{ selectedMaterial.notes || '无' }}
          </el-descriptions-item>
        </el-descriptions>
        
        <!-- 历史检验记录 -->
        <h4 class="section-title">历史检验记录</h4>
        <el-table 
          :data="selectedMaterial.history || []" 
          style="width: 100%" 
          border 
          size="small"
        >
          <el-table-column prop="date" label="检验日期" width="120">
            <template #default="scope">{{ formatDate(scope.row.date) }}</template>
          </el-table-column>
          <el-table-column prop="inspector" label="检验员" width="100" />
          <el-table-column prop="sample_size" label="样本数" width="80" align="center" />
          <el-table-column prop="defect_count" label="缺陷数" width="80" align="center" />
          <el-table-column prop="defect_rate" label="缺陷率" width="80" align="center">
            <template #default="scope">{{ scope.row.defect_rate }}%</template>
          </el-table-column>
          <el-table-column prop="result" label="结论" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.result === '合格' ? 'success' : 'danger'">
                {{ scope.row.result }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="notes" label="备注" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { materialCategories, getCategoryName } from '../data/material_categories';
import * as echarts from 'echarts';
import factoryDataJson from '../data/factory_data.json';

// 状态变量
const factoryData = ref([...factoryDataJson]);
const searchQuery = ref('');
const categoryFilter = ref('');
const defectFilter = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const sortBy = ref('');
const sortOrder = ref('');
const detailDialogVisible = ref(false);
const selectedMaterial = ref(null);
const categoryChartRef = ref(null);
let categoryChart = null;

// 计算属性
const filteredData = computed(() => {
  let result = factoryData.value;
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(item => 
      item.material_code.toLowerCase().includes(query) || 
      item.material_name.toLowerCase().includes(query) ||
      item.supplier.toLowerCase().includes(query)
    );
  }
  
  // 分类过滤
  if (categoryFilter.value) {
    result = result.filter(item => item.category_id === categoryFilter.value);
  }
  
  // 缺陷率过滤
  if (defectFilter.value) {
    switch(defectFilter.value) {
      case 'low':
        result = result.filter(item => item.defect_rate < 1);
        break;
      case 'medium':
        result = result.filter(item => item.defect_rate >= 1 && item.defect_rate <= 3);
        break;
      case 'high':
        result = result.filter(item => item.defect_rate > 3);
        break;
    }
  }
  
  // 排序
  if (sortBy.value) {
    result = [...result].sort((a, b) => {
      if (sortOrder.value === 'ascending') {
        return a[sortBy.value] > b[sortBy.value] ? 1 : -1;
      } else {
        return a[sortBy.value] < b[sortBy.value] ? 1 : -1;
      }
    });
  }
  
  return result;
});

// 分页数据
const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredData.value.slice(start, end);
});

// 统计信息
const totalInventory = computed(() => {
  return factoryData.value.reduce((sum, item) => sum + item.quantity, 0);
});

const avgDefectRate = computed(() => {
  if (factoryData.value.length === 0) return 0;
  const total = factoryData.value.reduce((sum, item) => sum + item.defect_rate, 0);
  return (total / factoryData.value.length).toFixed(2);
});

const highRiskCount = computed(() => {
  return factoryData.value.filter(item => item.defect_rate > 3).length;
});

const highRiskRate = computed(() => {
  return factoryData.value.length ? 
    ((highRiskCount.value / factoryData.value.length) * 100).toFixed(1) : 0;
});

// 方法
function refreshData() {
  // 真实环境中会从API获取刷新数据
  // 这里简单模拟更新
  factoryData.value = [...factoryDataJson];
  initCategoryChart();
}

function handleSortChange(val) {
  if (val.prop) {
    sortBy.value = val.prop;
    sortOrder.value = val.order;
  } else {
    sortBy.value = '';
    sortOrder.value = '';
  }
}

function handleSizeChange(val) {
  pageSize.value = val;
  currentPage.value = 1;
}

function handleCurrentChange(val) {
  currentPage.value = val;
}

function handleRowClick(row) {
  viewDetail(row);
}

function viewDetail(material) {
  selectedMaterial.value = {
    ...material,
    // 模拟历史数据
    history: generateMockHistory(material)
  };
  detailDialogVisible.value = true;
}

function inspectMaterial(material) {
  // 模拟检验操作，真实环境下打开检验表单或跳转检验页面
  console.log('检验物料:', material.material_code);
}

function openBatchInspectionDialog() {
  // 模拟批量检验操作
  console.log('批量检验');
}

function exportData() {
  // 模拟导出操作
  console.log('导出数据');
}

function getCategoryNameById(categoryId) {
  return getCategoryName(categoryId);
}

function getDefectRateClass(rate) {
  if (rate > 3) return 'high-defect';
  if (rate > 1) return 'medium-defect';
  return 'low-defect';
}

function defectRowClassName({ row }) {
  if (row.defect_rate > 3) return 'high-risk-row';
  if (row.defect_rate > 1) return 'medium-risk-row';
  return '';
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function generateMockHistory(material) {
  // 生成模拟的历史记录
  const count = Math.floor(Math.random() * 3) + 1;
  const history = [];
  
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const pastDate = new Date(now);
    pastDate.setDate(now.getDate() - ((i + 1) * 30));
    
    const sampleSize = Math.floor(Math.random() * 100) + 20;
    const defectCount = Math.floor(sampleSize * (material.defect_rate / 100));
    
    history.push({
      date: pastDate.toISOString(),
      inspector: ['张工', '李工', '王工'][Math.floor(Math.random() * 3)],
      sample_size: sampleSize,
      defect_count: defectCount,
      defect_rate: ((defectCount / sampleSize) * 100).toFixed(2),
      result: ((defectCount / sampleSize) * 100) < 3 ? '合格' : '不合格',
      notes: ''
    });
  }
  
  return history;
}

function initCategoryChart() {
  if (!categoryChartRef.value) return;
  
  // 计算每个类别的缺陷率
  const categoryStats = {};
  materialCategories.forEach(category => {
    categoryStats[category.id] = {
      name: category.name,
      count: 0,
      totalDefectRate: 0
    };
  });
  
  factoryData.value.forEach(item => {
    if (categoryStats[item.category_id]) {
      categoryStats[item.category_id].count++;
      categoryStats[item.category_id].totalDefectRate += item.defect_rate;
    }
  });
  
  const categories = [];
  const avgDefects = [];
  const counts = [];
  
  Object.values(categoryStats).forEach(stat => {
    if (stat.count > 0) {
      categories.push(stat.name);
      avgDefects.push((stat.totalDefectRate / stat.count).toFixed(2));
      counts.push(stat.count);
    }
  });
  
  // 销毁旧实例
  if (categoryChart) {
    categoryChart.dispose();
  }
  
  // 创建图表
  categoryChart = echarts.init(categoryChartRef.value);
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        const defectData = params[0];
        const countData = params[1];
        return `${defectData.name}<br/>
                平均缺陷率: ${defectData.value}%<br/>
                物料数量: ${countData.value}`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    legend: {
      data: ['平均缺陷率', '物料数量']
    },
    xAxis: [
      {
        type: 'category',
        data: categories,
        axisLabel: {
          rotate: 30,
          interval: 0
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '缺陷率(%)',
        position: 'left',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#ff7675'
          }
        },
        axisLabel: {
          formatter: '{value}%'
        }
      },
      {
        type: 'value',
        name: '数量',
        position: 'right',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#74b9ff'
          }
        }
      }
    ],
    series: [
      {
        name: '平均缺陷率',
        type: 'bar',
        data: avgDefects,
        itemStyle: {
          color: '#ff7675'
        }
      },
      {
        name: '物料数量',
        type: 'bar',
        yAxisIndex: 1,
        data: counts,
        itemStyle: {
          color: '#74b9ff'
        }
      }
    ]
  };
  
  categoryChart.setOption(option);
}

// 生命周期钩子
onMounted(() => {
  nextTick(() => {
    initCategoryChart();
    
    // 窗口大小变化时重绘图表
    window.addEventListener('resize', () => {
      categoryChart && categoryChart.resize();
    });
  });
});
</script>

<style scoped>
.factory-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 页面标题与工具栏 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  color: #409EFF;
}

.toolbar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input {
  width: 240px;
}

.filter-select {
  width: 140px;
}

/* 统计卡片 */
.statistics-cards {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 15px;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  font-size: 24px;
  margin-right: 15px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #ecf5ff;
  color: #409EFF;
  display: flex;
  align-items: center;
  justify-content: center;
}

.warning .stat-icon {
  background-color: #fef0f0;
  color: #f56c6c;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-rate {
  font-size: 14px;
  color: #f56c6c;
}

/* 图表卡片 */
.chart-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #606266;
}

.chart-wrapper {
  height: 300px;
  width: 100%;
}

/* 表格卡片 */
.table-card {
  margin-bottom: 20px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 缺陷率样式 */
.high-defect {
  color: #f56c6c;
  font-weight: bold;
}

.medium-defect {
  color: #e6a23c;
}

.low-defect {
  color: #67c23a;
}

.high-risk-row {
  background-color: rgba(245, 108, 108, 0.1) !important;
}

.medium-risk-row {
  background-color: rgba(230, 162, 60, 0.1) !important;
}

/* 物料详情 */
.material-detail {
  padding: 10px;
}

.section-title {
  margin: 20px 0 10px;
  font-size: 16px;
  color: #606266;
  border-left: 4px solid #409EFF;
  padding-left: 10px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .toolbar {
    width: 100%;
  }
  
  .search-input {
    width: 100%;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .chart-wrapper {
    height: 250px;
  }
}
</style> 