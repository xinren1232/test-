/**
 * 开源工具配置文件
 * 统一管理所有开源技术和工具的配置
 */

// 图表库配置
export const CHART_CONFIG = {
  // ECharts 配置 (已安装)
  echarts: {
    enabled: true,
    version: '^5.6.0',
    themes: ['light', 'dark', 'vintage', 'westeros', 'essos', 'wonderland'],
    defaultTheme: 'light',
    features: {
      animation: true,
      brush: true,
      dataZoom: true,
      toolbox: true,
      legend: true,
      tooltip: true
    }
  },

  // Chart.js 配置 (已安装 ✅)
  chartjs: {
    enabled: true, // 依赖冲突已解决
    version: '^4.5.0',
    plugins: ['chartjs-adapter-date-fns', 'vue-chartjs'],
    defaultOptions: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: { mode: 'index', intersect: false }
      }
    }
  },

  // D3.js 配置 (已安装 ✅)
  d3: {
    enabled: true, // 依赖冲突已解决
    version: '^7.9.0',
    modules: ['d3-selection', 'd3-scale', 'd3-axis', 'd3-shape'],
    customVisualizations: true
  },

  // Plotly.js 配置 (已安装 ✅)
  plotly: {
    enabled: true, // 依赖冲突已解决
    version: '^3.0.1',
    features: ['3d', 'statistical', 'financial', 'maps'],
    config: {
      displayModeBar: true,
      responsive: true
    }
  }
}

// AI工具配置
export const AI_CONFIG = {
  // 开源AI服务配置
  openSourceAI: {
    enabled: true,
    intentRecognition: {
      threshold: 0.6,
      maxResults: 5,
      fallbackEnabled: true
    },
    entityExtraction: {
      patterns: {
        factory: /(深圳|重庆|南昌|宜宾)工厂?/g,
        supplier: /供应商[：:]?\s*([^\s，,。.]+)/g,
        material: /物料[：:]?\s*([^\s，,。.]+)/g,
        status: /(正常|异常|风险|冻结|待检)/g,
        chartType: /(柱状图|饼图|折线图|散点图|仪表盘)/g,
        timeRange: /(今天|昨天|本周|本月|最近\d+天)/g
      }
    },
    responseGeneration: {
      maxCharts: 3,
      maxTableRows: 100,
      includeInsights: true,
      includeRecommendations: true
    }
  },

  // LangChain 配置 (概念实现)
  langchain: {
    enabled: false, // 概念性实现，未实际安装
    version: '^0.0.200',
    features: {
      chains: true,
      agents: true,
      memory: true,
      vectorStores: false // 暂不需要向量存储
    },
    models: {
      llm: 'deepseek-chat',
      embeddings: false // 暂不使用嵌入模型
    }
  },

  // LangGraph 配置 (概念实现)
  langgraph: {
    enabled: false, // 概念性实现，未实际安装
    version: '^0.0.40',
    workflow: {
      maxSteps: 10,
      timeout: 30000,
      retryAttempts: 3
    }
  }
}

// 数据处理工具配置
export const DATA_PROCESSING_CONFIG = {
  // 自实现的数据处理工具 (替代 Lodash)
  customDataProcessor: {
    enabled: true,
    features: {
      groupBy: true,
      orderBy: true,
      sumBy: true,
      countBy: true,
      uniqBy: true,
      cloneDeep: true,
      chainable: true
    },
    performance: {
      batchSize: 1000,
      maxMemoryUsage: '100MB'
    }
  },

  // 自实现的时间处理工具 (替代 Day.js)
  customTimeProcessor: {
    enabled: true,
    formats: [
      'YYYY-MM-DD',
      'YYYY-MM-DD HH:mm:ss',
      'MM-DD HH:mm',
      'HH:mm:ss'
    ],
    timezone: 'Asia/Shanghai',
    locale: 'zh-CN'
  },

  // Lodash 配置 (已安装 ✅)
  lodash: {
    enabled: true, // 依赖冲突已解决
    version: '^4.17.21',
    modules: ['groupBy', 'orderBy', 'sumBy', 'countBy', 'uniqBy', 'cloneDeep']
  },

  // Day.js 配置 (已安装 ✅)
  dayjs: {
    enabled: true, // 依赖冲突已解决
    version: '^1.11.13',
    plugins: ['relativeTime', 'duration', 'timezone', 'utc']
  }
}

// UI组件库配置
export const UI_CONFIG = {
  // Element Plus 配置 (已安装)
  elementPlus: {
    enabled: true,
    version: '^2.6.0',
    components: [
      'ElButton', 'ElCard', 'ElTable', 'ElTag', 'ElIcon',
      'ElEmpty', 'ElButtonGroup', 'ElText', 'ElTooltip'
    ],
    theme: {
      primaryColor: '#1890ff',
      borderRadius: '6px',
      fontSize: '14px'
    }
  },

  // Ant Design Vue 配置 (已安装 ✅)
  antDesignVue: {
    enabled: true, // 依赖冲突已解决
    version: '^4.2.6',
    components: ['Table', 'Card', 'Button', 'Tag', 'Icon', 'Empty'],
    theme: {
      token: {
        colorPrimary: '#1890ff',
        borderRadius: 6
      }
    }
  }
}

// 网络搜索配置
export const SEARCH_CONFIG = {
  // 网络搜索服务
  webSearch: {
    enabled: true,
    engines: {
      google: {
        enabled: true,
        apiKey: process.env.GOOGLE_SEARCH_API_KEY,
        searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID
      },
      baidu: {
        enabled: true,
        apiKey: process.env.BAIDU_SEARCH_API_KEY
      },
      bing: {
        enabled: false,
        apiKey: process.env.BING_SEARCH_API_KEY
      }
    },
    defaultEngine: 'google',
    maxResults: 10,
    timeout: 5000
  }
}

// 性能监控配置
export const PERFORMANCE_CONFIG = {
  monitoring: {
    enabled: true,
    metrics: {
      responseTime: true,
      memoryUsage: true,
      errorRate: true,
      throughput: true
    },
    thresholds: {
      responseTime: 2000, // 2秒
      memoryUsage: 100 * 1024 * 1024, // 100MB
      errorRate: 0.05 // 5%
    }
  },
  
  optimization: {
    caching: {
      enabled: true,
      ttl: 300000, // 5分钟
      maxSize: 100
    },
    debouncing: {
      enabled: true,
      delay: 300 // 300ms
    },
    lazyLoading: {
      enabled: true,
      threshold: 100 // 100px
    }
  }
}

// 开发环境配置
export const DEVELOPMENT_CONFIG = {
  debugging: {
    enabled: process.env.NODE_ENV === 'development',
    logLevel: 'debug',
    showPerformanceMetrics: true,
    mockData: true
  },
  
  testing: {
    enabled: true,
    coverage: {
      threshold: 80,
      reports: ['text', 'html', 'lcov']
    },
    e2e: {
      enabled: false,
      browser: 'chromium'
    }
  }
}

// 导出统一配置
export const OPENSOURCE_CONFIG = {
  charts: CHART_CONFIG,
  ai: AI_CONFIG,
  dataProcessing: DATA_PROCESSING_CONFIG,
  ui: UI_CONFIG,
  search: SEARCH_CONFIG,
  performance: PERFORMANCE_CONFIG,
  development: DEVELOPMENT_CONFIG
}

// 获取启用的工具列表
export function getEnabledTools() {
  const enabledTools = []
  
  // 检查图表工具
  Object.entries(CHART_CONFIG).forEach(([name, config]) => {
    if (config.enabled) {
      enabledTools.push({ category: 'charts', name, version: config.version })
    }
  })
  
  // 检查AI工具
  Object.entries(AI_CONFIG).forEach(([name, config]) => {
    if (config.enabled) {
      enabledTools.push({ category: 'ai', name, version: config.version || 'custom' })
    }
  })
  
  // 检查数据处理工具
  Object.entries(DATA_PROCESSING_CONFIG).forEach(([name, config]) => {
    if (config.enabled) {
      enabledTools.push({ category: 'dataProcessing', name, version: config.version || 'custom' })
    }
  })
  
  // 检查UI工具
  Object.entries(UI_CONFIG).forEach(([name, config]) => {
    if (config.enabled) {
      enabledTools.push({ category: 'ui', name, version: config.version })
    }
  })
  
  return enabledTools
}

// 获取工具状态报告
export function getToolsStatusReport() {
  const enabledTools = getEnabledTools()
  const totalTools = Object.keys(CHART_CONFIG).length + 
                    Object.keys(AI_CONFIG).length + 
                    Object.keys(DATA_PROCESSING_CONFIG).length + 
                    Object.keys(UI_CONFIG).length
  
  return {
    summary: {
      total: totalTools,
      enabled: enabledTools.length,
      disabled: totalTools - enabledTools.length,
      enabledPercentage: Math.round((enabledTools.length / totalTools) * 100)
    },
    categories: {
      charts: enabledTools.filter(t => t.category === 'charts').length,
      ai: enabledTools.filter(t => t.category === 'ai').length,
      dataProcessing: enabledTools.filter(t => t.category === 'dataProcessing').length,
      ui: enabledTools.filter(t => t.category === 'ui').length
    },
    enabledTools,
    issues: {
      dependencyConflicts: [
        'Chart.js - husky/axios 冲突',
        'D3.js - 依赖解析问题',
        'Plotly.js - 包大小问题',
        'Ant Design Vue - 版本冲突',
        'Lodash - 安装失败',
        'Day.js - 依赖问题'
      ],
      workarounds: [
        '使用自实现的数据处理工具替代 Lodash',
        '使用自实现的时间处理工具替代 Day.js',
        '优先使用 ECharts 进行图表渲染',
        '使用 Element Plus 作为主要UI组件库'
      ]
    }
  }
}

export default OPENSOURCE_CONFIG
