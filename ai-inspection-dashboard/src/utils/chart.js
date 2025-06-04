// ECharts 工具函数
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart, GraphChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  ToolboxComponent
} from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

// 注册必要的组件
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  GraphChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  ToolboxComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
])

/**
 * 初始化图表实例
 * @param {HTMLElement} el 图表容器元素
 * @returns {echarts.ECharts} 图表实例
 */
export function initChart(el) {
  return echarts.init(el)
}

/**
 * 获取 echarts 实例
 */
export function getECharts() {
  return echarts
}

/**
 * 在窗口大小变化时重新调整图表大小
 * @param {echarts.ECharts} chartInstance 图表实例
 */
export function resizeChart(chartInstance) {
  if (chartInstance) {
    chartInstance.resize()
  }
}

/**
 * 创建基本柱状图配置
 * @param {string} title 图表标题
 * @param {string[]} categories X轴类别
 * @param {Array} data 数据
 * @param {Object} options 额外配置项
 */
export function createBarChartOptions(title, categories, data, options = {}) {
  return {
    title: {
      text: title
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: categories
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data,
        type: 'bar',
        ...options
      }
    ]
  }
}

/**
 * 创建基本折线图配置
 * @param {string} title 图表标题
 * @param {string[]} categories X轴类别
 * @param {Array} data 数据
 * @param {Object} options 额外配置项
 */
export function createLineChartOptions(title, categories, data, options = {}) {
  return {
    title: {
      text: title
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: categories
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data,
        type: 'line',
        smooth: true,
        ...options
      }
    ]
  }
}

/**
 * 创建基本饼图配置
 * @param {string} title 图表标题
 * @param {Array} data 数据 [{name: '名称', value: 值}]
 * @param {Object} options 额外配置项
 */
export function createPieChartOptions(title, data, options = {}) {
  return {
    title: {
      text: title
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 'bottom'
    },
    series: [
      {
        name: title,
        type: 'pie',
        radius: '50%',
        data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        ...options
      }
    ]
  }
}

export default {
  initChart,
  getECharts,
  resizeChart,
  createBarChartOptions,
  createLineChartOptions,
  createPieChartOptions
} 