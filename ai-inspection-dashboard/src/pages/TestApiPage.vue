<template>
  <div class="test-api-page">
    <h2>API测试页面</h2>
    
    <div class="test-section">
      <h3>1. 测试规则获取API</h3>
      <el-button @click="testRulesAPI" type="primary">测试获取规则</el-button>
      <div v-if="rulesResult" class="result-box">
        <h4>规则API结果:</h4>
        <pre>{{ JSON.stringify(rulesResult, null, 2) }}</pre>
      </div>
    </div>
    
    <div class="test-section">
      <h3>2. 测试查询API</h3>
      <el-input v-model="testQuery" placeholder="输入测试查询" style="width: 300px; margin-right: 10px;"></el-input>
      <el-button @click="testQueryAPI" type="primary">测试查询</el-button>
      <div v-if="queryResult" class="result-box">
        <h4>查询API结果:</h4>
        <pre>{{ JSON.stringify(queryResult, null, 2) }}</pre>
      </div>
    </div>
    
    <div class="test-section">
      <h3>3. 网络状态</h3>
      <p>当前时间: {{ currentTime }}</p>
      <p>API基础URL: {{ apiBaseUrl }}</p>
      <p>使用真实API: {{ useRealAPI }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElButton, ElInput, ElMessage } from 'element-plus'

const rulesResult = ref(null)
const queryResult = ref(null)
const testQuery = ref('统计PASS和FAIL的测试结果')
const currentTime = ref('')
const apiBaseUrl = ref('')
const useRealAPI = ref('')

onMounted(() => {
  currentTime.value = new Date().toLocaleString()
  apiBaseUrl.value = import.meta.env.VITE_API_BASE_URL || '/api'
  useRealAPI.value = import.meta.env.VITE_USE_REAL_API || 'false'
})

const testRulesAPI = async () => {
  try {
    console.log('🧪 测试规则API...')

    const response = await fetch('/api/rules', {  // 统一使用 /api/rules
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    console.log('📡 规则API响应状态:', response.status)

    if (response.ok) {
      const result = await response.json()
      console.log('📊 规则API结果:', result)
      rulesResult.value = result
      // 统一处理数据格式：使用 result.data
      ElMessage.success(`获取到 ${result.data?.length || 0} 个规则`)
    } else {
      const errorText = await response.text()
      console.error('❌ 规则API错误:', errorText)
      rulesResult.value = { error: `HTTP ${response.status}: ${errorText}` }
      ElMessage.error(`规则API错误: ${response.status}`)
    }
  } catch (error) {
    console.error('❌ 规则API异常:', error)
    rulesResult.value = { error: error.message }
    ElMessage.error(`规则API异常: ${error.message}`)
  }
}

const testQueryAPI = async () => {
  try {
    console.log('🧪 测试查询API...', testQuery.value)
    
    const response = await fetch('/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: testQuery.value
      })
    })
    
    console.log('📡 查询API响应状态:', response.status)
    
    if (response.ok) {
      const result = await response.json()
      console.log('📊 查询API结果:', result)
      queryResult.value = result
      
      const dataCount = Array.isArray(result.data) ? result.data.length : 0
      ElMessage.success(`查询成功，返回 ${dataCount} 条数据`)
    } else {
      const errorText = await response.text()
      console.error('❌ 查询API错误:', errorText)
      queryResult.value = { error: `HTTP ${response.status}: ${errorText}` }
      ElMessage.error(`查询API错误: ${response.status}`)
    }
  } catch (error) {
    console.error('❌ 查询API异常:', error)
    queryResult.value = { error: error.message }
    ElMessage.error(`查询API异常: ${error.message}`)
  }
}
</script>

<style scoped>
.test-api-page {
  padding: 20px;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.result-box {
  margin-top: 15px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
