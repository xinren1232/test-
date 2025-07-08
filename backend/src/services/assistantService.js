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
      intent: rule.intent_name,
      keywords: rule.intent_name.split(',').map(k => k.trim().toLowerCase()), // 支持逗号分隔的关键字
      required_entities: rule.parameters, // 保持字段名一致
      response_format: '查询结果如下：', // 示例格式
      target_page: null, // 示例
      action: rule.action_target, // SQL查询或API端点
      description: rule.description,
      action_type: rule.action_type,
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
 * 处理用户查询的核心函数
 * @param {string} queryText
 * @returns {Promise<string>}
 */
export async function processQuery(queryText) {
  if (intentRules.length === 0) {
    try {
      await loadIntentRules();
    } catch (error) {
       console.error("无法加载规则，将使用内存查询作为后备。", error.message);
    }
  }

  // 检查是否包含"风险"或"高风险"关键词，如果包含，直接使用内存查询
  const queryLower = queryText.toLowerCase();
  if (queryLower.includes('风险') || queryLower.includes('高风险')) {
    console.log('检测到风险查询关键词，优先使用内存数据处理');
    
    // 优先使用内存数据进行查询
    const hasInMemoryData = inMemoryData.inventory.length > 0 ||
                          inMemoryData.inspection.length > 0 ||
                          inMemoryData.production.length > 0;

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

  // 先匹配意图规则，这样内存查询时也可以使用
  const matchedRule = matchIntent(queryText);

  // 优先使用内存数据进行查询
  const hasInMemoryData = inMemoryData.inventory.length > 0 ||
                         inMemoryData.inspection.length > 0 ||
                         inMemoryData.production.length > 0;

  if (hasInMemoryData) {
    console.log(`正在使用内存数据处理查询: "${queryText}"`);
    console.log(`内存数据统计: 库存 ${inMemoryData.inventory.length} 条, 检验 ${inMemoryData.inspection.length} 条, 生产 ${inMemoryData.production.length} 条`);
    try {
      // 传递matchedRule参数给processInMemoryQuery函数
      const memoryResult = await processInMemoryQuery(queryText, matchedRule);
      if (memoryResult) { // 如果内存查询有结果，直接返回
        return memoryResult;
      }
      console.log("内存查询未返回有效结果，将尝试数据库查询。")
    } catch (error) {
      console.error('内存查询失败，回退到数据库查询:', error);
    }
  } else {
      console.log("内存数据为空，跳过内存查询。");
  }

  if (!matchedRule) {
    return '抱歉，我暂时无法理解您的问题。您可以试试问我："有哪些物料当前是高风险？"';
  }

  // 验证matchedRule是否有效
  if (!matchedRule.action || typeof matchedRule.action !== 'string' || !matchedRule.action.trim()) {
    console.error('无效的SQL查询:', matchedRule.action);
    return '在处理您的请求时遇到了配置错误。';
  }

  let queryValues = extractParameters(queryText, matchedRule);

  if (queryValues === null) {
      // 尝试解析参数定义
      let requiredParams = [];
      try {
          if (typeof matchedRule.required_entities === 'string' && matchedRule.required_entities.trim()) {
            requiredParams = JSON.parse(matchedRule.required_entities);
          } else if (Array.isArray(matchedRule.required_entities)) {
            requiredParams = matchedRule.required_entities;
          }
      } catch(e) { /* ignore */ }
      
      if (requiredParams.length > 0) {
        const paramNames = requiredParams.map(p => p.name).join(', ');
        return `我理解您想'${matchedRule.intent}'，但需要您提供以下参数: ${paramNames}。`;
      }
  }

  try {
    // 确保数据库已初始化
    if (!db) {
      db = await initializeDatabase();
    }

    // 在函数内部访问sequelize实例
    const { sequelize } = db;
    
    // 确保查询值是数组
    const safeQueryValues = Array.isArray(queryValues) ? queryValues : [];
    
    // 执行SQL查询前进行最后的安全检查
    if (!matchedRule.action.includes('?') && safeQueryValues.length > 0) {
      console.warn('SQL查询中没有参数占位符，但提供了参数值');
    }
    
    const results = await sequelize.query(matchedRule.action, {
      replacements: safeQueryValues, // 使用 replacements 来安全地替换 '?'
      type: QueryTypes.SELECT,
    });
    
    return formatResults(matchedRule, results);

  } catch (error) {
    console.error(`Error executing action for intent "${matchedRule?.intent}":`, error);
    return '在处理您的请求时遇到了内部错误。';
  }
}
 