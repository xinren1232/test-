<template>
  <div class="lab-view">
    <h2 class="page-title">实验室检测分析</h2>
    
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
    
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6" v-for="(card, index) in statCardsData" :key="index">
          <el-card shadow="hover" class="stat-card" :class="card.type">
            <div class="card-icon">
              <i :class="`el-icon-${card.icon}`"></i>
            </div>
            <div class="card-content">
              <div class="card-label">{{ card.label }}</div>
              <div class="card-value">{{ card.value }}</div>
              <div class="card-trend">
                <i :class="card.trend === 'up' ? 'el-icon-top' : 'el-icon-bottom'"></i>
                {{ card.change }}
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 筛选条件 -->
    <div class="filter-container">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="物料代码">
          <el-input v-model="filterForm.materialCode" placeholder="输入物料代码" clearable></el-input>
        </el-form-item>
        <el-form-item label="物料名称">
          <el-input v-model="filterForm.materialName" placeholder="输入物料名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="测试项目">
          <el-select v-model="filterForm.testItem" placeholder="选择测试项目" clearable>
            <el-option 
              v-for="item in testItemOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
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
      <el-col :span="12">
        <quality-trend-chart 
          :trend-data="trendAnalysisData"
          title="检测结果趋势分析"
          :threshold="5"
        ></quality-trend-chart>
      </el-col>
      <el-col :span="12">
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
        </el-tabs>
      </el-col>
    </el-row>
    
    <!-- 检测结果表格 -->
    <div class="table-container">
      <h3 class="section-title">检测结果明细</h3>
      <el-table 
        :data="filteredLabTests" 
        style="width: 100%" 
        border 
        stripe 
        :row-class-name="tableRowClassName"
        @row-click="handleRowClick"
      >
        <el-table-column prop="id" label="检测编号" width="150"></el-table-column>
        <el-table-column prop="testDate" label="检测日期" width="120"></el-table-column>
        <el-table-column prop="materialCode" label="物料代码" width="110"></el-table-column>
        <el-table-column prop="materialName" label="物料名称" min-width="180"></el-table-column>
        <el-table-column prop="testItem" label="测试项目" min-width="200"></el-table-column>
        <el-table-column prop="result" label="检测结果" width="100">
          <template #default="scope">
            <el-tag :type="getResultTagType(scope.row.result)" size="small">
              {{ scope.row.result }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="defectRate" label="不良比例" width="120"></el-table-column>
        <el-table-column prop="supplier" label="供应商" width="120"></el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button type="text" size="small" @click.stop="viewDetails(scope.row)">详情</el-button>
            <el-button type="text" size="small" @click.stop="viewImages(scope.row)" :disabled="!scope.row.images || !scope.row.images.length">
              查看图片
            </el-button>
            <el-button type="text" size="small" @click.stop="sendToAiAnalysis(scope.row)">AI分析</el-button>
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
          <el-descriptions-item label="检测来源">{{ selectedTest.testSource }}</el-descriptions-item>
          <el-descriptions-item label="项目">{{ selectedTest.project }}</el-descriptions-item>
          <el-descriptions-item label="测试项目">{{ selectedTest.testItem }}</el-descriptions-item>
          <el-descriptions-item label="检测结果">
            <el-tag :type="getResultTagType(selectedTest.result)">{{ selectedTest.result }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="不良批次">{{ selectedTest.badBatch || 'N/A' }}</el-descriptions-item>
          <el-descriptions-item label="不良比例">{{ selectedTest.defectRate }}</el-descriptions-item>
          <el-descriptions-item label="供应商">{{ selectedTest.supplier }}</el-descriptions-item>
          <el-descriptions-item label="责任归类">{{ selectedTest.responsibility }}</el-descriptions-item>
          <el-descriptions-item label="建议处理" :span="2">{{ selectedTest.recommendation }}</el-descriptions-item>
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
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';

// 引入自定义组件
import QualityTrendChart from '../components/features/QualityTrendChart.vue';
import BatchComparisonRadar from '../components/features/BatchComparisonRadar.vue';
import RiskFactorChart from '../components/features/RiskFactorChart.vue';

// 引入数据存储
import { useIQEStore } from '../store';

// 创建路由和数据存储实例
const router = useRouter();
const store = useIQEStore();

// 提取数据
const labTestData = computed(() => store.labTestData);
const trendAnalysisData = computed(() => store.trendAnalysisData);
const statCardsData = computed(() => store.getStatCardsData('lab'));
const batchComparisonData = computed(() => store.batchComparisonData);
const riskAnalysisData = computed(() => store.riskAnalysisData);

// 筛选表单
const filterForm = reactive({
  materialCode: '',
  materialName: '',
  testItem: '',
  result: '',
  dateRange: []
});

// 分页控制
const pagination = reactive({
  currentPage: 1,
  pageSize: 10
});

// 测试项目选项
const testItemOptions = computed(() => {
  // 从数据中提取不重复的测试项目
  const items = new Set();
  labTestData.value.forEach(test => {
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

// 筛选后的测试数据
const filteredLabTests = computed(() => {
  // 应用筛选条件
  let result = store.filterLabTests(filterForm);
  
  // 应用分页
  const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  return result.slice(startIndex, endIndex);
});

const totalTests = computed(() => {
  return store.filterLabTests(filterForm).length;
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

// 处理分页大小变化
const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.currentPage = 1;
};

// 处理页码变化
const handleCurrentChange = (page) => {
  pagination.currentPage = page;
};

// 处理筛选
const handleFilter = () => {
  pagination.currentPage = 1;
};

// 重置筛选条件
const resetFilter = () => {
  Object.keys(filterForm).forEach(key => {
    filterForm[key] = key === 'dateRange' ? [] : '';
  });
  pagination.currentPage = 1;
};

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

// 发送到AI分析
const sendToAiAnalysis = (row) => {
  ElMessage({
    type: 'success',
    message: `已将【${row.materialName}】的检测数据发送至AI助手进行深度分析`
  });
  
  // 跳转到AI助手页面并传递数据
  router.push({
    path: '/ai-assistant',
    query: {
      materialCode: row.materialCode,
      testId: row.id,
      action: 'analyze'
    }
  });
};

// 处理行点击
const handleRowClick = (row) => {
  selectedMaterial.value = {
    materialCode: row.materialCode,
    materialName: row.materialName
  };
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

// 初始化
onMounted(async () => {
  // 加载数据(如果需要)
  await store.refreshData();
  
  // 初始化风险数据
  pendingRisks.value = store.qualityPredictionData.filter(item => item.predictedResult === 'NG');
  
  // 默认选择第一条记录
  if (labTestData.value.length > 0) {
    selectedMaterial.value = {
      materialCode: labTestData.value[0].materialCode,
      materialName: labTestData.value[0].materialName
    };
  }
});
</script>

<style scoped>
.lab-view {
  padding: 20px;
}

.page-title {
  font-size: 22px;
  margin-bottom: 20px;
  color: #303133;
  font-weight: 600;
}

.quality-alert {
  margin-bottom: 20px;
}

.alert-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.alert-message p {
  margin: 5px 0;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 15px;
  height: 100px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.card-icon {
  font-size: 28px;
  margin-right: 15px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.stat-card.primary .card-icon {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.stat-card.danger .card-icon {
  background-color: rgba(245, 108, 108, 0.1);
  color: #F56C6C;
}

.stat-card.warning .card-icon {
  background-color: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
}

.stat-card.info .card-icon {
  background-color: rgba(144, 147, 153, 0.1);
  color: #909399;
}

.card-content {
  flex-grow: 1;
}

.card-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.card-value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.card-trend {
  font-size: 13px;
  color: #909399;
  margin-top: 5px;
}

.filter-container {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.charts-container {
  margin-bottom: 20px;
}

.empty-chart {
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fc;
  border-radius: 8px;
  color: #909399;
}

.section-title {
  font-size: 18px;
  margin: 15px 0;
  color: #303133;
  font-weight: 500;
}

.table-container {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.error-row {
  background-color: rgba(245, 108, 108, 0.1);
}

.warning-row {
  background-color: rgba(230, 162, 60, 0.1);
}

.test-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.related-records {
  margin-top: 15px;
}

.related-records h4 {
  font-size: 15px;
  margin-bottom: 10px;
  color: #303133;
}

.related-records .el-tag {
  margin-right: 10px;
  margin-bottom: 10px;
}

.test-images h4 {
  font-size: 15px;
  margin-bottom: 15px;
  color: #303133;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.image-item {
  text-align: center;
}

.image-caption {
  text-align: center;
  margin-top: 8px;
  color: #606266;
}

.test-procedure h4 {
  font-size: 15px;
  margin-bottom: 15px;
  color: #303133;
}

.param-item {
  margin-bottom: 5px;
}

.image-preview {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.carousel-image-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.carousel-image {
  max-height: 350px;
  max-width: 100%;
  object-fit: contain;
}

.carousel-caption {
  margin-top: 15px;
  text-align: center;
  color: #606266;
  font-size: 14px;
}

.image-thumbnails {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.thumbnail-item {
  width: 80px;
  height: 80px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.thumbnail-item:hover {
  border-color: #409EFF;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.risk-analysis-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.risk-score {
  font-weight: 600;
  font-size: 18px;
}

.high-risk {
  color: #F56C6C;
}

.medium-risk {
  color: #E6A23C;
}

.low-risk {
  color: #67C23A;
}

.risk-tabs {
  margin-top: 20px;
}

.risk-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
}

.analysis-tabs {
  height: 100%;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .filter-form :deep(.el-form-item) {
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style> 