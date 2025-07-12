<template>
  <div class="test-real-data-page">
    <div class="page-header">
      <h1>🧪 真实数据显示测试</h1>
      <p>测试前端是否能正确显示后端返回的真实数据</p>
    </div>

    <div class="test-section">
      <div class="test-controls">
        <el-button type="primary" @click="testRealData" :loading="loading">
          <el-icon><Search /></el-icon>
          测试真实数据
        </el-button>
        <el-button type="success" @click="testMockData">
          <el-icon><Document /></el-icon>
          测试模拟数据
        </el-button>
      </div>

      <div v-if="testResult" class="test-result">
        <div class="result-header">
          <h3>📊 测试结果</h3>
          <el-tag :type="testResult.success ? 'success' : 'danger'">
            {{ testResult.success ? '成功' : '失败' }}
          </el-tag>
        </div>

        <div class="result-info">
          <p><strong>数据源:</strong> {{ testResult.source }}</p>
          <p><strong>记录数:</strong> {{ testResult.count }}</p>
          <p><strong>响应时间:</strong> {{ testResult.responseTime }}ms</p>
        </div>

        <!-- 关键指标 -->
        <div v-if="testResult.keyMetrics && testResult.keyMetrics.length > 0" class="key-metrics">
          <h4>📈 关键指标</h4>
          <div class="metrics-grid">
            <div v-for="metric in testResult.keyMetrics" :key="metric.label" class="metric-card">
              <div class="metric-label">{{ metric.label }}</div>
              <div class="metric-value">{{ metric.value }}</div>
              <div class="metric-trend" :class="metric.trend">
                {{ metric.trend === 'up' ? '📈' : metric.trend === 'down' ? '📉' : '➡️' }}
              </div>
            </div>
          </div>
        </div>

        <!-- 数据表格 -->
        <div v-if="testResult.tableData && testResult.tableData.length > 0" class="data-table-section">
          <h4>📋 数据表格</h4>
          <el-table
            :data="testResult.tableData"
            style="width: 100%"
            stripe
            border
            size="small"
            max-height="400"
            :header-cell-style="{ background: '#f8fafc', color: '#374151', fontWeight: '600' }"
          >
            <el-table-column
              v-for="(value, key) in (testResult.tableData[0] || {})"
              :key="key"
              :prop="key"
              :label="key"
              show-overflow-tooltip
            >
              <template #default="scope">
                <span :class="getCellClass(key, scope.row[key])">
                  {{ scope.row[key] }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 原始响应数据 -->
        <div class="raw-response">
          <h4>🔍 原始响应数据</h4>
          <el-collapse>
            <el-collapse-item title="查看原始JSON数据" name="raw">
              <pre>{{ JSON.stringify(testResult.rawResponse, null, 2) }}</pre>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Document } from '@element-plus/icons-vue'

const loading = ref(false)
const testResult = ref(null)

// 测试真实数据
const testRealData = async () => {
  loading.value = true
  const startTime = Date.now()
  
  try {
    console.log('🧪 开始测试真实数据...')
    
    const response = await fetch('/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '深圳工厂的库存情况'
      })
    })
    
    const responseTime = Date.now() - startTime
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const result = await response.json()
    console.log('✅ 真实数据测试成功:', result)
    
    testResult.value = {
      success: true,
      source: result.source || 'API',
      count: result.data?.tableData?.length || 0,
      responseTime,
      keyMetrics: result.data?.keyMetrics || [],
      tableData: result.data?.tableData || [],
      rawResponse: result
    }
    
    ElMessage.success(`真实数据测试成功，获取到 ${testResult.value.count} 条记录`)
    
  } catch (error) {
    console.error('❌ 真实数据测试失败:', error)
    
    testResult.value = {
      success: false,
      source: 'Error',
      count: 0,
      responseTime: Date.now() - startTime,
      error: error.message,
      rawResponse: { error: error.message }
    }
    
    ElMessage.error(`真实数据测试失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

// 测试模拟数据
const testMockData = () => {
  console.log('🎭 生成模拟数据测试...')
  
  const mockData = {
    success: true,
    data: {
      answer: '根据您的查询"深圳工厂的库存情况"，找到了 5 条相关记录。',
      tableData: [
        { 工厂: '深圳工厂', 物料编码: 'SPK-瑞6984', 物料名称: '喇叭', 供应商: '瑞声', 数量: 137, 状态: '正常', 入库时间: '2025-07-10' },
        { 工厂: '深圳工厂', 物料编码: 'BOX-富5172', 物料名称: '包装盒', 供应商: '富群', 数量: 1024, 状态: '正常', 入库时间: '2025-07-10' },
        { 工厂: '深圳工厂', 物料编码: 'DEC-欣7269', 物料名称: '装饰件', 供应商: '欣冠', 数量: 319, 状态: '正常', 入库时间: '2025-07-10' },
        { 工厂: '深圳工厂', 物料编码: 'CHG-理8507', 物料名称: '充电器', 供应商: '理威', 数量: 962, 状态: '正常', 入库时间: '2025-07-10' },
        { 工厂: '深圳工厂', 物料编码: 'DS-L-B4188', 物料名称: 'LCD显示屏', 供应商: 'BOE', 数量: 476, 状态: '风险', 入库时间: '2025-07-10' }
      ],
      keyMetrics: [
        { label: '总记录数', value: 5, trend: 'stable' },
        { label: '正常状态', value: 4, trend: 'up' },
        { label: '风险状态', value: 1, trend: 'down' }
      ]
    },
    source: 'mock'
  }
  
  testResult.value = {
    success: true,
    source: 'Mock Data',
    count: mockData.data.tableData.length,
    responseTime: 50,
    keyMetrics: mockData.data.keyMetrics,
    tableData: mockData.data.tableData,
    rawResponse: mockData
  }
  
  ElMessage.success(`模拟数据测试成功，生成 ${testResult.value.count} 条记录`)
}

// 获取单元格样式
const getCellClass = (key, value) => {
  if (key === '状态') {
    return value === '正常' ? 'status-normal' : value === '风险' ? 'status-risk' : ''
  }
  return ''
}
</script>

<style scoped>
.test-real-data-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.page-header p {
  color: #7f8c8d;
  font-size: 16px;
}

.test-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.test-controls {
  text-align: center;
  margin-bottom: 30px;
}

.test-controls .el-button {
  margin: 0 10px;
}

.test-result {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.result-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.result-info p {
  margin: 5px 0;
}

.key-metrics {
  margin-bottom: 20px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 10px;
}

.metric-card {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  text-align: center;
  border: 1px solid #e9ecef;
}

.metric-label {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 5px;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.metric-trend {
  font-size: 16px;
}

.data-table-section {
  margin-bottom: 20px;
}

.raw-response {
  margin-top: 20px;
}

.raw-response pre {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 12px;
  max-height: 300px;
}

.status-normal {
  color: #28a745;
  font-weight: bold;
}

.status-risk {
  color: #dc3545;
  font-weight: bold;
}
</style>
