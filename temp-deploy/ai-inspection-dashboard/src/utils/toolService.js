/**
 * 工具调用服务
 * 为AI提供各种实用工具和功能
 */

import { webSearchService } from './webSearchService.js';

class ToolService {
  constructor() {
    this.tools = {
      // 搜索工具
      web_search: {
        name: 'web_search',
        description: '在互联网上搜索信息',
        parameters: {
          query: { type: 'string', required: true, description: '搜索查询' },
          engine: { type: 'string', required: false, description: '搜索引擎' }
        }
      },
      
      // 实时信息工具
      get_time: {
        name: 'get_time',
        description: '获取当前时间',
        parameters: {}
      },
      
      // 计算工具
      calculate: {
        name: 'calculate',
        description: '执行数学计算',
        parameters: {
          expression: { type: 'string', required: true, description: '数学表达式' }
        }
      },
      
      // 数据分析工具
      analyze_data: {
        name: 'analyze_data',
        description: '分析质量管理数据',
        parameters: {
          data_type: { type: 'string', required: true, description: '数据类型' },
          filters: { type: 'object', required: false, description: '过滤条件' }
        }
      },
      
      // 格式转换工具
      format_data: {
        name: 'format_data',
        description: '格式化数据输出',
        parameters: {
          data: { type: 'object', required: true, description: '要格式化的数据' },
          format: { type: 'string', required: true, description: '输出格式' }
        }
      },

      // 图表生成工具
      create_chart: {
        name: 'create_chart',
        description: '生成数据可视化图表',
        parameters: {
          data: { type: 'array', required: true, description: '图表数据' },
          chart_type: { type: 'string', required: true, description: '图表类型' },
          title: { type: 'string', required: false, description: '图表标题' }
        }
      },

      // 统计分析工具
      statistical_analysis: {
        name: 'statistical_analysis',
        description: '执行统计分析',
        parameters: {
          data: { type: 'array', required: true, description: '数据数组' },
          analysis_type: { type: 'string', required: true, description: '分析类型' }
        }
      },

      // 数据导出工具
      export_data: {
        name: 'export_data',
        description: '导出数据为各种格式',
        parameters: {
          data: { type: 'object', required: true, description: '要导出的数据' },
          format: { type: 'string', required: true, description: '导出格式' }
        }
      },

      // 质量报告生成工具
      generate_report: {
        name: 'generate_report',
        description: '生成质量分析报告',
        parameters: {
          data_type: { type: 'string', required: true, description: '数据类型' },
          template: { type: 'string', required: false, description: '报告模板' }
        }
      },

      // 趋势分析工具
      trend_analysis: {
        name: 'trend_analysis',
        description: '分析数据趋势',
        parameters: {
          data: { type: 'array', required: true, description: '时间序列数据' },
          period: { type: 'string', required: false, description: '分析周期' }
        }
      }
    };
  }

  /**
   * 获取所有可用工具
   */
  getAvailableTools() {
    return Object.values(this.tools);
  }

  /**
   * 执行工具调用
   */
  async executeTool(toolName, parameters = {}) {
    try {
      console.log(`🔧 执行工具: ${toolName}`, parameters);

      if (!this.tools[toolName]) {
        throw new Error(`未知工具: ${toolName}`);
      }

      // 验证参数
      this.validateParameters(toolName, parameters);

      // 执行对应的工具
      switch (toolName) {
        case 'web_search':
          return await this.executeWebSearch(parameters);
        case 'get_time':
          return await this.executeGetTime(parameters);
        case 'calculate':
          return await this.executeCalculate(parameters);
        case 'analyze_data':
          return await this.executeAnalyzeData(parameters);
        case 'format_data':
          return await this.executeFormatData(parameters);
        case 'create_chart':
          return await this.executeCreateChart(parameters);
        case 'statistical_analysis':
          return await this.executeStatisticalAnalysis(parameters);
        case 'export_data':
          return await this.executeExportData(parameters);
        case 'generate_report':
          return await this.executeGenerateReport(parameters);
        case 'trend_analysis':
          return await this.executeTrendAnalysis(parameters);
        default:
          throw new Error(`工具 ${toolName} 未实现`);
      }
    } catch (error) {
      console.error(`❌ 工具执行失败 (${toolName}):`, error);
      throw error;
    }
  }

  /**
   * 验证工具参数
   */
  validateParameters(toolName, parameters) {
    const tool = this.tools[toolName];
    
    for (const [paramName, paramConfig] of Object.entries(tool.parameters)) {
      if (paramConfig.required && !(paramName in parameters)) {
        throw new Error(`缺少必需参数: ${paramName}`);
      }
    }
  }

  /**
   * 执行网络搜索
   */
  async executeWebSearch(parameters) {
    const { query, engine = 'duckduckgo' } = parameters;
    
    try {
      const results = await webSearchService.search(query, { engine });
      
      return {
        tool: 'web_search',
        success: true,
        data: results,
        summary: `找到 ${results.results.length} 个关于"${query}"的搜索结果`
      };
    } catch (error) {
      return {
        tool: 'web_search',
        success: false,
        error: error.message,
        summary: `搜索"${query}"时出现错误`
      };
    }
  }

  /**
   * 获取当前时间
   */
  async executeGetTime(parameters) {
    try {
      const timeInfo = webSearchService.getCurrentTime();
      
      return {
        tool: 'get_time',
        success: true,
        data: timeInfo.data,
        summary: `当前时间: ${timeInfo.data.local_time}`
      };
    } catch (error) {
      return {
        tool: 'get_time',
        success: false,
        error: error.message,
        summary: '获取时间信息失败'
      };
    }
  }

  /**
   * 执行数学计算
   */
  async executeCalculate(parameters) {
    const { expression } = parameters;
    
    try {
      // 安全的数学表达式计算
      const result = this.safeEvaluate(expression);
      
      return {
        tool: 'calculate',
        success: true,
        data: {
          expression: expression,
          result: result
        },
        summary: `${expression} = ${result}`
      };
    } catch (error) {
      return {
        tool: 'calculate',
        success: false,
        error: error.message,
        summary: `计算"${expression}"时出现错误`
      };
    }
  }

  /**
   * 安全的数学表达式计算
   */
  safeEvaluate(expression) {
    // 只允许数字、基本运算符和括号
    const safeExpression = expression.replace(/[^0-9+\-*/().\s]/g, '');
    
    if (safeExpression !== expression) {
      throw new Error('表达式包含不安全的字符');
    }
    
    try {
      // 使用Function构造器进行安全计算
      const result = Function(`"use strict"; return (${safeExpression})`)();
      
      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('计算结果无效');
      }
      
      return result;
    } catch (error) {
      throw new Error('表达式计算失败');
    }
  }

  /**
   * 分析质量管理数据
   */
  async executeAnalyzeData(parameters) {
    const { data_type, filters = {} } = parameters;
    
    try {
      // 从localStorage获取数据
      const data = this.getLocalStorageData(data_type);
      
      if (!data || data.length === 0) {
        return {
          tool: 'analyze_data',
          success: false,
          error: '未找到数据',
          summary: `未找到${data_type}类型的数据`
        };
      }

      // 应用过滤器
      const filteredData = this.applyFilters(data, filters);
      
      // 执行分析
      const analysis = this.performDataAnalysis(filteredData, data_type);
      
      return {
        tool: 'analyze_data',
        success: true,
        data: {
          data_type: data_type,
          total_records: data.length,
          filtered_records: filteredData.length,
          analysis: analysis
        },
        summary: `分析了 ${filteredData.length} 条${data_type}数据`
      };
    } catch (error) {
      return {
        tool: 'analyze_data',
        success: false,
        error: error.message,
        summary: `分析${data_type}数据时出现错误`
      };
    }
  }

  /**
   * 从localStorage获取数据
   */
  getLocalStorageData(dataType) {
    const dataKeys = {
      'inventory': 'unified_inventory_data',
      'production': 'unified_factory_data',
      'testing': 'unified_lab_data',
      'batch': 'unified_batch_data'
    };
    
    const key = dataKeys[dataType];
    if (!key) {
      throw new Error(`不支持的数据类型: ${dataType}`);
    }
    
    const dataStr = localStorage.getItem(key);
    return dataStr ? JSON.parse(dataStr) : [];
  }

  /**
   * 应用数据过滤器
   */
  applyFilters(data, filters) {
    return data.filter(item => {
      for (const [key, value] of Object.entries(filters)) {
        if (item[key] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * 执行数据分析
   */
  performDataAnalysis(data, dataType) {
    const analysis = {
      total_count: data.length,
      summary: {}
    };

    if (data.length === 0) {
      return analysis;
    }

    switch (dataType) {
      case 'inventory':
        analysis.summary = this.analyzeInventoryData(data);
        break;
      case 'production':
        analysis.summary = this.analyzeProductionData(data);
        break;
      case 'testing':
        analysis.summary = this.analyzeTestingData(data);
        break;
      default:
        analysis.summary = { message: '基础统计分析完成' };
    }

    return analysis;
  }

  /**
   * 分析库存数据
   */
  analyzeInventoryData(data) {
    const statusCount = {};
    const factoryCount = {};
    let totalQuantity = 0;

    data.forEach(item => {
      // 统计状态
      statusCount[item.status] = (statusCount[item.status] || 0) + 1;
      
      // 统计工厂
      factoryCount[item.factory] = (factoryCount[item.factory] || 0) + 1;
      
      // 累计数量
      totalQuantity += parseInt(item.quantity) || 0;
    });

    return {
      status_distribution: statusCount,
      factory_distribution: factoryCount,
      total_quantity: totalQuantity,
      average_quantity: Math.round(totalQuantity / data.length)
    };
  }

  /**
   * 分析生产数据
   */
  analyzeProductionData(data) {
    let totalDefectRate = 0;
    const defectTypes = {};

    data.forEach(item => {
      totalDefectRate += parseFloat(item.defectRate) || 0;
      
      if (item.defectPhenomena) {
        defectTypes[item.defectPhenomena] = (defectTypes[item.defectPhenomena] || 0) + 1;
      }
    });

    return {
      average_defect_rate: (totalDefectRate / data.length).toFixed(2) + '%',
      defect_types: defectTypes,
      total_batches: data.length
    };
  }

  /**
   * 分析测试数据
   */
  analyzeTestingData(data) {
    const resultCount = {};
    const defectTypes = {};

    data.forEach(item => {
      resultCount[item.testResult] = (resultCount[item.testResult] || 0) + 1;
      
      if (item.defectPhenomena) {
        defectTypes[item.defectPhenomena] = (defectTypes[item.defectPhenomena] || 0) + 1;
      }
    });

    const passRate = ((resultCount['PASS'] || 0) / data.length * 100).toFixed(1);

    return {
      test_results: resultCount,
      pass_rate: passRate + '%',
      defect_types: defectTypes
    };
  }

  /**
   * 格式化数据输出
   */
  async executeFormatData(parameters) {
    const { data, format } = parameters;
    
    try {
      let formattedData;
      
      switch (format) {
        case 'table':
          formattedData = this.formatAsTable(data);
          break;
        case 'list':
          formattedData = this.formatAsList(data);
          break;
        case 'summary':
          formattedData = this.formatAsSummary(data);
          break;
        default:
          formattedData = JSON.stringify(data, null, 2);
      }
      
      return {
        tool: 'format_data',
        success: true,
        data: {
          original_data: data,
          formatted_data: formattedData,
          format: format
        },
        summary: `数据已格式化为${format}格式`
      };
    } catch (error) {
      return {
        tool: 'format_data',
        success: false,
        error: error.message,
        summary: '数据格式化失败'
      };
    }
  }

  /**
   * 格式化为表格
   */
  formatAsTable(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return '无数据';
    }

    const headers = Object.keys(data[0]);
    let table = '| ' + headers.join(' | ') + ' |\n';
    table += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
    
    data.forEach(row => {
      table += '| ' + headers.map(header => row[header] || '').join(' | ') + ' |\n';
    });
    
    return table;
  }

  /**
   * 格式化为列表
   */
  formatAsList(data) {
    if (Array.isArray(data)) {
      return data.map((item, index) => `${index + 1}. ${JSON.stringify(item)}`).join('\n');
    } else {
      return Object.entries(data).map(([key, value]) => `• ${key}: ${value}`).join('\n');
    }
  }

  /**
   * 格式化为摘要
   */
  formatAsSummary(data) {
    if (Array.isArray(data)) {
      return `数据摘要：共 ${data.length} 条记录`;
    } else if (typeof data === 'object') {
      const keys = Object.keys(data);
      return `对象摘要：包含 ${keys.length} 个字段 (${keys.join(', ')})`;
    } else {
      return `数据类型：${typeof data}，值：${data}`;
    }
  }

  async executeFormatData(parameters) {
    const { data, format } = parameters;

    switch (format) {
      case 'table':
        return {
          type: 'table',
          data: Array.isArray(data) ? data : [data]
        };
      case 'json':
        return {
          type: 'json',
          data: JSON.stringify(data, null, 2)
        };
      default:
        return {
          type: 'text',
          data: String(data)
        };
    }
  }

  async executeCreateChart(parameters) {
    const { data, chart_type, title } = parameters;

    return {
      type: 'chart',
      chart_type,
      title: title || '数据图表',
      data,
      config: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: title || '数据图表' }
        }
      }
    };
  }

  async executeStatisticalAnalysis(parameters) {
    const { data, analysis_type } = parameters;

    if (!Array.isArray(data) || data.length === 0) {
      return { type: 'error', message: '数据为空或格式不正确' };
    }

    const numericData = data.filter(d => typeof d === 'number');

    switch (analysis_type) {
      case 'basic':
        const sum = numericData.reduce((a, b) => a + b, 0);
        const avg = sum / numericData.length;
        const max = Math.max(...numericData);
        const min = Math.min(...numericData);

        return {
          type: 'analysis',
          analysis_type: 'basic',
          results: {
            count: numericData.length,
            sum: sum.toFixed(2),
            average: avg.toFixed(2),
            maximum: max,
            minimum: min,
            range: (max - min).toFixed(2)
          }
        };

      case 'distribution':
        const sorted = [...numericData].sort((a, b) => a - b);
        const median = sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];

        return {
          type: 'analysis',
          analysis_type: 'distribution',
          results: {
            median: median.toFixed(2),
            q1: sorted[Math.floor(sorted.length * 0.25)],
            q3: sorted[Math.floor(sorted.length * 0.75)],
            distribution: this.calculateDistribution(numericData)
          }
        };

      default:
        return { type: 'error', message: '不支持的分析类型' };
    }
  }

  calculateDistribution(data) {
    const bins = 5;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binSize = (max - min) / bins;
    const distribution = new Array(bins).fill(0);

    data.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1);
      distribution[binIndex]++;
    });

    return distribution.map((count, index) => ({
      range: `${(min + index * binSize).toFixed(1)}-${(min + (index + 1) * binSize).toFixed(1)}`,
      count
    }));
  }

  async executeExportData(parameters) {
    const { data, format } = parameters;

    switch (format) {
      case 'csv':
        return {
          type: 'export',
          format: 'csv',
          filename: `export_${Date.now()}.csv`,
          content: this.convertToCSV(data)
        };
      case 'excel':
        return {
          type: 'export',
          format: 'excel',
          filename: `export_${Date.now()}.xlsx`,
          message: 'Excel导出功能需要后端支持'
        };
      default:
        return {
          type: 'export',
          format: 'json',
          filename: `export_${Date.now()}.json`,
          content: JSON.stringify(data, null, 2)
        };
    }
  }

  convertToCSV(data) {
    if (!Array.isArray(data) || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header] || '').join(','))
    ].join('\n');

    return csvContent;
  }

  async executeGenerateReport(parameters) {
    const { data_type, template } = parameters;

    return {
      type: 'report',
      data_type,
      template: template || 'standard',
      sections: [
        { title: '数据概览', content: '基础统计信息' },
        { title: '质量分析', content: '质量指标分析' },
        { title: '趋势分析', content: '时间趋势分析' },
        { title: '建议措施', content: '改进建议' }
      ],
      generated_at: new Date().toISOString()
    };
  }

  async executeTrendAnalysis(parameters) {
    const { data, period } = parameters;

    if (!Array.isArray(data) || data.length === 0) {
      return { type: 'error', message: '数据为空或格式不正确' };
    }

    return {
      type: 'trend',
      period: period || 'daily',
      analysis: {
        trend_direction: this.calculateTrendDirection(data),
        volatility: this.calculateVolatility(data),
        seasonal_patterns: this.detectSeasonalPatterns(data),
        forecast: this.generateSimpleForecast(data)
      }
    };
  }

  calculateTrendDirection(data) {
    if (data.length < 2) return 'insufficient_data';

    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0) / secondHalf.length;

    if (secondAvg > firstAvg * 1.05) return 'increasing';
    if (secondAvg < firstAvg * 0.95) return 'decreasing';
    return 'stable';
  }

  calculateVolatility(data) {
    const numericData = data.filter(d => typeof d === 'number');
    if (numericData.length < 2) return 0;

    const avg = numericData.reduce((a, b) => a + b, 0) / numericData.length;
    const variance = numericData.reduce((sum, value) => sum + Math.pow(value - avg, 2), 0) / numericData.length;

    return Math.sqrt(variance);
  }

  detectSeasonalPatterns(data) {
    // 简化的季节性检测
    return {
      detected: false,
      pattern: 'none',
      confidence: 0
    };
  }

  generateSimpleForecast(data) {
    const numericData = data.filter(d => typeof d === 'number');
    if (numericData.length < 3) return [];

    const recent = numericData.slice(-3);
    const trend = (recent[recent.length - 1] - recent[0]) / (recent.length - 1);
    const lastValue = recent[recent.length - 1];

    return [
      { period: 'next_1', value: (lastValue + trend).toFixed(2) },
      { period: 'next_2', value: (lastValue + trend * 2).toFixed(2) },
      { period: 'next_3', value: (lastValue + trend * 3).toFixed(2) }
    ];
  }
}

// 创建工具服务实例
export const toolService = new ToolService();

// 导出默认实例
export default toolService;
