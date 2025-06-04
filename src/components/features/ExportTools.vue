<template>
  <div class="export-tools">
    <el-dropdown @command="handleExport" trigger="click">
      <el-button type="primary">
        导出对话 <el-icon class="el-icon--right"><arrow-down /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="markdown">Markdown 格式</el-dropdown-item>
          <el-dropdown-item command="html">HTML 格式</el-dropdown-item>
          <el-dropdown-item command="pdf">PDF 格式</el-dropdown-item>
          <el-dropdown-item command="excel">Excel 格式</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    
    <!-- PDF 导出设置对话框 -->
    <el-dialog
      v-model="showPdfSettings"
      title="PDF 导出设置"
      width="500px"
      destroy-on-close
    >
      <el-form label-position="top">
        <el-form-item label="文档标题">
          <el-input v-model="pdfSettings.title" placeholder="IQE动态检验对话记录" />
        </el-form-item>
        
        <el-form-item label="包含内容">
          <el-checkbox v-model="pdfSettings.includeCharts">包含图表</el-checkbox>
          <el-checkbox v-model="pdfSettings.includeImages">包含图片</el-checkbox>
          <el-checkbox v-model="pdfSettings.includeSummary">包含数据摘要</el-checkbox>
        </el-form-item>
        
        <el-form-item label="页面大小">
          <el-select v-model="pdfSettings.pageSize" style="width: 100%">
            <el-option label="A4" value="a4" />
            <el-option label="A3" value="a3" />
            <el-option label="Letter" value="letter" />
            <el-option label="Legal" value="legal" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="页面方向">
          <el-radio-group v-model="pdfSettings.orientation">
            <el-radio label="portrait">纵向</el-radio>
            <el-radio label="landscape">横向</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showPdfSettings = false">取消</el-button>
        <el-button type="primary" @click="exportToPdf">导出</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue';
import { saveAs } from 'file-saver';
import { utils, write } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const props = defineProps({
  messages: {
    type: Array,
    required: true
  },
  charts: {
    type: Array,
    default: () => []
  },
  scenarioData: {
    type: Object,
    default: () => ({})
  },
  fileName: {
    type: String,
    default: 'IQE动态检验对话'
  }
});

// PDF导出设置
const showPdfSettings = ref(false);
const pdfSettings = reactive({
  title: 'IQE动态检验对话记录',
  includeCharts: true,
  includeImages: true,
  includeSummary: true,
  pageSize: 'a4',
  orientation: 'portrait'
});

// 处理导出命令
const handleExport = (format) => {
  if (!props.messages || props.messages.length === 0) {
    ElMessage.warning('没有对话内容可导出');
    return;
  }
  
  switch (format) {
    case 'markdown':
      exportToMarkdown();
      break;
    case 'html':
      exportToHtml();
      break;
    case 'pdf':
      showPdfSettings.value = true;
      break;
    case 'excel':
      exportToExcel();
      break;
    default:
      ElMessage.error('不支持的导出格式');
  }
};

// 导出为Markdown
const exportToMarkdown = () => {
  try {
    // 生成Markdown内容
    let content = `# ${props.fileName}\n\n`;
    content += `导出时间: ${new Date().toLocaleString()}\n\n`;
    
    // 添加对话内容
    props.messages.forEach(message => {
      const role = message.role === 'user' ? '用户' : 'AI助手';
      content += `## ${role} (${formatTime(message.timestamp)})\n\n`;
      content += `${message.content}\n\n`;
      
      // 添加图表描述
      if (message.charts && message.charts.length > 0) {
        content += '### 图表\n\n';
        message.charts.forEach(chart => {
          content += `- ${chart.title}\n`;
        });
        content += '\n';
      }
      
      // 添加图片描述
      if (message.images && message.images.length > 0) {
        content += '### 图片\n\n';
        message.images.forEach(image => {
          content += `- ${image.caption || '图片'}\n`;
        });
        content += '\n';
      }
    });
    
    // 保存文件
    const blob = new Blob([content], { type: 'text/markdown' });
    saveAs(blob, `${props.fileName}.md`);
    
    ElMessage.success('导出Markdown成功');
  } catch (error) {
    console.error('导出Markdown失败:', error);
    ElMessage.error('导出Markdown失败');
  }
};

// 导出为HTML
const exportToHtml = () => {
  try {
    // 生成HTML内容
    let content = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>${props.fileName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 10px;
              border-bottom: 1px solid #eee;
            }
            .message {
              margin-bottom: 20px;
              padding: 15px;
              border-radius: 8px;
            }
            .user-message {
              background-color: #e1f3ff;
            }
            .ai-message {
              background-color: #f9f9f9;
            }
            .message-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              font-size: 14px;
              color: #666;
            }
            .message-content {
              white-space: pre-wrap;
            }
            .charts-section, .images-section {
              margin-top: 15px;
              padding-top: 10px;
              border-top: 1px dashed #ddd;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${props.fileName}</h1>
            <p>导出时间: ${new Date().toLocaleString()}</p>
          </div>
          <div class="content">
    `;
    
    // 添加对话内容
    props.messages.forEach(message => {
      const role = message.role === 'user' ? '用户' : 'AI助手';
      const messageClass = message.role === 'user' ? 'user-message' : 'ai-message';
      
      content += `
        <div class="message ${messageClass}">
          <div class="message-header">
            <span>${role}</span>
            <span>${formatTime(message.timestamp)}</span>
          </div>
          <div class="message-content">${message.content}</div>
      `;
      
      // 添加图表描述
      if (message.charts && message.charts.length > 0) {
        content += `
          <div class="charts-section">
            <h4>图表:</h4>
            <ul>
        `;
        
        message.charts.forEach(chart => {
          content += `<li>${chart.title}</li>`;
        });
        
        content += `
            </ul>
          </div>
        `;
      }
      
      // 添加图片描述
      if (message.images && message.images.length > 0) {
        content += `
          <div class="images-section">
            <h4>图片:</h4>
            <ul>
        `;
        
        message.images.forEach(image => {
          content += `<li>${image.caption || '图片'}</li>`;
        });
        
        content += `
            </ul>
          </div>
        `;
      }
      
      content += `</div>`;
    });
    
    // 添加页脚
    content += `
          </div>
          <div class="footer">
            <p>由IQE动态检验系统生成</p>
          </div>
        </body>
      </html>
    `;
    
    // 保存文件
    const blob = new Blob([content], { type: 'text/html' });
    saveAs(blob, `${props.fileName}.html`);
    
    ElMessage.success('导出HTML成功');
  } catch (error) {
    console.error('导出HTML失败:', error);
    ElMessage.error('导出HTML失败');
  }
};

// 导出为PDF
const exportToPdf = () => {
  try {
    // 创建PDF文档
    const doc = new jsPDF({
      orientation: pdfSettings.orientation,
      unit: 'mm',
      format: pdfSettings.pageSize
    });
    
    // 添加标题
    doc.setFontSize(18);
    doc.text(pdfSettings.title, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    
    // 添加导出时间
    doc.setFontSize(10);
    doc.text(`导出时间: ${new Date().toLocaleString()}`, doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
    
    // 添加对话内容
    let yPos = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    
    // 添加数据摘要
    if (pdfSettings.includeSummary && props.scenarioData && Object.keys(props.scenarioData).length > 0) {
      doc.setFontSize(14);
      doc.text('数据摘要', margin, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      Object.entries(props.scenarioData).forEach(([key, value]) => {
        // 检查是否需要换页
        if (yPos > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.text(`${key}: ${value}`, margin, yPos);
        yPos += 6;
      });
      
      yPos += 10;
    }
    
    // 添加对话内容
    doc.setFontSize(14);
    doc.text('对话记录', margin, yPos);
    yPos += 10;
    
    // 创建表格数据
    const tableData = [];
    props.messages.forEach(message => {
      const role = message.role === 'user' ? '用户' : 'AI助手';
      const time = formatTime(message.timestamp);
      const content = message.content;
      
      tableData.push([role, time, content]);
    });
    
    // 添加表格
    doc.autoTable({
      startY: yPos,
      head: [['发送者', '时间', '内容']],
      body: tableData,
      margin: { top: 40, right: margin, bottom: 20, left: margin },
      styles: {
        overflow: 'linebreak',
        cellWidth: 'auto'
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 30 },
        2: { cellWidth: 'auto' }
      },
      didDrawPage: (data) => {
        // 添加页码
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(10);
          doc.text(`第 ${i} 页，共 ${pageCount} 页`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        }
      }
    });
    
    // 保存文件
    doc.save(`${props.fileName}.pdf`);
    
    showPdfSettings.value = false;
    ElMessage.success('导出PDF成功');
  } catch (error) {
    console.error('导出PDF失败:', error);
    ElMessage.error('导出PDF失败');
  }
};

// 导出为Excel
const exportToExcel = () => {
  try {
    // 创建工作簿
    const wb = utils.book_new();
    
    // 创建对话工作表
    const dialogData = [
      ['发送者', '时间', '内容'] // 表头
    ];
    
    // 添加对话数据
    props.messages.forEach(message => {
      const role = message.role === 'user' ? '用户' : 'AI助手';
      const time = formatTime(message.timestamp);
      const content = message.content;
      
      dialogData.push([role, time, content]);
    });
    
    // 创建工作表
    const ws = utils.aoa_to_sheet(dialogData);
    
    // 设置列宽
    ws['!cols'] = [
      { wch: 10 }, // 发送者列宽
      { wch: 20 }, // 时间列宽
      { wch: 100 } // 内容列宽
    ];
    
    // 添加工作表到工作簿
    utils.book_append_sheet(wb, ws, '对话记录');
    
    // 如果有场景数据，添加场景数据工作表
    if (props.scenarioData && Object.keys(props.scenarioData).length > 0) {
      const scenarioData = [
        ['属性', '值'] // 表头
      ];
      
      // 添加场景数据
      Object.entries(props.scenarioData).forEach(([key, value]) => {
        scenarioData.push([key, value]);
      });
      
      // 创建工作表
      const scenarioWs = utils.aoa_to_sheet(scenarioData);
      
      // 设置列宽
      scenarioWs['!cols'] = [
        { wch: 20 }, // 属性列宽
        { wch: 50 } // 值列宽
      ];
      
      // 添加工作表到工作簿
      utils.book_append_sheet(wb, scenarioWs, '场景数据');
    }
    
    // 导出Excel文件
    const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${props.fileName}.xlsx`);
    
    ElMessage.success('导出Excel成功');
  } catch (error) {
    console.error('导出Excel失败:', error);
    ElMessage.error('导出Excel失败');
  }
};

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', { 
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};
</script>

<style scoped>
.export-tools {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}
</style> 
 
 