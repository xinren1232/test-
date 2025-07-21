<template>
  <div class="quality-analysis">
    <!-- 质量指标概览 -->
    <div class="quality-metrics">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="metric-card completeness">
            <div class="metric-header">
              <el-icon><PieChart /></el-icon>
              <span>完整性</span>
            </div>
            <div class="metric-value">{{ analysisData.completeness || 0 }}%</div>
            <el-progress 
              :percentage="analysisData.completeness || 0" 
              :stroke-width="6"
              :show-text="false"
            />
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="metric-card accuracy">
            <div class="metric-header">
              <el-icon><CircleCheck /></el-icon>
              <span>准确性</span>
            </div>
            <div class="metric-value">{{ analysisData.accuracy || 0 }}%</div>
            <el-progress 
              :percentage="analysisData.accuracy || 0" 
              :stroke-width="6"
              :show-text="false"
              status="success"
            />
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="metric-card consistency">
            <div class="metric-header">
              <el-icon><DataAnalysis /></el-icon>
              <span>一致性</span>
            </div>
            <div class="metric-value">{{ analysisData.consistency || 0 }}%</div>
            <el-progress 
              :percentage="analysisData.consistency || 0" 
              :stroke-width="6"
              :show-text="false"
              color="#e6a23c"
            />
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="metric-card validity">
            <div class="metric-header">
              <el-icon><Shield /></el-icon>
              <span>有效性</span>
            </div>
            <div class="metric-value">{{ analysisData.validity || 0 }}%</div>
            <el-progress 
              :percentage="analysisData.validity || 0" 
              :stroke-width="6"
              :show-text="false"
              color="#f56c6c"
            />
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 字段级分析 -->
    <el-card class="field-analysis">
      <template #header>
        <h4>📊 字段级质量分析</h4>
      </template>
      
      <el-table :data="analysisData.fieldAnalysis || []" stripe>
        <el-table-column prop="field" label="字段名称" width="150">
          <template #default="{ row }">
            <strong>{{ row.field }}</strong>
          </template>
        </el-table-column>
        
        <el-table-column label="完整性" width="120">
          <template #default="{ row }">
            <div class="progress-cell">
              <el-progress 
                :percentage="row.completeness" 
                :stroke-width="8"
                :show-text="false"
              />
              <span class="progress-text">{{ row.completeness }}%</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="有效性" width="120">
          <template #default="{ row }">
            <div class="progress-cell">
              <el-progress 
                :percentage="row.validity" 
                :stroke-width="8"
                :show-text="false"
                :status="row.validity >= 95 ? 'success' : row.validity >= 80 ? undefined : 'exception'"
              />
              <span class="progress-text">{{ row.validity }}%</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="问题详情" min-width="200">
          <template #default="{ row }">
            <div class="issues-list">
              <el-tag
                v-for="issue in row.issues || []"
                :key="issue"
                size="small"
                type="warning"
                class="issue-tag"
              >
                {{ issue }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="建议操作" width="150">
          <template #default="{ row }">
            <el-button 
              size="small" 
              type="primary" 
              @click="showFieldDetails(row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 质量趋势图 -->
    <el-card class="quality-trends">
      <template #header>
        <h4>📈 质量趋势分析</h4>
      </template>
      
      <div class="chart-container">
        <div class="chart-placeholder">
          <el-icon><TrendCharts /></el-icon>
          <p>质量趋势图表</p>
          <p class="chart-note">显示各质量指标的历史趋势和改进情况</p>
        </div>
      </div>
    </el-card>

    <!-- 质量分布 -->
    <el-card class="quality-distribution">
      <template #header>
        <h4>📊 质量分布分析</h4>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="distribution-chart">
            <h5>数据质量等级分布</h5>
            <div class="chart-placeholder small">
              <el-icon><PieChart /></el-icon>
              <p>饼图：质量等级分布</p>
            </div>
          </div>
        </el-col>
        
        <el-col :span="12">
          <div class="distribution-stats">
            <h5>质量统计</h5>
            <div class="stats-list">
              <div class="stat-row">
                <span class="stat-label">优秀 (90-100分):</span>
                <span class="stat-value excellent">{{ getQualityLevelCount('excellent') }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">良好 (80-89分):</span>
                <span class="stat-value good">{{ getQualityLevelCount('good') }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">一般 (70-79分):</span>
                <span class="stat-value average">{{ getQualityLevelCount('average') }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">较差 (60-69分):</span>
                <span class="stat-value poor">{{ getQualityLevelCount('poor') }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">很差 (<60分):</span>
                <span class="stat-value very-poor">{{ getQualityLevelCount('very-poor') }}</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 改进建议 -->
    <el-card class="improvement-suggestions">
      <template #header>
        <h4>💡 质量改进建议</h4>
      </template>
      
      <div class="suggestions-list">
        <div class="suggestion-item">
          <div class="suggestion-header">
            <el-icon><Lightbulb /></el-icon>
            <span class="suggestion-title">数据录入规范化</span>
            <el-tag type="warning" size="small">高优先级</el-tag>
          </div>
          <p class="suggestion-content">
            建议制定统一的数据录入标准，特别是物料编码格式，可以显著提高数据一致性。
          </p>
        </div>
        
        <div class="suggestion-item">
          <div class="suggestion-header">
            <el-icon><Lightbulb /></el-icon>
            <span class="suggestion-title">自动化验证</span>
            <el-tag type="info" size="small">中优先级</el-tag>
          </div>
          <p class="suggestion-content">
            在数据录入时增加实时验证功能，可以在源头减少数据质量问题。
          </p>
        </div>
        
        <div class="suggestion-item">
          <div class="suggestion-header">
            <el-icon><Lightbulb /></el-icon>
            <span class="suggestion-title">定期质量审核</span>
            <el-tag type="success" size="small">低优先级</el-tag>
          </div>
          <p class="suggestion-content">
            建立定期的数据质量审核机制，及时发现和解决数据质量问题。
          </p>
        </div>
      </div>
    </el-card>

    <!-- 字段详情对话框 -->
    <el-dialog
      v-model="fieldDetailVisible"
      :title="`字段详情: ${selectedField?.field || ''}`"
      width="60%"
    >
      <div v-if="selectedField" class="field-detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="字段名称">{{ selectedField.field }}</el-descriptions-item>
          <el-descriptions-item label="完整性">{{ selectedField.completeness }}%</el-descriptions-item>
          <el-descriptions-item label="有效性">{{ selectedField.validity }}%</el-descriptions-item>
          <el-descriptions-item label="数据类型">文本</el-descriptions-item>
        </el-descriptions>
        
        <div class="field-issues">
          <h5>发现的问题:</h5>
          <ul>
            <li v-for="issue in selectedField.issues || []" :key="issue">{{ issue }}</li>
          </ul>
        </div>
        
        <div class="field-recommendations">
          <h5>改进建议:</h5>
          <ul>
            <li>建立数据录入标准</li>
            <li>增加格式验证规则</li>
            <li>定期进行数据清洗</li>
          </ul>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref } from 'vue'
import {
  PieChart,
  CircleCheck,
  DataAnalysis,
  Lock as Shield,
  TrendCharts,
  Sunny as Lightbulb
} from '@element-plus/icons-vue'

export default {
  name: 'QualityAnalysis',
  components: {
    PieChart,
    CircleCheck,
    DataAnalysis,
    Shield,
    TrendCharts,
    Lightbulb
  },
  props: {
    analysisData: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const fieldDetailVisible = ref(false)
    const selectedField = ref(null)

    const showFieldDetails = (field) => {
      selectedField.value = field
      fieldDetailVisible.value = true
    }

    const getQualityLevelCount = (level) => {
      // 模拟数据分布
      const distributions = {
        'excellent': 45,
        'good': 32,
        'average': 15,
        'poor': 6,
        'very-poor': 2
      }
      return distributions[level] || 0
    }

    return {
      fieldDetailVisible,
      selectedField,
      showFieldDetails,
      getQualityLevelCount
    }
  }
}
</script>

<style scoped>
.quality-analysis {
  padding: 20px 0;
}

.quality-metrics {
  margin-bottom: 30px;
}

.metric-card {
  padding: 20px;
  border-radius: 12px;
  background: white;
  border: 1px solid #e4e7ed;
  text-align: center;
  transition: all 0.3s;
}

.metric-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.metric-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 500;
  color: #606266;
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 15px;
  color: #303133;
}

.field-analysis,
.quality-trends,
.quality-distribution,
.improvement-suggestions {
  margin-bottom: 20px;
}

.progress-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-text {
  font-size: 12px;
  color: #606266;
  min-width: 35px;
}

.issues-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.issue-tag {
  margin: 0;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #909399;
}

.chart-placeholder.small {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.chart-placeholder .el-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.chart-note {
  font-size: 12px;
  margin-top: 10px;
}

.distribution-chart,
.distribution-stats {
  height: 250px;
}

.distribution-stats h5 {
  margin-bottom: 20px;
  color: #303133;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-label {
  color: #606266;
}

.stat-value {
  font-weight: 600;
  font-size: 18px;
}

.stat-value.excellent {
  color: #67c23a;
}

.stat-value.good {
  color: #409eff;
}

.stat-value.average {
  color: #e6a23c;
}

.stat-value.poor {
  color: #f56c6c;
}

.stat-value.very-poor {
  color: #909399;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.suggestion-item {
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fafafa;
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.suggestion-title {
  font-weight: 500;
  flex: 1;
}

.suggestion-content {
  color: #606266;
  line-height: 1.6;
  margin: 0;
}

.field-detail-content {
  padding: 20px 0;
}

.field-issues,
.field-recommendations {
  margin-top: 20px;
}

.field-issues h5,
.field-recommendations h5 {
  margin-bottom: 10px;
  color: #303133;
}

.field-issues ul,
.field-recommendations ul {
  margin: 0;
  padding-left: 20px;
}

.field-issues li,
.field-recommendations li {
  margin-bottom: 5px;
  color: #606266;
}
</style>
