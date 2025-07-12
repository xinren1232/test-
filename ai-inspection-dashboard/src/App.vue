<template>
  <div class="app-container">
    <el-config-provider :locale="zhCn">
      <!-- AI助手独立布局 -->
      <router-view v-if="isAIAssistantRoute" />

      <!-- 主布局 -->
      <div v-else class="main-layout">
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
            background-color="#304156"
            text-color="#fff"
            active-text-color="#ffd04b"
            router
            unique-opened
          >
            <!-- 首页 -->
            <el-menu-item index="/" class="menu-item-enhanced">
              <el-icon class="menu-icon"><HomeFilled /></el-icon>
              <template #title>
                <span class="menu-title">首页</span>
              </template>
            </el-menu-item>

            <!-- 阶段一：模拟场景搭建 -->
            <el-sub-menu index="/stage1-menu" class="submenu-enhanced">
              <template #title>
                <el-icon class="menu-icon"><Goods /></el-icon>
                <span class="menu-title">阶段一：模拟场景搭建</span>
              </template>
              <el-menu-item index="/inventory" class="submenu-item">
                <el-icon class="submenu-icon"><Goods /></el-icon>
                <span class="submenu-title">物料库存管理</span>
              </el-menu-item>
              <el-menu-item index="/factory" class="submenu-item">
                <el-icon class="submenu-icon"><OfficeBuilding /></el-icon>
                <span class="submenu-title">物料上线跟踪</span>
              </el-menu-item>
              <el-menu-item index="/lab" class="submenu-item">
                <el-icon class="submenu-icon"><Stopwatch /></el-icon>
                <span class="submenu-title">物料测试跟踪</span>
              </el-menu-item>
              <el-menu-item index="/batch" class="submenu-item">
                <el-icon class="submenu-icon"><Document /></el-icon>
                <span class="submenu-title">批次管理</span>
              </el-menu-item>
            </el-sub-menu>

            <!-- 阶段二：数据功能搭建 -->
            <el-sub-menu index="/stage2-menu" class="submenu-enhanced">
              <template #title>
                <el-icon class="menu-icon"><DataAnalysis /></el-icon>
                <span class="menu-title">阶段二：数据功能搭建</span>
              </template>

              <!-- 数据管理子菜单 -->
              <el-sub-menu index="/data-management-submenu" class="nested-submenu">
                <template #title>
                  <el-icon class="submenu-icon"><Setting /></el-icon>
                  <span class="submenu-title">数据管理</span>
                </template>
                <el-menu-item index="/admin/data" class="nested-item">
                  <span class="nested-title">数据生成工具</span>
                </el-menu-item>
                <el-menu-item index="/admin/data/rules/definition" class="nested-item">
                  <span class="nested-title">数据规则定义</span>
                </el-menu-item>
                <el-menu-item index="/rule-library" class="nested-item">
                  <span class="nested-title">规则库管理</span>
                </el-menu-item>
              </el-sub-menu>

              <!-- 智能AI开发子菜单 -->
              <el-sub-menu index="/ai-development-submenu">
                <template #title>
                  <el-icon><MagicStick /></el-icon>
                  <span>智能AI开发</span>
                </template>
                <el-menu-item index="/assistant">智能问答</el-menu-item>
                <el-menu-item index="/ai-scenario-management">AI场景管理</el-menu-item>
              </el-sub-menu>
            </el-sub-menu>

            <!-- 阶段三：AI建设规划 -->
            <el-sub-menu index="/stage3-menu">
              <template #title>
                <el-icon><TrendCharts /></el-icon>
                <span>阶段三：AI建设规划</span>
              </template>
              <el-menu-item index="/ai-planning">
                <el-icon><Document /></el-icon>
                <span>AI规划文档</span>
              </el-menu-item>
              <el-menu-item index="/ai-roadmap">
                <el-icon><Connection /></el-icon>
                <span>技术路线图</span>
              </el-menu-item>
              <el-menu-item index="/ai-architecture">
                <el-icon><Operation /></el-icon>
                <span>架构设计</span>
              </el-menu-item>
            </el-sub-menu>

            <!-- QMS AI智能助手 - 主页面 -->
            <el-menu-item index="/assistant-ai-three-column" class="main-menu-item">
              <el-icon class="menu-icon"><MagicStick /></el-icon>
              <span class="menu-title">QMS AI智能助手</span>
            </el-menu-item>

            <!-- 系统管理 -->
            <el-menu-item index="/admin">
              <el-icon><Setting /></el-icon>
              <template #title>系统管理</template>
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
                <el-breadcrumb-item v-if="route.meta.title">{{ route.meta.title }}</el-breadcrumb-item>
              </el-breadcrumb>
            </div>
            
            <div class="header-right">
              <el-dropdown class="user-dropdown">
                <span class="user-info">
                  <el-avatar :size="32" class="user-avatar">
                    <el-icon><User /></el-icon>
                  </el-avatar>
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
            <router-view />
          </div>
        </div>
      </div>
    </el-config-provider>
  </div>
</template>

<script>
import { ref, computed, provide, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElConfigProvider, ElMessage } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
// import unifiedDataService from './services/UnifiedDataService';
// import systemDataUpdater from './services/SystemDataUpdater';
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

    // 当前页面名称
    const currentPageName = computed(() => route.name || '');

    // 检测是否为AI助手路由
    const isAIAssistantRoute = computed(() => {
      const aiRoutes = [
        '/ai-assistant-final',
        '/ai-assistant-three-column',
        '/ai-assistant-standalone',
        '/ai-assistant-fullscreen',
        '/ai-assistant-simple',
        '/ai-assistant-main',
        '/ai-assistant-redesigned',
        '/assistant-ai-new',
        '/assistant-ai-three-column'
      ];
      const isAI = aiRoutes.includes(route.path);
      console.log('当前路由:', route.path, '是否为AI路由:', isAI);
      return isAI;
    });

    // 获取当前活跃的菜单项
    const activeMenu = computed(() => {
      return route.path;
    });
    
    // 切换侧边栏折叠状态
    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value;
    };
    
    // 提供统一数据服务
    provide('unifiedDataService', unifiedDataService);
    
    // 提供系统数据更新服务
    provide('systemDataUpdater', systemDataUpdater);
    
    // 在应用启动时初始化统一数据服务
    onMounted(() => {
      try {
        // 初始化测试数据
        console.log('初始化基础数据服务...');
        
        // 迁移旧数据到统一数据服务 - 只迁移，不重置
        unifiedDataService.migrateOldData();
        
        // 检查数据一致性
        const isConsistent = checkDataConsistency();
        
        if (!isConsistent) {
          // 如果数据不一致，尝试修复 - 但不清除现有数据
          console.warn('检测到数据不一致，尝试修复...');
          forceFixDataInconsistency();
        }
        
        // 检查数据是否存在，如果不存在则不做任何操作
        // 避免在应用启动时重置数据
        const hasInventoryData = localStorage.getItem(unifiedDataService.STORAGE_KEYS.INVENTORY) !== null;
        const hasLabData = localStorage.getItem(unifiedDataService.STORAGE_KEYS.LAB) !== null;
        const hasFactoryData = localStorage.getItem(unifiedDataService.STORAGE_KEYS.FACTORY) !== null;
        
        console.log('数据检查结果:', {
          hasInventoryData,
          hasLabData,
          hasFactoryData
        });
        
        console.log('统一数据服务初始化完成');
      } catch (error) {
        console.error('初始化统一数据服务失败:', error);
        ElMessage.error('初始化数据服务失败，部分功能可能无法正常工作');
      }
    });
    
    // 检查数据一致性
    const checkDataConsistency = () => {
      try {
        // 检查旧键和新键是否一致
        const inventoryData = localStorage.getItem('inventory_data');
        const unifiedInventory = localStorage.getItem(unifiedDataService.STORAGE_KEYS.INVENTORY);
        
        const labData = localStorage.getItem('lab_data');
        const labTestData = localStorage.getItem('lab_test_data');
        const unifiedLab = localStorage.getItem(unifiedDataService.STORAGE_KEYS.LAB);
        
        const factoryData = localStorage.getItem('factory_data');
        const onlineData = localStorage.getItem('online_data');
        const unifiedFactory = localStorage.getItem(unifiedDataService.STORAGE_KEYS.FACTORY);
        
        // 检查库存数据一致性 - 只检查存在的数据
        const inventoryConsistent = !inventoryData || !unifiedInventory || inventoryData === unifiedInventory;
        
        // 检查测试数据一致性 - 只检查存在的数据
        const labConsistent = (!labData && !labTestData) || 
                              (!unifiedLab) || 
                              (labData === unifiedLab) || 
                              (labTestData === unifiedLab);
        
        // 检查上线数据一致性 - 只检查存在的数据
        const factoryConsistent = (!factoryData && !onlineData) || 
                                  (!unifiedFactory) || 
                                  (factoryData === unifiedFactory) || 
                                  (onlineData === unifiedFactory);
        
        return inventoryConsistent && labConsistent && factoryConsistent;
      } catch (error) {
        console.error('检查数据一致性失败:', error);
        return false;
      }
    };
    
    // 强制修复数据不一致 - 修改为合并而不是覆盖
    const forceFixDataInconsistency = () => {
      try {
        // 1. 获取所有数据并合并
        const inventoryData = unifiedDataService.getInventoryData();
        const labData = unifiedDataService.getLabData();
        const factoryData = unifiedDataService.getFactoryData();
        
        // 2. 强制更新所有存储键，但不清除现有数据
        if (inventoryData.length > 0) {
          localStorage.setItem(unifiedDataService.STORAGE_KEYS.INVENTORY, JSON.stringify(inventoryData));
          localStorage.setItem('inventory_data', JSON.stringify(inventoryData));
        }
        
        if (labData.length > 0) {
          localStorage.setItem(unifiedDataService.STORAGE_KEYS.LAB, JSON.stringify(labData));
          localStorage.setItem('lab_data', JSON.stringify(labData));
          localStorage.setItem('lab_test_data', JSON.stringify(labData));
        }
        
        if (factoryData.length > 0) {
          localStorage.setItem(unifiedDataService.STORAGE_KEYS.FACTORY, JSON.stringify(factoryData));
          localStorage.setItem('factory_data', JSON.stringify(factoryData));
          localStorage.setItem('online_data', JSON.stringify(factoryData));
        }
        
        console.log('已修复数据不一致问题');
      } catch (error) {
        console.error('修复数据不一致失败:', error);
      }
    };
    
    return {
      zhCn,
      route,
      currentPageName,
      isCollapsed,
      activeMenu,
      toggleCollapse,
      isAIAssistantRoute
    };
  }
};
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}

.app-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 主布局样式 */
.main-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  position: relative;
}

/* 侧边栏样式 */
.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.sidebar.collapsed {
  width: 64px;
}

.logo-container {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  background: transparent;
  position: relative;
  flex-shrink: 0;
  padding: 12px 16px;
}

.logo-icon-section {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 12px;
}

.logo-text-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  min-width: 0;
}

.logo-text {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.8px;
  line-height: 1.2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.logo-subtitle {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 2px;
  letter-spacing: 0.5px;
}

.logo-mini {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
}

.collapse-btn-header {
  color: rgba(255, 255, 255, 0.8) !important;
  padding: 4px !important;
  min-height: auto !important;
  height: auto !important;
}

.collapse-btn-header:hover {
  color: white !important;
  background: rgba(255, 255, 255, 0.1) !important;
}

.sidebar-menu {
  border-right: none;
  flex: 1;
  background: transparent;
  padding: 8px 0 6px 0;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 优化菜单项样式 */
.sidebar-menu .el-menu-item,
.sidebar-menu .el-sub-menu > .el-sub-menu__title {
  height: 40px !important;
  line-height: 40px !important;
  padding: 0 16px !important;
  margin: 1px 6px;
  border-radius: 6px;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.9) !important;
  border-bottom: none !important;
  position: relative;
  font-weight: 600 !important;
  font-size: 14px !important;
}

/* 解决文字和展开图标重合问题 */
.sidebar-menu .el-sub-menu > .el-sub-menu__title {
  padding-right: 40px !important;
}

.sidebar-menu .el-sub-menu > .el-sub-menu__title .el-sub-menu__icon-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  transition: transform 0.3s ease;
}

.sidebar-menu .el-menu-item:hover,
.sidebar-menu .el-sub-menu > .el-sub-menu__title:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  transform: translateX(2px);
}

.sidebar-menu .el-menu-item.is-active {
  background: linear-gradient(135deg, #409eff 0%, #36a3f7 100%) !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.sidebar-menu .el-sub-menu.is-active > .el-sub-menu__title {
  color: #409eff !important;
}

/* 子菜单样式优化 */
.sidebar-menu .el-sub-menu .el-menu {
  background: rgba(0, 0, 0, 0.15) !important;
  margin: 2px 6px;
  border-radius: 6px;
  padding: 2px 0;
}

.sidebar-menu .el-sub-menu .el-menu-item {
  height: 36px !important;
  line-height: 36px !important;
  padding: 0 12px 0 36px !important;
  margin: 1px 3px;
  font-size: 13px !important;
  font-weight: 500 !important;
  color: rgba(255, 255, 255, 0.8) !important;
  border-radius: 4px;
}

.sidebar-menu .el-sub-menu .el-menu-item:hover {
  background: rgba(255, 255, 255, 0.08) !important;
  color: rgba(255, 255, 255, 0.95) !important;
}

.sidebar-menu .el-sub-menu .el-menu-item.is-active {
  background: rgba(64, 158, 255, 0.2) !important;
  color: #409eff !important;
  border-left: 3px solid #409eff;
  padding-left: 33px !important;
  font-weight: 600 !important;
}

/* 图标样式优化 */
.sidebar-menu .el-icon {
  width: 18px !important;
  margin-right: 10px !important;
  font-size: 16px !important;
  opacity: 0.9;
}

.sidebar-menu .el-menu-item:hover .el-icon,
.sidebar-menu .el-sub-menu > .el-sub-menu__title:hover .el-icon {
  opacity: 1;
}

/* 折叠按钮优化 */
.collapse-btn {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  margin: 4px 6px 6px 6px;
  border-radius: 6px;
  flex-shrink: 0;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: scale(1.05);
}

/* 折叠状态下的样式优化 */
.sidebar.collapsed .sidebar-menu .el-menu-item,
.sidebar.collapsed .sidebar-menu .el-sub-menu > .el-sub-menu__title {
  padding: 0 18px !important;
  margin: 2px 4px;
  justify-content: center;
}

.sidebar.collapsed .sidebar-menu .el-menu-item span,
.sidebar.collapsed .sidebar-menu .el-sub-menu > .el-sub-menu__title span {
  display: none;
}

.sidebar.collapsed .sidebar-menu .el-icon {
  margin-right: 0 !important;
}

/* 子菜单展开动画 */
.sidebar-menu .el-sub-menu .el-menu {
  transition: all 0.3s ease;
}

/* 菜单分组样式 */
.sidebar-menu .el-menu-item-group {
  margin: 8px 0;
}

.sidebar-menu .el-menu-item-group .el-menu-item-group__title {
  padding: 8px 20px 4px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

/* 滚动条样式 */
.sidebar-menu::-webkit-scrollbar {
  width: 4px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 内容区样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  transition: margin-left 0.3s ease;
  margin-left: 260px;
  min-height: 100vh;
}

.main-content.expanded {
  margin-left: 64px;
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

/* 定义全局主题变量 */
:root {
  --primary-color: #409EFF;
  --success-color: #67C23A;
  --warning-color: #E6A23C;
  --danger-color: #F56C6C;
  --info-color: #909399;
  --text-primary: #303133;
  --text-regular: #606266;
  --text-secondary: #909399;
  --border-color: #DCDFE6;
  --background-color: #F5F7FA;
}

/* 支持深色模式 */
[data-theme="dark"] {
  --primary-color: #409EFF;
  --success-color: #67C23A;
  --warning-color: #E6A23C;
  --danger-color: #F56C6C;
  --info-color: #909399;
  --text-primary: #E5EAF3;
  --text-regular: #CFD3DC;
  --text-secondary: #A3A6AD;
  --border-color: #4C4D4F;
  --background-color: #1D1E1F;
}

/* 在深色模式下适配Element Plus组件 */
@media (prefers-color-scheme: dark) {
  :root {
    --el-color-primary: var(--primary-color);
    --el-text-color-primary: var(--text-primary);
    --el-text-color-regular: var(--text-regular);
    --el-border-color: var(--border-color);
    --el-bg-color: var(--background-color);
  }
}
</style> 