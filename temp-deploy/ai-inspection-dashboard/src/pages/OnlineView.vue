<template>
  <div class="online-container">
    <div class="page-header">
      <h2 class="page-title">IQE物料上线质量监测平台</h2>
      <div class="header-actions">
        <el-button type="primary" @click="fetchData" :loading="loading">
          <el-icon><Refresh /></el-icon>刷新数据
        </el-button>
        <el-button type="success" @click="initializeTestData" :disabled="loading">
          <el-icon><Plus /></el-icon>初始化测试数据
        </el-button>
        <el-button type="danger" @click="confirmClearData">
          <el-icon><Delete /></el-icon>清空数据
        </el-button>
        <el-button type="warning">
          <el-icon><Download /></el-icon>导出验证报表
        </el-button>
      </div>
    </div>
    
    <!-- 供应商质量表现卡片 -->
    <el-card class="supplier-performance-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h3>
            <el-icon><Connection /></el-icon>
            供应商质量表现分析
          </h3>
          <el-radio-group v-model="supplierChartType" size="small" @change="renderSupplierPerformanceChart">
            <el-radio-button label="defectRate">不良率</el-radio-button>
            <el-radio-button label="deliveryCount">交付数量</el-radio-button>
            <el-radio-button label="qualityScore">质量评分</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      
      <div class="supplier-chart-container">
        <div ref="supplierPerformanceChartRef" style="height:400px; width:100%;"></div>
        <div v-if="loading" class="chart-loading">
          <el-skeleton animated :rows="8" />
        </div>
      </div>
          
      <div class="supplier-insights">
        <div class="supplier-alert-container" v-if="onlineInsights.highRiskSuppliers.length > 0">
          <el-alert title="高风险供应商预警" type="error" :closable="false" show-icon>
            <template #default>
              <div class="alert-content">
                <p>以下供应商不良率超出预警线 (>5%)：</p>
                <div class="risk-suppliers">
                  <el-tag 
                    v-for="supplier in onlineInsights.highRiskSuppliers" 
                    :key="supplier.name"
                    type="danger"
                    effect="dark"
                    size="large"
                    class="supplier-tag"
                  >
                    {{ supplier.name }} ({{ supplier.defectRate }}%)
                  </el-tag>
                </div>
                <p class="recommendation">
                  <strong>建议：</strong> 安排质量专项会议，对高风险供应商进行审核
                </p>
              </div>
            </template>
          </el-alert>
        </div>
          
        <div class="supplier-metrics">
          <div class="metric-item">
            <div class="metric-label">最优质供应商</div>
            <div class="metric-value">{{ onlineInsights.topSupplier }}</div>
            <div class="metric-subtext">不良率: {{ onlineInsights.topSupplierDefectRate }}%</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">批次数最多</div>
            <div class="metric-value">{{ onlineInsights.mostActiveSupplier }}</div>
            <div class="metric-subtext">{{ onlineInsights.mostActiveSupplierCount }}个批次</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">平均不良率</div>
            <div class="metric-value">{{ onlineInsights.avgSupplierDefectRate }}%</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">供应商总数</div>
            <div class="metric-value">{{ onlineInsights.supplierCount }}</div>
            <div class="metric-subtext">高绩效: {{ onlineInsights.highPerformanceCount }}家</div>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 筛选条件 -->
    <el-card class="filter-card" shadow="hover">
      <div class="filter-container">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="物料编码">
            <el-input v-model="filterForm.materialCode" placeholder="输入物料编码" clearable></el-input>
          </el-form-item>
          <el-form-item label="物料名称">
            <el-input v-model="filterForm.materialName" placeholder="输入物料名称" clearable></el-input>
          </el-form-item>
          <el-form-item label="批次号">
            <el-input v-model="filterForm.batchNo" placeholder="输入批次号" clearable></el-input>
          </el-form-item>
          <el-form-item label="检验状态">
            <el-select v-model="filterForm.status" placeholder="检验状态" clearable>
              <el-option label="全部" value=""></el-option>
              <el-option label="验证通过" value="正常"></el-option>
              <el-option label="风险预警" value="风险"></el-option>
              <el-option label="验证异常" value="异常"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    
    <!-- 物料数据表格 -->
    <el-card class="table-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h3>物料上线质量记录</h3>
          <div class="table-actions">
            <el-input
              v-model="filterForm.quickSearch"
              placeholder="搜索物料编码、批次或供应商"
              prefix-icon="Search"
              clearable
              @input="handleSearch"
              style="width: 300px; margin-right: 10px;"
            ></el-input>
            <el-select v-model="pageSize" style="width: 120px" @change="handleSizeChange">
              <el-option v-for="size in [10, 20, 50, 100]" :key="size" :label="`${size}条/页`" :value="size" />
            </el-select>
          </div>
        </div>
      </template>
      
      <el-table 
        :data="paginatedData" 
        border 
        stripe
        highlight-current-row
        style="width: 100%"
        v-loading="loading"
        @row-click="handleRowClick"
        height="450"
      >
        <el-table-column prop="warehouse" label="仓库" width="80"></el-table-column>
        <el-table-column prop="factory" label="工厂" width="80"></el-table-column>
        <el-table-column prop="materialCode" label="物料编码" width="120" sortable></el-table-column>
        <el-table-column prop="materialName" label="物料名称" width="160"></el-table-column>
        <el-table-column prop="supplier" label="供应商" width="150" sortable></el-table-column>
        <el-table-column prop="batchNo" label="批次" width="120" sortable></el-table-column>
        <el-table-column prop="quantity" label="数量" sortable width="80"></el-table-column>
        <el-table-column label="质量状态" width="100" sortable prop="qualityStatus">
          <template #default="scope">
            <el-tag :type="getQualityType(scope.row.qualityStatus)">{{ scope.row.qualityStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="defectType" label="不良现象" width="160"></el-table-column>
        <el-table-column prop="onlineDate" label="上线日期" width="160" sortable></el-table-column>
        <el-table-column label="操作" fixed="right" width="100">
          <template #default="scope">
            <el-button size="small" type="primary" @click.stop="viewDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 标准分页器 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
        />
      </div>
    </el-card>
    
    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="物料上线详情" width="60%" destroy-on-close>
      <div v-if="selectedMaterial" class="material-detail">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="物料编码">{{ selectedMaterial.materialCode }}</el-descriptions-item>
          <el-descriptions-item label="物料名称">{{ selectedMaterial.materialName }}</el-descriptions-item>
          <el-descriptions-item label="供应商">{{ selectedMaterial.supplier }}</el-descriptions-item>
          <el-descriptions-item label="批次号">{{ selectedMaterial.batchNo }}</el-descriptions-item>
          <el-descriptions-item label="上线日期">{{ selectedMaterial.onlineDate }}</el-descriptions-item>
          <el-descriptions-item label="上线数量">{{ selectedMaterial.quantity }}</el-descriptions-item>
          <el-descriptions-item label="质量状态">
            <el-tag :type="getQualityType(selectedMaterial.qualityStatus)">{{ selectedMaterial.qualityStatus }}</el-tag>
          </el-descriptions-item>
           <el-descriptions-item label="不良现象">{{ selectedMaterial.defectType || '无' }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ selectedMaterial.onlineOperator || '未指定' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { ElMessage, ElNotification, ElMessageBox } from 'element-plus';
import * as echarts from 'echarts/core';
import { LineChart, BarChart, PieChart, ScatterChart, HeatmapChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import UnifiedDataService from '../services/UnifiedDataService';
import { useInventoryAnalysis } from '../composables/useInventoryAnalysis';
import { safeInitChart, setupChartResize, safeDisposeChart } from '../utils/chartHelper.js';
import SystemDataUpdater from '../services/SystemDataUpdater.js';
import { MATERIAL_DEFECT_MAP } from '../services/SystemDataUpdater.js';
import {
  Refresh, Plus, Delete, Download, View, Warning, Search, Setting, Edit,
  CircleCheck, CircleClose, InfoFilled, Histogram, TrendCharts, Connection,
  StarFilled, WarningFilled, CircleCloseFilled, CaretTop, CaretBottom, Goods,
  GoodsFilled, Odometer, DArrowLeft, DArrowRight, ArrowLeft, ArrowRight
} from '@element-plus/icons-vue';
import type { InventoryItem } from '../types/models';

// 注册echarts组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  HeatmapChart,
  CanvasRenderer
]);

const onlineData = ref<InventoryItem[]>([]);
const loading = ref(true);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const jumpPage = ref('');
const detailDialogVisible = ref(false);
const selectedMaterial = ref<InventoryItem | null>(null);
const qualityChartRef = ref(null);
let qualityChart = null;

// 图表引用
const supplierPerformanceChartRef = ref(null);
let supplierChart = null;

// 筛选表单
const filterForm = ref({
  materialCode: '',
  materialName: '',
  batchNo: '',
  status: '',
  quickSearch: ''
});

// 新增变量
const supplierChartType = ref('defectRate');
const supplierChartLoaded = ref(false);
const defectFilterMaterial = ref('');
const defectFilterSupplier = ref('');
const materialTypes = ref([]);
const distinctSuppliers = ref([]);

// 供应商数据
const { supplierChartData, onlineInsights } = useInventoryAnalysis(onlineData);

const paginatedData = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  return onlineData.value.slice(startIndex, startIndex + pageSize.value);
});

// 获取要显示的页码
const getPageNumbers = () => {
  const maxVisiblePages = 7;
  const result = [];

  if (total.value <= maxVisiblePages) {
    // 总页数少于最大可见页数，显示所有页码
    for (let i = 1; i <= total.value; i++) {
      result.push(i);
    }
  } else {
    // 总页数大于最大可见页数，需要省略部分页码
    if (currentPage.value <= 4) {
      // 当前页在前部分
      for (let i = 1; i <= 5; i++) {
        result.push(i);
      }
    } else if (currentPage.value >= total.value - 3) {
      // 当前页在后部分
      for (let i = total.value - 4; i <= total.value; i++) {
        result.push(i);
      }
    } else {
      // 当前页在中间
      result.push(1);
      for (let i = currentPage.value - 2; i <= currentPage.value + 2; i++) {
        result.push(i);
      }
    }
  }

  return result;
};

// 处理页面跳转
const handleJumpPage = () => {
  if (!jumpPage.value) return;
  
  const page = parseInt(jumpPage.value);
  if (isNaN(page) || page < 1 || page > total.value) {
    ElMessage.warning(`请输入1-${total.value}之间的页码`);
    return;
  }
  
  currentPage.value = page;
  jumpPage.value = '';
};

// 渲染供应商表现图表
const renderSupplierPerformanceChart = () => {
  if (loading.value || !supplierPerformanceChartRef.value) return;

  let chartData;
  let chartTitle;

  switch (supplierChartType.value) {
    case 'deliveryCount':
      chartData = onlineInsights.value.deliveryCounts;
      chartTitle = '供应商交付数量';
      break;
    case 'qualityScore':
      chartData = onlineInsights.value.qualityScores;
      chartTitle = '供应商平均质量评分';
      break;
    default: // defectRate
      chartData = onlineInsights.value.defectRates;
      chartTitle = '供应商不良率 (%)';
      break;
  }

  const option = {
    title: {
      text: chartTitle,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: onlineInsights.value.supplierNames,
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: chartTitle.includes('%') ? '%' : (chartTitle.includes('评分') ? '分数' : '数量'),
    },
    series: [{
      name: chartTitle,
      type: 'bar',
      data: chartData,
      barWidth: '60%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#83bff6' },
          { offset: 0.5, color: '#188df0' },
          { offset: 1, color: '#188df0' }
        ])
      },
    }],
    toolbox: {
      feature: {
        saveAsImage: {},
        dataView: { readOnly: false },
        magicType: { type: ['line', 'bar'] },
        restore: {}
      }
    },
  };

  if (!supplierChart) {
    supplierChart = safeInitChart(supplierPerformanceChartRef.value);
  }
  supplierChart.setOption(option, true);
};

// 初始化测试数据
const initializeTestData = async () => {
  loading.value = true;
  await SystemDataUpdater.initOnlineData(300);
  await fetchData();
};

// 确认清空数据
const confirmClearData = () => {
  ElMessageBox.confirm('确定要清空所有上线数据吗？此操作不可恢复！', '警告', {
    confirmButtonText: '确定',
      cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    clearData();
  }).catch(() => {
    ElMessage.info('已取消清空操作');
  });
};

// 清空数据
const clearData = async () => {
  try {
    loading.value = true;
    
    // 创建SystemDataUpdater实例
    const dataUpdater = new SystemDataUpdater();
    
    // 清空上线数据
    const result = await dataUpdater.clearOnlineData();
    
    if (result && result.success) {
      ElMessage.success('数据已清空');
      
      // 刷新页面数据
      fetchData();
      
      // 确保DOM已经渲染完成
      await nextTick();
      
      // 延迟渲染图表，确保数据已加载和DOM已更新
      setTimeout(async () => {
        await renderSupplierPerformanceChart();
      }, 500);
    } else {
      ElMessage.error('清空数据失败: ' + (result?.message || '未知错误'));
    }
  } catch (error) {
    console.error('清空数据失败:', error);
    ElMessage.error('清空数据失败: ' + (error.message || '未知错误'));
  } finally {
    loading.value = false;
  }
};

// 刷新数据
const fetchData = async () => {
  try {
    loading.value = true;
    
    // 获取上线数据
    const result = await UnifiedDataService.getOnlineData();
    
    if (result && result.success) {
      onlineData.value = result.data || [];
      total.value = onlineData.value.length;
      
      // 收集供应商列表
      const suppliers = new Set();
      onlineData.value.forEach(item => {
        if (item.supplier) {
          suppliers.add(item.supplier);
        }
      });
      distinctSuppliers.value = Array.from(suppliers);
      
      // 收集物料类型
      const types = new Set();
      onlineData.value.forEach(item => {
        if (item.materialType) {
          types.add(item.materialType);
        }
      });
      materialTypes.value = Array.from(types);
      
      ElMessage.success('数据已刷新');
    } else {
      ElMessage.error('获取数据失败: ' + (result?.message || '未知错误'));
    }
  } catch (error) {
    console.error('刷新数据失败:', error);
    ElMessage.error('刷新数据失败: ' + (error.message || '未知错误'));
  } finally {
    loading.value = false;
  }
};

// 查看详情
const viewDetail = (item: InventoryItem) => {
  selectedMaterial.value = item;
  detailDialogVisible.value = true;
  
  // 在对话框打开后渲染图表
  nextTick(() => {
    renderQualityChart();
  });
};

// 渲染质量图表
const renderQualityChart = async () => {
  if (!selectedMaterial.value) return;
  
  // 确保DOM元素存在
  await nextTick();
  const chartDom = qualityChartRef.value;
  if (!chartDom) {
    console.error('找不到qualityChartRef DOM元素');
    return;
  }
  
  // 销毁旧实例
  if (qualityChart) {
    safeDisposeChart(qualityChart);
    qualityChart = null;
  }
  
  // 模拟历史数据
  const dates = [];
  const qualityData = [];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    dates.push(`${date.getMonth() + 1}/${date.getDate()}`);
    
    // 生成随机质量数据，但与当前状态相关
    const baseQuality = selectedMaterial.value.status === '正常' ? 95 : 
                       (selectedMaterial.value.status === '风险' ? 85 : 75);
    const randomVariation = Math.random() * 10 - 5; // -5 to +5
    qualityData.push(Math.min(100, Math.max(0, baseQuality + randomVariation)));
  }
  
  const option = {
        tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: {
      type: 'value',
      name: '质量评分',
      min: 70,
      max: 100
    },
    series: [{
      data: qualityData,
      type: 'line',
      smooth: true,
      markLine: {
            data: [
          { yAxis: 90, lineStyle: { color: '#67C23A' }, label: { formatter: '优良线' } },
          { yAxis: 80, lineStyle: { color: '#E6A23C' }, label: { formatter: '警戒线' } }
        ]
      }
    }]
  };
  
  try {
    qualityChart = await safeInitChart(chartDom, option);
    if (qualityChart) {
      setupChartResize(qualityChart, chartDom);
    }
  } catch (error) {
    console.error('渲染质量图表出错:', error);
  }
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
};

// 重置筛选条件
const resetFilter = () => {
  filterForm.value = {
    materialCode: '',
    materialName: '',
    batchNo: '',
    status: '',
    quickSearch: ''
  };
  currentPage.value = 1;
};

// 处理表格行点击
const handleRowClick = (row) => {
  viewDetail(row);
};

// 处理分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size;
  // 重新计算总页数
  total.value = onlineData.value.length;
  // 如果当前页超出范围，重置为第一页
  if (currentPage.value > total.value) {
    currentPage.value = 1;
  }
};

// 获取状态类型
const getStatusType = (status: string | undefined) => {
  if (!status) return 'info';
  
  const statusMap = {
    '正常': 'success',
    '风险': 'warning',
    '异常': 'danger',
    '不良': 'danger'
  };
  
  return statusMap[status] || 'info';
};

// 获取质量状态类型
const getQualityType = (status: string | undefined) => {
  if (!status) return 'info';
  
  if (status === '合格') return 'success';
  if (status === '不合格') return 'danger';
  
  return status === '正常' ? 'success' : 'danger';
};

// 生命周期钩子
onMounted(async () => {
  // 获取数据
  await fetchData();
  
  // 确保DOM已经渲染完成
  await nextTick();
  
  // 延迟渲染图表，确保数据已加载和DOM已更新
  setTimeout(async () => {
    await renderSupplierPerformanceChart();
  }, 500);
});

watch([() => onlineInsights.value, supplierChartType], () => {
  renderSupplierPerformanceChart();
});
</script>

<style scoped>
.online-container {
  padding: 20px;
  background-color: #f0f2f5;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.statistics-cards {
  margin-bottom: 20px;
}

.stat-card {
  height: 100%;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  font-size: 40px;
  color: #409EFF;
  margin-right: 15px;
}

.test-card .stat-icon {
  color: #409EFF;
}

.primary .stat-icon {
  color: #67C23A;
}

.success .stat-icon {
  color: #67C23A;
}

.warning .stat-icon {
  color: #E6A23C;
}

.danger .stat-icon,
.urgent-card .stat-icon {
  color: #F56C6C;
}

.pending-card .stat-icon {
  color: #909399;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 16px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #303133;
}

.stat-subtext {
  font-size: 14px;
  color: #606266;
}

.success-text {
  color: #67C23A;
  font-weight: bold;
}

.warning-text {
  color: #E6A23C;
  font-weight: bold;
}

.danger-text {
  color: #F56C6C;
  font-weight: bold;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 0;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-header :deep(.el-icon) {
  margin-right: 5px;
}

.chart-container {
  height: 350px;
  width: 100%;
}

.chart-placeholder {
  padding: 15px;
}

.chart-insights {
  padding: 15px;
  border-top: 1px solid #EBEEF5;
  margin-top: 10px;
}

.insight-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.insight-item :deep(.el-icon) {
  margin-right: 8px;
  font-size: 16px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-container {
  padding: 10px 0;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 20px;
  padding: 0 20px;
}

.supplier-performance-card {
  margin-bottom: 20px;
}

.supplier-chart-container {
  position: relative;
  min-height: 400px;
}

.chart-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 20px;
}

.supplier-insights {
  padding: 20px;
  border-top: 1px solid #EBEEF5;
}

.supplier-alert-container {
  margin-bottom: 20px;
}

.alert-content {
  margin-top: 10px;
}

.risk-suppliers {
  margin: 10px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.supplier-tag {
  font-size: 14px;
}

.recommendation {
  margin-top: 10px;
  font-style: italic;
}

.supplier-metrics {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: space-between;
}

.metric-item {
  flex: 1;
  min-width: 180px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  text-align: center;
}

.metric-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.metric-subtext {
  font-size: 12px;
  color: #909399;
}

.defect-analysis-card {
  margin-bottom: 20px;
}

.filter-actions {
  display: flex;
  gap: 10px;
}

.defect-correlation-container {
  margin-bottom: 20px;
}

.defect-chart {
  height: 300px;
  margin-bottom: 15px;
}

.pattern-insights {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #409EFF;
}

.insight-title {
  font-weight: bold;
  margin-top: 0;
  margin-bottom: 10px;
}

.insight-list {
  margin: 0;
  padding-left: 20px;
}

.insight-list li {
  margin-bottom: 5px;
}

.supplier-defect-correlation {
  margin-top: 30px;
}

.correlation-chart {
  height: 400px;
  margin-top: 15px;
}

.positive {
  color: #67C23A;
}

.negative {
  color: #F56C6C;
}

/* 表格样式定制 */
:deep(.el-table .warning-row) {
  background-color: #fdf6ec;
}

:deep(.el-table .danger-row) {
  background-color: #fef0f0;
}

:deep(.el-tag--success) {
  background-color: #f0f9eb;
}

:deep(.el-tag--warning) {
  background-color: #fdf6ec;
}

:deep(.el-tag--danger) {
  background-color: #fef0f0;
}

/* 适配手机端 */
@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .card-header h3 {
    margin-bottom: 10px;
  }
  
  .supplier-metrics {
    flex-direction: column;
    gap: 10px;
  }
  
  .metric-item {
    min-width: auto;
  }
  
  .filter-form {
    flex-direction: column;
  }
}

/* 不良物料统计卡片样式 */
.top-defects-card {
  margin-bottom: 20px;
}

.top-defects-container {
  padding: 10px 0;
}

.top-list-header {
  margin-bottom: 15px;
}

.header-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.header-description {
  font-size: 12px;
  color: #909399;
}

.top-list-insights {
  margin-top: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.top-list-insights .insight-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.danger-text {
  color: #F56C6C;
  font-weight: bold;
}

.warning-text {
  color: #E6A23C;
  font-weight: bold;
}

.success-text {
  color: #67C23A;
  font-weight: bold;
}
</style> 
 
 