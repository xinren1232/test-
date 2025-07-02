<!-- 
  数据生成面板
  提供给管理员手动更新系统数据
-->
<template>
  <div class="data-generation-panel">
    <el-card class="panel-card">
      <template #header>
        <div class="panel-header">
          <h3>系统数据生成工具</h3>
          <el-tag type="info" size="small">管理员专用</el-tag>
        </div>
      </template>
      
      <div class="panel-content">
        <!-- 数据统计部分 -->
        <div class="section">
          <h4>当前数据统计</h4>
          <div class="stats-container">
            <el-descriptions :column="3" border>
              <el-descriptions-item label="库存记录">
                <el-tag type="info">{{ stats.inventoryCount }}条</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="测试数据">
                <el-tag type="success">{{ stats.labCount }}条</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="上线数据">
                <el-tag type="warning">{{ stats.factoryCount }}条</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="批次数量">
                <el-tag type="info">{{ stats.batches || 0 }}个</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="平均不良率">
                <el-tag :type="getDefectRateTagType(stats.avgDefectRate)">{{ formatDefectRate(stats.avgDefectRate) }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="高风险批次">
                <el-tag type="danger">{{ stats.highRiskBatches || 0 }}个</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="最后更新" :span="3">
                {{ stats.lastUpdate }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
        
        <el-divider />
        
        <!-- 数据生成操作 -->
        <div class="section">
          <h4>数据生成</h4>
          
          <!-- 数据选项 -->
          <el-form :model="dataOptions" label-position="top" size="default">
            <el-row :gutter="20">
              <el-col :span="12">
              <el-form-item label="数据数量">
                  <el-input-number v-model="dataOptions.count" :min="10" :max="1000" />
              </el-form-item>
              </el-col>
              <el-col :span="12">
              <el-form-item label="数据选项">
                  <el-checkbox v-model="dataOptions.clearExisting">清空现有数据</el-checkbox>
                  <el-checkbox v-model="dataOptions.useDistribution">使用物料分布比例</el-checkbox>
                  <el-tooltip content="勾选后，数据生成完毕将自动刷新各页面展示" placement="top">
                    <el-checkbox v-model="dataOptions.refreshAfterGeneration">自动刷新页面</el-checkbox>
                  </el-tooltip>
              </el-form-item>
              </el-col>
            </el-row>
          </el-form>
              
          <!-- 一键生成按钮 -->
          <div class="action-group">
              <el-popconfirm
                  title="确定要一键生成所有数据吗？"
                  @confirm="generateAllData"
                  confirm-button-text="确定生成"
                  cancel-button-text="取消"
              >
                <template #reference>
                  <el-button 
                    type="primary" 
                    icon="Plus"
                    :loading="isGenerating.all"
                    size="large"
                  >
                    一键生成所有数据
                  </el-button>
                </template>
              </el-popconfirm>
            
            <el-popconfirm
              title="确定要清除所有数据吗？此操作不可恢复。"
              @confirm="clearAllData"
              confirm-button-text="确定清除"
              cancel-button-text="取消"
              type="danger"
            >
              <template #reference>
                <el-button type="danger" icon="Delete" size="large">清除所有数据</el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
        
        <el-divider />
        
        <!-- 高级生成选项 -->
        <div class="section">
          <h4>高级选项</h4>
          
          <el-tabs type="border-card">
            <!-- 单独生成数据 -->
            <el-tab-pane label="独立数据生成">
              <el-alert
                type="info"
                show-icon
                :closable="false"
                title="在这里可以单独生成各类数据"
              />
              <div class="tab-content">
                <!-- 增强的独立数据生成选项 -->
                <el-row :gutter="20" class="data-generation-options">
                  <el-col :span="8">
                    <el-card shadow="hover" class="data-type-card">
                      <template #header>
                        <div class="card-header">
                          <h4>库存数据</h4>
                        </div>
                      </template>
                      <div class="data-type-content">
                        <el-form-item label="生成数量">
                          <el-input-number v-model="inventoryOptions.count" :min="5" :max="1000" size="small" />
                        </el-form-item>
                        <el-form-item label="数据类型">
                          <el-select v-model="inventoryOptions.materialTypes" multiple placeholder="选择物料类型" size="small" style="width: 100%">
                            <el-option label="结构件类" value="结构件类" />
                            <el-option label="光学类" value="光学类" />
                            <el-option label="充电类" value="充电类" />
                            <el-option label="声学类" value="声学类" />
                            <el-option label="包料类" value="包料类" />
                          </el-select>
                        </el-form-item>
                        <el-form-item label="工厂选择">
                          <el-select v-model="inventoryOptions.factories" multiple placeholder="选择工厂" size="small" style="width: 100%">
                            <el-option label="重庆工厂" value="重庆工厂" />
                            <el-option label="深圳工厂" value="深圳工厂" />
                            <el-option label="南昌工厂" value="南昌工厂" />
                            <el-option label="宜宾工厂" value="宜宾工厂" />
                          </el-select>
                        </el-form-item>
                        <el-form-item>
                          <el-checkbox v-model="inventoryOptions.clearExisting">清空现有数据</el-checkbox>
                        </el-form-item>
                  <el-button 
                    type="success" 
                    @click="generateInventoryData" 
                    :loading="isGenerating.inventory"
                          style="width: 100%;"
                  >
                          {{ isGenerating.inventory ? `正在生成${inventoryOptions.count}条数据...` : `生成${inventoryOptions.count}条库存数据` }}
                  </el-button>
                      </div>
                    </el-card>
                  </el-col>
                  
                  <el-col :span="8">
                    <el-card shadow="hover" class="data-type-card">
                      <template #header>
                        <div class="card-header">
                          <h4>测试数据</h4>
                        </div>
                      </template>
                      <div class="data-type-content">
                        <el-form-item label="生成数量">
                          <el-input-number v-model="labOptions.count" :min="1" :max="1000" />
                        </el-form-item>
                        <el-form-item label="测试类型">
                          <el-select v-model="labOptions.testTypes" multiple placeholder="选择测试类型" size="small" style="width: 100%">
                            <el-option label="新品测试" value="新品测试" />
                            <el-option label="量产例行" value="量产例行" />
                          </el-select>
                        </el-form-item>
                        <el-form-item label="项目选择">
                          <el-select v-model="labOptions.projects" multiple placeholder="选择项目" size="small" style="width: 100%">
                            <el-option v-for="(baseline, project) in projectBaselines" :key="project" :label="project" :value="project" />
                          </el-select>
                        </el-form-item>
                        <el-form-item>
                          <el-checkbox v-model="labOptions.clearExisting">清空现有数据</el-checkbox>
                          <el-checkbox v-model="labOptions.includeDefects">包含不良现象</el-checkbox>
                        </el-form-item>
                        <div class="action-buttons">
                          <el-button type="primary" @click="generateLabData" :loading="isGenerating.lab" style="width: 100%">
                            {{ isGenerating.lab ? `正在生成${labOptions.count}条数据...` : `生成${labOptions.count}条测试数据` }}
                          </el-button>
                        </div>
                        <div class="debug-tip">
                          <el-alert
                            title="提示：测试数据生成需要先有库存数据"
                            type="info"
                            :closable="false"
                            show-icon
                          >
                            <p>测试数据会使用现有库存数据中的批次号和物料信息</p>
                          </el-alert>
                        </div>
                      </div>
                    </el-card>
                  </el-col>
                  
                  <el-col :span="8">
                    <el-card shadow="hover" class="data-type-card">
                      <template #header>
                        <div class="card-header">
                          <h4>上线数据</h4>
                        </div>
                      </template>
                      <div class="data-type-content">
                        <el-form-item label="生成数量">
                          <el-input-number v-model="factoryOptions.count" :min="1" :max="1000" />
                        </el-form-item>
                        <el-form-item label="工厂选择">
                          <el-select v-model="factoryOptions.factories" multiple placeholder="选择工厂" size="small" style="width: 100%">
                            <el-option label="重庆工厂" value="重庆工厂" />
                            <el-option label="深圳工厂" value="深圳工厂" />
                            <el-option label="南昌工厂" value="南昌工厂" />
                            <el-option label="宜宾工厂" value="宜宾工厂" />
                          </el-select>
                        </el-form-item>
                        <el-form-item label="生产线">
                          <el-select v-model="factoryOptions.lines" multiple placeholder="选择生产线" size="small" style="width: 100%">
                            <el-option label="01线" value="01线" />
                            <el-option label="02线" value="02线" />
                            <el-option label="03线" value="03线" />
                            <el-option label="04线" value="04线" />
                          </el-select>
                        </el-form-item>
                        <el-form-item label="不良率范围">
                          <el-slider
                            v-model="factoryOptions.defectRateRange"
                            range
                            :min="0"
                            :max="10"
                            :step="0.1"
                            size="small"
                          />
                        </el-form-item>
                        <el-form-item>
                          <el-checkbox v-model="factoryOptions.clearExisting">清空现有数据</el-checkbox>
                        </el-form-item>
                  <el-button 
                    type="success" 
                          @click="generateOnlineData" 
                    :loading="isGenerating.factory"
                          style="width: 100%;"
                  >
                          {{ isGenerating.factory ? `正在生成${factoryOptions.count}条数据...` : `生成${factoryOptions.count}条上线数据` }}
                  </el-button>
                </div>
                    </el-card>
                  </el-col>
                </el-row>
              </div>
            </el-tab-pane>
            
            <!-- 场景数据生成 -->
            <el-tab-pane label="场景数据生成">
              <el-alert
                type="info"
                show-icon
                :closable="false"
                title="根据特定场景生成具有关联性的数据"
              />
              <div class="tab-content">
                <el-form :model="scenarioOptions" label-position="top">
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="场景类型">
                        <el-select v-model="scenarioOptions.type" style="width: 100%;">
                          <el-option label="正常生产" value="normal" />
                          <el-option label="质量异常" value="quality_issue" />
                          <el-option label="供应商问题" value="supplier_issue" />
                </el-select>
              </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="数据量">
                        <el-input-number v-model="scenarioOptions.count" :min="10" :max="100" />
              </el-form-item>
                    </el-col>
                  </el-row>
              
              <el-form-item>
                <el-button 
                      type="primary" 
                  @click="generateScenarioData" 
                      :loading="isGenerating.scenario"
                >
                  生成场景数据
                </el-button>
              </el-form-item>
            </el-form>
          </div>
            </el-tab-pane>
            
            <!-- 调试工具 -->
            <el-tab-pane label="调试工具">
              <el-alert
                type="warning"
                show-icon
                :closable="false"
                title="这些工具用于调试和修复数据问题"
              />
              <div class="tab-content">
                <div class="action-buttons">
                  <el-button @click="checkLocalStorageData">检查数据状态</el-button>
                  <el-button type="warning" @click="fixDataInconsistency">修复数据不一致</el-button>
                  <el-button type="primary" @click="exportData">导出所有数据</el-button>
                  
                  <!-- 紧急数据生成按钮 -->
                  <el-popconfirm
                    title="紧急数据生成将清除所有现有数据，并生成最小数据集。确定继续吗？"
                    @confirm="generateEmergencyData"
                    confirm-button-text="确定生成"
                    cancel-button-text="取消"
                  >
                    <template #reference>
                      <el-button 
                        type="danger" 
                        icon="Warning"
                        :loading="isGenerating.emergency"
                      >
                        紧急数据生成
                      </el-button>
                    </template>
                  </el-popconfirm>
                </div>
            
                <!-- 调试信息显示 -->
              <div v-if="debugMode" class="debug-info">
                  <h5>数据状态信息</h5>
                  <el-descriptions :column="3" border>
                    <el-descriptions-item v-for="(info, key) in debugInfo" :key="key" :label="key">
                      <template v-if="typeof info === 'object'">
                        <div v-for="(value, prop) in info" :key="prop">
                          {{ prop }}: {{ value }}
                        </div>
                        </template>
                      <template v-else>
                        {{ info }}
                        </template>
                    </el-descriptions-item>
                  </el-descriptions>
              </div>
          </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import SystemDataUpdater from '@/services/SystemDataUpdater';
import FactoryDataService from '@/services/FactoryDataService';
import UnifiedDataService from '@/services/UnifiedDataService';
import { checkMaterialData, debugLocalStorage } from '@/utils/debug';
import { materialCategories, materialSuppliers, materialDefects } from '@/data/MaterialData';
import { projectBaselines } from '@/data/ProjectData';
import api from '@/api/ApiClient.js';

const emit = defineEmits(['generation-complete']);
const generationLog = ref('');

// 数据统计
const stats = ref({
  inventoryCount: 0,
  labCount: 0,
  factoryCount: 0,
  lastUpdate: '无'
});

// 数据选项
const dataOptions = ref({
  count: 100,
  clearExisting: false,
  useDistribution: true,
  refreshAfterGeneration: false
});

// 独立数据生成选项
const inventoryOptions = ref({
  count: 50,
  clearExisting: false,
  materialTypes: ['结构件类', '光学类', '充电类'],
  factories: ['重庆工厂', '深圳工厂'],
  includeRiskItems: true
});

const labOptions = ref({
  count: 30,
  clearExisting: false,
  testTypes: ['新品测试', '量产例行'],
  projects: ['X6827', 'X6828', 'S665LN'],
  includeDefects: true
});

const factoryOptions = ref({
  count: 20,
  clearExisting: false,
  factories: ['重庆工厂', '深圳工厂', '南昌工厂', '宜宾工厂'],
  lines: ['01线', '02线', '03线', '04线'],
  defectRateRange: [0, 5]
});

// 场景数据生成选项
const scenarioOptions = ref({
  type: 'normal',
  count: 30,
  suppliers: []
});

// 系统数据更新服务实例
const systemDataUpdater = SystemDataUpdater;
const unifiedDataService = UnifiedDataService;

// 供应商列表
const supplierList = ref([
  '歌尔股份',
  '蓝思科技',
  '比亚迪电子',
  '立讯精密',
  '欧菲光',
  '舜宇光学',
  '丘钛科技',
  '瑞声科技',
  '京东方BOE',
  '天马微电子',
  '上海精密',
  '广州科技'
]);

// 数据生成状态
const isGenerating = ref({
  all: false,
  inventory: false,
  lab: false,
  factory: false,
  scenario: false,
  emergency: false
});

// 调试模式
const debugMode = ref(false);
const debugInfo = ref({});

// 在组件挂载时更新统计信息
onMounted(() => {
  updateStats();
});

// 更新统计信息
async function updateStats() {
  try {
    // 获取各类数据
    const inventoryData = unifiedDataService.getInventoryData() || [];
    const labData = unifiedDataService.getLabData() || [];
    const factoryData = unifiedDataService.getFactoryData() || [];
    
    // 计算批次数
    const batchSet = new Set();
    inventoryData.forEach(item => {
      if (item.batchNo) batchSet.add(item.batchNo);
    });
    
    // 计算不良率
    let totalDefectRate = 0;
    let defectRateCount = 0;
    let highRiskCount = 0;
    
    // 从工厂数据中计算不良率
    factoryData.forEach(item => {
      let defectRate;
      
      // 尝试从不同字段获取不良率
      if (item.defectRate) {
        // 如果存在明确的不良率字段
        if (typeof item.defectRate === 'string' && item.defectRate.includes('%')) {
          defectRate = parseFloat(item.defectRate.replace('%', ''));
        } else {
          defectRate = parseFloat(item.defectRate);
        }
      } else if (item.quality_metrics && item.quality_metrics.defect_rate !== undefined) {
        // 从质量指标中获取
        defectRate = item.quality_metrics.defect_rate;
      } else if (item.yieldRate) {
        // 从良率计算不良率
        let yieldValue;
        if (typeof item.yieldRate === 'string' && item.yieldRate.includes('%')) {
          yieldValue = parseFloat(item.yieldRate.replace('%', ''));
        } else {
          yieldValue = parseFloat(item.yieldRate);
        }
        
        if (!isNaN(yieldValue) && yieldValue > 0) {
          defectRate = 100 - yieldValue;
        }
      } else if (item.yield) {
        // 直接从yield计算
        defectRate = 100 - item.yield;
      }
      
      // 如果成功获取到不良率，进行统计
      if (!isNaN(defectRate)) {
        totalDefectRate += defectRate;
        defectRateCount++;
        
        // 统计高风险批次
        if (defectRate > 5.0) {
          highRiskCount++;
        }
      }
    });
    
    // 更新统计数据
  stats.value = {
      inventoryCount: inventoryData.length,
      labCount: labData.length,
      factoryCount: factoryData.length,
      lastUpdate: SystemDataUpdater.lastUpdateTime.value || new Date().toLocaleString(),
      batches: batchSet.size,
      avgDefectRate: defectRateCount > 0 ? (totalDefectRate / defectRateCount).toFixed(1) : 0,
      highRiskBatches: highRiskCount
    };
    
    console.log('数据统计已更新:', stats.value);
  } catch (error) {
    console.error('更新统计信息失败:', error);
    ElMessage.error('更新统计信息失败');
  }
}

// 生成库存数据
async function generateInventoryData() {
  if (isGenerating.value.inventory) return;
  
  try {
    isGenerating.value.inventory = true;
    ElMessage.info(`正在生成${inventoryOptions.value.count}条库存数据...`);
    
    // 使用系统数据更新器生成库存数据
    const result = await systemDataUpdater.generateInventoryData(
      inventoryOptions.value.count,
      inventoryOptions.value.clearExisting
    );
    
    if (result && result.success) {
      ElMessage.success(`成功生成${result.count}条库存数据`);
      generationLog.value += `\n[${new Date().toLocaleString()}] 已生成 ${result.count} 条库存数据`;
      
      // 更新数据统计
      updateStats();
      
      // 触发完成事件
        emit('generation-complete', { 
          type: 'inventory', 
        typeName: '库存',
        count: result.count
        });
      } else {
      ElMessage.error(result?.message || '库存数据生成失败');
    }
  } catch (error) {
    console.error('生成库存数据时出错:', error);
    ElMessage.error(`库存数据生成失败: ${error.message}`);
    generationLog.value += `\n[${new Date().toLocaleString()}] 错误: 生成库存数据失败 - ${error.message}`;
  } finally {
    isGenerating.value.inventory = false;
  }
}

// 生成测试数据方法
async function generateLabData() {
  try {
    isGenerating.value.lab = true;
    const count = Number(labOptions.value.count);
    
    // 确保选项参数是有效的
    const options = {
      testTypes: Array.isArray(labOptions.value.testTypes) && labOptions.value.testTypes.length > 0 
        ? labOptions.value.testTypes 
        : ['新品测试', '量产例行', '供应商验证', '失效分析'],
      projects: Array.isArray(labOptions.value.projects) && labOptions.value.projects.length > 0
        ? labOptions.value.projects
        : [],
      includeDefects: !!labOptions.value.includeDefects
    };
    
    ElMessage.info(`正在生成${count}条测试数据...`);
    
    // 使用系统数据更新器生成测试数据
    const result = await systemDataUpdater.generateLabData(
      count,
      labOptions.value.clearExisting,
      options
    );
    
    if (result && result.success) {
      ElMessage.success(`成功生成${result.count}条测试数据`);
      generationLog.value += `\n[${new Date().toLocaleString()}] 已生成 ${result.count} 条测试数据`;
      
      // 添加调试日志
      console.log('测试数据生成成功:', result);
      console.log('测试数据可以在LabView页面查看');
      
      // 更新数据统计
      updateStats();
      
      // 提示用户刷新测试页面
        ElMessage({
        message: '请刷新测试页面查看新生成的数据',
          type: 'info',
        duration: 5000
      });
      
      // 触发完成事件
      emit('generation-complete', {
        type: 'lab',
        typeName: '测试',
        count: result.count
        });
      } else {
      ElMessage.error(result?.message || '测试数据生成失败');
    }
  } catch (error) {
    console.error('生成测试数据时出错:', error);
    ElMessage.error(`测试数据生成失败: ${error.message}`);
    generationLog.value += `\n[${new Date().toLocaleString()}] 错误: 生成测试数据失败 - ${error.message}`;
  } finally {
    isGenerating.value.lab = false;
  }
}

// 生成物料上线数据
async function generateOnlineData() {
  if (isGenerating.value.factory) return;
  
  try {
    isGenerating.value.factory = true;
    ElMessage.info(`正在生成${factoryOptions.value.count}条上线数据...`);
    
    // 获取选择的工厂
    const selectedFactories = factoryOptions.value.factories.length > 0
      ? factoryOptions.value.factories
      : ['重庆工厂', '深圳工厂', '南昌工厂', '宜宾工厂'];
    
    // 获取选择的生产线
    const selectedLines = factoryOptions.value.lines.length > 0
      ? factoryOptions.value.lines
      : ['01线', '02线', '03线', '04线'];
    
    // 准备参数
    const params = {
      count: factoryOptions.value.count,
      factories: selectedFactories,
      lines: selectedLines,
      clearExisting: factoryOptions.value.clearExisting
    };
    
    // 使用API接口生成数据
    const response = await api.post('/system/updateOnlineData', params);
    const result = response.data;
    
    if (result && result.success) {
      ElMessage.success(`成功生成${result.count}条上线数据`);
      updateStats();
      
      // 触发完成事件，可选添加自动刷新
      if (dataOptions.value.refreshAfterGeneration) {
        emit('generation-complete', { 
          type: 'factory', 
          count: result.count,
          refresh: true
        });
        
        // 通知用户数据已刷新
        ElMessage({
          type: 'info',
          message: '上线数据已更新，页面将自动刷新',
          duration: 2000
        });
      } else {
        emit('generation-complete', { type: 'factory', count: result.count });
      }
    } else {
      ElMessage.error(result?.message || '生成上线数据失败');
    }
  } catch (error) {
    console.error('生成上线数据错误:', error);
    ElMessage.error(`生成上线数据错误: ${error.message}`);
  } finally {
    isGenerating.value.factory = false;
  }
}

// 生成所有数据
async function generateAllData() {
  if (isGenerating.value.all) return;
  
  try {
    isGenerating.value.all = true;
    ElMessage.info('正在生成所有数据...');
    
    // 首先集成历史数据
    await systemDataUpdater.integrateHistoricalData();
    
    // 使用SystemDataUpdater的updateAllSystemData方法生成所有数据
    const result = await systemDataUpdater.updateAllSystemData({
      inventoryCount: dataOptions.value.count,
      labCount: Math.floor(dataOptions.value.count * 0.6),
      factoryCount: Math.floor(dataOptions.value.count * 0.4),
      clearExisting: dataOptions.value.clearExisting,
      useDistribution: dataOptions.value.useDistribution
    });
    
    if (result && result.success) {
      ElMessage.success(`成功生成全部数据: ${result.counts.inventory}条库存, ${result.counts.lab}条测试, ${result.counts.factory}条工厂数据`);
      updateStats();
      
      // 添加自动刷新支持
      if (dataOptions.value.refreshAfterGeneration) {
        // 发出事件，通知页面刷新数据
        emit('generation-complete', { 
          type: 'all', 
          counts: result.counts,
          refresh: true
        });
        
        // 通知用户数据已刷新
        ElMessage({
          type: 'info',
          message: '系统数据已更新，页面将自动刷新',
          duration: 2000
        });
      } else {
        emit('generation-complete', { type: 'all', counts: result.counts });
      }
    } else {
      ElMessage.error(`生成数据失败: ${result ? result.message : '未知错误'}`);
    }
  } catch (error) {
    console.error('生成所有数据时出错:', error);
    ElMessage.error(`生成所有数据时出错: ${error.message}`);
  } finally {
    isGenerating.value.all = false;
  }
}

// 生成场景数据
async function generateScenarioData() {
  if (isGenerating.value.scenario) return;
  
  try {
    isGenerating.value.scenario = true;
    ElMessage.info(`正在生成${scenarioOptions.value.count}条${scenarioOptions.value.type}场景数据...`);
    
    // TODO: 实现场景数据生成逻辑
    setTimeout(() => {
      ElMessage.warning('场景数据生成功能尚未实现');
      isGenerating.value.scenario = false;
    }, 1000);
  } catch (error) {
    console.error('生成场景数据时出错:', error);
    ElMessage.error(`生成场景数据时出错: ${error.message}`);
    isGenerating.value.scenario = false;
  }
}

// 清空测试数据
async function clearLabData() {
  try {
    const result = await unifiedDataService.clearLabData();
    if (result) {
      ElMessage.success('测试数据已清空');
    updateStats();
    } else {
      ElMessage.error('清空测试数据失败');
    }
  } catch (error) {
    console.error('清空测试数据时出错:', error);
    ElMessage.error(`清空测试数据时出错: ${error.message}`);
  }
}

// 清空所有数据
async function clearAllData() {
  try {
    const result = await systemDataUpdater.clearAllData();
    if (result) {
      ElMessage.success('所有数据已清空');
      updateStats();
    } else {
      ElMessage.error('清空数据失败');
    }
  } catch (error) {
    console.error('清除数据时出错:', error);
    ElMessage.error(`清除数据时出错: ${error.message}`);
  }
}

// 检查本地存储数据
function checkLocalStorageData() {
  try {
    debugMode.value = true;
    debugInfo.value = {};
    
    // 检查所有localStorage键
    const keys = ['inventory_data', 'lab_data', 'factory_data', 'lab_test_data', 'online_data'];
    keys.forEach(key => {
      const data = localStorage.getItem(key);
      let parsed = null;
      let status = '未知';
      
      try {
        if (data) {
          parsed = JSON.parse(data);
          status = '正常';
        } else {
          status = '不存在';
        }
      } catch (e) {
        status = '格式错误';
      }
      
      debugInfo.value[key] = {
        exists: !!data,
        count: parsed ? parsed.length : 0,
        size: data ? `${(data.length / 1024).toFixed(2)} KB` : '0 KB',
        status
      };
    });
    
    // 检查服务状态
    debugInfo.value.services = {
      inventory: {
        exists: !!unifiedDataService.getInventoryData(),
        count: unifiedDataService.getInventoryData().length
      },
      laboratory: {
        exists: !!unifiedDataService.getLabData(),
        count: unifiedDataService.getLabData().length
      },
      factory: {
        exists: !!unifiedDataService.getFactoryData(),
        count: unifiedDataService.getFactoryData().length
      }
    };
    
    ElMessage.success('数据状态检查完成');
  } catch (error) {
    console.error('检查数据状态时出错:', error);
    ElMessage.error(`检查数据状态时出错: ${error.message}`);
  }
}

// 修复数据不一致
function fixDataInconsistency() {
  try {
    ElMessage.info('正在修复数据不一致...');
    const result = unifiedDataService.migrateOldData();
    
    if (result) {
      ElMessage.success('数据不一致已修复');
      updateStats();
      checkLocalStorageData();
    } else {
      ElMessage.warning('没有检测到需要修复的数据不一致');
    }
  } catch (error) {
    console.error('修复数据不一致时出错:', error);
    ElMessage.error(`修复数据不一致时出错: ${error.message}`);
  }
}

// 导出数据
function exportData() {
  try {
    const exportData = unifiedDataService.exportAllData();
    
    // 创建下载链接
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileName = `iqe-data-export-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    ElMessage.success('数据导出成功');
  } catch (error) {
    console.error('导出数据时出错:', error);
    ElMessage.error(`导出数据时出错: ${error.message}`);
  }
}

// 在script部分添加formatDefectRate函数
function formatDefectRate(rate) {
  if (rate === undefined || rate === null) {
    return '0.0%';
  }
  
  // 如果已经是字符串且包含百分号，直接返回
  if (typeof rate === 'string' && rate.includes('%')) {
    return rate;
  }
  
  // 转换为数字并格式化
  const numericRate = parseFloat(rate);
  if (isNaN(numericRate)) {
    return '0.0%';
  }
  
  return `${numericRate.toFixed(1)}%`;
}

// 在script部分添加getDefectRateTagType函数
function getDefectRateTagType(rate) {
  if (!rate) return 'info';
  
  const numericRate = parseFloat(rate);
  if (isNaN(numericRate)) return 'info';
  
  if (numericRate > 5) return 'danger';
  if (numericRate > 2) return 'warning';
  return 'success';
}

// 生成紧急数据
async function generateEmergencyData() {
  if (isGenerating.value.emergency) return;
  
  try {
    isGenerating.value.emergency = true;
    ElMessage.info('正在生成紧急数据...');
    
    // 使用系统数据更新器生成紧急数据
    const result = await systemDataUpdater.generateEmergencyData();
    
    if (result && result.success) {
      ElMessage.success(`成功生成紧急数据集`);
      updateStats();
      
      // 触发完成事件并刷新
      emit('generation-complete', { 
        type: 'emergency', 
        data: result.data,
        refresh: true
      });
      
      // 通知用户
      ElMessage({
        type: 'info',
        message: '紧急数据已生成，页面将自动刷新',
        duration: 2000
      });
    } else {
      ElMessage.error(`生成紧急数据失败: ${result ? result.message : '未知错误'}`);
    }
  } catch (error) {
    console.error('生成紧急数据时出错:', error);
    ElMessage.error(`生成紧急数据时出错: ${error.message}`);
  } finally {
    isGenerating.value.emergency = false;
  }
}
</script>

<style scoped>
.data-generation-panel {
  padding: 20px;
  background-color: #f5f7fa;
}

.panel-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.panel-content {
  padding: 10px;
}

.section {
  margin-bottom: 25px;
}

.section h4 {
  font-size: 1rem;
  color: #555;
  margin-bottom: 15px;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}

.stats-container {
  padding: 15px;
  background: #fafafa;
  border-radius: 4px;
}

.action-group {
  margin-top: 20px;
  display: flex;
  gap: 15px;
}

.tab-content {
  padding: 20px 10px;
}

.data-generation-options {
  margin-top: 15px;
}

.data-type-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.data-type-card .el-card__header {
  padding: 10px 15px;
  background-color: #f9f9f9;
}

.data-type-card .el-card__body {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-header h4 {
  margin: 0;
  font-size: 1rem;
}

.debug-tip {
  margin-top: 15px;
}

.debug-info {
  margin-top: 20px;
  padding: 15px;
  border: 1px dashed #e0e0e0;
  border-radius: 4px;
  background-color: #fbfbfb;
}

.debug-info h5 {
  margin: 0 0 10px 0;
}
</style> 