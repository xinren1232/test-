<template>
  <div class="rule-library-simple">
    <h1>规则库管理 - 简化版</h1>
    
    <div class="loading-section" v-if="loading">
      <el-loading-directive v-loading="loading" text="正在加载规则...">
        <div style="height: 200px;"></div>
      </el-loading-directive>
    </div>
    
    <div v-else class="content-section">
      <div class="stats">
        <p>总规则数: {{ rules.length }}</p>
        <el-button @click="loadRules" :loading="loading">刷新规则</el-button>
        <el-button @click="testApi">测试API</el-button>
      </div>
      
      <div class="rules-list">
        <h2>规则列表</h2>
        <el-table :data="rules" border style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="intent_name" label="规则名称" min-width="200" />
          <el-table-column prop="description" label="描述" min-width="300" />
          <el-table-column prop="action_type" label="类型" width="120" />
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button size="small" @click="testRule(row)" :loading="row.testing">
                测试
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <div v-if="apiTestResult" class="api-test-result">
        <h3>API测试结果:</h3>
        <pre>{{ JSON.stringify(apiTestResult, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

const loading = ref(false);
const rules = ref([]);
const apiTestResult = ref(null);

const loadRules = async () => {
  loading.value = true;
  try {
    console.log('开始加载规则...');
    // 使用完整URL避免代理问题
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    const fullURL = `${baseURL}/api/rules`;
    console.log('请求URL:', fullURL);

    const response = await fetch(fullURL);
    console.log('API响应状态:', response.status);

    if (response.ok) {
      const result = await response.json();
      console.log('API响应数据:', result);

      // 统一处理数据格式：使用 result.data 而不是 result.rules
      if (result.success && Array.isArray(result.data)) {
        rules.value = result.data.map(rule => ({
          ...rule,
          testing: false
        }));
        ElMessage.success(`成功加载 ${rules.value.length} 条规则`);
      } else {
        throw new Error('API返回数据格式错误');
      }
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('加载规则失败:', error);
    ElMessage.error('加载规则失败: ' + error.message);

    // 使用备用数据
    rules.value = [
      {
        id: 1,
        intent_name: '备用测试规则',
        description: '这是备用规则，API连接失败时显示',
        action_type: 'SQL_QUERY',
        testing: false
      }
    ];
  } finally {
    loading.value = false;
  }
};

const testApi = async () => {
  try {
    console.log('测试API连接...');
    // 使用完整URL避免代理问题
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    const fullURL = `${baseURL}/api/rules`;
    console.log('测试URL:', fullURL);

    const response = await fetch(fullURL);
    const result = await response.json();
    apiTestResult.value = {
      status: response.status,
      ok: response.ok,
      data: result
    };
    ElMessage.success('API测试成功');
  } catch (error) {
    console.error('API测试失败:', error);
    apiTestResult.value = {
      error: error.message
    };
    ElMessage.error('API测试失败: ' + error.message);
  }
};

const testRule = async (rule) => {
  rule.testing = true;
  try {
    const response = await fetch('/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `测试规则: ${rule.intent_name}`,
        useRealData: true,
        testMode: true
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      ElMessage.success(`规则 "${rule.intent_name}" 测试成功`);
      console.log('规则测试结果:', result);
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('规则测试失败:', error);
    ElMessage.error(`规则测试失败: ${error.message}`);
  } finally {
    rule.testing = false;
  }
};

onMounted(() => {
  console.log('简化版规则库页面已挂载');
  loadRules();
});
</script>

<style scoped>
.rule-library-simple {
  padding: 20px;
}

.loading-section {
  margin: 50px 0;
}

.stats {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.stats p {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: bold;
}

.rules-list {
  margin-bottom: 20px;
}

.api-test-result {
  margin-top: 20px;
  padding: 15px;
  background-color: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
}

.api-test-result pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 300px;
  overflow-y: auto;
}
</style>
