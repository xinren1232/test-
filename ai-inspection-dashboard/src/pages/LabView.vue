<template>
  <div class="lab-view">
    <div class="page-header">
      <h2 class="page-title">物料测试跟踪</h2>
      <div class="header-actions">
        <el-button type="primary" @click="refreshData">
          <el-icon><Refresh /></el-icon> 刷新数据
        </el-button>
      </div>
    </div>
    
    <!-- 质量预警面板 -->
    <div v-if="showQualityAlert" class="quality-alert">
      <el-alert
        :title="`质量预警: 检测到${pendingRisks.length}个潜在风险批次`"
        type="warning"
        description="系统已基于历史检测数据分析出潜在风险，请查看详情"
        show-icon
        :closable="false"
      >
        <template #default>
          <div class="alert-content">
            <div class="alert-message">
              <p>相似批次的历史不良率: <b>{{ predictedDefectRate }}%</b></p>
              <p>建议: <b>{{ qualityRecommendation }}</b></p>
            </div>
            <div class="alert-actions">
              <el-button size="small" type="warning" @click="handleRiskAnalysis">查看分析</el-button>
              <el-button size="small" @click="handleDismissAlert">稍后提醒</el-button>
            </div>
          </div>
        </template>
      </el-alert>
    </div>
    
    <!-- 卡片已删除 -->
    
    <!-- 筛选条件 -->
    <div class="filter-container">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="物料代码">
          <el-input v-model="filterForm.materialCode" placeholder="输入物料代码" clearable></el-input>
        </el-form-item>
        <el-form-item label="物料名称">
          <el-input v-model="filterForm.materialName" placeholder="输入物料名称" clearable></el-input>
        </el-form-item>
          <!-- 测试项目字段已移除 -->
        <el-form-item label="检测结果">
          <el-select v-model="filterForm.result" placeholder="选择结果" clearable>
            <el-option label="合格" value="OK"></el-option>
            <el-option label="不合格" value="NG"></el-option>
            <el-option label="有条件接收" value="有条件接收"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY/MM/DD"
            value-format="YYYY/MM/DD"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
          <el-dropdown @command="handleExport">
            <el-button type="success">
              导出数据<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="excel">导出Excel</el-dropdown-item>
                <el-dropdown-item command="pdf">导出PDF报告</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 数据分析和图表区域 -->
    <el-row :gutter="20" class="charts-container">
      <el-col :span="24">
        <el-card shadow="hover" class="material-ng-chart-card">
          <template #header>
            <div class="card-header">
              <h3>测试不良记录展示</h3>
              <div class="card-actions">
                <el-select v-model="ngAnalysisTimeRange" size="small" @change="updateNgAnalysis" placeholder="选择时间范围">
                  <el-option label="全部" value="all"></el-option>
                  <el-option label="本月" value="month"></el-option>
                  <el-option label="本季度" value="quarter"></el-option>
                  <el-option label="本年" value="year"></el-option>
                </el-select>
              </div>
            </div>
          </template>
          <div ref="materialNgChartRef" class="material-ng-chart"></div>
          <div class="ng-analysis-summary" v-if="ngAnalysisData.worstSupplier !== 'N/A' || ngAnalysisData.topDefect !== 'N/A'">
            <el-divider content-position="center">分析发现</el-divider>
            <div class="summary-items">
              <div class="summary-item" v-if="ngAnalysisData.worstSupplier !== 'N/A'">
                <el-icon><Warning /></el-icon>
                <span>不良率最高的供应商: <strong>{{ ngAnalysisData.worstSupplier }}</strong> ({{ ngAnalysisData.worstSupplierRate }}%)</span>
              </div>
              <div class="summary-item" v-if="ngAnalysisData.topDefect !== 'N/A'">
                <el-icon><Warning /></el-icon>
                <span>最常见的不良现象: <strong>{{ ngAnalysisData.topDefect }}</strong> (占比{{ ngAnalysisData.topDefectPercentage }}%)</span>
              </div>
              <div class="summary-actions">
                <el-button type="primary" size="small" @click="generateNgReport">生成分析报告</el-button>
                <el-button type="warning" size="small" @click="showNgDetails">查看详细数据</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="charts-container" style="margin-top: 20px;">
      <el-col :span="24">
        <el-tabs v-model="activeAnalysisTab" class="analysis-tabs">
          <el-tab-pane label="批次质量对比" name="batchComparison">
            <batch-comparison-radar 
              v-if="selectedMaterial"
              :title="`${selectedMaterial.materialName}批次质量参数对比`"
              :batch-data="currentBatchData"
              :available-batches="currentAvailableBatches"
              :analysis-text="currentBatchData.analysisText"
              :insights="currentBatchData.insights"
            ></batch-comparison-radar>
            <div v-else class="empty-chart">
              <p>请从下方表格选择一个物料以查看批次质量对比</p>
            </div>
          </el-tab-pane>
          <el-tab-pane label="风险因子分析" name="riskFactors">
            <risk-factor-chart 
              v-if="selectedMaterial"
              :title="`${selectedMaterial.materialName}风险因子分析`"
              :risk-data="currentRiskData"
            ></risk-factor-chart>
            <div v-else class="empty-chart">
              <p>请从下方表格选择一个物料以查看风险因子分析</p>
            </div>
          </el-tab-pane>
          <!-- 新增：AI辅助分析标签页 -->
          <el-tab-pane label="AI辅助分析" name="aiAnalysis">
            <div v-if="selectedMaterial" class="ai-analysis-container">
              <div class="ai-score-container">
                <div class="ai-score-circle" :class="getAiScoreClass(selectedMaterial.aiScore || 0)">
                  <span class="score-number">{{ selectedMaterial.aiScore || 0 }}</span>
                  <span class="score-label">质量评分</span>
                </div>
                <div class="ai-score-detail">
                  <div class="score-item">
                    <div class="score-name">一致性评分</div>
                    <el-progress :percentage="selectedMaterial.consistencyScore || 0" :color="getProgressColor"></el-progress>
                  </div>
                  <div class="score-item">
                    <div class="score-name">稳定性评分</div>
                    <el-progress :percentage="selectedMaterial.stabilityScore || 0" :color="getProgressColor"></el-progress>
                  </div>
                  <div class="score-item">
                    <div class="score-name">可靠性评分</div>
                    <el-progress :percentage="selectedMaterial.reliabilityScore || 0" :color="getProgressColor"></el-progress>
                  </div>
                </div>
              </div>
              <div class="ai-conclusions">
                <h4>AI分析发现</h4>
                <ul class="finding-list">
                  <li v-for="(finding, index) in aiFindings" :key="index">
                    <template v-if="finding.type === 'warning'">
                      <el-icon><Warning /></el-icon>
                    </template>
                    <template v-else-if="finding.type === 'success'">
                      <el-icon><CircleCheck /></el-icon>
                    </template>
                    <template v-else-if="finding.type === 'error'">
                      <el-icon><CircleClose /></el-icon>
                    </template>
                    <span>{{ finding.content }}</span>
                  </li>
                </ul>
                <div class="recommendations">
                  <h4>改进建议</h4>
                  <div v-for="(rec, index) in aiRecommendations" :key="index" class="recommendation-item">
                    <div class="recommendation-title">{{ rec.title }}</div>
                    <div class="recommendation-content">{{ rec.content }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-chart">
              <p>请从下方表格选择一个物料以查看AI辅助分析</p>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
    
    <!-- 检测结果表格 -->
    <div class="table-container">
      <h3 class="section-title">检测结果明细</h3>
      <el-table 
        :data="currentPageData" 
        style="width: 100%" 
        border 
        stripe 
        :row-class-name="tableRowClassName"
        @row-click="handleRowClick"
      >
        <el-table-column prop="id" label="测试编号" width="120"></el-table-column>
        <el-table-column prop="testDate" label="日期" width="100"></el-table-column>
        <el-table-column prop="project" label="项目" width="120"></el-table-column>
        <el-table-column prop="baseline" label="基线" width="120"></el-table-column>
        <el-table-column prop="materialCode" label="物料编码" width="110"></el-table-column>
        <el-table-column prop="batchId" label="批次" width="110"></el-table-column>
        <el-table-column prop="materialName" label="物料名称" width="180"></el-table-column>
        <el-table-column prop="supplier" label="供应商" width="120"></el-table-column>
        <!-- 测试项目列已移除 -->
        <el-table-column prop="result" label="测试结果" width="100">
          <template #default="scope">
            <el-tag :type="getResultTagType(scope.row.result)" size="small">
              {{ scope.row.result }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="不良现象" width="150">
          <template #default="scope">
            <span v-if="scope.row.result === 'NG' && scope.row.defectDesc">{{ scope.row.defectDesc }}</span>
            <span v-else-if="scope.row.result === 'NG' && !scope.row.defectDesc">未知不良</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button link size="small" @click.stop="viewDetails(scope.row)">详情</el-button>
            <el-button link size="small" @click.stop="viewImages(scope.row)" :disabled="!scope.row.images || !scope.row.images.length">
              图片
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalTests"
          :page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :current-page="pagination.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        >
        </el-pagination>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="selectedTest ? `检测详情: ${selectedTest.id}` : '检测详情'" 
      width="70%"
      destroy-on-close
    >
      <div v-if="selectedTest" class="test-details">
        <el-descriptions :column="2" border size="medium">
          <el-descriptions-item label="检测编号">{{ selectedTest.id }}</el-descriptions-item>
          <el-descriptions-item label="检测日期">{{ selectedTest.testDate }}</el-descriptions-item>
          <el-descriptions-item label="物料代码">{{ selectedTest.materialCode }}</el-descriptions-item>
          <el-descriptions-item label="物料名称">{{ selectedTest.materialName }}</el-descriptions-item>
          <el-descriptions-item label="检测来源">{{ selectedTest.testSource || '常规检测' }}</el-descriptions-item>
          <el-descriptions-item label="项目">{{ selectedTest.project }}</el-descriptions-item>
          <el-descriptions-item label="基线">{{ selectedTest.baseline }}</el-descriptions-item>
          <el-descriptions-item label="测试项目">{{ selectedTest.testItem }}</el-descriptions-item>
          <el-descriptions-item label="检测结果">
            <el-tag :type="getResultTagType(selectedTest.result)">{{ selectedTest.result }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="不良批次">{{ selectedTest.badBatch || 'N/A' }}</el-descriptions-item>
          <el-descriptions-item label="不良比例">{{ selectedTest.defectRate }}</el-descriptions-item>
          <el-descriptions-item label="供应商">{{ selectedTest.supplier }}</el-descriptions-item>
          <el-descriptions-item label="责任归类">{{ selectedTest.responsibility || '待定' }}</el-descriptions-item>
          <el-descriptions-item label="建议处理" :span="2">{{ selectedTest.recommendation || selectedTest.remarks }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ selectedTest.remarks }}</el-descriptions-item>
        </el-descriptions>
        
        <div v-if="selectedTest.relatedRecords && selectedTest.relatedRecords.length" class="related-records">
          <h4>相关记录</h4>
          <el-tag v-for="record in selectedTest.relatedRecords" :key="record" size="small">
            {{ record }}
          </el-tag>
        </div>
        
        <div v-if="selectedTest.images && selectedTest.images.length" class="test-images">
          <h4>检测图片</h4>
          <div class="image-grid">
            <div v-for="(image, index) in selectedTest.images" :key="index" class="image-item">
              <el-image 
                :src="image.url || image" 
                :preview-src-list="selectedTest.images.map(img => img.url || img)"
                fit="cover"
              ></el-image>
              <div class="image-caption" v-if="image.caption">{{ image.caption }}</div>
            </div>
          </div>
        </div>
        
        <div v-if="selectedTest.testProcedure || selectedTest.testEquipment || selectedTest.testParameters" class="test-procedure">
          <h4>测试过程</h4>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item v-if="selectedTest.testProcedure" label="测试规范">
              {{ selectedTest.testProcedure }}
            </el-descriptions-item>
            <el-descriptions-item v-if="selectedTest.testEquipment" label="测试设备">
              {{ Array.isArray(selectedTest.testEquipment) ? selectedTest.testEquipment.join(', ') : selectedTest.testEquipment }}
            </el-descriptions-item>
            <el-descriptions-item v-if="selectedTest.testParameters" label="测试参数">
              <div v-for="(value, key) in selectedTest.testParameters" :key="key" class="param-item">
                {{ key }}: {{ value }}
              </div>
            </el-descriptions-item>
            <el-descriptions-item v-if="selectedTest.tester" label="测试人员">
              {{ selectedTest.tester }}
            </el-descriptions-item>
            <el-descriptions-item v-if="selectedTest.reviewer" label="复核人员">
              {{ selectedTest.reviewer }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>

    <!-- 图片预览弹窗 -->
    <el-dialog 
      v-model="imageDialogVisible" 
      :title="selectedTest ? `${selectedTest.materialName} 检测图片` : '检测图片'"
      width="80%"
    >
      <div v-if="selectedTest && selectedTest.images && selectedTest.images.length" class="image-preview">
        <div class="image-carousel">
          <el-carousel height="400px" arrow="always" indicator-position="outside">
            <el-carousel-item v-for="(image, index) in selectedTest.images" :key="index">
              <div class="carousel-image-container">
                <img :src="image.url || image" alt="检测图片" class="carousel-image">
                <div class="carousel-caption" v-if="image.caption">{{ image.caption }}</div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>
        <div class="image-thumbnails">
          <div 
            v-for="(image, index) in selectedTest.images" 
            :key="index" 
            class="thumbnail-item"
            @click="currentImageIndex = index"
          >
            <el-image 
              :src="image.url || image" 
              fit="cover"
              class="thumbnail"
            ></el-image>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 风险分析弹窗 -->
    <el-dialog
      v-model="riskAnalysisDialogVisible"
      title="风险批次分析"
      width="80%"
    >
      <div class="risk-analysis-container">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="物料名称">{{ selectedMaterialForRisk?.materialName }}</el-descriptions-item>
          <el-descriptions-item label="物料代码">{{ selectedMaterialForRisk?.materialCode }}</el-descriptions-item>
          <el-descriptions-item label="风险评分">
            <span class="risk-score" :class="getRiskScoreClass(selectedMaterialForRisk?.riskScore)">
              {{ selectedMaterialForRisk?.riskScore }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="影响范围">{{ selectedMaterialForRisk?.riskImpactScope }}</el-descriptions-item>
        </el-descriptions>
        
        <el-tabs type="border-card" class="risk-tabs">
          <el-tab-pane label="风险因子">
            <risk-factor-chart
              :risk-data="selectedMaterialForRisk"
              height="400px"
            ></risk-factor-chart>
          </el-tab-pane>
          <el-tab-pane label="批次对比">
            <batch-comparison-radar
              v-if="selectedMaterialForRisk"
              :batch-data="riskBatchData"
              :available-batches="riskAvailableBatches"
              :analysis-text="riskBatchData.analysisText"
              :insights="riskBatchData.insights"
              height="400px"
            ></batch-comparison-radar>
          </el-tab-pane>
        </el-tabs>

        <div class="risk-actions">
          <el-button type="primary" @click="handleRiskAction">采取措施</el-button>
          <el-button type="warning" @click="handleSendToAI">AI深度分析</el-button>
          <el-button @click="handleGenerateReport">生成完整报告</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { MagicStick, Warning, CircleCheck, CircleClose, Delete, Refresh } from '@element-plus/icons-vue';
import * as echarts from 'echarts/core';
import { LineChart, BarChart, ScatterChart, HeatmapChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { 
  TitleComponent, 
  TooltipComponent, 
  GridComponent, 
  LegendComponent, 
  VisualMapComponent
} from 'echarts/components';

// 注册必须的组件
echarts.use([
  LineChart,
  BarChart,
  ScatterChart,
  HeatmapChart,
  CanvasRenderer,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  VisualMapComponent
]);

// 引入自定义组件
import BatchComparisonRadar from '../components/features/BatchComparisonRadar.vue';
import RiskFactorChart from '../components/features/RiskFactorChart.vue';
import unifiedDataService from '../services/UnifiedDataService.js';

// 获取存储键常量
const { STORAGE_KEYS } = unifiedDataService;

// 引入数据存储
import { useIQEStore } from '../stores';

// 创建路由和数据存储实例
const router = useRouter();
const store = useIQEStore();

// 加载状态
const loading = ref(false);

// 提取数据 - 使用统一数据服务
const testData = ref([]);
const statCardsData = computed(() => store.getStatCardsData('lab'));
const batchComparisonData = computed(() => store.batchComparisonData);
const riskAnalysisData = computed(() => store.riskAnalysisData);

// AI辅助分析相关变量

// 新增：AI辅助分析相关变量
const aiFindings = ref([
  { type: 'warning', content: '该物料近3批次测试结果波动较大，稳定性存在问题' },
  { type: 'error', content: '电气性能参数超出标准范围 3.5%' },
  { type: 'success', content: '物理尺寸和外观检测结果符合要求' }
]);

const aiRecommendations = ref([
  { title: '增加进料抽检比例', content: '建议将该物料的进料抽检比例从当前的5%提高到8%，重点关注电气性能参数' },
  { title: '与供应商沟通改进', content: '与供应商共享测试数据，要求针对电气性能参数的稳定性提供改进方案' }
]);

// 筛选表单
const filterForm = reactive({
  materialCode: '',
  materialName: '',
  testItem: '',
  result: '',
  dateRange: []
});

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10
});

// 计算总记录数
const totalTests = computed(() => filteredLabTests.value.length);

// 计算分页后的数据
const currentPageData = computed(() => {
  const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  return filteredLabTests.value.slice(startIndex, endIndex);
});

// 计算过滤后的测试数据
const filteredLabTests = computed(() => {
  let result = [...testData.value];
  
  // 应用筛选条件
  if (filterForm.materialCode) {
    result = result.filter(item => item.materialCode && item.materialCode.includes(filterForm.materialCode));
  }
  
  if (filterForm.materialName) {
    result = result.filter(item => item.materialName && item.materialName.includes(filterForm.materialName));
  }
  
  if (filterForm.testItem) {
    result = result.filter(item => item.testItem === filterForm.testItem);
  }
  
  if (filterForm.result) {
    const resultValue = filterForm.result;
    result = result.filter(item => item.result === resultValue);
  }
  
  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    const startDate = new Date(filterForm.dateRange[0]);
    const endDate = new Date(filterForm.dateRange[1]);
    endDate.setHours(23, 59, 59); // 设置为当天的最后一刻
    
    result = result.filter(item => {
      if (!item.testDate) return false;
      const testDate = new Date(item.testDate);
      return testDate >= startDate && testDate <= endDate;
    });
  }
  
  return result;
});

// 处理页码变化
const handleCurrentChange = (val) => {
  pagination.currentPage = val;
  console.log(`页码变更为: ${val}, 显示数据: ${currentPageData.value.length}条`);
};

// 处理每页条数变化
const handleSizeChange = (val) => {
  pagination.pageSize = val;
  console.log(`每页条数变更为: ${val}, 显示数据: ${currentPageData.value.length}条`);
  
  // 如果当前页码超出范围，重置为第一页
  if (pagination.currentPage > Math.ceil(totalTests.value / pagination.pageSize) && totalTests.value > 0) {
    pagination.currentPage = 1;
  }
};

// 处理筛选
const handleFilter = () => {
  pagination.currentPage = 1; // 重置为第一页
  console.log('应用筛选条件:', filterForm);
  console.log(`筛选后数据: ${filteredLabTests.value.length}条`);
};

// 重置筛选条件
const resetFilter = () => {
  Object.keys(filterForm).forEach(key => {
    filterForm[key] = key === 'dateRange' ? [] : '';
  });
  pagination.currentPage = 1;
};

// 测试项目选项
const testItemOptions = computed(() => {
  // 从数据中提取不重复的测试项目
  const items = new Set();
  testData.value.forEach(test => {
    if (test.testItem) {
      items.add(test.testItem);
    }
  });
  return Array.from(items).map(item => ({ label: item, value: item }));
});

// 弹窗状态
const dialogVisible = ref(false);
const selectedTest = ref(null);
const imageDialogVisible = ref(false);
const currentImageIndex = ref(0);
const riskAnalysisDialogVisible = ref(false);
const activeAnalysisTab = ref('batchComparison');

// 质量预警相关状态
const showQualityAlert = ref(true);
const pendingRisks = ref([]);
const predictedDefectRate = ref('32.5');
const qualityRecommendation = ref('增加抽检比例，对来料进行重点筛选');
const selectedMaterialForRisk = ref(null);

// 所选物料
const selectedMaterial = ref(null);

// 当前批次比较数据
const currentBatchData = computed(() => {
  if (!selectedMaterial.value || !selectedMaterial.value.materialCode) return {};
  return batchComparisonData.value[selectedMaterial.value.materialCode] || {};
});

// 当前批次的可用批次列表
const currentAvailableBatches = computed(() => {
  if (!currentBatchData.value || !currentBatchData.value.batches) return ['standard'];
  return ['standard', ...currentBatchData.value.batches];
});

// 当前风险分析数据
const currentRiskData = computed(() => {
  if (!selectedMaterial.value || !selectedMaterial.value.materialCode) return {};
  return riskAnalysisData.value[selectedMaterial.value.materialCode] || {};
});

// 风险分析弹窗数据
const riskBatchData = computed(() => {
  if (!selectedMaterialForRisk.value || !selectedMaterialForRisk.value.materialCode) return {};
  return batchComparisonData.value[selectedMaterialForRisk.value.materialCode] || {};
});

const riskAvailableBatches = computed(() => {
  if (!riskBatchData.value || !riskBatchData.value.batches) return ['standard'];
  return ['standard', ...riskBatchData.value.batches];
});

// 处理行样式
const tableRowClassName = ({ row }) => {
  if (row.result === 'NG') return 'error-row';
  if (row.result === '有条件接收') return 'warning-row';
  return '';
};

// 获取标签类型
const getResultTagType = (result) => {
  if (result === 'NG') return 'danger';
  if (result === '有条件接收') return 'warning';
  if (result === 'OK') return 'success';
  return 'info';
};

// 获取风险评分样式
const getRiskScoreClass = (score) => {
  if (!score) return '';
  
  if (score >= 85) return 'high-risk';
  if (score >= 70) return 'medium-risk';
  return 'low-risk';
};

// 新增：获取AI评分样式
const getAiScoreClass = (score) => {
  if (score >= 90) return 'score-excellent';
  if (score >= 80) return 'score-good';
  if (score >= 70) return 'score-average';
  if (score >= 60) return 'score-poor';
  return 'score-bad';
};

// 新增：获取进度条颜色
const getProgressColor = (percentage) => {
  if (percentage >= 80) return '#67C23A';
  if (percentage >= 70) return '#85ce61';
  if (percentage >= 60) return '#E6A23C';
  return '#F56C6C';
};

// 查看详情

// 查看详情
const viewDetails = (row) => {
  selectedTest.value = row;
  dialogVisible.value = true;
};

// 查看图片
const viewImages = (row) => {
  selectedTest.value = row;
  currentImageIndex.value = 0;
  imageDialogVisible.value = true;
};

// 处理导出
const handleExport = (command) => {
  ElMessage({
    type: 'success',
    message: `已${command === 'excel' ? '导出Excel文件' : '生成PDF报告'}`
  });
};

// 处理关闭质量预警
const handleDismissAlert = () => {
  showQualityAlert.value = false;
};

// 处理风险分析
const handleRiskAnalysis = () => {
  selectedMaterialForRisk.value = riskAnalysisData.value['38501375']; // 示例数据
  riskAnalysisDialogVisible.value = true;
};

// 处理风险操作
const handleRiskAction = () => {
  ElMessageBox.confirm(
    '系统将自动创建处理措施工单并通知相关责任人，是否继续？',
    '风险处理确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage({
      type: 'success',
      message: '已创建处理工单并推送给相关责任人'
    });
    riskAnalysisDialogVisible.value = false;
  }).catch(() => {});
};

// 处理发送AI
const handleSendToAI = () => {
  ElMessage({
    type: 'success',
    message: '已将风险分析数据发送至AI助手进行深度分析'
  });
  
  // 跳转到AI助手页面
  router.push({
    path: '/ai-assistant',
    query: {
      materialCode: selectedMaterialForRisk.value?.materialCode,
      action: 'risk-analysis'
    }
  });
};

// 生成报告
const handleGenerateReport = () => {
  ElMessage({
    type: 'success',
    message: '风险分析报告生成中，完成后将发送至您的邮箱'
  });
};

// 处理行点击
const handleRowClick = (row) => {
  selectedMaterial.value = {
    ...row,
    // 添加AI分析所需的模拟数据
    aiScore: 78,
    consistencyScore: 82,
    stabilityScore: 65,
    reliabilityScore: 87
  };
  activeAnalysisTab.value = 'batchComparison';
};

// 新增：测试NG物料相关变量
const ngAnalysisTimeRange = ref('all');
const ngSupplierChartType = ref('count');
// 已移除: const ngBatchChartRef = ref(null);
const ngSupplierChartRef = ref(null);
const materialNgChartRef = ref(null);
// 新增：测试物料种类计数

const ngAnalysisData = reactive({
  totalBatchCount: 0,
  totalBatchPercentage: '0%',
  ngMaterialCount: 0,
  ngMaterialPercentage: '0%',
  avgTestCycle: '0',
  avgTestCycleChange: '0',
  pendingBatchCount: 0,
  pendingBatchChange: '0',
  // 删除月度批次相关属性
  // worstBatch: '',
  // worstBatchRate: 0,
  // ngBatchCount: 0,
  // ngBatchPercentage: '0%',
  worstSupplier: '',
  worstSupplierRate: 0,
  topDefect: '',
  topDefectPercentage: '0%'
});



// 新增：更新NG分析
const updateNgAnalysis = () => {
  // 更新物料测试NG数量统计图表
  updateMaterialNgBySupplierChart();
  
  // 更新统计卡片数据
  updateStatCardData();
};

// 新增：按物料名称和供应商显示不良数量
const updateMaterialNgBySupplierChart = () => {
  if (!materialNgChartRef.value) return;
  
  // 创建新图表实例
  const materialNgChart = echarts.init(materialNgChartRef.value);
  
  // 从测试数据中筛选出NG的物料
  let ngTests = testData.value.filter(item => 
    item.result === 'NG' || 
    item.result === '不合格' || 
    item.testResult === 'NG' || 
    item.testResult === '不合格' || 
    item.test_result === 'NG' || 
    item.test_result === '不合格'
  );
  
  console.log(`筛选出${ngTests.length}条不良记录用于物料NG数量分析`);
  
  // 如果没有足够的NG数据，记录日志
  if (ngTests.length < 3) {
    console.warn(`NG测试记录数量不足: ${ngTests.length}条，图表可能不够直观`);
  }
  
  // 根据时间范围筛选数据
  if (ngAnalysisTimeRange.value === 'month') {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    ngTests = ngTests.filter(item => {
      if (!item.testDate) return false;
      const testDate = new Date(item.testDate);
      return testDate >= firstDayOfMonth;
    });
  } else if (ngAnalysisTimeRange.value === 'quarter') {
    const currentDate = new Date();
    const currentQuarter = Math.floor(currentDate.getMonth() / 3);
    const firstDayOfQuarter = new Date(currentDate.getFullYear(), currentQuarter * 3, 1);
    
    ngTests = ngTests.filter(item => {
      if (!item.testDate) return false;
      const testDate = new Date(item.testDate);
      return testDate >= firstDayOfQuarter;
    });
  } else if (ngAnalysisTimeRange.value === 'year') {
    const currentDate = new Date();
    const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
    
    ngTests = ngTests.filter(item => {
      if (!item.testDate) return false;
      const testDate = new Date(item.testDate);
      return testDate >= firstDayOfYear;
    });
  }
  
  // 按物料名称和供应商分组统计
  const materialSupplierStats = {};
  
  ngTests.forEach(item => {
    const materialName = item.materialName || '未知物料';
    const supplier = item.supplier || '未知供应商';
    const key = `${materialName}|${supplier}`;
    
    if (!materialSupplierStats[key]) {
      materialSupplierStats[key] = {
        materialName,
        supplier,
        count: 0
      };
    }
    
    materialSupplierStats[key].count++;
  });
  
  // 转换为图表数据
  const chartData = Object.values(materialSupplierStats);
  
  // 按物料名称分组
  const materialGroups = {};
  chartData.forEach(item => {
    if (!materialGroups[item.materialName]) {
      materialGroups[item.materialName] = [];
    }
    materialGroups[item.materialName].push(item);
  });
  
  // 提取物料名称作为X轴
  const materialNames = Object.keys(materialGroups);
  
  // 找出所有供应商
  const allSuppliers = new Set();
  chartData.forEach(item => {
    allSuppliers.add(item.supplier);
  });
  const suppliers = Array.from(allSuppliers);
  
  // 为每个物料准备不同供应商的数据
  const seriesData = suppliers.map(supplier => {
    const data = materialNames.map(material => {
      const items = materialGroups[material].filter(item => item.supplier === supplier);
      return items.length > 0 ? items[0].count : 0;
    });
    
    return {
      name: supplier,
      type: 'bar',
      stack: 'total',
      label: {
        show: true,
        formatter: function(params) {
          return params.value > 0 ? params.value : '';
        }
      },
      emphasis: {
        focus: 'series'
      },
      data: data
    };
  });
  
  // 设置图表选项
  const option = {
    title: {
      text: '测试不良记录统计（按物料名称）',
      left: 'center',
      top: 0,
      textStyle: {
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        let tooltip = params[0].axisValue + '<br/>';
        let total = 0;
        
        params.forEach(param => {
          if (param.value > 0) {
            tooltip += param.marker + param.seriesName + ': ' + param.value + '<br/>';
            total += param.value;
          }
        });
        
        tooltip += '<div style="margin-top:5px;font-weight:bold;">总计: ' + total + '</div>';
        return tooltip;
      }
    },
    legend: {
      data: suppliers,
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
      top: 70
    },
    xAxis: [
      {
        type: 'category',
        data: materialNames,
        axisLabel: {
          interval: 0,
          rotate: 30,
          fontSize: 12
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '不良数量',
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed'
          }
        }
      }
    ],
    series: seriesData
  };
  
  // 设置图表
  materialNgChart.setOption(option);
  
  // 添加窗口大小变化时的自适应
  window.addEventListener('resize', () => {
    materialNgChart.resize();
  });
};

// 新增：更新统计卡片数据
const updateStatCardData = () => {
  // 计算本月测试批次总数
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
  // 过滤本月数据
  const thisMonthTests = testData.value.filter(item => {
    if (!item.testDate) return false;
    const testDate = new Date(item.testDate);
    return testDate >= firstDayOfMonth;
  });
  
  // 计算批次总数（去重）
  const uniqueBatches = new Set(thisMonthTests.map(item => item.batchId || item.batchNo || ''));
  ngAnalysisData.totalBatchCount = uniqueBatches.size || 0;
  

  
  // 计算同比增长
  const lastMonthFirstDay = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const lastMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
  
  const lastMonthTests = testData.value.filter(item => {
    if (!item.testDate) return false;
    const testDate = new Date(item.testDate);
    return testDate >= lastMonthFirstDay && testDate <= lastMonthLastDay;
  });
  
  const lastMonthUniqueBatches = new Set(lastMonthTests.map(item => item.batchId || item.batchNo || ''));
  const lastMonthBatchCount = lastMonthUniqueBatches.size || 0;
  
  if (lastMonthBatchCount > 0) {
    const growthRate = ((ngAnalysisData.totalBatchCount - lastMonthBatchCount) / lastMonthBatchCount * 100).toFixed(1);
    ngAnalysisData.totalBatchPercentage = `${growthRate}%`;
    } else {
    ngAnalysisData.totalBatchPercentage = '0%';
  }
  
  // 计算不合格物料数量和按测试项目分类的不良数据
  const ngMaterialsThisMonth = thisMonthTests.filter(item => 
    item.result === 'NG' || item.result === '不合格' || item.testResult === 'NG' || item.testResult === '不合格' || item.test_result === 'NG' || item.test_result === '不合格'
  );
  ngAnalysisData.ngMaterialCount = ngMaterialsThisMonth.length;
  
  // 按测试项目统计不良数量
  const testItemStats = {};
  ngMaterialsThisMonth.forEach(item => {
    const testItem = item.testItem || '未知测试项目';
    if (!testItemStats[testItem]) {
      testItemStats[testItem] = 0;
    }
    testItemStats[testItem]++;
  });
  
  // 找出不良数量最多的测试项目
  let maxNgCount = 0;
  let topNgTestItem = '';
  Object.entries(testItemStats).forEach(([testItem, count]) => {
    if (count > maxNgCount) {
      maxNgCount = count;
      topNgTestItem = testItem;
    }
  });
  
  // 计算不合格率
  if (thisMonthTests.length > 0) {
    const ngRate = (ngMaterialsThisMonth.length / thisMonthTests.length * 100).toFixed(1);
    ngAnalysisData.ngMaterialPercentage = `${ngRate}%`;
    } else {
    ngAnalysisData.ngMaterialPercentage = '0%';
  }
  
  // 计算平均测试周期
  // 查找每个批次的首次测试和最后测试，计算时间差
  const batchTestDates = {};
  testData.value.forEach(item => {
    if (!item.testDate || !item.batchId) return;
    
    const batchId = item.batchId || item.batchNo || '';
    const testDate = new Date(item.testDate);
    
    if (!batchTestDates[batchId]) {
      batchTestDates[batchId] = {
        firstTest: testDate,
        lastTest: testDate
      };
    } else {
      if (testDate < batchTestDates[batchId].firstTest) {
        batchTestDates[batchId].firstTest = testDate;
      }
      if (testDate > batchTestDates[batchId].lastTest) {
        batchTestDates[batchId].lastTest = testDate;
      }
    }
  });
  
  // 计算每个批次的测试周期
  let totalCycleDays = 0;
  let batchesWithCycle = 0;
  
  Object.values(batchTestDates).forEach(dates => {
    const cycleDays = (dates.lastTest - dates.firstTest) / (1000 * 60 * 60 * 24);
    if (cycleDays > 0) {
      totalCycleDays += cycleDays;
      batchesWithCycle++;
    }
  });
  
  // 计算平均测试周期
  if (batchesWithCycle > 0) {
    ngAnalysisData.avgTestCycle = (totalCycleDays / batchesWithCycle).toFixed(1);
  } else {
    ngAnalysisData.avgTestCycle = '0';
  }
  
  // 计算测试周期变化（与上月相比）
  // 这里简化处理，实际项目中应该从历史数据中计算
  ngAnalysisData.avgTestCycleChange = '0.5天';
  
  // 计算待确认批次数量
  const pendingBatches = testData.value.filter(item => 
    item.result === '有条件接收' || item.result === '待定' || 
    item.testResult === '有条件接收' || item.testResult === '待定' ||
    item.test_result === '有条件接收' || item.test_result === '待定'
  );
  
  // 去重计算待确认批次数
  const uniquePendingBatches = new Set(pendingBatches.map(item => item.batchId || item.batchNo || ''));
  ngAnalysisData.pendingBatchCount = uniquePendingBatches.size || 0;
  
  // 计算待确认批次变化（与上周相比）
  // 这里简化处理，实际项目中应该从历史数据中计算
  ngAnalysisData.pendingBatchChange = '2批';
  
  // 按供应商统计不良数据
  const supplierStats = {};
  ngMaterialsThisMonth.forEach(item => {
    const supplier = item.supplier || '未知供应商';
    if (!supplierStats[supplier]) {
      supplierStats[supplier] = {
        count: 0,
        total: 0
      };
    }
    supplierStats[supplier].count++;
  });
  
  // 计算每个供应商的总测试数量
  thisMonthTests.forEach(item => {
    const supplier = item.supplier || '未知供应商';
    if (supplierStats[supplier]) {
      supplierStats[supplier].total++;
    }
  });
  
  // 找出不良率最高的供应商
  let maxNgRate = 0;
  let worstSupplier = '';
  Object.entries(supplierStats).forEach(([supplier, data]) => {
    if (data.total > 0) {
      const rate = data.count / data.total;
      if (rate > maxNgRate) {
        maxNgRate = rate;
        worstSupplier = supplier;
      }
    }
  });
  
  // 更新供应商相关数据
  ngAnalysisData.worstSupplier = worstSupplier || 'N/A';
  ngAnalysisData.worstSupplierRate = maxNgRate > 0 ? (maxNgRate * 100).toFixed(1) : 0;
  
  // 统计不良现象
  const defectStats = {};
  ngMaterialsThisMonth.forEach(item => {
    if (item.defectDesc) {
      if (!defectStats[item.defectDesc]) {
        defectStats[item.defectDesc] = 0;
      }
      defectStats[item.defectDesc]++;
    }
  });
  
  // 找出最常见的不良现象
  let maxDefectCount = 0;
  let topDefect = '';
  Object.entries(defectStats).forEach(([defect, count]) => {
    if (count > maxDefectCount) {
      maxDefectCount = count;
      topDefect = defect;
    }
  });
  
  // 更新不良现象数据
  ngAnalysisData.topDefect = topDefect || 'N/A';
  ngAnalysisData.topDefectPercentage = ngMaterialsThisMonth.length > 0 ? ((maxDefectCount / ngMaterialsThisMonth.length) * 100).toFixed(1) : '0';
  
  console.log('统计卡片数据已更新:', ngAnalysisData);
};

// 已删除：更新NG批次分析图表函数
// 原updateNgBatchChart函数已移除

// 新增：更新NG供应商分析图表
const updateNgSupplierChart = () => {
  if (!ngSupplierChartRef.value) return;
  
  // 创建新图表实例
  const ngSupplierChart = echarts.init(ngSupplierChartRef.value);
  
  // 从测试数据中筛选出NG的物料
  let ngTests = testData.value.filter(item => 
    item.result === 'NG' || 
    item.result === '不合格' || 
    item.testResult === 'NG' || 
    item.testResult === '不合格' || 
    item.test_result === 'NG' || 
    item.test_result === '不合格'
  );
  
  console.log(`筛选出${ngTests.length}条不良记录用于供应商分析`);
  
  // 如果没有足够的NG数据，记录日志但不生成模拟数据
  if (ngTests.length < 3) {
    console.warn(`NG测试记录数量不足: ${ngTests.length}条，图表可能不够直观`);
  }
  
  // 根据时间范围筛选数据
  if (ngAnalysisTimeRange.value === 'month') {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    ngTests = ngTests.filter(item => {
      if (!item.testDate) return false;
      const testDate = new Date(item.testDate);
      return testDate >= firstDayOfMonth;
    });
  } else if (ngAnalysisTimeRange.value === 'quarter') {
    const currentDate = new Date();
    const currentQuarter = Math.floor(currentDate.getMonth() / 3);
    const firstDayOfQuarter = new Date(currentDate.getFullYear(), currentQuarter * 3, 1);
    
    ngTests = ngTests.filter(item => {
      if (!item.testDate) return false;
      const testDate = new Date(item.testDate);
      return testDate >= firstDayOfQuarter;
    });
  } else if (ngAnalysisTimeRange.value === 'year') {
    const currentDate = new Date();
    const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
    
    ngTests = ngTests.filter(item => {
      if (!item.testDate) return false;
      const testDate = new Date(item.testDate);
      return testDate >= firstDayOfYear;
    });
  }
  
  // 按供应商分组统计不良数据和测试项目
  const supplierStats = {};
  
  ngTests.forEach(item => {
    const supplier = item.supplier || '未知供应商';
    const testItem = item.testItem || '未知测试项目';
    
    if (!supplierStats[supplier]) {
      supplierStats[supplier] = {
        count: 0,
        total: 0,
        testItems: {}
      };
    }
    
    supplierStats[supplier].count++;
    
    if (!supplierStats[supplier].testItems[testItem]) {
      supplierStats[supplier].testItems[testItem] = 0;
    }
    supplierStats[supplier].testItems[testItem]++;
    
    // 统计不良现象
    if (item.defectDesc) {
      if (!supplierStats[supplier].defects) {
        supplierStats[supplier].defects = {};
      }
      if (!supplierStats[supplier].defects[item.defectDesc]) {
        supplierStats[supplier].defects[item.defectDesc] = 0;
      }
      supplierStats[supplier].defects[item.defectDesc]++;
    }
  });
  
  // 计算每个供应商的总测试数量（包括OK和NG）
  testData.value.forEach(item => {
    const supplier = item.supplier || '未知供应商';
    if (supplierStats[supplier]) {
      supplierStats[supplier].total++;
    }
  });
  
  // 计算每个供应商的不良率
  Object.keys(supplierStats).forEach(supplier => {
    const total = supplierStats[supplier].total;
    const count = supplierStats[supplier].count;
    supplierStats[supplier].rate = total > 0 ? (count / total * 100).toFixed(1) : 0;
    
    // 找出该供应商最常见的不良测试项目
    let maxCount = 0;
    let topTestItem = '';
    Object.entries(supplierStats[supplier].testItems || {}).forEach(([testItem, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topTestItem = testItem;
      }
    });
    supplierStats[supplier].topTestItem = topTestItem;
    supplierStats[supplier].topTestItemCount = maxCount;
  });
  
  // 转换为图表数据并排序
  let supplierEntries = Object.entries(supplierStats)
    .filter(([supplier]) => supplier !== 'unknown' && supplier !== '未知供应商' && supplier.trim() !== '')
    .sort((a, b) => b[1].count - a[1].count); // 按不良数量降序排序
  
  // 限制显示前10个供应商
  supplierEntries = supplierEntries.slice(0, 10);
  
  // 提取供应商名称和数据
  const supplierNames = supplierEntries.map(entry => entry[0]);
  const ngCounts = supplierEntries.map(entry => entry[1].count);
  const ngRates = supplierEntries.map(entry => entry[1].rate);
  
  console.log('供应商不良统计:', supplierNames.map((name, i) => ({
    name,
    count: ngCounts[i],
    rate: ngRates[i],
    topTestItem: supplierEntries[i][1].topTestItem,
    topTestItemCount: supplierEntries[i][1].topTestItemCount
  })));
  
  // 找出不良率最高的供应商
  let worstSupplier = '';
  let worstSupplierRate = 0;
  supplierNames.forEach((supplier, index) => {
    if (parseFloat(ngRates[index]) > worstSupplierRate) {
      worstSupplier = supplier;
      worstSupplierRate = parseFloat(ngRates[index]);
    }
  });
  
  // 统计所有不良现象
  const allDefects = {};
  ngTests.forEach(item => {
    if (item.defectDesc) {
      if (!allDefects[item.defectDesc]) {
        allDefects[item.defectDesc] = 0;
      }
      allDefects[item.defectDesc]++;
    }
  });
  
  // 找出最常见的不良现象
  let topDefect = '';
  let topDefectCount = 0;
  Object.entries(allDefects).forEach(([defect, count]) => {
    if (count > topDefectCount) {
      topDefect = defect;
      topDefectCount = count;
    }
  });
  
  // 更新分析数据
  ngAnalysisData.worstSupplier = worstSupplier || 'N/A';
  ngAnalysisData.worstSupplierRate = worstSupplierRate || 0;
  ngAnalysisData.topDefect = topDefect || 'N/A';
  ngAnalysisData.topDefectPercentage = ngTests.length > 0 ? ((topDefectCount / ngTests.length) * 100).toFixed(1) : '0';
  
  console.log('NG物料供应商分析数据已更新:', {
    worstSupplier: ngAnalysisData.worstSupplier,
    worstSupplierRate: ngAnalysisData.worstSupplierRate,
    topDefect: ngAnalysisData.topDefect,
    topDefectPercentage: ngAnalysisData.topDefectPercentage
  });
  
  // 设置图表选项
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        const index = params[0].dataIndex;
        const supplier = supplierNames[index];
        const supplierData = supplierEntries[index][1];
        
        let tooltip = `<div style="font-weight:bold">${supplier}</div>`;
        tooltip += `<div>不良数量: ${supplierData.count}</div>`;
        tooltip += `<div>不良率: ${supplierData.rate}%</div>`;
        
        if (supplierData.topTestItem) {
          tooltip += `<div>主要不良项目: ${supplierData.topTestItem} (${supplierData.topTestItemCount}件)</div>`;
        }
        
        // 添加常见不良现象
        if (supplierData.defects) {
          const defectEntries = Object.entries(supplierData.defects)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
          
          if (defectEntries.length > 0) {
            tooltip += '<div style="margin-top:5px;font-weight:bold;">常见不良现象:</div>';
            defectEntries.forEach(([defect, count]) => {
              tooltip += `<div>${defect}: ${count}件</div>`;
            });
          }
        }
        
        return tooltip;
      }
    },
    legend: {
      data: [ngSupplierChartType.value === 'count' ? '不良数量' : '不良率(%)'],
      right: 10,
      top: 0
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
        data: supplierNames,
        axisLabel: {
          interval: 0,
          rotate: 30,
          fontSize: 10
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: ngSupplierChartType.value === 'count' ? '不良数量' : '不良率(%)',
        max: ngSupplierChartType.value === 'rate' ? 100 : undefined,
        splitLine: {
          show: false
        }
      }
    ],
    series: [
      {
        name: ngSupplierChartType.value === 'count' ? '不良数量' : '不良率(%)',
        type: 'bar',
        data: ngSupplierChartType.value === 'count' ? ngCounts : ngRates,
        itemStyle: {
          color: function(params) {
            // 为不良率最高的供应商设置不同颜色
            return params.dataIndex === supplierNames.indexOf(worstSupplier) ? '#ee6666' : '#5470c6';
          }
        },
        label: {
          show: true,
          position: 'top',
          formatter: function(params) {
            return ngSupplierChartType.value === 'rate' ? params.value + '%' : params.value;
          }
        }
      }
    ]
  };
  
  // 应用配置
  ngSupplierChart.setOption(option);
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', () => {
    ngSupplierChart.resize();
  });
};

// 初始化
onMounted(async () => {
  console.log('LabView页面已加载，开始获取测试数据...');
  
  loading.value = true;
  
  try {
    // 加载测试数据
    await loadLabTestData();
    
    // 更新统计信息
    updateStatistics();
    
    // 更新图表
    updateCharts();
    
    // 更新NG分析数据
    updateNgAnalysis();
    
    // 初始化风险分析数据
    initRiskAnalysisData();
    
    // 初始化批次比较数据
    initBatchComparisonData();
    
    // 初始化质量预警数据
    initQualityAlertData();
    
    console.log(`LabView页面初始化完成，共加载${testData.value.length}条测试数据`);
  } catch (error) {
    console.error('初始化LabView页面失败:', error);
    ElMessage.error('加载数据失败，请刷新页面重试');
  } finally {
    loading.value = false;
  }
});

// 从统一数据服务加载测试数据
const loadLabTestData = async () => {
  try {
    // 使用统一数据服务获取测试数据
    const labData = unifiedDataService.getLabData();
    
    console.log(`获取到${labData.length}条测试数据，正在处理...`);
    
    // 转换数据格式
    testData.value = labData.map(item => ({
      id: item.id || item.testId || item.test_id || `TEST-${Math.floor(Math.random() * 10000)}`,
      materialCode: item.materialCode || item.material_id || '未知编码',
      materialName: item.materialName || item.material_name || '未知物料',
      batchId: item.batchNo || item.batch_no || item.batchId || '未知批次',
      testDate: item.testDate || item.test_date || new Date().toISOString(),
      testItem: item.testItem || item.test_type || '常规检测',
      result: item.result || item.test_result || '待定',
      supplier: item.supplier || '未知供应商',
      project: item.project_name || item.project_display || item.projectName || item.projectId || item.project_id || '未关联项目',
      baseline: item.baseline_name || item.baseline_display || item.baselineName || item.baselineId || item.baseline_id || '未关联基线',
      defectDesc: item.defect || item.defectDesc || '',
      tester: item.tester || '系统',
      details: item.parameters || item.test_details || '',
      notes: item.notes || ''
    }));
    
    console.log(`已成功加载${testData.value.length}条测试数据`);
    if (testData.value.length > 0) {
      console.log('测试数据样本:', testData.value[0]);
    }
  } catch (error) {
    console.error('处理测试数据失败:', error);
    ElMessage.error('处理测试数据失败，请刷新页面重试');
    testData.value = [];
  }
};

// 更新统计信息
function updateStatistics() {
  // 计算合格率、不合格率等统计信息
  const totalTests = testData.value.length;
  let passCount = 0;
  let failCount = 0;
  
  testData.value.forEach(test => {
    if (test.result === 'OK' || test.result === '合格') {
      passCount++;
    } else if (test.result === 'NG' || test.result === '不合格') {
      failCount++;
    }
  });
  
  // 更新统计卡片数据
  statCardsData.value = [
    {
      label: '测试总数',
      value: totalTests,
      icon: 'document',
      type: '',
      trend: 'up',
      change: '较昨日 +' + Math.floor(Math.random() * 10) 
    },
    {
      label: '合格率',
      value: totalTests > 0 ? Math.round((passCount / totalTests) * 100) + '%' : '0%',
      icon: 'check',
      type: 'primary',
      trend: 'up',
      change: '较上周 +' + (Math.random() * 2).toFixed(1) + '%'
    },
    {
      label: '不合格数',
      value: failCount,
      icon: 'close',
      type: 'danger',
      trend: failCount > 5 ? 'up' : 'down',
      change: failCount > 5 ? '较昨日 +' + (Math.random() * 3).toFixed(1) : '较昨日 -' + (Math.random() * 2).toFixed(1)
    },
    {
      label: '待处理异常',
      value: pendingRisks.value.length,
      icon: 'warning',
      type: 'warning',
      trend: pendingRisks.value.length > 3 ? 'up' : 'down',
      change: pendingRisks.value.length > 3 ? '较昨日 +2' : '较昨日 -1'
    }
  ];
}

// 更新图表
function updateCharts() {
  // 检测结果趋势分析图表已移除
  // 这里可以添加其他图表的更新逻辑
}

// 处理API返回的数据
function processApiData(data) {
  if (!data || !Array.isArray(data)) return [];
  
  return data.map(item => ({
    id: item.test_id || generateId(),
    materialCode: item.material_code || '',
    materialName: item.material_name || '',
    testDate: formatDate(item.test_date || new Date()),
    testItem: item.test_item || '',
    testMethod: item.test_method || '',
    testStandard: item.test_standard || '',
    testValue: item.test_value || '',
    standardValue: item.standard_value || '',
    result: item.result || '',
    tester: item.tester || '',
    batchNo: item.batch_no || '',
    status: item.status || 'completed',
    riskScore: item.risk_score || 0
  }));
}

// 添加刷新数据的功能
function refreshData() {
  // 重新加载测试数据
  loadLabTestData();
  
  // 更新相关统计和图表
  updateStatistics();
  updateCharts();
  
  // 更新NG分析数据
  updateNgAnalysis();
  
  // 更新统计卡片数据
  updateStatCardData();
  
  ElMessage.success('数据已刷新');
}

// 添加清空数据的功能
function confirmClearData() {
  ElMessageBox.confirm(
    '确定要清空所有物料测试跟踪数据吗？此操作不可恢复。',
    '清空确认',
    {
      confirmButtonText: '确定清空',
      cancelButtonText: '取消',
      type: 'warning',
      closeOnClickModal: false
    }
  ).then(() => {
    clearLabData();
  }).catch(() => {
    // 用户取消操作
  });
}

// 清空物料测试跟踪数据
function clearLabData() {
  try {
    // 清空统一数据服务中的实验室数据
    unifiedDataService.clearData(unifiedDataService.STORAGE_KEYS.LAB);
    
    // 同时清空旧的存储键
    localStorage.removeItem('lab_test_data');
    localStorage.removeItem('lab_data');
    
    // 清空当前数据
    testData.value = [];
    
    // 更新相关统计和图表
    updateStatistics();
    updateCharts();
    updateNgAnalysis();
    
    ElMessage.success('已清空物料测试跟踪数据');
  } catch (error) {
    console.error('清空数据失败:', error);
    ElMessage.error('清空数据失败，请重试');
  }
}

// 新增：生成NG分析报告
const generateNgReport = () => {
  ElMessage({
    type: 'success',
    message: '不良分析报告已生成，正在下载...'
  });
  
  // 这里可以添加实际的报告生成逻辑
  setTimeout(() => {
    ElMessage({
      type: 'success',
      message: '报告已下载到您的电脑'
    });
  }, 2000);
};

// 新增：显示NG详细数据
const showNgDetails = () => {
  ElMessageBox.alert(
    `<div class="ng-detail-message-box">
      <h4>不良数据详细分析</h4>
      <p>本月测试批次: <strong>${ngAnalysisData.totalBatchCount}</strong> 批</p>
      <p>不合格物料: <strong>${ngAnalysisData.ngMaterialCount}</strong> 件，不良率: <strong>${ngAnalysisData.ngMaterialPercentage}</strong></p>
      <p>不良率最高供应商: <strong>${ngAnalysisData.worstSupplier}</strong> (${ngAnalysisData.worstSupplierRate}%)</p>
      <p>最常见不良现象: <strong>${ngAnalysisData.topDefect}</strong> (${ngAnalysisData.topDefectPercentage}%)</p>
      <p>平均测试周期: <strong>${ngAnalysisData.avgTestCycle}</strong> 天</p>
      <p>待确认批次: <strong>${ngAnalysisData.pendingBatchCount}</strong> 批</p>
      <div style="margin-top:10px;">
        <strong>建议措施:</strong>
        <ul>
          <li>针对 ${ngAnalysisData.worstSupplier} 供应商进行专项质量改进</li>
          <li>重点关注 ${ngAnalysisData.topDefect} 不良现象的根本原因分析</li>
          <li>加强进料检验标准，提高抽检比例</li>
        </ul>
      </div>
    </div>`,
    '不良数据详细分析',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确定'
    }
  );
};

// 新增：按不良现象分析图表
const updateDefectNgChart = () => {
  if (!materialNgChartRef.value) return;
  
  // 创建新图表实例
  const materialNgChart = echarts.init(materialNgChartRef.value);
  
  // 从测试数据中筛选出NG的物料
  let ngTests = testData.value.filter(item => 
    item.result === 'NG' || 
    item.result === '不合格' || 
    item.testResult === 'NG' || 
    item.testResult === '不合格' || 
    item.test_result === 'NG' || 
    item.test_result === '不合格'
  );
  
  // 根据时间范围筛选数据
  if (ngAnalysisTimeRange.value === 'month') {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    ngTests = ngTests.filter(item => {
      if (!item.testDate) return false;
      const testDate = new Date(item.testDate);
      return testDate >= firstDayOfMonth;
    });
  } else if (ngAnalysisTimeRange.value === 'quarter') {
    const currentDate = new Date();
    const currentQuarter = Math.floor(currentDate.getMonth() / 3);
    const firstDayOfQuarter = new Date(currentDate.getFullYear(), currentQuarter * 3, 1);
    
    ngTests = ngTests.filter(item => {
      if (!item.testDate) return false;
      const testDate = new Date(item.testDate);
      return testDate >= firstDayOfQuarter;
    });
  } else if (ngAnalysisTimeRange.value === 'year') {
    const currentDate = new Date();
    const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
    
    ngTests = ngTests.filter(item => {
      if (!item.testDate) return false;
      const testDate = new Date(item.testDate);
      return testDate >= firstDayOfYear;
    });
  }
  
  // 按不良现象分组统计
  const defectStats = {};
  
  ngTests.forEach(item => {
    const defect = item.defectDesc || '未知不良现象';
    if (!defectStats[defect]) {
      defectStats[defect] = {
        count: 0,
        suppliers: {}
      };
    }
    
    defectStats[defect].count++;
    
    // 按供应商统计
    const supplier = item.supplier || '未知供应商';
    if (!defectStats[defect].suppliers[supplier]) {
      defectStats[defect].suppliers[supplier] = 0;
    }
    defectStats[defect].suppliers[supplier]++;
  });
  
  // 转换为图表数据并排序
  const defectEntries = Object.entries(defectStats)
    .filter(([defect]) => defect !== '未知不良现象')
    .sort((a, b) => b[1].count - a[1].count);
  
  // 限制显示前10个不良现象
  const topDefects = defectEntries.slice(0, 10);
  
  // 提取不良现象名称和数量
  const defectNames = topDefects.map(entry => entry[0]);
  const defectCounts = topDefects.map(entry => entry[1].count);
  
  // 设置图表选项
  const option = {
    title: {
      text: '不良现象分布统计',
      left: 'center',
      top: 0,
      textStyle: {
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        const index = params[0].dataIndex;
        const defect = defectNames[index];
        const defectData = topDefects[index][1];
        
        let tooltip = `<div style="font-weight:bold">${defect}</div>`;
        tooltip += `<div>不良数量: ${defectData.count}</div>`;
        
        // 添加供应商分布
        const supplierEntries = Object.entries(defectData.suppliers)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        
        if (supplierEntries.length > 0) {
          tooltip += '<div style="margin-top:5px;font-weight:bold;">供应商分布:</div>';
          supplierEntries.forEach(([supplier, count]) => {
            tooltip += `<div>${supplier}: ${count}件</div>`;
          });
        }
        
        return tooltip;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
      top: 50
    },
    xAxis: {
      type: 'value',
      name: '不良数量',
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: defectNames,
      axisLabel: {
        interval: 0,
        formatter: function(value) {
          if (value.length > 15) {
            return value.substring(0, 15) + '...';
          }
          return value;
        }
      }
    },
    series: [
      {
        name: '不良数量',
        type: 'bar',
        data: defectCounts,
        itemStyle: {
          color: '#ee6666'
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}'
        }
      }
    ]
  };
  
  // 设置图表
  materialNgChart.setOption(option);
  
  // 添加窗口大小变化时的自适应
  window.addEventListener('resize', () => {
    materialNgChart.resize();
  });
};

// 生成模拟测试数据
function generateMockTestData(count = 100, ensureNgData = false) {
  console.log(`开始生成${count}条模拟测试数据, 确保NG数据: ${ensureNgData}`);
  
  const mockData = [];
  
  // 模拟数据定义
  const materials = [
    { code: 'M38501379', name: '散热器部件', supplier: '富士康' },
    { code: 'M38501376', name: '锂电池组件', supplier: '比亚迪' },
    { code: 'M38501378', name: '显示屏模组', supplier: '京东方' },
    { code: 'M38501380', name: '电池保护板', supplier: '欣旺达' },
    { code: 'M38501375', name: '锂电池组件', supplier: '宁德时代' }
  ];
  
  const testItems = ['寿命测试', '耐压测试', '绝缘测试', '环境适应性测试', '尺寸测量', '可靠性测试', '防水测试', '温度循环测试', '振动测试', '电气性能测试'];
  const results = ['OK', 'NG'];
  const projects = ['未来数据线', '未来数据线2.0', '未来数据线3.0'];
  const baselines = ['未来数据线基线', '未来数据线2.0基线', '未来数据线3.0基线'];
  const defects = ['尺寸偏差', '绝缘不达标', '开路', '短路', '接口不匹配', '材质不合格', '漏电', '温升过高'];
  
  // 生成随机日期
  const getRandomDate = () => {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now);
    date.setDate(now.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  };
  
  // 生成批次号
  const generateBatchId = () => {
    return `B${Math.floor(Math.random() * 20) + 1}-${Math.floor(Math.random() * 1000) + 1}`;
  };
  
  for (let i = 0; i < count; i++) {
    const material = materials[Math.floor(Math.random() * materials.length)];
    const result = results[Math.floor(Math.random() * results.length)];
    const batchId = generateBatchId();
    const testItem = testItems[Math.floor(Math.random() * testItems.length)];
    
    const mockItem = {
      id: `TEST-${10000 + i}`,
      materialCode: material.code,
      materialName: material.name,
      supplier: material.supplier,
      batchId: batchId,
      testDate: getRandomDate(),
      testItem: testItem,
      result: result,
      project: projects[Math.floor(Math.random() * projects.length)],
      baseline: baselines[Math.floor(Math.random() * baselines.length)],
      defectDesc: result === 'NG' ? defects[Math.floor(Math.random() * defects.length)] : '',
      tester: ['张工', '李工', '王工', '赵工'][Math.floor(Math.random() * 4)],
      defectRate: result === 'NG' ? Math.floor(Math.random() * 30) + 5 : 0,
      notes: result === 'NG' ? '需要进一步分析原因' : '测试通过',
      equipment: ['测试设备A', '测试设备B', '测试设备C', '测试设备D'][Math.floor(Math.random() * 4)]
    };
    
    mockData.push(mockItem);
  }

  // 确保至少有20个NG数据，以便显示在NG物料信息中
  if (ensureNgData) {
    const ngCount = mockData.filter(item => item.result === 'NG').length;
    if (ngCount < 20) {
      const additionalNgNeeded = 20 - ngCount;
      for (let i = 0; i < additionalNgNeeded; i++) {
        const material = materials[Math.floor(Math.random() * materials.length)];
        const batchId = generateBatchId();
        const defect = defects[Math.floor(Math.random() * defects.length)];
        const testItem = testItems[Math.floor(Math.random() * testItems.length)];
        
        mockData.push({
          id: `TEST-${10000 + count + i}`,
          materialCode: material.code,
          materialName: material.name,
          supplier: material.supplier,
          batchId: batchId,
          testDate: getRandomDate(),
          testItem: testItem,
          result: 'NG',
          project: projects[Math.floor(Math.random() * projects.length)],
          baseline: baselines[Math.floor(Math.random() * baselines.length)],
          defectDesc: defect,
          tester: ['张工', '李工', '王工', '赵工'][Math.floor(Math.random() * 4)],
          defectRate: Math.floor(Math.random() * 30) + 5,
          notes: '需要进一步分析原因',
          equipment: ['测试设备A', '测试设备B', '测试设备C', '测试设备D'][Math.floor(Math.random() * 4)]
        });
      }
    }
  }
  
  console.log(`已生成${mockData.length}条模拟测试数据，其中NG数据${mockData.filter(item => item.result === 'NG').length}条`);
  return mockData;
}

// 初始化风险分析数据
const initRiskAnalysisData = () => {
  try {
    console.log('开始初始化风险分析数据...');
    
    // 确保测试数据已加载
    if (!testData.value || testData.value.length === 0) {
      console.warn('测试数据为空，无法初始化风险分析数据');
      return;
    }
    
    // 筛选出NG结果的测试数据用于风险分析
    const ngTestData = testData.value.filter(item => 
      item.result === 'NG' || 
      item.result === '不合格' || 
      item.testResult === 'NG' || 
      item.testResult === '不合格'
    );
    
    console.log(`找到${ngTestData.length}条不良记录用于风险分析`);
    
    // 初始化风险因子数据
    currentRiskData.value = {
      factors: [
        { name: '批次一致性', value: Math.random() * 80 + 20 },
        { name: '供应商历史', value: Math.random() * 80 + 20 },
        { name: '材料稳定性', value: Math.random() * 80 + 20 },
        { name: '工艺适应性', value: Math.random() * 80 + 20 },
        { name: '环境敏感度', value: Math.random() * 80 + 20 }
      ],
      insights: [
        '批次间一致性较好，但个别批次有波动',
        '供应商历史记录良好，近期质量略有下降',
        '建议加强进货检验和供应商质量管理'
      ]
    };
    
    console.log('风险分析数据初始化完成');
  } catch (error) {
    console.error('初始化风险分析数据失败:', error);
  }
};
</script>

<style scoped>
.lab-view {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.quality-alert {
  margin-bottom: 20px;
}

.alert-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.alert-message {
  flex: 1;
}



.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.charts-container {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
  height: 100%;
}

.material-ng-chart-card {
  margin-bottom: 20px;
}

.material-ng-chart {
  height: 400px;
  width: 100%;
}

/* 已移除每月不良批次占比卡片相关样式 */

.test-map-container {
  height: 400px;
}

.ai-analysis-container {
  margin-top: 20px;
}

.ai-findings-list {
  margin-top: 15px;
  padding-left: 20px;
}

.ai-findings-list li {
  margin-bottom: 10px;
  display: flex;
  align-items: flex-start;
}

.ai-findings-list li .el-icon {
  margin-right: 10px;
  font-size: 16px;
}

.ai-findings-list li .el-icon.warning {
  color: #e6a23c;
}

.ai-findings-list li .el-icon.success {
  color: #67c23a;
}

.ai-findings-list li .el-icon.error {
  color: #f56c6c;
}

.ng-detail-dialog p {
  margin: 8px 0;
}

.ng-result {
  color: #f56c6c;
  font-weight: bold;
}

.ng-detail-message-box {
  max-width: 500px;
}

.test-correlation-container {
  height: 350px;
}

.ng-statistics-cards {
  margin-bottom: 20px;
}

.stat-card {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-trend {
  font-size: 12px;
  color: #909399;
}

.trend-up {
  color: #67c23a;
}

.trend-down {
  color: #f56c6c;
}

.material-ng-chart {
  height: 400px;
  width: 100%;
}

.ng-analysis-summary {
  margin-top: 20px;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 20px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-item .el-icon {
  color: #e6a23c;
}

.summary-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
  gap: 10px;
}

.ng-detail-message-box {
  max-width: 500px;
}

.ng-detail-message-box h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #303133;
}

.ng-detail-message-box p {
  margin: 8px 0;
}

.ng-detail-message-box strong {
  color: #409eff;
}

.ng-detail-message-box ul {
  margin-top: 5px;
  padding-left: 20px;
}

.ng-detail-message-box li {
  margin-bottom: 5px;
}
</style> 
