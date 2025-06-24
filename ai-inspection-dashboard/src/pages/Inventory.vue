<template>
  <div class="inventory-page">
    <div class="page-header">
      <h1>IQE物料流动风险管控平台</h1>
      <div class="header-actions">
        <el-button type="primary" @click="refreshData">
          <el-icon><Refresh /></el-icon>刷新数据
        </el-button>
        <el-button type="success" @click="generateData">
          <el-icon><Plus /></el-icon>生成数据
        </el-button>
        <el-button type="warning" @click="exportRiskReport">
          <el-icon><Download /></el-icon>导出风险报表
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
          <template #header>
            <div class="card-header">
              <h3>正常物料批次</h3>
              <el-icon><CircleCheck /></el-icon>
            </div>
          </template>
          <div class="card-value-container">
            <div class="card-value">{{ normalItemsCount }}</div>
            <div class="card-info">
              <div class="info-item">
                <span class="info-label">主要区域</span>
                <span class="info-value">{{ mainStorageArea }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">仓库物料</span>
                <span class="info-value success-text">原料仓物料</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="dashboard-card risk-items">
          <template #header>
            <div class="card-header">
              <h3>风险物料批次</h3>
              <el-icon><Warning /></el-icon>
            </div>
          </template>
          <div class="card-value-container">
            <div class="card-value">{{ riskItemsCount }}</div>
            <div class="card-info">
              <div class="info-item">
                <span class="info-label">风险厂商</span>
                <span class="info-value warning-text">{{ topRiskSupplier }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">预警等级</span>
                <span class="info-value warning-text">{{ riskLevel }} 
                  <el-tooltip :content="riskLevelDescription" placement="top">
                    <el-icon><InfoFilled /></el-icon>
                  </el-tooltip>
                </span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="dashboard-card problem-items">
          <template #header>
            <div class="card-header">
              <h3>冻结物料批次</h3>
              <el-icon><Lock /></el-icon>
            </div>
          </template>
          <div class="card-value-container">
            <div class="card-value">{{ frozenItemsCount }}</div>
            <div class="card-info">
              <div class="info-item">
                <span class="info-label">所在仓库</span>
                <span class="info-value">{{ frozenItemsCount > 0 ? frozenItemsWarehouse : '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">处理方针</span>
                <span class="info-value" :class="frozenItemsCount > 0 ? 'warning-text' : 'neutral-text'">
                  {{ frozenItemsCount > 0 ? '等待解冻' : '暂无操作' }}
                </span>
              </div>
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
            <!-- 质量状况视图 -->
            <div v-if="supplierAnalysisType === 'quality'" class="supplier-list-container">
              <div v-for="(supplier, index) in topQualitySuppliers" :key="index"
              class="supplier-item" 
                :class="getQualityLevelClass(supplier.qualityLevel)">
                <div class="supplier-rank">{{ index + 1 }}</div>
                <div class="supplier-info">
                  <div class="supplier-name">{{ supplier.name }}</div>
                  <div class="supplier-stats">
                    <span>不合格率: {{ supplier.defectRate }}%</span>
                    <span>样本批次: {{ supplier.batchCount }}</span>
                  </div>
                </div>
                <div class="supplier-tag">
                  <el-tag :type="getQualityTagType(supplier.qualityLevel)" effect="light">{{ supplier.qualityLevel }}</el-tag>
              </div>
            </div>
          </div>

            <!-- 风险指数视图 -->
            <div v-if="supplierAnalysisType === 'risk'" class="supplier-list-container">
              <div v-for="(supplier, index) in topRiskSuppliers" :key="index"
                class="supplier-item" 
                :class="getRiskLevelClass(supplier.score)">
                <div class="supplier-rank">{{ index + 1 }}</div>
                <div class="supplier-info">
                  <div class="supplier-name">{{ supplier.name }}</div>
                  <div class="supplier-stats">
                    <span>风险批次: {{ supplier.issues }}</span>
                    <span>总批次数: {{ supplier.totalItems }}</span>
            </div>
            </div>
                <div class="supplier-tag">
                  <el-tag :type="getRiskTagType(supplier.score)" effect="light">{{ supplier.riskScore }}%</el-tag>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 风险管控图表区域 -->
    <el-row :gutter="20" class="action-section">
      <el-col :span="24">
        <el-card shadow="hover" class="action-card">
          <template #header>
            <div class="card-header">
              <h3>近期物料风险管控</h3>
              <div class="header-date">
                {{ currentDate }} 更新
              </div>
            </div>
          </template>
          <div class="risk-control-container">
            <!-- 风险物料区域 -->
            <div class="risk-section">
              <h4 class="section-title">
                <el-icon><Warning /></el-icon> 风险物料
              </h4>
          <div class="action-list">
                <div v-for="(item, index) in riskOnlyMaterials" :key="`risk-${index}`" class="action-item">
              <div class="action-icon" :class="getActionIconClass(item.status)">
                <el-icon>
                  <component :is="getActionIcon(item.status)"></component>
                </el-icon>
              </div>
              <div class="action-content">
                <div class="action-title">
                  {{ item.type }}: <strong>{{ item.materialName }}</strong> ({{ item.code }}) {{ item.issue }}
                </div>
                <div class="action-supplier">供应商: <strong>{{ item.supplier }}</strong></div>
                    <div class="action-batch">批次号: <strong>{{ item.batchNo || '-' }}</strong></div>
                <div class="action-details">{{ item.details }}</div>
              </div>
              <el-tag :type="getTagType(item.status)">{{ item.status }}</el-tag>
            </div>
                <div v-if="riskOnlyMaterials.length === 0" class="action-item">
              <div class="action-icon medium-risk-icon">
                <el-icon><InfoFilled /></el-icon>
              </div>
              <div class="action-content">
                <div class="action-title">到期预警: <strong>高精度电阻器</strong> (RD-129-A) 保质期将至</div>
                <div class="action-supplier">供应商: <strong>精密电子元件厂</strong></div>
                    <div class="action-batch">批次号: <strong>EC-2023-0516</strong></div>
                    <div class="action-details">移送产线: 待定 | 到期日期: 2023-07-15 | 预警原因: 仅剩30天有效期</div>
              </div>
                  <el-tag type="warning">风险</el-tag>
            </div>
              </div>
            </div>
            
            <!-- 冻结物料区域 -->
            <div class="frozen-section">
              <h4 class="section-title">
                <el-icon><Lock /></el-icon> 冻结物料
              </h4>
              <div class="action-list">
                <div v-for="(item, index) in frozenOnlyMaterials" :key="`frozen-${index}`" class="action-item">
                  <div class="action-icon high-risk-icon">
                    <el-icon>
                      <component :is="getActionIcon(item.status)"></component>
                    </el-icon>
              </div>
              <div class="action-content">
                    <div class="action-title">
                      {{ item.type }}: <strong>{{ item.materialName }}</strong> ({{ item.code }}) {{ item.issue }}
              </div>
                    <div class="action-supplier">供应商: <strong>{{ item.supplier }}</strong></div>
                    <div class="action-batch">批次号: <strong>{{ item.batchNo || '-' }}</strong></div>
                    <div class="action-warehouse">当前仓库: <strong>{{ item.warehouse || '检验区' }}</strong></div>
                    <div class="action-details">{{ item.details }}</div>
                    <div class="action-freeze-reason" v-if="item.freezeReason">
                      <span class="reason-label">冻结原因:</span> {{ item.freezeReason }}
            </div>
                  </div>
                  <div class="action-status">
                    <el-tag type="danger">{{ item.status }}</el-tag>
                    <el-button 
                      size="small" 
                      type="primary" 
                      @click="handleFreezeToggle(item)" 
                      class="unfreeze-btn"
                    >
                      解冻处理
                    </el-button>
                  </div>
                </div>
                <div v-if="frozenOnlyMaterials.length === 0" class="action-item">
              <div class="action-icon high-risk-icon">
                <el-icon><CircleClose /></el-icon>
              </div>
              <div class="action-content">
                <div class="action-title">质检不合格: <strong>高精度温度传感器</strong> (TS-567-F) 参数异常</div>
                <div class="action-supplier">供应商: <strong>元器件制造公司</strong></div>
                    <div class="action-batch">批次号: <strong>TS-2023-0412</strong></div>
                    <div class="action-warehouse">当前仓库: <strong>检验区</strong></div>
                    <div class="action-details">问题: 电性能测试不合格 | 冻结日期: 2023-06-15</div>
                    <div class="action-freeze-reason">
                      <span class="reason-label">冻结原因:</span> 电阻值超出规格范围，偏差23%
              </div>
                  </div>
                  <div class="action-status">
              <el-tag type="danger">已冻结</el-tag>
                    <el-button 
                      size="small" 
                      type="primary" 
                      @click="handleFreezeToggle(null)" 
                      class="unfreeze-btn"
                    >
                      解冻处理
                    </el-button>
                  </div>
                </div>
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
            <el-input
              v-model="searchQuery"
              placeholder="搜索物料编码、批次或供应商"
              prefix-icon="Search"
              clearable
              @change="handleSearch"
              style="width: 300px"
            ></el-input>
            <el-select v-model="statusFilter" placeholder="物料状态" @change="handleSearch" style="width: 120px">
              <el-option label="全部批次" value=""></el-option>
              <el-option label="正常物料" value="正常"></el-option>
              <el-option label="风险物料" value="风险"></el-option>
              <el-option label="已冻结" value="冻结"></el-option>
            </el-select>
            <el-select v-model="warehouseFilter" placeholder="仓库" @change="handleSearch" style="width: 120px">
              <el-option label="全部仓库" value=""></el-option>
              <el-option label="主仓库" value="主仓库"></el-option>
              <el-option label="原材料仓" value="原材料仓"></el-option>
              <el-option label="半成品仓" value="半成品仓"></el-option>
              <el-option label="成品仓" value="成品仓"></el-option>
              <el-option label="退货仓" value="退货仓"></el-option>
            </el-select>
            <el-button type="primary" size="small" @click="showAdvancedSearch = true">
              高级筛选
              <el-icon><Filter /></el-icon>
            </el-button>
          </div>
        </div>
      </template>

      <el-table 
        :data="pagedInventoryData" 
        style="width: 100%" 
        v-loading="tableLoading"
        height="450"
        stripe
        :row-class-name="tableRowClassName"
      >
        <el-table-column prop="factory" label="工厂" width="100" sortable>
          <template #default="scope">
            {{ scope.row.factory || getRandomFactory() }}
          </template>
        </el-table-column>
        <el-table-column prop="warehouse" label="仓库" width="100" sortable>
          <template #default="scope">
            {{ scope.row.warehouse || scope.row.storageLocation || getRandomWarehouse() }}
          </template>
        </el-table-column>
        <el-table-column prop="materialCode" label="物料编号" width="140" sortable>
          <template #default="scope">
            {{ scope.row.materialCode || scope.row.material_id || `M${Math.floor(Math.random() * 90000) + 10000}` }}
          </template>
        </el-table-column>
        <el-table-column prop="materialName" label="物料名称" width="180"></el-table-column>
        <el-table-column prop="supplier" label="供应商" width="150" sortable></el-table-column>
        <el-table-column prop="batchNo" label="批次" width="150" sortable></el-table-column>
        <el-table-column prop="quantity" label="数量" sortable width="80"></el-table-column>
        <el-table-column label="状态" width="110" sortable prop="status">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="入库时间" width="120" sortable prop="receiveDate">
          <template #default="scope">
            {{ formatDate(scope.row.receiveDate || scope.row.arrivalDate || scope.row.inboundTime || getRandomDate()) }}
          </template>
        </el-table-column>
        <el-table-column label="到期日期" width="120" sortable prop="expiryDate">
          <template #default="scope">
            {{ formatDate(scope.row.expiryDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="notes" label="备注" width="150">
          <template #default="scope">
            {{ scope.row.notes || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewDetails(scope.row)">详情</el-button>
            <el-button 
              :type="scope.row.status === '冻结' ? 'success' : 'warning'" 
              size="small" 
              @click="handleFreezeToggle(scope.row)"
            >
              {{ scope.row.status === '冻结' ? '解冻' : '冻结' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 高级筛选对话框 -->
    <el-dialog
      title="高级筛选"
      v-model="showAdvancedSearch"
      width="700px"
      destroy-on-close
    >
      <el-form :model="advancedFilter" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="入库日期">
              <el-date-picker
                v-model="advancedFilter.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供应商">
              <el-select v-model="advancedFilter.suppliers" multiple placeholder="选择供应商" style="width: 100%">
                <el-option 
                  v-for="supplier in supplierOptions" 
                  :key="supplier" 
                  :label="supplier" 
                  :value="supplier">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="物料分类">
              <el-cascader
                v-model="advancedFilter.category"
                :options="materialCategoryOptions"
                :props="{ multiple: true, checkStrictly: true }"
                placeholder="选择物料分类"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="质检状态">
              <el-checkbox-group v-model="advancedFilter.qualityStatus">
                <el-checkbox label="正常">正常</el-checkbox>
                <el-checkbox label="风险">风险</el-checkbox>
                <el-checkbox label="冻结">冻结</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="批次号">
              <el-input v-model="advancedFilter.batchNo" placeholder="输入批次号" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetAdvancedFilter">重置</el-button>
          <el-button type="primary" @click="applyAdvancedFilter">应用筛选</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 库位转移对话框 -->
    <el-dialog
      title="库位转移"
      v-model="showMoveLocationDialog"
      width="500px"
      destroy-on-close
    >
      <div v-if="selectedItem">
        <p>物料: {{ selectedItem.materialName }} ({{ selectedItem.materialCode }})</p>
        <p>批次: {{ formatBatchNumber(selectedItem.batchNo) }}</p>
        <p>当前仓库: {{ selectedItem.warehouse }}</p>
        <p>当前库位: {{ selectedItem.location }}</p>
        
        <el-form :model="moveLocationForm" label-width="100px" style="margin-top: 20px">
          <el-form-item label="目标仓库">
            <el-select v-model="moveLocationForm.targetWarehouse" placeholder="选择仓库" style="width: 100%">
              <el-option label="主仓库" value="主仓库"></el-option>
              <el-option label="原材料仓" value="原材料仓"></el-option>
              <el-option label="半成品仓" value="半成品仓"></el-option>
              <el-option label="成品仓" value="成品仓"></el-option>
              <el-option label="退货仓" value="退货仓"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="目标库位">
            <el-select v-model="moveLocationForm.targetLocation" placeholder="选择库位" style="width: 100%">
              <el-option v-for="loc in availableLocations" :key="loc" :label="loc" :value="loc"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="转移原因">
            <el-input type="textarea" v-model="moveLocationForm.reason" rows="3" placeholder="请输入库位转移原因"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showMoveLocationDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmMoveLocation">确认转移</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, reactive, computed, nextTick, watch } from 'vue';
import { ElMessage, ElNotification, ElMessageBox } from 'element-plus';
import { 
  Refresh, Download, Goods, Warning, CircleCloseFilled, Lock, 
  Search, CaretTop, CaretBottom, Timer, SuccessFilled, Filter, Unlock,
  CircleClose, Checked, Delete, TrendCharts, AlarmClock, Connection,
  CircleCheck, InfoFilled, ChatDotSquare, Plus
} from '@element-plus/icons-vue';
import * as echarts from 'echarts/core';
import { PieChart, LineChart } from 'echarts/charts';
import { 
  TitleComponent, TooltipComponent, LegendComponent, GridComponent,
  DatasetComponent, TransformComponent 
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { safeInitChart, setupChartResize, safeDisposeChart } from '../utils/chartHelper.js';
import UnifiedDataService from '../services/UnifiedDataService.js';
import { getRemainingDays, getShelfLifeStatus } from '../data/MaterialShelfLifeRules.js';

// 注册echarts组件
echarts.use([
  TitleComponent, TooltipComponent, LegendComponent, GridComponent,
  DatasetComponent, TransformComponent, PieChart, LineChart,
  LabelLayout, UniversalTransition, CanvasRenderer
]);

export default {
  name: 'InventoryPage',
  components: {
    Refresh, Download, Goods, Warning, CircleCloseFilled, Lock, Search,
    CaretTop, CaretBottom, Timer, SuccessFilled, Filter, Unlock,
    CircleClose, Checked, Delete, TrendCharts, AlarmClock, Connection,
    CircleCheck, InfoFilled, ChatDotSquare, Plus
  },
  setup() {
    // 仪表盘数据
    const dashboardData = reactive({
      totalItems: 1258,
      totalItemsTrend: 5.2,
      frozenItems: 10,
      frozenTrend: 7.5,
      pendingFrozenItems: 35,
      pendingFrozenTrend: 5.2,
      riskItems: 40,
      riskTrend: -8.3,
      qualityProblemItems: 3,
      qualityProblemTrend: 18.5,
      unfrozenItems: 8,
      unfrozenTrend: 18.5
    });

    // 图表配置
    const categoryChartPeriod = ref('30days');
    const trendChartPeriod = ref('30days');
    const warehouseChartFilter = ref('all');
    const reasonChartPeriod = ref('30days');
    const reasonTrendPeriod = ref('30days');
    const solutionChartType = ref('distribution');
    const solutionChartPeriod = ref('30days');
    const supplierAnalysisType = ref('quality');
    
    // 图表加载状态
    const reasonDistChartLoaded = ref(false);
    const reasonTrendChartLoaded = ref(false);
    const solutionsChartLoaded = ref(false);
    const supplierQualityChartLoaded = ref(false);
    
    // 表格数据
    const inventoryData = ref([]);
    const tableLoading = ref(false);
    
    // 创建一个响应式的过滤数据
    const filteredInventoryData = ref([]);
    
    // 计算分页后的数据
    const pagedInventoryData = computed(() => {
      const startIndex = (currentPage.value - 1) * pageSize.value;
      const endIndex = startIndex + pageSize.value;
      return filteredInventoryData.value.slice(startIndex, endIndex);
    });

    // 计算正常物料批次数量
    const normalItemsCount = computed(() => {
      return inventoryData.value.filter(item => item.status === '正常').length;
    });

    // 计算风险物料批次数量
    const riskItemsCount = computed(() => {
      return inventoryData.value.filter(item => item.status === '风险').length;
    });

    // 计算不合格物料批次数量
    const rejectedItemsCount = computed(() => {
      return inventoryData.value.filter(item => 
        item.status === '不合格' || 
        (item.quality && item.quality === '不合格')
      ).length;
    });

    // 计算冻结物料批次数量
    const frozenItemsCount = computed(() => {
      return inventoryData.value.filter(item => item.status === '冻结').length;
    });

    // 获取主要存储区域
    const mainStorageArea = computed(() => {
      const warehouseCounts = {};
      
      // 统计各仓库的物料数量
      inventoryData.value.forEach(item => {
        if (item.status === '正常' && item.warehouse) {
          warehouseCounts[item.warehouse] = (warehouseCounts[item.warehouse] || 0) + 1;
        }
      });
      
      // 找出数量最多的仓库
      let maxCount = 0;
      let mainWarehouse = '主仓库';
      
      for (const [warehouse, count] of Object.entries(warehouseCounts)) {
        if (count > maxCount) {
          maxCount = count;
          mainWarehouse = warehouse;
        }
      }
      
      return mainWarehouse;
    });

    // 获取冻结物料的主要仓库
    const frozenItemsWarehouse = computed(() => {
      const warehouseCounts = {};
      
      // 统计冻结物料所在的各仓库数量
      inventoryData.value.forEach(item => {
        if (item.status === '冻结' && item.warehouse) {
          warehouseCounts[item.warehouse] = (warehouseCounts[item.warehouse] || 0) + 1;
        }
      });
      
      // 找出冻结物料最多的仓库
      let maxCount = 0;
      let mainWarehouse = '隔离仓';
      
      for (const [warehouse, count] of Object.entries(warehouseCounts)) {
        if (count > maxCount) {
          maxCount = count;
          mainWarehouse = warehouse;
        }
      }
      
      return mainWarehouse;
    });

    // 获取主要产线
    const mainProductionLine = computed(() => {
      // 分析不合格物料关联的产线
      const lineCounts = {};
      
      inventoryData.value.forEach(item => {
        if ((item.status === '不合格' || (item.quality && item.quality === '不合格')) && item.productionLine) {
          lineCounts[item.productionLine] = (lineCounts[item.productionLine] || 0) + 1;
        }
      });
      
      // 找出数量最多的产线
      let maxCount = 0;
      let mainLine = '-';
      
      for (const [line, count] of Object.entries(lineCounts)) {
        if (count > maxCount) {
          maxCount = count;
          mainLine = line;
        }
      }
      
      return mainLine || '主产线';
    });

    // 获取风险供应商
    const topRiskSupplier = computed(() => {
      // 分析风险物料关联的供应商
      const supplierCounts = {};
      
      inventoryData.value.forEach(item => {
        if (item.status === '风险' && item.supplier) {
          supplierCounts[item.supplier] = (supplierCounts[item.supplier] || 0) + 1;
        }
      });
      
      // 找出风险物料最多的供应商
      let maxCount = 0;
      let topSupplier = '电子科技';
      
      for (const [supplier, count] of Object.entries(supplierCounts)) {
        if (count > maxCount) {
          maxCount = count;
          topSupplier = supplier;
        }
      }
      
      return topSupplier;
    });

    // 获取风险等级
    const riskLevel = computed(() => {
      // 根据风险物料的数量确定风险等级
      const count = riskItemsCount.value;
      
      if (count >= 100) return 'Level-A';
      if (count >= 50) return 'Level-B';
      if (count >= 20) return 'Level-C';
      return 'Level-D';
    });

    // 获取风险等级说明
    const riskLevelDescription = computed(() => {
      switch (riskLevel.value) {
        case 'Level-A':
          return '高风险 - 需立即干预';
        case 'Level-B':
          return '中高风险 - 需优先处理';
        case 'Level-C':
          return '中等风险 - 需密切监控';
        case 'Level-D':
          return '低风险 - 定期检查';
        default:
          return '未知风险';
      }
    });

    // 获取Action图标样式类
    const getActionIconClass = (status) => {
      switch (status) {
        case '处理中':
        case '已冻结':
          return 'high-risk-icon';
        case '待处理':
          return 'medium-risk-icon';
        case '已解决':
          return 'success-icon';
        default:
          return 'low-risk-icon';
      }
    };

    // 获取Action图标
    const getActionIcon = (status) => {
      switch (status) {
        case '处理中':
          return 'Warning';
        case '已冻结':
          return 'Lock';
        case '待处理':
          return 'InfoFilled';
        case '已解决':
          return 'CircleCheck';
        default:
          return 'InfoFilled';
      }
    };

    // 获取Tag类型
    const getTagType = (status) => {
      switch (status) {
        case '处理中':
          return 'warning';
        case '已冻结':
          return 'danger';
        case '待处理':
          return 'info';
        case '已解决':
          return 'success';
        default:
          return '';
      }
    };

    // 分析供应商风险
    const topRiskSuppliers = computed(() => {
      // 统计各供应商的风险物料数量
      const supplierStats = {};
      
      inventoryData.value.forEach(item => {
        if (!item.supplier) return;
        
        if (!supplierStats[item.supplier]) {
          supplierStats[item.supplier] = {
            name: item.supplier,
            issues: 0,
            totalItems: 0,
            riskScore: 0
          };
        }
        
        supplierStats[item.supplier].totalItems++;
        
        if (item.status === '风险' || item.status === '冻结' || 
            (item.quality && (item.quality === '不合格' || item.quality.includes('风险')))) {
          supplierStats[item.supplier].issues++;
        }
      });
      
      // 计算风险指数并分配等级
      const suppliers = Object.values(supplierStats);
      
      suppliers.forEach(supplier => {
        if (supplier.totalItems > 0) {
          supplier.riskScore = Math.round((supplier.issues / supplier.totalItems) * 100);
        }
        
        // 分配风险等级
        if (supplier.riskScore >= 80) supplier.score = 'D';
        else if (supplier.riskScore >= 70) supplier.score = 'C+';
        else if (supplier.riskScore >= 60) supplier.score = 'C';
        else if (supplier.riskScore >= 50) supplier.score = 'B-';
        else if (supplier.riskScore >= 40) supplier.score = 'B';
        else if (supplier.riskScore >= 30) supplier.score = 'B+'; 
        else if (supplier.riskScore >= 20) supplier.score = 'A-';
        else supplier.score = 'A';
      });
      
      // 按风险指数排序并返回前5名
      return suppliers
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 5);
    });

    // 分析供应商质量状况
    const topQualitySuppliers = computed(() => {
      // 统计各供应商的质量问题
      const supplierStats = {};
      
      inventoryData.value.forEach(item => {
        if (!item.supplier) return;
        
        if (!supplierStats[item.supplier]) {
          supplierStats[item.supplier] = {
            name: item.supplier,
            defects: 0,
            batchCount: 0,
            defectRate: 0
          };
        }
        
        // 按批次统计
        const batchKey = item.batchNo || item.materialCode || Math.random().toString();
        if (!supplierStats[item.supplier][batchKey]) {
          supplierStats[item.supplier][batchKey] = true;
          supplierStats[item.supplier].batchCount++;
          
          // 计算不合格批次
          if (item.status === '冻结' || 
              (item.quality && (item.quality === '不合格' || item.quality.includes('不合格')))) {
            supplierStats[item.supplier].defects++;
          }
        }
      });
      
      // 计算不合格率并分配质量等级
      const suppliers = Object.values(supplierStats)
        .filter(supplier => supplier.batchCount >= 3); // 至少有3个批次才统计
      
      suppliers.forEach(supplier => {
        if (supplier.batchCount > 0) {
          supplier.defectRate = Math.round((supplier.defects / supplier.batchCount) * 100);
        } else {
          supplier.defectRate = 0;
        }
        
        // 分配质量等级
        if (supplier.defectRate >= 5) supplier.qualityLevel = '较差';
        else if (supplier.defectRate >= 2) supplier.qualityLevel = '一般';
        else if (supplier.defectRate > 0) supplier.qualityLevel = '良好';
        else supplier.qualityLevel = '优秀';
      });
      
      // 按不合格率排序并返回前5名
      return suppliers
        .sort((a, b) => b.defectRate - a.defectRate)
        .slice(0, 5);
    });

    // 获取质量等级样式类
    const getQualityLevelClass = (level) => {
      switch (level) {
        case '极差':
        case '较差':
          return 'poor-quality';
        case '一般':
          return 'average-quality';
        case '良好':
        case '优秀':
          return 'good-quality';
        default:
          return '';
      }
    };

    // 获取风险等级样式类
    const getRiskLevelClass = (score) => {
      if (score === 'D' || score === 'C+' || score === 'C') {
        return 'high-risk';
      } else if (score === 'B-' || score === 'B') {
        return 'medium-risk';
      } else {
        return 'low-risk';
      }
    };

    // 获取质量等级对应的Tag类型
    const getQualityTagType = (level) => {
      switch (level) {
        case '极差':
        case '较差':
          return 'danger';
        case '一般':
          return 'warning';
        case '良好':
          return 'success';
        case '优秀':
          return 'success';
        default:
          return 'info';
      }
    };

    // 获取风险等级对应的Tag类型
    const getRiskTagType = (score) => {
      if (score === 'D' || score === 'C+' || score === 'C') {
        return 'danger';
      } else if (score === 'B-' || score === 'B') {
        return 'warning';
      } else {
        return 'success';
      }
    };

    // 获取近期风险物料
    const recentRiskMaterials = computed(() => {
      console.log('计算风险物料，当前库存数据数量:', inventoryData.value.length);
      
      // 从库存数据中提取风险物料，并按照风险级别排序
      const riskItems = inventoryData.value
        .filter(item => {
          const isRisk = item.status === '风险' || 
                        item.status === '冻结' || 
                        (item.quality && (item.quality === '不合格' || item.quality?.includes('风险')));
          return isRisk;
        })
        .sort((a, b) => {
          // 按日期排序，最新的在前面
          const dateA = new Date(a.receiveDate || a.arrivalDate || 0);
          const dateB = new Date(b.receiveDate || b.arrivalDate || 0);
          return dateB - dateA;
        })
        .slice(0, 3);
      
      console.log('筛选出的风险物料数量:', riskItems.length);
      
      // 转换为UI显示格式
      const result = riskItems.map(item => {
        // 确定物料类型
        let type = '物料';
        if (item.materialType) {
          type = item.materialType;
        } else if (item.materialCode) {
          if (item.materialCode.startsWith('EC')) type = '电子元件';
          else if (item.materialCode.startsWith('BAT')) type = '电池组';
          else if (item.materialCode.startsWith('CMS')) type = 'CMOS图像传感器';
        }
        
        // 确定问题描述
        let issue = '质量异常';
        if (item.quality === '不合格') issue = '不合格';
        else if (item.status === '冻结') issue = '已冻结';
        else if (item.status === '风险') issue = '存在风险';
        
        // 确定状态
        let status = '待处理';
        if (item.status === '冻结') status = '已冻结';
        
        // 构建详情
        let details = '';
        if (item.batchNo) details += `出厂批次: ${item.batchNo} | `;
        if (item.productionLine) details += `移送产线: ${item.productionLine} | `;
        if (item.inspectionDate) details += `检验日期: ${formatDate(item.inspectionDate)} | `;
        if (item.quantity && item.price) {
          const value = Math.round(item.quantity * item.price);
          if (value > 0) details += `价值: ¥${value.toLocaleString()} | `;
        }
        
        // 移除末尾的分隔符
        details = details.replace(/\|\s*$/, '');
        
        return {
          type,
          code: item.materialCode || '',
          materialName: item.materialName || '',
          supplier: item.supplier || '',
          batchNo: item.batchNo || '',
          warehouse: item.warehouse || item.storageLocation || '',
          issue,
          status,
          details: details || '暂无详细信息',
          freezeReason: item.freezeReason || item.notes || '',
        };
      });
      
      console.log('转换后的风险物料数据:', result);
      return result;
    });

    // 风险物料（不包括已冻结）
    const riskOnlyMaterials = computed(() => {
      // 过滤出非冻结的风险物料
      return recentRiskMaterials.value.filter(item => 
        item.status !== '已冻结' && item.status !== '冻结'
      ).slice(0, 4); // 最多显示4个风险物料
    });

    // 冻结物料
    const frozenOnlyMaterials = computed(() => {
      // 从库存数据中提取冻结物料
      const frozenItems = inventoryData.value
        .filter(item => item.status === '冻结' || item.status === '已冻结')
        .sort((a, b) => {
          // 按冻结日期排序，最新的在前面
          const dateA = new Date(a.freezeDate || a.receiveDate || a.arrivalDate || 0);
          const dateB = new Date(b.freezeDate || b.receiveDate || b.arrivalDate || 0);
          return dateB - dateA;
        })
        .slice(0, 4); // 最多显示4个冻结物料
      
      // 转换为UI显示格式
      const result = frozenItems.map(item => {
        // 确定物料类型
        let type = '冻结物料';
        if (item.materialType) {
          type = item.materialType;
        } else if (item.materialCode) {
          if (item.materialCode.startsWith('EC')) type = '电子元件';
          else if (item.materialCode.startsWith('BAT')) type = '电池组';
          else if (item.materialCode.startsWith('CMS')) type = 'CMOS图像传感器';
          else type = '物料';
        }
        
        // 构建详情
        let details = '';
        if (item.productionLine) details += `移送产线: ${item.productionLine} | `;
        if (item.freezeDate) details += `冻结日期: ${formatDate(item.freezeDate)} | `;
        else if (item.inspectionDate) details += `检验日期: ${formatDate(item.inspectionDate)} | `;
        if (item.quality) details += `质检结果: ${item.quality} | `;
        if (item.quantity && item.price) {
          const value = Math.round(item.quantity * item.price);
          if (value > 0) details += `价值: ¥${value.toLocaleString()} | `;
        }
        
        // 移除末尾的分隔符
        details = details.replace(/\|\s*$/, '');
        
        return {
          type,
          code: item.materialCode || '',
          materialName: item.materialName || '',
          supplier: item.supplier || '',
          batchNo: item.batchNo || '',
          warehouse: item.warehouse || item.storageLocation || '检验区',
          issue: '已冻结',
          status: '已冻结',
          details: details || '冻结待处理',
          freezeReason: item.freezeReason || item.notes || '质量异常，待进一步检验',
        };
      });
      
      return result;
    });

    // 当前日期
    const currentDate = computed(() => {
      const now = new Date();
      return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    });
    
    // 分页
    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(0);
    
    // 过滤
    const searchQuery = ref('');
    const statusFilter = ref('');
    const warehouseFilter = ref('');
    
    // 高级筛选
    const showAdvancedSearch = ref(false);
    const advancedFilter = reactive({
      dateRange: [],
      suppliers: [],
      category: [],
      qualityStatus: [],
      batchNo: '',
    });
    
    // 仓库和物料选项
    const supplierOptions = ref([]);
    const materialCategoryOptions = ref([]);
    const availableLocations = ref([]);
    
    // 表格相关状态
    const showMoveLocationDialog = ref(false);
    const selectedItem = ref(null);
    const moveLocationForm = reactive({
      targetWarehouse: '',
      targetLocation: '',
      reason: ''
    });
    
    // 冻结原因数据
    const freezeReasons = reactive({
      '质量问题': {
        count: 0,
        subReasons: {
          '不良率超标': 0,
          '安规不合格': 0,
          '外观不良': 0,
          '性能测试异常': 0
        }
      },
      '供应商问题': {
        count: 0,
        subReasons: {
          '供应商资质审核不通过': 0,
          '批次混乱': 0,
          '交期延误': 0
        }
      },
      '技术参数': {
        count: 0,
        subReasons: {
          '材料参数偏差': 0,
          '性能不稳定': 0,
          '兼容性问题': 0
        }
      },
      '包装问题': {
        count: 0,
        subReasons: {
          '包装破损': 0,
          '标签错误': 0,
          '防护不足': 0
        }
      },
      '其他': {
        count: 0,
        subReasons: {
          '文档不全': 0,
          '内部流程问题': 0,
          '未知原因': 0
        }
      }
    });
    
    // 解冻方案数据
    const unfreezeCategories = reactive({
      '退回处理': 0,
      '现场返工': 0,
      '工艺调整': 0,
      '特采放行': 0,
      '降级使用': 0,
      '自然降解': 0
    });
    
    // 获取库存数据
    const fetchInventoryData = async () => {
      tableLoading.value = true;
      console.log('开始获取库存数据...');
      
      try {
        // 从统一数据服务获取库存数据 - 使用异步方法
        const data = await UnifiedDataService.getInventoryData();
        console.log(`从UnifiedDataService获取到${data ? data.length : 0}条库存数据`);
        
        // 保存获取到的数据
        if (Array.isArray(data) && data.length > 0) {
          inventoryData.value = data;
          console.log(`成功获取到${data.length}条库存数据`);
        } else {
          console.warn('获取到的库存数据为空或格式无效');
          inventoryData.value = [];
          
          // 尝试从其他来源获取数据
          try {
            const rawData = localStorage.getItem('inventory_data');
            if (rawData) {
              const parsedData = JSON.parse(rawData);
              if (Array.isArray(parsedData) && parsedData.length > 0) {
                console.log(`从localStorage直接获取到${parsedData.length}条库存数据`);
                inventoryData.value = parsedData;
              }
            }
          } catch (localStorageError) {
            console.error('从localStorage获取库存数据失败:', localStorageError);
          }
        }
        
        // 检查数据内容
        if (inventoryData.value.length > 0) {
          console.log('库存数据示例:', inventoryData.value.slice(0, 3));
        } else {
          console.warn('未能获取到任何库存数据');
        }
        
        // 更新统计数据
        updateDashboardStats();
        
        // 更新供应商选项
        updateSupplierOptions();
        
        // 更新物料分类选项
        updateMaterialCategoryOptions();
        
        // 更新过滤后的数据
        updateFilteredData();
        
        // 更新冻结原因数据
        updateFreezeReasonData();
        
        console.log(`成功加载并处理${inventoryData.value.length}条库存数据`);
      } catch (error) {
        console.error('获取库存数据失败:', error);
        ElMessage.error('获取库存数据失败: ' + error.message);
        inventoryData.value = [];
      } finally {
        tableLoading.value = false;
      }
    };
    
    // 更新仪表盘统计数据
    const updateDashboardStats = () => {
      if (!inventoryData.value || inventoryData.value.length === 0) {
        return;
      }
      
      // 更新总数
      dashboardData.totalItems = inventoryData.value.length;
      
      // 更新冻结物料数 - 仅用于兼容旧代码的图表
      dashboardData.frozenItems = inventoryData.value.filter(item => item.status === '冻结').length;
      
      // 更新风险物料数 - 仅用于兼容旧代码的图表
      dashboardData.riskItems = inventoryData.value.filter(item => item.status === '风险').length;
      
      // 更新质量问题物料数 - 仅用于兼容旧代码的图表
      dashboardData.qualityProblemItems = inventoryData.value.filter(
        item => item.quality === '不合格' || item.quality?.includes('风险物料')
      ).length;
      
      // 由于现在使用computed属性，不需要在此更新UI显示的统计数据
      // normalItemsCount, riskItemsCount, rejectedItemsCount等已通过计算属性自动更新
    };
    
    // 更新供应商选项
    const updateSupplierOptions = () => {
      if (!inventoryData.value || inventoryData.value.length === 0) {
        supplierOptions.value = [];
        return;
      }
      
      // 提取所有唯一的供应商
      const suppliers = new Set();
      inventoryData.value.forEach(item => {
        if (item.supplier) {
          suppliers.add(item.supplier);
        }
      });
      
      supplierOptions.value = Array.from(suppliers);
    };
    
    // 更新物料分类选项
    const updateMaterialCategoryOptions = () => {
      if (!inventoryData.value || inventoryData.value.length === 0) {
        materialCategoryOptions.value = [];
        return;
      }
      
      // 提取所有唯一的物料分类
      const categories = new Set();
      inventoryData.value.forEach(item => {
        if (item.materialType || item.category) {
          categories.add(item.materialType || item.category);
        }
      });
      
      // 转换为级联选择器格式
      materialCategoryOptions.value = Array.from(categories).map(category => ({
        value: category,
        label: category,
        children: []
      }));
    };

    // 生命周期钩子
    onMounted(async () => {
      // 初始化数据 - 使用await确保数据加载完成
      await fetchInventoryData();
      
      // 初始化图表
      nextTick(() => {
        renderReasonDistChart();
        renderReasonTrendChart();
        renderSolutionsChart();
        renderSupplierQualityChart();
      });
      
      // 监听仓库变化以更新可用库位
      watch(() => moveLocationForm.targetWarehouse, (newWarehouse) => {
        if (newWarehouse) {
          availableLocations.value = generateAvailableLocations(newWarehouse);
        }
      });
      
      // 初始化数据时确保工厂、仓库、物料编号和入库时间字段有值
      initializeInventoryData();
      
      console.log('库存页面初始化完成，数据加载成功');
    });

    // 清空库存数据
    const clearInventoryData = () => {
      try {
        // 清空数据
        UnifiedDataService.saveData('inventory_data', [], true);
        
        // 重置内存中的数据
        inventoryData.value = [];
        filteredInventoryData.value = [];
        total.value = 0;
        
        // 重置仪表盘数据
        Object.assign(dashboardData, {
          totalItems: 0,
          totalItemsTrend: 0,
          frozenItems: 0,
          frozenTrend: 0,
          pendingFrozenItems: 0,
          pendingFrozenTrend: 0,
          riskItems: 0,
          riskTrend: 0,
          qualityProblemItems: 0,
          qualityProblemTrend: 0,
          unfrozenItems: 0,
          unfrozenTrend: 0
        });
        
        ElMessage.success('库存数据已清空');
      } catch (error) {
        console.error('清空库存数据失败:', error);
        ElMessage.error('清空库存数据失败: ' + error.message);
      }
    };
    
    // 确认清空数据
    const confirmClearData = () => {
      ElMessageBox.confirm(
        '确定要清空所有库存数据吗？此操作不可恢复！',
        '清空数据确认',
        {
          confirmButtonText: '确定清空',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        clearInventoryData();
      }).catch(() => {
        // 用户取消操作
      });
    };
    
    // 处理下拉菜单命令
    const handleCommand = (command) => {
      if (command === 'refresh') {
        refreshData();
      } else if (command === 'clear') {
        confirmClearData();
      }
    };

    // 渲染冻结原因分布图表
    const renderReasonDistChart = async () => {
      reasonDistChartLoaded.value = false;
      try {
        const chartDom = document.getElementById('reasonDistChart');
        if (!chartDom) {
          console.warn('找不到reasonDistChart DOM元素');
          return;
        }
        
        const chart = await safeInitChart(chartDom);
        if (!chart) {
          console.error('初始化reasonDistChart失败');
          return;
        }
        
        const option = {
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 10,
            data: ['质量问题', '技术参数', '供应商问题', '文档不全', '其他']
          },
          series: [
            {
              name: '冻结原因',
              type: 'pie',
              radius: ['40%', '70%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '18',
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: [
                { value: 42, name: '质量问题' },
                { value: 28, name: '技术参数' },
                { value: 15, name: '供应商问题' },
                { value: 10, name: '文档不全' },
                { value: 5, name: '其他' }
              ]
            }
          ]
        };
        
        chart.setOption(option);
        setupChartResize(chart);
        reasonDistChartLoaded.value = true;
      } catch (error) {
        console.error('渲染冻结原因分布图表失败:', error);
        reasonDistChartLoaded.value = true; // 即使失败也设置为已加载，避免一直显示加载中
      }
    };
    
    // 渲染冻结原因趋势图表
    const renderReasonTrendChart = async () => {
      reasonTrendChartLoaded.value = false;
      try {
        const chartDom = document.getElementById('reasonTrendChart');
        if (!chartDom) {
          console.warn('找不到reasonTrendChart DOM元素');
          return;
        }
        
        const chart = await safeInitChart(chartDom);
        if (!chart) {
          console.error('初始化reasonTrendChart失败');
          return;
        }
        
        const option = {
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: ['质量问题', '技术参数', '供应商问题', '文档不全', '其他']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              name: '质量问题',
              type: 'line',
              stack: 'Total',
              data: [12, 13, 10, 13, 18, 21, 24]
            },
            {
              name: '技术参数',
              type: 'line',
              stack: 'Total',
              data: [5, 7, 6, 9, 10, 12, 15]
            },
            {
              name: '供应商问题',
              type: 'line',
              stack: 'Total',
              data: [3, 4, 5, 4, 6, 5, 7]
            },
            {
              name: '文档不全',
              type: 'line',
              stack: 'Total',
              data: [2, 3, 2, 3, 2, 4, 3]
            },
            {
              name: '其他',
              type: 'line',
              stack: 'Total',
              data: [1, 1, 2, 1, 2, 1, 2]
            }
          ]
        };
        
        chart.setOption(option);
        setupChartResize(chart);
        reasonTrendChartLoaded.value = true;
      } catch (error) {
        console.error('渲染冻结原因趋势图表失败:', error);
        reasonTrendChartLoaded.value = true; // 即使失败也设置为已加载，避免一直显示加载中
      }
    };
    
    // 渲染解决方案图表
    const renderSolutionsChart = async () => {
      solutionsChartLoaded.value = false;
      try {
        const chartDom = document.getElementById('solutionsChart');
        if (!chartDom) {
          console.warn('找不到solutionsChart DOM元素');
          return;
        }
        
        const chart = await safeInitChart(chartDom);
        if (!chart) {
          console.error('初始化solutionsChart失败');
          return;
        }
        
        let option;
        
        if (solutionChartType.value === 'distribution') {
          option = {
            tooltip: {
              trigger: 'item',
              formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            legend: {
              orient: 'vertical',
              left: 10,
              data: ['特采放行', '退回处理', '现场返工', '降级使用', '报废处理']
            },
            series: [
              {
                name: '处置方案',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                  borderRadius: 10,
                  borderColor: '#fff',
                  borderWidth: 2
                },
                label: {
                  show: false,
                  position: 'center'
                },
                emphasis: {
                  label: {
                    show: true,
                    fontSize: '18',
                    fontWeight: 'bold'
                  }
                },
                labelLine: {
                  show: false
                },
                data: [
                  { value: 35, name: '特采放行' },
                  { value: 25, name: '退回处理' },
                  { value: 20, name: '现场返工' },
                  { value: 15, name: '降级使用' },
                  { value: 5, name: '报废处理' }
                ]
              }
            ]
          };
        } else {
          option = {
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow'
              }
            },
            legend: {},
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
            },
            xAxis: {
              type: 'category',
              data: ['特采放行', '退回处理', '现场返工', '降级使用', '报废处理']
            },
            yAxis: {
              type: 'value',
              name: '平均处理天数'
            },
            series: [
              {
                name: '处理时长',
                type: 'bar',
                data: [2.5, 5.8, 4.2, 3.1, 1.5]
              }
            ]
          };
        }
        
        chart.setOption(option);
        setupChartResize(chart);
        solutionsChartLoaded.value = true;
      } catch (error) {
        console.error('渲染解决方案图表失败:', error);
        solutionsChartLoaded.value = true; // 即使失败也设置为已加载，避免一直显示加载中
      }
    };
    
    // 更新冻结原因和解冻方案数据
    const updateFreezeReasonData = () => {
      // 重置数据
      Object.keys(freezeReasons).forEach(key => {
        freezeReasons[key].count = 0;
        Object.keys(freezeReasons[key].subReasons).forEach(subKey => {
          freezeReasons[key].subReasons[subKey] = 0;
        });
      });
      
      Object.keys(unfreezeCategories).forEach(key => {
        unfreezeCategories[key] = 0;
      });
      
      // 根据表格数据更新冻结原因
      inventoryData.value.forEach(item => {
        // 处理冻结原因
        if (item.status === '冻结' || (item.quality && item.quality.includes('风险物料')) || item.quality === '不合格') {
          // 根据批次号和供应商分配不同的冻结原因
          const batchNoStr = item.batchNo ? String(item.batchNo) : '';
          const batchNum = parseInt(batchNoStr.replace(/\D/g, '') || '0') || 0;
          
          if (item.quality === '不合格' || (item.quality && item.quality.includes('风险物料'))) {
            freezeReasons['质量问题'].count++;
            
            // 根据批次号分配子原因
            if (batchNum % 4 === 0) {
              freezeReasons['质量问题'].subReasons['不良率超标']++;
            } else if (batchNum % 4 === 1) {
              freezeReasons['质量问题'].subReasons['安规不合格']++;
            } else if (batchNum % 4 === 2) {
              freezeReasons['质量问题'].subReasons['外观不良']++;
            } else {
              freezeReasons['质量问题'].subReasons['性能测试异常']++;
            }
          } else if (item.supplier && item.supplier.includes('科技')) {
            freezeReasons['技术参数'].count++;
            
            // 根据批次号分配子原因
            if (batchNum % 3 === 0) {
              freezeReasons['技术参数'].subReasons['材料参数偏差']++;
            } else if (batchNum % 3 === 1) {
              freezeReasons['技术参数'].subReasons['性能不稳定']++;
            } else {
              freezeReasons['技术参数'].subReasons['兼容性问题']++;
            }
          } else if ((item.supplier && item.supplier.includes('电池')) || (item.supplier && item.supplier.includes('电子'))) {
            freezeReasons['供应商问题'].count++;
            
            // 根据批次号分配子原因
            if (batchNum % 3 === 0) {
              freezeReasons['供应商问题'].subReasons['供应商资质审核不通过']++;
            } else if (batchNum % 3 === 1) {
              freezeReasons['供应商问题'].subReasons['批次混乱']++;
            } else {
              freezeReasons['供应商问题'].subReasons['交期延误']++;
            }
          } else if (batchNum % 10 === 0) {
            freezeReasons['包装问题'].count++;
            
            // 根据批次号分配子原因
            if (batchNum % 3 === 0) {
              freezeReasons['包装问题'].subReasons['包装破损']++;
            } else if (batchNum % 3 === 1) {
              freezeReasons['包装问题'].subReasons['标签错误']++;
            } else {
              freezeReasons['包装问题'].subReasons['防护不足']++;
            }
          } else {
            freezeReasons['其他'].count++;
            
            // 根据批次号分配子原因
            if (batchNum % 3 === 0) {
              freezeReasons['其他'].subReasons['文档不全']++;
            } else if (batchNum % 3 === 1) {
              freezeReasons['其他'].subReasons['内部流程问题']++;
            } else {
              freezeReasons['其他'].subReasons['未知原因']++;
            }
          }
        }
        
        // 处理解冻方案
        if (item.status === '正常' && item.shelfLife) {
          // 添加类型检查，避免TypeError
          try {
            let dateStr;
            if (typeof item.shelfLife === 'string') {
              // 如果是字符串，尝试提取日期部分
              dateStr = item.shelfLife.split(' ')[0];
            } else if (item.shelfLife instanceof Date) {
              // 如果已经是日期对象
              dateStr = item.shelfLife.toISOString().split('T')[0];
            } else if (item.expiryDate) {
              // 如果没有shelfLife但有expiryDate
              dateStr = typeof item.expiryDate === 'string' ? item.expiryDate.split('T')[0] : item.expiryDate.toISOString().split('T')[0];
            } else {
              // 如果都没有，跳过这条记录
              return;
            }
            
          const shelfDate = new Date(dateStr);
            if (isNaN(shelfDate.getTime())) {
              console.warn('无效的日期格式:', dateStr);
              return;
            }
            
          const today = new Date();
          const diffDays = Math.ceil((shelfDate - today) / (1000 * 60 * 60 * 24));
          
          if (diffDays > 0 && diffDays < 60) {
            // 根据批次号分配解冻方案
              const batchNoStr = item.batchNo ? String(item.batchNo) : '';
              const batchNum = parseInt(batchNoStr.replace(/\D/g, '') || '0') || 0;
            if (batchNum % 6 === 0) {
              unfreezeCategories['退回处理']++;
            } else if (batchNum % 6 === 1) {
              unfreezeCategories['现场返工']++;
            } else if (batchNum % 6 === 2) {
              unfreezeCategories['工艺调整']++;
            } else if (batchNum % 6 === 3) {
              unfreezeCategories['特采放行']++;
            } else if (batchNum % 6 === 4) {
              unfreezeCategories['降级使用']++;
            } else {
              unfreezeCategories['自然降解']++;
            }
            }
          } catch (error) {
            console.warn('处理物料保质期数据出错:', error);
          }
        }
      });
      
      // 确保每个类别至少有一些数据
      Object.keys(freezeReasons).forEach(key => {
        if (freezeReasons[key].count === 0) {
          freezeReasons[key].count = Math.floor(Math.random() * 10) + 1;
          
          Object.keys(freezeReasons[key].subReasons).forEach(subKey => {
            if (freezeReasons[key].subReasons[subKey] === 0) {
              freezeReasons[key].subReasons[subKey] = Math.floor(Math.random() * 5) + 1;
            }
          });
        }
      });
      
      Object.keys(unfreezeCategories).forEach(key => {
        if (unfreezeCategories[key] === 0) {
          unfreezeCategories[key] = Math.floor(Math.random() * 8) + 1;
        }
      });
    };
    
    // 更新过滤数据的方法
    const updateFilteredData = () => {
      let data = [...inventoryData.value];
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        data = data.filter(item => 
          (item.materialCode && typeof item.materialCode === 'string' && item.materialCode.toLowerCase().includes(query)) ||
          (item.materialName && typeof item.materialName === 'string' && item.materialName.toLowerCase().includes(query)) ||
          (item.batchNo && typeof item.batchNo === 'string' && item.batchNo.toLowerCase().includes(query)) ||
          (item.supplier && typeof item.supplier === 'string' && item.supplier.toLowerCase().includes(query))
        );
      }
      
      if (statusFilter.value) {
        // 根据状态过滤
        if (statusFilter.value === '正常') {
          data = data.filter(item => item.status === '正常');
        } else if (statusFilter.value === '风险') {
          data = data.filter(item => item.status === '风险');
        } else if (statusFilter.value === '冻结') {
          data = data.filter(item => item.status === '冻结');
        } else if (statusFilter.value === '不合格') {
          data = data.filter(item => item.quality === '不合格' || (item.quality && item.quality.includes('不合格')));
        }
      }
      
      if (warehouseFilter.value) {
        data = data.filter(item => item.warehouse === warehouseFilter.value);
      }
      
      console.log(`过滤条件: 搜索=${searchQuery.value}, 状态=${statusFilter.value}, 仓库=${warehouseFilter.value}`);
      console.log(`过滤后数据数量: ${data.length}`);
      
      filteredInventoryData.value = data;
      total.value = data.length;
      
      // 如果当前页码超出范围，重置为第一页
      if (currentPage.value > Math.ceil(total.value / pageSize.value) && total.value > 0) {
        currentPage.value = 1;
      }
      
      console.log(`过滤后数据: ${data.length}条，当前页: ${currentPage.value}，每页: ${pageSize.value}`);
    };

    // 监听相关变化以更新过滤数据
    watch([searchQuery, statusFilter, warehouseFilter, inventoryData], () => {
      updateFilteredData();
      // 切换筛选条件时，重置到第一页
      currentPage.value = 1;
    });
    
    // 设置表格行的类名
    const tableRowClassName = ({ row }) => {
      if (row.status === '冻结') return 'frozen-row';
      if (row.status === '风险') return 'risk-row';
      return '';
    };
    
    // 获取库存状态样式
    const getStatusType = (row) => {
      if (row.status === '正常') return 'success';
      if (row.status === '风险') return 'warning';
      if (row.status === '冻结') return 'info';
      return 'info';
    };
    
    // 获取物料状态标签类型
    const getStatusTagType = (status) => {
      if (status === '正常') return 'success';
      if (status === '风险') return 'warning';
      if (status === '冻结') return 'danger';
      return 'info';
    };
    
    // 获取质量状态样式
    const getQualityType = (row) => {
      if (!row.quality) return '';
      if (row.quality === '合格') return 'success';
      if (row.quality === '待检') return 'info';
      if (row.quality === '不合格') return 'danger';
      if (typeof row.quality === 'string' && row.quality.includes('风险物料')) return 'warning';
      return '';
    };
    
    // 格式化日期
    const formatDate = (dateStr) => {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    
    // 格式化批次号，仅保留数字部分
    const formatBatchNumber = (batchNo) => {
      return batchNo.replace(/[^\d]/g, '');
    };
    
    // 查询方法
    const handleSearch = () => {
      console.log('执行搜索：', searchQuery.value, statusFilter.value, warehouseFilter.value);
      // 重置为第一页
      currentPage.value = 1;
      // 手动触发数据过滤更新
      updateFilteredData();
    };
    
    // 分页方法
    const handleSizeChange = (val) => {
      pageSize.value = val;
      console.log(`每页条数变更为: ${val}, 显示数据: ${pagedInventoryData.value.length}条`);
      
      // 如果当前页码超出范围，重置为第一页
      if (currentPage.value > Math.ceil(total.value / pageSize.value)) {
        currentPage.value = 1;
      }
    };
    
    const handleCurrentChange = (val) => {
      currentPage.value = val;
      console.log(`页码变更为: ${val}, 显示数据: ${pagedInventoryData.value.length}条`);
    };
    
    // 冻结/解冻物料
    const handleFreezeToggle = (row) => {
      console.log('触发冻结/解冻操作，row:', row);
      
      // 如果row为null，使用默认示例数据
      if (!row) {
        ElMessage({
          type: 'info',
          message: '这是一个示例操作，实际环境中请选择真实物料进行操作'
        });
        return;
      }
      
      // 从数据中查找该物料
      let targetItem = row;
      console.log('物料初始数据:', targetItem);
      
      // 如果传入的是UI展示对象而不是原始数据对象，则尝试在库存数据中查找匹配的物料
      if (!row.id && (row.code || row.materialCode)) {
        const materialCode = row.code || row.materialCode;
        const batchNo = row.batchNo;
        console.log('尝试根据编码和批次查找物料:', materialCode, batchNo);
        
        targetItem = inventoryData.value.find(item => 
          (item.materialCode === materialCode || item.code === materialCode) && 
          ((!batchNo && !item.batchNo) || (batchNo && item.batchNo && item.batchNo.includes(batchNo)))
        );
        
        console.log('查找到的目标物料:', targetItem);
        
        if (!targetItem) {
          ElMessage({
            type: 'warning',
            message: `未找到物料 ${row.materialName || materialCode}，请刷新数据后重试`
          });
          return;
        }
      }
      
      // 检查targetItem是否有效
      if (!targetItem || !targetItem.materialName) {
        console.error('无效的物料对象:', targetItem);
        ElMessage.error('物料数据无效，无法执行操作');
        return;
      }
      
      const action = targetItem.status === '冻结' || targetItem.status === '已冻结' ? '解冻' : '冻结';
      const batchNumber = targetItem.batchNo ? (typeof targetItem.batchNo === 'string' ? targetItem.batchNo.replace(/[^\w-]/g, '') : targetItem.batchNo) : '未知批次';
      
      console.log('执行操作:', action, '物料:', targetItem.materialName, '批次:', batchNumber);
      
      // 确认操作
      ElMessageBox.confirm(
        `确定要${action}物料 ${targetItem.materialName}（批次: ${batchNumber}）吗？`,
        `${action}物料确认`,
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        console.log('用户确认执行操作:', action);
        
        // 更新物料状态
        if (action === '解冻') {
          targetItem.status = '正常';
          targetItem.freezeReason = '';
          targetItem.freezeDate = null;
          targetItem.notes = targetItem.notes ? targetItem.notes + ' | 已解冻' : '已解冻';
          
          console.log('物料已解冻:', targetItem);
          
          // 保存更新到数据服务
          const saveResult = UnifiedDataService.saveInventoryData(inventoryData.value, true);
          console.log('解冻数据保存结果:', saveResult);
          
          // 通知用户
          ElMessage({
            type: 'success',
            message: `物料已${action}成功`
          });
          
          // 刷新数据，重新计算统计数据和风险物料
          refreshData();
        } else {
          targetItem.status = '冻结';
          targetItem.freezeDate = new Date().toISOString();
          
          console.log('物料状态已更新为冻结，准备获取冻结原因');
          
          // 弹出对话框输入冻结原因
          ElMessageBox.prompt(
            '请输入冻结原因',
            '冻结原因',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              inputPlaceholder: '例如：质检不合格、参数异常等'
            }
          ).then(({ value }) => {
            console.log('用户输入的冻结原因:', value);
            
            targetItem.freezeReason = value || '质量异常，待检验';
            targetItem.notes = targetItem.notes ? targetItem.notes + ' | ' + targetItem.freezeReason : targetItem.freezeReason;
            
            console.log('更新后的物料数据:', targetItem);
            
            // 保存更新到数据服务
            const saveResult = UnifiedDataService.saveInventoryData(inventoryData.value, true);
            console.log('冻结数据保存结果:', saveResult);
            
            // 通知用户
        ElMessage({
          type: 'success',
              message: `物料已${action}成功: ${targetItem.freezeReason}`
        });
            
            // 刷新数据，重新计算统计数据和风险物料
            refreshData();
          }).catch((err) => {
            // 用户取消输入冻结原因，恢复状态
            console.log('用户取消输入冻结原因:', err);
            targetItem.status = targetItem.status === '冻结' ? '正常' : targetItem.status;
            ElMessage({
              type: 'info',
              message: '已取消冻结操作'
            });
          });
          return;
        }
      }).catch((err) => {
        // 用户取消操作
        console.log('用户取消操作:', err);
        ElMessage({
          type: 'info',
          message: '已取消操作'
        });
      });
    };
    
    // 查看检验记录
    const handleViewInspection = (row) => {
      ElNotification({
        title: '物料检验记录',
        message: `查看 ${row.materialName}（批次号: ${row.batchNo}）的检验历史记录`,
        type: 'info'
      });
    };
    
    // 查看物料详情
    const viewDetails = (row) => {
      selectedItem.value = row;
      
      // 计算剩余天数
      let remainingDaysText = '';
      if (row.expiryDate) {
        const expiryDate = new Date(row.expiryDate);
        const remainingDays = getRemainingDays(expiryDate);
        
        if (remainingDays < 0) {
          remainingDaysText = `<span style="color: red">已过期 ${Math.abs(remainingDays)} 天</span>`;
        } else if (remainingDays <= 30) {
          remainingDaysText = `<span style="color: orange">剩余 ${remainingDays} 天</span>`;
        } else {
          remainingDaysText = `<span style="color: green">剩余 ${remainingDays} 天</span>`;
        }
      }
      
      ElMessageBox.alert(
        `<div style="text-align: left;">
          <p><strong>物料编号:</strong> ${row.materialCode}</p>
          <p><strong>物料名称:</strong> ${row.materialName}</p>
          <p><strong>批次号:</strong> ${row.batchNo}</p>
          <p><strong>供应商:</strong> ${row.supplier}</p>
          <p><strong>仓库:</strong> ${row.warehouse}</p>
          <p><strong>数量:</strong> ${row.quantity}</p>
          <p><strong>状态:</strong> ${row.status}${row.status === '冻结' ? ' (冻结原因: ' + (row.freezeReason || '未知') + ')' : ''}</p>
          <p><strong>入库时间:</strong> ${formatDate(row.receiveDate || row.arrivalDate || row.inboundTime)}</p>
          <p><strong>到期日期:</strong> ${formatDate(row.expiryDate)} ${remainingDaysText}</p>
          ${row.freezeDate ? `<p><strong>冻结时间:</strong> ${formatDate(row.freezeDate)}</p>` : ''}
          <p><strong>备注:</strong> ${row.notes || '-'}</p>
        </div>`,
        '物料详情',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '关闭'
        }
      );
    };
    
    // 刷新数据
    const refreshData = async () => {
      tableLoading.value = true;
      
      try {
        // 直接调用异步数据获取函数，不需要setTimeout
        await fetchInventoryData();
        
        // 刷新数据时也要调用初始化函数
        initializeInventoryData();
        
        ElMessage.success('数据已刷新');
      } catch (error) {
        console.error('刷新数据失败:', error);
        ElMessage.error('刷新数据失败: ' + error.message);
      } finally {
        tableLoading.value = false;
      }
    };
    
    // 生成数据
    const generateData = async () => {
      tableLoading.value = true;
      ElMessage.info('正在生成库存数据，请稍候...');
      
      try {
        // 导入SystemDataUpdater
        const SystemDataUpdater = (await import('@/services/SystemDataUpdater')).default;
        const dataUpdater = new SystemDataUpdater();
        
        // 生成新的库存数据 - 清除现有数据并生成132条新记录
        const result = await dataUpdater.generateInventoryData(132, true);
        
        if (result.success) {
          ElMessage.success(`成功生成${result.data.length}条库存数据`);
          // 刷新数据
          await fetchInventoryData();
          // 初始化数据
          initializeInventoryData();
        } else {
          ElMessage.error(`生成数据失败: ${result.message}`);
        }
      } catch (error) {
        console.error('生成数据失败:', error);
        ElMessage.error('生成数据失败: ' + error.message);
      } finally {
        tableLoading.value = false;
      }
    };

    // 按仓库生成可用的库位
    const generateAvailableLocations = (currentWarehouse) => {
      const locations = [];
      const prefix = currentWarehouse === '主仓库' ? 'A' : 
                    currentWarehouse === '原材料仓' ? 'R' : 
                    currentWarehouse === '半成品仓' ? 'S' : 
                    currentWarehouse === '成品仓' ? 'F' : 'X';
                      
      // 生成10个随机库位
      for (let i = 1; i <= 10; i++) {
        locations.push(`${prefix}区-${String(i).padStart(2, '0')}`);
      }
      
      return locations;
    };

    // 确认库位转移
    const confirmMoveLocation = () => {
      // 实现库位转移逻辑
      const item = selectedItem.value;
      if (!item) return;
      
      // 更新物料库位
      const index = inventoryData.value.findIndex(i => i.id === item.id);
      if (index !== -1) {
        inventoryData.value[index].warehouse = moveLocationForm.targetWarehouse;
        inventoryData.value[index].location = moveLocationForm.targetLocation;
        inventoryData.value[index].lastModified = new Date().toISOString();
        inventoryData.value[index].notes = moveLocationForm.reason;
        
        // 保存更新后的数据
        UnifiedDataService.saveInventoryData(inventoryData.value, true);
        
        // 更新过滤后的数据
        updateFilteredData();
        
        ElMessage.success(`成功将物料 ${item.materialCode} 转移到 ${moveLocationForm.targetWarehouse} ${moveLocationForm.targetLocation}`);
      }
      
      // 关闭对话框
        showMoveLocationDialog.value = false;
    };
    
    // 导出风险报表
    const exportRiskReport = () => {
      ElMessage({
        message: '正在生成风险物料报表，请稍候...',
        type: 'info'
      });
      
      setTimeout(() => {
        ElMessage({
          message: '风险物料报表已导出到系统，您可以在报表中心查看',
          type: 'success'
        });
      }, 1500);
    };
    
    // 显示智能助手
    const showAIAssistant = () => {
      ElMessageBox.alert(
        `<div style="text-align: left;">
          <h3>IQE智能助手</h3>
          <p>您好，我是IQE物料风险管控智能助手。我可以帮助您：</p>
          <ul>
            <li>分析风险物料的处理方案</li>
            <li>预测可能出现的供应链风险</li>
            <li>提供物料冻结解决方案建议</li>
            <li>追踪风险物料的处理进度</li>
          </ul>
          <p>请问您需要什么帮助？</p>
        </div>`,
        '智能助手',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '关闭',
          cancelButtonText: '开始对话',
          showCancelButton: true,
          callback: (action) => {
            if (action === 'cancel') {
              ElMessage({
                message: '智能对话功能即将上线，敬请期待',
                type: 'info'
              });
            }
          }
        }
      );
    };

    // 重置高级筛选
    const resetAdvancedFilter = () => {
      advancedFilter.dateRange = [];
      advancedFilter.suppliers = [];
      advancedFilter.category = [];
      advancedFilter.qualityStatus = [];
      advancedFilter.batchNo = '';
    };

    // 应用高级筛选
    const applyAdvancedFilter = () => {
      // 重置为第一页
      currentPage.value = 1;
      
      // 过滤原始数据
      let filteredData = [...inventoryData.value];

      // 按入库日期过滤
      if (advancedFilter.dateRange && advancedFilter.dateRange.length === 2) {
        const startDate = new Date(advancedFilter.dateRange[0]);
        const endDate = new Date(advancedFilter.dateRange[1]);
        endDate.setHours(23, 59, 59); // 设置为当天的最后一刻
        
        filteredData = filteredData.filter(item => {
          const itemDate = new Date(item.receiveDate || item.arrivalDate);
          return itemDate >= startDate && itemDate <= endDate;
        });
      }
      
      // 按供应商过滤
      if (advancedFilter.suppliers && advancedFilter.suppliers.length > 0) {
        filteredData = filteredData.filter(item => 
          advancedFilter.suppliers.includes(item.supplier)
        );
      }
      
      // 按物料分类过滤
      if (advancedFilter.category && advancedFilter.category.length > 0) {
        const categories = advancedFilter.category.map(c => c[c.length - 1]);
        filteredData = filteredData.filter(item => 
          categories.includes(item.category)
        );
      }
      
      // 按质检状态过滤
      if (advancedFilter.qualityStatus && advancedFilter.qualityStatus.length > 0) {
        filteredData = filteredData.filter(item => 
          advancedFilter.qualityStatus.includes(item.quality)
        );
      }
      
      // 按批次号过滤
      if (advancedFilter.batchNo) {
        const batchQuery = advancedFilter.batchNo.toLowerCase();
        filteredData = filteredData.filter(item => 
          item.batchNo.toLowerCase().includes(batchQuery)
        );
      }
      
      // 删除按保质期状态过滤的代码
      
      // 更新过滤后的数据
      filteredInventoryData.value = filteredData;
      total.value = filteredData.length;
      
      // 关闭过滤对话框
      showAdvancedSearch.value = false;
      
      ElMessage.success('已应用筛选条件，共过滤出 ' + filteredData.length + ' 条记录');
    };
    
    // 重置过滤条件
    const resetFilter = () => {
      searchQuery.value = '';
      statusFilter.value = '';
      warehouseFilter.value = '';
      currentPage.value = 1;
      updateFilteredData();
      ElMessage.success('已重置筛选条件');
    };
    
    // 打开高级搜索对话框
    const openAdvancedSearch = () => {
      showAdvancedSearch.value = true;
    };
    
    // 移动物料到新库位
    const moveLocation = (row) => {
      selectedItem.value = row;
      moveLocationForm.targetWarehouse = row.warehouse || '';
      moveLocationForm.targetLocation = row.location || '';
      moveLocationForm.reason = '';
      showMoveLocationDialog.value = true;
      
      // 生成可用库位
      if (moveLocationForm.targetWarehouse) {
        availableLocations.value = generateAvailableLocations(moveLocationForm.targetWarehouse);
      }
    };
    
    // 渲染供应商质量分析图表
    const renderSupplierQualityChart = async () => {
      supplierQualityChartLoaded.value = false;
      try {
        const chartDom = document.getElementById('supplierQualityChart');
        if (!chartDom) {
          console.warn('找不到supplierQualityChart DOM元素');
          return;
        }
        
        const chart = await safeInitChart(chartDom);
        if (!chart) {
          console.error('初始化supplierQualityChart失败');
          return;
        }
        
        const suppliers = topQualitySuppliers.value;
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          legend: {
            data: ['不合格率', '样本数']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: suppliers.map(s => s.name)
          },
          yAxis: [
            {
              type: 'value',
              name: '不合格率(%)',
              min: 0,
              max: 20,
              interval: 5,
              axisLabel: {
                formatter: '{value}%'
              }
            },
            {
              type: 'value',
              name: '样本数',
              min: 0,
              axisLabel: {
                formatter: '{value}'
              }
            }
          ],
          series: [
            {
              name: '不合格率',
              type: 'bar',
              data: suppliers.map(s => s.defectRate)
            },
            {
              name: '样本数',
              type: 'line',
              yAxisIndex: 1,
              data: suppliers.map(s => s.sampleCount)
            }
          ]
        };
        
        chart.setOption(option);
        setupChartResize(chart);
        supplierQualityChartLoaded.value = true;
      } catch (error) {
        console.error('渲染供应商质量图表失败:', error);
        supplierQualityChartLoaded.value = true;
      }
    };

    // 监听供应商分析类型变化，切换时重新渲染图表
    watch(supplierAnalysisType, () => {
      if (supplierAnalysisType.value === 'quality') {
        nextTick(() => {
          renderSupplierQualityChart();
        });
      }
    });
    
    // 添加辅助函数，用于生成随机数据
    const getRandomFactory = () => {
      const factories = ['重庆工厂', '深圳工厂', '南昌工厂', '宜宾工厂'];
      return factories[Math.floor(Math.random() * factories.length)];
    };
    
    const getRandomWarehouse = () => {
      const warehouses = ['主仓库', '原材料仓', '半成品仓', '成品仓', '退货仓'];
      return warehouses[Math.floor(Math.random() * warehouses.length)];
    };
    
    const getRandomDate = () => {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      return date.toISOString();
    };
    
    // 初始化库存数据
    const initializeInventoryData = () => {
      // 检查过期物料
      checkExpiredMaterials();
      
      // 确保所有库存项都有必要的字段
      inventoryData.value = inventoryData.value.map(item => {
        return {
          ...item,
          factory: item.factory || getRandomFactory(),
          warehouse: item.warehouse || item.storageLocation || getRandomWarehouse(),
          materialCode: item.materialCode || item.material_id || `M${Math.floor(Math.random() * 90000) + 10000}`,
          receiveDate: item.receiveDate || item.arrivalDate || item.inboundTime || getRandomDate()
        };
      });
      
      // 根据过滤条件处理数据
      updateFilteredData();
      
      // 计算不同状态物料的比例
      const statusCounts = {
        '正常': 0,
        '风险': 0,
        '冻结': 0,
        '其他': 0
      };
      
      inventoryData.value.forEach(item => {
        if (item.status === '正常') statusCounts['正常']++;
        else if (item.status === '风险') statusCounts['风险']++;
        else if (item.status === '冻结') statusCounts['冻结']++;
        else statusCounts['其他']++;
      });
      
      statusDistribution.value = Object.keys(statusCounts).map(key => {
    return {
          name: key,
          value: statusCounts[key]
        };
      }).filter(item => item.value > 0);
      
      // ... 其他初始化代码 ...
    };
    
    // 检查过期物料
    const checkExpiredMaterials = () => {
      const today = new Date();
      
      inventoryData.value.forEach(item => {
        if (item.expiryDate) {
          const expiryDate = new Date(item.expiryDate);
          const remainingDays = getRemainingDays(expiryDate);
          
          // 如果已过期，将状态设置为风险
          if (remainingDays < 0 && item.status === '正常') {
            item.status = '风险';
            item.notes = item.notes ? `${item.notes} | 已过期` : '已过期';
          }
          
          // 如果还有30天内即将过期，且状态为正常，将状态设置为风险
          if (remainingDays > 0 && remainingDays <= 30 && item.status === '正常') {
            item.status = '风险';
            item.notes = item.notes ? `${item.notes} | 即将过期(${remainingDays}天)` : `即将过期(${remainingDays}天)`;
          }
        }
      });
    };
    
    return {
      inventoryData,
      tableLoading,
      dashboardData,
      normalItemsCount,
      riskItemsCount,
      frozenItemsCount,
      topRiskSupplier,
      riskLevel,
      riskLevelDescription,
      mainStorageArea,
      frozenItemsWarehouse,
      supplierAnalysisType,
      topQualitySuppliers,
      topRiskSuppliers,
      recentRiskMaterials,
      riskOnlyMaterials,
      frozenOnlyMaterials,
      currentDate,
      currentPage,
      pageSize,
      total,
      searchQuery,
      statusFilter,
      warehouseFilter,
      showAdvancedSearch,
      advancedFilter,
      supplierOptions,
      materialCategoryOptions,
      pagedInventoryData,
      showMoveLocationDialog,
      selectedItem,
      moveLocationForm,
      availableLocations,
      // 方法
      refreshData,
      generateData,
      exportRiskReport,
      showAIAssistant,
      handleSearch,
      handleSizeChange,
      handleCurrentChange,
      resetAdvancedFilter,
      applyAdvancedFilter,
      viewDetails,
      handleFreezeToggle,
      confirmMoveLocation,
      // 辅助函数
      formatDate,
      getRandomFactory,
      getRandomWarehouse,
      getRandomDate,
      formatBatchNumber,
      tableRowClassName,
      getStatusTagType,
      getQualityLevelClass,
      getQualityTagType,
      getRiskLevelClass,
      getRiskTagType,
      getActionIconClass,
      getActionIcon,
      getTagType
    };
  }
};
</script>

<style scoped>
/* 页面整体样式 */
.inventory-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

/* 页面标题区域 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* 仪表盘卡片 */
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

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.card-value-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-value {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #303133;
}

.normal-items .card-value {
  color: #67c23a;
}

.risk-items .card-value {
  color: #e6a23c;
}

.problem-items .card-value {
  color: #f56c6c;
}

.card-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  color: #909399;
}

.success-text {
  color: #67c23a;
}

.warning-text {
  color: #e6a23c;
}

.danger-text {
  color: #f56c6c;
}

.neutral-text {
  color: #909399;
}

/* 供应商分析卡片 */
.supplier-card {
  margin-bottom: 20px;
}

.header-controls {
  display: flex;
  align-items: center;
}

.supplier-analysis {
  min-height: 200px;
}

.supplier-list-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.supplier-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 4px;
  background-color: #f5f7fa;
  width: calc(33.33% - 10px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.supplier-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.supplier-rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #909399;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  margin-right: 12px;
}

.supplier-info {
  flex: 1;
}

.supplier-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.supplier-stats {
  display: flex;
  font-size: 12px;
  color: #606266;
  gap: 10px;
}

.supplier-tag {
  margin-left: auto;
}

.good-quality {
  border-left: 4px solid #67c23a;
}

.medium-quality {
  border-left: 4px solid #e6a23c;
}

.poor-quality {
  border-left: 4px solid #f56c6c;
}

.low-risk {
  border-left: 4px solid #67c23a;
}

.medium-risk {
  border-left: 4px solid #e6a23c;
}

.high-risk {
  border-left: 4px solid #f56c6c;
}

/* 风险管控区域 */
.action-card {
  margin-bottom: 20px;
}

.header-date {
  color: #909399;
  font-size: 14px;
}

.risk-control-container {
  display: flex;
  gap: 20px;
}

.risk-section, .frozen-section {
  flex: 1;
  min-width: 0;
}

.section-title {
  display: flex;
  align-items: center;
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.section-title .el-icon {
  margin-right: 8px;
}

.risk-section .section-title {
  color: #e6a23c;
}

.frozen-section .section-title {
  color: #f56c6c;
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.action-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.action-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  flex-shrink: 0;
}

.high-risk-icon {
  background-color: #f56c6c;
}

.medium-risk-icon {
  background-color: #e6a23c;
}

.success-icon {
  background-color: #67c23a;
}

.neutral-icon {
  background-color: #909399;
}

.action-content {
  flex: 1;
  min-width: 0;
}

.action-title {
  font-weight: bold;
  margin-bottom: 4px;
  line-height: 1.4;
}

.action-supplier {
  margin-bottom: 4px;
  color: #606266;
}

.action-batch {
  margin-bottom: 4px;
  color: #606266;
}

.action-warehouse {
  margin-bottom: 4px;
  color: #606266;
}

.action-details {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
}

.action-freeze-reason {
  font-size: 12px;
  margin-top: 6px;
  padding: 5px 8px;
  background-color: #fef0f0;
  border-radius: 3px;
  color: #f56c6c;
}

.reason-label {
  font-weight: bold;
}

.action-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
}

.unfreeze-btn {
  white-space: nowrap;
}

/* 表格卡片 */
.table-card {
  margin-bottom: 20px;
}

.table-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 高级筛选对话框 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .supplier-item {
    width: calc(50% - 10px);
}
}

@media (max-width: 768px) {
  .supplier-item {
    width: 100%;
}

  .risk-control-container {
    flex-direction: column;
}
}

/* 冻结和风险物料行样式 */
.el-table .frozen-row {
  background-color: #fef0f0 !important;
}

.el-table .frozen-row:hover > td {
  background-color: #fde2e2 !important;
}

.el-table .risk-row {
  background-color: #fdf6ec !important;
}

.el-table .risk-row:hover > td {
  background-color: #faecd8 !important;
}
</style>