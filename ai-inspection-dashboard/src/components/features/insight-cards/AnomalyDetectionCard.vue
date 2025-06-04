<template>
  <div class="anomaly-detection-card">
    <template v-if="anomalyData && anomalyData.anomalies.length > 0">
      <!-- 异常概述 -->
      <div class="anomaly-summary">
        <div class="anomaly-count">
          <el-badge :value="anomalyData.anomalies.length" type="warning" :max="99">
            <span class="count-title">检测到的异常</span>
          </el-badge>
        </div>
        <div class="updated-at">
          更新于: {{ formatTime(anomalyData.timestamp) }}
        </div>
      </div>

      <!-- 异常列表 -->
      <div class="anomaly-list">
        <el-collapse v-model="activeAnomalies">
          <el-collapse-item 
            v-for="(anomaly, index) in anomalyData.anomalies" 
            :key="index"
            :name="index"
          >
            <template #title>
              <div class="anomaly-item-header">
                <el-tag :type="getAnomalySeverityType(anomaly.severity)" size="small">
                  {{ getAnomalySeverityLabel(anomaly.severity) }}
                </el-tag>
                <span class="anomaly-title">{{ anomaly.name }}</span>
              </div>
            </template>
            <div class="anomaly-details">
              <el-descriptions :column="1" border size="small">
                <el-descriptions-item label="异常类型">
                  {{ anomaly.type }}
                </el-descriptions-item>
                <el-descriptions-item label="异常描述">
                  {{ anomaly.description }}
                </el-descriptions-item>
                <el-descriptions-item label="发现时间">
                  {{ formatTime(anomaly.detectedAt) }}
                </el-descriptions-item>
                <el-descriptions-item label="置信度">
                  <el-progress 
                    :percentage="Math.round(anomaly.confidence * 100)"
                    :format="format => `${format}%`"
                    :color="getConfidenceColor(anomaly.confidence)"
                    :stroke-width="10"
                  />
                </el-descriptions-item>
              </el-descriptions>
              
              <div class="anomaly-metrics" v-if="anomaly.metrics && anomaly.metrics.length > 0">
                <h5>关联指标</h5>
                <el-table :data="anomaly.metrics" style="width: 100%" size="small">
                  <el-table-column prop="name" label="指标名称" />
                  <el-table-column prop="value" label="观察值">
                    <template #default="scope">
                      {{ formatValue(scope.row.value) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="expected" label="预期值">
                    <template #default="scope">
                      {{ formatValue(scope.row.expected) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="deviation" label="偏差">
                    <template #default="scope">
                      <el-tag :type="getDeviationType(scope.row.deviation)">
                        {{ formatDeviation(scope.row.deviation) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              
              <div class="anomaly-actions">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="handleAnomalyAction('investigate', anomaly)"
                >
                  调查异常
                </el-button>
                <el-button 
                  type="success" 
                  size="small" 
                  @click="handleAnomalyAction('resolve', anomaly)"
                >
                  标记已解决
                </el-button>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 批量操作 -->
      <div class="batch-actions">
        <el-button type="primary" @click="handleAction('exportAnomalies')">
          导出异常报告
        </el-button>
        <el-button @click="handleAction('configureDetection')">
          配置检测规则
        </el-button>
      </div>
    </template>
    
    <template v-else-if="anomalyData && anomalyData.anomalies.length === 0">
      <div class="no-anomalies">
        <el-result
          icon="success"
          title="未检测到异常"
          sub-title="当前物料没有发现任何异常，系统将持续监控"
        >
          <template #extra>
            <el-button type="primary" @click="handleAction('configureDetection')">
              配置检测规则
            </el-button>
          </template>
        </el-result>
      </div>
    </template>
    
    <template v-else>
      <el-empty description="暂无异常检测数据" />
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 定义属性
const props = defineProps({
  anomalyData: {
    type: Object,
    default: null
  }
});

// 定义事件
const emit = defineEmits(['action-triggered']);

// 活动的异常面板
const activeAnomalies = ref([0]); // 默认展开第一个

// 格式化时间
function formatTime(timestamp) {
  if (!timestamp) return '未知';
  
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

// 格式化数值
function formatValue(value) {
  if (value === undefined || value === null) return '未知';
  
  // 如果是数字，格式化为2位小数
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  
  return value.toString();
}

// 格式化偏差
function formatDeviation(deviation) {
  if (deviation === undefined || deviation === null) return '未知';
  
  // 将偏差格式化为百分比
  const percent = (deviation * 100).toFixed(2);
  return (deviation >= 0 ? '+' : '') + `${percent}%`;
}

// 获取异常严重程度类型
function getAnomalySeverityType(severity) {
  switch (severity) {
    case 'critical':
      return 'danger';
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'info';
  }
}

// 获取异常严重程度标签
function getAnomalySeverityLabel(severity) {
  switch (severity) {
    case 'critical':
      return '严重';
    case 'high':
      return '高';
    case 'medium':
      return '中';
    case 'low':
      return '低';
    default:
      return '未知';
  }
}

// 获取置信度颜色
function getConfidenceColor(confidence) {
  if (confidence >= 0.8) return '#67C23A';
  if (confidence >= 0.6) return '#E6A23C';
  return '#F56C6C';
}

// 获取偏差类型
function getDeviationType(deviation) {
  if (Math.abs(deviation) < 0.05) return 'info'; // 5%以内偏差为正常
  if (Math.abs(deviation) < 0.1) return 'warning'; // 5-10%为警告
  return 'danger'; // 10%以上为危险
}

// 处理异常操作
function handleAnomalyAction(type, anomaly) {
  emit('action-triggered', {
    type,
    anomaly,
    data: props.anomalyData
  });
}

// 处理通用操作
function handleAction(type) {
  emit('action-triggered', {
    type,
    data: props.anomalyData
  });
}
</script>

<style scoped>
.anomaly-detection-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.anomaly-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.anomaly-count {
  display: flex;
  align-items: center;
}

.count-title {
  font-size: 16px;
  font-weight: bold;
  margin-right: 5px;
}

.updated-at {
  font-size: 12px;
  color: #909399;
}

.anomaly-list {
  margin-bottom: 20px;
}

.anomaly-item-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.anomaly-title {
  font-weight: 500;
  flex: 1;
}

.anomaly-details {
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.anomaly-metrics h5 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #303133;
}

.anomaly-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  justify-content: flex-end;
}

.batch-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.no-anomalies {
  text-align: center;
  padding: 30px 0;
}
</style> 