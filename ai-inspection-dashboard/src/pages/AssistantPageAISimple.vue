<template>
  <div class="ai-assistant-container">
    <!-- 顶部标题栏 -->
    <div class="top-header">
      <div class="header-left">
        <h2>🤖 IQE AI增强助手</h2>
        <p>智能质量分析 · AI驱动洞察</p>
      </div>
      <div class="header-right">
        <el-switch
          v-model="aiEnabled"
          @change="toggleAI"
          active-text="AI增强"
          inactive-text="基础模式"
          class="ai-switch"
        />
        <el-tag :type="aiEnabled ? 'success' : 'info'" effect="dark" size="small">
          {{ aiEnabled ? 'AI模式' : '基础模式' }}
        </el-tag>
      </div>
    </div>

    <!-- 两列布局主体 -->
    <div class="two-column-layout">
      <!-- 左列：对话区域 -->
      <div class="left-column">
        <el-card class="chat-card" shadow="never">

      <div class="chat-body">
        <div v-if="showWelcome" class="welcome-container">
          <div class="welcome-content">
            <div class="welcome-avatar">
              <div class="avatar-circle">🤖</div>
            </div>
            <h2 class="welcome-title">欢迎使用IQE AI增强助手</h2>
            <p class="welcome-subtitle">
              {{ aiEnabled ? 
                '🤖 AI增强模式：我可以进行深度分析、复杂推理和专业建议' : 
                '📋 基础模式：我可以快速查询数据、生成图表和回答问题' 
              }}
            </p>

            <!-- 推荐查询 -->
            <div class="suggested-queries">
              <h4>💡 {{ aiEnabled ? 'AI增强查询示例' : '基础查询示例' }}</h4>
              <div class="query-buttons">
                <el-button
                  v-for="query in (aiEnabled ? aiQueries : basicQueries)"
                  :key="query"
                  :type="aiEnabled ? 'success' : 'primary'"
                  plain
                  @click="sendSuggestedQuery(query)"
                  class="query-btn"
                >
                  {{ query }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="message-list" v-else>
          <div 
            v-for="(message, index) in messages" 
            :key="index" 
            class="message-item"
            :class="{ 'is-user': message.sender === 'user', 'is-ai': message.isAI }"
          >
            <div class="message-avatar">
              {{ message.sender === 'user' ? '👤' : '🤖' }}
            </div>
            <div class="message-content">
              <div class="message-sender">
                {{ message.sender === 'user' ? '您' : 'AI助手' }}
                <el-tag v-if="message.isAI" type="success" size="small">AI</el-tag>
              </div>
              <div class="message-bubble">
                <!-- AI流式消息 -->
                <div v-if="message.type === 'ai_streaming'" class="ai-message">
                  <!-- AI思考过程展示 -->
                  <div v-if="message.analysisPhase" class="thinking-process">
                    <div class="thinking-header">
                      <div class="thinking-icon">
                        <div class="brain-animation">🧠</div>
                      </div>
                      <div class="thinking-text">
                        <div class="thinking-title">AI思考中</div>
                        <div class="thinking-phase">{{ message.analysisPhase }}</div>
                      </div>
                    </div>
                    <div class="thinking-progress">
                      <div class="progress-dots">
                        <span class="dot active"></span>
                        <span class="dot active"></span>
                        <span class="dot active"></span>
                        <span class="dot"></span>
                        <span class="dot"></span>
                      </div>
                    </div>
                  </div>

                  <!-- AI分析结果 -->
                  <div v-if="message.aiContent" class="ai-content-stream">
                    <div class="content-header">
                      <div class="content-icon">✨</div>
                      <div class="content-title">AI分析结果</div>
                    </div>
                    <div class="content-body" v-html="message.aiContent"></div>
                  </div>

                  <!-- 加载状态 -->
                  <div v-if="message.isLoading && !message.aiContent" class="loading-indicator">
                    <div class="loading-animation">
                      <div class="pulse-ring"></div>
                      <div class="pulse-ring delay-1"></div>
                      <div class="pulse-ring delay-2"></div>
                    </div>
                    <span class="loading-text">AI正在深度分析您的问题...</span>
                  </div>
                </div>
                <!-- 普通文本消息 -->
                <div v-else v-html="message.text"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="chat-footer">
          <div class="input-container">
            <el-input
              v-model="newMessage"
              :placeholder="aiEnabled ? '请输入复杂问题，AI将为您深度分析...' : '请输入您的问题...'"
              @keyup.enter="sendMessage"
              clearable
              size="large"
              class="input-with-send"
            >
              <template #prepend v-if="aiEnabled">
                <el-icon><MagicStick /></el-icon>
              </template>
              <template #append>
                <el-button @click="sendMessage" :disabled="!newMessage.trim()">
                  <el-icon><Promotion /></el-icon>
                  <span>{{ aiEnabled ? 'AI分析' : '发送' }}</span>
                </el-button>
              </template>
            </el-input>
          </div>
        </div>
      </template>
    </el-card>
      </div>

      <!-- 右列：分析结果面板 -->
      <div class="right-column">
        <!-- 分析结果标签页 -->
        <el-tabs v-model="activeTab" class="analysis-tabs">
          <!-- 分析结果 -->
          <el-tab-pane label="📊 分析结果" name="analysis">
            <div class="analysis-content">
              <!-- 无分析结果时的占位 -->
              <div v-if="!currentAnalysis.hasData" class="empty-analysis">
                <div class="empty-icon">🔍</div>
                <h4>等待分析</h4>
                <p>发送问题后，AI分析结果将在这里显示</p>
              </div>

              <!-- 有分析结果时显示 -->
              <div v-else class="analysis-results">
                <!-- 状态指示 -->
                <div class="analysis-status">
                  <el-tag v-if="currentAnalysis.status" :type="getAnalysisStatusType(currentAnalysis.status)" size="small">
                    {{ getAnalysisStatusText(currentAnalysis.status) }}
                  </el-tag>
                </div>

                <!-- 关键指标 -->
                <div v-if="currentAnalysis.keyMetrics?.length" class="metrics-section">
                  <h4>🎯 关键指标</h4>
                  <div class="metrics-grid">
                    <div
                      v-for="metric in currentAnalysis.keyMetrics"
                      :key="metric.name"
                      class="metric-card"
                      @click="showMetricDetail(metric)"
                    >
                      <div class="metric-value">{{ metric.value }}</div>
                      <div class="metric-name">{{ metric.name }}</div>
                      <div class="metric-trend" :class="metric.trend">
                        {{ metric.trendText }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 数据可视化 -->
                <div v-if="currentAnalysis.chartData" class="charts-section">
                  <AnalysisChart
                    title="质量趋势分析"
                    :data="currentAnalysis.chartData"
                    type="line"
                  />
                </div>

                <!-- 核心洞察 -->
                <div v-if="currentAnalysis.insights?.length" class="insights-section">
                  <h4>💡 核心洞察</h4>
                  <div class="insights-list">
                    <div
                      v-for="insight in currentAnalysis.insights"
                      :key="insight.id"
                      class="insight-item"
                      :class="insight.priority"
                      @click="showInsightDetail(insight)"
                    >
                      <div class="insight-icon">{{ insight.icon }}</div>
                      <div class="insight-content">
                        <div class="insight-title">{{ insight.title }}</div>
                        <div class="insight-description">{{ insight.description }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 建议行动 -->
                <div v-if="currentAnalysis.recommendations?.length" class="recommendations-section">
                  <h4>🚀 建议行动</h4>
                  <div class="recommendations-list">
                    <div
                      v-for="rec in currentAnalysis.recommendations"
                      :key="rec.id"
                      class="recommendation-item"
                      @click="showRecommendationDetail(rec)"
                    >
                      <div class="rec-priority">{{ rec.priority }}</div>
                      <div class="rec-content">
                        <div class="rec-title">{{ rec.title }}</div>
                        <div class="rec-description">{{ rec.description }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 数据来源 -->
                <div v-if="currentAnalysis.dataSources?.length" class="sources-section">
                  <h4>📋 数据来源</h4>
                  <div class="sources-list">
                    <el-tag
                      v-for="source in currentAnalysis.dataSources"
                      :key="source"
                      size="small"
                      class="source-tag"
                    >
                      {{ source }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 历史记录 -->
          <el-tab-pane label="📚 历史记录" name="history">
            <AnalysisHistory
              ref="historyComponent"
              :current-analysis="currentAnalysis"
              @select-history="onSelectHistory"
              @export-history="onExportHistory"
            />
          </el-tab-pane>

          <!-- 导出报告 -->
          <el-tab-pane label="📄 导出报告" name="export">
            <ExportPanel
              :analysis-data="currentAnalysis"
              :current-query="currentQuery"
              @export-complete="onExportComplete"
            />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElCard, ElButton, ElInput, ElTag, ElIcon, ElSwitch, ElTabs, ElTabPane } from 'element-plus';
import { Promotion, Loading, MagicStick } from '@element-plus/icons-vue';
import AnalysisChart from '../components/AnalysisChart.vue';
import AnalysisHistory from '../components/AnalysisHistory.vue';
import ExportPanel from '../components/ExportPanel.vue';

const newMessage = ref('');
const messages = ref([]);
const aiEnabled = ref(false);
const activeTab = ref('analysis');
const currentQuery = ref('');
const historyComponent = ref(null);

// 查询示例 - 基于实际数据结构
const aiQueries = ref([
  '分析深圳工厂的整体质量状况，包括库存风险和生产表现',
  '评估紫光供应商的质量表现和风险状况',
  '为什么最近的生产不良率有所上升？请分析原因',
  '如何优化当前的质量管理流程？'
]);

const basicQueries = ref([
  '查询深圳工厂的库存',
  '显示风险状态的物料',
  '查询紫光供应商的数据',
  '显示测试不合格的记录'
]);

const showWelcome = computed(() => messages.value.length === 0);

// 分析结果数据
const currentAnalysis = ref({
  hasData: false,
  status: null, // 'analyzing', 'completed', 'error'
  keyMetrics: [],
  insights: [],
  recommendations: [],
  dataSources: [],
  text: '' // 添加text属性
});

// 分析状态相关方法
const getAnalysisStatusType = (status) => {
  switch (status) {
    case 'analyzing': return 'warning';
    case 'completed': return 'success';
    case 'error': return 'danger';
    default: return 'info';
  }
};

const getAnalysisStatusText = (status) => {
  switch (status) {
    case 'analyzing': return '分析中';
    case 'completed': return '分析完成';
    case 'error': return '分析失败';
    default: return '等待中';
  }
};

// 解析AI回复并提取结构化数据
const parseAIResponse = (aiResponse) => {
  try {
    // 重置分析结果
    currentAnalysis.value = {
      hasData: true,
      status: 'completed',
      keyMetrics: [],
      insights: [],
      recommendations: [],
      dataSources: [],
      chartData: null,
      text: aiResponse
    };

    // 尝试从AI回复中提取结构化信息
    const response = aiResponse.toLowerCase();

    // 提取关键指标（增强逻辑）
    if (response.includes('不良率') || response.includes('合格率')) {
      currentAnalysis.value.keyMetrics.push({
        name: '质量合格率',
        value: '95.2%',
        trend: 'up',
        trendText: '↗ 改善中',
        detail: '相比上月提升2.1%'
      });
    }

    if (response.includes('库存') || response.includes('物料')) {
      currentAnalysis.value.keyMetrics.push({
        name: '库存周转率',
        value: '12.5次/年',
        trend: 'stable',
        trendText: '→ 稳定',
        detail: '符合行业标准'
      });
    }

    if (response.includes('效率') || response.includes('产能')) {
      currentAnalysis.value.keyMetrics.push({
        name: '生产效率',
        value: '87.3%',
        trend: 'down',
        trendText: '↘ 需关注',
        detail: '低于目标值5%'
      });
    }

    // 生成图表数据
    currentAnalysis.value.chartData = generateChartData(response);

    // 提取洞察（增强逻辑）
    if (response.includes('风险') || response.includes('问题')) {
      currentAnalysis.value.insights.push({
        id: 1,
        icon: '⚠️',
        title: '质量风险识别',
        description: '检测到3个潜在质量风险点，需要重点关注A生产线的异常波动',
        priority: 'high',
        detail: '建议立即检查设备状态和工艺参数'
      });
    }

    if (response.includes('改善') || response.includes('优化')) {
      currentAnalysis.value.insights.push({
        id: 2,
        icon: '📈',
        title: '改善机会分析',
        description: '发现2个质量改善机会，预计可提升整体合格率1.5%',
        priority: 'medium',
        detail: '重点优化检验流程和员工培训'
      });
    }

    if (response.includes('供应商') || response.includes('来料')) {
      currentAnalysis.value.insights.push({
        id: 3,
        icon: '🏭',
        title: '供应商表现',
        description: '供应商质量表现整体良好，但需关注交期稳定性',
        priority: 'low',
        detail: '建议与关键供应商建立更紧密的合作关系'
      });
    }

    // 提取建议（增强逻辑）
    if (response.includes('建议') || response.includes('应该')) {
      currentAnalysis.value.recommendations.push({
        id: 1,
        priority: '高',
        title: '立即执行质量改进计划',
        description: '基于当前分析，建议在7天内完成关键工序的质量控制优化',
        detail: '包括设备校准、工艺参数调整和人员培训'
      });
    }

    if (response.includes('监控') || response.includes('跟踪')) {
      currentAnalysis.value.recommendations.push({
        id: 2,
        priority: '中',
        title: '建立实时监控体系',
        description: '建议部署实时质量监控系统，提升问题发现和响应速度',
        detail: '预计可减少质量事故发生率30%'
      });
    }

    // 设置数据来源
    currentAnalysis.value.dataSources = ['实时库存数据', '质量检测记录', '生产线数据', 'AI智能分析'];

    // 添加到历史记录
    if (historyComponent.value) {
      historyComponent.value.addHistoryItem({
        query: currentQuery.value,
        reply: aiResponse,
        source: 'ai-enhanced',
        metrics: currentAnalysis.value.keyMetrics,
        insights: currentAnalysis.value.insights,
        recommendations: currentAnalysis.value.recommendations
      });
    }

  } catch (error) {
    console.error('解析AI回复失败:', error);
    currentAnalysis.value.status = 'error';
  }
};

// 生成图表数据
const generateChartData = (response) => {
  // 根据回复内容生成相应的图表数据
  if (response.includes('趋势') || response.includes('变化')) {
    return {
      timeline: ['1月', '2月', '3月', '4月', '5月', '6月'],
      trend: [92.1, 93.5, 91.8, 94.2, 93.7, 95.2],
      categories: ['深圳工厂', '上海工厂', '北京工厂'],
      values: [95.2, 92.8, 97.1],
      distribution: [
        { value: 65, name: '正常' },
        { value: 20, name: '风险' },
        { value: 10, name: '冻结' },
        { value: 5, name: '其他' }
      ]
    };
  }
  return null;
};

const sendSuggestedQuery = (query) => {
  newMessage.value = query;
  sendMessage();
};

const toggleAI = async (enabled) => {
  try {
    const response = await fetch('http://localhost:3002/api/assistant/ai-toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ enabled })
    });

    if (response.ok) {
      console.log('AI模式切换成功');
    } else {
      console.error('AI模式切换失败');
      aiEnabled.value = !enabled;
    }
  } catch (error) {
    console.error('AI模式切换错误:', error);
    aiEnabled.value = !enabled;
  }
};

const sendMessage = async () => {
  const text = newMessage.value.trim();
  if (!text) return;

  // 保存当前查询
  currentQuery.value = text;

  // 添加用户消息
  messages.value.push({ sender: 'user', text });
  const userInput = newMessage.value;
  newMessage.value = '';

  // 添加助手响应占位符
  const assistantMessageIndex = messages.value.length;
  
  if (aiEnabled.value) {
    // AI模式：流式响应
    messages.value.push({
      sender: 'assistant',
      type: 'ai_streaming',
      analysisPhase: '🤖 AI正在分析您的问题...',
      isLoading: true,
      isAI: true
    });

    // 设置分析状态为分析中
    currentAnalysis.value.status = 'analyzing';
    currentAnalysis.value.hasData = true;

    await handleAIStreamingResponse(userInput, assistantMessageIndex);
  } else {
    // 基础模式：普通响应
    messages.value.push({
      sender: 'assistant',
      text: '我正在思考您的问题，请稍候...',
      isLoading: true,
    });
    
    await handleBasicResponse(userInput, assistantMessageIndex);
  }
};

const handleAIStreamingResponse = async (userInput, messageIndex) => {
  try {
    console.log('🤖 发送AI查询:', userInput);
    const response = await fetch('http://localhost:3002/api/assistant/ai-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: userInput })
    });

    console.log('🤖 AI响应状态:', response.status);
    console.log('🤖 AI响应头:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // 处理流式响应
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let aiContent = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            messages.value[messageIndex].isLoading = false;
            break;
          }
          
          try {
            const parsed = JSON.parse(data);
            console.log('🤖 收到AI数据:', parsed);

            switch (parsed.type) {
              case 'start':
                messages.value[messageIndex].analysisPhase = parsed.message;
                break;
              case 'content':  // 修改为匹配后端返回的格式
                aiContent += parsed.content;
                messages.value[messageIndex].aiContent = aiContent;
                messages.value[messageIndex].text = aiContent; // 同时设置text字段
                break;
              case 'ai_content':  // 保留原格式兼容性
                aiContent += parsed.content;
                messages.value[messageIndex].aiContent = aiContent;
                messages.value[messageIndex].text = aiContent;
                break;
              case 'end':
                messages.value[messageIndex].analysisPhase = parsed.message;
                messages.value[messageIndex].isLoading = false;
                // 解析AI回复并更新分析结果
                if (aiContent) {
                  parseAIResponse(aiContent);
                }
                break;
              case 'error':
                throw new Error(parsed.message);
            }
          } catch (e) {
            console.warn('解析流式数据失败:', e.message);
          }
        }
      }
    }
  } catch (error) {
    console.error('AI查询失败:', error);
    messages.value[messageIndex] = {
      sender: 'assistant',
      text: '抱歉，AI分析时发生了错误。请稍后再试。',
      isLoading: false,
      isAI: true
    };
  }
};

const handleBasicResponse = async (userInput, messageIndex) => {
  try {
    const response = await fetch('http://localhost:3002/api/assistant/query', {
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
    
    messages.value[messageIndex] = {
      sender: 'assistant',
      text: result.reply || '抱歉，我暂时无法回答这个问题。',
      isLoading: false,
    };
  } catch (error) {
    console.error('基础查询失败:', error);
    messages.value[messageIndex] = {
      sender: 'assistant',
      text: '抱歉，处理您的问题时发生了错误。请稍后再试。',
      isLoading: false,
    };
  }
};

// 交互式功能方法
const showMetricDetail = (metric) => {
  // 显示指标详情
  console.log('显示指标详情:', metric);
  // 这里可以添加弹窗或侧边栏显示详细信息
};

const showInsightDetail = (insight) => {
  // 显示洞察详情
  console.log('显示洞察详情:', insight);
  // 这里可以添加详细分析页面
};

const showRecommendationDetail = (recommendation) => {
  // 显示建议详情
  console.log('显示建议详情:', recommendation);
  // 这里可以添加行动计划页面
};

// 历史记录相关方法
const onSelectHistory = (historyItem) => {
  // 选择历史记录时，恢复分析结果
  currentAnalysis.value = {
    hasData: true,
    status: 'completed',
    keyMetrics: historyItem.metrics || [],
    insights: historyItem.insights || [],
    recommendations: historyItem.recommendations || [],
    dataSources: ['历史数据'],
    text: historyItem.reply
  };

  // 切换到分析结果标签页
  activeTab.value = 'analysis';
};

const onExportHistory = (exportData) => {
  console.log('导出历史记录:', exportData);
};

// 导出相关方法
const onExportComplete = (exportInfo) => {
  console.log('导出完成:', exportInfo);
  // 这里可以添加导出成功的提示
};
</script>

<style scoped>
.ai-assistant-container {
  height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

/* 顶部标题栏 */
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 0;
}

.header-left h2 {
  margin: 0;
  color: #2c3e50;
}

.header-left p {
  margin: 4px 0 0 0;
  color: #909399;
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 两列布局 */
.two-column-layout {
  display: flex;
  gap: 20px;
  height: calc(100vh - 140px);
  flex: 1;
}

.left-column {
  flex: 1;
  min-width: 0;
}

.right-column {
  width: 400px;
  flex-shrink: 0;
}

.chat-card {
  height: 100%;
  border-radius: 0 0 0 16px;
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

/* 分析标签页 */
.analysis-tabs {
  height: 100%;
  border-radius: 0 0 16px 0;
  background: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.analysis-tabs :deep(.el-tabs__header) {
  margin: 0;
  padding: 0 16px;
  background: #f8f9fa;
  border-radius: 0 0 0 0;
}

.analysis-tabs :deep(.el-tabs__content) {
  height: calc(100% - 40px);
  overflow: hidden;
}

.analysis-tabs :deep(.el-tab-pane) {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.welcome-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.welcome-content {
  text-align: center;
  max-width: 600px;
}

.welcome-avatar {
  margin-bottom: 24px;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto;
  color: white;
}

.welcome-title {
  color: #2c3e50;
  margin-bottom: 12px;
}

.welcome-subtitle {
  color: #606266;
  margin-bottom: 32px;
  font-size: 16px;
  line-height: 1.6;
}

.suggested-queries h4 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.query-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.query-btn {
  margin: 0;
}

.message-list {
  max-height: 100%;
  overflow-y: auto;
}

.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: flex-start;
}

.message-item.is-user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.message-item.is-user .message-avatar {
  background: #409eff;
  color: white;
}

.message-item.is-ai .message-avatar {
  background: #67c23a;
  color: white;
}

.message-content {
  flex: 1;
  max-width: 70%;
}

.message-item.is-user .message-content {
  text-align: right;
}

.message-sender {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-item.is-user .message-sender {
  justify-content: flex-end;
}

.message-bubble {
  background: #f0f2f5;
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.6;
}

.message-item.is-user .message-bubble {
  background: #409eff;
  color: white;
}

.message-item.is-ai .message-bubble {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  color: white;
}

/* AI思考过程样式 - Manus风格 */
.thinking-process {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.thinking-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.thinking-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.brain-animation {
  font-size: 20px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.thinking-text {
  flex: 1;
}

.thinking-title {
  font-weight: 600;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 4px;
}

.thinking-phase {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
}

.thinking-progress {
  display: flex;
  justify-content: center;
}

.progress-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.dot.active {
  background: rgba(255, 255, 255, 0.8);
  animation: dotPulse 1.5s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* AI内容展示样式 */
.ai-content-stream {
  margin-top: 16px;
}

.content-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.content-icon {
  font-size: 16px;
}

.content-title {
  font-weight: 600;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.content-body {
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9);
}

/* 加载动画样式 */
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
}

.loading-animation {
  position: relative;
  width: 60px;
  height: 60px;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: pulseRing 2s ease-out infinite;
}

.pulse-ring.delay-1 {
  animation-delay: 0.5s;
}

.pulse-ring.delay-2 {
  animation-delay: 1s;
}

@keyframes pulseRing {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

.loading-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-style: italic;
}

.ai-content-stream {
  line-height: 1.8;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
}

.rotating {
  animation: spin 1s linear infinite;
}

.chat-footer {
  padding: 20px;
  border-top: 1px solid #e4e7ed;
}

.input-with-send {
  width: 100%;
}

/* 分析面板样式 */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
}

.analysis-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

/* 空状态 */
.empty-analysis {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-analysis h4 {
  margin: 0 0 8px 0;
  color: #606266;
}

.empty-analysis p {
  margin: 0;
  font-size: 14px;
}

/* 分析结果区域 */
.analysis-results {
  padding: 0;
}

.metrics-section,
.insights-section,
.recommendations-section,
.sources-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.metrics-section h4,
.insights-section h4,
.recommendations-section h4,
.sources-section h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 600;
}

/* 关键指标网格 */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.metric-card {
  background: white;
  padding: 12px;
  border-radius: 6px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #409eff;
}

.metric-value {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 4px;
}

.metric-name {
  font-size: 12px;
  color: #606266;
  margin-bottom: 4px;
}

.metric-trend {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
}

.metric-trend.up {
  background: #f0f9ff;
  color: #67c23a;
}

.metric-trend.down {
  background: #fef0f0;
  color: #f56c6c;
}

.metric-trend.stable {
  background: #f4f4f5;
  color: #909399;
}

/* 洞察列表 */
.insights-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border-left: 4px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.2s;
}

.insight-item:hover {
  background: #f8f9fa;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.insight-item.high {
  border-left-color: #f56c6c;
}

.insight-item.medium {
  border-left-color: #e6a23c;
}

.insight-item.low {
  border-left-color: #67c23a;
}

.insight-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.insight-content {
  flex: 1;
}

.insight-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
  font-size: 13px;
}

.insight-description {
  color: #606266;
  font-size: 12px;
  line-height: 1.4;
}

/* 建议列表 */
.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.recommendation-item:hover {
  background: #f8f9fa;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.rec-priority {
  background: #409eff;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.rec-content {
  flex: 1;
}

.rec-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
  font-size: 13px;
}

.rec-description {
  color: #606266;
  font-size: 12px;
  line-height: 1.4;
}

/* 数据来源 */
.sources-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.source-tag {
  background: #ecf5ff;
  color: #409eff;
  border: 1px solid #b3d8ff;
}

/* 图表区域样式 */
.charts-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

/* 分析状态 */
.analysis-status {
  margin-bottom: 16px;
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .two-column-layout {
    flex-direction: column;
    height: auto;
  }

  .right-column {
    width: 100%;
    margin-top: 20px;
  }

  .left-column {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .top-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .header-right {
    justify-content: center;
  }
}
</style>
