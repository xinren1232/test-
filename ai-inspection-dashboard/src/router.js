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
      path: '/online',
      name: 'online',
      component: () => import('./pages/OnlineView.vue')
    },
    {
      path: '/ai',
      name: 'ai',
      component: () => import('./pages/AiAssistant.vue')
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