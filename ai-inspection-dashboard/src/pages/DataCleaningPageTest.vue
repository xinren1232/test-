<template>
  <div class="data-cleaning-page">
    <!-- 页面头部导航 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h2>数据清洗治理系统</h2>
          <p>智能化数据处理与质量管控平台</p>
        </div>
        <div class="header-actions">
          <el-button-group>
            <el-button
              :type="activeTab === 'upload' ? 'primary' : ''"
              @click="switchTab('upload')"
            >
              <el-icon><Upload /></el-icon>
              数据上传
            </el-button>
            <el-button
              :type="activeTab === 'rules' ? 'primary' : ''"
              @click="switchTab('rules')"
            >
              <el-icon><Setting /></el-icon>
              规则配置
            </el-button>
            <el-button
              :type="activeTab === 'monitor' ? 'primary' : ''"
              @click="switchTab('monitor')"
            >
              <el-icon><DataAnalysis /></el-icon>
              流程监控
            </el-button>
            <el-button
              :type="activeTab === 'results' ? 'primary' : ''"
              @click="switchTab('results')"
            >
              <el-icon><Document /></el-icon>
              处理结果
            </el-button>
          </el-button-group>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="page-content">
      <!-- 数据上传模块 -->
      <div v-show="activeTab === 'upload'" class="tab-content">
        <DataUploadModule
          @file-uploaded="handleFileUploaded"
          @start-processing="handleStartProcessing"
        />
      </div>

      <!-- 规则配置模块 -->
      <div v-show="activeTab === 'rules'" class="tab-content">
        <EnhancedRulesManager
          @rules-updated="handleRulesUpdated"
        />
      </div>

      <!-- 流程监控模块 -->
      <div v-show="activeTab === 'monitor'" class="tab-content">
        <ProcessMonitor
          :processing-data="processingData"
          :current-stage="currentStage"
          @stage-completed="handleStageCompleted"
        />
      </div>

      <!-- 处理结果模块 -->
      <div v-show="activeTab === 'results'" class="tab-content">
        <ProcessingResults
          :results="processingResults"
          @export-data="handleExportData"
        />
      </div>
    </div>

    <!-- 快速操作浮动按钮 -->
    <div class="quick-actions">
      <el-tooltip content="快速上传文件" placement="left">
        <el-button
          type="primary"
          circle
          size="large"
          @click="quickUpload"
          class="quick-btn upload-btn"
        >
          <el-icon><Plus /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="查看帮助" placement="left">
        <el-button
          type="info"
          circle
          @click="showHelp"
          class="quick-btn help-btn"
        >
          <el-icon><QuestionFilled /></el-icon>
        </el-button>
      </el-tooltip>
    </div>

    <!-- 帮助对话框 -->
    <el-dialog
      v-model="helpDialogVisible"
      title="使用帮助"
      width="60%"
      :before-close="closeHelp"
    >
      <div class="help-content">
        <el-collapse v-model="activeHelp">
          <el-collapse-item title="如何上传和处理文件？" name="upload">
            <div class="help-section">
              <h4>文件上传步骤：</h4>
              <ol>
                <li>选择合适的数据源类型（8D报告、常规案例等）</li>
                <li>点击上传区域或拖拽文件到指定区域</li>
                <li>等待系统自动分析文件内容和结构</li>
                <li>确认分析结果后开始数据清洗处理</li>
                <li>查看处理结果和质量报告</li>
              </ol>

              <h4>支持的文件格式：</h4>
              <ul>
                <li>文本文件：.txt, .doc, .docx</li>
                <li>表格文件：.xls, .xlsx, .csv</li>
                <li>PDF文件：.pdf</li>
                <li>图像文件：.jpg, .png, .bmp</li>
              </ul>
            </div>
          </el-collapse-item>

          <el-collapse-item title="数据清洗规则说明" name="rules">
            <div class="help-section">
              <h4>基础清洗规则：</h4>
              <ul>
                <li><strong>去除空值：</strong>移除空白、null、undefined等无效数据</li>
                <li><strong>去除空白字符：</strong>移除字段值前后的空白字符</li>
                <li><strong>去除重复数据：</strong>基于关键字段去除重复记录</li>
              </ul>

              <h4>高级清洗规则：</h4>
              <ul>
                <li><strong>数据格式标准化：</strong>统一日期、数字、文本格式</li>
                <li><strong>数据验证：</strong>检查数据完整性和有效性</li>
                <li><strong>智能修复：</strong>AI辅助修复常见数据问题</li>
              </ul>
            </div>
          </el-collapse-item>

          <el-collapse-item title="处理流程监控" name="monitor">
            <div class="help-section">
              <h4>6阶段处理流程：</h4>
              <ol>
                <li><strong>数据上传：</strong>文件验证和存储</li>
                <li><strong>数据解析：</strong>内容解析和结构分析</li>
                <li><strong>数据清洗：</strong>应用清洗规则</li>
                <li><strong>信息提取：</strong>提取关键数据信息</li>
                <li><strong>结果汇总：</strong>生成处理报告</li>
                <li><strong>AI总结：</strong>智能分析和建议</li>
              </ol>
            </div>
          </el-collapse-item>

          <el-collapse-item title="常见问题解答" name="faq">
            <div class="help-section">
              <h4>常见问题：</h4>
              <ul>
                <li><strong>Q: 支持哪些文件格式？</strong><br>A: 支持Excel、CSV、PDF、Word、TXT等多种格式</li>
                <li><strong>Q: 文件大小限制是多少？</strong><br>A: 单个文件最大支持50MB</li>
                <li><strong>Q: 处理时间需要多久？</strong><br>A: 根据文件大小和复杂度，通常1-5分钟</li>
                <li><strong>Q: 数据安全如何保障？</strong><br>A: 所有数据本地处理，不会上传到外部服务器</li>
              </ul>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeHelp">关闭</el-button>
          <el-button type="primary" @click="contactSupport">联系技术支持</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Upload,
  DataAnalysis,
  Setting,
  Plus,
  QuestionFilled,
  Document
} from '@element-plus/icons-vue'

import DataUploadModule from '../components/data-cleaning/DataUploadModule.vue'
import EnhancedRulesManager from '../components/data-cleaning/EnhancedRulesManager.vue'
import ProcessMonitor from '../components/data-cleaning/ProcessMonitor.vue'
import ProcessingResults from '../components/data-cleaning/ProcessingResults.vue'

export default {
  name: 'DataCleaningPage',
  components: {
    DataUploadModule,
    EnhancedRulesManager,
    ProcessMonitor,
    ProcessingResults,
    Upload,
    DataAnalysis,
    Setting,
    Plus,
    QuestionFilled,
    Document
  },
  setup() {
    const activeTab = ref('upload')
    const helpDialogVisible = ref(false)
    const activeHelp = ref(['upload'])

    // 处理流程相关状态
    const processingData = ref(null)
    const currentStage = ref('')
    const processingResults = ref(null)

    const switchTab = (tab) => {
      activeTab.value = tab
      ElMessage.success(`已切换到${getTabName(tab)}`)
    }

    const getTabName = (tab) => {
      const names = {
        upload: '数据上传',
        rules: '规则配置',
        monitor: '流程监控',
        results: '处理结果'
      }
      return names[tab] || tab
    }

    // 处理文件上传
    const handleFileUploaded = (fileData) => {
      processingData.value = fileData
      ElMessage.success('文件上传成功')
    }

    // 开始处理流程
    const handleStartProcessing = (config) => {
      currentStage.value = 'parsing'
      activeTab.value = 'monitor'
      ElMessage.info('开始数据处理流程')
    }

    // 处理规则更新
    const handleRulesUpdated = (rules) => {
      ElMessage.success('清洗规则已更新')
    }

    // 处理阶段完成
    const handleStageCompleted = (stage, results) => {
      if (stage === 'ai-summary') {
        processingResults.value = results
        activeTab.value = 'results'
        ElMessage.success('数据处理流程已完成')
      }
    }

    // 导出数据
    const handleExportData = (format) => {
      ElMessage.success(`数据已导出为 ${format} 格式`)
    }

    const quickUpload = () => {
      if (activeTab.value !== 'upload') {
        activeTab.value = 'upload'
      }
      ElMessage.info('请在数据上传模块中上传文件')
    }

    const showHelp = () => {
      helpDialogVisible.value = true
    }

    const closeHelp = () => {
      helpDialogVisible.value = false
    }

    const contactSupport = () => {
      ElMessage.success('技术支持联系方式已发送到您的邮箱')
      closeHelp()
    }
    return {
      activeTab,
      helpDialogVisible,
      activeHelp,
      processingData,
      currentStage,
      processingResults,
      switchTab,
      handleFileUploaded,
      handleStartProcessing,
      handleRulesUpdated,
      handleStageCompleted,
      handleExportData,
      quickUpload,
      showHelp,
      closeHelp,
      contactSupport
    }
  }
}
</script>

<style scoped>
.data-cleaning-page {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 30px;
  margin-bottom: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.header-left h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.header-left p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  align-items: center;
}

.page-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px;
}

.tab-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  min-height: 600px;
}

/* 快速操作按钮 */
.quick-actions {
  position: fixed;
  right: 30px;
  bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  z-index: 1000;
}

.quick-btn {
  width: 56px;
  height: 56px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.quick-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.upload-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.help-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
}

/* 帮助对话框样式 */
.help-content {
  max-height: 500px;
  overflow-y: auto;
}

.help-section {
  padding: 15px 0;
}

.help-section h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-weight: 600;
}

.help-section ol,
.help-section ul {
  margin: 0;
  padding-left: 20px;
}

.help-section li {
  margin-bottom: 8px;
  line-height: 1.6;
}

.help-section strong {
  color: #409eff;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-content {
    padding: 15px;
  }

  .header-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .quick-actions {
    right: 15px;
    bottom: 15px;
  }

  .quick-btn {
    width: 48px;
    height: 48px;
  }
}

.header-actions {
  display: flex;
  align-items: center;
}

.page-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.tab-content {
  min-height: 400px;
}

.loading-placeholder {
  background: white;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.component-status {
  max-width: 1400px;
  margin: 20px auto;
  padding: 0 20px;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .page-content {
    padding: 10px;
  }
}
</style>
