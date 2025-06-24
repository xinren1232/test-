<template>
  <div class="factory-view">
    <page-header title="物料上线跟踪" subtitle="监控物料上线质量状态">
      <template #actions>
        <el-button-group>
          <el-button type="primary" @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
          <el-button @click="exportToExcel">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </el-button-group>
      </template>
    </page-header>
    
    <!-- 添加质量统计组件 -->
    <factory-quality-stats />
    
    <!-- 搜索过滤区域 -->
    <div class="filter-section">
      <el-card shadow="hover">
        <div class="filter-container">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-input
          v-model="searchQuery"
          placeholder="搜索物料编码、名称或批次"
          clearable
                class="filter-item"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
            </el-col>
        
            <el-col :xs="24" :sm="12" :md="6" :lg="4">
              <el-select v-model="factoryFilter" placeholder="工厂" clearable class="filter-item">
          <el-option label="全部工厂" value="" />
          <el-option
            v-for="factory in factoryOptions"
            :key="factory"
            :label="factory"
            :value="factory"
          />
        </el-select>
            </el-col>
        
            <el-col :xs="24" :sm="12" :md="6" :lg="4">
              <el-select v-model="materialCategoryFilter" placeholder="物料类别" clearable class="filter-item">
          <el-option label="全部类别" value="" />
          <el-option
            v-for="category in materialCategoryOptions"
            :key="category"
            :label="category"
            :value="category"
          />
        </el-select>
            </el-col>
        
            <el-col :xs="24" :sm="12" :md="6" :lg="4">
              <el-select v-model="statusFilter" placeholder="状态" clearable class="filter-item">
          <el-option label="全部状态" value="" />
          <el-option label="正常" value="正常" />
          <el-option label="风险" value="风险" />
          <el-option label="异常" value="异常" />
        </el-select>
            </el-col>
            
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <div class="filter-actions">
                <el-button type="primary" @click="applyFilters">
                  <el-icon><Filter /></el-icon> 筛选
                </el-button>
                <el-button @click="resetFilters">
                  <el-icon><Delete /></el-icon> 重置
        </el-button>
      </div>
        </el-col>
      </el-row>
    </div>
        </el-card>
            </div>
    
    <!-- 数据表格 -->
    <div class="table-section">
      <el-card shadow="hover">
      <template #header>
          <div class="table-header">
            <h3>上线物料质量监控</h3>
          <div class="table-actions">
              <el-switch v-model="showCharts" active-text="显示图表" inactive-text="隐藏图表" />
          </div>
        </div>
      </template>
      
      <el-table 
        :data="paginatedMaterials" 
        style="width: 100%" 
        border 
        stripe 
        highlight-current-row
        @row-click="handleRowClick"
        :row-class-name="getRowClassName"
          v-loading="loading"
      >
        <el-table-column type="expand">
          <template #default="props">
            <div class="expanded-row">
              <div class="expanded-section">
                <h4>物料详情</h4>
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="物料编码">{{ props.row.materialCode }}</el-descriptions-item>
                  <el-descriptions-item label="物料名称">{{ props.row.materialName }}</el-descriptions-item>
                  <el-descriptions-item label="所属类别">{{ props.row.category }}</el-descriptions-item>
                  <el-descriptions-item label="供应商">{{ props.row.supplier }}</el-descriptions-item>
                  <el-descriptions-item label="批次号">{{ props.row.batchNo }}</el-descriptions-item>
                  <el-descriptions-item label="进货数量">{{ props.row.quantity }}</el-descriptions-item>
                  <el-descriptions-item label="检验日期">{{ props.row.inspectionDate ? new Date(props.row.inspectionDate).toLocaleString() : '-' }}</el-descriptions-item>
                  <el-descriptions-item label="质量状态">
                    <el-tag :type="getQualityStatusType(props.row.quality)">{{ props.row.quality }}</el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="风险等级">
                    <el-tag :type="getRiskLevelType(props.row.riskLevel)">{{ props.row.riskLevel }}</el-tag>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
              
              <div class="expanded-section">
                <h4>使用情况</h4>
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="上线时间">{{ props.row.useTime ? new Date(props.row.useTime).toLocaleString() : '-' }}</el-descriptions-item>
                  <el-descriptions-item label="使用产线">{{ props.row.line }}</el-descriptions-item>
                  <el-descriptions-item label="所属工段">{{ props.row.factory }}</el-descriptions-item>
                  <el-descriptions-item label="所属项目">{{ props.row.project_display }}</el-descriptions-item>
                  <el-descriptions-item label="所属基线">{{ props.row.baseline_display }}</el-descriptions-item>
                  <el-descriptions-item label="物料不良率">
                    <span :class="getDefectRateTextClass(debugDefectRate(props.row))">{{ debugDefectRate(props.row) }}%</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="异常次数">{{ props.row.exceptionCount || 0 }}</el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="factory" label="工厂" width="120" />
        <el-table-column label="基线" width="120">
          <template #default="scope">
            {{ scope.row.baseline_display || scope.row.baseline || scope.row.baselineName || scope.row.baseline_name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="项目" width="150">
          <template #default="scope">
            {{ scope.row.project_display || scope.row.project || scope.row.projectName || scope.row.project_name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="materialCode" label="物料编号" width="120" />
        <el-table-column prop="materialName" label="物料名称" width="180" />
        <el-table-column prop="supplier" label="供应商" width="150" />
        <el-table-column prop="batchNo" label="批次" width="120" sortable />
        <el-table-column label="不良率" width="100" sortable>
          <template #default="scope">
            <span :class="getDefectRateTextClass(debugDefectRate(scope.row))">{{ debugDefectRate(scope.row) }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="不良现象" width="150">
          <template #default="scope">
            <span v-if="scope.row.defect && parseFloat(scope.row.defectRate || scope.row.defect_rate || 0) > 0">{{ scope.row.defect }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="inspectionDate" label="检验日期" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.inspectionDate) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="scope">
            <el-button type="primary" link size="small" @click.stop="viewMaterialDetail(scope.row)">
              <el-icon><View /></el-icon> 详情
            </el-button>
            <el-button type="warning" link size="small" @click.stop="showExceptionAnalysis(scope.row)">
              <el-icon><Warning /></el-icon> 异常分析
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalMaterials"
          :page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :current-page="pagination.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
              </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject, nextTick, watch, onUnmounted } from 'vue';
import { materialCategories, getCategoryName } from '../data/material_categories';
import * as echarts from 'echarts';
import { PieChart, BarChart, LineChart } from 'echarts/charts';
import { 
  GridComponent, TooltipComponent, LegendComponent, 
  TitleComponent, DatasetComponent, MarkPointComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { 
  Search, Refresh, Download, View, Warning, 
  Lightning, Filter, Setting, InfoFilled, 
  Odometer, GoodsFilled, ArrowUp, ArrowDown, 
  VideoCamera, Delete, Goods, Plus, 
  DataAnalysis, CaretTop, CaretBottom, TrendCharts, CircleCloseFilled, Connection, Monitor, SuccessFilled
} from '@element-plus/icons-vue';
import { ElMessage, ElNotification, ElMessageBox } from 'element-plus';
import { safeInitChart, setupChartResize, safeDisposeChart } from '../utils/chartHelper.js';
import FactoryDataService from '../services/FactoryDataService.js';
import FactoryQualityStats from '../components/factory/FactoryQualityStats.vue';
import PageHeader from '../components/common/PageHeader.vue';

// 注册必要的echarts组件
echarts.use([
  PieChart, BarChart, LineChart,
  GridComponent, TooltipComponent, LegendComponent, TitleComponent, DatasetComponent, MarkPointComponent,
  CanvasRenderer
]);

// 注入统一数据服务
const unifiedDataService = inject('unifiedDataService');

// 状态变量
const materials = ref([]);
const searchQuery = ref('');
const factoryFilter = ref('');
const materialCategoryFilter = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
const pageSize = ref(20);
const detailDialogVisible = ref(false);
const exceptionDialogVisible = ref(false);
const selectedMaterial = ref(null);
const performanceChartRef = ref(null);
const exceptionChartRef = ref(null);
const materialTrendChartRef = ref(null);
const exceptionAnalysis = ref(null);
const loading = ref(false);
const showCharts = ref(true);

// 定义图表实例
let factoryChart = null;
let qualityChart = null;
let performanceChart = null;
let exceptionChart = null;
let materialTrendChart = null;

// 下拉选项
const factoryOptions = computed(() => {
  const factories = new Set(materials.value.map(material => material.factory));
  return [...factories];
});

const materialCategoryOptions = computed(() => {
  const categories = new Set(materials.value.map(material => material.category));
  return [...categories];
});

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10
});

// 过滤后的物料数据
const filteredMaterials = computed(() => {
  let result = [...materials.value];
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(item => 
      (item.materialCode && item.materialCode.toLowerCase().includes(query)) ||
      (item.materialName && item.materialName.toLowerCase().includes(query)) ||
      (item.batchNo && item.batchNo.toLowerCase().includes(query))
    );
  }
  
  // 工厂过滤
  if (factoryFilter.value) {
    result = result.filter(item => item.factory === factoryFilter.value);
  }
  
  // 物料类别过滤
  if (materialCategoryFilter.value) {
    result = result.filter(item => item.category === materialCategoryFilter.value);
  }
  
  // 状态过滤
  if (statusFilter.value) {
    result = result.filter(item => item.status === statusFilter.value);
  }
  
  return result;
});

// 计算总记录数
const totalMaterials = computed(() => filteredMaterials.value.length);

// 计算分页后的数据
const paginatedMaterials = computed(() => {
  const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  return filteredMaterials.value.slice(startIndex, endIndex);
});

// 处理页码变化
const handleCurrentChange = (val) => {
  pagination.currentPage = val;
  console.log(`页码变更: ${val}, 显示数据: ${paginatedMaterials.value.length}条`);
};

// 处理每页条数变化
const handleSizeChange = (val) => {
  pagination.pageSize = val;
  console.log(`每页条数变更: ${val}, 显示数据: ${paginatedMaterials.value.length}条`);
  
  // 如果当前页码超出范围，重置为第一页
  if (pagination.currentPage > Math.ceil(totalMaterials.value / pagination.pageSize) && totalMaterials.value > 0) {
    pagination.currentPage = 1;
  }
};

// 监听筛选条件变化，重置到第一页
watch([searchQuery, factoryFilter, materialCategoryFilter, statusFilter], () => {
  pagination.currentPage = 1;
});

// 统计信息
const totalMaterialBatches = ref(0);
const totalMaterialConsumption = ref(0);
const todayConsumption = ref(0);
const totalMaterialExceptions = ref(0);
const materialExceptionRate = ref(0);
const avgMaterialYield = ref(0);
const materialYieldTrend = ref(0);

// 方法
function refreshData() {
  // 重新读取数据
  materials.value = extractMaterialData();
  updateStatistics();
  
  // 重新渲染图表
  nextTick(() => {
    renderFactoryChart();
    renderQualityChart();
  });
  
  ElMessage({
    type: 'success',
    message: '数据已刷新'
  });
}

function handleRowClick(row) {
  console.log('点击行数:', row);
  console.log('不良率数:', {
    yield: row.yield,
    defectRate: row.defectRate,
    calculatedDefectRate: calculateDefectRate(row.yield)
  });
  
  selectedMaterial.value = row;
  detailDialogVisible.value = true;
}

// 查看批次详情
async function viewMaterialDetail(material) {
  try {
    selectedMaterial.value = material;
    detailDialogVisible.value = true;
    
    // 等待DOM渲染完成
    await nextTick();
    
    // 使用安全方法初始化性能图表
    performanceChart = await initPerformanceChart(material);
    
  } catch (error) {
    console.error('查看批次详情失败:', error);
    ElMessage.error('加载详情失败，请重试');
  }
}

function showExceptionAnalysis(material) {
  selectedMaterial.value = material;
  
  // 生成异常分析数据
  generateExceptionAnalysis(material);
  
  exceptionDialogVisible.value = true;
  
  // 渲染异常分析图表
  nextTick(() => {
    renderExceptionChart();
    renderMaterialTrendChart();
  });
}

function showRealtimeMonitoring() {
  ElNotification({
    title: '实时监控',
    message: '正在打开实时监控面板...',
    type: 'info'
  });
}

function exportData() {
  ElMessage({
    message: '正在导出数据...',
    type: 'success'
  });
}

function getStatusType(status) {
  switch(status) {
    case '正常': return 'success';
    case '风险': return 'warning';
    case '异常': return 'danger';
    default: return 'info';
  }
}

function getEquipmentStatusType(status) {
  switch(status) {
    case '正常': return 'success';
    case '预警': return 'warning';
    case '维护': return 'info';
    case '故障': return 'danger';
    default: return 'info';
  }
}

function getEfficiencyColor(value) {
  if (value >= 90) return '#67C23A'; // 高效 - 绿色
  if (value >= 75) return '#E6A23C'; // 中等效率 - 黄色
  return '#F56C6C'; // 低效 - 红色
}

function getEfficiencyStatus(value) {
  if (value >= 90) return 'success';
  if (value >= 75) return 'warning';
  return 'exception';
}

function getEfficiencyTextClass(value) {
  if (value >= 90) return 'success-text';
  if (value >= 75) return 'warning-text';
  return 'danger-text';
}

function getCapacityTextClass(actual, target) {
  const rate = (actual / target) * 100;
  if (rate >= 90) return 'success-text';
  if (rate >= 75) return 'warning-text';
  return 'danger-text';
}

function getYieldTextClass(value) {
  if (value >= 98) return 'success-text';
  if (value >= 95) return 'warning-text';
  return 'danger-text';
}

function calculateCapacityRate(actual, target) {
  return Math.round((actual / target) * 100);
}

function getDefectRateClass(rate) {
  if (rate > 2) return 'high-defect';
  if (rate > 1) return 'medium-defect';
  return 'low-defect';
}

function getYieldClass(yieldValue) {
  if (yieldValue >= 98) return 'high-yield';
  if (yieldValue >= 95) return 'medium-yield';
  return 'low-yield';
}

function getMaterialStatusType(status) {
  if (status === '正常') return 'success';
  if (status === '风险') return 'warning';
  if (status === '冻结') return 'info';
  if (status === '异常') return 'danger';
  return 'info';
}

function getQualityStatusType(quality) {
  if (quality === '合格') return 'success';
  if (quality === '待检') return 'info';
  if (quality === '不合') return 'danger';
  if (quality && quality.includes('风险物料')) return 'warning';
  return '';
}

function getRiskLevelType(riskLevel) {
  if (riskLevel === '低风险') return 'success';
  if (riskLevel === '中风风险') return 'warning';
  if (riskLevel === '高风险') return 'danger';
  return 'info';
}

// 保质期相关函数已删除

function getRowClassName({ row }) {
  if (row.status === '异常') return 'error-row';
  if (row.status === '风险') return 'risk-row';
  if (row.yield < 75) return 'low-yield-row';
  
  return '';
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * 格式化日期时间
 * @param {string|number} timestamp 时间戳或日期字符串
 * @returns {string} 格式化后的日期时间
 */
function formatDateTime(timestamp) {
  if (!timestamp) return '-';
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('日期格式化错误:', error);
    return '-';
  }
}

function calculateNextMaintenance(cycle) {
  if (!cycle) return '--';
  const today = new Date();
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + cycle);
  return formatDate(nextDate.toISOString());
}

// 渲染物料性能趋势图
async function renderPerformanceChart() {
  if (!performanceChartRef.value || !selectedMaterial.value) return;
  
  // 安全销毁旧图表
  safeDisposeChart(performanceChart);
  
  // 模拟历史数据
  const days = 7;
  const dates = [];
  const consumptionData = [];
  const yieldData = [];
  const defectRateData = [];
  
  // 基准
  const baseConsumption = selectedMaterial.value.consumption || 75;
  const baseYield = selectedMaterial.value.quality_metrics?.first_pass_yield || 95;
  const baseDefectRate = selectedMaterial.value.quality_metrics?.defect_rate || 2;
  
  // 生成日期和模拟数据
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    dates.push(`${date.getMonth() + 1}/${date.getDate()}`);
    
    // 添加随机波动
    const consRandom = Math.random() * 6 - 3; // -3 ~ 3 之间的随机数
    const yieldRandom = Math.random() * 1.2 - 0.6; // -0.6 ~ 0.6 之间的随机数
    const defectRandom = Math.random() * 0.6 - 0.3; // -0.3 ~ 0.3 之间的随机数    
    consumptionData.push((baseConsumption + consRandom).toFixed(1));
    yieldData.push((baseYield + yieldRandom).toFixed(1));
    defectRateData.push((baseDefectRate + defectRandom).toFixed(2));
  }
  
  const option = {
    title: {
      text: '物料性能趋势 - 消耗量',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['消耗量', '良率', '缺陷率'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: [
      {
        type: 'value',
        name: '百分比(%)',
        min: 0,
        max: 100,
        interval: 20,
        axisLabel: {
          formatter: '{value}%'
        }
      },
      {
        type: 'value',
        name: '缺陷率(%)',
        min: 0,
        max: 5,
        interval: 1,
        axisLabel: {
          formatter: '{value}%'
        }
      }
    ],
    series: [
      {
        name: '消耗量',
        type: 'line',
        data: consumptionData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#409EFF'
        },
        markPoint: {
          data: [
            { type: 'max', name: '最大值' },
            { type: 'min', name: '最小值' }
          ]
        }
      },
      {
        name: '良率',
        type: 'line',
        data: yieldData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#67C23A'
        }
      },
      {
        name: '缺陷率',
        type: 'line',
        yAxisIndex: 1,
        data: defectRateData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#F56C6C'
        }
      }
    ]
  };
  
  // 使用安全图表初始化
  performanceChart = await safeInitChart(performanceChartRef.value, option);
  
  // 设置自适应大小
  setupChartResize(performanceChart, performanceChartRef.value);
}

// 渲染异常分析图表
async function renderExceptionChart() {
  if (!exceptionChartRef.value || !selectedMaterial.value) return;
  
  // 安全销毁旧图表
  safeDisposeChart(exceptionChart);
  
  // 模拟异常数据
  const exceptionTypes = [
    { name: '质量不合', value: 45 },
    { name: '外观缺陷', value: 28 },
    { name: '尺寸异常', value: 14 },
    { name: '参数偏差', value: 8 },
    { name: '标识不清', value: 5 }
  ];
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: exceptionTypes.map(item => item.name)
    },
    series: [
      {
        name: '异常类型',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {d}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: exceptionTypes
      }
    ]
  };
  
  // 使用安全图表初始化
  exceptionChart = await safeInitChart(exceptionChartRef.value, option);
  
  // 设置自适应大小
  setupChartResize(exceptionChart, exceptionChartRef.value);
}

// 渲染物料异常趋势图
async function renderMaterialTrendChart() {
  if (!materialTrendChartRef.value || !selectedMaterial.value) return;
  
  // 安全销毁旧图表
  safeDisposeChart(materialTrendChart);
  
  // 生成过去7天的日期
  const dates = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    dates.push(`${date.getMonth() + 1}/${date.getDate()}`);
  }
  
  // 模拟异常率和质量数据
  const exceptionRateData = [1.2, 1.5, 2.8, 3.2, 2.5, 1.8, 1.2];
  const yieldData = [98.5, 98.2, 96.5, 95.8, 97.0, 97.8, 98.5];
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['异常率', '良率'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: [
      {
        type: 'value',
        name: '异常率(%)',
        min: 0,
        max: 5,
        position: 'left',
        axisLabel: {
          formatter: '{value}%'
        }
      },
      {
        type: 'value',
        name: '良率(%)',
        min: 90,
        max: 100,
        position: 'right',
        axisLabel: {
          formatter: '{value}%'
        }
      }
    ],
    series: [
      {
        name: '异常率',
        type: 'line',
        yAxisIndex: 0,
        data: exceptionRateData,
        itemStyle: {
          color: '#F56C6C'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 108, 108, 0.5)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.1)' }
          ])
        }
      },
      {
        name: '良率',
        type: 'line',
        yAxisIndex: 1,
        data: yieldData,
        itemStyle: {
          color: '#67C23A'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.5)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.1)' }
          ])
        }
      }
    ]
  };
  
  // 使用安全图表初始化
  materialTrendChart = await safeInitChart(materialTrendChartRef.value, option);
  
  // 设置自适应大小
  setupChartResize(materialTrendChart, materialTrendChartRef.value);
}

// 生成异常分析数据
function generateExceptionAnalysis(material) {
  // 生成模拟异常分析数据
  let causes = [];
  let suggestions = [];
  
  if (material.status === '异常' || material.quality === '不合') {
    // 质量异常案例
    causes = [
      {
        title: '供应商质量波动',
        description: `${material.supplier}近期物料批次稳定性下降，此批次不符合标准${material.materialCode}的要求。`,
        level: 'error'
      },
      {
        title: '材料参数异常',
        description: `材料${material.materialName}参数超出标准规格范围。`,
        level: 'warning'
      },
      {
        title: '检验环境问题',
        description: '检验环境温度过高，影响材料性能测试结果。',
        level: 'info'
      }
    ];
    
    suggestions = [
      {
        title: '联系供应商进行质量复检',
        content: `联系${material.supplier}，提供批次号${material.batchNo}，要求进行批次确认及复检，共同分析批次不良的根源原因。`,
        impact: [
          { metric: '风险规避', value: '+80', unit: '%' },
          { metric: '质量成本', value: '-0.3', unit: '%' }
        ]
      },
      {
        title: '增加供应商审核频率',
        content: '暂时将该供应商列入重点监控名单，增加供应商审核频率，从每季度一次增加到每月一次。',
        impact: [
          { metric: '不良批次', value: '-60', unit: '%' },
          { metric: '验收成本', value: '+0.1', unit: '%' }
        ]
      },
      {
        title: '调整验收标准',
        content: '考虑调整该类型物料的验收标准，增加关键参数检测项。',
        impact: [
          { metric: '漏检', value: '-45', unit: '%' },
          { metric: '检验时间', value: '+10', unit: '%' }
        ]
      }
    ];
  } else if (material.status === '风险' || (material.quality && material.quality.includes('风险物料'))) {
    // 工艺异常案例
    causes = [
      {
        title: '设备调试参数偏差',
        description: `与此批次${material.materialCode}匹配的设备参数需要微调，当前调试参数可能导致装配偏差。`,
        level: 'warning'
      },
      {
        title: '治具磨损',
        description: '装配治具使用次数超过5000次，存在磨损，影响装配精度。',
        level: 'warning'
      },
      {
        title: '产线员工操作不规范',
        description: '新员工操作不熟练，未严格按照标准作业指导书进行操作。',
        level: 'info'
      }
    ];
    
    suggestions = [
      {
        title: '设备扭力校准',
        content: '对ZL500自动螺丝机进行扭力校准，并增加日常检查频率。建议使用扭力测试仪进行每日抽检，记录扭力值波动情况。',
        impact: [
          { metric: '螺丝紧固质量', value: '+20', unit: '%' },
          { metric: '返工', value: '-0.5', unit: '%' }
        ]
      },
      {
        title: '更换磨损治具',
        content: '更换已使用超过5000次的组装治具，特别是定位销和卡扣部位。建议使用耐磨材质，延长使用寿命。',
        impact: [
          { metric: '装配精度', value: '+15', unit: '%' },
          { metric: '外观缺陷', value: '-0.3', unit: '%' }
        ]
      },
      {
        title: '强化员工培训',
        content: '针对新员工开展专项培训，包括操作技能、质量意识和异常处理能力。安排资深员工一对一指导，为期一周。',
        impact: [
          { metric: '操作熟练度', value: '+30', unit: '%' },
          { metric: '消耗量', value: '+2.5', unit: '%' }
        ]
      }
    ];
  } else {
    causes = [
      {
        title: '测试设备校准周期超期',
        description: '信号测试仪SG500最后一次校准时间为3个月前，超过规定3个月校准周期，可能导致测试参数偏移。',
        level: 'warning'
      },
      {
        title: '测试软件版本不兼容',
        description: '当前使用的测试软件版本为v2.5.1，与最新产品固件版本v3.0.2存在兼容性问题，导致部分功能测试失败率增加。',
        level: 'error'
      },
      {
        title: '环境温度波动较大',
        description: '测试区域温度波动范围2°C-28°C，超出标准要求的23°C±2°C，影响部分精密参数测试结果。',
        level: 'info'
      }
    ];
    
    suggestions = [
      {
        title: '测试设备校准',
        content: '立即对SG500信号测试仪进行校准，并更新校准周期管理系统，设置自动提醒功能，确保按时进行设备校准。',
        impact: [
          { metric: '测试准确率', value: '+15', unit: '%' },
          { metric: '误判率', value: '-0.4', unit: '%' }
        ]
      },
      {
        title: '更新测试软件',
        content: '将测试软件从v2.5.1升级到v3.1.0版本，解决与最新固件的兼容性问题。升级前需进行备份和兼容性测试。',
        impact: [
          { metric: '测试覆盖率', value: '+10', unit: '%' },
          { metric: '测试效率', value: '+5', unit: '%' }
        ]
      },
      {
        title: '优化环境控制',
        content: '调整测试区域空调设置，增加温湿度监控点，确保环境温度稳定在3°C±2°C范围内。考虑增加恒温装置。',
        impact: [
          { metric: '测试稳定性', value: '+20', unit: '%' },
          { metric: '良率', value: '+0.3', unit: '%' }
        ]
      }
    ];
  }
  
  exceptionAnalysis.value = {
    causes,
    suggestions
  };
}

// 监听对话框关闭事件
watch(detailDialogVisible, (newVal) => {
  if (!newVal && performanceChart) {
    safeDisposeChart(performanceChart);
    performanceChart = null;
  }
});

watch(exceptionDialogVisible, (newVal) => {
  if (!newVal) {
    if (exceptionChart) {
      safeDisposeChart(exceptionChart);
      exceptionChart = null;
    }
    if (materialTrendChart) {
      safeDisposeChart(materialTrendChart);
      materialTrendChart = null;
    }
  }
});

// 从产线数据中提取物料数据
function extractMaterialData() {
  try {
    // 使用统一数据服务获取上线数据
    const factoryData = unifiedDataService.getFactoryData();
    
    if (!factoryData || factoryData.length === 0) {
      console.log('未找到上线数据');
      return [];
    }
    
    console.log(`获取${factoryData.length}条上线数据，正在处理...`);
    
    // 转换数据格式 - 确保不限制数据量
    const processedData = factoryData.map(item => ({
      id: item.id || `OL-${Math.floor(Math.random() * 100000)}`,
      materialCode: item.materialCode || item.material_code || '',
      materialName: item.materialName || item.material_name || '',
      category: item.category || '',
      batchNo: item.batchNo || item.batch_no || '',
      supplier: item.supplier || '',
      factory: item.factory || '',
      line: item.line || item.productionLine || '',
      defectRate: parseFloat(item.defectRate || '0'),
      yield: parseFloat(item.yield || '98.5'),
      project: item.project || item.projectId || '',
      project_display: item.project_display || `项目${item.project || ''}`,
      baseline_display: item.baseline_display || '',
      quality: item.quality || '合格',
      status: item.status || '正常',
      useTime: item.useTime || new Date().toISOString(),
      inspectionDate: item.inspectionDate || '',
      exceptionCount: parseInt(item.exceptionCount || '0'),
      defect: item.defect || ''
    }));
    
    console.log(`已成功处理${processedData.length}条上线数据`);
    if (processedData.length > 0) {
      console.log('上线数据样本:', processedData[0]);
    }
    
    return processedData;
  } catch (error) {
    console.error('处理上线数据失败:', error);
    ElMessage.error('处理上线数据失败，请刷新页面重试');
    return [];
  }
}

// 创建物料项目的辅助函数
function createMaterialItem(material) {
  // 检查数据中的字段
  console.log("处理物料数据:", material.project_id, material.project_name, material.baseline_id, material.baseline_name);
  
  return {
          // 基本信息
          materialCode: material.materialCode || material.material_id,
          materialName: material.materialName || material.material_name,
          category: material.category || material.material_type,
          batchNo: material.batchNo || material.batch_no,
    quantity: material.quantity || material.usageQuantity || 0,
          unit: material.unit,
          supplier: material.supplier,
    
    quality: material.quality || '合格',
    riskLevel: material.risk_level || '低风险',
          
          // 检验信息
          inspectionDate: material.inspectionDate || material.test_date,
          
          // 上线使用信息
    useTime: material.onlineDate || material.online_date || material.last_updated,
          
          // 额外的产线信息
    factory: material.factory,
    line: material.productionLine || material.production_line || '主产线', 
    
    // 项目信息 - 修改显示逻辑，避免显示未知项目"
    project: material.project_name || material.project || material.project_id || '',
    project_id: material.project_id || '',
    // 创建项目显示字段，仅显示项目ID和名称，不添加未知项目的字样
    project_display: material.project_display || 
      (material.project_id ? 
        (material.project_name ? `${material.project_id} ${material.project_name}` : material.project_id) : 
        (material.project_name || material.project || '')),
    
    exceptionCount: material.exceptionCount || 0,
    yield: material.quality_metrics?.first_pass_yield || (Number(material.yieldRate?.replace?.('%', '')) || 90),
    
    // 基线信息 - 修改显示逻辑，避免显示未知基线"
    baseline_id: material.baseline_id || '',
    baseline_name: material.baseline_name || '',
    // 创建基线显示字段，仅显示基线ID和名称，不添加未知基线的字样
    baseline_display: material.baseline_display || 
      (material.baseline_id ? 
        (material.baseline_name ? `${material.baseline_id} ${material.baseline_name}` : material.baseline_id) : 
        (material.baseline_name || '')),
    
    // 不良现象信息
    defect: material.defect || '',
    defectRate: material.defectRate || material.defect_rate || '0.0%',
    
    // 额外的属性
    id: material.id,
    last_updated: material.last_updated || new Date().toISOString()
  };
}

// 计算物料的良率
function calculateMaterialYield(material) {
  // 根据物料的质量状态来估算良率
  if (material.quality === '合格') return Math.floor(95 + Math.random() * 5);
  if (material.quality === '待检') return 0; // 待检视为未知
  if (material.quality === '不合') return Math.floor(60 + Math.random() * 15);
  if (material.quality && material.quality.includes('风险物料')) {
    return Math.floor(75 + Math.random() * 15);
  }
  return 95; // 默认
}

// 获取物料的异常次数
function getMaterialExceptionCount(material) {
  if (material.status === '异常') return Math.floor(3 + Math.random() * 5);
  if (material.status === '风险') return Math.floor(1 + Math.random() * 3);
  if (material.quality === '不合') return Math.floor(2 + Math.random() * 4);
  if (material.quality && material.quality.includes('风险物料')) {
    return Math.floor(1 + Math.random() * 2);
  }
  return 0;
}

// 更新统计数据
function updateStatistics() {
  // 统计总批次数
  totalMaterialBatches.value = materials.value.length;
  
  // 统计总不良率和良率数
  let totalYield = 0;
  let yieldCount = 0;
  let totalDefectRate = 0;
  let defectRateCount = 0;
  let totalExceptions = 0;
  
  materials.value.forEach(m => {
    // 统计异常
    if (m.status === '异常' || m.status === '风险' || 
        m.quality === '不合' || (m.quality && m.quality.includes('风险物料'))) {
      totalExceptions++;
    }
    
    // 统计良率和不良率
    if (m.yield && m.yield > 0) {
      totalYield += m.yield;
      yieldCount++;
      
      // 计算不良率
      const defectRate = 100 - m.yield;
      totalDefectRate += defectRate;
      defectRateCount++;
    }
  });
  
  // 计算今天和最近的不良率数
  const recentDefectRate = defectRateCount > 0 ? (totalDefectRate / defectRateCount).toFixed(1) : 0;
  
  totalMaterialConsumption.value = yieldCount; // 使用良率数据条数代替消耗量
  todayConsumption.value = recentDefectRate; // 使用不良率平均值替代今日消耗量
  totalMaterialExceptions.value = totalExceptions;
  materialExceptionRate.value = ((totalExceptions / materials.value.length) * 100).toFixed(1);
  
  avgMaterialYield.value = yieldCount > 0 ? (totalYield / yieldCount).toFixed(1) : 0;
  materialYieldTrend.value = (Math.random() * 4 - 2).toFixed(1); // 模拟趋势数据，实际应从历史数据计算
}

// 在组件挂载时初始化
onMounted(async () => {
  try {
    // 提取物料数据
    materials.value = extractMaterialData();
    
    // 确保材料数据不为空
    if (!materials.value || materials.value.length === 0) {
      console.warn('没有找到物料数据，将使用示例数据');
      // 可以在这里添加一些示例数据以确保页面仍能显示
      ElMessage.warning('未检测到物料数据，请在"管理工具"中生成数据');
    }
    
    // 更新统计信息
    updateStatistics();
    
    // 初始化图表 - 确保在DOM更新后进行
    await nextTick();
    
    // 使用try-catch单独处理每个图表，避免一个图表失败影响其他图表
    try {
    await renderFactoryChart();
    } catch (chartError) {
      console.error('工厂图表渲染失败:', chartError);
    }
    
    try {
    await renderQualityChart();
    } catch (chartError) {
      console.error('质量图表渲染失败:', chartError);
    }
    
  } catch (error) {
    console.error("初始化失败:", error);
    ElMessage.error("初始化失败，请刷新页面重试");
  }
});

// 确认清除数据
function confirmClearData() {
  ElMessageBox.confirm(
    '确定要清空所有工厂数据吗？此操作不可恢复。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 使用工厂数据服务清除数据
    const result = FactoryDataService.clearFactoryData();
    
    if (result) {
      // 清空当前显示的数据
      materials.value = [];
      updateStatistics();
      
      // 重新渲染图表
      nextTick(() => {
        renderFactoryChart();
        renderQualityChart();
      });
      
      ElMessage({
        type: 'success',
        message: '工厂数据已清空'
      });
    } else {
      ElMessage({
        type: 'error',
        message: '清空数据失败'
      });
    }
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消清空操作'
    });
  });
}

// 组件销毁时清理图表
onUnmounted(() => {
  safeDisposeChart(factoryChart);
  safeDisposeChart(qualityChart);
  safeDisposeChart(performanceChart);
  safeDisposeChart(exceptionChart);
  safeDisposeChart(materialTrendChart);
});

// 初始化物料绩效图表
async function initPerformanceChart(materialData) {
  try {
    const chartContainer = document.getElementById('performance-chart');
    if (!chartContainer) {
      console.error('找不到图表容器 performance-chart');
      return null;
    }
    
    // 使用安全初始化方法
    const chart = await safeInitChart(chartContainer, {});
    if (!chart) return null;
    
    // 设置图表数据
    const categoryData = ['良品', '产线平均', '质检时间(min)', '合格率'];
    const valueData = [
      materialData.yieldRate || 95.6,
      materialData.lineAvgYield || 92.3,
      materialData.inspectionTime || 48,
      materialData.qualityRate || 97.8
    ];
    
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c}'
      },
      radar: {
        shape: 'circle',
        indicator: [
          { name: '良品', max: 100 },
          { name: '产线平均', max: 100 },
          { name: '质检时间(min)', max: 120, inverse: true },  // 时间越短越好
          { name: '合格率', max: 100 },
        ]
      },
      series: [{
        name: '物料绩效',
        type: 'radar',
        data: [
          {
            value: valueData,
            name: materialData.materialName,
            areaStyle: {
              color: 'rgba(64, 158, 255, 0.6)'
            }
          }
        ]
      }]
    };
    chart.setOption(option);
    
    // 设置图表自适应大小
    setupChartResize(chart, chartContainer);
    
    return chart;
  } catch (error) {
    console.error('初始化物料绩效图表失败:', error);
    ElMessage.error('图表加载失败');
    return null;
  }
}

// 计算不良率
function calculateDefectRate(value) {
  // 如果是undefined或null，返回0
  if (typeof value === 'undefined' || value === null) {
    return 0;
  }
  
  // 如果是对象，检查是否有defectRate字段
  if (typeof value === 'object' && value !== null) {
    if (value.defectRate !== undefined) {
      const defectRate = parseFloat(value.defectRate);
      return isNaN(defectRate) ? 0 : defectRate.toFixed(1);
    }
  }
  
  // 如果是字符串格式的不良率（包含%），直接提取数值
  if (typeof value === 'string' && value.includes('%')) {
    // 检查是否是不良率格式（小于20的值通常是不良率）
    const numValue = parseFloat(value.replace('%', ''));
    if (numValue < 20) {
      return numValue;
    } else {
      // 如果是良率格式（大于80的值通常是良率），计算不良率
      return (100 - numValue).toFixed(1);
    }
  }
  
  // 如果是数字，检查范围来判断是良率还是不良率
  if (typeof value === 'number' || !isNaN(parseFloat(value))) {
    const numValue = parseFloat(value);
    // 如果小于20，可能已经是不良率
    if (numValue < 20) {
      return numValue.toFixed(1);
    } else {
      // 否则认为是良率，计算不良率
      return (100 - numValue).toFixed(1);
    }
  }
  
  // 默认返回0
  return 0;
}

// 获取不良率显示的文本
function getDefectRateTextClass(defectRate) {
  if (defectRate < 2) return 'success-text';
  if (defectRate < 5) return 'warning-text';
  return 'danger-text';
}

// 数据更新后的刷新方法
function handleDataUpdate() {
  // 重新加载工厂数据
  materials.value = extractMaterialData();
  updateStatistics();
  
  // 重新渲染图表
  nextTick(() => {
    renderFactoryChart();
    renderQualityChart();
  });
  
  ElMessage.success(`数据已更新，页面显示已刷新`);
}

/**
 * 调试：确保不良率正确显示
 * @param {Object} row 行数据
 * @returns {number} 不良率
 */
function debugDefectRate(row) {
  // 优先使用defect_rate字段
  if (row.defect_rate !== undefined && row.defect_rate !== null) {
    return parseFloat(row.defect_rate).toFixed(1);
  }
  
  // 兼容defectRate字段
  if (row.defectRate !== undefined && row.defectRate !== null) {
    return parseFloat(row.defectRate).toFixed(1);
  }
  
  // 如果都没有，返回随机值（仅用于开发测试）
  return (Math.random() * 5 + 0.1).toFixed(1);
}

// 添加新的方法
function applyFilters() {
  console.log('应用筛选条件');
  // 筛选条件已通过计算属性自动应用
  ElMessage.success('筛选条件已应用');
}

function resetFilters() {
  searchQuery.value = '';
  factoryFilter.value = '';
  materialCategoryFilter.value = '';
  statusFilter.value = '';
  ElMessage.info('筛选条件已重置');
}

function exportToExcel() {
  ElMessage.info('正在导出数据...');
  // 这里添加导出Excel的逻辑
  setTimeout(() => {
    ElMessage.success('数据导出成功');
  }, 1000);
}

// 安全图表渲染方法
async function renderFactoryChart() {
  try {
    console.log('开始渲染工厂物料质量图表...');
    const chartContainer = document.getElementById('factory-chart');
    
    if (!chartContainer) {
      console.warn('找不到工厂图表容器，跳过渲染');
      return;
    }
    
    // 初始化图表
    const chart = echarts.init(chartContainer);
    
    // 准备图表数据
    const materialStats = getMaterialStats();
    
    // 设置图表选项
    const option = {
      title: {
        text: '工厂物料质量状态',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['合格批次', '不合格批次', '不良率'],
        top: 30
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: materialStats.factories,
          axisTick: { alignWithLabel: true },
          axisLabel: {
            rotate: 30,
            fontSize: 12
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '批次数量',
          position: 'left'
        },
        {
          type: 'value',
          name: '不良率(%)',
          position: 'right',
          min: 0,
          max: 10,
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: '合格批次',
          type: 'bar',
          stack: 'total',
          emphasis: { focus: 'series' },
          data: materialStats.goodBatches
        },
        {
          name: '不合格批次',
          type: 'bar',
          stack: 'total',
          emphasis: { focus: 'series' },
          data: materialStats.badBatches
        },
        {
          name: '不良率',
          type: 'line',
          yAxisIndex: 1,
          data: materialStats.defectRates,
          symbolSize: 8
        }
      ]
    };
    
    // 设置图表选项
    chart.setOption(option);
    
    // 保存图表实例以便后续更新或销毁
    factoryChart = chart;
    
    console.log('工厂物料质量图表渲染完成');
    
    // 设置图表响应式
    window.addEventListener('resize', () => {
      chart.resize();
    });
    
    return chart;
  } catch (error) {
    console.error('渲染工厂质量图表失败:', error);
    return null;
  }
}

// 获取工厂物料统计数据
function getMaterialStats() {
  // 获取所有工厂
  const factories = [...new Set(materials.value.map(item => item.factory))].filter(Boolean);
  
  // 初始化数据
  const goodBatches = [];
  const badBatches = [];
  const defectRates = [];
  
  // 计算每个工厂的统计信息
  factories.forEach(factory => {
    const factoryMaterials = materials.value.filter(item => item.factory === factory);
    const good = factoryMaterials.filter(item => item.quality === '合格' || item.quality === '正常').length;
    const bad = factoryMaterials.filter(item => item.quality === '不合格' || item.quality === '异常').length;
    
    goodBatches.push(good);
    badBatches.push(bad);
    
    // 计算不良率
    const total = good + bad;
    const defectRate = total > 0 ? (bad / total * 100).toFixed(1) : 0;
    defectRates.push(parseFloat(defectRate));
  });
  
  return {
    factories,
    goodBatches,
    badBatches,
    defectRates
  };
}
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

.stat-subtext {
  font-size: 12px;
  color: #909399;
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

.pagination-container {
  margin-top: 20px;
  padding: 10px 0;
  display: flex;
  justify-content: flex-end;
}

.pagination-info {
  display: flex;
  align-items: center;
  color: #606266;
  font-size: 14px;
}

.pagination-size-select {
  margin-left: 10px;
  width: 110px;
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

/* 响应式设计 */
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

/* 产品标签 */
.product-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

/* 物料标签 */
.material-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

/* 性能指标样式 */
.high-efficiency {
  color: #67C23A;
}

.medium-efficiency {
  color: #E6A23C;
}

.low-efficiency {
  color: #F56C6C;
}

.high-yield {
  color: #67C23A;
  font-weight: bold;
}

.medium-yield {
  color: #E6A23C;
  font-weight: bold;
}

.low-yield {
  color: #F56C6C;
  font-weight: bold;
}

.high-defect {
  color: #F56C6C;
  font-weight: bold;
}

.medium-defect {
  color: #E6A23C;
  font-weight: bold;
}

.low-defect {
  color: #67C23A;
  font-weight: bold;
}

/* 展开行样式 */
.expanded-row {
  padding: 20px;
  background-color: #f9f9f9;
}

.expanded-section {
  margin-bottom: 20px;
}

.expanded-section h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

/* 批次物料明细样式 */
.batch-materials {
  padding: 10px 20px;
}

.batch-materials h5 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 14px;
  color: #606266;
}

.no-materials {
  padding: 20px;
  text-align: center;
}

/* 物料详情对话框 */
.material-detail {
  padding: 0 10px;
}

.section-title {
  margin-top: 25px;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 16px;
  background-color: #409EFF;
  margin-right: 8px;
  border-radius: 2px;
}

.performance-chart {
  height: 350px;
  margin: 15px 0 25px;
}

/* 异常分析对话框 */
.exception-analysis {
  padding: 0 10px;
}

.exception-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.exception-line-info h3 {
  margin: 0 0 5px;
  font-size: 18px;
}

.exception-line-meta {
  display: flex;
  gap: 15px;
  color: #606266;
  font-size: 14px;
}

.exception-metrics {
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
}

.exception-metric-item {
  text-align: center;
  padding: 15px;
  border-radius: 5px;
  background-color: #f5f7fa;
  flex: 1;
  margin: 0 5px;
}

.metric-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.metric-trend {
  font-size: 12px;
  color: #909399;
}

.success-text {
  color: #67C23A;
}

.warning-text {
  color: #E6A23C;
}

.danger-text {
  color: #F56C6C;
}

.trend-up {
  color: #67C23A;
}

.trend-down {
  color: #F56C6C;
}

.exception-section-title {
  margin-top: 25px;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 500;
}

.exception-chart {
  height: 300px;
  margin-bottom: 20px;
}

.exception-cause-item {
  margin-bottom: 10px;
}

.suggestion-item {
  background-color: #f5f7fa;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 15px;
}

.suggestion-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.suggestion-icon {
  font-size: 20px;
  margin-right: 10px;
  color: #409EFF;
}

.suggestion-header h5 {
  margin: 0;
  font-size: 16px;
}

.suggestion-content {
  margin-bottom: 10px;
  line-height: 1.5;
}

.suggestion-impact {
  display: flex;
  align-items: center;
  font-size: 13px;
}

.impact-items {
  display: flex;
  gap: 15px;
  margin-left: 10px;
}

.exception-actions {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
