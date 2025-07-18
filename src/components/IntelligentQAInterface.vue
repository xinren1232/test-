<template>
  <div class="intelligent-qa-interface">
    <!-- 头部区域 -->
    <div class="qa-header">
      <h2>🤖 QMS智能助手</h2>
      <p class="subtitle">基于真实数据的智能问答系统</p>
    </div>

    <!-- 功能介绍卡片 -->
    <div class="capabilities-section" v-if="!hasStartedChat">
      <div class="capability-cards">
        <div class="capability-card" v-for="capability in capabilities" :key="capability.type">
          <div class="card-icon">{{ capability.icon }}</div>
          <h3>{{ capability.title }}</h3>
          <p>{{ capability.description }}</p>
          <div class="examples">
            <span 
              v-for="example in capability.examples" 
              :key="example"
              class="example-tag"
              @click="askQuestion(example)"
            >
              {{ example }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 对话区域 -->
    <div class="chat-container" ref="chatContainer">
      <div class="chat-messages">
        <div 
          v-for="(message, index) in messages" 
          :key="index"
          class="message"
          :class="{ 'user-message': message.type === 'user', 'bot-message': message.type === 'bot' }"
        >
          <div class="message-content">
            <div class="message-text" v-html="formatMessage(message.content)"></div>
            
            <!-- 图表展示区域 -->
            <div v-if="message.charts && message.charts.length > 0" class="charts-section">
              <h4>📊 数据可视化</h4>
              <div class="charts-grid">
                <div 
                  v-for="(chart, chartIndex) in message.charts" 
                  :key="chartIndex"
                  class="chart-container"
                >
                  <h5>{{ chart.title }}</h5>
                  <canvas
                    :data-ref="`chart-${index}-${chartIndex}`"
                    class="chart-canvas"
                  ></canvas>
                </div>
              </div>
            </div>

            <!-- 数据表格区域 -->
            <div v-if="message.tableData" class="table-section">
              <div class="data-table">
                <table>
                  <thead>
                    <tr>
                      <th v-for="header in message.tableData.headers" :key="header">
                        {{ header }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, rowIndex) in message.tableData.rows" :key="rowIndex">
                      <td v-for="(cell, cellIndex) in row" :key="cellIndex">
                        {{ cell }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-section">
      <!-- 快速建议 -->
      <div class="suggestions" v-if="suggestions.length > 0 && !isLoading">
        <span class="suggestions-label">💡 建议查询：</span>
        <span 
          v-for="suggestion in suggestions.slice(0, 4)" 
          :key="suggestion"
          class="suggestion-tag"
          @click="askQuestion(suggestion)"
        >
          {{ suggestion }}
        </span>
      </div>

      <!-- 输入框 -->
      <div class="input-container">
        <input
          v-model="currentQuestion"
          @keyup.enter="handleSubmit"
          @input="handleInputChange"
          placeholder="请输入您的问题，例如：BOE供应商有哪些物料？"
          class="question-input"
          :disabled="isLoading"
        />
        <button 
          @click="handleSubmit"
          class="submit-button"
          :disabled="isLoading || !currentQuestion.trim()"
        >
          <span v-if="isLoading">🔄</span>
          <span v-else>📤</span>
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>正在分析您的问题...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick } from 'vue'
import Chart from 'chart.js/auto'

export default {
  name: 'IntelligentQAInterface',
  setup() {
    const currentQuestion = ref('')
    const messages = reactive([])
    const suggestions = reactive([])
    const isLoading = ref(false)
    const hasStartedChat = ref(false)
    const chatContainer = ref(null)

    // 系统能力介绍
    const capabilities = reactive([
      {
        type: 'supplier',
        icon: '🏭',
        title: '供应商分析',
        description: '查询供应商的物料分布、质量情况和综合表现',
        examples: ['BOE供应商有哪些物料', '聚龙的库存情况']
      },
      {
        type: 'material',
        icon: '📦',
        title: '物料管理',
        description: '分析物料的供应商分布、库存状态和质量数据',
        examples: ['LCD显示屏有哪些供应商', '电池盖的库存分布']
      },
      {
        type: 'factory',
        icon: '🏢',
        title: '工厂概览',
        description: '查看工厂的库存分布、状态统计和运营情况',
        examples: ['深圳工厂的库存情况', '重庆工厂有哪些物料']
      },
      {
        type: 'quality',
        icon: '🔍',
        title: '质量分析',
        description: '分析测试数据、缺陷统计和质量趋势',
        examples: ['质量分析报告', '风险状态的物料']
      },
      {
        type: 'trend',
        icon: '📈',
        title: '趋势分析',
        description: '查看时间趋势、对比分析和综合统计',
        examples: ['最近的测试趋势', '供应商对比分析']
      }
    ])

    // 处理问题提交
    const handleSubmit = async () => {
      if (!currentQuestion.value.trim() || isLoading.value) return

      const question = currentQuestion.value.trim()
      hasStartedChat.value = true

      // 添加用户消息
      messages.push({
        type: 'user',
        content: question,
        timestamp: new Date()
      })

      currentQuestion.value = ''
      isLoading.value = true

      try {
        // 调用真实数据智能查询API
        const response = await fetch('http://localhost:3001/api/assistant/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: question })
        })

        const result = await response.json()

        if (result.success) {
          // 构建回复内容
          let content = result.message || '查询完成'

          // 如果有表格数据，添加到回复中
          if (result.tableData && result.tableData.length > 0) {
            content += `\n\n📊 **查询结果** (共${result.tableData.length}条记录)\n`
            content += `匹配规则: ${result.matchedRule}\n\n`

            // 显示前5条数据作为预览
            const previewData = result.tableData.slice(0, 5)
            content += '**数据预览:**\n'
            previewData.forEach((item, index) => {
              content += `${index + 1}. `
              Object.entries(item).forEach(([key, value], i) => {
                if (i < 4) { // 只显示前4个字段
                  content += `${key}: ${value}${i < 3 ? ', ' : ''}`
                }
              })
              content += '\n'
            })

            if (result.tableData.length > 5) {
              content += `... 还有${result.tableData.length - 5}条记录\n`
            }
          }

          // 如果有统计卡片，添加到回复中
          if (result.cards && result.cards.length > 0) {
            content += '\n**📈 统计信息:**\n'
            result.cards.forEach(card => {
              content += `${card.icon} ${card.title}: ${card.value}\n`
            })
          }

          // 添加机器人回复
          const botMessage = {
            type: 'bot',
            content: content,
            charts: [],
            analysis: {
              type: 'data_query',
              matchedRule: result.matchedRule,
              dataCount: result.tableData ? result.tableData.length : 0
            },
            rawData: result, // 保存原始数据
            timestamp: new Date()
          }

          messages.push(botMessage)

          // 获取新的建议
          await loadSuggestions(question)
        } else {
          messages.push({
            type: 'bot',
            content: result.message || '抱歉，处理您的问题时出现了错误。',
            timestamp: new Date()
          })
        }
      } catch (error) {
        console.error('问答请求失败:', error)
        messages.push({
          type: 'bot',
          content: '抱歉，系统暂时无法处理您的问题，请稍后再试。',
          timestamp: new Date()
        })
      } finally {
        isLoading.value = false
        scrollToBottom()
      }
    }

    // 渲染图表
    const renderCharts = (charts, messageIndex) => {
      charts.forEach((chartData, chartIndex) => {
        const canvasRef = `chart-${messageIndex}-${chartIndex}`
        const canvas = document.querySelector(`[data-ref="${canvasRef}"]`)
        
        if (canvas) {
          new Chart(canvas, {
            type: chartData.type,
            data: chartData.data,
            options: {
              ...chartData.config,
              responsive: true,
              maintainAspectRatio: false
            }
          })
        }
      })
    }

    // 加载查询建议
    const loadSuggestions = async (query = '') => {
      try {
        const response = await fetch(`/api/intelligent-qa/suggestions?query=${encodeURIComponent(query)}`)
        const result = await response.json()
        
        if (result.success) {
          suggestions.splice(0, suggestions.length, ...result.data.suggestions)
        }
      } catch (error) {
        console.error('加载建议失败:', error)
      }
    }

    // 处理输入变化
    const handleInputChange = () => {
      // 可以在这里添加实时建议功能
    }

    // 快速提问
    const askQuestion = (question) => {
      currentQuestion.value = question
      handleSubmit()
    }

    // 格式化消息内容
    const formatMessage = (content) => {
      // 将Markdown表格转换为HTML
      return content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
    }

    // 格式化时间
    const formatTime = (timestamp) => {
      return timestamp.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 滚动到底部
    const scrollToBottom = () => {
      nextTick(() => {
        if (chatContainer.value) {
          chatContainer.value.scrollTop = chatContainer.value.scrollHeight
        }
      })
    }

    // 初始化
    onMounted(() => {
      loadSuggestions()
    })

    return {
      currentQuestion,
      messages,
      suggestions,
      isLoading,
      hasStartedChat,
      capabilities,
      chatContainer,
      handleSubmit,
      handleInputChange,
      askQuestion,
      formatMessage,
      formatTime
    }
  }
}
</script>

<style scoped>
.intelligent-qa-interface {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
}

.qa-header {
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.qa-header h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
}

.subtitle {
  margin: 5px 0 0 0;
  color: #7f8c8d;
  font-size: 14px;
}

.capabilities-section {
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
}

.capability-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.capability-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.capability-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.capability-card h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 18px;
}

.capability-card p {
  margin: 0 0 15px 0;
  color: #7f8c8d;
  font-size: 14px;
  line-height: 1.5;
}

.examples {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.example-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.example-tag:hover {
  background: #bbdefb;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
}

.chat-messages {
  max-width: 800px;
  margin: 0 auto;
}

.message {
  margin-bottom: 20px;
}

.user-message .message-content {
  background: #2196f3;
  color: white;
  margin-left: 20%;
  border-radius: 18px 18px 4px 18px;
}

.bot-message .message-content {
  background: white;
  color: #333;
  margin-right: 20%;
  border-radius: 18px 18px 18px 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.message-content {
  padding: 15px 20px;
}

.message-text {
  line-height: 1.6;
}

.charts-section {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.chart-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
}

.chart-canvas {
  height: 300px !important;
}

.message-time {
  font-size: 12px;
  color: #999;
  text-align: right;
  margin-top: 5px;
}

.input-section {
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.suggestions {
  margin-bottom: 15px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.suggestions-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.suggestion-tag {
  background: #f0f0f0;
  color: #666;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-tag:hover {
  background: #e0e0e0;
  color: #333;
}

.input-container {
  display: flex;
  gap: 10px;
  max-width: 800px;
  margin: 0 auto;
}

.question-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.question-input:focus {
  border-color: #2196f3;
}

.submit-button {
  padding: 12px 20px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.submit-button:hover:not(:disabled) {
  background: #1976d2;
}

.submit-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2196f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.data-table {
  margin-top: 15px;
  overflow-x: auto;
}

.data-table table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.data-table tr:hover {
  background: #f8f9fa;
}
</style>
