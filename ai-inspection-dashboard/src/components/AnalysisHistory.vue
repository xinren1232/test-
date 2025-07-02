<template>
  <div class="analysis-history">
    <div class="history-header">
      <h4>📚 分析历史</h4>
      <div class="history-controls">
        <el-button size="small" @click="clearHistory" :disabled="historyList.length === 0">
          清空
        </el-button>
        <el-button size="small" type="primary" @click="exportHistory" :disabled="historyList.length === 0">
          导出
        </el-button>
      </div>
    </div>

    <div class="history-content">
      <div v-if="historyList.length === 0" class="empty-history">
        <div class="empty-icon">📝</div>
        <p>暂无分析历史</p>
      </div>

      <div v-else class="history-list">
        <div 
          v-for="(item, index) in historyList" 
          :key="item.id"
          class="history-item"
          :class="{ active: selectedItem?.id === item.id }"
          @click="selectHistoryItem(item)"
        >
          <div class="history-item-header">
            <div class="history-time">{{ formatTime(item.timestamp) }}</div>
            <div class="history-actions">
              <el-button size="small" text @click.stop="compareWithCurrent(item)">
                <el-icon><Compare /></el-icon>
              </el-button>
              <el-button size="small" text @click.stop="deleteHistoryItem(index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          <div class="history-query">{{ item.query }}</div>
          <div class="history-summary">
            <el-tag size="small" type="info">{{ item.source }}</el-tag>
            <span class="summary-text">{{ item.summary }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 对比弹窗 -->
    <el-dialog
      v-model="compareDialogVisible"
      title="分析对比"
      width="80%"
      :before-close="closeCompareDialog"
    >
      <div class="compare-content">
        <div class="compare-section">
          <h5>历史分析 ({{ formatTime(compareItem?.timestamp) }})</h5>
          <div class="compare-text">{{ compareItem?.reply }}</div>
        </div>
        <div class="compare-divider"></div>
        <div class="compare-section">
          <h5>当前分析</h5>
          <div class="compare-text">{{ currentAnalysisText }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElDialog, ElButton, ElTag, ElIcon } from 'element-plus';
import { Delete } from '@element-plus/icons-vue';

const props = defineProps({
  currentAnalysis: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['select-history', 'export-history']);

// 历史记录数据
const historyList = ref([]);
const selectedItem = ref(null);
const compareDialogVisible = ref(false);
const compareItem = ref(null);

// 当前分析文本
const currentAnalysisText = computed(() => {
  return props.currentAnalysis?.text || '暂无当前分析';
});

// 添加历史记录
const addHistoryItem = (analysisData) => {
  const historyItem = {
    id: Date.now(),
    timestamp: new Date(),
    query: analysisData.query,
    reply: analysisData.reply,
    source: analysisData.source,
    summary: generateSummary(analysisData.reply),
    metrics: analysisData.metrics || [],
    insights: analysisData.insights || [],
    recommendations: analysisData.recommendations || []
  };

  historyList.value.unshift(historyItem);
  
  // 限制历史记录数量
  if (historyList.value.length > 20) {
    historyList.value = historyList.value.slice(0, 20);
  }

  // 保存到本地存储
  saveToLocalStorage();
};

// 生成摘要
const generateSummary = (text) => {
  if (!text) return '无摘要';
  
  // 简单的摘要生成逻辑
  const sentences = text.split('。').filter(s => s.trim().length > 0);
  if (sentences.length > 0) {
    return sentences[0].substring(0, 50) + '...';
  }
  return text.substring(0, 50) + '...';
};

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) { // 1分钟内
    return '刚刚';
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`;
  } else if (diff < 86400000) { // 1天内
    return `${Math.floor(diff / 3600000)}小时前`;
  } else {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().substring(0, 5);
  }
};

// 选择历史项
const selectHistoryItem = (item) => {
  selectedItem.value = item;
  emit('select-history', item);
};

// 删除历史项
const deleteHistoryItem = (index) => {
  historyList.value.splice(index, 1);
  saveToLocalStorage();
};

// 清空历史
const clearHistory = () => {
  historyList.value = [];
  selectedItem.value = null;
  saveToLocalStorage();
};

// 与当前分析对比
const compareWithCurrent = (item) => {
  compareItem.value = item;
  compareDialogVisible.value = true;
};

// 关闭对比弹窗
const closeCompareDialog = () => {
  compareDialogVisible.value = false;
  compareItem.value = null;
};

// 导出历史
const exportHistory = () => {
  const exportData = {
    exportTime: new Date().toISOString(),
    totalCount: historyList.value.length,
    analyses: historyList.value.map(item => ({
      timestamp: item.timestamp,
      query: item.query,
      reply: item.reply,
      source: item.source,
      summary: item.summary
    }))
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
    type: 'application/json' 
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `IQE分析历史_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  emit('export-history', exportData);
};

// 保存到本地存储
const saveToLocalStorage = () => {
  try {
    localStorage.setItem('iqe_analysis_history', JSON.stringify(historyList.value));
  } catch (error) {
    console.warn('保存历史记录失败:', error);
  }
};

// 从本地存储加载
const loadFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem('iqe_analysis_history');
    if (saved) {
      const parsed = JSON.parse(saved);
      historyList.value = parsed.map(item => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
    }
  } catch (error) {
    console.warn('加载历史记录失败:', error);
  }
};

// 暴露方法给父组件
defineExpose({
  addHistoryItem,
  clearHistory,
  exportHistory
});

// 组件挂载时加载历史记录
import { onMounted } from 'vue';
onMounted(() => {
  loadFromLocalStorage();
});
</script>

<style scoped>
.analysis-history {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.history-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 600;
}

.history-controls {
  display: flex;
  gap: 8px;
}

.history-content {
  flex: 1;
  overflow-y: auto;
}

.empty-history {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.history-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.history-item.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.history-time {
  font-size: 11px;
  color: #909399;
}

.history-actions {
  display: flex;
  gap: 4px;
}

.history-query {
  font-size: 12px;
  color: #2c3e50;
  margin-bottom: 6px;
  font-weight: 500;
  line-height: 1.4;
}

.history-summary {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-text {
  font-size: 11px;
  color: #606266;
  flex: 1;
  line-height: 1.3;
}

/* 对比弹窗样式 */
.compare-content {
  display: flex;
  gap: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.compare-section {
  flex: 1;
}

.compare-section h5 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.compare-text {
  font-size: 13px;
  line-height: 1.6;
  color: #606266;
  white-space: pre-wrap;
}

.compare-divider {
  width: 1px;
  background: #ebeef5;
  flex-shrink: 0;
}
</style>
