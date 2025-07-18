<template>
  <div class="cleaning-overview">
    <div class="overview-grid">
      <!-- 清洗规则应用情况 -->
      <el-card class="overview-card">
        <template #header>
          <span>🔧 清洗规则应用</span>
        </template>
        <div class="rules-applied">
          <div v-for="rule in appliedRules" :key="rule.name" class="rule-item">
            <div class="rule-header">
              <span class="rule-name">{{ rule.name }}</span>
              <el-tag :type="rule.status === 'success' ? 'success' : 'warning'" size="small">
                {{ rule.status === 'success' ? '成功' : '警告' }}
              </el-tag>
            </div>
            <div class="rule-stats">
              <span>处理记录: {{ rule.processedCount }}</span>
              <span>修复记录: {{ rule.fixedCount }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 数据质量改善 -->
      <el-card class="overview-card">
        <template #header>
          <span>📈 数据质量改善</span>
        </template>
        <div class="quality-improvement">
          <div class="quality-metrics">
            <div class="metric">
              <span class="metric-label">完整性</span>
              <div class="metric-progress">
                <el-progress :percentage="qualityMetrics.completeness.after" :show-text="false" />
                <span class="metric-change">
                  +{{ qualityMetrics.completeness.after - qualityMetrics.completeness.before }}%
                </span>
              </div>
            </div>
            <div class="metric">
              <span class="metric-label">准确性</span>
              <div class="metric-progress">
                <el-progress :percentage="qualityMetrics.accuracy.after" :show-text="false" />
                <span class="metric-change">
                  +{{ qualityMetrics.accuracy.after - qualityMetrics.accuracy.before }}%
                </span>
              </div>
            </div>
            <div class="metric">
              <span class="metric-label">一致性</span>
              <div class="metric-progress">
                <el-progress :percentage="qualityMetrics.consistency.after" :show-text="false" />
                <span class="metric-change">
                  +{{ qualityMetrics.consistency.after - qualityMetrics.consistency.before }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 问题分布 -->
      <el-card class="overview-card full-width">
        <template #header>
          <span>🎯 问题分布</span>
        </template>
        <div class="problem-distribution">
          <div class="problem-chart">
            <div v-for="problem in problemDistribution" :key="problem.type" class="problem-item">
              <div class="problem-bar">
                <div 
                  class="problem-fill" 
                  :style="{ width: `${problem.percentage}%`, backgroundColor: problem.color }"
                ></div>
              </div>
              <div class="problem-info">
                <span class="problem-type">{{ problem.type }}</span>
                <span class="problem-count">{{ problem.count }}条</span>
                <span class="problem-percentage">{{ problem.percentage }}%</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 清洗建议 -->
    <el-card class="suggestions-card">
      <template #header>
        <span>💡 清洗建议</span>
      </template>
      <div class="suggestions">
        <el-alert
          v-for="suggestion in suggestions"
          :key="suggestion.id"
          :title="suggestion.title"
          :description="suggestion.description"
          :type="suggestion.type"
          show-icon
          :closable="false"
          class="suggestion-item"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})

// 模拟数据
const appliedRules = computed(() => [
  {
    name: '空值填充',
    status: 'success',
    processedCount: 156,
    fixedCount: 23
  },
  {
    name: '格式标准化',
    status: 'success',
    processedCount: 1250,
    fixedCount: 89
  },
  {
    name: '重复数据清理',
    status: 'warning',
    processedCount: 1250,
    fixedCount: 15
  },
  {
    name: '异常值检测',
    status: 'success',
    processedCount: 1250,
    fixedCount: 7
  }
])

const qualityMetrics = computed(() => ({
  completeness: { before: 78, after: 95 },
  accuracy: { before: 82, after: 94 },
  consistency: { before: 75, after: 91 }
}))

const problemDistribution = computed(() => [
  {
    type: '空值/缺失值',
    count: 23,
    percentage: 35,
    color: '#f56c6c'
  },
  {
    type: '格式不一致',
    count: 89,
    percentage: 28,
    color: '#e6a23c'
  },
  {
    type: '重复数据',
    count: 15,
    percentage: 20,
    color: '#409eff'
  },
  {
    type: '异常值',
    count: 7,
    percentage: 12,
    color: '#67c23a'
  },
  {
    type: '其他问题',
    count: 3,
    percentage: 5,
    color: '#909399'
  }
])

const suggestions = computed(() => [
  {
    id: 1,
    title: '建议增加数据验证规则',
    description: '发现部分数据格式不一致，建议在数据录入时增加格式验证规则',
    type: 'warning'
  },
  {
    id: 2,
    title: '优化数据收集流程',
    description: '空值较多的字段建议优化数据收集流程，确保数据完整性',
    type: 'info'
  },
  {
    id: 3,
    title: '定期数据质量检查',
    description: '建议建立定期的数据质量检查机制，及时发现和处理数据问题',
    type: 'success'
  }
])
</script>

<style scoped>
.cleaning-overview {
  padding: 20px 0;
}

.overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.overview-card {
  height: fit-content;
}

.full-width {
  grid-column: 1 / -1;
}

.rules-applied {
  space-y: 15px;
}

.rule-item {
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 10px;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.rule-name {
  font-weight: 500;
  color: #2c3e50;
}

.rule-stats {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #606266;
}

.quality-improvement {
  padding: 10px 0;
}

.quality-metrics {
  space-y: 20px;
}

.metric {
  margin-bottom: 20px;
}

.metric-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.metric-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.metric-change {
  color: #67c23a;
  font-weight: 500;
  font-size: 12px;
}

.problem-distribution {
  padding: 10px 0;
}

.problem-chart {
  space-y: 15px;
}

.problem-item {
  margin-bottom: 15px;
}

.problem-bar {
  height: 20px;
  background-color: #f5f7fa;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 8px;
}

.problem-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.problem-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.problem-type {
  font-weight: 500;
  color: #2c3e50;
}

.problem-count {
  color: #606266;
}

.problem-percentage {
  color: #909399;
  font-size: 12px;
}

.suggestions-card {
  margin-top: 20px;
}

.suggestions {
  space-y: 15px;
}

.suggestion-item {
  margin-bottom: 15px;
}

.suggestion-item:last-child {
  margin-bottom: 0;
}
</style>
