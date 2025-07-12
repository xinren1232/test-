/**
 * 智能意图识别和参数提取服务
 * 实现"语义 -> intent rule -> 模板SQL -> 数据"的完整闭环
 */

import { logger } from '../utils/logger.js';
import { getActiveIntentRules } from '../scripts/initIntentRules.js';
import { templateEngine } from './templateEngine.js';
import { getRealInMemoryData } from './realDataAssistantService.js';
import EnhancedResponseFormatter from './EnhancedResponseFormatter.js';
import initializeDatabase from '../models/index.js';

// 内置意图规则配置（作为备用）
const FALLBACK_INTENT_RULES = [
  {
    intent_name: 'batch_risk_check',
    description: '批次风险检查',
    action_type: 'FUNCTION_CALL',
    action_target: 'checkBatchRisk',
    status: 'active',
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
    action_target: `
      SELECT
        material_name as 物料名称,
        supplier_name as 供应商,
        batch_code as 批次号,
        quantity as 库存数量,
        storage_location as 存储位置,
        status as 状态,
        risk_level as 风险等级,
        inbound_time as 入库时间
      FROM inventory
      WHERE storage_location LIKE CONCAT('%', ?, '%')
      ORDER BY inbound_time DESC
      LIMIT 20
    `,
    status: 'active',
    parameters: [
      { name: 'factory', type: 'string', required: true, extract_pattern: /(深圳|重庆|南昌|宜宾)工厂?/i },
      { name: 'status', type: 'string', required: false, extract_pattern: /(正常|风险|冻结)/i }
    ],
    trigger_words: ['工厂', '库存', '查询'],
    synonyms: {
      '工厂': ['厂区', '生产基地', '制造厂'],
      '库存': ['存货', '仓储', '储备'],
      '查询': ['查看', '检查', '获取']
    },
    example_query: '查询深圳工厂库存',
    priority: 25
  },
  {
    intent_name: 'supplier_material_query',
    description: '供应商物料查询',
    action_type: 'DATA_QUERY',
    action_target: 'queryInventoryBySupplier',
    status: 'active',
    parameters: [
      { name: 'supplier', type: 'string', required: true, extract_pattern: /(聚龙|欣冠|广正|BOE|天马|华星)/i },
      { name: 'material', type: 'string', required: false, extract_pattern: /(电池盖|电池|中框|手机卡托|LCD显示屏|OLED显示屏)/i },
      { name: 'status', type: 'string', required: false, extract_pattern: /(正常|风险|冻结)/i }
    ],
    trigger_words: ['供应商', '物料'],
    synonyms: {
      '供应商': ['厂商', '提供商', '合作伙伴'],
      '物料': ['材料', '产品', '零件']
    },
    example_query: '查询聚龙供应商的物料',
    priority: 9
  },
  {
    intent_name: 'material_inventory_query',
    description: '物料库存查询',
    action_type: 'DATA_QUERY',
    action_target: 'queryInventoryByMaterial',
    status: 'active',
    parameters: [
      { name: 'material', type: 'string', required: true, extract_pattern: /(电池盖|电池|中框|手机卡托|LCD显示屏|OLED显示屏)/i },
      { name: 'factory', type: 'string', required: false, extract_pattern: /(深圳|重庆|南昌|宜宾)工厂?/i },
      { name: 'status', type: 'string', required: false, extract_pattern: /(正常|风险|冻结)/i }
    ],
    trigger_words: ['物料', '库存'],
    synonyms: {
      '物料': ['材料', '产品', '零件'],
      '库存': ['存货', '仓储', '储备']
    },
    example_query: '查询电池盖库存',
    priority: 8
  },
  {
    intent_name: 'status_inventory_query',
    description: '状态库存查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT factory, material_name, supplier, status, quantity, batch_code
                   FROM inventory
                   WHERE status LIKE '%{{ status }}%'
                   {% if factory %} AND factory LIKE '%{{ factory }}%' {% endif %}
                   {% if material %} AND material_name LIKE '%{{ material }}%' {% endif %}
                   ORDER BY status, factory`,
    status: 'active',
    parameters: [
      { name: 'status', type: 'string', required: true, extract_pattern: /(正常|风险|冻结|异常|危险|锁定|合格)/i },
      { name: 'factory', type: 'string', required: false, extract_pattern: /(深圳|重庆|南昌|宜宾)工厂?/i },
      { name: 'material', type: 'string', required: false, extract_pattern: /(电池盖|电池|中框|手机卡托|LCD显示屏|OLED显示屏)/i }
    ],
    trigger_words: ['状态', '风险', '正常', '冻结', '异常'],
    synonyms: {
      '状态': ['情况', '情形'],
      '风险': ['异常', '危险', '问题'],
      '冻结': ['锁定', '暂停'],
      '正常': ['良好', '合格']
    },
    example_query: '查询风险库存',
    priority: 7
  },
  {
    intent_name: 'comprehensive_inventory_query',
    description: '综合库存查询',
    action_type: 'SQL_QUERY',
    action_target: `SELECT factory, material_name, supplier, status, quantity, batch_code
                   FROM inventory
                   WHERE 1=1
                   {% if factory %} AND factory LIKE '%{{ factory }}%' {% endif %}
                   {% if material %} AND material_name LIKE '%{{ material }}%' {% endif %}
                   {% if supplier %} AND supplier LIKE '%{{ supplier }}%' {% endif %}
                   {% if status %} AND status LIKE '%{{ status }}%' {% endif %}
                   ORDER BY factory, material_name`,
    status: 'active',
    parameters: [
      { name: 'factory', type: 'string', required: false, extract_pattern: /(深圳|重庆|南昌|宜宾)工厂?/i },
      { name: 'material', type: 'string', required: false, extract_pattern: /(电池盖|电池|中框|手机卡托|LCD显示屏|OLED显示屏)/i },
      { name: 'supplier', type: 'string', required: false, extract_pattern: /(聚龙|欣冠|广正|BOE|天马|华星)/i },
      { name: 'status', type: 'string', required: false, extract_pattern: /(正常|风险|冻结)/i }
    ],
    trigger_words: ['库存', '查询'],
    synonyms: {
      '库存': ['存货', '仓储', '储备'],
      '查询': ['搜索', '检索', '查找']
    },
    example_query: '查询深圳工厂聚龙供应商的电池盖',
    priority: 6
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

        // 调试：输出备用规则详情
        console.log('🔍 备用规则详情:');
        this.intentRules.forEach((rule, index) => {
          console.log(`  ${index + 1}. ${rule.intent_name} (状态: ${rule.status}, 优先级: ${rule.priority})`);
        });
      }

      this.initialized = true;
      this.logger.info('✅ 智能意图识别服务初始化完成');

    } catch (error) {
      this.logger.error('❌ 智能意图识别服务初始化失败:', error);
      // 使用备用规则
      this.intentRules = FALLBACK_INTENT_RULES;
      this.initialized = true;

      // 调试：输出备用规则详情
      console.log('🔍 错误恢复 - 备用规则详情:');
      this.intentRules.forEach((rule, index) => {
        console.log(`  ${index + 1}. ${rule.intent_name} (状态: ${rule.status}, 优先级: ${rule.priority})`);
      });
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

      // 5. 确保返回结果包含意图信息
      if (result && typeof result === 'object') {
        result.intent = matchedIntent.intent_name;
        result.matchedRule = matchedIntent.intent_name;
        result.priority = matchedIntent.priority;
      }

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

    console.log(`🔍 意图识别开始: "${query}"`);
    console.log(`📋 可用规则数量: ${this.intentRules.length}`);

    for (const rule of this.intentRules) {
      console.log(`🔍 检查规则: ${rule.intent_name} (状态: ${rule.status})`);

      if (rule.status !== 'active') {
        console.log(`⏭️ 跳过非活跃规则: ${rule.intent_name}`);
        continue;
      }

      let score = 0;

      // 解析触发词（支持JSON字符串和数组）
      let triggerWords = rule.trigger_words;
      if (typeof triggerWords === 'string' && triggerWords.startsWith('[')) {
        try {
          triggerWords = JSON.parse(triggerWords);
        } catch (e) {
          this.logger.warn(`触发词解析失败: ${rule.intent_name}`, e);
          continue;
        }
      }

      // 确保是数组格式
      if (!Array.isArray(triggerWords)) {
        triggerWords = triggerWords ? triggerWords.split(',').map(w => w.trim()) : [];
      }

      // 检查触发词匹配
      const triggerMatches = triggerWords.filter(word =>
        queryLower.includes(word.toLowerCase())
      ).length;
      score += triggerMatches * 2;

      // 解析同义词（支持JSON字符串和对象）
      let synonyms = rule.synonyms;
      if (typeof synonyms === 'string' && synonyms.startsWith('{')) {
        try {
          synonyms = JSON.parse(synonyms);
        } catch (e) {
          this.logger.warn(`同义词解析失败: ${rule.intent_name}`, e);
          synonyms = null;
        }
      }

      // 检查同义词匹配
      if (synonyms && typeof synonyms === 'object') {
        for (const [key, synonymList] of Object.entries(synonyms)) {
          if (queryLower.includes(key.toLowerCase())) {
            score += 2;
          }
          if (Array.isArray(synonymList)) {
            for (const synonym of synonymList) {
              if (queryLower.includes(synonym.toLowerCase())) {
                score += 1;
              }
            }
          }
        }
      }

      // 优先级加权 (数字越小优先级越高，所以使用倒数)
      const priorityWeight = rule.priority ? (100 / rule.priority) : 1;
      score *= priorityWeight;

      if (score > bestScore && score >= 2) { // 最低匹配阈值
        bestScore = score;
        bestMatch = rule;
      }
    }

    this.logger.info(`🎯 意图匹配结果: ${bestMatch ? bestMatch.intent_name : '无匹配'} (分数: ${bestScore})`);
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

    // 🔧 硬编码参数提取逻辑 - 绕过数据库JSON配置问题
    this.logger.info(`🔍 提取参数 - 查询: "${query}", 规则: ${intentRule.intent_name}`);

    // 工厂参数提取
    const factoryKeywords = ["深圳工厂", "重庆工厂", "南昌工厂", "宜宾工厂", "深圳", "重庆", "南昌", "宜宾"];
    for (const keyword of factoryKeywords) {
      if (query.includes(keyword)) {
        // 应用映射规则
        let value = keyword;
        const factoryMapping = {
          "深圳": "深圳工厂",
          "重庆": "重庆工厂",
          "南昌": "南昌工厂",
          "宜宾": "宜宾工厂"
        };
        if (factoryMapping[keyword]) {
          value = factoryMapping[keyword];
        }
        params.factory = value;
        this.logger.info(`✅ 提取工厂参数: "${keyword}" -> "${value}"`);
        break;
      }
    }

    // 供应商参数提取 - 基于真实数据库数据
    const supplierKeywords = [
      "聚龙", "欣冠", "广正", "丽德宝", "怡同", "富群", "天马", "东声",
      "瑞声", "歌尔", "BOE", "盛泰", "风华", "理威", "天实", "深奥",
      "华星", "奥海", "维科", "百佳达", "辉阳"
    ];

    // 添加供应商别名支持
    const supplierAliases = {
      'BOE': ['BOE', '京东方', 'boe'],
      '聚龙': ['聚龙', 'julong'],
      '歌尔': ['歌尔', '歌尔股份', 'goer'],
      '天马': ['天马', 'tianma'],
      '华星': ['华星', '华星光电']
    };

    // 首先检查别名
    for (const [supplier, aliases] of Object.entries(supplierAliases)) {
      for (const alias of aliases) {
        if (query.toLowerCase().includes(alias.toLowerCase())) {
          params.supplier = supplier;
          this.logger.info(`✅ 提取供应商参数(别名): "${alias}" -> "${supplier}"`);
          break;
        }
      }
      if (params.supplier) break;
    }

    // 如果别名没有匹配，检查完整供应商名称
    if (!params.supplier) {
      for (const keyword of supplierKeywords) {
        if (query.includes(keyword)) {
          params.supplier = keyword;
          this.logger.info(`✅ 提取供应商参数: "${keyword}"`);
          break;
        }
      }
    }

    // 物料参数提取 - 基于您的真实数据（按长度排序，优先匹配长词）
    const materialKeywords = [
      "电池盖", "OLED显示屏", "LCD显示屏", "摄像头模组", "手机卡托",
      "电池", "中框", "侧键", "装饰件", "充电器", "扬声器", "听筒",
      "保护套", "标签", "包装盒", "电容器", "电阻器", "芯片"
    ];

    // 特殊处理：精确匹配"电池"（避免与"电池盖"混淆）
    if (query.match(/(?<!盖)电池(?!盖)/)) {
      params.material = "电池";
      this.logger.info(`✅ 精确匹配物料参数: "电池"`);
    } else {
      // 按长度排序，优先匹配长词（避免"电池盖"被"电池"匹配）
      const sortedMaterialKeywords = materialKeywords.sort((a, b) => b.length - a.length);

      for (const keyword of sortedMaterialKeywords) {
        if (query.includes(keyword)) {
          params.material = keyword;
          this.logger.info(`✅ 提取物料参数: "${keyword}"`);
          break;
        }
      }
    }

    // OLED显示屏的同义词匹配
    if ((query.includes('OLED') || query.includes('显示屏') || query.includes('屏幕')) && !params.material) {
      params.material = 'OLED显示屏';
      this.logger.info(`✅ 提取物料参数(同义词): "OLED显示屏"`);
    }

    // 状态参数提取 - 基于您的真实数据
    const statusKeywords = ["正常", "风险", "冻结"];
    for (const keyword of statusKeywords) {
      if (query.includes(keyword)) {
        params.status = keyword;
        this.logger.info(`✅ 提取状态参数: "${keyword}"`);
        break;
      }
    }

    // 状态同义词匹配
    if (!params.status) {
      if (query.includes('异常') || query.includes('危险') || query.includes('问题')) {
        params.status = '风险';
        this.logger.info(`✅ 提取状态参数(同义词): "风险"`);
      } else if (query.includes('锁定') || query.includes('暂停')) {
        params.status = '冻结';
        this.logger.info(`✅ 提取状态参数(同义词): "冻结"`);
      } else if (query.includes('良好') || query.includes('合格')) {
        params.status = '正常';
        this.logger.info(`✅ 提取状态参数(同义词): "正常"`);
      }
    }

    // 批次号参数提取
    const batchMatch = query.match(/[A-Z]{2}\d{7}|[A-Z0-9]{6,}/);
    if (batchMatch) {
      params.batchNo = batchMatch[0];
      this.logger.info(`✅ 提取批次号参数: "${batchMatch[0]}"`);
    }

    this.logger.info(`🎯 最终提取的参数: ${JSON.stringify(params)}`);

    // 原有的数据库配置解析逻辑（作为备用）
    if (!intentRule.parameters || Object.keys(params).length > 0) {
      return params; // 如果硬编码提取成功，直接返回
    }

    // 解析参数配置（支持JSON字符串和对象）
    let paramConfig;
    try {
      paramConfig = typeof intentRule.parameters === 'string' ?
        JSON.parse(intentRule.parameters) : intentRule.parameters;
    } catch (e) {
      this.logger.warn('参数配置解析失败:', e);
      return params;
    }

    // 遍历参数配置
    for (const [paramName, paramDef] of Object.entries(paramConfig)) {
      // 方法1: 使用extract_from数组进行关键词匹配
      if (paramDef.extract_from && Array.isArray(paramDef.extract_from)) {
        for (const keyword of paramDef.extract_from) {
          if (query.includes(keyword)) {
            // 应用映射规则
            let value = keyword;
            if (paramDef.mapping && paramDef.mapping[keyword]) {
              value = paramDef.mapping[keyword];
            }
            params[paramName] = value;
            break; // 找到第一个匹配就停止
          }
        }
      }

      // 方法2: 使用正则表达式提取（兼容旧配置）
      if (!params[paramName] && paramDef.extract_pattern) {
        const match = query.match(paramDef.extract_pattern);
        if (match && match[1]) {
          params[paramName] = match[1].trim();
        }
      }
    }

    // 处理全局同义词映射
    if (intentRule.synonyms) {
      const synonyms = typeof intentRule.synonyms === 'string' ?
        JSON.parse(intentRule.synonyms) : intentRule.synonyms;

      for (const [key, value] of Object.entries(params)) {
        if (synonyms[value]) {
          // 如果提取的值是同义词，映射到标准值
          const standardValue = Object.keys(synonyms).find(k =>
            synonyms[k].includes(value) || k === value
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
      // 解析参数配置
      let paramConfig;
      try {
        paramConfig = typeof intentRule.parameters === 'string' ?
          JSON.parse(intentRule.parameters) : intentRule.parameters;
      } catch (e) {
        this.logger.warn('参数配置解析失败:', e);
        return { valid: true, missing: [], message: null };
      }

      // 检查必需参数
      for (const [paramName, paramDef] of Object.entries(paramConfig)) {
        if (paramDef.required && !params[paramName]) {
          missing.push(paramName);
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

      // 首先尝试真实数据库查询
      try {
        const results = await this.executeRealDatabaseQuery(sql, params);
        this.logger.info(`✅ 数据库查询成功，返回 ${results.length} 条记录`);

        return {
          success: true,
          data: results, // 返回原始数据数组
          reply: this.formatSQLResults(results, params), // 格式化的回复
          source: 'database',
          sql: sql,
          params: params,
          results: results
        };
      } catch (dbError) {
        this.logger.warn(`⚠️ 数据库查询失败: ${dbError.message}，尝试内存数据`);
      }

      // 备选：使用内存中的真实数据
      const realData = getRealInMemoryData();
      const hasRealData = realData.inventory.length > 0 ||
                         realData.inspection.length > 0 ||
                         realData.production.length > 0;

      let results;
      if (hasRealData) {
        this.logger.info('✅ 使用内存中的真实数据执行查询');
        results = this.executeInMemoryQuery(sql, params, realData);
      } else {
        this.logger.warn('⚠️ 内存数据为空，使用模拟数据');
        results = this.generateMockSQLResults(sql, params);
      }

      return {
        success: true,
        data: results, // 返回原始数据数组
        reply: this.formatSQLResults(results, params), // 格式化的回复
        source: hasRealData ? 'memory_data' : 'mock_data',
        sql: sql,
        params: params,
        results: results
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
   * 执行真实数据库查询
   * @param {string} sql - SQL查询语句
   * @param {object} params - 查询参数
   * @returns {Array} 查询结果
   */
  async executeRealDatabaseQuery(sql, params) {
    try {
      this.logger.info(`🗄️ 执行数据库查询: ${sql}`);
      this.logger.info(`📋 查询参数:`, params);

      // 获取数据库实例
      const db = await initializeDatabase();
      const sequelize = db.sequelize;

      // 处理SQL中的参数替换问题
      let processedSql = sql;
      const paramValues = [];

      // 如果有参数，按顺序处理占位符
      if (Object.keys(params).length > 0) {
        // 获取参数值数组，按照常见的参数顺序
        const orderedParams = this.getOrderedParameterValues(params);

        // 对于单个参数的情况，所有占位符都使用同一个值
        const primaryParam = orderedParams[0] || '';

        // 替换 CONCAT(?, '%') 模式
        processedSql = processedSql.replace(/CONCAT\s*\(\s*\?\s*,\s*['"]%['"]\s*\)/gi, () => {
          return `'${primaryParam}%'`;
        });

        // 替换 CONCAT(?, '盖') 等模式
        processedSql = processedSql.replace(/CONCAT\s*\(\s*\?\s*,\s*['"]([^'"]*)['"]\s*\)/gi, (match, suffix) => {
          return `'${primaryParam}${suffix}'`;
        });

        // 替换剩余的单独 ? 占位符
        processedSql = processedSql.replace(/\?/g, () => {
          return `'${primaryParam}'`;
        });

      } else {
        // 如果没有参数，移除WHERE条件中的参数部分
        processedSql = processedSql.replace(/WHERE\s+\w+\s+LIKE\s+CONCAT\s*\([^)]+\)/gi, '');
        processedSql = processedSql.replace(/AND\s+\(\w+\s+LIKE\s+CONCAT\s*\([^)]+\)\s+OR\s+\?\s*=\s*''\)/gi, '');
      }

      this.logger.info(`🔧 处理后的SQL: ${processedSql}`);

      // 使用Sequelize执行原始SQL查询
      const results = await sequelize.query(processedSql, {
        type: sequelize.QueryTypes.SELECT
      });

      this.logger.info(`✅ 数据库查询成功，返回 ${results.length} 条记录`);
      return results;

    } catch (error) {
      this.logger.error(`❌ 数据库查询失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取有序的参数值数组
   * @param {object} params - 参数对象
   * @returns {array} 有序的参数值数组
   */
  getOrderedParameterValues(params) {
    const orderedValues = [];

    // 按照常见的参数优先级顺序添加参数值
    const paramOrder = ['factory', 'supplier', 'material', 'status', 'batchNo', 'testResult'];

    for (const paramName of paramOrder) {
      if (params[paramName] !== undefined && params[paramName] !== null && params[paramName] !== '') {
        orderedValues.push(params[paramName]);
      }
    }

    // 添加其他未在优先级列表中的参数
    for (const [key, value] of Object.entries(params)) {
      if (!paramOrder.includes(key) && value !== undefined && value !== null && value !== '') {
        orderedValues.push(value);
      }
    }

    this.logger.info(`🎯 有序参数值: [${orderedValues.join(', ')}]`);
    return orderedValues;
  }

  /**
   * 在内存数据中执行查询
   * @param {string} sql - SQL查询语句
   * @param {object} params - 查询参数
   * @param {object} realData - 真实内存数据
   * @returns {Array} 查询结果
   */
  executeInMemoryQuery(sql, params, realData) {
    const sqlLower = sql.toLowerCase();

    // 库存查询
    if (sqlLower.includes('inventory')) {
      let results = [...realData.inventory];

      // 工厂筛选 - 支持多种字段名
      if (params.factory) {
        results = results.filter(item => {
          const location = item.storageLocation || item.storage_location || item.factory || '';
          return location.includes(params.factory);
        });
      }

      // 供应商筛选
      if (params.supplier) {
        results = results.filter(item =>
          item.supplier && item.supplier.includes(params.supplier)
        );
      }

      // 物料筛选
      if (params.material) {
        results = results.filter(item =>
          item.materialName && item.materialName.includes(params.material)
        );
      }

      // 状态筛选
      if (params.status) {
        results = results.filter(item =>
          item.status && item.status.includes(params.status)
        );
      }

      // 转换为SQL结果格式 - 修复字段映射
      return results.map(item => ({
        factory: item.factory || item.storage_location || item.storageLocation || '',
        material_name: item.materialName || item.material_name || '',
        supplier: item.supplier || '',
        status: item.status || '',
        quantity: item.quantity || 0,
        batch_code: item.batchNo || item.batch_no || item.batch_code || ''
      }));
    }

    // 检验数据查询
    if (sqlLower.includes('lab_test') || sqlLower.includes('inspection')) {
      let results = [...realData.inspection];

      // 物料筛选
      if (params.material) {
        results = results.filter(item =>
          item.materialName && item.materialName.includes(params.material)
        );
      }

      // 测试结果筛选
      if (params.test_result) {
        results = results.filter(item =>
          item.testResult && item.testResult.includes(params.test_result)
        );
      }

      return results.map(item => ({
        material_name: item.materialName || '',
        test_result: item.testResult || '',
        test_date: item.testDate || '',
        defect_rate: item.defectRate || 0,
        batch_code: item.batchNo || ''
      }));
    }

    // 生产数据查询
    if (sqlLower.includes('production') || sqlLower.includes('online_tracking')) {
      let results = [...realData.production];

      // 工厂筛选
      if (params.factory) {
        results = results.filter(item =>
          item.factory && item.factory.includes(params.factory)
        );
      }

      // 物料筛选
      if (params.material) {
        results = results.filter(item =>
          item.materialName && item.materialName.includes(params.material)
        );
      }

      return results.map(item => ({
        material_name: item.materialName || '',
        factory: item.factory || '',
        defect_rate: item.defectRate || 0,
        production_date: item.productionDate || '',
        batch_code: item.batchNo || ''
      }));
    }

    return [];
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

  /**
   * 执行动作
   * @param {object} intentRule - 意图规则
   * @param {object} params - 提取的参数
   * @param {object} context - 上下文
   * @returns {object} 执行结果
   */
  async executeAction(intentRule, params, context) {
    try {
      this.logger.info(`🚀 执行动作: ${intentRule.action_type} - ${intentRule.action_target}`);

      switch (intentRule.action_type) {
        case 'DATA_QUERY':
          return await this.executeDataQuery(intentRule.action_target, params);
        case 'FUNCTION_CALL':
          return await this.executeFunctionCall(intentRule.action_target, params);
        case 'SQL_QUERY':
          return await this.executeSQLQuery(intentRule.action_target, params);
        default:
          throw new Error(`不支持的动作类型: ${intentRule.action_type}`);
      }
    } catch (error) {
      this.logger.error(`❌ 动作执行失败:`, error);
      throw error;
    }
  }

  /**
   * 执行数据查询
   * @param {string} queryFunction - 查询函数名
   * @param {object} params - 参数
   * @returns {object} 查询结果
   */
  async executeDataQuery(queryFunction, params) {
    const realData = getRealInMemoryData();

    // 检查数据是否存在
    if (!realData || (!realData.inventory?.length && !realData.inspection?.length && !realData.production?.length)) {
      return {
        success: false,
        data: '暂无数据，请先在系统中生成数据后再进行查询。',
        source: 'intelligent-intent'
      };
    }

    this.logger.info(`📊 执行数据查询: ${queryFunction}`, params);
    this.logger.info(`📊 可用数据: 库存${realData.inventory?.length || 0}条, 检验${realData.inspection?.length || 0}条, 生产${realData.production?.length || 0}条`);

    switch (queryFunction) {
      case 'queryInventoryByFactory':
        return this.queryInventoryByFactory(realData.inventory, params);
      case 'queryInventoryBySupplier':
        return this.queryInventoryBySupplier(realData.inventory, params);
      case 'queryInventoryByMaterial':
        return this.queryInventoryByMaterial(realData.inventory, params);
      case 'queryInventoryByStatus':
        return this.queryInventoryByStatus(realData.inventory, params);
      default:
        throw new Error(`不支持的查询函数: ${queryFunction}`);
    }
  }

  /**
   * 按工厂查询库存
   */
  queryInventoryByFactory(inventory, params) {
    const { factory, status } = params;

    let results = inventory.filter(item => {
      // 修复字段映射：使用 storage_location 或 存储位置 字段
      const factoryMatch = (item.storage_location && item.storage_location.includes(factory)) ||
                          (item.存储位置 && item.存储位置.includes(factory)) ||
                          (item.factory && item.factory.includes(factory));
      const statusMatch = !status || (item.status && item.status.includes(status)) ||
                         (item.状态 && item.状态.includes(status));
      return factoryMatch && statusMatch;
    });

    if (results.length === 0) {
      return {
        success: false,
        data: `未找到${factory}${status ? `状态为${status}的` : ''}库存数据。`,
        source: 'intelligent-intent'
      };
    }

    // 使用增强响应格式化器
    const enhancedData = EnhancedResponseFormatter.formatInventoryQuery(results, {
      title: `${factory}库存查询结果`,
      queryType: 'factory',
      factoryName: factory
    });

    return {
      success: true,
      data: enhancedData,
      source: 'intelligent-intent',
      intent: 'factory_inventory_query',
      resultCount: results.length
    };
  }

  /**
   * 按供应商查询库存
   */
  queryInventoryBySupplier(inventory, params) {
    const { supplier, material, status } = params;

    let results = inventory.filter(item => {
      const supplierMatch = item.supplier && item.supplier.includes(supplier);
      const materialMatch = !material || (item.materialName && item.materialName.includes(material));
      const statusMatch = !status || (item.status && item.status.includes(status));
      return supplierMatch && materialMatch && statusMatch;
    });

    if (results.length === 0) {
      return {
        success: false,
        data: `未找到供应商${supplier}${material ? `的${material}` : ''}${status ? `状态为${status}的` : ''}库存数据。`,
        source: 'intelligent-intent'
      };
    }

    // 使用增强响应格式化器
    const enhancedData = EnhancedResponseFormatter.formatInventoryQuery(results, {
      title: `供应商${supplier}库存查询结果`,
      queryType: 'supplier',
      supplierName: supplier
    });

    return {
      success: true,
      data: enhancedData,
      source: 'intelligent-intent',
      intent: 'supplier_material_query',
      resultCount: results.length
    };
  }

  /**
   * 按物料查询库存
   */
  queryInventoryByMaterial(inventory, params) {
    const { material, factory, status } = params;

    let results = inventory.filter(item => {
      const materialMatch = item.materialName && item.materialName.includes(material);
      const factoryMatch = !factory || (item.factory && item.factory.includes(factory));
      const statusMatch = !status || (item.status && item.status.includes(status));
      return materialMatch && factoryMatch && statusMatch;
    });

    if (results.length === 0) {
      return {
        success: false,
        data: `未找到${material}${factory ? `在${factory}` : ''}${status ? `状态为${status}的` : ''}库存数据。`,
        source: 'intelligent-intent'
      };
    }

    // 格式化结果
    const summary = this.formatInventoryResults(results, `${material}库存查询结果`);

    return {
      success: true,
      data: summary,
      source: 'intelligent-intent',
      intent: 'material_inventory_query',
      resultCount: results.length
    };
  }

  /**
   * 按状态查询库存
   */
  queryInventoryByStatus(inventory, params) {
    const { status, factory, material } = params;

    let results = inventory.filter(item => {
      const statusMatch = item.status && item.status.includes(status);
      const factoryMatch = !factory || (item.factory && item.factory.includes(factory));
      const materialMatch = !material || (item.materialName && item.materialName.includes(material));
      return statusMatch && factoryMatch && materialMatch;
    });

    if (results.length === 0) {
      return {
        success: false,
        data: `未找到状态为${status}${factory ? `在${factory}` : ''}${material ? `的${material}` : ''}库存数据。`,
        source: 'intelligent-intent'
      };
    }

    // 格式化结果
    const summary = this.formatInventoryResults(results, `${status}状态库存查询结果`);

    return {
      success: true,
      data: summary,
      source: 'intelligent-intent',
      intent: 'status_inventory_query',
      resultCount: results.length
    };
  }

  /**
   * 格式化库存查询结果
   */
  formatInventoryResults(results, title) {
    const summary = [`📊 ${title} (共${results.length}条记录)\n`];

    // 增强统计分析 - 参考库存页面设计
    const factoryStats = {};
    const supplierStats = {};
    const materialStats = {};
    const statusStats = {};
    let totalQuantity = 0;

    results.forEach(item => {
      // 工厂统计
      if (item.factory) {
        if (!factoryStats[item.factory]) {
          factoryStats[item.factory] = { count: 0, quantity: 0 };
        }
        factoryStats[item.factory].count += 1;
        factoryStats[item.factory].quantity += (item.quantity || 0);
      }

      // 供应商统计
      if (item.supplier) {
        if (!supplierStats[item.supplier]) {
          supplierStats[item.supplier] = { count: 0, quantity: 0 };
        }
        supplierStats[item.supplier].count += 1;
        supplierStats[item.supplier].quantity += (item.quantity || 0);
      }

      // 物料统计
      if (item.materialName) {
        if (!materialStats[item.materialName]) {
          materialStats[item.materialName] = { count: 0, quantity: 0 };
        }
        materialStats[item.materialName].count += 1;
        materialStats[item.materialName].quantity += (item.quantity || 0);
      }

      // 状态统计
      if (item.status) {
        statusStats[item.status] = (statusStats[item.status] || 0) + 1;
      }

      totalQuantity += (item.quantity || 0);
    });

    // 统计概览 - 类似库存页面的统计卡片
    summary.push('📈 **统计概览**');
    summary.push(`┌─────────────────────────────────────┐`);
    summary.push(`│ 📦 总库存量: ${totalQuantity.toLocaleString().padStart(12)} │`);

    if (statusStats['正常']) {
      const normalPercent = ((statusStats['正常'] / results.length) * 100).toFixed(1);
      summary.push(`│ ✅ 正常物料: ${statusStats['正常'].toString().padStart(3)}批次 (${normalPercent.padStart(5)}%) │`);
    }
    if (statusStats['风险']) {
      const riskPercent = ((statusStats['风险'] / results.length) * 100).toFixed(1);
      summary.push(`│ ⚠️  风险物料: ${statusStats['风险'].toString().padStart(3)}批次 (${riskPercent.padStart(5)}%) │`);
    }
    if (statusStats['冻结']) {
      const frozenPercent = ((statusStats['冻结'] / results.length) * 100).toFixed(1);
      summary.push(`│ 🔒 冻结物料: ${statusStats['冻结'].toString().padStart(3)}批次 (${frozenPercent.padStart(5)}%) │`);
    }
    summary.push(`└─────────────────────────────────────┘`);
    summary.push('');

    // 工厂分布 - 增强显示
    if (Object.keys(factoryStats).length > 0) {
      summary.push('🏭 **工厂分布**');
      Object.entries(factoryStats)
        .sort(([,a], [,b]) => b.count - a.count)
        .forEach(([factory, data]) => {
          summary.push(`  • ${factory}: ${data.count}批次, 总量${data.quantity.toLocaleString()}`);
        });
      summary.push('');
    }

    // 供应商分布 - 增强显示
    if (Object.keys(supplierStats).length > 0) {
      summary.push('🏢 **供应商分布**');
      Object.entries(supplierStats)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 5) // 只显示前5个供应商
        .forEach(([supplier, data]) => {
          summary.push(`  • ${supplier}: ${data.count}批次, 总量${data.quantity.toLocaleString()}`);
        });
      if (Object.keys(supplierStats).length > 5) {
        summary.push(`  ... 还有${Object.keys(supplierStats).length - 5}个供应商`);
      }
      summary.push('');
    }

    // 物料分布 - 增强显示
    if (Object.keys(materialStats).length > 0) {
      summary.push('📦 **物料分布**');
      Object.entries(materialStats)
        .sort(([,a], [,b]) => b.quantity - a.quantity)
        .slice(0, 5) // 只显示前5种物料
        .forEach(([material, data]) => {
          summary.push(`  • ${material}: ${data.count}批次, 总量${data.quantity.toLocaleString()}`);
        });
      if (Object.keys(materialStats).length > 5) {
        summary.push(`  ... 还有${Object.keys(materialStats).length - 5}种物料`);
      }
      summary.push('');
    }

    // 详细记录表格 - 参考库存页面表格设计
    if (results.length > 0) {
      summary.push('📋 **详细记录** (前8条)');
      summary.push('┌────┬──────────┬──────────┬──────────┬────────┬────────┬──────────┐');
      summary.push('│序号│ 物料名称   │ 供应商    │ 批次号    │ 数量   │ 状态   │ 工厂     │');
      summary.push('├────┼──────────┼──────────┼──────────┼────────┼────────┼──────────┤');

      results.slice(0, 8).forEach((item, index) => {
        const statusIcon = item.status === '正常' ? '✅' : item.status === '风险' ? '⚠️' : '🔒';
        const materialName = (item.materialName || '未知').substring(0, 8).padEnd(8);
        const supplier = (item.supplier || '未知').substring(0, 8).padEnd(8);
        const batchNo = (item.batchNo || '未知').substring(0, 8).padEnd(8);
        const quantity = String(item.quantity || 0).padStart(6);
        const status = `${statusIcon}${(item.status || '未知').padEnd(4)}`;
        const factory = (item.factory || '未知').substring(0, 8).padEnd(8);

        summary.push(`│${String(index + 1).padStart(2)}  │ ${materialName} │ ${supplier} │ ${batchNo} │ ${quantity} │ ${status} │ ${factory} │`);
      });

      summary.push('└────┴──────────┴──────────┴──────────┴────────┴────────┴──────────┘');

      if (results.length > 8) {
        summary.push(`📄 还有${results.length - 8}条记录，可使用更具体的查询条件获取详细信息`);
      }
      summary.push('');
    }

    // 智能建议 - 基于库存页面的业务逻辑
    summary.push('💡 **智能建议**');
    if (statusStats['风险'] > 0) {
      summary.push(`• 发现${statusStats['风险']}批次风险物料，建议优先处理`);
    }
    if (statusStats['冻结'] > 0) {
      summary.push(`• 发现${statusStats['冻结']}批次冻结物料，建议检查解冻条件`);
    }

    // 库存预警
    const lowStockItems = results.filter(item => item.quantity < 100);
    if (lowStockItems.length > 0) {
      summary.push(`• 发现${lowStockItems.length}批次库存偏低，建议关注补货`);
    }

    return summary.join('\n');
  }
}

export default IntelligentIntentService;

// 导出服务实例
export const intelligentIntentService = new IntelligentIntentService();
