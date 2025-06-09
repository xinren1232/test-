/**
 * 意图识别器 - 负责识别用户查询的意图和提取相关实体
 */

import { AIQueryService } from '../AIQueryService';
import { AIBaseService } from '../ai/AIBaseService';
import { AIService } from '../ai/AIService';

/**
 * 意图识别器类
 */
export class IntentRecognizer {
  // 意图模式库 - 用于快速匹配常见查询模式
  static intentPatterns = {
    inventory: {
      freezeBatch: [
        /冻结\s*批次\s*([A-Z0-9\-]+)/i,
        /将?\s*批次\s*([A-Z0-9\-]+)\s*冻结/i,
        /批次\s*([A-Z0-9\-]+)\s*设置为冻结/i,
        /暂停使用\s*批次\s*([A-Z0-9\-]+)/i,
        /锁定\s*批次\s*([A-Z0-9\-]+)/i
      ],
      unfreezeBatch: [
        /解冻\s*批次\s*([A-Z0-9\-]+)/i,
        /将?\s*批次\s*([A-Z0-9\-]+)\s*解冻/i,
        /取消\s*批次\s*([A-Z0-9\-]+)\s*的冻结/i,
        /恢复使用\s*批次\s*([A-Z0-9\-]+)/i,
        /解锁\s*批次\s*([A-Z0-9\-]+)/i
      ],
      checkBatchStatus: [
        /查询\s*批次\s*([A-Z0-9\-]+)\s*状态/i,
        /批次\s*([A-Z0-9\-]+)\s*的状态/i,
        /检查\s*批次\s*([A-Z0-9\-]+)/i,
        /批次\s*([A-Z0-9\-]+)\s*情况/i,
        /([A-Z0-9\-]+)\s*批次(的)?状态/i
      ],
      batchList: [
        /查询(所有|全部)批次/i,
        /显示批次列表/i,
        /批次清单/i,
        /列出(所有|全部)?批次/i
      ],
      materialInventory: [
        /查询\s*物料\s*([A-Z0-9\-]+)\s*库存/i,
        /物料\s*([A-Z0-9\-]+)\s*的库存(数量|情况)?/i,
        /([A-Z0-9\-]+)\s*的库存量/i,
        /还有多少\s*([A-Z0-9\-]+)/i
      ]
    },
    laboratory: {
      queryLabData: [
        /查询\s*物料\s*([A-Z0-9\-]+)\s*实验数据/i,
        /物料\s*([A-Z0-9\-]+)\s*的实验室测试数据/i,
        /([A-Z0-9\-]+)\s*物料的实验数据/i,
        /实验室\s*([A-Z0-9\-]+)\s*数据/i,
        /([A-Z0-9\-]+)\s*的测试结果/i
      ],
      analyzeLabData: [
        /分析\s*物料\s*([A-Z0-9\-]+)\s*实验数据/i,
        /物料\s*([A-Z0-9\-]+)\s*的数据趋势/i,
        /([A-Z0-9\-]+)\s*实验数据分析/i,
        /研究\s*([A-Z0-9\-]+)\s*数据规律/i,
        /评估\s*物料\s*([A-Z0-9\-]+)\s*实验/i
      ],
      labTestSummary: [
        /实验室测试(数据)?概况/i,
        /测试数据汇总/i,
        /最近的实验(室)?报告/i,
        /测试结果总览/i
      ]
    },
    production: {
      analyzeAnomaly: [
        /分析产线异常\s*(.*)/i,
        /产线(.*?)异常分析/i,
        /检查生产线异常\s*(.*)/i,
        /调查生产问题\s*(.*)/i,
        /生产线(.*?)故障分析/i
      ],
      productionStatus: [
        /生产线状态/i,
        /查看生产情况/i,
        /产线运行状态/i,
        /生产线运行情况/i,
        /当前产线效率/i
      ],
      productionSchedule: [
        /生产计划/i,
        /排产信息/i,
        /查看生产排程/i,
        /本周生产安排/i,
        /今日生产任务/i
      ],
      productionCapacity: [
        /产能分析/i,
        /生产线产能/i,
        /产能利用率/i,
        /产线效率评估/i
      ]
    },
    quality: {
      queryInspection: [
        /查询\s*物料\s*([A-Z0-9\-]+)\s*质量检验/i,
        /物料\s*([A-Z0-9\-]+)\s*的检验记录/i,
        /([A-Z0-9\-]+)\s*的质检报告/i,
        /质检\s*物料\s*([A-Z0-9\-]+)/i,
        /([A-Z0-9\-]+)\s*质量检测结果/i
      ],
      predictQuality: [
        /预测\s*物料\s*([A-Z0-9\-]+)\s*质量趋势/i,
        /物料\s*([A-Z0-9\-]+)\s*未来质量/i,
        /([A-Z0-9\-]+)\s*质量预测/i,
        /预估\s*([A-Z0-9\-]+)\s*质量变化/i,
        /([A-Z0-9\-]+)\s*质量趋势分析/i
      ],
      qualitySummary: [
        /质量(概况|总览|汇总)/i,
        /质检概要/i,
        /质量检验结果汇总/i,
        /质量管理(报告|概况)/i
      ],
      defectAnalysis: [
        /缺陷分析/i,
        /(产品|物料)\s*缺陷统计/i,
        /不良品分析/i,
        /质量问题分布/i,
        /缺陷原因分析/i
      ]
    },
    visualization: {
      showChart: [
        /显示\s*(.*)\s*图表/i,
        /绘制\s*(.*)\s*图/i,
        /生成\s*(.*)\s*可视化/i,
        /创建\s*(.*)\s*图表/i,
        /展示\s*(.*)\s*数据图/i
      ],
      trendChart: [
        /趋势图/i,
        /变化趋势/i,
        /趋势分析图表/i,
        /历史走势图/i
      ],
      compareChart: [
        /对比图/i,
        /比较\s*(.*)\s*图表/i,
        /(.*)对(.*)的比较/i,
        /不同(.*)的对比/i
      ],
      distributionChart: [
        /分布图/i,
        /占比图/i,
        /分布情况/i,
        /百分比图/i
      ]
    },
    navigation: {
      navigateTo: [
        /前往\s*(.*)\s*页面/i,
        /打开\s*(.*)\s*模块/i,
        /跳转到\s*(.*)/i,
        /进入\s*(.*)\s*界面/i,
        /切换到\s*(.*)\s*页面/i
      ],
      goBack: [
        /返回/i,
        /后退/i,
        /回到上一页/i,
        /上一步/i
      ],
      goHome: [
        /回到首页/i,
        /去主页/i,
        /返回首页/i,
        /主界面/i
      ]
    },
    general: {
      help: [
        /帮助/i,
        /怎么用/i,
        /使用说明/i,
        /指南/i,
        /功能介绍/i
      ],
      searchInfo: [
        /搜索\s*(.*)/i,
        /查找\s*(.*)/i,
        /查询\s*(.*)/i
      ]
    }
  };

  /**
   * 识别用户查询中的意图
   * @param {string} query 用户查询
   * @param {Object} context 上下文信息
   * @returns {Promise<Object>} 识别的意图对象
   */
  static async recognizeIntent(query, context = {}) {
    // 首先尝试使用模式匹配快速识别意图
    const patternIntent = this.matchIntentPatterns(query);
    if (patternIntent) {
      console.log('通过模式匹配识别意图:', patternIntent);
      return patternIntent;
    }

    // 考虑上下文进行辅助识别
    const contextIntent = this.recognizeFromContext(query, context);
    if (contextIntent) {
      console.log('通过上下文辅助识别意图:', contextIntent);
      return contextIntent;
    }

    // 如果模式匹配失败，使用AI模型进行意图识别
    try {
      return await this.recognizeIntentWithAI(query, context);
    } catch (error) {
      console.error('AI意图识别失败:', error);
      return {
        module: 'general',
        feature: 'default',
        confidence: 0.5,
        entities: this.extractEntities(query)
      };
    }
  }

  /**
   * 使用模式匹配识别意图
   * @param {string} query 用户查询
   * @returns {Object|null} 识别的意图对象，匹配失败返回null
   */
  static matchIntentPatterns(query) {
    for (const [module, features] of Object.entries(this.intentPatterns)) {
      for (const [feature, patterns] of Object.entries(features)) {
        for (const pattern of patterns) {
          const match = query.match(pattern);
          if (match) {
            // 提取实体
            const entities = this.extractEntitiesFromMatch(module, feature, match);
            
            return {
              module,
              feature,
              confidence: 0.9, // 模式匹配一般具有较高置信度
              entities,
              patternMatched: true
            };
          }
        }
      }
    }
    
    return null;
  }

  /**
   * 基于上下文辅助识别意图
   * @param {string} query 用户查询
   * @param {Object} context 上下文信息
   * @returns {Object|null} 识别的意图对象
   */
  static recognizeFromContext(query, context) {
    // 如果当前场景明确，可以更倾向于识别该场景下的意图
    if (context.scenario) {
      const scenarioModule = this.mapScenarioToModule(context.scenario);
      if (scenarioModule) {
        // 在特定模块中寻找可能匹配的意图
        const possibleIntents = this.findPossibleIntentsInModule(query, scenarioModule);
        if (possibleIntents.length > 0) {
          // 选择最可能的意图
          const intent = possibleIntents[0];
          return {
            module: scenarioModule,
            feature: intent.feature,
            confidence: 0.7, // 基于上下文的匹配置信度适中
            entities: intent.entities,
            contextMatched: true
          };
        }
      }
    }

    // 处理物料相关上下文
    if (context.materialCode || query.toLowerCase().includes('这个物料') || query.toLowerCase().includes('此物料')) {
      let materialCode = context.materialCode;

      // 提取物料编码
      if (!materialCode) {
        const materialMatch = this.extractEntities(query);
        materialCode = materialMatch.materialCode;
      }

      if (materialCode) {
        // 根据查询内容判断用户可能希望对物料执行的操作
        if (query.includes('库存') || query.includes('数量')) {
          return {
            module: 'inventory',
            feature: 'materialInventory',
            confidence: 0.7,
            entities: { materialCode },
            contextMatched: true
          };
        } else if (query.includes('实验') || query.includes('测试') || query.includes('数据')) {
          return {
            module: 'laboratory',
            feature: 'queryLabData',
            confidence: 0.7,
            entities: { materialCode },
            contextMatched: true
          };
        } else if (query.includes('质量') || query.includes('检验') || query.includes('质检')) {
          return {
            module: 'quality',
            feature: 'queryInspection',
            confidence: 0.7,
            entities: { materialCode },
            contextMatched: true
          };
        }
      }
    }

    return null;
  }

  /**
   * 将场景映射到模块
   * @param {string} scenario 场景名称
   * @returns {string|null} 模块名称
   */
  static mapScenarioToModule(scenario) {
    const mapping = {
      'inventory': 'inventory',
      'laboratory': 'laboratory',
      'production': 'production',
      'quality': 'quality',
      'visualization': 'visualization',
      'dashboard': 'general'
    };

    return mapping[scenario] || null;
  }

  /**
   * 在指定模块中寻找可能匹配的意图
   * @param {string} query 用户查询
   * @param {string} module 模块名称
   * @returns {Array} 可能的意图列表
   */
  static findPossibleIntentsInModule(query, module) {
    const possibleIntents = [];
    const features = this.intentPatterns[module];
    
    if (!features) return possibleIntents;

    // 计算每个功能与查询的相关度
    for (const [feature, patterns] of Object.entries(features)) {
      // 检查功能名称中的关键词是否出现在查询中
      const featureKeywords = this.getFeatureKeywords(feature);
      const keywordMatches = featureKeywords.filter(keyword => 
        query.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (keywordMatches.length > 0) {
        const entities = this.extractEntities(query);
        possibleIntents.push({
          feature,
          entities,
          relevance: keywordMatches.length / featureKeywords.length
        });
      }
    }

    // 按相关度排序
    possibleIntents.sort((a, b) => b.relevance - a.relevance);
    return possibleIntents;
  }

  /**
   * 获取功能的关键词
   * @param {string} feature 功能名称
   * @returns {Array<string>} 关键词列表
   */
  static getFeatureKeywords(feature) {
    const keywordMap = {
      'freezeBatch': ['冻结', '批次', '锁定', '暂停'],
      'unfreezeBatch': ['解冻', '批次', '解锁', '恢复'],
      'checkBatchStatus': ['状态', '批次', '检查', '查询'],
      'batchList': ['列表', '批次', '清单', '所有'],
      'materialInventory': ['库存', '数量', '物料'],
      'queryLabData': ['数据', '实验', '测试', '查询'],
      'analyzeLabData': ['分析', '数据', '趋势', '评估'],
      'labTestSummary': ['汇总', '概况', '报告', '总览'],
      'analyzeAnomaly': ['异常', '分析', '问题', '故障'],
      'productionStatus': ['状态', '生产线', '运行', '情况'],
      'queryInspection': ['检验', '质量', '质检', '报告'],
      'predictQuality': ['预测', '质量', '趋势', '未来'],
      'showChart': ['图表', '显示', '创建', '图'],
      'navigateTo': ['前往', '打开', '跳转', '进入']
    };

    return keywordMap[feature] || [feature.toLowerCase()];
  }

  /**
   * 从匹配结果中提取实体
   * @param {string} module 模块
   * @param {string} feature 功能
   * @param {Array} match 正则匹配结果
   * @returns {Object} 提取的实体
   */
  static extractEntitiesFromMatch(module, feature, match) {
    const entities = {};
    
    // 根据不同意图类型提取不同实体
    if (module === 'inventory') {
      if (['freezeBatch', 'unfreezeBatch', 'checkBatchStatus'].includes(feature) && match[1]) {
        entities.batchId = match[1];
      } else if (feature === 'materialInventory' && match[1]) {
        entities.materialCode = match[1];
      }
    } else if (module === 'laboratory' || module === 'quality') {
      if (['queryLabData', 'analyzeLabData', 'queryInspection', 'predictQuality'].includes(feature) && match[1]) {
        entities.materialCode = match[1];
      }
    } else if (module === 'production') {
      if (feature === 'analyzeAnomaly' && match[1]) {
        const timeInfo = this.extractTimeInfo(match[1]);
        if (timeInfo) {
          entities.timeRange = timeInfo;
        } else {
          entities.productionLine = match[1].trim();
        }
      }
    } else if (module === 'visualization') {
      if (feature === 'showChart' && match[1]) {
        entities.chartType = this.extractChartType(match[1]);
        entities.dataType = this.extractDataType(match[1]);
      }
    } else if (module === 'navigation') {
      if (feature === 'navigateTo' && match[1]) {
        entities.targetPage = this.mapPageName(match[1]);
      }
    }
    
    return entities;
  }

  /**
   * 提取时间信息
   * @param {string} text 文本
   * @returns {string|null} 提取的时间范围
   */
  static extractTimeInfo(text) {
    const timePatterns = [
      { pattern: /最近\s*(\d+)\s*天/, format: '最近$1天' },
      { pattern: /最近\s*(\d+)\s*个?月/, format: '最近$1个月' },
      { pattern: /最近\s*(\d+)\s*个?小时/, format: '最近$1小时' },
      { pattern: /最近\s*(\d+)\s*周/, format: '最近$1周' },
      { pattern: /最近一天|昨天/, format: '最近1天' },
      { pattern: /最近一周|上周/, format: '最近1周' },
      { pattern: /最近一个月|上个月/, format: '最近1个月' },
      { pattern: /今天|当天/, format: '今天' },
      { pattern: /本[周月年]/, format: match => match[0] },
      { pattern: /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/, format: '$1-$2-$3' }
    ];
    
    for (const { pattern, format } of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        return typeof format === 'function' ? format(match) : text.replace(pattern, format);
      }
    }
    
    return null;
  }

  /**
   * 提取图表类型
   * @param {string} text 文本
   * @returns {string} 图表类型
   */
  static extractChartType(text) {
    const chartTypes = {
      '折线': 'line',
      '线': 'line',
      '趋势': 'line',
      '柱状': 'bar',
      '柱': 'bar',
      '条形': 'bar',
      '直方': 'bar',
      '饼': 'pie',
      '圆': 'pie',
      '占比': 'pie',
      '分布': 'pie',
      '散点': 'scatter',
      '点': 'scatter',
      '相关': 'scatter',
      '雷达': 'radar',
      '多维': 'radar',
      '仪表': 'gauge',
      '表盘': 'gauge',
      '热力': 'heatmap',
      '热图': 'heatmap'
    };
    
    for (const [key, value] of Object.entries(chartTypes)) {
      if (text.includes(key)) {
        return value;
      }
    }
    
    return 'line'; // 默认为折线图
  }

  /**
   * 提取数据类型
   * @param {string} text 文本
   * @returns {string} 数据类型
   */
  static extractDataType(text) {
    const dataTypes = {
      '质量': 'quality',
      '实验': 'lab',
      '测试': 'lab',
      '生产': 'production',
      '产量': 'production',
      '效率': 'efficiency',
      '库存': 'inventory',
      '趋势': 'trend',
      '对比': 'comparison',
      '比较': 'comparison',
      '异常': 'anomaly',
      '缺陷': 'defect',
      '销售': 'sales',
      '成本': 'cost'
    };
    
    for (const [key, value] of Object.entries(dataTypes)) {
      if (text.includes(key)) {
        return value;
      }
    }
    
    return 'general';
  }

  /**
   * 映射页面名称
   * @param {string} pageName 页面名称
   * @returns {string} 映射后的页面路径
   */
  static mapPageName(pageName) {
    const pageMapping = {
      '首页': 'dashboard',
      '主页': 'dashboard',
      '仪表盘': 'dashboard',
      '总览': 'dashboard',
      '库存': 'inventory',
      '物料': 'inventory',
      '库存管理': 'inventory',
      '实验室': 'laboratory',
      '实验': 'laboratory',
      '测试': 'laboratory',
      '测试数据': 'laboratory',
      '生产线': 'production',
      '生产': 'production',
      '制造': 'production',
      '产线': 'production',
      '质量': 'quality',
      '质检': 'quality',
      '检验': 'quality',
      '品质': 'quality',
      '设置': 'settings',
      '配置': 'settings',
      '系统设置': 'settings',
      '报告': 'reports',
      '分析': 'reports',
      '报表': 'reports',
      '统计': 'reports',
      '数据': 'data',
      '数据中心': 'data'
    };
    
    for (const [key, value] of Object.entries(pageMapping)) {
      if (pageName.includes(key)) {
        return value;
      }
    }
    
    return pageName; // 如果没有匹配项，返回原始名称
  }

  /**
   * 使用AI模型识别用户意图
   * @param {string} query 用户查询
   * @param {Object} context 上下文信息
   * @returns {Promise<Object>} 识别的意图对象
   */
  static async recognizeIntentWithAI(query, context = {}) {
    try {
      console.log('使用AI模型识别意图:', query);
      
      // 构造系统提示词
      const systemPrompt = `你是一个意图识别专家。请分析用户查询，并识别出最可能的意图分类。
可用的意图模块：${Object.keys(this.intentPatterns).join(', ')}。
请以JSON格式返回结果，包含module(模块)、feature(功能)、confidence(置信度)和entities(提取的实体)字段。`;

      // 设置超时处理
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('意图识别请求超时')), 10000);
      });
      
      // 使用AI服务解析意图，添加race以处理超时
      const result = await Promise.race([
        AIService.executeQuery({
          type: 'intent_recognition',
          query
        }, {
          systemPrompt,
          context: {
            ...context,
            availableModules: Object.keys(this.intentPatterns),
            recentActivity: context.recentActivity || []
          }
        }),
        timeoutPromise
      ]);
      
      // 检查结果是否有效
      if (!result) {
        throw new Error('AI服务返回空结果');
      }
      
      // 如果有错误属性，表示API请求失败
      if (result.error) {
        throw new Error(result.message || '意图识别失败');
      }
      
      // 解析AI返回的结果
      if (result && result.intent) {
        const { module, feature, confidence = 0.7 } = result.intent;
        
        return {
          module: module || 'general',
          feature: feature || 'default',
          confidence: confidence,
          entities: result.entities || this.extractEntities(query),
          aiRecognized: true
        };
      }
      
      // 尝试从内容中解析JSON
      if (result.content) {
        try {
          // 匹配内容中的JSON部分
          const jsonMatch = result.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const intentData = JSON.parse(jsonMatch[0]);
            return {
              module: intentData.module || 'general',
              feature: intentData.feature || 'default',
              confidence: intentData.confidence || 0.7,
              entities: intentData.entities || this.extractEntities(query),
              aiRecognized: true
            };
          }
        } catch (e) {
          console.warn('JSON解析失败:', e);
        }
      }
      
      // 如果AI无法识别，返回默认意图
      return {
        module: 'general',
        feature: 'default',
        confidence: 0.5,
        entities: this.extractEntities(query),
        aiRecognized: false
      };
    } catch (error) {
      console.error('AI意图识别错误:', error);
      
      // 出错时返回默认意图
      return {
        module: 'general',
        feature: 'default',
        confidence: 0.5,
        entities: this.extractEntities(query),
        error: error.message
      };
    }
  }

  /**
   * 从文本中提取通用实体
   * @param {string} text 文本
   * @returns {Object} 提取的实体对象
   */
  static extractEntities(text) {
    const entities = {};
    
    // 提取物料编码 (M开头，后跟4位数字，横杠，再跟3位数字)
    const materialCodeMatch = text.match(/([M][0-9]{4}-[0-9]{3})/i);
    if (materialCodeMatch) {
      entities.materialCode = materialCodeMatch[1];
    }
    
    // 提取批次号 (B开头，后跟3位数字，横杠，再跟3位数字)
    const batchIdMatch = text.match(/([B][0-9]{3}-[0-9]{3})/i);
    if (batchIdMatch) {
      entities.batchId = batchIdMatch[1];
    }
    
    // 提取日期范围
    const timeRange = this.extractTimeInfo(text);
    if (timeRange) {
      entities.timeRange = timeRange;
    }
    
    // 提取数字百分比
    const percentageMatch = text.match(/(\d+(?:\.\d+)?)\s*%/);
    if (percentageMatch) {
      entities.percentage = parseFloat(percentageMatch[1]);
    }
    
    // 提取数量
    const quantityMatch = text.match(/(\d+(?:\.\d+)?)\s*(个|件|台|kg|千克|吨|升|吨|箱)/);
    if (quantityMatch) {
      entities.quantity = {
        value: parseFloat(quantityMatch[1]),
        unit: quantityMatch[2]
      };
    }
    
    return entities;
  }
  
  /**
   * 注册新的意图模式
   * @param {string} module 模块
   * @param {string} feature 功能
   * @param {RegExp[]} patterns 模式数组
   */
  static registerIntentPattern(module, feature, patterns) {
    if (!Array.isArray(patterns)) {
      patterns = [patterns];
    }
    
    if (!this.intentPatterns[module]) {
      this.intentPatterns[module] = {};
    }
    
    if (!this.intentPatterns[module][feature]) {
      this.intentPatterns[module][feature] = [];
    }
    
    this.intentPatterns[module][feature].push(...patterns);
  }
}

export default IntentRecognizer; 