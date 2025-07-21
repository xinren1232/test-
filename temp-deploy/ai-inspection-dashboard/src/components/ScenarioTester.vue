<template>
  <div class="scenario-tester">
    <div class="tester-header">
      <div class="scenario-info">
        <span class="scenario-icon">{{ scenario.icon }}</span>
        <div class="scenario-details">
          <h3>{{ scenario.name }}</h3>
          <p>{{ scenario.description }}</p>
        </div>
      </div>
    </div>

    <div class="test-area">
      <div class="test-input">
        <h4>测试问题</h4>
        <el-select 
          v-model="selectedQuestion" 
          placeholder="选择预设问题或输入自定义问题"
          style="width: 100%; margin-bottom: 12px;"
          @change="handleQuestionSelect"
        >
          <el-option 
            v-for="question in testQuestions" 
            :key="question.id"
            :label="question.text"
            :value="question.id"
          />
        </el-select>
        
        <el-input
          v-model="testQuestion"
          type="textarea"
          :rows="3"
          placeholder="请输入测试问题..."
          style="margin-bottom: 12px;"
        />
        
        <el-button 
          type="primary" 
          @click="runTest"
          :loading="testing"
          :disabled="!testQuestion.trim()"
        >
          {{ testing ? '测试中...' : '开始测试' }}
        </el-button>
      </div>

      <div class="test-results" v-if="testResults.length > 0">
        <h4>测试结果</h4>
        
        <div 
          v-for="(result, index) in testResults" 
          :key="index"
          class="test-result-item"
        >
          <div class="result-header">
            <span class="result-question">{{ result.question }}</span>
            <span class="result-time">{{ formatTime(result.timestamp) }}</span>
          </div>
          
          <div class="result-analysis">
            <div class="analysis-section">
              <h5>场景识别</h5>
              <div class="analysis-content">
                <span class="confidence-badge" :class="getConfidenceClass(result.analysis.confidence)">
                  置信度: {{ result.analysis.confidence }}%
                </span>
                <span class="recommended-scenario">
                  推荐场景: {{ result.analysis.recommendedScenario }}
                </span>
              </div>
            </div>
            
            <div class="analysis-section">
              <h5>数据源分析</h5>
              <div class="analysis-content">
                <div class="data-sources">
                  <span 
                    v-for="source in result.analysis.dataSources" 
                    :key="source"
                    class="source-tag"
                  >
                    {{ getSourceName(source) }}
                  </span>
                </div>
                <div class="query-strategy">
                  策略: {{ result.analysis.queryStrategy }}
                </div>
              </div>
            </div>
            
            <div class="analysis-section">
              <h5>提取实体</h5>
              <div class="analysis-content">
                <div class="entities">
                  <span 
                    v-for="(value, key) in result.analysis.entities" 
                    :key="key"
                    class="entity-tag"
                  >
                    {{ key }}: {{ value }}
                  </span>
                  <span v-if="Object.keys(result.analysis.entities).length === 0" class="no-entities">
                    未识别到实体
                  </span>
                </div>
              </div>
            </div>
            
            <div class="analysis-section">
              <h5>AI配置预览</h5>
              <div class="analysis-content">
                <div class="config-preview">
                  <div class="config-item">
                    <span class="config-label">思考方式:</span>
                    <span class="config-value">{{ getThinkingStyleName(scenario.thinkingStyle) }}</span>
                  </div>
                  <div class="config-item">
                    <span class="config-label">分析深度:</span>
                    <span class="config-value">{{ getAnalysisDepthName(scenario.analysisDepth) }}</span>
                  </div>
                  <div class="config-item">
                    <span class="config-label">最大Token:</span>
                    <span class="config-value">{{ scenario.maxTokens }}</span>
                  </div>
                  <div class="config-item">
                    <span class="config-label">温度:</span>
                    <span class="config-value">{{ scenario.temperature }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="analysis-section">
              <h5>生成的提示词</h5>
              <div class="analysis-content">
                <div class="prompt-preview">{{ result.generatedPrompt }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="tester-footer">
      <el-button @click="clearResults">清空结果</el-button>
      <el-button @click="$emit('close')">关闭</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { dataSourceAnalyzer } from '../services/DataSourceAnalyzer.js'
import { aiPromptManager } from '../services/AIPromptManager.js'
import { aiScenarioManager } from '../services/AIScenarioManager.js'

// Props
const props = defineProps({
  scenario: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['close'])

// 响应式数据
const testQuestion = ref('')
const selectedQuestion = ref('')
const testing = ref(false)
const testResults = ref([])

// 预设测试问题
const testQuestions = [
  { id: 'inventory1', text: '查询电池盖的库存情况', category: 'inventory' },
  { id: 'inventory2', text: '深圳工厂有哪些风险库存？', category: 'inventory' },
  { id: 'quality1', text: '分析最近的质量趋势变化', category: 'quality' },
  { id: 'quality2', text: '检查是否有质量异常', category: 'quality' },
  { id: 'production1', text: '对比各工厂的生产效率', category: 'production' },
  { id: 'production2', text: '分析生产线的不良率情况', category: 'production' },
  { id: 'risk1', text: '识别当前的主要风险点', category: 'risk' },
  { id: 'decision1', text: '提供质量改进的决策建议', category: 'decision' },
  { id: 'comprehensive', text: '全面分析电池盖的库存、生产和检测情况', category: 'comprehensive' }
]

// 方法
const handleQuestionSelect = (questionId) => {
  const question = testQuestions.find(q => q.id === questionId)
  if (question) {
    testQuestion.value = question.text
  }
}

const runTest = async () => {
  if (!testQuestion.value.trim()) {
    ElMessage.warning('请输入测试问题')
    return
  }

  testing.value = true

  try {
    // 1. 分析问题和数据源
    const dataAnalysis = dataSourceAnalyzer.analyzeDataSources(testQuestion.value)
    
    // 2. 场景推荐
    const scenarioRecommendation = aiScenarioManager.recommendScenario(testQuestion.value)
    
    // 3. 模拟数据查询
    const mockQueryResults = {
      sources: {},
      summary: { dataQuality: 'good', keyFindings: ['模拟数据查询结果'] },
      totalRecords: Math.floor(Math.random() * 100) + 10
    }
    
    // 4. 生成AI提示词
    const generatedPrompt = aiPromptManager.buildAnalysisPrompt(
      testQuestion.value, 
      dataAnalysis, 
      mockQueryResults
    )
    
    // 5. 创建测试结果
    const testResult = {
      question: testQuestion.value,
      timestamp: new Date(),
      analysis: {
        confidence: dataAnalysis.confidence,
        recommendedScenario: scenarioRecommendation.scenario.name,
        dataSources: dataAnalysis.involvedSources,
        queryStrategy: dataAnalysis.queryStrategy,
        entities: dataAnalysis.extractedEntities
      },
      generatedPrompt: generatedPrompt,
      scenarioUsed: props.scenario
    }
    
    testResults.value.unshift(testResult)
    
    ElMessage.success('测试完成')
    
  } catch (error) {
    console.error('测试失败:', error)
    ElMessage.error('测试失败: ' + error.message)
  } finally {
    testing.value = false
  }
}

const clearResults = () => {
  testResults.value = []
  ElMessage.success('已清空测试结果')
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

const getConfidenceClass = (confidence) => {
  if (confidence >= 80) return 'high'
  if (confidence >= 60) return 'medium'
  return 'low'
}

const getSourceName = (source) => {
  const names = {
    inventory: '库存数据',
    production: '生产数据',
    inspection: '检测数据',
    batch: '批次数据'
  }
  return names[source] || source
}

const getThinkingStyleName = (style) => {
  const names = {
    systematic: '系统性思考',
    analytical: '分析性思考',
    methodical: '方法论思考',
    efficiency_focused: '效率导向',
    risk_oriented: '风险导向',
    strategic: '战略性思考'
  }
  return names[style] || style
}

const getAnalysisDepthName = (depth) => {
  const names = {
    standard: '标准分析',
    deep: '深度分析',
    operational: '运营分析',
    comprehensive: '综合分析',
    executive: '高管分析'
  }
  return names[depth] || depth
}
</script>

<style scoped>
.scenario-tester {
  max-height: 600px;
  overflow-y: auto;
}

.tester-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.scenario-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.scenario-icon {
  font-size: 24px;
}

.scenario-details h3 {
  margin: 0 0 4px 0;
  color: #333;
}

.scenario-details p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.test-area {
  margin-bottom: 24px;
}

.test-input h4,
.test-results h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
}

.test-result-item {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.result-question {
  font-weight: 600;
  color: #333;
}

.result-time {
  color: #999;
  font-size: 12px;
}

.analysis-section {
  margin-bottom: 16px;
}

.analysis-section h5 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.analysis-content {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
}

.confidence-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  margin-right: 12px;
}

.confidence-badge.high {
  background: #d4edda;
  color: #155724;
}

.confidence-badge.medium {
  background: #fff3cd;
  color: #856404;
}

.confidence-badge.low {
  background: #f8d7da;
  color: #721c24;
}

.recommended-scenario {
  color: #333;
  font-weight: 500;
}

.data-sources,
.entities {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.source-tag,
.entity-tag {
  background: #e8f4fd;
  color: #409eff;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.entity-tag {
  background: #f0f9ff;
  color: #0369a1;
}

.no-entities {
  color: #999;
  font-style: italic;
  font-size: 12px;
}

.query-strategy {
  color: #666;
  font-size: 13px;
}

.config-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
}

.config-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.config-label {
  color: #666;
}

.config-value {
  color: #333;
  font-weight: 500;
}

.prompt-preview {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
}

.tester-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}
</style>
