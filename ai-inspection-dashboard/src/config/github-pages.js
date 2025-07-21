// GitHub Pages 部署配置
export const GITHUB_PAGES_CONFIG = {
  // 是否为GitHub Pages环境
  isGitHubPages: window.location.hostname.includes('github.io'),
  
  // API基础URL配置
  getApiBaseUrl() {
    if (this.isGitHubPages) {
      // GitHub Pages环境使用Vercel Functions或其他serverless服务
      return 'https://iqe-api.vercel.app/api'
    }
    // 本地开发环境
    return 'http://localhost:3001/api'
  },
  
  // 静态数据配置（GitHub Pages环境下的备用方案）
  useStaticData: true,
  
  // 模拟API响应数据
  mockData: {
    // 统计数据
    statistics: {
      totalInspections: 1250,
      passRate: 95.8,
      defectRate: 4.2,
      avgProcessingTime: 2.3
    },
    
    // 规则数据
    rules: [
      {
        id: 1,
        name: "物料供应商不良率分析",
        category: "质量分析",
        description: "分析特定物料供应商的不良率情况",
        triggerWords: ["物料", "供应商", "不良率"],
        enabled: true
      },
      {
        id: 2,
        name: "生产线效率监控",
        category: "生产监控",
        description: "监控生产线的效率和产能情况",
        triggerWords: ["生产线", "效率", "产能"],
        enabled: true
      }
    ],
    
    // 检验数据
    inspections: [
      {
        id: 1,
        materialCode: "M001",
        supplierName: "供应商A",
        inspectionDate: "2024-01-15",
        result: "合格",
        defectRate: 2.1
      },
      {
        id: 2,
        materialCode: "M002", 
        supplierName: "供应商B",
        inspectionDate: "2024-01-16",
        result: "不合格",
        defectRate: 8.5
      }
    ]
  }
}

// API请求封装
export class GitHubPagesAPI {
  constructor() {
    this.baseURL = GITHUB_PAGES_CONFIG.getApiBaseUrl()
    this.useStatic = GITHUB_PAGES_CONFIG.isGitHubPages && GITHUB_PAGES_CONFIG.useStaticData
  }
  
  async get(endpoint) {
    if (this.useStatic) {
      return this.getMockData(endpoint)
    }
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`)
      return await response.json()
    } catch (error) {
      console.warn('API请求失败，使用模拟数据:', error)
      return this.getMockData(endpoint)
    }
  }
  
  getMockData(endpoint) {
    const { mockData } = GITHUB_PAGES_CONFIG
    
    switch (endpoint) {
      case '/statistics':
        return { success: true, data: mockData.statistics }
      case '/rules':
        return { success: true, data: mockData.rules }
      case '/inspections':
        return { success: true, data: mockData.inspections }
      default:
        return { success: false, message: '未找到对应的模拟数据' }
    }
  }
  
  async post(endpoint, data) {
    if (this.useStatic) {
      console.log('GitHub Pages环境下的POST请求（模拟）:', endpoint, data)
      return { success: true, message: '操作成功（模拟）' }
    }
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      return await response.json()
    } catch (error) {
      console.warn('API POST请求失败:', error)
      return { success: false, message: '请求失败' }
    }
  }
}

export default GITHUB_PAGES_CONFIG
