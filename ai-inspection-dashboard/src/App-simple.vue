<template>
  <div class="app-container">
    <el-config-provider :locale="zhCn">
      <!-- 主布局 -->
      <div class="main-layout">
        <!-- 侧边栏 -->
        <div class="sidebar" :class="{ 'collapsed': isCollapsed }">
          <!-- 系统LOGO -->
          <div class="logo-container">
            <div class="logo-icon-section">
              <el-icon size="28"><DataAnalysis /></el-icon>
            </div>
            <div v-if="!isCollapsed" class="logo-text-section">
              <h3 class="logo-text">QMS智能管理系统</h3>
              <span class="logo-subtitle">Quality Management System</span>
            </div>
            <el-button
              :icon="isCollapsed ? Expand : Fold"
              @click="toggleSidebar"
              class="collapse-btn-header"
              text
              size="small"
            />
          </div>
          
          <!-- 导航菜单 -->
          <el-menu
            :default-active="activeMenu"
            class="sidebar-menu"
            :collapse="isCollapsed"
            :collapse-transition="false"
            router
          >
            <el-menu-item index="/">
              <el-icon><HomeFilled /></el-icon>
              <template #title>首页</template>
            </el-menu-item>
            
            <el-menu-item index="/inventory">
              <el-icon><Goods /></el-icon>
              <template #title>库存管理</template>
            </el-menu-item>
            
            <el-menu-item index="/lab">
              <el-icon><Document /></el-icon>
              <template #title>测试管理</template>
            </el-menu-item>
            
            <el-menu-item index="/factory">
              <el-icon><OfficeBuilding /></el-icon>
              <template #title>上线跟踪</template>
            </el-menu-item>
            
            <el-menu-item index="/assistant">
              <el-icon><ChatLineRound /></el-icon>
              <template #title>QMS智能助手</template>
            </el-menu-item>
          </el-menu>
        </div>

        <!-- 主内容区域 -->
        <div class="main-content">
          <!-- 顶部导航栏 -->
          <div class="header">
            <div class="header-left">
              <span class="page-title">{{ getPageTitle() }}</span>
            </div>
            <div class="header-right">
              <span class="user-info">管理员</span>
            </div>
          </div>
          
          <!-- 内容容器 -->
          <div class="content-container">
            <router-view />
          </div>
        </div>
      </div>
    </el-config-provider>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import {
  HomeFilled, DataBoard, Goods, OfficeBuilding,
  Document, Operation, Stopwatch, Fold, Expand,
  DataAnalysis, ChatLineRound, ChatDotRound, CaretBottom, User, Setting, Tools, MagicStick, Connection, TrendCharts, View, Download
} from '@element-plus/icons-vue';

export default {
  name: 'App',
  components: {
    ElConfigProvider,
    HomeFilled, DataBoard, Goods, OfficeBuilding,
    Document, Operation, Stopwatch, Fold, Expand,
    DataAnalysis, ChatLineRound, ChatDotRound, CaretBottom, User, Setting, Tools, MagicStick, Connection, TrendCharts, View, Download
  },
  setup() {
    const route = useRoute();
    const isCollapsed = ref(false);

    // 获取当前活跃的菜单项
    const activeMenu = computed(() => {
      return route.path;
    });
    
    // 切换侧边栏折叠状态
    const toggleSidebar = () => {
      isCollapsed.value = !isCollapsed.value;
    };

    // 获取页面标题
    const getPageTitle = () => {
      const titleMap = {
        '/': '系统首页',
        '/inventory': '库存管理',
        '/lab': '测试管理',
        '/factory': '上线跟踪',
        '/assistant': 'QMS智能助手'
      };
      return titleMap[route.path] || '系统管理';
    };

    return {
      zhCn,
      isCollapsed,
      activeMenu,
      toggleSidebar,
      getPageTitle
    };
  }
};
</script>

<style scoped>
.app-container {
  height: 100vh;
  overflow: hidden;
}

.main-layout {
  display: flex;
  height: 100%;
}

.sidebar {
  width: 250px;
  background-color: #001529;
  transition: width 0.3s;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 64px;
}

.logo-container {
  display: flex;
  align-items: center;
  padding: 16px;
  color: white;
  border-bottom: 1px solid #1f2937;
  position: relative;
}

.logo-icon-section {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.logo-text-section {
  margin-left: 12px;
  flex: 1;
}

.logo-text {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.logo-subtitle {
  font-size: 12px;
  color: #9ca3af;
}

.collapse-btn-header {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: white;
}

.sidebar-menu {
  border: none;
  background-color: transparent;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: 60px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.user-info {
  color: #6b7280;
}

.content-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f0f2f5;
}
</style>
