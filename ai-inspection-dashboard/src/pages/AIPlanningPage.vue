<template>
  <div class="ai-planning-page">
    <div class="page-header">
      <h1>🎯 AI规划文档</h1>
      <p class="description">QMS系统AI建设规划与发展路线图</p>
    </div>
    
    <div class="planning-content">
      <el-row :gutter="24">
        <el-col :span="24">
          <el-card shadow="hover" class="planning-card">
            <template #header>
              <div class="card-header">
                <span>📋 AI建设规划概览</span>
              </div>
            </template>
            
            <div class="planning-overview">
              <el-timeline>
                <el-timeline-item
                  v-for="(period, index) in planningPhases"
                  :key="index"
                  :timestamp="period.timeline"
                  placement="top"
                  :type="period.status"
                  :color="period.color"
                >
                  <el-card shadow="never" :class="['period-card', period.cardClass]">
                    <h3>{{ period.title }}</h3>
                    <p>{{ period.description }}</p>
                    <div class="period-details">
                      <el-tag
                        v-for="item in period.items"
                        :key="item"
                        class="period-tag"
                        :type="period.tagType"
                      >
                        {{ item }}
                      </el-tag>
                    </div>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="24" style="margin-top: 24px;" class="aligned-row">
        <el-col :span="12">
          <el-card shadow="hover" class="planning-card equal-height-card">
            <template #header>
              <div class="card-header">
                <span>🎯 核心目标</span>
              </div>
            </template>

            <div class="goals-list">
              <div v-for="goal in coreGoals" :key="goal.id" class="goal-item">
                <div class="goal-icon">{{ goal.icon }}</div>
                <div class="goal-content">
                  <h4>{{ goal.title }}</h4>
                  <p>{{ goal.description }}</p>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card shadow="hover" class="planning-card equal-height-card">
            <template #header>
              <div class="card-header">
                <span>🔧 技术栈规划</span>
              </div>
            </template>

            <div class="tech-stack">
              <div v-for="category in techStack" :key="category.name" class="tech-category">
                <h4>{{ category.name }}</h4>
                <div class="tech-items">
                  <el-tag
                    v-for="tech in category.technologies"
                    :key="tech"
                    class="tech-tag"
                    type="info"
                  >
                    {{ tech }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// AI建设规划数据 - 从2025年Q1开始，添加颜色区分和状态备注
const planningPhases = ref([
  {
    title: '基础设施建设（已完成）',
    timeline: '2025 Q1-Q2',
    status: 'success',
    color: '#67C23A',
    cardClass: 'period-card-green',
    tagType: 'success',
    description: '完成基础数据平台和模拟场景搭建，构建AI系统基础架构',
    items: ['数据采集系统', '模拟环境搭建', '基础API开发', '数据存储优化']
  },
  {
    title: '智能化功能开发（建设中）',
    timeline: '2025 Q3-Q4',
    status: 'warning',
    color: '#E6A23C',
    cardClass: 'period-card-orange',
    tagType: 'warning',
    description: '开发核心AI功能和智能分析能力，实现基础智能化应用',
    items: ['智能问答系统', 'AI场景管理', '数据分析引擎', '规则引擎优化']
  },
  {
    title: '高级AI能力建设',
    timeline: '2026 Q1-Q2',
    status: 'info',
    color: '#909399',
    cardClass: 'period-card-gray',
    tagType: 'info',
    description: '构建高级AI能力和自动化决策系统，提升智能化水平',
    items: ['机器学习模型', '预测分析', '自动化决策', '智能优化']
  },
  {
    title: '全面智能化集成',
    timeline: '2026 Q3-Q4',
    status: 'danger',
    color: '#F56C6C',
    cardClass: 'period-card-red',
    tagType: 'danger',
    description: '实现全面智能化和自主运营，打造完整AI生态系统',
    items: ['自主学习系统', '智能运维', '全链路优化', '生态集成']
  }
]);

// 核心目标
const coreGoals = ref([
  {
    id: 1,
    icon: '🎯',
    title: '智能质量检验',
    description: '构建全自动化的智能质量检验系统，提升检验效率和准确性'
  },
  {
    id: 2,
    icon: '📊',
    title: '数据驱动决策',
    description: '基于大数据分析和AI算法，实现数据驱动的智能决策支持'
  },
  {
    id: 3,
    icon: '🔄',
    title: '流程自动化',
    description: '实现从数据采集到结果输出的全流程自动化处理'
  },
  {
    id: 4,
    icon: '🚀',
    title: '持续优化',
    description: '建立自学习和持续优化机制，不断提升系统性能'
  }
]);

// 技术栈规划
const techStack = ref([
  {
    name: 'AI/ML框架',
    technologies: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'OpenAI API']
  },
  {
    name: '数据处理',
    technologies: ['Pandas', 'NumPy', 'Apache Spark', 'Elasticsearch']
  },
  {
    name: '后端技术',
    technologies: ['Python Flask', 'FastAPI', 'Redis', 'PostgreSQL']
  },
  {
    name: '前端技术',
    technologies: ['Vue 3', 'Element Plus', 'Chart.js', 'D3.js']
  },
  {
    name: '部署运维',
    technologies: ['Docker', 'Kubernetes', 'Nginx', 'Prometheus']
  }
]);

// 获取标签类型
const getTagType = (status) => {
  const typeMap = {
    'success': 'success',
    'primary': 'primary',
    'warning': 'warning',
    'info': 'info'
  };
  return typeMap[status] || 'info';
};
</script>

<style scoped>
.ai-planning-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  margin: 0 0 12px 0;
  font-size: 32px;
  font-weight: 600;
}

.page-header .description {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.planning-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: none;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.planning-overview {
  padding: 20px 0;
}

.period-card {
  margin-left: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.period-card h3 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
}

.period-card p {
  margin: 0 0 16px 0;
  color: #606266;
  line-height: 1.6;
}

.period-details {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.period-tag {
  margin: 0;
}

/* 时间线颜色区分样式 */
.period-card-green {
  border-left: 4px solid #67C23A;
  background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
}

.period-card-orange {
  border-left: 4px solid #E6A23C;
  background: linear-gradient(135deg, #fef7e6 0%, #ffffff 100%);
}

.period-card-gray {
  border-left: 4px solid #909399;
  background: linear-gradient(135deg, #f4f4f5 0%, #ffffff 100%);
}

.period-card-red {
  border-left: 4px solid #F56C6C;
  background: linear-gradient(135deg, #fef0f0 0%, #ffffff 100%);
}

/* 布局对齐样式 */
.aligned-row {
  display: flex;
  align-items: stretch;
}

.equal-height-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.equal-height-card .el-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.goal-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.goal-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.goal-content h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 16px;
}

.goal-content p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

.tech-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tech-category h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
  border-bottom: 2px solid #e4e7ed;
  padding-bottom: 8px;
}

.tech-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-tag {
  margin: 0;
}

@media (max-width: 768px) {
  .ai-planning-page {
    padding: 16px;
  }
  
  .page-header {
    padding: 24px;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
  
  .goal-item {
    flex-direction: column;
    text-align: center;
  }
}
</style>
