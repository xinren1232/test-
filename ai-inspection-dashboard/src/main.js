import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { pinia } from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './assets/main.css'
import { ElMessage } from 'element-plus'

// 导入图表和增强组件
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart, RadarChart } from 'echarts/charts'
import { 
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  VisualMapComponent,
  MarkLineComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册ECharts组件
echarts.use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  VisualMapComponent,
  MarkLineComponent
])

// 全局图标
import {
  Search,
  DataAnalysis,
  Check,
  Warning,
  Timer,
  Reading,
  DataLine,
  Odometer,
  RefreshRight,
  Refresh,
  Setting,
  Download,
  Upload,
  Share,
  Delete,
  Edit,
  Plus,
  Minus,
  InfoFilled,
  QuestionFilled,
  ChatLineRound,
  Document,
  More
} from '@element-plus/icons-vue'

const app = createApp(App)

// 注册全局图标组件
const icons = {
  Search,
  DataAnalysis,
  Check,
  Warning,
  Timer,
  Reading,
  DataLine,
  Odometer,
  RefreshRight,
  Refresh,
  Setting,
  Download,
  Upload,
  Share,
  Delete,
  Edit,
  Plus,
  Minus,
  InfoFilled,
  QuestionFilled,
  ChatLineRound,
  Document,
  More
}

Object.entries(icons).forEach(([key, component]) => {
  app.component(key, component)
})

// 全局对象
app.config.globalProperties.$message = ElMessage
app.config.globalProperties.$echarts = echarts

// 使用插件
app.use(pinia)
app.use(router)
app.use(ElementPlus, { size: 'default' })

app.mount('#app') 
 
 