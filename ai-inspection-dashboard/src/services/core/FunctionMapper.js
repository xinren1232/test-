/**
 * 功能映射器 - 负责连接核心服务和业务模块功能
 */

import { FunctionRegistry } from './FunctionRegistry';
import { MaterialAIService } from '../ai/MaterialAIService';
import router from '../../router';
import { useIQEStore, useChatStore, useAIModelStore, useContextStore } from '../../stores';

/**
 * 功能映射器类
 * 将业务功能注册到FunctionRegistry
 */
export class FunctionMapper {
  /**
   * 初始化并注册所有功能
   */
  static init() {
    this.registerInventoryFunctions();
    this.registerLaboratoryFunctions();
    this.registerProductionFunctions();
    this.registerQualityFunctions();
    this.registerVisualizationFunctions();
    this.registerNavigationFunctions();
    this.registerGeneralFunctions();
    
    console.log('FunctionMapper: 所有功能注册完成');
  }
  
  /**
   * 注册库存管理功能
   */
  static registerInventoryFunctions() {
    // 冻结批次
    FunctionRegistry.registerFunction(
      'inventory',
      'freezeBatch',
      async ({ entities }) => {
        const { batchId, reason = '质量问题' } = entities;
        
        if (!batchId) {
          return {
            content: '请提供需要冻结的批次号',
            suggestedActions: [
              { label: '查看可冻结批次', type: 'send', message: '查看可冻结批次列表' }
            ]
          };
        }
        
        try {
          const result = await MaterialAIService.freezeBatch(batchId, reason);
          return {
            content: result.message || `批次 ${batchId} 已成功冻结`,
            data: result
          };
        } catch (error) {
          return {
            content: `批次 ${batchId} 冻结失败: ${error.message}`,
            error: true,
            suggestedActions: [
              { label: '重试', type: 'send', message: `重新冻结批次 ${batchId}` },
              { label: '查看批次详情', type: 'send', message: `查看批次 ${batchId} 详情` }
            ]
          };
        }
      },
      {
        description: '冻结指定批次，防止其被使用',
        parameters: [
          { name: 'batchId', type: 'string', required: true, description: '批次ID' },
          { name: 'reason', type: 'string', required: false, description: '冻结原因' }
        ],
        permissions: ['inventory:write'],
        examples: ['冻结批次 B001-001', '将批次 B002-003 冻结'],
        tags: ['inventory', 'batch', 'freeze']
      }
    );

    // 解冻批次
    FunctionRegistry.registerFunction(
      'inventory',
      'unfreezeBatch',
      async ({ entities }) => {
        const { batchId, reason = '质量确认合格' } = entities;
        
        if (!batchId) {
          return {
            content: '请提供需要解冻的批次号',
            suggestedActions: [
              { label: '查看已冻结批次', type: 'send', message: '查看已冻结批次列表' }
            ]
          };
        }
        
        try {
          const result = await MaterialAIService.unfreezeBatch(batchId, reason);
          return {
            content: result.message || `批次 ${batchId} 已成功解冻`,
            data: result
          };
        } catch (error) {
          return {
            content: `批次 ${batchId} 解冻失败: ${error.message}`,
            error: true,
            suggestedActions: [
              { label: '重试', type: 'send', message: `重新解冻批次 ${batchId}` },
              { label: '查看批次详情', type: 'send', message: `查看批次 ${batchId} 详情` }
            ]
          };
        }
      },
      {
        description: '解冻指定批次，允许其重新被使用',
        parameters: [
          { name: 'batchId', type: 'string', required: true, description: '批次ID' },
          { name: 'reason', type: 'string', required: false, description: '解冻原因' }
        ],
        permissions: ['inventory:write'],
        examples: ['解冻批次 B001-001', '将批次 B002-003 解冻'],
        tags: ['inventory', 'batch', 'unfreeze']
      }
    );

    // 检查批次状态
    FunctionRegistry.registerFunction(
      'inventory',
      'checkBatchStatus',
      async ({ entities }) => {
        const { batchId } = entities;
        
        if (!batchId) {
          return {
            content: '请提供需要查询的批次号',
            suggestedActions: [
              { label: '查看最近批次', type: 'send', message: '查看最近批次' }
            ]
          };
        }
        
        try {
          const result = await MaterialAIService.getBatchStatus(batchId);
          
          return {
            content: `批次 ${batchId} 的状态信息：\n\n` +
                    `状态：${this.formatBatchStatus(result.status)}\n` +
                    `创建时间：${result.creationTime}\n` +
                    `最后更新：${result.lastUpdateTime}\n` +
                    `负责人：${result.owner}\n` +
                    (result.freezeReason ? `冻结原因：${result.freezeReason}` : ''),
            data: result,
            suggestedActions: this.getBatchStatusActions(result)
          };
        } catch (error) {
          return {
            content: `查询批次 ${batchId} 状态失败: ${error.message}`,
            error: true,
            suggestedActions: [
              { label: '重试', type: 'send', message: `重新查询批次 ${batchId} 状态` }
            ]
          };
        }
      },
      {
        description: '查询指定批次的状态信息',
        parameters: [
          { name: 'batchId', type: 'string', required: true, description: '批次ID' }
        ],
        permissions: ['inventory:read'],
        examples: ['查询批次 B001-001 状态', '批次 B002-003 的状态如何'],
        tags: ['inventory', 'batch', 'status']
      }
    );
  }
  
  /**
   * 格式化批次状态
   * @param {string} status 状态代码
   * @returns {string} 格式化的状态文本
   */
  static formatBatchStatus(status) {
    const statusMap = {
      'active': '正常',
      'frozen': '冻结',
      'consuming': '消耗中',
      'consumed': '已消耗完',
      'expired': '已过期',
      'returned': '已退回',
      'inspecting': '检验中'
    };
    
    return statusMap[status] || status;
  }
  
  /**
   * 获取批次状态相关操作
   * @param {Object} batchData 批次数据
   * @returns {Array} 操作列表
   */
  static getBatchStatusActions(batchData) {
    const actions = [
      { label: '查看批次详情', type: 'send', message: `查看批次 ${batchData.batchId} 详情` }
    ];
    
    if (batchData.status === 'frozen') {
      actions.push({ label: '解冻批次', type: 'send', message: `解冻批次 ${batchData.batchId}` });
    } else if (batchData.status === 'active') {
      actions.push({ label: '冻结批次', type: 'send', message: `冻结批次 ${batchData.batchId}` });
    }
    
    return actions;
  }
  
  /**
   * 注册实验室测试功能
   */
  static registerLaboratoryFunctions() {
    // 查询实验室数据
    FunctionRegistry.registerFunction(
      'laboratory',
      'queryLabData',
      async ({ entities }) => {
        const { materialCode, timeRange = '最近30天', testType } = entities;
        
        if (!materialCode) {
          return {
            content: '请提供需要查询的物料编码',
            suggestedActions: [
              { label: '查看常用物料', type: 'send', message: '查看最常用物料' }
            ]
          };
        }
        
        try {
          const result = await MaterialAIService.getLabTestData(materialCode, timeRange, testType);
          
          return {
            content: `物料 ${materialCode} 的实验室测试数据 (${timeRange})：\n\n${result.summary}`,
            data: result.data,
            visualData: result.visualData, // 用于图表显示的数据
            suggestedActions: [
              { label: '分析数据趋势', type: 'send', message: `分析物料 ${materialCode} 实验数据趋势` },
              { label: '生成数据图表', type: 'send', message: `显示 ${materialCode} ${testType || '所有'} 测试图表` },
              { label: '查看详细报告', type: 'navigate', module: 'navigation', feature: 'navigateTo', parameters: { targetPage: 'laboratory' } }
            ]
          };
        } catch (error) {
          return {
            content: `查询物料 ${materialCode} 实验数据失败: ${error.message}`,
            error: true,
            suggestedActions: [
              { label: '重试', type: 'send', message: `重新查询物料 ${materialCode} 实验数据` }
            ]
          };
        }
      },
      {
        description: '查询指定物料的实验室测试数据',
        parameters: [
          { name: 'materialCode', type: 'string', required: true, description: '物料编码' },
          { name: 'timeRange', type: 'string', required: false, description: '时间范围' },
          { name: 'testType', type: 'string', required: false, description: '测试类型' }
        ],
        permissions: ['laboratory:read'],
        examples: ['查询物料 M1001-001 实验数据', '物料 M2002-002 的实验室测试数据'],
        tags: ['laboratory', 'material', 'test']
      }
    );

    // 分析实验室数据趋势
    FunctionRegistry.registerFunction(
      'laboratory',
      'analyzeLabData',
      async ({ entities }) => {
        const { materialCode, timeRange = '最近90天', testType } = entities;
        
        if (!materialCode) {
          return {
            content: '请提供需要分析的物料编码',
            suggestedActions: [
              { label: '查看常用物料', type: 'send', message: '查看最常用物料' }
            ]
          };
        }
        
        try {
          const result = await MaterialAIService.analyzeLabDataTrends(materialCode, timeRange, testType);
          
          return {
            content: `物料 ${materialCode} 的实验数据趋势分析 (${timeRange})：\n\n${result.analysis}`,
            data: result.data,
            visualData: result.visualData, // 用于图表显示的数据
            suggestedActions: [
              { label: '生成趋势图表', type: 'send', message: `显示 ${materialCode} ${testType || '实验'} 趋势图` },
              { label: '预测未来趋势', type: 'send', message: `预测物料 ${materialCode} 未来质量趋势` },
              { label: '查看详细分析', type: 'navigate', module: 'navigation', feature: 'navigateTo', parameters: { targetPage: 'laboratory' } }
            ]
          };
        } catch (error) {
          return {
            content: `分析物料 ${materialCode} 实验数据趋势失败: ${error.message}`,
            error: true,
            suggestedActions: [
              { label: '重试', type: 'send', message: `重新分析物料 ${materialCode} 实验数据趋势` }
            ]
          };
        }
      },
      {
        description: '分析指定物料的实验数据趋势',
        parameters: [
          { name: 'materialCode', type: 'string', required: true, description: '物料编码' },
          { name: 'timeRange', type: 'string', required: false, description: '时间范围' },
          { name: 'testType', type: 'string', required: false, description: '测试类型' }
        ],
        permissions: ['laboratory:read'],
        examples: ['分析物料 M1001-001 实验数据趋势', '物料 M2002-002 的数据趋势分析'],
        tags: ['laboratory', 'material', 'analysis', 'trend']
      }
    );
  }
  
  /**
   * 注册生产线管理功能
   */
  static registerProductionFunctions() {
    // 分析产线异常
    FunctionRegistry.registerFunction(
      'production',
      'analyzeAnomaly',
      async ({ entities }) => {
        const { productionLine, timeRange = '最近24小时', anomalyType } = entities;
        
        if (!productionLine && !anomalyType) {
          return {
            content: '请提供需要分析的产线或异常类型',
            suggestedActions: [
              { label: '查看所有产线', type: 'send', message: '查看所有产线' },
              { label: '查看常见异常类型', type: 'send', message: '查看常见异常类型' }
            ]
          };
        }
        
        try {
          const result = await MaterialAIService.analyzeProductionAnomaly(
            productionLine, 
            timeRange, 
            anomalyType
          );
          
          return {
            content: `产线 ${productionLine || '全部'} 的异常分析 (${timeRange})：\n\n${result.analysis}`,
            data: result.data,
            visualData: result.visualData, // 用于图表显示的数据
            suggestedActions: [
              { label: '生成异常图表', type: 'send', message: `显示 ${productionLine || '产线'} 异常趋势图` },
              { label: '查看处理建议', type: 'send', message: `如何处理 ${productionLine} ${anomalyType || ''} 异常` },
              { label: '查看详细报告', type: 'navigate', module: 'navigation', feature: 'navigateTo', parameters: { targetPage: 'production' } }
            ]
          };
        } catch (error) {
          return {
            content: `分析产线 ${productionLine || '全部'} 异常失败: ${error.message}`,
            error: true,
            suggestedActions: [
              { label: '重试', type: 'send', message: `重新分析产线 ${productionLine || ''} 异常` }
            ]
          };
        }
      },
      {
        description: '分析生产线异常情况',
        parameters: [
          { name: 'productionLine', type: 'string', required: false, description: '产线名称' },
          { name: 'timeRange', type: 'string', required: false, description: '时间范围' },
          { name: 'anomalyType', type: 'string', required: false, description: '异常类型' }
        ],
        permissions: ['production:read'],
        examples: ['分析产线A异常', '检查生产线B最近24小时的问题'],
        tags: ['production', 'anomaly', 'analysis']
      }
    );
  }
  
  /**
   * 注册质量检验功能
   */
  static registerQualityFunctions() {
    // 查询质量检验记录
    FunctionRegistry.registerFunction(
      'quality',
      'queryInspection',
      async ({ entities }) => {
        const { materialCode, timeRange = '最近30天', inspectionType } = entities;
        
        if (!materialCode) {
          return {
            content: '请提供需要查询的物料编码',
            suggestedActions: [
              { label: '查看最近检验', type: 'send', message: '查看最近质量检验记录' }
            ]
          };
        }
        
        try {
          const result = await MaterialAIService.getQualityInspection(
            materialCode, 
            timeRange, 
            inspectionType
          );
          
          return {
            content: `物料 ${materialCode} 的质量检验记录 (${timeRange})：\n\n${result.summary}`,
            data: result.data,
            visualData: result.visualData, // 用于图表显示的数据
            suggestedActions: [
              { label: '生成合格率图表', type: 'send', message: `显示 ${materialCode} 合格率图表` },
              { label: '分析不合格原因', type: 'send', message: `分析物料 ${materialCode} 不合格原因` },
              { label: '查看详细报告', type: 'navigate', module: 'navigation', feature: 'navigateTo', parameters: { targetPage: 'quality' } }
            ]
          };
        } catch (error) {
          return {
            content: `查询物料 ${materialCode} 质量检验记录失败: ${error.message}`,
            error: true,
            suggestedActions: [
              { label: '重试', type: 'send', message: `重新查询物料 ${materialCode} 质量检验记录` }
            ]
          };
        }
      },
      {
        description: '查询指定物料的质量检验记录',
        parameters: [
          { name: 'materialCode', type: 'string', required: true, description: '物料编码' },
          { name: 'timeRange', type: 'string', required: false, description: '时间范围' },
          { name: 'inspectionType', type: 'string', required: false, description: '检验类型' }
        ],
        permissions: ['quality:read'],
        examples: ['查询物料 M1001-001 质量检验', '物料 M2002-002 的检验记录'],
        tags: ['quality', 'inspection', 'material']
      }
    );

    // 预测质量趋势
    FunctionRegistry.registerFunction(
      'quality',
      'predictQuality',
      async ({ entities }) => {
        const { materialCode, predictionPeriod = '未来30天' } = entities;
        
        if (!materialCode) {
          return {
            content: '请提供需要预测的物料编码',
            suggestedActions: [
              { label: '查看常用物料', type: 'send', message: '查看最常用物料' }
            ]
          };
        }
        
        try {
          const result = await MaterialAIService.predictQualityTrend(materialCode, predictionPeriod);
          
          return {
            content: `物料 ${materialCode} 的质量趋势预测 (${predictionPeriod})：\n\n${result.prediction}`,
            data: result.data,
            visualData: result.visualData, // 用于图表显示的数据
            suggestedActions: [
              { label: '生成预测图表', type: 'send', message: `显示 ${materialCode} 质量预测图表` },
              { label: '查看改进建议', type: 'send', message: `查看物料 ${materialCode} 质量改进建议` },
              { label: '查看详细预测', type: 'navigate', module: 'navigation', feature: 'navigateTo', parameters: { targetPage: 'quality' } }
            ]
          };
        } catch (error) {
          return {
            content: `预测物料 ${materialCode} 质量趋势失败: ${error.message}`,
            error: true,
            suggestedActions: [
              { label: '重试', type: 'send', message: `重新预测物料 ${materialCode} 质量趋势` }
            ]
          };
        }
      },
      {
        description: '预测指定物料未来的质量趋势',
        parameters: [
          { name: 'materialCode', type: 'string', required: true, description: '物料编码' },
          { name: 'predictionPeriod', type: 'string', required: false, description: '预测周期' }
        ],
        permissions: ['quality:read'],
        examples: ['预测物料 M1001-001 质量趋势', '物料 M2002-002 未来质量如何'],
        tags: ['quality', 'prediction', 'material', 'trend']
      }
    );
  }
  
  /**
   * 注册数据可视化功能
   */
  static registerVisualizationFunctions() {
    // 显示图表
    FunctionRegistry.registerFunction(
      'visualization',
      'showChart',
      async ({ entities, query }) => {
        const { chartType = 'line', dataType, timeRange = '最近30天', materialCode, aggregation = 'day' } = entities;
        
        // 如果缺少必要信息
        if (!dataType && !materialCode) {
          return {
            content: '请提供更多信息来生成图表，例如数据类型或物料编码',
            suggestedActions: [
              { label: '质量合格率图表', type: 'send', message: '显示质量合格率趋势图' },
              { label: '实验数据图表', type: 'send', message: '显示实验数据图表' },
              { label: '产线异常图表', type: 'send', message: '显示产线异常图表' }
            ]
          };
        }
        
        try {
          const params = {
            chartType, 
            dataType, 
            timeRange, 
            materialCode,
            aggregation,
            query // 原始查询，用于更精确地理解需求
          };
          
          const result = await MaterialAIService.generateChart(params);
          
          return {
            content: `已生成${this.getChartTypeName(chartType)}：${result.title || ''}`,
            chartData: result.chartData,
            suggestedActions: [
              { label: '导出图表', type: 'action', action: 'exportChart', parameters: { chartId: result.chartId } },
              { label: '查看更多图表', type: 'navigate', module: 'navigation', feature: 'navigateTo', parameters: { targetPage: 'dashboard' } }
            ]
          };
        } catch (error) {
          return {
            content: `生成图表失败: ${error.message}`,
            error: true,
            suggestedActions: [
              { label: '重试', type: 'send', message: query }
            ]
          };
        }
      },
      {
        description: '根据条件生成数据可视化图表',
        parameters: [
          { name: 'chartType', type: 'string', required: false, description: '图表类型(line, bar, pie)' },
          { name: 'dataType', type: 'string', required: false, description: '数据类型' },
          { name: 'timeRange', type: 'string', required: false, description: '时间范围' },
          { name: 'materialCode', type: 'string', required: false, description: '物料编码' },
          { name: 'aggregation', type: 'string', required: false, description: '数据聚合方式' }
        ],
        permissions: ['visualization:read'],
        examples: ['显示质量趋势图表', '绘制物料M1001-001的实验数据柱状图'],
        tags: ['visualization', 'chart', 'data']
      }
    );
  }
  
  /**
   * 获取图表类型名称
   * @param {string} chartType 图表类型代码
   * @returns {string} 图表类型名称
   */
  static getChartTypeName(chartType) {
    const chartTypeNames = {
      'line': '折线图',
      'bar': '柱状图',
      'pie': '饼图',
      'scatter': '散点图',
      'radar': '雷达图',
      'gauge': '仪表盘'
    };
    
    return chartTypeNames[chartType] || chartType;
  }
  
  /**
   * 注册导航功能
   */
  static registerNavigationFunctions() {
    // 页面导航
    FunctionRegistry.registerFunction(
      'navigation',
      'navigateTo',
      ({ entities }) => {
        const { targetPage } = entities;
        
        if (!targetPage) {
          return {
            content: '请指定要导航的页面',
            suggestedActions: [
              { label: '首页', type: 'navigate', module: 'navigation', feature: 'navigateTo', parameters: { targetPage: 'dashboard' } },
              { label: '质量检验', type: 'navigate', module: 'navigation', feature: 'navigateTo', parameters: { targetPage: 'quality' } },
              { label: '库存管理', type: 'navigate', module: 'navigation', feature: 'navigateTo', parameters: { targetPage: 'inventory' } }
            ]
          };
        }

        // 这里只返回导航信息，实际导航操作由TaskManager.handleNavigationRequest处理
        return {
          content: `正在导航到${targetPage}页面...`,
          navigation: {
            targetPage,
            replace: false
          }
        };
      },
      {
        description: '导航到系统的其他页面',
        parameters: [
          { name: 'targetPage', type: 'string', required: true, description: '目标页面' }
        ],
        permissions: ['navigation:execute'],
        examples: ['前往库存管理页面', '打开质量检验模块'],
        tags: ['navigation', 'page']
      }
    );
  }
  
  /**
   * 注册通用功能
   */
  static registerGeneralFunctions() {
    // 帮助功能
    FunctionRegistry.registerFunction(
      'general',
      'help',
      ({ query }) => {
        // 根据查询内容提供针对性帮助
        if (query.includes('功能') || query.includes('能做什么')) {
          return {
            content: '我可以帮助您完成以下任务：\n\n' +
                    '1. **库存管理**：冻结/解冻批次、查询批次状态\n' +
                    '2. **实验室数据**：查询和分析实验室测试数据\n' +
                    '3. **生产线管理**：分析产线异常情况\n' +
                    '4. **质量检验**：查询检验记录、预测质量趋势\n' +
                    '5. **数据可视化**：生成各类数据图表\n\n' +
                    '您可以直接用自然语言描述需求，例如"分析物料M1001的实验数据"',
            suggestedActions: [
              { label: '库存管理功能', type: 'send', message: '库存管理功能有哪些?' },
              { label: '质量检验功能', type: 'send', message: '质量检验功能有哪些?' },
              { label: '查看使用示例', type: 'send', message: '给我一些使用示例' }
            ]
          };
        } else if (query.includes('使用') || query.includes('示例') || query.includes('例子')) {
          return {
            content: '以下是一些使用示例：\n\n' +
                    '- "冻结批次 B001-001"\n' +
                    '- "查询物料 M1001-001 的实验数据"\n' +
                    '- "分析产线A最近异常情况"\n' +
                    '- "显示质量合格率趋势图"\n' +
                    '- "预测物料 M2002-002 未来质量趋势"\n',
            suggestedActions: [
              { label: '查看更多示例', type: 'send', message: '查看更多使用示例' }
            ]
          };
        }
        
        // 默认帮助信息
        return {
          content: '欢迎使用IQE质量智能助手！我可以帮助您处理质量管理相关的问题。\n\n' +
                  '您可以直接用自然语言提问，例如：\n' +
                  '- 查询特定批次或物料的信息\n' +
                  '- 分析实验数据和质量趋势\n' +
                  '- 处理库存批次的冻结和解冻\n' +
                  '- 查看数据可视化图表\n\n' +
                  '如需了解特定功能，可以输入"查看[功能类别]功能"，例如"查看库存管理功能"',
          suggestedActions: [
            { label: '查看所有功能', type: 'send', message: '系统有哪些功能?' },
            { label: '使用示例', type: 'send', message: '给我一些使用示例' }
          ]
        };
      },
      {
        description: '提供系统帮助信息',
        parameters: [],
        permissions: ['general:read'],
        examples: ['帮助', '系统使用指南', '如何使用'],
        tags: ['general', 'help']
      }
    );

    // 版本信息
    FunctionRegistry.registerFunction(
      'general',
      'version',
      () => {
        return {
          content: 'IQE质量智能助手 v2.0.0\n' +
                  '© 2023 IQE团队\n\n' +
                  '更新内容：\n' +
                  '- 增强AI交互能力\n' +
                  '- 优化数据可视化\n' +
                  '- 新增质量预测功能\n' +
                  '- 改进用户界面',
          suggestedActions: [
            { label: '查看更新记录', type: 'send', message: '查看详细更新记录' }
          ]
        };
      },
      {
        description: '显示系统版本信息',
        parameters: [],
        permissions: ['general:read'],
        examples: ['版本信息', '系统版本', '关于系统'],
        tags: ['general', 'version']
      }
    );
  }
}

export default FunctionMapper; 