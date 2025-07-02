/**
 * 增强的NLP服务 - 基于用户GPT方案设计
 * 实现动态数据问答的核心逻辑流程
 */

// import { getAllMaterials, getAllSuppliers } from '../../ai-inspection-dashboard/src/data/MaterialSupplierMap.js';

// 基于真实数据字段的全面意图规则配置
const enhancedIntentRules = [
  // 1. 库存查询规则组
  {
    intent: "query_inventory_general",
    keywords: ["库存", "查库存", "库存情况", "物料库存", "查询库存", "库存查询"],
    examples: ["查询电池盖的库存", "查询BOE供应商的物料", "查询深圳工厂的库存情况"],
    action: "memory_query",
    target: "inventory",
    description: "通用库存查询，支持按物料、供应商、工厂筛选",
    fuzzyMatch: true,
    parameters: {
      materialName: { type: "fuzzy", source: "query" },
      supplier: { type: "fuzzy", source: "query" },
      factory: { type: "fuzzy", source: "query" },
      status: { type: "exact", source: "query" }
    }
  },

  // 1.0 直接物料名称查询 - 新增规则
  {
    intent: "query_material_by_name",
    keywords: ["查询", "OLED显示屏", "电池盖", "中框", "手机卡托", "侧键", "装饰件", "LCD显示屏", "摄像头模组", "电池", "充电器", "扬声器", "听筒", "保护套", "标签", "包装盒", "显示屏", "卡托", "模组"],
    examples: ["查询OLED显示屏", "查询电池盖", "查询中框", "OLED显示屏的库存", "中框的库存"],
    action: "memory_query",
    target: "inventory",
    description: "直接按物料名称查询库存",
    fuzzyMatch: true,
    parameters: {
      materialName: { type: "fuzzy", source: "query" }
    }
  },

  // 1.1 按物料编码查询
  {
    intent: "query_inventory_by_code",
    keywords: ["物料编码", "编码", "料号", "物料号"],
    examples: ["查询物料编码DS-O001的库存", "编码CAM001的库存情况"],
    action: "memory_query",
    target: "inventory",
    description: "按物料编码查询库存",
    fuzzyMatch: true,
    parameters: {
      materialCode: { type: "fuzzy", source: "query" }
    }
  },

  // 1.2 按物料类别查询
  {
    intent: "query_inventory_by_type",
    keywords: ["物料类别", "类别", "光学类", "结构件类", "声学类", "充电类", "包材类", "光学类物料", "结构件类物料", "声学类物料", "充电类物料", "包材类物料"],
    examples: ["查询光学类物料的库存", "结构件类物料有哪些", "查询光学类物料", "查询结构件类物料"],
    action: "memory_query",
    target: "inventory",
    description: "按物料类别查询库存",
    fuzzyMatch: true,
    parameters: {
      materialType: { type: "fuzzy", source: "query" }
    }
  },

  // 1.3 按批次号查询
  {
    intent: "query_inventory_by_batch",
    keywords: ["批次", "批次号", "批号"],
    examples: ["查询批次BOE2024001的库存", "批号JL2024002的情况"],
    action: "memory_query",
    target: "inventory",
    description: "按批次号查询库存",
    fuzzyMatch: true,
    parameters: {
      batchNo: { type: "fuzzy", source: "query" }
    }
  },

  // 1.4 按仓库查询
  {
    intent: "query_inventory_by_warehouse",
    keywords: ["仓库", "库房", "中央库存", "深圳库存", "重庆库存", "宜宾库存", "南昌库存"],
    examples: ["查询中央库存的物料", "深圳库存有什么"],
    action: "memory_query",
    target: "inventory",
    description: "按仓库查询库存",
    fuzzyMatch: true,
    parameters: {
      warehouse: { type: "fuzzy", source: "query" }
    }
  },

  // 1.5 按数量范围查询
  {
    intent: "query_inventory_by_quantity",
    keywords: ["数量", "库存量", "库存数量", "数量少", "数量多", "库存不足", "库存充足"],
    examples: ["查询库存数量少的物料", "数量超过1000的库存"],
    action: "memory_query",
    target: "inventory",
    description: "按库存数量查询",
    fuzzyMatch: true,
    parameters: {
      quantityCondition: { type: "fuzzy", source: "query" }
    }
  },

  // 1.6 按入库时间查询
  {
    intent: "query_inventory_by_inbound_time",
    keywords: ["入库时间", "入库日期", "最近入库", "新入库", "入库"],
    examples: ["查询最近入库的物料", "今天入库的物料有哪些"],
    action: "memory_query",
    target: "inventory",
    description: "按入库时间查询库存",
    fuzzyMatch: true,
    parameters: {
      inboundTime: { type: "fuzzy", source: "query" }
    }
  },

  // 1.7 按过期时间查询
  {
    intent: "query_inventory_by_expiry",
    keywords: ["过期", "过期时间", "保质期", "即将过期", "已过期"],
    examples: ["查询即将过期的物料", "有哪些已过期的库存"],
    action: "memory_query",
    target: "inventory",
    description: "按过期时间查询库存",
    fuzzyMatch: true,
    parameters: {
      expiryDate: { type: "fuzzy", source: "query" }
    }
  },

  // 2. 库存状态查询规则组
  {
    intent: "query_risk_inventory",
    keywords: ["风险库存", "高风险", "异常库存", "风险物料", "风险状态"],
    examples: ["目前有哪些风险库存？", "查询高风险的物料", "异常库存情况"],
    action: "memory_query",
    target: "inventory",
    description: "查询风险状态的库存物料",
    fuzzyMatch: false,
    parameters: {
      status: { type: "fixed", value: "风险" }
    }
  },

  {
    intent: "query_frozen_inventory",
    keywords: ["冻结库存", "冻结物料", "冻结状态"],
    examples: ["有哪些冻结的物料？", "查询冻结库存"],
    action: "memory_query",
    target: "inventory",
    description: "查询冻结状态的库存物料",
    fuzzyMatch: false,
    parameters: {
      status: { type: "fixed", value: "冻结" }
    }
  },

  {
    intent: "query_normal_inventory",
    keywords: ["正常库存", "正常物料", "正常状态"],
    examples: ["查询正常状态的库存", "有哪些正常的物料"],
    action: "memory_query",
    target: "inventory",
    description: "查询正常状态的库存物料",
    fuzzyMatch: false,
    parameters: {
      status: { type: "fixed", value: "正常" }
    }
  },

  // 3. 检验测试查询规则组
  {
    intent: "query_test_results",
    keywords: ["测试结果", "检测结果", "实验结果", "测试报告", "检验结果"],
    examples: ["查询批次BOE2024001的测试结果", "查询OLED显示屏的测试结果"],
    action: "memory_query",
    target: "inspection",
    description: "查询测试检验结果",
    fuzzyMatch: true,
    parameters: {
      materialName: { type: "fuzzy", source: "query" },
      batchNo: { type: "fuzzy", source: "query" },
      supplier: { type: "fuzzy", source: "query" }
    }
  },

  {
    intent: "query_failed_tests",
    keywords: ["不合格", "不良测试", "测试不良", "失败测试", "测试异常", "FAIL", "NG", "测试不合格", "不合格的记录", "哪些测试不合格"],
    examples: ["有哪些测试不合格的记录？", "查询测试不良的批次", "测试不合格的记录"],
    action: "memory_query",
    target: "inspection",
    description: "查询不合格的测试记录",
    fuzzyMatch: false,
    parameters: {
      testResult: { type: "fixed", value: "FAIL" }
    }
  },

  {
    intent: "query_passed_tests",
    keywords: ["合格测试", "测试合格", "通过测试", "PASS", "OK"],
    examples: ["查询测试合格的记录", "有哪些通过测试的批次"],
    action: "memory_query",
    target: "inspection",
    description: "查询合格的测试记录",
    fuzzyMatch: false,
    parameters: {
      testResult: { type: "fixed", value: "PASS" }
    }
  },

  {
    intent: "query_test_by_date",
    keywords: ["测试日期", "测试时间", "最近测试", "今天测试", "昨天测试"],
    examples: ["查询今天的测试记录", "最近测试的物料有哪些"],
    action: "memory_query",
    target: "inspection",
    description: "按测试日期查询",
    fuzzyMatch: true,
    parameters: {
      testDate: { type: "fuzzy", source: "query" }
    }
  },

  {
    intent: "query_defect_description",
    keywords: ["不良描述", "缺陷描述", "问题描述", "不良现象"],
    examples: ["查询有不良描述的测试记录", "什么不良现象最多"],
    action: "memory_query",
    target: "inspection",
    description: "查询包含不良描述的测试记录",
    fuzzyMatch: true,
    parameters: {
      defectDescription: { type: "fuzzy", source: "query" }
    }
  },

  // 4. 生产上线查询规则组
  {
    intent: "query_production",
    keywords: ["生产情况", "产线情况", "上线情况", "生产数据", "上线跟踪", "显示生产", "所有生产", "生产记录", "生产列表"],
    examples: ["查询深圳工厂的生产情况", "查询产线01的生产数据", "显示所有生产记录", "查看生产数据"],
    action: "memory_query",
    target: "production",
    description: "查询生产上线情况",
    fuzzyMatch: true,
    parameters: {
      factory: { type: "fuzzy", source: "query" },
      line: { type: "fuzzy", source: "query" },
      materialName: { type: "fuzzy", source: "query" }
    }
  },

  {
    intent: "query_high_defect_rate",
    keywords: ["高不良率", "不良率高", "质量问题", "生产异常", "不良率超标"],
    examples: ["有哪些高不良率的生产记录？", "查询不良率超标的批次"],
    action: "memory_query",
    target: "production",
    description: "查询高不良率的生产记录",
    fuzzyMatch: false,
    parameters: {
      defectRateThreshold: { type: "fixed", value: 5.0 }
    }
  },

  {
    intent: "query_low_defect_rate",
    keywords: ["低不良率", "不良率低", "质量好", "优质生产"],
    examples: ["查询不良率低的生产记录", "质量表现好的批次"],
    action: "memory_query",
    target: "production",
    description: "查询低不良率的生产记录",
    fuzzyMatch: false,
    parameters: {
      defectRateThreshold: { type: "fixed", value: 2.0 }
    }
  },

  {
    intent: "query_production_by_line",
    keywords: ["产线", "生产线", "产线01", "产线02", "产线03"],
    examples: ["查询产线01的生产情况", "产线02今天生产了什么"],
    action: "memory_query",
    target: "production",
    description: "按生产线查询生产情况",
    fuzzyMatch: true,
    parameters: {
      line: { type: "fuzzy", source: "query" }
    }
  },

  {
    intent: "query_production_by_time",
    keywords: ["上线时间", "生产时间", "最近上线", "今天上线", "昨天上线"],
    examples: ["查询今天上线的物料", "最近上线的批次有哪些"],
    action: "memory_query",
    target: "production",
    description: "按上线时间查询生产情况",
    fuzzyMatch: true,
    parameters: {
      onlineTime: { type: "fuzzy", source: "query" }
    }
  },

  {
    intent: "query_production_defects",
    keywords: ["生产不良", "不良现象", "生产缺陷", "质量缺陷"],
    examples: ["查询有不良现象的生产记录", "生产缺陷有哪些类型"],
    action: "memory_query",
    target: "production",
    description: "查询包含不良现象的生产记录",
    fuzzyMatch: true,
    parameters: {
      defect: { type: "fuzzy", source: "query" }
    }
  },

  // 5. 项目基线查询规则组
  {
    intent: "query_by_project",
    keywords: ["项目查询", "基线查询", "项目情况", "基线情况", "项目数据"],
    examples: ["查询项目X6827的情况", "查询基线I6789的数据"],
    action: "memory_query",
    target: "production",
    description: "按项目ID或基线查询相关数据",
    fuzzyMatch: true,
    parameters: {
      projectId: { type: "fuzzy", source: "query" }
    }
  },

  {
    intent: "query_project_summary",
    keywords: ["项目汇总", "项目统计", "项目概况", "项目总览"],
    examples: ["项目数据汇总", "各项目的进展情况"],
    action: "memory_summary",
    target: "project",
    description: "按项目汇总统计数据",
    fuzzyMatch: false,
    parameters: {}
  },

  // 6. 统计汇总查询规则组
  {
    intent: "summarize_by_factory",
    keywords: ["工厂统计", "工厂汇总", "工厂概况", "工厂总览", "工厂表现", "工厂数据"],
    examples: ["工厂数据汇总", "各工厂的表现情况", "工厂统计报告"],
    action: "memory_summary",
    target: "factory",
    description: "按工厂汇总统计数据",
    fuzzyMatch: false,
    parameters: {}
  },

  {
    intent: "summarize_by_supplier",
    keywords: ["供应商统计", "供应商汇总", "供应商概况", "供应商总览", "供应商表现", "供应商数据"],
    examples: ["供应商数据统计", "各供应商的表现情况", "供应商统计报告", "供应商汇总统计"],
    action: "memory_summary",
    target: "supplier",
    description: "按供应商汇总统计数据",
    fuzzyMatch: true,
    parameters: {}
  },

  {
    intent: "summarize_by_material_type",
    keywords: ["物料类别统计", "类别汇总", "物料类型统计"],
    examples: ["按物料类别统计库存", "各类别物料的情况"],
    action: "memory_summary",
    target: "materialType",
    description: "按物料类别汇总统计数据",
    fuzzyMatch: false,
    parameters: {}
  },

  {
    intent: "overall_summary",
    keywords: ["总体概况", "系统概况", "整体统计", "全局统计", "数据概览", "系统数据总览", "数据总览", "总览", "概况"],
    examples: ["系统总体概况", "整体数据统计", "全局数据概览", "系统数据总览"],
    action: "memory_summary",
    target: "overall",
    description: "生成系统整体数据概况",
    fuzzyMatch: true,
    parameters: {}
  },

  // 7. 复合查询规则组
  {
    intent: "query_supplier_factory_inventory",
    keywords: ["供应商", "工厂", "库存"],
    examples: ["查询BOE供应商在深圳工厂的库存", "聚龙供应商重庆工厂的物料"],
    action: "memory_query",
    target: "inventory",
    description: "按供应商和工厂组合查询库存",
    fuzzyMatch: true,
    parameters: {
      supplier: { type: "fuzzy", source: "query" },
      factory: { type: "fuzzy", source: "query" }
    }
  },

  {
    intent: "query_material_test_production",
    keywords: ["物料", "测试", "生产"],
    examples: ["查询OLED显示屏的测试和生产情况", "电池盖的检验和上线数据"],
    action: "memory_query",
    target: "all",
    description: "查询物料的测试和生产综合情况",
    fuzzyMatch: true,
    parameters: {
      materialName: { type: "fuzzy", source: "query" }
    }
  },

  {
    intent: "query_batch_full_trace",
    keywords: ["批次追溯", "全链路", "批次跟踪"],
    examples: ["追溯批次BOE2024001的全链路", "批次JL2024002的完整情况"],
    action: "memory_query",
    target: "all",
    description: "批次全链路追溯查询",
    fuzzyMatch: true,
    parameters: {
      batchNo: { type: "fuzzy", source: "query" }
    }
  }
];

/**
 * 增强的意图匹配算法
 * @param {string} queryText - 用户查询文本
 * @returns {object|null} 匹配的规则
 */
export function enhancedIntentMatching(queryText) {
  const queryLower = queryText.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const rule of enhancedIntentRules) {
    let score = 0;
    let matchedKeywords = 0;

    // 关键词匹配
    for (const keyword of rule.keywords) {
      if (queryLower.includes(keyword.toLowerCase())) {
        matchedKeywords++;
        score += keyword.length; // 长关键词权重更高
      }
    }

    // 计算匹配分数
    if (matchedKeywords > 0) {
      score = score * matchedKeywords / rule.keywords.length;
      
      // 如果当前分数更高，更新最佳匹配
      if (score > bestScore) {
        bestScore = score;
        bestMatch = rule;
      }
    }
  }

  // 只有分数足够高才返回匹配结果 - 降低阈值以提高匹配率
  if (bestScore > 0.4) {  // 降低阈值从0.5到0.4，提高匹配率
    console.log(`🎯 意图匹配成功: ${bestMatch.intent} (分数: ${bestScore})`);
    return bestMatch;
  }

  console.log(`⚠️ 未找到匹配的意图 (最高分数: ${bestScore})`);
  return null;
}

/**
 * 参数提取器
 * @param {string} queryText - 查询文本
 * @param {object} rule - 匹配的规则
 * @returns {object} 提取的参数
 */
export function extractParameters(queryText, rule) {
  const parameters = {};
  const queryLower = queryText.toLowerCase();

  if (!rule.parameters) return parameters;

  for (const [paramName, paramConfig] of Object.entries(rule.parameters)) {
    if (paramConfig.type === "fixed") {
      parameters[paramName] = paramConfig.value;
    } else if (paramConfig.type === "fuzzy") {
      // 模糊匹配参数提取
      const extractedValue = extractFuzzyParameter(queryText, paramName);
      if (extractedValue) {
        parameters[paramName] = extractedValue;
      }
    } else if (paramConfig.type === "exact") {
      // 精确匹配参数提取
      const extractedValue = extractExactParameter(queryText, paramName);
      if (extractedValue) {
        parameters[paramName] = extractedValue;
      }
    }
  }

  return parameters;
}

/**
 * 模糊参数提取
 * @param {string} queryText - 查询文本
 * @param {string} paramName - 参数名称
 * @returns {string|null} 提取的参数值
 */
function extractFuzzyParameter(queryText, paramName) {
  const queryLower = queryText.toLowerCase();

  switch (paramName) {
    case 'materialName':
      // 提取物料名称
      const realMaterials = [
        'OLED显示屏', 'LCD显示屏', '电池盖', '中框', '手机卡托', '侧键', '装饰件',
        '摄像头', 'CAM', '电池', '充电器', '喇叭', '听筒', '保护套', '标签', '包装盒'
      ];
      for (const material of realMaterials) {
        if (queryLower.includes(material.toLowerCase())) {
          return material;
        }
      }
      break;

    case 'supplier':
      // 提取供应商名称
      const realSuppliers = [
        '聚龙', '欣冠', '广正', '天马', 'BOE', '华星', '盛泰', '天实', '深奥',
        '百佳达', '奥海', '辉阳', '理威', '风华', '维科', '东声', '瑞声', '歌尔',
        '丽德宝', '怡同', '富群'
      ];
      for (const supplier of realSuppliers) {
        if (queryLower.includes(supplier.toLowerCase())) {
          return supplier;
        }
      }
      break;

    case 'factory':
      // 提取工厂名称
      const factories = ['重庆工厂', '深圳工厂', '宜宾工厂', '南昌工厂'];
      for (const factory of factories) {
        if (queryLower.includes(factory.toLowerCase())) {
          return factory;
        }
      }
      break;

    case 'batchNo':
      // 提取批次号
      const batchMatch = queryText.match(/[A-Z0-9]{6,}/);
      if (batchMatch) {
        return batchMatch[0];
      }
      break;

    case 'projectId':
      // 提取项目ID
      const projectMatch = queryText.match(/[A-Z]\d+[A-Z]*\d*/);
      if (projectMatch) {
        return projectMatch[0];
      }
      break;

    case 'materialCode':
      // 提取物料编码
      const codeMatch = queryText.match(/[A-Z]{2,}-[A-Z0-9]+/);
      if (codeMatch) {
        return codeMatch[0];
      }
      break;

    case 'materialType':
      // 提取物料类型
      const materialTypes = ['光学类', '结构件类', '声学类', '充电类', '包材类'];
      for (const type of materialTypes) {
        if (queryLower.includes(type.toLowerCase())) {
          return type;
        }
      }
      break;

    case 'warehouse':
      // 提取仓库名称
      const warehouses = ['中央库存', '深圳库存', '重庆库存', '宜宾库存', '南昌库存'];
      for (const warehouse of warehouses) {
        if (queryLower.includes(warehouse.toLowerCase())) {
          return warehouse;
        }
      }
      break;

    case 'line':
      // 提取产线
      const lineMatch = queryText.match(/产线\d+/);
      if (lineMatch) {
        return lineMatch[0];
      }
      break;

    case 'quantityCondition':
      // 提取数量条件
      if (queryLower.includes('数量少') || queryLower.includes('库存不足')) {
        return 'low';
      }
      if (queryLower.includes('数量多') || queryLower.includes('库存充足')) {
        return 'high';
      }
      const quantityMatch = queryText.match(/(\d+)/);
      if (quantityMatch) {
        return quantityMatch[0];
      }
      break;

    case 'inboundTime':
    case 'testDate':
    case 'onlineTime':
      // 提取时间相关
      if (queryLower.includes('今天') || queryLower.includes('今日')) {
        return 'today';
      }
      if (queryLower.includes('昨天') || queryLower.includes('昨日')) {
        return 'yesterday';
      }
      if (queryLower.includes('最近')) {
        return 'recent';
      }
      const dateMatch = queryText.match(/\d{4}-\d{2}-\d{2}/);
      if (dateMatch) {
        return dateMatch[0];
      }
      break;

    case 'expiryDate':
      // 提取过期时间
      if (queryLower.includes('即将过期')) {
        return 'expiring_soon';
      }
      if (queryLower.includes('已过期')) {
        return 'expired';
      }
      break;

    case 'defectDescription':
    case 'defect':
      // 提取不良描述关键词
      const defectKeywords = ['划伤', '变形', '破损', '色差', '尺寸', '功能', '外观'];
      for (const keyword of defectKeywords) {
        if (queryLower.includes(keyword)) {
          return keyword;
        }
      }
      break;
  }

  return null;
}

/**
 * 精确参数提取
 * @param {string} queryText - 查询文本
 * @param {string} paramName - 参数名称
 * @returns {string|null} 提取的参数值
 */
function extractExactParameter(queryText, paramName) {
  const queryLower = queryText.toLowerCase();

  switch (paramName) {
    case 'status':
      if (queryLower.includes('风险') || queryLower.includes('高风险')) {
        return '风险';
      }
      if (queryLower.includes('冻结')) {
        return '冻结';
      }
      if (queryLower.includes('正常')) {
        return '正常';
      }
      break;
  }

  return null;
}

/**
 * 生成fallback提示
 * @param {string} queryText - 原始查询
 * @returns {string} 提示信息
 */
export function generateFallbackHints(queryText) {
  const hints = [
    "您可以尝试以下查询方式：",
    "📦 库存查询：'查询BOE供应商的物料'、'查询OLED显示屏的库存'",
    "🚨 风险查询：'目前有哪些风险库存？'、'查询冻结的物料'",
    "🧪 测试查询：'有哪些测试不合格的记录？'、'查询批次XXX的测试结果'",
    "🏭 生产查询：'查询深圳工厂的生产情况'、'有哪些高不良率的记录？'",
    "📊 统计查询：'工厂数据汇总'、'供应商数据统计'"
  ];

  return hints.join('\n');
}

export default {
  enhancedIntentMatching,
  extractParameters,
  generateFallbackHints,
  enhancedIntentRules
};
