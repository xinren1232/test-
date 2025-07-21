<template>
  <div class="data-cleaning-page">
    <!-- 页面头部导航 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h2>数据清洗治理系统</h2>
          <p>智能化数据处理与质量管控平台</p>
        </div>
        <div class="header-actions">
          <el-button-group>
            <el-button 
              :type="activeTab === 'governance' ? 'primary' : ''"
              @click="switchTab('governance')"
            >
              数据处理
            </el-button>
            <el-button 
              :type="activeTab === 'dashboard' ? 'primary' : ''"
              @click="switchTab('dashboard')"
            >
              质量监控
            </el-button>
            <el-button 
              :type="activeTab === 'rules' ? 'primary' : ''"
              @click="switchTab('rules')"
            >
              规则管理
            </el-button>
          </el-button-group>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="page-content">
      <!-- 数据处理模块 -->
      <div v-show="activeTab === 'governance'" class="tab-content">
        <div class="content-placeholder">
          <h3>数据处理模块</h3>
          <p>这里将显示数据清洗治理组件</p>
          <el-button type="primary" @click="loadGovernanceComponent">加载数据处理组件</el-button>
        </div>
      </div>

      <!-- 质量监控仪表板 -->
      <div v-show="activeTab === 'dashboard'" class="tab-content">
        <div class="content-placeholder">
          <h3>质量监控仪表板</h3>
          <p>这里将显示质量监控组件</p>
          <el-button type="primary" @click="loadDashboardComponent">加载监控仪表板</el-button>
        </div>
      </div>

      <!-- 规则管理模块 -->
      <div v-show="activeTab === 'rules'" class="tab-content">
        <div class="content-placeholder">
          <h3>规则管理模块</h3>
          <p>这里将显示规则管理组件</p>
          <el-button type="primary" @click="loadRulesComponent">加载规则管理</el-button>
        </div>
      </div>
    </div>

    <!-- 系统状态 -->
    <div class="system-status">
      <el-card>
        <h4>系统状态</h4>
        <div class="status-grid">
          <div class="status-item">
            <span class="status-label">当前模块:</span>
            <span class="status-value">{{ getTabName(activeTab) }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">系统版本:</span>
            <span class="status-value">v1.0.0</span>
          </div>
          <div class="status-item">
            <span class="status-label">运行状态:</span>
            <span class="status-value success">正常</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'DataCleaningPageSimple',
  setup() {
    const activeTab = ref('governance')

    const switchTab = (tab) => {
      activeTab.value = tab
      ElMessage.success(`已切换到${getTabName(tab)}`)
    }

    const getTabName = (tab) => {
      const names = {
        governance: '数据处理',
        dashboard: '质量监控',
        rules: '规则管理'
      }
      return names[tab] || tab
    }

    const loadGovernanceComponent = () => {
      ElMessage.info('正在加载数据处理组件...')
      // 这里可以动态加载组件
    }

    const loadDashboardComponent = () => {
      ElMessage.info('正在加载质量监控组件...')
      // 这里可以动态加载组件
    }

    const loadRulesComponent = () => {
      ElMessage.info('正在加载规则管理组件...')
      // 这里可以动态加载组件
    }

    return {
      activeTab,
      switchTab,
      getTabName,
      loadGovernanceComponent,
      loadDashboardComponent,
      loadRulesComponent
    }
  }
}
</script>

<style scoped>
.data-cleaning-page {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 30px;
  margin-bottom: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.header-left h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.header-left p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  align-items: center;
}

.page-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.tab-content {
  min-height: 400px;
}

.content-placeholder {
  background: white;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.content-placeholder h3 {
  color: #2c3e50;
  margin-bottom: 16px;
}

.content-placeholder p {
  color: #606266;
  margin-bottom: 24px;
}

.system-status {
  max-width: 1400px;
  margin: 20px auto;
  padding: 0 20px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.status-label {
  color: #606266;
  font-size: 14px;
}

.status-value {
  color: #2c3e50;
  font-weight: 500;
}

.status-value.success {
  color: #67c23a;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .page-content {
    padding: 10px;
  }
  
  .content-placeholder {
    padding: 20px;
  }
}
</style>
