<template>
  <div class="app-container">
    <el-config-provider :locale="zhCn">
      <!-- 主布局 -->
      <div class="main-layout">
        <!-- 侧边栏 -->
        <div class="sidebar" :class="{ 'collapsed': isCollapsed }">
          <!-- 系统LOGO -->
          <div class="logo-container">
            <h3 class="logo-text" v-if="!isCollapsed">QMS智能管理系统</h3>
            <h3 class="logo-mini" v-else>QMS</h3>
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
            
            <el-menu-item index="/inventory">
              <el-icon><Goods /></el-icon>
              <template #title>物料库存管理</template>
            </el-menu-item>
            
            <el-menu-item index="/factory">
              <el-icon><OfficeBuilding /></el-icon>
              <template #title>物料上线跟踪</template>
            </el-menu-item>
            
            <el-menu-item index="/lab">
              <el-icon><Stopwatch /></el-icon>
              <template #title>物料测试跟踪</template>
            </el-menu-item>
            
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
            
            <el-menu-item index="/rule-library">
              <el-icon><Document /></el-icon>
              <template #title>规则库管理</template>
            </el-menu-item>
            
            <el-sub-menu index="/admin-menu">
              <template #title>
                <el-icon><Setting /></el-icon>
                <span>数据管理</span>
              </template>
              <el-menu-item index="/admin/data">数据生成工具</el-menu-item>
              <el-menu-item index="/admin/data/rules">数据规则文档</el-menu-item>
              <el-menu-item index="/admin/data/rules/match">数据匹配规则</el-menu-item>
              <el-menu-item index="/admin/data/historical">历史数据管控</el-menu-item>
            </el-sub-menu>
            
            <el-menu-item index="/admin">
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
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
import unifiedDataService from './services/UnifiedDataService';
import systemDataUpdater from './services/SystemDataUpdater';
import { 
  HomeFilled, DataBoard, Goods, OfficeBuilding, 
  Document, Operation, Stopwatch, Fold, Expand,
  DataAnalysis, ChatLineRound, CaretBottom, User, Setting
} from '@element-plus/icons-vue';

export default {
  name: 'App',
  components: {
    ElConfigProvider,
    HomeFilled, DataBoard, Goods, OfficeBuilding, 
    Document, Operation, Stopwatch, Fold, Expand,
    DataAnalysis, ChatLineRound, CaretBottom, User, Setting
  },
  setup() {
    const route = useRoute();
    const isCollapsed = ref(false);
    
    // 当前页面名称
    const currentPageName = computed(() => route.name || '');
    
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
      toggleCollapse
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
}

/* 主布局样式 */
.main-layout {
  display: flex;
  height: 100vh;
  width: 100%;
}

/* 侧边栏样式 */
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

/* 内容区样式 */
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
 
 
 