<template>
  <div class="analysis-process-panel">
    <div class="panel-header">
      <h3>🔍 分析过程</h3>
      <div class="process-status" :class="processStatus">
        {{ getStatusText() }}
      </div>
    </div>

    <div class="workflow-container" v-if="workflow">
      <!-- 总体进度 -->
      <div class="overall-progress">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${overallProgress}%` }"
          ></div>
        </div>
        <div class="progress-text">
          {{ completedSteps }}/{{ totalSteps }} 步骤完成
        </div>
      </div>

      <!-- 步骤详情 -->
      <div class="steps-container">
        <div 
          v-for="(step, index) in workflow.steps" 
          :key="index"
          class="step-item"
          :class="getStepClass(step)"
        >
          <div class="step-header">
            <div class="step-icon">
              <i :class="getStepIcon(step)"></i>
            </div>
            <div class="step-info">
              <div class="step-title">
                步骤{{ step.step }}: {{ step.name }}
              </div>
              <div class="step-time" v-if="step.endTime">
                耗时: {{ getStepDuration(step) }}ms
              </div>
            </div>
            <div class="step-status">
              <span :class="'status-' + step.status">
                {{ getStepStatusText(step.status) }}
              </span>
            </div>
          </div>

          <!-- 步骤结果展示 -->
          <div class="step-content" v-if="step.result && step.status === 'completed'">
            <!-- 意图识别结果 -->
            <div v-if="step.step === 1" class="intent-result">
              <div class="result-item">
                <strong>识别意图:</strong> 
                <span class="intent-tag" :class="'intent-' + step.result.intent">
                  {{ getIntentText(step.result.intent) }}
                </span>
              </div>
              <div class="result-item">
                <strong>置信度:</strong> 
                <span class="confidence">{{ (step.result.confidence * 100).toFixed(1) }}%</span>
              </div>
              <div class="result-item">
                <strong>关键词:</strong> 
                <span class="keywords">
                  <span v-for="keyword in step.result.keywords" :key="keyword" class="keyword-tag">
                    {{ keyword }}
                  </span>
                </span>
              </div>
              <div class="result-item">
                <strong>复杂度:</strong> 
                <span class="complexity" :class="'complexity-' + step.result.complexity">
                  {{ getComplexityText(step.result.complexity) }}
                </span>
              </div>
            </div>

            <!-- 数据源识别结果 -->
            <div v-else-if="step.step === 2" class="datasource-result">
              <div class="result-item">
                <strong>选中数据源:</strong>
                <div class="datasources">
                  <div v-for="source in step.result" :key="source.table" class="datasource-item">
                    <i class="fas fa-database"></i>
                    <span class="source-name">{{ source.table }}</span>
                    <span class="source-desc">{{ source.description }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 数据查询结果 -->
            <div v-else-if="step.step === 3" class="query-result">
              <div class="result-item">
                <strong>执行查询:</strong>
                <div class="queries">
                  <div v-for="result in step.result.results" :key="result.source" class="query-item">
                    <div class="query-header">
                      <i class="fas fa-table"></i>
                      <span class="table-name">{{ result.source }}</span>
                      <span class="record-count" :class="result.count > 0 ? 'has-data' : 'no-data'">
                        {{ result.count }} 条记录
                      </span>
                    </div>
                    <div class="query-desc">{{ result.description }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 数据汇总结果 -->
            <div v-else-if="step.step === 4" class="summary-result">
              <div class="result-item">
                <strong>数据汇总:</strong>
                <div class="summary-stats">
                  <div class="stat-item">
                    <i class="fas fa-database"></i>
                    <span>{{ step.result.totalSources }} 个数据源</span>
                  </div>
                  <div class="stat-item">
                    <i class="fas fa-list"></i>
                    <span>{{ step.result.totalRecords }} 条记录</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 工具调用结果 -->
            <div v-else-if="step.step === 5" class="tool-result">
              <div class="result-item">
                <strong>调用工具:</strong>
                <div class="tools" v-if="step.result.length > 0">
                  <div v-for="tool in step.result" :key="tool.type" class="tool-item">
                    <i :class="getToolIcon(tool.type)"></i>
                    <span>{{ getToolName(tool.type) }}</span>
                  </div>
                </div>
                <div v-else class="no-tools">
                  <i class="fas fa-info-circle"></i>
                  <span>无需调用额外工具</span>
                </div>
              </div>
            </div>

            <!-- AI分析结果 -->
            <div v-else-if="step.step === 6" class="ai-analysis-result">
              <div class="result-item">
                <strong>AI分析:</strong>
                <div class="analysis-preview">
                  {{ getAnalysisPreview(step.result) }}
                </div>
              </div>
            </div>

            <!-- 数据整理结果 -->
            <div v-else-if="step.step === 7" class="organize-result">
              <div class="result-item">
                <strong>数据质量:</strong>
                <span class="data-quality" :class="'quality-' + step.result.metadata.dataQuality">
                  {{ getDataQualityText(step.result.metadata.dataQuality) }}
                </span>
              </div>
            </div>

            <!-- 结果呈现 -->
            <div v-else-if="step.step === 8" class="final-result">
              <div class="result-item">
                <strong>处理完成:</strong>
                <div class="final-stats">
                  <div class="stat-item">
                    <i class="fas fa-clock"></i>
                    <span>总耗时: {{ step.result.metadata.totalTime }}ms</span>
                  </div>
                  <div class="stat-item">
                    <i class="fas fa-check-circle"></i>
                    <span>置信度: {{ (step.result.metadata.confidence * 100).toFixed(1) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 处理中状态 -->
          <div v-else-if="step.status === 'processing'" class="step-processing">
            <div class="loading-spinner"></div>
            <span>正在处理...</span>
          </div>

          <!-- 错误状态 -->
          <div v-else-if="step.status === 'failed'" class="step-error">
            <i class="fas fa-exclamation-triangle"></i>
            <span>处理失败</span>
          </div>
        </div>
      </div>

      <!-- 总体统计 -->
      <div class="workflow-summary" v-if="workflow.status === 'completed'">
        <div class="summary-header">
          <h4>📊 处理摘要</h4>
        </div>
        <div class="summary-content">
          <div class="summary-item">
            <strong>总处理时间:</strong> {{ workflow.totalTime }}ms
          </div>
          <div class="summary-item">
            <strong>处理状态:</strong> 
            <span class="status-success">✅ 成功完成</span>
          </div>
          <div class="summary-item">
            <strong>数据来源:</strong> {{ getDataSourceSummary() }}
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <i class="fas fa-robot"></i>
      <p>等待AI分析...</p>
      <small>发送问题后，这里将显示详细的分析过程</small>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnalysisProcessPanel',
  props: {
    workflow: {
      type: Object,
      default: null
    }
  },
  computed: {
    processStatus() {
      if (!this.workflow) return 'waiting';
      return this.workflow.status || 'processing';
    },
    totalSteps() {
      return this.workflow?.steps?.length || 8;
    },
    completedSteps() {
      return this.workflow?.steps?.filter(s => s.status === 'completed').length || 0;
    },
    overallProgress() {
      return this.totalSteps > 0 ? (this.completedSteps / this.totalSteps) * 100 : 0;
    }
  },
  methods: {
    getStatusText() {
      switch (this.processStatus) {
        case 'waiting': return '等待中';
        case 'processing': return '分析中';
        case 'completed': return '已完成';
        case 'failed': return '处理失败';
        default: return '未知状态';
      }
    },
    getStepClass(step) {
      return {
        'step-completed': step.status === 'completed',
        'step-processing': step.status === 'processing',
        'step-failed': step.status === 'failed',
        'step-pending': !step.status || step.status === 'pending'
      };
    },
    getStepIcon(step) {
      const icons = {
        1: 'fas fa-brain',      // 问题理解
        2: 'fas fa-database',   // 数据源识别
        3: 'fas fa-search',     // 数据查询
        4: 'fas fa-chart-bar',  // 数据汇总
        5: 'fas fa-tools',      // 工具调用
        6: 'fas fa-robot',      // AI分析
        7: 'fas fa-sort',       // 数据整理
        8: 'fas fa-check'       // 结果呈现
      };
      return icons[step.step] || 'fas fa-circle';
    },
    getStepStatusText(status) {
      switch (status) {
        case 'completed': return '✅ 完成';
        case 'processing': return '🔄 处理中';
        case 'failed': return '❌ 失败';
        default: return '⏳ 等待';
      }
    },
    getStepDuration(step) {
      if (step.startTime && step.endTime) {
        return new Date(step.endTime) - new Date(step.startTime);
      }
      return 0;
    },
    getIntentText(intent) {
      const texts = {
        'general-query': '一般查询',
        'data-query': '数据查询',
        'analysis-query': '分析查询',
        'system-query': '系统查询'
      };
      return texts[intent] || intent;
    },
    getComplexityText(complexity) {
      const texts = {
        'low': '简单',
        'medium': '中等',
        'high': '复杂'
      };
      return texts[complexity] || complexity;
    },
    getToolIcon(toolType) {
      const icons = {
        'chart': 'fas fa-chart-line',
        'search': 'fas fa-search',
        'stats': 'fas fa-calculator'
      };
      return icons[toolType] || 'fas fa-tool';
    },
    getToolName(toolType) {
      const names = {
        'chart': '图表生成',
        'search': '网络搜索',
        'stats': '统计计算'
      };
      return names[toolType] || toolType;
    },
    getAnalysisPreview(analysis) {
      if (typeof analysis === 'string') {
        return analysis.length > 100 ? analysis.substring(0, 100) + '...' : analysis;
      }
      return '分析完成';
    },
    getDataQualityText(quality) {
      const texts = {
        'high': '高质量',
        'medium': '中等质量',
        'low': '低质量'
      };
      return texts[quality] || quality;
    },
    getDataSourceSummary() {
      if (!this.workflow?.steps) return '';
      const step2 = this.workflow.steps.find(s => s.step === 2);
      if (step2?.result) {
        return step2.result.map(s => s.table).join(', ');
      }
      return '';
    }
  }
};
</script>

<style scoped>
.analysis-process-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
}

.panel-header {
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.process-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.2);
}

.process-status.completed {
  background: rgba(76, 175, 80, 0.3);
}

.process-status.processing {
  background: rgba(255, 193, 7, 0.3);
}

.process-status.failed {
  background: rgba(244, 67, 54, 0.3);
}

.workflow-container {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.overall-progress {
  margin-bottom: 20px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  transition: width 0.3s ease;
}

.progress-text {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  text-align: center;
}

.steps-container {
  space-y: 12px;
}

.step-item {
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.step-item.step-completed {
  border-color: #4CAF50;
  box-shadow: 0 2px 4px rgba(76, 175, 80, 0.1);
}

.step-item.step-processing {
  border-color: #FF9800;
  box-shadow: 0 2px 4px rgba(255, 152, 0, 0.1);
}

.step-item.step-failed {
  border-color: #F44336;
  box-shadow: 0 2px 4px rgba(244, 67, 54, 0.1);
}

.step-header {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.step-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #666;
}

.step-completed .step-icon {
  background: #4CAF50;
  color: white;
}

.step-processing .step-icon {
  background: #FF9800;
  color: white;
}

.step-info {
  flex: 1;
}

.step-title {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.step-time {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.step-status {
  font-size: 12px;
}

.step-content {
  padding: 16px;
}

.result-item {
  margin-bottom: 12px;
}

.result-item:last-child {
  margin-bottom: 0;
}

.result-item strong {
  color: #333;
  font-size: 13px;
}

.intent-tag {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-left: 8px;
}

.intent-data-query {
  background: #E3F2FD;
  color: #1976D2;
}

.intent-analysis-query {
  background: #F3E5F5;
  color: #7B1FA2;
}

.intent-general-query {
  background: #E8F5E8;
  color: #388E3C;
}

.confidence {
  font-weight: 600;
  color: #4CAF50;
  margin-left: 8px;
}

.keywords {
  margin-left: 8px;
}

.keyword-tag {
  display: inline-block;
  padding: 2px 6px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 11px;
  margin-right: 4px;
  margin-bottom: 2px;
}

.complexity {
  margin-left: 8px;
  font-weight: 500;
}

.complexity-low { color: #4CAF50; }
.complexity-medium { color: #FF9800; }
.complexity-high { color: #F44336; }

.datasources, .queries {
  margin-top: 8px;
}

.datasource-item, .query-item {
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.source-name, .table-name {
  font-weight: 600;
  color: #333;
}

.source-desc, .query-desc {
  color: #666;
  font-size: 12px;
  flex: 1;
}

.record-count {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.record-count.has-data {
  background: #E8F5E8;
  color: #388E3C;
}

.record-count.no-data {
  background: #FFEBEE;
  color: #D32F2F;
}

.summary-stats, .final-stats {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.tools {
  margin-top: 8px;
}

.tool-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 8px;
  margin-bottom: 4px;
}

.no-tools {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 13px;
  margin-top: 8px;
}

.analysis-preview {
  margin-top: 8px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 13px;
  color: #333;
  line-height: 1.4;
}

.data-quality {
  margin-left: 8px;
  font-weight: 600;
}

.quality-high { color: #4CAF50; }
.quality-medium { color: #FF9800; }
.quality-low { color: #F44336; }

.step-processing {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #666;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #FF9800;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.step-error {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #F44336;
}

.workflow-summary {
  margin-top: 20px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.summary-header h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #333;
}

.summary-content {
  space-y: 8px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  margin-bottom: 8px;
}

.status-success {
  color: #4CAF50;
  font-weight: 500;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  text-align: center;
  padding: 40px 20px;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #ddd;
}

.empty-state p {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.empty-state small {
  font-size: 12px;
  color: #999;
}
</style>
