<template>
  <div class="app-container">
    <!-- 导航栏 -->
    <header class="app-header">
      <div class="logo">
        <img src="@/assets/logo.png" alt="IQE Logo" class="logo-img" @error="handleLogoError" v-if="!logoError" />
        <div v-else class="logo-placeholder">IQE</div>
        <h1>IQE质量智能助手</h1>
      </div>
      
      <el-menu
        :default-active="activeRoute"
        class="app-menu"
        mode="horizontal"
        router
        background-color="#001529"
        text-color="#ffffff"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataBoard /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/inventory">
          <el-icon><Box /></el-icon>
          <span>库存管理</span>
        </el-menu-item>
        <el-menu-item index="/lab">
          <el-icon><Monitor /></el-icon>
          <span>实验室</span>
        </el-menu-item>
        <el-menu-item index="/knowledge-qa">
          <el-icon><ChatLineRound /></el-icon>
          <span>知识库问答</span>
        </el-menu-item>
        <el-menu-item index="/quality">
          <el-icon><Histogram /></el-icon>
          <span>质量管理</span>
        </el-menu-item>
      </el-menu>
      
      <div class="header-right">
        <!-- AI模型信息 -->
        <div class="model-info">
          <span class="model-label">当前AI模型:</span>
          <el-tag size="small" :type="activeModel.id === 'r1' ? 'primary' : 'warning'">
            {{ activeModel.name }}
          </el-tag>
        </div>
        
        <!-- 用户信息 -->
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="user-info">
            <el-avatar :size="32" :icon="User" v-if="avatarError"></el-avatar>
            <el-avatar :size="32" src="@/assets/avatar.png" @error="handleAvatarError" v-else></el-avatar>
            <span>管理员</span>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="settings">
                <el-icon><Setting /></el-icon>
                <span>设置</span>
              </el-dropdown-item>
              <el-dropdown-item command="help">
                <el-icon><QuestionFilled /></el-icon>
                <span>帮助</span>
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>
    
    <!-- 主内容区域 -->
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- 页脚 -->
    <footer class="app-footer">
      <p>IQE质量智能助手系统 &copy; {{ currentYear }}</p>
    </footer>
    
    <!-- AI助手悬浮按钮 -->
    <AIFloatingButton />
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ChatRound, DataBoard, Box, SetUp, Histogram, ArrowDown, Setting, 
         QuestionFilled, SwitchButton, MessageBox, Operation, User, Monitor, ChatLineRound } from '@element-plus/icons-vue';
import { AIModelConfigService } from './services/ai/AIModelConfigService';
import AIFloatingButton from './components/AIFloatingButton.vue';
import { DataSyncService } from './services/DataSyncService';

export default {
  name: 'App',
  
  components: {
    ChatRound,
    DataBoard,
    Box,
    SetUp,
    Histogram,
    ArrowDown,
    Setting,
    QuestionFilled,
    SwitchButton,
    MessageBox,
    Operation,
    User,
    AIFloatingButton,
    Monitor,
    ChatLineRound
  },
  
  setup() {
    const router = useRouter();
    const route = useRoute();
    
    // 当前年份
    const currentYear = new Date().getFullYear();
    
    // 资源错误处理
    const avatarError = ref(false);
    const logoError = ref(false);
    
    const handleAvatarError = () => {
      avatarError.value = true;
    };
    
    const handleLogoError = () => {
      logoError.value = true;
    };
    
    // 获取当前活跃的路由
    const activeRoute = computed(() => route.path);
    
    // 获取当前活跃的AI模型
    const activeModel = computed(() => AIModelConfigService.getActiveModel());
    
    // 处理下拉菜单命令
    function handleCommand(command) {
      switch (command) {
        case 'settings':
          router.push('/settings');
          break;
        case 'help':
          showHelp();
          break;
        case 'logout':
          confirmLogout();
          break;
      }
    }
    
    // 显示帮助
    function showHelp() {
      ElMessageBox.alert(
        '这是IQE质量智能助手系统，集成了AI能力来协助质量检验工作。' +
        '您可以通过左侧菜单访问各个功能模块，或者直接与AI助手交流获取帮助。',
        '帮助信息',
        {
          confirmButtonText: '我知道了',
          type: 'info'
        }
      );
    }
    
    // 确认退出
    function confirmLogout() {
      ElMessageBox.confirm(
        '确定要退出登录吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          ElMessage.success('已退出登录');
          // 这里应该有实际的登出逻辑
        })
        .catch(() => {
          // 取消操作
        });
    }
    
    onMounted(async () => {
      // 初始化时同步数据
      try {
        await DataSyncService.syncAllData();
        console.log('数据同步完成');
      } catch (error) {
        console.error('数据同步失败:', error);
      }
    });
    
    return {
      currentYear,
      activeRoute,
      activeModel,
      handleCommand,
      avatarError,
      logoError,
      handleAvatarError,
      handleLogoError
    };
  }
};
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

#app {
  height: 100%;
}

.app-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #001529;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}

.logo {
  display: flex;
  align-items: center;
  margin-right: 40px;
}

.logo-img {
  height: 36px;
  margin-right: 10px;
}

.logo-placeholder {
  width: 36px;
  height: 36px;
  background-color: #409EFF;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  border-radius: 4px;
  margin-right: 10px;
  font-size: 14px;
}

.logo h1 {
  font-size: 18px;
  margin: 0;
  font-weight: 600;
  white-space: nowrap;
}

.app-menu {
  flex: 1;
  border-bottom: none !important;
}

.header-right {
  display: flex;
  align-items: center;
}

.model-info {
  margin-right: 24px;
  display: flex;
  align-items: center;
}

.model-label {
  margin-right: 8px;
  font-size: 12px;
  color: #e9e9e9;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #ffffff;
}

.user-info span {
  margin: 0 8px;
}

.app-main {
  flex: 1;
  overflow-y: auto;
  background-color: #f5f7fa;
}

.app-footer {
  background-color: #001529;
  color: #adbac7;
  text-align: center;
  padding: 12px 0;
  font-size: 12px;
}

/* 页面过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 
 
 
 