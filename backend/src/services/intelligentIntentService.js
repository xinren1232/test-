/**
 * 智能意图识别和参数提取服务
 * 实现"语义 -> intent rule -> 模板SQL -> 数据"的完整闭环
 */

import { logger } from '../utils/logger.js';
import { getActiveIntentRules } from '../scripts/initIntentRules.js';
import { templateEngine } from './templateEngine.js';

// 内置意图规则配置（作为备用）
const FALLBACK_INTENT_RULES = [
  {
    intent_name: 'batch_risk_check',
    description: '批次风险检查',
    action_type: 'FUNCTION_CALL',
    action_target: 'checkBatchRisk',
    parameters: [
      { name: 'batch_no', type: 'string', required: true, extract_pattern: /批次[号]?[：:]?\s*([A-Z0-9]+)/i }
    ],
    trigger_words: ['批次', '风险', '异常', '状态'],
    synonyms: {
      '风险': ['异常', '危险', '问题'],
      '批次': ['batch', '批号', '批次号'],
      '检查': ['查询', '查看', '检测']
    },
    example_query: '这个批次有没有风险？',
    priority: 5
  },
  {
    intent_name: 'factory_inventory_query',
    description: '工厂库存查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT * FROM inventory WHERE factory LIKE '%{{ factory }}%' 
                   {% if status %} AND status = '{{ status }}' {% endif %}
                   {% if supplier %} AND supplier LIKE '%{{ supplier }}%' {% endif %}`,
    parameters: [
      { name: 'factory', type: 'string', required: true, extract_pattern: /(深圳|宜宾|重庆|北京|上海)工厂?/i },
      { name: 'status', type: 'string', required: false, extract_pattern: /(正常|风险|异常|冻结)/i },
      { name: 'supplier', type: 'string', required: false, extract_pattern: /(BOE|聚龙|歌尔)/i }
    ],
    trigger_words: ['工厂', '库存'],
    synonyms: {
      '异常': ['风险', '危险'],
      '库存': ['物料', '存货']
    },
    example_query: '深圳工厂异常库存',
    priority: 4
  },
  {
    intent_name: 'supplier_quality_analysis',
    description: '供应商质量分析',
    action_type: 'FUNCTION_CALL',
    action_target: 'analyzeSupplierQuality',
    parameters: [
      { name: 'supplier', type: 'string', required: true, extract_pattern: /(BOE|聚龙|歌尔)/i },
      { name: 'material', type: 'string', required: false, extract_pattern: /(OLED|电池盖|喇叭|散热片)/i }
    ],
    trigger_words: ['供应商', '质量', '分析'],
    synonyms: {
      '质量': ['品质', '合格率', '不良率'],
      '分析': ['评估', '对比', '统计']
    },
    example_query: 'BOE供应商质量如何',
    priority: 3
  },
  {
    intent_name: 'material_defect_rate',
    description: '物料不良率查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT material_name, AVG(defect_rate) as avg_defect_rate, COUNT(*) as total_records
                   FROM production WHERE material_name LIKE '%{{ material }}%'
                   {% if factory %} AND factory LIKE '%{{ factory }}%' {% endif %}
                   GROUP BY material_name`,
    parameters: [
      { name: 'material', type: 'string', required: true, extract_pattern: /(OLED|电池盖|喇叭|散热片|显示屏)/i },
      { name: 'factory', type: 'string', required: false, extract_pattern: /(深圳|宜宾)工厂?/i }
    ],
    trigger_words: ['不良率', '物料', '缺陷'],
    synonyms: {
      '不良率': ['缺陷率', '失败率', '问题率'],
      '物料': ['材料', '产品', '零件']
    },
    example_query: '电池盖的不良率是多少',
    priority: 3
  }
];

/**
 * 智能意图识别服务类
 */
class IntelligentIntentService {
  constructor() {
    this.intentRules = [];
    this.logger = logger;
    this.initialized = false;
  }

  /**
   * 初始化服务，从数据库加载意图规则
   */
  async initialize() {
    try {
      this.logger.info('🚀 初始化智能意图识别服务...');

      // 从数据库加载意图规则
      const dbRules = await getActiveIntentRules();

      if (dbRules && dbRules.length > 0) {
        this.intentRules = dbRules;
        this.logger.info(`✅ 从数据库加载 ${dbRules.length} 条意图规则`);
      } else {
        // 使用备用规则
        this.intentRules = FALLBACK_INTENT_RULES;
        this.logger.warn(`⚠️ 数据库无规则，使用备用规则 ${FALLBACK_INTENT_RULES.length} 条`);
      }

      this.initialized = true;
      this.logger.info('✅ 智能意图识别服务初始化完成');

    } catch (error) {
      this.logger.error('❌ 智能意图识别服务初始化失败:', error);
      // 使用备用规则
      this.intentRules = FALLBACK_INTENT_RULES;
      this.initialized = true;
    }
  }

  /**
   * 确保服务已初始化
   */
  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * 处理用户查询的主入口
   * @param {string} query - 用户查询文本
   * @param {object} context - 上下文信息
   * @returns {object} 处理结果
   */
  async processQuery(query, context = {}) {
    try {
      // 确保服务已初始化
      await this.ensureInitialized();

      this.logger.info(`🧠 智能意图识别开始处理: "${query}"`);

      // 1. 意图识别
      const matchedIntent = this.identifyIntent(query);
      if (!matchedIntent) {
        this.logger.warn(`❌ 未找到匹配的意图: "${query}"`);
        return this.generateFallbackResponse(query);
      }

      this.logger.info(`✅ 匹配意图: ${matchedIntent.intent_name}`);

      // 2. 参数提取
      const extractedParams = this.extractParameters(query, matchedIntent);
      this.logger.info(`📊 提取参数:`, extractedParams);

      // 3. 验证必需参数
      const validationResult = this.validateParameters(extractedParams, matchedIntent);
      if (!validationResult.valid) {
        this.logger.warn(`⚠️ 参数验证失败: ${validationResult.message}`);
        return this.generateParameterPrompt(matchedIntent, validationResult.missing);
      }

      // 4. 执行动作
      const result = await this.executeAction(matchedIntent, extractedParams, context);
      
      this.logger.info(`✅ 智能意图处理完成`);
      return result;

    } catch (error) {
      this.logger.error(`❌ 智能意图处理失败:`, error);
      return this.generateErrorResponse(query, error);
    }
  }

  /**
   * 识别用户意图
   * @param {string} query - 用户查询
   * @returns {object|null} 匹配的意图规则
   */
  identifyIntent(query) {
    const queryLower = query.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;

    for (const rule of this.intentRules) {
      if (rule.status !== 'active') continue;

      let score = 0;

      // 检查触发词匹配
      const triggerMatches = rule.trigger_words.filter(word => 
        queryLower.includes(word.toLowerCase())
      ).length;
      score += triggerMatches * 2;

      // 检查同义词匹配
      if (rule.synonyms) {
        for (const [key, synonyms] of Object.entries(rule.synonyms)) {
          if (queryLower.includes(key.toLowerCase())) {
            score += 2;
          }
          for (const synonym of synonyms) {
            if (queryLower.includes(synonym.toLowerCase())) {
              score += 1;
            }
          }
        }
      }

      // 优先级加权
      score *= (rule.priority || 1);

      if (score > bestScore && score >= 2) { // 最低匹配阈值
        bestScore = score;
        bestMatch = rule;
      }
    }

    return bestMatch;
  }

  /**
   * 从查询中提取参数
   * @param {string} query - 用户查询
   * @param {object} intentRule - 匹配的意图规则
   * @returns {object} 提取的参数
   */
  extractParameters(query, intentRule) {
    const params = {};

    if (!intentRule.parameters) return params;

    for (const paramDef of intentRule.parameters) {
      if (paramDef.extract_pattern) {
        const match = query.match(paramDef.extract_pattern);
        if (match && match[1]) {
          params[paramDef.name] = match[1].trim();
        }
      }
    }

    // 处理同义词映射
    if (intentRule.synonyms) {
      for (const [key, value] of Object.entries(params)) {
        const paramDef = intentRule.parameters.find(p => p.name === key);
        if (paramDef && intentRule.synonyms[value]) {
          // 如果提取的值是同义词，映射到标准值
          const standardValue = Object.keys(intentRule.synonyms).find(k => 
            intentRule.synonyms[k].includes(value) || k === value
          );
          if (standardValue) {
            params[key] = standardValue;
          }
        }
      }
    }

    return params;
  }

  /**
   * 验证参数完整性
   * @param {object} params - 提取的参数
   * @param {object} intentRule - 意图规则
   * @returns {object} 验证结果
   */
  validateParameters(params, intentRule) {
    const missing = [];
    
    if (intentRule.parameters) {
      for (const paramDef of intentRule.parameters) {
        if (paramDef.required && !params[paramDef.name]) {
          missing.push(paramDef.name);
        }
      }
    }

    return {
      valid: missing.length === 0,
      missing,
      message: missing.length > 0 ? `缺少必需参数: ${missing.join(', ')}` : null
    };
  }

  /**
   * 执行具体动作
   * @param {object} intentRule - 意图规则
   * @param {object} params - 参数
   * @param {object} context - 上下文
   * @returns {object} 执行结果
   */
  async executeAction(intentRule, params, context) {
    switch (intentRule.action_type) {
      case 'SQL_QUERY':
        return await this.executeSQLQuery(intentRule.action_target, params);
      
      case 'FUNCTION_CALL':
        return await this.executeFunctionCall(intentRule.action_target, params, context);
      
      case 'API_CALL':
        return await this.executeAPICall(intentRule.action_target, params);
      
      default:
        throw new Error(`不支持的动作类型: ${intentRule.action_type}`);
    }
  }

  /**
   * 执行SQL查询
   * @param {string} sqlTemplate - SQL模板
   * @param {object} params - 参数
   * @returns {object} 查询结果
   */
  async executeSQLQuery(sqlTemplate, params) {
    try {
      // 使用模板引擎渲染SQL
      const sql = templateEngine.render(sqlTemplate, params);
      this.logger.info(`🗃️ 执行SQL查询: ${sql}`);

      // 这里应该连接真实数据库执行查询
      // 现在返回模拟结果，但包含真实的SQL
      const mockResults = this.generateMockSQLResults(sql, params);

      return {
        success: true,
        data: this.formatSQLResults(mockResults, params),
        source: 'sql_query',
        sql: sql,
        params: params,
        results: mockResults
      };

    } catch (error) {
      this.logger.error('❌ SQL查询执行失败:', error);
      return {
        success: false,
        data: `SQL查询执行失败: ${error.message}`,
        source: 'sql_error',
        error: error.message
      };
    }
  }

  /**
   * 生成模拟SQL结果
   */
  generateMockSQLResults(sql, params) {
    // 根据SQL类型生成不同的模拟结果
    if (sql.includes('inventory')) {
      return [
        { factory: '深圳工厂', material_name: 'OLED显示屏', supplier: 'BOE', status: '正常', quantity: 150 },
        { factory: '深圳工厂', material_name: '电池盖', supplier: '聚龙', status: '风险', quantity: 80 }
      ];
    } else if (sql.includes('production')) {
      return [
        { material_name: 'OLED显示屏', avg_defect_rate: 2.5, total_records: 45 },
        { material_name: '电池盖', avg_defect_rate: 1.8, total_records: 32 }
      ];
    } else if (sql.includes('lab_test')) {
      return [
        { material_name: 'OLED显示屏', test_result: 'PASS', count: 28 },
        { material_name: 'OLED显示屏', test_result: 'FAIL', count: 3 }
      ];
    }

    return [{ message: 'SQL查询已执行', affected_rows: 1 }];
  }

  /**
   * 格式化SQL结果
   */
  formatSQLResults(results, params) {
    if (!results || results.length === 0) {
      return '查询完成，但没有找到匹配的记录。';
    }

    let formatted = `📊 **查询结果** (共 ${results.length} 条记录)\n\n`;

    results.forEach((row, index) => {
      formatted += `**${index + 1}.** `;
      const fields = Object.entries(row).map(([key, value]) => `${key}: ${value}`);
      formatted += fields.join(' | ') + '\n';
    });

    return formatted;
  }

  /**
   * 执行函数调用
   * @param {string} functionName - 函数名
   * @param {object} params - 参数
   * @param {object} context - 上下文
   * @returns {object} 执行结果
   */
  async executeFunctionCall(functionName, params, context) {
    this.logger.info(`🔧 执行函数调用: ${functionName}`);
    
    // 这里应该调用实际的业务函数
    switch (functionName) {
      case 'checkBatchRisk':
        return this.checkBatchRisk(params.batch_no, context);
      
      case 'analyzeSupplierQuality':
        return this.analyzeSupplierQuality(params.supplier, params.material, context);
      
      default:
        throw new Error(`未知函数: ${functionName}`);
    }
  }

  /**
   * 检查批次风险（示例函数）
   */
  async checkBatchRisk(batchNo, context) {
    return {
      success: true,
      data: `批次 ${batchNo} 的风险检查结果：当前状态正常`,
      source: 'function_call',
      function: 'checkBatchRisk',
      batch_no: batchNo
    };
  }

  /**
   * 分析供应商质量（示例函数）
   */
  async analyzeSupplierQuality(supplier, material, context) {
    return {
      success: true,
      data: `${supplier}供应商${material ? `的${material}` : ''}质量分析：整体表现良好`,
      source: 'function_call',
      function: 'analyzeSupplierQuality',
      supplier,
      material
    };
  }

  /**
   * 生成回退响应
   */
  generateFallbackResponse(query) {
    return {
      success: false,
      data: `抱歉，我无法理解您的问题："${query}"。请尝试使用更具体的关键词。`,
      source: 'fallback',
      suggestions: [
        '深圳工厂库存情况',
        'BOE供应商质量分析',
        '电池盖不良率统计',
        '批次风险检查'
      ]
    };
  }

  /**
   * 生成参数提示
   */
  generateParameterPrompt(intentRule, missingParams) {
    return {
      success: false,
      data: `请提供更多信息来完成查询。缺少参数: ${missingParams.join(', ')}`,
      source: 'parameter_prompt',
      intent: intentRule.intent_name,
      missing: missingParams,
      example: intentRule.example_query
    };
  }

  /**
   * 生成错误响应
   */
  generateErrorResponse(query, error) {
    return {
      success: false,
      data: `处理查询时发生错误："${query}"`,
      source: 'error',
      error: error.message
    };
  }
}

export default IntelligentIntentService;
