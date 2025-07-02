/**
 * 智能问答引擎 - 基础规则模式
 */

import { dataService } from './dataService';

class IntelligentQAEngine {
  constructor() {
    this.rules = this.initializeRules();
  }

  /**
   * 初始化问答规则
   */
  initializeRules() {
    return [
      // 库存相关查询
      {
        keywords: ['库存', '仓库', '物料', '材料'],
        patterns: [/库存/, /仓库/, /物料/, /材料/],
        handler: this.handleInventoryQuery.bind(this)
      },
      // 质量相关查询
      {
        keywords: ['质量', '不良', '缺陷', '测试', '检验'],
        patterns: [/质量/, /不良/, /缺陷/, /测试/, /检验/],
        handler: this.handleQualityQuery.bind(this)
      },
      // 供应商相关查询
      {
        keywords: ['供应商', 'BOE', '京东方', '三星', '华星光电'],
        patterns: [/供应商/, /BOE/, /京东方/, /三星/, /华星光电/],
        handler: this.handleSupplierQuery.bind(this)
      },
      // 工厂相关查询
      {
        keywords: ['工厂', '深圳', '上海', '北京', '广州'],
        patterns: [/工厂/, /深圳/, /上海/, /北京/, /广州/],
        handler: this.handleFactoryQuery.bind(this)
      },
      // 生产相关查询
      {
        keywords: ['生产', '产线', '批次', '不良率'],
        patterns: [/生产/, /产线/, /批次/, /不良率/],
        handler: this.handleProductionQuery.bind(this)
      },
      // 图表相关查询
      {
        keywords: ['图表', '统计', '分析', '趋势', '对比'],
        patterns: [/图表/, /统计/, /分析/, /趋势/, /对比/],
        handler: this.handleChartQuery.bind(this)
      }
    ];
  }

  /**
   * 处理用户查询
   */
  processQuery(query) {
    console.log('🔍 智能问答引擎处理查询:', query);
    
    try {
      // 查找匹配的规则
      const matchedRule = this.findMatchingRule(query);
      
      if (matchedRule) {
        console.log('✅ 找到匹配规则:', matchedRule.keywords);
        return matchedRule.handler(query);
      } else {
        console.log('❓ 未找到匹配规则，返回默认响应');
        return this.getDefaultResponse(query);
      }
    } catch (error) {
      console.error('❌ 问答引擎处理失败:', error);
      return {
        type: 'text',
        reply: '抱歉，处理您的问题时发生了错误。请稍后再试。'
      };
    }
  }

  /**
   * 查找匹配的规则
   */
  findMatchingRule(query) {
    for (const rule of this.rules) {
      // 检查关键词匹配
      if (rule.keywords.some(keyword => query.includes(keyword))) {
        return rule;
      }
      // 检查正则表达式匹配
      if (rule.patterns.some(pattern => pattern.test(query))) {
        return rule;
      }
    }
    return null;
  }

  /**
   * 处理库存查询
   */
  handleInventoryQuery(query) {
    const inventoryData = dataService.getInventoryData();
    
    if (query.includes('风险') || query.includes('异常')) {
      const riskItems = inventoryData.filter(item => item.status === '风险');
      return {
        type: 'text',
        reply: `当前共有 ${riskItems.length} 个风险库存项目：\n${riskItems.map(item => 
          `• ${item.materialName} (${item.factory}) - 数量: ${item.quantity}, 供应商: ${item.supplier}`
        ).join('\n')}`
      };
    }
    
    if (query.includes('深圳')) {
      const shenzhenItems = inventoryData.filter(item => item.factory === '深圳工厂');
      return {
        type: 'text',
        reply: `深圳工厂库存概况：\n总计 ${shenzhenItems.length} 个物料项目\n${shenzhenItems.slice(0, 5).map(item => 
          `• ${item.materialName} - 数量: ${item.quantity}, 状态: ${item.status}`
        ).join('\n')}${shenzhenItems.length > 5 ? '\n...' : ''}`
      };
    }
    
    return {
      type: 'text',
      reply: `库存总览：\n总计 ${inventoryData.length} 个库存项目\n正常: ${inventoryData.filter(i => i.status === '正常').length} 个\n风险: ${inventoryData.filter(i => i.status === '风险').length} 个\n冻结: ${inventoryData.filter(i => i.status === '冻结').length} 个`
    };
  }

  /**
   * 处理质量查询
   */
  handleQualityQuery(query) {
    const testData = dataService.getTestData();
    const productionData = dataService.getProductionData();
    
    const failedTests = testData.filter(test => test.testResult === 'FAIL');
    const totalDefectRate = productionData.reduce((sum, item) => sum + (item.defectRate || 0), 0) / productionData.length;
    
    return {
      type: 'text',
      reply: `质量状况分析：\n测试失败率: ${((failedTests.length / testData.length) * 100).toFixed(1)}%\n平均不良率: ${totalDefectRate.toFixed(2)}%\n主要问题: ${failedTests.slice(0, 3).map(test => test.defectPhenomena).join(', ')}`
    };
  }

  /**
   * 处理供应商查询
   */
  handleSupplierQuery(query) {
    const inventoryData = dataService.getInventoryData();
    const productionData = dataService.getProductionData();
    
    if (query.includes('BOE') || query.includes('京东方')) {
      const boeItems = inventoryData.filter(item => item.supplier === 'BOE');
      const boeProduction = productionData.filter(item => item.supplier === 'BOE');
      const avgDefectRate = boeProduction.reduce((sum, item) => sum + (item.defectRate || 0), 0) / boeProduction.length;
      
      return {
        type: 'text',
        reply: `BOE供应商分析：\n库存物料: ${boeItems.length} 个\n平均不良率: ${avgDefectRate.toFixed(2)}%\n主要物料: ${boeItems.slice(0, 3).map(item => item.materialName).join(', ')}`
      };
    }
    
    // 供应商总览
    const suppliers = [...new Set(inventoryData.map(item => item.supplier))];
    return {
      type: 'text',
      reply: `供应商概况：\n总计 ${suppliers.length} 个供应商\n主要供应商: ${suppliers.slice(0, 5).join(', ')}`
    };
  }

  /**
   * 处理工厂查询
   */
  handleFactoryQuery(query) {
    const inventoryData = dataService.getInventoryData();
    const productionData = dataService.getProductionData();
    
    if (query.includes('深圳')) {
      const shenzhenInventory = inventoryData.filter(item => item.factory === '深圳工厂');
      const shenzhenProduction = productionData.filter(item => item.factory === '深圳工厂');
      const avgDefectRate = shenzhenProduction.reduce((sum, item) => sum + (item.defectRate || 0), 0) / shenzhenProduction.length;
      
      return {
        type: 'text',
        reply: `深圳工厂状况：\n库存项目: ${shenzhenInventory.length} 个\n生产记录: ${shenzhenProduction.length} 条\n平均不良率: ${avgDefectRate.toFixed(2)}%\n风险库存: ${shenzhenInventory.filter(i => i.status === '风险').length} 个`
      };
    }
    
    const factories = [...new Set(inventoryData.map(item => item.factory))];
    return {
      type: 'text',
      reply: `工厂概况：\n总计 ${factories.length} 个工厂\n工厂列表: ${factories.join(', ')}`
    };
  }

  /**
   * 处理生产查询
   */
  handleProductionQuery(query) {
    const productionData = dataService.getProductionData();
    
    const totalDefectRate = productionData.reduce((sum, item) => sum + (item.defectRate || 0), 0) / productionData.length;
    const highDefectItems = productionData.filter(item => (item.defectRate || 0) > 5);
    
    return {
      type: 'text',
      reply: `生产状况分析：\n总生产记录: ${productionData.length} 条\n平均不良率: ${totalDefectRate.toFixed(2)}%\n高不良率项目: ${highDefectItems.length} 个\n主要缺陷: ${highDefectItems.slice(0, 3).map(item => item.defectPhenomena).join(', ')}`
    };
  }

  /**
   * 处理图表查询
   */
  handleChartQuery(query) {
    const inventoryData = dataService.getInventoryData();
    
    // 生成状态分布图表
    const statusCounts = inventoryData.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
    
    return {
      type: 'chart',
      chartData: {
        chartType: 'pie',
        chartTitle: '库存状态分布',
        chartDescription: '各状态库存项目数量分布',
        chartData: {
          labels: Object.keys(statusCounts),
          datasets: [{
            data: Object.values(statusCounts),
            backgroundColor: ['#67c23a', '#e6a23c', '#f56c6c']
          }]
        }
      },
      reply: `库存状态分布图表已生成。正常: ${statusCounts['正常'] || 0}个，风险: ${statusCounts['风险'] || 0}个，冻结: ${statusCounts['冻结'] || 0}个。`
    };
  }

  /**
   * 默认响应
   */
  getDefaultResponse(query) {
    return {
      type: 'text',
      reply: `我理解您询问的是"${query}"。目前我可以帮您查询：\n• 库存状况和风险分析\n• 质量问题和测试结果\n• 供应商表现评估\n• 工厂生产状况\n• 数据统计图表\n\n请尝试更具体的问题，或开启AI增强模式获得更深入的分析。`
    };
  }
}

// 创建智能问答引擎实例
export const intelligentQAEngine = new IntelligentQAEngine();

// 导出默认实例
export default intelligentQAEngine;
