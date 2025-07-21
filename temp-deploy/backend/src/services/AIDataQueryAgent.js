/**
 * AI数据查询代理
 * 实现AI自主调用现有问答规则的MCP机制
 */

import { processRealQuery } from './realDataAssistantService.js';
import ResponseFormatterService from './ResponseFormatterService.js';

class AIDataQueryAgent {
  constructor() {
    this.availableTools = this.initializeTools();
    this.queryHistory = [];
  }

  /**
   * 初始化可用的查询工具
   */
  initializeTools() {
    return {
      // 基础库存查询工具
      queryInventoryByFactory: {
        name: "按工厂查询库存",
        description: "查询指定工厂的库存物料信息",
        parameters: {
          factory: { type: "string", description: "工厂名称，如：深圳工厂、上海工厂" }
        },
        examples: ["查询深圳工厂的库存", "上海工厂库存情况"]
      },
      
      queryInventoryBySupplier: {
        name: "按供应商查询库存",
        description: "查询指定供应商的库存物料信息",
        parameters: {
          supplier: { type: "string", description: "供应商名称，如：BOE、聚龙、富士康" }
        },
        examples: ["查询BOE供应商的库存", "聚龙供应商物料"]
      },
      
      queryInventoryByMaterial: {
        name: "按物料查询库存",
        description: "查询指定物料的库存信息",
        parameters: {
          materialName: { type: "string", description: "物料名称，如：OLED显示屏、电池盖" }
        },
        examples: ["查询OLED显示屏的库存", "电池盖库存情况"]
      },
      
      queryRiskInventory: {
        name: "查询风险库存",
        description: "查询状态为风险的库存物料",
        parameters: {},
        examples: ["目前有哪些风险库存？", "风险状态的物料"]
      },
      
      queryFrozenInventory: {
        name: "查询冻结库存", 
        description: "查询状态为冻结的库存物料",
        parameters: {},
        examples: ["查询冻结状态的库存", "冻结物料有哪些"]
      },

      // 基础生产查询工具
      queryProductionByFactory: {
        name: "按工厂查询生产",
        description: "查询指定工厂的生产记录",
        parameters: {
          factory: { type: "string", description: "工厂名称" }
        },
        examples: ["深圳工厂的生产情况", "上海工厂生产记录"]
      },
      
      queryProductionByProject: {
        name: "按项目查询生产",
        description: "查询指定项目的生产记录",
        parameters: {
          projectId: { type: "string", description: "项目ID，如：PRJ_001" }
        },
        examples: ["项目PRJ_001的生产记录", "PRJ_002项目生产情况"]
      },
      
      queryHighDefectRate: {
        name: "查询高不良率生产",
        description: "查询不良率较高的生产记录",
        parameters: {},
        examples: ["有哪些高不良率的生产记录？", "不良率超标的批次"]
      },

      // 基础测试查询工具
      queryFailedTests: {
        name: "查询测试失败记录",
        description: "查询测试结果为FAIL的检验记录",
        parameters: {},
        examples: ["有哪些测试失败的记录？", "测试不合格的批次"]
      },
      
      queryTestsByProject: {
        name: "按项目查询测试",
        description: "查询指定项目的测试记录",
        parameters: {
          projectId: { type: "string", description: "项目ID" }
        },
        examples: ["项目PRJ_001的测试记录", "PRJ_002项目测试情况"]
      },

      // 汇总分析工具
      getFactorySummary: {
        name: "工厂数据汇总",
        description: "获取所有工厂的数据汇总统计",
        parameters: {},
        examples: ["工厂数据汇总", "工厂统计报告"]
      },
      
      getSupplierSummary: {
        name: "供应商数据汇总",
        description: "获取所有供应商的数据汇总统计", 
        parameters: {},
        examples: ["供应商汇总统计", "供应商表现分析"]
      },
      
      getOverallSummary: {
        name: "系统数据总览",
        description: "获取系统整体数据概况",
        parameters: {},
        examples: ["系统数据总览", "整体数据统计"]
      },

      // 全链路追溯工具
      traceBatch: {
        name: "批次全链路追溯",
        description: "追溯批次在库存-生产-测试的完整链路",
        parameters: {
          batchNo: { type: "string", description: "批次号，如：TK240601" }
        },
        examples: ["批次TK240601的全链路追溯", "追溯批次SS240602"]
      }
    };
  }

  /**
   * 获取工具列表（供AI选择）
   */
  getAvailableTools() {
    return Object.entries(this.availableTools).map(([key, tool]) => ({
      name: key,
      description: tool.description,
      parameters: tool.parameters,
      examples: tool.examples
    }));
  }

  /**
   * 执行指定的查询工具
   */
  async executeQuery(toolName, parameters = {}) {
    try {
      console.log(`🔧 执行查询工具: ${toolName}`, parameters);
      
      // 记录查询历史
      this.queryHistory.push({
        tool: toolName,
        parameters,
        timestamp: new Date().toISOString()
      });

      // 根据工具名称构建查询语句
      const queryText = this.buildQueryText(toolName, parameters);
      
      // 调用现有的问答规则处理
      const result = await processRealQuery(queryText);
      
      // 解析结果数据（从HTML中提取结构化数据）
      const structuredData = this.extractStructuredData(result, toolName);
      
      return {
        success: true,
        tool: toolName,
        parameters,
        queryText,
        rawResult: result,
        structuredData,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`查询工具执行失败: ${toolName}`, error);
      return {
        success: false,
        tool: toolName,
        parameters,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 根据工具名称和参数构建查询语句
   */
  buildQueryText(toolName, parameters) {
    const tool = this.availableTools[toolName];
    if (!tool) {
      throw new Error(`未知的查询工具: ${toolName}`);
    }

    // 根据工具类型构建查询语句
    switch (toolName) {
      case 'queryInventoryByFactory':
        return `查询${parameters.factory}的库存`;
      case 'queryInventoryBySupplier':
        return `查询${parameters.supplier}供应商的库存`;
      case 'queryInventoryByMaterial':
        return `查询${parameters.materialName}的库存`;
      case 'queryRiskInventory':
        return '目前有哪些风险库存？';
      case 'queryFrozenInventory':
        return '查询冻结状态的库存';
      case 'queryProductionByFactory':
        return `${parameters.factory}的生产情况`;
      case 'queryProductionByProject':
        return `项目${parameters.projectId}的生产记录`;
      case 'queryHighDefectRate':
        return '有哪些高不良率的生产记录？';
      case 'queryFailedTests':
        return '有哪些测试失败的记录？';
      case 'queryTestsByProject':
        return `项目${parameters.projectId}的测试记录`;
      case 'getFactorySummary':
        return '工厂数据汇总';
      case 'getSupplierSummary':
        return '供应商汇总统计';
      case 'getOverallSummary':
        return '系统数据总览';
      case 'traceBatch':
        return `批次${parameters.batchNo}的全链路追溯`;
      default:
        return tool.examples[0]; // 使用第一个示例作为默认查询
    }
  }

  /**
   * 从HTML结果中提取结构化数据
   */
  extractStructuredData(htmlResult, toolName) {
    try {
      // 提取关键信息
      const data = {
        type: this.getDataType(toolName),
        summary: this.extractSummary(htmlResult),
        items: this.extractItems(htmlResult),
        statistics: this.extractStatistics(htmlResult)
      };

      return data;
    } catch (error) {
      console.error('提取结构化数据失败:', error);
      return {
        type: 'unknown',
        rawHtml: htmlResult,
        extractionError: error.message
      };
    }
  }

  /**
   * 获取数据类型
   */
  getDataType(toolName) {
    if (toolName.includes('Inventory')) return 'inventory';
    if (toolName.includes('Production')) return 'production';
    if (toolName.includes('Test')) return 'inspection';
    if (toolName.includes('Summary')) return 'summary';
    if (toolName.includes('trace')) return 'trace';
    return 'unknown';
  }

  /**
   * 提取摘要信息
   */
  extractSummary(htmlResult) {
    const summaryMatch = htmlResult.match(/<span class="total-badge">([^<]+)<\/span>/);
    return summaryMatch ? summaryMatch[1] : null;
  }

  /**
   * 提取条目信息
   */
  extractItems(htmlResult) {
    const items = [];
    const itemMatches = htmlResult.match(/<div class="item-card[^>]*>[\s\S]*?<\/div>/g);
    
    if (itemMatches) {
      for (const match of itemMatches) {
        const item = this.parseItemCard(match);
        if (item) items.push(item);
      }
    }
    
    return items;
  }

  /**
   * 解析单个条目卡片
   */
  parseItemCard(cardHtml) {
    try {
      const nameMatch = cardHtml.match(/<span class="material-name">([^<]+)<\/span>/);
      const valueMatches = cardHtml.match(/<span class="value">([^<]+)<\/span>/g);
      
      const item = {
        name: nameMatch ? nameMatch[1] : null,
        values: []
      };
      
      if (valueMatches) {
        item.values = valueMatches.map(match => 
          match.replace(/<[^>]*>/g, '').trim()
        );
      }
      
      return item;
    } catch (error) {
      return null;
    }
  }

  /**
   * 提取统计信息
   */
  extractStatistics(htmlResult) {
    const stats = {};
    const statMatches = htmlResult.match(/<span class="stat-value">([^<]+)<\/span>/g);
    
    if (statMatches) {
      statMatches.forEach((match, index) => {
        const value = match.replace(/<[^>]*>/g, '').trim();
        stats[`stat_${index}`] = value;
      });
    }
    
    return stats;
  }

  /**
   * 批量执行查询计划
   */
  async executeQueryPlan(queryPlan) {
    const results = {};
    
    for (const step of queryPlan.steps) {
      try {
        console.log(`执行查询步骤: ${step.id}`);
        results[step.id] = await this.executeQuery(step.tool, step.parameters);
      } catch (error) {
        console.error(`查询步骤失败: ${step.id}`, error);
        results[step.id] = {
          success: false,
          error: error.message,
          step: step
        };
      }
    }
    
    return results;
  }

  /**
   * 获取查询历史
   */
  getQueryHistory() {
    return this.queryHistory;
  }

  /**
   * 清空查询历史
   */
  clearQueryHistory() {
    this.queryHistory = [];
  }
}

export default AIDataQueryAgent;
