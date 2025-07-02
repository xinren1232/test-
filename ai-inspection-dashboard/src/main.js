import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { createPinia } from 'pinia';
import { initializeServices } from './services'; // 导入服务初始化函数
import { initializeProjectBaselineRelations } from './data/ProjectBaselineMap.js';
import mermaid from 'mermaid'; // 导入Mermaid
import './api/mockApiMiddleware.js';
import './assets/main.css';

// 导入ECharts相关组件
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册ECharts组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer
]);

// 初始化Mermaid配置
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  flowchart: {
    htmlLabels: true,
    curve: 'basis'
  }
});

const app = createApp(App);

// 全局异常处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue错误:', err);
  console.info('错误组件:', vm);
  console.info('错误信息:', info);
};

// 注册Element Plus
app.use(ElementPlus, {
  locale: zhCn,
});

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 注册Pinia
app.use(createPinia());

// 注册路由
app.use(router);

// 将echarts实例添加到全局属性中
app.config.globalProperties.$echarts = echarts;

// 将mermaid实例添加到全局属性中
app.config.globalProperties.$mermaid = mermaid;

// 添加全局指令 - 用于渲染Mermaid图表
app.directive('mermaid', {
  mounted(el) {
    mermaid.init(undefined, el);
  },
  updated(el) {
    el.removeAttribute('data-processed');
    mermaid.init(undefined, el);
  }
});

// 初始化项目基线关系
console.log('初始化项目基线关系...');
initializeProjectBaselineRelations();

// 初始化物料编码映射
console.log('正在初始化物料编码映射...');
import { initializeMaterialCodeMap } from './data/MaterialCodeMap.js';
initializeMaterialCodeMap().then(() => {
  console.log('物料编码映射初始化完成');
}).catch(error => {
  console.error('物料编码映射初始化失败:', error);
});

// 初始化系统数据更新服务
import systemDataUpdater from './services/SystemDataUpdater.js';
systemDataUpdater.ensureCodeMapInitialized().then(() => {
  console.log('系统数据服务初始化完成');
}).catch(error => {
  console.error('系统数据服务初始化失败:', error);
});

// 初始化所有服务
console.log('初始化服务...');
initializeServices().then(result => {
  console.log('服务初始化' + (result ? '成功' : '失败'));
}).catch(error => {
  console.error('服务初始化错误:', error);
});

console.log('应用初始化中...');

// 挂载应用
app.mount('#app');
