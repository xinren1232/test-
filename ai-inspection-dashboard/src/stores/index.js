// IQE智能质量工程系统 - 数据存储模块
import { ref, reactive, computed } from 'vue'
import { createPinia, defineStore } from 'pinia'

// 导入优化后的数据集
import samplesData from '../data/samplesData.js'

// 创建 Pinia 实例
export const pinia = createPinia()

// AI模型存储
export const useAIModelStore = defineStore('aiModel', () => {
  const activeModel = ref(null)
  const availableModels = ref([])
  const loading = ref(false)
  
  // 设置活跃模型
  function setActiveModel(model) {
    activeModel.value = model
  }
  
  // 设置可用模型列表
  function setAvailableModels(models) {
    availableModels.value = models
  }
  
  return {
    activeModel,
    availableModels,
    loading,
    setActiveModel,
    setAvailableModels
  }
})

// Chat消息存储
export const useChatStore = defineStore('chat', () => {
  const messages = ref([])
  const loading = ref(false)
  
  // 添加消息
  function addMessage(message) {
    messages.value.push(message)
  }
  
  // 清空消息
  function clearMessages() {
    messages.value = []
  }
  
  return {
    messages,
    loading,
    addMessage,
    clearMessages
  }
})

// 上下文存储 - 保存对话相关的上下文
export const useContextStore = defineStore('context', () => {
  const context = reactive({
    currentUser: null,
    currentProject: null,
    activeDepartment: null,
    activeRole: null,
    preferences: {}
  })
  
  // 设置用户
  function setUser(user) {
    context.currentUser = user
  }
  
  // 设置项目
  function setProject(project) {
    context.currentProject = project
  }
  
  // 设置部门
  function setDepartment(department) {
    context.activeDepartment = department
  }
  
  // 设置角色
  function setRole(role) {
    context.activeRole = role
  }
  
  // 设置偏好
  function setPreference(key, value) {
    context.preferences[key] = value
  }
  
  return {
    context,
    setUser,
    setProject,
    setDepartment,
    setRole,
    setPreference
  }
})

// 定义IQE数据存储
export const useIQEStore = defineStore('iqe', () => {
  // 物料数据
  const materials = ref(samplesData.materials || [])
  
  // 批次数据
  const batches = ref(samplesData.batches || [])
  
  // 检验结果
  const inspectionResults = ref(samplesData.inspectionResults || [])
  
  // 实验室数据
  const labTestData = ref(samplesData.labTestData || [])
  
  // 趋势分析数据
  const trendAnalysisData = ref(samplesData.trendAnalysisData || {})
  
  // 批次比较数据
  const batchComparisonData = ref(samplesData.batchComparisonData || {})
  
  // 风险分析数据
  const riskAnalysisData = ref(samplesData.riskAnalysisData || {})
  
  // 统计卡片数据
  const statCardsData = ref(samplesData.statCardsData || {})
  
  // 质量预测数据
  const qualityPredictionData = ref(samplesData.qualityPredictionData || [])
  
  // 加载状态
  const loading = ref(false)
  
  // 添加物料
  function addMaterial(material) {
    materials.value.push(material)
  }
  
  // 添加批次
  function addBatch(batch) {
    batches.value.push(batch)
  }
  
  // 添加检验结果
  function addInspectionResult(result) {
    inspectionResults.value.push(result)
  }
  
  // 获取物料
  function getMaterial(id) {
    return materials.value.find(m => m.id === id)
  }
  
  // 获取批次
  function getBatch(id) {
    return batches.value.find(b => b.id === id)
  }
  
  // 获取检验结果
  function getInspectionResult(id) {
    return inspectionResults.value.find(r => r.id === id)
  }

  // 根据条件筛选实验室数据
  function filterLabTests(filters = {}) {
    return labTestData.value.filter(test => {
      let match = true;
      
      if (filters.materialCode && !test.materialCode.includes(filters.materialCode)) {
        match = false;
      }
      
      if (filters.materialName && !test.materialName.includes(filters.materialName)) {
        match = false;
      }
      
      if (filters.supplier && test.supplier !== filters.supplier) {
        match = false;
      }
      
      if (filters.result && test.result !== filters.result) {
        match = false;
      }
      
      if (filters.project && test.project !== filters.project) {
        match = false;
      }
      
      if (filters.dateRange && filters.dateRange.length === 2) {
        const testDate = new Date(test.testDate);
        const startDate = new Date(filters.dateRange[0]);
        const endDate = new Date(filters.dateRange[1]);
        endDate.setHours(23, 59, 59, 999);
        
        if (testDate < startDate || testDate > endDate) {
          match = false;
        }
      }
      
      return match;
    });
  }

  // 刷新数据 (模拟后端API调用)
  async function refreshData() {
    // 这里可以添加实际的API调用逻辑
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      message: '数据已更新'
    };
  }
  
  // 获取统计卡片数据
  function getStatCardsData(section = 'monitoring') {
    return statCardsData.value[section] || [];
  }

  return {
    materials,
    batches,
    inspectionResults,
    labTestData,
    trendAnalysisData,
    batchComparisonData,
    riskAnalysisData,
    statCardsData,
    qualityPredictionData,
    loading,
    addMaterial,
    addBatch,
    addInspectionResult,
    getMaterial,
    getBatch,
    getInspectionResult,
    filterLabTests,
    refreshData,
    getStatCardsData
  }
})

// 导出所有store作为对象
const stores = {
  useIQEStore,
  useAIModelStore,
  useChatStore,
  useContextStore,
  pinia
}

export default stores 