<!-- 
  工厂质量统计组件
  用于展示上线数据的质量统计信息，包括供应商、生产线和物料种类的不良统计
-->
<template>
  <div class="factory-quality-stats">
    <!-- 选择时间范围控件 -->
    <el-row :gutter="20" class="time-range-row">
      <el-col :span="24">
        <div class="time-range-container">
          <el-select v-model="timeRange" placeholder="时间范围" size="small">
            <el-option label="最近7天" value="7" />
            <el-option label="最近30天" value="30" />
            <el-option label="最近90天" value="90" />
            <el-option label="全部" value="all" />
          </el-select>
          <el-button type="primary" size="small" @click="refreshData">刷新</el-button>
        </div>
      </el-col>
    </el-row>
    
    <!-- 新增: TOP5不良物料和供应商统计卡片 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="top-defects-card">
          <template #header>
            <div class="card-header">
              <h4>TOP5不良物料</h4>
              <el-tooltip content="不良数量最多的5种物料" placement="top">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div class="top-defect-table">
            <el-table 
              :data="topDefectMaterials" 
              style="width: 100%" 
              :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
              border stripe>
              <el-table-column type="index" label="排名" width="50" align="center"></el-table-column>
              <el-table-column prop="materialName" label="物料名称" min-width="140"></el-table-column>
              <el-table-column prop="defectCount" label="不良数量" width="90" align="center">
                <template #default="scope">
                  <el-tag 
                    :type="scope.row.defectCount > 10 ? 'danger' : (scope.row.defectCount > 5 ? 'warning' : 'success')"
                    effect="dark">
                    {{ scope.row.defectCount }} 起
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="mainDefect" label="主要不良" min-width="120"></el-table-column>
              <el-table-column prop="supplier" label="供应商" min-width="120"></el-table-column>
            </el-table>
          </div>
          <div class="defect-insight">
            <el-alert
              v-if="highRiskMaterialCount > 0"
              type="warning"
              :title="`发现${highRiskMaterialCount}种高风险物料，不良数量超过10起`"
              show-icon>
              <template #default>
                <div>建议对{{ topDefectMaterials[0]?.materialName || '高风险物料' }}进行专项质量改进</div>
              </template>
            </el-alert>
            <div v-else class="normal-insight">
              <el-icon color="#67C23A"><CircleCheck /></el-icon>
              <span>所有物料不良率均在可接受范围内</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="top-defects-card">
          <template #header>
            <div class="card-header">
              <h4>TOP5问题供应商</h4>
              <el-tooltip content="不良批次最多的5家供应商" placement="top">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div class="top-defect-table">
            <el-table 
              :data="topDefectSuppliers" 
              style="width: 100%" 
              :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
              border stripe>
              <el-table-column type="index" label="排名" width="50" align="center"></el-table-column>
              <el-table-column prop="supplierName" label="供应商名称" min-width="140"></el-table-column>
              <el-table-column prop="materialCount" label="物料种类" width="90" align="center"></el-table-column>
              <el-table-column prop="defectBatchCount" label="不良批次" width="90" align="center">
                <template #default="scope">
                  <el-tag 
                    :type="scope.row.defectBatchCount > 10 ? 'danger' : (scope.row.defectBatchCount > 5 ? 'warning' : 'success')"
                    effect="dark">
                    {{ scope.row.defectBatchCount }} 起
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="mainDefectTypes" label="主要不良类型" min-width="140"></el-table-column>
            </el-table>
          </div>
          <div class="defect-insight">
            <el-alert
              v-if="highRiskSupplierCount > 0"
              type="error"
              :title="`发现${highRiskSupplierCount}家高风险供应商，不良批次超过10批，建议进行质量审核`"
              show-icon>
              <template #default>
                <div>建议对{{ topDefectSuppliers[0]?.supplierName || '问题供应商' }}进行供应商质量管理体系评估</div>
              </template>
            </el-alert>
            <div v-else class="normal-insight">
              <el-icon color="#67C23A"><CircleCheck /></el-icon>
              <span>所有供应商质量表现良好</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    

    
    <el-row :gutter="20" class="chart-row">
      <!-- 物料上线质量预警看板 - 增加宽度 -->
      <el-col :xs="24" :sm="24" :md="16" :lg="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <h4>物料上线质量预警看板</h4>
              <el-tooltip content="显示项目中不良异常的数量统计" placement="top">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div class="exception-tabs">
            <el-tabs v-model="exceptionTabActive">
              <el-tab-pane label="项目不良异常" name="project">
                <div class="exception-stat-container">
                  <el-row :gutter="10">
                    <el-col :xs="12" :sm="8" :md="6" :lg="4" v-for="(item, index) in projectExceptionStats" :key="index">
                      <div class="exception-stat-card" :class="getExceptionCardClass(item.count)">
                        <div class="exception-project">{{ item.project }}</div>
                        <div class="exception-count">{{ item.count }}起</div>
                        <div class="exception-trend" :class="item.trend > 0 ? 'trend-up' : 'trend-down'">
                          {{ item.trend > 0 ? '上升' : '下降' }} {{ Math.abs(item.trend) }}%
                        </div>
                      </div>
                    </el-col>
                  </el-row>
                  <div class="exception-summary">
                    <div class="summary-title">项目不良异常分析</div>
                    <div class="summary-content">
                      <p>项目异常总数<span class="highlight">{{ totalProjectExceptions }}</span>起</p>
                      <p>最严重项目<span class="highlight">{{ worstProject }}</span></p>
                      <p>主要不良类型<span class="highlight">{{ mainDefectType }}</span></p>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              <el-tab-pane label="不良类型分布" name="defectType">
                <div class="defect-type-chart" ref="defectTypeChartRef"></div>
              </el-tab-pane>
              <el-tab-pane label="异常趋势" name="trend">
                <div class="exception-trend-chart" ref="exceptionTrendChartRef"></div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-card>
      </el-col>
      
      <!-- 生产线不良率对比 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <h4>各工厂不良物料数量对比</h4>
              <el-tooltip content="各工厂的不良物料数量统计" placement="top">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div class="chart-container" ref="lineChartRef"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { InfoFilled, CircleCheck, WarningFilled, DataLine } from '@element-plus/icons-vue';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { unifiedDataService } from '../../services';

// 注册必要的ECharts组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  BarChart,
  LineChart,
  PieChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
]);

// 图表引用
const lineChartRef = ref(null);
const defectTypeChartRef = ref(null);
const exceptionTrendChartRef = ref(null);

// 图表实例
let lineChart = null;
let defectTypeChart = null;
let exceptionTrendChart = null;

// TOP5不良物料和供应商数据
const topDefectMaterials = ref([]);
const topDefectSuppliers = ref([]);
const highRiskMaterialCount = ref(0);
const highRiskSupplierCount = ref(0);

// 项目不良异常统计数据
const exceptionTabActive = ref('project');
const projectExceptionStats = ref([]);
const totalProjectExceptions = ref(0);
const worstProject = ref('');
const mainDefectType = ref('');
const defectTypeStats = ref([]);
const exceptionTrendData = ref([]);

// 时间范围选择
const timeRange = ref('30');

// 统计数据
const stats = ref({
  totalRecords: 0,
  avgDefectRate: 0,
  defectCount: 0,
  topDefect: '',
  topDefectMaterial: '',
  topDefectSupplier: ''
});

// 原始数据
const factoryData = ref([]);

// 计算属性：过滤后的数据
const filteredData = computed(() => {
  if (timeRange.value === 'all') {
    return factoryData.value;
  }
  
  const days = parseInt(timeRange.value);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return factoryData.value.filter(item => {
    const itemDate = new Date(item.online_time || item.onlineTime);
    return itemDate >= cutoffDate;
  });
});

// 初始化组件
onMounted(() => {
  loadData();
  initCharts();
  window.addEventListener('resize', resizeCharts);
});

// 组件销毁时清理
onUnmounted(() => {
  disposeCharts();
  window.removeEventListener('resize', resizeCharts);
});

// 加载数据
async function loadData() {
  try {
    // 获取上线数据 - 修复：使用await调用异步方法
    const data = await unifiedDataService.getFactoryData() || [];
    factoryData.value = data;

    // 更新统计信息
    updateStats();

    // 更新图表
    updateCharts();
  } catch (error) {
    console.error('加载数据失败:', error);
    ElMessage.error('加载数据失败');
  }
}

// 更新统计信息
function updateStats() {
  const data = filteredData.value;
  
  // 计算总记录数
  stats.value.totalRecords = data.length;
  
  // 计算平均不良率和不良数量
  let totalDefectRate = 0;
  let defectCount = 0;
  
  // 不良现象计数
  const defectCounts = {};
  // 物料不良计数
  const materialDefectCounts = {};
  // 物料详细信息映射
  const materialDetails = {};
  // 供应商不良计数
  const supplierDefectCounts = {};
  // 供应商详细信息映射
  const supplierDetails = {};
  
  data.forEach(item => {
    const defectRate = parseFloat(item.defect_rate || item.defectRate || 0);
    const materialName = item.materialName || item.material_name || '未知物料';
    const supplier = item.supplier || '未知供应商';
    const batchNo = item.batchNo || item.batch_no || '未知批次';
    const defects = (item.defect || '未知不良').split(',').map(d => d.trim());
    const mainDefect = defects[0] || '未知不良';
    
    if (!isNaN(defectRate)) {
      totalDefectRate += defectRate;
      
      if (defectRate > 0) {
        defectCount++;
        
        // 统计不良物料详细信息
        if (!materialDetails[materialName]) {
          materialDetails[materialName] = {
            materialName,
            materialType: item.material_type || item.materialType || '未知类型',
            defectCount: 0,
            totalCount: 0,
            defectRate: 0,
            defects: {},
            suppliers: new Set(),
            batches: new Set(),
            mainDefect: ''
          };
        }
        
        materialDetails[materialName].defectCount++;
        materialDetails[materialName].totalCount++;
        materialDetails[materialName].defectRate = (materialDetails[materialName].defectCount / materialDetails[materialName].totalCount) * 100;
        materialDetails[materialName].suppliers.add(supplier);
        materialDetails[materialName].batches.add(batchNo);
        
        // 记录不良类型
        defects.forEach(defect => {
          if (defect) {
            materialDetails[materialName].defects[defect] = (materialDetails[materialName].defects[defect] || 0) + 1;
          }
        });
        
        // 统计不良供应商详细信息
        if (!supplierDetails[supplier]) {
          supplierDetails[supplier] = {
            supplierName: supplier,
            defectCount: 0,
            totalCount: 0,
            defectRate: 0,
            defectTypes: {},
            materials: new Set(),
            batches: new Set(),
            mainDefectTypes: '',
            defectBatches: new Set()
          };
        }
        
        supplierDetails[supplier].defectCount++;
        supplierDetails[supplier].totalCount++;
        supplierDetails[supplier].defectRate = (supplierDetails[supplier].defectCount / supplierDetails[supplier].totalCount) * 100;
        supplierDetails[supplier].materials.add(materialName);
        supplierDetails[supplier].batches.add(batchNo);
        supplierDetails[supplier].defectBatches.add(batchNo);
        
        // 记录不良类型
        defects.forEach(defect => {
          if (defect) {
            supplierDetails[supplier].defectTypes[defect] = (supplierDetails[supplier].defectTypes[defect] || 0) + 1;
          }
        });
      }
      
      // 统计不良现象
      defects.forEach(defect => {
        if (defect) {
          defectCounts[defect] = (defectCounts[defect] || 0) + 1;
        }
      });
    }
  });
  
  stats.value.avgDefectRate = data.length > 0 ? totalDefectRate / data.length : 0;
  stats.value.defectCount = defectCount;
  
  // 找出最常见的不良现象
  let maxCount = 0;
  let topDefect = '';
  
  Object.entries(defectCounts).forEach(([defect, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topDefect = defect;
    }
  });
  
  stats.value.topDefect = topDefect;
  
  // 找出最常见的不良物料
  maxCount = 0;
  let topDefectMaterial = '';
  
  Object.entries(materialDetails).forEach(([material, stats]) => {
    if (stats.defectRate > maxCount) {
      maxCount = stats.defectRate;
      topDefectMaterial = material;
    }
  });
  
  stats.value.topDefectMaterial = topDefectMaterial;
  
  // 找出最常见的不良供应商
  maxCount = 0;
  let topDefectSupplier = '';
  
  Object.entries(supplierDetails).forEach(([supplier, stats]) => {
    if (stats.defectRate > maxCount) {
      maxCount = stats.defectRate;
      topDefectSupplier = supplier;
    }
  });
  
  stats.value.topDefectSupplier = topDefectSupplier;
  
  // 处理物料数据，获取TOP5不良物料
  const materialsArray = Object.values(materialDetails);
  materialsArray.sort((a, b) => b.defectCount - a.defectCount);
  
  // 提取每种物料的主要不良类型
  materialsArray.forEach(material => {
    const defectEntries = Object.entries(material.defects);
    if (defectEntries.length > 0) {
      defectEntries.sort((a, b) => b[1] - a[1]);
      material.mainDefect = defectEntries[0][0];
    }
    material.supplier = Array.from(material.suppliers).join(', ');
  });
  
  // 更新TOP5不良物料
  topDefectMaterials.value = materialsArray.slice(0, 5).map(item => ({
    materialName: item.materialName,
    materialType: item.materialType,
    defectRate: item.defectRate,
    defectCount: item.defectCount,
    totalCount: item.totalCount,
    mainDefect: item.mainDefect,
    supplier: item.supplier
  }));
  
  // 计算高风险物料数量
  highRiskMaterialCount.value = materialsArray.filter(m => m.defectCount > 10).length;
  
  // 处理供应商数据，获取TOP5不良供应商
  const suppliersArray = Object.values(supplierDetails);
  suppliersArray.forEach(supplier => {
    // 添加不良批次数量统计
    supplier.defectBatchCount = supplier.defectBatches ? supplier.defectBatches.size : 0;
  });
  // 按不良批次数量排序
  suppliersArray.sort((a, b) => b.defectBatchCount - a.defectBatchCount);
  
  // 提取每个供应商的主要不良类型
  suppliersArray.forEach(supplier => {
    const defectEntries = Object.entries(supplier.defectTypes);
    if (defectEntries.length > 0) {
      defectEntries.sort((a, b) => b[1] - a[1]);
      supplier.mainDefectTypes = defectEntries.slice(0, 2).map(e => e[0]).join(', ');
    }
    supplier.materialCount = supplier.materials.size;
  });
  
  // 更新TOP5不良供应商
  topDefectSuppliers.value = suppliersArray.slice(0, 5).map(item => ({
    supplierName: item.supplierName,
    defectRate: item.defectRate,
    defectCount: item.defectCount,
    totalCount: item.totalCount,
    materialCount: item.materialCount,
    defectBatchCount: item.defectBatchCount || 0,
    mainDefectTypes: item.mainDefectTypes
  }));
  
  // 计算高风险供应商数量
  highRiskSupplierCount.value = suppliersArray.filter(s => s.defectBatchCount > 10).length;
}

// 初始化图表
function initCharts() {
  // 生产线不良率对比图表
  if (lineChartRef.value) {
    lineChart = echarts.init(lineChartRef.value);
  }

  // 不良类型分布图表
  if (defectTypeChartRef.value) {
    defectTypeChart = echarts.init(defectTypeChartRef.value);
  }

  // 异常趋势图表
  if (exceptionTrendChartRef.value) {
    exceptionTrendChart = echarts.init(exceptionTrendChartRef.value);
  }
  
  // 更新图表数据
  updateCharts();
}

// 更新所有图表
function updateCharts() {
  updateProjectExceptionStats();
  updateLineChart();
  updateDefectTypeChart();
  updateExceptionTrendChart();
}

// 更新项目不良异常统计
function updateProjectExceptionStats() {
  const data = filteredData.value;
  
  // 按项目分组并统计不良异常
  const projectStats = {};
  const defectTypeMap = {};
  const projectDefectCount = {};
  let totalExceptions = 0;
  
  data.forEach(item => {
    const project = item.project_name || item.projectName || item.project || item.project_id || '未知项目';
    const defectRate = parseFloat(item.defect_rate || item.defectRate || 0);
    const defects = (item.defect || '未知不良').split(',').map(d => d.trim()).filter(d => d);
    const isDefective = defectRate > 0 || item.status === '不良' || item.onlineStatus === '不良' || item.quality === '不合格';
    
    // 初始化项目统计
    if (!projectStats[project]) {
      projectStats[project] = {
        project,
        count: 0,
        totalCount: 0,
        defectRate: 0,
        defects: {},
        trend: Math.floor(Math.random() * 20) - 10 // 模拟趋势数据，实际应基于历史数据计算
      };
    }
    
    projectStats[project].totalCount++;
    
    // 如果是不良品，记录到项目统计
    if (isDefective) {
      projectStats[project].count++;
      totalExceptions++;
      
      // 记录不良类型
      defects.forEach(defect => {
        if (defect) {
          if (!projectStats[project].defects[defect]) {
            projectStats[project].defects[defect] = 0;
          }
          projectStats[project].defects[defect]++;
          
          // 全局不良类型统计
          if (!defectTypeMap[defect]) {
            defectTypeMap[defect] = 0;
          }
          defectTypeMap[defect]++;
          
          // 项目不良类型关联
          const projectDefectKey = `${project}-${defect}`;
          if (!projectDefectCount[projectDefectKey]) {
            projectDefectCount[projectDefectKey] = 0;
          }
          projectDefectCount[projectDefectKey]++;
        }
      });
    }
    
    // 计算项目不良率
    projectStats[project].defectRate = (projectStats[project].count / projectStats[project].totalCount) * 100;
  });
  
  // 转换为数组并排序
  const projectsArray = Object.values(projectStats)
    .sort((a, b) => b.count - a.count);
  
  // 更新项目异常统计数据 - 显示所有项目而不仅仅是前5个
  projectExceptionStats.value = projectsArray;
  totalProjectExceptions.value = totalExceptions;
  
  // 找出不良数量最多的项目
  if (projectsArray.length > 0) {
    worstProject.value = projectsArray[0].project;
  }
  
  // 找出最常见的不良类型
  let maxDefectCount = 0;
  let topDefectType = '';
  
  Object.entries(defectTypeMap).forEach(([defect, count]) => {
    if (count > maxDefectCount) {
      maxDefectCount = count;
      topDefectType = defect;
    }
  });
  
  mainDefectType.value = topDefectType;
  
  // 准备不良类型分布数据
  defectTypeStats.value = Object.entries(defectTypeMap)
    .map(([defect, count]) => ({
      name: defect,
      value: count
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // 只取前8种不良类型
  // 准备异常趋势数据（按日期分组）
  const trendMap = {};
  const now = new Date();
  const days = parseInt(timeRange.value) || 30;
  
  // 初始化最近几天的数据
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().substring(0, 10);
    trendMap[dateStr] = 0;
  }
  
  // 按日期统计异常数量
  data.forEach(item => {
    const dateStr = new Date(item.online_time || item.onlineTime).toISOString().substring(0, 10);
    const defectRate = parseFloat(item.defect_rate || item.defectRate || 0);
    const isDefective = defectRate > 5 || item.status === '不良' || item.quality === '不合格';
    
    if (isDefective && trendMap[dateStr] !== undefined) {
      trendMap[dateStr]++;
    }
  });
  
  // 将趋势数据转换为数组
  exceptionTrendData.value = Object.entries(trendMap).map(([date, count]) => ({
    date,
    count
  }));
}

// 更新生产线不良率对比图表
function updateLineChart() {
  if (!lineChart) return;
  
  const data = filteredData.value;
  
  // 按工厂分组并统计不良物料数量
  const factoryStats = {};
  
  data.forEach(item => {
    const factory = item.factory || '未知工厂';
    const isDefective = (item.status === '不良' || item.quality === '不合格' || 
                         parseFloat(item.defect_rate || item.defectRate || 0) > 5);
    
    if (factory) {
      if (!factoryStats[factory]) {
        factoryStats[factory] = {
          totalCount: 0,
          defectCount: 0
        };
      }
      
      factoryStats[factory].totalCount++;
      if (isDefective) {
        factoryStats[factory].defectCount++;
      }
    }
  });
  
  // 获取工厂和对应的不良数量
  const factories = Object.keys(factoryStats);
  const defectCounts = factories.map(factory => factoryStats[factory].defectCount);
  
  // 设置图表选项
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}起'
    },
    title: {
      text: '各工厂不良物料数量对比',
      left: 'center',
      top: 0
    },
    grid: {
      left: '10%',
      right: '5%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: factories,
      axisLabel: {
        interval: 0,
        rotate: 45,
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      name: '不良数量(起)',
      axisLabel: {
        formatter: '{value}起'
      }
    },
    series: [
      {
        name: '不良数量',
        type: 'bar',
        data: defectCounts,
        barWidth: '40%',
        itemStyle: {
          color: function(params) {
            const value = params.value;
            if (value > 10) return '#F56C6C'; // 红色
            if (value > 5) return '#E6A23C'; // 黄色
            return '#67C23A'; // 绿色
          }
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}起',
          fontSize: 12
        }
      }
    ]
  };
  
  // 应用图表选项
  lineChart.setOption(option);
}

// 更新不良类型分布图表
function updateDefectTypeChart() {
  if (!defectTypeChart || !defectTypeChartRef.value) return;
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}起({d}%)'
    },
    title: {
      text: '不良类型分布',
      left: 'center',
      top: 0
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 10,
      top: 40,
      bottom: 20,
      textStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '不良类型',
        type: 'pie',
        radius: ['35%', '65%'],
        center: ['40%', '55%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}起',
          fontSize: 12
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 10
        },
        data: defectTypeStats.value
      }
    ]
  };
  
  defectTypeChart.setOption(option);
}

// 更新异常趋势图表
function updateExceptionTrendChart() {
  if (!exceptionTrendChart || !exceptionTrendChartRef.value) return;
  
  // 提取日期和数量数组
  const dates = exceptionTrendData.value.map(item => item.date);
  const counts = exceptionTrendData.value.map(item => item.count);
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    title: {
      text: '不良异常趋势',
      left: 'center',
      top: 0
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        rotate: 45,
        interval: Math.floor(dates.length / 15),
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      name: '异常数量(起)',
      nameTextStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '异常数量',
        type: 'line',
        smooth: true,
        data: counts,
        markPoint: {
          data: [
            {type: 'max', name: '最大值'},
            {type: 'min', name: '最小值'}
          ]
        },
        markLine: {
          data: [
            {type: 'average', name: '平均值'}
          ]
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(220, 57, 18, 0.8)'
            }, {
              offset: 1, color: 'rgba(220, 57, 18, 0.1)'
            }]
          }
        },
        lineStyle: {
          width: 3,
          color: '#DC3912'
        },
        itemStyle: {
          color: '#DC3912'
        }
      }
    ]
  };
  
  exceptionTrendChart.setOption(option);
}

// 获取异常卡片类名
function getExceptionCardClass(count) {
  if (count > 10) return 'high-risk';
  if (count > 5) return 'medium-risk';
  return 'low-risk';
}

// 刷新数据
function refreshData() {
  updateStats();
  updateCharts();
  ElMessage.success('数据已刷新');
}

// 调整图表大小
function resizeCharts() {
  lineChart?.resize();
  defectTypeChart?.resize();
  exceptionTrendChart?.resize();
}

// 销毁图表
function disposeCharts() {
  lineChart?.dispose();
  defectTypeChart?.dispose();
  exceptionTrendChart?.dispose();
  
  lineChart = null;
  defectTypeChart = null;
  exceptionTrendChart = null;
}

// 格式化百分比
function formatPercent(value) {
  if (value === undefined || value === null) return '0.0%';
  return `${parseFloat(value).toFixed(1)}%`;
}

</script>

<style scoped>
.factory-quality-stats {
  padding: 20px 0;
}

.stats-overview {
  margin-bottom: 20px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stats-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.stats-cards {
  margin-top: 10px;
}

.stat-card {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #409EFF;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  height: 100%;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.chart-container {
  height: 400px;
  width: 100%;
}

@media (max-width: 768px) {
  .chart-container {
    height: 300px;
  }
}

.top-defects-card {
  margin-bottom: 20px;
}

.top-defect-table {
  padding: 10px;
}

.defect-insight {
  padding: 10px;
  border-top: 1px solid #e4e7ed;
}

.insight-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.insight-item .el-icon {
  margin-right: 5px;
}

.success-text {
  color: #67C23A;
}

.danger-text {
  color: #F56C6C;
}

.warning-text {
  color: #E6A23C;
}

.exceedance-card {
  margin-bottom: 20px;
}

.exceedance-table {
  padding: 10px;
}

.exceedance-insight {
  padding: 10px;
  border-top: 1px solid #e4e7ed;
}

/* 新增时间范围控件样式 */
.time-range-row {
  margin-bottom: 20px;
}

.time-range-container {
  display: flex;
  justify-content: flex-end;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.time-range-container .el-select {
  margin-right: 10px;
  width: 120px;
}

/* 项目异常统计卡片样式 */
.exception-tabs {
  height: 450px;
  overflow: hidden;
}

.exception-tabs :deep(.el-tabs__content) {
  height: calc(100% - 39px);
  overflow-y: auto;
}

.exception-stat-container {
  padding: 15px;
}

.exception-stat-card {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.exception-stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.exception-project {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 8px;
}

.exception-count {
  font-size: 24px;
  font-weight: 600;
  margin: 5px 0;
}

.exception-trend {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 14px;
  padding: 2px 8px;
  border-radius: 12px;
}

.trend-up {
  color: #F56C6C;
  background-color: rgba(245, 108, 108, 0.1);
}

.trend-down {
  color: #67C23A;
  background-color: rgba(103, 194, 58, 0.1);
}

.high-risk {
  background: linear-gradient(135deg, #fff 0%, #fff 70%, rgba(245, 108, 108, 0.2) 100%);
  border-left: 4px solid #F56C6C;
}

.medium-risk {
  background: linear-gradient(135deg, #fff 0%, #fff 70%, rgba(230, 162, 60, 0.2) 100%);
  border-left: 4px solid #E6A23C;
}

.low-risk {
  background: linear-gradient(135deg, #fff 0%, #fff 70%, rgba(103, 194, 58, 0.1) 100%);
  border-left: 4px solid #67C23A;
}

.exception-summary {
  margin-top: 20px;
  border-top: 1px dashed #e4e7ed;
  padding-top: 15px;
}

.summary-title {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 10px;
  color: #606266;
}

.summary-content p {
  margin: 5px 0;
  font-size: 13px;
}

.highlight {
  font-weight: bold;
  color: #409EFF;
}

.defect-type-chart {
  height: 380px;
  width: 100%;
}

.exception-trend-chart {
  height: 380px;
  width: 100%;
}

.normal-insight {
  display: flex;
  align-items: center;
  padding: 10px;
}

.normal-insight .el-icon {
  margin-right: 10px;
}
</style> 
 
 
