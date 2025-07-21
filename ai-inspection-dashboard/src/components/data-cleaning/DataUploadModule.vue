<template>
  <div class="data-upload-module">
    <!-- 上传区域 -->
    <el-card class="upload-card">
      <template #header>
        <div class="card-header">
          <h3>📁 数据文件上传</h3>
          <el-tag type="info">支持多种格式</el-tag>
        </div>
      </template>

      <div class="upload-content">
        <!-- 文件上传器 -->
        <el-upload
          ref="uploadRef"
          class="upload-dragger"
          drag
          :auto-upload="false"
          :on-change="handleFileChange"
          :before-upload="beforeUpload"
          :show-file-list="false"
          accept=".xlsx,.xls,.csv,.json,.pdf,.doc,.docx,.txt"
          multiple
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 Excel、CSV、JSON、PDF、Word、TXT 等格式，单个文件最大 50MB
            </div>
          </template>
        </el-upload>

        <!-- 文件列表 -->
        <div v-if="uploadedFiles.length > 0" class="file-list">
          <h4>已上传文件 ({{ uploadedFiles.length }})</h4>
          <div class="files-grid">
            <div 
              v-for="(file, index) in uploadedFiles" 
              :key="index"
              class="file-item"
              :class="{ 'processing': file.processing, 'completed': file.completed }"
            >
              <div class="file-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="file-info">
                <div class="file-name">{{ file.name }}</div>
                <div class="file-details">
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                  <span class="file-type">{{ getFileType(file.name) }}</span>
                </div>
                <div class="file-status">
                  <el-tag 
                    :type="getStatusType(file.status)" 
                    size="small"
                  >
                    {{ file.status }}
                  </el-tag>
                </div>
              </div>
              <div class="file-actions">
                <el-button 
                  size="small" 
                  type="primary" 
                  @click="previewFile(file)"
                  :disabled="file.processing"
                >
                  预览
                </el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="removeFile(index)"
                  :disabled="file.processing"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 处理配置 -->
        <div v-if="uploadedFiles.length > 0" class="processing-config">
          <h4>处理配置</h4>
          <el-form :model="processingConfig" label-width="120px">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="数据源类型">
                  <el-select v-model="processingConfig.sourceType" placeholder="选择数据源类型">
                    <el-option label="8D报告" value="8d-report" />
                    <el-option label="质量检验报告" value="quality-report" />
                    <el-option label="供应商评估" value="supplier-assessment" />
                    <el-option label="生产数据" value="production-data" />
                    <el-option label="客户反馈" value="customer-feedback" />
                    <el-option label="通用数据" value="general-data" />
                  </el-select>
                </el-form-item>
              </el-col>
              
              <el-col :span="8">
                <el-form-item label="编码格式">
                  <el-select v-model="processingConfig.encoding" placeholder="选择编码格式">
                    <el-option label="UTF-8" value="utf-8" />
                    <el-option label="GBK" value="gbk" />
                    <el-option label="GB2312" value="gb2312" />
                    <el-option label="自动检测" value="auto" />
                  </el-select>
                </el-form-item>
              </el-col>
              
              <el-col :span="8">
                <el-form-item label="处理模式">
                  <el-select v-model="processingConfig.mode" placeholder="选择处理模式">
                    <el-option label="标准模式" value="standard" />
                    <el-option label="快速模式" value="fast" />
                    <el-option label="深度分析" value="deep" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="启用AI分析">
                  <el-switch v-model="processingConfig.enableAI" />
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="生成摘要报告">
                  <el-switch v-model="processingConfig.generateSummary" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <!-- 操作按钮 -->
        <div v-if="uploadedFiles.length > 0" class="action-buttons">
          <el-button 
            type="primary" 
            size="large"
            @click="startProcessing"
            :loading="isProcessing"
            :disabled="!isConfigValid"
          >
            <el-icon><Play /></el-icon>
            开始处理 ({{ uploadedFiles.length }} 个文件)
          </el-button>
          
          <el-button 
            size="large"
            @click="clearAll"
            :disabled="isProcessing"
          >
            <el-icon><Delete /></el-icon>
            清空所有
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 示例文件 -->
    <el-card class="examples-card">
      <template #header>
        <h3>📋 示例文件</h3>
      </template>
      
      <div class="examples-grid">
        <div 
          v-for="example in exampleFiles" 
          :key="example.name"
          class="example-item"
          @click="loadExample(example)"
        >
          <div class="example-icon">
            <el-icon><component :is="example.icon" /></el-icon>
          </div>
          <div class="example-info">
            <div class="example-name">{{ example.name }}</div>
            <div class="example-desc">{{ example.description }}</div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 文件预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="文件预览"
      width="80%"
      :before-close="closePreview"
    >
      <div class="file-preview">
        <div v-if="previewData.type === 'text'" class="text-preview">
          <pre>{{ previewData.content }}</pre>
        </div>
        <div v-else-if="previewData.type === 'table'" class="table-preview">
          <el-table :data="previewData.content" stripe style="width: 100%">
            <el-table-column
              v-for="column in previewData.columns"
              :key="column"
              :prop="column"
              :label="column"
              show-overflow-tooltip
            />
          </el-table>
        </div>
        <div v-else class="unsupported-preview">
          <el-icon><Warning /></el-icon>
          <p>该文件类型暂不支持预览</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  UploadFilled,
  Document,
  VideoPlay as Play,
  Delete,
  Warning,
  Files,
  DataAnalysis,
  Notebook,
  PictureRounded
} from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

export default {
  name: 'DataUploadModule',
  components: {
    UploadFilled,
    Document,
    Play,
    Delete,
    Warning,
    Files,
    DataAnalysis,
    Notebook,
    PictureRounded
  },
  emits: ['file-uploaded', 'start-processing'],
  setup(props, { emit }) {
    const uploadRef = ref()
    const uploadedFiles = ref([])
    const isProcessing = ref(false)
    const previewVisible = ref(false)
    const previewData = ref({})
    
    // 处理配置
    const processingConfig = ref({
      sourceType: '',
      encoding: 'utf-8',
      mode: 'standard',
      enableAI: true,
      generateSummary: true
    })

    // 示例文件
    const exampleFiles = ref([
      {
        name: '8D报告模板',
        description: '标准8D问题解决报告模板',
        icon: 'Notebook',
        url: '/examples/8d-report-template.xlsx'
      },
      {
        name: '质量检验数据',
        description: '产品质量检验记录示例',
        icon: 'DataAnalysis',
        url: '/examples/quality-inspection-data.csv'
      },
      {
        name: '供应商评估',
        description: '供应商绩效评估数据',
        icon: 'Files',
        url: '/examples/supplier-assessment.xlsx'
      },
      {
        name: '客户反馈',
        description: '客户投诉和反馈记录',
        icon: 'PictureRounded',
        url: '/examples/customer-feedback.json'
      }
    ])

    // 计算属性
    const isConfigValid = computed(() => {
      return processingConfig.value.sourceType && 
             processingConfig.value.encoding && 
             processingConfig.value.mode
    })

    // 方法
    const handleFileChange = (file) => {
      const newFile = {
        name: file.name,
        size: file.size,
        raw: file.raw,
        status: '待处理',
        processing: false,
        completed: false
      }
      
      uploadedFiles.value.push(newFile)
      ElMessage.success(`文件 ${file.name} 添加成功`)
    }

    const beforeUpload = (file) => {
      const isValidSize = file.size / 1024 / 1024 < 50 // 50MB
      if (!isValidSize) {
        ElMessage.error('文件大小不能超过 50MB!')
        return false
      }
      return true
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const getFileType = (filename) => {
      const ext = filename.split('.').pop().toLowerCase()
      const types = {
        'xlsx': 'Excel',
        'xls': 'Excel',
        'csv': 'CSV',
        'json': 'JSON',
        'pdf': 'PDF',
        'doc': 'Word',
        'docx': 'Word',
        'txt': 'Text'
      }
      return types[ext] || ext.toUpperCase()
    }

    const getStatusType = (status) => {
      const types = {
        '待处理': 'info',
        '处理中': 'warning',
        '已完成': 'success',
        '失败': 'danger'
      }
      return types[status] || 'info'
    }

    const removeFile = (index) => {
      uploadedFiles.value.splice(index, 1)
      ElMessage.success('文件已删除')
    }

    const clearAll = () => {
      ElMessageBox.confirm(
        '确定要清空所有文件吗？',
        '确认清空',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        uploadedFiles.value = []
        ElMessage.success('已清空所有文件')
      }).catch(() => {
        ElMessage.info('已取消操作')
      })
    }

    const previewFile = async (file) => {
      try {
        const fileType = getFileType(file.name)

        if (['Excel', 'CSV'].includes(fileType)) {
          const data = await parseFileData(file.raw, fileType)
          previewData.value = {
            type: 'table',
            content: data.slice(0, 100), // 只显示前100行
            columns: Object.keys(data[0] || {})
          }
        } else if (fileType === 'JSON' || fileType === 'Text') {
          const text = await readFileAsText(file.raw)
          previewData.value = {
            type: 'text',
            content: text.substring(0, 5000) // 只显示前5000字符
          }
        } else {
          previewData.value = {
            type: 'unsupported'
          }
        }

        previewVisible.value = true
      } catch (error) {
        ElMessage.error('文件预览失败')
      }
    }

    const parseFileData = (file, type) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
          try {
            if (type === 'Excel') {
              const workbook = XLSX.read(e.target.result, { type: 'binary' })
              const sheetName = workbook.SheetNames[0]
              const worksheet = workbook.Sheets[sheetName]
              const data = XLSX.utils.sheet_to_json(worksheet)
              resolve(data)
            } else if (type === 'CSV') {
              Papa.parse(e.target.result, {
                header: true,
                complete: (results) => resolve(results.data),
                error: (error) => reject(error)
              })
            }
          } catch (error) {
            reject(error)
          }
        }

        reader.onerror = () => reject(new Error('文件读取失败'))

        if (type === 'Excel') {
          reader.readAsBinaryString(file)
        } else {
          reader.readAsText(file)
        }
      })
    }

    const readFileAsText = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = () => reject(new Error('文件读取失败'))
        reader.readAsText(file)
      })
    }

    const closePreview = () => {
      previewVisible.value = false
      previewData.value = {}
    }

    const loadExample = (example) => {
      ElMessage.info(`正在加载示例文件: ${example.name}`)
      // 这里可以实现加载示例文件的逻辑
    }

    const startProcessing = () => {
      if (!isConfigValid.value) {
        ElMessage.warning('请完善处理配置')
        return
      }

      isProcessing.value = true

      // 标记所有文件为处理中
      uploadedFiles.value.forEach(file => {
        file.processing = true
        file.status = '处理中'
      })

      // 发送处理事件
      emit('start-processing', {
        files: uploadedFiles.value,
        config: processingConfig.value
      })

      ElMessage.success('开始处理文件')
    }

    return {
      uploadRef,
      uploadedFiles,
      isProcessing,
      previewVisible,
      previewData,
      processingConfig,
      exampleFiles,
      isConfigValid,
      handleFileChange,
      beforeUpload,
      formatFileSize,
      getFileType,
      getStatusType,
      removeFile,
      clearAll,
      previewFile,
      closePreview,
      loadExample,
      startProcessing
    }
  }
}
</script>

<style scoped>
.data-upload-module {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.upload-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-content {
  padding: 20px 0;
}

.upload-dragger {
  margin-bottom: 30px;
}

.file-list {
  margin: 30px 0;
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: white;
  transition: all 0.3s;
}

.file-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.file-item.processing {
  border-color: #e6a23c;
  background: #fdf6ec;
}

.file-item.completed {
  border-color: #67c23a;
  background: #f0f9ff;
}

.file-icon {
  margin-right: 15px;
  font-size: 24px;
  color: #409eff;
}

.file-info {
  flex: 1;
}

.file-name {
  font-weight: 500;
  margin-bottom: 5px;
}

.file-details {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.file-details span {
  margin-right: 10px;
}

.file-actions {
  display: flex;
  gap: 5px;
}

.processing-config {
  margin: 30px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.action-buttons {
  text-align: center;
  margin-top: 30px;
}

.action-buttons .el-button {
  margin: 0 10px;
}

.examples-card {
  margin-top: 20px;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.example-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.example-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.example-icon {
  margin-right: 15px;
  font-size: 24px;
  color: #409eff;
}

.example-name {
  font-weight: 500;
  margin-bottom: 5px;
}

.example-desc {
  font-size: 12px;
  color: #909399;
}

.file-preview {
  max-height: 500px;
  overflow-y: auto;
}

.text-preview pre {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.5;
}

.unsupported-preview {
  text-align: center;
  padding: 50px;
  color: #909399;
}

.unsupported-preview .el-icon {
  font-size: 48px;
  margin-bottom: 15px;
}
</style>
