import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../pages/HomeView.vue'
import FactoryView from '../pages/FactoryView.vue'
import LabView from '../pages/LabView.vue'
import OnlineView from '../pages/OnlineView.vue'
import AiAssistant from '../pages/AiAssistant.vue'
import MonitoringDashboard from '../pages/MonitoringDashboard.vue'
import SystemSettings from '../pages/SystemSettings.vue'

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
      component: FactoryView
    },
    {
      path: '/lab',
      name: 'lab',
      component: LabView
    },
    {
      path: '/online',
      name: 'online',
      component: OnlineView
    },
    {
      path: '/ai-assistant',
      name: 'ai-assistant',
      component: AiAssistant
    },
    {
      path: '/monitoring',
      name: 'monitoring',
      component: MonitoringDashboard
    },
    {
      path: '/settings',
      name: 'settings',
      component: SystemSettings
    }
  ]
})

export default router 
 
 