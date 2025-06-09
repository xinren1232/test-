<template>
  <div class="knowledge-qa-page">
    <el-row :gutter="20">
      <!-- 左侧问答区域 -->
      <el-col :span="16">
        <el-card class="qa-card">
          <template #header>
            <div class="card-header">
              <h2>知识库问答系统</h2>
              <el-tag size="small" type="success">基于规则库 + MySQL + NLP</el-tag>
            </div>
          </template>
          
          <div class="qa-container">
            <!-- 消息历史 -->
            <div class="message-history" ref="messageHistory">
              <!-- 欢迎消息 -->
              <div class="message system-message" v-if="messages.length === 0">
                <div class="message-content">
                  <h3>欢迎使用知识库问答系统</h3>
                  <p>您可以询问以下问题：</p>
                  <ul>
                    <li>查询特定物料的实验数据</li>
                    <li>分析批次质量趋势</li>
                    <li>查找高风险物料</li>
                    <li>获取特定时间段内的测试结果</li>
                  </ul>
                  <p>示例：</p>
                  <div class="example-queries">
                    <el-tag 
                      v-for="example in exampleQueries" 
                      :key="example"
                      @click="handleExampleClick(example)"
                      class="example-tag"
                    >
                      {{ example }}
                    </el-tag>
                  </div>
                </div>
              </div>
              
              <!-- 消息列表 -->
              <div 
                v-for="(msg, index) in messages" 
                :key="index"
                :class="['message', msg.type === 'user' ? 'user-message' : 'system-message']"
              >
                <div class="message-avatar">
                  <el-avatar :size="40" :icon="msg.type === 'user' ? UserFilled : QuestionFilled" />
                </div>
                <div class="message-content">
                  <!-- 文本内容 -->
                  <div v-if="msg.contentType === 'text'" class="text-content" v-html="msg.content"></div>
                  
                  <!-- SQL语句 -->
                  <div v-else-if="msg.contentType === 'sql'" class="sql-content">
                    <div class="sql-header">
                      <span>执行的SQL查询</span>
                      <el-button type="primary" size="small" plain @click="copyToClipboard(msg.content)">
                        <el-icon><DocumentCopy /></el-icon> 复制
                      </el-button>
                    </div>
                    <pre><code>{{ msg.content }}</code></pre>
                  </div>
                  
                  <!-- 表格结果 -->
                  <div v-else-if="msg.contentType === 'table' && msg.content.length > 0" class="table-content">
                    <el-table :data="msg.content" border stripe size="small" max-height="300">
                      <el-table-column 
                        v-for="col in getTableColumns(msg.content)" 
                        :key="col" 
                        :prop="col" 
                        :label="formatColumnName(col)"
                      />
                    </el-table>
                  </div>
                  
                  <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
                </div>
              </div>
            </div>
            
            <!-- 输入区域 -->
            <div class="input-container">
              <el-input
                v-model="userInput"
                type="textarea"
                :rows="2"
                placeholder="请输入您的问题..."
                @keydown.enter.prevent="handleSend"
              />
              <div class="button-group">
                <el-button 
                  type="primary" 
                  :icon="Position"
                  @click="handleSend"
                  :disabled="isProcessing || !userInput.trim()"
                >发送</el-button>
                <el-button 
                  @click="clearMessages"
                  :icon="Delete"
                  :disabled="isProcessing || messages.length === 0"
                >清空</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 右侧规则库管理 -->
      <el-col :span="8">
        <el-card class="rules-card">
          <template #header>
            <div class="card-header">
              <h3>规则库管理</h3>
              <el-button type="primary" size="small" @click="showRuleDialog = true">
                添加规则
              </el-button>
            </div>
          </template>
          
          <div class="rules-container">
            <div class="rule-list">
              <template v-if="rules.length > 0">
                <el-collapse v-model="activeRule">
                  <el-collapse-item 
                    v-for="rule in rules" 
                    :key="rule.id" 
                    :name="rule.id"
                  >
                    <template #title>
                      <div class="rule-title">
                        {{ rule.name || rule.id }}
                        <el-tag size="small" type="info">{{ rule.type }}</el-tag>
                      </div>
                    </template>
                    
                    <div class="rule-detail">
                      <div><strong>描述：</strong> {{ rule.description }}</div>
                      <div class="rule-section">
                        <h5>匹配模式</h5>
                        <div class="keyword-tags">
                          <el-tag 
                            v-for="pattern in rule.patterns" 
                            :key="pattern" 
                            class="keyword-tag"
                            size="small"
                          >
                            {{ pattern }}
                          </el-tag>
                        </div>
                      </div>
                      
                      <div v-if="rule.sqlTemplate" class="rule-section">
                        <h5>SQL模板</h5>
                        <pre><code>{{ rule.sqlTemplate }}</code></pre>
                      </div>
                      
                      <div v-if="rule.requiredParams && rule.requiredParams.length > 0" class="rule-section">
                        <h5>必需参数</h5>
                        <div class="param-tags">
                          <el-tag 
                            v-for="param in rule.requiredParams" 
                            :key="param" 
                            class="param-tag"
                            size="small"
                            type="warning"
                          >
                            {{ param }}
                          </el-tag>
                        </div>
                      </div>
                      
                      <div class="rule-actions">
                        <el-button 
                          size="small" 
                          type="primary" 
                          plain
                          @click="editRule(rule)"
                        >
                          编辑
                        </el-button>
                        <el-button 
                          size="small" 
                          type="danger" 
                          plain
                          @click="deleteRule(rule.id)"
                        >
                          删除
                        </el-button>
                      </div>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </template>
              <div v-else class="no-rules">
                <el-empty description="暂无规则" />
                <el-button type="primary" @click="showRuleDialog = true">添加规则</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 规则编辑对话框 -->
    <rule-edit-dialog
      v-model:visible="showRuleDialog"
      :rule="editingRule"
      @save="saveRule"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import { UserFilled, QuestionFilled, Position, Delete, DocumentCopy } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import RuleEditDialog from '../components/knowledge/RuleEditDialog.vue';

// 状态
const userInput = ref('');
const messages = ref([]);
const isProcessing = ref(false);
const messageHistory = ref(null);
const showRuleDialog = ref(false);
const editingRule = ref(null);
const activeRule = ref([]);
const rules = ref([]);

// 示例查询
const exampleQueries = [
  '查询批次BTC-20230315的测试结果',
  '分析A-1001物料最近一个月的质量趋势',
  '查找最近一周的高风险物料',
  '获取2023年3月到4月的实验数据'
];

// 处理示例点击
function handleExampleClick(example) {
  userInput.value = example;
  handleSend();
}

// 处理消息发送
async function handleSend() {
  const text = userInput.value.trim();
  if (!text || isProcessing.value) return;
  
  // 添加用户消息
  addMessage('user', 'text', text);
  userInput.value = '';
  isProcessing.value = true;
  
  try {
    // 这里简化为直接回复一个固定消息
    setTimeout(() => {
      addMessage('system', 'text', `我收到了您的问题：${text}<br>这是一个示例回复。实际功能将在后续实现。`);
      isProcessing.value = false;
    }, 1000);
  } catch (error) {
    console.error('处理消息错误:', error);
    addMessage('system', 'text', '抱歉，处理您的问题时出现了错误');
    isProcessing.value = false;
  }
}

// 清空消息
function clearMessages() {
  messages.value = [];
}

// 添加消息
function addMessage(type, contentType, content) {
  messages.value.push({
    type,
    contentType,
    content,
    timestamp: new Date()
  });
}

// 格式化消息文本
function formatMessage(text) {
  return text.replace(/\n/g, '<br>');
}

// 格式化时间
function formatTime(date) {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
}

// 获取表格列
function getTableColumns(data) {
  if (!data || data.length === 0) return [];
  return Object.keys(data[0]);
}

// 格式化列名
function formatColumnName(colName) {
  return colName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// 复制到剪贴板
function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => {
      ElMessage.success('已复制到剪贴板');
    })
    .catch(() => {
      ElMessage.error('复制失败');
    });
}

// 编辑规则
function editRule(rule) {
  editingRule.value = { ...rule };
  showRuleDialog.value = true;
}

// 删除规则
function deleteRule(ruleId) {
  ElMessage.success(`删除规则: ${ruleId}`);
  rules.value = rules.value.filter(r => r.id !== ruleId);
}

// 保存规则
function saveRule(rule) {
  const index = rules.value.findIndex(r => r.id === rule.id);
  if (index >= 0) {
    rules.value[index] = rule;
    ElMessage.success('规则已更新');
  } else {
    rules.value.push({
      ...rule,
      id: `rule_${Date.now()}`
    });
    ElMessage.success('规则已添加');
  }
}

// 加载规则
function loadRules() {
  // 模拟规则数据
  rules.value = [
    {
      id: 'rule_1',
      name: '质量指标查询',
      type: 'query_mapping',
      description: '用于查询特定物料的质量指标',
      patterns: ['质量指标', '质量标准'],
      sqlTemplate: 'SELECT metric_name, threshold, unit FROM quality_metrics WHERE product_id = {productId}',
      requiredParams: ['productId']
    },
    {
      id: 'rule_2',
      name: '实验室结果查询',
      type: 'query_mapping',
      description: '用于查询实验室测试结果',
      patterns: ['实验室结果', '测试结果', '检验数据'],
      sqlTemplate: 'SELECT test_date, result_value, pass_fail FROM lab_results WHERE batch_id = {batchId} ORDER BY test_date DESC LIMIT 10',
      requiredParams: ['batchId']
    }
  ];
}

// 滚动到底部
function scrollToBottom() {
  if (messageHistory.value) {
    messageHistory.value.scrollTop = messageHistory.value.scrollHeight;
  }
}

// 监听消息变化，自动滚动
watch(() => messages.value.length, async () => {
  await nextTick();
  scrollToBottom();
});

// 初始化
onMounted(() => {
  // 加载规则
  loadRules();
});
</script>

<style scoped>
.knowledge-qa-page {
  height: calc(100vh - 120px);
  padding: 20px;
}

.qa-card, .rules-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2, .card-header h3 {
  margin: 0;
}

.qa-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.message-history {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.message {
  display: flex;
  margin-bottom: 20px;
  gap: 10px;
}

.user-message {
  flex-direction: row-reverse;
}

.message-content {
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 10px;
}

.system-message .message-content {
  background-color: #f0f2f5;
}

.user-message .message-content {
  background-color: #e5f7ff;
  text-align: right;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.input-container {
  padding: 15px 0;
  border-top: 1px solid #e0e0e0;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  gap: 10px;
}

.example-queries {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.example-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.example-tag:hover {
  transform: scale(1.05);
}

/* SQL内容样式 */
.sql-content {
  width: 100%;
  background-color: #282c34;
  color: #abb2bf;
  border-radius: 6px;
  overflow: hidden;
}

.sql-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #21252b;
  color: #d7dae0;
  font-size: 14px;
}

.sql-content pre {
  margin: 0;
  padding: 12px;
  overflow-x: auto;
  font-family: monospace;
}

/* 表格结果样式 */
.table-content {
  width: 100%;
  margin-top: 10px;
}

/* 规则库样式 */
.rules-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.rule-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
}

.rule-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rule-detail {
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.rule-section {
  margin-bottom: 15px;
}

.rule-section h5 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 14px;
  color: #444;
}

.keyword-tag, .synonym-tag, .param-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.rule-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.no-rules {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .el-row {
    flex-direction: column;
  }
  
  .el-col {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }
  
  .rules-card {
    margin-top: 20px;
  }
}
</style> 