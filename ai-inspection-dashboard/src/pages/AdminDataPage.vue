<!-- 
  数据管理页面
  用于管理员对系统数据进行维护和更新
-->
<template>
  <div class="admin-data-page">
    <div class="page-header">
      <h1 class="page-title">数据管理平台</h1>
      <div class="header-actions">
        <el-button-group>
          <router-link to="/admin/data/rules">
            <el-button type="primary">
              <el-icon><Document /></el-icon>数据规则文档
            </el-button>
          </router-link>
          <router-link to="/admin/data/historical">
            <el-button type="primary">
              <el-icon><Histogram /></el-icon>历史数据管控
            </el-button>
          </router-link>
        </el-button-group>
        
        <el-button type="primary" @click="generateDialogVisible = true" style="margin-left: 10px;">
          <el-icon><Plus /></el-icon> 数据生成工具
        </el-button>
        <el-button type="warning" @click="cleanupDialogVisible = true">
          <el-icon><Delete /></el-icon> 数据清理
        </el-button>
      </div>
    </div>
    
    <!-- 平台概览 -->
    <el-row :gutter="20" class="dashboard-cards">
      <el-col :xs="24" :sm="12" :md="8">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <h3>数据统计</h3>
              <el-icon><DataLine /></el-icon>
            </div>
          </template>
          <div class="card-content">
            <div class="stat-item">
              <span class="stat-label">库存总数:</span>
              <span class="stat-value">{{ dataSummary.materialsCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">测试记录:</span>
              <span class="stat-value">{{ dataSummary.testsCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">上线记录:</span>
              <span class="stat-value">{{ dataSummary.onlineCount }}</span>
            </div>
            <div class="stat-date">
              <el-tag size="small" type="info">最后更新: {{ dataSummary.lastUpdated }}</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8">
        <el-card shadow="hover" class="dashboard-card">
              <template #header>
            <div class="card-header">
              <h3>数据健康状态</h3>
              <el-icon><DataAnalysis /></el-icon>
                </div>
          </template>
          <div class="card-content">
            <el-progress 
              :percentage="dataSummary.dataIntegrityPercent" 
              :status="getStatusType(dataSummary.dataIntegrityPercent)"
              :stroke-width="18"
              :format="format"
              class="data-integrity-progress"
            >
              <template #default="{ percentage }">
                <span class="progress-label">数据完整性: {{ percentage.toFixed(1) }}%</span>
              </template>
            </el-progress>

            <el-row :gutter="10" class="integrity-details">
              <el-col :span="8">
                <div class="integrity-item">
                  <div class="item-title">库存数据</div>
                  <el-progress 
                    :percentage="dataSummary.inventoryIntegrity" 
                    :status="getStatusType(dataSummary.inventoryIntegrity)" 
                  />
                </div>
              </el-col>
              <el-col :span="8">
                <div class="integrity-item">
                  <div class="item-title">测试数据</div>
                  <el-progress 
                    :percentage="dataSummary.testIntegrity" 
                    :status="getStatusType(dataSummary.testIntegrity)" 
                  />
                </div>
              </el-col>
              <el-col :span="8">
                <div class="integrity-item">
                  <div class="item-title">上线数据</div>
                  <el-progress 
                    :percentage="dataSummary.onlineIntegrity" 
                    :status="getStatusType(dataSummary.onlineIntegrity)" 
                  />
              </div>
              </el-col>
            </el-row>
              </div>
            </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="24" :md="8">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <h3>数据操作</h3>
              <el-icon><Operation /></el-icon>
            </div>
          </template>
          <div class="card-content actions-content">
            <div class="action-buttons">
              <el-button type="primary" @click="openDataGeneration">
                <el-icon><Plus /></el-icon>生成测试数据
              </el-button>
              <el-button type="success" @click="openDataImport">
                <el-icon><Upload /></el-icon>导入数据
              </el-button>
              <el-button type="warning" @click="backupData">
                <el-icon><Download /></el-icon>备份数据
              </el-button>
              <el-button type="danger" @click="confirmClearData">
                <el-icon><Delete /></el-icon>清空测试数据
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 新增：数据质量分析卡片 -->
    <el-card shadow="hover" class="data-insights-section">
      <template #header>
        <div class="card-header">
          <h2>质量数据分析</h2>
          <el-tag type="primary">实时洞察</el-tag>
        </div>
      </template>
      
      <el-row :gutter="20" class="insights-cards">
        <!-- TOP5不良物料卡片 -->
        <el-col :xs="24" :sm="12" :md="8">
          <el-card shadow="hover" class="insight-card">
            <template #header>
              <div class="insight-header">
                <h3>TOP5不良物料</h3>
                <el-tooltip content="不良率最高的五种物料" placement="top">
                  <el-icon><Warning /></el-icon>
                </el-tooltip>
              </div>
            </template>
            <div class="insight-content">
              <el-table :data="topDefectMaterials" style="width: 100%" size="small">
                <el-table-column prop="materialName" label="物料名称" min-width="120" />
                <el-table-column prop="defectRate" label="不良率" width="90">
                  <template #default="scope">
                    <el-tag :type="getDefectRateTagType(scope.row.defectRate)">
                      {{ formatDefectRate(scope.row.defectRate) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="defectCount" label="不良数" width="70" />
              </el-table>
              
              <div class="insight-summary" v-if="topDefectMaterials.length > 0">
                <el-alert
                  :title="`${topDefectMaterials.length > 0 ? topDefectMaterials[0].materialName : '-'} 是当前不良率最高的物料`"
                  type="warning"
                  :closable="false"
                  show-icon
                />
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 问题供应商卡片 -->
        <el-col :xs="24" :sm="12" :md="8">
          <el-card shadow="hover" class="insight-card">
            <template #header>
              <div class="insight-header">
                <h3>问题供应商分析</h3>
                <el-tooltip content="不良率超过5%的供应商" placement="top">
                  <el-icon><WarningFilled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            <div class="insight-content">
              <el-table :data="topDefectSuppliers" style="width: 100%" size="small">
                <el-table-column prop="supplierName" label="供应商" min-width="120" />
                <el-table-column prop="defectRate" label="不良率" width="90">
                  <template #default="scope">
                    <el-tag :type="getDefectRateTagType(scope.row.defectRate)">
                      {{ formatDefectRate(scope.row.defectRate) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="materialCount" label="物料种类" width="90" />
              </el-table>
              
              <div class="insight-summary">
                <el-progress 
                  :percentage="highRiskSupplierPercentage" 
                  :stroke-width="10"
                  :format="percent => `${highRiskSupplierCount}家供应商不良超标`"
                  :status="highRiskSupplierCount > 0 ? 'exception' : 'success'"
                />
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 不良类型统计卡片 -->
        <el-col :xs="24" :sm="12" :md="8">
          <el-card shadow="hover" class="insight-card">
            <template #header>
              <div class="insight-header">
                <h3>物料不良类型</h3>
                <el-tooltip content="按频率排序的不良现象统计" placement="top">
                  <el-icon><DataAnalysis /></el-icon>
                </el-tooltip>
              </div>
            </template>
            <div class="insight-content">
              <div class="defect-types-chart" style="height: 180px;">
                <div v-if="defectTypesLoading" class="chart-loading">
                  <el-skeleton :rows="5" animated />
                </div>
                <div v-else-if="defectTypesData.length === 0" class="no-data">
                  <el-empty description="暂无不良类型数据" />
                </div>
                <div v-else ref="defectTypesChartRef" style="width: 100%; height: 100%;"></div>
              </div>
              
              <div class="insight-summary">
                <el-alert
                  :title="`超标问题批次:${highRiskBatchCount}个，需要立即处理`"
                  type="error"
                  :closable="false"
                  show-icon
                />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 新增：专门的数据生成功能区域 -->
    <el-card shadow="hover" class="data-generation-section">
      <template #header>
        <div class="card-header">
          <h2>数据生成工具</h2>
          <el-tag type="success">新功能</el-tag>
        </div>
      </template>
      
      <div class="generation-options">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="8">
            <el-card shadow="hover" class="generation-card">
              <template #header>
                <div class="gen-card-header">
                  <h3>库存数据生成</h3>
                </div>
              </template>
              <div class="gen-card-content">
                <p>生成物料库存基础数据，包括物料编码、名称、供应商等信息</p>
                <el-form :inline="true" class="quick-gen-form">
                  <el-form-item label="数量">
                    <el-input-number v-model="quickGenOptions.inventory" :min="5" :max="200" size="small" />
                  </el-form-item>
                </el-form>
                <el-button type="primary" @click="generateInventoryData">
                  <el-icon><Plus /></el-icon> 生成库存数据
                </el-button>
              </div>
            </el-card>
          </el-col>
          
          <el-col :xs="24" :sm="8">
            <el-card shadow="hover" class="generation-card">
              <template #header>
                <div class="gen-card-header">
                  <h3>测试数据生成</h3>
                </div>
              </template>
              <div class="gen-card-content">
                <p>生成实验室测试数据，包括测试结果、参数、良率等信息</p>
                <el-form :inline="true" class="quick-gen-form">
                  <el-form-item label="数量">
                    <el-input-number v-model="quickGenOptions.lab" :min="5" :max="200" size="small" />
                  </el-form-item>
                </el-form>
                <el-button type="success" @click="generateLabData">
                  <el-icon><Plus /></el-icon> 生成测试数据
                </el-button>
          </div>
            </el-card>
          </el-col>
          
          <el-col :xs="24" :sm="8">
            <el-card shadow="hover" class="generation-card">
              <template #header>
                <div class="gen-card-header">
                  <h3>工厂数据生成</h3>
                </div>
              </template>
              <div class="gen-card-content">
                <p>生成工厂上线使用数据，包括工厂、产线、使用情况等信息</p>
                <el-form :inline="true" class="quick-gen-form">
                  <el-form-item label="数量">
                    <el-input-number v-model="quickGenOptions.factory" :min="5" :max="200" size="small" />
                  </el-form-item>
                </el-form>
                <el-button type="warning" @click="generateFactoryData">
                  <el-icon><Plus /></el-icon> 生成工厂数据
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <div class="advanced-generation">
          <el-divider>高级数据生成</el-divider>
          <el-button type="primary" size="large" @click="openDataGeneration">
            <el-icon><Setting /></el-icon> 打开完整数据生成工具
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 数据生成工具对话框 -->
    <el-dialog
      v-model="dataGenerationVisible"
      title="数据生成工具"
      width="70%"
    >
      <data-generation-panel @generation-complete="handleGenerationComplete" />
    </el-dialog>

    <!-- 数据导入对话框 -->
    <el-dialog
      v-model="dataImportVisible"
      title="导入数据"
      width="50%"
    >
      <el-form :model="importForm" label-width="120px">
        <el-form-item label="数据类型">
          <el-select v-model="importForm.dataType" placeholder="选择数据类型">
            <el-option label="库存物料数据" value="inventory" />
            <el-option label="实验室测试数据" value="lab" />
            <el-option label="上线使用数据" value="online" />
            <el-option label="完整数据集" value="all" />
          </el-select>
        </el-form-item>
        <el-form-item label="文件">
          <el-upload
            class="file-upload"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
          >
            <template #trigger>
              <el-button type="primary">选择文件</el-button>
                </template>
            <template #tip>
              <div class="el-upload__tip">
                请上传JSON或CSV格式的数据文件
          </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dataImportVisible = false">取消</el-button>
          <el-button type="primary" @click="importData" :disabled="!importForm.file">
            导入
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 模块功能导航 -->
    <el-card class="feature-card">
      <template #header>
        <div class="card-header">
          <h2>数据管理功能</h2>
          </div>
      </template>
      
      <el-row :gutter="20" class="feature-grid">
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <router-link to="/admin/data/rules">
            <el-card shadow="hover" class="module-card">
              <el-icon class="module-icon"><Document /></el-icon>
              <h3 class="module-title">数据规则文档</h3>
              <p class="module-desc">查看系统数据规则说明文档，了解数据生成逻辑和规则定义</p>
            </el-card>
          </router-link>
        </el-col>
        

        
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <router-link to="/admin/data">
            <el-card shadow="hover" class="module-card">
              <el-icon class="module-icon"><DataAnalysis /></el-icon>
              <h3 class="module-title">数据生成工具</h3>
              <p class="module-desc">生成测试数据，包括库存、测试和上线数据</p>
            </el-card>
              </router-link>
        </el-col>
      </el-row>
    </el-card>

    <!-- 最近操作记录 -->
    <el-card class="history-card">
      <template #header>
        <div class="card-header">
          <h2>最近数据操作记录</h2>
          <el-button text>查看全部记录</el-button>
        </div>
      </template>
      
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in recentActivities"
          :key="index"
          :type="activity.type"
          :timestamp="activity.timestamp"
          :icon="getActivityIcon(activity.action)"
          :size="activity.important ? 'large' : 'normal'"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 数据生成状态 -->
    <el-dialog
      v-model="generationDialogVisible"
      title="数据生成进度"
      width="500px"
      :close-on-click-modal="false"
      :show-close="false"
    >
      <div class="generation-progress">
        <el-progress 
          :percentage="generationProgress" 
          :status="generationProgress === 100 ? 'success' : ''"
          :stroke-width="18"
        />
        <div class="progress-message">{{ generationMessage }}</div>
  </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="generationDialogVisible = false" :disabled="generationInProgress">取消</el-button>
          <el-button type="primary" @click="completeGeneration" :disabled="generationInProgress || generationProgress !== 100">
            完成
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 提示信息卡片 -->
    <el-card shadow="hover" class="tip-card">
      <template #header>
        <div class="card-header">
          <h3>数据集成提示</h3>
          <el-icon><InfoFilled /></el-icon>
        </div>
      </template>
      <div class="tip-content">
        <p><strong>历史数据与新生成数据的集成说明：</strong></p>
        <ol>
          <li>历史数据通过"历史数据管控"页面导入和管理，作为固定基础数据</li>
          <li>新数据通过"数据生成工具"生成，会自动与历史数据集成</li>
          <li>系统会确保数据的一致性，避免批次号等关键字段重复</li>
          <li>在库存、测试和上线页面中，将同时展示历史数据和新生成的数据</li>
        </ol>
        <p class="tip-note">注意：清空测试数据不会影响已导入的历史数据</p>
      </div>
    </el-card>

    <!-- 数据清理对话框 -->
    <el-dialog
      title="数据清理工具"
      v-model="cleanupDialogVisible"
      width="500px"
    >
      <el-alert
        title="警告：此操作将清理旧数据以释放存储空间"
        type="warning"
        description="您可以选择保留最新的数据条数，其余较旧的数据将被删除。此操作不可撤销！"
        show-icon
        :closable="false"
      />
      
      <div class="storage-usage-info" v-if="storageUsage">
        <h3>存储空间使用情况</h3>
        <el-progress
          :percentage="parseFloat(storageUsage.usagePercentage)"
          :status="parseFloat(storageUsage.usagePercentage) > 80 ? 'exception' : 'normal'"
        ></el-progress>
        <p>总使用: {{ storageUsage.totalSize }}KB / {{ storageUsage.limit }}</p>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="库存数据">{{ storageUsage.details.inventory || 0 }}KB</el-descriptions-item>
          <el-descriptions-item label="测试数据">{{ storageUsage.details.lab || 0 }}KB</el-descriptions-item>
          <el-descriptions-item label="上线数据">{{ storageUsage.details.factory || 0 }}KB</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <div class="cleanup-options">
        <h3>清理选项</h3>
        <el-form label-position="top">
          <el-form-item label="每种数据保留最新的条数">
            <el-input-number v-model="cleanupOptions.keepCount" :min="50" :max="500" :step="50" />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cleanupDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmCleanupData">确认清理</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Document, Check, Setting, DataLine, DataAnalysis, 
  Operation, Plus, Upload, Download, Delete,
  Warning, CircleCheck, Refresh, InfoFilled, Connection, Management,
  Histogram, WarningFilled
} from '@element-plus/icons-vue';
import DataGenerationPanel from '../components/admin/DataGenerationPanel.vue';
import { getModuleIcon } from '../utils/iconMapping.js';
import { useDataValidator } from '../composables/useDataValidator.js';
import { useDataBackup } from '../composables/useDataBackup.js';
import unifiedDataService from '../services/UnifiedDataService.js';
import systemDataUpdater from '../services/SystemDataUpdater.js';
import FactoryDataService from '../services/FactoryDataService.js';
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

// 注册必须的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  CanvasRenderer
]);

// 数据生成对话框
const dataGenerationVisible = ref(false);

// 数据生成配置对话框
const generateDataDialogVisible = ref(false);
const generateDataForm = reactive({
  baselineCount: 5,
  projectsPerBaseline: 4,
  inventoryCount: 50,
  labTestCount: 80,
  onlineCount: 60
});

// 数据导入对话框
const dataImportVisible = ref(false);
const importForm = reactive({
  dataType: 'inventory',
  file: null
});

// 数据生成对话框相关
const generationDialogVisible = ref(false);
const generationProgress = ref(0);
const generationMessage = ref('');
const generationInProgress = ref(false);

// 数据验证器
const { validateAllData } = useDataValidator();

// 数据备份
const { backupSystemData, restoreSystemData } = useDataBackup();

// 数据概览
const dataSummary = reactive({
  materialsCount: 0,
  testsCount: 0,
  onlineCount: 0,
  lastUpdated: '未获取',
  dataIntegrityPercent: 0,
  inventoryIntegrity: 0,
  testIntegrity: 0,
  onlineIntegrity: 0,
  baselineIntegrity: 0
});

// 最近活动
const recentActivities = ref([
  {
    content: '生成了300条库存物料数据',
    timestamp: '2023-05-15 09:30:22',
    action: 'generate',
    type: 'primary',
    important: false
  },
  {
    content: '执行了数据一致性校验，修复了15个问题',
    timestamp: '2023-05-14 15:45:10',
    action: 'validate',
    type: 'success',
    important: true
  },
  {
    content: '更新了数据需求定义，修改了批次号格式要求',
    timestamp: '2023-05-13 11:20:35',
    action: 'update',
    type: 'warning',
    important: false
  },
  {
    content: '备份了系统数据',
    timestamp: '2023-05-12 17:05:42',
    action: 'backup',
    type: 'info',
    important: false
  }
]);

// 计算是否有数据
const hasData = computed(() => {
  return dataSummary.materialsCount > 0 || dataSummary.testsCount > 0 || dataSummary.onlineCount > 0;
});

// 添加快速生成数据相关的变量
const quickGenOptions = ref({
  inventory: 50,
  lab: 30,
  factory: 20
});

// 数据清理相关
const cleanupDialogVisible = ref(false);
const cleanupOptions = reactive({
  keepCount: 100
});
const storageUsage = ref(null);

// 新增：数据质量分析卡片
const topDefectMaterials = ref([]);
const topDefectSuppliers = ref([]);
const highRiskSupplierPercentage = ref(0);
const highRiskSupplierCount = ref(0);
const highRiskBatchCount = ref(0);
const defectTypesLoading = ref(true);
const defectTypesData = ref([]);
const defectTypesChartRef = ref(null);
const defectTypesChart = ref(null);

// 在组件挂载时加载数据
onMounted(() => {
  loadDataSummary();
  
  // 获取存储使用情况
  getStorageUsage();
  
  // 监听存储变化
  window.addEventListener('storage', () => {
    loadDataSummary();
    getStorageUsage();
  });
});

// 加载数据概览
function loadDataSummary() {
  try {
    // 使用统一数据服务获取数据
    const inventoryData = unifiedDataService.getInventoryData();
    const labData = unifiedDataService.getLabData();
    const onlineData = unifiedDataService.getFactoryData();
    
    // 更新数据概览
    dataSummary.materialsCount = inventoryData.length;
    dataSummary.testsCount = labData.length;
    dataSummary.onlineCount = onlineData.length;
    dataSummary.lastUpdated = new Date().toLocaleString();
    
    // 计算数据完整性分数
    calculateDataIntegrity(inventoryData, labData, onlineData);
    
    // 计算TOP5不良物料
    topDefectMaterials.value = calculateTopDefectMaterials(inventoryData, labData, onlineData);
    
    // 计算问题供应商
    topDefectSuppliers.value = calculateTopDefectSuppliers(inventoryData, labData, onlineData);
    
    // 计算高风险供应商
    highRiskSupplierPercentage.value = calculateHighRiskSupplierPercentage(inventoryData, labData, onlineData);
    highRiskSupplierCount.value = calculateHighRiskSupplierCount(inventoryData, labData, onlineData);
    
    // 计算不良类型统计
    calculateDefectTypesData(inventoryData, labData, onlineData);
  } catch (error) {
    console.error('加载数据概览失败:', error);
    ElMessage.error('加载数据概览失败');
  }
}

// 计算数据完整性分数
function calculateDataIntegrity(inventoryData, labData, onlineData) {
  // 简单实现，实际应基于规则进行计算
  const inventoryScore = calculateModuleIntegrity(inventoryData, ['material_id', 'material_name', 'material_type', 'material_spec', 'batch_no', 'supplier']);
  const labScore = calculateModuleIntegrity(labData, ['test_id', 'material_id', 'batch_no', 'test_result', 'project_name']);
  const onlineScore = calculateModuleIntegrity(onlineData, ['online_id', 'material_id', 'batch_no', 'production_line', 'project_name']);
  
  dataSummary.inventoryIntegrity = inventoryScore;
  dataSummary.testIntegrity = labScore;
  dataSummary.onlineIntegrity = onlineScore;
  
  // 综合分数，加权平均
  dataSummary.dataIntegrityPercent = (
    inventoryScore * 0.4 + 
    labScore * 0.3 + 
    onlineScore * 0.3
  );
}

// 计算单个模块的数据完整性分数
function calculateModuleIntegrity(data, requiredFields) {
  if (!data.length) return 100; // 没有数据视为完整
  
  let totalFields = data.length * requiredFields.length;
  let validFields = 0;
  
  // 统计必填字段的有效值数量
  for (const item of data) {
    for (const field of requiredFields) {
      if (item[field] !== undefined && item[field] !== null && item[field] !== '') {
        validFields++;
      }
    }
  }
  
  return totalFields > 0 ? (validFields / totalFields) * 100 : 100;
}

// 获取进度条状态类型
function getStatusType(percentage) {
  if (percentage >= 90) return 'success';
  if (percentage >= 70) return 'warning';
  return 'exception';
}

// 格式化进度条显示
function format(percentage) {
  return percentage === 100 ? '完整' : `${percentage.toFixed(1)}%`;
}

// 获取活动图标
function getActivityIcon(action) {
  switch (action) {
    case 'generate': return Plus;
    case 'validate': return Check;
    case 'update': return Setting;
    case 'backup': return Download;
    default: return Document;
  }
}

// 打开数据生成工具
function openDataGeneration() {
  // 使用新的数据生成对话框
  generateDataDialogVisible.value = true;
}

// 显示数据生成对话框
function showGenerateDataDialog() {
  generateDataDialogVisible.value = true;
}

// 生成测试数据
function generateTestData() {
  try {
    // 使用SystemDataUpdater替代TestDataGenerator生成数据
    const result = systemDataUpdater.initializeSystemData({
      inventoryCount: generateDataForm.inventoryCount,
      labTestCount: generateDataForm.labTestCount,
      factoryCount: generateDataForm.onlineCount,
      clearExisting: true
    });
    
    // 关闭对话框
    generateDataDialogVisible.value = false;
    
    // 显示结果提示
    ElMessage.success(`成功生成测试数据集`);
    
    // 添加操作记录
    addActivityRecord(`生成了完整测试数据集`, 'generate');
    
    // 刷新数据概览
    loadDataSummary();
  } catch (error) {
    console.error('生成测试数据失败:', error);
    ElMessage.error('生成测试数据失败');
  }
}

// 处理数据生成完成事件
function handleGenerationComplete(result) {
  // 关闭对话框
  dataGenerationVisible.value = false;
  
  // 显示结果提示
  ElMessage.success(`成功生成 ${result.count} 条${result.type}数据`);
  
  // 添加操作记录
  addActivityRecord(`生成了${result.count}条${result.typeName}数据`, 'generate');
  
  // 刷新数据概览
  loadDataSummary();
}

// 打开数据导入对话框
function openDataImport() {
  dataImportVisible.value = true;
}

// 处理文件选择
function handleFileChange(file) {
  importForm.file = file;
}

// 导入数据
function importData() {
  if (!importForm.file) {
    ElMessage.warning('请选择要导入的文件');
    return;
  }
  
  // 读取文件内容
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      // 解析文件内容
      const data = importForm.file.raw.name.endsWith('.json')
        ? JSON.parse(e.target.result)
        : parseCSV(e.target.result);
      
      let success = false;
      
      // 使用UnifiedDataService存储数据，而不是直接操作localStorage
      if (importForm.dataType === 'inventory' || importForm.dataType === 'all') {
        const inventoryData = data.inventory || data;
        success = unifiedDataService.saveInventoryData(inventoryData, true);
      }
      
      if (importForm.dataType === 'lab' || importForm.dataType === 'all') {
        const labData = data.lab || data;
        success = unifiedDataService.saveLabData(labData, true);
      }
      
      if (importForm.dataType === 'online' || importForm.dataType === 'all') {
        const onlineData = data.online || data;
        success = unifiedDataService.saveFactoryData(onlineData, true);
      }
      
      // 关闭对话框
      dataImportVisible.value = false;
      
      if (success) {
      // 显示结果提示
      ElMessage.success('数据导入成功');
      
      // 添加操作记录
      addActivityRecord(`导入了${importForm.dataType === 'all' ? '完整' : importForm.dataType}数据文件`, 'import');
      
      // 刷新数据概览
      loadDataSummary();
      } else {
        ElMessage.error('导入数据失败，请检查数据格式');
      }
    } catch (error) {
      console.error('导入数据失败:', error);
      ElMessage.error('导入数据失败，请检查文件格式');
    }
  };
  
  reader.readAsText(importForm.file.raw);
}

// CSV解析(简单实现)
function parseCSV(text) {
  // 实际应用中应使用更完善的CSV解析库
  const lines = text.split('\n');
  const headers = lines[0].split(',');
  const results = [];
  
  for (let i = 1; i < lines.length; i++) {
    const data = lines[i].split(',');
    if (data.length === headers.length) {
      const item = {};
      for (let j = 0; j < headers.length; j++) {
        item[headers[j]] = data[j];
      }
      results.push(item);
    }
  }
  
  return results;
}

// 备份数据
function backupData() {
  try {
    // 使用统一数据服务获取所有数据
    const allData = {
      baseline: JSON.parse(localStorage.getItem('baseline_data') || '[]'), // 基线数据暂时仍从localStorage获取
      inventory: unifiedDataService.getInventoryData(),
      lab: unifiedDataService.getLabData(),
      online: unifiedDataService.getFactoryData()
    };
    
    // 使用备份服务
    const backupResult = backupSystemData(allData);
    
    if (backupResult.success) {
      // 添加操作记录
      addActivityRecord('备份了系统数据', 'backup');
      
      ElMessage.success('数据备份成功');
    } else {
      ElMessage.error(`备份失败: ${backupResult.error}`);
    }
    
  } catch (error) {
    console.error('备份数据失败:', error);
    ElMessage.error('备份数据失败');
  }
}

// 确认清空数据
function confirmClearData() {
  ElMessageBox.confirm(
    '确定要清空所有测试数据吗？此操作不可撤销。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
  .then(() => {
    clearData();
  })
  .catch(() => {
    // 用户取消操作，不做处理
  });
}

// 清空数据
function clearData() {
  try {
    // 使用UnifiedDataService清空所有数据
    const success = unifiedDataService.clearAllData();
    
    if (success) {
      // 刷新数据概览
      loadDataSummary();
      
      // 添加操作记录
      addActivityRecord('清空了所有测试数据', 'delete', 'danger', true);
      
      ElMessage.success('数据已清空');
    } else {
      throw new Error('清空数据失败');
    }
  } catch (error) {
    console.error('清空数据失败:', error);
    ElMessage.error('清空数据失败');
  }
}

// 添加操作记录
function addActivityRecord(content, action, type = 'primary', important = false) {
  recentActivities.value.unshift({
    content,
    timestamp: new Date().toLocaleString(),
    action,
    type,
    important
  });
  
  // 限制记录数量
  if (recentActivities.value.length > 10) {
    recentActivities.value = recentActivities.value.slice(0, 10);
  }
}

// 快速生成库存数据
async function generateInventoryData() {
  try {
    ElMessage.info(`正在生成${quickGenOptions.value.inventory}条库存数据...`);
    
    const result = await systemDataUpdater.generateInventoryData(
      quickGenOptions.value.inventory,
      false // 不清空现有数据
    );
    
    if (result && result.success) {
      ElMessage.success(`成功生成${result.count}条库存数据`);
      // 添加操作记录
      addActivityRecord(`生成了${result.count}条库存数据`, 'generate');
      updateDataSummary();

      // 推送数据到问答助手
      try {
        await systemDataUpdater.pushDataToAssistant();
        console.log('✅ 库存数据已推送到问答助手');
      } catch (pushError) {
        console.warn('⚠️ 推送数据到问答助手失败:', pushError);
      }
    } else {
      ElMessage.error(`库存数据生成失败: ${result && result.message ? result.message : '未知错误'}`);
    }
  } catch (error) {
    console.error('生成库存数据时出错:', error);
    ElMessage.error(`生成库存数据时出错: ${error.message}`);
  }
}

// 快速生成测试数据
async function generateLabData() {
  try {
    const count = parseInt(quickGenOptions.value.lab);
    if (isNaN(count) || count <= 0) {
      ElMessage.warning('请输入有效的数据生成数量');
      return;
    }
    
    ElMessage.info(`正在生成${count}条测试数据...`);
    
    const result = await systemDataUpdater.generateLabData(
      count,
      false // 不清空现有数据
    );
    
    if (result && result.success) {
      ElMessage.success(`成功生成${result.count}条测试数据`);
      // 添加操作记录
      addActivityRecord(`生成了${result.count}条测试数据`, 'generate');

      // 添加调试日志
      console.log('测试数据生成成功:', result);
      console.log('测试数据可以在LabView页面查看');

      // 更新数据概览
      updateDataSummary();

      // 推送数据到问答助手
      try {
        await systemDataUpdater.pushDataToAssistant();
        console.log('✅ 测试数据已推送到问答助手');
      } catch (pushError) {
        console.warn('⚠️ 推送数据到问答助手失败:', pushError);
      }

      // 提示用户刷新测试页面
      ElMessage({
        message: '请刷新测试页面查看新生成的数据',
        type: 'info',
        duration: 5000
      });
    } else {
      ElMessage.error(`测试数据生成失败: ${result && result.message ? result.message : '未知错误'}`);
    }
  } catch (error) {
    console.error('生成测试数据时出错:', error);
    ElMessage.error(`生成测试数据时出错: ${error.message}`);
  }
}

// 快速生成工厂数据
async function generateFactoryData() {
  try {
    const count = parseInt(quickGenOptions.value.factory);
    if (isNaN(count) || count <= 0) {
      ElMessage.warning('请输入有效的数据生成数量');
      return;
    }
    
    ElMessage.info(`正在生成${count}条工厂数据...`);
    
    const result = await systemDataUpdater.generateFactoryData(
      count,
      false // 不清空现有数据
    );
    
    if (result && result.success) {
      ElMessage.success(`成功生成${result.count}条工厂数据`);
      // 添加操作记录
      addActivityRecord(`生成了${result.count}条工厂数据`, 'generate');
      updateDataSummary();

      // 推送数据到问答助手
      try {
        await systemDataUpdater.pushDataToAssistant();
        console.log('✅ 工厂数据已推送到问答助手');
      } catch (pushError) {
        console.warn('⚠️ 推送数据到问答助手失败:', pushError);
      }
    } else {
      ElMessage.error(`工厂数据生成失败: ${result && result.message ? result.message : '未知错误'}`);
    }
  } catch (error) {
    console.error('生成工厂数据时出错:', error);
    ElMessage.error(`生成工厂数据时出错: ${error.message}`);
  }
}

// 更新数据概览
function updateDataSummary() {
  loadDataSummary();
}

// 完成数据生成
const completeGeneration = () => {
  generationDialogVisible.value = false;
  generationProgress.value = 0;
  generationMessage.value = '';
};

// 格式化不良率显示
function formatDefectRate(rate) {
  if (rate === undefined || rate === null) return '0.0%';
  if (typeof rate === 'string' && rate.includes('%')) return rate;
  return `${Number(rate).toFixed(1)}%`;
}

// 获取不良率对应的标签类型
function getDefectRateTagType(rate) {
  const defectRate = typeof rate === 'string' ? parseFloat(rate) : rate;
  if (defectRate >= 5) return 'danger';
  if (defectRate >= 2) return 'warning';
  return 'success';
}

// 获取存储使用情况
function getStorageUsage() {
  storageUsage.value = unifiedDataService.getStorageUsage();
}

// 确认清理数据
function confirmCleanupData() {
  ElMessageBox.confirm(
    `确定要清理旧数据吗？将只保留每种数据最新的${cleanupOptions.keepCount}条记录，其余数据将被删除。`,
    '确认清理',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    cleanupData();
  }).catch(() => {
    // 用户取消操作
  });
}

// 执行数据清理
async function cleanupData() {
  try {
    const result = unifiedDataService.cleanupOldData(cleanupOptions.keepCount);
    
    if (result) {
      ElMessage.success('数据清理成功');
      // 添加操作记录
      addActivityRecord(`清理了旧数据，保留每种数据最新的${cleanupOptions.keepCount}条`, 'cleanup');
      // 更新数据概览
      updateDataSummary();
      // 更新存储使用情况
      getStorageUsage();
    } else {
      ElMessage.error('数据清理失败');
    }
    
    cleanupDialogVisible.value = false;
  } catch (error) {
    console.error('数据清理出错:', error);
    ElMessage.error(`数据清理出错: ${error.message}`);
  }
}

// 计算TOP5不良物料
function calculateTopDefectMaterials(inventoryData, labData, onlineData) {
  try {
    // 合并实验室测试和上线数据中的不良情况
    const materialDefects = new Map();
    
    // 处理实验室测试数据
    labData.forEach(item => {
      const materialName = item.materialName || item.material_name;
      if (!materialName) return;
      
      // 检查是否为不良品
      const isDefect = item.result === '不合格' || item.status === '不合格';
      
      if (!materialDefects.has(materialName)) {
        materialDefects.set(materialName, {
          materialName: materialName,
          totalCount: 0,
          defectCount: 0,
          defectRate: 0
        });
      }
      
      const data = materialDefects.get(materialName);
      data.totalCount++;
      if (isDefect) data.defectCount++;
    });
    
    // 处理上线数据
    onlineData.forEach(item => {
      const materialName = item.materialName || item.material_name;
      if (!materialName) return;
      
      if (!materialDefects.has(materialName)) {
        materialDefects.set(materialName, {
          materialName: materialName,
          totalCount: 0,
          defectCount: 0,
          defectRate: 0
        });
      }
      
      const data = materialDefects.get(materialName);
      data.totalCount++;
      
      // 检查是否有不良描述或不良现象
      if (item.defectDescription || (item.defectType && item.defectType !== '无') || item.hasDefect === true) {
        data.defectCount++;
      }
    });
    
    // 计算不良率并转换为数组
    const result = Array.from(materialDefects.values()).map(item => {
      item.defectRate = item.totalCount > 0 ? (item.defectCount / item.totalCount) * 100 : 0;
      return item;
    });
    
    // 按不良率排序并取TOP5
    return result
      .filter(item => item.totalCount >= 5)  // 至少有5个样本
      .sort((a, b) => b.defectRate - a.defectRate)
      .slice(0, 5);
  } catch (error) {
    console.error('计算TOP5不良物料失败:', error);
    return [];
  }
}

// 计算问题供应商
function calculateTopDefectSuppliers(inventoryData, labData, onlineData) {
  try {
    // 创建供应商-物料映射
    const supplierMaterialMap = new Map();
    
    // 从库存数据获取供应商-物料映射关系
    inventoryData.forEach(item => {
      const supplier = item.supplier;
      const material = item.materialName || item.material_name;
      
      if (!supplier || !material) return;
      
      if (!supplierMaterialMap.has(supplier)) {
        supplierMaterialMap.set(supplier, new Set());
      }
      
      supplierMaterialMap.get(supplier).add(material);
    });
    
    // 合并测试和上线数据中的不良情况
    const supplierDefects = new Map();
    
    // 处理测试数据
    labData.forEach(item => {
      const supplier = item.supplier;
      if (!supplier) return;
      
      const isDefect = item.result === '不合格' || item.status === '不合格';
      
      if (!supplierDefects.has(supplier)) {
        supplierDefects.set(supplier, {
          supplierName: supplier,
          totalCount: 0,
          defectCount: 0,
          defectRate: 0,
          materialCount: supplierMaterialMap.has(supplier) ? supplierMaterialMap.get(supplier).size : 0
        });
      }
      
      const data = supplierDefects.get(supplier);
      data.totalCount++;
      if (isDefect) data.defectCount++;
    });
    
    // 处理上线数据
    onlineData.forEach(item => {
      const supplier = item.supplier;
      if (!supplier) return;
      
      if (!supplierDefects.has(supplier)) {
        supplierDefects.set(supplier, {
          supplierName: supplier,
          totalCount: 0,
          defectCount: 0,
          defectRate: 0,
          materialCount: supplierMaterialMap.has(supplier) ? supplierMaterialMap.get(supplier).size : 0
        });
      }
      
      const data = supplierDefects.get(supplier);
      data.totalCount++;
      
      // 检查是否有不良描述或不良现象
      if (item.defectDescription || (item.defectType && item.defectType !== '无') || item.hasDefect === true) {
        data.defectCount++;
      }
    });
    
    // 计算不良率并转换为数组
    const result = Array.from(supplierDefects.values()).map(item => {
      item.defectRate = item.totalCount > 0 ? (item.defectCount / item.totalCount) * 100 : 0;
      return item;
    });
    
    // 按不良率排序并取TOP5
    return result
      .filter(item => item.totalCount >= 3)  // 至少有3个样本
      .sort((a, b) => b.defectRate - a.defectRate)
      .slice(0, 5);
  } catch (error) {
    console.error('计算问题供应商失败:', error);
    return [];
  }
}

// 计算高风险供应商比例
function calculateHighRiskSupplierPercentage(inventoryData, labData, onlineData) {
  try {
    // 获取所有供应商
    const allSuppliers = new Set();
    const highRiskSuppliers = new Set();
    
    // 合并数据获取供应商不良率
    const supplierDefects = calculateTopDefectSuppliers(inventoryData, labData, onlineData);
    
    supplierDefects.forEach(item => {
      allSuppliers.add(item.supplierName);
      // 不良率超过5%视为高风险
      if (item.defectRate > 5) {
        highRiskSuppliers.add(item.supplierName);
      }
    });
    
    // 如果没有供应商数据，返回0
    if (allSuppliers.size === 0) return 0;
    
    // 计算高风险供应商占比
    return (highRiskSuppliers.size / allSuppliers.size) * 100;
  } catch (error) {
    console.error('计算高风险供应商比例失败:', error);
    return 0;
  }
}

// 计算高风险供应商数量
function calculateHighRiskSupplierCount(inventoryData, labData, onlineData) {
  try {
    // 获取所有高风险供应商
    const highRiskSuppliers = new Set();
    
    // 合并数据获取供应商不良率
    const supplierDefects = calculateTopDefectSuppliers(inventoryData, labData, onlineData);
    
    supplierDefects.forEach(item => {
      // 不良率超过5%视为高风险
      if (item.defectRate > 5) {
        highRiskSuppliers.add(item.supplierName);
      }
    });
    
    return highRiskSuppliers.size;
  } catch (error) {
    console.error('计算高风险供应商数量失败:', error);
    return 0;
  }
}

// 计算不良类型统计
function calculateDefectTypesData(inventoryData, labData, onlineData) {
  try {
    defectTypesLoading.value = true;
    // 统计不良类型频率
    const defectTypesMap = new Map();
    
    // 从测试数据和上线数据中收集不良类型
    const collectDefectTypes = (data) => {
      data.forEach(item => {
        // 提取不良类型
        let defectType = item.defectType || item.defect_type;
        
        // 如果没有明确的不良类型，尝试从描述中提取
        if (!defectType && item.defectDescription) {
          // 简单的分词提取关键词作为不良类型
          const keywords = ['划伤', '破裂', '变形', '污渍', '漏光', '断裂', '异常', '偏色', '鼓包', '漏液'];
          for (const keyword of keywords) {
            if (item.defectDescription.includes(keyword)) {
              defectType = keyword;
              break;
            }
          }
        }
        
        // 如果还是没有不良类型，但标记为不合格，归类为"其他"
        if ((!defectType || defectType === '无') && 
            (item.result === '不合格' || item.status === '不合格' || item.hasDefect === true)) {
          defectType = '其他';
        }
        
        // 统计不良类型
        if (defectType && defectType !== '无') {
          const count = defectTypesMap.get(defectType) || 0;
          defectTypesMap.set(defectType, count + 1);
        }
      });
    };
    
    collectDefectTypes(labData);
    collectDefectTypes(onlineData);
    
    // 转换为图表数据格式
    const result = Array.from(defectTypesMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // 取前8种不良类型
    
    defectTypesData.value = result;
    defectTypesLoading.value = false;
    
    // 计算超标批次数量
    calculateHighRiskBatches(labData, onlineData);
    
    // 初始化图表
    nextTick(() => {
      if (defectTypesChart.value && defectTypesData.value.length > 0) {
        initDefectTypesChart();
      }
    });
    
  } catch (error) {
    console.error('计算不良类型统计失败:', error);
    defectTypesLoading.value = false;
    defectTypesData.value = [];
  }
}

// 计算超标批次数量
function calculateHighRiskBatches(labData, onlineData) {
  try {
    // 批次不良率映射
    const batchDefectMap = new Map();
    
    // 统计每个批次的测试总数和不良数
    const processBatchData = (data) => {
      data.forEach(item => {
        const batchNo = item.batchNo || item.batch_no;
        if (!batchNo) return;
        
        if (!batchDefectMap.has(batchNo)) {
          batchDefectMap.set(batchNo, { total: 0, defect: 0 });
        }
        
        const batchData = batchDefectMap.get(batchNo);
        batchData.total++;
        
        // 检查是否不良
        if (item.result === '不合格' || item.status === '不合格' || 
            item.defectDescription || 
            (item.defectType && item.defectType !== '无') || 
            item.hasDefect === true) {
          batchData.defect++;
        }
      });
    };
    
    processBatchData(labData);
    processBatchData(onlineData);
    
    // 计算超标批次数量（不良率超过5%且至少有5个样本）
    let highRiskCount = 0;
    batchDefectMap.forEach((data, batchNo) => {
      if (data.total >= 5 && (data.defect / data.total) > 0.05) {
        highRiskCount++;
      }
    });
    
    highRiskBatchCount.value = highRiskCount;
  } catch (error) {
    console.error('计算超标批次数量失败:', error);
    highRiskBatchCount.value = 0;
  }
}

// 初始化不良类型图表
function initDefectTypesChart() {
  // 确保已加载echarts
  if (!echarts) {
    console.error('未加载echarts库');
    return;
  }

  // 确保DOM元素存在
  if (!defectTypesChartRef.value) {
    console.error('找不到图表DOM元素');
    return;
  }

  // 初始化图表
  const chart = echarts.init(defectTypesChartRef.value);
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '8%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: defectTypesData.value.map(item => item.name),
        axisTick: {
          alignWithLabel: true
        },
        axisLabel: {
          interval: 0,
          rotate: 30
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '次数'
      }
    ],
    series: [
      {
        name: '出现次数',
        type: 'bar',
        barWidth: '60%',
        data: defectTypesData.value.map(item => ({
          value: item.value,
          itemStyle: {
            color: item.value > 10 ? '#F56C6C' : (item.value > 5 ? '#E6A23C' : '#67C23A')
          }
        })),
        label: {
          show: true,
          position: 'top'
        }
      }
    ]
  };
  
  // 设置图表选项
  chart.setOption(option);
  
  // 保存图表实例
  defectTypesChart.value = chart;
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    chart.resize();
  });
}
</script>

<style scoped>
.admin-data-page {
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
}

.dashboard-cards {
  margin-bottom: 20px;
}

.dashboard-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2, .card-header h3 {
  margin: 0;
}

.card-content {
  padding: 10px 0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.stat-label {
  color: #666;
}

.stat-value {
  font-weight: bold;
}

.stat-date {
  margin-top: 15px;
  text-align: right;
}

.data-integrity-progress {
  margin-bottom: 20px;
}

.progress-label {
  font-weight: bold;
}

.integrity-details {
  margin-top: 20px;
}

.integrity-item {
  margin-bottom: 10px;
}

.item-title {
  font-size: 12px;
  margin-bottom: 5px;
  color: #666;
}

.actions-content {
  display: flex;
  justify-content: center;
  align-items: center;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  width: 100%;
}

.feature-card {
  margin-bottom: 20px;
}

.feature-grid {
  display: flex;
  flex-wrap: wrap;
}

.module-card {
  height: 100%;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.module-icon {
  font-size: 30px;
  margin: 10px 0;
  color: var(--el-color-primary);
}

.module-title {
  margin: 10px 0;
  font-size: 16px;
}

.module-desc {
  color: #666;
  font-size: 12px;
  margin-bottom: 10px;
}

.history-card {
  margin-bottom: 20px;
}

.success {
  color: var(--el-color-success);
}

.warning {
  color: var(--el-color-warning);
}

.error {
  color: var(--el-color-danger);
}

/* 链接样式 */
a {
  text-decoration: none;
  color: inherit;
}

.data-generation-section {
  margin-bottom: 20px;
}

.generation-options {
  padding: 20px;
}

.generation-card {
  height: 100%;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.generation-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.gen-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gen-card-header h2 {
  margin: 0;
}

.gen-card-content {
  padding: 10px 0;
}

.quick-gen-form {
  margin-bottom: 10px;
}

.advanced-generation {
  margin-top: 20px;
  text-align: right;
}

.generation-progress {
  padding: 20px;
}

.progress-message {
  margin-top: 10px;
  text-align: center;
}

.tip-card {
  margin-top: 20px;
}

.tip-content {
  padding: 20px;
}

.tip-note {
  margin-top: 10px;
  text-align: right;
}

/* 不良率样式 */
.high-defect-rate {
  color: #F56C6C;
  font-weight: bold;
}

.medium-defect-rate {
  color: #E6A23C;
  font-weight: bold;
}

.low-defect-rate {
  color: #67C23A;
  font-weight: bold;
}

.storage-usage-info {
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.cleanup-options {
  margin: 20px 0;
}

.data-insights-section {
  margin-bottom: 20px;
}

.insights-cards {
  display: flex;
  flex-wrap: wrap;
}

.insight-card {
  height: 100%;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.insight-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.insight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.insight-header h3 {
  margin: 0;
}

.insight-content {
  padding: 10px 0;
}

.insight-summary {
  margin-top: 10px;
  text-align: right;
}

.defect-types-chart {
  height: 180px;
}

.chart-loading {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.no-data {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style> 