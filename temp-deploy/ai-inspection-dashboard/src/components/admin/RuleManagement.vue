<template>
  <div class="rules-management-container">
    <el-card class="rules-card">
      <template #header>
        <div class="card-header">
          <h2>规则管理</h2>
          <div>
            <el-button type="primary" @click="refreshRules">
              <el-icon><Refresh /></el-icon>
              刷新规则
            </el-button>
          </div>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" type="border-card">
        <!-- NLP 规则管理 -->
        <el-tab-pane label="NLP意图规则" name="nlp">
          <div class="tab-header">
            <h3>NLP意图规则配置</h3>
            <el-button type="primary" @click="showAddNlpRuleDialog">
              <el-icon><Plus /></el-icon>
              添加规则
            </el-button>
          </div>
          
          <el-table :data="nlpRules" style="width: 100%" border v-loading="loading.nlp">
            <el-table-column prop="intent_name" label="意图名称" width="180" />
            <el-table-column prop="trigger_pattern" label="触发模式" width="220" />
            <el-table-column prop="intent_type" label="类型" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.intent_type === 'query' ? 'success' : 'warning'">
                  {{ scope.row.intent_type === 'query' ? '查询' : '动作' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="target_table" label="目标表" width="140" />
            <el-table-column prop="description" label="描述" />
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="scope">
                <el-button type="primary" text size="small" @click="viewRuleDetails(scope.row, 'nlp')">
                  查看
                </el-button>
                <el-button type="danger" text size="small" @click="deleteRule(scope.row, 'nlp')">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <!-- 问答规则管理 -->
        <el-tab-pane label="问答知识规则" name="qa">
          <div class="tab-header">
            <h3>问答知识规则配置</h3>
            <el-button type="primary" @click="showAddQaRuleDialog">
              <el-icon><Plus /></el-icon>
              添加规则
            </el-button>
          </div>
          
          <el-table :data="qaRules" style="width: 100%" border v-loading="loading.qa">
            <el-table-column prop="topic" label="主题" width="180" />
            <el-table-column prop="keywords" label="关键词" width="220">
              <template #default="scope">
                <div class="keywords-container">
                  <el-tag v-for="(keyword, index) in scope.row.keywords" :key="index" size="small" class="keyword-tag">
                    {{ keyword }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="category" label="分类" width="120">
              <template #default="scope">
                <el-tag :type="getQaCategoryType(scope.row.category)">
                  {{ scope.row.category }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="source" label="来源" width="120" />
            <el-table-column prop="description" label="描述" />
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="scope">
                <el-button type="primary" text size="small" @click="viewRuleDetails(scope.row, 'qa')">
                  查看
                </el-button>
                <el-button type="success" text size="small" @click="editQaRule(scope.row)">
                  编辑
                </el-button>
                <el-button type="danger" text size="small" @click="deleteRule(scope.row, 'qa')">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <!-- 流程规则管理 -->
        <el-tab-pane label="流程自动化规则" name="process">
          <div class="tab-header">
            <h3>流程自动化规则配置</h3>
            <el-button type="primary" @click="showAddProcessRuleDialog">
              <el-icon><Plus /></el-icon>
              添加规则
            </el-button>
          </div>
          
          <el-table :data="processRules" style="width: 100%" border v-loading="loading.process">
            <el-table-column prop="rule_name" label="规则名称" width="180" />
            <el-table-column prop="trigger_event" label="触发事件" width="120" />
            <el-table-column prop="trigger_table" label="触发表" width="140" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
                  {{ scope.row.status === 'active' ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="priority" label="优先级" width="80" />
            <el-table-column prop="description" label="描述" />
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="scope">
                <el-button type="primary" text size="small" @click="viewRuleDetails(scope.row, 'process')">
                  查看
                </el-button>
                <el-button 
                  :type="scope.row.status === 'active' ? 'warning' : 'success'" 
                  text 
                  size="small" 
                  @click="toggleRuleStatus(scope.row)"
                >
                  {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                </el-button>
                <el-button type="danger" text size="small" @click="deleteRule(scope.row, 'process')">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <!-- 规则执行历史 -->
        <el-tab-pane label="规则执行历史" name="history">
          <div class="tab-header">
            <h3>规则执行历史</h3>
            <el-select v-model="historyFilter" placeholder="筛选类型">
              <el-option label="全部" value="all" />
              <el-option label="NLP规则" value="nlp" />
              <el-option label="问答规则" value="qa" />
              <el-option label="流程规则" value="process" />
            </el-select>
          </div>
          
          <el-table :data="filteredHistory" style="width: 100%" border v-loading="loading.history">
            <el-table-column prop="type" label="类型" width="100">
              <template #default="scope">
                <el-tag :type="getHistoryTagType(scope.row.type)">
                  {{ getHistoryTypeText(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="ruleName" label="规则名称" width="180" />
            <el-table-column prop="timestamp" label="执行时间" width="180" />
            <el-table-column label="详情">
              <template #default="scope">
                <el-button type="primary" text size="small" @click="viewHistoryDetails(scope.row)">
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 规则详情对话框 -->
    <el-dialog
      v-model="dialogs.viewRule"
      :title="currentRule ? (getRuleTitle(currentRule, currentRuleType)) : '规则详情'"
      width="60%"
    >
      <rule-details
        v-if="currentRule"
        :rule="currentRule"
        :rule-type="currentRuleType"
      />
    </el-dialog>

    <!-- 添加NLP规则对话框 -->
    <el-dialog
      v-model="dialogs.addNlpRule"
      title="添加NLP意图规则"
      width="60%"
    >
      <add-nlp-rule @save="saveNlpRule" @cancel="dialogs.addNlpRule = false" />
    </el-dialog>

    <!-- 添加问答规则对话框 -->
    <el-dialog
      v-model="dialogs.addQaRule"
      title="添加问答知识规则"
      width="60%"
    >
      <add-qa-rule @save="saveQaRule" @cancel="dialogs.addQaRule = false" />
    </el-dialog>

    <!-- 添加流程规则对话框 -->
    <el-dialog
      v-model="dialogs.addProcessRule"
      title="添加流程规则"
      width="60%"
    >
      <add-process-rule @save="saveProcessRule" @cancel="dialogs.addProcessRule = false" />
    </el-dialog>

    <!-- 历史详情对话框 -->
    <el-dialog
      v-model="dialogs.viewHistory"
      title="规则执行详情"
      width="60%"
    >
      <pre v-if="currentHistory" class="history-details">{{ JSON.stringify(currentHistory.details, null, 2) }}</pre>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { Plus, Refresh } from '@element-plus/icons-vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useRuleEngine } from '../../composables/useRuleEngine';

// 假设这些组件已经存在，或者你需要创建它们
import RuleDetails from './RuleDetails.vue';
import AddNlpRule from './AddNlpRule.vue';
import AddProcessRule from './AddProcessRule.vue';
import AddQaRule from './AddQaRule.vue';
import HistoryDetails from './HistoryDetails.vue';

export default {
  name: 'RuleManagement',
  
  components: {
    RuleDetails,
    AddNlpRule,
    AddProcessRule,
    AddQaRule,
    HistoryDetails,
    Plus,
    Refresh
  },
  
  setup() {
    const ruleEngine = useRuleEngine();
    
    const activeTab = ref('nlp');
    const nlpRules = ref([]);
    const processRules = ref([]);
    const qaRules = ref([]);
    const ruleHistory = ref([]);
    const historyFilter = ref('all');
    const currentRule = ref(null);
    const currentRuleType = ref(null);
    const currentHistory = ref(null);
    
    const loading = ref({
      nlp: false,
      process: false,
      qa: false,
      history: false
    });
    
    const dialogs = ref({
      viewRule: false,
      addNlpRule: false,
      addProcessRule: false,
      addQaRule: false,
      viewHistory: false
    });
    
    // 过滤后的历史记录
    const filteredHistory = computed(() => {
      if (historyFilter.value === 'all') {
        return ruleHistory.value;
      }
      return ruleHistory.value.filter(item => item.type === historyFilter.value);
    });
    
    // 获取规则标题
    const getRuleTitle = (rule, ruleType) => {
      switch (ruleType) {
        case 'nlp':
          return rule.intent_name || '规则详情';
        case 'process':
          return rule.rule_name || '规则详情';
        case 'qa':
          return rule.topic || '知识规则详情';
        default:
          return '规则详情';
      }
    };
    
    // 获取历史记录类型标签样式
    const getHistoryTagType = (type) => {
      switch (type) {
        case 'nlp':
          return 'success';
        case 'process':
          return 'warning';
        case 'qa':
          return 'info';
        default:
          return 'info';
      }
    };
    
    // 获取历史记录类型文本
    const getHistoryTypeText = (type) => {
      switch (type) {
        case 'nlp':
          return 'NLP';
        case 'process':
          return '流程';
        case 'qa':
          return '问答';
        default:
          return type;
      }
    };
    
    // 获取问答规则分类标签样式
    const getQaCategoryType = (category) => {
      switch (category.toLowerCase()) {
        case '质量检验':
          return 'success';
        case '物料管理':
          return 'warning';
        case '生产工艺':
          return 'danger';
        case '标准规范':
          return 'info';
        default:
          return 'info';
      }
    };
    
    // 加载数据
    const loadData = async () => {
      try {
        // 初始化规则引擎
        await ruleEngine.initialize();
        
        // 加载规则数据
        loadNlpRules();
        loadProcessRules();
        loadQaRules();
        loadRuleHistory();
      } catch (error) {
        console.error('加载规则数据失败:', error);
        ElMessage.error('加载规则数据失败');
      }
    };
    
    // 加载NLP规则
    const loadNlpRules = () => {
      loading.value.nlp = true;
      try {
        nlpRules.value = ruleEngine.getNlpRules();
      } catch (error) {
        console.error('加载NLP规则失败:', error);
        ElMessage.error('加载NLP规则失败');
      } finally {
        loading.value.nlp = false;
      }
    };
    
    // 加载流程规则
    const loadProcessRules = () => {
      loading.value.process = true;
      try {
        processRules.value = ruleEngine.getProcessRules();
      } catch (error) {
        console.error('加载流程规则失败:', error);
        ElMessage.error('加载流程规则失败');
      } finally {
        loading.value.process = false;
      }
    };
    
    // 加载问答规则
    const loadQaRules = () => {
      loading.value.qa = true;
      try {
        // 这里假设规则引擎服务中有获取问答规则的方法
        qaRules.value = ruleEngine.getQaRules();
      } catch (error) {
        console.error('加载问答规则失败:', error);
        ElMessage.error('加载问答规则失败');
      } finally {
        loading.value.qa = false;
      }
    };
    
    // 加载规则执行历史
    const loadRuleHistory = () => {
      loading.value.history = true;
      try {
        ruleHistory.value = ruleEngine.getExecutionHistory();
      } catch (error) {
        console.error('加载规则执行历史失败:', error);
        ElMessage.error('加载规则执行历史失败');
      } finally {
        loading.value.history = false;
      }
    };
    
    // 查看规则详情
    const viewRuleDetails = (rule, type) => {
      currentRule.value = rule;
      currentRuleType.value = type;
      dialogs.value.viewRule = true;
    };
    
    // 查看历史详情
    const viewHistoryDetails = (history) => {
      currentHistory.value = history;
      dialogs.value.viewHistory = true;
    };
    
    // 切换规则状态（启用/禁用）
    const toggleRuleStatus = (rule) => {
      rule.status = rule.status === 'active' ? 'inactive' : 'active';
      ruleEngine.saveRulesToRemote('process').catch(error => {
        console.error('保存规则状态失败:', error);
        ElMessage.error('保存规则状态失败');
      });
    };
    
    // 删除规则
    const deleteRule = (rule, type) => {
      ElMessageBox.confirm(
        `确定要删除${type === 'nlp' ? 'NLP规则' : type === 'qa' ? '问答规则' : '流程规则'}【${type === 'nlp' ? rule.intent_name : type === 'qa' ? rule.topic : rule.rule_name}】吗？`,
        '删除确认',
        {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        if (type === 'nlp') {
          const index = nlpRules.value.findIndex(r => r === rule);
          if (index !== -1) {
            nlpRules.value.splice(index, 1);
          }
        } else if (type === 'qa') {
          const index = qaRules.value.findIndex(r => r === rule);
          if (index !== -1) {
            qaRules.value.splice(index, 1);
          }
        } else {
          const index = processRules.value.findIndex(r => r === rule);
          if (index !== -1) {
            processRules.value.splice(index, 1);
          }
        }
        
        // 保存到远程
        ruleEngine.saveRulesToRemote(type).then(() => {
          ElMessage.success('删除成功');
        }).catch(error => {
          console.error('删除规则失败:', error);
          ElMessage.error('删除规则失败');
          // 重新加载数据
          type === 'nlp' ? loadNlpRules() : type === 'qa' ? loadQaRules() : loadProcessRules();
        });
      }).catch(() => {});
    };
    
    // 保存NLP规则
    const saveNlpRule = (rule) => {
      const success = ruleEngine.addNlpRule(rule);
      if (success) {
        ElMessage.success('NLP规则添加成功');
        loadNlpRules();
        dialogs.value.addNlpRule = false;
      } else {
        ElMessage.error('NLP规则添加失败');
      }
    };
    
    // 保存流程规则
    const saveProcessRule = (rule) => {
      const success = ruleEngine.addProcessRule(rule);
      if (success) {
        ElMessage.success('流程规则添加成功');
        loadProcessRules();
        dialogs.value.addProcessRule = false;
      } else {
        ElMessage.error('流程规则添加失败');
      }
    };
    
    // 保存问答规则
    const saveQaRule = (rule) => {
      const success = ruleEngine.addQaRule(rule);
      if (success) {
        ElMessage.success('问答规则添加成功');
        loadQaRules();
        dialogs.value.addQaRule = false;
      } else {
        ElMessage.error('问答规则添加失败');
      }
    };
    
    // 刷新规则
    const refreshRules = () => {
      loadData();
      ElMessage.success('规则刷新成功');
    };
    
    // 显示添加NLP规则对话框
    const showAddNlpRuleDialog = () => {
      dialogs.value.addNlpRule = true;
    };
    
    // 显示添加流程规则对话框
    const showAddProcessRuleDialog = () => {
      dialogs.value.addProcessRule = true;
    };
    
    // 显示添加问答规则对话框
    const showAddQaRuleDialog = () => {
      dialogs.value.addQaRule = true;
    };
    
    onMounted(() => {
      loadData();
    });
    
    return {
      activeTab,
      nlpRules,
      processRules,
      qaRules,
      filteredHistory,
      historyFilter,
      loading,
      dialogs,
      currentRule,
      currentRuleType,
      currentHistory,
      viewRuleDetails,
      viewHistoryDetails,
      toggleRuleStatus,
      deleteRule,
      saveNlpRule,
      saveProcessRule,
      saveQaRule,
      refreshRules,
      showAddNlpRuleDialog,
      showAddProcessRuleDialog,
      showAddQaRuleDialog,
      getRuleTitle,
      getHistoryTagType,
      getHistoryTypeText,
      getQaCategoryType
    };
  }
};
</script>

<style scoped>
.rules-management-container {
  padding: 10px;
}

.rules-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.history-details {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  white-space: pre-wrap;
  font-family: monospace;
  max-height: 400px;
  overflow-y: auto;
}
</style> 