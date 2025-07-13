import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../pages/HomeView.vue';
// import HomeView from '../pages/MinimalTest.vue';
import Dashboard from '../pages/Dashboard.vue';
import InventoryView from '../pages/Inventory.vue';
import LabView from '../pages/LabView.vue';
import FactoryView from '../pages/FactoryView.vue';
import AdminDataPage from '../pages/AdminDataPage.vue';
import DataImportExport from '../components/admin/DataImportExport.vue';
import RuleLibraryView from '../pages/RuleLibraryView.vue';
import RuleLibraryViewSimple from '../pages/RuleLibraryViewSimple.vue';
import ApiTestPage from '../pages/ApiTestPage.vue';
import TestApiPage from '../pages/TestApiPage.vue';
import TestRulesPage from '../pages/TestRulesPage.vue';

import MaterialExceptionPage from '../pages/MaterialExceptionPage.vue';
import BatchManagement from '../pages/BatchManagement.vue';
import DataRulesDefinitionPage from '../pages/DataRulesDefinitionPage.vue';
import BackendTest from '../pages/BackendTest.vue';
import QATestPage from '../pages/QATestPage.vue';

// 创建一个简单的 NotFound 组件
const NotFound = {
  template: `
    <div style="text-align: center; padding: 50px;">
      <h1 style="font-size: 72px; color: #409EFF;">404</h1>
      <h2>页面未找到</h2>
      <p>抱歉，您访问的页面不存在或已被移除</p>
      <router-link to="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #409EFF; color: white; text-decoration: none; border-radius: 4px;">返回首页</router-link>
    </div>
  `
};

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: {
      title: '首页',
      icon: 'House'
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: '数据看板',
      icon: 'DataBoard'
    }
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: InventoryView,
    meta: {
      title: '物料仓存管理',
      icon: 'Goods'
    }
  },
  {
    path: '/lab',
    name: 'Lab',
    component: LabView,
    meta: {
      title: '物料测试数据',
      icon: 'Stopwatch'
    }
  },
  {
    path: '/factory',
    name: 'Factory',
    component: FactoryView,
    meta: {
      title: '物料上线跟踪',
      icon: 'OfficeBuilding'
    }
  },
  {
    path: '/material-quality-report',
    name: 'MaterialQualityReport',
    component: () => import('../pages/MaterialQualityReportSimple.vue'),
    meta: {
      title: '物料质量总结报告',
      icon: 'TrendCharts'
    }
  },
  {
    path: '/batch',
    name: 'BatchManagement',
    component: BatchManagement,
    meta: {
      title: '批次管理',
      icon: 'Document'
    }
  },
  {
    path: '/material-exception',
    name: 'MaterialException',
    component: MaterialExceptionPage,
    meta: {
      title: '物料异常管理',
      icon: 'Warning'
    }
  },
  {
    path: '/admin/data',
    name: 'AdminData',
    component: AdminDataPage,
    meta: {
      title: '数据管理',
      icon: 'Setting',
      requiresAuth: true
    }
  },
  {
    path: '/admin/data-import',
    name: 'DataImport',
    component: DataImportExport,
    meta: {
      title: '数据导入/导出',
      icon: 'Upload',
      requiresAuth: true
    }
  },
  {
    path: '/rule-library',
    name: 'RuleLibrary',
    component: RuleLibraryView,
    meta: {
      title: '规则库',
      icon: 'Tickets',
      requiresAuth: true
    }
  },
  {
    path: '/test-rules',
    name: 'TestRules',
    component: TestRulesPage,
    meta: {
      title: '规则测试',
      icon: 'Operation'
    }
  },
  {
    path: '/admin/data/rules/definition',
    name: 'DataRulesDefinition',
    component: DataRulesDefinitionPage,
    meta: {
      title: '数据规则定义',
      icon: 'Document',
      requiresAuth: true
    }
  },

  {
    path: '/test-backend',
    name: 'BackendTest',
    component: BackendTest,
    meta: {
      title: '后端连接测试',
      icon: 'Cpu',
    }
  },
  {
    path: '/api-test',
    name: 'ApiTest',
    component: ApiTestPage,
    meta: {
      title: 'API连接测试',
      icon: 'Connection'
    }
  },
  {
    path: '/rule-library-simple',
    name: 'RuleLibrarySimple',
    component: RuleLibraryViewSimple,
    meta: {
      title: '规则库管理(简化版)',
      icon: 'Document'
    }
  },

  // AI场景管理
  {
    path: '/ai-scenario-management',
    name: 'AIScenarioManagement',
    component: () => import('../pages/AIScenarioManagementSimple.vue'),
    meta: { title: 'AI场景管理', icon: 'Connection' }
  },
  // {
  //   path: '/settings',
  //   name: 'SystemSettings',
  //   component: () => import('../pages/SystemSettings.vue'),
  //   meta: { title: '系统设置', icon: 'Setting' }
  // },
  {
    path: '/assistant',
    name: 'Assistant',
    component: () => import('../pages/AssistantPageNew.vue'),
    meta: { title: '智能助手', icon: 'ChatDotRound' }
  },
  {
    path: '/assistant-ai',
    name: 'AssistantAI',
    redirect: '/assistant-ai-three-column'
  },
  {
    path: '/simple-qa',
    name: 'SimpleQA',
    component: () => import('../pages/SimpleQA.vue'),
    meta: { title: '简单问答测试', icon: 'ChatDotRound' }
  },
  {
    path: '/assistant-ai-simple',
    name: 'AssistantAISimple',
    component: () => import('../pages/AssistantPageAISimple.vue'),
    meta: { title: 'AI助手简化版', icon: 'MagicStick' }
  },
  {
    path: '/assistant-ai-fixed',
    name: 'AssistantAIFixed',
    component: () => import('../pages/AssistantPageAIFixed.vue'),
    meta: { title: 'AI助手修复版', icon: 'Tools' }
  },
  {
    path: '/ai-test',
    name: 'AITest',
    component: () => import('../pages/AITestPage.vue'),
    meta: { title: 'AI功能测试', icon: 'Setting' }
  },
  {
    path: '/enhanced-ai-demo',
    name: 'EnhancedAIDemo',
    component: () => import('../pages/EnhancedAIDemo.vue'),
    meta: { title: '增强AI演示', icon: 'MagicStick' }
  },

  {
    path: '/ai-assistant-new',
    name: 'AIAssistantNew',
    component: () => import('../components/AIAssistant.vue'),
    meta: { title: 'AI智能助手(新版)', icon: 'Robot' }
  },
  {
    path: '/ai-assistant-test',
    name: 'AIAssistantTest',
    component: () => import('../components/AIAssistantSimple.vue'),
    meta: { title: 'AI助手测试', icon: 'MagicStick' }
  },
  {
    path: '/ai-assistant-working',
    name: 'AIAssistantWorking',
    component: () => import('../components/AIAssistantWorking.vue'),
    meta: { title: 'AI智能助手(工作版)', icon: 'MagicStick' }
  },
  {
    path: '/assistant-ai-test',
    name: 'AssistantAITest',
    component: () => import('../pages/AssistantPageAITest.vue'),
    meta: { title: 'AI助手测试版', icon: 'Tools' }
  },
  {
    path: '/assistant-ai-new',
    name: 'AssistantAINew',
    component: () => import('../pages/AssistantPageAINew.vue'),
    meta: { title: 'AI智能助手(新版)', icon: 'MagicStick' }
  },
  {
    path: '/assistant-ai-minimal',
    name: 'AssistantAIMinimal',
    component: () => import('../pages/AssistantPageAIMinimal.vue'),
    meta: { title: 'AI助手(最小化)', icon: 'Tools' }
  },
  {
    path: '/assistant-ai-three-column',
    name: 'AssistantAIThreeColumn',
    component: () => import('../pages/SimpleAIThreeColumn.vue'),
    meta: { title: 'QMS问答助手', icon: 'Grid' }
  },
  {
    path: '/qms-assistant-loading',
    name: 'QMSAssistantLoading',
    component: () => import('../pages/QMSAssistantLoading.vue'),
    meta: { title: '正在加载QMS智能助手' }
  },
  {
    path: '/qa-test',
    name: 'QATest',
    component: QATestPage,
    meta: { title: '🧪 智能问答测试', icon: 'Tools' }
  },
  {
    path: '/test-ai-three-column',
    name: 'TestAIThreeColumn',
    component: () => import('../pages/TestAIThreeColumn.vue'),
    meta: { title: '测试AI三栏布局', icon: 'Grid' }
  },
  {
    path: '/simple-ai-three-column',
    name: 'SimpleAIThreeColumn',
    component: () => import('../pages/SimpleAIThreeColumn.vue'),
    meta: { title: '简化AI三栏布局', icon: 'Grid' }
  },

  {
    path: '/ai-assistant-three-column',
    name: 'AIAssistantThreeColumn',
    component: () => import('../pages/AIAssistantThreeColumn.vue'),
    meta: { title: 'QMS AI智能助手(三栏版)', icon: 'ChatDotRound' }
  },
  {
    path: '/ai-assistant-final',
    name: 'AIAssistantFinal',
    component: () => import('../pages/AIAssistantFinal.vue'),
    meta: { title: 'QMS AI智能助手(最终版)', icon: 'MagicStick' }
  },
  {
    path: '/ai-assistant-standalone',
    name: 'AIAssistantStandalone',
    component: () => import('../pages/AIAssistantStandalone.vue'),
    meta: { title: 'AI智能助手(独立版)', icon: 'ChatDotRound' }
  },
  {
    path: '/ai-assistant-fullscreen',
    name: 'AIAssistantFullscreen',
    component: () => import('../pages/AIAssistantFullscreen.vue'),
    meta: { title: 'AI智能助手(全屏版)', icon: 'MagicStick' }
  },
  {
    path: '/ai-assistant-simple',
    name: 'AIAssistantSimple',
    component: () => import('../pages/AIAssistantSimple.vue'),
    meta: { title: 'AI智能助手(简化版)', icon: 'ChatDotRound' }
  },
  {
    path: '/ai-assistant',
    name: 'AIAssistant',
    component: () => import('../pages/AIAssistantRedirect.vue'),
    meta: { title: 'QMS AI智能助手', icon: 'MagicStick' }
  },
  {
    path: '/ai-assistant-main',
    name: 'AIAssistantMain',
    component: () => import('../pages/AIAssistantMain.vue'),
    meta: { title: 'QMS AI智能助手(主版本)', icon: 'MagicStick' }
  },
  {
    path: '/ai-assistant-redesigned',
    name: 'AIAssistantRedesigned',
    component: () => import('../pages/AIAssistantRedesigned.vue'),
    meta: { title: 'AI智能助手(重新设计)', icon: 'MagicStick' }
  },
  {
    path: '/assistant-page-ai-three-column',
    name: 'AssistantPageAIThreeColumn',
    component: () => import('../pages/AssistantPageAIThreeColumn.vue'),
    meta: { title: 'AI智能助手(三栏页面版)', icon: 'Grid' }
  },
  // 阶段三：AI建设规划页面
  {
    path: '/ai-planning',
    name: 'AIPlanningPage',
    component: () => import('../pages/AIPlanningPage.vue'),
    meta: { title: 'AI规划文档', icon: 'Document' }
  },
  {
    path: '/ai-roadmap',
    name: 'AIRoadmapPage',
    component: () => import('../pages/AIRoadmapPage.vue'),
    meta: { title: '技术路线图', icon: 'Connection' }
  },
  {
    path: '/ai-architecture',
    name: 'AIArchitecturePage',
    component: () => import('../pages/AIArchitecturePage.vue'),
    meta: { title: '架构设计', icon: 'Operation' }
  },
  {
    path: '/test-real-data',
    name: 'TestRealDataDisplay',
    component: () => import('../pages/TestRealDataDisplay.vue'),
    meta: { title: '真实数据显示测试', icon: 'DataBoard' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '页面未找到'
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
