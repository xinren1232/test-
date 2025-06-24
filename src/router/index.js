import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import DashboardView from '../views/DashboardView.vue';
import InventoryView from '../views/InventoryView.vue';
import FactoryView from '../views/FactoryView.vue';
import LabView from '../views/LabView.vue';
import BatchView from '../views/BatchView.vue';
import QualityView from '../views/QualityView.vue';
import AnalysisView from '../views/AnalysisView.vue';
import AdminView from '../views/AdminView.vue';
import DataGenerationView from '../views/admin/DataGenerationView.vue';
import DataValidationView from '../views/admin/DataValidationView.vue';
import RuleManagementView from '../views/admin/RuleManagementView.vue';
import DataRulesView from '../views/admin/DataRulesView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: '首页'
    }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: {
      title: '监控仪表板'
    }
  },
  {
    path: '/inventory',
    name: 'inventory',
    component: InventoryView,
    meta: {
      title: '物料库存管理'
    }
  },
  {
    path: '/factory',
    name: 'factory',
    component: FactoryView,
    meta: {
      title: '物料上线跟踪'
    }
  },
  {
    path: '/lab',
    name: 'lab',
    component: LabView,
    meta: {
      title: '物料测试跟踪'
    }
  },
  {
    path: '/batch',
    name: 'batch',
    component: BatchView,
    meta: {
      title: '批次管理'
    }
  },
  {
    path: '/quality',
    name: 'quality',
    component: QualityView,
    meta: {
      title: '质量管理'
    }
  },
  {
    path: '/analysis',
    name: 'analysis',
    component: AnalysisView,
    meta: {
      title: '数据分析'
    }
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    meta: {
      title: '系统管理'
    }
  },
  {
    path: '/admin/data',
    name: 'data-generation',
    component: DataGenerationView,
    meta: {
      title: '数据生成工具'
    }
  },
  {
    path: '/admin/data/validation',
    name: 'data-validation',
    component: DataValidationView,
    meta: {
      title: '数据一致性校验'
    }
  },
  {
    path: '/admin/rule-management',
    name: 'rule-management',
    component: RuleManagementView,
    meta: {
      title: '规则管理'
    }
  },
  {
    path: '/admin/data-rules',
    name: 'data-rules',
    component: DataRulesView,
    meta: {
      title: '数据规则文档'
    }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router; 