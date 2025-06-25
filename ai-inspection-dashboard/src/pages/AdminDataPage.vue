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
              <span class="stat-value">{{ inventoryStats.totalCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">测试记录:</span>
              <span class="stat-value">{{ inventoryStats.testedCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">上线记录:</span>
              <span class="stat-value">{{ inventoryStats.onlineCount }}</span>
            </div>
            <div class="stat-date">
              <el-tag size="small" type="info">最后更新: {{ inventoryStats.lastUpdated }}</el-tag>
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
              :percentage="(1 - inventoryStats.overallDefectRate) * 100" 
              :status="getStatusType((1 - inventoryStats.overallDefectRate) * 100)"
              :stroke-width="18"
            >
              <template #default="{ percentage }">
                <span class="progress-label">数据健康度: {{ percentage ? percentage.toFixed(1) : '0.0' }}%</span>
              </template>
            </el-progress>
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
                <h3>问题供应商分析</h3>
                <el-tooltip content="测试失败次数 > 0 的供应商" placement="top">
                  <el-icon><WarningFilled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            <div class="insight-content">
              <el-table :data="labAnalysis.defectBySupplier.slice(0, 5)" style="width: 100%" size="small">
                <el-table-column prop="name" label="供应商" min-width="120" />
                <el-table-column prop="value" label="失败次数" width="90" />
              </el-table>
            </div>
          </el-card>
        </el-col>
        
        <!-- 问题供应商卡片 -->
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
              <el-table :data="labAnalysis.defectByDescription.slice(0, 5)" style="width: 100%" size="small">
                <el-table-column prop="name" label="不良描述" min-width="120" />
                <el-table-column prop="value" label="次数" width="70" />
              </el-table>
            </div>
          </el-card>
        </el-col>
        
        <!-- 不良类型统计卡片 -->
        <el-col :xs="24" :sm="12" :md="8">
          <el-card shadow="hover" class="insight-card">
            <template #header>
              <div class="insight-header">
                <h3>高风险批次</h3>
                <el-tooltip content="包含任何检验或测试失败项的批次总数" placement="top">
                  <el-icon><WarningFilled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            <div class="insight-content" style="text-align: center; padding-top: 20px;">
              <el-statistic :value="inventoryStats.highRiskBatchCount">
                <template #title>
                  <div style="display: inline-flex; align-items: center">
                    高风险批次总数
                  </div>
                </template>
              </el-statistic>
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
      <data-generation-panel @generation-complete="refreshData" />
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
          <router-link to="/admin/data/historical">
            <el-card shadow="hover" class="module-card">
              <el-icon class="module-icon"><Histogram /></el-icon>
              <h3 class="module-title">历史数据管控</h3>
              <p class="module-desc">导入、管理和查看历史数据，用于与新生成数据集成</p>
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

<script setup lang="ts">
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
import { useInventoryAnalysis } from '../composables/useInventoryAnalysis';

// 注册必须的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  CanvasRenderer
]);

const { inventoryStats, labAnalysis, refreshData } = useInventoryAnalysis();

const generateDialogVisible = ref(false);

onMounted(() => {
  refreshData();
});

const getStatusType = (percentage: number) => {
  if (percentage < 60) return 'exception';
  if (percentage < 90) return 'warning';
  return 'success';
};

// Placeholder functions for actions that are not implemented in this refactoring
const openDataImport = () => ElMessage.info('导入功能待实现');
const backupData = () => ElMessage.info('备份功能待实现');

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