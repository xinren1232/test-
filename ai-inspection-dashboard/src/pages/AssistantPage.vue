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
              <div class="feature-item" v-for="chartFeature in chartFeatures" :key="chartFeature.type">
                <div class="feature-item-header">
                  <el-icon :class="chartFeature.iconClass">
                    <TrendCharts v-if="chartFeature.type === 'trend'" />
                    <Radar v-else-if="chartFeature.type === 'comparison'" />
                    <PieChart v-else-if="chartFeature.type === 'distribution'" />
                  </el-icon>
                  <span class="feature-name">{{ chartFeature.name }}</span>
                </div>
                <p class="feature-desc">{{ chartFeature.description }}</p>
                <el-button
                  size="small"
                  type="primary"
                  plain
                  @click="sendSuggestedQuery(chartFeature.example)"
                >
                  {{ chartFeature.example }}
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
              <div class="feature-item" v-for="textFeature in textFeatures" :key="textFeature.type">
                <div class="feature-item-header">
                  <el-icon :class="textFeature.iconClass">
                    <DataAnalysis v-if="textFeature.type === 'inventory'" />
                    <Search v-else-if="textFeature.type === 'quality'" />
                  </el-icon>
                  <span class="feature-name">{{ textFeature.name }}</span>
                </div>
                <p class="feature-desc">{{ textFeature.description }}</p>
                <div class="example-queries">
                  <el-button
                    v-for="example in textFeature.examples"
                    :key="example"
                    size="small"
                    type="info"
                    plain
                    @click="sendSuggestedQuery(example)"
                    class="example-btn"
                  >
                    {{ example }}
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
                v-for="example in quickExamples"
                :key="example.query"
                :type="example.type"
                @click="sendSuggestedQuery(example.query)"
                class="quick-btn"
              >
                {{ example.icon }} {{ example.query }}
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

              <!-- 优化的推荐查询 -->
              <div class="suggested-queries">
                <h4>💡 智能问答规则</h4>
                <div class="query-categories">
                  <!-- 基础查询 -->
                  <div class="query-category">
                    <div class="category-header" @click="toggleCategory('basic')">
                      <span class="category-label">📦 基础查询</span>
                      <span class="toggle-icon" :class="{ 'expanded': expandedCategories.basic }">▼</span>
                    </div>
                    <div class="category-queries" v-show="expandedCategories.basic">
                      <el-button
                        v-for="rule in optimizedQACategories.basic"
                        :key="rule.name"
                        :type="rule.type"
                        plain
                        size="small"
                        @click="sendSuggestedQuery(rule.query)"
                        :title="rule.query"
                      >
                        {{ rule.icon }} {{ rule.name }}
                      </el-button>
                    </div>
                  </div>

                  <!-- 测试记录查询 -->
                  <div class="query-category">
                    <div class="category-header" @click="toggleCategory('quality')">
                      <span class="category-label">🧪 测试记录</span>
                      <span class="toggle-icon" :class="{ 'expanded': expandedCategories.quality }">▼</span>
                    </div>
                    <div class="category-queries" v-show="expandedCategories.quality">
                      <el-button
                        v-for="rule in optimizedQACategories.quality"
                        :key="rule.name"
                        :type="rule.type"
                        plain
                        size="small"
                        @click="sendSuggestedQuery(rule.query)"
                        :title="rule.query"
                      >
                        {{ rule.icon }} {{ rule.name }}
                      </el-button>
                    </div>
                  </div>

                  <!-- 生产查询 -->
                  <div class="query-category">
                    <div class="category-header" @click="toggleCategory('production')">
                      <span class="category-label">⚙️ 生产查询</span>
                      <span class="toggle-icon" :class="{ 'expanded': expandedCategories.production }">▼</span>
                    </div>
                    <div class="category-queries" v-show="expandedCategories.production">
                      <el-button
                        v-for="rule in optimizedQACategories.production"
                        :key="rule.name"
                        :type="rule.type"
                        plain
                        size="small"
                        @click="sendSuggestedQuery(rule.query)"
                        :title="rule.query"
                      >
                        {{ rule.icon }} {{ rule.name }}
                      </el-button>
                    </div>
                  </div>

                  <!-- 综合查询 -->
                  <div class="query-category">
                    <div class="category-header" @click="toggleCategory('summary')">
                      <span class="category-label">📊 综合统计</span>
                      <span class="toggle-icon" :class="{ 'expanded': expandedCategories.summary }">▼</span>
                    </div>
                    <div class="category-queries" v-show="expandedCategories.summary">
                      <el-button
                        v-for="rule in optimizedQACategories.summary"
                        :key="rule.name"
                        :type="rule.type"
                        plain
                        size="small"
                        @click="sendSuggestedQuery(rule.query)"
                        :title="rule.query"
                      >
                        {{ rule.icon }} {{ rule.name }}
                      </el-button>
                    </div>
                  </div>

                  <!-- 图表分析 -->
                  <div class="query-category">
                    <div class="category-header" @click="toggleCategory('charts')">
                      <span class="category-label">📈 图表分析</span>
                      <span class="toggle-icon" :class="{ 'expanded': expandedCategories.charts }">▼</span>
                    </div>
                    <div class="category-queries" v-show="expandedCategories.charts">
                      <el-button
                        v-for="rule in optimizedQACategories.charts"
                        :key="rule.name"
                        :type="rule.type"
                        plain
                        size="small"
                        @click="sendSuggestedQuery(rule.query)"
                        :title="rule.query"
                      >
                        {{ rule.icon }} {{ rule.name }}
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="message-list" v-else>
            <div 
              v-for="(message, index) in messages" 
              :key="index" 
              class="message-item"
              :class="{ 'is-user': message.sender === 'user' }"
            >
              <el-avatar 
                :src="message.sender === 'user' ? userAvatar : assistantAvatar" 
                class="message-avatar"
              />
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
                </div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
      
      <template #footer>
        <div class="chat-footer">
          <el-input
            v-model="newMessage"
            placeholder="请输入您的问题..."
            @keyup.enter="sendMessage"
            clearable
            size="large"
            class="input-with-send"
          >
            <template #append>
              <el-button @click="sendMessage" :disabled="!newMessage.trim()">
                <el-icon><Promotion /></el-icon>
                <span>发送</span>
              </el-button>
            </template>
          </el-input>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue';
import { ElAvatar, ElButton, ElCard, ElInput, ElScrollbar, ElTag, ElIcon } from 'element-plus';
import {
  Promotion, ChatDotRound, Close, TrendCharts, Document, QuestionFilled,
  Connection, DataAnalysis, Search, PieChart, Radar
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

// 图表功能展示数据
const chartFeatures = ref([
  {
    type: 'trend',
    name: '趋势分析',
    iconClass: 'trend-icon',
    description: '展示质量、库存等数据的时间趋势变化',
    example: '显示质量趋势分析'
  },
  {
    type: 'comparison',
    name: '对比分析',
    iconClass: 'radar-icon',
    description: '多维度对比供应商、工厂等表现',
    example: '供应商对比分析'
  },
  {
    type: 'distribution',
    name: '分布分析',
    iconClass: 'pie-icon',
    description: '显示各状态、类别的占比分布',
    example: '库存状态分布图'
  }
]);

// 文本查询功能展示数据
const textFeatures = ref([
  {
    type: 'inventory',
    name: '库存查询',
    iconClass: 'inventory-icon',
    description: '查询物料库存、供应商、工厂等信息',
    examples: ['查询BOE供应商的物料', '查询深圳工厂的库存情况']
  },
  {
    type: 'quality',
    name: '质量查询',
    iconClass: 'quality-icon',
    description: '查询测试结果、不良记录、风险物料',
    examples: ['目前有哪些风险库存？', '有哪些测试不合格的记录？']
  }
]);

// 快速示例
const quickExamples = ref([
  { query: '显示质量趋势分析', type: 'primary', icon: '📈' },
  { query: '供应商对比分析', type: 'success', icon: '🎯' },
  { query: '查询BOE供应商的物料', type: 'info', icon: '🔍' },
  { query: '目前有哪些风险库存？', type: 'warning', icon: '⚠️' }
]);

// 优化后的查询规则 - 与三栏布局保持一致
const optimizedQACategories = ref({
  // 基础查询规则
  basic: [
    { name: '工厂库存查询', query: '查询深圳工厂的库存', icon: '🏭', type: 'primary' },
    { name: '供应商库存查询', query: '查询BOE供应商的物料', icon: '🏢', type: 'primary' },
    { name: '风险库存查询', query: '查询风险状态的库存', icon: '⚠️', type: 'warning' },
    { name: '电池库存查询', query: '查询电池的库存', icon: '🔋', type: 'primary' },
    { name: '库存总览', query: '查询所有库存记录', icon: '📦', type: 'info' },
    { name: '库存供应商统计', query: '库存物料涉及多少家供应商？', icon: '🏭', type: 'info' }
  ],

  // 测试记录查询
  quality: [
    { name: '测试NG记录', query: '查询测试NG记录', icon: '❌', type: 'danger' },
    { name: '电池盖测试记录', query: '查询电池盖测试记录', icon: '🧪', type: 'info' },
    { name: 'BOE测试记录', query: '查询BOE测试记录', icon: '🔍', type: 'info' }
  ],

  // 生产查询
  production: [
    { name: '工厂生产记录', query: '查询深圳工厂的生产记录', icon: '⚙️', type: 'success' },
    { name: '电池盖生产记录', query: '查询电池盖物料的生产记录', icon: '🔧', type: 'success' },
    { name: 'BOE生产记录', query: '查询BOE生产记录', icon: '🏢', type: 'success' },
    { name: 'S662项目记录', query: '查询S662LN项目记录', icon: '📋', type: 'success' }
  ],

  // 综合查询
  summary: [
    { name: '物料种类统计', query: '多少种物料？', icon: '📊', type: 'info' },
    { name: '物料批次统计', query: '物料有几个批次？', icon: '🏷️', type: 'info' },
    { name: '项目数量统计', query: '有几个项目？', icon: '📈', type: 'info' },
    { name: '基线数量统计', query: '有几个基线？', icon: '📐', type: 'info' },
    { name: '供应商数量统计', query: '有几家供应商？', icon: '🏭', type: 'info' }
  ],

  // 图表分析
  charts: [
    { name: '库存状态分布图', query: '生成库存状态分布饼图', icon: '🥧', type: 'primary' },
    { name: '供应商物料分布', query: '生成供应商物料分布柱状图', icon: '📊', type: 'primary' },
    { name: '工厂库存对比', query: '生成各工厂库存对比图表', icon: '📈', type: 'primary' },
    { name: '测试合格率趋势', query: '生成测试合格率趋势图', icon: '📉', type: 'primary' }
  ]
});

// 兼容原有的查询分类
const chartQueries = ref([
  '生成库存状态分布饼图',
  '生成供应商物料分布柱状图',
  '生成各工厂库存对比图表'
]);

const dataQueries = ref([
  '查询BOE供应商的物料',
  '查询风险状态的库存',
  '查询深圳工厂的库存',
  '查询测试NG记录'
]);

const showWelcome = computed(() => messages.value.length <= 1);

// 分类折叠状态
const expandedCategories = ref({
  basic: true,      // 基础查询默认展开
  quality: false,   // 测试记录默认折叠
  production: false, // 生产查询默认折叠
  summary: false,   // 综合统计默认折叠
  charts: false     // 图表分析默认折叠
});

const scrollToBottom = async () => {
  await nextTick();
  if (scrollbarRef.value) {
    scrollbarRef.value.setScrollTop(scrollbarRef.value.wrapRef.scrollHeight);
  }
};

const sendSuggestedQuery = (query) => {
  newMessage.value = query;
  sendMessage();
};

// 切换分类折叠状态
const toggleCategory = (categoryName) => {
  expandedCategories.value[categoryName] = !expandedCategories.value[categoryName];
};

const sendMessage = async () => {
  const text = newMessage.value.trim();
  if (!text) return;

  // 1. Add user message
  messages.value.push({ sender: 'user', text });
  const userInput = newMessage.value;
  newMessage.value = '';
  await scrollToBottom();

  // 2. Add assistant thinking placeholder
  const assistantMessageIndex = messages.value.length;
  messages.value.push({
    sender: 'assistant',
    text: '我正在思考您的问题，请稍候...',
    isLoading: true,
  });
  await scrollToBottom();

  // 3. Call API - 直接调用后端API绕过模拟中间件
  try {
    console.log('🔍 发送查询:', userInput);

    // 直接调用后端API，绕过可能的模拟API拦截
    const response = await fetch('/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: userInput })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

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
    console.error('Assistant API error:', error);
    // Update placeholder with error message
    messages.value[assistantMessageIndex] = {
      sender: 'assistant',
      text: '抱歉，处理您的问题时发生了错误。请稍后再试。',
      isLoading: false,
    };
  }
  
  await scrollToBottom();
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

.chat-body {
  flex-grow: 1;
  overflow: hidden;
  height: 100%;
}

/* 欢迎页面样式 */
.welcome-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
}

.welcome-content {
  max-width: 600px;
  width: 100%;
}

.welcome-avatar {
  position: relative;
  display: inline-block;
  margin-bottom: 24px;
}

.avatar-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 16px;
  color: #606266;
  margin-bottom: 32px;
  line-height: 1.6;
}

.feature-highlights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.highlight-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.highlight-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.highlight-icon {
  font-size: 32px;
  color: #409eff;
}

.highlight-item span {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.suggested-queries {
  text-align: left;
}

.suggested-queries h4 {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.query-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.query-category {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  border: 1px solid #e4e7ed;
  margin-bottom: 16px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

.category-header:hover {
  background: #e9ecef;
}

.category-label {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.toggle-icon {
  font-size: 12px;
  color: #6c757d;
  transition: transform 0.2s ease;
}

.toggle-icon.expanded {
  transform: rotate(180deg);
}

.category-queries {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-queries .el-button {
  justify-content: flex-start;
  text-align: left;
}

:deep(.el-card__body) {
  height: calc(100% - 60px - 70px); /* 减去header和footer的高度 */
  padding: 0;
}

:deep(.el-card__footer) {
  padding: 15px 20px;
  border-top: 1px solid #e4e7ed;
}

.scrollbar-wrapper {
  height: 100%;
}

.message-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message-item {
  display: flex;
  gap: 12px;
  max-width: 80%;
}

.message-item.is-user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  display: flex;
  flex-direction: column;
}

.message-sender {
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 4px;
}

.message-item.is-user .message-sender {
  align-self: flex-end;
}

.message-bubble {
  padding: 10px 15px;
  border-radius: 15px;
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  word-break: break-word;
  white-space: pre-wrap; /* 保持换行符和空格格式 */
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
}

.message-item.is-user .message-bubble {
  background-color: #409eff;
  color: #fff;
  border-color: #409eff;
}

.message-bubble p {
  margin: 0;
  line-height: 1.5;
}

/* 图表消息样式 */
.chart-message {
  width: 100%;
}

.chart-summary {
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.chart-summary p {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.chat-footer {
  display: flex;
  align-items: center;
}

.input-with-send .el-button {
  height: 100%;
}

.input-with-send .el-button span {
  margin-left: 5px;
}

</style>