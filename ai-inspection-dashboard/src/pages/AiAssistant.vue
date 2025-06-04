<template>
  <div class="ai-assistant-container">
    <h2 class="page-title">IQE智能助手</h2>
    
    <!-- 主布局区域 -->
    <div class="assistant-layout">
      <!-- 左侧：对话区域 -->
      <div class="chat-section">
        <!-- 场景选择卡片 -->
        <div class="scenario-cards">
          <el-radio-group v-model="currentScenario" size="large">
            <el-radio-button label="general">通用助手</el-radio-button>
            <el-radio-button label="factory">库存场景</el-radio-button>
            <el-radio-button label="lab">实验室场景</el-radio-button>
            <el-radio-button label="online">产线场景</el-radio-button>
            <el-radio-button label="supplier">供应商质量助手</el-radio-button>
          </el-radio-group>
        </div>
        
        <!-- 快速提问按钮组 -->
        <div class="quick-questions">
          <el-tag 
            v-for="(question, index) in quickQuestions[currentScenario]" 
            :key="index"
            @click="askQuickQuestion(question)" 
            class="quick-question-tag"
            :type="index % 4 === 0 ? '' : index % 4 === 1 ? 'success' : index % 4 === 2 ? 'warning' : 'danger'"
            effect="plain"
          >
            {{ question }}
          </el-tag>
        </div>
        
        <!-- 智能对话窗口 -->
        <ChatWindow 
          ref="chatRef"
          class="chat-window"
          :welcome-message="getWelcomeMessage(currentScenario)"
          :context-memory="true"
          :max-context-messages="10"
          @send-message="handleSendMessage"
          @speech-start="handleSpeechStart"
          @speech-end="handleSpeechEnd"
          @image-upload="handleImageUpload"
        />
      </div>
      
      <!-- 右侧：功能面板区域 -->
      <div class="features-section">
        <el-tabs v-model="activeFeatureTab" class="feature-tabs">
          <el-tab-pane label="AI分析" name="insights">
            <div v-if="selectedMaterial" class="insight-panel-container">
              <div class="material-info-header">
                <div class="material-details">
                  <h3>{{ selectedMaterial.name }} ({{ selectedMaterial.code }})</h3>
                  <div class="material-tags">
                    <el-tag size="small">{{ selectedMaterial.type }}</el-tag>
                    <el-tag size="small" type="info">供应商: {{ selectedMaterial.supplier }}</el-tag>
                    <el-tag 
                      size="small" 
                      :type="getRiskLevelType(selectedMaterial.riskLevel)"
                    >
                      风险等级: {{ selectedMaterial.riskLevel }}
                    </el-tag>
                  </div>
                </div>
                <el-button type="primary" size="small" @click="openMaterialSelector">
                  更换物料
                </el-button>
              </div>
              
              <AIInsightsPanel
                :material-code="selectedMaterial.code"
                :material-data="selectedMaterial"
                :auto-refresh="false"
                @insight-loaded="handleInsightLoaded"
                @action-triggered="handleInsightAction"
                @error="handleInsightError"
              />
            </div>
            <div v-else class="no-material-selected">
              <el-empty description="请选择物料进行AI分析">
                <el-button type="primary" @click="openMaterialSelector">选择物料</el-button>
              </el-empty>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="推荐操作" name="actions">
            <div class="actions-container">
              <h3>基于当前对话的推荐操作</h3>
              <el-empty v-if="!currentQuestion && recommendedActions.length === 0" description="对话后将显示推荐操作" />
              <div v-else class="action-cards">
                <el-card 
                  v-for="(action, index) in recommendedActions" 
                  :key="index"
                  class="action-card"
                  shadow="hover"
                  @click="simulateAction(action)"
                >
                  <template #header>
                    <div class="action-header">
                      <el-icon :class="action.icon"><component :is="action.icon" /></el-icon>
                      <span>{{ action.title }}</span>
                    </div>
                  </template>
                  <div class="action-content">
                    {{ action.description }}
                  </div>
                </el-card>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="图表生成" name="chart">
            <ChartGenerator 
              ref="chartGeneratorRef"
              v-show="showChartGenerator" 
              height="400px"
              @chart-updated="handleChartUpdate"
            />
            <el-empty 
              v-show="!showChartGenerator" 
              description="请在对话中提及'图表'、'趋势'等关键词来激活图表功能"
            >
              <el-button @click="showChartGenerator = true">打开图表生成器</el-button>
            </el-empty>
          </el-tab-pane>
          
          <el-tab-pane label="图像分析" name="image">
            <ImageAnalysis 
              ref="imageAnalysisRef"
              v-show="showImageAnalysis" 
              @analysis-complete="handleAnalysisComplete"
              @report-generated="handleReportGenerated"
            />
            <el-empty 
              v-show="!showImageAnalysis" 
              description="请在对话中提及'图像分析'或上传图片来激活该功能"
            >
              <el-button @click="showImageAnalysis = true">打开图像分析工具</el-button>
            </el-empty>
          </el-tab-pane>
          
          <el-tab-pane label="语音设置" name="speech">
            <SpeechControl 
              ref="speechControlRef"
              v-show="showSpeechSettings" 
              @speech-start="handleSpeechControllerStart"
              @speech-end="handleSpeechControllerEnd"
            />
            <el-empty 
              v-show="!showSpeechSettings" 
              description="请在对话中提及'语音'或点击聊天窗口中的语音按钮来激活该功能"
            >
              <el-button @click="showSpeechSettings = true">打开语音设置</el-button>
            </el-empty>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    
    <!-- 物料选择对话框 -->
    <el-dialog
      v-model="showMaterialDialog"
      title="选择物料进行AI分析"
      width="60%"
    >
      <el-form :inline="true" class="material-search-form">
        <el-form-item label="物料编码">
          <el-input v-model="materialSearch.code" placeholder="输入物料编码" clearable />
        </el-form-item>
        <el-form-item label="物料名称">
          <el-input v-model="materialSearch.name" placeholder="输入物料名称" clearable />
        </el-form-item>
        <el-form-item label="供应商">
          <el-select v-model="materialSearch.supplier" placeholder="选择供应商" clearable>
            <el-option label="全部" value="" />
            <el-option label="金盾" value="金盾" />
            <el-option label="易湛" value="易湛" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchMaterials">搜索</el-button>
          <el-button @click="resetMaterialSearch">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="filteredMaterials" style="width: 100%" @row-click="selectMaterial" highlight-current-row>
        <el-table-column prop="code" label="物料编码" width="150" />
        <el-table-column prop="name" label="物料名称" width="200" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="supplier" label="供应商" width="120" />
        <el-table-column prop="lastInspection" label="最近检验日期" width="180" />
        <el-table-column prop="riskLevel" label="风险等级">
          <template #default="scope">
            <el-tag :type="getRiskLevelType(scope.row.riskLevel)">
              {{ scope.row.riskLevel }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showMaterialDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmMaterialSelection" :disabled="!selectedMaterial">
            确认选择
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.ai-assistant-container {
  padding: 20px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.page-title {
  margin-bottom: 20px;
  color: #303133;
  font-size: 24px;
}

.assistant-layout {
  display: flex;
  flex: 1;
  gap: 20px;
  height: calc(100% - 50px);
  overflow: hidden;
}

.chat-section {
  flex: 3;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.features-section {
  flex: 2;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.scenario-cards {
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
}

.quick-questions {
  margin-bottom: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.quick-question-tag {
  cursor: pointer;
  user-select: none;
  transition: all 0.3s;
  font-size: 12px;
}

.quick-question-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chat-window {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.feature-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.feature-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow: auto;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 0 0 8px 8px;
}

.feature-tabs :deep(.el-tab-pane) {
  height: 100%;
}

.insight-panel-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.material-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 15px 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 15px;
}

.material-details h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
}

.material-tags {
  display: flex;
  gap: 8px;
}

.no-material-selected {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.material-search-form {
  margin-bottom: 20px;
}

.actions-container {
  height: 100%;
}

.action-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.action-card {
  cursor: pointer;
  transition: all 0.3s;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.action-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
}

.action-header .el-icon {
  margin-right: 8px;
  font-size: 18px;
}

.action-content {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}
</style>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

// 在script setup部分引入新组件
import SpeechControl from '../components/features/SpeechControl.vue';
import ImageAnalysis from '../components/features/ImageAnalysis.vue';
import ChartGenerator from '../components/features/ChartGenerator.vue';
import PredictiveAnalysis from '../components/features/PredictiveAnalysis.vue';
import ChatWindow from '../components/chat/ChatWindow.vue';
import AIInsightsPanel from '../components/features/AIInsightsPanel.vue';

// 引入AI连接器服务
import { aiConnectorService } from '../services/aiConnectorService';
import AIServiceInitializer from '../services/AIServiceInitializer';

// 引入router用于跨页面导航
const router = useRouter();

// 当前场景
const currentScenario = ref('general');

// 特性选项卡
const activeFeatureTab = ref('insights'); // 默认显示AI分析面板

// AI能力指示器
const aiCapabilities = reactive({
  nlp: true,             // 自然语言处理
  visualization: true,   // 数据可视化
  vision: true,          // 计算机视觉
  predictive: true,      // 预测分析
  integration: true      // 系统集成
});

// 页面数据
const totalSamples = ref(1280);
const passRate = ref(96.5);
const inspectionCategories = ref(['电气参数', '物理特性', '可靠性', '功能测试', '外观检查']);

// IQE异常和检测数据 - 根据用户提供的结构新增
const productionAnomalies = ref([
  { 
    date: '2025/05/26',
    project: 'X6725B',
    projectPhase: '量产',
    componentType: '结构件',
    anomalyType: '可靠性',
    urgencyLevel: '返工生产',
    responsibleFactory: '南昌工厂',
    location: 'IQC',
    materialCode: '37301062',
    materialName: '电池盖',
    description: '装卸100次后针变形（标准500次），不良率2/3',
    supplier: '金盾',
    responsibility: '来料',
    riskLevel: 'B'
  },
  { 
    date: '2025/05/25',
    project: 'X6725B',
    projectPhase: '量产',
    componentType: '包材',
    anomalyType: '外观',
    urgencyLevel: '克服生产',
    responsibleFactory: '泰衡诺工厂',
    location: '产线',
    materialCode: '38501375',
    materialName: '保护膜',
    description: '酒精耐磨500g×25次掉漆油墨',
    supplier: '易湛',
    responsibility: '来料',
    riskLevel: 'C'
  }
]);

// 实验室检测数据
const labTestResults = ref([
  {
    testDate: '2025/05/26',
    testSource: '深圳实验室来料例行测试',
    project: 'X6725',
    materialCode: '38501375',
    materialName: '保护膜（全包膜）',
    testItem: '酒精耐磨 500g × 25次掉漆油墨',
    result: 'NG',
    badBatch: '#03, #04',
    defectRate: '2/2（100%）',
    supplier: '易湛',
    responsibility: '来料',
    recommendation: '整批物料标记为不合格，建议暂停上线使用',
    remarks: '与生产端返工记录匹配（见2025/05/26记录）'
  },
  {
    testDate: '2025/05/24',
    testSource: '南昌实验室来料检测',
    project: 'X6725',
    materialCode: '37301062',
    materialName: '电池盖',
    testItem: '连续开合耐久性测试 500次',
    result: 'NG',
    badBatch: '#A22, #A23',
    defectRate: '2/3（66.7%）',
    supplier: '金盾',
    responsibility: '来料',
    recommendation: '返工处理，增加抽检比例',
    remarks: '与上月同批次问题相似，建议供应商改进工艺'
  }
]);

// 用于跟踪系统全局状态的标志
const systemAlerts = ref({
  criticalAlerts: 2,
  pendingReviews: 7,
  lastRefreshTime: new Date().toLocaleString()
});

// 快速提问问题库 - 优化为更具体的IQE相关问题
const quickQuestions = reactive({
  general: [
    '分析最近一周的质量趋势',
    '识别最常见的缺陷类型',
    '哪些物料需要加强检验?',
    '生成月度质量报告'
  ],
  factory: [
    '南昌工厂返工率趋势如何?',
    '金盾供应商的材料合格率',
    '分析电池盖变形原因',
    '推荐结构件检验标准'
  ],
  lab: [
    '分析X6725B可靠性问题',
    '易湛耐磨不良统计汇总',
    '对比不同批次电池盖质量',
    '生成测试偏差报告'
  ],
  online: [
    '预测下批次保护膜良率',
    '物料#38501375缺陷趋势',
    'C级风险物料清单',
    '推荐产线质量改进方案'
  ],
  supplier: [
    '评估易湛供应商质量等级',
    '金盾供应商质量趋势分析',
    '供应商质量排名前5',
    '供应商来料不良TOP5'
  ]
});

// 根据场景获取欢迎消息 - 优化为更专业的IQE相关内容
function getWelcomeMessage(scenario) {
  switch(scenario) {
    case 'factory':
      return '您好，我是IQE工厂质检助手。我可以帮助您分析物料异常数据，评估供应商质量，追踪返工记录，以及生成针对性的物料质量报告。最近"电池盖（料号37301062）"出现可靠性问题，您需要了解相关情况吗？';
    case 'lab':
      return '您好，我是IQE实验室助手。我可以帮助您分析测试数据，比对检验批次，评估测试标准，以及生成测试报告。最近"保护膜（料号38501375）"酒精耐磨测试100%不良，我可以提供详细分析。';
    case 'online':
      return '您好，我是IQE产线助手。我可以帮助您分析在线生产数据，识别缺陷模式，追踪批次质量，以及预测潜在风险。目前有2个C级质量风险需要关注，需要我列出详情吗？';
    case 'supplier':
      return '您好，我是IQE供应商质量助手。我可以帮助您评估供应商质量表现，分析质量趋势，识别高风险供应商，以及生成供应商质量报告。目前"易湛"供应商被评为C级(高风险)，需要我提供详细分析吗？';
    default:
      return '您好，我是IQE智能助手，有什么可以帮您？\n\n根据最新数据，我发现：\n- 易湛供应商保护膜存在严重质量问题（100%不良率）\n- 电池盖耐久性测试未达标准（66.7%不良率）\n- 南昌工厂返工率上升5.2%\n\n您想了解哪方面的详细信息？';
  }
}

// 推荐操作 - 基于真实IQE数据重新设计
const recommendedActions = computed(() => {
  // 根据当前问题生成推荐操作
  if (!currentQuestion.value) return [];
  
  const baseActions = [
    {
      icon: 'el-icon-warning',
      title: '生成异常物料报告',
      description: '基于最近一周的异常记录，生成物料质量分析报告',
      action: 'generateReport'
    },
    {
      icon: 'el-icon-pie-chart',
      title: '检测结果分析',
      description: '对比近期实验室检测结果，识别潜在风险模式',
      action: 'analyzeTestResults'
    }
  ];
  
  // 根据场景和当前问题内容动态添加特定操作
  const questionLower = currentQuestion.value.toLowerCase();
  
  // 材料相关关键词的操作
  if (questionLower.includes('保护膜') || questionLower.includes('38501375')) {
    return [
      {
        icon: 'el-icon-document',
        title: '保护膜质量分析',
        description: '分析料号38501375的历史质量数据和测试结果',
        action: 'analyzeMaterial',
        params: { materialCode: '38501375' }
      },
      {
        icon: 'el-icon-warning',
        title: '供应商易湛评估',
        description: '查看易湛供应商最近6个月的质量表现和异常记录',
        action: 'analyzeSupplier',
        params: { supplierCode: 'SUP002' }
      },
      {
        icon: 'el-icon-data-line',
        title: '生成检测方案',
        description: '为下批次保护膜生成强化检验方案',
        action: 'generateInspectionPlan',
        params: { materialCode: '38501375', riskLevel: 'high' }
      },
      {
        icon: 'el-icon-trend-charts',
        title: '预测质量趋势',
        description: '使用AI模型预测未来30天内的质量趋势',
        action: 'predictQualityTrend',
        params: { materialCode: '38501375', days: 30 }
      }
    ];
  }
  
  // 电池盖相关
  if (questionLower.includes('电池盖') || questionLower.includes('37301062')) {
    return [
      {
        icon: 'el-icon-document',
        title: '电池盖可靠性分析',
        description: '分析料号37301062的耐久性测试数据',
        action: 'analyzeMaterial',
        params: { materialCode: '37301062' }
      },
      {
        icon: 'el-icon-video-camera',
        title: '查看失效视频',
        description: '观看电池盖变形失效的测试记录视频',
        action: 'viewFailureVideo',
        params: { materialCode: '37301062', testType: 'reliability' }
      },
      {
        icon: 'el-icon-s-cooperation',
        title: '工艺改进建议',
        description: '基于历史数据，推荐供应商金盾的工艺改进方向',
        action: 'generateImprovementPlan',
        params: { materialCode: '37301062', supplierCode: 'SUP001' }
      },
      {
        icon: 'el-icon-connection',
        title: '集成数据分析',
        description: '整合实验室、生产线和质量数据进行全面分析',
        action: 'integratedAnalysis',
        params: { materialCode: '37301062' }
      }
    ];
  }
  
  // 供应商分析相关
  if (questionLower.includes('供应商') || questionLower.includes('评估')) {
    const isYiZhan = questionLower.includes('易湛');
    const isJinDun = questionLower.includes('金盾');
    
    return [
      {
        icon: 'el-icon-user',
        title: `${isYiZhan ? '易湛' : isJinDun ? '金盾' : '供应商'}质量评估`,
        description: `分析${isYiZhan ? '易湛' : isJinDun ? '金盾' : '所有'}供应商的质量表现`,
        action: 'analyzeSupplier',
        params: { 
          supplierCode: isYiZhan ? 'SUP002' : isJinDun ? 'SUP001' : 'all'
        }
      },
      {
        icon: 'el-icon-data-analysis',
        title: '供应商质量趋势',
        description: '分析供应商近6个月质量分数变化趋势',
        action: 'analyzeSupplierTrend',
        params: { 
          supplierCode: isYiZhan ? 'SUP002' : isJinDun ? 'SUP001' : 'all'
        }
      },
      {
        icon: 'el-icon-document-checked',
        title: '供应商审核计划',
        description: '生成供应商质量审核计划',
        action: 'generateAuditPlan',
        params: { 
          supplierCode: isYiZhan ? 'SUP002' : isJinDun ? 'SUP001' : 'all',
          priority: isYiZhan ? 'high' : isJinDun ? 'medium' : 'normal'
        }
      }
    ];
  }
  
  // 预测分析相关
  if (questionLower.includes('预测') || questionLower.includes('趋势')) {
    showPredictiveAnalysis.value = true;
    activeFeatureTab.value = 'prediction';
    
    return [
      {
        icon: 'el-icon-trend-charts',
        title: '质量趋势预测',
        description: '使用AI预测未来30天的质量趋势',
        action: 'predictQualityTrend',
        params: { days: 30 }
      },
      {
        icon: 'el-icon-warning',
        title: '风险物料预警',
        description: '识别未来可能出现质量问题的高风险物料',
        action: 'predictRiskMaterials'
      },
      {
        icon: 'el-icon-document',
        title: '生成预测报告',
        description: '生成详细的AI预测分析报告',
        action: 'generatePredictionReport'
      }
    ];
  }
  
  // 根据场景添加特定操作
  switch(currentScenario.value) {
    case 'factory':
      return [
        ...baseActions,
        {
          icon: 'el-icon-reading',
          title: '返工流程优化',
          description: '分析返工生产流程并提供优化建议',
          action: 'optimizeReworkProcess'
        },
        {
          icon: 'el-icon-receiving',
          title: '来料质检计划',
          description: '生成针对高风险供应商的强化IQC计划',
          action: 'generateInspectionPlan',
          params: { target: 'incoming' }
        }
      ];
    case 'lab':
      return [
        ...baseActions,
        {
          icon: 'el-icon-coordinate',
          title: '测试标准调整',
          description: '根据近期不良趋势，推荐测试标准调整',
          action: 'optimizeTestStandards'
        },
        {
          icon: 'el-icon-finished',
          title: '批次质量预测',
          description: '基于历史数据预测即将到货批次的质量风险',
          action: 'predictBatchQuality'
        }
      ];
    case 'online':
      return [
        ...baseActions,
        {
          icon: 'el-icon-alarm-clock',
          title: '质量预警配置',
          description: '设置基于AI的实时质量异常预警规则',
          action: 'configureQualityAlerts'
        },
        {
          icon: 'el-icon-set-up',
          title: '产线参数优化',
          description: '根据质量数据推荐生产线参数调整',
          action: 'optimizeProductionParams'
        }
      ];
    case 'supplier':
      return [
        ...baseActions,
        {
          icon: 'el-icon-user',
          title: '供应商评级',
          description: '生成供应商质量等级评估报告',
          action: 'rateSuppliers'
        },
        {
          icon: 'el-icon-document-checked',
          title: '供应商质量改进计划',
          description: '为高风险供应商生成质量改进计划',
          action: 'generateSupplierImprovementPlan'
        }
      ];
    default:
      return baseActions;
  }
});

// 组件引用
const chatRef = ref(null);
const speechControlRef = ref(null);
const imageAnalysisRef = ref(null);
const chartGeneratorRef = ref(null);
const showSpeechSettings = ref(false);
const showImageAnalysis = ref(false);
const showChartGenerator = ref(false);
const showPredictiveAnalysis = ref(false);
const currentQuestion = ref('');

// 物料相关状态
const showMaterialDialog = ref(false);
const selectedMaterial = ref(null);
const materialSearch = reactive({
  code: '',
  name: '',
  supplier: ''
});

// 模拟物料数据
const materials = ref([
  {
    code: '37301062',
    name: '电池盖',
    type: '结构件',
    supplier: '金盾',
    lastInspection: '2025/05/24',
    riskLevel: 'B',
    defectRate: 0.25,
    factoryData: { /* 工厂相关数据 */ },
    labData: { /* 实验室相关数据 */ }
  },
  {
    code: '38501375',
    name: '保护膜',
    type: '包材',
    supplier: '易湛',
    lastInspection: '2025/05/26',
    riskLevel: 'C',
    defectRate: 0.65,
    factoryData: { /* 工厂相关数据 */ },
    labData: { /* 实验室相关数据 */ }
  },
  {
    code: '37402185',
    name: '屏幕组件',
    type: '电子元件',
    supplier: '盛达',
    lastInspection: '2025/05/22',
    riskLevel: 'A',
    defectRate: 0.05,
    factoryData: { /* 工厂相关数据 */ },
    labData: { /* 实验室相关数据 */ }
  }
]);

// 过滤后的物料列表
const filteredMaterials = computed(() => {
  return materials.value.filter(material => {
    const codeMatch = !materialSearch.code || material.code.includes(materialSearch.code);
    const nameMatch = !materialSearch.name || material.name.includes(materialSearch.name);
    const supplierMatch = !materialSearch.supplier || material.supplier === materialSearch.supplier;
    return codeMatch && nameMatch && supplierMatch;
  });
});

// 获取风险等级类型
function getRiskLevelType(level) {
  switch (level) {
    case 'A':
      return 'success';
    case 'B':
      return 'warning';
    case 'C':
      return 'danger';
    default:
      return 'info';
  }
}

// 搜索物料
function searchMaterials() {
  // 使用计算属性filteredMaterials自动过滤
  console.log('搜索物料，当前条件:', materialSearch);
}

// 重置搜索条件
function resetMaterialSearch() {
  materialSearch.code = '';
  materialSearch.name = '';
  materialSearch.supplier = '';
}

// 选择物料
function selectMaterial(row) {
  selectedMaterial.value = row;
}

// 确认物料选择
function confirmMaterialSelection() {
  if (selectedMaterial.value) {
    showMaterialDialog.value = false;
    activeFeatureTab.value = 'insights';
    ElMessage.success(`已选择物料: ${selectedMaterial.value.name} (${selectedMaterial.value.code})`);
  }
}

// 添加语音开始和结束事件处理程序
function handleSpeechStart(text) {
  if (speechControlRef.value) {
    speechControlRef.value.speakText(text);
  }
}

function handleSpeechEnd(transcript) {
  currentQuestion.value = transcript;
  
  if (chatRef.value) {
    chatRef.value.addUserMessage(transcript);
    chatRef.value.addBotMessage(`已收到您的语音消息: "${transcript}"`);
  }
}

function handleSpeechControllerStart() {
  if (chatRef.value) {
    chatRef.value.startSpeechRecognition();
  }
}

function handleSpeechControllerEnd() {
  if (chatRef.value) {
    chatRef.value.stopSpeechRecognition();
  }
}

// 处理对话消息发送 - 增强对IQE数据的理解和回复能力
async function handleSendMessage(message, contextHistory, resolve) {
  // 更新当前问题，用于推荐操作
  currentQuestion.value = message;
  
  // 识别导航意图
  const navigationIntents = checkNavigationIntents(message);
  if (navigationIntents) {
    resolve({
      type: 'text',
      content: `正在为您导航至${navigationIntents.name}页面，请稍候...`
    });
    
    setTimeout(() => {
      router.push(navigationIntents.path);
    }, 1000);
    
    return;
  }
  
  // 根据消息内容激活相应功能
  if (message.toLowerCase().includes('图表') || 
      message.toLowerCase().includes('趋势') || 
      message.toLowerCase().includes('统计')) {
    showChartGenerator.value = true;
    activeFeatureTab.value = 'chart';
    
    // 延迟一下再生成图表，模拟AI处理
    setTimeout(() => {
      if (chatRef.value) {
        chatRef.value.addBotMessage('正在生成相关数据图表...');
      }
      
      // 根据问题内容生成相应图表
      generateChartBasedOnQuestion(message);
    }, 1000);
  }
  
  if (message.toLowerCase().includes('图像') || 
      message.toLowerCase().includes('照片') || 
      message.toLowerCase().includes('视觉')) {
    showImageAnalysis.value = true;
    activeFeatureTab.value = 'image';
  }
  
  if (message.toLowerCase().includes('预测') || 
      message.toLowerCase().includes('分析趋势') || 
      message.toLowerCase().includes('预估')) {
    showPredictiveAnalysis.value = true;
    activeFeatureTab.value = 'prediction';
  }
  
  // 模拟AI响应延迟
  setTimeout(() => {
    let response = '';
    const messageLower = message.toLowerCase();
    
    // 材料异常相关查询
    if (messageLower.includes('保护膜') || messageLower.includes('38501375')) {
      showImageAnalysis.value = true;
      activeFeatureTab.value = 'image';
      
      const materialData = labTestResults.value.find(item => item.materialCode === '38501375');
      
      response = {
        type: 'text',
        content: `## 料号38501375保护膜分析结果\n\n**检测日期**: ${materialData.testDate}\n**检测项目**: ${materialData.testItem}\n**批次**: ${materialData.badBatch}\n**不良率**: ${materialData.defectRate}\n\n**问题分析**:\n保护膜出现严重耐磨性不足问题，酒精测试下100%批次出现掉漆现象。根据历史记录，该供应商"易湛"在过去3个月内有2次类似异常记录。\n\n**建议措施**:\n1. 立即暂停该批次物料使用\n2. 对供应商发出质量预警\n3. 要求供应商提供整改方案\n4. 在图片分析面板中可查看材料缺陷详情`
      };
    } else if (messageLower.includes('电池盖') || messageLower.includes('37301062')) {
      showChartGenerator.value = true;
      activeFeatureTab.value = 'chart';
      
      response = {
        type: 'text',
        content: `## 料号37301062电池盖分析结果\n\n**异常描述**: 装卸100次后针变形（标准500次），不良率66.7%\n**发生位置**: 南昌工厂IQC\n**供应商**: 金盾\n\n**趋势分析**:\n该问题与上月同批次相似，显示供应商工艺存在稳定性问题。右侧图表面板展示了该物料近6个月的质量趋势，可见5月份开始异常率明显上升。\n\n**根本原因分析**:\n1. 模具磨损导致精度下降\n2. 原材料批次变更未经充分验证\n3. 供应商生产参数偏移\n\n**建议对策**:\n1. 要求供应商调整模具参数\n2. 增加来料抽检比例至8%\n3. 对库存批次进行100%复检`
      };
    } else if (messageLower.includes('分析') && (messageLower.includes('质量') || messageLower.includes('趋势'))) {
      // 显示图表分析
      showChartGenerator.value = true;
      activeFeatureTab.value = 'chart';
      response = {
        type: 'text',
        content: `## IQE质量趋势分析\n\n根据过去30天的检验数据分析：\n\n### 主要发现\n1. **来料质量问题**占异常总数的68%，较上月增加12%\n2. **结构件类**材料不良率最高，达8.5%\n3. **南昌工厂**返工率最高，达4.2%\n4. **易湛**和**金盾**两家供应商贡献了56%的质量异常\n\n### 风险预警\n- C级风险物料：保护膜(38501375)，建议100%检验\n- B级风险物料：电池盖(37301062)，建议提升抽检比例\n\n您可以在右侧图表面板中查看详细的趋势变化。`
      };
    } else if (messageLower.includes('供应商') && (messageLower.includes('易湛') || messageLower.includes('金盾'))) {
      // 供应商分析
      showChartGenerator.value = true;
      activeFeatureTab.value = 'chart';
      
      const supplier = messageLower.includes('易湛') ? '易湛' : '金盾';
      
      response = {
        type: 'text',
        content: `## ${supplier}供应商质量分析报告\n\n**供应商等级**: ${supplier === '易湛' ? 'C级(高风险)' : 'B级(中风险)'}\n**近3个月合格率**: ${supplier === '易湛' ? '86.4%' : '91.2%'}\n**主要问题类型**: ${supplier === '易湛' ? '外观不良、耐磨性不足' : '结构强度不足、尺寸偏差'}\n\n**异常批次记录**:\n${supplier === '易湛' ? '- 2025/05/25: 保护膜(38501375)掉漆\n- 2025/04/12: 标签(38402156)褪色\n- 2025/03/22: 包装盒(38904532)异味' : '- 2025/05/26: 电池盖(37301062)变形\n- 2025/04/28: 按键(37208631)卡顿\n- 2025/03/05: 卡托(37108952)断裂'}\n\n**改进建议**:\n1. ${supplier === '易湛' ? '要求提供油墨供应商变更说明' : '建议调整模具参数和注塑温度'}\n2. ${supplier === '易湛' ? '增加UV老化测试项目' : '增加疲劳测试循环次数'}\n3. 安排质量工程师现场辅导\n\n右侧图表展示了该供应商过去6个月的质量趋势。`
      };
    } else if (messageLower.includes('生成') && messageLower.includes('检测方案')) {
      // 检测方案生成
      response = {
        type: 'text',
        content: `## 智能检验方案\n\n基于历史数据和当前质量状态，我为您生成了优化检验方案：\n\n### 高风险物料检验方案\n- **保护膜(38501375)**:\n  - IQC抽检比例: 100%\n  - 重点检测项: 酒精耐磨测试(500g×50次)，UV老化测试(48h)\n  - 检验频率: 每批次\n  - 特别要求: 供应商提供出厂检验报告，增加老化测试\n\n### 中风险物料检验方案\n- **电池盖(37301062)**:\n  - IQC抽检比例: 8% (标准2%)\n  - 重点检测项: 连续开合测试(标准提升至800次)\n  - 检验频率: 每批次\n  - 特别要求: 供应商提供原材料检验证明\n\n### 一般物料检验方案\n- 维持标准检验流程，抽检比例2%\n- 重点关注新批次物料\n\n**有效期**: 2025/06/01 - 2025/07/01`
      };
    } else if (messageLower.includes('图表') || messageLower.includes('chart')) {
      // 图表类型消息
      showChartGenerator.value = true;
      activeFeatureTab.value = 'chart';
      response = {
        type: 'text',
        content: '我已为您准备了图表生成工具，您可以在右侧面板中创建和编辑图表来分析质量数据趋势。建议您关注"来料质量趋势"和"供应商不良率对比"两个关键指标。'
      };
    } else if (messageLower.includes('图片') || messageLower.includes('图像分析')) {
      // 图像分析相关消息
      showImageAnalysis.value = true;
      activeFeatureTab.value = 'image';
      response = {
        type: 'text',
        content: '我已为您打开图像分析工具，您可以上传物料图片进行缺陷检测。系统支持分析结构件表面缺陷、印刷品质量问题和组装偏差等多种缺陷类型。'
      };
    } else if (messageLower.includes('语音') || messageLower.includes('朗读')) {
      // 语音相关消息
      showSpeechSettings.value = true;
      activeFeatureTab.value = 'speech';
      response = {
        type: 'text',
        content: '语音控制面板已打开，您可以调整语音设置或使用语音输入。语音识别已针对IQE常用术语进行优化，支持识别物料代码、供应商名称和质量术语。'
      };
    } else {
      // 默认回复
      response = {
        type: 'text',
        content: `您好，我是IQE智能助手。我注意到您询问的是"${message}"，以下是我可以协助的内容：\n\n1. **物料质量分析**：查询并分析特定物料代码的质量历史和当前状态\n2. **供应商评估**：评估供应商质量表现并生成风险评级\n3. **异常分析**：分析质量异常原因并提供处理建议\n4. **检验方案**：生成基于风险的智能检验方案\n\n您可以尝试询问特定材料(如"分析电池盖质量问题")、供应商(如"评估易湛供应商")或生成特定报告(如"生成检测方案")。`
      };
    }
    
    resolve(response);
  }, 1000);
}

// 检查导航意图
function checkNavigationIntents(message) {
  const messageLower = message.toLowerCase();
  
  // 检验结果页面导航
  if ((messageLower.includes('实验室') && messageLower.includes('数据')) || 
      messageLower.includes('检测结果') || 
      messageLower.includes('lab view') ||
      messageLower.includes('测试结果')) {
    return { name: '实验室检测分析', path: '/lab-view' };
  }
  
  // 监控面板导航
  if (messageLower.includes('监控') || 
      messageLower.includes('仪表板') || 
      messageLower.includes('dashboard') ||
      messageLower.includes('总览')) {
    return { name: '质量监控仪表板', path: '/monitoring-dashboard' };
  }
  
  // 其他导航意图可以继续添加...
  
  return null;
}

// 集成实验室数据分析
function analyzeLabData(materialCode) {
  const testResults = labTestResults.value.filter(item => item.materialCode === materialCode);
  if (testResults.length === 0) return null;
  
  return {
    totalTests: testResults.length,
    latestResult: testResults[0],
    hasCriticalIssues: testResults.some(test => test.result === 'NG'),
    recommendation: testResults.some(test => test.result === 'NG') ? 
      '建议增加检验频率并通知供应商' : '维持正常检验流程'
  };
}

// 导出数据到其他模块
function exportDataToModule(moduleId, data) {
  sessionStorage.setItem(`iqe_data_${moduleId}`, JSON.stringify(data));
  ElMessage.success('数据已准备好，可在目标页面查看');
}

// 处理图表更新
function handleChartUpdate(chartData) {
  console.log('图表已更新', chartData);
}

// 处理分析完成
function handleAnalysisComplete(results) {
  console.log('分析完成', results);
  if (chatRef.value) {
    chatRef.value.addMessage('system', `系统检测到${results.defects.length}个缺陷，整体质量评估: ${results.overallQuality === 'pass' ? '合格' : '不合格'}`, 'text');
  }
}

// 处理报告生成
function handleReportGenerated(report) {
  console.log('报告已生成', report);
  ElMessage.success('分析报告已生成');
  if (chatRef.value) {
    chatRef.value.addMessage('system', `质量分析报告已生成 (${new Date().toLocaleString()})`, 'text');
  }
}

// 处理图片上传
function handleImageUpload(imageData) {
  showImageAnalysis.value = true;
  activeFeatureTab.value = 'image';
  ElMessage.success('图片已上传，可以在右侧面板进行分析');
}

// 打开设置对话框
function openSpeechSettings() {
  showSpeechSettings.value = true;
  activeFeatureTab.value = 'speech';
}

// 处理快速提问
function askQuickQuestion(question) {
  if (chatRef.value) {
    currentQuestion.value = question;
    // 使用nextTick确保DOM更新后执行
    nextTick(() => {
      if (chatRef.value) {
        chatRef.value.addMessage('user', question, 'text');
        
        // 模拟AI回复
        setTimeout(() => {
          const loadingIndex = chatRef.value.messages.length;
          chatRef.value.addMessage('assistant', '', 'loading');
          
          setTimeout(() => {
            // 移除加载消息
            chatRef.value.messages.splice(loadingIndex, 1);
            
            // 添加回复
            handleSendMessage(question, [], (response) => {
              if (typeof response === 'string') {
                chatRef.value.addMessage('assistant', response, 'text');
              } else {
                chatRef.value.addMessage('assistant', response.content, response.type || 'text', {
                  ...(response.type === 'chart' && { chartData: response.chartData, chartTitle: response.title }),
                  ...(response.type === 'image' && { alt: response.alt, caption: response.caption })
                });
              }
            });
          }, 1500);
        }, 100);
      }
    });
  }
}

// 模拟执行推荐操作
async function simulateAction(action) {
  if (action.action === 'analyzeMaterial' || action.action === 'generateInspectionPlan') {
    openMaterialSelector();
    return;
  }
  
  // 其他原有的操作逻辑
  console.log(`执行操作: ${action.title}`, action);
  ElMessage.success(`正在${action.title}，请稍候...`);
  
  // 根据操作类型执行相应的模拟动作
  if (action.action === 'generateReport') {
    activeFeatureTab.value = 'chart';
    showChartGenerator.value = true;
    nextTick(() => {
      chartGeneratorRef.value && chartGeneratorRef.value.generateRandomChart('bar');
    });
  } else if (action.action === 'analyzeTestResults') {
    activeFeatureTab.value = 'chart';
    showChartGenerator.value = true;
    nextTick(() => {
      chartGeneratorRef.value && chartGeneratorRef.value.generateRandomChart('line');
    });
  }
  
  // 将对话中提及的物料设置为选中状态
  if (action.params && action.params.materialCode) {
    const material = materials.value.find(m => m.code === action.params.materialCode);
    if (material) {
      selectedMaterial.value = material;
      if (['analyzeMaterial', 'generateInspectionPlan', 'predictQualityTrend'].includes(action.action)) {
        activeFeatureTab.value = 'insights';
      }
    }
  }
}

// 打开物料选择对话框
function openMaterialSelector() {
  showMaterialDialog.value = true;
}

// 处理AI洞察加载完成
function handleInsightLoaded(data) {
  console.log('AI分析结果加载完成:', data);
  // 这里可以根据分析结果更新界面或推荐操作
}

// 处理AI洞察操作触发
function handleInsightAction(action) {
  console.log('AI分析操作触发:', action);
  
  // 根据不同的操作类型执行相应的处理
  if (action.type === 'risk') {
    if (action.action.type === 'applyStrategy') {
      ElMessage.success('已应用风险分析推荐的检验策略');
      // 这里可以添加应用策略的具体逻辑
    } else if (action.action.type === 'exportReport') {
      ElMessage.success('风险分析报告已导出');
      // 这里可以添加导出报告的具体逻辑
    }
  } else if (action.type === 'trend') {
    // 处理趋势预测相关操作
  } else if (action.type === 'anomaly') {
    // 处理异常检测相关操作
  } else if (action.type === 'recommendation') {
    // 处理推荐决策相关操作
  }
}

// 处理AI洞察错误
function handleInsightError(error) {
  console.error('AI分析错误:', error);
  ElMessage.error('AI分析出现错误，请稍后重试');
}

onMounted(() => {
  // 初始化时启用图表生成器
  showChartGenerator.value = true;
  
  // 从其他模块加载共享数据
  const sharedData = sessionStorage.getItem('iqe_shared_data');
  if (sharedData) {
    const parsedData = JSON.parse(sharedData);
    if (parsedData.referringModule) {
      ElMessage.info(`您从${parsedData.referringModule}页面跳转而来，相关数据已加载`);
    }
  }
});

// 当场景改变时更新推荐操作
watch(currentScenario, (newScenario) => {
  if (chatRef.value) {
    chatRef.value.addMessage('system', `场景已切换到"${getScenarioName(newScenario)}"，推荐操作已更新`, 'text');
  }
});

// 获取场景名称
function getScenarioName(scenario) {
  switch(scenario) {
    case 'factory': return '库存场景';
    case 'lab': return '实验室场景';
    case 'online': return '产线场景';
    case 'supplier': return '供应商质量助手';
    default: return '通用场景';
  }
}

// 根据问题生成图表
function generateChartBasedOnQuestion(question) {
  const chartGeneratorRef = ref(null);
  
  nextTick(() => {
    if (!chartGeneratorRef.value) return;
    
    const questionLower = question.toLowerCase();
    
    // 根据问题内容生成不同类型的图表
    if (questionLower.includes('不良率') || questionLower.includes('趋势')) {
      // 生成不良率趋势图
      chartGeneratorRef.value.generateChart({
        type: 'line',
        title: '物料不良率趋势分析',
        data: {
          labels: ['1月', '2月', '3月', '4月', '5月'],
          datasets: [
            {
              label: '电池盖 (37301062)',
              data: [2.5, 3.2, 5.1, 4.8, 6.7],
              borderColor: '#409EFF'
            },
            {
              label: '保护膜 (38501375)',
              data: [1.8, 2.5, 3.0, 5.2, 8.0],
              borderColor: '#F56C6C'
            }
          ]
        },
        options: {
          yAxisTitle: '不良率 (%)',
          threshold: 5
        }
      });
    } else if (questionLower.includes('缺陷') || questionLower.includes('类型')) {
      // 生成缺陷类型分布图
      chartGeneratorRef.value.generateChart({
        type: 'pie',
        title: '缺陷类型分布',
        data: {
          labels: ['外观', '功能', '尺寸', '其他'],
          datasets: [
            {
              data: [45, 25, 20, 10],
              backgroundColor: ['#409EFF', '#F56C6C', '#E6A23C', '#67C23A']
            }
          ]
        }
      });
    } else if (questionLower.includes('供应商') || questionLower.includes('评估')) {
      // 生成供应商评估图
      chartGeneratorRef.value.generateChart({
        type: 'bar',
        title: '供应商质量评估',
        data: {
          labels: ['金盾', '易湛', '其他供应商'],
          datasets: [
            {
              label: '质量得分',
              data: [78, 65, 85],
              backgroundColor: ['#409EFF', '#F56C6C', '#67C23A']
            }
          ]
        },
        options: {
          yAxisTitle: '得分 (0-100)',
          threshold: 70
        }
      });
    } else {
      // 默认生成综合质量图表
      chartGeneratorRef.value.generateChart({
        type: 'line',
        title: 'IQE质量综合趋势',
        data: {
          labels: ['1月', '2月', '3月', '4月', '5月'],
          datasets: [
            {
              label: '不良率',
              data: [3.2, 3.5, 4.1, 4.8, 5.2],
              borderColor: '#F56C6C',
              yAxisID: 'y'
            },
            {
              label: '返工率',
              data: [1.5, 1.8, 2.0, 2.2, 2.5],
              borderColor: '#E6A23C',
              yAxisID: 'y'
            },
            {
              label: '客诉率',
              data: [0.5, 0.4, 0.6, 0.8, 0.7],
              borderColor: '#67C23A',
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          yAxisTitle: '百分比 (%)',
          y2AxisTitle: '每千台',
          threshold: 5
        }
      });
    }
  });
}

// 处理预测完成
function handlePredictionComplete(predictionData) {
  if (chatRef.value) {
    const { type, results } = predictionData;
    let message = '';
    
    if (type === 'quality') {
      message = `质量趋势预测完成:\n${results.summary.title}\n${results.summary.description}`;
    } else if (type === 'defect') {
      message = `缺陷预测分析完成:\n${results.summary.title}\n${results.summary.description}`;
    } else {
      message = `预测分析完成，您可以在右侧面板查看详细结果`;
    }
    
    chatRef.value.addBotMessage(message);
  }
}
</script> 