<template>
  <div class="rule-library-debug">
    <div class="page-header">
      <h1>🔍 规则库调试页面</h1>
      <p>用于诊断规则库页面的问题</p>
    </div>

    <!-- 调试信息 -->
    <el-card class="debug-card">
      <template #header>
        <span>调试信息</span>
      </template>
      
      <div class="debug-info">
        <p><strong>API状态:</strong> {{ apiStatus }}</p>
        <p><strong>规则数量:</strong> {{ rules.length }}</p>
        <p><strong>加载状态:</strong> {{ loading ? '加载中' : '已完成' }}</p>
        <p><strong>错误信息:</strong> {{ errorMessage || '无' }}</p>
      </div>

      <el-button @click="testApiConnection" :loading="testing">测试API连接</el-button>
      <el-button @click="loadRules" :loading="loading">重新加载规则</el-button>
    </el-card>

    <!-- 规则列表 -->
    <el-card class="rules-card" v-loading="loading">
      <template #header>
        <span>规则列表 ({{ rules.length }}条)</span>
      </template>

      <el-table :data="rules.slice(0, 20)" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="intent_name" label="规则名称" min-width="200" />
        <el-table-column prop="description" label="描述" min-width="250" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
              {{ row.status === 'active' ? '活跃' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="testRule(row)" :loading="row.testing">
              测试
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="rules.length > 20" class="more-info">
        <p>显示前20条规则，总共{{ rules.length }}条</p>
      </div>
    </el-card>

    <!-- 测试结果 -->
    <el-card class="test-result-card" v-if="testResult">
      <template #header>
        <span>测试结果</span>
      </template>
      
      <pre>{{ JSON.stringify(testResult, null, 2) }}</pre>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

// 响应式数据
const rules = ref([]);
const loading = ref(false);
const testing = ref(false);
const apiStatus = ref('未知');
const errorMessage = ref('');
const testResult = ref(null);

// 测试API连接
const testApiConnection = async () => {
  testing.value = true;
  try {
    const response = await fetch('http://localhost:3001/api/rules');
    const data = await response.json();
    
    if (response.ok && data.success) {
      apiStatus.value = '正常';
      ElMessage.success('API连接正常');
    } else {
      apiStatus.value = '异常';
      errorMessage.value = data.message || '未知错误';
      ElMessage.error('API连接异常: ' + errorMessage.value);
    }
  } catch (error) {
    apiStatus.value = '连接失败';
    errorMessage.value = error.message;
    ElMessage.error('API连接失败: ' + error.message);
  } finally {
    testing.value = false;
  }
};

// 加载规则
const loadRules = async () => {
  loading.value = true;
  errorMessage.value = '';
  
  try {
    console.log('开始加载规则...');
    
    const response = await fetch('http://localhost:3001/api/rules');
    const data = await response.json();
    
    console.log('API响应:', data);
    
    if (response.ok && data.success) {
      rules.value = data.data || [];
      apiStatus.value = '正常';
      ElMessage.success(`成功加载 ${rules.value.length} 条规则`);
    } else {
      throw new Error(data.message || '获取规则失败');
    }
    
  } catch (error) {
    console.error('加载规则失败:', error);
    errorMessage.value = error.message;
    apiStatus.value = '异常';
    ElMessage.error('加载规则失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// 测试单个规则
const testRule = async (rule) => {
  rule.testing = true;
  
  try {
    const response = await fetch(`http://localhost:3001/api/rules/test/${rule.id}`, {
      method: 'POST'
    });
    const data = await response.json();
    
    testResult.value = {
      ruleName: rule.intent_name,
      ...data
    };
    
    if (data.success) {
      ElMessage.success(`规则测试成功: 返回${data.data.resultCount}条数据`);
    } else {
      ElMessage.warning(`规则测试失败: ${data.data?.error || '未知错误'}`);
    }
    
  } catch (error) {
    testResult.value = {
      ruleName: rule.intent_name,
      error: error.message
    };
    ElMessage.error('测试失败: ' + error.message);
  } finally {
    rule.testing = false;
  }
};

// 页面加载时自动测试
onMounted(() => {
  testApiConnection();
  loadRules();
});
</script>

<style scoped>
.rule-library-debug {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.debug-card,
.rules-card,
.test-result-card {
  margin-bottom: 20px;
}

.debug-info p {
  margin: 8px 0;
}

.more-info {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
