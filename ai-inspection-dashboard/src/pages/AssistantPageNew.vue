<template>
  <div class="assistant-layout">
    <!-- 左侧功能面板 -->
    <div class="left-panel">
      <div class="panel-header">
        <h3>
          <el-icon><ChatDotRound /></el-icon>
          智能问答功能
        </h3>
      </div>
      
      <!-- 基础规则问答 -->
      <div class="function-section">
        <div class="section-header" @click="toggleSection('basic')">
          <el-icon><Document /></el-icon>
          <span>基础规则问答</span>
          <el-icon class="expand-icon" :class="{ expanded: expandedSections.basic }">
            <ArrowRight />
          </el-icon>
        </div>
        <div v-show="expandedSections.basic" class="section-content">
          <div class="rule-category">
            <h4>📦 库存查询</h4>
            <div class="rule-buttons">
              <el-button 
                v-for="rule in basicRules.inventory" 
                :key="rule.query"
                size="small" 
                type="info" 
                plain
                @click="sendQuery(rule.query)"
                class="rule-btn"
              >
                {{ rule.name }}
              </el-button>
            </div>
          </div>
          
          <div class="rule-category">
            <h4>🧪 质量查询</h4>
            <div class="rule-buttons">
              <el-button 
                v-for="rule in basicRules.quality" 
                :key="rule.query"
                size="small" 
                type="warning" 
                plain
                @click="sendQuery(rule.query)"
                class="rule-btn"
              >
                {{ rule.name }}
              </el-button>
            </div>
          </div>
          
          <div class="rule-category">
            <h4>🏭 生产查询</h4>
            <div class="rule-buttons">
              <el-button
                v-for="rule in basicRules.production"
                :key="rule.query"
                size="small"
                type="success"
                plain
                @click="sendQuery(rule.query)"
                class="rule-btn"
              >
                {{ rule.name }}
              </el-button>
            </div>
          </div>

          <div class="rule-category">
            <h4>📊 汇总查询</h4>
            <div class="rule-buttons">
              <el-button
                v-for="rule in basicRules.summary"
                :key="rule.query"
                size="small"
                type="primary"
                plain
                @click="sendQuery(rule.query)"
                class="rule-btn"
              >
                {{ rule.name }}
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 高阶规则问答 -->
      <div class="function-section">
        <div class="section-header" @click="toggleSection('advanced')">
          <el-icon><DataAnalysis /></el-icon>
          <span>高阶规则问答</span>
          <el-icon class="expand-icon" :class="{ expanded: expandedSections.advanced }">
            <ArrowRight />
          </el-icon>
        </div>
        <div v-show="expandedSections.advanced" class="section-content">
          <div class="rule-category">
            <h4>📊 统计分析</h4>
            <div class="rule-buttons">
              <el-button 
                v-for="rule in advancedRules.statistics" 
                :key="rule.query"
                size="small" 
                type="primary" 
                plain
                @click="sendQuery(rule.query)"
                class="rule-btn"
              >
                {{ rule.name }}
              </el-button>
            </div>
          </div>
          
          <div class="rule-category">
            <h4>🎯 对比分析</h4>
            <div class="rule-buttons">
              <el-button 
                v-for="rule in advancedRules.comparison" 
                :key="rule.query"
                size="small" 
                type="primary" 
                plain
                @click="sendQuery(rule.query)"
                class="rule-btn"
              >
                {{ rule.name }}
              </el-button>
            </div>
          </div>
          
          <div class="rule-category">
            <h4>⚠️ 风险分析</h4>
            <div class="rule-buttons">
              <el-button 
                v-for="rule in advancedRules.risk" 
                :key="rule.query"
                size="small" 
                type="danger" 
                plain
                @click="sendQuery(rule.query)"
                class="rule-btn"
              >
                {{ rule.name }}
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 复杂图表功能 -->
      <div class="function-section">
        <div class="section-header" @click="toggleSection('charts')">
          <el-icon><TrendCharts /></el-icon>
          <span>复杂图表功能</span>
          <el-icon class="expand-icon" :class="{ expanded: expandedSections.charts }">
            <ArrowRight />
          </el-icon>
        </div>
        <div v-show="expandedSections.charts" class="section-content">
          <div class="rule-category">
            <h4>📈 趋势图表</h4>
            <div class="rule-buttons">
              <el-button 
                v-for="rule in chartRules.trend" 
                :key="rule.query"
                size="small" 
                type="primary"
                @click="sendQuery(rule.query)"
                class="rule-btn chart-btn"
              >
                <el-icon><TrendCharts /></el-icon>
                {{ rule.name }}
              </el-button>
            </div>
          </div>
          
          <div class="rule-category">
            <h4>🥧 分布图表</h4>
            <div class="rule-buttons">
              <el-button 
                v-for="rule in chartRules.distribution" 
                :key="rule.query"
                size="small" 
                type="success"
                @click="sendQuery(rule.query)"
                class="rule-btn chart-btn"
              >
                <el-icon><PieChart /></el-icon>
                {{ rule.name }}
              </el-button>
            </div>
          </div>
          
          <div class="rule-category">
            <h4>🎯 对比图表</h4>
            <div class="rule-buttons">
              <el-button 
                v-for="rule in chartRules.comparison" 
                :key="rule.query"
                size="small" 
                type="warning"
                @click="sendQuery(rule.query)"
                class="rule-btn chart-btn"
              >
                <el-icon><Histogram /></el-icon>
                {{ rule.name }}
              </el-button>
            </div>
          </div>
          
          <div class="rule-category">
            <h4>📊 复合图表</h4>
            <div class="rule-buttons">
              <el-button 
                v-for="rule in chartRules.complex" 
                :key="rule.query"
                size="small" 
                type="info"
                @click="sendQuery(rule.query)"
                class="rule-btn chart-btn"
              >
                <el-icon><DataBoard /></el-icon>
                {{ rule.name }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧对话区域 -->
    <div class="right-panel">
      <div class="chat-container">
        <!-- 聊天头部 -->
        <div class="chat-header">
          <div class="header-left">
            <el-avatar :src="assistantAvatar" :size="40"></el-avatar>
            <div class="header-info">
              <h3>IQE智能问答助手</h3>
              <span class="status">
                <el-icon><Connection /></el-icon>
                在线服务
              </span>
            </div>
          </div>
          <div class="header-right">
            <el-tag type="success" effect="dark">
              已连接 {{ messages.length - 1 }} 次对话
            </el-tag>
          </div>
        </div>

        <!-- 消息区域 -->
        <div class="chat-messages" ref="messagesContainer">
          <el-scrollbar ref="scrollbarRef" height="100%">
            <div class="messages-list">
              <!-- 欢迎消息 -->
              <div v-if="messages.length <= 1" class="welcome-message">
                <div class="welcome-content">
                  <el-avatar :src="assistantAvatar" :size="80"></el-avatar>
                  <h2>欢迎使用IQE智能问答助手</h2>
                  <p>我可以帮您查询库存信息、分析质量数据、生成可视化图表等</p>
                  <div class="quick-actions">
                    <el-button type="primary" @click="sendQuery('显示质量趋势分析')">
                      📈 质量趋势分析
                    </el-button>
                    <el-button type="success" @click="sendQuery('供应商对比分析')">
                      🎯 供应商对比
                    </el-button>
                    <el-button type="info" @click="sendQuery('查询BOE供应商的物料')">
                      🔍 库存查询
                    </el-button>
                  </div>
                </div>
              </div>

              <!-- 对话消息 -->
              <div 
                v-for="(message, index) in messages" 
                :key="index" 
                class="message-item"
                :class="{ 'user-message': message.sender === 'user' }"
              >
                <el-avatar 
                  :src="message.sender === 'user' ? userAvatar : assistantAvatar" 
                  :size="36"
                  class="message-avatar"
                ></el-avatar>
                
                <div class="message-content">
                  <div class="message-meta">
                    <span class="sender">{{ message.sender === 'user' ? '您' : '助手' }}</span>
                    <span class="time">{{ formatTime(message.timestamp) }}</span>
                  </div>
                  
                  <div class="message-bubble">
                    <!-- 图表消息 -->
                    <div v-if="message.type === 'chart'" class="chart-message">
                      <!-- 使用现有的ChartRenderer组件 -->
                      <ChartRenderer
                        :chart-type="message.chartData.chartType"
                        :chart-data="message.chartData.chartData"
                        :chart-title="message.chartData.chartTitle"
                        :chart-description="message.chartData.chartDescription"
                        :chart-height="'350px'"
                      />
                      <div v-if="message.textSummary" class="chart-summary">
                        <el-icon><InfoFilled /></el-icon>
                        <span v-html="message.textSummary"></span>
                      </div>
                    </div>
                    
                    <!-- 文本消息 -->
                    <div v-else class="text-message">
                      <!-- 思考过程展示 -->
                      <div v-if="message.sender === 'assistant' && message.thinking" class="thinking-process">
                        <div class="thinking-header">
                          <el-icon class="thinking-icon"><Loading /></el-icon>
                          <span>思考过程</span>
                        </div>
                        <div class="thinking-content">{{ message.thinking }}</div>
                      </div>

                      <!-- 工具调用过程展示 -->
                      <div v-if="message.sender === 'assistant' && message.toolCalls && message.toolCalls.length > 0" class="tool-calls">
                        <div v-for="(tool, index) in message.toolCalls" :key="index" class="tool-call-item">
                          <div class="tool-header">
                            <el-icon class="tool-icon"><Connection /></el-icon>
                            <span>{{ tool.name }}</span>
                            <el-tag :type="tool.status === 'success' ? 'success' : tool.status === 'error' ? 'danger' : 'info'" size="small">
                              {{ tool.status === 'success' ? '成功' : tool.status === 'error' ? '失败' : '执行中' }}
                            </el-tag>
                          </div>
                          <div v-if="tool.description" class="tool-description">{{ tool.description }}</div>
                          <div v-if="tool.result" class="tool-result">
                            <div class="result-header">执行结果:</div>
                            <div class="result-content">{{ tool.result }}</div>
                          </div>
                        </div>
                      </div>

                      <!-- 主要回复内容 -->
                      <div class="main-content">
                        <p v-html="message.text"></p>
                      </div>
                    </div>
                    
                    <!-- 加载状态 -->
                    <div v-if="message.isLoading" class="loading-message">
                      <el-icon class="is-loading"><Loading /></el-icon>
                      <span>正在分析数据...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input">
          <div class="input-container">
            <el-input
              v-model="currentMessage"
              placeholder="请输入您的问题，或点击左侧功能按钮..."
              @keyup.enter="handleSendMessage"
              :disabled="isLoading"
              size="large"
              class="message-input"
            >
              <template #prepend>
                <el-icon><Edit /></el-icon>
              </template>
              <template #append>
                <el-button 
                  type="primary" 
                  @click="handleSendMessage"
                  :disabled="isLoading || !currentMessage.trim()"
                  :loading="isLoading"
                >
                  <el-icon><Promotion /></el-icon>
                  发送
                </el-button>
              </template>
            </el-input>
          </div>
          
          <!-- 快捷操作 -->
          <div class="quick-shortcuts">
            <el-button-group size="small">
              <el-button @click="clearMessages">
                <el-icon><Delete /></el-icon>
                清空对话
              </el-button>
              <el-button @click="exportChat">
                <el-icon><Download /></el-icon>
                导出对话
              </el-button>
            </el-button-group>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  ChatDotRound, Document, DataAnalysis, TrendCharts, ArrowRight,
  Connection, InfoFilled, Loading, Edit, Promotion, Delete, Download,
  PieChart, Histogram, DataBoard
} from '@element-plus/icons-vue';
import UserAvatar from '@/assets/user-avatar.png';
import AssistantAvatar from '@/assets/ai-avatar.png';
import ChartRenderer from '@/components/ChartRenderer.vue';
import { OPTIMIZED_QA_RULES, ADVANCED_QA_RULES, CHART_QA_RULES } from '../utils/optimizedQARules.js';

// 响应式数据
const currentMessage = ref('');
const isLoading = ref(false);
const messages = ref([
  {
    sender: 'assistant',
    text: '您好！我是您的智能问答助手。您可以点击左侧功能按钮或直接输入问题。',
    timestamp: new Date()
  }
]);

const userAvatar = ref(UserAvatar);
const assistantAvatar = ref(AssistantAvatar);
const messagesContainer = ref(null);
const scrollbarRef = ref(null);

// 展开状态
const expandedSections = reactive({
  basic: true,
  advanced: false,
  charts: false
});

// 基础规则配置 - 完整的203条规则
const basicRules = reactive({
  inventory: [],
  quality: [],
  production: [],
  summary: []
});

// 初始化优化的规则数据
const initializeRules = () => {
  // 使用优化的库存查询规则
  basicRules.inventory = OPTIMIZED_QA_RULES.inventory;

  // 使用优化的质量查询规则
  basicRules.quality = OPTIMIZED_QA_RULES.quality;

  // 使用优化的生产查询规则
  basicRules.production = OPTIMIZED_QA_RULES.production;

  // 使用优化的汇总查询规则
  basicRules.summary = OPTIMIZED_QA_RULES.summary;
};

// 从后端获取实际规则
const loadRulesFromBackend = async () => {
  try {
    const response = await fetch('http://localhost:3002/api/assistant/rules');
    if (response.ok) {
      const data = await response.json();
      const rules = data.rules || [];

      // 按类型分类规则
      basicRules.inventory = rules.filter(r => r.intent_name.includes('inventory')).map(r => ({
        name: r.description,
        query: r.example_query,
        intent: r.intent_name
      }));

      basicRules.quality = rules.filter(r => r.intent_name.includes('lab_test')).map(r => ({
        name: r.description,
        query: r.example_query,
        intent: r.intent_name
      }));

      basicRules.production = rules.filter(r => r.intent_name.includes('online') || r.intent_name.includes('defect') || r.intent_name.includes('baseline')).map(r => ({
        name: r.description,
        query: r.example_query,
        intent: r.intent_name
      }));

      basicRules.summary = rules.filter(r => r.intent_name.includes('summary') || r.intent_name.includes('material') || r.intent_name.includes('batch')).map(r => ({
        name: r.description,
        query: r.example_query,
        intent: r.intent_name
      }));

      console.log('规则加载成功:', basicRules);
    }
  } catch (error) {
    console.error('加载规则失败:', error);
    // 使用全面的默认规则作为后备
    basicRules.inventory = [
      // 按工厂查询
      { name: '深圳工厂库存', query: '查询深圳工厂的库存情况', intent: 'query_inventory_by_factory' },
      { name: '上海工厂库存', query: '查询上海工厂的库存情况', intent: 'query_inventory_by_factory' },
      { name: '北京工厂库存', query: '查询北京工厂的库存情况', intent: 'query_inventory_by_factory' },

      // 按供应商查询
      { name: 'BOE供应商物料', query: '查询BOE供应商的物料', intent: 'query_inventory_by_supplier' },
      { name: '聚龙供应商物料', query: '查询聚龙供应商的物料', intent: 'query_inventory_by_supplier' },
      { name: '富士康供应商物料', query: '查询富士康供应商的物料', intent: 'query_inventory_by_supplier' },
      { name: '紫光供应商物料', query: '查询紫光供应商的物料', intent: 'query_inventory_by_supplier' },

      // 按状态查询
      { name: '正常状态库存', query: '查询正常状态的库存', intent: 'query_inventory_status' },
      { name: '风险状态库存', query: '目前有哪些风险库存？', intent: 'query_inventory_status' },
      { name: '冻结状态库存', query: '查询冻结状态的库存', intent: 'query_inventory_status' },

      // 按物料类型查询
      { name: 'OLED显示屏库存', query: '查询OLED显示屏的库存', intent: 'query_inventory_by_material' },
      { name: '电池盖库存', query: '查询电池盖的库存', intent: 'query_inventory_by_material' },
      { name: '散热片库存', query: '查询散热片的库存', intent: 'query_inventory_by_material' },

      // 按批次查询
      { name: '特定批次查询', query: '查询批次TK240601的库存', intent: 'query_inventory_by_batch' },
      { name: '最新批次查询', query: '查询最新批次的库存', intent: 'query_inventory_by_batch' },

      // 数量相关查询
      { name: '低库存预警', query: '查询库存不足的物料', intent: 'query_inventory_low_stock' },
      { name: '高库存查询', query: '查询数量大于1000的库存', intent: 'query_inventory_high_stock' },

      // 时间相关查询
      { name: '即将到期库存', query: '查询即将到期的库存', intent: 'query_inventory_expiry' },
      { name: '最近入库物料', query: '查询最近入库的物料', intent: 'query_inventory_recent' }
    ];

    basicRules.quality = [
      // 测试结果查询
      { name: '测试不合格记录', query: '有哪些测试不合格的记录？', intent: 'query_lab_test_negative' },
      { name: '测试合格记录', query: '查询测试合格的记录', intent: 'query_lab_test_positive' },
      { name: '最新检验结果', query: '查询最新的检验结果', intent: 'query_lab_test_recent' },

      // 按项目/基线查询
      { name: '项目PRJ_001测试', query: '查询项目PRJ_001的测试结果', intent: 'query_lab_test_by_project' },
      { name: '基线I6789测试', query: '查询基线I6789的测试结果', intent: 'query_lab_test_by_baseline' },
      { name: '基线I6790测试', query: '查询基线I6790的测试结果', intent: 'query_lab_test_by_baseline' },

      // 按物料查询
      { name: 'OLED显示屏测试', query: '查询OLED显示屏的测试结果', intent: 'query_lab_test_by_material' },
      { name: '电池盖测试结果', query: '查询电池盖的测试结果', intent: 'query_lab_test_by_material' },
      { name: '散热片测试结果', query: '查询散热片的测试结果', intent: 'query_lab_test_by_material' },

      // 按供应商查询
      { name: 'BOE供应商测试', query: '查询BOE供应商的测试结果', intent: 'query_lab_test_by_supplier' },
      { name: '聚龙供应商测试', query: '查询聚龙供应商的测试结果', intent: 'query_lab_test_by_supplier' },
      { name: '富士康供应商测试', query: '查询富士康供应商的测试结果', intent: 'query_lab_test_by_supplier' },

      // 不良现象分析
      { name: '表面划痕问题', query: '查询表面划痕的测试记录', intent: 'query_lab_test_by_defect' },
      { name: '尺寸偏差问题', query: '查询尺寸偏差的测试记录', intent: 'query_lab_test_by_defect' },
      { name: '功能异常问题', query: '查询功能异常的测试记录', intent: 'query_lab_test_by_defect' },
      { name: '装配不良问题', query: '查询装配不良的测试记录', intent: 'query_lab_test_by_defect' },

      // 统计分析
      { name: '质量问题统计', query: '统计质量问题分布', intent: 'query_lab_test_statistics' },
      { name: '缺陷率分析', query: '分析各物料的缺陷率', intent: 'query_lab_test_defect_rate' },
      { name: '质量趋势分析', query: '显示质量变化趋势', intent: 'query_lab_test_trend' },
      { name: '合格率统计', query: '统计各物料合格率', intent: 'query_lab_test_pass_rate' }
    ];

    basicRules.production = [
      // 按工厂查询
      { name: '深圳工厂生产', query: '查询深圳工厂的生产情况', intent: 'query_production_by_factory' },
      { name: '上海工厂生产', query: '查询上海工厂的生产情况', intent: 'query_production_by_factory' },
      { name: '北京工厂生产', query: '查询北京工厂的生产情况', intent: 'query_production_by_factory' },

      // 按项目查询
      { name: '项目PRJ_001生产', query: '查询项目PRJ_001的生产情况', intent: 'query_production_by_project' },
      { name: '项目PRJ_002生产', query: '查询项目PRJ_002的生产情况', intent: 'query_production_by_project' },
      { name: '项目PRJ_003生产', query: '查询项目PRJ_003的生产情况', intent: 'query_production_by_project' },

      // 按基线查询
      { name: '基线I6789生产', query: '查询基线I6789的生产情况', intent: 'query_production_by_baseline' },
      { name: '基线I6790生产', query: '查询基线I6790的生产情况', intent: 'query_production_by_baseline' },
      { name: '基线I6791生产', query: '查询基线I6791的生产情况', intent: 'query_production_by_baseline' },

      // 按物料查询
      { name: 'OLED显示屏生产', query: '查询OLED显示屏的生产情况', intent: 'query_production_by_material' },
      { name: '电池盖生产情况', query: '查询电池盖的生产情况', intent: 'query_production_by_material' },
      { name: '散热片生产情况', query: '查询散热片的生产情况', intent: 'query_production_by_material' },

      // 按供应商查询
      { name: 'BOE供应商生产', query: '查询BOE供应商的生产情况', intent: 'query_production_by_supplier' },
      { name: '聚龙供应商生产', query: '查询聚龙供应商的生产情况', intent: 'query_production_by_supplier' },
      { name: '富士康供应商生产', query: '查询富士康供应商的生产情况', intent: 'query_production_by_supplier' },

      // 不良率分析
      { name: '高不良率批次', query: '查询不良率高的批次', intent: 'query_production_high_defect' },
      { name: '低不良率批次', query: '查询不良率低的批次', intent: 'query_production_low_defect' },
      { name: '不良率趋势', query: '分析不良率变化趋势', intent: 'query_production_defect_trend' },

      // 不良现象分析
      { name: '装配不良分析', query: '查询装配不良的生产记录', intent: 'query_production_by_defect' },
      { name: '尺寸偏差分析', query: '查询尺寸偏差的生产记录', intent: 'query_production_by_defect' },
      { name: '表面划痕分析', query: '查询表面划痕的生产记录', intent: 'query_production_by_defect' },

      // 生产效率分析
      { name: '生产效率统计', query: '查询生产效率数据', intent: 'query_production_efficiency' },
      { name: '产能分析', query: '分析各工厂产能情况', intent: 'query_production_capacity' },
      { name: '批次追踪', query: '追踪生产批次信息', intent: 'query_production_tracking' },
      { name: '生产数据汇总', query: '汇总生产数据', intent: 'query_production_summary' }
    ];

    basicRules.summary = [
      // 物料维度汇总
      { name: '物料汇总报告', query: '汇总所有物料信息', intent: 'query_material_summary' },
      { name: '物料类型分布', query: '统计物料类型分布', intent: 'query_material_type_summary' },
      { name: '物料质量汇总', query: '汇总物料质量状况', intent: 'query_material_quality_summary' },

      // 批次维度汇总
      { name: '批次管理汇总', query: '汇总批次管理信息', intent: 'query_batch_summary' },
      { name: '批次质量汇总', query: '汇总批次质量状况', intent: 'query_batch_quality_summary' },
      { name: '批次追溯汇总', query: '汇总批次追溯信息', intent: 'query_batch_trace_summary' },

      // 供应商维度汇总
      { name: '供应商表现汇总', query: '汇总供应商表现', intent: 'query_supplier_summary' },
      { name: '供应商质量汇总', query: '汇总供应商质量状况', intent: 'query_supplier_quality_summary' },
      { name: '供应商风险汇总', query: '汇总供应商风险状况', intent: 'query_supplier_risk_summary' },

      // 工厂维度汇总
      { name: '工厂运营汇总', query: '汇总各工厂情况', intent: 'query_factory_summary' },
      { name: '工厂质量汇总', query: '汇总各工厂质量状况', intent: 'query_factory_quality_summary' },
      { name: '工厂效率汇总', query: '汇总各工厂效率状况', intent: 'query_factory_efficiency_summary' },

      // 质量维度汇总
      { name: '整体质量汇总', query: '汇总质量状况', intent: 'query_quality_summary' },
      { name: '质量趋势汇总', query: '汇总质量变化趋势', intent: 'query_quality_trend_summary' },
      { name: '质量问题汇总', query: '汇总质量问题分布', intent: 'query_quality_issue_summary' },

      // 风险维度汇总
      { name: '风险状况汇总', query: '汇总风险状况', intent: 'query_risk_summary' },
      { name: '风险预警汇总', query: '汇总风险预警信息', intent: 'query_risk_alert_summary' },
      { name: '风险等级汇总', query: '汇总风险等级分布', intent: 'query_risk_level_summary' },

      // 时间维度汇总
      { name: '月度汇总报告', query: '生成月度汇总报告', intent: 'query_monthly_summary' },
      { name: '周度汇总报告', query: '生成周度汇总报告', intent: 'query_weekly_summary' },
      { name: '日度汇总报告', query: '生成日度汇总报告', intent: 'query_daily_summary' }
    ];
  }
};

// 使用优化的高级规则配置
const advancedRules = reactive({
  statistics: ADVANCED_QA_RULES.statistics,
  comparison: ADVANCED_QA_RULES.comparison,
  risk: ADVANCED_QA_RULES.risk,

  // 跨场景关联分析
  correlation: [
    // 库存-生产关联
    { name: '库存生产关联', query: '分析库存与生产的关联性', intent: 'advanced_inventory_production_correlation' },
    { name: '库存质量关联', query: '分析库存与质量的关联性', intent: 'advanced_inventory_quality_correlation' },

    // 供应商跨场景分析
    { name: '供应商全链路分析', query: '分析供应商全链路表现', intent: 'advanced_supplier_full_chain_analysis' },
    { name: '供应商影响分析', query: '分析供应商对质量的影响', intent: 'advanced_supplier_impact_analysis' },

    // 物料跨场景追踪
    { name: '物料全生命周期', query: '追踪物料全生命周期', intent: 'advanced_material_lifecycle_tracking' },
    { name: '物料质量追溯', query: '追溯物料质量问题', intent: 'advanced_material_quality_tracing' },

    // 批次关联分析
    { name: '批次关联分析', query: '分析批次间的关联性', intent: 'advanced_batch_correlation_analysis' },
    { name: '批次影响评估', query: '评估批次对质量的影响', intent: 'advanced_batch_impact_assessment' }
  ],

  // 预测分析
  prediction: [
    // 质量预测
    { name: '质量趋势预测', query: '预测质量变化趋势', intent: 'advanced_quality_trend_prediction' },
    { name: '不良率预测', query: '预测不良率变化', intent: 'advanced_defect_rate_prediction' },

    // 库存预测
    { name: '库存需求预测', query: '预测库存需求变化', intent: 'advanced_inventory_demand_prediction' },
    { name: '库存风险预测', query: '预测库存风险状况', intent: 'advanced_inventory_risk_prediction' },

    // 供应商预测
    { name: '供应商表现预测', query: '预测供应商表现', intent: 'advanced_supplier_performance_prediction' },
    { name: '供应商风险预测', query: '预测供应商风险', intent: 'advanced_supplier_risk_prediction' }
  ]
});

// 使用优化的图表规则配置
const chartRules = reactive({
  trend: CHART_QA_RULES.trend,
  distribution: CHART_QA_RULES.distribution,
  comparison: CHART_QA_RULES.comparison,
  complex: [
    // 综合仪表盘
    { name: '质量综合仪表盘', query: '显示质量综合仪表盘', intent: 'chart_quality_dashboard' },
    { name: '库存综合仪表盘', query: '显示库存综合仪表盘', intent: 'chart_inventory_dashboard' },
    { name: '生产综合仪表盘', query: '显示生产综合仪表盘', intent: 'chart_production_dashboard' },

    // 多维度分析
    { name: '多维度质量分析', query: '显示多维度质量分析图表', intent: 'chart_multi_dimension_quality' },
    { name: '多维度库存分析', query: '显示多维度库存分析图表', intent: 'chart_multi_dimension_inventory' },
    { name: '多维度供应商分析', query: '显示多维度供应商分析图表', intent: 'chart_multi_dimension_supplier' },

    // 关联分析图表
    { name: '库存生产关联图', query: '显示库存生产关联分析图', intent: 'chart_inventory_production_correlation' },
    { name: '质量风险关联图', query: '显示质量风险关联分析图', intent: 'chart_quality_risk_correlation' },
    { name: '关联性分析', query: '关联性分析图表' },
    { name: '预测分析图', query: '预测分析图表' }
  ]
});

// 切换展开状态
const toggleSection = (section) => {
  expandedSections[section] = !expandedSections[section];
};

// 发送查询
const sendQuery = (query) => {
  currentMessage.value = query;
  handleSendMessage();
};

// 处理发送消息
const handleSendMessage = async () => {
  if (!currentMessage.value.trim() || isLoading.value) return;

  const userMessage = currentMessage.value.trim();

  // 添加用户消息
  messages.value.push({
    sender: 'user',
    text: userMessage,
    timestamp: new Date()
  });

  // 添加助手加载消息
  const assistantMessageIndex = messages.value.length;
  messages.value.push({
    sender: 'assistant',
    text: '',
    isLoading: true,
    timestamp: new Date()
  });

  currentMessage.value = '';
  isLoading.value = true;

  // 滚动到底部
  await nextTick();
  scrollToBottom();

  try {
    // 显示思考过程
    messages.value[assistantMessageIndex].thinking = '正在分析您的问题...';
    await nextTick();
    scrollToBottom();

    // 模拟思考延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 更新思考过程
    messages.value[assistantMessageIndex].thinking = '正在查询相关数据...';
    await nextTick();

    // 使用前端智能问答引擎
    try {
      console.log('🤖 启动前端智能问答引擎...');

      // 获取实际数据
      const inventoryData = JSON.parse(localStorage.getItem('inventoryData') || '[]');
      const testData = JSON.parse(localStorage.getItem('testData') || '[]');
      const productionData = JSON.parse(localStorage.getItem('productionData') || '[]');
      const batchData = JSON.parse(localStorage.getItem('batchData') || '[]');

      const data = { inventoryData, testData, productionData, batchData };

      // 意图识别和查询执行
      const intent = recognizeQueryIntent(userMessage);
      const analysisResult = executeSmartQuery(intent, userMessage, data);

      // 更新思考过程
      messages.value[assistantMessageIndex].thinking = '正在生成智能分析结果...';
      await nextTick();

      // 模拟分析延迟
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 生成回复
      const response = generateSmartResponse(analysisResult, userMessage);

      // 更新消息
      messages.value[assistantMessageIndex] = {
        sender: 'assistant',
        text: response.text,
        isLoading: false,
        timestamp: new Date(),
        analysisData: analysisResult
      };

      // 更新当前分析结果
      currentAnalysis.value = analysisResult;

      console.log('✅ 前端智能问答完成');
      return;

    } catch (smartError) {
      console.log('⚠️ AI增强查询失败，降级到传统查询:', smartError.message);
    }

    // 降级到传统查询
    const response = await fetch('http://localhost:3002/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: userMessage })
    });

    const result = await response.json();
    console.log('✅ 传统查询成功:', result);

    // 添加工具调用信息
    const toolCalls = [
      {
        name: '智能问答系统',
        description: `正在分析问题: ${userMessage}`,
        status: 'success',
        result: `查询完成，返回响应数据`
      }
    ];

    // 检查是否是图表响应
    if (result.type === 'chart' && result.data) {
      // 图表响应
      messages.value[assistantMessageIndex] = {
        sender: 'assistant',
        type: 'chart',
        chartData: result.data,
        textSummary: result.textSummary,
        thinking: '数据分析完成，正在生成图表...',
        toolCalls: toolCalls,
        isLoading: false,
        timestamp: new Date()
      };
    } else {
      // 普通文本响应 - 适配后端返回格式
      const responseText = result.reply || result.response || result.answer || '抱歉，我暂时无法回答这个问题。';
      messages.value[assistantMessageIndex] = {
        sender: 'assistant',
        text: responseText,
        thinking: '数据分析完成，正在整理回复...',
        toolCalls: toolCalls,
        isLoading: false,
        timestamp: new Date()
      };
    }

  } catch (error) {
    console.error('❌ 查询失败:', error);
    messages.value[assistantMessageIndex] = {
      sender: 'assistant',
      text: '抱歉，服务暂时不可用，请稍后再试。',
      isLoading: false,
      timestamp: new Date()
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

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 清空对话
const clearMessages = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有对话记录吗？', '确认清空', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    messages.value = [
      {
        sender: 'assistant',
        text: '对话已清空。您可以开始新的对话。',
        timestamp: new Date()
      }
    ];

    ElMessage.success('对话记录已清空');
  } catch {
    // 用户取消
  }
};

// 导出对话
const exportChat = () => {
  const chatContent = messages.value
    .filter(msg => !msg.isLoading)
    .map(msg => {
      const time = formatTime(msg.timestamp);
      const sender = msg.sender === 'user' ? '用户' : '助手';
      const content = msg.type === 'chart'
        ? `[图表] ${msg.chartData?.chartTitle || '图表'}`
        : msg.text;
      return `[${time}] ${sender}: ${content}`;
    })
    .join('\n');

  const blob = new Blob([chatContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `IQE问答记录_${new Date().toLocaleDateString()}.txt`;
  a.click();
  URL.revokeObjectURL(url);

  ElMessage.success('对话记录已导出');
};

// 处理流式响应
const handleStreamResponse = async (response, messageIndex) => {
  console.log('开始处理流式响应...');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log('流式响应读取完成');
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // 保留不完整的行

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            console.log('收到流式数据:', data);

            if (data.type === 'start') {
              messages.value[messageIndex].thinking = data.message;
              console.log('设置思考状态:', data.message);
            } else if (data.type === 'content') {
              fullContent += data.content;
              messages.value[messageIndex].text = fullContent;
              messages.value[messageIndex].thinking = '正在生成回复...';
              console.log('更新内容，当前长度:', fullContent.length);
            } else if (data.type === 'end') {
              messages.value[messageIndex].thinking = '回复完成';
              messages.value[messageIndex].toolCalls = [
                {
                  name: 'AI智能分析',
                  description: '使用DeepSeek AI进行智能分析',
                  status: 'success',
                  result: '分析完成，生成智能回复'
                }
              ];
              console.log('AI回复完成');
            }

            await nextTick();
            scrollToBottom();
          } catch (parseError) {
            console.error('解析流式数据失败:', parseError, '原始行:', line);
          }
        }
      }
    }
  } catch (error) {
    console.error('处理流式响应失败:', error);
    messages.value[messageIndex].text = '抱歉，AI服务暂时不可用: ' + error.message;
  } finally {
    messages.value[messageIndex].isLoading = false;
    console.log('流式响应处理结束');
  }
};

// 智能问答引擎函数
const recognizeQueryIntent = (query) => {
  const lowerQuery = query.toLowerCase();

  // 库存相关
  if (lowerQuery.includes('库存') || lowerQuery.includes('物料') || lowerQuery.includes('仓库')) {
    if (lowerQuery.includes('风险') || lowerQuery.includes('冻结')) return 'inventory_risk';
    if (lowerQuery.includes('深圳') || lowerQuery.includes('上海') || lowerQuery.includes('北京')) return 'inventory_by_factory';
    if (lowerQuery.includes('供应商') || lowerQuery.includes('BOE') || lowerQuery.includes('聚龙') || lowerQuery.includes('富士康') || lowerQuery.includes('紫光')) return 'inventory_by_supplier';
    return 'inventory_general';
  }

  // 质量相关
  if (lowerQuery.includes('质量') || lowerQuery.includes('测试') || lowerQuery.includes('检验') || lowerQuery.includes('不合格')) {
    if (lowerQuery.includes('不合格') || lowerQuery.includes('失败') || lowerQuery.includes('FAIL')) return 'quality_issues';
    if (lowerQuery.includes('合格率') || lowerQuery.includes('统计')) return 'quality_statistics';
    if (lowerQuery.includes('趋势') || lowerQuery.includes('分析')) return 'quality_trend';
    return 'quality_general';
  }

  // 生产相关
  if (lowerQuery.includes('生产') || lowerQuery.includes('不良率') || lowerQuery.includes('产线')) {
    if (lowerQuery.includes('不良率') || lowerQuery.includes('缺陷')) return 'production_defects';
    return 'production_general';
  }

  // 供应商相关
  if (lowerQuery.includes('供应商') || lowerQuery.includes('BOE') || lowerQuery.includes('聚龙') || lowerQuery.includes('富士康') || lowerQuery.includes('紫光')) {
    if (lowerQuery.includes('对比') || lowerQuery.includes('比较')) return 'supplier_comparison';
    return 'supplier_analysis';
  }

  // 图表相关
  if (lowerQuery.includes('图表') || lowerQuery.includes('可视化') || lowerQuery.includes('趋势') || lowerQuery.includes('分布')) {
    return 'chart_request';
  }

  return 'general_query';
};

const executeSmartQuery = (intent, query, data) => {
  const { inventoryData, testData, productionData, batchData } = data;

  switch (intent) {
    case 'inventory_risk':
      return analyzeInventoryRisk(inventoryData, query);
    case 'inventory_by_factory':
      return analyzeInventoryByFactory(inventoryData, query);
    case 'inventory_by_supplier':
      return analyzeInventoryBySupplier(inventoryData, query);
    case 'quality_issues':
      return analyzeQualityIssues(testData, query);
    case 'quality_statistics':
      return analyzeQualityStatistics(testData, query);
    case 'quality_trend':
      return analyzeQualityTrend(testData, query);
    case 'production_defects':
      return analyzeProductionDefects(productionData, query);
    case 'supplier_comparison':
      return analyzeSupplierComparison(inventoryData, testData, productionData, query);
    case 'chart_request':
      return generateChartAnalysis(data, query);
    default:
      return handleGeneralQuery(data, query);
  }
};

const analyzeInventoryRisk = (inventoryData, query) => {
  const riskItems = inventoryData.filter(item => item.status === '风险' || item.status === '冻结');
  const totalItems = inventoryData.length;
  const riskRatio = totalItems > 0 ? ((riskItems.length / totalItems) * 100).toFixed(1) : '0.0';

  const factoryRisk = {};
  riskItems.forEach(item => {
    factoryRisk[item.factory] = (factoryRisk[item.factory] || 0) + 1;
  });

  return {
    type: 'analysis',
    title: '库存风险分析',
    summary: `发现 ${riskItems.length} 项风险库存，占总库存的 ${riskRatio}%`,
    keyMetrics: [
      { name: '风险物料数', value: riskItems.length, unit: '项', trend: 'warning' },
      { name: '风险比例', value: riskRatio, unit: '%', trend: 'warning' },
      { name: '涉及工厂', value: Object.keys(factoryRisk).length, unit: '个', trend: 'info' }
    ],
    insights: [
      {
        icon: '⚠️',
        title: '风险集中度',
        description: `${Object.keys(factoryRisk)[0] || '深圳工厂'}风险物料最多，需重点关注`,
        priority: 'high'
      }
    ],
    recommendations: [
      { priority: '高', title: '立即处理', description: '优先处理冻结状态的库存物料' }
    ],
    chartData: generateRiskChartData(riskItems, factoryRisk),
    data: riskItems.slice(0, 10)
  };
};

const analyzeQualityIssues = (testData, query) => {
  const failedTests = testData.filter(test => test.testResult === 'FAIL');
  const totalTests = testData.length;
  const failRate = totalTests > 0 ? ((failedTests.length / totalTests) * 100).toFixed(1) : '0.0';

  const defectTypes = {};
  failedTests.forEach(test => {
    if (test.defectPhenomena) {
      defectTypes[test.defectPhenomena] = (defectTypes[test.defectPhenomena] || 0) + 1;
    }
  });

  return {
    type: 'analysis',
    title: '质量问题分析',
    summary: `发现 ${failedTests.length} 项不合格测试，不合格率为 ${failRate}%`,
    keyMetrics: [
      { name: '不合格数', value: failedTests.length, unit: '项', trend: 'warning' },
      { name: '不合格率', value: failRate, unit: '%', trend: 'warning' },
      { name: '缺陷类型', value: Object.keys(defectTypes).length, unit: '种', trend: 'info' }
    ],
    insights: [
      {
        icon: '🔍',
        title: '主要缺陷',
        description: `${Object.keys(defectTypes)[0] || '表面划痕'}是最常见的质量问题`,
        priority: 'high'
      }
    ],
    recommendations: [
      { priority: '高', title: '质量改进', description: '针对主要缺陷类型制定改进措施' }
    ],
    chartData: generateQualityChartData(failedTests, defectTypes),
    data: failedTests.slice(0, 10)
  };
};

const generateSmartResponse = (analysisResult, userInput) => {
  let response = `🤖 **智能分析完成**\n\n`;
  response += `基于您的问题"${userInput}"，我进行了数据分析：\n\n`;

  response += `📊 **${analysisResult.title}**\n`;
  response += `${analysisResult.summary}\n\n`;

  if (analysisResult.keyMetrics && analysisResult.keyMetrics.length > 0) {
    response += `🎯 **关键指标**：\n`;
    analysisResult.keyMetrics.forEach(metric => {
      response += `• ${metric.name}: ${metric.value}${metric.unit || ''}\n`;
    });
    response += `\n`;
  }

  if (analysisResult.insights && analysisResult.insights.length > 0) {
    response += `💡 **核心洞察**：\n`;
    analysisResult.insights.forEach(insight => {
      response += `• ${insight.title}: ${insight.description}\n`;
    });
    response += `\n`;
  }

  if (analysisResult.recommendations && analysisResult.recommendations.length > 0) {
    response += `🚀 **行动建议**：\n`;
    analysisResult.recommendations.forEach(rec => {
      response += `• [${rec.priority}优先级] ${rec.title}: ${rec.description}\n`;
    });
    response += `\n`;
  }

  response += `✨ 这是基于您实际业务数据的智能分析结果。`;

  return { text: response, analysisResult };
};

// 辅助函数
const generateRiskChartData = (riskItems, factoryRisk) => {
  return {
    type: 'pie',
    title: '风险库存分布',
    data: Object.entries(factoryRisk).map(([factory, count]) => ({
      name: factory,
      value: count
    }))
  };
};

const generateQualityChartData = (failedTests, defectTypes) => {
  return {
    type: 'bar',
    title: '缺陷类型分布',
    data: Object.entries(defectTypes).map(([defect, count]) => ({
      name: defect,
      value: count
    }))
  };
};

const handleGeneralQuery = (data, query) => {
  return {
    type: 'general',
    title: '智能问答结果',
    summary: `基于您的问题"${query}"，我为您提供相关信息`,
    keyMetrics: [
      { name: '数据源', value: 4, unit: '个', trend: 'info' },
      { name: '覆盖度', value: 100, unit: '%', trend: 'up' }
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
    ]
  };
};

// 组件挂载时初始化
onMounted(() => {
  // 初始化完整规则数据
  initializeRules();

  // 可选：从后端加载额外规则（如果需要）
  // loadRulesFromBackend();
});
</script>

<style scoped>
.assistant-layout {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 左侧功能面板 */
.left-panel {
  width: 350px;
  background: white;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.panel-header {
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  color: white;
}

.panel-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
}

.function-section {
  border-bottom: 1px solid #f0f0f0;
}

.section-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
  border-bottom: 1px solid #e4e7ed;
}

.section-header:hover {
  background: #f0f9ff;
  color: #409eff;
}

.section-header span {
  flex: 1;
  font-weight: 600;
  font-size: 16px;
}

.expand-icon {
  transition: transform 0.3s ease;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.section-content {
  padding: 16px 20px;
  background: white;
}

.rule-category {
  margin-bottom: 20px;
}

.rule-category:last-child {
  margin-bottom: 0;
}

.rule-category h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #606266;
  font-weight: 600;
}

.rule-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rule-btn {
  justify-content: flex-start;
  text-align: left;
  width: 100%;
  font-size: 13px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.rule-btn:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-btn {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  color: #495057;
}

.chart-btn:hover {
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
  border-color: #409eff;
  color: #409eff;
}

/* 右侧对话区域 */
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  margin: 20px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-info h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
}

.status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  opacity: 0.9;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow: hidden;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 100%;
}

.welcome-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
}

.welcome-content {
  max-width: 500px;
}

.welcome-content h2 {
  margin: 20px 0 12px 0;
  color: #2c3e50;
  font-size: 24px;
}

.welcome-content p {
  margin: 0 0 24px 0;
  color: #606266;
  line-height: 1.6;
}

.quick-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.message-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  max-width: 70%;
}

.user-message .message-content {
  text-align: right;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 12px;
  color: #909399;
}

.user-message .message-meta {
  justify-content: flex-end;
}

.message-bubble {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.user-message .message-bubble {
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  color: white;
  border: none;
}

.chart-message {
  width: 100%;
}

.chart-summary {
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  line-height: 1.5;
}

.text-message p {
  margin: 0;
  line-height: 1.6;
}

/* 优化的查询结果样式 */
:deep(.query-results) {
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

:deep(.result-header) {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e4e7ed;
}

:deep(.result-header h3) {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.result-summary) {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

:deep(.total-badge) {
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
}

:deep(.status-summary), :deep(.test-summary) {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

:deep(.summary-item) {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

:deep(.summary-item.status-normal), :deep(.summary-item.test-pass) {
  background: #f0f9ff;
  color: #67c23a;
  border: 1px solid #b3e19d;
}

:deep(.summary-item.status-warning) {
  background: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #f5dab1;
}

:deep(.summary-item.status-danger), :deep(.summary-item.test-fail) {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
}

:deep(.status-section), :deep(.test-section) {
  margin-bottom: 24px;
}

:deep(.status-header), :deep(.test-header) {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px 8px 0 0;
  font-weight: 600;
  margin-bottom: 0;
}

:deep(.status-header.status-normal), :deep(.test-header.test-pass) {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  color: white;
}

:deep(.status-header.status-warning) {
  background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
  color: white;
}

:deep(.status-header.status-danger), :deep(.test-header.test-fail) {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
  color: white;
}

:deep(.status-count), :deep(.test-count) {
  margin-left: auto;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

:deep(.items-container), :deep(.test-items) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 0 0 8px 8px;
}

:deep(.item-card), :deep(.test-card) {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

:deep(.item-card:hover), :deep(.test-card:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

:deep(.card-header) {
  padding: 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.item-title), :deep(.test-title) {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
}

:deep(.item-status), :deep(.test-result) {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

:deep(.item-status.normal), :deep(.test-result.pass) {
  background: #f0f9ff;
  color: #67c23a;
  border: 1px solid #b3e19d;
}

:deep(.item-status.warning) {
  background: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #f5dab1;
}

:deep(.item-status.danger), :deep(.test-result.fail) {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
}

:deep(.card-body) {
  padding: 16px;
}

:deep(.detail-grid) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

:deep(.detail-item) {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

:deep(.detail-item.full-width) {
  grid-column: 1 / -1;
}

:deep(.detail-label) {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

:deep(.detail-value) {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
}

:deep(.detail-value.quantity) {
  color: #409eff;
  font-weight: 600;
}

/* 空结果样式 */
:deep(.empty-result) {
  text-align: center;
  padding: 40px 20px;
  color: #606266;
}

:deep(.empty-result .empty-icon) {
  font-size: 48px;
  margin-bottom: 16px;
}

:deep(.empty-result h3) {
  margin: 0 0 8px 0;
  color: #909399;
}

:deep(.empty-result p) {
  margin: 0 0 24px 0;
  color: #c0c4cc;
}

:deep(.suggestions) {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  text-align: left;
  max-width: 300px;
  margin: 0 auto;
}

:deep(.suggestions h4) {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 14px;
}

:deep(.suggestions ul) {
  margin: 0;
  padding-left: 20px;
  color: #909399;
  font-size: 13px;
}

:deep(.suggestions li) {
  margin-bottom: 4px;
}

.loading-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-style: italic;
}

/* 思考过程样式 */
.thinking-process {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.thinking-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
}

.thinking-icon {
  color: #6c757d;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.thinking-content {
  color: #6c757d;
  font-size: 14px;
  line-height: 1.5;
}

/* 工具调用样式 */
.tool-calls {
  margin-bottom: 12px;
}

.tool-call-item {
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
}

.tool-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.tool-icon {
  color: #007bff;
}

.tool-description {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 8px;
}

.tool-result {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 8px;
}

.result-header {
  font-weight: 600;
  color: #495057;
  margin-bottom: 4px;
  font-size: 12px;
}

.result-content {
  color: #6c757d;
  font-size: 13px;
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
}

.main-content {
  /* 主要内容样式 */
}

.chat-input {
  padding: 20px 24px;
  border-top: 1px solid #e4e7ed;
  background: #fafafa;
}

.input-container {
  margin-bottom: 12px;
}

.message-input {
  width: 100%;
}

.quick-shortcuts {
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .left-panel {
    width: 300px;
  }
}

@media (max-width: 768px) {
  .assistant-layout {
    flex-direction: column;
  }

  .left-panel {
    width: 100%;
    height: 300px;
    overflow-y: auto;
  }

  .right-panel {
    flex: 1;
  }

  .chat-container {
    margin: 10px;
  }

  .message-content {
    max-width: 85%;
  }
}

/* 滚动条样式 */
:deep(.el-scrollbar__bar) {
  opacity: 0.3;
}

:deep(.el-scrollbar__bar:hover) {
  opacity: 0.6;
}

/* 动画效果 */
.message-item {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-content {
  animation: expandIn 0.3s ease-out;
}

@keyframes expandIn {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 1000px;
  }
}
</style>
