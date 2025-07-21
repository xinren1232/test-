<template>
  <div class="data-cleaning-minimal">
    <h1>数据清洗治理 - 最小版本</h1>
    
    <div class="main-content">
      <div class="left-panel">
        <h3>配置选择</h3>
        
        <!-- 文件格式选择 -->
        <div class="section">
          <h4>1. 选择文件格式</h4>
          <div class="format-grid">
            <div v-for="format in fileFormats" :key="format.type"
                 class="format-card"
                 :class="{ active: selectedFileFormat?.type === format.type }"
                 @click="selectFileFormat(format)">
              <i :class="format.icon" :style="{ color: format.color }"></i>
              <span>{{ format.name }}</span>
            </div>
          </div>
        </div>

        <!-- 处理工具选择 -->
        <div class="section" v-if="selectedFileFormat">
          <h4>2. 选择处理工具</h4>
          <div class="tool-grid">
            <div v-for="tool in selectedFileFormat.tools" :key="tool.id"
                 class="tool-card"
                 :class="{ active: selectedTool?.id === tool.id }"
                 @click="selectTool(tool)">
              <i :class="tool.icon" :style="{ color: tool.color }"></i>
              <span>{{ tool.name }}</span>
            </div>
          </div>
        </div>

        <!-- 清洗规则选择 -->
        <div class="section" v-if="selectedTool">
          <h4>3. 选择清洗规则</h4>
          <div class="rule-grid">
            <div v-for="rule in ruleTypes" :key="rule.id"
                 class="rule-card"
                 :class="{ active: selectedRuleType === rule.id }"
                 @click="selectRuleType(rule.id)">
              <i :class="rule.icon"></i>
              <span>{{ rule.name }}</span>
            </div>
          </div>
        </div>

        <!-- 文件上传 -->
        <div class="section" v-if="configurationComplete">
          <h4>4. 上传文件</h4>
          <el-upload
            class="upload-demo"
            drag
            :auto-upload="false"
            :file-list="fileList"
            @change="handleFileChange"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">拖拽文件到此处，或<em>点击上传</em></div>
          </el-upload>
        </div>
      </div>

      <div class="right-panel">
        <h3>处理状态</h3>
        <div v-if="processingStatus === 'idle'">
          <p>请完成左侧配置并上传文件</p>
        </div>
        <div v-else-if="processingStatus === 'running'">
          <p>正在处理数据...</p>
          <el-progress :percentage="processingProgress"></el-progress>
        </div>
        <div v-else-if="processingStatus === 'completed'">
          <p>处理完成！</p>
          <el-button type="primary" @click="viewResults">查看结果</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'DataCleaningMinimal',
  setup() {
    // 响应式数据
    const selectedFileFormat = ref(null)
    const selectedTool = ref(null)
    const selectedRuleType = ref(null)
    const fileList = ref([])
    const processingStatus = ref('idle')
    const processingProgress = ref(0)

    // 文件格式配置
    const fileFormats = ref([
      {
        type: 'excel',
        name: 'Excel文件',
        icon: 'el-icon-document',
        color: '#67c23a',
        extensions: ['.xlsx', '.xls'],
        tools: [
          { id: 'pandas', name: 'Pandas', icon: 'el-icon-cpu', color: '#409eff' },
          { id: 'openpyxl', name: 'OpenPyXL', icon: 'el-icon-document', color: '#67c23a' }
        ]
      },
      {
        type: 'csv',
        name: 'CSV文件',
        icon: 'el-icon-tickets',
        color: '#e6a23c',
        extensions: ['.csv'],
        tools: [
          { id: 'pandas', name: 'Pandas', icon: 'el-icon-cpu', color: '#409eff' }
        ]
      }
    ])

    // 规则类型
    const ruleTypes = ref([
      {
        id: 'common',
        name: '常规清洗',
        icon: 'el-icon-document'
      },
      {
        id: 'material-issue',
        name: '来料问题',
        icon: 'el-icon-box'
      }
    ])

    // 计算属性
    const configurationComplete = computed(() => {
      return selectedFileFormat.value && selectedTool.value && selectedRuleType.value
    })

    // 方法
    const selectFileFormat = (format) => {
      selectedFileFormat.value = format
      selectedTool.value = null
      ElMessage.success(`已选择文件格式: ${format.name}`)
    }

    const selectTool = (tool) => {
      selectedTool.value = tool
      ElMessage.success(`已选择处理工具: ${tool.name}`)
    }

    const selectRuleType = (ruleId) => {
      selectedRuleType.value = ruleId
      const rule = ruleTypes.value.find(r => r.id === ruleId)
      ElMessage.success(`已选择清洗规则: ${rule.name}`)
    }

    const handleFileChange = (fileListParam) => {
      fileList.value = fileListParam
      if (fileListParam.length > 0) {
        ElMessage.success('文件上传成功，开始处理...')
        startProcessing()
      }
    }

    const startProcessing = () => {
      processingStatus.value = 'running'
      processingProgress.value = 0
      
      const interval = setInterval(() => {
        processingProgress.value += 10
        if (processingProgress.value >= 100) {
          clearInterval(interval)
          processingStatus.value = 'completed'
          ElMessage.success('数据处理完成！')
        }
      }, 500)
    }

    const viewResults = () => {
      ElMessage.info('查看结果功能开发中...')
    }

    return {
      selectedFileFormat,
      selectedTool,
      selectedRuleType,
      fileList,
      processingStatus,
      processingProgress,
      fileFormats,
      ruleTypes,
      configurationComplete,
      selectFileFormat,
      selectTool,
      selectRuleType,
      handleFileChange,
      startProcessing,
      viewResults
    }
  }
}
</script>

<style scoped>
.data-cleaning-minimal {
  padding: 20px;
}

.main-content {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.left-panel, .right-panel {
  flex: 1;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.section {
  margin-bottom: 20px;
}

.format-grid, .tool-grid, .rule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.format-card, .tool-card, .rule-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.format-card:hover, .tool-card:hover, .rule-card:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.format-card.active, .tool-card.active, .rule-card.active {
  border-color: #409eff;
  background-color: #e6f4ff;
}

.format-card i, .tool-card i, .rule-card i {
  font-size: 24px;
  margin-bottom: 8px;
}

.upload-demo {
  margin-top: 10px;
}
</style>
