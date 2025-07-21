<template>
  <div class="home-container">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-card">
        <div class="welcome-icon">
          <el-icon size="48"><DataAnalysis /></el-icon>
        </div>
        <div class="welcome-content">
          <h1>欢迎使用 QMS智能管理系统</h1>
          <p>Quality Management System - 智能质量管理解决方案</p>
        </div>
      </div>
    </div>

    <!-- 功能模块 -->
    <div class="modules-section">
      <h2>系统功能模块</h2>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6" v-for="module in modules" :key="module.name">
          <div class="module-card" @click="navigateTo(module.path)">
            <div class="module-icon">
              <el-icon size="32" :color="module.color">
                <component :is="module.icon" />
              </el-icon>
            </div>
            <div class="module-content">
              <h3>{{ module.name }}</h3>
              <p>{{ module.description }}</p>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 系统状态 -->
    <div class="status-section">
      <h2>系统状态</h2>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="8">
          <div class="status-card">
            <div class="status-icon success">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="status-content">
              <h3>前端服务</h3>
              <p>运行正常</p>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8">
          <div class="status-card">
            <div class="status-icon success">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="status-content">
              <h3>后端API</h3>
              <p>连接正常</p>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8">
          <div class="status-card">
            <div class="status-icon success">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="status-content">
              <h3>数据库</h3>
              <p>连接正常</p>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import { 
  DataAnalysis, 
  Goods, 
  Document, 
  OfficeBuilding, 
  ChatLineRound,
  CircleCheck
} from '@element-plus/icons-vue';

export default {
  name: 'HomeView',
  components: {
    DataAnalysis,
    Goods,
    Document,
    OfficeBuilding,
    ChatLineRound,
    CircleCheck
  },
  setup() {
    const router = useRouter();

    const modules = [
      {
        name: '库存管理',
        description: '物料库存信息管理与查询',
        icon: 'Goods',
        color: '#409EFF',
        path: '/inventory'
      },
      {
        name: '测试管理',
        description: '质量测试数据管理与分析',
        icon: 'Document',
        color: '#67C23A',
        path: '/lab'
      },
      {
        name: '上线跟踪',
        description: '生产上线状态跟踪管理',
        icon: 'OfficeBuilding',
        color: '#E6A23C',
        path: '/factory'
      },
      {
        name: 'QMS智能助手',
        description: '智能问答与数据分析助手',
        icon: 'ChatLineRound',
        color: '#F56C6C',
        path: '/assistant'
      }
    ];

    const navigateTo = (path) => {
      router.push(path);
    };

    return {
      modules,
      navigateTo
    };
  }
};
</script>

<style scoped>
.home-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  margin-bottom: 40px;
}

.welcome-card {
  background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
  color: white;
  padding: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.3);
}

.welcome-icon {
  margin-right: 30px;
}

.welcome-content h1 {
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: 600;
}

.welcome-content p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.modules-section {
  margin-bottom: 40px;
}

.modules-section h2 {
  margin-bottom: 20px;
  color: #1f2937;
  font-size: 24px;
}

.module-card {
  background: white;
  padding: 30px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  margin-bottom: 20px;
}

.module-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.module-icon {
  margin-bottom: 15px;
}

.module-content h3 {
  margin: 0 0 10px 0;
  color: #1f2937;
  font-size: 18px;
}

.module-content p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.status-section h2 {
  margin-bottom: 20px;
  color: #1f2937;
  font-size: 24px;
}

.status-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.status-icon {
  margin-right: 15px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon.success {
  background-color: #f0f9ff;
  color: #67C23A;
}

.status-content h3 {
  margin: 0 0 5px 0;
  color: #1f2937;
  font-size: 16px;
}

.status-content p {
  margin: 0;
  color: #67C23A;
  font-size: 14px;
}
</style>
