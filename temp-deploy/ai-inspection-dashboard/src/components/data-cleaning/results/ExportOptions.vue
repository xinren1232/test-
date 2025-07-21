<template>
  <div class="export-options">
    <!-- 导出格式选择 -->
    <el-card class="format-selection">
      <template #header>
        <h4>📤 选择导出格式</h4>
      </template>
      
      <div class="format-grid">
        <div 
          v-for="format in exportFormats"
          :key="format.type"
          class="format-card"
          :class="{ 'selected': selectedFormat === format.type }"
          @click="selectFormat(format.type)"
        >
          <div class="format-icon">
            <el-icon><component :is="format.icon" /></el-icon>
          </div>
          <div class="format-info">
            <h5>{{ format.name }}</h5>
            <p>{{ format.description }}</p>
            <div class="format-features">
              <el-tag 
                v-for="feature in format.features"
                :key="feature"
                size="small"
                type="info"
              >
                {{ feature }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 导出配置 -->
    <el-card v-if="selectedFormat" class="export-config">
      <template #header>
        <h4>⚙️ 导出配置</h4>
      </template>
      
      <el-form :model="exportConfig" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="文件名称">
              <el-input 
                v-model="exportConfig.filename" 
                placeholder="输入文件名"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="包含内容">
              <el-checkbox-group v-model="exportConfig.includeContent">
                <el-checkbox label="cleanedData">清洗后数据</el-checkbox>
                <el-checkbox label="originalData">原始数据</el-checkbox>
                <el-checkbox label="report">清洗报告</el-checkbox>
                <el-checkbox label="summary">AI总结</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" v-if="selectedFormat === 'excel'">
          <el-col :span="12">
            <el-form-item label="工作表设置">
              <el-checkbox v-model="exportConfig.multipleSheets">
                分别创建工作表
              </el-checkbox>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="包含图表">
              <el-checkbox v-model="exportConfig.includeCharts">
                包含质量分析图表
              </el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" v-if="selectedFormat === 'csv'">
          <el-col :span="12">
            <el-form-item label="编码格式">
              <el-select v-model="exportConfig.encoding">
                <el-option label="UTF-8" value="utf-8" />
                <el-option label="GBK" value="gbk" />
                <el-option label="GB2312" value="gb2312" />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="分隔符">
              <el-select v-model="exportConfig.delimiter">
                <el-option label="逗号 (,)" value="," />
                <el-option label="分号 (;)" value=";" />
                <el-option label="制表符" value="\t" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" v-if="selectedFormat === 'pdf'">
          <el-col :span="12">
            <el-form-item label="页面方向">
              <el-radio-group v-model="exportConfig.orientation">
                <el-radio label="portrait">纵向</el-radio>
                <el-radio label="landscape">横向</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="包含封面">
              <el-checkbox v-model="exportConfig.includeCover">
                生成报告封面
              </el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 预览和统计 -->
    <el-card v-if="selectedFormat" class="export-preview">
      <template #header>
        <h4>👀 导出预览</h4>
      </template>
      
      <div class="preview-stats">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">数据记录</div>
              <div class="stat-value">{{ getDataCount() }}</div>
            </div>
          </el-col>
          
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">预计大小</div>
              <div class="stat-value">{{ getEstimatedSize() }}</div>
            </div>
          </el-col>
          
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">包含内容</div>
              <div class="stat-value">{{ exportConfig.includeContent.length }} 项</div>
            </div>
          </el-col>
          
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-label">文件格式</div>
              <div class="stat-value">{{ selectedFormat.toUpperCase() }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
      
      <div class="preview-content">
        <h5>将要导出的内容:</h5>
        <ul class="content-list">
          <li v-if="exportConfig.includeContent.includes('cleanedData')">
            <el-icon><Document /></el-icon>
            清洗后数据 ({{ data.length }} 条记录)
          </li>
          <li v-if="exportConfig.includeContent.includes('originalData')">
            <el-icon><FolderOpened /></el-icon>
            原始数据 (用于对比)
          </li>
          <li v-if="exportConfig.includeContent.includes('report')">
            <el-icon><Notebook /></el-icon>
            清洗报告 (规则执行结果、质量分析)
          </li>
          <li v-if="exportConfig.includeContent.includes('summary')">
            <el-icon><MagicStick /></el-icon>
            AI总结报告 (智能分析和建议)
          </li>
        </ul>
      </div>
    </el-card>

    <!-- 导出操作 -->
    <div class="export-actions">
      <el-button 
        type="primary" 
        size="large"
        @click="startExport"
        :loading="isExporting"
        :disabled="!selectedFormat || exportConfig.includeContent.length === 0"
      >
        <el-icon><Download /></el-icon>
        开始导出
      </el-button>
      
      <el-button 
        size="large"
        @click="previewExport"
        :disabled="!selectedFormat"
      >
        <el-icon><View /></el-icon>
        预览导出
      </el-button>
      
      <el-button 
        size="large"
        @click="saveTemplate"
      >
        <el-icon><Star /></el-icon>
        保存为模板
      </el-button>
    </div>

    <!-- 导出进度对话框 -->
    <el-dialog
      v-model="exportProgressVisible"
      title="导出进度"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="export-progress">
        <div class="progress-info">
          <span>正在导出: {{ currentExportStep }}</span>
          <span>{{ exportProgress }}%</span>
        </div>
        <el-progress 
          :percentage="exportProgress" 
          :status="exportProgress === 100 ? 'success' : undefined"
          :stroke-width="8"
        />
        
        <div class="progress-details">
          <div 
            v-for="step in exportSteps"
            :key="step.name"
            class="step-item"
            :class="{ 'completed': step.completed, 'current': step.current }"
          >
            <el-icon v-if="step.completed"><CircleCheck /></el-icon>
            <el-icon v-else-if="step.current"><Loading /></el-icon>
            <el-icon v-else><Clock /></el-icon>
            <span>{{ step.name }}</span>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button 
          v-if="exportProgress === 100" 
          type="primary" 
          @click="downloadFile"
        >
          下载文件
        </el-button>
        <el-button 
          v-else 
          @click="cancelExport"
        >
          取消导出
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Document,
  FolderOpened,
  Notebook,
  MagicStick,
  Download,
  View,
  Star,
  CircleCheck,
  Loading,
  Clock,
  Files,
  PictureRounded,
  DataAnalysis
} from '@element-plus/icons-vue'

export default {
  name: 'ExportOptions',
  components: {
    Document,
    FolderOpened,
    Notebook,
    MagicStick,
    Download,
    View,
    Star,
    CircleCheck,
    Loading,
    Clock,
    Files,
    PictureRounded,
    DataAnalysis
  },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    report: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['export-completed'],
  setup(props, { emit }) {
    const selectedFormat = ref('')
    const isExporting = ref(false)
    const exportProgressVisible = ref(false)
    const exportProgress = ref(0)
    const currentExportStep = ref('')

    const exportFormats = ref([
      {
        type: 'excel',
        name: 'Excel 工作簿',
        description: '完整的数据表格，支持多工作表和图表',
        icon: 'Files',
        features: ['多工作表', '图表支持', '格式丰富']
      },
      {
        type: 'csv',
        name: 'CSV 文件',
        description: '纯文本格式，兼容性好',
        icon: 'Document',
        features: ['轻量级', '通用格式', '易处理']
      },
      {
        type: 'pdf',
        name: 'PDF 报告',
        description: '专业的报告格式，包含图表和分析',
        icon: 'PictureRounded',
        features: ['专业报告', '图表丰富', '打印友好']
      },
      {
        type: 'json',
        name: 'JSON 数据',
        description: '结构化数据格式，便于程序处理',
        icon: 'DataAnalysis',
        features: ['结构化', '程序友好', '完整信息']
      }
    ])

    const exportConfig = ref({
      filename: 'data-cleaning-result',
      includeContent: ['cleanedData'],
      multipleSheets: true,
      includeCharts: true,
      encoding: 'utf-8',
      delimiter: ',',
      orientation: 'portrait',
      includeCover: true
    })

    const exportSteps = ref([
      { name: '准备数据', completed: false, current: false },
      { name: '生成内容', completed: false, current: false },
      { name: '格式转换', completed: false, current: false },
      { name: '文件打包', completed: false, current: false },
      { name: '完成导出', completed: false, current: false }
    ])

    // 方法
    const selectFormat = (format) => {
      selectedFormat.value = format
      
      // 根据格式设置默认配置
      if (format === 'excel') {
        exportConfig.value.includeContent = ['cleanedData', 'report']
      } else if (format === 'pdf') {
        exportConfig.value.includeContent = ['cleanedData', 'report', 'summary']
      }
    }

    const getDataCount = () => {
      return props.data.length
    }

    const getEstimatedSize = () => {
      const baseSize = props.data.length * 0.5 // KB per record
      const multiplier = exportConfig.value.includeContent.length
      const totalKB = baseSize * multiplier
      
      if (totalKB < 1024) {
        return `${Math.round(totalKB)} KB`
      } else {
        return `${(totalKB / 1024).toFixed(1)} MB`
      }
    }

    const startExport = () => {
      isExporting.value = true
      exportProgressVisible.value = true
      exportProgress.value = 0
      
      // 重置步骤状态
      exportSteps.value.forEach(step => {
        step.completed = false
        step.current = false
      })
      
      // 开始导出流程
      simulateExport()
    }

    const simulateExport = () => {
      let currentStep = 0
      
      const processStep = () => {
        if (currentStep > 0) {
          exportSteps.value[currentStep - 1].completed = true
          exportSteps.value[currentStep - 1].current = false
        }
        
        if (currentStep < exportSteps.value.length) {
          exportSteps.value[currentStep].current = true
          currentExportStep.value = exportSteps.value[currentStep].name
          
          // 模拟处理时间
          const stepDuration = 1000 + Math.random() * 2000
          
          setTimeout(() => {
            exportProgress.value = Math.round(((currentStep + 1) / exportSteps.value.length) * 100)
            currentStep++
            processStep()
          }, stepDuration)
        } else {
          // 导出完成
          isExporting.value = false
          ElMessage.success('导出完成！')
          emit('export-completed', selectedFormat.value)
        }
      }
      
      processStep()
    }

    const previewExport = () => {
      ElMessage.info('预览功能开发中...')
    }

    const saveTemplate = () => {
      ElMessage.success('导出模板已保存')
    }

    const downloadFile = () => {
      // 模拟文件下载
      const filename = `${exportConfig.value.filename}.${selectedFormat.value}`
      ElMessage.success(`文件 ${filename} 下载完成`)
      exportProgressVisible.value = false
    }

    const cancelExport = () => {
      isExporting.value = false
      exportProgressVisible.value = false
      ElMessage.warning('导出已取消')
    }

    return {
      selectedFormat,
      isExporting,
      exportProgressVisible,
      exportProgress,
      currentExportStep,
      exportFormats,
      exportConfig,
      exportSteps,
      selectFormat,
      getDataCount,
      getEstimatedSize,
      startExport,
      previewExport,
      saveTemplate,
      downloadFile,
      cancelExport
    }
  }
}
</script>

<style scoped>
.export-options {
  padding: 20px 0;
}

.format-selection,
.export-config,
.export-preview {
  margin-bottom: 20px;
}

.format-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.format-card {
  display: flex;
  padding: 20px;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.format-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
}

.format-card.selected {
  border-color: #409eff;
  background: #f0f9ff;
}

.format-icon {
  margin-right: 15px;
  font-size: 32px;
  color: #409eff;
  display: flex;
  align-items: center;
}

.format-info {
  flex: 1;
}

.format-info h5 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
}

.format-info p {
  margin: 0 0 10px 0;
  color: #606266;
  font-size: 14px;
}

.format-features {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.preview-stats {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.preview-content h5 {
  margin-bottom: 15px;
  color: #303133;
}

.content-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.content-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  margin-bottom: 8px;
  background: #f0f9ff;
  border-radius: 6px;
  color: #606266;
}

.export-actions {
  text-align: center;
  margin-top: 30px;
}

.export-actions .el-button {
  margin: 0 10px;
}

.export-progress {
  padding: 20px 0;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-weight: 500;
}

.progress-details {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s;
}

.step-item.completed {
  background: #f0f9ff;
  color: #67c23a;
}

.step-item.current {
  background: #fff7e6;
  color: #e6a23c;
}

.step-item .el-icon {
  font-size: 16px;
}
</style>
