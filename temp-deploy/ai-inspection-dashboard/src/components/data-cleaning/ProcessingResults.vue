<template>
  <div class="processing-results">
    <!-- 结果概览 -->
    <div class="results-overview">
      <el-card class="overview-card">
        <template #header>
          <div class="card-header">
            <h3>📊 处理结果概览</h3>
            <div class="result-status">
              <el-tag type="success" size="large">
                处理完成
              </el-tag>
            </div>
          </div>
        </template>

        <div class="overview-stats">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-icon">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ totalRecords }}</div>
                  <div class="stat-label">总记录数</div>
                </div>
              </div>
            </el-col>
            
            <el-col :span="6">
              <div class="stat-card success">
                <div class="stat-icon">
                  <el-icon><CircleCheck /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ cleanedRecords }}</div>
                  <div class="stat-label">清洗成功</div>
                </div>
              </div>
            </el-col>
            
            <el-col :span="6">
              <div class="stat-card warning">
                <div class="stat-icon">
                  <el-icon><Warning /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ modifiedRecords }}</div>
                  <div class="stat-label">修改记录</div>
                </div>
              </div>
            </el-col>
            
            <el-col :span="6">
              <div class="stat-card danger">
                <div class="stat-icon">
                  <el-icon><CircleClose /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ errorRecords }}</div>
                  <div class="stat-label">错误记录</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="quality-score">
          <div class="score-header">
            <h4>数据质量评分</h4>
            <el-tag :type="getQualityScoreType()" size="large">
              {{ qualityScore }}/100
            </el-tag>
          </div>
          <el-progress 
            :percentage="qualityScore" 
            :status="getQualityScoreStatus()"
            :stroke-width="12"
            :show-text="false"
          />
        </div>
      </el-card>
    </div>

    <!-- 详细结果 -->
    <div class="detailed-results">
      <el-tabs v-model="activeTab" type="card">
        <!-- 清洗报告 -->
        <el-tab-pane label="清洗报告" name="cleaning-report">
          <CleaningReport :report-data="cleaningReportData" />
        </el-tab-pane>

        <!-- 数据预览 -->
        <el-tab-pane label="数据预览" name="data-preview">
          <DataResultsPreview :data="processedData" />
        </el-tab-pane>

        <!-- 质量分析 -->
        <el-tab-pane label="质量分析" name="quality-analysis">
          <QualityAnalysis :analysis-data="qualityAnalysisData" />
        </el-tab-pane>

        <!-- AI总结 -->
        <el-tab-pane label="AI总结" name="ai-summary">
          <AISummaryReport :summary-data="aiSummaryData" />
        </el-tab-pane>

        <!-- 导出选项 -->
        <el-tab-pane label="导出数据" name="export">
          <ExportOptions 
            :data="processedData"
            :report="cleaningReportData"
            @export-completed="handleExportCompleted"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 操作按钮 -->
    <div class="result-actions">
      <el-button-group>
        <el-button type="primary" @click="downloadReport">
          <el-icon><Download /></el-icon>
          下载完整报告
        </el-button>
        
        <el-button @click="shareResults">
          <el-icon><Share /></el-icon>
          分享结果
        </el-button>
        
        <el-button @click="saveToHistory">
          <el-icon><FolderAdd /></el-icon>
          保存到历史
        </el-button>
        
        <el-button type="success" @click="startNewProcess">
          <el-icon><Plus /></el-icon>
          开始新的处理
        </el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Document,
  CircleCheck,
  Warning,
  CircleClose,
  Download,
  Share,
  FolderAdd,
  Plus
} from '@element-plus/icons-vue'
import CleaningReport from './results/CleaningReport.vue'
import DataResultsPreview from './results/DataResultsPreview.vue'
import QualityAnalysis from './results/QualityAnalysis.vue'
import AISummaryReport from './results/AISummaryReport.vue'
import ExportOptions from './results/ExportOptions.vue'

export default {
  name: 'ProcessingResults',
  components: {
    Document,
    CircleCheck,
    Warning,
    CircleClose,
    Download,
    Share,
    FolderAdd,
    Plus,
    CleaningReport,
    DataResultsPreview,
    QualityAnalysis,
    AISummaryReport,
    ExportOptions
  },
  props: {
    results: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['export-data'],
  setup(props, { emit }) {
    const activeTab = ref('cleaning-report')

    // 模拟数据
    const totalRecords = ref(1250)
    const cleanedRecords = ref(1180)
    const modifiedRecords = ref(156)
    const errorRecords = ref(15)
    const qualityScore = ref(92)

    const processedData = ref([
      {
        id: 1,
        materialCode: 'AXX-H1234',
        materialName: '高强度钢板',
        supplier: '华星光电',
        issueType: '尺寸偏差',
        description: '长度超出规格范围',
        status: '已处理',
        cleaningActions: ['格式标准化', '数据验证']
      },
      // 更多数据...
    ])

    const cleaningReportData = ref({
      summary: {
        totalRules: 8,
        appliedRules: 6,
        successRate: 94.2,
        processingTime: '2分35秒'
      },
      ruleResults: [
        {
          ruleName: '去除空值',
          applied: true,
          affectedRecords: 45,
          successRate: 100,
          details: '移除了45条包含空值的记录'
        },
        {
          ruleName: '格式标准化',
          applied: true,
          affectedRecords: 156,
          successRate: 98.7,
          details: '标准化了物料编码和日期格式'
        }
      ],
      issues: [
        {
          type: 'warning',
          message: '发现15条记录存在数据质量问题',
          details: '主要是物料编码格式不规范'
        }
      ]
    })

    const qualityAnalysisData = ref({
      completeness: 96.8,
      accuracy: 94.2,
      consistency: 91.5,
      validity: 89.3,
      fieldAnalysis: [
        {
          field: 'materialCode',
          completeness: 100,
          validity: 95.2,
          issues: ['格式不规范: 12条']
        },
        {
          field: 'materialName',
          completeness: 98.4,
          validity: 100,
          issues: ['缺失值: 20条']
        }
      ]
    })

    const aiSummaryData = ref({
      overview: '本次数据清洗处理了1250条记录，整体质量良好。主要问题集中在物料编码格式和部分字段缺失值。',
      keyFindings: [
        '94.4%的记录通过了所有质量检查',
        '物料编码字段存在12条格式不规范的记录',
        '供应商信息完整性达到99.2%',
        '建议加强数据录入时的格式验证'
      ],
      recommendations: [
        '建立物料编码标准化规范',
        '增加数据录入时的实时验证',
        '定期进行数据质量审核',
        '培训相关人员数据录入标准'
      ],
      confidence: 94.2
    })

    // 计算属性
    const getQualityScoreType = () => {
      if (qualityScore.value >= 90) return 'success'
      if (qualityScore.value >= 70) return 'warning'
      return 'danger'
    }

    const getQualityScoreStatus = () => {
      if (qualityScore.value >= 90) return 'success'
      if (qualityScore.value >= 70) return undefined
      return 'exception'
    }

    // 方法
    const handleExportCompleted = (format) => {
      ElMessage.success(`数据已导出为 ${format} 格式`)
      emit('export-data', format)
    }

    const downloadReport = () => {
      ElMessage.info('正在生成完整报告...')
      // 实现报告下载逻辑
    }

    const shareResults = () => {
      ElMessage.info('分享功能开发中...')
    }

    const saveToHistory = () => {
      ElMessage.success('结果已保存到历史记录')
    }

    const startNewProcess = () => {
      ElMessage.info('准备开始新的处理流程')
      // 重置到上传页面
    }

    return {
      activeTab,
      totalRecords,
      cleanedRecords,
      modifiedRecords,
      errorRecords,
      qualityScore,
      processedData,
      cleaningReportData,
      qualityAnalysisData,
      aiSummaryData,
      getQualityScoreType,
      getQualityScoreStatus,
      handleExportCompleted,
      downloadReport,
      shareResults,
      saveToHistory,
      startNewProcess
    }
  }
}
</script>

<style scoped>
.processing-results {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.overview-card {
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.overview-stats {
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #409eff;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card.success {
  border-left-color: #67c23a;
}

.stat-card.warning {
  border-left-color: #e6a23c;
}

.stat-card.danger {
  border-left-color: #f56c6c;
}

.stat-icon {
  font-size: 32px;
  margin-right: 15px;
  color: #409eff;
}

.stat-card.success .stat-icon {
  color: #67c23a;
}

.stat-card.warning .stat-icon {
  color: #e6a23c;
}

.stat-card.danger .stat-icon {
  color: #f56c6c;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.quality-score {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.score-header h4 {
  margin: 0;
  font-size: 18px;
}

.detailed-results {
  margin-bottom: 30px;
}

.result-actions {
  text-align: center;
}

.result-actions .el-button {
  margin: 0 5px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .overview-stats .el-col {
    margin-bottom: 15px;
  }
  
  .stat-card {
    padding: 15px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .result-actions .el-button-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}
</style>
