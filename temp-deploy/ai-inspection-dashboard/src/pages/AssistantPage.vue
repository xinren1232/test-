<template>
  <div class="qms-assistant-layout">
    <!-- 左侧规则库面板 (30%) -->
    <div class="left-panel">
      <div class="panel-header">
        <h3>
          <el-icon><ChatDotRound /></el-icon>
          QMS智能助手
        </h3>
        <p class="panel-subtitle">基于规则库的智能问答系统</p>
      </div>

      <!-- 规则库分类展示 -->
      <div class="rules-library">
        <div class="library-header">
          <el-icon><Document /></el-icon>
          <span>规则库 ({{ totalRulesCount }}条)</span>
          <el-button
            size="small"
            type="text"
            @click="refreshRules"
            :loading="loadingRules"
          >
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>

        <!-- 规则分类 -->
        <div class="rules-categories">
          <div
            v-for="(category, categoryName) in rulesLibrary"
            :key="categoryName"
            class="category-section"
          >
            <div
              class="category-header"
              @click="toggleCategory(categoryName)"
              :class="{ expanded: expandedCategories[categoryName] }"
            >
              <el-icon class="category-icon">
                <Box v-if="categoryName === '库存场景'" />
                <Monitor v-else-if="categoryName === '上线场景'" />
                <DataAnalysis v-else-if="categoryName === '测试场景'" />
                <TrendCharts v-else-if="categoryName === '高级场景'" />
                <Grid v-else />
              </el-icon>
              <span class="category-name">{{ categoryName }}</span>
              <span class="category-count">({{ category.length }})</span>
              <el-icon class="expand-icon" :class="{ rotated: expandedCategories[categoryName] }">
                <ArrowRight />
              </el-icon>
            </div>

            <!-- 规则列表 -->
            <div v-show="expandedCategories[categoryName]" class="rules-list">
              <div
                v-for="rule in category"
                :key="rule.intent_name"
                class="rule-item"
                @click="selectRule(rule)"
                :class="{ active: selectedRule?.intent_name === rule.intent_name }"
              >
                <div class="rule-header">
                  <span class="rule-name">{{ rule.intent_name }}</span>
                </div>
                <p class="rule-description">{{ rule.description }}</p>
                <div class="rule-example">
                  <el-button
                    size="small"
                    type="primary"
                    plain
                    @click.stop="sendExampleQuery(rule.example_query)"
                    class="example-btn"
                  >
                    <el-icon><ChatDotRound /></el-icon>
                    {{ rule.example_query }}
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据范围说明 -->
      <div class="data-scope">
        <div class="scope-header">
          <el-icon><InfoFilled /></el-icon>
          <span>数据范围说明</span>
        </div>
        <div class="scope-content">
          <div class="scope-item">
            <strong>物料类别:</strong>
            <div class="scope-tags">
              <el-tag v-for="category in materialCategories" :key="category" size="small">
                {{ category }}
              </el-tag>
            </div>
          </div>
          <div class="scope-item">
            <strong>供应商:</strong>
            <div class="scope-tags">
              <el-tag v-for="supplier in mainSuppliers" :key="supplier" size="small" type="success">
                {{ supplier }}
              </el-tag>
            </div>
          </div>
          <div class="scope-item">
            <strong>工厂:</strong>
            <div class="scope-tags">
              <el-tag v-for="factory in factories" :key="factory" size="small" type="warning">
                {{ factory }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 中间对话区域 (50%) -->
    <div class="center-panel">
      <div class="chat-header">
        <div class="header-left">
          <el-avatar :size="32" class="header-avatar">🤖</el-avatar>
          <div class="header-info">
            <span class="header-title">QMS智能助手</span>
            <span class="header-subtitle">基于{{ totalRulesCount }}条规则的智能问答</span>
          </div>
        </div>
        <div class="header-right">
          <el-tag type="success" effect="dark" size="small">
            <el-icon><Connection /></el-icon>
            在线
          </el-tag>
          <el-button
            type="text"
            @click="clearMessages"
            class="clear-btn"
          >
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
        </div>
      </div>

      <!-- 对话区域 -->
      <div class="chat-body" ref="chatBody">
        <el-scrollbar ref="scrollbarRef" wrap-class="scrollbar-wrapper">
          <!-- 欢迎界面 -->
          <div v-if="showWelcome" class="welcome-container">
            <div class="welcome-content">
              <div class="welcome-avatar">
                <div class="avatar-circle">🤖</div>
              </div>
              <h2 class="welcome-title">欢迎使用QMS智能助手</h2>
              <p class="welcome-subtitle">
                基于{{ totalRulesCount }}条规则库，支持库存、测试、上线、批次等场景的智能问答
              </p>

              <!-- 快速开始提示 -->
              <div class="quick-start-tips">
                <div class="tip-item">
                  <el-icon><Mouse /></el-icon>
                  <span>点击左侧规则库中的示例问题</span>
                </div>
                <div class="tip-item">
                  <el-icon><Edit /></el-icon>
                  <span>或在下方输入框直接提问</span>
                </div>
                <div class="tip-item">
                  <el-icon><TrendCharts /></el-icon>
                  <span>支持图表可视化和数据分析</span>
                </div>
              </div>

              <!-- 热门查询示例 -->
              <div class="popular-queries">
                <h4>🔥 热门查询</h4>
                <div class="query-buttons">
                  <el-button
                    v-for="query in popularQueries"
                    :key="query.text"
                    :type="query.type"
                    plain
                    size="small"
                    @click="sendExampleQuery(query.text)"
                    class="query-btn"
                  >
                    {{ query.icon }} {{ query.text }}
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 对话消息 -->
          <div v-else class="messages-container">
            <div
              v-for="(message, index) in messages"
              :key="index"
              class="message-wrapper"
              :class="message.sender"
            >
              <div class="message-content">
                <div v-if="message.sender === 'user'" class="user-message">
                  <div class="message-text">{{ message.text }}</div>
                  <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                </div>

                <div v-else class="assistant-message">
                  <div class="message-header">
                    <el-avatar :size="28">🤖</el-avatar>
                    <span class="assistant-name">QMS智能助手</span>
                    <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                  </div>

                  <!-- 加载状态 -->
                  <div v-if="message.isLoading" class="loading-content">
                    <el-skeleton :rows="3" animated />
                    <div class="loading-text">正在分析您的问题...</div>
                  </div>

                  <!-- 消息内容 -->
                  <div v-else class="message-body">
                    <div v-if="message.text" class="message-text" v-html="message.text"></div>

                    <!-- 数据卡片 -->
                    <div v-if="message.cards && message.cards.length > 0" class="data-cards">
                      <div
                        v-for="(card, cardIndex) in message.cards"
                        :key="cardIndex"
                        class="data-card"
                      >
                        <div class="card-header">
                          <el-icon><DataAnalysis /></el-icon>
                          <span>{{ card.title }}</span>
                        </div>
                        <div class="card-metrics">
                          <div
                            v-for="(metric, metricIndex) in card.metrics"
                            :key="metricIndex"
                            class="metric-item"
                          >
                            <span class="metric-label">{{ metric.label }}</span>
                            <span class="metric-value" :class="metric.type">{{ metric.value }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 数据表格 -->
                    <div v-if="message.tableData && message.tableData.length > 0" class="data-table">
                      <el-table :data="message.tableData" size="small" stripe>
                        <el-table-column
                          v-for="column in message.tableColumns"
                          :key="column.prop"
                          :prop="column.prop"
                          :label="column.label"
                          :width="column.width"
                        />
                      </el-table>
                    </div>

                    <!-- 图表容器 -->
                    <div v-if="message.chartId" class="chart-container">
                      <div :id="message.chartId" class="chart-content"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <div class="input-container">
          <el-input
            v-model="inputMessage"
            placeholder="请输入您的问题，例如：查询BOE供应商库存、分析结构件类质量..."
            @keyup.enter="sendMessage"
            :disabled="isLoading"
            class="message-input"
            type="textarea"
            :rows="2"
            resize="none"
          />
          <el-button
            type="primary"
            @click="sendMessage"
            :loading="isLoading"
            :disabled="!inputMessage.trim()"
            class="send-button"
          >
            <el-icon v-if="!isLoading"><Promotion /></el-icon>
            {{ isLoading ? '处理中...' : '发送' }}
          </el-button>
        </div>

        <!-- 快速操作 -->
        <div class="quick-actions" v-if="!isLoading">
          <el-button
            v-for="action in quickActions"
            :key="action.text"
            size="small"
            type="info"
            plain
            @click="sendExampleQuery(action.query)"
            class="quick-action-btn"
          >
            {{ action.icon }} {{ action.text }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 右侧分析面板 (20%) -->
    <div class="right-panel">
      <!-- 当前规则信息 -->
      <div class="current-rule" v-if="selectedRule">
        <div class="rule-header">
          <el-icon><Document /></el-icon>
          <span>当前规则</span>
        </div>
        <div class="rule-content">
          <h4>{{ selectedRule.intent_name }}</h4>
          <p class="rule-desc">{{ selectedRule.description }}</p>
          <div class="rule-meta">
            <el-tag size="small" type="info">{{ selectedRule.category }}</el-tag>
            <el-tag size="small" type="success">{{ selectedRule.action_type }}</el-tag>
          </div>
          <div class="rule-triggers">
            <strong>触发词:</strong>
            <div class="trigger-tags">
              <el-tag
                v-for="trigger in (selectedRule.trigger_words || [])"
                :key="trigger"
                size="small"
                effect="plain"
              >
                {{ trigger }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据统计 -->
      <div class="data-stats">
        <div class="stats-header">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据统计</span>
        </div>
        <div class="stats-content">
          <div class="stat-item">
            <span class="stat-label">库存记录</span>
            <span class="stat-value">132</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">测试记录</span>
            <span class="stat-value">396</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">上线记录</span>
            <span class="stat-value">1056</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">活跃规则</span>
            <span class="stat-value">{{ totalRulesCount }}</span>
          </div>
        </div>
      </div>

      <!-- 实时分析结果 -->
      <div class="real-time-analysis" v-if="currentAnalysis">
        <div class="analysis-header">
          <el-icon><DataAnalysis /></el-icon>
          <span>实时分析</span>
        </div>
        <div class="analysis-content">
          <div class="analysis-result">
            <p class="analysis-text">{{ formatAnalysisResult(currentAnalysis) }}</p>

            <!-- 识别的实体 -->
            <div class="recognized-entities" v-if="hasRecognizedEntities">
              <div class="entity-tags">
                <el-tag
                  v-if="currentAnalysis.recognizedEntities.scenario"
                  size="small"
                  type="primary"
                >
                  {{ currentAnalysis.recognizedEntities.scenario }}
                </el-tag>
                <el-tag
                  v-if="currentAnalysis.recognizedEntities.supplier"
                  size="small"
                  type="success"
                >
                  {{ currentAnalysis.recognizedEntities.supplier }}
                </el-tag>
                <el-tag
                  v-if="currentAnalysis.recognizedEntities.materialCategory"
                  size="small"
                  type="warning"
                >
                  {{ currentAnalysis.recognizedEntities.materialCategory }}
                </el-tag>
                <el-tag
                  v-if="currentAnalysis.recognizedEntities.material"
                  size="small"
                  type="info"
                >
                  {{ currentAnalysis.recognizedEntities.material }}
                </el-tag>
              </div>
            </div>

            <!-- 建议查询 -->
            <div class="suggested-queries" v-if="suggestedQueries.length > 0">
              <h6>💡 建议查询</h6>
              <div class="suggestion-buttons">
                <el-button
                  v-for="suggestion in suggestedQueries"
                  :key="suggestion"
                  size="small"
                  type="primary"
                  plain
                  @click="applySuggestion(suggestion)"
                  class="suggestion-btn"
                >
                  {{ suggestion }}
                </el-button>
              </div>
            </div>

            <!-- 匹配的规则 -->
            <div class="matched-rules" v-if="matchedRules.length > 0">
              <h6>🎯 匹配规则</h6>
              <div class="rule-matches">
                <div
                  v-for="rule in matchedRules"
                  :key="rule.intent_name"
                  class="matched-rule-item"
                  @click="selectMatchedRule(rule)"
                >
                  <div class="rule-match-header">
                    <span class="rule-match-name">{{ rule.intent_name }}</span>
                    <span class="match-score">{{ (rule.matchScore * 100).toFixed(0) }}%</span>
                  </div>
                  <p class="rule-match-desc">{{ rule.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 问题识别提示 -->
      <div class="query-hints" v-else>
        <div class="hints-header">
          <el-icon><Lightbulb /></el-icon>
          <span>智能识别</span>
        </div>
        <div class="hints-content">
          <div class="hint-section">
            <h5>物料类别识别</h5>
            <div class="hint-tags">
              <el-tag
                v-for="category in materialCategories"
                :key="category"
                size="small"
                effect="plain"
                @click="sendExampleQuery(`查询${category}库存`)"
                class="clickable-tag"
              >
                {{ category }}
              </el-tag>
            </div>
          </div>

          <div class="hint-section">
            <h5>供应商识别</h5>
            <div class="hint-tags">
              <el-tag
                v-for="supplier in mainSuppliers.slice(0, 8)"
                :key="supplier"
                size="small"
                type="success"
                effect="plain"
                @click="sendExampleQuery(`查询${supplier}供应商库存`)"
                class="clickable-tag"
              >
                {{ supplier }}
              </el-tag>
            </div>
          </div>

          <div class="hint-section">
            <h5>场景识别</h5>
            <div class="hint-tags">
              <el-tag
                v-for="scenario in scenarios"
                :key="scenario.name"
                size="small"
                :type="scenario.type"
                effect="plain"
                @click="sendExampleQuery(scenario.example)"
                class="clickable-tag"
              >
                {{ scenario.name }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 最近查询 -->
      <div class="recent-queries" v-if="recentQueries.length > 0">
        <div class="recent-header">
          <el-icon><Clock /></el-icon>
          <span>最近查询</span>
          <el-button
            size="small"
            type="text"
            @click="clearRecentQueries"
          >
            清空
          </el-button>
        </div>
        <div class="recent-content">
          <div
            v-for="(query, index) in recentQueries.slice(0, 5)"
            :key="index"
            class="recent-item"
            @click="sendExampleQuery(query.text)"
          >
            <span class="recent-text">{{ query.text }}</span>
            <span class="recent-time">{{ formatTime(query.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>
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
import { ref, reactive, nextTick, computed, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import {
  ChatDotRound, Document, Box, Monitor, DataAnalysis, Collection, TrendCharts, Grid,
  ArrowRight, InfoFilled, Refresh, Connection, Delete, Mouse, Edit, Promotion,
  Clock, Lightbulb
} from '@element-plus/icons-vue';
import { recognizeQueryIntent, generateSuggestions, matchRules, formatAnalysisResult } from '@/utils/queryRecognition.js';

// 响应式数据
const inputMessage = ref('');
const messages = ref([]);
const scrollbarRef = ref(null);
const isLoading = ref(false);
const showWelcome = ref(true);
const selectedRule = ref(null);
const loadingRules = ref(false);

// 规则库数据
const rulesLibrary = ref({});
const totalRulesCount = ref(0);
const expandedCategories = reactive({
  '库存场景': true,
  '上线场景': true,
  '测试场景': true,
  '高级场景': false
});

// 数据范围定义（基于实际数据库内容）
const materialCategories = ref(['结构件类', '光学类', '充电类', '声学类', '包料类']);
const mainSuppliers = ref(['聚龙', 'BOE', '天马', '华星', '歌尔', '东声', '欣冠', '广正', '丽德宝', '富群', '奥海', '风华', '维科']);
const factories = ref(['深圳工厂', '重庆工厂', '南昌工厂', '宜宾工厂']);
const actualMaterials = ref(['电池盖', '中框', '手机卡托', '侧键', '装饰件', 'LCD显示屏', 'OLED显示屏', '摄像头(CAM)', '电池', '充电器', '喇叭', '听筒', '保护套', '标签', '包装盒']);

// 场景识别
const scenarios = ref([
  { name: '库存查询', type: 'primary', example: '查询物料库存信息' },
  { name: '测试分析', type: 'success', example: '查询物料测试结果' },
  { name: '上线跟踪', type: 'warning', example: '查询物料上线情况' },
  { name: '批次管理', type: 'info', example: '查询批次综合信息' },
  { name: '对比分析', type: 'danger', example: '供应商对比分析' }
]);

// 热门查询
const popularQueries = ref([
  { text: '查询BOE供应商库存', icon: '🏢', type: 'primary' },
  { text: '查询风险状态的物料', icon: '⚠️', type: 'warning' },
  { text: '查询结构件类库存', icon: '🔧', type: 'success' },
  { text: '供应商对比分析', icon: '📊', type: 'info' }
]);

// 快速操作
const quickActions = ref([
  { text: '库存查询', icon: '📦', query: '查询物料库存信息' },
  { text: '测试结果', icon: '🧪', query: '查询物料测试结果' },
  { text: '供应商分析', icon: '🏢', query: '查询BOE供应商库存' },
  { text: '风险物料', icon: '⚠️', query: '查询风险状态的物料' }
]);

// 最近查询记录
const recentQueries = ref([]);

// 智能识别相关
const currentAnalysis = ref(null);
const suggestedQueries = ref([]);
const matchedRules = ref([]);

// 计算属性
const totalRules = computed(() => {
  return Object.values(rulesLibrary.value).reduce((total, rules) => total + rules.length, 0);
});

const hasRecognizedEntities = computed(() => {
  if (!currentAnalysis.value) return false;
  const entities = currentAnalysis.value.recognizedEntities;
  return Object.values(entities).some(value => value !== null);
});

// 监听输入变化，实时进行问题识别
watch(inputMessage, (newValue) => {
  if (newValue && newValue.trim().length > 3) {
    performRealTimeAnalysis(newValue.trim());
  } else {
    currentAnalysis.value = null;
    suggestedQueries.value = [];
    matchedRules.value = [];
  }
}, { debounce: 500 });

// 方法定义
const toggleCategory = (categoryName) => {
  expandedCategories[categoryName] = !expandedCategories[categoryName];
};

const selectRule = (rule) => {
  selectedRule.value = rule;
};

const sendExampleQuery = async (query) => {
  if (!query || isLoading.value) return;

  // 添加到最近查询
  addToRecentQueries(query);

  // 隐藏欢迎界面
  showWelcome.value = false;

  // 添加用户消息
  const userMessage = {
    sender: 'user',
    text: query,
    timestamp: new Date()
  };
  messages.value.push(userMessage);

  // 添加加载中的助手消息
  const loadingMessage = {
    sender: 'assistant',
    text: '',
    isLoading: true,
    timestamp: new Date()
  };
  messages.value.push(loadingMessage);

  // 滚动到底部
  await nextTick();
  scrollToBottom();

  isLoading.value = true;

  try {
    // 调用智能问答API
    const response = await fetch('/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: query,
        scenario: 'basic'
      })
    });

    const result = await response.json();

    // 更新加载中的消息
    const messageIndex = messages.value.length - 1;
    messages.value[messageIndex] = {
      sender: 'assistant',
      text: result.data?.answer || '查询完成',
      cards: result.data?.cards || [],
      tableData: result.data?.tableData || [],
      tableColumns: result.data?.tableColumns || [],
      chartId: result.data?.chartId || null,
      isLoading: false,
      timestamp: new Date()
    };

    // 如果有图表数据，渲染图表
    if (result.data?.chartId) {
      await nextTick();
      // 这里可以添加图表渲染逻辑
    }

  } catch (error) {
    console.error('查询失败:', error);
    const messageIndex = messages.value.length - 1;
    messages.value[messageIndex] = {
      sender: 'assistant',
      text: '抱歉，查询过程中出现了错误，请稍后重试。',
      isLoading: false,
      timestamp: new Date()
    };
    ElMessage.error('查询失败，请稍后重试');
  } finally {
    isLoading.value = false;
    await nextTick();
    scrollToBottom();
  }
};
const sendMessage = async () => {
  const text = inputMessage.value.trim();
  if (!text || isLoading.value) return;

  // 添加到最近查询
  addToRecentQueries(text);

  // 隐藏欢迎界面
  showWelcome.value = false;

  // 添加用户消息
  const userMessage = {
    sender: 'user',
    text: text,
    timestamp: new Date()
  };
  messages.value.push(userMessage);

  // 清空输入框
  inputMessage.value = '';

  // 添加加载中的助手消息
  const loadingMessage = {
    sender: 'assistant',
    text: '',
    isLoading: true,
    timestamp: new Date()
  };
  messages.value.push(loadingMessage);

  // 滚动到底部
  await nextTick();
  scrollToBottom();

  isLoading.value = true;

  try {
    // 调用智能问答API
    const response = await fetch('/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: text,
        scenario: 'basic'
      })
    });

    const result = await response.json();

    // 更新加载中的消息
    const messageIndex = messages.value.length - 1;
    messages.value[messageIndex] = {
      sender: 'assistant',
      text: result.data?.answer || '查询完成',
      cards: result.data?.cards || [],
      tableData: result.data?.tableData || [],
      tableColumns: result.data?.tableColumns || [],
      chartId: result.data?.chartId || null,
      isLoading: false,
      timestamp: new Date()
    };

  } catch (error) {
    console.error('查询失败:', error);
    const messageIndex = messages.value.length - 1;
    messages.value[messageIndex] = {
      sender: 'assistant',
      text: '抱歉，查询过程中出现了错误，请稍后重试。',
      isLoading: false,
      timestamp: new Date()
    };
    ElMessage.error('查询失败，请稍后重试');
  } finally {
    isLoading.value = false;
    await nextTick();
    scrollToBottom();
  }
};

const clearMessages = () => {
  messages.value = [];
  showWelcome.value = true;
};

const scrollToBottom = async () => {
  await nextTick();
  if (scrollbarRef.value) {
    scrollbarRef.value.setScrollTop(scrollbarRef.value.wrapRef.scrollHeight);
  }
};

const addToRecentQueries = (query) => {
  const recentQuery = {
    text: query,
    timestamp: new Date()
  };

  // 避免重复
  const existingIndex = recentQueries.value.findIndex(q => q.text === query);
  if (existingIndex !== -1) {
    recentQueries.value.splice(existingIndex, 1);
  }

  // 添加到开头
  recentQueries.value.unshift(recentQuery);

  // 限制数量
  if (recentQueries.value.length > 10) {
    recentQueries.value = recentQueries.value.slice(0, 10);
  }
};

const clearRecentQueries = () => {
  recentQueries.value = [];
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const refreshRules = async () => {
  loadingRules.value = true;
  try {
    const response = await fetch('/api/rules');
    const result = await response.json();

    if (result.success && result.data) {
      // 按场景智能分类规则 - 使用中文分类名
      const categorizedRules = {
        '库存场景': [],
        '上线场景': [],
        '测试场景': [],
        '高级场景': []
      };

      result.data.forEach(rule => {
        // 根据规则内容智能分类
        const desc = rule.description ? rule.description.toLowerCase() : '';
        const target = rule.action_target ? rule.action_target.toLowerCase() : '';

        if (desc.includes('库存') || target.includes('inventory')) {
          categorizedRules['库存场景'].push(rule);
        } else if (desc.includes('上线') || target.includes('online_tracking')) {
          categorizedRules['上线场景'].push(rule);
        } else if (desc.includes('测试') || desc.includes('检验') || target.includes('lab_tests')) {
          categorizedRules['测试场景'].push(rule);
        } else {
          categorizedRules['高级场景'].push(rule);
        }
      });

      rulesLibrary.value = categorizedRules;
      totalRulesCount.value = result.data.length;

      // 统计各场景规则数量
      const stats = Object.entries(categorizedRules).map(([name, rules]) =>
        `${name}:${rules.length}条`
      ).join(', ');

      ElMessage.success(`已加载 ${result.data.length} 条规则 (${stats})`);

      console.log('📊 规则库加载完成:', {
        总数: result.data.length,
        库存场景: categorizedRules['库存场景'].length,
        上线场景: categorizedRules['上线场景'].length,
        测试场景: categorizedRules['测试场景'].length,
        高级场景: categorizedRules['高级场景'].length,
        更新时间: new Date().toLocaleString()
      });
    }
  } catch (error) {
    console.error('加载规则失败:', error);
    ElMessage.error('加载规则失败');
  } finally {
    loadingRules.value = false;
  }
};

// 实时问题分析
const performRealTimeAnalysis = (question) => {
  try {
    // 进行问题识别
    const analysis = recognizeQueryIntent(question);
    currentAnalysis.value = analysis;

    // 生成建议查询
    const suggestions = generateSuggestions(analysis);
    suggestedQueries.value = suggestions.slice(0, 4); // 限制数量

    // 匹配相关规则
    const matched = matchRules(analysis, rulesLibrary.value);
    matchedRules.value = matched.slice(0, 3); // 限制数量

    console.log('🧠 实时分析结果:', {
      question,
      analysis: formatAnalysisResult(analysis),
      suggestions: suggestions.length,
      matchedRules: matched.length
    });

  } catch (error) {
    console.error('实时分析失败:', error);
  }
};

// 应用建议查询
const applySuggestion = (suggestion) => {
  inputMessage.value = suggestion;
  // 清除分析结果，避免重复显示
  currentAnalysis.value = null;
  suggestedQueries.value = [];
};

// 选择匹配的规则
const selectMatchedRule = (rule) => {
  selectedRule.value = rule;
  if (rule.example_query) {
    inputMessage.value = rule.example_query;
  }
};

// 组件挂载时加载规则
onMounted(() => {
  refreshRules();
});
</script>

<style scoped>
/* 主布局 */
.qms-assistant-layout {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 左侧面板 (30%) */
.left-panel {
  width: 30%;
  background: white;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.panel-header h3 {
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}

.panel-subtitle {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

/* 规则库 */
.rules-library {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.library-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
  background: #fafbfc;
}

.rules-categories {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.category-section {
  margin-bottom: 4px;
}

.category-header {
  padding: 12px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #2c3e50;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.category-header:hover {
  background: #f5f7fa;
  border-left-color: #409eff;
}

.category-header.expanded {
  background: #ecf5ff;
  border-left-color: #409eff;
  color: #409eff;
}

.category-icon {
  font-size: 16px;
}

.category-name {
  flex: 1;
}

.category-count {
  font-size: 12px;
  color: #909399;
}

.expand-icon {
  font-size: 12px;
  transition: transform 0.2s;
}

.expand-icon.rotated {
  transform: rotate(90deg);
}

.rules-list {
  background: #fafbfc;
}

.rule-item {
  padding: 12px 20px 12px 40px;
  cursor: pointer;
  border-bottom: 1px solid #f0f2f5;
  transition: all 0.2s;
}

.rule-item:hover {
  background: #f0f9ff;
}

.rule-item.active {
  background: #e6f7ff;
  border-left: 3px solid #1890ff;
}

.rule-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.rule-name {
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
}

.rule-description {
  font-size: 12px;
  color: #606266;
  margin: 4px 0 8px 0;
  line-height: 1.4;
}

.rule-example {
  margin-top: 8px;
}

.example-btn {
  font-size: 12px;
  height: 24px;
  padding: 0 8px;
}

/* 数据范围说明 */
.data-scope {
  border-top: 1px solid #e4e7ed;
  background: #fafbfc;
}

.scope-header {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.scope-content {
  padding: 0 20px 16px;
}

.scope-item {
  margin-bottom: 12px;
}

.scope-item strong {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: #606266;
}

.scope-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* 中间对话区域 (50%) */
.center-panel {
  width: 50%;
  display: flex;
  flex-direction: column;
  background: white;
  border-right: 1px solid #e4e7ed;
}

.chat-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 16px;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-weight: 600;
  color: #2c3e50;
  font-size: 16px;
}

.header-subtitle {
  font-size: 12px;
  color: #909399;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.clear-btn {
  color: #909399;
}

.clear-btn:hover {
  color: #f56c6c;
}

.chat-body {
  flex: 1;
  overflow: hidden;
}

.scrollbar-wrapper {
  height: 100%;
}

/* 欢迎界面 */
.welcome-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.welcome-content {
  text-align: center;
  max-width: 500px;
}

.welcome-avatar {
  margin-bottom: 24px;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.welcome-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px 0;
}

.welcome-subtitle {
  font-size: 16px;
  color: #606266;
  margin: 0 0 32px 0;
  line-height: 1.5;
}

.quick-start-tips {
  margin-bottom: 32px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.popular-queries h4 {
  font-size: 16px;
  color: #2c3e50;
  margin: 0 0 16px 0;
}

.query-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.query-btn {
  font-size: 14px;
}

/* 对话消息 */
.messages-container {
  padding: 20px;
}

.message-wrapper {
  margin-bottom: 20px;
}

.message-wrapper.user {
  display: flex;
  justify-content: flex-end;
}

.message-wrapper.assistant {
  display: flex;
  justify-content: flex-start;
}

.user-message {
  background: #409eff;
  color: white;
  padding: 12px 16px;
  border-radius: 18px 18px 4px 18px;
  max-width: 70%;
  word-wrap: break-word;
}

.assistant-message {
  max-width: 85%;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.assistant-name {
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
}

.message-time {
  font-size: 12px;
  color: #909399;
}

.loading-content {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
}

.loading-text {
  margin-top: 12px;
  font-size: 14px;
  color: #606266;
  text-align: center;
}

.message-body {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
}

.message-text {
  font-size: 14px;
  line-height: 1.6;
  color: #2c3e50;
}

/* 数据卡片 */
.data-cards {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.data-card {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 14px;
}

.card-metrics {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.metric-label {
  color: #606266;
}

.metric-value {
  font-weight: 500;
}

.metric-value.primary {
  color: #409eff;
}

.metric-value.success {
  color: #67c23a;
}

.metric-value.warning {
  color: #e6a23c;
}

.metric-value.danger {
  color: #f56c6c;
}

/* 数据表格 */
.data-table {
  margin-top: 16px;
}

/* 图表容器 */
.chart-container {
  margin-top: 16px;
}

.chart-content {
  width: 100%;
  height: 300px;
}

/* 输入区域 */
.input-area {
  border-top: 1px solid #e4e7ed;
  padding: 16px 20px;
  background: white;
}

.input-container {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
}

.send-button {
  height: 40px;
  min-width: 80px;
}

.quick-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-action-btn {
  font-size: 12px;
  height: 28px;
  padding: 0 12px;
}

/* 右侧面板 (20%) */
.right-panel {
  width: 20%;
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 当前规则信息 */
.current-rule {
  border-bottom: 1px solid #e4e7ed;
  padding: 16px;
}

.rule-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
  font-size: 14px;
}

.rule-content h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #2c3e50;
}

.rule-desc {
  font-size: 12px;
  color: #606266;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.rule-meta {
  margin-bottom: 12px;
  display: flex;
  gap: 4px;
}

.rule-triggers strong {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: #606266;
}

.trigger-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* 数据统计 */
.data-stats {
  border-bottom: 1px solid #e4e7ed;
  padding: 16px;
}

.stats-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
  font-size: 14px;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.stat-label {
  color: #606266;
}

.stat-value {
  font-weight: 600;
  color: #409eff;
}

/* 实时分析结果 */
.real-time-analysis {
  border-bottom: 1px solid #e4e7ed;
  padding: 16px;
  background: #f8f9fa;
}

.analysis-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
  font-size: 14px;
}

.analysis-content {
  font-size: 12px;
}

.analysis-text {
  margin: 0 0 12px 0;
  color: #606266;
  line-height: 1.4;
}

.recognized-entities {
  margin-bottom: 12px;
}

.entity-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.suggested-queries h6,
.matched-rules h6 {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #2c3e50;
  font-weight: 500;
}

.suggestion-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.suggestion-btn {
  font-size: 11px;
  height: 24px;
  padding: 0 8px;
  text-align: left;
  justify-content: flex-start;
}

.rule-matches {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.matched-rule-item {
  padding: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.matched-rule-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.rule-match-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.rule-match-name {
  font-weight: 500;
  color: #2c3e50;
  font-size: 11px;
}

.match-score {
  font-size: 10px;
  color: #409eff;
  font-weight: 600;
}

.rule-match-desc {
  margin: 0;
  font-size: 10px;
  color: #909399;
  line-height: 1.3;
}

/* 问题识别提示 */
.query-hints {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.hints-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
  font-size: 14px;
}

.hints-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hint-section h5 {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #606266;
  font-weight: 500;
}

.hint-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.clickable-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.clickable-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 最近查询 */
.recent-queries {
  border-top: 1px solid #e4e7ed;
  padding: 16px;
}

.recent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.recent-header > div:first-child {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.recent-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recent-item {
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #f0f2f5;
}

.recent-item:hover {
  background: #f5f7fa;
  border-color: #409eff;
}

.recent-text {
  display: block;
  font-size: 12px;
  color: #2c3e50;
  margin-bottom: 4px;
  line-height: 1.3;
}

.recent-time {
  font-size: 11px;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .left-panel {
    width: 25%;
  }

  .center-panel {
    width: 55%;
  }

  .right-panel {
    width: 20%;
  }
}

@media (max-width: 768px) {
  .qms-assistant-layout {
    flex-direction: column;
  }

  .left-panel,
  .center-panel,
  .right-panel {
    width: 100%;
  }

  .left-panel {
    height: 200px;
  }

  .center-panel {
    flex: 1;
  }

  .right-panel {
    height: 150px;
  }
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 动画效果 */
.message-wrapper {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.rule-item {
  transition: all 0.2s ease;
}

.category-header {
  transition: all 0.2s ease;
}

.example-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}
</style>
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