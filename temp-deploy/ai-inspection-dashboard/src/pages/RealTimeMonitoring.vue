<template>
  <div class="realtime-monitoring-container">
    <el-page-header @back="goBack" title="返回" content="实时监控" />
    
    <el-row :gutter="20" class="status-cards">
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <el-card class="status-card" :body-style="{ padding: '20px' }">
          <div class="status-header">
            <div class="status-icon success">
              <el-icon-circle-check />
            </div>
            <div class="status-info">
              <div class="status-title">正常运行产线</div>
              <div class="status-value">8</div>
            </div>
          </div>
          <div class="status-footer">
            <span class="trend-text success">
              <el-icon-caret-top /> 较昨日增加2条
            </span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <el-card class="status-card" :body-style="{ padding: '20px' }">
          <div class="status-header">
            <div class="status-icon warning">
              <el-icon-warning />
            </div>
            <div class="status-info">
              <div class="status-title">告警产线</div>
              <div class="status-value">2</div>
            </div>
          </div>
          <div class="status-footer">
            <span class="trend-text warning">
              <el-icon-caret-top /> 较昨日增加1条
            </span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <el-card class="status-card" :body-style="{ padding: '20px' }">
          <div class="status-header">
            <div class="status-icon danger">
              <el-icon-close-bold />
            </div>
            <div class="status-info">
              <div class="status-title">异常产线</div>
              <div class="status-value">1</div>
            </div>
          </div>
          <div class="status-footer">
            <span class="trend-text danger">
              <el-icon-caret-top /> 较昨日增加1条
            </span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <el-card class="status-card" :body-style="{ padding: '20px' }">
          <div class="status-header">
            <div class="status-icon info">
              <el-icon-timer />
            </div>
            <div class="status-info">
              <div class="status-title">今日检验批次</div>
              <div class="status-value">24</div>
            </div>
          </div>
          <div class="status-footer">
            <span class="trend-text success">
              <el-icon-caret-top /> 较昨日增加6批
            </span>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 实时检验数据监控 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="16">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <h3>实时检验数据</h3>
              <div class="chart-controls">
                <el-select v-model="monitoringType" size="small" style="width: 150px">
                  <el-option label="检验合格率" value="pass_rate" />
                  <el-option label="缺陷检出率" value="defect_rate" />
                  <el-option label="生产速率" value="production_rate" />
                </el-select>
                <el-select v-model="timeRange" size="small" style="width: 120px; margin-left: 10px">
                  <el-option label="最近1小时" value="1h" />
                  <el-option label="最近4小时" value="4h" />
                  <el-option label="最近24小时" value="24h" />
                </el-select>
              </div>
            </div>
          </template>
          <div class="realtime-chart" ref="realtimeChartRef"></div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <h3>当前各产线状态</h3>
              <el-button type="primary" size="small" @click="refreshData">
                <el-icon-refresh /> 刷新
              </el-button>
            </div>
          </template>
          <div class="status-chart" ref="statusChartRef"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 生产线监控 -->
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="chart-header">
              <h3>生产线实时监控</h3>
              <div class="chart-controls">
                <el-radio-group v-model="productionLineFilter" size="small">
                  <el-radio-button label="all">全部</el-radio-button>
                  <el-radio-button label="normal">正常</el-radio-button>
                  <el-radio-button label="warning">告警</el-radio-button>
                  <el-radio-button label="error">异常</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </template>
          
          <el-table :data="filteredProductionLines" border stripe style="width: 100%">
            <el-table-column prop="line_id" label="产线ID" width="120" />
            <el-table-column prop="name" label="产线名称" />
            <el-table-column prop="product" label="当前生产产品" />
            <el-table-column prop="batch_id" label="当前批次" width="150" />
            <el-table-column label="状态" width="120">
              <template #default="scope">
                <el-tag
                  :type="getProductionLineStatusType(scope.row.status)"
                  effect="dark"
                >
                  {{ getProductionLineStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="efficiency" label="效率" width="180">
              <template #default="scope">
                <el-progress
                  :percentage="scope.row.efficiency"
                  :color="getEfficiencyColor(scope.row.efficiency)"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button type="primary" size="small" @click="viewLineDetail(scope.row)">
                  详情
                </el-button>
                <el-button type="warning" size="small" @click="showAlarms(scope.row)" :disabled="scope.row.status === 'normal'">
                  告警
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 实时告警面板 -->
    <el-row :gutter="20" class="alarm-panel-row">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="chart-header">
              <h3>实时告警</h3>
              <el-badge :value="activeAlarms.length" :max="99" class="alarm-badge">
                <el-button type="danger" plain size="small">
                  处理告警
                </el-button>
              </el-badge>
            </div>
          </template>
          
          <el-table :data="activeAlarms" border style="width: 100%">
            <el-table-column prop="timestamp" label="时间" width="180" />
            <el-table-column prop="line_id" label="产线" width="120" />
            <el-table-column prop="type" label="告警类型" width="150">
              <template #default="scope">
                <el-tag
                  :type="getAlarmTypeColor(scope.row.type)"
                  effect="dark"
                >
                  {{ scope.row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="message" label="告警信息" />
            <el-table-column label="状态" width="120">
              <template #default="scope">
                <el-tag
                  :type="scope.row.status === 'active' ? 'danger' : 'success'"
                >
                  {{ scope.row.status === 'active' ? '活动' : '已处理' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template #default="scope">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="handleAlarm(scope.row)"
                  :disabled="scope.row.status !== 'active'"
                >
                  处理
                </el-button>
                <el-button type="info" size="small" @click="viewAlarmDetail(scope.row)">
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 告警详情对话框 -->
    <el-dialog
      v-model="alarmDetailVisible"
      title="告警详情"
      width="50%"
    >
      <div v-if="selectedAlarm" class="alarm-detail">
        <el-descriptions
          title="告警基本信息"
          :column="2"
          border
        >
          <el-descriptions-item label="告警ID">{{ selectedAlarm.id }}</el-descriptions-item>
          <el-descriptions-item label="产线">{{ selectedAlarm.line_id }}</el-descriptions-item>
          <el-descriptions-item label="时间">{{ selectedAlarm.timestamp }}</el-descriptions-item>
          <el-descriptions-item label="类型">
            <el-tag :type="getAlarmTypeColor(selectedAlarm.type)">
              {{ selectedAlarm.type }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态" :span="2">
            <el-tag :type="selectedAlarm.status === 'active' ? 'danger' : 'success'">
              {{ selectedAlarm.status === 'active' ? '活动' : '已处理' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="告警信息" :span="2">
            {{ selectedAlarm.message }}
          </el-descriptions-item>
          <el-descriptions-item label="详细描述" :span="2">
            {{ selectedAlarm.description || '无详细描述' }}
          </el-descriptions-item>
        </el-descriptions>
        
        <div v-if="selectedAlarm.suggestions && selectedAlarm.suggestions.length" class="alarm-suggestions">
          <h4>处理建议</h4>
          <el-alert
            v-for="(suggestion, index) in selectedAlarm.suggestions"
            :key="index"
            :title="suggestion"
            type="info"
            :closable="false"
            show-icon
            style="margin-bottom: 10px"
          />
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="alarmDetailVisible = false">关闭</el-button>
          <el-button 
            type="primary" 
            @click="handleAlarm(selectedAlarm)"
            :disabled="!selectedAlarm || selectedAlarm.status !== 'active'"
          >
            处理告警
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts/core'
import { LineChart, PieChart, BarChart, GaugeChart } from 'echarts/charts'
import { 
  TitleComponent, 
  TooltipComponent, 
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  ToolboxComponent,
  MarkLineComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { ElMessage } from 'element-plus'

// 注册必需的组件
echarts.use([
  TitleComponent, 
  TooltipComponent, 
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  ToolboxComponent,
  MarkLineComponent,
  LineChart,
  PieChart,
  BarChart,
  GaugeChart,
  CanvasRenderer
])

const router = useRouter()

// 监控设置
const monitoringType = ref('pass_rate')
const timeRange = ref('4h')
const productionLineFilter = ref('all')
const realtimeChartRef = ref(null)
const statusChartRef = ref(null)
let realtimeChart = null
let statusChart = null
let dataUpdateTimer = null

// 告警相关
const alarmDetailVisible = ref(false)
const selectedAlarm = ref(null)

// 模拟生产线数据
const productionLines = ref([
  {
    line_id: 'L001',
    name: '电子组件装配线1',
    product: 'iPhone 14 Pro 后摄像头模组',
    batch_id: 'B20230001',
    status: 'normal',
    efficiency: 92,
    alarms: []
  },
  {
    line_id: 'L002',
    name: '电子组件装配线2',
    product: 'iPhone 14 Pro Max 后摄像头模组',
    batch_id: 'B20230002',
    status: 'normal',
    efficiency: 95,
    alarms: []
  },
  {
    line_id: 'L003',
    name: 'PCB生产线1',
    product: 'iPhone 14 Pro 主板',
    batch_id: 'B20230003',
    status: 'warning',
    efficiency: 78,
    alarms: [
      {
        id: 'A001',
        timestamp: '2023-06-18 14:32:45',
        type: '效率下降',
        message: 'PCB生产线1效率低于80%',
        status: 'active',
        description: '设备L003-EQ12焊接效率下降，可能需要维护',
        suggestions: [
          '检查设备L003-EQ12的焊接头是否需要清理',
          '检查供料系统是否正常',
          '如持续低效，安排设备维护'
        ]
      }
    ]
  },
  {
    line_id: 'L004',
    name: 'PCB生产线2',
    product: 'iPhone 14 Pro Max 主板',
    batch_id: 'B20230004',
    status: 'normal',
    efficiency: 91,
    alarms: []
  },
  {
    line_id: 'L005',
    name: '结构件加工线1',
    product: 'iPhone 14 Pro 中框',
    batch_id: 'B20230005',
    status: 'warning',
    efficiency: 85,
    alarms: [
      {
        id: 'A002',
        timestamp: '2023-06-18 15:10:22',
        type: '质量波动',
        message: '结构件加工线1表面处理质量波动',
        status: 'active',
        description: '表面处理工位检测到连续3件产品表面光洁度不达标',
        suggestions: [
          '检查表面处理液配比是否正确',
          '检查处理时间是否符合工艺要求',
          '如持续异常，暂停生产并通知工艺部门'
        ]
      }
    ]
  },
  {
    line_id: 'L006',
    name: '结构件加工线2',
    product: 'iPhone 14 背壳',
    batch_id: 'B20230006',
    status: 'normal',
    efficiency: 93,
    alarms: []
  },
  {
    line_id: 'L007',
    name: '显示模组生产线',
    product: 'iPhone 14 Pro 显示屏',
    batch_id: 'B20230007',
    status: 'normal',
    efficiency: 89,
    alarms: []
  },
  {
    line_id: 'L008',
    name: '摄像头模组线',
    product: 'iPhone 14 前摄像头',
    batch_id: 'B20230008',
    status: 'normal',
    efficiency: 94,
    alarms: []
  },
  {
    line_id: 'L009',
    name: '电池封装线',
    product: 'iPhone 14 Pro 电池',
    batch_id: 'B20230009',
    status: 'normal',
    efficiency: 96,
    alarms: []
  },
  {
    line_id: 'L010',
    name: '整机组装线1',
    product: 'iPhone 14 Pro',
    batch_id: 'B20230010',
    status: 'normal',
    efficiency: 88,
    alarms: []
  },
  {
    line_id: 'L011',
    name: '整机组装线2',
    product: 'iPhone 14 Pro Max',
    batch_id: 'B20230011',
    status: 'error',
    efficiency: 45,
    alarms: [
      {
        id: 'A003',
        timestamp: '2023-06-18 13:05:17',
        type: '设备故障',
        message: '整机组装线2自动螺丝机故障',
        status: 'active',
        description: '自动螺丝机L011-EQ05报错代码E-1234，已自动停机',
        suggestions: [
          '立即联系设备维修部门',
          '可以临时切换到备用设备',
          '检查之前组装的产品是否受影响'
        ]
      },
      {
        id: 'A004',
        timestamp: '2023-06-18 13:07:32',
        type: '生产中断',
        message: '整机组装线2生产中断',
        status: 'active',
        description: '由于设备故障，整条生产线已暂停',
        suggestions: [
          '评估影响范围和修复时间',
          '考虑调整生产计划',
          '通知下游工序可能的延迟'
        ]
      }
    ]
  }
])

// 过滤后的产线数据
const filteredProductionLines = computed(() => {
  if (productionLineFilter.value === 'all') {
    return productionLines.value
  }
  return productionLines.value.filter(line => line.status === productionLineFilter.value)
})

// 活动告警列表
const activeAlarms = computed(() => {
  const alarms = []
  productionLines.value.forEach(line => {
    line.alarms.forEach(alarm => {
      if (alarm.status === 'active') {
        alarms.push({
          ...alarm,
          line_id: line.line_id
        })
      }
    })
  })
  return alarms
})

// 生成模拟实时数据
function generateRealtimeData() {
  const now = new Date()
  const data = []
  
  // 生成过去指定时间段的数据
  let hours = 1
  switch (timeRange.value) {
    case '4h': hours = 4; break
    case '24h': hours = 24; break
  }
  
  // 每5分钟一个数据点
  const points = hours * 12
  
  for (let i = points; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 5 * 60 * 1000)
    let value = 0
    
    switch (monitoringType.value) {
      case 'pass_rate':
        // 模拟检验合格率 (85%-99%)
        value = 85 + Math.random() * 14
        // 加入小波动
        value += Math.sin(i * 0.5) * 2
        break
      case 'defect_rate':
        // 模拟缺陷检出率 (0.5%-3%)
        value = 0.5 + Math.random() * 2.5
        // 加入小波动
        value += Math.sin(i * 0.3) * 0.5
        break
      case 'production_rate':
        // 模拟生产速率 (每小时80-120件)
        value = 80 + Math.random() * 40
        // 加入波动模拟班次变化
        value += Math.sin(i * 0.2) * 15
        break
    }
    
    // 确保值在合理范围内
    value = Math.max(0, value)
    if (monitoringType.value === 'pass_rate') {
      value = Math.min(100, value)
    }
    
    data.push({
      time: time.toLocaleTimeString(),
      value: parseFloat(value.toFixed(2))
    })
  }
  
  return data
}

// 初始化实时图表
function initRealtimeChart() {
  if (!realtimeChartRef.value) return
  
  if (realtimeChart) {
    realtimeChart.dispose()
  }
  
  realtimeChart = echarts.init(realtimeChartRef.value)
  
  const data = generateRealtimeData()
  
  let yAxisName = ''
  let yAxisMax = null
  
  switch (monitoringType.value) {
    case 'pass_rate':
      yAxisName = '检验合格率 (%)'
      yAxisMax = 100
      break
    case 'defect_rate':
      yAxisName = '缺陷检出率 (%)'
      yAxisMax = 5
      break
    case 'production_rate':
      yAxisName = '生产速率 (件/小时)'
      yAxisMax = 150
      break
  }
  
  const option = {
    title: {
      text: getMonitoringTypeText(),
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        const param = params[0]
        return `${param.axisValue}<br />${param.marker}${getMonitoringTypeText()}: ${param.data.value}${getMonitoringTypeUnit()}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map(item => item.time)
    },
    yAxis: {
      type: 'value',
      name: yAxisName,
      max: yAxisMax,
      axisLabel: {
        formatter: function(value) {
          return `${value}${getMonitoringTypeUnit()}`
        }
      }
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        start: 0,
        end: 100
      }
    ],
    series: [
      {
        name: getMonitoringTypeText(),
        type: 'line',
        smooth: true,
        symbol: 'none',
        sampling: 'average',
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(64, 158, 255, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(64, 158, 255, 0.1)'
            }
          ])
        },
        data: data.map(item => ({
          value: item.value
        })),
        markLine: {
          silent: true,
          lineStyle: {
            color: '#E6A23C'
          },
          data: [
            {
              yAxis: getTargetValue(),
              label: {
                formatter: `目标值: ${getTargetValue()}${getMonitoringTypeUnit()}`
              }
            }
          ]
        }
      }
    ]
  }
  
  realtimeChart.setOption(option)
}

// 初始化状态饼图
function initStatusChart() {
  if (!statusChartRef.value) return
  
  if (statusChart) {
    statusChart.dispose()
  }
  
  statusChart = echarts.init(statusChartRef.value)
  
  // 统计产线状态
  const statusCount = {
    normal: 0,
    warning: 0,
    error: 0
  }
  
  productionLines.value.forEach(line => {
    statusCount[line.status]++
  })
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      top: 'center',
      data: ['正常', '告警', '异常']
    },
    series: [
      {
        name: '产线状态',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { 
            value: statusCount.normal, 
            name: '正常',
            itemStyle: { color: '#67C23A' }
          },
          { 
            value: statusCount.warning, 
            name: '告警',
            itemStyle: { color: '#E6A23C' }
          },
          { 
            value: statusCount.error, 
            name: '异常',
            itemStyle: { color: '#F56C6C' }
          }
        ]
      }
    ]
  }
  
  statusChart.setOption(option)
}

// 获取监控类型文本
function getMonitoringTypeText() {
  switch (monitoringType.value) {
    case 'pass_rate': return '检验合格率'
    case 'defect_rate': return '缺陷检出率'
    case 'production_rate': return '生产速率'
    default: return ''
  }
}

// 获取监控类型单位
function getMonitoringTypeUnit() {
  switch (monitoringType.value) {
    case 'pass_rate': return '%'
    case 'defect_rate': return '%'
    case 'production_rate': return '件/小时'
    default: return ''
  }
}

// 获取目标值
function getTargetValue() {
  switch (monitoringType.value) {
    case 'pass_rate': return 95
    case 'defect_rate': return 1.5
    case 'production_rate': return 100
    default: return 0
  }
}

// 获取产线状态类型
function getProductionLineStatusType(status) {
  switch (status) {
    case 'normal': return 'success'
    case 'warning': return 'warning'
    case 'error': return 'danger'
    default: return 'info'
  }
}

// 获取产线状态文本
function getProductionLineStatusText(status) {
  switch (status) {
    case 'normal': return '正常'
    case 'warning': return '告警'
    case 'error': return '异常'
    default: return '未知'
  }
}

// 获取告警类型颜色
function getAlarmTypeColor(type) {
  switch (type) {
    case '设备故障': return 'danger'
    case '生产中断': return 'danger'
    case '质量波动': return 'warning'
    case '效率下降': return 'warning'
    default: return 'info'
  }
}

// 获取效率颜色
function getEfficiencyColor(efficiency) {
  if (efficiency >= 90) return '#67C23A'
  if (efficiency >= 80) return '#E6A23C'
  return '#F56C6C'
}

// 查看产线详情
function viewLineDetail(line) {
  ElMessage({
    message: `查看产线 ${line.name} 的详细信息`,
    type: 'info'
  })
}

// 显示告警信息
function showAlarms(line) {
  if (line.alarms.length === 0) {
    ElMessage({
      message: `产线 ${line.name} 没有活动告警`,
      type: 'info'
    })
    return
  }
  
  selectedAlarm.value = { ...line.alarms[0], line_id: line.line_id }
  alarmDetailVisible.value = true
}

// 查看告警详情
function viewAlarmDetail(alarm) {
  selectedAlarm.value = alarm
  alarmDetailVisible.value = true
}

// 处理告警
function handleAlarm(alarm) {
  if (!alarm) return
  
  ElMessage({
    message: `告警 ${alarm.id} 已处理`,
    type: 'success'
  })
  
  // 更新告警状态
  productionLines.value.forEach(line => {
    if (line.line_id === alarm.line_id) {
      const alarmIndex = line.alarms.findIndex(a => a.id === alarm.id)
      if (alarmIndex !== -1) {
        line.alarms[alarmIndex].status = 'resolved'
      }
      
      // 如果所有告警已处理，更新产线状态
      const hasActiveAlarms = line.alarms.some(a => a.status === 'active')
      if (!hasActiveAlarms) {
        line.status = 'normal'
        line.efficiency = 90 + Math.floor(Math.random() * 8)
      }
    }
  })
  
  // 如果正在查看告警详情，关闭对话框
  if (alarmDetailVisible.value) {
    alarmDetailVisible.value = false
  }
  
  // 刷新图表
  initStatusChart()
}

// 刷新数据
function refreshData() {
  ElMessage({
    message: '数据已刷新',
    type: 'success'
  })
  
  initRealtimeChart()
  initStatusChart()
}

// 返回上一页
function goBack() {
  router.go(-1)
}

// 更新图表大小
function updateChartSize() {
  if (realtimeChart) {
    realtimeChart.resize()
  }
  if (statusChart) {
    statusChart.resize()
  }
}

// 监听monitoringType和timeRange变化
watch(monitoringType, () => {
  initRealtimeChart()
})

watch(timeRange, () => {
  initRealtimeChart()
})

// 组件挂载时初始化
onMounted(() => {
  initRealtimeChart()
  initStatusChart()
  
  // 设置定时器模拟实时数据更新
  dataUpdateTimer = setInterval(() => {
    initRealtimeChart()
  }, 30000) // 每30秒更新一次
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', updateChartSize)
})

// 组件卸载时清理
onUnmounted(() => {
  if (dataUpdateTimer) {
    clearInterval(dataUpdateTimer)
  }
  
  window.removeEventListener('resize', updateChartSize)
  
  if (realtimeChart) {
    realtimeChart.dispose()
  }
  
  if (statusChart) {
    statusChart.dispose()
  }
})
</script>

<style scoped>
.realtime-monitoring-container {
  padding: 20px;
}

.status-cards {
  margin-top: 20px;
  margin-bottom: 20px;
}

.status-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.status-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.status-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.status-icon {
  font-size: 36px;
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  color: white;
}

.status-icon.success {
  background-color: #67C23A;
}

.status-icon.warning {
  background-color: #E6A23C;
}

.status-icon.danger {
  background-color: #F56C6C;
}

.status-icon.info {
  background-color: #909399;
}

.status-info {
  flex: 1;
}

.status-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.status-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.status-footer {
  margin-top: 10px;
  font-size: 14px;
}

.trend-text {
  display: flex;
  align-items: center;
}

.trend-text.success {
  color: #67C23A;
}

.trend-text.warning {
  color: #E6A23C;
}

.trend-text.danger {
  color: #F56C6C;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.chart-controls {
  display: flex;
  align-items: center;
}

.realtime-chart {
  height: 400px;
}

.status-chart {
  height: 400px;
}

.alarm-badge {
  margin-left: 10px;
}

.alarm-panel-row {
  margin-bottom: 20px;
}

.alarm-detail {
  padding: 10px;
}

.alarm-suggestions {
  margin-top: 20px;
}

.alarm-suggestions h4 {
  margin-bottom: 10px;
  color: #303133;
}
</style> 
 
 