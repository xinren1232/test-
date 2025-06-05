<template>
  <div class="ai-insights-panel">
    <div class="panel-header">
      <h2>AI 智能分析</h2>
      <div class="panel-actions">
        <button @click="refreshInsights" class="refresh-btn">
          <i class="fas fa-sync-alt"></i> 刷新分析
        </button>
      </div>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>AI正在分析数据...</p>
    </div>
    
    <div v-else class="panel-content">
      <!-- 自然语言查询界面 -->
      <div class="nlp-query-section">
        <div class="query-input-container">
          <input 
            v-model="queryInput" 
            @input="handleQueryInput"
            @keyup.enter="executeQuery"
            placeholder="使用自然语言提问，例如：查询最近一周的产线异常" 
            class="query-input"
          />
          <button @click="executeQuery" class="query-btn">
            <i class="fas fa-search"></i>
          </button>
        </div>
        
        <div v-if="suggestions.length > 0" class="suggestions">
          <div 
            v-for="(suggestion, index) in suggestions" 
            :key="index"
            @click="selectSuggestion(suggestion)"
            class="suggestion-item"
          >
            {{ suggestion }}
          </div>
        </div>
      </div>
      
      <!-- 当前查询意图显示 -->
      <div v-if="currentIntent" class="current-intent">
        <div class="intent-header">
          <span class="intent-label">当前查询:</span>
          <span class="intent-description">{{ intentDescription }}</span>
        </div>
      </div>
      
      <!-- 卡片式分析结果展示 -->
      <div class="insights-cards">
        <!-- 风险分析卡片 -->
        <risk-analysis-card 
          v-if="showRiskAnalysis"
          :risk-data="riskData"
          @action-click="handleRiskAction"
        />
        
        <!-- 趋势预测卡片 -->
        <trend-prediction-card 
          v-if="showTrendPrediction"
          :trend-data="trendData"
          @action-click="handleTrendAction"
        />
        
        <!-- 异常检测卡片 -->
        <anomaly-detection-card 
          v-if="showAnomalyDetection"
          :anomaly-data="anomalyData"
          @action-click="handleAnomalyAction"
        />
        
        <!-- 智能推荐卡片 -->
        <recommendation-card 
          v-if="showRecommendations"
          :recommendations="recommendations"
          @action-click="handleRecommendationAction"
        />
      </div>
      
      <!-- 查询结果显示区域 -->
      <div v-if="queryResults.length > 0" class="query-results">
        <h3>查询结果</h3>
        <div class="results-container">
          <div 
            v-for="(result, index) in queryResults" 
            :key="index"
            class="result-item"
          >
            <!-- 根据结果类型渲染不同内容 -->
            <template v-if="result.type === 'inventory'">
              <div class="inventory-result">
                <div class="result-header">
                  <span class="material-code">{{ result.materialCode }}</span>
                  <span class="material-name">{{ result.materialName }}</span>
                  <span class="batch-number">批次: {{ result.batchNumber }}</span>
                </div>
                <div class="result-details">
                  <div class="detail-item">
                    <span class="label">库存数量:</span>
                    <span class="value">{{ result.quantity }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">状态:</span>
                    <span class="value" :class="'status-' + result.status">{{ formatStatus(result.status) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">风险等级:</span>
                    <span class="value" :class="'risk-' + result.riskLevel">{{ formatRiskLevel(result.riskLevel) }}</span>
                  </div>
                </div>
              </div>
            </template>
            
            <template v-else-if="result.type === 'anomaly'">
              <div class="anomaly-result">
                <div class="result-header">
                  <span class="date">{{ formatDate(result.date) }}</span>
                  <span class="production-line">产线: {{ result.productionLine }}</span>
                  <span class="severity" :class="'severity-' + result.severity">{{ formatSeverity(result.severity) }}</span>
                </div>
                <div class="result-details">
                  <div class="detail-item">
                    <span class="label">物料:</span>
                    <span class="value">{{ result.materialCode }} / {{ result.batchNumber }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">异常类型:</span>
                    <span class="value">{{ result.anomalyType }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">描述:</span>
                    <span class="value">{{ result.description }}</span>
                  </div>
                </div>
              </div>
            </template>
            
            <template v-else-if="result.type === 'labTest'">
              <div class="lab-test-result">
                <div class="result-header">
                  <span class="date">{{ formatDate(result.date) }}</span>
                  <span class="material-info">{{ result.materialCode }} / {{ result.batchNumber }}</span>
                  <span class="overall-result" :class="'result-' + result.overallResult">{{ formatTestResult(result.overallResult) }}</span>
                </div>
                <div class="result-details">
                  <div class="detail-item">
                    <span class="label">测试类型:</span>
                    <span class="value">{{ result.testType }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">检验员:</span>
                    <span class="value">{{ result.inspector }}</span>
                  </div>
                  <div class="detail-item test-items-summary">
                    <span class="label">测试项目:</span>
                    <span class="value">通过 {{ countPassedItems(result.testItems) }}/{{ result.testItems.length }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import RiskAnalysisCard from './insight-cards/RiskAnalysisCard.vue';
import TrendPredictionCard from './insight-cards/TrendPredictionCard.vue';
import AnomalyDetectionCard from './insight-cards/AnomalyDetectionCard.vue';
import RecommendationCard from './insight-cards/RecommendationCard.vue';
import { NLPService } from '../../services/ai/NLPService';
import { AnomalyDetectionService } from '../../services/ai/AnomalyDetectionService';
import { RecommendationService } from '../../services/ai/RecommendationService';

export default {
  name: 'AIInsightsPanel',
  components: {
    RiskAnalysisCard,
    TrendPredictionCard,
    AnomalyDetectionCard,
    RecommendationCard
  },
  props: {
    selectedMaterialCode: {
      type: String,
      default: null
    },
    selectedBatchNumber: {
      type: String,
      default: null
    }
  },
  setup(props) {
    // 服务实例
    const nlpService = new NLPService();
    const anomalyService = new AnomalyDetectionService();
    const recommendationService = new RecommendationService();
    
    // 状态
    const loading = ref(false);
    const queryInput = ref('');
    const suggestions = ref([]);
    const currentIntent = ref(null);
    const queryResults = ref([]);
    
    // 分析数据
    const riskData = ref(null);
    const trendData = ref(null);
    const anomalyData = ref([]);
    const recommendations = ref([]);
    
    // 显示控制
    const showRiskAnalysis = ref(false);
    const showTrendPrediction = ref(false);
    const showAnomalyDetection = ref(false);
    const showRecommendations = ref(false);
    
    // 计算属性
    const intentDescription = computed(() => {
      if (!currentIntent.value) return '';
      return nlpService.getIntentDescription(currentIntent.value);
    });
    
    // 初始化
    onMounted(() => {
      refreshInsights();
    });
    
    // 监听属性变化
    watch(() => [props.selectedMaterialCode, props.selectedBatchNumber], () => {
      if (props.selectedMaterialCode && props.selectedBatchNumber) {
        analyzeSelectedMaterial();
      }
    });
    
    // 方法
    const refreshInsights = async () => {
      loading.value = true;
      
      try {
        // 获取推荐数据
        recommendations.value = await recommendationService.getTopRecommendations(3);
        showRecommendations.value = recommendations.value.length > 0;
        
        // 获取其他分析数据
        // 注意: 这里需要实际的数据源来支持这些分析
        // 示例中使用模拟数据
        loadMockData();
        
      } catch (error) {
        console.error('加载AI分析数据失败:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const analyzeSelectedMaterial = async () => {
      if (!props.selectedMaterialCode || !props.selectedBatchNumber) return;
      
      loading.value = true;
      
      try {
        // 获取物料风险分析
        // 实际应用中，应从API获取真实数据
        riskData.value = {
          materialCode: props.selectedMaterialCode,
          batchNumber: props.selectedBatchNumber,
          riskLevel: 'medium',
          riskScore: 65,
          riskFactors: [
            { factor: '物料质量评分', contribution: 0.3 },
            { factor: '历史异常记录', contribution: 0.2 },
            { factor: '供应商可靠性', contribution: 0.15 }
          ],
          projectedIssues: [
            { issue: '尺寸规格问题', probability: 0.75 },
            { issue: '外观缺陷', probability: 0.45 }
          ]
        };
        showRiskAnalysis.value = true;
        
        // 获取物料的推荐措施
        recommendations.value = await recommendationService.getRecommendationsForMaterial(
          props.selectedMaterialCode, 
          props.selectedBatchNumber
        );
        showRecommendations.value = recommendations.value.length > 0;
        
      } catch (error) {
        console.error('分析物料数据失败:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const handleQueryInput = () => {
      if (queryInput.value.length > 2) {
        suggestions.value = nlpService.generateSuggestions(queryInput.value);
      } else {
        suggestions.value = [];
      }
    };
    
    const selectSuggestion = (suggestion) => {
      queryInput.value = suggestion;
      suggestions.value = [];
      executeQuery();
    };
    
    const executeQuery = async () => {
      if (!queryInput.value.trim()) return;
      
      loading.value = true;
      suggestions.value = [];
      
      try {
        // 解析查询意图
        currentIntent.value = nlpService.processQuery(queryInput.value);
        
        // 根据意图类型执行不同操作
        if (currentIntent.value.action === 'query') {
          // 示例查询结果
          await executeDataQuery();
        } else if (currentIntent.value.action === 'analyze') {
          // 执行分析操作
          await executeAnalysisAction();
        } else if (currentIntent.value.action === 'recommend') {
          // 获取推荐
          await executeRecommendationAction();
        }
        
      } catch (error) {
        console.error('执行查询失败:', error);
      } finally {
        loading.value = false;
      }
    };
    
    // 执行数据查询
    const executeDataQuery = async () => {
      // 示例查询结果 - 实际应用中应从API获取
      queryResults.value = getMockQueryResults(currentIntent.value);
    };
    
    // 执行分析操作
    const executeAnalysisAction = async () => {
      if (currentIntent.value.entity === 'risk') {
        showRiskAnalysis.value = true;
      } else if (currentIntent.value.entity === 'trend') {
        showTrendPrediction.value = true;
      } else if (currentIntent.value.entity === 'anomaly') {
        showAnomalyDetection.value = true;
      }
    };
    
    // 执行推荐操作
    const executeRecommendationAction = async () => {
      // 示例 - 获取推荐
      recommendations.value = await recommendationService.getTopRecommendations(5);
      showRecommendations.value = true;
    };
    
    // 处理卡片操作
    const handleRiskAction = (action) => {
      console.log('风险分析操作:', action);
      // 实现风险操作的处理逻辑
    };
    
    const handleTrendAction = (action) => {
      console.log('趋势预测操作:', action);
      // 实现趋势操作的处理逻辑
    };
    
    const handleAnomalyAction = (action) => {
      console.log('异常检测操作:', action);
      // 实现异常操作的处理逻辑
    };
    
    const handleRecommendationAction = (action, recommendationId) => {
      console.log('推荐操作:', action, recommendationId);
      // 实现推荐操作的处理逻辑
    };
    
    // 格式化方法
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    
    const formatStatus = (status) => {
      const statusMap = {
        'normal': '正常',
        'frozen': '冻结',
        'inspection': '检验中'
      };
      return statusMap[status] || status;
    };
    
    const formatRiskLevel = (level) => {
      const levelMap = {
        'low': '低风险',
        'medium': '中风险',
        'high': '高风险'
      };
      return levelMap[level] || level;
    };
    
    const formatSeverity = (severity) => {
      const severityMap = {
        'low': '轻微',
        'medium': '一般',
        'high': '严重',
        'critical': '紧急'
      };
      return severityMap[severity] || severity;
    };
    
    const formatTestResult = (result) => {
      const resultMap = {
        'pass': '通过',
        'fail': '不通过',
        'warning': '警告'
      };
      return resultMap[result] || result;
    };
    
    const countPassedItems = (items) => {
      if (!items || !Array.isArray(items)) return 0;
      return items.filter(item => item.result === 'pass').length;
    };
    
    // 加载模拟数据
    const loadMockData = () => {
      // 风险分析数据
      riskData.value = {
        materialCode: 'M12345',
        batchNumber: 'B20230501',
        riskLevel: 'medium',
        riskScore: 58,
        riskFactors: [
          { factor: '物料质量评分', contribution: 0.25 },
          { factor: '历史异常记录', contribution: 0.15 },
          { factor: '供应商可靠性', contribution: 0.18 }
        ],
        projectedIssues: [
          { issue: '尺寸规格问题', probability: 0.65 },
          { issue: '外观缺陷', probability: 0.40 }
        ]
      };
      showRiskAnalysis.value = true;
      
      // 趋势预测数据
      trendData.value = {
        predictedAnomalies: 12,
        historicalAverage: 8,
        trend: 'increasing',
        confidenceLevel: 0.85,
        timeframe: '未来30天',
        categories: [
          { name: '尺寸问题', count: 5, percentage: 41.7 },
          { name: '外观缺陷', count: 3, percentage: 25.0 },
          { name: '功能异常', count: 2, percentage: 16.7 },
          { name: '其他', count: 2, percentage: 16.7 }
        ]
      };
      showTrendPrediction.value = true;
      
      // 异常检测数据
      anomalyData.value = [
        {
          entityType: 'inventory',
          entityId: 'INV123',
          anomalyType: 'low_quality_score',
          confidence: 0.89,
          suggestedActions: [
            '建议增加抽检比例',
            '检查供应商质量体系'
          ]
        },
        {
          entityType: 'labTest',
          entityId: 'LT456',
          anomalyType: 'critical_test_item_failure',
          confidence: 0.95,
          suggestedActions: [
            '立即冻结相关批次',
            '通知生产部门停止使用'
          ]
        }
      ];
      showAnomalyDetection.value = true;
    };
    
    // 模拟查询结果
    const getMockQueryResults = (intent) => {
      // 根据意图返回不同的模拟数据
      if (intent.entity === 'inventory') {
        return [
          {
            type: 'inventory',
            id: 'INV001',
            materialCode: 'M12345',
            materialName: '标准螺丝5mm',
            batchNumber: 'B20230501',
            quantity: 5000,
            status: 'normal',
            location: 'A区-12-3',
            supplier: '优质五金供应商',
            riskLevel: 'low'
          },
          {
            type: 'inventory',
            id: 'INV002',
            materialCode: 'M12346',
            materialName: '标准螺丝8mm',
            batchNumber: 'B20230502',
            quantity: 3000,
            status: 'inspection',
            location: 'A区-12-4',
            supplier: '优质五金供应商',
            riskLevel: 'medium'
          }
        ];
      } else if (intent.entity === 'anomaly') {
        return [
          {
            type: 'anomaly',
            id: 'ANO001',
            date: new Date('2023-05-10'),
            productionLine: 'A线-1',
            materialCode: 'M12345',
            batchNumber: 'B20230501',
            anomalyType: '尺寸规格问题',
            severity: 'medium',
            description: '螺丝直径超出公差范围'
          },
          {
            type: 'anomaly',
            id: 'ANO002',
            date: new Date('2023-05-12'),
            productionLine: 'B线-2',
            materialCode: 'M12346',
            batchNumber: 'B20230502',
            anomalyType: '外观缺陷',
            severity: 'low',
            description: '表面镀层不均匀'
          }
        ];
      } else if (intent.entity === 'labTest') {
        return [
          {
            type: 'labTest',
            id: 'LT001',
            date: new Date('2023-05-09'),
            materialCode: 'M12345',
            materialName: '标准螺丝5mm',
            batchNumber: 'B20230501',
            testType: '尺寸检测',
            inspector: '张工',
            overallResult: 'pass',
            testItems: [
              { name: '直径', result: 'pass' },
              { name: '长度', result: 'pass' },
              { name: '螺纹间距', result: 'pass' }
            ]
          },
          {
            type: 'labTest',
            id: 'LT002',
            date: new Date('2023-05-11'),
            materialCode: 'M12346',
            materialName: '标准螺丝8mm',
            batchNumber: 'B20230502',
            testType: '强度测试',
            inspector: '李工',
            overallResult: 'fail',
            testItems: [
              { name: '抗拉强度', result: 'pass' },
              { name: '抗弯强度', result: 'fail' },
              { name: '硬度', result: 'pass' }
            ]
          }
        ];
      }
      
      return [];
    };
    
    return {
      loading,
      queryInput,
      suggestions,
      currentIntent,
      intentDescription,
      queryResults,
      riskData,
      trendData,
      anomalyData,
      recommendations,
      showRiskAnalysis,
      showTrendPrediction,
      showAnomalyDetection,
      showRecommendations,
      refreshInsights,
      handleQueryInput,
      selectSuggestion,
      executeQuery,
      handleRiskAction,
      handleTrendAction,
      handleAnomalyAction,
      handleRecommendationAction,
      formatDate,
      formatStatus,
      formatRiskLevel,
      formatSeverity,
      formatTestResult,
      countPassedItems
    };
  }
};
</script>

<style scoped>
.ai-insights-panel {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eaeaea;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.refresh-btn {
  background-color: #f5f5f5;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.refresh-btn:hover {
  background-color: #e8e8e8;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  flex-grow: 1;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.panel-content {
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.nlp-query-section {
  position: relative;
}

.query-input-container {
  display: flex;
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

.query-input {
  flex-grow: 1;
  padding: 0.75rem 1rem;
  border: none;
  outline: none;
  font-size: 1rem;
}

.query-btn {
  background-color: #4285f4;
  color: white;
  border: none;
  padding: 0 1.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.query-btn:hover {
  background-color: #3367d6;
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 6px 6px;
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background-color: #f5f5f5;
}

.current-intent {
  background-color: #f8f9fa;
  padding: 0.75rem 1rem;
  border-radius: 6px;
}

.intent-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.intent-label {
  font-weight: 500;
  color: #555;
}

.intent-description {
  color: #333;
}

.insights-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.query-results {
  margin-top: 1rem;
}

.query-results h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.results-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-item {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
}

.result-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.result-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.detail-item .label {
  color: #666;
  min-width: 100px;
}

.status-normal {
  color: #28a745;
}

.status-frozen {
  color: #dc3545;
}

.status-inspection {
  color: #ffc107;
}

.risk-low {
  color: #28a745;
}

.risk-medium {
  color: #ffc107;
}

.risk-high {
  color: #dc3545;
}

.severity-low {
  color: #28a745;
}

.severity-medium {
  color: #ffc107;
}

.severity-high {
  color: #fd7e14;
}

.severity-critical {
  color: #dc3545;
}

.result-pass {
  color: #28a745;
}

.result-fail {
  color: #dc3545;
}

.result-warning {
  color: #ffc107;
}
</style> 