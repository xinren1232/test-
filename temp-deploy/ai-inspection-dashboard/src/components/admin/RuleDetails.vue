<template>
  <div class="rule-details">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="基本信息" name="basic">
        <el-descriptions :column="2" border>
          <!-- NLP规则字段 -->
          <template v-if="ruleType === 'nlp'">
            <el-descriptions-item label="意图名称" span="2">{{ rule.intent_name }}</el-descriptions-item>
            <el-descriptions-item label="触发模式" span="2">{{ rule.trigger_pattern }}</el-descriptions-item>
            <el-descriptions-item label="意图类型">
              <el-tag :type="rule.intent_type === 'query' ? 'success' : 'warning'">
                {{ rule.intent_type === 'query' ? '查询' : '动作' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="描述">{{ rule.description || '无' }}</el-descriptions-item>
            <template v-if="rule.intent_type === 'query'">
              <el-descriptions-item label="目标表" span="2">{{ rule.target_table }}</el-descriptions-item>
              <el-descriptions-item label="目标字段" span="2">
                {{ Array.isArray(rule.target_fields) ? rule.target_fields.join(', ') : '无' }}
              </el-descriptions-item>
            </template>
            <template v-else>
              <el-descriptions-item label="操作模板" span="2">{{ rule.action_template }}</el-descriptions-item>
            </template>
          </template>
          
          <!-- 问答规则字段 -->
          <template v-else-if="ruleType === 'qa'">
            <el-descriptions-item label="主题" span="2">{{ rule.topic }}</el-descriptions-item>
            <el-descriptions-item label="分类">
              <el-tag :type="getQaCategoryType(rule.category)">{{ rule.category }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="来源">{{ rule.source || '自定义' }}</el-descriptions-item>
            <el-descriptions-item label="关键词" span="2">
              <div class="keywords-container">
                <el-tag v-for="(keyword, index) in rule.keywords" :key="index" size="small" class="keyword-tag">
                  {{ keyword }}
                </el-tag>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="描述" span="2">{{ rule.description || '无' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDate(rule.created_at) }}</el-descriptions-item>
            <el-descriptions-item label="最后更新">{{ formatDate(rule.updated_at) }}</el-descriptions-item>
          </template>
          
          <!-- 流程规则字段 -->
          <template v-else-if="ruleType === 'process'">
            <el-descriptions-item label="规则名称" span="2">{{ rule.rule_name }}</el-descriptions-item>
            <el-descriptions-item label="触发事件">{{ rule.trigger_event }}</el-descriptions-item>
            <el-descriptions-item label="触发表">{{ rule.trigger_table }}</el-descriptions-item>
            <el-descriptions-item label="优先级">
              <el-tag :type="getPriorityType(rule.priority)">{{ rule.priority }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="rule.status === 'active' ? 'success' : 'info'">
                {{ rule.status === 'active' ? '启用' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="描述" span="2">{{ rule.description || '无' }}</el-descriptions-item>
            <template v-if="rule.schedule">
              <el-descriptions-item label="调度频率" span="2">
                {{ getScheduleText(rule.schedule) }}
              </el-descriptions-item>
            </template>
          </template>
        </el-descriptions>
      </el-tab-pane>
      
      <el-tab-pane label="条件与动作" name="condition">
        <!-- NLP规则条件 -->
        <template v-if="ruleType === 'nlp'">
          <div v-if="rule.intent_type === 'query'" class="code-section">
            <h4>查询条件模板</h4>
            <pre class="code">{{ rule.condition_template }}</pre>
          </div>
          <div v-else class="code-section">
            <h4>动作参数</h4>
            <pre class="code">{{ JSON.stringify(rule.action_params || {}, null, 2) }}</pre>
          </div>
        </template>
        
        <!-- 问答规则内容 -->
        <template v-else-if="ruleType === 'qa'">
          <div class="code-section">
            <h4>问答内容</h4>
            <div class="qa-content markdown-preview" v-html="renderMarkdown(rule.content)"></div>
          </div>
          
          <div v-if="rule.examples && rule.examples.length > 0" class="code-section">
            <h4>示例问题</h4>
            <ul class="example-list">
              <li v-for="(example, index) in rule.examples" :key="index" class="example-item">
                {{ example }}
              </li>
            </ul>
          </div>
          
          <div v-if="rule.related_topics && rule.related_topics.length > 0" class="code-section">
            <h4>相关主题</h4>
            <div class="related-topics">
              <el-tag 
                v-for="(topic, index) in rule.related_topics" 
                :key="index" 
                class="related-topic-tag"
                type="info"
                effect="plain"
              >
                {{ topic }}
              </el-tag>
            </div>
          </div>
        </template>
        
        <!-- 流程规则条件和动作 -->
        <template v-else-if="ruleType === 'process'">
          <div class="code-section">
            <h4>触发条件</h4>
            <pre class="code">{{ rule.condition_template }}</pre>
          </div>
          
          <div class="code-section">
            <h4>动作模板</h4>
            <pre class="code">{{ JSON.stringify(rule.action_template || {}, null, 2) }}</pre>
          </div>
        </template>
      </el-tab-pane>
      
      <el-tab-pane v-if="ruleDiagramData || ruleType === 'qa'" label="可视化流程" name="diagram">
        <div class="diagram-container">
          <el-empty v-if="!ruleDiagramData && ruleType !== 'qa'" description="暂无可视化流程图" />
          <div v-else-if="ruleDiagramData" class="diagram" v-html="ruleDiagramData"></div>
          
          <!-- 问答规则知识图谱 -->
          <div v-else-if="ruleType === 'qa'" class="qa-knowledge-graph">
            <h4>知识关联图谱</h4>
            <div class="graph-container">
              <div class="graph-node main-node">
                <div class="node-content">{{ rule.topic }}</div>
              </div>
              <div class="graph-connections">
                <template v-if="rule.keywords && rule.keywords.length > 0">
                  <div class="connection-group">
                    <div class="connection-label">关键词</div>
                    <div class="connection-nodes">
                      <div v-for="(keyword, index) in rule.keywords.slice(0, 5)" :key="`kw-${index}`" class="graph-node keyword-node">
                        <div class="node-content">{{ keyword }}</div>
                      </div>
                    </div>
                  </div>
                </template>
                
                <template v-if="rule.related_topics && rule.related_topics.length > 0">
                  <div class="connection-group">
                    <div class="connection-label">相关主题</div>
                    <div class="connection-nodes">
                      <div v-for="(topic, index) in rule.related_topics.slice(0, 3)" :key="`topic-${index}`" class="graph-node topic-node">
                        <div class="node-content">{{ topic }}</div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { marked } from 'marked';

export default {
  name: 'RuleDetails',
  
  props: {
    rule: {
      type: Object,
      required: true
    },
    ruleType: {
      type: String,
      required: true,
      validator: (value) => ['nlp', 'process', 'qa'].includes(value)
    }
  },
  
  setup(props) {
    const activeTab = ref('basic');
    const ruleDiagramData = ref(null);
    
    // 根据优先级返回对应的标签类型
    const getPriorityType = (priority) => {
      if (priority <= 1) return 'danger';
      if (priority <= 3) return 'warning';
      if (priority <= 5) return 'success';
      return 'info';
    };
    
    // 获取调度文本
    const getScheduleText = (schedule) => {
      if (!schedule) return '无';
      
      const { frequency, time, day } = schedule;
      let text = '';
      
      switch (frequency) {
        case 'daily':
          text = `每天 ${time}`;
          break;
        case 'weekly':
          text = `每周${getDayName(day)} ${time}`;
          break;
        case 'monthly':
          text = `每月${day}日 ${time}`;
          break;
        default:
          text = `${frequency} ${time}`;
      }
      
      return text;
    };
    
    // 获取星期几的中文名称
    const getDayName = (day) => {
      const dayMap = {
        'monday': '一',
        'tuesday': '二',
        'wednesday': '三',
        'thursday': '四',
        'friday': '五',
        'saturday': '六',
        'sunday': '日'
      };
      
      return dayMap[day.toLowerCase()] ? `${dayMap[day.toLowerCase()]}` : day;
    };
    
    // 获取问答规则分类标签类型
    const getQaCategoryType = (category) => {
      if (!category) return 'info';
      
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
    
    // 格式化日期
    const formatDate = (dateStr) => {
      if (!dateStr) return '未知';
      
      try {
        const date = new Date(dateStr);
        return date.toLocaleString();
      } catch (e) {
        return dateStr;
      }
    };
    
    // 渲染Markdown内容
    const renderMarkdown = (content) => {
      if (!content) return '';
      
      try {
        return marked(content);
      } catch (e) {
        console.error('Markdown渲染失败:', e);
        return content;
      }
    };
    
    // 生成流程规则的流程图数据
    const generateFlowDiagram = () => {
      if (props.ruleType !== 'process') return null;
      
      // 这里可以根据规则类型生成不同的流程图表示
      // 例如使用mermaid.js或其他图表库
      return null; // 暂时返回null
    };
    
    onMounted(() => {
      // 尝试生成流程图
      ruleDiagramData.value = generateFlowDiagram();
    });
    
    return {
      activeTab,
      ruleDiagramData,
      getPriorityType,
      getScheduleText,
      getQaCategoryType,
      formatDate,
      renderMarkdown
    };
  }
};
</script>

<style scoped>
.rule-details {
  padding: 10px;
}

.code-section {
  margin-bottom: 20px;
}

.code-section h4 {
  margin-bottom: 10px;
}

.code {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 14px;
}

.diagram-container {
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.diagram {
  width: 100%;
}

/* 问答规则相关样式 */
.keywords-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.keyword-tag {
  margin-right: 5px;
}

.qa-content {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  line-height: 1.6;
}

.example-list {
  padding-left: 20px;
}

.example-item {
  margin-bottom: 8px;
}

.related-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.related-topic-tag {
  margin-right: 5px;
}

/* 知识图谱样式 */
.qa-knowledge-graph {
  width: 100%;
}

.graph-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.graph-node {
  padding: 10px 16px;
  border-radius: 20px;
  margin: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.main-node {
  background-color: #409EFF;
  color: white;
  font-weight: bold;
  font-size: 16px;
}

.keyword-node {
  background-color: #67C23A;
  color: white;
}

.topic-node {
  background-color: #E6A23C;
  color: white;
}

.graph-connections {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 20px;
}

.connection-group {
  margin-bottom: 20px;
}

.connection-label {
  font-weight: bold;
  margin-bottom: 10px;
  color: #606266;
}

.connection-nodes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

/* Markdown预览样式 */
:deep(.markdown-preview) {
  font-size: 14px;
}

:deep(.markdown-preview h1),
:deep(.markdown-preview h2),
:deep(.markdown-preview h3) {
  margin-top: 1em;
  margin-bottom: 0.5em;
}

:deep(.markdown-preview p) {
  margin: 0.5em 0;
}

:deep(.markdown-preview ul),
:deep(.markdown-preview ol) {
  padding-left: 20px;
  margin: 0.5em 0;
}

:deep(.markdown-preview li) {
  margin: 0.3em 0;
}

:deep(.markdown-preview code) {
  background-color: #eee;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
}

:deep(.markdown-preview pre) {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}

:deep(.markdown-preview table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

:deep(.markdown-preview th),
:deep(.markdown-preview td) {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

:deep(.markdown-preview th) {
  background-color: #f2f2f2;
}
</style> 