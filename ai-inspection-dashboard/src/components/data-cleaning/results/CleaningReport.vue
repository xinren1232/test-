<template>
  <div class="cleaning-report">
    <!-- 报告摘要 -->
    <el-card class="summary-card">
      <template #header>
        <h4>📋 清洗报告摘要</h4>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="summary-item">
            <div class="summary-label">应用规则</div>
            <div class="summary-value">{{ reportData.summary?.appliedRules || 0 }} / {{ reportData.summary?.totalRules || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item">
            <div class="summary-label">成功率</div>
            <div class="summary-value success">{{ reportData.summary?.successRate || 0 }}%</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item">
            <div class="summary-label">处理时间</div>
            <div class="summary-value">{{ reportData.summary?.processingTime || '-' }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="summary-item">
            <div class="summary-label">影响记录</div>
            <div class="summary-value">{{ getTotalAffectedRecords() }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 规则执行结果 -->
    <el-card class="rules-results">
      <template #header>
        <h4>🔧 规则执行详情</h4>
      </template>
      
      <el-table :data="reportData.ruleResults || []" stripe>
        <el-table-column prop="ruleName" label="规则名称" width="200" />
        <el-table-column label="执行状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.applied ? 'success' : 'info'">
              {{ row.applied ? '已执行' : '跳过' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="affectedRecords" label="影响记录数" width="120" />
        <el-table-column label="成功率" width="100">
          <template #default="{ row }">
            <el-progress 
              :percentage="row.successRate" 
              :status="row.successRate >= 95 ? 'success' : row.successRate >= 80 ? undefined : 'exception'"
              :stroke-width="6"
              :show-text="false"
            />
            <span class="success-rate-text">{{ row.successRate }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="details" label="执行详情" show-overflow-tooltip />
      </el-table>
    </el-card>

    <!-- 问题和警告 -->
    <el-card v-if="reportData.issues && reportData.issues.length > 0" class="issues-card">
      <template #header>
        <h4>⚠️ 问题和警告</h4>
      </template>
      
      <div class="issues-list">
        <el-alert
          v-for="(issue, index) in reportData.issues"
          :key="index"
          :title="issue.message"
          :type="issue.type"
          :description="issue.details"
          show-icon
          :closable="false"
          class="issue-item"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'CleaningReport',
  props: {
    reportData: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const getTotalAffectedRecords = () => {
      if (!props.reportData.ruleResults) return 0
      return props.reportData.ruleResults.reduce((total, rule) => total + (rule.affectedRecords || 0), 0)
    }

    return {
      getTotalAffectedRecords
    }
  }
}
</script>

<style scoped>
.cleaning-report {
  padding: 20px 0;
}

.summary-card,
.rules-results,
.issues-card {
  margin-bottom: 20px;
}

.summary-item {
  text-align: center;
  padding: 15px;
}

.summary-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.summary-value.success {
  color: #67c23a;
}

.success-rate-text {
  margin-left: 10px;
  font-size: 12px;
  color: #606266;
}

.issues-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.issue-item {
  margin: 0;
}
</style>
