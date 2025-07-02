<template>
  <div class="rules-inspection-container">
    <el-card class="rules-card" shadow="never">
      <template #header>
        <div class="card-header">
          <h2>📋 基础问答规则检查</h2>
          <p>当前系统中所有活跃的NLP规则列表，请逐一检查是否符合实际数据结构</p>
          <div class="header-actions">
            <el-button @click="refreshRules" :loading="loading">
              <el-icon><Refresh /></el-icon>
              刷新规则
            </el-button>
            <el-button type="primary" @click="testAllRules" :loading="testing">
              <el-icon><Operation /></el-icon>
              测试所有规则
            </el-button>
          </div>
        </div>
      </template>

      <div class="rules-content">
        <!-- 规则统计 -->
        <div class="rules-stats">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-number">{{ rules.length }}</div>
                <div class="stat-label">总规则数</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-number">{{ activeRules }}</div>
                <div class="stat-label">活跃规则</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-number">{{ testedRules }}</div>
                <div class="stat-label">已测试</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-number">{{ workingRules }}</div>
                <div class="stat-label">正常工作</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 规则列表 -->
        <div class="rules-list">
          <div 
            v-for="(rule, index) in rules" 
            :key="rule.id || index"
            class="rule-item"
            :class="{ 'tested': rule.tested, 'working': rule.working, 'error': rule.error }"
          >
            <div class="rule-header">
              <div class="rule-title">
                <span class="rule-number">{{ index + 1 }}</span>
                <h3>{{ rule.intent_name }}</h3>
                <el-tag :type="rule.status === 'active' ? 'success' : 'danger'" size="small">
                  {{ rule.status }}
                </el-tag>
              </div>
              <div class="rule-actions">
                <el-button 
                  size="small" 
                  @click="testRule(rule, index)"
                  :loading="rule.testing"
                >
                  <el-icon><Operation /></el-icon>
                  测试
                </el-button>
                <el-button 
                  size="small" 
                  type="primary" 
                  @click="editRule(rule)"
                >
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
              </div>
            </div>

            <div class="rule-content">
              <div class="rule-description">
                <strong>描述：</strong>{{ rule.description || '无描述' }}
              </div>
              
              <div class="rule-details">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <div class="detail-item">
                      <strong>动作类型：</strong>
                      <el-tag size="small">{{ rule.action_type }}</el-tag>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="detail-item">
                      <strong>示例查询：</strong>
                      <span class="example-query">{{ rule.example_query || '无示例' }}</span>
                    </div>
                  </el-col>
                </el-row>
              </div>

              <div class="rule-sql">
                <strong>SQL模板：</strong>
                <div class="sql-content">
                  <pre>{{ rule.action_target }}</pre>
                </div>
              </div>

              <div class="rule-parameters" v-if="rule.parameters">
                <strong>参数定义：</strong>
                <div class="parameters-content">
                  <pre>{{ formatParameters(rule.parameters) }}</pre>
                </div>
              </div>

              <!-- 测试结果 -->
              <div v-if="rule.tested" class="test-result">
                <div class="result-header">
                  <strong>测试结果：</strong>
                  <el-tag :type="rule.working ? 'success' : 'danger'" size="small">
                    {{ rule.working ? '✅ 正常' : '❌ 异常' }}
                  </el-tag>
                </div>
                <div v-if="rule.testOutput" class="result-content">
                  <pre>{{ rule.testOutput }}</pre>
                </div>
                <div v-if="rule.error" class="error-content">
                  <strong>错误信息：</strong>
                  <pre class="error-text">{{ rule.error }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="rules.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>暂无规则</h3>
          <p>系统中还没有配置任何NLP规则</p>
          <el-button type="primary" @click="refreshRules">
            <el-icon><Refresh /></el-icon>
            重新加载
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElCard, ElButton, ElTag, ElRow, ElCol, ElIcon } from 'element-plus';
import { Refresh, Operation, Edit } from '@element-plus/icons-vue';

const rules = ref([]);
const loading = ref(false);
const testing = ref(false);

const activeRules = computed(() => rules.value.filter(r => r.status === 'active').length);
const testedRules = computed(() => rules.value.filter(r => r.tested).length);
const workingRules = computed(() => rules.value.filter(r => r.working).length);

const refreshRules = async () => {
  loading.value = true;
  try {
    const response = await fetch('http://localhost:3002/api/assistant/rules');
    if (response.ok) {
      const data = await response.json();
      rules.value = data.rules || [];
    } else {
      console.error('获取规则失败');
    }
  } catch (error) {
    console.error('获取规则错误:', error);
  } finally {
    loading.value = false;
  }
};

const testRule = async (rule, index) => {
  rule.testing = true;
  rule.tested = false;
  rule.working = false;
  rule.error = null;
  rule.testOutput = null;

  try {
    // 使用示例查询测试规则
    const testQuery = rule.example_query || `测试${rule.intent_name}`;
    
    const response = await fetch('http://localhost:3002/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: testQuery })
    });

    if (response.ok) {
      const result = await response.json();
      rule.tested = true;
      rule.working = result.success !== false;
      rule.testOutput = JSON.stringify(result, null, 2);
    } else {
      rule.tested = true;
      rule.working = false;
      rule.error = `HTTP ${response.status}: ${response.statusText}`;
    }
  } catch (error) {
    rule.tested = true;
    rule.working = false;
    rule.error = error.message;
  } finally {
    rule.testing = false;
  }
};

const testAllRules = async () => {
  testing.value = true;
  for (let i = 0; i < rules.value.length; i++) {
    await testRule(rules.value[i], i);
    // 添加小延迟避免过快请求
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  testing.value = false;
};

const editRule = (rule) => {
  // TODO: 实现规则编辑功能
  console.log('编辑规则:', rule);
};

const formatParameters = (params) => {
  try {
    if (typeof params === 'string') {
      return JSON.stringify(JSON.parse(params), null, 2);
    }
    return JSON.stringify(params, null, 2);
  } catch (e) {
    return params;
  }
};

onMounted(() => {
  refreshRules();
});
</script>

<style scoped>
.rules-inspection-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.rules-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-header h2 {
  margin: 0;
  color: #2c3e50;
}

.card-header p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.rules-stats {
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rule-item {
  background: white;
  border-radius: 12px;
  border: 2px solid #e4e7ed;
  padding: 20px;
  transition: all 0.3s ease;
}

.rule-item.tested {
  border-color: #409eff;
}

.rule-item.working {
  border-color: #67c23a;
  background: #f0f9ff;
}

.rule-item.error {
  border-color: #f56c6c;
  background: #fef0f0;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.rule-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rule-number {
  background: #409eff;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.rule-title h3 {
  margin: 0;
  color: #2c3e50;
}

.rule-actions {
  display: flex;
  gap: 8px;
}

.rule-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-description {
  color: #606266;
  line-height: 1.6;
}

.detail-item {
  color: #606266;
  font-size: 14px;
}

.example-query {
  font-style: italic;
  color: #909399;
}

.sql-content, .parameters-content {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
  border-left: 4px solid #409eff;
}

.sql-content pre, .parameters-content pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #2c3e50;
  white-space: pre-wrap;
  word-break: break-all;
}

.test-result {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-top: 12px;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.result-content pre {
  background: #ffffff;
  border-radius: 6px;
  padding: 12px;
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #2c3e50;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}

.error-content {
  margin-top: 12px;
}

.error-text {
  background: #fef0f0;
  border: 1px solid #f56c6c;
  border-radius: 6px;
  padding: 12px;
  margin: 8px 0 0 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #f56c6c;
  white-space: pre-wrap;
  word-break: break-all;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #606266;
}

.empty-state p {
  margin: 0 0 24px 0;
}
</style>
