<template>
  <div class="qa-test-page">
    <div class="page-header">
      <h1>🧪 智能问答功能测试</h1>
      <p>测试优化后的规则和呈现效果</p>
    </div>

    <div class="test-container">
      <!-- 左侧：测试规则列表 -->
      <div class="test-rules-panel">
        <h3>📋 测试规则</h3>
        <div class="rule-categories">
          <div v-for="(category, key) in testRules" :key="key" class="rule-category">
            <h4>{{ category.title }}</h4>
            <div 
              v-for="rule in category.rules" 
              :key="rule.name"
              class="rule-item"
              :class="{ active: selectedRule?.name === rule.name }"
              @click="selectRule(rule)"
            >
              <span class="rule-icon">{{ rule.icon }}</span>
              <span class="rule-name">{{ rule.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：测试结果展示 -->
      <div class="test-results-panel">
        <div v-if="!selectedRule" class="no-selection">
          <div class="empty-state">
            <span class="empty-icon">🎯</span>
            <h3>选择一个规则开始测试</h3>
            <p>点击左侧规则列表中的任意规则进行测试</p>
          </div>
        </div>

        <div v-else class="test-content">
          <!-- 测试信息 -->
          <div class="test-info">
            <h3>{{ selectedRule.icon }} {{ selectedRule.name }}</h3>
            <p class="test-query">测试查询: {{ selectedRule.query }}</p>
            <button 
              @click="runTest" 
              :disabled="testing"
              class="test-button"
            >
              {{ testing ? '测试中...' : '🚀 运行测试' }}
            </button>
          </div>

          <!-- 测试结果 -->
          <div v-if="testResult" class="test-result">
            <!-- 基本信息 -->
            <div class="result-header">
              <span class="result-status" :class="testResult.success ? 'success' : 'error'">
                {{ testResult.success ? '✅ 测试成功' : '❌ 测试失败' }}
              </span>
              <span class="result-time">耗时: {{ testResult.duration }}ms</span>
              <span class="result-count">结果: {{ testResult.count }}条</span>
            </div>

            <!-- 错误信息 -->
            <div v-if="!testResult.success" class="error-message">
              <h4>❌ 错误信息:</h4>
              <pre>{{ testResult.error }}</pre>
            </div>

            <!-- 成功结果展示 -->
            <div v-else class="success-result">
              <!-- 表格展示 -->
              <div v-if="testResult.presentation.type === 'table'" class="table-presentation">
                <h4>📊 {{ testResult.presentation.title }}</h4>
                <div class="table-container">
                  <table class="result-table">
                    <thead>
                      <tr>
                        <th v-for="col in testResult.presentation.columns" :key="col.key">
                          {{ col.title }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, index) in testResult.presentation.data" :key="index">
                        <td v-for="col in testResult.presentation.columns" :key="col.key">
                          {{ row[col.key] }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-if="testResult.presentation.hasMore" class="table-footer">
                  显示前10条，共{{ testResult.presentation.total }}条数据
                </div>
              </div>

              <!-- 统计卡片展示 -->
              <div v-if="testResult.presentation.type === 'stat_cards'" class="cards-presentation">
                <h4>📈 {{ testResult.presentation.title }}</h4>
                <div class="stat-cards">
                  <div 
                    v-for="card in testResult.presentation.cards" 
                    :key="card.id"
                    class="stat-card"
                    :style="{ borderColor: card.color }"
                  >
                    <div class="card-header">
                      <span class="card-title">{{ card.title }}</span>
                      <span class="card-trend" :class="card.trend">
                        {{ card.trend === 'up' ? '📈' : card.trend === 'down' ? '📉' : '➡️' }}
                      </span>
                    </div>
                    <div class="card-value">
                      <span class="value">{{ card.value }}</span>
                      <span class="unit">{{ card.unit }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 图表展示 -->
              <div v-if="testResult.presentation.type === 'chart'" class="chart-presentation">
                <h4>📊 {{ testResult.presentation.title }}</h4>
                <div 
                  :id="testResult.presentation.containerId" 
                  class="chart-container"
                  style="width: 100%; height: 400px;"
                ></div>
              </div>

              <!-- 组合展示 -->
              <div v-if="testResult.presentation.type === 'combined'" class="combined-presentation">
                <h4>🎯 {{ testResult.presentation.title }}</h4>
                <div class="combined-components">
                  <div 
                    v-for="(component, index) in testResult.presentation.components" 
                    :key="index"
                    class="component-item"
                  >
                    <!-- 递归渲染组件 -->
                    <component 
                      :is="getComponentType(component.type)" 
                      :data="component"
                      @chart-ready="handleChartReady"
                    />
                  </div>
                </div>
              </div>

              <!-- 消息展示 -->
              <div v-if="testResult.presentation.type === 'message'" class="message-presentation">
                <div class="message-content">
                  <span class="message-icon">{{ testResult.presentation.icon }}</span>
                  <h4>{{ testResult.presentation.title }}</h4>
                  <p>{{ testResult.presentation.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { qaPresentation } from '../utils/enhancedQAPresentation.js'
import axios from 'axios'

// 响应式数据
const selectedRule = ref(null)
const testing = ref(false)
const testResult = ref(null)

// 测试规则定义
const testRules = reactive({
  basic: {
    title: '🔧 基础查询规则',
    rules: [
      { name: '物料库存查询', query: '查询电池库存', icon: '🔋' },
      { name: '供应商库存查询', query: '查询BOE供应商库存', icon: '🏢' },
      { name: 'NG测试结果查询', query: '查询测试失败(NG)的记录', icon: '❌' },
      { name: '风险库存查询', query: '查询风险状态的库存', icon: '⚠️' },
      { name: '物料测试情况查询', query: '查询LCD显示屏测试情况', icon: '🧪' },
      { name: '数据范围提示', query: '系统支持查询哪些数据', icon: '💡' }
    ]
  },
  advanced: {
    title: '🚀 高级分析规则',
    rules: [
      { name: 'Top缺陷排行查询', query: '查询Top缺陷排行', icon: '🏆' },
      { name: '供应商对比分析', query: '对比聚龙和天马供应商表现', icon: '🏢' },
      { name: '物料对比分析', query: '对比电池和LCD显示屏质量表现', icon: '🔧' },
      { name: '精确物料查询', query: '精确查询电池（排除电池盖）', icon: '🎯' },
      { name: '智能物料匹配', query: '智能匹配显示相关物料', icon: '🧠' }
    ]
  }
})

// 选择规则
const selectRule = (rule) => {
  selectedRule.value = rule
  testResult.value = null
}

// 运行测试
const runTest = async () => {
  if (!selectedRule.value) return
  
  testing.value = true
  const startTime = Date.now()
  
  try {
    // 调用后端API进行测试
    const response = await axios.post('http://localhost:3001/api/assistant/query', {
      question: selectedRule.value.query,
      intent: selectedRule.value.name
    })
    
    const duration = Date.now() - startTime
    const data = response.data.data || []
    
    // 使用增强呈现系统格式化结果
    const presentation = qaPresentation.smartFormat(
      data, 
      selectedRule.value.name, 
      selectedRule.value.name
    )
    
    testResult.value = {
      success: true,
      duration,
      count: data.length,
      data,
      presentation
    }
    
    // 如果有图表，需要在下一个tick渲染
    if (presentation.type === 'chart') {
      await nextTick()
      const container = document.getElementById(presentation.containerId)
      if (container) {
        qaPresentation.renderChart(presentation, container)
      }
    }
    
  } catch (error) {
    const duration = Date.now() - startTime
    testResult.value = {
      success: false,
      duration,
      count: 0,
      error: error.message || '测试失败'
    }
  } finally {
    testing.value = false
  }
}

// 获取组件类型
const getComponentType = (type) => {
  // 这里可以根据类型返回不同的组件
  return 'div'
}

// 处理图表就绪事件
const handleChartReady = (chartConfig) => {
  // 处理图表渲染
  console.log('Chart ready:', chartConfig)
}
</script>

<style scoped>
.qa-test-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.page-header p {
  color: #7f8c8d;
  font-size: 16px;
}

.test-container {
  display: flex;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.test-rules-panel {
  width: 300px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  height: fit-content;
}

.test-rules-panel h3 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.rule-category {
  margin-bottom: 20px;
}

.rule-category h4 {
  color: #34495e;
  margin-bottom: 10px;
  font-size: 14px;
}

.rule-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 5px;
}

.rule-item:hover {
  background: #ecf0f1;
}

.rule-item.active {
  background: #3498db;
  color: white;
}

.rule-icon {
  margin-right: 8px;
  font-size: 16px;
}

.rule-name {
  font-size: 14px;
}

.test-results-panel {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.no-selection {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  text-align: center;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 20px;
}

.test-info {
  border-bottom: 1px solid #ecf0f1;
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.test-info h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.test-query {
  color: #7f8c8d;
  margin-bottom: 15px;
  font-style: italic;
}

.test-button {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.test-button:hover:not(:disabled) {
  background: #2980b9;
}

.test-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.result-header {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.result-status.success {
  color: #27ae60;
  font-weight: bold;
}

.result-status.error {
  color: #e74c3c;
  font-weight: bold;
}

.result-time, .result-count {
  color: #7f8c8d;
  font-size: 14px;
}

.error-message {
  background: #fdf2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 20px;
}

.error-message h4 {
  color: #dc2626;
  margin-bottom: 10px;
}

.error-message pre {
  color: #7f1d1d;
  font-size: 12px;
  white-space: pre-wrap;
}

.table-container {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 10px;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
}

.result-table th {
  background: #f9fafb;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.result-table td {
  padding: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.result-table tr:hover {
  background: #f9fafb;
}

.table-footer {
  color: #6b7280;
  font-size: 14px;
  text-align: center;
  padding: 10px;
  background: #f9fafb;
  border-radius: 0 0 6px 6px;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.stat-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 15px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.card-title {
  font-size: 14px;
  color: #6b7280;
}

.card-value {
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.value {
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
}

.unit {
  font-size: 14px;
  color: #6b7280;
}

.chart-container {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-top: 15px;
}

.message-content {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.message-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 15px;
}
</style>
