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
      
      <!-- 新增AI实验解析模块 -->
      <el-col :span="24" style="margin-top: 20px;">
        <el-card shadow="hover" class="ai-analysis-card">
          <template #header>
            <div class="card-header">
              <h3><el-icon><magic-stick /></el-icon> AI实验结果解析</h3>
              <el-button type="primary" size="small" @click="startNewAnalysis">开始新分析</el-button>
            </div>
          </template>
          
          <div v-if="!activeAnalysis" class="empty-analysis">
            <el-empty description="选择检测记录或上传数据以开始AI分析">
              <el-button type="primary" @click="showAnalysisOptions">开始分析</el-button>
            </el-empty>
          </div>
          
          <div v-else class="active-analysis">
            <el-row :gutter="20">
              <!-- 实验数据 -->
              <el-col :span="12">
                <el-card shadow="hover" class="inner-card">
                  <template #header>
                    <h4>实验数据</h4>
                  </template>
                  <div class="data-preview">
                    <el-descriptions :column="2" border>
                      <el-descriptions-item label="物料代码">{{ activeAnalysis.materialCode }}</el-descriptions-item>
                      <el-descriptions-item label="批次号">{{ activeAnalysis.batchId }}</el-descriptions-item>
                      <el-descriptions-item label="测试日期">{{ activeAnalysis.testDate }}</el-descriptions-item>
                      <el-descriptions-item label="测试项目">{{ activeAnalysis.testItem }}</el-descriptions-item>
                    </el-descriptions>
                    
                    <div class="data-table-wrapper">
                      <h5>测试数据</h5>
                      <el-table :data="activeAnalysis.testData" border size="small">
                        <el-table-column prop="parameter" label="参数"></el-table-column>
                        <el-table-column prop="value" label="测量值"></el-table-column>
                        <el-table-column prop="unit" label="单位"></el-table-column>
                        <el-table-column prop="standard" label="标准值"></el-table-column>
                        <el-table-column label="状态">
                          <template #default="scope">
                            <el-tag :type="scope.row.status === 'OK' ? 'success' : scope.row.status === 'NG' ? 'danger' : 'warning'">
                              {{ scope.row.status }}
                            </el-tag>
                          </template>
                        </el-table-column>
                      </el-table>
                    </div>
                  </div>
                </el-card>
              </el-col>
              
              <!-- AI分析结果 -->
              <el-col :span="12">
                <el-card shadow="hover" class="inner-card analysis-results">
                  <template #header>
                    <h4>AI分析结果</h4>
                  </template>
                  
                  <div class="ai-score-container">
                    <div class="ai-score-circle" :class="getQualityScoreClass(activeAnalysis.qualityScore)">
                      <span class="score-number">{{ activeAnalysis.qualityScore }}</span>
                      <span class="score-label">质量评分</span>
                    </div>
                    
                    <div class="ai-score-detail">
                      <div class="score-item">
                        <div class="score-name">稳定性</div>
                        <el-progress :percentage="activeAnalysis.stabilityScore" :color="getScoreColor(activeAnalysis.stabilityScore)"></el-progress>
                      </div>
                      <div class="score-item">
                        <div class="score-name">一致性</div>
                        <el-progress :percentage="activeAnalysis.consistencyScore" :color="getScoreColor(activeAnalysis.consistencyScore)"></el-progress>
                      </div>
                      <div class="score-item">
                        <div class="score-name">安全性</div>
                        <el-progress :percentage="activeAnalysis.safetyScore" :color="getScoreColor(activeAnalysis.safetyScore)"></el-progress>
                      </div>
                    </div>
                  </div>
                  
                  <div class="ai-conclusions">
                    <h5>核心发现</h5>
                    <ul class="finding-list">
                      <li v-for="(finding, idx) in activeAnalysis.findings" :key="idx">
                        <el-icon :color="finding.type === 'positive' ? '#67C23A' : finding.type === 'negative' ? '#F56C6C' : '#E6A23C'">
                          <component :is="finding.type === 'positive' ? 'CircleCheck' : finding.type === 'negative' ? 'CircleClose' : 'Warning'" />
                        </el-icon>
                        {{ finding.content }}
                      </li>
                    </ul>
                    
                    <h5>改进建议</h5>
                    <div class="recommendations">
                      <div v-for="(rec, idx) in activeAnalysis.recommendations" :key="idx" class="recommendation-item">
                        <div class="recommendation-title">{{ idx + 1 }}. {{ rec.title }}</div>
                        <div class="recommendation-content">{{ rec.content }}</div>
                      </div>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-card>
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
            <el-button link size="small" @click.stop="viewDetails(scope.row)">详情</el-button>
            <el-button link size="small" @click.stop="viewImages(scope.row)" :disabled="!scope.row.images || !scope.row.images.length">
              图片
            </el-button>
            <el-button link size="small" @click.stop="sendToAiAnalysis(scope.row)">AI分析</el-button>
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

    <!-- 添加AI分析对话框 -->
    <el-dialog
      v-model="analysisDialogVisible"
      title="开始AI分析"
      width="50%"
      destroy-on-close
    >
      <el-form :model="analysisForm" label-width="120px">
        <el-form-item label="分析方式">
          <el-radio-group v-model="analysisForm.mode">
            <el-radio label="select">选择已有检测记录</el-radio>
            <el-radio label="upload">上传新检测数据</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <template v-if="analysisForm.mode === 'select'">
          <el-form-item label="检测记录">
            <el-select v-model="analysisForm.testId" placeholder="选择检测记录">
              <el-option
                v-for="test in recentLabTests"
                :key="test.id"
                :label="`${test.id} - ${test.materialName} (${test.testDate})`"
                :value="test.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </template>
        
        <template v-else>
          <el-form-item label="物料代码">
            <el-input v-model="analysisForm.materialCode"></el-input>
          </el-form-item>
          <el-form-item label="批次号">
            <el-input v-model="analysisForm.batchId"></el-input>
          </el-form-item>
          <el-form-item label="测试项目">
            <el-select v-model="analysisForm.testItem" placeholder="选择测试项目">
              <el-option
                v-for="item in testItemOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="数据文件">
            <el-upload
              action="#"
              :auto-upload="false"
              :on-change="handleFileChange"
              :limit="1"
            >
              <el-button type="primary">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip">支持Excel或CSV格式的数据文件</div>
              </template>
            </el-upload>
          </el-form-item>
        </template>
        
        <el-form-item label="分析重点">
          <el-checkbox-group v-model="analysisForm.focusAreas">
            <el-checkbox label="stability">稳定性</el-checkbox>
            <el-checkbox label="outliers">异常值</el-checkbox>
            <el-checkbox label="trend">趋势分析</el-checkbox>
            <el-checkbox label="comparison">历史对比</el-checkbox>
            <el-checkbox label="recommendation">改进建议</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="analysisDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="runAiAnalysis" :loading="analysisLoading">
            开始分析
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { MagicStick, Warning, CircleCheck, CircleClose } from '@element-plus/icons-vue';

// 引入自定义组件
import QualityTrendChart from '../components/features/QualityTrendChart.vue';
import BatchComparisonRadar from '../components/features/BatchComparisonRadar.vue';
import RiskFactorChart from '../components/features/RiskFactorChart.vue';

// 引入数据存储
import { useIQEStore } from '../stores';

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

// AI分析相关
const analysisDialogVisible = ref(false);
const analysisLoading = ref(false);
const activeAnalysis = ref(null);

const analysisForm = reactive({
  mode: 'select',
  testId: '',
  materialCode: '',
  batchId: '',
  testItem: '',
  dataFile: null,
  focusAreas: ['stability', 'outliers', 'recommendation']
});

const recentLabTests = computed(() => {
  return filteredLabTests.value.slice(0, 10);
});

// 显示分析选项对话框
function showAnalysisOptions() {
  analysisDialogVisible.value = true;
}

// 处理文件上传
function handleFileChange(file) {
  analysisForm.dataFile = file.raw;
}

// 开始新的分析
function startNewAnalysis() {
  showAnalysisOptions();
}

// 运行AI分析
async function runAiAnalysis() {
  analysisLoading.value = true;
  
  try {
    // 模拟异步分析过程
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (analysisForm.mode === 'select' && analysisForm.testId) {
      // 根据选择的检测ID获取数据
      const selectedTest = filteredLabTests.value.find(test => test.id === analysisForm.testId);
      if (selectedTest) {
        generateAnalysisResults(selectedTest);
      }
    } else if (analysisForm.mode === 'upload' && analysisForm.materialCode && analysisForm.testItem) {
      // 处理上传的数据
      // 这里应该会有实际的文件处理逻辑
      // 为演示创建测试数据
      generateAnalysisResultsFromUpload();
    }
    
    analysisDialogVisible.value = false;
    ElMessage.success('分析完成');
  } catch (error) {
    console.error('AI分析失败', error);
    ElMessage.error('分析过程出错，请重试');
  } finally {
    analysisLoading.value = false;
  }
}

// 根据选择的测试记录生成分析结果
function generateAnalysisResults(test) {
  const qualityScore = Math.floor(Math.random() * 30) + 70; // 70-99之间的随机数
  
  activeAnalysis.value = {
    materialCode: test.materialCode,
    materialName: test.materialName,
    batchId: test.batchId || 'BT-' + test.materialCode,
    testDate: test.testDate,
    testItem: test.testItem,
    qualityScore: qualityScore,
    stabilityScore: Math.floor(Math.random() * 40) + 60,
    consistencyScore: Math.floor(Math.random() * 30) + 70,
    safetyScore: Math.floor(Math.random() * 20) + 80,
    testData: [
      {
        parameter: '抗拉强度',
        value: '450',
        unit: 'MPa',
        standard: '≥420',
        status: 'OK'
      },
      {
        parameter: '屈服强度',
        value: '310',
        unit: 'MPa',
        standard: '≥300',
        status: 'OK'
      },
      {
        parameter: '延伸率',
        value: '18',
        unit: '%',
        standard: '≥20',
        status: 'NG'
      },
      {
        parameter: '硬度',
        value: '65',
        unit: 'HRC',
        standard: '60-70',
        status: 'OK'
      }
    ],
    findings: [
      {
        type: 'positive',
        content: '抗拉强度和屈服强度均达到标准要求，且表现稳定'
      },
      {
        type: 'negative',
        content: '延伸率低于标准要求，可能影响材料韧性'
      },
      {
        type: 'warning',
        content: '相比上批次，硬度数据波动增大，达到±5%'
      }
    ],
    recommendations: [
      {
        title: '热处理参数调整',
        content: '建议将热处理温度范围从940-960°C调整至950-960°C，以提高延伸率'
      },
      {
        title: '增加中间检测点',
        content: '在热处理过程中增加中间点检测，以便及时发现硬度波动问题'
      }
    ]
  };
}

// 根据上传的数据生成分析结果
function generateAnalysisResultsFromUpload() {
  const qualityScore = Math.floor(Math.random() * 30) + 70;
  
  activeAnalysis.value = {
    materialCode: analysisForm.materialCode,
    materialName: '上传数据',
    batchId: analysisForm.batchId || '未知批次',
    testDate: new Date().toLocaleDateString(),
    testItem: analysisForm.testItem,
    qualityScore: qualityScore,
    stabilityScore: Math.floor(Math.random() * 40) + 60,
    consistencyScore: Math.floor(Math.random() * 30) + 70,
    safetyScore: Math.floor(Math.random() * 20) + 80,
    testData: [
      {
        parameter: '参数1',
        value: '值1',
        unit: '单位',
        standard: '标准值',
        status: Math.random() > 0.5 ? 'OK' : 'NG'
      },
      {
        parameter: '参数2',
        value: '值2',
        unit: '单位',
        standard: '标准值',
        status: Math.random() > 0.5 ? 'OK' : 'NG'
      }
    ],
    findings: [
      {
        type: Math.random() > 0.7 ? 'positive' : Math.random() > 0.5 ? 'negative' : 'warning',
        content: '基于上传数据的分析发现1'
      },
      {
        type: Math.random() > 0.7 ? 'positive' : Math.random() > 0.5 ? 'negative' : 'warning',
        content: '基于上传数据的分析发现2'
      }
    ],
    recommendations: [
      {
        title: '针对上传数据的建议1',
        content: '详细建议内容...'
      },
      {
        title: '针对上传数据的建议2',
        content: '详细建议内容...'
      }
    ]
  };
}

// 根据分数获取颜色
function getScoreColor(score) {
  if (score >= 80) return '#67C23A';
  if (score >= 60) return '#E6A23C';
  return '#F56C6C';
}

// 根据质量评分获取类名
function getQualityScoreClass(score) {
  if (score >= 90) return 'score-excellent';
  if (score >= 80) return 'score-good';
  if (score >= 70) return 'score-average';
  if (score >= 60) return 'score-poor';
  return 'score-bad';
}

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

.ai-analysis-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-analysis {
  padding: 20px;
  text-align: center;
}

.active-analysis {
  padding: 10px 0;
}

.inner-card {
  height: 100%;
}

.data-preview {
  margin-bottom: 15px;
}

.data-table-wrapper {
  margin-top: 15px;
}

.ai-score-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.ai-score-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
  color: white;
}

.score-excellent {
  background-color: #67C23A;
}

.score-good {
  background-color: #85ce61;
}

.score-average {
  background-color: #E6A23C;
}

.score-poor {
  background-color: #F56C6C;
}

.score-bad {
  background-color: #ff4949;
}

.score-number {
  font-size: 28px;
  font-weight: bold;
}

.score-label {
  font-size: 12px;
}

.ai-score-detail {
  flex: 1;
}

.score-item {
  margin-bottom: 10px;
}

.score-name {
  margin-bottom: 5px;
  font-weight: bold;
}

.ai-conclusions {
  margin-top: 20px;
}

.finding-list {
  margin: 10px 0;
  padding-left: 0;
  list-style-type: none;
}

.finding-list li {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 5px;
  border-radius: 4px;
  background-color: #f8f8f8;
}

.finding-list li .el-icon {
  margin-right: 8px;
}

.recommendations {
  margin-top: 10px;
}

.recommendation-item {
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 4px;
  background-color: #f0f9eb;
}

.recommendation-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.recommendation-content {
  color: #606266;
  font-size: 14px;
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