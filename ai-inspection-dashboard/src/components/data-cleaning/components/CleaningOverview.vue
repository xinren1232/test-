<template>
  <div class="cleaning-overview">
    <el-card class="overview-card">
      <template #header>
        <div class="card-header">
          <span>📊 文件分析概览</span>
          <el-tag :type="confidenceTagType">置信度: {{ analysisResult.confidence }}%</el-tag>
        </div>
      </template>
      
      <div class="overview-content">
        <!-- 基本信息 -->
        <div class="basic-info">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">文件名称:</span>
              <span class="info-value">{{ analysisResult.fileName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">文件大小:</span>
              <span class="info-value">{{ analysisResult.fileSize }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">数据源类型:</span>
              <span class="info-value">{{ analysisResult.dataSource }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">文档类型:</span>
              <span class="info-value">{{ analysisResult.documentType }}</span>
            </div>
          </div>
        </div>

        <!-- 结构信息 -->
        <div class="structure-info">
          <h4>文档结构</h4>
          <div class="structure-grid">
            <div class="structure-item">
              <div class="structure-icon">📄</div>
              <div class="structure-data">
                <div class="structure-value">{{ analysisResult.structure?.sections || 0 }}</div>
                <div class="structure-label">章节数</div>
              </div>
            </div>
            <div class="structure-item">
              <div class="structure-icon">📋</div>
              <div class="structure-data">
                <div class="structure-value">{{ analysisResult.structure?.pages || 0 }}</div>
                <div class="structure-label">页面数</div>
              </div>
            </div>
            <div class="structure-item">
              <div class="structure-icon">📊</div>
              <div class="structure-data">
                <div class="structure-value">{{ analysisResult.structure?.tables || 0 }}</div>
                <div class="structure-label">表格数</div>
              </div>
            </div>
            <div class="structure-item">
              <div class="structure-icon">🖼️</div>
              <div class="structure-data">
                <div class="structure-value">{{ analysisResult.structure?.images || 0 }}</div>
                <div class="structure-label">图片数</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 提取的数据预览 -->
        <div class="extracted-data">
          <h4>提取数据预览</h4>
          <div class="data-preview">
            <div v-for="(value, key) in analysisResult.extractedData" :key="key" class="data-item">
              <span class="data-key">{{ getFieldLabel(key) }}:</span>
              <span class="data-value">{{ value }}</span>
            </div>
          </div>
        </div>

        <!-- 问题和建议 -->
        <div class="issues-recommendations">
          <div class="issues-section">
            <h4>发现的问题</h4>
            <div v-if="analysisResult.issues && analysisResult.issues.length > 0" class="issues-list">
              <div v-for="(issue, index) in analysisResult.issues" :key="index" class="issue-item">
                <el-tag :type="getIssueType(issue.type)" size="small">{{ issue.type }}</el-tag>
                <span class="issue-message">{{ issue.message }}</span>
              </div>
            </div>
            <div v-else class="no-issues">
              <el-icon><SuccessFilled /></el-icon>
              <span>未发现问题</span>
            </div>
          </div>

          <div class="recommendations-section">
            <h4>改进建议</h4>
            <div v-if="analysisResult.recommendations && analysisResult.recommendations.length > 0" class="recommendations-list">
              <div v-for="(rec, index) in analysisResult.recommendations" :key="index" class="recommendation-item">
                <el-icon><InfoFilled /></el-icon>
                <span class="recommendation-text">{{ rec.title }}</span>
              </div>
            </div>
            <div v-else class="no-recommendations">
              <span>暂无建议</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { computed } from 'vue'
import { SuccessFilled, InfoFilled } from '@element-plus/icons-vue'

export default {
  name: 'CleaningOverview',
  components: {
    SuccessFilled,
    InfoFilled
  },
  props: {
    analysisResult: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const confidenceTagType = computed(() => {
      const confidence = props.analysisResult.confidence
      if (confidence >= 90) return 'success'
      if (confidence >= 70) return 'warning'
      return 'danger'
    })

    const getFieldLabel = (key) => {
      const labels = {
        materialCode: '物料编码',
        materialName: '物料名称',
        supplier: '供应商',
        issueType: '问题类型',
        description: '问题描述',
        temporaryAction: '临时对策',
        responsibleDept: '责任部门',
        processResult: '处理结果'
      }
      return labels[key] || key
    }

    const getIssueType = (type) => {
      const typeMap = {
        warning: 'warning',
        error: 'danger',
        info: 'info'
      }
      return typeMap[type] || 'info'
    }

    return {
      confidenceTagType,
      getFieldLabel,
      getIssueType
    }
  }
}
</script>

<style scoped>
.cleaning-overview {
  margin-bottom: 20px;
}

.overview-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.overview-content {
  padding: 20px 0;
}

.basic-info {
  margin-bottom: 30px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.info-label {
  font-weight: 500;
  color: #606266;
}

.info-value {
  color: #2c3e50;
  font-weight: 600;
}

.structure-info {
  margin-bottom: 30px;
}

.structure-info h4 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 16px;
}

.structure-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.structure-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.structure-icon {
  font-size: 24px;
  margin-bottom: 10px;
}

.structure-value {
  font-size: 20px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 5px;
}

.structure-label {
  font-size: 12px;
  color: #909399;
}

.extracted-data {
  margin-bottom: 30px;
}

.extracted-data h4 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 16px;
}

.data-preview {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
}

.data-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e4e7ed;
}

.data-item:last-child {
  border-bottom: none;
}

.data-key {
  font-weight: 500;
  color: #606266;
}

.data-value {
  color: #2c3e50;
  font-weight: 600;
}

.issues-recommendations {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.issues-section h4,
.recommendations-section h4 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 16px;
}

.issues-list,
.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.issue-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: #fef0f0;
  border-radius: 6px;
}

.issue-message {
  color: #606266;
  font-size: 14px;
}

.recommendation-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: #f0f9ff;
  border-radius: 6px;
}

.recommendation-text {
  color: #606266;
  font-size: 14px;
}

.no-issues,
.no-recommendations {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 15px;
  background-color: #f0f9ff;
  border-radius: 6px;
  color: #67c23a;
  font-size: 14px;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .structure-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .issues-recommendations {
    grid-template-columns: 1fr;
  }
}
</style>
