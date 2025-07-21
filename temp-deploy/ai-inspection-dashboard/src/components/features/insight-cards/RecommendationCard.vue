<template>
  <div class="recommendation-card">
    <template v-if="recommendationData && recommendationData.recommendations.length > 0">
      <!-- 推荐概述 -->
      <div class="recommendation-overview">
        <div class="overview-header">
          <h4>检验策略推荐</h4>
          <p class="update-time">更新于: {{ formatTime(recommendationData.timestamp) }}</p>
        </div>
        
        <div class="context-info" v-if="recommendationData.context">
          <el-alert
            type="info"
            :closable="false"
            show-icon
          >
            <template #title>
              AI推荐依据: {{ recommendationData.context.reason }}
            </template>
            <p>{{ recommendationData.context.description }}</p>
          </el-alert>
        </div>
      </div>

      <!-- 推荐列表 -->
      <div class="recommendations-list">
        <el-tabs type="border-card">
          <el-tab-pane 
            v-for="(recommendation, index) in recommendationData.recommendations" 
            :key="index"
            :label="`策略 ${index + 1}`"
          >
            <div class="recommendation-item">
              <div class="recommendation-header">
                <h5>{{ recommendation.name }}</h5>
                <el-tag :type="getConfidenceType(recommendation.confidence)">
                  置信度: {{ Math.round(recommendation.confidence * 100) }}%
                </el-tag>
              </div>
              
              <div class="recommendation-content">
                <p class="description">{{ recommendation.description }}</p>
                
                <el-divider content-position="left">策略详情</el-divider>
                
                <el-row :gutter="20">
                  <el-col :span="8">
                    <div class="detail-item">
                      <span class="label">检验水平:</span>
                      <span class="value">{{ recommendation.details.inspectionLevel }}</span>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="detail-item">
                      <span class="label">抽样方案:</span>
                      <span class="value">{{ recommendation.details.samplingPlan }}</span>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="detail-item">
                      <span class="label">检验频率:</span>
                      <span class="value">{{ recommendation.details.frequency }}</span>
                    </div>
                  </el-col>
                </el-row>
                
                <div class="key-checkpoints">
                  <p class="sub-title">关键检查点:</p>
                  <el-tag 
                    v-for="(checkpoint, idx) in recommendation.details.keyCheckpoints" 
                    :key="idx"
                    class="checkpoint-tag"
                  >
                    {{ checkpoint }}
                  </el-tag>
                </div>
                
                <div class="expected-outcome">
                  <p class="sub-title">预期效果:</p>
                  <ul>
                    <li v-for="(outcome, idx) in recommendation.details.expectedOutcomes" :key="idx">
                      {{ outcome }}
                    </li>
                  </ul>
                </div>
              </div>
              
              <div class="recommendation-actions">
                <el-button 
                  type="primary" 
                  @click="handleRecommendationAction('apply', recommendation)"
                >
                  应用此策略
                </el-button>
                <el-button 
                  type="success" 
                  @click="handleRecommendationAction('customize', recommendation)"
                >
                  自定义修改
                </el-button>
                <el-button 
                  @click="handleRecommendationAction('explain', recommendation)"
                >
                  解释推荐
                </el-button>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 全局操作 -->
      <div class="global-actions">
        <el-button type="primary" @click="handleAction('exportRecommendations')">
          导出所有推荐
        </el-button>
        <el-button @click="handleAction('historyRecommendations')">
          查看历史推荐
        </el-button>
      </div>
    </template>
    
    <template v-else>
      <el-empty description="暂无推荐策略数据" />
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 定义属性
const props = defineProps({
  recommendationData: {
    type: Object,
    default: null
  }
});

// 定义事件
const emit = defineEmits(['action-triggered']);

// 格式化时间
function formatTime(timestamp) {
  if (!timestamp) return '未知';
  
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

// 获取置信度类型
function getConfidenceType(confidence) {
  if (confidence >= 0.8) return 'success';
  if (confidence >= 0.6) return 'warning';
  return 'info';
}

// 处理推荐操作
function handleRecommendationAction(type, recommendation) {
  emit('action-triggered', {
    type,
    recommendation,
    data: props.recommendationData
  });
}

// 处理全局操作
function handleAction(type) {
  emit('action-triggered', {
    type,
    data: props.recommendationData
  });
}
</script>

<style scoped>
.recommendation-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.recommendation-overview {
  margin-bottom: 20px;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.overview-header h4 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.update-time {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.context-info {
  margin-top: 10px;
}

.context-info p {
  margin: 5px 0 0 0;
  font-size: 13px;
}

.recommendations-list {
  margin-bottom: 20px;
}

.recommendation-item {
  padding: 10px 0;
}

.recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.recommendation-header h5 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.recommendation-content {
  margin-bottom: 20px;
}

.description {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 15px;
}

.label {
  font-size: 13px;
  color: #909399;
}

.value {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.sub-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin: 15px 0 10px 0;
}

.key-checkpoints {
  margin-bottom: 15px;
}

.checkpoint-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.expected-outcome ul {
  margin: 10px 0 0 0;
  padding-left: 20px;
}

.expected-outcome li {
  margin-bottom: 5px;
  color: #606266;
}

.recommendation-actions {
  display: flex;
  gap: 10px;
}

.global-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
</style> 