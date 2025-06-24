<template>
  <div class="online-container">
    <div class="page-header">
      <h2 class="page-title">IQE物料上线质量监测平台</h2>
      <div class="header-actions">
        <el-button type="primary" @click="refreshData">
          <el-icon><Refresh /></el-icon>刷新数据
        </el-button>
        <el-button type="success" @click="initializeTestData">
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
    
    <!-- 供应商质量表现卡片 - 新增部分 -->
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
        <div ref="supplierPerformanceChartRef" id="supplierPerformanceChart" style="height:400px; width:100%;"></div>
        <div v-if="!supplierChartLoaded" class="chart-loading">
          <el-skeleton animated :rows="8" />
            </div>
          </div>
          
      <div class="supplier-insights">
        <div class="supplier-alert-container" v-if="highRiskSuppliers.length > 0">
          <el-alert
            title="高风险供应商预警"
            type="error"
            :closable="false"
            show-icon
          >
            <template #default>
              <div class="alert-content">
                <p>以下供应商不良率超出预警线 (>5%)：</p>
                <div class="risk-suppliers">
                  <el-tag 
                    v-for="(supplier, index) in highRiskSuppliers" 
                    :key="index"
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
            <div class="metric-value">{{ topSupplier }}</div>
            <div class="metric-subtext">不良率: {{ topSupplierDefectRate }}%</div>
              </div>
          <div class="metric-item">
            <div class="metric-label">批次数最多</div>
            <div class="metric-value">{{ mostActiveSupplier }}</div>
            <div class="metric-subtext">{{ mostActiveSupplierCount }}个批次</div>
              </div>
          <div class="metric-item">
            <div class="metric-label">平均不良率</div>
            <div class="metric-value">{{ avgSupplierDefectRate }}%</div>
            <div class="metric-subtext">较上月{{ avgDefectRateTrend > 0 ? '+' : '' }}{{ avgDefectRateTrend }}%</div>
            </div>
          <div class="metric-item">
            <div class="metric-label">供应商总数</div>
            <div class="metric-value">{{ supplierCount }}</div>
            <div class="metric-subtext">高绩效: {{ highPerformanceCount }}家</div>
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
        :data="filteredOnlineData" 
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
        <el-table-column prop="materialCode" label="物料编码" width="110" sortable></el-table-column>
        <el-table-column prop="materialName" label="物料名称" width="160"></el-table-column>
        <el-table-column prop="supplier" label="供应商" width="150"></el-table-column>
        <el-table-column prop="batchNo" label="批次" width="110" sortable></el-table-column>
        <el-table-column prop="quantity" label="数量" sortable width="80"></el-table-column>
        <el-table-column label="物料状态" width="90">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="质量状态" width="100">
          <template #default="scope">
            <el-tag :type="getQualityType(scope.row)">{{ scope.row.quality || (scope.row.status === '不良' ? '不合格' : '合格') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="defect" label="不良现象" width="160"></el-table-column>
        <el-table-column prop="onlineDate" label="上线日期" width="160"></el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="scope">
            <el-button size="small" type="primary" @click.stop="viewDetail(scope.row)">详情</el-button>
            <el-dropdown size="small" split-button type="warning" @command="handleCommand($event, scope.row)">
              <span>操作</span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="inspectionHistory">检验记录</el-dropdown-item>
                  <el-dropdown-item command="traceProcess">质量追溯</el-dropdown-item>
                  <el-dropdown-item command="riskAnalysis">风险分析</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页器 -->
      <div class="pagination-container">
        <span>共 {{ total }} 条</span>
        <el-select v-model="pageSize" size="small" style="width: 110px; margin: 0 10px;">
          <el-option v-for="size in [10, 20, 50, 100]" :key="size" :label="`${size}条/页`" :value="size" />
        </el-select>
        
        <el-button size="small" :disabled="currentPage === 1" @click="currentPage = 1">
          <el-icon><DArrowLeft /></el-icon>
        </el-button>
        <el-button size="small" :disabled="currentPage === 1" @click="currentPage--">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        
        <template v-for="i in getPageNumbers()" :key="i">
          <el-button 
            size="small" 
            :type="currentPage === i ? 'primary' : ''" 
            @click="currentPage = i"
          >{{ i }}</el-button>
        </template>
        
        <span v-if="totalPages > 7 && currentPage < totalPages - 3">...</span>
        
        <el-button 
          v-if="totalPages > 7" 
          size="small" 
          :type="currentPage === totalPages ? 'primary' : ''" 
          @click="currentPage = totalPages"
        >{{ totalPages }}</el-button>
        
        <el-button size="small" :disabled="currentPage === totalPages" @click="currentPage++">
          <el-icon><ArrowRight /></el-icon>
        </el-button>
        <el-button size="small" :disabled="currentPage === totalPages" @click="currentPage = totalPages">
          <el-icon><DArrowRight /></el-icon>
        </el-button>
        
        <span style="margin-left: 10px;">前往</span>
        <el-input 
          v-model="jumpPage" 
          size="small" 
          style="width: 50px; margin: 0 5px;"
          @keyup.enter="handleJumpPage"
        ></el-input>
        <span>页</span>
      </div>
    </el-card>
    
    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="物料上线详情"
      width="70%"
      destroy-on-close
    >
      <div v-if="selectedMaterial" class="material-detail">
        <div class="detail-header">
          <h3>{{ selectedMaterial.materialName }}</h3>
          <el-tag :type="getStatusType(selectedMaterial)">{{ selectedMaterial.status }}</el-tag>
        </div>
        
        <el-divider></el-divider>
        
        <el-descriptions :column="3" border>
          <el-descriptions-item label="物料编码">{{ selectedMaterial.materialCode }}</el-descriptions-item>
          <el-descriptions-item label="物料名称">{{ selectedMaterial.materialName }}</el-descriptions-item>
          <el-descriptions-item label="规格型号">{{ selectedMaterial.specification }}</el-descriptions-item>
          <el-descriptions-item label="批次号">{{ selectedMaterial.batchNo }}</el-descriptions-item>
          <el-descriptions-item label="供应商">{{ selectedMaterial.supplier }}</el-descriptions-item>
          <el-descriptions-item label="生产日期">{{ selectedMaterial.productionDate }}</el-descriptions-item>
          <el-descriptions-item label="上线日期">{{ selectedMaterial.onlineDate }}</el-descriptions-item>
          <el-descriptions-item label="上线数量">{{ selectedMaterial.quantity }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ selectedMaterial.operator }}</el-descriptions-item>
          <el-descriptions-item label="质量状态">
            <el-tag :type="getQualityType(selectedMaterial)">{{ selectedMaterial.quality }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="备注">{{ selectedMaterial.remark || '无' }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="detail-charts">
          <h4>质量数据趋势</h4>
          <div class="chart-container" ref="qualityChartRef"></div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, reactive } from 'vue';
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
import unifiedDataService from '../services/UnifiedDataService.js';
import { safeInitChart, setupChartResize, safeDisposeChart } from '../utils/chartHelper.js';
import SystemDataUpdater from '../services/SystemDataUpdater.js';
import { MATERIAL_DEFECT_MAP } from '../services/SystemDataUpdater.js';
import {
  Refresh, Plus, Delete, Download, View, Warning, Search, Setting, Edit,
  CircleCheck, CircleClose, InfoFilled, Histogram, TrendCharts, Connection,
  StarFilled, WarningFilled, CircleCloseFilled, CaretTop, CaretBottom, Goods,
  GoodsFilled, Odometer, DArrowLeft, DArrowRight, ArrowLeft, ArrowRight
} from '@element-plus/icons-vue';

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

// 模拟数据
const onlineData = ref([]);
const loading = ref(true);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const jumpPage = ref('');
const detailDialogVisible = ref(false);
const selectedMaterial = ref(null);
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
const highRiskSuppliers = ref([]);
const topSupplier = ref('欧菲光科技');
const topSupplierDefectRate = ref('0.8');
const mostActiveSupplier = ref('立讯精密');
const mostActiveSupplierCount = ref(26);
const avgSupplierDefectRate = ref('3.2');
const avgDefectRateTrend = ref(-0.5);
const supplierCount = ref(0);
const highPerformanceCount = ref(0);

// 过滤后的数据
const filteredOnlineData = computed(() => {
  if (!onlineData.value) return [];

  // 根据筛选条件过滤
  let filtered = [...onlineData.value];

  // 使用筛选表单中的条件
  if (filterForm.value.materialCode) {
    filtered = filtered.filter(item => 
      item.materialCode && item.materialCode.toLowerCase().includes(filterForm.value.materialCode.toLowerCase())
    );
  }
  
  if (filterForm.value.materialName) {
    filtered = filtered.filter(item => 
      item.materialName && item.materialName.toLowerCase().includes(filterForm.value.materialName.toLowerCase())
    );
  }
  
  if (filterForm.value.batchNo) {
    filtered = filtered.filter(item => 
      item.batchNo && item.batchNo.toLowerCase().includes(filterForm.value.batchNo.toLowerCase())
    );
  }
  
  if (filterForm.value.status) {
    filtered = filtered.filter(item => item.status === filterForm.value.status);
  }

  // 使用快速搜索
  if (filterForm.value.quickSearch) {
    const searchTerm = filterForm.value.quickSearch.toLowerCase();
    filtered = filtered.filter(item => 
      (item.materialCode && item.materialCode.toLowerCase().includes(searchTerm)) ||
      (item.materialName && item.materialName.toLowerCase().includes(searchTerm)) ||
      (item.batchNo && item.batchNo.toLowerCase().includes(searchTerm)) ||
      (item.supplier && item.supplier.toLowerCase().includes(searchTerm))
    );
  }

  // 计算总数并返回分页数据
  total.value = filtered.length;
  totalPages.value = Math.ceil(total.value / pageSize.value) || 1;
  
  const startIndex = (currentPage.value - 1) * pageSize.value;
  return filtered.slice(startIndex, startIndex + pageSize.value);
});

// 计算总页数
const totalPages = ref(1);

// 获取要显示的页码
const getPageNumbers = () => {
  const maxVisiblePages = 7;
  const result = [];

  if (totalPages.value <= maxVisiblePages) {
    // 总页数少于最大可见页数，显示所有页码
    for (let i = 1; i <= totalPages.value; i++) {
      result.push(i);
    }
  } else {
    // 总页数大于最大可见页数，需要省略部分页码
    if (currentPage.value <= 4) {
      // 当前页在前部分
      for (let i = 1; i <= 5; i++) {
        result.push(i);
      }
    } else if (currentPage.value >= totalPages.value - 3) {
      // 当前页在后部分
      for (let i = totalPages.value - 4; i <= totalPages.value; i++) {
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
  if (isNaN(page) || page < 1 || page > totalPages.value) {
    ElMessage.warning(`请输入1-${totalPages.value}之间的页码`);
    return;
  }
  
  currentPage.value = page;
  jumpPage.value = '';
};

// 渲染供应商表现图表
const renderSupplierPerformanceChart = async () => {
  supplierChartLoaded.value = false;
  console.log('开始渲染供应商表现图表...');
  
  // 确保DOM元素存在
  await nextTick();
  const chartDom = document.getElementById('supplierPerformanceChart');
  if (!chartDom) {
    console.error('找不到supplierPerformanceChart DOM元素');
    return;
  }
  
  // 设置容器尺寸
  chartDom.style.height = '400px';
  chartDom.style.width = '100%';
  
  // 销毁旧实例
  if (supplierChart) {
    safeDisposeChart(supplierChart);
    supplierChart = null;
  }
  
  // 准备图表数据
  let suppliers = ['立讯精密', '欧菲光科技', '蓝思科技', '京东方', '歌尔股份', '信利光电', '华勤技术'];
  let defectRates = [3.8, 0.8, 2.1, 4.5, 1.2, 6.2, 3.5];
  let deliveryCounts = [26, 18, 15, 12, 22, 8, 14];
  let qualityScores = [92, 97, 94, 88, 96, 85, 90];
  
  // 从实际数据中收集供应商信息
  if (onlineData.value && onlineData.value.length > 0) {
    // 收集供应商信息
    const supplierMap = {};
    onlineData.value.forEach(item => {
      if (!item.supplier) return;
      
      if (!supplierMap[item.supplier]) {
        supplierMap[item.supplier] = {
          name: item.supplier,
          count: 0,
          defectCount: 0,
          totalCount: 0
        };
      }
      
      supplierMap[item.supplier].count++;
      supplierMap[item.supplier].totalCount += item.quantity || 0;
      
      // 统计不良数量
      if (item.status === '不良' || item.quality === '不合格') {
        supplierMap[item.supplier].defectCount += item.quantity || 0;
      }
    });
    
    // 转换为图表数据
    const supplierData = Object.values(supplierMap);
    if (supplierData.length > 0) {
      // 按照不同的图表类型准备数据
      supplierData.sort((a, b) => {
        if (supplierChartType.value === 'defectRate') {
          // 计算不良率
          const aRate = a.totalCount > 0 ? (a.defectCount / a.totalCount) * 100 : 0;
          const bRate = b.totalCount > 0 ? (b.defectCount / b.totalCount) * 100 : 0;
          return bRate - aRate; // 降序
        } else if (supplierChartType.value === 'deliveryCount') {
          return b.count - a.count; // 降序
        } else {
          // 质量评分 (模拟)
          const aScore = 100 - (a.totalCount > 0 ? (a.defectCount / a.totalCount) * 100 : 0);
          const bScore = 100 - (b.totalCount > 0 ? (b.defectCount / b.totalCount) * 100 : 0);
          return bScore - aScore; // 降序
        }
      });
      
      // 取前10个供应商
      const topSuppliers = supplierData.slice(0, 10);
      
      // 更新供应商数据
      suppliers = topSuppliers.map(s => s.name);
      
      if (supplierChartType.value === 'defectRate') {
        defectRates = topSuppliers.map(s => 
          s.totalCount > 0 ? parseFloat(((s.defectCount / s.totalCount) * 100).toFixed(1)) : 0
        );
        
        // 更新高风险供应商列表
        highRiskSuppliers.value = topSuppliers
          .filter(s => s.totalCount > 0 && (s.defectCount / s.totalCount) * 100 > 5)
          .map(s => ({
            name: s.name,
            defectRate: parseFloat(((s.defectCount / s.totalCount) * 100).toFixed(1))
          }));
        
      } else if (supplierChartType.value === 'deliveryCount') {
        deliveryCounts = topSuppliers.map(s => s.count);
      } else {
        qualityScores = topSuppliers.map(s => 
          parseFloat((100 - (s.totalCount > 0 ? (s.defectCount / s.totalCount) * 100 : 0)).toFixed(1))
        );
      }
      
      // 更新供应商统计信息
      if (supplierData.length > 0) {
        // 查找不良率最低的供应商(有至少5个批次)
        const qualifiedSuppliers = supplierData.filter(s => s.count >= 5);
        if (qualifiedSuppliers.length > 0) {
          const bestSupplier = qualifiedSuppliers.reduce((best, current) => {
            const bestRate = best.totalCount > 0 ? (best.defectCount / best.totalCount) * 100 : 100;
            const currentRate = current.totalCount > 0 ? (current.defectCount / current.totalCount) * 100 : 100;
            return currentRate < bestRate ? current : best;
          }, qualifiedSuppliers[0]);
          
          topSupplier.value = bestSupplier.name;
          topSupplierDefectRate.value = bestSupplier.totalCount > 0 ? 
            (bestSupplier.defectCount / bestSupplier.totalCount * 100).toFixed(1) : '0.0';
        }
        
        // 查找批次数最多的供应商
        const mostActive = supplierData.reduce((most, current) => 
          current.count > most.count ? current : most, supplierData[0]);
        mostActiveSupplier.value = mostActive.name;
        mostActiveSupplierCount.value = mostActive.count;
        
        // 计算平均不良率
        const totalDefects = supplierData.reduce((sum, s) => sum + s.defectCount, 0);
        const totalItems = supplierData.reduce((sum, s) => sum + s.totalCount, 0);
        avgSupplierDefectRate.value = totalItems > 0 ? 
          (totalDefects / totalItems * 100).toFixed(1) : '0.0';
        
        // 供应商总数和高绩效供应商数
        supplierCount.value = supplierData.length;
        highPerformanceCount.value = supplierData.filter(s => 
          s.totalCount > 0 && (s.defectCount / s.totalCount) * 100 < 2
        ).length;
      }
    }
  }
  
  // 准备图表选项
  let option;
  if (supplierChartType.value === 'defectRate') {
    option = {
        tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c}%'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
        },
        xAxis: {
          type: 'category',
        data: suppliers,
        axisLabel: {
          interval: 0,
          rotate: 30
        }
        },
        yAxis: {
          type: 'value',
        name: '不良率(%)',
          axisLabel: {
            formatter: '{value}%'
          }
        },
      series: [{
        name: '不良率',
        data: defectRates,
        type: 'bar',
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%'
        },
        itemStyle: {
          color: function(params) {
            // 根据不良率设置颜色
            const value = params.value;
            if (value > 5) return '#F56C6C'; // 红色
            if (value > 2) return '#E6A23C'; // 黄色
            return '#67C23A'; // 绿色
          }
        }
      }]
    };
  } else if (supplierChartType.value === 'deliveryCount') {
    option = {
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: suppliers,
        axisLabel: {
          interval: 0,
          rotate: 30
        }
      },
      yAxis: {
        type: 'value',
        name: '批次数量'
      },
      series: [{
        name: '批次数量',
        data: deliveryCounts,
        type: 'bar',
                  label: {
          show: true,
          position: 'top'
        },
        itemStyle: {
          color: '#409EFF'
        }
      }]
    };
  } else {
    option = {
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: suppliers,
        axisLabel: {
          interval: 0,
          rotate: 30
        }
      },
      yAxis: {
        type: 'value',
        name: '质量评分',
        min: 80,
        max: 100
      },
      series: [{
        name: '质量评分',
        data: qualityScores,
        type: 'bar',
        label: {
          show: true,
          position: 'top'
        },
        itemStyle: {
          color: function(params) {
            // 根据评分设置颜色
            const value = params.value;
            if (value < 90) return '#E6A23C'; // 黄色
            if (value < 95) return '#67C23A'; // 绿色
            return '#409EFF'; // 蓝色
          }
        }
      }]
    };
  }
  
  try {
    // 使用安全初始化方法
    console.log('调用safeInitChart初始化供应商表现图表...');
    supplierChart = await safeInitChart(chartDom, option);
    if (supplierChart) {
      console.log('供应商表现图表初始化成功');
      setupChartResize(supplierChart, chartDom);
      supplierChartLoaded.value = true;
    } else {
      console.error('供应商表现图表初始化失败');
    }
    } catch (error) {
    console.error('渲染供应商表现图表出错:', error);
  }
};

// 初始化测试数据
const initializeTestData = async () => {
  try {
    loading.value = true;
    ElMessage.info('正在初始化测试数据...');
    console.log('开始初始化测试数据');
    
    // 创建SystemDataUpdater实例
    const dataUpdater = new SystemDataUpdater();
    
    // 生成上线数据
    console.log('调用SystemDataUpdater.updateOnlineData生成上线数据...');
    const result = await dataUpdater.updateOnlineData({
      count: 50,
      clearExisting: true,
      factories: ['重庆工厂', '深圳工厂', '南昌工厂', '宜宾工厂']
    });
    
    console.log('初始化测试数据结果:', result);
    
    if (result && result.success) {
      ElMessage.success(`测试数据初始化成功: 生成了${result.count}条上线数据`);
      console.log('测试数据初始化成功，刷新页面数据和图表');
      
      // 刷新页面数据
      refreshData();
      
      // 确保DOM已经渲染完成
      await nextTick();
      
      // 延迟渲染图表，确保数据已加载和DOM已更新
      setTimeout(async () => {
        await renderSupplierPerformanceChart();
      }, 500);
    } else {
      console.error('测试数据初始化失败:', result);
      ElMessage.error('测试数据初始化失败: ' + (result?.message || '未知错误'));
    }
    } catch (error) {
    console.error('初始化测试数据失败:', error);
    ElMessage.error('初始化测试数据失败: ' + (error.message || '未知错误'));
    } finally {
    loading.value = false;
  }
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
      refreshData();
      
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
const refreshData = async () => {
  try {
    loading.value = true;
    
    // 获取上线数据
    const result = await unifiedDataService.getOnlineData();
    
    if (result && result.success) {
      onlineData.value = result.data || [];
      total.value = onlineData.value.length;
      totalPages.value = Math.ceil(total.value / pageSize.value) || 1;
      
      // 如果当前页超出范围，重置为第一页
      if (currentPage.value > totalPages.value) {
        currentPage.value = 1;
      }
      
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
const viewDetail = (row) => {
  selectedMaterial.value = { ...row };
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

// 处理操作命令
const handleCommand = (command, row) => {
  switch (command) {
    case 'inspectionHistory':
      ElMessage.info(`查看检验记录: ${row.materialCode}`);
      break;
    case 'traceProcess':
      ElMessage.info(`查看质量追溯: ${row.materialCode}`);
      break;
    case 'riskAnalysis':
      ElMessage.info(`查看风险分析: ${row.materialCode}`);
      break;
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
  totalPages.value = Math.ceil(total.value / pageSize.value) || 1;
  // 如果当前页超出范围，重置为第一页
  if (currentPage.value > totalPages.value) {
    currentPage.value = 1;
  }
};

// 获取状态类型
const getStatusType = (row) => {
  if (!row) return '';
  
  const statusMap = {
    '正常': 'success',
    '风险': 'warning',
    '异常': 'danger',
    '不良': 'danger'
  };
  
  return statusMap[row.status] || 'info';
};

// 获取质量状态类型
const getQualityType = (row) => {
  if (!row) return '';
  
  if (row.quality === '合格') return 'success';
  if (row.quality === '不合格') return 'danger';
  
  return row.status === '正常' ? 'success' : 'danger';
};

// 生命周期钩子
onMounted(async () => {
  // 获取数据
  await refreshData();
  
  // 确保DOM已经渲染完成
  await nextTick();
  
  // 延迟渲染图表，确保数据已加载和DOM已更新
  setTimeout(async () => {
    await renderSupplierPerformanceChart();
  }, 500);
});
</script>

<style scoped>
.online-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  margin: 0;
  color: #303133;
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
 
 