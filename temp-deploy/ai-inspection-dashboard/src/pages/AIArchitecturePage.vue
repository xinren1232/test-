<template>
  <div class="ai-architecture-page">
    <div class="page-header">
      <h1>🏗️ 架构设计</h1>
      <p class="description">QMS系统技术架构与组件设计</p>
    </div>
    
    <div class="architecture-content">
      <el-row :gutter="24">
        <el-col :span="24">
          <el-card shadow="hover" class="architecture-card">
            <template #header>
              <div class="card-header">
                <span>🏛️ 系统架构图</span>
                <div class="header-actions">
                  <el-button type="primary" size="small">
                    <el-icon><View /></el-icon>
                    查看详细图
                  </el-button>
                </div>
              </div>
            </template>
            
            <div class="architecture-diagram">
              <div class="layer" v-for="layer in architectureLayers" :key="layer.name">
                <div class="layer-header">
                  <h3>{{ layer.name }}</h3>
                  <span class="layer-description">{{ layer.description }}</span>
                </div>
                <div class="layer-components">
                  <div 
                    v-for="component in layer.components" 
                    :key="component.name"
                    class="component-item"
                    :class="component.status"
                  >
                    <div class="component-icon">{{ component.icon }}</div>
                    <div class="component-info">
                      <div class="component-name">{{ component.name }}</div>
                      <div class="component-tech">{{ component.technology }}</div>
                    </div>
                    <div class="component-status">
                      <el-tag :type="getStatusType(component.status)" size="small">
                        {{ getStatusText(component.status) }}
                      </el-tag>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="24" style="margin-top: 24px;">
        <el-col :span="12">
          <el-card shadow="hover" class="design-card">
            <template #header>
              <div class="card-header">
                <span>🎨 设计原则</span>
              </div>
            </template>
            
            <div class="design-principles">
              <div v-for="principle in designPrinciples" :key="principle.id" class="principle-item">
                <div class="principle-icon">{{ principle.icon }}</div>
                <div class="principle-content">
                  <h4>{{ principle.title }}</h4>
                  <p>{{ principle.description }}</p>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card shadow="hover" class="patterns-card">
            <template #header>
              <div class="card-header">
                <span>🔧 架构模式</span>
              </div>
            </template>
            
            <div class="architecture-patterns">
              <div v-for="pattern in architecturePatterns" :key="pattern.name" class="pattern-item">
                <div class="pattern-header">
                  <span class="pattern-name">{{ pattern.name }}</span>
                  <el-tag :type="pattern.adopted ? 'success' : 'info'" size="small">
                    {{ pattern.adopted ? '已采用' : '计划中' }}
                  </el-tag>
                </div>
                <p class="pattern-description">{{ pattern.description }}</p>
                <div class="pattern-benefits">
                  <el-tag 
                    v-for="benefit in pattern.benefits" 
                    :key="benefit"
                    size="small"
                    class="benefit-tag"
                  >
                    {{ benefit }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="24" style="margin-top: 24px;">
        <el-col :span="24">
          <el-card shadow="hover" class="integration-card">
            <template #header>
              <div class="card-header">
                <span>🔗 集成架构</span>
              </div>
            </template>
            
            <div class="integration-diagram">
              <div class="integration-flow">
                <div v-for="(step, index) in integrationFlow" :key="step.id" class="flow-step">
                  <div class="step-number">{{ index + 1 }}</div>
                  <div class="step-content">
                    <h4>{{ step.title }}</h4>
                    <p>{{ step.description }}</p>
                    <div class="step-technologies">
                      <el-tag 
                        v-for="tech in step.technologies" 
                        :key="tech"
                        size="small"
                        type="primary"
                      >
                        {{ tech }}
                      </el-tag>
                    </div>
                  </div>
                  <div v-if="index < integrationFlow.length - 1" class="flow-arrow">→</div>
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
import { View } from '@element-plus/icons-vue';

// 架构层级
const architectureLayers = ref([
  {
    name: '表现层 (Presentation Layer)',
    description: '用户界面和交互层',
    components: [
      { name: 'Vue 3 前端', icon: '🖥️', technology: 'Vue.js + Element Plus', status: 'active' },
      { name: '移动端应用', icon: '📱', technology: 'React Native', status: 'planned' },
      { name: 'API网关', icon: '🚪', technology: 'Nginx + Kong', status: 'active' }
    ]
  },
  {
    name: '业务层 (Business Layer)',
    description: '业务逻辑和服务层',
    components: [
      { name: '智能问答服务', icon: '🤖', technology: 'Python + FastAPI', status: 'active' },
      { name: '数据分析服务', icon: '📊', technology: 'Python + Pandas', status: 'active' },
      { name: '规则引擎', icon: '⚙️', technology: 'Python + SQLAlchemy', status: 'development' },
      { name: 'AI模型服务', icon: '🧠', technology: 'TensorFlow + PyTorch', status: 'planned' }
    ]
  },
  {
    name: '数据层 (Data Layer)',
    description: '数据存储和管理层',
    components: [
      { name: 'PostgreSQL', icon: '🗄️', technology: 'PostgreSQL 14+', status: 'active' },
      { name: 'Redis缓存', icon: '⚡', technology: 'Redis 7+', status: 'active' },
      { name: '文件存储', icon: '📁', technology: 'MinIO + S3', status: 'development' },
      { name: '搜索引擎', icon: '🔍', technology: 'Elasticsearch', status: 'planned' }
    ]
  },
  {
    name: '基础设施层 (Infrastructure Layer)',
    description: '部署和运维层',
    components: [
      { name: '容器化', icon: '🐳', technology: 'Docker + Kubernetes', status: 'development' },
      { name: '监控系统', icon: '📈', technology: 'Prometheus + Grafana', status: 'planned' },
      { name: '日志系统', icon: '📝', technology: 'ELK Stack', status: 'planned' },
      { name: '安全网关', icon: '🔒', technology: 'OAuth2 + JWT', status: 'development' }
    ]
  }
]);

// 设计原则
const designPrinciples = ref([
  {
    id: 1,
    icon: '🎯',
    title: '单一职责原则',
    description: '每个组件只负责一个特定的功能，确保系统的模块化和可维护性'
  },
  {
    id: 2,
    icon: '🔄',
    title: '松耦合高内聚',
    description: '组件间依赖最小化，内部功能高度相关，提升系统的灵活性'
  },
  {
    id: 3,
    icon: '📈',
    title: '可扩展性',
    description: '支持水平和垂直扩展，满足业务增长和性能需求'
  },
  {
    id: 4,
    icon: '🛡️',
    title: '安全性',
    description: '多层安全防护，数据加密传输，访问权限控制'
  }
]);

// 架构模式
const architecturePatterns = ref([
  {
    name: '微服务架构',
    description: '将系统拆分为独立的微服务，每个服务负责特定的业务功能',
    adopted: true,
    benefits: ['独立部署', '技术栈灵活', '故障隔离', '团队自治']
  },
  {
    name: '事件驱动架构',
    description: '通过事件进行组件间通信，实现松耦合的异步处理',
    adopted: false,
    benefits: ['异步处理', '系统解耦', '可扩展性', '实时响应']
  },
  {
    name: 'CQRS模式',
    description: '命令查询职责分离，优化读写操作的性能和扩展性',
    adopted: false,
    benefits: ['读写分离', '性能优化', '复杂查询', '数据一致性']
  },
  {
    name: 'API优先设计',
    description: '以API为中心设计系统，确保前后端分离和集成便利性',
    adopted: true,
    benefits: ['前后端分离', '集成便利', '版本管理', '文档化']
  }
]);

// 集成流程
const integrationFlow = ref([
  {
    id: 1,
    title: '数据采集',
    description: '从各种数据源采集原始数据',
    technologies: ['Python', 'Pandas', 'API']
  },
  {
    id: 2,
    title: '数据处理',
    description: '清洗、转换和标准化数据',
    technologies: ['ETL', 'Apache Spark', 'Redis']
  },
  {
    id: 3,
    title: '业务逻辑',
    description: '执行业务规则和智能分析',
    technologies: ['FastAPI', 'AI Models', 'Rules Engine']
  },
  {
    id: 4,
    title: '结果输出',
    description: '生成报告和可视化展示',
    technologies: ['Vue.js', 'Chart.js', 'PDF']
  }
]);

// 辅助方法
const getStatusType = (status) => {
  const typeMap = {
    'active': 'success',
    'development': 'primary',
    'planned': 'warning',
    'deprecated': 'danger'
  };
  return typeMap[status] || 'info';
};

const getStatusText = (status) => {
  const textMap = {
    'active': '运行中',
    'development': '开发中',
    'planned': '计划中',
    'deprecated': '已废弃'
  };
  return textMap[status] || '未知';
};
</script>

<style scoped>
.ai-architecture-page {
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

.architecture-card, .design-card, .patterns-card, .integration-card {
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

.layer {
  margin-bottom: 32px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.layer-header {
  margin-bottom: 16px;
}

.layer-header h3 {
  margin: 0 0 4px 0;
  color: #303133;
  font-size: 18px;
}

.layer-description {
  color: #606266;
  font-size: 14px;
}

.layer-components {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.component-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
}

.component-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.component-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.component-info {
  flex: 1;
}

.component-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.component-tech {
  font-size: 12px;
  color: #909399;
}

.design-principles {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.principle-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.principle-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.principle-content h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 16px;
}

.principle-content p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

.architecture-patterns {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pattern-item {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.pattern-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.pattern-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.pattern-description {
  margin: 0 0 12px 0;
  color: #606266;
  line-height: 1.6;
}

.pattern-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.benefit-tag {
  margin: 0;
}

.integration-flow {
  display: flex;
  align-items: center;
  gap: 20px;
  overflow-x: auto;
  padding: 20px 0;
}

.flow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 200px;
  text-align: center;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 12px;
}

.step-content h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 16px;
}

.step-content p {
  margin: 0 0 12px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.step-technologies {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}

.flow-arrow {
  font-size: 24px;
  color: #409eff;
  margin: 0 10px;
}

@media (max-width: 768px) {
  .ai-architecture-page {
    padding: 16px;
  }
  
  .page-header {
    padding: 24px;
  }
  
  .layer-components {
    grid-template-columns: 1fr;
  }
  
  .integration-flow {
    flex-direction: column;
  }
  
  .flow-arrow {
    transform: rotate(90deg);
    margin: 10px 0;
  }
}
</style>
