// IQE智能质量工程系统 - 数据存储模块
import { ref, reactive, computed } from 'vue'
import { createPinia, defineStore } from 'pinia'

// 导入优化后的数据集
import samplesData from '../data/samplesData.js'

// 创建 Pinia 实例
export const pinia = createPinia()

// 定义IQE数据存储
export const useIQEStore = defineStore('iqe', () => {
  // 物料主数据
  const materialMasterData = ref(samplesData.materialMasterData || [])
  
  // 供应商数据
  const supplierData = ref(samplesData.supplierData || [])
  
  // 工厂数据
  const factoryData = ref(samplesData.factoryData || [])
  
  // 库存物料批次数据
  const materialBatchData = ref(samplesData.materialBatchData || [])
  
  // 实验室检测数据
  const labTestData = ref(samplesData.labTestData || [])
  
  // 产线异常记录
  const productionAnomalies = ref(samplesData.productionAnomalies || [])
  
  // 质量预测数据
  const qualityPredictionData = ref(samplesData.qualityPredictionData || [])
  
  // 告警数据
  const alertsData = ref(samplesData.alertsData || [])
  
  // 批次对比数据
  const batchComparisonData = ref(samplesData.batchComparisonData || {})
  
  // 风险分析数据
  const riskAnalysisData = ref(samplesData.riskAnalysisData || {})
  
  // 统计卡片数据
  const statCardsData = ref(samplesData.statCardsData || {})
  
  // 趋势分析数据
  const trendAnalysisData = ref(samplesData.trendAnalysisData || {})
  
  // 系统状态
  const systemState = reactive({
    lastUpdateTime: new Date().toLocaleString(),
    isRefreshing: false,
    currentSection: 'monitoring',
    filters: {
      materialCode: '',
      supplier: '',
      dateRange: [],
      result: '',
      project: ''
    }
  })

  // 计算属性 - 高风险物料批次
  const highRiskBatches = computed(() => {
    return materialBatchData.value.filter(batch => batch.isHighRisk)
  })
  
  // 计算属性 - 按类型分组的告警
  const alertsByType = computed(() => {
    const result = {}
    alertsData.value.forEach(alert => {
      if (!result[alert.type]) {
        result[alert.type] = []
      }
      result[alert.type].push(alert)
    })
    return result
  })
  
  // 计算属性 - 按级别分组的告警
  const alertsByLevel = computed(() => {
    const result = {}
    alertsData.value.forEach(alert => {
      if (!result[alert.level]) {
        result[alert.level] = []
      }
      result[alert.level].push(alert)
    })
    return result
  })
  
  // 计算属性 - 按供应商分组的不良批次
  const defectiveBySupplier = computed(() => {
    const result = {}
    materialBatchData.value
      .filter(batch => batch.result === 'NG')
      .forEach(batch => {
        if (!result[batch.supplier]) {
          result[batch.supplier] = []
        }
        result[batch.supplier].push(batch)
      })
    return result
  })

  // 方法 - 根据条件筛选物料批次数据
  function filterMaterialBatches(filters = {}) {
    return materialBatchData.value.filter(batch => {
      let match = true
      
      if (filters.materialCode && !batch.materialCode.includes(filters.materialCode)) {
        match = false
      }
      
      if (filters.materialName && !batch.materialName.includes(filters.materialName)) {
        match = false
      }
      
      if (filters.supplier && batch.supplier !== filters.supplier) {
        match = false
      }
      
      if (filters.result && batch.result !== filters.result) {
        match = false
      }
      
      if (filters.isHighRisk !== undefined && batch.isHighRisk !== filters.isHighRisk) {
        match = false
      }
      
      if (filters.dateRange && filters.dateRange.length === 2) {
        const batchDate = new Date(batch.inspectionDate)
        const startDate = new Date(filters.dateRange[0])
        const endDate = new Date(filters.dateRange[1])
        endDate.setHours(23, 59, 59, 999)
        
        if (batchDate < startDate || batchDate > endDate) {
          match = false
        }
      }
      
      return match
    })
  }
  
  // 方法 - 根据条件筛选实验室数据
  function filterLabTests(filters = {}) {
    return labTestData.value.filter(test => {
      let match = true
      
      if (filters.materialCode && !test.materialCode.includes(filters.materialCode)) {
        match = false
      }
      
      if (filters.materialName && !test.materialName.includes(filters.materialName)) {
        match = false
      }
      
      if (filters.supplier && test.supplier !== filters.supplier) {
        match = false
      }
      
      if (filters.result && test.result !== filters.result) {
        match = false
      }
      
      if (filters.project && test.project !== filters.project) {
        match = false
      }
      
      if (filters.dateRange && filters.dateRange.length === 2) {
        const testDate = new Date(test.testDate)
        const startDate = new Date(filters.dateRange[0])
        const endDate = new Date(filters.dateRange[1])
        endDate.setHours(23, 59, 59, 999)
        
        if (testDate < startDate || testDate > endDate) {
          match = false
        }
      }
      
      return match
    })
  }
  
  // 方法 - 根据物料代码查询物料主数据
  function getMaterialByCode(materialCode) {
    return materialMasterData.value.find(material => material.materialCode === materialCode)
  }
  
  // 方法 - 根据供应商名称查询供应商数据
  function getSupplierByName(supplierName) {
    return supplierData.value.find(supplier => supplier.name === supplierName)
  }
  
  // 方法 - 获取指定物料的风险分析数据
  function getMaterialRiskAnalysis(materialCode) {
    return riskAnalysisData.value[materialCode] || null
  }
  
  // 方法 - 获取指定物料的批次对比数据
  function getBatchComparisonData(materialCode) {
    return batchComparisonData.value[materialCode] || null
  }
  
  // 方法 - 刷新数据 (模拟后端API调用)
  async function refreshData() {
    systemState.isRefreshing = true
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 更新最后更新时间
    systemState.lastUpdateTime = new Date().toLocaleString()
    systemState.isRefreshing = false
    
    return {
      success: true,
      message: '数据已更新'
    }
  }
  
  // 方法 - 获取趋势分析数据
  function getTrendAnalysisData(period = 'weekly') {
    return trendAnalysisData.value[period] || null
  }
  
  // 方法 - 获取统计卡片数据
  function getStatCardsData(section = 'monitoring') {
    return statCardsData.value[section] || []
  }
  
  // 方法 - 分析物料质量趋势
  function analyzeMaterialQualityTrend(materialCode, period = 6) {
    // 查找所有相关的检测数据
    const relatedTests = labTestData.value.filter(test => test.materialCode === materialCode)
    
    // 按日期排序
    relatedTests.sort((a, b) => new Date(a.testDate) - new Date(b.testDate))
    
    // 提取最近几个月的数据
    const recentTests = relatedTests.slice(-period)
    
    // 计算不良率趋势
    const trend = recentTests.map(test => {
      const defectRate = test.defectRate
      let numericRate = 0
      
      // 提取百分比数值
      if (typeof defectRate === 'string') {
        const match = defectRate.match(/(\d+(?:\.\d+)?)%/)
        if (match) {
          numericRate = parseFloat(match[1])
        } else {
          // 处理形如 "2/3（66.7%）" 的格式
          const fractionMatch = defectRate.match(/(\d+)\/(\d+)(?:\（|\()(\d+(?:\.\d+)?)%/)
          if (fractionMatch) {
            numericRate = parseFloat(fractionMatch[3])
          }
        }
      } else if (typeof defectRate === 'number') {
        numericRate = defectRate
      }
      
      return {
        date: test.testDate,
        defectRate: numericRate,
        result: test.result
      }
    })
    
    // 计算趋势斜率
    let slope = 0
    if (trend.length >= 2) {
      const firstRate = trend[0].defectRate
      const lastRate = trend[trend.length - 1].defectRate
      slope = (lastRate - firstRate) / (trend.length - 1)
    }
    
    // 判断趋势方向
    let direction = 'stable'
    if (slope > 1) direction = 'rapidly_increasing'
    else if (slope > 0.1) direction = 'increasing'
    else if (slope < -1) direction = 'rapidly_decreasing'
    else if (slope < -0.1) direction = 'decreasing'
    
    return {
      materialCode,
      trend,
      direction,
      slope,
      average: trend.reduce((sum, item) => sum + item.defectRate, 0) / trend.length || 0
    }
  }

  return {
    // 状态数据
    materialMasterData,
    supplierData,
    factoryData,
    materialBatchData,
    labTestData,
    productionAnomalies,
    qualityPredictionData,
    alertsData,
    batchComparisonData,
    riskAnalysisData,
    statCardsData,
    trendAnalysisData,
    systemState,
    
    // 计算属性
    highRiskBatches,
    alertsByType,
    alertsByLevel,
    defectiveBySupplier,
    
    // 方法
    filterMaterialBatches,
    filterLabTests,
    getMaterialByCode,
    getSupplierByName,
    getMaterialRiskAnalysis,
    getBatchComparisonData,
    refreshData,
    getTrendAnalysisData,
    getStatCardsData,
    analyzeMaterialQualityTrend
  }
})

export default pinia 