<template>
  <div class="export-panel">
    <div class="export-header">
      <h4>📄 导出报告</h4>
      <el-button size="small" type="primary" @click="showExportDialog = true" :disabled="!hasData">
        导出
      </el-button>
    </div>

    <!-- 导出选项弹窗 -->
    <el-dialog
      v-model="showExportDialog"
      title="导出分析报告"
      width="500px"
      :before-close="closeExportDialog"
    >
      <div class="export-options">
        <el-form :model="exportConfig" label-width="100px">
          <el-form-item label="导出格式">
            <el-radio-group v-model="exportConfig.format">
              <el-radio value="pdf">PDF报告</el-radio>
              <el-radio value="word">Word文档</el-radio>
              <el-radio value="excel">Excel表格</el-radio>
              <el-radio value="json">JSON数据</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="包含内容">
            <el-checkbox-group v-model="exportConfig.includes">
              <el-checkbox value="summary">分析摘要</el-checkbox>
              <el-checkbox value="metrics">关键指标</el-checkbox>
              <el-checkbox value="insights">核心洞察</el-checkbox>
              <el-checkbox value="recommendations">建议行动</el-checkbox>
              <el-checkbox value="charts">图表数据</el-checkbox>
              <el-checkbox value="history">历史对比</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="报告标题">
            <el-input v-model="exportConfig.title" placeholder="请输入报告标题" />
          </el-form-item>

          <el-form-item label="分析师">
            <el-input v-model="exportConfig.analyst" placeholder="请输入分析师姓名" />
          </el-form-item>

          <el-form-item label="备注">
            <el-input 
              v-model="exportConfig.notes" 
              type="textarea" 
              :rows="3"
              placeholder="请输入备注信息"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeExportDialog">取消</el-button>
          <el-button type="primary" @click="executeExport" :loading="exporting">
            {{ exporting ? '导出中...' : '确认导出' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 导出预览 -->
    <div v-if="hasData" class="export-preview">
      <div class="preview-header">
        <h5>📋 报告预览</h5>
        <el-button size="small" text @click="togglePreview">
          {{ showPreview ? '收起' : '展开' }}
        </el-button>
      </div>
      
      <div v-show="showPreview" class="preview-content">
        <div class="preview-section">
          <h6>分析摘要</h6>
          <p>{{ generateSummary() }}</p>
        </div>
        
        <div class="preview-section" v-if="analysisData.keyMetrics?.length">
          <h6>关键指标 ({{ analysisData.keyMetrics.length }}项)</h6>
          <div class="metrics-preview">
            <span 
              v-for="metric in analysisData.keyMetrics.slice(0, 3)" 
              :key="metric.name"
              class="metric-tag"
            >
              {{ metric.name }}: {{ metric.value }}
            </span>
          </div>
        </div>

        <div class="preview-section" v-if="analysisData.insights?.length">
          <h6>核心洞察 ({{ analysisData.insights.length }}项)</h6>
          <ul class="insights-preview">
            <li v-for="insight in analysisData.insights.slice(0, 2)" :key="insight.id">
              {{ insight.title }}
            </li>
          </ul>
        </div>

        <div class="preview-section" v-if="analysisData.recommendations?.length">
          <h6>建议行动 ({{ analysisData.recommendations.length }}项)</h6>
          <ul class="recommendations-preview">
            <li v-for="rec in analysisData.recommendations.slice(0, 2)" :key="rec.id">
              {{ rec.title }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElDialog, ElForm, ElFormItem, ElRadioGroup, ElRadio, ElCheckboxGroup, ElCheckbox, ElInput, ElButton } from 'element-plus';

const props = defineProps({
  analysisData: {
    type: Object,
    default: () => ({})
  },
  currentQuery: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['export-complete']);

// 导出配置
const exportConfig = ref({
  format: 'pdf',
  includes: ['summary', 'metrics', 'insights', 'recommendations'],
  title: '',
  analyst: '',
  notes: ''
});

// 状态管理
const showExportDialog = ref(false);
const showPreview = ref(false);
const exporting = ref(false);

// 计算属性
const hasData = computed(() => {
  return props.analysisData && Object.keys(props.analysisData).length > 0;
});

// 生成摘要
const generateSummary = () => {
  if (!props.analysisData) return '暂无分析数据';
  
  const parts = [];
  
  if (props.currentQuery) {
    parts.push(`针对"${props.currentQuery}"的分析`);
  }
  
  if (props.analysisData.keyMetrics?.length) {
    parts.push(`包含${props.analysisData.keyMetrics.length}项关键指标`);
  }
  
  if (props.analysisData.insights?.length) {
    parts.push(`${props.analysisData.insights.length}个核心洞察`);
  }
  
  if (props.analysisData.recommendations?.length) {
    parts.push(`${props.analysisData.recommendations.length}条建议行动`);
  }
  
  return parts.join('，') || '综合质量分析报告';
};

// 切换预览
const togglePreview = () => {
  showPreview.value = !showPreview.value;
};

// 关闭导出弹窗
const closeExportDialog = () => {
  showExportDialog.value = false;
  exporting.value = false;
};

// 执行导出
const executeExport = async () => {
  exporting.value = true;
  
  try {
    const exportData = prepareExportData();
    
    switch (exportConfig.value.format) {
      case 'pdf':
        await exportToPDF(exportData);
        break;
      case 'word':
        await exportToWord(exportData);
        break;
      case 'excel':
        await exportToExcel(exportData);
        break;
      case 'json':
        await exportToJSON(exportData);
        break;
    }
    
    emit('export-complete', {
      format: exportConfig.value.format,
      data: exportData
    });
    
    closeExportDialog();
  } catch (error) {
    console.error('导出失败:', error);
    // 这里可以添加错误提示
  } finally {
    exporting.value = false;
  }
};

// 准备导出数据
const prepareExportData = () => {
  const data = {
    meta: {
      title: exportConfig.value.title || generateSummary(),
      analyst: exportConfig.value.analyst || 'IQE AI助手',
      exportTime: new Date().toISOString(),
      query: props.currentQuery,
      notes: exportConfig.value.notes
    },
    content: {}
  };

  const includes = exportConfig.value.includes;
  
  if (includes.includes('summary')) {
    data.content.summary = generateSummary();
  }
  
  if (includes.includes('metrics') && props.analysisData.keyMetrics) {
    data.content.metrics = props.analysisData.keyMetrics;
  }
  
  if (includes.includes('insights') && props.analysisData.insights) {
    data.content.insights = props.analysisData.insights;
  }
  
  if (includes.includes('recommendations') && props.analysisData.recommendations) {
    data.content.recommendations = props.analysisData.recommendations;
  }
  
  if (includes.includes('charts') && props.analysisData.chartData) {
    data.content.charts = props.analysisData.chartData;
  }
  
  return data;
};

// 导出为PDF
const exportToPDF = async (data) => {
  // 这里使用简单的HTML转PDF方案
  const htmlContent = generateHTMLReport(data);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  downloadFile(blob, `IQE分析报告_${getTimestamp()}.html`, 'text/html');
};

// 导出为Word
const exportToWord = async (data) => {
  const htmlContent = generateHTMLReport(data);
  const blob = new Blob([htmlContent], { type: 'application/msword' });
  downloadFile(blob, `IQE分析报告_${getTimestamp()}.doc`, 'application/msword');
};

// 导出为Excel
const exportToExcel = async (data) => {
  const csvContent = generateCSVReport(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, `IQE分析报告_${getTimestamp()}.csv`, 'text/csv');
};

// 导出为JSON
const exportToJSON = async (data) => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  downloadFile(blob, `IQE分析报告_${getTimestamp()}.json`, 'application/json');
};

// 生成HTML报告
const generateHTMLReport = (data) => {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${data.meta.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { border-bottom: 2px solid #409eff; padding-bottom: 20px; margin-bottom: 30px; }
        .title { color: #2c3e50; font-size: 24px; margin: 0; }
        .meta { color: #606266; font-size: 14px; margin-top: 10px; }
        .section { margin-bottom: 30px; }
        .section-title { color: #409eff; font-size: 18px; margin-bottom: 15px; border-left: 4px solid #409eff; padding-left: 10px; }
        .metric-item { background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 4px; }
        .insight-item { margin: 10px 0; padding: 10px; border-left: 3px solid #67c23a; background: #f0f9ff; }
        .recommendation-item { margin: 10px 0; padding: 10px; border-left: 3px solid #e6a23c; background: #fdf6ec; }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">${data.meta.title}</h1>
        <div class="meta">
            <p>分析师: ${data.meta.analyst} | 导出时间: ${new Date(data.meta.exportTime).toLocaleString()}</p>
            <p>查询: ${data.meta.query}</p>
        </div>
    </div>
    
    ${data.content.summary ? `
    <div class="section">
        <h2 class="section-title">分析摘要</h2>
        <p>${data.content.summary}</p>
    </div>
    ` : ''}
    
    ${data.content.metrics ? `
    <div class="section">
        <h2 class="section-title">关键指标</h2>
        ${data.content.metrics.map(metric => `
            <div class="metric-item">
                <strong>${metric.name}:</strong> ${metric.value} <span style="color: #67c23a;">${metric.trendText || ''}</span>
            </div>
        `).join('')}
    </div>
    ` : ''}
    
    ${data.content.insights ? `
    <div class="section">
        <h2 class="section-title">核心洞察</h2>
        ${data.content.insights.map(insight => `
            <div class="insight-item">
                <strong>${insight.title}</strong><br>
                ${insight.description}
            </div>
        `).join('')}
    </div>
    ` : ''}
    
    ${data.content.recommendations ? `
    <div class="section">
        <h2 class="section-title">建议行动</h2>
        ${data.content.recommendations.map(rec => `
            <div class="recommendation-item">
                <strong>[${rec.priority}] ${rec.title}</strong><br>
                ${rec.description}
            </div>
        `).join('')}
    </div>
    ` : ''}
    
    ${data.meta.notes ? `
    <div class="section">
        <h2 class="section-title">备注</h2>
        <p>${data.meta.notes}</p>
    </div>
    ` : ''}
</body>
</html>
  `;
};

// 生成CSV报告
const generateCSVReport = (data) => {
  let csv = `IQE分析报告\n`;
  csv += `标题,${data.meta.title}\n`;
  csv += `分析师,${data.meta.analyst}\n`;
  csv += `导出时间,${new Date(data.meta.exportTime).toLocaleString()}\n`;
  csv += `查询,${data.meta.query}\n\n`;
  
  if (data.content.metrics) {
    csv += `关键指标\n`;
    csv += `指标名称,数值,趋势\n`;
    data.content.metrics.forEach(metric => {
      csv += `${metric.name},${metric.value},${metric.trendText || ''}\n`;
    });
    csv += `\n`;
  }
  
  return csv;
};

// 下载文件
const downloadFile = (blob, filename, mimeType) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 获取时间戳
const getTimestamp = () => {
  return new Date().toISOString().split('T')[0].replace(/-/g, '');
};

// 初始化导出配置
const initExportConfig = () => {
  exportConfig.value.title = generateSummary();
};

// 监听数据变化
import { watch } from 'vue';
watch(() => props.analysisData, () => {
  if (hasData.value) {
    initExportConfig();
  }
}, { immediate: true });
</script>

<style scoped>
.export-panel {
  margin-top: 16px;
}

.export-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.export-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 600;
}

.export-options {
  padding: 0;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.preview-header h5 {
  margin: 0;
  color: #2c3e50;
  font-size: 13px;
  font-weight: 600;
}

.preview-content {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
  font-size: 12px;
}

.preview-section {
  margin-bottom: 12px;
}

.preview-section:last-child {
  margin-bottom: 0;
}

.preview-section h6 {
  margin: 0 0 6px 0;
  color: #409eff;
  font-size: 12px;
  font-weight: 600;
}

.preview-section p {
  margin: 0;
  color: #606266;
  line-height: 1.4;
}

.metrics-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.metric-tag {
  background: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  color: #409eff;
  border: 1px solid #b3d8ff;
}

.insights-preview,
.recommendations-preview {
  margin: 0;
  padding-left: 16px;
  color: #606266;
}

.insights-preview li,
.recommendations-preview li {
  margin-bottom: 4px;
  line-height: 1.3;
}
</style>
