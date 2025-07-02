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
        <!-- 动态生成菜单项 -->
        <template v-for="route in navigationRoutes" :key="route.path">
          <el-menu-item :index="route.path" v-if="!route.children">
            <el-icon><component :is="route.meta.iconComponent" /></el-icon>
            <template #title>{{ route.meta.title }}</template>
          </el-menu-item>
          <el-sub-menu :index="route.path" v-else>
            <template #title>
              <el-icon><component :is="route.meta.iconComponent" /></el-icon>
              <span>{{ route.meta.title }}</span>
            </template>
            <el-menu-item v-for="child in route.children" :key="child.path" :index="child.path">
              {{ child.meta.title }}
            </el-menu-item>
          </el-sub-menu>
        </template>
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
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  HomeFilled, DataBoard, Goods, OfficeBuilding,
  Document, Operation, Stopwatch, Fold, Expand,
  DataAnalysis, ChatDotRound, CaretBottom, Tickets, Cpu,
  MagicStick, Tools, Setting, Warning, Upload, Connection, Clock
} from '@element-plus/icons-vue';

// 映射图标名称到组件
const iconComponents = {
  HomeFilled, DataBoard, Goods, OfficeBuilding,
  Document, Operation, Stopwatch, Fold, Expand,
  DataAnalysis, ChatDotRound, CaretBottom, Tickets, Cpu,
  MagicStick, Tools, Setting, Warning, Upload, Connection, Clock,
  Robot: MagicStick  // 使用MagicStick作为Robot图标的替代
};

export default {
  name: 'MainLayout',
  components: {
    HomeFilled, DataBoard, Goods, OfficeBuilding,
    Document, Operation, Stopwatch, Fold, Expand,
    DataAnalysis, ChatDotRound, CaretBottom, Tickets, Cpu,
    MagicStick, Tools, Setting, Warning, Upload, Connection, Clock
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const isCollapsed = ref(false);
    
    // 从路由配置中过滤出需要导航的路由
    const navigationRoutes = computed(() => {
      const allRoutes = router.options.routes;
      // 假设路由元信息中有一个 `icon` 字段来标记它是否应在导航中显示
      return allRoutes
        .filter(r => r.meta && r.meta.icon)
        .map(r => ({
          ...r,
          // 将字符串图标名称映射到实际的组件
          meta: {
            ...r.meta,
            iconComponent: iconComponents[r.meta.icon]
          }
        }));
    });
    
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
      toggleCollapse,
      navigationRoutes
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