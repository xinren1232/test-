<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <el-header class="app-header">
      <div class="logo-container">
        <img src="./assets/logo.png" alt="Logo" class="logo" />
        <h1 class="title">IQE动态检验系统</h1>
      </div>
      <el-menu
        mode="horizontal"
        :router="true"
        :default-active="activeRoute"
        class="app-menu"
      >
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/factory">库存管理</el-menu-item>
        <el-menu-item index="/lab">实验室检验</el-menu-item>
        <el-menu-item index="/online">上线使用</el-menu-item>
        <el-menu-item index="/batch">批次管理</el-menu-item>
        <el-menu-item index="/monitoring">实时监控</el-menu-item>
        <el-menu-item index="/ai">AI助手</el-menu-item>
      </el-menu>
      <div class="user-container">
        <el-dropdown>
          <span class="user-profile">
            <el-avatar :size="32" src="./assets/avatar.png" />
            <span class="username">管理员</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>个人信息</el-dropdown-item>
              <el-dropdown-item>系统设置</el-dropdown-item>
              <el-dropdown-item divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    
    <!-- 主内容区域 -->
    <el-main class="app-main">
      <router-view />
    </el-main>
    
    <!-- 页脚 -->
    <el-footer class="app-footer">
      <div class="footer-content">
        <span>IQE动态检验系统 v1.0.0</span>
        <span>© 2023 质量工程实验室</span>
      </div>
    </el-footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeRoute = computed(() => route.path)
</script>

<style>
/* 全局重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f7fa;
  color: #303133;
}

/* 应用容器 */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 头部样式 */
.app-header {
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-self: start;
}

.logo {
  height: 36px;
  width: auto;
  margin-right: 10px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
  margin: 0;
  white-space: nowrap;
}

.app-menu {
  border-bottom: none;
  justify-content: center;
}

.user-container {
  margin-left: 20px;
  cursor: pointer;
  justify-self: end;
}

.user-profile {
  display: flex;
  align-items: center;
}

.username {
  margin-left: 8px;
  font-size: 14px;
  color: #606266;
}

/* 主内容区域样式 */
.app-main {
  flex: 1;
  padding: 0;
  background-color: #f5f7fa;
}

/* 页脚样式 */
.app-footer {
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  padding: 0 20px;
  color: #909399;
  font-size: 14px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .logo-container .title {
    display: none;
  }
  
  .user-container .username {
    display: none;
  }
  
  .app-header {
    grid-template-columns: auto 1fr auto;
    padding: 0 10px;
  }
}
</style> 