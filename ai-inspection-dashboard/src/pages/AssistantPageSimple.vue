<template>
  <div class="assistant-container">
    <!-- 功能说明面板 -->
    <div class="feature-panel" v-if="showFeaturePanel">
      <el-card class="feature-card" shadow="hover">
        <template #header>
          <div class="feature-header">
            <div class="feature-title">
              <el-icon class="feature-icon"><ChatDotRound /></el-icon>
              <span>智能问答助手功能说明</span>
            </div>
            <el-button 
              type="text" 
              @click="showFeaturePanel = false"
              class="close-btn"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </template>
        
        <div class="feature-content">
          <!-- 图表功能展示 -->
          <div class="feature-section">
            <div class="section-title">
              <el-icon class="section-icon"><TrendCharts /></el-icon>
              <span>📊 图表可视化功能</span>
            </div>
            <div class="feature-grid">
              <div class="feature-item">
                <div class="feature-item-header">
                  <el-icon class="trend-icon"><TrendCharts /></el-icon>
                  <span class="feature-name">趋势分析</span>
                </div>
                <p class="feature-desc">展示质量、库存等数据的时间趋势变化</p>
                <el-button 
                  size="small" 
                  type="primary" 
                  plain
                  @click="sendSuggestedQuery('显示质量趋势分析')"
                >
                  显示质量趋势分析
                </el-button>
              </div>
              
              <div class="feature-item">
                <div class="feature-item-header">
                  <el-icon class="radar-icon"><Radar /></el-icon>
                  <span class="feature-name">对比分析</span>
                </div>
                <p class="feature-desc">多维度对比供应商、工厂等表现</p>
                <el-button 
                  size="small" 
                  type="primary" 
                  plain
                  @click="sendSuggestedQuery('供应商对比分析')"
                >
                  供应商对比分析
                </el-button>
              </div>
              
              <div class="feature-item">
                <div class="feature-item-header">
                  <el-icon class="pie-icon"><PieChart /></el-icon>
                  <span class="feature-name">分布分析</span>
                </div>
                <p class="feature-desc">显示各状态、类别的占比分布</p>
                <el-button 
                  size="small" 
                  type="primary" 
                  plain
                  @click="sendSuggestedQuery('库存状态分布图')"
                >
                  库存状态分布图
                </el-button>
              </div>
            </div>
          </div>

          <!-- 文本查询功能展示 -->
          <div class="feature-section">
            <div class="section-title">
              <el-icon class="section-icon"><Document /></el-icon>
              <span>📝 智能文本查询</span>
            </div>
            <div class="feature-grid">
              <div class="feature-item">
                <div class="feature-item-header">
                  <el-icon class="inventory-icon"><DataAnalysis /></el-icon>
                  <span class="feature-name">库存查询</span>
                </div>
                <p class="feature-desc">查询物料库存、供应商、工厂等信息</p>
                <div class="example-queries">
                  <el-button 
                    size="small" 
                    type="info" 
                    plain
                    @click="sendSuggestedQuery('查询BOE供应商的物料')"
                    class="example-btn"
                  >
                    查询BOE供应商的物料
                  </el-button>
                  <el-button 
                    size="small" 
                    type="info" 
                    plain
                    @click="sendSuggestedQuery('查询深圳工厂的库存情况')"
                    class="example-btn"
                  >
                    查询深圳工厂的库存情况
                  </el-button>
                </div>
              </div>
              
              <div class="feature-item">
                <div class="feature-item-header">
                  <el-icon class="quality-icon"><Search /></el-icon>
                  <span class="feature-name">质量查询</span>
                </div>
                <p class="feature-desc">查询测试结果、不良记录、风险物料</p>
                <div class="example-queries">
                  <el-button 
                    size="small" 
                    type="info" 
                    plain
                    @click="sendSuggestedQuery('目前有哪些风险库存？')"
                    class="example-btn"
                  >
                    目前有哪些风险库存？
                  </el-button>
                  <el-button 
                    size="small" 
                    type="info" 
                    plain
                    @click="sendSuggestedQuery('有哪些测试不合格的记录？')"
                    class="example-btn"
                  >
                    有哪些测试不合格的记录？
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 快速开始 -->
          <div class="quick-start">
            <h4>🚀 快速开始</h4>
            <p>点击下方任意示例开始体验，或直接在输入框中输入您的问题</p>
            <div class="quick-examples">
              <el-button 
                type="primary"
                @click="sendSuggestedQuery('显示质量趋势分析')"
                class="quick-btn"
              >
                📈 显示质量趋势分析
              </el-button>
              <el-button 
                type="success"
                @click="sendSuggestedQuery('供应商对比分析')"
                class="quick-btn"
              >
                🎯 供应商对比分析
              </el-button>
              <el-button 
                type="info"
                @click="sendSuggestedQuery('查询BOE供应商的物料')"
                class="quick-btn"
              >
                🔍 查询BOE供应商的物料
              </el-button>
              <el-button 
                type="warning"
                @click="sendSuggestedQuery('目前有哪些风险库存？')"
                class="quick-btn"
              >
                ⚠️ 目前有哪些风险库存？
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 主聊天界面 -->
    <el-card class="chat-card" shadow="never">
      <template #header>
        <div class="chat-header">
          <div class="header-left">
            <el-avatar :src="assistantAvatar" :size="32" class="header-avatar"></el-avatar>
            <div class="header-info">
              <span class="header-title">IQE智能问答助手</span>
              <span class="header-subtitle">质量管理 · 数据分析 · 智能洞察</span>
            </div>
          </div>
          <div class="header-right">
            <el-button 
              type="text" 
              @click="showFeaturePanel = !showFeaturePanel"
              class="help-btn"
            >
              <el-icon><QuestionFilled /></el-icon>
              功能说明
            </el-button>
            <el-tag type="success" effect="dark" size="small">
              <el-icon><Connection /></el-icon>
              在线
            </el-tag>
          </div>
        </div>
      </template>
      
      <div class="chat-body" ref="chatBody">
        <el-scrollbar ref="scrollbarRef" wrap-class="scrollbar-wrapper">
          <div v-if="showWelcome" class="welcome-container">
            <div class="welcome-content">
              <div class="welcome-avatar">
                <el-avatar :src="assistantAvatar" :size="100"></el-avatar>
                <div class="avatar-badge">
                  <el-icon><ChatDotRound /></el-icon>
                </div>
              </div>
              <h2 class="welcome-title">欢迎使用IQE智能问答助手</h2>
              <p class="welcome-subtitle">
                我可以帮您分析质量数据、生成可视化图表、查询库存信息等
              </p>
              
              <!-- 功能亮点 -->
              <div class="feature-highlights">
                <div class="highlight-item">
                  <el-icon class="highlight-icon"><TrendCharts /></el-icon>
                  <span>图表可视化</span>
                </div>
                <div class="highlight-item">
                  <el-icon class="highlight-icon"><DataAnalysis /></el-icon>
                  <span>智能分析</span>
                </div>
                <div class="highlight-item">
                  <el-icon class="highlight-icon"><Search /></el-icon>
                  <span>快速查询</span>
                </div>
                <div class="highlight-item">
                  <el-icon class="highlight-icon"><ChatDotRound /></el-icon>
                  <span>自然对话</span>
                </div>
              </div>

              <!-- 推荐查询 -->
              <div class="suggested-queries">
                <h4>💡 推荐查询</h4>
                <div class="query-categories">
                  <div class="query-category">
                    <span class="category-label">📊 图表分析</span>
                    <div class="category-queries">
                      <el-button
                        type="primary"
                        plain
                        size="small"
                        @click="sendSuggestedQuery('显示质量趋势分析')"
                      >
                        显示质量趋势分析
                      </el-button>
                      <el-button
                        type="primary"
                        plain
                        size="small"
                        @click="sendSuggestedQuery('供应商对比分析')"
                      >
                        供应商对比分析
                      </el-button>
                      <el-button
                        type="primary"
                        plain
                        size="small"
                        @click="sendSuggestedQuery('库存状态分布图')"
                      >
                        库存状态分布图
                      </el-button>
                    </div>
                  </div>
                  <div class="query-category">
                    <span class="category-label">🔍 数据查询</span>
                    <div class="category-queries">
                      <el-button
                        type="info"
                        plain
                        size="small"
                        @click="sendSuggestedQuery('查询BOE供应商的物料')"
                      >
                        查询BOE供应商的物料
                      </el-button>
                      <el-button
                        type="info"
                        plain
                        size="small"
                        @click="sendSuggestedQuery('目前有哪些风险库存？')"
                      >
                        目前有哪些风险库存？
                      </el-button>
                      <el-button
                        type="info"
                        plain
                        size="small"
                        @click="sendSuggestedQuery('查询深圳工厂的库存情况')"
                      >
                        查询深圳工厂的库存情况
                      </el-button>
                      <el-button
                        type="info"
                        plain
                        size="small"
                        @click="sendSuggestedQuery('有哪些测试不合格的记录？')"
                      >
                        有哪些测试不合格的记录？
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 消息列表 -->
          <div v-else class="messages-container">
            <div
              v-for="(message, index) in messages"
              :key="index"
              class="message-item"
              :class="{ 'user-message': message.sender === 'user', 'assistant-message': message.sender === 'assistant' }"
            >
              <el-avatar
                :src="message.sender === 'user' ? userAvatar : assistantAvatar"
                :size="40"
                class="message-avatar"
              ></el-avatar>

              <div class="message-content">
                <div class="message-sender">{{ message.sender === 'user' ? '您' : '助手' }}</div>
                <div class="message-bubble">
                  <!-- 图表消息 -->
                  <div v-if="message.type === 'chart'" class="chart-message">
                    <ChartRenderer
                      :chart-type="message.chartData.chartType"
                      :chart-data="message.chartData.chartData"
                      :chart-title="message.chartData.chartTitle"
                      :chart-description="message.chartData.chartDescription"
                      :chart-height="'350px'"
                    />
                    <div v-if="message.textSummary" class="chart-summary">
                      <p v-html="message.textSummary"></p>
                    </div>
                  </div>
                  <!-- 普通文本消息 -->
                  <p v-else v-html="message.text"></p>

                  <!-- 加载状态 -->
                  <div v-if="message.isLoading" class="loading-indicator">
                    <el-icon class="is-loading"><Loading /></el-icon>
                    <span>正在思考...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>

      <!-- 输入区域 -->
      <div class="chat-footer">
        <div class="input-with-send">
          <el-input
            v-model="newMessage"
            placeholder="请输入您的问题..."
            @keyup.enter="sendMessage"
            :disabled="isLoading"
            size="large"
            class="message-input"
          >
            <template #append>
              <el-button
                type="primary"
                @click="sendMessage"
                :disabled="isLoading || !newMessage.trim()"
                :loading="isLoading"
              >
                <el-icon><Promotion /></el-icon>
                <span>发送</span>
              </el-button>
            </template>
          </el-input>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue';
import { ElAvatar, ElButton, ElCard, ElInput, ElScrollbar, ElTag, ElIcon } from 'element-plus';
import {
  Promotion, ChatDotRound, Close, TrendCharts, Document, QuestionFilled,
  Connection, DataAnalysis, Search, PieChart, Radar, Loading
} from '@element-plus/icons-vue';
import UserAvatar from '@/assets/user-avatar.png';
import AssistantAvatar from '@/assets/ai-avatar.png';
import ChartRenderer from '@/components/ChartRenderer.vue';

const newMessage = ref('');
const messages = ref([
  { sender: 'assistant', text: '您好！我是您的智能问答助手。您可以问我关于物料质量、供应商、生产批次等方面的问题。' }
]);
const scrollbarRef = ref(null);
const userAvatar = ref(UserAvatar);
const assistantAvatar = ref(AssistantAvatar);

// 功能说明面板显示状态
const showFeaturePanel = ref(false);

const isLoading = ref(false);
const chatBody = ref(null);

const showWelcome = computed(() => messages.value.length <= 1);

// 发送建议查询
const sendSuggestedQuery = (query) => {
  newMessage.value = query;
  sendMessage();
};

// 发送消息
const sendMessage = async () => {
  if (!newMessage.value.trim() || isLoading.value) return;

  const userMessage = newMessage.value.trim();

  // 添加用户消息
  messages.value.push({
    sender: 'user',
    text: userMessage
  });

  // 添加助手加载消息
  const assistantMessageIndex = messages.value.length;
  messages.value.push({
    sender: 'assistant',
    text: '',
    isLoading: true
  });

  newMessage.value = '';
  isLoading.value = true;

  // 滚动到底部
  await nextTick();
  scrollToBottom();

  try {
    const response = await fetch('/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: userMessage })
    });

    const result = await response.json();
    console.log('✅ 查询成功:', result);

    // 检查是否是图表响应
    if (result.type === 'chart' && result.data) {
      // 图表响应
      messages.value[assistantMessageIndex] = {
        sender: 'assistant',
        type: 'chart',
        chartData: result.data,
        textSummary: result.textSummary,
        isLoading: false,
      };
    } else {
      // 普通文本响应
      messages.value[assistantMessageIndex] = {
        sender: 'assistant',
        text: result.reply || '抱歉，我暂时无法回答这个问题。',
        isLoading: false,
      };
    }

  } catch (error) {
    console.error('❌ 查询失败:', error);
    messages.value[assistantMessageIndex] = {
      sender: 'assistant',
      text: '抱歉，服务暂时不可用，请稍后再试。',
      isLoading: false,
    };
  } finally {
    isLoading.value = false;
    await nextTick();
    scrollToBottom();
  }
};

// 滚动到底部
const scrollToBottom = () => {
  if (scrollbarRef.value) {
    scrollbarRef.value.setScrollTop(scrollbarRef.value.wrapRef.scrollHeight);
  }
};
</script>

<style scoped>
.assistant-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  gap: 20px;
}

/* 功能说明面板样式 */
.feature-panel {
  max-height: 70vh;
  overflow-y: auto;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card {
  border-radius: 16px;
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.feature-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.feature-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.feature-icon {
  font-size: 24px;
  color: #409eff;
}

.close-btn {
  color: #909399;
  font-size: 18px;
}

.close-btn:hover {
  color: #f56c6c;
}

.feature-content {
  max-height: 60vh;
  overflow-y: auto;
}

.feature-section {
  margin-bottom: 32px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e4e7ed;
}

.section-icon {
  font-size: 20px;
  color: #409eff;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.feature-item {
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.feature-item:hover {
  border-color: #409eff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.1);
  transform: translateY(-2px);
}

.feature-item-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.feature-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.feature-desc {
  color: #606266;
  margin-bottom: 16px;
  line-height: 1.6;
}

.example-queries {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.example-btn {
  margin: 0;
}

.quick-start {
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  color: white;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
}

.quick-start h4 {
  margin: 0 0 12px 0;
  font-size: 18px;
}

.quick-start p {
  margin: 0 0 20px 0;
  opacity: 0.9;
}

.quick-examples {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.quick-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  backdrop-filter: blur(10px);
}

.quick-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

/* 图标样式 */
.trend-icon { color: #409eff; }
.radar-icon { color: #67c23a; }
.pie-icon { color: #e6a23c; }
.inventory-icon { color: #909399; }
.quality-icon { color: #f56c6c; }

/* 主聊天界面样式 */
.chat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  color: white;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-avatar {
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.header-subtitle {
  font-size: 12px;
  opacity: 0.8;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.help-btn {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.help-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}
</style>
