<template>
  <div class="analysis-view">
    <h2 class="page-title">高级数据分析</h2>
    
    <el-tabs v-model="activeTab" type="border-card" class="main-tabs">
      <el-tab-pane label="多参数相关性分析" name="correlation">
        <correlation-analyzer />
      </el-tab-pane>
      
      <el-tab-pane label="物料-供应商风险矩阵" name="riskMatrix">
        <risk-matrix />
      </el-tab-pane>
      
      <el-tab-pane label="质量趋势预测" name="prediction">
        <quality-predictor />
      </el-tab-pane>
    </el-tabs>
    
    <div class="analysis-insights">
      <h3>
        <el-icon><InfoFilled /></el-icon>
        分析建议
      </h3>
      
      <div class="insights-cards">
        <el-card v-for="(insight, index) in insights" :key="index" class="insight-card" shadow="hover">
          <div class="insight-header">
            <el-icon :class="`insight-icon-${insight.type}`">
              <component :is="getInsightIcon(insight.type)"></component>
            </el-icon>
            <h4>{{ insight.title }}</h4>
          </div>
          <p>{{ insight.content }}</p>
          <div class="insight-footer">
            <el-tag size="small" :type="getInsightTagType(insight.type)">{{ insight.category }}</el-tag>
            <el-button link size="small">了解更多</el-button>
          </div>
        </el-card>
      </div>
    </div>
    
    <div class="export-options">
      <el-dropdown @command="handleExport">
        <el-button type="primary">
          导出分析报告<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="excel">导出Excel</el-dropdown-item>
            <el-dropdown-item command="pdf">导出PDF报告</el-dropdown-item>
            <el-dropdown-item command="presentation">生成演示文稿</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      
      <el-button type="success" @click="shareAnalysis">
        <el-icon><Share /></el-icon>
        分享分析结果
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { InfoFilled, Warning, Histogram, Share } from '@element-plus/icons-vue';
import CorrelationAnalyzer from '../components/analysis/CorrelationAnalyzer.vue';
import RiskMatrix from '../components/analysis/RiskMatrix.vue';
import QualityPredictor from '../components/analysis/QualityPredictor.vue';

// 活动标签页
const activeTab = ref('correlation');

// 分析洞察数据
const insights = [
  {
    title: '强相关性发现',
    content: '材料硬度与耐磨性之间存在高达0.72的相关性，表明提升材料硬度可能同时改善耐磨表现，建议调整材料配方优先考虑这两个参数。',
    category: '参数相关',
    type: 'info'
  },
  {
    title: '高风险供应商警告',
    content: '供应商"易湛"提供的保护膜批次近期不良率持续攀升，已达到58%的风险评分，建议立即审核其生产工艺并考虑增加抽检比例。',
    category: '供应商风险',
    type: 'warning'
  },
  {
    title: '质量趋势预测',
    content: '电池盖(37301062)批次预计在未来30天内不良率将上升至7.5%，超过5%的安全阈值，建议提前介入并调整生产参数。',
    category: '趋势预测',
    type: 'danger'
  },
  {
    title: '改进机会',
    content: '基于多参数分析，发现工艺温度与不良率存在明显负相关(-0.65)，建议在允许范围内适当提高工艺温度，可能降低20%的不良率。',
    category: '工艺优化',
    type: 'success'
  }
];

// 获取洞察图标
const getInsightIcon = (type) => {
  switch (type) {
    case 'warning': return Warning;
    case 'danger': return Warning;
    case 'success': return Histogram;
    default: return InfoFilled;
  }
};

// 获取洞察标签类型
const getInsightTagType = (type) => {
  switch (type) {
    case 'warning': return 'warning';
    case 'danger': return 'danger';
    case 'success': return 'success';
    default: return 'info';
  }
};

// 处理导出
const handleExport = (command) => {
  let message = '';
  switch (command) {
    case 'excel':
      message = '已导出Excel分析报告';
      break;
    case 'pdf':
      message = '已生成PDF分析报告';
      break;
    case 'presentation':
      message = '已生成演示文稿';
      break;
  }
  
  ElMessage({
    type: 'success',
    message
  });
};

// 分享分析
const shareAnalysis = () => {
  ElMessage({
    type: 'success',
    message: '分析结果已分享至相关团队'
  });
};
</script>

<style scoped>
.analysis-view {
  padding: 20px;
}

.page-title {
  font-size: 22px;
  margin-bottom: 20px;
  color: #303133;
  font-weight: 600;
}

.main-tabs {
  margin-bottom: 30px;
}

.analysis-insights {
  margin-bottom: 30px;
}

.analysis-insights h3 {
  font-size: 18px;
  margin-bottom: 20px;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.insights-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.insight-card {
  height: 100%;
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.insight-header h4 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.insight-icon-info {
  color: #409EFF;
}

.insight-icon-warning {
  color: #E6A23C;
}

.insight-icon-danger {
  color: #F56C6C;
}

.insight-icon-success {
  color: #67C23A;
}

.insight-card p {
  color: #606266;
  line-height: 1.6;
  margin: 0 0 15px 0;
}

.insight-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.export-options {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .insights-cards {
    grid-template-columns: 1fr;
  }
  
  .export-options {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
}
</style> 