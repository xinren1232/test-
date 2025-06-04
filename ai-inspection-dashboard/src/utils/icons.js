// Element Plus 图标工具函数
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

/**
 * 全局注册所有 Element Plus 图标组件
 * @param {import('vue').App} app Vue 应用实例
 */
export function registerIcons(app) {
  // 注册所有 Element Plus 图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(`el-icon-${key}`, component)
  }
}

/**
 * 获取常用图标对象
 * 避免在各个组件中重复导入相同的图标
 */
export function getCommonIcons() {
  return {
    Search: ElementPlusIconsVue.Search,
    DataAnalysis: ElementPlusIconsVue.DataAnalysis,
    CircleCheck: ElementPlusIconsVue.CircleCheck,
    Warning: ElementPlusIconsVue.Warning,
    WarningFilled: ElementPlusIconsVue.WarningFilled,
    DataLine: ElementPlusIconsVue.DataLine,
    Finished: ElementPlusIconsVue.Finished,
    PieChart: ElementPlusIconsVue.PieChart,
    DocumentChecked: ElementPlusIconsVue.DocumentChecked,
    Plus: ElementPlusIconsVue.Plus,
    Download: ElementPlusIconsVue.Download,
    Refresh: ElementPlusIconsVue.Refresh
  }
}

export default {
  registerIcons,
  getCommonIcons
} 