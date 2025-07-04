<template>
  <div class="ai-roadmap-page">
    <div class="page-header">
      <h1>🗺️ 技术路线图</h1>
      <p class="description">QMS系统技术发展路径与实施计划</p>
    </div>
    
    <div class="roadmap-content">
      <el-row :gutter="24">
        <el-col :span="24">
          <el-card shadow="hover" class="roadmap-card">
            <template #header>
              <div class="card-header">
                <span>🛣️ 技术发展路线</span>
                <div class="header-actions">
                  <el-button type="primary" size="small">
                    <el-icon><Download /></el-icon>
                    导出路线图
                  </el-button>
                </div>
              </div>
            </template>
            
            <div class="roadmap-timeline">
              <div class="timeline-container">
                <div v-for="(milestone, index) in roadmapMilestones" :key="index" class="milestone-item">
                  <div class="milestone-date">{{ milestone.date }}</div>
                  <div class="milestone-content">
                    <div class="milestone-header">
                      <h3>{{ milestone.title }}</h3>
                      <el-tag :type="milestone.status">{{ getStatusText(milestone.status) }}</el-tag>
                    </div>
                    <p class="milestone-description">{{ milestone.description }}</p>
                    <div class="milestone-technologies">
                      <div v-for="tech in milestone.technologies" :key="tech.name" class="tech-item">
                        <div class="tech-name">{{ tech.name }}</div>
                        <el-progress :percentage="tech.progress" :status="tech.progress === 100 ? 'success' : 'primary'" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="24" style="margin-top: 24px;">
        <el-col :span="8">
          <el-card shadow="hover" class="stats-card">
            <template #header>
              <div class="card-header">
                <span>📊 进度统计</span>
              </div>
            </template>
            
            <div class="progress-stats">
              <div class="stat-item">
                <div class="stat-label">总体进度</div>
                <el-progress :percentage="overallProgress" :stroke-width="12" />
              </div>
              <div class="stat-item">
                <div class="stat-label">已完成里程碑</div>
                <div class="stat-value">{{ completedMilestones }}/{{ totalMilestones }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">进行中项目</div>
                <div class="stat-value">{{ inProgressProjects }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card shadow="hover" class="priority-card">
            <template #header>
              <div class="card-header">
                <span>⚡ 优先级任务</span>
              </div>
            </template>
            
            <div class="priority-tasks">
              <div v-for="task in priorityTasks" :key="task.id" class="task-item">
                <div class="task-priority" :class="task.priority">{{ getPriorityText(task.priority) }}</div>
                <div class="task-content">
                  <div class="task-title">{{ task.title }}</div>
                  <div class="task-deadline">截止：{{ task.deadline }}</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card shadow="hover" class="resources-card">
            <template #header>
              <div class="card-header">
                <span>🔧 技术资源</span>
              </div>
            </template>
            
            <div class="tech-resources">
              <div v-for="resource in techResources" :key="resource.category" class="resource-category">
                <h4>{{ resource.category }}</h4>
                <div class="resource-items">
                  <el-tag
                    v-for="item in resource.items"
                    :key="item"
                    class="resource-tag"
                    size="small"
                  >
                    {{ item }}
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
import { ref, computed } from 'vue';
import { Download } from '@element-plus/icons-vue';

// 路线图里程碑 - 基于2025年Q2当前时间点
const roadmapMilestones = ref([
  {
    date: '2024 Q1-2025 Q1',
    title: '基础架构搭建',
    description: '完成系统基础架构和核心模块开发（已完成）',
    status: 'success',
    technologies: [
      { name: 'Vue 3 前端框架', progress: 100 },
      { name: 'Flask 后端API', progress: 100 },
      { name: '数据库设计', progress: 100 },
      { name: '基础UI组件', progress: 100 }
    ]
  },
  {
    date: '2025 Q2',
    title: '数据处理能力',
    description: '构建数据采集、处理和存储能力（当前阶段）',
    status: 'primary',
    technologies: [
      { name: '数据采集系统', progress: 95 },
      { name: '数据清洗工具', progress: 90 },
      { name: '数据可视化', progress: 85 },
      { name: '报表生成', progress: 80 }
    ]
  },
  {
    date: '2025 Q3-Q4',
    title: 'AI能力集成',
    description: '集成AI模型和智能分析功能',
    status: 'warning',
    technologies: [
      { name: '智能问答系统', progress: 60 },
      { name: '规则引擎', progress: 55 },
      { name: '机器学习模型', progress: 35 },
      { name: '自然语言处理', progress: 30 }
    ]
  },
  {
    date: '2026 Q1-Q2',
    title: '高级AI功能',
    description: '开发预测分析和自动化决策功能',
    status: 'info',
    technologies: [
      { name: '预测分析模型', progress: 20 },
      { name: '异常检测算法', progress: 15 },
      { name: '自动化工作流', progress: 10 },
      { name: '智能推荐系统', progress: 5 }
    ]
  }
]);

// 优先级任务 - 基于2025年Q2当前时间点
const priorityTasks = ref([
  { id: 1, title: '完善智能问答系统', priority: 'high', deadline: '2025-08-15' },
  { id: 2, title: '优化数据处理性能', priority: 'medium', deadline: '2025-08-30' },
  { id: 3, title: '集成机器学习模型', priority: 'high', deadline: '2025-09-15' },
  { id: 4, title: '开发移动端适配', priority: 'low', deadline: '2025-10-01' },
  { id: 5, title: '构建预测分析模型', priority: 'high', deadline: '2025-12-15' },
  { id: 6, title: '实现异常检测算法', priority: 'medium', deadline: '2026-01-30' }
]);

// 技术资源
const techResources = ref([
  {
    category: 'AI/ML',
    items: ['TensorFlow', 'PyTorch', 'OpenAI API', 'Hugging Face']
  },
  {
    category: '数据处理',
    items: ['Pandas', 'NumPy', 'Apache Spark', 'Elasticsearch']
  },
  {
    category: '可视化',
    items: ['Chart.js', 'D3.js', 'Plotly', 'ECharts']
  },
  {
    category: '部署',
    items: ['Docker', 'Kubernetes', 'Nginx', 'Redis']
  }
]);

// 计算属性
const overallProgress = computed(() => {
  const totalTechs = roadmapMilestones.value.reduce((sum, milestone) => sum + milestone.technologies.length, 0);
  const totalProgress = roadmapMilestones.value.reduce((sum, milestone) => 
    sum + milestone.technologies.reduce((techSum, tech) => techSum + tech.progress, 0), 0);
  return Math.round(totalProgress / totalTechs);
});

const completedMilestones = computed(() => 
  roadmapMilestones.value.filter(m => m.status === 'success').length
);

const totalMilestones = computed(() => roadmapMilestones.value.length);

const inProgressProjects = computed(() => 
  roadmapMilestones.value.filter(m => m.status === 'primary').length
);

// 辅助方法
const getStatusText = (status) => {
  const statusMap = {
    'success': '已完成',
    'primary': '进行中',
    'warning': '计划中',
    'info': '待开始'
  };
  return statusMap[status] || '未知';
};

const getPriorityText = (priority) => {
  const priorityMap = {
    'high': '高',
    'medium': '中',
    'low': '低'
  };
  return priorityMap[priority] || '未知';
};
</script>

<style scoped>
.ai-roadmap-page {
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

.roadmap-card, .stats-card, .priority-card, .resources-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.timeline-container {
  position: relative;
  padding-left: 40px;
}

.timeline-container::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e4e7ed;
}

.milestone-item {
  position: relative;
  margin-bottom: 40px;
}

.milestone-item::before {
  content: '';
  position: absolute;
  left: -28px;
  top: 8px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #409eff;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #409eff;
}

.milestone-date {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.milestone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.milestone-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.milestone-description {
  margin: 0 0 16px 0;
  color: #606266;
  line-height: 1.6;
}

.milestone-technologies {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.tech-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.tech-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
}

.progress-stats {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.priority-tasks {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.task-priority {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.task-priority.high { background: #f56c6c; }
.task-priority.medium { background: #e6a23c; }
.task-priority.low { background: #67c23a; }

.task-content {
  flex: 1;
}

.task-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.task-deadline {
  font-size: 12px;
  color: #909399;
}

.tech-resources {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.resource-category h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 14px;
}

.resource-items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.resource-tag {
  margin: 0;
}

@media (max-width: 768px) {
  .ai-roadmap-page {
    padding: 16px;
  }
  
  .page-header {
    padding: 24px;
  }
  
  .milestone-technologies {
    grid-template-columns: 1fr;
  }
  
  .task-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
