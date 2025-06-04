<template>
  <div class="ai-insights-panel">
    <div class="panel-header">
      <h3>IQE智能分析</h3>
      <div class="status-indicator">
        <el-tag :type="aiStatus.connected ? 'success' : 'danger'" size="small">
          {{ aiStatus.connected ? 'AI引擎已连接' : 'AI引擎未连接' }}
        </el-tag>
        <el-tooltip content="AI引擎详细信息" placement="top">
          <el-button type="primary" size="small" circle @click="showStatusDialog = true">
            <el-icon><InfoFilled /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="insight-tabs">
      <el-tab-pane label="风险分析" name="risk">
        <div class="tab-content">
          <el-skeleton :loading="loading.risk" animated>
            <template #template>
              <div style="padding: 15px">
                <el-skeleton-item variant="text" style="width: 100%" />
                <el-skeleton-item variant="text" style="width: 90%; margin-top: 15px" />
                <el-skeleton-item variant="text" style="width: 80%; margin-top: 15px" />
                <el-skeleton-item variant="h3" style="width: 50%; margin-top: 20px" />
              </div>
            </template>
            <template #default>
              <risk-analysis-card 
                :risk-data="insights.risk" 
                @action-triggered="handleRiskAction"
              />
            </template>
          </el-skeleton>
        </div>
      </el-tab-pane>

      <el-tab-pane label="趋势预测" name="trend">
        <div class="tab-content">
          <el-skeleton :loading="loading.trend" animated>
            <template #template>
              <div style="padding: 15px">
                <el-skeleton-item variant="h3" style="width: 50%" />
                <div style="height: 200px; margin-top: 20px; background: #f5f7fa"></div>
                <el-skeleton-item variant="text" style="width: 90%; margin-top: 15px" />
              </div>
            </template>
            <template #default>
              <trend-prediction-card 
                :trend-data="insights.trend" 
                @action-triggered="handleTrendAction"
              />
            </template>
          </el-skeleton>
        </div>
      </el-tab-pane>

      <el-tab-pane label="异常检测" name="anomaly">
        <div class="tab-content">
          <el-skeleton :loading="loading.anomaly" animated>
            <template #template>
              <div style="padding: 15px">
                <el-skeleton-item variant="h3" style="width: 60%" />
                <div style="margin-top: 20px">
                  <el-skeleton-item variant="text" style="width: 100%" />
                  <el-skeleton-item variant="text" style="width: 95%; margin-top: 15px" />
                </div>
              </div>
            </template>
            <template #default>
              <anomaly-detection-card 
                :anomaly-data="insights.anomaly" 
                @action-triggered="handleAnomalyAction"
              />
            </template>
          </el-skeleton>
        </div>
      </el-tab-pane>

      <el-tab-pane label="决策推荐" name="recommendation">
        <div class="tab-content">
          <el-skeleton :loading="loading.recommendation" animated>
            <template #template>
              <div style="padding: 15px">
                <el-skeleton-item variant="h3" style="width: 70%" />
                <div style="margin-top: 20px">
                  <el-skeleton-item variant="text" style="width: 100%" />
                  <el-skeleton-item variant="text" style="width: 90%; margin-top: 15px" />
                </div>
              </div>
            </template>
            <template #default>
              <recommendation-card 
                :recommendation-data="insights.recommendation" 
                @action-triggered="handleRecommendationAction"
              />
            </template>
          </el-skeleton>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- AI状态对话框 -->
    <el-dialog
      v-model="showStatusDialog"
      title="AI引擎状态"
      width="550px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="连接状态">
          <el-tag :type="aiStatus.connected ? 'success' : 'danger'">
            {{ aiStatus.connected ? '已连接' : '未连接' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="响应时间">
          {{ aiStatus.latency ? `${aiStatus.latency}ms` : '未知' }}
        </el-descriptions-item>
        <el-descriptions-item label="已加载模型数">
          {{ aiStatus.modelCount }}
        </el-descriptions-item>
        <el-descriptions-item label="可用模型类型">
          <el-tag 
            v-for="type in aiStatus.modelTypes" 
            :key="type" 
            style="margin-right: 5px"
          >
            {{ type }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="缓存状态">
          {{ aiStatus.cacheEnabled ? '已启用' : '已禁用' }} 
          ({{ aiStatus.cacheSize }}项)
        </el-descriptions-item>
      </el-descriptions>
      
      <div class="dialog-footer">
        <el-button @click="refreshAIStatus">刷新状态</el-button>
        <el-button @click="showStatusDialog = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { InfoFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// 导入组件
import RiskAnalysisCard from './insight-cards/RiskAnalysisCard.vue';
import TrendPredictionCard from './insight-cards/TrendPredictionCard.vue';
import AnomalyDetectionCard from './insight-cards/AnomalyDetectionCard.vue';
import RecommendationCard from './insight-cards/RecommendationCard.vue';

// 导入AI服务
import AIServiceInitializer from '../../services/AIServiceInitializer';
import { MaterialAIService } from '../../services/MaterialAIService';

// 定义属性
const props = defineProps({
  materialCode: {
    type: String,
    default: ''
  },
  materialData: {
    type: Object,
    default: () => ({})
  },
  autoRefresh: {
    type: Boolean,
    default: false
  },
  refreshInterval: {
    type: Number,
    default: 60000 // 1分钟
  }
});

// 定义事件
const emit = defineEmits([
  'insight-loaded', 
  'action-triggered', 
  'error'
]);

// 状态管理
const activeTab = ref('risk');
const showStatusDialog = ref(false);
const aiStatus = reactive({
  connected: false,
  latency: null,
  modelCount: 0,
  modelTypes: [],
  cacheEnabled: false,
  cacheSize: 0
});

const loading = reactive({
  risk: true,
  trend: true,
  anomaly: true,
  recommendation: true
});

const insights = reactive({
  risk: null,
  trend: null,
  anomaly: null,
  recommendation: null
});

let refreshTimer = null;

// 初始化函数
onMounted(async () => {
  try {
    // 初始化AI服务
    await ensureAIServicesInitialized();
    
    // 获取AI状态
    await refreshAIStatus();
    
    // 加载数据
    if (props.materialCode) {
      await refreshInsights();
    }
    
    // 设置自动刷新
    if (props.autoRefresh) {
      startAutoRefresh();
    }
  } catch (error) {
    console.error('AI面板初始化失败:', error);
    ElMessage.error('AI分析面板初始化失败，请稍后重试');
    emit('error', error);
  }
});

// 确保AI服务已初始化
async function ensureAIServicesInitialized() {
  if (!AIServiceInitializer.isInitialized()) {
    await AIServiceInitializer.initialize();
  }
  return AIServiceInitializer.isInitialized();
}

// 刷新AI状态
async function refreshAIStatus() {
  try {
    const status = await AIServiceInitializer.getStatus();
    
    aiStatus.connected = status.initialized && status.connector.available;
    aiStatus.latency = status.connector.latency;
    aiStatus.modelCount = status.models.count;
    aiStatus.modelTypes = status.models.types;
    aiStatus.cacheEnabled = status.cache.enabled;
    aiStatus.cacheSize = status.cache.size;
    
    return true;
  } catch (error) {
    console.error('获取AI状态失败:', error);
    return false;
  }
}

// 刷新所有分析结果
async function refreshInsights() {
  if (!props.materialCode) {
    ElMessage.warning('请先选择物料');
    return;
  }
  
  try {
    // 重置加载状态
    Object.keys(loading).forEach(key => loading[key] = true);
    
    // 获取物料数据
    const materialData = props.materialData || { materialCode: props.materialCode };
    
    // 并行加载各个分析结果
    await Promise.all([
      loadRiskAnalysis(materialData),
      loadTrendPrediction(materialData),
      loadAnomalyDetection(materialData),
      loadRecommendations(materialData)
    ]);
    
    emit('insight-loaded', { 
      materialCode: props.materialCode,
      insights
    });
    
    return true;
  } catch (error) {
    console.error('刷新分析结果失败:', error);
    ElMessage.error('加载分析结果失败，请稍后重试');
    emit('error', error);
    return false;
  }
}

// 加载风险分析
async function loadRiskAnalysis(materialData) {
  try {
    const result = await MaterialAIService.assessRisk([materialData]);
    
    insights.risk = {
      materialCode: props.materialCode,
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      factors: result.factors,
      recommendedStrategy: result.recommendedStrategy,
      historicalComparison: result.historicalComparison,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('加载风险分析失败:', error);
    insights.risk = null;
  } finally {
    loading.risk = false;
  }
}

// 加载趋势预测
async function loadTrendPrediction(materialData) {
  try {
    // 准备时间范围(未来30天)
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + 30);
    
    const timeRange = {
      start: now.getTime(),
      end: futureDate.getTime()
    };
    
    const result = await MaterialAIService.predictQualityTrend([materialData], timeRange);
    
    insights.trend = {
      materialCode: props.materialCode,
      trend: result.trend,
      prediction: result.prediction,
      confidence: result.confidence,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('加载趋势预测失败:', error);
    insights.trend = null;
  } finally {
    loading.trend = false;
  }
}

// 加载异常检测
async function loadAnomalyDetection(materialData) {
  try {
    const result = await MaterialAIService.detectAnomalies([materialData]);
    
    insights.anomaly = {
      materialCode: props.materialCode,
      anomalies: result,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('加载异常检测失败:', error);
    insights.anomaly = null;
  } finally {
    loading.anomaly = false;
  }
}

// 加载推荐决策
async function loadRecommendations(materialData) {
  try {
    const result = await MaterialAIService.recommendInspectionStrategy(
      props.materialCode,
      { currentData: materialData }
    );
    
    insights.recommendation = {
      materialCode: props.materialCode,
      recommendations: result.recommendations,
      context: result.context,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('加载推荐决策失败:', error);
    insights.recommendation = null;
  } finally {
    loading.recommendation = false;
  }
}

// 处理风险分析操作
function handleRiskAction(action) {
  emit('action-triggered', {
    type: 'risk',
    action,
    materialCode: props.materialCode,
    data: insights.risk
  });
}

// 处理趋势预测操作
function handleTrendAction(action) {
  emit('action-triggered', {
    type: 'trend',
    action,
    materialCode: props.materialCode,
    data: insights.trend
  });
}

// 处理异常检测操作
function handleAnomalyAction(action) {
  emit('action-triggered', {
    type: 'anomaly',
    action,
    materialCode: props.materialCode,
    data: insights.anomaly
  });
}

// 处理推荐决策操作
function handleRecommendationAction(action) {
  emit('action-triggered', {
    type: 'recommendation',
    action,
    materialCode: props.materialCode,
    data: insights.recommendation
  });
}

// 启动自动刷新
function startAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
  
  refreshTimer = setInterval(() => {
    refreshInsights();
  }, props.refreshInterval);
}

// 停止自动刷新
function stopAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

// 监听属性变化
watch(() => props.materialCode, (newValue) => {
  if (newValue) {
    refreshInsights();
  }
});

watch(() => props.autoRefresh, (newValue) => {
  if (newValue) {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }
});

// 在组件销毁时清理
onUnmounted(() => {
  stopAutoRefresh();
});

// 暴露方法
defineExpose({
  refreshInsights,
  refreshAIStatus,
  startAutoRefresh,
  stopAutoRefresh
});
</script>

<style scoped>
.ai-insights-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
}

.insight-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.insight-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow: auto;
  padding: 0;
}

.tab-content {
  padding: 15px;
  height: 100%;
  overflow: auto;
}

.dialog-footer {
  margin-top: 20px;
  text-align: right;
}
</style> 