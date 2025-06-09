<template>
  <div class="chat-panel">
    <div class="chat-header">
      <h3>IQE质量智能助手</h3>
      <div class="header-actions">
        <el-button type="text" @click="clearMessages">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <!-- 系统欢迎消息 -->
      <div class="message ai-message" v-if="messages.length === 0">
        <div class="message-avatar">
          <el-avatar :size="36" :src="aiAvatarBase64"></el-avatar>
        </div>
        <div class="message-content">
          <p v-html="welcomeMessage"></p>
          <div class="quick-actions">
            <el-button size="small" @click="handleSuggestion('查询最新不合格物料')">查询最新不合格物料</el-button>
            <el-button size="small" @click="handleSuggestion('今日生产线异常情况')">今日生产线异常情况</el-button>
            <el-button size="small" @click="handleSuggestion('分析近期质量趋势')">分析近期质量趋势</el-button>
          </div>
        </div>
      </div>

      <!-- 消息列表 -->
      <div v-for="(msg, index) in messages" :key="index" class="message" :class="[msg.role === 'user' ? 'user-message' : 'ai-message']">
        <div class="message-avatar">
          <el-avatar :size="36" :src="msg.role === 'user' ? userAvatarBase64 : aiAvatarBase64"></el-avatar>
        </div>
        <div class="message-content">
          <!-- 处理不同类型的消息 -->
          <div v-if="msg.role === 'assistant' && msg.isLoading" class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
          <div v-else-if="msg.type === 'chart'" class="chart-message">
            <p>{{ msg.content }}</p>
            <div class="chart-container" :id="`chart-${index}`"></div>
          </div>
          <div v-else-if="msg.type === 'table'" class="table-message">
            <el-table :data="msg.data" style="width: 100%" size="small">
              <el-table-column v-for="col in msg.columns" :key="col.prop" :prop="col.prop" :label="col.label"></el-table-column>
            </el-table>
          </div>
          <div v-else class="text-message" v-html="formatMessage(msg.content)"></div>
          
          <!-- 消息时间 -->
          <div class="message-time" v-if="msg.timestamp">
            {{ formatTime(msg.timestamp) }}
          </div>
          
          <!-- 建议回复 -->
          <div class="suggested-responses" v-if="msg.role === 'assistant' && msg.suggestedResponses && msg.suggestedResponses.length > 0">
            <el-button 
              v-for="(suggestion, idx) in msg.suggestedResponses" 
              :key="idx" 
              size="small" 
              @click="handleSuggestion(suggestion)">
              {{ suggestion }}
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="message-input">
      <el-input
        v-model="userInput"
        type="textarea"
        :rows="2"
        :placeholder="isProcessing ? '正在处理...' : '请输入您的问题...'"
        :disabled="isProcessing"
        resize="none"
        @keydown.enter.exact.prevent="sendMessage"
      />
      <div class="input-actions">
        <el-button 
          type="primary" 
          :icon="isProcessing ? 'Loading' : 'Position'" 
          :loading="isProcessing" 
          :disabled="!userInput.trim()" 
          @click="sendMessage">
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue';
import { Delete, Position, Loading } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import aiService from '../../services/ai/AIService';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { 
  TitleComponent, 
  TooltipComponent, 
  GridComponent, 
  DatasetComponent, 
  TransformComponent,
  LegendComponent
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

// 注册 echarts 组件
echarts.use([
  TitleComponent, 
  TooltipComponent, 
  GridComponent, 
  DatasetComponent, 
  TransformComponent,
  LegendComponent,
  BarChart, 
  LineChart, 
  PieChart,
  LabelLayout, 
  UniversalTransition, 
  CanvasRenderer
]);

export default {
  name: 'ChatPanel',
  components: {
    Delete, Position, Loading
  },
  setup() {
    const userInput = ref('');
    const messages = ref([]);
    const isProcessing = ref(false);
    const messagesContainer = ref(null);
    
    // Base64 编码的头像，避免文件访问问题
    const userAvatarBase64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzMzMzMzMyIgd2lkdGg9IjI0cHgiIGhlaWdodD0iMjRweCI+PHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0xMiAxMmMtMS42NTYgMC0zLTEuMzQ0LTMtM3MxLjM0NC0zIDMtMyAzIDEuMzQ0IDMgMy0xLjM0NCAzLTMgM3ptMCAyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptNi0xMmg0djEyaC00di0xMnptLTYgMTVjLTMuMzEzIDAtNi0yLjY4Ny02LTZoMTJjMCAzLjMxMy0yLjY4NyA2LTYgNnoiLz48L3N2Zz4=';
    const aiAvatarBase64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzQwOWVmZiIgd2lkdGg9IjI0cHgiIGhlaWdodD0iMjRweCI+PHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0xMiAyYzUuNTIgMCAxMCA0LjQ4IDEwIDEwcy00LjQ4IDEwLTEwIDEwLTEwLTQuNDgtMTAtMTAgNC40OC0xMCAxMC0xMHptMCAxNXYtMkg3djJoNXptLTYuMi02LjQ2bDEuNDEtMS40MUEzLjk4IDMuOTggMCAwIDEgMTIgOGMxLjQ4IDAgMi45LjgxIDMuNjMgMi4xMUE1IDUgMCAwIDEgMTIgMTdhNC45OCA0Ljk4IDAgMCAxLTQuOTgtNUg5YzAgMS42NiAxLjM0IDMgMyAzczMtMS4zNCAzLTNjMC0uNzEtLjI3LTEuMzctLjcxLTEuODlMMTMgOC44OHYyLjgzaC0yVjhoNC4yOGwxLjcyLTEuNzJMMTUuODggMmgtMS41OXY0LjI4TDEyIDguMDhsLTIuMi0yLjJ2LS44N2wtMS40LTEuNCAxLjQtMS40MUwxMCAzLjUyVjJIOVgiLz48L3N2Zz4=';
    
    // 欢迎消息
    const welcomeMessage = '您好，我是IQE智能质检助手，有什么可以帮您的？我可以帮您查询物料信息、质检结果和生产异常情况，也可以进行数据分析和预测。';
    
    // 发送消息
    const sendMessage = async () => {
      const input = userInput.value.trim();
      if (!input || isProcessing.value) return;
      
      // 添加用户消息
      messages.value.push({
        role: 'user',
        content: input,
        timestamp: new Date().toISOString()
      });
      
      // 清空输入
      userInput.value = '';
      
      // 滚动到底部
      scrollToBottom();
      
      // 添加AI正在输入状态
      messages.value.push({
        role: 'assistant',
        isLoading: true,
        content: ''
      });
      
      // 处理请求
      isProcessing.value = true;
      try {
        const response = await aiService.sendMessage(input);
        
        // 移除加载状态
        messages.value.pop();
        
        // 检查是否有图表请求
        if (input.toLowerCase().includes('图表') || 
            input.toLowerCase().includes('趋势') || 
            input.toLowerCase().includes('分析') ||
            input.toLowerCase().includes('对比')) {
          
          // 添加图表消息
          messages.value.push({
            role: 'assistant',
            type: 'chart',
            content: response.text,
            chartType: 'line',
            timestamp: response.timestamp,
            suggestedResponses: [
              '查看更多详细数据',
              '分析导致这一趋势的原因',
              '如何改善这一指标'
            ]
          });
          
          // 在下一个渲染周期创建图表
          nextTick(() => {
            const chartId = `chart-${messages.value.length - 1}`;
            renderChart(chartId);
          });
        } 
        else if (input.toLowerCase().includes('列表') || 
                 input.toLowerCase().includes('表格') ||
                 input.toLowerCase().includes('清单')) {
          
          // 添加表格消息
          messages.value.push({
            role: 'assistant',
            type: 'table',
            content: '以下是您请求的数据:',
            data: generateMockTableData(),
            columns: [
              { prop: 'material', label: '物料' },
              { prop: 'specification', label: '规格' },
              { prop: 'quantity', label: '数量' },
              { prop: 'status', label: '状态' }
            ],
            timestamp: response.timestamp
          });
        }
        else {
          // 添加普通文本消息
          messages.value.push({
            role: 'assistant',
            type: 'text',
            content: response.text,
            timestamp: response.timestamp,
            intent: response.intent,
            suggestedResponses: generateSuggestedResponses(response.intent, input)
          });
        }
      } catch (error) {
        // 移除加载状态
        messages.value.pop();
        
        console.error('Error sending message:', error);
        ElMessage.error('发送消息失败，请稍后再试');
        
        messages.value.push({
          role: 'assistant',
          type: 'text',
          content: '抱歉，处理您的请求时出现了问题，请稍后再试。',
          timestamp: new Date().toISOString()
        });
      } finally {
        isProcessing.value = false;
        scrollToBottom();
      }
    };

    // 处理建议响应
    const handleSuggestion = (suggestion) => {
      userInput.value = suggestion;
      sendMessage();
    };
    
    // 生成建议响应
    const generateSuggestedResponses = (intent, input) => {
      // 根据意图和输入生成适当的建议响应
      const suggestions = [];
      
      if (intent === 'query_material') {
        suggestions.push('查询该物料的质检历史');
        suggestions.push('该物料的库存趋势图');
        suggestions.push('查询类似规格的物料');
      } 
      else if (intent === 'query_inspection') {
        suggestions.push('导致不合格的主要原因');
        suggestions.push('此类问题的解决方案');
        suggestions.push('查看相关质检标准');
      }
      else if (intent === 'query_exception') {
        suggestions.push('查看处理方案');
        suggestions.push('统计近期异常情况');
        suggestions.push('相似异常的历史记录');
      }
      else {
        // 默认建议
        suggestions.push('查询最新不合格物料');
        suggestions.push('分析近期质量趋势');
        suggestions.push('查询生产线异常');
      }
      
      return suggestions;
    };
    
    // 渲染图表
    const renderChart = (chartId) => {
      const chartDom = document.getElementById(chartId);
      if (!chartDom) return;
      
      const myChart = echarts.init(chartDom);
      
      // 模拟数据 - 实际应用中应从后端获取
      const option = {
        title: {
          text: '近30天质量合格率趋势',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: Array.from({length: 30}, (_, i) => `${i+1}日`)
        },
        yAxis: {
          type: 'value',
          min: 80,
          max: 100,
          axisLabel: {
            formatter: '{value}%'
          }
        },
        series: [
          {
            name: '合格率',
            type: 'line',
            data: Array.from({length: 30}, () => 85 + Math.random() * 12),
            markPoint: {
              data: [
                { type: 'max', name: '最高值' },
                { type: 'min', name: '最低值' }
              ]
            }
          }
        ]
      };
      
      myChart.setOption(option);
      
      // 响应式调整
      window.addEventListener('resize', () => {
        myChart.resize();
      });
    };
    
    // 生成模拟表格数据
    const generateMockTableData = () => {
      return [
        { material: '钢板A', specification: 'Q235', quantity: 500, status: '合格' },
        { material: '铝型材', specification: 'AL6063', quantity: 320, status: '合格' },
        { material: '铜线', specification: 'T2', quantity: 150, status: '待检' },
        { material: '塑料粒子', specification: 'ABS', quantity: 200, status: '不合格' },
        { material: '不锈钢板', specification: '304', quantity: 120, status: '合格' }
      ];
    };

    // 清空消息
    const clearMessages = () => {
      messages.value = [];
    };
    
    // 格式化消息文本
    const formatMessage = (text) => {
      if (!text) return '';
      
      // 处理换行
      return text.replace(/\n/g, '<br>');
    };
    
    // 格式化时间
    const formatTime = (timestamp) => {
      if (!timestamp) return '';
      
      const date = new Date(timestamp);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };
    
    // 滚动到底部
    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      });
    };
    
    // 初始化
    onMounted(() => {
      scrollToBottom();
    });

    return {
      userInput,
      messages,
      isProcessing,
      messagesContainer,
      userAvatarBase64,
      aiAvatarBase64,
      welcomeMessage,
      sendMessage,
      clearMessages,
      formatMessage,
      handleSuggestion,
      formatTime
    };
  }
};
</script>

<style scoped>
.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e6e6e6;
}

.chat-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.chat-messages {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  max-width: 80%;
  gap: 8px;
}

.user-message {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.ai-message {
  align-self: flex-start;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  padding: 10px 15px;
  border-radius: 10px;
  background: #fff;
  position: relative;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
}

.user-message .message-content {
  background: #ecf5ff;
  color: #303133;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  text-align: right;
}

.message-input {
  padding: 15px;
  border-top: 1px solid #e6e6e6;
  background: #fff;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.suggested-responses {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.typing-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #c0c4cc;
  display: inline-block;
  animation: typing 1s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.chart-container {
  width: 100%;
  height: 300px;
  margin-top: 15px;
}

.chart-message, .table-message {
  min-width: 300px;
}

.text-message {
  white-space: pre-wrap;
}
</style>
      <!-- 对话消息列表 -->
      <template v-for="(msg, index) in messages" :key="index">
        <div :class="['message', msg.role === 'user' ? 'user-message' : 'ai-message']">
          <div class="message-avatar">
            <el-avatar v-if="msg.role === 'user'" :size="36" :src="userAvatarBase64"></el-avatar>
            <el-avatar v-else :size="36" :src="aiAvatarBase64"></el-avatar>
          </div>
          <div class="message-content">
            <div v-if="msg.role === 'user'">{{ msg.content }}</div>
            <div v-else v-html="formatAIResponse(msg.content)"></div>
            
            <!-- 数据表格展示 -->
            <div v-if="msg.data && msg.data.type === 'table'" class="message-data">
              <el-table :data="msg.data.rows" border stripe size="small">
                <el-table-column 
                  v-for="col in msg.data.columns" 
                  :key="col.prop" 
                  :prop="col.prop" 
                  :label="col.label" 
                  :width="col.width"
                ></el-table-column>
              </el-table>
            </div>
            
            <!-- 物料卡片展示 -->
            <div v-if="msg.data && msg.data.type === 'material'" class="material-card">
              <div class="material-header">
                <span class="material-code">{{ msg.data.code }}</span>
                <el-tag :type="msg.data.status === '正常' ? 'success' : 'danger'" size="small">
                  {{ msg.data.status }}
                </el-tag>
              </div>
              <div class="material-name">{{ msg.data.name }}</div>
              <div class="material-details">
                <div><label>类型:</label> {{ msg.data.type }}</div>
                <div><label>库存:</label> {{ msg.data.inventory }}</div>
                <div><label>状态:</label> {{ msg.data.status }}</div>
              </div>
              <div class="material-actions" v-if="msg.data.actions">
                <el-button 
                  v-for="action in msg.data.actions" 
                  :key="action.text"
                  size="small" 
                  :type="action.primary ? 'primary' : ''"
                  @click="handleMaterialAction(action, msg.data)"
                >{{ action.text }}</el-button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 加载中状态 -->
      <div v-if="loading" class="message ai-message">
        <div class="message-avatar">
          <el-avatar :size="36" :src="aiAvatarBase64"></el-avatar>
        </div>
        <div class="message-content">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-input">
      <el-input
        v-model="inputMessage"
        type="textarea"
        autosize
        placeholder="输入您的问题，按Enter发送..."
        @keyup.enter.native="sendMessage"
        :disabled="loading"
      ></el-input>
      <div class="input-actions">
        <el-button
          type="primary"
          :icon="Position"
          circle
          @click="sendMessage"
          :disabled="!inputMessage.trim() || loading"
        ></el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, reactive } from 'vue'
import { Search, Delete, Position } from '@element-plus/icons-vue'
import { getCurrentInstance } from 'vue'

// 获取全局属性
const { proxy } = getCurrentInstance()

// Base64-encoded fallback images
const userAvatarBase64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTI0IDI0YTggOCAwIDEwMC0xNiA4IDggMCAwMDAgMTZ6IiBmaWxsPSIjNjQ3NDhCIi8+PHBhdGggZD0iTTM4IDM2YzAtNS45LTYuMy0xMC0xNC0xMHMtMTQgNC4xLTE0IDEwaDI4eiIgZmlsbD0iIzY0NzQ4QiIvPjwvc3ZnPg==';
const aiAvatarBase64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTI4IDhIMTJ2MjRoMjRWMTYiIHN0cm9rZT0iIzQwOUVGRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMzIgNGw0IDQtMTAgMTAgMTAgMTAgNCAxNi0xNi00LTEwLTEwIiBzdHJva2U9IiM0MDlFRkYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+';

// 组件状态
const loading = ref(false)
const inputMessage = ref('')
const messages = ref([])
const messagesContainer = ref(null)
const welcomeMessage = ref('您好，我是IQE质量智能助手。我可以帮助您查询质量数据、分析实验结果等。请问有什么可以帮您？')

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || loading.value) return
  
  // 添加用户消息
  messages.value.push({
    id: Date.now(),
    role: 'user',
    content: inputMessage.value.trim()
  })

  // 清空输入框
  const userMessage = inputMessage.value.trim()
  inputMessage.value = ''

  // 滚动到底部
  await nextTick()
  scrollToBottom()

  // 设置加载状态
  loading.value = true

  try {
    // 调用AI服务执行查询
    const response = await proxy.$ai.query(userMessage, {
      systemPrompt: '你是IQE质量智能助手，帮助用户查询和分析质量数据。请用简洁专业的语言回答问题，必要时展示结构化数据。'
    })

    // 添加AI回复
    let aiMessage = {
      id: Date.now(),
      role: 'ai',
      content: response.content || '抱歉，我无法处理您的请求，请稍后再试。'
    }

    // 如果有结构化数据，添加到消息中
    if (response.data) {
      aiMessage.data = response.data
    }

    messages.value.push(aiMessage)
  } catch (error) {
    console.error('AI查询失败:', error)
    
    // 根据错误类型提供更有用的错误消息
    let errorMessage = '抱歉，AI服务出现了问题，请稍后再试。'
    
    if (error.message && error.message.includes('API密钥')) {
      errorMessage = '系统配置错误：未设置有效的API密钥。请联系管理员配置系统。'
    } else if (error.message && error.message.includes('无法连接')) {
      errorMessage = '无法连接到AI服务，请检查网络连接或稍后再试。'
    } else if (error.message && error.message.includes('请求过于频繁')) {
      errorMessage = 'AI服务请求过于频繁，请稍等片刻再尝试。'
    }
    
    messages.value.push({
      id: Date.now(),
      role: 'ai',
      content: errorMessage
    })
  } finally {
    loading.value = false
    await nextTick()
    scrollToBottom()
  }
}

// 格式化AI响应
const formatAIResponse = (text) => {
  if (!text) return ''
  
  // 将URL转换为链接
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const withLinks = text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>')
  
  // 转换Markdown风格的加粗
  const boldRegex = /\*\*(.*?)\*\*/g
  const withBold = withLinks.replace(boldRegex, '<strong>$1</strong>')
  
  // 转换Markdown风格的强调
  const emRegex = /\*(.*?)\*/g
  return withBold.replace(emRegex, '<em>$1</em>')
}

// 处理快捷建议
const handleSuggestion = (suggestion) => {
  inputMessage.value = suggestion
  sendMessage()
}

// 处理物料操作
const handleMaterialAction = (action, material) => {
  if (action.type === 'query_details') {
    inputMessage.value = `查询物料${material.code}详细信息`
    sendMessage()
  } else if (action.type === 'quality_analysis') {
    inputMessage.value = `分析物料${material.code}的质量数据`
    sendMessage()
  }
}

// 清除消息
const clearMessages = () => {
  messages.value = []
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 组件挂载后初始化
onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f7fa;
  border-radius: 6px;
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid #e4e7ed;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
}

.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.message {
  display: flex;
  margin-bottom: 16px;
  position: relative;
}

.message-avatar {
  margin-right: 12px;
  flex-shrink: 0;
}

.message-content {
  background-color: #fff;
  padding: 12px 16px;
  border-radius: 8px;
  max-width: 85%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.user-message .message-content {
  background-color: #ecf5ff;
}

.ai-message .message-content {
  background-color: #fff;
}

.message-content p {
  margin: 0;
  word-break: break-word;
}

.message-content p a {
  color: #409eff;
  text-decoration: none;
}

.message-content p a:hover {
  text-decoration: underline;
}

.chat-input {
  padding: 12px 16px;
  border-top: 1px solid #e4e7ed;
  background-color: #fff;
  display: flex;
  align-items: flex-end;
}

.chat-input .el-input {
  margin-right: 12px;
  flex: 1;
}

.input-actions {
  display: flex;
  align-items: center;
}

.typing-indicator {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  border-radius: 50%;
  background-color: #409eff;
  margin: 0 2px;
  display: inline-block;
  animation: typing 1.5s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.5);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
}

.data-table {
  margin-top: 12px;
  width: 100%;
  overflow-x: auto;
}

.material-card {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.material-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.material-code {
  font-weight: bold;
  font-size: 14px;
}

.material-name {
  font-size: 16px;
  margin-bottom: 8px;
}

.material-details {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #606266;
  margin-bottom: 12px;
}

.material-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>