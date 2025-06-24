<template>
  <div class="batch-detail-container">
    <el-page-header @back="goBack" title="返回" content="批次详情" />
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    
    <div v-else-if="batchData" class="batch-content">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-card>
            <template #header>
              <div class="card-header">
                <h2>批次 {{ batchId }} 详情</h2>
                <div class="header-actions">
                  <el-button type="primary" @click="editBatch">
                    <el-icon-edit /> 编辑
                  </el-button>
                  <el-button type="success" @click="exportData">
                    <el-icon-download /> 导出
                  </el-button>
                </div>
              </div>
            </template>
            
            <el-descriptions :column="3" border>
              <el-descriptions-item label="物料编码">{{ batchData.material_code }}</el-descriptions-item>
              <el-descriptions-item label="物料名称">{{ batchData.material_name }}</el-descriptions-item>
              <el-descriptions-item label="物料类别">{{ batchData.category_name }}</el-descriptions-item>
              <el-descriptions-item label="供应商">{{ batchData.supplier_name }}</el-descriptions-item>
              <el-descriptions-item label="数量">{{ batchData.quantity }}</el-descriptions-item>
              <el-descriptions-item label="缺陷率">{{ (batchData.defect_rate * 100).toFixed(2) }}%</el-descriptions-item>
              <el-descriptions-item label="创建日期">{{ batchData.created_date }}</el-descriptions-item>
              <el-descriptions-item label="生产日期">{{ batchData.production_date || '-' }}</el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="getStatusTagType(batchData.status)">
                  {{ getStatusText(batchData.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="风险评级" :span="3">
                <el-tag :type="getRiskTagType(batchData.risk_level)" effect="dark">
                  {{ getRiskLevelText(batchData.risk_level) }}
                </el-tag>
                <div class="risk-detail-score">
                  风险评分: {{ batchData.risk_score || 0 }}/100
                  <el-progress 
                    :percentage="batchData.risk_score || 0" 
                    :color="getRiskProgressColor(batchData.risk_score || 0)" 
                    :stroke-width="10"
                  />
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="备注" :span="3">
                {{ batchData.notes || '无备注' }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 质检数据 -->
      <el-row :gutter="20" class="data-row">
        <el-col :span="24">
          <el-card>
            <template #header>
              <div class="card-header">
                <h3>质检数据</h3>
                <el-button type="primary" size="small" @click="addInspectionRecord">
                  <el-icon-plus /> 添加记录
                </el-button>
              </div>
            </template>
            
            <el-table :data="inspectionRecords" border stripe style="width: 100%">
              <el-table-column prop="inspection_date" label="检验日期" width="180" />
              <el-table-column prop="inspector" label="检验员" width="120" />
              <el-table-column prop="type" label="检验类型" width="120">
                <template #default="scope">
                  <el-tag :type="getInspectionTypeColor(scope.row.type)">
                    {{ scope.row.type }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="sample_size" label="样本数量" width="100" />
              <el-table-column prop="pass_count" label="合格数" width="100" />
              <el-table-column label="合格率" width="180">
                <template #default="scope">
                  <el-progress 
                    :percentage="getPassRate(scope.row)" 
                    :color="getPassRateColor(getPassRate(scope.row))"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="conclusion" label="结论" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.conclusion === '合格' ? 'success' : 'danger'">
                    {{ scope.row.conclusion }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="remarks" label="备注" />
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="viewInspectionDetail(scope.row)">
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 缺陷分析 -->
      <el-row :gutter="20" class="data-row">
        <el-col :xs="24" :lg="12">
          <el-card>
            <template #header>
              <h3>缺陷类型分布</h3>
            </template>
            <div class="defect-chart" ref="defectChartRef"></div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :lg="12">
          <el-card>
            <template #header>
              <h3>趋势分析</h3>
            </template>
            <div class="trend-chart" ref="trendChartRef"></div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 相关批次 -->
      <el-row :gutter="20" class="data-row">
        <el-col :span="24">
          <el-card>
            <template #header>
              <h3>相关批次</h3>
            </template>
            
            <el-table :data="relatedBatches" border stripe style="width: 100%">
              <el-table-column prop="batch_id" label="批次号" width="150" />
              <el-table-column prop="material_name" label="物料名称" />
              <el-table-column prop="created_date" label="创建日期" width="120" />
              <el-table-column label="缺陷率" width="180">
                <template #default="scope">
                  <el-progress 
                    :percentage="(scope.row.defect_rate * 100)" 
                    :color="getDefectRateColor(scope.row.defect_rate)"
                    :format="percent => percent.toFixed(2) + '%'"
                  />
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getStatusTagType(scope.row.status)">
                    {{ getStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="风险等级" width="100">
                <template #default="scope">
                  <el-tag :type="getRiskTagType(scope.row.risk_level)" effect="dark">
                    {{ getRiskLevelText(scope.row.risk_level) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="navigateToBatch(scope.row.batch_id)">
                    查看
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <div v-else class="error-container">
      <el-empty description="未找到批次数据" />
      <el-button type="primary" @click="goBack">返回</el-button>
    </div>
    
    <!-- 添加检验记录对话框 -->
    <el-dialog
      v-model="inspectionDialogVisible"
      title="添加检验记录"
      width="50%"
    >
      <el-form ref="inspectionForm" :model="inspectionForm" :rules="rules" label-width="100px">
        <el-form-item label="检验日期" prop="inspection_date">
          <el-date-picker
            v-model="inspectionForm.inspection_date"
            type="datetime"
            placeholder="选择检验日期时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
          />
        </el-form-item>
        <el-form-item label="检验员" prop="inspector">
          <el-input v-model="inspectionForm.inspector" />
        </el-form-item>
        <el-form-item label="检验类型" prop="type">
          <el-select v-model="inspectionForm.type" placeholder="选择检验类型">
            <el-option label="入厂检验" value="入厂检验" />
            <el-option label="首件检验" value="首件检验" />
            <el-option label="过程检验" value="过程检验" />
            <el-option label="终检" value="终检" />
            <el-option label="特殊检验" value="特殊检验" />
          </el-select>
        </el-form-item>
        <el-form-item label="样本数量" prop="sample_size">
          <el-input-number v-model="inspectionForm.sample_size" :min="1" />
        </el-form-item>
        <el-form-item label="合格数" prop="pass_count">
          <el-input-number 
            v-model="inspectionForm.pass_count" 
            :min="0" 
            :max="inspectionForm.sample_size" 
          />
        </el-form-item>
        <el-form-item label="结论" prop="conclusion">
          <el-radio-group v-model="inspectionForm.conclusion">
            <el-radio value="合格" label="合格">合格</el-radio>
            <el-radio value="不合格" label="不合格">不合格</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input 
            type="textarea" 
            v-model="inspectionForm.remarks"
            rows="3"
            placeholder="请输入检验备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="inspectionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitInspectionForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import * as echarts from 'echarts/core'
import { PieChart, LineChart } from 'echarts/charts'
import { 
  TitleComponent, 
  TooltipComponent, 
  LegendComponent,
  GridComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { ElMessage } from 'element-plus'

// 注册必需的组件
echarts.use([
  TitleComponent, 
  TooltipComponent, 
  LegendComponent,
  GridComponent,
  PieChart,
  LineChart,
  CanvasRenderer
])

const router = useRouter()
const route = useRoute()
const batchId = ref(route.params.id)
const loading = ref(true)
const batchData = ref(null)
const defectChartRef = ref(null)
const trendChartRef = ref(null)
let defectChart = null
let trendChart = null

// 检验记录对话框
const inspectionDialogVisible = ref(false)
const inspectionForm = ref({
  inspection_date: '',
  inspector: '',
  type: '入厂检验',
  sample_size: 100,
  pass_count: 98,
  conclusion: '合格',
  remarks: ''
})

// 表单验证规则
const rules = {
  inspection_date: [
    { required: true, message: '请选择检验日期', trigger: 'change' }
  ],
  inspector: [
    { required: true, message: '请输入检验员', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择检验类型', trigger: 'change' }
  ],
  sample_size: [
    { required: true, message: '请输入样本数量', trigger: 'blur' }
  ],
  pass_count: [
    { required: true, message: '请输入合格数', trigger: 'blur' }
  ],
  conclusion: [
    { required: true, message: '请选择结论', trigger: 'change' }
  ]
}

// 模拟的检验记录
const inspectionRecords = ref([
  {
    id: 1,
    inspection_date: '2023-06-01 09:30',
    inspector: '张工',
    type: '入厂检验',
    sample_size: 100,
    pass_count: 98,
    conclusion: '合格',
    remarks: '外观、尺寸、性能均符合要求'
  },
  {
    id: 2,
    inspection_date: '2023-06-02 14:15',
    inspector: '李工',
    type: '过程检验',
    sample_size: 50,
    pass_count: 49,
    conclusion: '合格',
    remarks: '组装过程符合要求，参数正常'
  },
  {
    id: 3,
    inspection_date: '2023-06-03 11:20',
    inspector: '王工',
    type: '特殊检验',
    sample_size: 30,
    pass_count: 28,
    conclusion: '合格',
    remarks: '经过高温测试，性能稳定'
  },
  {
    id: 4,
    inspection_date: '2023-06-05 16:00',
    inspector: '赵工',
    type: '终检',
    sample_size: 200,
    pass_count: 196,
    conclusion: '合格',
    remarks: '最终检验合格，可以出厂'
  }
])

// 模拟的相关批次
const relatedBatches = ref([
  {
    batch_id: 'B20230010',
    material_name: '电子元件A型',
    created_date: '2023-05-25',
    defect_rate: 0.01,
    status: 'passed',
    risk_level: 'low'
  },
  {
    batch_id: 'B20230012',
    material_name: '电子元件A型',
    created_date: '2023-05-27',
    defect_rate: 0.015,
    status: 'passed',
    risk_level: 'low'
  },
  {
    batch_id: 'B20230020',
    material_name: '电子元件A型',
    created_date: '2023-06-10',
    defect_rate: 0.025,
    status: 'processing',
    risk_level: 'medium'
  }
])

// 获取合格率
function getPassRate(record) {
  if (!record.sample_size) return 0
  return (record.pass_count / record.sample_size * 100).toFixed(2)
}

// 获取合格率颜色
function getPassRateColor(rate) {
  if (rate >= 95) return '#67C23A'
  if (rate >= 90) return '#E6A23C'
  return '#F56C6C'
}

// 获取缺陷率颜色
function getDefectRateColor(rate) {
  if (rate > 0.02) return '#F56C6C'
  if (rate > 0.01) return '#E6A23C'
  return '#67C23A'
}

// 获取状态标签类型
function getStatusTagType(status) {
  switch (status) {
    case 'pending': return 'info'
    case 'processing': return 'warning'
    case 'passed': return 'success'
    case 'rejected': return 'danger'
    case 'used': return 'primary'
    default: return 'info'
  }
}

// 获取状态文本
function getStatusText(status) {
  switch (status) {
    case 'pending': return '待检验'
    case 'processing': return '检验中'
    case 'passed': return '已通过'
    case 'rejected': return '已拒绝'
    case 'used': return '已使用'
    default: return '未知'
  }
}

// 获取风险标签类型
function getRiskTagType(level) {
  switch (level) {
    case 'high': return 'danger'
    case 'medium': return 'warning'
    case 'low': return 'success'
    default: return 'info'
  }
}

// 获取风险等级文本
function getRiskLevelText(level) {
  switch (level) {
    case 'high': return '高风险'
    case 'medium': return '中等风险'
    case 'low': return '低风险'
    default: return '未知'
  }
}

// 获取风险进度条颜色
function getRiskProgressColor(score) {
  if (score >= 75) return '#F56C6C' // 高风险 - 红色
  if (score >= 45) return '#E6A23C' // 中风险 - 橙色
  return '#67C23A' // 低风险 - 绿色
}

// 获取检验类型颜色
function getInspectionTypeColor(type) {
  switch (type) {
    case '入厂检验': return 'primary'
    case '首件检验': return 'success'
    case '过程检验': return 'warning'
    case '终检': return 'danger'
    case '特殊检验': return 'info'
    default: return 'info'
  }
}

// 初始化缺陷类型分布图表
function initDefectChart() {
  if (!defectChartRef.value) return
  
  if (defectChart) {
    defectChart.dispose()
  }
  
  defectChart = echarts.init(defectChartRef.value)
  
  const option = {
    title: {
      text: '缺陷类型分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    series: [
      {
        name: '缺陷类型',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 12, name: '外观缺陷' },
          { value: 8, name: '尺寸不良' },
          { value: 5, name: '性能异常' },
          { value: 3, name: '材质问题' },
          { value: 2, name: '其他缺陷' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  defectChart.setOption(option)
}

// 初始化趋势分析图表
function initTrendChart() {
  if (!trendChartRef.value) return
  
  if (trendChart) {
    trendChart.dispose()
  }
  
  trendChart = echarts.init(trendChartRef.value)
  
  // 生成过去30天的日期数组
  const dates = []
  const defectRates = []
  const passRates = []
  
  const today = new Date()
  for (let i = 30; i >= 0; i--) {
    const date = new Date()
    date.setDate(today.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
    
    // 生成随机数据
    const baseDefectRate = batchData.value.defect_rate || 0.02
    const defectRate = baseDefectRate + (Math.random() - 0.5) * 0.01
    defectRates.push((defectRate * 100).toFixed(2))
    
    const passRate = 100 - (defectRate * 100)
    passRates.push(passRate.toFixed(2))
  }
  
  const option = {
    title: {
      text: '质量趋势分析',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['合格率', '缺陷率'],
      bottom: '0%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: dates,
        axisLabel: {
          rotate: 45,
          interval: 5
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '合格率 (%)',
        min: 90,
        max: 100
      },
      {
        type: 'value',
        name: '缺陷率 (%)',
        min: 0,
        max: 5
      }
    ],
    series: [
      {
        name: '合格率',
        type: 'line',
        smooth: true,
        yAxisIndex: 0,
        data: passRates,
        itemStyle: {
          color: '#67C23A'
        }
      },
      {
        name: '缺陷率',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: defectRates,
        itemStyle: {
          color: '#F56C6C'
        }
      }
    ]
  }
  
  trendChart.setOption(option)
}

// 模拟加载批次数据
function loadBatchData() {
  loading.value = true
  
  // 模拟异步请求
  setTimeout(() => {
    // 生成模拟数据
    batchData.value = {
      batch_id: batchId.value,
      material_code: 'M10010001',
      material_name: '电子元件A型',
      category_id: 1,
      category_name: '电子元件',
      supplier_id: 2,
      supplier_name: '京东方科技集团',
      quantity: 1000,
      created_date: '2023-06-01',
      production_date: '2023-05-30',
      defect_rate: 0.015,
      status: 'passed',
      risk_level: 'low',
      risk_score: 35,
      notes: '用于手机摄像头模组的电子元件'
    }
    
    loading.value = false
    
    // 初始化图表
    nextTick(() => {
      initDefectChart()
      initTrendChart()
    })
  }, 1000)
}

// 查看检验详情
function viewInspectionDetail(record) {
  ElMessage({
    message: `查看检验记录：${record.inspection_date}`,
    type: 'info'
  })
}

// 添加检验记录
function addInspectionRecord() {
  inspectionForm.value = {
    inspection_date: new Date().toISOString().slice(0, 16).replace('T', ' '),
    inspector: '',
    type: '入厂检验',
    sample_size: 100,
    pass_count: 98,
    conclusion: '合格',
    remarks: ''
  }
  
  inspectionDialogVisible.value = true
}

// 提交检验表单
function submitInspectionForm() {
  ElMessage({
    message: '检验记录添加成功',
    type: 'success'
  })
  
  // 添加到检验记录列表
  inspectionRecords.value.unshift({
    id: Date.now(),
    ...inspectionForm.value
  })
  
  inspectionDialogVisible.value = false
}

// 编辑批次
function editBatch() {
  ElMessage({
    message: '批次编辑功能开发中',
    type: 'info'
  })
}

// 导出数据
function exportData() {
  ElMessage({
    message: '数据导出功能开发中',
    type: 'info'
  })
}

// 导航到相关批次
function navigateToBatch(id) {
  router.push(`/batch/${id}`)
}

// 返回上一页
function goBack() {
  router.go(-1)
}

// 更新图表大小
function updateChartSize() {
  if (defectChart) {
    defectChart.resize()
  }
  if (trendChart) {
    trendChart.resize()
  }
}

// 组件挂载时初始化
onMounted(() => {
  loadBatchData()
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', updateChartSize)
})

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', updateChartSize)
  
  if (defectChart) {
    defectChart.dispose()
  }
  
  if (trendChart) {
    trendChart.dispose()
  }
})
</script>

<style scoped>
.batch-detail-container {
  padding: 20px;
}

.loading-container,
.error-container {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.batch-content {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2,
.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.data-row {
  margin-top: 20px;
}

.risk-detail-score {
  margin-top: 10px;
  width: 100%;
}

.defect-chart,
.trend-chart {
  height: 300px;
}

@media (max-width: 768px) {
  .defect-chart,
  .trend-chart {
    height: 250px;
  }
}
</style> 
 
 