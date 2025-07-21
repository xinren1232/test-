<template>
  <div class="api-test-page">
    <h1>API连接测试</h1>
    
    <div class="test-section">
      <h2>规则API测试</h2>
      <el-button @click="testRulesApi" :loading="loading">测试规则API</el-button>
      <div v-if="rulesResult" class="result">
        <h3>结果:</h3>
        <pre>{{ JSON.stringify(rulesResult, null, 2) }}</pre>
      </div>
      <div v-if="rulesError" class="error">
        <h3>错误:</h3>
        <pre>{{ rulesError }}</pre>
      </div>
    </div>

    <div class="test-section">
      <h2>查询API测试</h2>
      <el-button @click="testQueryApi" :loading="queryLoading">测试查询API</el-button>
      <div v-if="queryResult" class="result">
        <h3>结果:</h3>
        <pre>{{ JSON.stringify(queryResult, null, 2) }}</pre>
      </div>
      <div v-if="queryError" class="error">
        <h3>错误:</h3>
        <pre>{{ queryError }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const loading = ref(false);
const rulesResult = ref(null);
const rulesError = ref(null);

const queryLoading = ref(false);
const queryResult = ref(null);
const queryError = ref(null);

const testRulesApi = async () => {
  loading.value = true;
  rulesResult.value = null;
  rulesError.value = null;
  
  try {
    console.log('测试规则API...');
    const response = await fetch('/api/assistant/rules');
    console.log('响应状态:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      rulesResult.value = data;
      console.log('规则API测试成功:', data);
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('规则API测试失败:', error);
    rulesError.value = error.message;
  } finally {
    loading.value = false;
  }
};

const testQueryApi = async () => {
  queryLoading.value = true;
  queryResult.value = null;
  queryError.value = null;
  
  try {
    console.log('测试查询API...');
    const response = await fetch('/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '测试查询',
        useRealData: true,
        testMode: true
      })
    });
    console.log('响应状态:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      queryResult.value = data;
      console.log('查询API测试成功:', data);
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('查询API测试失败:', error);
    queryError.value = error.message;
  } finally {
    queryLoading.value = false;
  }
};
</script>

<style scoped>
.api-test-page {
  padding: 20px;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.result {
  margin-top: 15px;
  padding: 10px;
  background-color: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 4px;
}

.error {
  margin-top: 15px;
  padding: 10px;
  background-color: #fef2f2;
  border: 1px solid #ef4444;
  border-radius: 4px;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 300px;
  overflow-y: auto;
}
</style>
