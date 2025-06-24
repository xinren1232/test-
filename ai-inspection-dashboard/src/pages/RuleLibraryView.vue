<template>
  <div class="rule-library-page">
    <div class="page-header">
      <h1>规则库管理</h1>
      <p class="description">管理系统中的各类规则，包括流程规则、分析规则、NLP规则和知识库规则</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" class="stats-card process-card">
            <div class="stats-icon">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-title">流程规则</div>
              <div class="stats-value">{{ processRules.length }}</div>
              <div class="stats-subtitle">
                <el-tag size="small" type="success">{{ getActiveRulesCount('process') }} 个启用</el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stats-card nlp-card">
            <div class="stats-icon">
              <el-icon><ChatLineRound /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-title">NLP意图规则</div>
              <div class="stats-value">{{ nlpRules.length }}</div>
              <div class="stats-subtitle">
                <el-tag size="small" type="success">{{ getActiveRulesCount('nlp') }} 个启用</el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stats-card knowledge-card">
            <div class="stats-icon">
              <el-icon><Notebook /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-title">知识库规则</div>
              <div class="stats-value">{{ knowledgeRules.length }}</div>
              <div class="stats-subtitle">
                <el-tag size="small" type="success">{{ getActiveRulesCount('knowledge') }} 个启用</el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stats-card history-card">
            <div class="stats-icon">
              <el-icon><Histogram /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-title">规则执行历史</div>
              <div class="stats-value">{{ ruleExecutionHistory.length }}</div>
              <div class="stats-subtitle">
                <el-tag size="small" type="success">{{ getSuccessfulExecutionsCount() }} 次成功</el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-card class="main-card">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 流程规则 -->
        <el-tab-pane label="流程规则" name="process">
          <div class="tab-content">
            <div class="table-actions">
              <div class="left-actions">
                <el-button type="primary" @click="showAddRuleDialog('process')">
                  <el-icon><Plus /></el-icon>添加流程规则
                </el-button>
                <el-button @click="exportRules('process')">
                  <el-icon><Download /></el-icon>导出规则
                </el-button>
                <el-button @click="showImportDialog('process')">
                  <el-icon><Upload /></el-icon>导入规则
                </el-button>
              </div>
              <div class="right-actions">
                <el-input
                  v-model="searchText.process"
                  placeholder="搜索规则名称或描述"
                  style="width: 300px;"
                  clearable
                >
                  <template #prefix><el-icon><Search /></el-icon></template>
                </el-input>
              </div>
            </div>
            
            <el-table
              :data="filteredProcessRules"
              style="width: 100%"
              v-loading="loading.process"
              border
              stripe
              highlight-current-row
              @row-click="(row) => viewRuleDetails(row, 'process')"
            >
              <el-table-column prop="rule_name" label="规则名称" width="180"></el-table-column>
              <el-table-column prop="trigger_event" label="触发事件" width="150"></el-table-column>
              <el-table-column prop="description" label="描述" show-overflow-tooltip></el-table-column>
              <el-table-column prop="action_type" label="动作类型" width="120">
                <template #default="scope">
                  <el-tag :type="getProcessTypeTagType(scope.row.action_type)">
                    {{ getProcessTypeName(scope.row.action_type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="priority" label="优先级" width="80" sortable></el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getRuleStatusType(scope.row.status)">
                    {{ getRuleStatusName(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="220" fixed="right">
                <template #default="scope">
                  <el-button size="small" @click.stop="viewRuleDetails(scope.row, 'process')">查看</el-button>
                  <el-button type="primary" size="small" @click.stop="editRule(scope.row, 'process')">编辑</el-button>
                  <el-button 
                    :type="scope.row.status === 'active' ? 'warning' : 'success'" 
                    size="small"
                    @click.stop="toggleRuleStatus(scope.row.id, 'process')"
                  >
                    {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                  </el-button>
                  <el-button type="danger" size="small" @click.stop="confirmDeleteRule(scope.row.id, 'process')">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination-container">
              <el-pagination
                background
                layout="total, sizes, prev, pager, next, jumper"
                :total="filteredProcessRules.length"
                :page-sizes="[10, 20, 50, 100]"
                v-model:page-size="pageSizes.process"
                v-model:current-page="currentPages.process"
              />
            </div>
          </div>
        </el-tab-pane>
        
        <!-- NLP意图规则 -->
        <el-tab-pane label="NLP意图规则" name="nlp">
          <div class="tab-content">
            <div class="table-actions">
              <div class="left-actions">
                <el-button type="primary" @click="showAddRuleDialog('nlp')">
                  <el-icon><Plus /></el-icon>添加NLP意图规则
                </el-button>
                <el-button @click="exportRules('nlp')">
                  <el-icon><Download /></el-icon>导出规则
                </el-button>
                <el-button @click="showImportDialog('nlp')">
                  <el-icon><Upload /></el-icon>导入规则
                </el-button>
              </div>
              <div class="right-actions">
                <el-input
                  v-model="searchText.nlp"
                  placeholder="搜索意图名称或触发模式"
                  style="width: 300px;"
                  clearable
                >
                  <template #prefix><el-icon><Search /></el-icon></template>
                </el-input>
              </div>
            </div>
            
            <el-table
              :data="filteredNlpRules"
              style="width: 100%"
              v-loading="loading.nlp"
              border
              stripe
              highlight-current-row
              @row-click="(row) => viewRuleDetails(row, 'nlp')"
            >
              <el-table-column prop="intent_name" label="意图名称" width="180"></el-table-column>
              <el-table-column prop="trigger_pattern" label="触发模式" width="200"></el-table-column>
              <el-table-column prop="description" label="描述" show-overflow-tooltip></el-table-column>
              <el-table-column prop="category" label="分类" width="100">
                <template #default="scope">
                  <el-tag :type="getNlpCategoryTagType(scope.row.category)">
                    {{ getNlpCategoryName(scope.row.category) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="intent_type" label="类型" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.intent_type === 'query' ? 'success' : 'warning'">
                    {{ scope.row.intent_type === 'query' ? '查询' : '动作' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getRuleStatusType(scope.row.status)">
                    {{ getRuleStatusName(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="220" fixed="right">
                <template #default="scope">
                  <el-button size="small" @click.stop="viewRuleDetails(scope.row, 'nlp')">查看</el-button>
                  <el-button type="primary" size="small" @click.stop="editRule(scope.row, 'nlp')">编辑</el-button>
                  <el-button 
                    :type="scope.row.status === 'active' ? 'warning' : 'success'" 
                    size="small"
                    @click.stop="toggleRuleStatus(scope.row.id, 'nlp')"
                  >
                    {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                  </el-button>
                  <el-button type="danger" size="small" @click.stop="confirmDeleteRule(scope.row.id, 'nlp')">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination-container">
              <el-pagination
                background
                layout="total, sizes, prev, pager, next, jumper"
                :total="filteredNlpRules.length"
                :page-sizes="[10, 20, 50, 100]"
                v-model:page-size="pageSizes.nlp"
                v-model:current-page="currentPages.nlp"
              />
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 知识库规则 -->
        <el-tab-pane label="知识库规则" name="knowledge">
          <div class="tab-content">
            <div class="table-actions">
              <div class="left-actions">
                <el-button type="primary" @click="showAddRuleDialog('knowledge')">
                  <el-icon><Plus /></el-icon>添加知识库规则
                </el-button>
                <el-button @click="exportRules('knowledge')">
                  <el-icon><Download /></el-icon>导出规则
                </el-button>
                <el-button @click="showImportDialog('knowledge')">
                  <el-icon><Upload /></el-icon>导入规则
                </el-button>
              </div>
              <div class="right-actions">
                <el-input
                  v-model="searchText.knowledge"
                  placeholder="搜索主题或关键词"
                  style="width: 300px;"
                  clearable
                >
                  <template #prefix><el-icon><Search /></el-icon></template>
                </el-input>
              </div>
            </div>
            
            <el-table
              :data="filteredKnowledgeRules"
              style="width: 100%"
              v-loading="loading.knowledge"
              border
              stripe
              highlight-current-row
              @row-click="(row) => viewRuleDetails(row, 'knowledge')"
            >
              <el-table-column prop="topic" label="主题" width="180"></el-table-column>
              <el-table-column prop="keywords" label="关键词" width="200">
                <template #default="scope">
                  <div class="keywords-container">
                    <el-tag 
                      v-for="(keyword, index) in scope.row.keywords" 
                      :key="index" 
                      size="small"
                      class="keyword-tag"
                    >
                      {{ keyword }}
                    </el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="描述" show-overflow-tooltip></el-table-column>
              <el-table-column prop="category" label="分类" width="120">
                <template #default="scope">
                  <el-tag :type="getKnowledgeTypeTagType(scope.row.category)">
                    {{ getKnowledgeTypeName(scope.row.category) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getRuleStatusType(scope.row.status)">
                    {{ getRuleStatusName(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="220" fixed="right">
                <template #default="scope">
                  <el-button size="small" @click.stop="viewRuleDetails(scope.row, 'knowledge')">查看</el-button>
                  <el-button type="primary" size="small" @click.stop="editRule(scope.row, 'knowledge')">编辑</el-button>
                  <el-button 
                    :type="scope.row.status === 'active' ? 'warning' : 'success'" 
                    size="small"
                    @click.stop="toggleRuleStatus(scope.row.id, 'knowledge')"
                  >
                    {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                  </el-button>
                  <el-button type="danger" size="small" @click.stop="confirmDeleteRule(scope.row.id, 'knowledge')">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination-container">
              <el-pagination
                background
                layout="total, sizes, prev, pager, next, jumper"
                :total="filteredKnowledgeRules.length"
                :page-sizes="[10, 20, 50, 100]"
                v-model:page-size="pageSizes.knowledge"
                v-model:current-page="currentPages.knowledge"
              />
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 规则执行历史 -->
        <el-tab-pane label="规则执行历史" name="history">
          <div class="tab-content">
            <div class="table-actions">
              <div class="left-actions">
                <el-button @click="clearRuleExecutionHistory" type="danger">
                  <el-icon><Delete /></el-icon>清空历史
                </el-button>
              </div>
              <div class="right-actions">
                <el-input
                  v-model="searchText.history"
                  placeholder="搜索规则名称或消息"
                  style="width: 300px;"
                  clearable
                >
                  <template #prefix><el-icon><Search /></el-icon></template>
                </el-input>
              </div>
            </div>
            
            <el-table
              :data="filteredRuleExecutionHistory"
              style="width: 100%"
              v-loading="loading.history"
              border
              stripe
              highlight-current-row
              @row-click="viewHistoryDetails"
            >
              <el-table-column prop="timestamp" label="执行时间" width="180" sortable>
                <template #default="scope">
                  {{ formatDateTime(scope.row.timestamp) }}
                </template>
              </el-table-column>
              <el-table-column prop="ruleType" label="规则类型" width="100">
                <template #default="scope">
                  <el-tag :type="getRuleTypeColor(scope.row.ruleType)">
                    {{ getRuleTypeName(scope.row.ruleType) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="ruleName" label="规则名称" width="180"></el-table-column>
              <el-table-column prop="result" label="执行结果" width="120">
                <template #default="scope">
                  <el-tag :type="scope.row.success ? 'success' : 'danger'">
                    {{ scope.row.success ? '成功' : '失败' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="message" label="执行消息" show-overflow-tooltip></el-table-column>
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="scope">
                  <el-button size="small" @click.stop="viewHistoryDetails(scope.row)">详情</el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination-container">
              <el-pagination
                background
                layout="total, sizes, prev, pager, next, jumper"
                :total="filteredRuleExecutionHistory.length"
                :page-sizes="[10, 20, 50, 100]"
                v-model:page-size="pageSizes.history"
                v-model:current-page="currentPages.history"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Plus, Download, Upload, Search, Connection,
  ChatLineRound, Notebook, Histogram, Edit,
  Delete, View, Check, Close, InfoFilled
} from '@element-plus/icons-vue';
import { RULE_TYPES, RULE_TYPE_UI, RULE_STATUS, RULE_STATUS_UI } from '../config/rule_types';
    
    // 标签页状态
    const activeTab = ref('process');
    
    // 搜索文本
    const searchText = reactive({
      process: '',
      nlp: '',
      knowledge: '',
      history: ''
    });
    
    // 加载状态
    const loading = reactive({
      process: false,
      nlp: false,
      knowledge: false,
      history: false
    });
    
    // 分页设置
    const pageSizes = reactive({
      process: 10,
      nlp: 10,
      knowledge: 10,
      history: 10
    });
    
    const currentPages = reactive({
      process: 1,
      nlp: 1,
      knowledge: 1,
      history: 1
    });
    
    // 规则数据
const processRules = computed(() => []);
const nlpRules = computed(() => []);
const knowledgeRules = computed(() => []);
const ruleExecutionHistory = computed(() => []);
    
    // 过滤后的规则
    const filteredProcessRules = computed(() => {
      if (!searchText.process) return processRules.value;
      
      const searchLower = searchText.process.toLowerCase();
      return processRules.value.filter(rule => 
        rule.rule_name.toLowerCase().includes(searchLower) || 
        rule.description.toLowerCase().includes(searchLower) ||
        rule.trigger_event.toLowerCase().includes(searchLower)
      );
    });
    
    const filteredNlpRules = computed(() => {
      if (!searchText.nlp) return nlpRules.value;
      
      const searchLower = searchText.nlp.toLowerCase();
      return nlpRules.value.filter(rule => 
        rule.intent_name.toLowerCase().includes(searchLower) || 
        rule.description.toLowerCase().includes(searchLower) ||
        rule.trigger_pattern.toLowerCase().includes(searchLower)
      );
    });
    
    const filteredKnowledgeRules = computed(() => {
      if (!searchText.knowledge) return knowledgeRules.value;
      
      const searchLower = searchText.knowledge.toLowerCase();
      return knowledgeRules.value.filter(rule => 
        rule.topic.toLowerCase().includes(searchLower) || 
        rule.description.toLowerCase().includes(searchLower) ||
        (rule.keywords && rule.keywords.some(kw => kw.toLowerCase().includes(searchLower)))
      );
    });
    
    const filteredRuleExecutionHistory = computed(() => {
      if (!searchText.history) return ruleExecutionHistory.value;
      
      const searchLower = searchText.history.toLowerCase();
      return ruleExecutionHistory.value.filter(history => 
        (history.ruleName && history.ruleName.toLowerCase().includes(searchLower)) || 
        (history.message && history.message.toLowerCase().includes(searchLower))
      );
    });
    
    // 获取活跃规则数量
    const getActiveRulesCount = (ruleType) => {
      switch(ruleType) {
        case 'process':
          return processRules.value.filter(rule => rule.status === RULE_STATUS.ACTIVE).length;
        case 'nlp':
          return nlpRules.value.filter(rule => rule.status === RULE_STATUS.ACTIVE).length;
        case 'knowledge':
          return knowledgeRules.value.filter(rule => rule.status === RULE_STATUS.ACTIVE).length;
        default:
          return 0;
      }
    };
    
    // 获取成功执行的规则数量
    const getSuccessfulExecutionsCount = () => {
      return ruleExecutionHistory.value.filter(history => history.success).length;
    };
    
    // 格式化日期时间
    const formatDateTime = (timestamp) => {
      if (!timestamp) return '';
      
      try {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
      } catch (error) {
        console.error('日期格式化错误:', error);
        return timestamp;
      }
    };
    
    // 清空规则执行历史
    const clearRuleExecutionHistory = () => {
      ElMessageBox.confirm(
        '确定要清空所有规则执行历史吗？此操作不可恢复。',
        '清空确认',
        {
          confirmButtonText: '清空',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        // 清空历史记录
    ruleExecutionHistory.value = [];
        // 保存到本地存储
        localStorage.setItem('rule_execution_history', JSON.stringify([]));
        ElMessage.success('规则执行历史已清空');
      }).catch(() => {});
    };
    
    // 导出规则
    const exportRules = (ruleType) => {
      try {
        let rules;
        let filename;
        
        switch(ruleType) {
          case 'process':
            rules = processRules.value;
            filename = 'process_rules.json';
            break;
          case 'nlp':
            rules = nlpRules.value;
            filename = 'nlp_intent_rules.json';
            break;
          case 'knowledge':
            rules = knowledgeRules.value;
            filename = 'knowledge_rules.json';
            break;
          default:
            throw new Error('未知规则类型');
        }
        
        const jsonStr = JSON.stringify(rules, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        ElMessage.success('规则导出成功');
      } catch (error) {
        console.error('导出规则失败:', error);
        ElMessage.error('导出规则失败: ' + error.message);
      }
    };
    
    // 显示导入对话框
    const showImportDialog = (ruleType) => {
      ElMessageBox.prompt('请粘贴JSON格式的规则数据', '导入规则', {
        confirmButtonText: '导入',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '粘贴JSON数据...',
      }).then(({ value }) => {
        try {
          const rules = JSON.parse(value);
          
          if (!Array.isArray(rules)) {
            throw new Error('导入的数据必须是数组格式');
          }
          
          let importCount = 0;
          
          switch(ruleType) {
            case 'process':
              rules.forEach(rule => {
                if (ruleEngine.addProcessRule(rule)) {
                  importCount++;
                }
              });
              break;
            case 'nlp':
              rules.forEach(rule => {
                if (ruleEngine.addNlpRule(rule)) {
                  importCount++;
                }
              });
              break;
            case 'knowledge':
              rules.forEach(rule => {
                if (ruleEngine.addKnowledgeRule(rule)) {
                  importCount++;
                }
              });
              break;
          }
          
          ElMessage.success(`成功导入 ${importCount} 条规则`);
        } catch (error) {
          console.error('导入规则失败:', error);
          ElMessage.error('导入规则失败: ' + error.message);
        }
      }).catch(() => {});
    };
    
    // 查看规则详情
    const viewRuleDetails = (rule, type) => {
      ElMessageBox.alert(
        `<div class="rule-details">
          <div class="rule-detail-item">
            <span class="label">ID:</span>
            <span class="value">${rule.id}</span>
          </div>
          ${type === 'process' ? 
            `<div class="rule-detail-item">
              <span class="label">规则名称:</span>
              <span class="value">${rule.rule_name}</span>
            </div>
            <div class="rule-detail-item">
              <span class="label">触发事件:</span>
              <span class="value">${rule.trigger_event}</span>
            </div>
            <div class="rule-detail-item">
              <span class="label">动作类型:</span>
              <span class="value">${getProcessTypeName(rule.action_type)}</span>
            </div>
            <div class="rule-detail-item">
              <span class="label">优先级:</span>
              <span class="value">${rule.priority}</span>
            </div>` 
          : type === 'nlp' ? 
            `<div class="rule-detail-item">
              <span class="label">意图名称:</span>
              <span class="value">${rule.intent_name}</span>
            </div>
            <div class="rule-detail-item">
              <span class="label">触发模式:</span>
              <span class="value">${rule.trigger_pattern}</span>
            </div>
            <div class="rule-detail-item">
              <span class="label">分类:</span>
              <span class="value">${getNlpCategoryName(rule.category)}</span>
            </div>
            <div class="rule-detail-item">
              <span class="label">意图类型:</span>
              <span class="value">${rule.intent_type === 'query' ? '查询' : '动作'}</span>
            </div>` 
          : 
            `<div class="rule-detail-item">
              <span class="label">主题:</span>
              <span class="value">${rule.topic}</span>
            </div>
            <div class="rule-detail-item">
              <span class="label">关键词:</span>
              <span class="value">${rule.keywords ? rule.keywords.join(', ') : ''}</span>
            </div>
            <div class="rule-detail-item">
              <span class="label">分类:</span>
              <span class="value">${getKnowledgeTypeName(rule.category)}</span>
            </div>`
          }
          <div class="rule-detail-item">
            <span class="label">描述:</span>
            <span class="value">${rule.description}</span>
          </div>
          <div class="rule-detail-item">
            <span class="label">状态:</span>
            <span class="value">${getRuleStatusName(rule.status)}</span>
          </div>
          <div class="rule-detail-item">
            <span class="label">创建时间:</span>
            <span class="value">${formatDateTime(rule.created_at)}</span>
          </div>
          <div class="rule-detail-item">
            <span class="label">更新时间:</span>
            <span class="value">${formatDateTime(rule.updated_at)}</span>
          </div>
        </div>`,
        `${type === 'process' ? '流程规则' : type === 'nlp' ? 'NLP意图规则' : '知识库规则'}详情`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '关闭'
        }
      );
    };
    
    // 编辑规则
    const editRule = (rule, type) => {
      // 这里可以实现编辑功能，例如打开编辑对话框
      ElMessage.info('编辑功能正在开发中...');
    };
    
    // 切换规则状态
    const toggleRuleStatus = (ruleId, type) => {
      if (ruleEngine.toggleRuleStatus(ruleId, type)) {
        ElMessage.success('规则状态已更新');
      } else {
        ElMessage.error('更新规则状态失败');
      }
    };
    
    // 确认删除规则
    const confirmDeleteRule = (ruleId, type) => {
      ElMessageBox.confirm(
        '确定要删除此规则吗？删除后无法恢复。',
        '删除确认',
        {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        deleteRule(ruleId, type);
      }).catch(() => {});
    };
    
    // 删除规则
    const deleteRule = (ruleId, type) => {
      let success = false;
      
      switch(type) {
        case 'process':
          success = ruleEngine.deleteProcessRule(ruleId);
          break;
        case 'nlp':
          success = ruleEngine.deleteNlpRule(ruleId);
          break;
        case 'knowledge':
          success = ruleEngine.deleteKnowledgeRule(ruleId);
          break;
        default:
          ElMessage.error('未知规则类型');
          return;
      }
      
      if (success) {
        ElMessage.success('规则已成功删除');
      } else {
        ElMessage.error('删除规则失败');
      }
    };
    
    // 显示添加规则对话框
    const showAddRuleDialog = (type) => {
      // 这里可以实现添加规则功能，例如打开添加对话框
      ElMessage.info('添加规则功能正在开发中...');
    };
    
    // 查看历史详情
    const viewHistoryDetails = (history) => {
      ElMessageBox.alert(
        `<div class="rule-details">
          <div class="rule-detail-item">
            <span class="label">执行时间:</span>
            <span class="value">${formatDateTime(history.timestamp)}</span>
          </div>
          <div class="rule-detail-item">
            <span class="label">规则类型:</span>
            <span class="value">${getRuleTypeName(history.ruleType)}</span>
          </div>
          <div class="rule-detail-item">
            <span class="label">规则名称:</span>
            <span class="value">${history.ruleName}</span>
          </div>
          <div class="rule-detail-item">
            <span class="label">规则ID:</span>
            <span class="value">${history.ruleId}</span>
          </div>
          <div class="rule-detail-item">
            <span class="label">执行结果:</span>
            <span class="value ${history.success ? 'success-text' : 'error-text'}">${history.success ? '成功' : '失败'}</span>
          </div>
          <div class="rule-detail-item">
            <span class="label">执行消息:</span>
            <span class="value">${history.message}</span>
          </div>
          ${history.data ? 
            `<div class="rule-detail-item">
              <span class="label">相关数据:</span>
              <pre class="value code-block">${JSON.stringify(history.data, null, 2)}</pre>
            </div>` 
          : ''}
        </div>`,
        '规则执行历史详情',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '关闭'
        }
      );
    };
    
    // 获取流程规则类型标签样式
    const getProcessTypeTagType = (type) => {
      return RULE_TYPE_UI.processTypeTag[type] || '';
    };
    
    // 获取流程规则类型名称
    const getProcessTypeName = (type) => {
      return RULE_TYPE_UI.processTypeName[type] || type;
    };
    
    // 获取NLP分类标签样式
    const getNlpCategoryTagType = (category) => {
      return RULE_TYPE_UI.nlpCategoryTag[category] || '';
    };
    
    // 获取NLP分类名称
    const getNlpCategoryName = (category) => {
      return RULE_TYPE_UI.nlpCategoryName[category] || category;
    };
    
    // 获取知识库类型标签样式
    const getKnowledgeTypeTagType = (type) => {
      return RULE_TYPE_UI.knowledgeTypeTag[type] || '';
    };
    
    // 获取知识库类型名称
    const getKnowledgeTypeName = (type) => {
      return RULE_TYPE_UI.knowledgeTypeName[type] || type;
    };
    
    // 获取规则状态标签样式
    const getRuleStatusType = (status) => {
      return RULE_STATUS_UI.statusTag[status] || '';
    };
    
    // 获取规则状态名称
    const getRuleStatusName = (status) => {
      return RULE_STATUS_UI.statusName[status] || status;
    };
    
    // 获取规则类型颜色
    const getRuleTypeColor = (type) => {
      switch(type) {
        case 'process':
          return 'primary';
        case 'nlp':
          return 'success';
        case 'knowledge':
          return 'warning';
        default:
          return 'info';
      }
    };
    
    // 获取规则类型名称
    const getRuleTypeName = (type) => {
      switch(type) {
        case 'process':
          return '流程规则';
        case 'nlp':
          return 'NLP规则';
        case 'knowledge':
          return '知识库规则';
        default:
          return type;
      }
    };
    
// 创建我们需要的函数来替代useRuleEngine
const ruleEngine = {
  toggleRuleStatus: (ruleId, type) => {
    console.log(`切换规则状态: ${ruleId}, 类型: ${type}`);
    return true;
  },
  deleteProcessRule: (ruleId) => {
    console.log(`删除流程规则: ${ruleId}`);
    return true;
  },
  deleteNlpRule: (ruleId) => {
    console.log(`删除NLP规则: ${ruleId}`);
    return true;
  },
  deleteKnowledgeRule: (ruleId) => {
    console.log(`删除知识库规则: ${ruleId}`);
    return true;
  },
  addProcessRule: (rule) => {
    console.log('添加流程规则:', rule);
    return true;
  },
  addNlpRule: (rule) => {
    console.log('添加NLP规则:', rule);
    return true;
  },
  addKnowledgeRule: (rule) => {
    console.log('添加知识库规则:', rule);
    return true;
  }
};

// 创建一个本地 generateId 函数
const generateId = () => {
  return 'id-' + Math.random().toString(36).substr(2, 9);
};
</script>

<style scoped>
.rule-library-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.page-header .description {
  color: var(--el-text-color-secondary);
  margin: 0;
}

.stats-cards {
  margin-bottom: 24px;
}

.stats-card {
  height: 120px;
  display: flex;
  align-items: center;
  transition: all 0.3s;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.stats-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
}

.process-card .stats-icon {
  background-color: rgba(64, 158, 255, 0.1);
  color: var(--el-color-primary);
}

.nlp-card .stats-icon {
  background-color: rgba(103, 194, 58, 0.1);
  color: var(--el-color-success);
}

.knowledge-card .stats-icon {
  background-color: rgba(230, 162, 60, 0.1);
  color: var(--el-color-warning);
}

.history-card .stats-icon {
  background-color: rgba(144, 147, 153, 0.1);
  color: var(--el-color-info);
}

.stats-info {
  flex: 1;
}

.stats-title {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.stats-value {
  font-size: 28px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
}

.stats-subtitle {
  font-size: 12px;
}

.main-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tab-content {
  margin-top: 16px;
}

.table-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.left-actions {
  display: flex;
  gap: 8px;
}

.right-actions {
  display: flex;
  gap: 8px;
}

.keywords-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.keyword-tag {
  margin: 2px;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

/* 规则详情样式 */
:deep(.rule-details) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

:deep(.rule-detail-item) {
  display: flex;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
}

:deep(.rule-detail-item .label) {
  width: 100px;
  font-weight: bold;
  color: var(--el-text-color-secondary);
}

:deep(.rule-detail-item .value) {
  flex: 1;
}

:deep(.success-text) {
  color: var(--el-color-success);
}

:deep(.error-text) {
  color: var(--el-color-danger);
}

:deep(.code-block) {
  background-color: #f5f7fa;
  padding: 8px;
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-wrap;
  overflow-x: auto;
  margin: 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .stats-cards .el-col {
    width: 100%;
    margin-bottom: 16px;
  }
  
  .table-actions {
    flex-direction: column;
    gap: 16px;
  }
  
  .left-actions, .right-actions {
    width: 100%;
  }
}
</style> 