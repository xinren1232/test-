<template>
  <div class="risk-analysis-card">
    <template v-if="riskData">
      <!-- 风险评分 -->
      <div class="risk-score-section">
        <div class="risk-meter">
          <el-progress
            type="dashboard"
            :percentage="riskData.riskScore"
            :color="getRiskScoreColor(riskData.riskScore)"
            :stroke-width="15"
          >
            <template #default>
              <div class="progress-content">
                <span class="score">{{ riskData.riskScore }}</span>
                <span class="label">风险分</span>
              </div>
            </template>
          </el-progress>
        </div>
        <div class="risk-level">
          <el-tag :type="getRiskLevelType(riskData.riskLevel.value)" size="large">
            {{ riskData.riskLevel.label }}
          </el-tag>
          <p class="update-time">更新于: {{ formatTime(riskData.timestamp) }}</p>
        </div>
      </div>

      <!-- 风险因素 -->
      <div class="risk-factors-section">
        <h4>风险因素分析</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="平均缺陷率">
            {{ formatPercent(riskData.factors.avgDefectRate) }}
          </el-descriptions-item>
          <el-descriptions-item label="供应商稳定性">
            {{ formatPercent(riskData.factors.supplierStability) }}
          </el-descriptions-item>
          <el-descriptions-item label="批次一致性">
            {{ formatPercent(riskData.factors.batchConsistency) }}
          </el-descriptions-item>
          <el-descriptions-item label="历史对比">
            <el-tag :type="getTrendType(riskData.historicalComparison.trendDirection)">
              {{ formatTrend(riskData.historicalComparison.trendDirection, riskData.historicalComparison.changePercentage) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 建议检验策略 -->
      <div class="recommended-strategy-section">
        <div class="section-header">
          <h4>建议检验策略</h4>
          <el-tag type="info">优先级: {{ riskData.recommendedStrategy.priority }}</el-tag>
        </div>
        
        <el-card shadow="hover">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="strategy-item">
                <div class="item-label">检验水平</div>
                <div class="item-value">{{ riskData.recommendedStrategy.inspectionLevel }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="strategy-item">
                <div class="item-label">抽样大小</div>
                <div class="item-value">{{ riskData.recommendedStrategy.sampleSize }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="strategy-item">
                <div class="item-label">检验频率</div>
                <div class="item-value">{{ riskData.recommendedStrategy.frequency }}</div>
              </div>
            </el-col>
          </el-row>
          
          <div class="additional-tests" v-if="riskData.recommendedStrategy.additionalTests.length > 0">
            <div class="item-label">额外测试项目</div>
            <div class="test-tags">
              <el-tag 
                v-for="test in riskData.recommendedStrategy.additionalTests" 
                :key="test"
                size="small"
                class="test-tag"
              >
                {{ test }}
              </el-tag>
            </div>
          </div>
          
          <div class="strategy-description">
            {{ riskData.recommendedStrategy.description }}
          </div>
        </el-card>
      </div>

      <!-- 操作按钮 -->
      <div class="actions-section">
        <el-button type="primary" @click="handleAction('applyStrategy')">
          应用策略
        </el-button>
        <el-button type="success" @click="handleAction('exportReport')">
          导出报告
        </el-button>
        <el-button @click="handleAction('explainAnalysis')">
          解释分析
        </el-button>
      </div>
    </template>
    
    <template v-else>
      <el-empty description="暂无风险分析数据" />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// 定义属性
const props = defineProps({
  riskData: {
    type: Object,
    default: null
  }
});

// 定义事件
const emit = defineEmits(['action-triggered']);

// 格式化百分比
function formatPercent(value) {
  if (value === undefined || value === null) return '未知';
  return `${(value * 100).toFixed(2)}%`;
}

// 格式化时间
function formatTime(timestamp) {
  if (!timestamp) return '未知';
  
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

// 格式化趋势
function formatTrend(direction, percentage) {
  if (!direction || percentage === undefined) return '未知';
  
  switch (direction) {
    case 'up':
      return `上升 ${percentage}%`;
    case 'down':
      return `下降 ${percentage}%`;
    case 'stable':
      return '保持稳定';
    default:
      return '未知';
  }
}

// 获取风险评分颜色
function getRiskScoreColor(score) {
  if (score >= 80) return '#8B0000'; // 深红色
  if (score >= 60) return '#F56C6C'; // 红色
  if (score >= 40) return '#E6A23C'; // 橙色
  return '#67C23A'; // 绿色
}

// 获取风险等级类型
function getRiskLevelType(level) {
  switch (level) {
    case 'critical':
      return 'danger';
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'info';
  }
}

// 获取趋势类型
function getTrendType(direction) {
  switch (direction) {
    case 'up':
      return 'danger';
    case 'down':
      return 'success';
    case 'stable':
      return 'info';
    default:
      return 'info';
  }
}

// 处理操作按钮点击
function handleAction(actionType) {
  emit('action-triggered', {
    type: actionType,
    data: props.riskData
  });
}
</script>

<style scoped>
.risk-analysis-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.risk-score-section {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 10px;
}

.risk-meter {
  display: flex;
  justify-content: center;
}

.progress-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}

.score {
  font-size: 28px;
  font-weight: bold;
}

.label {
  font-size: 14px;
  margin-top: 5px;
}

.risk-level {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.update-time {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #303133;
}

.strategy-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-label {
  font-size: 13px;
  color: #909399;
}

.item-value {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.additional-tests {
  margin-top: 15px;
}

.test-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.strategy-description {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #ebeef5;
  color: #606266;
  font-size: 14px;
}

.actions-section {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
</style> 