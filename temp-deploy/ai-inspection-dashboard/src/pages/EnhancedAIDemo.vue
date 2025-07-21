<template>
  <div class="enhanced-ai-demo">
    <div class="demo-header">
      <h1>🚀 增强AI功能演示</h1>
      <p>体验集成了联网搜索、实时信息获取、数据分析等功能的智能AI助手</p>
    </div>

    <!-- 功能介绍 -->
    <div class="features-section">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="feature-card">
            <div class="feature-icon">🔍</div>
            <h3>网络搜索</h3>
            <p>实时搜索互联网信息，获取最新资讯和知识</p>
            <el-button @click="demoSearch" type="primary" size="small">
              演示搜索
            </el-button>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>数据分析</h3>
            <p>智能分析质量管理数据，提供深度洞察</p>
            <el-button @click="demoAnalysis" type="success" size="small">
              演示分析
            </el-button>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card class="feature-card">
            <div class="feature-icon">🧮</div>
            <h3>实用工具</h3>
            <p>数学计算、时间查询、格式转换等实用功能</p>
            <el-button @click="demoTools" type="warning" size="small">
              演示工具
            </el-button>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 快速测试区域 -->
    <div class="quick-test-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>⚡ 快速测试</span>
            <el-button @click="clearResults" size="small">清空结果</el-button>
          </div>
        </template>
        
        <div class="test-buttons">
          <el-button 
            v-for="test in quickTests" 
            :key="test.name"
            @click="runQuickTest(test)"
            :type="test.type"
            :loading="test.loading"
          >
            {{ test.name }}
          </el-button>
        </div>
        
        <div v-if="testResults.length > 0" class="test-results">
          <h4>📋 测试结果</h4>
          <div 
            v-for="(result, index) in testResults" 
            :key="index"
            class="test-result-item"
          >
            <div class="result-header">
              <strong>{{ result.test }}</strong>
              <el-tag :type="result.success ? 'success' : 'danger'" size="small">
                {{ result.success ? '成功' : '失败' }}
              </el-tag>
            </div>
            <div class="result-content">
              <pre>{{ JSON.stringify(result.data, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 交互式测试 -->
    <div class="interactive-section">
      <el-card>
        <template #header>
          <span>🎯 交互式测试</span>
        </template>
        
        <div class="interactive-form">
          <el-form :model="interactiveForm" label-width="120px">
            <el-form-item label="选择工具">
              <el-select v-model="interactiveForm.tool" placeholder="请选择工具">
                <el-option 
                  v-for="tool in availableTools" 
                  :key="tool.name"
                  :label="tool.label" 
                  :value="tool.name"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="参数设置">
              <el-input 
                v-model="interactiveForm.params"
                type="textarea"
                :rows="3"
                placeholder="请输入JSON格式的参数，例如: {&quot;query&quot;: &quot;搜索内容&quot;}"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button 
                @click="runInteractiveTest" 
                type="primary"
                :loading="interactiveLoading"
              >
                执行测试
              </el-button>
            </el-form-item>
          </el-form>
          
          <div v-if="interactiveResult" class="interactive-result">
            <h4>🎯 执行结果</h4>
            <el-alert 
              :type="interactiveResult.success ? 'success' : 'error'"
              :title="interactiveResult.success ? '执行成功' : '执行失败'"
              show-icon
            />
            <div class="result-detail">
              <pre>{{ JSON.stringify(interactiveResult.data, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElCard, ElRow, ElCol, ElButton, ElForm, ElFormItem, ElSelect, ElOption, ElInput, ElTag, ElAlert, ElMessage } from 'element-plus'

// 响应式数据
const testResults = ref([])
const interactiveResult = ref(null)
const interactiveLoading = ref(false)

const interactiveForm = ref({
  tool: '',
  params: ''
})

// 快速测试配置
const quickTests = ref([
  {
    name: '🔍 搜索测试',
    type: 'primary',
    loading: false,
    tool: 'web_search',
    params: { query: 'ISO 9001质量管理体系' }
  },
  {
    name: '⏰ 时间查询',
    type: 'success',
    loading: false,
    tool: 'get_time',
    params: {}
  },
  {
    name: '🧮 数学计算',
    type: 'warning',
    loading: false,
    tool: 'calculate',
    params: { expression: '25 * 4 + 10' }
  },
  {
    name: '📊 数据分析',
    type: 'info',
    loading: false,
    tool: 'analyze_data',
    params: { data_type: 'inventory' }
  }
])

// 可用工具
const availableTools = ref([
  { name: 'web_search', label: '🔍 网络搜索' },
  { name: 'get_time', label: '⏰ 获取时间' },
  { name: 'calculate', label: '🧮 数学计算' },
  { name: 'analyze_data', label: '📊 数据分析' },
  { name: 'format_data', label: '📋 数据格式化' }
])

// 演示功能
const demoSearch = () => {
  ElMessage.info('演示搜索功能：尝试搜索"质量管理最佳实践"')
  runQuickTest(quickTests.value[0])
}

const demoAnalysis = () => {
  ElMessage.info('演示数据分析功能：分析当前库存数据')
  runQuickTest(quickTests.value[3])
}

const demoTools = () => {
  ElMessage.info('演示工具功能：计算数学表达式')
  runQuickTest(quickTests.value[2])
}

// 运行快速测试
const runQuickTest = async (test) => {
  try {
    test.loading = true
    
    // 动态导入工具服务
    const { toolService } = await import('../utils/toolService.js')
    
    console.log(`🧪 运行测试: ${test.name}`)
    const result = await toolService.executeTool(test.tool, test.params)
    
    testResults.value.unshift({
      test: test.name,
      tool: test.tool,
      success: result.success,
      data: result,
      timestamp: new Date().toLocaleTimeString()
    })
    
    ElMessage.success(`${test.name} 执行成功`)
    
  } catch (error) {
    console.error(`❌ 测试失败:`, error)
    
    testResults.value.unshift({
      test: test.name,
      tool: test.tool,
      success: false,
      data: { error: error.message },
      timestamp: new Date().toLocaleTimeString()
    })
    
    ElMessage.error(`${test.name} 执行失败: ${error.message}`)
  } finally {
    test.loading = false
  }
}

// 运行交互式测试
const runInteractiveTest = async () => {
  if (!interactiveForm.value.tool) {
    ElMessage.warning('请选择要测试的工具')
    return
  }
  
  try {
    interactiveLoading.value = true
    
    // 解析参数
    let params = {}
    if (interactiveForm.value.params.trim()) {
      try {
        params = JSON.parse(interactiveForm.value.params)
      } catch (error) {
        throw new Error('参数格式错误，请使用有效的JSON格式')
      }
    }
    
    // 动态导入工具服务
    const { toolService } = await import('../utils/toolService.js')
    
    console.log(`🎯 交互式测试: ${interactiveForm.value.tool}`, params)
    const result = await toolService.executeTool(interactiveForm.value.tool, params)
    
    interactiveResult.value = {
      success: result.success,
      data: result
    }
    
    ElMessage.success('交互式测试执行成功')
    
  } catch (error) {
    console.error('❌ 交互式测试失败:', error)
    
    interactiveResult.value = {
      success: false,
      data: { error: error.message }
    }
    
    ElMessage.error(`交互式测试失败: ${error.message}`)
  } finally {
    interactiveLoading.value = false
  }
}

// 清空结果
const clearResults = () => {
  testResults.value = []
  interactiveResult.value = null
  ElMessage.info('结果已清空')
}

// 页面加载时
onMounted(() => {
  console.log('🚀 增强AI功能演示页面已加载')
})
</script>

<style scoped>
.enhanced-ai-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.demo-header {
  text-align: center;
  margin-bottom: 30px;
}

.demo-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.demo-header p {
  color: #7f8c8d;
  font-size: 16px;
}

.features-section {
  margin-bottom: 30px;
}

.feature-card {
  text-align: center;
  height: 200px;
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.feature-card h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.feature-card p {
  color: #7f8c8d;
  margin-bottom: 15px;
  line-height: 1.5;
}

.quick-test-section, .interactive-section {
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.test-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.test-results {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.test-result-item {
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.result-content {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.result-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.interactive-form {
  max-width: 600px;
}

.interactive-result {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.result-detail {
  margin-top: 10px;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  max-height: 300px;
  overflow-y: auto;
}

.result-detail pre {
  margin: 0;
  font-size: 12px;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
