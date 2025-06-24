<template>
  <div class="main-layout">
    <!-- 侧边栏 -->
    <div class="sidebar" :class="{ 'collapsed': isCollapsed }">
      <!-- 系统LOGO -->
      <div class="logo-container">
        <h3 class="logo-text" v-if="!isCollapsed">IQE动态检验系统</h3>
        <h3 class="logo-mini" v-else>IQE</h3>
      </div>
      
      <!-- 导航菜单 -->
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="isCollapsed"
        background-color="#304156"
        text-color="#fff"
        active-text-color="#ffd04b"
        router
        unique-opened
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <template #title>首页</template>
        </el-menu-item>
        
        <el-menu-item index="/dashboard">
          <el-icon><DataBoard /></el-icon>
          <template #title>监控仪表板</template>
        </el-menu-item>
        
        <el-sub-menu index="/inventory">
          <template #title>
            <el-icon><Goods /></el-icon>
            <span>库存管理</span>
          </template>
          <el-menu-item index="/inventory">风险批次管理</el-menu-item>
          <el-menu-item index="/inventory-management">库存明细管理</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="/factory-menu">
          <template #title>
            <el-icon><OfficeBuilding /></el-icon>
            <span>工厂管理</span>
          </template>
          <el-menu-item index="/factory">工厂状态</el-menu-item>
          <el-menu-item index="/monitoring">实时监控</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="/lab-menu">
          <template #title>
            <el-icon><Stopwatch /></el-icon>
            <span>实验室测试</span>
          </template>
          <el-menu-item index="/lab">实验室状态</el-menu-item>
          <el-menu-item index="/lab-inspection">检验任务</el-menu-item>
        </el-sub-menu>
        
        <el-menu-item index="/batch">
          <el-icon><Document /></el-icon>
          <template #title>批次管理</template>
        </el-menu-item>
        
        <el-menu-item index="/quality">
          <el-icon><Operation /></el-icon>
          <template #title>质量管理</template>
        </el-menu-item>
        
        <el-menu-item index="/analysis">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>数据分析</template>
        </el-menu-item>
        
        <el-menu-item index="/knowledge-qa">
          <el-icon><ChatLineRound /></el-icon>
          <template #title>智能问答</template>
        </el-menu-item>
      </el-menu>
      
      <!-- 折叠按钮 -->
      <div class="collapse-btn" @click="toggleCollapse">
        <el-icon v-if="isCollapsed"><Expand /></el-icon>
        <el-icon v-else><Fold /></el-icon>
      </div>
    </div>
    
    <!-- 右侧内容区域 -->
    <div class="main-content" :class="{ 'expanded': isCollapsed }">
      <!-- 顶部导航栏 -->
      <div class="header">
        <div class="breadcrumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="$route.meta.title">{{ $route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-dropdown class="user-dropdown">
            <span class="user-info">
              <img src="/assets/avatar.png" class="user-avatar" />
              <span class="user-name">管理员</span>
              <el-icon><CaretBottom /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人设置</el-dropdown-item>
                <el-dropdown-item>修改密码</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- 内容区域 -->
      <div class="content-container">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { 
  HomeFilled, DataBoard, Goods, OfficeBuilding, 
  Document, Operation, Stopwatch, Fold, Expand,
  DataAnalysis, ChatLineRound, CaretBottom
} from '@element-plus/icons-vue';

export default {
  name: 'MainLayout',
  components: {
    HomeFilled, DataBoard, Goods, OfficeBuilding, 
    Document, Operation, Stopwatch, Fold, Expand,
    DataAnalysis, ChatLineRound, CaretBottom
  },
  setup() {
    const route = useRoute();
    const isCollapsed = ref(false);
    
    // 获取当前活跃的菜单项
    const activeMenu = computed(() => {
      return route.path;
    });
    
    // 切换侧边栏折叠状态
    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value;
    };
    
    return {
      isCollapsed,
      activeMenu,
      toggleCollapse
    };
  }
};
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  width: 100%;
}

.sidebar {
  width: 260px;
  background-color: #304156;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  z-index: 10;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.15);
}

.sidebar.collapsed {
  width: 64px;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-text {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.logo-mini {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.sidebar-menu {
  border-right: none;
  flex-grow: 1;
}

.collapse-btn {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.collapse-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  transition: margin-left 0.3s;
}

.main-content.expanded {
  margin-left: -196px;
}

.header {
  height: 60px;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.breadcrumb {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
}

.user-name {
  font-size: 14px;
  margin-right: 4px;
}

.content-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f0f2f5;
}
</style> 