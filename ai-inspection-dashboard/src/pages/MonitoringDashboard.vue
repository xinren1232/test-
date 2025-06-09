<template>
  <div class="monitoring-dashboard">
    <h2 class="page-title">IQE质量监控仪表板</h2>
    
    <!-- 实时更新控制 -->
    <div class="real-time-control">
      <span class="refresh-status">
        <i class="el-icon-refresh" :class="{ 'is-loading': isRefreshing }"></i>
        数据{{ autoRefresh ? '实时更新中' : '已暂停' }} - 最后更新: {{ lastUpdateTime }}
      </span>
      <div class="control-actions">
        <el-switch
          v-model="autoRefresh"
          active-text="自动刷新"
          inactive-text="手动刷新"
        />
        <el-button 
          type="primary" 
          size="small" 
          plain 
          @click="refreshData" 
          :disabled="isRefreshing"
          :icon="isRefreshing ? 'el-icon-loading' : 'el-icon-refresh'"
        >
          刷新
        </el-button>
      </div>
    </div>
    
    <!-- 主要内容区 -->
    <div class="dashboard-content">
      <!-- 状态卡片 -->
      <div class="status-cards">
        <el-row :gutter="20">
          <el-col :span="6" v-for="(card, index) in statusCards" :key="index">
            <el-card shadow="hover" :class="`status-card ${card.type}`">
              <div class="status-icon">
                <el-icon>
                  <component :is="card.icon"></component>
                </el-icon>
              </div>
              <div class="status-info">
                <div class="status-value">{{ card.value }}</div>
                <div class="status-label">{{ card.label }}</div>
              </div>
              <div class="status-change" :class="card.trend">
                <el-icon>
                  <component :is="card.trend === 'up' ? 'ArrowUp' : 'ArrowDown'"></component>
                </el-icon>
                <span>{{ card.change }}</span>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      
      <!-- 决策支持卡片 (新增) -->
      <div class="decision-support-section">
        <el-card shadow="hover" class="decision-card" v-if="showDecisionSupport">
          <template #header>
            <div class="card-header">
              <h3>智能决策支持</h3>
              <el-button link @click="showDecisionSupport = false">关闭</el-button>
            </div>
          </template>
          <div class="decision-content">
            <div class="decision-alert">
              <el-alert 
                :title="aiDecision.title" 
                :type="aiDecision.level" 
                :description="aiDecision.description" 
                show-icon 
                :closable="false"
              />
            </div>
            <el-divider content-position="left">建议措施</el-divider>
            <div class="recommendation-steps">
              <el-steps direction="vertical" :active="1">
                <el-step 
                  v-for="(step, index) in aiDecision.steps" 
                  :key="index" 
                  :title="step.title" 
                  :description="step.description" 
                />
              </el-steps>
            </div>
            <div class="decision-actions">
              <el-button type="success" @click="applyRecommendation">应用建议</el-button>
              <el-button plain @click="adjustParameters">调整参数</el-button>
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 图表区域 -->
      <div class="chart-section">
        <el-row :gutter="20">
          <!-- 检验趋势图 -->
          <el-col :span="16">
            <el-card shadow="hover" class="chart-card">
              <template #header>
                <div class="chart-header">
                  <h3>检验趋势</h3>
                  <div class="chart-controls">
                    <el-radio-group v-model="productionChartPeriod" size="small">
                      <el-radio-button label="day">日</el-radio-button>
                      <el-radio-button label="week">周</el-radio-button>
                      <el-radio-button label="month">月</el-radio-button>
                    </el-radio-group>
                    <el-tooltip content="显示/隐藏预测趋势" placement="top">
                      <el-switch 
                        v-model="showPrediction" 
                        active-text="预测" 
                        @change="updatePredictionLine"
                      />
                    </el-tooltip>
                  </div>
                </div>
              </template>
              <div class="chart-container" ref="productionChart"></div>
            </el-card>
          </el-col>
          
          <!-- 异常分布图 -->
          <el-col :span="8">
            <el-card shadow="hover" class="chart-card">
              <template #header>
                <div class="chart-header">
                  <h3>异常分布</h3>
                </div>
              </template>
              <div class="chart-container" ref="qualityChart"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      
      <!-- 物料批次追踪 -->
      <div class="batch-tracking-section">
        <el-card shadow="hover">
          <template #header>
            <div class="section-header">
              <h3>物料批次追踪</h3>
              <div class="header-actions">
                <el-input
                  placeholder="搜索物料编码或名称"
                  prefix-icon="el-icon-search"
                  v-model="materialSearchQuery"
                  clearable
                  class="search-input"
                />
                <el-select v-model="materialFilterStatus" placeholder="筛选状态" clearable class="filter-select">
                  <el-option label="全部" value="" />
                  <el-option label="NG" value="NG" />
                  <el-option label="有条件接收" value="有条件接收" />
                  <el-option label="OK" value="OK" />
                </el-select>
                <el-tooltip content="应用智能筛选器，突出显示高风险物料" placement="top">
                  <el-button 
                    type="warning" 
                    size="small" 
                    plain 
                    :icon="intelligentFilterActive ? 'el-icon-star-on' : 'el-icon-star-off'"
                    @click="toggleIntelligentFilter"
                  >
                    智能筛选
                  </el-button>
                </el-tooltip>
                <el-button type="primary" size="small" plain>导出报表</el-button>
              </div>
            </div>
          </template>
          <el-table 
            :data="filteredMaterialBatches" 
            stripe 
            style="width: 100%" 
            :row-class-name="getRowClassName"
          >
            <el-table-column prop="materialCode" label="物料编码" width="110" />
            <el-table-column prop="materialName" label="物料名称" width="120" />
            <el-table-column prop="project" label="项目" width="100" />
            <el-table-column prop="batchId" label="批次" width="110" />
            <el-table-column prop="inspectionDate" label="检验日期" width="110" />
            <el-table-column prop="result" label="检验结果">
              <template #default="scope">
                <el-tag :type="getResultTagType(scope.row.result)">{{ scope.row.result }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="defectRate" label="不良率" width="100" />
            <el-table-column prop="supplier" label="供应商" width="100" />
            <el-table-column prop="status" label="状态" />
            <el-table-column prop="riskScore" label="风险评估" width="120">
              <template #default="scope">
                <el-progress 
                  :percentage="scope.row.riskScore || 0" 
                  :color="getRiskColor(scope.row.riskScore)" 
                  :stroke-width="10"
                  :text-inside="true"
                  :format="percent => percent + '%'"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="200">
              <template #default="scope">
                <el-button size="small" type="primary" plain @click="viewBatchDetails(scope.row)">查看详情</el-button>
                <el-button size="small" type="warning" plain @click="analyzeRisk(scope.row)">风险分析</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
      
      <!-- 供应商风险矩阵 -->
      <div class="supplier-risk-section">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-card shadow="hover">
              <template #header>
                <div class="section-header">
                  <h3>供应商风险评级</h3>
                  <el-button type="primary" size="small" plain>供应商管理</el-button>
                </div>
              </template>
              <el-table :data="supplierRiskData" stripe style="width: 100%">
                <el-table-column prop="supplier" label="供应商" width="100" />
                <el-table-column label="风险等级" width="120">
                  <template #default="scope">
                    <div class="risk-level-tag" :class="`level-${scope.row.riskLevel.toLowerCase()}`">
                      {{ scope.row.riskLevel }}级
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="质量评分" width="180">
                  <template #default="scope">
                    <el-progress 
                      :percentage="scope.row.qualityScore" 
                      :color="getQualityScoreColor(scope.row.qualityScore)" 
                      :format="percentFormat" />
                  </template>
                </el-table-column>
                <el-table-column prop="anomalyCount" label="异常数" width="100" />
                <el-table-column label="主要物料">
                  <template #default="scope">
                    <el-tag 
                      v-for="(material, idx) in scope.row.materials" 
                      :key="idx"
                      size="small"
                      effect="plain"
                      class="material-tag"
                    >
                      {{ material }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="recommendation" label="建议措施" />
                <el-table-column label="操作" fixed="right" width="150">
                  <template #default>
                    <el-button size="small" type="warning" plain>异常记录</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </div>
      
      <!-- 告警列表 -->
      <div class="alerts-section">
        <el-card shadow="hover">
          <template #header>
            <div class="section-header">
              <h3>异常告警</h3>
              <div class="header-actions">
                <el-radio-group v-model="alertSortMethod" size="small">
                  <el-radio-button label="time">按时间</el-radio-button>
                  <el-radio-button label="level">按级别</el-radio-button>
                  <el-radio-button label="type">按类型</el-radio-button>
                </el-radio-group>
                <el-button type="primary" size="small" plain>查看全部</el-button>
              </div>
            </div>
          </template>
          <el-table :data="sortedAlertsList" stripe style="width: 100%">
            <el-table-column prop="time" label="时间" width="180"></el-table-column>
            <el-table-column prop="level" label="级别">
              <template #default="scope">
                <el-tag :type="getAlertLevelType(scope.row.level)">{{ scope.row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型"></el-table-column>
            <el-table-column prop="device" label="物料"></el-table-column>
            <el-table-column prop="message" label="描述"></el-table-column>
            <el-table-column label="操作" width="250">
              <template #default="scope">
                <el-button size="small" type="primary" plain>处理</el-button>
                <el-button size="small" type="success" plain>分享</el-button>
                <el-button 
                  size="small" 
                  :type="scope.row.isPredictive ? 'warning' : 'info'" 
                  plain
                >
                  {{ scope.row.isPredictive ? '预测告警' : '实时告警' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </div>
    
    <!-- 风险分析对话框 -->
    <el-dialog
      v-model="riskAnalysisVisible"
      title="物料批次风险分析"
      width="70%"
      destroy-on-close
    >
      <div v-if="selectedBatch" class="risk-analysis-content">
        <el-descriptions title="基本信息" :column="3" border>
          <el-descriptions-item label="物料名称">{{ selectedBatch.materialName }}</el-descriptions-item>
          <el-descriptions-item label="物料编码">{{ selectedBatch.materialCode }}</el-descriptions-item>
          <el-descriptions-item label="批次号">{{ selectedBatch.batchId }}</el-descriptions-item>
          <el-descriptions-item label="供应商">{{ selectedBatch.supplier }}</el-descriptions-item>
          <el-descriptions-item label="风险分值">
            <el-tag :type="getRiskTagType(selectedBatch.riskScore)">{{ selectedBatch.riskScore }}%</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="测量状态">{{ selectedBatch.result }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="risk-factors">
          <h4>风险因素分析</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="risk-chart" ref="riskFactorChart"></div>
            </el-col>
            <el-col :span="12">
              <div class="risk-breakdown">
                <div v-for="(factor, index) in riskFactors" :key="index" class="risk-factor-item">
                  <div class="factor-name">{{ factor.name }}</div>
                  <el-progress 
                    :percentage="factor.value" 
                    :color="factor.color"
                    :format="percent => percent + '%'" 
                  />
                  <div class="factor-description">{{ factor.description }}</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <div class="risk-recommendations">
          <h4>风险应对建议</h4>
          <div class="recommendation-cards">
            <el-card 
              v-for="(recommendation, index) in riskRecommendations" 
              :key="index"
              class="recommendation-card"
              :shadow="recommendation.priority === '高' ? 'always' : 'hover'"
            >
              <div class="recommendation-header">
                <span class="recommendation-title">{{ recommendation.title }}</span>
                <el-tag 
                  :type="recommendation.priority === '高' ? 'danger' : recommendation.priority === '中' ? 'warning' : 'info'"
                  size="small"
                >
                  {{ recommendation.priority }}优先级
                </el-tag>
              </div>
              <div class="recommendation-content">
                {{ recommendation.description }}
              </div>
              <div class="recommendation-footer">
                <el-button size="small" type="primary" plain>应用</el-button>
                <el-button size="small" plain>调整</el-button>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick, computed, watch } from 'vue';
import * as echarts from 'echarts';
import { useRouter } from 'vue-router';

const router = useRouter();

// 实时更新相关
const autoRefresh = ref(true);
const isRefreshing = ref(false);
const refreshInterval = ref(null);
const lastUpdateTime = ref(new Date().toLocaleTimeString());

// 决策支持相关
const showDecisionSupport = ref(true);
const aiDecision = reactive({
  title: '建议针对易湛供应商增强质量监控',
  level: 'warning',
  description: '系统检测到易湛供应商的保护膜(38501375)近期不良率上升趋势，建议采取预防措施。',
  steps: [
    { title: '增加抽检比例', description: '将保护膜抽检比例从5%提高到15%' },
    { title: '安排供应商审核', description: '派遣质量工程师到易湛工厂进行现场审核' },
    { title: '建立专项监控', description: '对保护膜酒精耐磨测试建立专项监控机制' }
  ]
});

// 新增图表控制
const showPrediction = ref(true);

// 新增智能筛选
const intelligentFilterActive = ref(false);

// 新增风险分析对话框
const riskAnalysisVisible = ref(false);
const selectedBatch = ref(null);
const riskFactors = ref([
  { name: '供应商历史表现', value: 75, color: '#F56C6C', description: '该供应商近3个月有2次类似不良记录' },
  { name: '材料批次一致性', value: 65, color: '#E6A23C', description: '检测到批次间参数波动较大' },
  { name: '工艺稳定性', value: 45, color: '#409EFF', description: '生产参数较为稳定但有波动' },
  { name: '测试方法适用性', value: 25, color: '#67C23A', description: '测试方法已验证有效' },
  { name: '环境因素影响', value: 35, color: '#909399', description: '季节性因素可能影响材料特性' }
]);

const riskRecommendations = ref([
  { 
    title: '增加抽样频率', 
    description: '对该批次保护膜增加抽样检验频率至15%，关注酒精耐磨和附着力测试项目', 
    priority: '高' 
  },
  { 
    title: '供应商审核', 
    description: '安排质量工程师对易湛供应商进行专项工艺审核，重点关注原材料变更和生产参数控制', 
    priority: '中' 
  },
  { 
    title: '测试方法优化', 
    description: '建议优化耐磨测试方法，增加耐久性评估维度，更准确反映实际使用场景', 
    priority: '低' 
  }
]);

// 告警排序方式
const alertSortMethod = ref('time');

// 状态卡片更新为IQE专用指标
const statusCards = [
  { 
    icon: 'DataLine', 
    label: '日检量', 
    value: '385', 
    type: 'production',
    trend: 'up',
    change: '8.6%'
  },
  { 
    icon: 'Check', 
    label: '来料合格率', 
    value: '93.2%', 
    type: 'quality',
    trend: 'down',
    change: '2.8%'
  },
  { 
    icon: 'Warning', 
    label: '待处理异常', 
    value: '17', 
    type: 'alert',
    trend: 'up',
    change: '5个'
  },
  { 
    icon: 'Timer', 
    label: '平均检验周期', 
    value: '2.5d', 
    type: 'time',
    trend: 'down',
    change: '0.8d'
  }
];

// 图表相关
const productionChart = ref(null);
const qualityChart = ref(null);
const productionChartPeriod = ref('week');
let productionChartInstance = null;
let qualityChartInstance = null;

// IQE异常记录列表 - 更新为真实场景的异常记录数据
const alertsList = [
  {
    time: '2025-05-26 09:23:45',
    level: '严重',
    type: '可靠性',
    device: '电池盖(37301062)',
    message: '连续开合耐久性测试未达标准，不良率66.7%',
    isPredictive: false
  },
  {
    time: '2025-05-25 10:15:22',
    level: '严重',
    type: '外观',
    device: '保护膜(38501375)',
    message: '酒精耐磨测试不良，掉漆率100%',
    isPredictive: false
  },
  {
    time: '2025-05-24 14:37:10',
    level: '警告',
    type: '尺寸偏差',
    device: '按键(37208631)',
    message: '按键高度超出公差范围+0.3mm',
    isPredictive: false
  },
  {
    time: '2025-05-23 08:40:28',
    level: '一般',
    type: '包装',
    device: '包装盒(38904532)',
    message: '印刷色差超标',
    isPredictive: false
  },
  {
    time: '2025-05-22 11:12:19',
    level: '警告',
    type: '电气参数',
    device: '连接器(35204178)',
    message: '接触电阻波动超出标准',
    isPredictive: false
  }
];

// 供应商风险评级
const supplierRiskData = [
  { 
    supplier: '易湛', 
    riskLevel: 'C', 
    qualityScore: 68, 
    anomalyCount: 7,
    materials: ['保护膜', '标签', '包装盒'],
    recommendation: '暂停新订单，要求提供整改计划'
  },
  { 
    supplier: '金盾', 
    riskLevel: 'B', 
    qualityScore: 78, 
    anomalyCount: 4,
    materials: ['电池盖', '按键', '卡托'],
    recommendation: '增加抽检比例，派驻质量工程师'
  },
  { 
    supplier: '联科', 
    riskLevel: 'A', 
    qualityScore: 92, 
    anomalyCount: 1,
    materials: ['连接器', '弹片', '接口'],
    recommendation: '维持正常检验'
  },
  { 
    supplier: '远大', 
    riskLevel: 'B', 
    qualityScore: 82, 
    anomalyCount: 3,
    materials: ['电池', '线材', '屏蔽罩'],
    recommendation: '加强电气参数测试'
  }
];

// 物料批次追踪数据
const materialBatchData = [
  {
    materialCode: '38501375',
    materialName: '保护膜',
    project: 'X6725B',
    batchId: '#03, #04',
    inspectionDate: '2025-05-26',
    result: 'NG',
    defectRate: '100%',
    supplier: '易湛',
    status: '退货处理中',
    riskScore: 92,
    isHighRisk: true
  },
  {
    materialCode: '37301062',
    materialName: '电池盖',
    project: 'X6725B',
    batchId: '#A22, #A23',
    inspectionDate: '2025-05-24',
    result: 'NG',
    defectRate: '66.7%',
    supplier: '金盾',
    status: '返工修复中',
    riskScore: 78,
    isHighRisk: true
  },
  {
    materialCode: '37208631',
    materialName: '按键',
    project: 'X6725B',
    batchId: '#B10',
    inspectionDate: '2025-05-24',
    result: '有条件接收',
    defectRate: '12.5%',
    supplier: '金盾',
    status: '特采使用中',
    riskScore: 45,
    isHighRisk: false
  },
  {
    materialCode: '35204178',
    materialName: '连接器',
    project: 'X6725B',
    batchId: '#C05, #C06',
    inspectionDate: '2025-05-22',
    result: '有条件接收',
    defectRate: '8.3%',
    supplier: '联科',
    status: '增强检验中',
    riskScore: 28,
    isHighRisk: false
  },
  {
    materialCode: '38501375',
    materialName: '保护膜',
    project: 'X6725B',
    batchId: '#D22, #D23',
    inspectionDate: '2025-05-30',
    result: '待检验',
    defectRate: '预测58%',
    supplier: '易湛',
    status: '待检验',
    riskScore: 85,
    isPredictive: true,
    isHighRisk: true
  }
];

// 物料搜索和筛选
const materialSearchQuery = ref('');
const materialFilterStatus = ref('');

// 根据排序方式对告警进行排序
const sortedAlertsList = computed(() => {
  if (alertSortMethod.value === 'time') {
    return [...alertsList].sort((a, b) => new Date(b.time) - new Date(a.time));
  } else if (alertSortMethod.value === 'level') {
    const levelPriority = { '严重': 3, '警告': 2, '一般': 1 };
    return [...alertsList].sort((a, b) => levelPriority[b.level] - levelPriority[a.level]);
  } else if (alertSortMethod.value === 'type') {
    return [...alertsList].sort((a, b) => a.type.localeCompare(b.type));
  }
  return alertsList;
});

// 智能筛选后的物料批次
const filteredMaterialBatches = computed(() => {
  let results = materialBatchData;
  
  if (!materialSearchQuery.value && !materialFilterStatus.value) {
    // 如果没有搜索条件，但启用了智能筛选
    if (intelligentFilterActive.value) {
      return results.filter(item => item.isHighRisk);
    }
    return results;
  }
  
  if (materialSearchQuery.value) {
    results = results.filter(item => 
      item.materialCode.toLowerCase().includes(materialSearchQuery.value.toLowerCase()) ||
      item.materialName.toLowerCase().includes(materialSearchQuery.value.toLowerCase())
    );
  }
  
  if (materialFilterStatus.value) {
    results = results.filter(item => item.result === materialFilterStatus.value);
  }
  
  // 如果启用了智能筛选，进一步过滤高风险项
  if (intelligentFilterActive.value) {
    results = results.filter(item => item.isHighRisk);
  }
  
  return results;
});

// 获取行样式
function getRowClassName({row}) {
  if (row.isPredictive) return 'prediction-row';
  if (row.isHighRisk) return 'high-risk-row';
  return '';
}

// 获取风险颜色
function getRiskColor(score) {
  if (score >= 80) return '#F56C6C';
  if (score >= 50) return '#E6A23C';
  return '#67C23A';
}

// 获取风险标签类型
function getRiskTagType(score) {
  if (score >= 80) return 'danger';
  if (score >= 50) return 'warning';
  return 'success';
}

// 批次详情查看
function viewBatchDetails(batch) {
  // 打开详情页或导航到详细分析页
  router.push({
    path: '/lab-view',
    query: { materialCode: batch.materialCode, batch: batch.batchId }
  });
}

// 风险分析
function analyzeRisk(batch) {
  selectedBatch.value = batch;
  riskAnalysisVisible.value = true;
  
  // 初始化风险因素图表
  nextTick(() => {
    initRiskFactorChart();
  });
}

// 风险因素图表初始化
function initRiskFactorChart() {
  const chartDom = document.querySelector('.risk-chart');
  if (!chartDom) return;
  
  const chart = echarts.init(chartDom);
  
  const option = {
    title: {
      text: '风险因素分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '风险占比',
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
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: riskFactors.value.map(factor => ({
          name: factor.name,
          value: factor.value,
          itemStyle: { color: factor.color }
        }))
      }
    ]
  };
  
  chart.setOption(option);
}

// 切换智能筛选
function toggleIntelligentFilter() {
  intelligentFilterActive.value = !intelligentFilterActive.value;
}

// 刷新数据
function refreshData() {
  isRefreshing.value = true;
  
  setTimeout(() => {
    // 模拟数据刷新
    lastUpdateTime.value = new Date().toLocaleTimeString();
    isRefreshing.value = false;
    
    ElMessage.success('数据已更新');
    
    // 如果有新的高风险物料，显示决策支持卡片
    if (!showDecisionSupport.value && Math.random() > 0.5) {
      showDecisionSupport.value = true;
    }
  }, 1500);
}

// 应用AI建议
function applyRecommendation() {
  ElMessage.success('已应用AI建议，系统将增加易湛供应商保护膜的抽检比例');
  showDecisionSupport.value = false;
}

// 调整AI参数
function adjustParameters() {
  ElMessage.info('打开参数调整对话框');
}

// 预测线更新
function updatePredictionLine() {
  initProductionChart();
}

// 生命周期钩子
onMounted(() => {
  initCharts();
  
  // 设置自动刷新
  if (autoRefresh.value) {
    refreshInterval.value = setInterval(() => {
      refreshData();
    }, 60000); // 每分钟刷新一次
  }
});

onBeforeUnmount(() => {
  disposeCharts();
  
  // 清除定时器
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});

// 监听自动刷新状态变化
watch(autoRefresh, (newValue) => {
  if (newValue) {
    refreshInterval.value = setInterval(() => {
      refreshData();
    }, 60000);
  } else {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value);
      refreshInterval.value = null;
    }
  }
});

// 初始化图表
function initCharts() {
  nextTick(() => {
    initProductionChart();
    initQualityChart();
  });
}

// 初始化生产趋势图 - 更新为IQE检验数据趋势，新增预测趋势线
function initProductionChart() {
  if (productionChartInstance) {
    productionChartInstance.dispose();
  }
  
  const chartDom = productionChart.value;
  if (!chartDom) return;
  
  productionChartInstance = echarts.init(chartDom);
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['检验总数', '合格数', '不良数', '预测不良趋势']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日', '周一(预测)', '周二(预测)']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '检验总数',
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 3
        },
        data: [350, 410, 375, 390, 450, 320, 385, null, null]
      },
      {
        name: '合格数',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#67C23A'
        },
        data: [325, 385, 342, 350, 408, 295, 359, null, null]
      },
      {
        name: '不良数',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#F56C6C'
        },
        data: [25, 25, 33, 40, 42, 25, 26, null, null]
      },
      {
        name: '预测不良趋势',
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 2,
          type: 'dashed',
          color: '#E6A23C'
        },
        itemStyle: {
          color: '#E6A23C'
        },
        symbolSize: 8,
        symbol: 'circle',
        data: [null, null, null, null, null, null, 26, 35, 48],
        markArea: {
          silent: true,
          itemStyle: {
            color: 'rgba(255, 173, 177, 0.2)'
          },
          data: [
            [
              { xAxis: '周日' },
              { xAxis: '周二(预测)' }
            ]
          ]
        },
        markPoint: {
          data: [
            { type: 'max', name: '预测峰值', symbolSize: 80 }
          ],
          symbolSize: 60,
          label: {
            formatter: '预警: 不良率达到{c}%',
            fontSize: 14
          }
        }
      }
    ]
  };
  
  // 如果不显示预测，移除预测相关系列
  if (!showPrediction.value) {
    option.series = option.series.filter(s => s.name !== '预测不良趋势');
  }
  
  productionChartInstance.setOption(option);
  
  window.addEventListener('resize', () => {
    productionChartInstance.resize();
  });
}

// 初始化质量分布图 - 更新为按异常类型分布
function initQualityChart() {
  if (qualityChartInstance) {
    qualityChartInstance.dispose();
  }
  
  const chartDom = qualityChart.value;
  if (!chartDom) return;
  
  qualityChartInstance = echarts.init(chartDom);
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: '异常类型分布',
        type: 'pie',
        radius: '70%',
        data: [
          { value: 32, name: '可靠性', itemStyle: { color: '#F56C6C' } },
          { value: 28, name: '外观', itemStyle: { color: '#E6A23C' } },
          { value: 18, name: '尺寸偏差', itemStyle: { color: '#409EFF' } },
          { value: 12, name: '电气参数', itemStyle: { color: '#67C23A' } },
          { value: 10, name: '包装', itemStyle: { color: '#909399' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  
  qualityChartInstance.setOption(option);
  
  window.addEventListener('resize', () => {
    qualityChartInstance.resize();
  });
}

// 释放图表实例
function disposeCharts() {
  if (productionChartInstance) {
    productionChartInstance.dispose();
  }
  if (qualityChartInstance) {
    qualityChartInstance.dispose();
  }
}

// 获取告警级别对应的类型
function getAlertLevelType(level) {
  switch (level) {
    case '严重':
      return 'danger';
    case '警告':
      return 'warning';
    case '一般':
      return 'info';
    default:
      return 'info';
  }
}

// 格式化百分比
function percentFormat(val) {
  return val + '%';
}

// 获取检验结果对应的标签类型
function getResultTagType(result) {
  switch (result) {
    case 'NG':
      return 'danger';
    case '有条件接收':
      return 'warning';
    case 'OK':
      return 'success';
    default:
      return 'info';
  }
}

// 获取质量评分对应的颜色
function getQualityScoreColor(score) {
  if (score >= 90) return '#67C23A';
  if (score >= 75) return '#E6A23C';
  return '#F56C6C';
}
</script>

<style scoped>
.monitoring-dashboard {
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

.real-time-control {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 5px 15px;
  background-color: #f4f4f5;
  border-radius: 4px;
}

.refresh-status {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #606266;
}

.refresh-status .is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.control-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.dashboard-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: auto;
}

.status-cards {
  margin-bottom: 10px;
}

.status-card {
  height: 100px;
  display: flex;
  align-items: center;
  padding: 20px;
}

.status-card.production {
  border-left: 4px solid #409EFF;
}

.status-card.quality {
  border-left: 4px solid #67C23A;
}

.status-card.alert {
  border-left: 4px solid #F56C6C;
}

.status-card.time {
  border-left: 4px solid #E6A23C;
}

.status-icon {
  font-size: 40px;
  margin-right: 15px;
  color: #909399;
}

.status-info {
  flex: 1;
}

.status-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.status-label {
  font-size: 14px;
  color: #606266;
  margin-top: 5px;
}

.status-change {
  font-size: 14px;
  display: flex;
  align-items: center;
}

.status-change.up {
  color: #67C23A;
}

.status-change.down {
  color: #F56C6C;
}

.decision-support-section {
  margin-bottom: 10px;
}

.decision-card {
  background-color: #f8f9fa;
  border-left: 4px solid #E6A23C;
}

.decision-content {
  padding: 10px;
}

.recommendation-steps {
  margin: 15px 0;
}

.decision-actions {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.chart-section {
  margin-bottom: 20px;
}

.chart-card {
  height: 400px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-controls {
  display: flex;
  gap: 15px;
  align-items: center;
}

/* 高风险行样式 */
:deep(.high-risk-row) {
  background-color: rgba(245, 108, 108, 0.1);
}

/* 预测行样式 */
:deep(.prediction-row) {
  background-color: rgba(230, 162, 60, 0.1);
  font-style: italic;
}

.risk-analysis-content {
  padding: 20px;
}

.risk-factors {
  margin-top: 20px;
}

.risk-chart {
  height: 300px;
}

.risk-breakdown {
  padding: 10px;
}

.risk-factor-item {
  margin-bottom: 15px;
}

.factor-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.factor-description {
  font-size: 12px;
  color: #606266;
  margin-top: 5px;
}

.risk-recommendations {
  margin-top: 20px;
}

.recommendation-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.recommendation-card {
  height: 100%;
}

.recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.recommendation-title {
  font-weight: bold;
  font-size: 15px;
}

.recommendation-content {
  margin-bottom: 15px;
  color: #606266;
}

.recommendation-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  width: 220px;
}

.filter-select {
  width: 140px;
}

.batch-tracking-section,
.supplier-risk-section,
.alerts-section {
  margin-bottom: 20px;
}

.risk-level-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  text-align: center;
  width: 60px;
}

.level-a {
  background-color: #67C23A;
}

.level-b {
  background-color: #E6A23C;
}

.level-c {
  background-color: #F56C6C;
}

.material-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}
</style> 