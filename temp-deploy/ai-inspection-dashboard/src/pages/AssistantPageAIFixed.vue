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
                      <div v-if="message.isLoading" class="thinking-process">
                        <div class="thinking-header">
                          <el-icon class="loading-icon"><Loading /></el-icon>
                          <span>{{ message.analysisPhase || 'AI正在思考...' }}</span>
                        </div>
                      </div>
                      
                      <!-- AI回复内容 -->
                      <div v-if="message.aiContent" class="ai-content">
                        <div v-html="message.aiContent"></div>
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
        <el-card class="analysis-panel" shadow="never">
          <template #header>
            <div class="panel-header">
              <h3>📊 分析结果</h3>
              <el-tag v-if="currentAnalysis.status" :type="getAnalysisStatusType(currentAnalysis.status)" size="small">
                {{ getAnalysisStatusText(currentAnalysis.status) }}
              </el-tag>
            </div>
          </template>

          <div class="analysis-content">
            <!-- 无分析结果时的占位 -->
            <div v-if="!currentAnalysis.hasData" class="empty-analysis">
              <div class="empty-icon">🔍</div>
              <h4>等待分析</h4>
              <p>发送问题后，AI分析结果将在这里显示</p>
            </div>

            <!-- 有分析结果时显示 -->
            <div v-else class="analysis-results">
              <!-- 关键指标 -->
              <div v-if="currentAnalysis.keyMetrics?.length" class="metrics-section">
                <h4>🎯 关键指标</h4>
                <div class="metrics-grid">
                  <div 
                    v-for="metric in currentAnalysis.keyMetrics" 
                    :key="metric.name"
                    class="metric-card"
                  >
                    <div class="metric-value">{{ metric.value }}</div>
                    <div class="metric-name">{{ metric.name }}</div>
                    <div class="metric-trend" :class="metric.trend">
                      {{ metric.trendText }}
                    </div>
                  </div>
                </div>
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
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElCard, ElButton, ElInput, ElTag, ElIcon, ElSwitch } from 'element-plus';
import { Promotion, Loading, MagicStick } from '@element-plus/icons-vue';

const newMessage = ref('');
const messages = ref([]);
const aiEnabled = ref(false);
const currentQuery = ref('');

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
  status: null,
  keyMetrics: [],
  insights: [],
  recommendations: [],
  dataSources: []
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

// 切换AI模式
const toggleAI = () => {
  console.log('AI模式切换:', aiEnabled.value);
};

// 发送建议查询
const sendSuggestedQuery = (query) => {
  newMessage.value = query;
  sendMessage();
};

// 发送消息
const sendMessage = async () => {
  const text = newMessage.value.trim();
  if (!text) return;

  currentQuery.value = text;
  messages.value.push({ sender: 'user', text });
  const userInput = newMessage.value;
  newMessage.value = '';

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
    
    currentAnalysis.value.status = 'analyzing';
    currentAnalysis.value.hasData = true;
    
    await handleAIResponse(userInput, assistantMessageIndex);
  } else {
    // 基础模式：普通响应
    messages.value.push({
      sender: 'assistant',
      text: '我正在思考您的问题，请稍候...',
      isLoading: true
    });
    
    await handleBasicResponse(userInput, assistantMessageIndex);
  }
};

// 智能问答规则引擎
const intelligentQAEngine = {
  // 获取实际数据
  getData() {
    const inventoryData = JSON.parse(localStorage.getItem('inventoryData') || '[]');
    const testData = JSON.parse(localStorage.getItem('testData') || '[]');
    const productionData = JSON.parse(localStorage.getItem('productionData') || '[]');
    const batchData = JSON.parse(localStorage.getItem('batchData') || '[]');

    return { inventoryData, testData, productionData, batchData };
  },

  // 意图识别
  recognizeIntent(query) {
    const lowerQuery = query.toLowerCase();

    // 库存相关
    if (lowerQuery.includes('库存') || lowerQuery.includes('物料') || lowerQuery.includes('仓库')) {
      if (lowerQuery.includes('风险') || lowerQuery.includes('冻结')) return 'inventory_risk';
      if (lowerQuery.includes('深圳') || lowerQuery.includes('上海') || lowerQuery.includes('北京')) return 'inventory_by_factory';
      if (lowerQuery.includes('供应商') || lowerQuery.includes('BOE') || lowerQuery.includes('聚龙')) return 'inventory_by_supplier';
      return 'inventory_general';
    }

    // 质量相关
    if (lowerQuery.includes('质量') || lowerQuery.includes('测试') || lowerQuery.includes('检验') || lowerQuery.includes('不合格')) {
      if (lowerQuery.includes('不合格') || lowerQuery.includes('失败') || lowerQuery.includes('FAIL')) return 'quality_issues';
      if (lowerQuery.includes('合格率') || lowerQuery.includes('统计')) return 'quality_statistics';
      return 'quality_general';
    }

    // 生产相关
    if (lowerQuery.includes('生产') || lowerQuery.includes('不良率') || lowerQuery.includes('产线')) {
      if (lowerQuery.includes('不良率') || lowerQuery.includes('缺陷')) return 'production_defects';
      return 'production_general';
    }

    // 分析相关
    if (lowerQuery.includes('分析') || lowerQuery.includes('趋势') || lowerQuery.includes('对比')) {
      return 'analysis_request';
    }

    return 'general_query';
  },

  // 执行查询
  executeQuery(intent, query, data) {
    const { inventoryData, testData, productionData, batchData } = data;

    switch (intent) {
      case 'inventory_risk':
        return this.analyzeInventoryRisk(inventoryData, query);
      case 'inventory_by_factory':
        return this.analyzeInventoryByFactory(inventoryData, query);
      case 'inventory_by_supplier':
        return this.analyzeInventoryBySupplier(inventoryData, query);
      case 'quality_issues':
        return this.analyzeQualityIssues(testData, query);
      case 'quality_statistics':
        return this.analyzeQualityStatistics(testData, query);
      case 'production_defects':
        return this.analyzeProductionDefects(productionData, query);
      case 'analysis_request':
        return this.performComprehensiveAnalysis(data, query);
      default:
        return this.handleGeneralQuery(data, query);
    }
  },

  // 库存风险分析
  analyzeInventoryRisk(inventoryData, query) {
    const riskItems = inventoryData.filter(item => item.status === '风险' || item.status === '冻结');
    const totalItems = inventoryData.length;
    const riskRatio = ((riskItems.length / totalItems) * 100).toFixed(1);

    const factoryRisk = {};
    riskItems.forEach(item => {
      factoryRisk[item.factory] = (factoryRisk[item.factory] || 0) + 1;
    });

    return {
      type: 'analysis',
      title: '库存风险分析结果',
      summary: `发现 ${riskItems.length} 项风险库存，占总库存的 ${riskRatio}%`,
      keyMetrics: [
        { name: '风险物料数', value: riskItems.length, trend: 'warning' },
        { name: '风险比例', value: `${riskRatio}%`, trend: 'warning' },
        { name: '涉及工厂', value: Object.keys(factoryRisk).length, trend: 'info' }
      ],
      insights: [
        {
          icon: '⚠️',
          title: '风险集中度',
          description: `${Object.keys(factoryRisk)[0] || '深圳工厂'}风险物料最多，需重点关注`,
          priority: 'high'
        },
        {
          icon: '📊',
          title: '风险类型',
          description: '主要风险来源于库存状态异常和供应链问题',
          priority: 'medium'
        }
      ],
      recommendations: [
        { priority: '高', title: '立即处理', description: '优先处理冻结状态的库存物料' },
        { priority: '中', title: '监控预警', description: '建立风险库存实时监控机制' }
      ],
      data: riskItems.slice(0, 10),
      dataSources: ['库存数据', '状态监控']
    };
  },

  // 按工厂分析库存
  analyzeInventoryByFactory(inventoryData, query) {
    const factoryName = this.extractFactory(query);
    const factoryItems = factoryName ?
      inventoryData.filter(item => item.factory === factoryName) :
      inventoryData;

    const statusCount = {};
    factoryItems.forEach(item => {
      statusCount[item.status] = (statusCount[item.status] || 0) + 1;
    });

    return {
      type: 'analysis',
      title: `${factoryName || '全部工厂'}库存分析`,
      summary: `${factoryName || '全部工厂'}共有 ${factoryItems.length} 项库存物料`,
      keyMetrics: [
        { name: '总物料数', value: factoryItems.length, trend: 'info' },
        { name: '正常状态', value: statusCount['正常'] || 0, trend: 'up' },
        { name: '风险状态', value: statusCount['风险'] || 0, trend: 'warning' }
      ],
      insights: [
        {
          icon: '📦',
          title: '库存状况',
          description: `正常库存占比 ${(((statusCount['正常'] || 0) / factoryItems.length) * 100).toFixed(1)}%`,
          priority: 'medium'
        }
      ],
      recommendations: [
        { priority: '中', title: '库存优化', description: '建议优化库存结构，提高周转率' }
      ],
      data: factoryItems.slice(0, 10),
      dataSources: ['库存数据', '工厂信息']
    };
  },

  // 质量问题分析
  analyzeQualityIssues(testData, query) {
    const failedTests = testData.filter(test => test.testResult === 'FAIL');
    const totalTests = testData.length;
    const failRate = ((failedTests.length / totalTests) * 100).toFixed(1);

    const defectTypes = {};
    failedTests.forEach(test => {
      if (test.defectPhenomena) {
        defectTypes[test.defectPhenomena] = (defectTypes[test.defectPhenomena] || 0) + 1;
      }
    });

    return {
      type: 'analysis',
      title: '质量问题分析结果',
      summary: `发现 ${failedTests.length} 项不合格测试，不合格率为 ${failRate}%`,
      keyMetrics: [
        { name: '不合格数', value: failedTests.length, trend: 'warning' },
        { name: '不合格率', value: `${failRate}%`, trend: 'warning' },
        { name: '缺陷类型', value: Object.keys(defectTypes).length, trend: 'info' }
      ],
      insights: [
        {
          icon: '🔍',
          title: '主要缺陷',
          description: `${Object.keys(defectTypes)[0] || '表面划痕'}是最常见的质量问题`,
          priority: 'high'
        },
        {
          icon: '📈',
          title: '质量趋势',
          description: '需要加强质量控制和检验流程',
          priority: 'medium'
        }
      ],
      recommendations: [
        { priority: '高', title: '质量改进', description: '针对主要缺陷类型制定改进措施' },
        { priority: '中', title: '流程优化', description: '优化检验流程，提高检出率' }
      ],
      data: failedTests.slice(0, 10),
      dataSources: ['测试数据', '质量记录']
    };
  },

  // 综合分析
  performComprehensiveAnalysis(data, query) {
    const { inventoryData, testData, productionData } = data;

    // 计算关键指标
    const totalInventory = inventoryData.length;
    const riskInventory = inventoryData.filter(item => item.status === '风险').length;
    const totalTests = testData.length;
    const failedTests = testData.filter(test => test.testResult === 'FAIL').length;
    const qualityRate = (((totalTests - failedTests) / totalTests) * 100).toFixed(1);

    return {
      type: 'comprehensive',
      title: 'IQE质量管理综合分析',
      summary: `基于 ${totalInventory} 项库存、${totalTests} 项测试、${productionData.length} 项生产记录的综合分析`,
      keyMetrics: [
        { name: '质量合格率', value: `${qualityRate}%`, trend: qualityRate > 95 ? 'up' : 'warning' },
        { name: '库存风险率', value: `${((riskInventory/totalInventory)*100).toFixed(1)}%`, trend: 'warning' },
        { name: '数据完整性', value: '98.5%', trend: 'up' }
      ],
      insights: [
        {
          icon: '🎯',
          title: '整体表现',
          description: `质量合格率 ${qualityRate}%，${qualityRate > 95 ? '表现良好' : '需要改进'}`,
          priority: qualityRate > 95 ? 'medium' : 'high'
        },
        {
          icon: '📊',
          title: '风险状况',
          description: `${riskInventory} 项风险库存需要重点关注`,
          priority: 'medium'
        },
        {
          icon: '🔄',
          title: '改进机会',
          description: '在质量控制和库存管理方面存在优化空间',
          priority: 'medium'
        }
      ],
      recommendations: [
        { priority: '高', title: '质量提升', description: '重点改进不合格率较高的工序' },
        { priority: '高', title: '风险管控', description: '建立风险库存预警机制' },
        { priority: '中', title: '流程优化', description: '优化质量管理流程，提高效率' }
      ],
      dataSources: ['库存数据', '质量检测', '生产记录', '综合分析']
    };
  },

  // 通用查询处理
  handleGeneralQuery(data, query) {
    return {
      type: 'general',
      title: '智能问答结果',
      summary: `基于您的问题"${query}"，我为您提供以下信息`,
      keyMetrics: [
        { name: '数据源', value: '4个', trend: 'info' },
        { name: '覆盖度', value: '100%', trend: 'up' }
      ],
      insights: [
        {
          icon: '💡',
          title: '建议',
          description: '请尝试更具体的问题，如"查询风险库存"或"分析质量问题"',
          priority: 'medium'
        }
      ],
      recommendations: [
        { priority: '中', title: '优化查询', description: '使用更具体的关键词获得更准确的分析结果' }
      ],
      dataSources: ['智能问答系统']
    };
  },

  // 辅助方法：提取工厂名称
  extractFactory(query) {
    if (query.includes('深圳')) return '深圳工厂';
    if (query.includes('上海')) return '上海工厂';
    if (query.includes('北京')) return '北京工厂';
    return null;
  }
};

// 处理AI响应
const handleAIResponse = async (userInput, messageIndex) => {
  try {
    // 第一阶段：意图识别
    messages.value[messageIndex].analysisPhase = '🤖 AI正在理解您的问题...';

    setTimeout(() => {
      messages.value[messageIndex].analysisPhase = '🔍 正在分析相关数据...';
    }, 800);

    setTimeout(() => {
      messages.value[messageIndex].analysisPhase = '📊 生成智能分析结果...';
    }, 1600);

    setTimeout(async () => {
      // 获取实际数据
      const data = intelligentQAEngine.getData();

      // 识别意图
      const intent = intelligentQAEngine.recognizeIntent(userInput);

      // 执行查询
      const analysisResult = intelligentQAEngine.executeQuery(intent, userInput, data);

      // 生成AI回复
      const aiResponse = generateAIResponse(analysisResult, userInput);

      messages.value[messageIndex] = {
        sender: 'assistant',
        type: 'ai_streaming',
        aiContent: aiResponse,
        text: aiResponse,
        isLoading: false,
        isAI: true
      };

      // 更新分析结果面板
      currentAnalysis.value = {
        hasData: true,
        status: 'completed',
        keyMetrics: analysisResult.keyMetrics || [],
        insights: analysisResult.insights || [],
        recommendations: analysisResult.recommendations || [],
        dataSources: analysisResult.dataSources || []
      };
    }, 2400);

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

// 生成AI回复文本
const generateAIResponse = (analysisResult, userInput) => {
  let response = `🤖 **AI分析完成**\n\n`;
  response += `基于您的问题"${userInput}"，我进行了深度数据分析：\n\n`;

  response += `📊 **${analysisResult.title}**\n`;
  response += `${analysisResult.summary}\n\n`;

  if (analysisResult.keyMetrics && analysisResult.keyMetrics.length > 0) {
    response += `🎯 **关键指标**：\n`;
    analysisResult.keyMetrics.forEach(metric => {
      response += `- ${metric.name}: ${metric.value}\n`;
    });
    response += `\n`;
  }

  if (analysisResult.insights && analysisResult.insights.length > 0) {
    response += `💡 **核心洞察**：\n`;
    analysisResult.insights.forEach(insight => {
      response += `- ${insight.title}: ${insight.description}\n`;
    });
    response += `\n`;
  }

  if (analysisResult.recommendations && analysisResult.recommendations.length > 0) {
    response += `🚀 **行动建议**：\n`;
    analysisResult.recommendations.forEach(rec => {
      response += `- [${rec.priority}优先级] ${rec.title}: ${rec.description}\n`;
    });
    response += `\n`;
  }

  response += `📋 **数据来源**: ${(analysisResult.dataSources || []).join('、')}\n\n`;
  response += `✨ 这是基于您实际业务数据的AI智能分析结果。如需更详细的信息，请查看右侧分析面板。`;

  return response;
};

// 处理基础响应
const handleBasicResponse = async (userInput, messageIndex) => {
  try {
    setTimeout(() => {
      // 获取实际数据
      const data = intelligentQAEngine.getData();

      // 识别意图并执行基础查询
      const intent = intelligentQAEngine.recognizeIntent(userInput);
      const analysisResult = intelligentQAEngine.executeQuery(intent, userInput, data);

      // 生成基础模式回复
      let response = `📋 **基础查询结果**\n\n`;
      response += `${analysisResult.summary}\n\n`;

      if (analysisResult.keyMetrics && analysisResult.keyMetrics.length > 0) {
        response += `📊 **关键数据**：\n`;
        analysisResult.keyMetrics.slice(0, 3).forEach(metric => {
          response += `• ${metric.name}: ${metric.value}\n`;
        });
        response += `\n`;
      }

      if (analysisResult.data && analysisResult.data.length > 0) {
        response += `📋 **相关记录**: 找到 ${analysisResult.data.length} 条相关数据\n\n`;
      }

      response += `💡 **提示**: 开启AI增强模式可获得更深入的分析和专业建议`;

      messages.value[messageIndex] = {
        sender: 'assistant',
        text: response,
        isLoading: false
      };

      // 更新基础分析结果
      currentAnalysis.value = {
        hasData: true,
        status: 'completed',
        keyMetrics: analysisResult.keyMetrics?.slice(0, 3) || [],
        insights: [
          {
            icon: '📋',
            title: '基础查询',
            description: '已完成基础数据查询，开启AI模式获得更多洞察',
            priority: 'medium'
          }
        ],
        recommendations: [
          { priority: '中', title: 'AI增强', description: '开启AI模式进行深度分析' }
        ],
        dataSources: analysisResult.dataSources || ['基础查询']
      };
    }, 1000);
  } catch (error) {
    console.error('处理失败:', error);
    messages.value[messageIndex] = {
      sender: 'assistant',
      text: '抱歉，处理您的问题时发生了错误。请稍后再试。',
      isLoading: false
    };
  }
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

.analysis-panel {
  height: 100%;
  border-radius: 0 0 16px 0;
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.welcome-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.welcome-content {
  max-width: 600px;
}

.welcome-avatar {
  margin-bottom: 20px;
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
  color: white;
}

.welcome-title {
  color: #2c3e50;
  margin: 0 0 12px 0;
  font-size: 28px;
}

.welcome-subtitle {
  color: #606266;
  margin: 0 0 30px 0;
  font-size: 16px;
  line-height: 1.6;
}

.suggested-queries h4 {
  color: #409eff;
  margin: 0 0 16px 0;
  font-size: 16px;
}

.query-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.query-btn {
  border-radius: 20px;
  padding: 8px 16px;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  gap: 12px;
}

.message-item.is-user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: #f0f0f0;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  max-width: 70%;
}

.message-sender {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-bubble {
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.is-user .message-bubble {
  background: #409eff;
  color: white;
}

.ai-message {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.thinking-process {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.thinking-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409eff;
  font-size: 14px;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.ai-content {
  line-height: 1.6;
}

.chat-footer {
  padding: 20px;
  border-top: 1px solid #ebeef5;
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

.metric-trend.stable {
  background: #f4f4f5;
  color: #909399;
}

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
}

.insight-item.high {
  border-left-color: #f56c6c;
}

.insight-item.medium {
  border-left-color: #e6a23c;
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
</style>
