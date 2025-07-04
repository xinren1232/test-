<template>
  <div class="enhanced-response-renderer">
    <!-- 空结果 -->
    <div v-if="data.type === 'empty_result'" class="empty-result">
      <div class="empty-icon">📭</div>
      <div class="empty-message">{{ data.message }}</div>
      <div v-if="data.suggestions" class="suggestions">
        <div class="suggestion-title">建议：</div>
        <ul>
          <li v-for="suggestion in data.suggestions" :key="suggestion">{{ suggestion }}</li>
        </ul>
      </div>
    </div>

    <!-- 库存查询结果 -->
    <div v-else-if="data.type === 'inventory_query'" class="inventory-response">
      <div class="response-header">
        <h3>{{ data.title }}</h3>
        <div class="timestamp">{{ formatTime(data.timestamp) }}</div>
      </div>

      <!-- 汇总信息 -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="card-icon">📦</div>
          <div class="card-content">
            <div class="card-value">{{ data.summary.totalBatches }}</div>
            <div class="card-label">批次总数</div>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon">📊</div>
          <div class="card-content">
            <div class="card-value">{{ data.summary.totalQuantity }}</div>
            <div class="card-label">总数量</div>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon">🏭</div>
          <div class="card-content">
            <div class="card-value">{{ data.summary.materialTypes }}</div>
            <div class="card-label">物料种类</div>
          </div>
        </div>
        <div class="summary-card" :class="{ 'risk': data.summary.riskItems > 0 }">
          <div class="card-icon">⚠️</div>
          <div class="card-content">
            <div class="card-value">{{ data.summary.riskItems }}</div>
            <div class="card-label">风险项目</div>
          </div>
        </div>
      </div>

      <!-- 图表区域 - 使用增强图表组件 -->
      <div v-if="data.charts" class="charts-section">
        <div class="chart-container" v-for="(chart, key) in data.charts" :key="key">
          <EnhancedChartRenderer
            :chart-data="chart.data"
            :title="chart.title"
            :description="chart.description"
            :default-chart-type="chart.type"
            :chart-height="350"
            @chart-ready="onChartReady"
            @chart-click="onChartClick"
          />
        </div>
      </div>

      <!-- 数据表格 -->
      <div v-if="data.table" class="table-section">
        <div class="table-header">
          <h4>详细数据</h4>
          <div class="table-actions">
            <button class="action-btn" @click="exportData">
              <span>📊</span> 导出
            </button>
          </div>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th v-for="col in data.table.columns" :key="col.key" :style="{ width: col.width }">
                  {{ col.title }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in data.table.rows" :key="row.id">
                <td v-for="col in data.table.columns" :key="col.key" :class="col.align">
                  <span v-if="col.type === 'status'" class="status-badge" :style="{ backgroundColor: row[col.key].color }">
                    {{ row[col.key].icon }} {{ row[col.key].value }}
                  </span>
                  <span v-else>{{ row[col.key] }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="data.table.pagination.hasMore" class="pagination-info">
          显示 {{ data.table.pagination.pageSize }} / {{ data.table.pagination.total }} 条记录
          <button class="load-more-btn" @click="loadMore">加载更多</button>
        </div>
      </div>
    </div>

    <!-- 质量分析结果 -->
    <div v-else-if="data.type === 'quality_analysis'" class="quality-response">
      <div class="response-header">
        <h3>{{ data.title }}</h3>
        <div class="timestamp">{{ formatTime(data.timestamp) }}</div>
      </div>

      <!-- 质量汇总 -->
      <div class="quality-summary">
        <div class="quality-grade" :style="{ backgroundColor: data.summary.qualityGrade.color }">
          <div class="grade-letter">{{ data.summary.qualityGrade.grade }}</div>
          <div class="grade-label">{{ data.summary.qualityGrade.label }}</div>
        </div>
        <div class="quality-metrics">
          <div class="metric">
            <div class="metric-value">{{ data.summary.passRate }}%</div>
            <div class="metric-label">合格率</div>
          </div>
          <div class="metric">
            <div class="metric-value">{{ data.summary.totalTests }}</div>
            <div class="metric-label">总测试数</div>
          </div>
          <div class="metric">
            <div class="metric-value">{{ data.summary.failedTests }}</div>
            <div class="metric-label">不合格数</div>
          </div>
        </div>
      </div>

      <!-- 洞察信息 -->
      <div v-if="data.insights" class="insights-section">
        <h4>关键洞察</h4>
        <div class="insight-cards">
          <div v-for="insight in data.insights" :key="insight.title" class="insight-card" :class="insight.type">
            <div class="insight-icon">{{ insight.icon }}</div>
            <div class="insight-content">
              <div class="insight-title">{{ insight.title }}</div>
              <div class="insight-text">{{ insight.content }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 改进建议 -->
      <div v-if="data.recommendations" class="recommendations-section">
        <h4>改进建议</h4>
        <ul class="recommendations-list">
          <li v-for="rec in data.recommendations" :key="rec">{{ rec }}</li>
        </ul>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div v-if="data.actions" class="action-buttons">
      <button 
        v-for="action in data.actions" 
        :key="action.action" 
        class="action-btn"
        @click="handleAction(action.action)"
      >
        <span>{{ action.icon }}</span> {{ action.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import EnhancedChartRenderer from './charts/EnhancedChartRenderer.vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['action', 'chart-ready', 'chart-click'])

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleString('zh-CN')
}

const handleAction = (action) => {
  emit('action', { action, data: props.data })
}

const exportData = () => {
  handleAction('export')
}

const loadMore = () => {
  handleAction('load_more')
}

// 图表事件处理
const onChartReady = (chartInstance) => {
  console.log('📊 图表已准备就绪:', chartInstance)
  emit('chart-ready', chartInstance)
}

const onChartClick = (params) => {
  console.log('📊 图表点击事件:', params)
  emit('chart-click', params)

  // 可以根据点击的数据进行进一步操作
  if (params.data) {
    handleAction('chart_drill_down', {
      chartData: params.data,
      seriesName: params.seriesName
    })
  }
}
</script>

<style scoped>
.enhanced-response-renderer {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.response-header h3 {
  margin: 0;
  color: #1890ff;
}

.timestamp {
  color: #999;
  font-size: 12px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.summary-card {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #1890ff;
}

.summary-card.risk {
  border-left-color: #ff4d4f;
  background: #fff2f0;
}

.card-icon {
  font-size: 24px;
  margin-right: 12px;
}

.card-value {
  font-size: 20px;
  font-weight: bold;
  color: #262626;
}

.card-label {
  font-size: 12px;
  color: #8c8c8c;
}

.charts-section {
  margin: 20px 0;
}

.chart-container {
  margin-bottom: 20px;
}

.chart-container h4 {
  margin: 0 0 12px 0;
  color: #262626;
}

.chart-placeholder {
  background: #fafafa;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  padding: 16px;
  min-height: 200px;
}

.pie-chart-simple, .bar-chart-simple {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pie-item, .bar-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pie-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.bar-container {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f0f0f0;
  border-radius: 4px;
  height: 24px;
  position: relative;
}

.bar-fill {
  background: #1890ff;
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.bar-value {
  position: absolute;
  right: 8px;
  font-size: 12px;
  color: #666;
}

.table-section {
  margin-top: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.table-container {
  overflow-x: auto;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.data-table th {
  background: #fafafa;
  font-weight: 600;
  color: #262626;
}

.data-table td.right {
  text-align: right;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: white;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.quality-summary {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  align-items: center;
}

.quality-grade {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  color: white;
}

.grade-letter {
  font-size: 32px;
  font-weight: bold;
}

.grade-label {
  font-size: 12px;
}

.quality-metrics {
  display: flex;
  gap: 20px;
}

.metric {
  text-align: center;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #262626;
}

.metric-label {
  font-size: 12px;
  color: #8c8c8c;
}

.insights-section, .recommendations-section {
  margin: 20px 0;
}

.insight-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.insight-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid #1890ff;
}

.insight-card.positive {
  background: #f6ffed;
  border-left-color: #52c41a;
}

.insight-card.warning {
  background: #fff7e6;
  border-left-color: #faad14;
}

.insight-icon {
  font-size: 20px;
}

.insight-title {
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
}

.insight-text {
  color: #595959;
  font-size: 14px;
}

.recommendations-list {
  margin: 0;
  padding-left: 20px;
}

.recommendations-list li {
  margin-bottom: 8px;
  color: #595959;
}

.empty-result {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-message {
  font-size: 16px;
  color: #595959;
  margin-bottom: 16px;
}

.suggestions {
  text-align: left;
  max-width: 300px;
  margin: 0 auto;
}

.suggestion-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: #262626;
}

.pagination-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
  color: #8c8c8c;
}

.load-more-btn {
  padding: 4px 12px;
  border: 1px solid #1890ff;
  background: white;
  color: #1890ff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.load-more-btn:hover {
  background: #1890ff;
  color: white;
}
</style>
