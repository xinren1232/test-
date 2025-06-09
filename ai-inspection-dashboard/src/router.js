import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './pages/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('./pages/MonitoringDashboard.vue')
    },
    {
      path: '/inventory',
      name: 'inventory',
      component: () => import('./pages/InventoryManagement.vue')
    },
    {
      path: '/factory',
      name: 'factory',
      component: () => import('./pages/FactoryView.vue')
    },
    {
      path: '/lab',
      name: 'lab',
      component: () => import('./pages/LabView.vue')
    },
    {
      path: '/lab-inspection',
      name: 'labInspection',
      component: () => import('./pages/LabInspectionView.vue')
    },
    {
      path: '/online',
      name: 'online',
      component: () => import('./pages/OnlineView.vue')
    },
    {
      path: '/batch',
      name: 'batch',
      component: () => import('./pages/BatchManagement.vue')
    },
    {
      path: '/batch/:id',
      name: 'batchDetail',
      component: () => import('./pages/BatchDetail.vue'),
      props: true
    },
    {
      path: '/monitoring',
      name: 'monitoring',
      component: () => import('./pages/RealTimeMonitoring.vue')
    },
    {
      path: '/architecture',
      name: 'architecture',
      component: () => import('./pages/ArchitectureView.vue')
    },
    {
      path: '/analysis',
      name: 'analysis',
      component: () => import('./pages/AnalysisView.vue')
    },
    {
      path: '/quality',
      name: 'quality',
      component: () => import('./pages/QualityManagement.vue')
    },
    {
      path: '/knowledge-qa',
      name: 'knowledgeQA',
      component: () => import('./pages/KnowledgeQAView.vue')
    },
    // 添加通配符路由，处理所有未匹配的路径
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
    // 设置页面暂未实现，需要时再添加
    // {
    //   path: '/settings',
    //   name: 'settings',
    //   component: () => import('./pages/SystemSettings.vue')
    // }
  ]
})

export default router 
 
 