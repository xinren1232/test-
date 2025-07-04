<template>
  <div class="d3-renderer">
    <div class="chart-header" v-if="title">
      <h4 class="chart-title">{{ title }}</h4>
      <div class="chart-controls">
        <el-button-group size="small">
          <el-button 
            v-for="type in availableTypes" 
            :key="type"
            :type="currentType === type ? 'primary' : 'default'"
            @click="changeVisualizationType(type)"
          >
            {{ getTypeLabel(type) }}
          </el-button>
        </el-button-group>
      </div>
    </div>
    
    <div 
      ref="d3Container" 
      class="d3-container" 
      :style="{ height: chartHeight + 'px' }"
    ></div>
    
    <div class="chart-footer" v-if="description">
      <p class="chart-description">{{ description }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ElButton, ElButtonGroup } from 'element-plus'
import * as d3 from 'd3'

// Props定义
const props = defineProps({
  chartData: {
    type: Object,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  defaultVisualizationType: {
    type: String,
    default: 'bar'
  },
  chartHeight: {
    type: Number,
    default: 400
  },
  options: {
    type: Object,
    default: () => ({})
  }
})

// Emits定义
const emit = defineEmits(['chart-ready', 'chart-click', 'type-change'])

// 响应式数据
const d3Container = ref(null)
const currentType = ref(props.defaultVisualizationType)
const svgElement = ref(null)

// 可用的可视化类型
const availableTypes = ['bar', 'line', 'scatter', 'bubble', 'treemap']

// 获取类型标签
const getTypeLabel = (type) => {
  const labels = {
    bar: '柱状图',
    line: '折线图',
    scatter: '散点图',
    bubble: '气泡图',
    treemap: '树状图'
  }
  return labels[type] || type
}

// 颜色比例尺
const colorScale = d3.scaleOrdinal()
  .range(['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96'])

// 创建SVG容器
const createSVG = () => {
  // 清除现有内容
  d3.select(d3Container.value).selectAll('*').remove()
  
  const margin = { top: 20, right: 30, bottom: 40, left: 50 }
  const width = d3Container.value.clientWidth - margin.left - margin.right
  const height = props.chartHeight - margin.top - margin.bottom

  const svg = d3.select(d3Container.value)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  svgElement.value = { svg, g, width, height, margin }
  return svgElement.value
}

// 柱状图
const createBarChart = () => {
  const { g, width, height } = createSVG()
  const data = props.chartData.datasets[0].data
  const labels = props.chartData.labels

  // 创建比例尺
  const xScale = d3.scaleBand()
    .domain(labels)
    .range([0, width])
    .padding(0.1)

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data)])
    .range([height, 0])

  // 创建坐标轴
  g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale))

  g.append('g')
    .call(d3.axisLeft(yScale))

  // 创建柱子
  g.selectAll('.bar')
    .data(data)
    .enter().append('rect')
    .attr('class', 'bar')
    .attr('x', (d, i) => xScale(labels[i]))
    .attr('width', xScale.bandwidth())
    .attr('y', d => yScale(d))
    .attr('height', d => height - yScale(d))
    .attr('fill', (d, i) => colorScale(i))
    .style('cursor', 'pointer')
    .on('click', (event, d, i) => {
      emit('chart-click', { data: d, index: i, label: labels[i] })
    })
    .on('mouseover', function(event, d) {
      d3.select(this).attr('opacity', 0.8)
      
      // 添加提示框
      const tooltip = d3.select('body').append('div')
        .attr('class', 'd3-tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '8px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')

      tooltip.transition().duration(200).style('opacity', 1)
      tooltip.html(`值: ${d}`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px')
    })
    .on('mouseout', function() {
      d3.select(this).attr('opacity', 1)
      d3.selectAll('.d3-tooltip').remove()
    })
}

// 折线图
const createLineChart = () => {
  const { g, width, height } = createSVG()
  const data = props.chartData.datasets[0].data
  const labels = props.chartData.labels

  // 创建比例尺
  const xScale = d3.scalePoint()
    .domain(labels)
    .range([0, width])

  const yScale = d3.scaleLinear()
    .domain(d3.extent(data))
    .range([height, 0])

  // 创建坐标轴
  g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale))

  g.append('g')
    .call(d3.axisLeft(yScale))

  // 创建线条生成器
  const line = d3.line()
    .x((d, i) => xScale(labels[i]))
    .y(d => yScale(d))
    .curve(d3.curveMonotoneX)

  // 绘制线条
  g.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', colorScale(0))
    .attr('stroke-width', 2)
    .attr('d', line)

  // 添加数据点
  g.selectAll('.dot')
    .data(data)
    .enter().append('circle')
    .attr('class', 'dot')
    .attr('cx', (d, i) => xScale(labels[i]))
    .attr('cy', d => yScale(d))
    .attr('r', 4)
    .attr('fill', colorScale(0))
    .style('cursor', 'pointer')
    .on('click', (event, d, i) => {
      emit('chart-click', { data: d, index: i, label: labels[i] })
    })
}

// 散点图
const createScatterPlot = () => {
  const { g, width, height } = createSVG()
  const data = props.chartData.datasets[0].data
  const labels = props.chartData.labels

  // 假设数据是二维的 [x, y] 格式
  const scatterData = data.map((d, i) => ({
    x: Array.isArray(d) ? d[0] : i,
    y: Array.isArray(d) ? d[1] : d,
    label: labels[i]
  }))

  // 创建比例尺
  const xScale = d3.scaleLinear()
    .domain(d3.extent(scatterData, d => d.x))
    .range([0, width])

  const yScale = d3.scaleLinear()
    .domain(d3.extent(scatterData, d => d.y))
    .range([height, 0])

  // 创建坐标轴
  g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale))

  g.append('g')
    .call(d3.axisLeft(yScale))

  // 创建散点
  g.selectAll('.dot')
    .data(scatterData)
    .enter().append('circle')
    .attr('class', 'dot')
    .attr('cx', d => xScale(d.x))
    .attr('cy', d => yScale(d.y))
    .attr('r', 5)
    .attr('fill', (d, i) => colorScale(i))
    .style('cursor', 'pointer')
    .on('click', (event, d) => {
      emit('chart-click', { data: d, label: d.label })
    })
}

// 气泡图
const createBubbleChart = () => {
  const { g, width, height } = createSVG()
  const data = props.chartData.datasets[0].data
  const labels = props.chartData.labels

  // 假设数据是三维的 [x, y, size] 格式
  const bubbleData = data.map((d, i) => ({
    x: Array.isArray(d) ? d[0] : i,
    y: Array.isArray(d) ? d[1] : d,
    size: Array.isArray(d) && d[2] ? d[2] : Math.random() * 50 + 10,
    label: labels[i]
  }))

  // 创建比例尺
  const xScale = d3.scaleLinear()
    .domain(d3.extent(bubbleData, d => d.x))
    .range([0, width])

  const yScale = d3.scaleLinear()
    .domain(d3.extent(bubbleData, d => d.y))
    .range([height, 0])

  const sizeScale = d3.scaleSqrt()
    .domain(d3.extent(bubbleData, d => d.size))
    .range([5, 30])

  // 创建坐标轴
  g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale))

  g.append('g')
    .call(d3.axisLeft(yScale))

  // 创建气泡
  g.selectAll('.bubble')
    .data(bubbleData)
    .enter().append('circle')
    .attr('class', 'bubble')
    .attr('cx', d => xScale(d.x))
    .attr('cy', d => yScale(d.y))
    .attr('r', d => sizeScale(d.size))
    .attr('fill', (d, i) => colorScale(i))
    .attr('opacity', 0.7)
    .style('cursor', 'pointer')
    .on('click', (event, d) => {
      emit('chart-click', { data: d, label: d.label })
    })
}

// 树状图
const createTreemap = () => {
  const { width, height } = createSVG()
  const data = props.chartData.datasets[0].data
  const labels = props.chartData.labels

  // 准备层次数据
  const hierarchyData = {
    name: 'root',
    children: data.map((d, i) => ({
      name: labels[i],
      value: d
    }))
  }

  // 创建树状图布局
  const treemap = d3.treemap()
    .size([width, height])
    .padding(2)

  const root = d3.hierarchy(hierarchyData)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value)

  treemap(root)

  // 绘制矩形
  const leaf = svgElement.value.g.selectAll('g')
    .data(root.leaves())
    .enter().append('g')
    .attr('transform', d => `translate(${d.x0},${d.y0})`)

  leaf.append('rect')
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .attr('fill', (d, i) => colorScale(i))
    .attr('stroke', 'white')
    .attr('stroke-width', 1)
    .style('cursor', 'pointer')
    .on('click', (event, d) => {
      emit('chart-click', { data: d.data, label: d.data.name })
    })

  // 添加文本标签
  leaf.append('text')
    .attr('x', 4)
    .attr('y', 14)
    .text(d => d.data.name)
    .attr('font-size', '12px')
    .attr('fill', 'white')
    .attr('font-weight', 'bold')
}

// 创建可视化
const createVisualization = async () => {
  if (!d3Container.value || !props.chartData) return

  await nextTick()

  switch (currentType.value) {
    case 'bar':
      createBarChart()
      break
    case 'line':
      createLineChart()
      break
    case 'scatter':
      createScatterPlot()
      break
    case 'bubble':
      createBubbleChart()
      break
    case 'treemap':
      createTreemap()
      break
    default:
      createBarChart()
  }

  emit('chart-ready', svgElement.value)
}

// 更改可视化类型
const changeVisualizationType = async (type) => {
  if (type === currentType.value) return
  
  currentType.value = type
  emit('type-change', type)
  await createVisualization()
}

// 监听数据变化
watch(() => props.chartData, createVisualization, { deep: true })
watch(() => props.defaultVisualizationType, (newType) => {
  if (newType !== currentType.value) {
    changeVisualizationType(newType)
  }
})

// 生命周期
onMounted(() => {
  createVisualization()
})

onUnmounted(() => {
  // 清理D3元素
  if (d3Container.value) {
    d3.select(d3Container.value).selectAll('*').remove()
  }
  // 清理提示框
  d3.selectAll('.d3-tooltip').remove()
})

// 暴露方法
defineExpose({
  svgElement,
  createVisualization,
  changeVisualizationType
})
</script>

<style scoped>
.d3-renderer {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.chart-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.chart-controls {
  display: flex;
  gap: 8px;
}

.d3-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.chart-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.chart-description {
  margin: 0;
  font-size: 14px;
  color: #8c8c8c;
  text-align: center;
}

/* D3特定样式 */
:deep(.bar:hover) {
  opacity: 0.8;
}

:deep(.dot:hover) {
  r: 6;
}

:deep(.bubble:hover) {
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .chart-controls {
    width: 100%;
    justify-content: center;
  }
  
  .chart-controls .el-button-group {
    width: 100%;
  }
  
  .chart-controls .el-button {
    flex: 1;
    font-size: 12px;
  }
}
</style>
