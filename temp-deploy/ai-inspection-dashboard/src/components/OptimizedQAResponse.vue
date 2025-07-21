<template>
  <div class="optimized-qa-response">
    <!-- 响应类型标识 -->
    <div class="response-type-indicator" :class="responseTypeClass">
      <span class="type-icon">{{ responseTypeIcon }}</span>
      <span class="type-label">{{ responseTypeLabel }}</span>
    </div>

    <!-- 主要内容 -->
    <div class="response-main-content">
      <!-- 摘要信息 -->
      <div v-if="summary" class="response-summary">
        <h4>📊 查询摘要</h4>
        <p>{{ summary }}</p>
      </div>

      <!-- 结构化数据展示 -->
      <div v-if="structuredData.length > 0" class="structured-data">
        <div class="data-header">
          <h4>{{ dataTitle }}</h4>
          <span class="data-count">{{ structuredData.length }} 条记录</span>
        </div>
        
        <div class="data-grid">
          <div 
            v-for="(item, index) in structuredData" 
            :key="index"
            class="data-item"
            :class="getItemStatusClass(item)"
          >
            <div class="item-index">{{ index + 1 }}</div>
            <div class="item-content">
              <div class="item-title">{{ item.title || item.name || `项目 ${index + 1}` }}</div>
              <div class="item-details">
                <div 
                  v-for="(value, key) in item.details" 
                  :key="key"
                  class="detail-row"
                >
                  <span class="detail-label">{{ formatLabel(key) }}:</span>
                  <span class="detail-value" :class="getValueClass(key, value)">{{ formatValue(key, value) }}</span>
                </div>
              </div>
            </div>
            <div v-if="item.status" class="item-status" :class="item.status">
              {{ getStatusText(item.status) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 原始文本内容 */
      <div v-if="rawContent && !structuredData.length" class="raw-content">
        <div v-html="formattedContent"></div>
      </div>

      <!-- 操作建议 -->
      <div v-if="recommendations.length > 0" class="recommendations">
        <h4>💡 建议操作</h4>
        <div class="recommendation-list">
          <div 
            v-for="(rec, index) in recommendations" 
            :key="index"
            class="recommendation-item"
            :class="rec.priority"
          >
            <span class="rec-icon">{{ rec.icon }}</span>
            <div class="rec-content">
              <div class="rec-title">{{ rec.title }}</div>
              <div class="rec-description">{{ rec.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 相关链接 -->
      <div v-if="relatedActions.length > 0" class="related-actions">
        <h4>🔗 相关操作</h4>
        <div class="action-buttons">
          <button 
            v-for="action in relatedActions" 
            :key="action.id"
            @click="$emit('action-click', action)"
            class="action-btn"
            :class="action.type"
          >
            <span class="action-icon">{{ action.icon }}</span>
            {{ action.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- 响应元数据 -->
    <div class="response-metadata">
      <div class="metadata-item">
        <span class="metadata-label">数据源:</span>
        <span class="metadata-value">{{ dataSource }}</span>
      </div>
      <div class="metadata-item">
        <span class="metadata-label">查询时间:</span>
        <span class="metadata-value">{{ formatTime(timestamp) }}</span>
      </div>
      <div v-if="processingTime" class="metadata-item">
        <span class="metadata-label">处理时间:</span>
        <span class="metadata-value">{{ processingTime }}ms</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'general' // inventory, inspection, production, general
  },
  timestamp: {
    type: Date,
    default: () => new Date()
  },
  dataSource: {
    type: String,
    default: 'IQE系统'
  },
  processingTime: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['action-click'])

// 解析内容并提取结构化数据
const parsedContent = computed(() => {
  try {
    // 尝试解析HTML内容
    if (props.content.includes('<div class="query-results')) {
      return parseHTMLContent(props.content)
    }
    
    // 解析普通文本内容
    return parseTextContent(props.content)
  } catch (error) {
    console.error('内容解析错误:', error)
    return {
      summary: '',
      structuredData: [],
      rawContent: props.content,
      recommendations: [],
      relatedActions: []
    }
  }
})

const summary = computed(() => parsedContent.value.summary)
const structuredData = computed(() => parsedContent.value.structuredData)
const rawContent = computed(() => parsedContent.value.rawContent)
const recommendations = computed(() => parsedContent.value.recommendations)
const relatedActions = computed(() => parsedContent.value.relatedActions)

const responseTypeClass = computed(() => `type-${props.type}`)
const responseTypeIcon = computed(() => {
  const icons = {
    inventory: '📦',
    inspection: '🧪',
    production: '⚙️',
    general: '📋'
  }
  return icons[props.type] || '📋'
})

const responseTypeLabel = computed(() => {
  const labels = {
    inventory: '库存查询',
    inspection: '检测结果',
    production: '生产数据',
    general: '查询结果'
  }
  return labels[props.type] || '查询结果'
})

const dataTitle = computed(() => {
  const titles = {
    inventory: '📦 库存信息',
    inspection: '🧪 检测记录',
    production: '⚙️ 生产记录',
    general: '📋 查询结果'
  }
  return titles[props.type] || '📋 查询结果'
})

const formattedContent = computed(() => {
  if (!rawContent.value) return ''
  
  return rawContent.value
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
})

// 解析HTML内容
const parseHTMLContent = (htmlContent) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')
  
  const resultDiv = doc.querySelector('.query-results')
  if (!resultDiv) return { rawContent: htmlContent, structuredData: [], recommendations: [], relatedActions: [] }
  
  const items = resultDiv.querySelectorAll('.result-item')
  const structuredData = Array.from(items).map((item, index) => {
    const title = item.querySelector('.item-title')?.textContent || `项目 ${index + 1}`
    const details = extractDetailsFromHTML(item)
    
    return {
      title,
      details,
      status: detectStatus(details)
    }
  })
  
  return {
    summary: `找到 ${structuredData.length} 条相关记录`,
    structuredData,
    rawContent: '',
    recommendations: generateRecommendations(structuredData),
    relatedActions: generateRelatedActions(props.type)
  }
}

// 解析文本内容
const parseTextContent = (textContent) => {
  // 简单的文本解析逻辑
  const lines = textContent.split('\n').filter(line => line.trim())
  
  if (lines.length <= 3) {
    return {
      summary: '',
      structuredData: [],
      rawContent: textContent,
      recommendations: [],
      relatedActions: []
    }
  }
  
  return {
    summary: lines[0],
    structuredData: [],
    rawContent: textContent,
    recommendations: [],
    relatedActions: generateRelatedActions(props.type)
  }
}

// 从HTML中提取详细信息
const extractDetailsFromHTML = (itemElement) => {
  const details = {}
  const detailElements = itemElement.querySelectorAll('[class*="detail"], [class*="info"]')
  
  detailElements.forEach(el => {
    const text = el.textContent.trim()
    if (text.includes(':')) {
      const [key, value] = text.split(':').map(s => s.trim())
      details[key] = value
    }
  })
  
  return details
}

// 检测状态
const detectStatus = (details) => {
  const statusKeywords = {
    normal: ['正常', '合格', 'PASS'],
    warning: ['风险', '警告', '注意'],
    error: ['异常', '不合格', 'FAIL', '冻结']
  }
  
  const allValues = Object.values(details).join(' ').toLowerCase()
  
  for (const [status, keywords] of Object.entries(statusKeywords)) {
    if (keywords.some(keyword => allValues.includes(keyword.toLowerCase()))) {
      return status
    }
  }
  
  return 'normal'
}

// 生成建议
const generateRecommendations = (data) => {
  const recommendations = []
  
  const errorItems = data.filter(item => item.status === 'error')
  const warningItems = data.filter(item => item.status === 'warning')
  
  if (errorItems.length > 0) {
    recommendations.push({
      icon: '🚨',
      title: '紧急处理',
      description: `发现 ${errorItems.length} 个异常项目，需要立即处理`,
      priority: 'high'
    })
  }
  
  if (warningItems.length > 0) {
    recommendations.push({
      icon: '⚠️',
      title: '风险关注',
      description: `发现 ${warningItems.length} 个风险项目，建议重点关注`,
      priority: 'medium'
    })
  }
  
  return recommendations
}

// 生成相关操作
const generateRelatedActions = (type) => {
  const actions = {
    inventory: [
      { id: 'export', icon: '📊', label: '导出数据', type: 'primary' },
      { id: 'chart', icon: '📈', label: '生成图表', type: 'info' },
      { id: 'alert', icon: '🔔', label: '设置预警', type: 'warning' }
    ],
    inspection: [
      { id: 'report', icon: '📋', label: '生成报告', type: 'primary' },
      { id: 'trend', icon: '📈', label: '趋势分析', type: 'info' }
    ],
    production: [
      { id: 'optimize', icon: '⚡', label: '优化建议', type: 'success' },
      { id: 'monitor', icon: '👁️', label: '实时监控', type: 'info' }
    ]
  }
  
  return actions[type] || []
}

// 工具函数
const formatLabel = (key) => {
  const labelMap = {
    materialCode: '物料编码',
    materialName: '物料名称',
    supplier: '供应商',
    factory: '工厂',
    quantity: '数量',
    status: '状态',
    batchCode: '批次号'
  }
  return labelMap[key] || key
}

const formatValue = (key, value) => {
  if (key === 'quantity' && typeof value === 'number') {
    return value.toLocaleString()
  }
  return value
}

const getValueClass = (key, value) => {
  if (key === 'status') {
    if (value === '正常' || value === 'PASS') return 'status-normal'
    if (value === '风险' || value === 'WARNING') return 'status-warning'
    if (value === '异常' || value === 'FAIL') return 'status-error'
  }
  return ''
}

const getItemStatusClass = (item) => {
  return `status-${item.status || 'normal'}`
}

const getStatusText = (status) => {
  const statusMap = {
    normal: '正常',
    warning: '风险',
    error: '异常'
  }
  return statusMap[status] || status
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>

<style scoped>
.optimized-qa-response {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  margin: 16px 0;
}

.response-type-indicator {
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-inventory {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
}

.type-inspection {
  background: linear-gradient(135deg, #fa8c16 0%, #ffa940 100%);
}

.type-production {
  background: linear-gradient(135deg, #722ed1 0%, #9254de 100%);
}

.type-icon {
  font-size: 18px;
}

.type-label {
  font-weight: 600;
  font-size: 14px;
}

.response-main-content {
  padding: 20px;
}

.response-summary {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.response-summary h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 14px;
}

.response-summary p {
  margin: 0;
  color: #5a6c7d;
  font-size: 13px;
}

.structured-data {
  margin-bottom: 20px;
}

.data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
}

.data-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 16px;
}

.data-count {
  background: #409eff;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.data-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.data-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
  transition: all 0.2s;
}

.data-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.data-item.status-warning {
  border-left-color: #fa8c16;
  background: #fff7e6;
}

.data-item.status-error {
  border-left-color: #ff4d4f;
  background: #fff2f0;
}

.item-index {
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
  flex-shrink: 0;
}

.item-content {
  flex: 1;
}

.item-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 14px;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-row {
  display: flex;
  gap: 8px;
  font-size: 13px;
}

.detail-label {
  color: #8c8c8c;
  min-width: 80px;
  font-weight: 500;
}

.detail-value {
  color: #2c3e50;
}

.detail-value.status-normal {
  color: #52c41a;
  font-weight: 500;
}

.detail-value.status-warning {
  color: #fa8c16;
  font-weight: 500;
}

.detail-value.status-error {
  color: #ff4d4f;
  font-weight: 500;
}

.item-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
}

.item-status.normal {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.item-status.warning {
  background: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffd591;
}

.item-status.error {
  background: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffb3b3;
}

.raw-content {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  line-height: 1.6;
  color: #2c3e50;
}

.recommendations {
  margin-bottom: 20px;
}

.recommendations h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 14px;
}

.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recommendation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid #409eff;
}

.recommendation-item.high {
  background: #fff2f0;
  border-left-color: #ff4d4f;
}

.recommendation-item.medium {
  background: #fff7e6;
  border-left-color: #fa8c16;
}

.rec-icon {
  font-size: 16px;
}

.rec-content {
  flex: 1;
}

.rec-title {
  font-weight: 600;
  color: #2c3e50;
  font-size: 13px;
  margin-bottom: 2px;
}

.rec-description {
  color: #5a6c7d;
  font-size: 12px;
}

.related-actions {
  margin-bottom: 20px;
}

.related-actions h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: white;
  color: #2c3e50;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

.action-btn.primary {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.action-btn.success {
  background: #52c41a;
  color: white;
  border-color: #52c41a;
}

.action-btn.warning {
  background: #fa8c16;
  color: white;
  border-color: #fa8c16;
}

.action-btn.info {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.action-icon {
  font-size: 14px;
}

.response-metadata {
  padding: 12px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 20px;
  font-size: 12px;
}

.metadata-item {
  display: flex;
  gap: 4px;
}

.metadata-label {
  color: #8c8c8c;
}

.metadata-value {
  color: #2c3e50;
  font-weight: 500;
}
</style>
