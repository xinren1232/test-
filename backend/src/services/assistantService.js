import initializeDatabase from '../models/index.js';
import { QueryTypes } from 'sequelize';

// 缓存规则以避免频繁查询数据库
let intentRules = [];
let db = null;
// 新增：用于缓存从前端接收的实时数据
let inMemoryData = {
  inventory: [],
  inspection: [],
  production: []
};

/**
 * 新增：更新内存中的数据
 * @param {object} data - 包含 inventory, inspection, production 的数据对象
 */
export function updateInMemoryData(data) {
  if (data.inventory) {
    inMemoryData.inventory = data.inventory;
    console.log(`Updated in-memory inventory data with ${data.inventory.length} records.`);
  }
  if (data.inspection) {
    inMemoryData.inspection = data.inspection;
    console.log(`Updated in-memory inspection data with ${data.inspection.length} records.`);
  }
  if (data.production) {
    inMemoryData.production = data.production;
    console.log(`Updated in-memory production data with ${data.production.length} records.`);
  }
}

/**
 * 新增：使用内存数据处理查询
 * @param {string} queryText - 查询文本
 * @param {object} matchedRule - 匹配的规则
 * @returns {Promise<string|null>} 查询结果或null（如果无法处理）
 */
async function processInMemoryQuery(queryText, matchedRule) {
  const queryLower = queryText.toLowerCase();

  // 风险物料查询 - 优先处理
  if (queryLower.includes('风险') || queryLower.includes('高风险')) {
    console.log('处理风险物料查询...');
    let results = inMemoryData.inventory;
    
    // 过滤风险状态的物料
    results = results.filter(item => item.status === '风险' || item.status === '异常');
    
    if (results.length > 0) {
      console.log(`找到 ${results.length} 条风险物料记录`);
      return formatInventoryResults(results);
    } else {
      console.log('没有找到风险物料记录');
      return '当前没有发现风险状态的物料。';
    }
  }

  // 库存相关查询
  if (queryLower.includes('库存') || queryLower.includes('物料')) {
    let results = inMemoryData.inventory;

    // 工厂筛选
    if (queryLower.includes('重庆工厂')) {
      results = results.filter(item => item.factory && item.factory.includes('重庆'));
    } else if (queryLower.includes('深圳工厂')) {
      results = results.filter(item => item.factory && item.factory.includes('深圳'));
    } else if (queryLower.includes('宜宾工厂')) {
      results = results.filter(item => item.factory && item.factory.includes('宜宾'));
    } else if (queryLower.includes('南昌工厂')) {
      results = results.filter(item => item.factory && item.factory.includes('南昌'));
    }

    // 供应商筛选 - 使用动态匹配
    const supplierKeywords = ['电子', '科技', '光学', 'BOE', '三星', '京东方', '富士康'];
    for (const keyword of supplierKeywords) {
      if (queryLower.includes(keyword.toLowerCase())) {
        results = results.filter(item => item.supplier && item.supplier.toLowerCase().includes(keyword.toLowerCase()));
        break;
      }
    }

    // 物料名称筛选 - 使用动态匹配
    const materialKeywords = ['电容', '电阻', '显示屏', '摄像头', '电池', '处理器', '连接器'];
    for (const keyword of materialKeywords) {
      if (queryLower.includes(keyword)) {
        results = results.filter(item => item.materialName && item.materialName.includes(keyword));
        break;
      }
    }

    // 批次号筛选
    const batchMatch = queryText.match(/TK\d+|SS\d+|\d{6}/);
    if (batchMatch) {
      const batchCode = batchMatch[0];
      results = results.filter(item => item.batchCode && item.batchCode.includes(batchCode));
    }

    // 风险状态筛选
    if (queryLower.includes('风险') || queryLower.includes('异常')) {
      results = results.filter(item => item.status === '风险' || item.status === '异常');
    }

    return formatInventoryResults(results);
  }

  // 测试相关查询
  if (queryLower.includes('测试') || queryLower.includes('检验') || queryLower.includes('不良')) {
    let results = inMemoryData.inspection;

    // 批次号筛选
    const batchMatch = queryText.match(/TK\d+|SS\d+|\d{6}/);
    if (batchMatch) {
      const batchCode = batchMatch[0];
      results = results.filter(item => item.batchCode && item.batchCode.includes(batchCode));
    }

    // 不良筛选
    if (queryLower.includes('不良') || queryLower.includes('ng') || queryLower.includes('失败')) {
      results = results.filter(item => item.result === '不合格' || item.result === 'NG' || item.result === 'FAIL');
    }

    return formatInspectionResults(results);
  }

  // 生产相关查询
  if (queryLower.includes('生产') || queryLower.includes('产线') || queryLower.includes('上线')) {
    let results = inMemoryData.production;

    // 工厂筛选
    if (queryLower.includes('深圳工厂')) {
      results = results.filter(item => item.factory && item.factory.includes('深圳'));
    }

    // 批次号筛选
    const batchMatch = queryText.match(/TK\d+|SS\d+|\d{6}/);
    if (batchMatch) {
      const batchCode = batchMatch[0];
      results = results.filter(item => item.batchCode && item.batchCode.includes(batchCode));
    }

    return formatProductionResults(results);
  }

  return null; // 无法处理的查询类型
}

/**
 * 格式化库存查询结果
 */
function formatInventoryResults(results) {
  if (results.length === 0) {
    return '没有找到符合条件的库存记录。';
  }

  let output = `找到 ${results.length} 条库存记录：\n\n`;

  results.forEach((item, index) => {
    output += `记录 ${index + 1}:\n`;
    output += `- 工厂: ${item.factory || '未知'}\n`;
    output += `- 物料编码: ${item.materialCode || '未知'}\n`;
    output += `- 物料名称: ${item.materialName || '未知'}\n`;
    output += `- 供应商: ${item.supplier || '未知'}\n`;
    output += `- 批次号: ${item.batchCode || '未知'}\n`;
    output += `- 数量: ${item.quantity || 0}\n`;
    output += `- 状态: ${item.status || '未知'}\n`;
    output += `- 检验日期: ${item.inspectionDate || '未知'}\n`;
    if (item.remark && item.remark !== '-') {
      output += `- 备注: ${item.remark}\n`;
    }
    output += '\n';
  });

  return output;
}

/**
 * 格式化检验查询结果
 */
function formatInspectionResults(results) {
  if (results.length === 0) {
    return '没有找到符合条件的检验记录。';
  }

  let output = `找到 ${results.length} 条检验记录：\n\n`;

  results.forEach((item, index) => {
    output += `记录 ${index + 1}:\n`;
    output += `- 物料编码: ${item.materialCode || '未知'}\n`;
    output += `- 物料名称: ${item.materialName || '未知'}\n`;
    output += `- 供应商: ${item.supplier || '未知'}\n`;
    output += `- 批次号: ${item.batchCode || '未知'}\n`;
    output += `- 测试日期: ${item.testDate || '未知'}\n`;
    output += `- 测试类型: ${item.testType || '未知'}\n`;
    output += `- 测试结果: ${item.result || '未知'}\n`;
    output += `- 测试员: ${item.tester || '未知'}\n`;
    if (item.defectDesc) {
      output += `- 缺陷描述: ${item.defectDesc}\n`;
    }
    output += '\n';
  });

  return output;
}

/**
 * 格式化生产查询结果
 */
function formatProductionResults(results) {
  if (results.length === 0) {
    return '没有找到符合条件的生产记录。';
  }

  let output = `找到 ${results.length} 条生产记录：\n\n`;

  results.forEach((item, index) => {
    output += `记录 ${index + 1}:\n`;
    output += `- 工厂: ${item.factory || '未知'}\n`;
    output += `- 物料编码: ${item.materialCode || '未知'}\n`;
    output += `- 物料名称: ${item.materialName || '未知'}\n`;
    output += `- 供应商: ${item.supplier || '未知'}\n`;
    output += `- 批次号: ${item.batchCode || '未知'}\n`;
    output += `- 生产线: ${item.line || '未知'}\n`;
    output += `- 生产日期: ${item.date || '未知'}\n`;
    output += `- 总数量: ${item.totalCount || 0}\n`;
    output += `- 不良数量: ${item.defectCount || 0}\n`;
    output += `- 不良率: ${item.defectRate || 0}%\n`;
    output += `- 操作员: ${item.operator || '未知'}\n`;
    output += '\n';
  });

  return output;
}

/**
 * 加载或刷新缓存的意图规则
 */
export async function loadIntentRules() {
  try {
    // 确保数据库已初始化
    if (!db) {
      db = await initializeDatabase();
    }

    const NlpIntentRule = db.NlpIntentRule;
    const rules = await NlpIntentRule.findAll({
      where: { status: 'active' },
      order: [['sort_order', 'ASC'], ['id', 'ASC']],
      raw: true,
    });

    console.log(`从数据库加载了 ${rules.length} 条NLP规则`);

    intentRules = rules.map(rule => ({
      intent_name: rule.intent_name,  // 保持原字段名
      intent: rule.intent_name,
      keywords: rule.intent_name.split(',').map(k => k.trim().toLowerCase()), // 支持逗号分隔的关键字
      required_entities: rule.parameters, // 保持字段名一致
      response_format: '查询结果如下：', // 示例格式
      target_page: null, // 示例
      action: rule.action_target, // SQL查询或API端点
      action_target: rule.action_target, // 保持原字段名
      description: rule.description,
      action_type: rule.action_type,
      trigger_words: rule.trigger_words, // 保持原字段名
      priority: rule.priority,
      status: rule.status
    }));

    console.log('NLP intent rules loaded successfully.');
    console.log('规则列表:', intentRules.map(r => r.intent).join(', '));
    } catch (error) {
    console.error('Failed to load NLP intent rules:', error);
    intentRules = [];
    // 重新抛出错误
      throw error;
    }
  }
  
  /**
 * 根据用户查询匹配意图 - 改进的匹配逻辑
 * @param {string} queryText - 用户输入的问题
 * @returns {object|null} - 匹配到的规则或null
 */
function matchIntent(queryText) {
  if (!queryText || !intentRules.length) {
    return null;
  }
  const lowerQuery = queryText.toLowerCase();

  // 特殊的硬编码意图，用于数据查询
  if (lowerQuery.includes('库存')) {
    // 示例：返回库存总量
      return {
      intent: 'query_inventory_count',
      action_type: 'in_memory',
      description: '查询库存总量'
    };
  }
  if (lowerQuery.includes('风险') && lowerQuery.includes('物料')) {
      return {
      intent: 'query_risk_items',
      action_type: 'in_memory',
      description: '查询风险物料'
    };
  }

  // 计算每个规则的匹配分数
  const ruleScores = [];

  for (const rule of intentRules) {
    const keywords = rule.keywords || [];
    let score = 0;
    let matchedKeywords = [];

    // 检查关键字匹配
    for (const kw of keywords) {
      const keyword = kw.toLowerCase();

      // 完全匹配得分最高
      if (lowerQuery.includes(keyword)) {
        score += keyword.length * 2; // 长关键字权重更高
        matchedKeywords.push(keyword);
      }
      // 部分匹配（去掉"查询"前缀）
      else {
        const cleanKeyword = keyword.replace(/^查询/, '');
        if (cleanKeyword && lowerQuery.includes(cleanKeyword)) {
          score += cleanKeyword.length;
          matchedKeywords.push(cleanKeyword);
        }
      }
    }

    // 特殊匹配逻辑 - 基于业务场景

    // 高风险库存查询
    if ((lowerQuery.includes('高风险') || lowerQuery.includes('风险')) &&
        (lowerQuery.includes('库存') || lowerQuery.includes('物料'))) {
      if (rule.intent.includes('高风险库存')) {
        score += 20;
        matchedKeywords.push('高风险库存');
      }
    }

    // 批次相关查询
    if ((lowerQuery.includes('批次') || lowerQuery.includes('batch')) &&
        rule.intent.includes('批次')) {
      score += 15;
      matchedKeywords.push('批次');
    }

    // 供应商相关查询
    if ((lowerQuery.includes('欣旺达') || lowerQuery.includes('比亚迪') ||
         lowerQuery.includes('宁德时代') || lowerQuery.includes('富士康') ||
         lowerQuery.includes('立讯精密')) &&
        rule.intent.includes('供应商')) {
      score += 15;
      matchedKeywords.push('供应商');
    }

    // 测试相关查询
    if ((lowerQuery.includes('测试') || lowerQuery.includes('检测') ||
         lowerQuery.includes('检验')) &&
        rule.intent.includes('测试')) {
      score += 15;
      matchedKeywords.push('测试');
    }

    // 工厂相关查询 - 优先匹配工厂规则
    if ((lowerQuery.includes('工厂') || lowerQuery.includes('深圳工厂') ||
         lowerQuery.includes('重庆工厂') || lowerQuery.includes('南昌工厂') ||
         lowerQuery.includes('宜宾工厂')) &&
        rule.intent.includes('工厂')) {
      score += 20; // 工厂查询优先级更高
      matchedKeywords.push('工厂');
    }

    // 上线相关查询
    else if ((lowerQuery.includes('上线') || lowerQuery.includes('产线')) &&
             rule.intent.includes('上线')) {
      score += 15;
      matchedKeywords.push('上线');
    }

    // 异常相关查询
    if ((lowerQuery.includes('异常') || lowerQuery.includes('问题')) &&
        rule.intent.includes('异常')) {
      score += 15;
      matchedKeywords.push('异常');
    }

    // 物料编码匹配
    if (lowerQuery.match(/M\d{5}/) && rule.intent.includes('库存')) {
      score += 10;
      matchedKeywords.push('物料编码');
    }

    if (score > 0) {
      ruleScores.push({
        rule,
        score,
        matchedKeywords
      });
    }
  }

  // 按分数排序，返回得分最高的规则
  if (ruleScores.length > 0) {
    ruleScores.sort((a, b) => b.score - a.score);
    const bestMatch = ruleScores[0];
    console.log(`最佳匹配: ${bestMatch.rule.intent} (得分: ${bestMatch.score}, 匹配关键字: ${bestMatch.matchedKeywords.join(', ')})`);
    return bestMatch.rule;
  }

  return null;
}

/**
 * 从查询文本中提取参数 - 基于实际数据格式优化
 * @param {string} queryText - 用户输入
 * @param {object} rule - 匹配到的规则
 * @returns {Array|null} - 提取到的参数值数组，如果无法满足则返回null
 */
function extractParameters(queryText, rule) {
  const extractedParams = [];

  // 安全地解析参数定义 - 支持新的parameters字段
  let requiredParams = [];

  // 优先使用新的parameters字段
  if (rule.parameters) {
    console.log("原始参数字段:", rule.parameters);
    console.log("参数类型:", typeof rule.parameters);
    try {
      if (typeof rule.parameters === 'string') {
        requiredParams = JSON.parse(rule.parameters);
        console.log("解析后的参数:", requiredParams);
      } else if (Array.isArray(rule.parameters)) {
        requiredParams = rule.parameters;
        console.log("数组参数:", requiredParams);
      } else if (typeof rule.parameters === 'object' && rule.parameters !== null) {
        // MySQL JSON字段返回的是对象，直接使用
        requiredParams = Array.isArray(rule.parameters) ? rule.parameters : [rule.parameters];
        console.log("对象参数:", requiredParams);
      }
    } catch(e) {
      console.error("Invalid JSON for parameters:", rule.parameters);
      console.error("解析错误:", e.message);
    }
  }

  // 如果没有新字段，回退到旧字段
  if (requiredParams.length === 0 && rule.required_entities) {
    if (typeof rule.required_entities === 'string' && rule.required_entities.trim()) {
      try {
        requiredParams = JSON.parse(rule.required_entities);
      } catch(e) {
        console.error("Invalid JSON for required_entities:", rule.required_entities);
        return null;
      }
    } else if (Array.isArray(rule.required_entities)) {
      requiredParams = rule.required_entities;
    }
  }

  if (requiredParams.length === 0) {
    return [];
  }

  for (const param of requiredParams) {
    let paramValue = null;

    // 根据参数类型进行不同的提取 - 基于真实业务数据格式
    if (param.name === 'search_term') {
      // 通用搜索词匹配 - 支持物料编码、批次号、物料名称等
      const searchMatch =
        // 物料编码格式: CS-广1083, CS-B-第2236, CS-H类0360
        queryText.match(/CS-[A-Z]+-?[第]?\d+/i) ||
        queryText.match(/CS-[A-Z]类\d+/i) ||
        // 6位批次号: 105281, 411013, 844175
        queryText.match(/\b\d{6}\b/) ||
        // 物料名称: 电容, 电芯
        queryText.match(/(电容|电芯|电阻器|传感器)/i) ||
        // 供应商名称: 紫光, 广正, 黑龙
        queryText.match(/(紫光|广正|黑龙|欣旺|比亚迪|宁德时代)/i) ||
        // 工厂名称
        queryText.match(/(重庆工厂|深圳工厂|南昌工厂|宜宾工厂)/i);

      if (searchMatch) {
        paramValue = searchMatch[0];
      }
    } else if (param.name === 'batch_code') {
      // 匹配批次号 - 6位数字格式: 105281, 411013, 844175
      const batchMatch = queryText.match(/\b\d{6}\b/) ||
                        queryText.match(/批次\s*(\d{6})/i) ||
                        queryText.match(/批号\s*(\d{6})/i);
      if (batchMatch) {
        paramValue = batchMatch[0].match(/\d{6}/)[0];
      }
    } else if (param.name === 'material_code') {
      // 匹配物料编码 - 真实格式: CS-广1083, CS-B-第2236, CS-H类0360
      const materialMatch = queryText.match(/CS-[A-Z]+-?[第]?\d+/i) ||
                           queryText.match(/CS-[A-Z]类\d+/i) ||
                           queryText.match(/物料\s*(CS-[A-Z]+-?[第]?\d+)/i);
      if (materialMatch) {
        paramValue = materialMatch[0].replace(/物料\s*/, '');
      }
    } else if (param.name === 'material_name') {
      // 匹配物料名称 - 真实格式: 电容, 电芯
      const nameMatch = queryText.match(/(电容|电芯|电阻器|传感器)/i);
      if (nameMatch) {
        paramValue = nameMatch[1];
      }
    } else if (param.name === 'supplier_name') {
      // 匹配供应商名称 - 基于真实数据中的供应商: 紫光, 广正, 黑龙
      const supplierMatch = queryText.match(/(紫光|广正|黑龙|欣旺|比亚迪|宁德时代|富士康|立讯精密)/i);
      if (supplierMatch) {
        paramValue = supplierMatch[1];
      }
    } else if (param.name === 'factory' || param.name === 'factory_name') {
      // 匹配工厂名称 - 基于真实数据: 重庆工厂, 深圳工厂, 南昌工厂, 宜宾工厂
      const factoryMatch = queryText.match(/(重庆工厂|深圳工厂|南昌工厂|宜宾工厂)/i);
      if (factoryMatch) {
        paramValue = factoryMatch[1];
      }
    } else if (param.name === 'project_id') {
      // 匹配项目ID - 真实格式: KI4K, X6827, S665LN
      const projectMatch = queryText.match(/[A-Z]\d+[A-Z]*\d*/i) ||
                          queryText.match(/项目\s*([A-Z]\d+[A-Z]*)/i);
      if (projectMatch) {
        paramValue = projectMatch[0].replace(/项目\s*/, '');
      }
    } else if (param.name === 'baseline_id') {
      // 匹配基线ID - 真实格式: I6789基线, X6827基线
      const baselineMatch = queryText.match(/[A-Z]\d+基线/i) ||
                           queryText.match(/基线\s*([A-Z]\d+)/i);
      if (baselineMatch) {
        paramValue = baselineMatch[0];
      }
    } else {
      // 通用匹配：尝试提取可能的标识符
      const genericMatch =
        queryText.match(/CS-[A-Z]+-?[第]?\d+/i) ||
        queryText.match(/\b\d{6}\b/) ||
        queryText.match(/(电容|电芯|紫光|广正|黑龙|重庆工厂|深圳工厂)/i);
      if (genericMatch) {
        paramValue = genericMatch[0];
      }
    }

    if (paramValue) {
      extractedParams.push(paramValue);

      // 对于支持多字段模糊匹配的查询，需要为每个占位符提供相同的参数
      if (param.name === 'search_term' && rule.action_target) {
        // 计算SQL中的占位符数量
        const placeholderCount = (rule.action_target.match(/\?/g) || []).length;
        console.log(`SQL占位符数量: ${placeholderCount}, 当前参数: ${paramValue}`);

        // 为每个占位符添加相同的参数值
        for (let i = 1; i < placeholderCount; i++) {
          extractedParams.push(paramValue);
          console.log(`添加额外参数 ${i}: ${paramValue}`);
        }
      }
    } else {
      // 如果任何一个必需的参数没有找到，则认为提取失败
      console.log(`参数提取失败: ${param.name} 在查询 "${queryText}" 中未找到`);
      return null;
    }
  }

  console.log(`成功提取参数:`, extractedParams);
  return extractedParams;
}

/**
 * 格式化SQL查询结果为自然语言
 * @param {object} rule - 匹配到的规则
 * @param {Array<object>} results - SQL查询结果
 * @returns {string} - 格式化后的文本
 */
function formatResults(rule, results) {
  if (!results || results.length === 0) {
    return '没有找到相关数据。';
  }

  let responseText = `${rule.description}:\n`;
  
  // 将结果格式化为简单的键值对列表
  results.slice(0, 5).forEach((row, index) => { // 最多显示5条
    responseText += `\n记录 ${index + 1}:\n`;
    const entries = Object.entries(row);
    entries.slice(0, 8).forEach(([key, value]) => { // 最多显示8个字段
       if (value !== null && value !== '') {
        responseText += `  - ${key}: ${value}\n`;
      }
    });
  });

  if (results.length > 5) {
    responseText += `\n...还有 ${results.length - 5} 条记录未显示。`;
  }

  return responseText;
}


/**
 * 处理用户查询的核心函数 - 基于规则模板的智能问答
 * @param {string} queryText
 * @returns {Promise<Object>}
 */
export async function processQuery(queryText) {
  console.log(`🤖 开始处理查询: "${queryText}"`);

  if (intentRules.length === 0) {
    try {
      await loadIntentRules();
    } catch (error) {
       console.error("无法加载规则，将使用内存查询作为后备。", error.message);
    }
  }

  // 1. 智能意图识别 - 匹配最合适的规则模板
  const matchedRule = await intelligentIntentMatching(queryText);

  if (!matchedRule) {
    return {
      success: false,
      message: '抱歉，我无法理解您的问题。请尝试使用更具体的描述。',
      suggestions: generateQuerySuggestions(queryText)
    };
  }

  console.log(`🎯 匹配到规则: ${matchedRule.intent_name}`);

  // 2. 参数提取和数据查询
  const queryResult = await executeRuleBasedQuery(matchedRule, queryText);

  // 3. 格式化响应
  return await formatIntelligentResponse(queryResult, matchedRule, queryText);

    if (hasInMemoryData) {
      console.log(`正在使用内存数据处理风险查询: "${queryText}"`);
      console.log(`内存数据统计: 库存 ${inMemoryData.inventory.length} 条, 检验 ${inMemoryData.inspection.length} 条, 生产 ${inMemoryData.production.length} 条`);
      
      // 过滤风险状态的物料
      const riskItems = inMemoryData.inventory.filter(item => 
        item.status === '风险' || item.status === '异常'
      );
      
      if (riskItems.length > 0) {
        console.log(`找到 ${riskItems.length} 条风险物料记录`);
        return formatInventoryResults(riskItems);
      } else {
        console.log('没有找到风险物料记录');
        return '当前没有发现风险状态的物料。';
      }
    } else {
      console.log("内存数据为空，尝试使用规则查询。");
    }
  }

/**
 * 智能意图匹配 - 基于语义理解和关键词匹配
 * @param {string} queryText
 * @returns {Object|null}
 */
async function intelligentIntentMatching(queryText) {
  const queryLower = queryText.toLowerCase();
  let bestMatch = null;
  let maxScore = 0;

  // 预处理查询文本
  const cleanQuery = queryLower
    .replace(/[，。！？；：""''（）【】]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  console.log(`🔍 分析查询: "${cleanQuery}"`);

  for (const rule of intentRules) {
    let score = 0;

    // 1. 规则名称匹配 (权重最高)
    if (rule.intent_name && cleanQuery.includes(rule.intent_name.toLowerCase())) {
      score += 50;
    }

    // 2. 触发词匹配
    if (rule.trigger_words) {
      let triggerWords = [];

      // 处理不同格式的触发词
      if (Array.isArray(rule.trigger_words)) {
        triggerWords = rule.trigger_words;
      } else if (typeof rule.trigger_words === 'string') {
        // 如果是逗号分隔的字符串
        triggerWords = rule.trigger_words.split(',').map(w => w.trim());
      } else {
        try {
          triggerWords = JSON.parse(rule.trigger_words || '[]');
        } catch (e) {
          triggerWords = [];
        }
      }

      for (const word of triggerWords) {
        if (cleanQuery.includes(word.toLowerCase())) {
          score += 20;
        }
      }
    }

    // 3. 场景关键词匹配
    const sceneKeywords = extractSceneKeywords(cleanQuery);
    const ruleScene = determineRuleScene(rule);
    if (sceneKeywords.includes(ruleScene)) {
      score += 15;
    }

    // 4. 实体匹配 (供应商、物料、工厂等)
    const entities = extractEntities(cleanQuery);
    if (entities.length > 0) {
      score += entities.length * 5;
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatch = rule;
    }
  }

  console.log(`🎯 最佳匹配: ${bestMatch?.intent_name} (得分: ${maxScore})`);
  return maxScore > 10 ? bestMatch : null;
}

/**
 * 提取场景关键词
 */
function extractSceneKeywords(query) {
  const scenes = [];
  if (query.includes('库存') || query.includes('仓库') || query.includes('入库')) scenes.push('inventory');
  if (query.includes('测试') || query.includes('检验') || query.includes('ng') || query.includes('不合格')) scenes.push('testing');
  if (query.includes('上线') || query.includes('生产') || query.includes('产线') || query.includes('不良率')) scenes.push('online');
  if (query.includes('批次') || query.includes('batch')) scenes.push('batch');
  return scenes;
}

/**
 * 确定规则场景
 */
function determineRuleScene(rule) {
  if (!rule || !rule.intent_name) return 'general';
  const name = rule.intent_name.toLowerCase();
  if (name.includes('库存')) return 'inventory';
  if (name.includes('测试') || name.includes('ng')) return 'testing';
  if (name.includes('上线') || name.includes('生产')) return 'online';
  if (name.includes('批次')) return 'batch';
  return 'general';
}

/**
 * 提取实体信息
 */
function extractEntities(query) {
  const entities = [];

  // 供应商实体
  const suppliers = ['聚龙', '欣冠', '广正', '帝晶', '天马', 'boe', '华星', '百俊达', '奥海', '辰阳', '锂威', '风华', '维科', '东声', '瑞声', '歌尔', '丽德宝', '怡同', '富群'];
  suppliers.forEach(supplier => {
    if (query.includes(supplier.toLowerCase())) {
      entities.push({ type: 'supplier', value: supplier });
    }
  });

  // 物料实体
  const materials = ['电池盖', '中框', '手机卡托', '侧键', '装饰件', 'lcd显示屏', 'oled显示屏', '摄像头模组', '电池', '充电器', '喇叭', '听筒', '保护套', '标签', '包装盒'];
  materials.forEach(material => {
    if (query.includes(material.toLowerCase())) {
      entities.push({ type: 'material', value: material });
    }
  });

  // 工厂实体
  const factories = ['深圳工厂', '重庆工厂', '南昌工厂', '宜宾工厂'];
  factories.forEach(factory => {
    if (query.includes(factory.toLowerCase())) {
      entities.push({ type: 'factory', value: factory });
    }
  });

  return entities;
}

/**
 * 执行基于规则的数据查询
 * @param {Object} rule 匹配的规则
 * @param {string} queryText 原始查询文本
 * @returns {Promise<Object>}
 */
async function executeRuleBasedQuery(rule, queryText) {
  console.log(`📊 执行规则查询: ${rule.intent_name}`);

  try {
    // 确保数据库已初始化
    if (!db) {
      db = await initializeDatabase();
    }

    // 解析SQL查询模板
    let sqlQuery = rule.action_target;
    const parameters = extractQueryParameters(queryText, rule);

    console.log(`🔍 SQL查询: ${sqlQuery}`);
    console.log(`📋 参数: ${JSON.stringify(parameters)}`);

    // 执行查询
    const results = await db.sequelize.query(sqlQuery, {
      replacements: parameters,
      type: db.sequelize.QueryTypes.SELECT
    });

    console.log(`✅ 查询完成，返回 ${results ? results.length : 'undefined'} 条记录`);
    console.log(`🔍 查询结果类型: ${typeof results}`);
    console.log(`🔍 查询结果内容: ${JSON.stringify(results).substring(0, 200)}...`);

    return {
      success: true,
      data: results,
      rule: rule,
      parameters: parameters,
      query: sqlQuery
    };

  } catch (error) {
    console.error(`❌ 查询执行失败: ${error.message}`);

    // 回退到内存数据查询
    return await executeInMemoryQuery(rule, queryText);
  }
}

/**
 * 提取查询参数
 */
function extractQueryParameters(queryText, rule) {
  const parameters = {};
  const entities = extractEntities(queryText.toLowerCase());

  // 根据实体类型设置参数
  entities.forEach(entity => {
    switch (entity.type) {
      case 'supplier':
        parameters.supplier = entity.value;
        break;
      case 'material':
        parameters.material = entity.value;
        break;
      case 'factory':
        parameters.factory = entity.value;
        break;
    }
  });

  // 状态参数
  if (queryText.includes('风险')) parameters.status = '风险';
  if (queryText.includes('冻结')) parameters.status = '冻结';
  if (queryText.includes('正常')) parameters.status = '正常';

  // NG/OK参数
  if (queryText.includes('ng') || queryText.includes('不合格')) parameters.result = 'NG';
  if (queryText.includes('ok') || queryText.includes('合格')) parameters.result = 'OK';

  return parameters;
}

/**
 * 内存数据查询回退方案
 */
async function executeInMemoryQuery(rule, queryText) {
  console.log(`🔄 使用内存数据查询作为回退方案`);

  const hasInMemoryData = inMemoryData.inventory.length > 0 ||
                         inMemoryData.inspection.length > 0 ||
                         inMemoryData.production.length > 0;

  if (!hasInMemoryData) {
    return {
      success: false,
      message: '暂无数据，请先生成数据后再进行查询。'
    };
  }

  // 根据规则类型选择数据源
  let dataSource = [];
  const ruleName = rule.intent_name.toLowerCase();

  if (ruleName.includes('库存')) {
    dataSource = inMemoryData.inventory;
  } else if (ruleName.includes('测试') || ruleName.includes('ng')) {
    dataSource = inMemoryData.inspection;
  } else if (ruleName.includes('上线') || ruleName.includes('生产')) {
    dataSource = inMemoryData.production;
  } else {
    // 综合查询，合并所有数据
    dataSource = [...inMemoryData.inventory, ...inMemoryData.inspection, ...inMemoryData.production];
  }

  // 应用过滤条件
  const filteredData = applyQueryFilters(dataSource, queryText);

  return {
    success: true,
    data: filteredData.slice(0, 20), // 限制返回数量
    rule: rule,
    source: 'memory'
  };
}

/**
 * 应用查询过滤条件
 */
function applyQueryFilters(data, queryText) {
  const queryLower = queryText.toLowerCase();

  return data.filter(item => {
    // 供应商过滤
    if (queryLower.includes('聚龙') && !item.supplier_name?.includes('聚龙')) return false;
    if (queryLower.includes('天马') && !item.supplier_name?.includes('天马')) return false;
    if (queryLower.includes('boe') && !item.supplier_name?.toLowerCase().includes('boe')) return false;

    // 状态过滤
    if (queryLower.includes('风险') && item.status !== '风险') return false;
    if (queryLower.includes('冻结') && item.status !== '冻结') return false;
    if (queryLower.includes('正常') && item.status !== '正常') return false;

    // 物料过滤
    if (queryLower.includes('电池') && !item.material_name?.includes('电池')) return false;
    if (queryLower.includes('lcd') && !item.material_name?.toLowerCase().includes('lcd')) return false;

    // NG/OK过滤
    if (queryLower.includes('ng') && item.test_result !== 'NG') return false;
    if (queryLower.includes('ok') && item.test_result !== 'OK') return false;

    return true;
  });
}

/**
 * 格式化智能响应 - 统一的展示格式
 * @param {Object} queryResult 查询结果
 * @param {Object} rule 匹配的规则
 * @param {string} queryText 原始查询
 * @returns {Object}
 */
async function formatIntelligentResponse(queryResult, rule, queryText) {
  if (!queryResult.success) {
    return {
      success: false,
      data: {
        question: queryText,
        answer: queryResult.message || '查询失败，请稍后重试。',
        analysis: {
          type: 'error',
          intent: rule.intent_name,
          confidence: 0.5
        },
        template: 'error_response'
      }
    };
  }

  const data = queryResult.data || [];

  // 生成数据分析结果
  const analysisResult = generateDataAnalysis(data, rule, queryText);

  // 生成统计卡片
  const cards = await generateStatisticsCards(data, rule);

  // 格式化表格数据
  const tableData = formatTableData(data, rule);

  return {
    success: true,
    data: {
      question: queryText,
      answer: analysisResult.summary,
      analysis: {
        type: analysisResult.type,
        intent: rule.intent_name,
        entities: extractEntities(queryText),
        confidence: 0.9
      },
      template: determineTemplate(rule),
      tableData: tableData,
      cards: cards, // 前端期望的卡片格式
      summary: `基于规则"${rule.intent_name}"查询完成，共找到 ${data.length} 条记录`,
      metadata: {
        dataSource: queryResult.source || 'database',
        rule: rule.intent_name,
        timestamp: new Date().toISOString(),
        processingTime: Date.now()
      }
    }
  };
}

/**
 * 生成数据分析结果
 */
function generateDataAnalysis(data, rule, queryText) {
  const ruleName = rule.intent_name.toLowerCase();
  let type = 'general';
  let summary = '';

  if (ruleName.includes('库存')) {
    type = 'inventory';
    const totalQuantity = data.reduce((sum, item) => sum + (parseInt(item.数量 || item.quantity || 0)), 0);
    const normalCount = data.filter(item => (item.状态 || item.status) === '正常').length;
    const riskCount = data.filter(item => (item.状态 || item.status) === '风险').length;

    summary = `根据您的查询"${queryText}"，找到了 ${data.length} 条库存记录。总库存数量为 ${totalQuantity} 件，其中正常状态 ${normalCount} 条，风险状态 ${riskCount} 条。`;
  } else if (ruleName.includes('测试') || ruleName.includes('ng')) {
    type = 'testing';
    const okCount = data.filter(item => (item.测试结果 || item.test_result) === 'OK').length;
    const ngCount = data.filter(item => (item.测试结果 || item.test_result) === 'NG').length;
    const passRate = data.length > 0 ? ((okCount / data.length) * 100).toFixed(1) : 0;

    summary = `根据您的查询"${queryText}"，找到了 ${data.length} 条测试记录。合格 ${okCount} 条，不合格 ${ngCount} 条，合格率为 ${passRate}%。`;
  } else if (ruleName.includes('上线') || ruleName.includes('生产')) {
    type = 'online';
    const avgDefectRate = data.length > 0 ?
      (data.reduce((sum, item) => sum + parseFloat(item.不良率 || item.defect_rate || 0), 0) / data.length).toFixed(2) : 0;

    summary = `根据您的查询"${queryText}"，找到了 ${data.length} 条上线记录。平均不良率为 ${avgDefectRate}%。`;
  } else {
    summary = `根据您的查询"${queryText}"，找到了 ${data.length} 条相关记录。`;
  }

  return { type, summary };
}

/**
 * 生成关键指标
 */
function generateKeyMetrics(data, rule) {
  const metrics = [];
  const ruleName = rule.intent_name.toLowerCase();

  // 总记录数
  metrics.push({
    label: '总记录数',
    value: data.length,
    trend: 'stable'
  });

  if (ruleName.includes('库存')) {
    const normalCount = data.filter(item => (item.状态 || item.status) === '正常').length;
    const riskCount = data.filter(item => (item.状态 || item.status) === '风险').length;
    const frozenCount = data.filter(item => (item.状态 || item.status) === '冻结').length;

    metrics.push(
      { label: '正常状态', value: normalCount, trend: 'up' },
      { label: '风险状态', value: riskCount, trend: riskCount > 0 ? 'down' : 'stable' },
      { label: '冻结状态', value: frozenCount, trend: frozenCount > 0 ? 'down' : 'stable' }
    );
  } else if (ruleName.includes('测试')) {
    const okCount = data.filter(item => (item.测试结果 || item.test_result) === 'OK').length;
    const ngCount = data.filter(item => (item.测试结果 || item.test_result) === 'NG').length;

    metrics.push(
      { label: '合格数量', value: okCount, trend: 'up' },
      { label: '不合格数量', value: ngCount, trend: ngCount > 0 ? 'down' : 'stable' }
    );
  } else if (ruleName.includes('上线')) {
    const avgDefectRate = data.length > 0 ?
      (data.reduce((sum, item) => sum + parseFloat(item.不良率 || item.defect_rate || 0), 0) / data.length).toFixed(2) : 0;

    metrics.push(
      { label: '平均不良率', value: `${avgDefectRate}%`, trend: avgDefectRate > 5 ? 'down' : 'up' }
    );
  }

  return metrics;
}

/**
 * 格式化表格数据
 */
function formatTableData(data, rule) {
  if (!data) return [];

  // 确保data是数组
  const dataArray = Array.isArray(data) ? data : [data];
  if (dataArray.length === 0) return [];

  const ruleName = rule.intent_name.toLowerCase();

  // 根据规则类型确定字段映射
  if (ruleName.includes('库存')) {
    return dataArray.map(item => ({
      工厂: item.storage_location || item.工厂 || item.factory || '',
      仓库: item.storage_location || item.仓库 || item.warehouse || '',
      物料编码: item.material_code || item.物料编码 || '',
      物料名称: item.material_name || item.物料名称 || '',
      供应商: item.supplier_name || item.供应商 || '',
      数量: item.quantity || item.数量 || 0,
      状态: item.status || item.状态 || '',
      入库时间: item.inbound_time || item.入库时间 || '',
      到期时间: item.expiry_date || item.到期时间 || '',
      备注: item.notes || item.备注 || ''
    }));
  } else if (ruleName.includes('测试')) {
    return dataArray.map(item => ({
      测试编号: item.test_id || item.测试编号 || '',
      日期: item.test_date || item.日期 || '',
      项目: item.project || item.项目 || '',
      基线: item.baseline || item.基线 || '',
      物料编码: item.material_code || item.物料编码 || '',
      数量: item.quantity || item.数量 || 0,
      物料名称: item.material_name || item.物料名称 || '',
      供应商: item.supplier_name || item.供应商 || '',
      测试结果: item.test_result || item.测试结果 || '',
      不合格描述: item.defect_description || item.不合格描述 || '',
      备注: item.notes || item.备注 || ''
    }));
  } else if (ruleName.includes('上线')) {
    return dataArray.map(item => ({
      工厂: item.factory || item.工厂 || '',
      基线: item.baseline || item.基线 || '',
      项目: item.project || item.项目 || '',
      物料编码: item.material_code || item.物料编码 || '',
      物料名称: item.material_name || item.物料名称 || '',
      供应商: item.supplier_name || item.供应商 || '',
      批次号: item.batch_no || item.批次号 || '',
      不良率: item.defect_rate || item.不良率 || '',
      本周异常: item.weekly_anomalies || item.本周异常 || '',
      检验日期: item.inspection_date || item.检验日期 || '',
      备注: item.notes || item.备注 || ''
    }));
  }

  // 默认格式化
  return dataArray.slice(0, 10);
}

/**
 * 确定模板类型
 */
function determineTemplate(rule) {
  const ruleName = rule.intent_name.toLowerCase();
  if (ruleName.includes('库存')) return 'inventory_query';
  if (ruleName.includes('测试')) return 'testing_query';
  if (ruleName.includes('上线')) return 'online_query';
  if (ruleName.includes('批次')) return 'batch_query';
  return 'general_query';
}

/**
 * 生成查询建议
 */
function generateQuerySuggestions(queryText) {
  return [
    '查询物料库存信息',
    '查询BOE供应商的物料',
    '查询风险状态的库存',
    '查询测试失败(NG)的记录',
    '查询LCD显示屏测试情况'
  ];
}

/**
 * 生成统计卡片
 * @param {Array} data 查询数据
 * @param {Object} rule 规则对象
 * @returns {Promise<Array>} 卡片数组
 */
async function generateStatisticsCards(data, rule) {
  console.log(`🎯 生成统计卡片 - 规则: ${rule.intent_name}, 数据量: ${data.length}`);

  const ruleName = rule.intent_name.toLowerCase();

  // 根据规则类型生成不同的卡片
  if (ruleName.includes('库存')) {
    return generateInventoryScenarioCards(data);
  } else if (ruleName.includes('测试')) {
    return generateTestingScenarioCards(data);
  } else if (ruleName.includes('上线') || ruleName.includes('生产')) {
    return generateOnlineScenarioCards(data);
  } else {
    return generateGeneralScenarioCards(data);
  }
}

/**
 * 生成库存场景卡片
 */
function generateInventoryScenarioCards(data) {
  console.log('📦 生成库存场景卡片');

  if (!data || data.length === 0) {
    return [];
  }

  // 统计数据
  const materialTypes = new Set();
  const batchCodes = new Set();
  const suppliers = new Set();
  let riskCount = 0;
  let frozenCount = 0;

  data.forEach(item => {
    if (item.物料名称 || item.material_name) {
      materialTypes.add(item.物料名称 || item.material_name);
    }
    if (item.批次号 || item.batch_code) {
      batchCodes.add(item.批次号 || item.batch_code);
    }
    if (item.供应商 || item.supplier_name) {
      suppliers.add(item.供应商 || item.supplier_name);
    }
    if ((item.状态 || item.status) === '风险') {
      riskCount++;
    }
    if ((item.状态 || item.status) === '冻结') {
      frozenCount++;
    }
  });

  const cards = [
    {
      title: '物料/批次',
      value: materialTypes.size,
      subtitle: `${batchCodes.size}个批次`,
      type: 'info',
      icon: '📦',
      color: '#409EFF'
    },
    {
      title: '供应商',
      value: suppliers.size,
      subtitle: '数量统计',
      type: 'success',
      icon: '🏢',
      color: '#67C23A'
    },
    {
      title: '风险库存',
      value: riskCount,
      subtitle: `${riskCount}条记录`,
      type: 'warning',
      icon: '⚠️',
      color: '#E6A23C'
    },
    {
      title: '冻结库存',
      value: frozenCount,
      subtitle: `${frozenCount}条记录`,
      type: 'danger',
      icon: '🔒',
      color: '#F56C6C'
    }
  ];

  console.log(`✅ 生成了 ${cards.length} 个统计卡片:`, cards.map(c => c.title));
  return cards;
}

/**
 * 生成测试场景卡片
 */
function generateTestingScenarioCards(data) {
  console.log('🧪 生成测试场景卡片');

  if (!data || data.length === 0) {
    return [];
  }

  // 统计数据
  const materialTypes = new Set();
  const batchCodes = new Set();
  const suppliers = new Set();
  const projects = new Set();
  let okCount = 0;
  let ngCount = 0;

  data.forEach(item => {
    if (item.物料名称 || item.material_name) {
      materialTypes.add(item.物料名称 || item.material_name);
    }
    if (item.批次号 || item.batch_code) {
      batchCodes.add(item.批次号 || item.batch_code);
    }
    if (item.供应商 || item.supplier_name) {
      suppliers.add(item.供应商 || item.supplier_name);
    }
    if (item.项目 || item.project_id) {
      projects.add(item.项目 || item.project_id);
    }
    if ((item.测试结果 || item.test_result) === 'OK') {
      okCount++;
    }
    if ((item.测试结果 || item.test_result) === 'NG') {
      ngCount++;
    }
  });

  const cards = [
    {
      title: '物料/批次',
      value: materialTypes.size,
      subtitle: `${batchCodes.size}个批次`,
      type: 'info',
      icon: '📦',
      color: '#409EFF'
    },
    {
      title: '项目',
      value: projects.size,
      subtitle: '参与项目',
      type: 'primary',
      icon: '🎯',
      color: '#606266'
    },
    {
      title: '供应商',
      value: suppliers.size,
      subtitle: '参与测试',
      type: 'success',
      icon: '🏢',
      color: '#67C23A'
    },
    {
      title: 'NG批次',
      value: ngCount,
      subtitle: `${ngCount}次NG`,
      type: ngCount > 0 ? 'danger' : 'success',
      icon: '❌',
      color: ngCount > 0 ? '#F56C6C' : '#67C23A'
    }
  ];

  console.log(`✅ 生成了 ${cards.length} 个统计卡片:`, cards.map(c => c.title));
  return cards;
}

/**
 * 生成上线场景卡片
 */
function generateOnlineScenarioCards(data) {
  console.log('🚀 生成上线场景卡片');

  if (!data || data.length === 0) {
    return [];
  }

  // 统计数据
  const materialTypes = new Set();
  const batchCodes = new Set();
  const suppliers = new Set();
  const projects = new Set();
  let totalDefectRate = 0;
  let highDefectCount = 0;

  data.forEach(item => {
    if (item.物料名称 || item.material_name) {
      materialTypes.add(item.物料名称 || item.material_name);
    }
    if (item.批次号 || item.batch_code) {
      batchCodes.add(item.批次号 || item.batch_code);
    }
    if (item.供应商 || item.supplier_name) {
      suppliers.add(item.供应商 || item.supplier_name);
    }
    if (item.项目 || item.project_id) {
      projects.add(item.项目 || item.project_id);
    }

    const defectRate = item.不良率 || item.defect_rate || 0;
    totalDefectRate += defectRate;
    if (defectRate > 3) {
      highDefectCount++;
    }
  });

  const avgDefectRate = data.length > 0 ? (totalDefectRate / data.length).toFixed(1) : 0;

  const cards = [
    {
      title: '物料/批次',
      value: materialTypes.size,
      subtitle: `${batchCodes.size}个批次`,
      type: 'info',
      icon: '📦',
      color: '#409EFF'
    },
    {
      title: '项目',
      value: projects.size,
      subtitle: '参与项目',
      type: 'primary',
      icon: '🎯',
      color: '#606266'
    },
    {
      title: '供应商',
      value: suppliers.size,
      subtitle: '参与生产',
      type: 'success',
      icon: '🏢',
      color: '#67C23A'
    },
    {
      title: '不良率',
      value: `${avgDefectRate}%`,
      subtitle: `${highDefectCount}批次>3%`,
      type: avgDefectRate > 3 ? 'danger' : 'success',
      icon: '📊',
      color: avgDefectRate > 3 ? '#F56C6C' : '#67C23A'
    }
  ];

  console.log(`✅ 生成了 ${cards.length} 个统计卡片:`, cards.map(c => c.title));
  return cards;
}

/**
 * 生成通用场景卡片
 */
function generateGeneralScenarioCards(data) {
  console.log('📊 生成通用场景卡片');

  if (!data || data.length === 0) {
    return [];
  }

  const cards = [
    {
      title: '查询结果',
      value: data.length,
      subtitle: '条记录',
      type: 'info',
      icon: '📋',
      color: '#409EFF'
    }
  ];

  console.log(`✅ 生成了 ${cards.length} 个统计卡片:`, cards.map(c => c.title));
  return cards;
}
 