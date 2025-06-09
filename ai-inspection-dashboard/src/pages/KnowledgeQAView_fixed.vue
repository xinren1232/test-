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
                  <el-avatar :size="40" :icon="msg.type === 'user' ? User : QuestionFilled" />
                </div>
                <div class="message-content">
                  <!-- 文本内容 -->
                  <div v-if="msg.contentType === 'text'" class="text-content" v-html="formatMessage(msg.content)"></div>
                  
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
                  
                  <!-- 意图识别结果 -->
                  <div v-else-if="msg.contentType === 'intent'" class="intent-content">
                    <div class="intent-header">
                      <span>识别的意图</span>
                    </div>
                    <div class="intent-details">
                      <div><strong>操作：</strong> {{ msg.content.action }}</div>
                      <div><strong>实体：</strong> {{ msg.content.entity }}</div>
                      <div v-if="Object.keys(msg.content.filters || {}).length > 0">
                        <strong>过滤条件：</strong>
                        <ul>
                          <li v-for="(value, key) in msg.content.filters" :key="key">
                            {{ key }}: {{ value }}
                          </li>
                        </ul>
                      </div>
                      <div v-if="msg.content.timeRange">
                        <strong>时间范围：</strong> 
                        {{ formatDate(msg.content.timeRange.start) }} 至 
                        {{ formatDate(msg.content.timeRange.end) }}
                      </div>
                    </div>
                  </div>
                  
                  <!-- 加载中 -->
                  <div v-else-if="msg.contentType === 'loading'" class="loading-content">
                    <el-skeleton :rows="3" animated />
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
              <el-dropdown @command="handleTabCommand">
                <span class="el-dropdown-link">
                  <el-icon><Menu /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="query">查询映射规则</el-dropdown-item>
                    <el-dropdown-item command="table">表名映射规则</el-dropdown-item>
                    <el-dropdown-item command="column">列名映射规则</el-dropdown-item>
                    <el-dropdown-item command="constraint">约束规则</el-dropdown-item>
                    <el-dropdown-item command="transform">数据转换规则</el-dropdown-item>
                    <el-dropdown-item command="keyword">关键词映射规则</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          
          <div class="rules-container">
            <h4>{{ getRuleTypeTitle(currentRuleType) }}</h4>
            
            <!-- 规则列表 -->
            <div class="rule-list">
              <el-collapse v-model="activeRule" accordion>
                <el-collapse-item 
                  v-for="rule in filteredRules" 
                  :key="rule.id" 
                  :name="rule.id"
                >
                  <template #title>
                    <span class="rule-title">
                      {{ rule.description || rule.id }}
                      <el-tag size="small" type="info">{{ rule.type }}</el-tag>
                    </span>
                  </template>
                  
                  <!-- 查询映射规则详情 -->
                  <div v-if="rule.type === 'query_mapping'" class="rule-detail">
                    <div class="rule-section">
                      <h5>匹配条件</h5>
                      <div><strong>意图：</strong> {{ rule.pattern.intent }}</div>
                      <div><strong>实体：</strong> {{ rule.pattern.entity }}</div>
                      <div v-if="rule.pattern.filter">
                        <strong>过滤条件：</strong> {{ rule.pattern.filter }}
                        <span v-if="rule.pattern.value">= {{ rule.pattern.value }}</span>
                      </div>
                      <div v-if="rule.pattern.timeRange">
                        <strong>时间范围：</strong> {{ rule.pattern.timeRange ? '是' : '否' }}
                      </div>
                    </div>
                    
                    <div class="rule-section">
                      <h5>SQL模板</h5>
                      <pre><code>{{ rule.mapping.sql }}</code></pre>
                    </div>
                    
                    <div class="rule-section" v-if="rule.mapping.params.length > 0">
                      <h5>参数</h5>
                      <el-tag 
                        v-for="param in rule.mapping.params" 
                        :key="param"
                        class="param-tag"
                      >
                        {{ param }}
                      </el-tag>
                    </div>
                  </div>
                  
                  <!-- 表名映射规则详情 -->
                  <div v-else-if="rule.type === 'table_mapping'" class="rule-detail">
                    <div class="rule-section">
                      <h5>匹配关键词</h5>
                      <el-tag 
                        v-for="keyword in rule.pattern.keywords" 
                        :key="keyword"
                        class="keyword-tag"
                      >
                        {{ keyword }}
                      </el-tag>
                    </div>
                    
                    <div class="rule-section">
                      <h5>同义词</h5>
                      <el-tag 
                        v-for="synonym in rule.pattern.synonyms" 
                        :key="synonym"
                        type="warning"
                        class="synonym-tag"
                      >
                        {{ synonym }}
                      </el-tag>
                    </div>
                    
                    <div class="rule-section">
                      <h5>映射到</h5>
                      <div><strong>表名：</strong> {{ rule.mapping.tableName }}</div>
                      <div><strong>模式：</strong> {{ rule.mapping.schema }}</div>
                    </div>
                  </div>
                  
                  <!-- 其他规则类型详情... -->
                  <div v-else class="rule-detail">
                    <pre><code>{{ JSON.stringify(rule, null, 2) }}</code></pre>
                  </div>

                  <!-- 操作按钮 -->
                  <div class="rule-actions">
                    <el-button 
                      size="small" 
                      type="primary" 
                      @click.stop="editRule(rule)"
                    >编辑</el-button>
                    <el-button 
                      size="small" 
                      type="danger" 
                      @click.stop="deleteRule(rule)"
                    >删除</el-button>
                  </div>
                </el-collapse-item>
              </el-collapse>
              
              <div class="no-rules" v-if="filteredRules.length === 0">
                当前类型没有规则
              </div>
            </div>
            
            <!-- 添加规则按钮 -->
            <div class="add-rule">
              <el-button 
                type="primary" 
                :icon="Plus"
                @click="openRuleDialog('add')"
              >添加规则</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 规则编辑对话框 -->
    <el-dialog
      v-model="ruleDialogVisible"
      :title="ruleDialogMode === 'add' ? '添加规则' : '编辑规则'"
      width="60%"
    >
      <el-form :model="editingRule" label-width="100px">
        <el-form-item label="规则类型">
          <el-select v-model="editingRule.type" disabled>
            <el-option
              v-for="(value, key) in ruleTypes"
              :key="key"
              :label="getRuleTypeTitle(value)"
              :value="value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="描述">
          <el-input v-model="editingRule.description" />
        </el-form-item>
        
        <!-- 根据不同规则类型显示不同表单... -->
        
        <!-- 公共操作按钮 -->
        <el-form-item>
          <el-button type="primary" @click="saveRule">保存</el-button>
          <el-button @click="ruleDialogVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { User, QuestionFilled, DocumentCopy, Position, Delete, Menu, Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { rulesService } from '../services/RulesDatabaseService';

// 规则类型常量
const RuleTypes = {
  QUERY: 'query_mapping',
  TABLE: 'table_mapping',
  COLUMN: 'column_mapping',
  CONSTRAINT: 'constraint',
  TRANSFORM: 'data_transformation',
  KEYWORD: 'keyword_mapping',
};

// 状态
const messages = ref([]);
const userInput = ref('');
const isProcessing = ref(false);
const messageHistory = ref(null);

// 规则管理
const currentRuleType = ref('query_mapping');
const activeRule = ref([]);
const ruleDialogVisible = ref(false);
const ruleDialogMode = ref('add');
const editingRule = ref({});
const ruleTypes = RuleTypes;

// 示例查询
const exampleQueries = [
  "查询物料M12345的实验数据",
  "分析最近一个月的质量趋势",
  "查找所有高风险物料",
  "显示批次B10001的详细信息"
];

// 计算过滤后的规则
const filteredRules = computed(() => {
  try {
    return rulesService.getRulesByType ? rulesService.getRulesByType(currentRuleType.value) : [];
  } catch (error) {
    console.error('获取规则失败:', error);
    return [];
  }
});

// 处理消息发送
async function handleSend() {
  if (!userInput.value.trim() || isProcessing.value) return;
  
  // 添加用户消息
  const userMessage = {
    content: userInput.value,
    contentType: 'text',
    type: 'user',
    timestamp: new Date()
  };
  
  messages.value.push(userMessage);
  
  // 清空输入并滚动到底部
  const inputText = userInput.value;
  userInput.value = '';
  await scrollToBottom();
  
  // 添加处理中的占位消息
  const loadingMessageIndex = messages.value.length;
  messages.value.push({
    content: '',
    contentType: 'loading',
    type: 'system',
    timestamp: new Date()
  });
  
  // 设置处理中状态
  isProcessing.value = true;
  
  try {
    // 处理查询
    await processQuery(inputText, loadingMessageIndex);
  } catch (error) {
    console.error('处理查询失败:', error);
    
    // 更新为错误消息
    messages.value[loadingMessageIndex] = {
      content: `处理查询时发生错误: ${error.message}`,
      contentType: 'text',
      type: 'system',
      timestamp: new Date()
    };
  } finally {
    isProcessing.value = false;
    await scrollToBottom();
  }
}

// 处理查询
async function processQuery(query, responseIndex) {
  // 模拟NLP处理延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 1. 识别意图
  const intent = {
    action: 'query',
    entity: 'inventory',
    filters: {
      materialCode: 'M12345'
    },
    // 示例意图，实际应从NLP服务获取
  };
  
  // 添加意图识别结果
  messages.value[responseIndex] = {
    content: intent,
    contentType: 'intent',
    type: 'system',
    timestamp: new Date()
  };
  
  await scrollToBottom();
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // 2. 查找匹配的查询映射规则
  const queryMapping = {
    sql: 'SELECT m.material_code, m.material_name, m.supplier, m.risk_level FROM materials m WHERE m.material_code = :materialCode',
    params: ['materialCode']
  };
  
  // 3. 生成SQL查询
  const sql = replaceParams(queryMapping.sql, intent.filters);
  
  // 添加SQL查询消息
  messages.value.push({
    content: sql,
    contentType: 'sql',
    type: 'system',
    timestamp: new Date()
  });
  
  await scrollToBottom();
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // 4. 模拟查询结果
  const results = [
    {
      material_code: 'M12345',
      material_name: '高强度钢板',
      supplier: '金田金属',
      risk_level: 'medium'
    }
  ];
  
  // 添加表格结果
  messages.value.push({
    content: results,
    contentType: 'table', 
    type: 'system',
    timestamp: new Date()
  });
  
  await scrollToBottom();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 5. 添加自然语言解释
  const explanation = `查询成功。物料代码M12345为"高强度钢板"，供应商为"金田金属"，当前风险等级为"中等"。`;
  
  messages.value.push({
    content: explanation,
    contentType: 'text',
    type: 'system',
    timestamp: new Date()
  });
}

// 替换SQL参数
function replaceParams(sql, params) {
  let result = sql;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(new RegExp(`:${key}`, 'g'), typeof value === 'string' ? `'${value}'` : value);
  }
  return result;
}

// 获取表格列
function getTableColumns(data) {
  if (!data || data.length === 0) return [];
  return Object.keys(data[0]);
}

// 格式化列名
function formatColumnName(column) {
  return column
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// 格式化消息，处理特殊格式
function formatMessage(text) {
  // 处理代码块
  text = text.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');
  
  // 处理链接
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
  
  // 处理换行
  text = text.replace(/\n/g, '<br>');
  
  return text;
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

// 处理示例查询点击
function handleExampleClick(example) {
  userInput.value = example;
  handleSend();
}

// 清空消息记录
function clearMessages() {
  ElMessageBox.confirm('确认清空所有对话记录?', '确认', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    messages.value = [];
    ElMessage.success('对话记录已清空');
  }).catch(() => {});
}

// 滚动到底部
async function scrollToBottom() {
  await nextTick();
  if (messageHistory.value) {
    messageHistory.value.scrollTop = messageHistory.value.scrollHeight;
  }
}

// 格式化时间
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// 格式化日期
function formatDate(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

// 规则库管理

// 处理Tab命令
function handleTabCommand(command) {
  currentRuleType.value = command;
  activeRule.value = [];  // 重置展开的规则
}

// 获取规则类型标题
function getRuleTypeTitle(type) {
  const titles = {
    'query_mapping': '查询映射规则',
    'column_mapping': '列名映射规则',
    'table_mapping': '表名映射规则',
    'constraint': '约束规则',
    'data_transformation': '数据转换规则',
    'keyword_mapping': '关键词映射规则',
    'intent_mapping': '意图映射规则'
  };
  
  return titles[type] || type;
}

// 编辑规则
function editRule(rule) {
  ruleDialogMode.value = 'edit';
  editingRule.value = JSON.parse(JSON.stringify(rule));  // 深拷贝
  ruleDialogVisible.value = true;
}

// 删除规则
function deleteRule(rule) {
  ElMessageBox.confirm('确认删除此规则?', '确认', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    try {
      rulesService.deleteRule && rulesService.deleteRule(rule.id);
      ElMessage.success('规则已删除');
    } catch (error) {
      ElMessage.error(`删除失败: ${error.message}`);
    }
  }).catch(() => {});
}

// 打开规则对话框
function openRuleDialog(mode) {
  ruleDialogMode.value = mode;
  
  if (mode === 'add') {
    editingRule.value = {
      type: currentRuleType.value,
      description: ''
      // 其他字段根据类型动态添加
    };
  }
  
  ruleDialogVisible.value = true;
}

// 保存规则
function saveRule() {
  try {
    if (ruleDialogMode.value === 'add' && rulesService.addRule) {
      rulesService.addRule(editingRule.value);
      ElMessage.success('规则已添加');
    } else if (rulesService.updateRule) {
      rulesService.updateRule(editingRule.value.id, editingRule.value);
      ElMessage.success('规则已更新');
    }
    
    ruleDialogVisible.value = false;
  } catch (error) {
    ElMessage.error(`保存失败: ${error.message}`);
  }
}

onMounted(() => {
  // 页面加载时的初始化操作
  if (rulesService.initialize && typeof rulesService.initialize === 'function') {
    try {
      rulesService.initialize();
    } catch (error) {
      console.error('规则服务初始化失败:', error);
    }
  }
});
</script>

<style scoped>
.knowledge-qa-page {
  padding: 20px;
}

.qa-card, .rules-card {
  height: calc(100vh - 140px);
  overflow: hidden;
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

/* 意图结果样式 */
.intent-content {
  width: 100%;
  background-color: #f8f8f8;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.intent-header {
  background-color: #e8e8e8;
  padding: 8px 12px;
  font-weight: bold;
}

.intent-details {
  padding: 10px 12px;
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

.add-rule {
  padding: 10px 0;
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