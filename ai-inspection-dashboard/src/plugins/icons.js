/**
 * Element Plus 图标插件
 * 统一注册Element Plus图标组件
 */

import {
  Monitor,
  DataAnalysis,
  Warning,
  Goods,
  DocumentCopy,
  InfoFilled,
  Refresh,
  Download,
  Check,
  Close,
  Search,
  Delete,
  ChatDotRound,
  Position,
  Setting,
  User,
  Picture,
  Mic,
  ChatLineRound,
  Plus,
  Edit,
  Histogram,
  DataBoard,
  QuestionFilled,
  ArrowRight,
  ArrowLeft,
  MoreFilled,
  View,
  Link,
  PieChart,
  TrendCharts,
  Filter,
  CircleCheck,
  CircleClose,
  Bell
} from '@element-plus/icons-vue'

// 将图标组件转换为el-icon-xxx格式组件
const convertToComponentName = (name) => {
  // 将驼峰式命名转换为短横线命名
  const kebabCase = name.replace(/([A-Z])/g, '-$1').toLowerCase().substring(1)
  return `el-icon-${kebabCase}`
}

// 创建图标组件映射
const iconComponents = {
  [convertToComponentName('Monitor')]: Monitor,
  [convertToComponentName('DataAnalysis')]: DataAnalysis,
  [convertToComponentName('Warning')]: Warning,
  [convertToComponentName('Goods')]: Goods,
  [convertToComponentName('DocumentCopy')]: DocumentCopy,
  [convertToComponentName('InfoFilled')]: InfoFilled,
  [convertToComponentName('Refresh')]: Refresh,
  [convertToComponentName('Download')]: Download,
  [convertToComponentName('Check')]: Check,
  [convertToComponentName('Close')]: Close,
  [convertToComponentName('Search')]: Search,
  [convertToComponentName('Delete')]: Delete,
  [convertToComponentName('ChatDotRound')]: ChatDotRound,
  [convertToComponentName('Position')]: Position, 
  [convertToComponentName('Setting')]: Setting,
  [convertToComponentName('User')]: User,
  [convertToComponentName('Picture')]: Picture,
  [convertToComponentName('Mic')]: Mic,
  [convertToComponentName('ChatLineRound')]: ChatLineRound,
  [convertToComponentName('Plus')]: Plus,
  [convertToComponentName('Edit')]: Edit,
  [convertToComponentName('Histogram')]: Histogram,
  [convertToComponentName('DataBoard')]: DataBoard,
  [convertToComponentName('QuestionFilled')]: QuestionFilled,
  [convertToComponentName('ArrowRight')]: ArrowRight,
  [convertToComponentName('ArrowLeft')]: ArrowLeft,
  [convertToComponentName('MoreFilled')]: MoreFilled,
  [convertToComponentName('View')]: View,
  [convertToComponentName('Link')]: Link,
  [convertToComponentName('PieChart')]: PieChart,
  [convertToComponentName('TrendCharts')]: TrendCharts,
  [convertToComponentName('Filter')]: Filter,
  [convertToComponentName('CircleCheck')]: CircleCheck,
  [convertToComponentName('CircleClose')]: CircleClose,
  [convertToComponentName('Bell')]: Bell
}

export default {
  install: (app) => {
    // 注册所有图标组件
    Object.entries(iconComponents).forEach(([name, component]) => {
      app.component(name, component)
    })
    
    console.log('[Icons Plugin] Element Plus 图标组件已注册')
  }
} 