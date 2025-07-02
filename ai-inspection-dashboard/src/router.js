import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './pages/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: '仪表盘'
      }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('./pages/MonitoringDashboard.vue'),
      meta: {
        title: '监控面板'
      }
    },
    {
      path: '/inventory',
      name: 'inventory',
      component: () => import('./pages/Inventory.vue'),
      meta: {
        title: '物料库存管理'
      }
    },
    {
      path: '/factory',
      name: 'factory',
      component: () => import('./pages/FactoryView.vue'),
      meta: {
        title: '工厂视图'
      }
    },
    {
      path: '/lab',
      name: 'lab',
      component: () => import('./pages/LabView.vue'),
      meta: {
        title: '物料测试跟踪'
      }
    },
    {
      path: '/online',
      name: 'online',
      component: () => import('./pages/OnlineView.vue'),
      meta: {
        title: '物料上线跟踪'
      }
    },
    {
      path: '/batch',
      name: 'batch',
      component: () => import('./pages/BatchManagement.vue'),
      meta: {
        title: '批次管理'
      }
    },
    {
      path: '/batch/:id',
      name: 'batchDetail',
      component: () => import('./pages/BatchDetail.vue'),
      props: true,
      meta: {
        title: '批次详情'
      }
    },
    {
      path: '/monitoring',
      name: 'monitoring',
      component: () => import('./pages/RealTimeMonitoring.vue'),
      meta: {
        title: '实时监控'
      }
    },
    {
      path: '/analysis',
      name: 'analysis',
      component: () => import('./pages/AnalysisView.vue'),
      meta: {
        title: '数据分析'
      }
    },
    {
      path: '/quality',
      name: 'quality',
      component: () => import('./pages/QualityManagement.vue'),
      meta: {
        title: '质量管理'
      }
    },
    {
      path: '/architecture',
      name: 'architecture',
      component: () => import('./pages/ArchitectureView.vue'),
      meta: {
        title: '系统架构'
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('./pages/SystemSettings.vue'),
      meta: {
        title: '系统设置'
      }
    },
    {
      path: '/admin/data',
      name: 'adminData',
      component: () => import('./pages/AdminDataPage.vue'),
      meta: {
        title: '数据管理',
      }
    },
    {
      path: '/admin/data/rules',
      name: 'dataRules',
      component: () => import('./pages/NewDataRulesPage.vue'),
      meta: {
        title: '数据规则文档',
      }
    },
    {
      path: '/admin/data/import',
      name: 'dataImport',
      redirect: '/admin/data/historical',
      meta: {
        title: '历史数据导入管理',
        adminOnly: true
      }
    },
    {
      path: '/admin/data/historical',
      name: 'historicalData',
      component: () => import('./pages/HistoricalDataPage.vue'),
      meta: {
        title: '历史数据管控',
        adminOnly: true
      }
    },
    {
      path: '/lab-inspection',
      name: 'labInspection',
      component: () => import('./pages/LabInspectionView.vue'),
      meta: {
        title: '检验任务'
      }
    },
    {
      path: '/rule-library',
      name: 'ruleLibrary',
      component: () => import('./pages/RuleLibraryView.vue'),
      meta: {
        title: '规则库管理'
      }
    },
    {
      path: '/assistant-ai',
      name: 'assistant-ai',
      component: () => import('./pages/AssistantPageAIThreeColumn.vue'),
      meta: {
        title: 'AI智能助手'
      }
    },
    {
      path: '/test-ai-services',
      name: 'test-ai-services',
      component: () => import('./pages/TestAIServices.vue'),
      meta: {
        title: 'AI服务测试'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: () => import('./pages/NotFoundPage.vue'),
      meta: {
        title: '页面未找到'
      }
    }
  ]
})

// 全局路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `IQE动态检验 - ${to.meta.title}`;
  }
  
  // 可以添加权限验证逻辑
  // if (to.meta.requiresAuth && !isAuthenticated()) {
  //   next('/login');
  // } else {
  //   next();
  // }
  
  next();
});

export default router 
 
 