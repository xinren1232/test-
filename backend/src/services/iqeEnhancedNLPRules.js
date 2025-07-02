/**
 * IQE质量智能助手 - 增强NLP规则
 * 基于完整场景分析的全面规则体系
 */

// 1. 库存管理基础查询规则
const inventoryQueryRules = [
  // 1.1 按工厂查询
  {
    intent: "query_inventory_by_factory",
    keywords: ["工厂库存", "工厂物料", "工厂的库存", "工厂的物料", "工厂库存情况"],
    examples: ["查询深圳工厂的库存", "深圳工厂有哪些物料", "上海工厂库存情况", "北京工厂物料"],
    action: "memory_query",
    target: "inventory",
    description: "按工厂查询库存物料",
    fuzzyMatch: true,
    parameters: {
      factory: { type: "fuzzy", source: "query" }
    }
  },
  
  // 1.2 按仓库查询
  {
    intent: "query_inventory_by_warehouse",
    keywords: ["仓库库存", "仓库物料", "仓库的库存", "仓库存储", "仓库区域"],
    examples: ["查询A区仓库的库存", "B区有哪些物料", "C区库存情况", "D区仓库物料"],
    action: "memory_query",
    target: "inventory",
    description: "按仓库查询库存物料",
    fuzzyMatch: true,
    parameters: {
      warehouse: { type: "fuzzy", source: "query" }
    }
  },
  
  // 1.3 按物料查询
  {
    intent: "query_inventory_by_material",
    keywords: ["物料库存", "物料编码", "物料名称", "物料信息", "物料查询"],
    examples: ["查询OLED显示屏的库存", "MAT_001的库存情况", "电池盖库存", "散热片物料信息"],
    action: "memory_query",
    target: "inventory",
    description: "按物料查询库存信息",
    fuzzyMatch: true,
    parameters: {
      materialName: { type: "fuzzy", source: "query" },
      materialCode: { type: "fuzzy", source: "query" }
    }
  },
  
  // 1.4 按供应商查询
  {
    intent: "query_inventory_by_supplier",
    keywords: ["供应商库存", "供应商物料", "供应商的库存", "供应商提供", "供应商材料"],
    examples: ["查询BOE供应商的库存", "聚龙供应商有哪些物料", "富士康的库存情况", "供应商物料分布"],
    action: "memory_query",
    target: "inventory",
    description: "按供应商查询库存物料",
    fuzzyMatch: true,
    parameters: {
      supplier: { type: "fuzzy", source: "query" }
    }
  },
  
  // 1.5 按批次查询
  {
    intent: "query_inventory_by_batch",
    keywords: ["批次库存", "批次物料", "批次信息", "批次号", "批次查询"],
    examples: ["查询批次TK240601的库存", "SS240602批次信息", "批次库存情况", "TK240603批次物料"],
    action: "memory_query",
    target: "inventory",
    description: "按批次查询库存信息",
    fuzzyMatch: true,
    parameters: {
      batchNo: { type: "fuzzy", source: "query" }
    }
  },
  
  // 1.6 按状态查询
  {
    intent: "query_inventory_by_status",
    keywords: ["库存状态", "物料状态", "正常库存", "风险库存", "冻结库存", "状态查询"],
    examples: ["查询风险状态的库存", "正常库存有哪些", "冻结物料情况", "库存状态分布"],
    action: "memory_query",
    target: "inventory",
    description: "按状态查询库存物料",
    fuzzyMatch: true,
    parameters: {
      status: { type: "enum", values: ["正常", "风险", "冻结"] }
    }
  },
  
  // 1.7 按数量查询
  {
    intent: "query_inventory_by_quantity",
    keywords: ["库存数量", "数量大于", "数量小于", "库存量", "数量查询", "库存不足"],
    examples: ["查询数量大于1000的库存", "库存量少的物料", "数量充足的库存", "库存不足的物料"],
    action: "memory_query",
    target: "inventory",
    description: "按数量条件查询库存",
    fuzzyMatch: true,
    parameters: {
      quantityThreshold: { type: "number", source: "query" },
      quantityOperator: { type: "operator", values: [">", "<", ">=", "<=", "="] }
    }
  },
  
  // 1.8 组合查询
  {
    intent: "query_inventory_factory_supplier",
    keywords: ["工厂", "供应商", "库存"],
    examples: ["查询深圳工厂BOE供应商的库存", "上海工厂聚龙的物料", "北京工厂富士康库存"],
    action: "memory_query",
    target: "inventory",
    description: "按工厂和供应商组合查询库存",
    fuzzyMatch: true,
    parameters: {
      factory: { type: "fuzzy", source: "query" },
      supplier: { type: "fuzzy", source: "query" }
    }
  }
];

// 2. 生产管理基础查询规则
const productionQueryRules = [
  // 2.1 按工厂查询
  {
    intent: "query_production_by_factory",
    keywords: ["工厂生产", "工厂上线", "工厂的生产", "生产工厂", "上线工厂", "生产情况", "上线情况", "生产记录", "上线记录"],
    examples: ["查询深圳工厂的生产情况", "上海工厂上线记录", "北京工厂生产数据", "工厂生产统计", "深圳工厂的生产情况", "上海工厂生产记录"],
    action: "memory_query",
    target: "production",
    description: "按工厂查询生产记录",
    fuzzyMatch: true,
    parameters: {
      factory: { type: "fuzzy", source: "query" }
    }
  },
  
  // 2.2 按项目查询
  {
    intent: "query_production_by_project",
    keywords: ["项目生产", "项目上线", "项目的生产", "项目记录", "项目查询"],
    examples: ["查询项目PRJ_001的生产情况", "PRJ_002项目上线记录", "项目生产统计", "项目物料上线"],
    action: "memory_query",
    target: "production",
    description: "按项目查询生产记录",
    fuzzyMatch: true,
    parameters: {
      projectId: { type: "fuzzy", source: "query" }
    }
  },
  
  // 2.3 按基线查询
  {
    intent: "query_production_by_baseline",
    keywords: ["基线生产", "基线上线", "基线的生产", "基线记录", "基线查询"],
    examples: ["查询基线I6789的生产情况", "I6790基线上线记录", "基线生产统计", "基线物料上线"],
    action: "memory_query",
    target: "production",
    description: "按基线查询生产记录",
    fuzzyMatch: true,
    parameters: {
      baseline: { type: "fuzzy", source: "query" }
    }
  },
  
  // 2.4 按不良率查询
  {
    intent: "query_production_by_defect_rate",
    keywords: ["不良率", "高不良率", "低不良率", "不良率超过", "不良率低于", "质量问题"],
    examples: ["查询不良率超过3%的记录", "低不良率的生产批次", "不良率高的物料", "质量问题批次"],
    action: "memory_query",
    target: "production",
    description: "按不良率条件查询生产记录",
    fuzzyMatch: true,
    parameters: {
      defectRateThreshold: { type: "number", source: "query" },
      defectRateOperator: { type: "operator", values: [">", "<", ">=", "<=", "="] }
    }
  },
  
  // 2.5 按不良现象查询
  {
    intent: "query_production_by_defect",
    keywords: ["不良现象", "生产不良", "质量缺陷", "缺陷类型", "不良类型", "装配不良", "尺寸偏差", "表面划痕"],
    examples: ["查询装配不良的记录", "有尺寸偏差的批次", "表面划痕问题", "功能异常记录", "有装配不良的批次"],
    action: "memory_query",
    target: "production",
    description: "按不良现象查询生产记录",
    fuzzyMatch: true,
    parameters: {
      defect: { type: "fuzzy", source: "query" }
    }
  },

  // 2.6 显示所有生产记录
  {
    intent: "query_all_production",
    keywords: ["显示生产", "所有生产", "生产记录", "生产数据", "生产列表", "全部生产", "生产情况"],
    examples: ["显示所有生产记录", "查看生产数据", "生产记录列表", "全部生产情况", "所有生产记录"],
    action: "memory_query",
    target: "production",
    description: "查询所有生产记录",
    fuzzyMatch: true,
    parameters: {}
  }
];

// 3. 测试跟踪基础查询规则
const inspectionQueryRules = [
  // 3.1 按测试结果查询
  {
    intent: "query_inspection_by_result",
    keywords: ["测试结果", "测试通过", "测试失败", "PASS", "FAIL", "合格", "不合格"],
    examples: ["查询测试失败的记录", "PASS的测试结果", "测试不合格的批次", "合格测试记录"],
    action: "memory_query",
    target: "inspection",
    description: "按测试结果查询检验记录",
    fuzzyMatch: true,
    parameters: {
      testResult: { type: "enum", values: ["PASS", "FAIL"] }
    }
  },
  
  // 3.2 按测试日期查询
  {
    intent: "query_inspection_by_date",
    keywords: ["测试日期", "测试时间", "日期测试", "最近测试", "今天测试"],
    examples: ["查询2024-06-01的测试记录", "今天的测试情况", "昨天测试结果", "最近测试记录"],
    action: "memory_query",
    target: "inspection",
    description: "按测试日期查询检验记录",
    fuzzyMatch: true,
    parameters: {
      testDate: { type: "date", source: "query" }
    }
  },
  
  // 3.3 按项目查询
  {
    intent: "query_inspection_by_project",
    keywords: ["项目测试", "项目的测试", "项目检验", "项目测试记录"],
    examples: ["查询项目PRJ_001的测试记录", "PRJ_002项目测试情况", "项目检验统计"],
    action: "memory_query",
    target: "inspection",
    description: "按项目查询检验记录",
    fuzzyMatch: true,
    parameters: {
      projectId: { type: "fuzzy", source: "query" }
    }
  }
];

// 4. 状态分析规则
const statusAnalysisRules = [
  // 4.1 风险库存查询
  {
    intent: "query_risk_inventory",
    keywords: ["风险库存", "风险物料", "风险状态", "库存风险", "风险材料"],
    examples: ["目前有哪些风险库存？", "查询风险状态的物料", "风险库存分析", "库存风险评估"],
    action: "memory_query",
    target: "inventory",
    description: "查询风险状态的库存物料",
    fuzzyMatch: true,
    parameters: {
      status: { type: "fixed", value: "风险" }
    }
  },

  // 4.2 冻结库存查询
  {
    intent: "query_frozen_inventory",
    keywords: ["冻结库存", "冻结物料", "冻结状态", "库存冻结", "冻结材料"],
    examples: ["查询冻结状态的库存", "冻结物料有哪些", "冻结库存分析", "库存冻结情况"],
    action: "memory_query",
    target: "inventory",
    description: "查询冻结状态的库存物料",
    fuzzyMatch: true,
    parameters: {
      status: { type: "fixed", value: "冻结" }
    }
  },

  // 4.3 高不良率查询
  {
    intent: "query_high_defect_rate",
    keywords: ["高不良率", "不良率高", "质量问题", "生产异常", "不良率超标"],
    examples: ["有哪些高不良率的生产记录？", "查询不良率超标的批次", "高不良率分析"],
    action: "memory_query",
    target: "production",
    description: "查询高不良率的生产记录",
    fuzzyMatch: false,
    parameters: {
      defectRateThreshold: { type: "fixed", value: 3.0 },
      defectRateOperator: { type: "fixed", value: ">" }
    }
  },

  // 4.4 测试失败查询
  {
    intent: "query_failed_tests",
    keywords: ["测试失败", "测试不合格", "FAIL", "不合格测试", "失败记录"],
    examples: ["有哪些测试失败的记录？", "查询不合格的测试", "测试失败分析"],
    action: "memory_query",
    target: "inspection",
    description: "查询测试失败的检验记录",
    fuzzyMatch: false,
    parameters: {
      testResult: { type: "fixed", value: "FAIL" }
    }
  }
];

// 5. 汇总统计规则
const summaryRules = [
  // 5.1 工厂汇总
  {
    intent: "summarize_by_factory",
    keywords: ["工厂统计", "工厂汇总", "工厂概况", "工厂总览", "工厂表现", "工厂数据"],
    examples: ["工厂数据汇总", "各工厂的表现情况", "工厂统计报告", "工厂汇总统计"],
    action: "memory_summary",
    target: "factory",
    description: "按工厂汇总统计数据",
    fuzzyMatch: true,
    parameters: {}
  },

  // 5.2 供应商汇总
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

  // 5.3 系统总览
  {
    intent: "overall_summary",
    keywords: ["总体概况", "系统概况", "整体统计", "全局统计", "数据概览", "系统数据总览", "数据总览", "总览", "概况"],
    examples: ["系统总体概况", "整体数据统计", "全局数据概览", "系统数据总览"],
    action: "memory_summary",
    target: "overall",
    description: "生成系统整体数据概况",
    fuzzyMatch: true,
    parameters: {}
  }
];

// 6. 全链路追踪规则
const traceRules = [
  {
    intent: "query_batch_full_trace",
    keywords: ["批次追溯", "全链路追溯", "批次跟踪", "批次全链路", "完整追溯"],
    examples: ["批次TK240601的全链路追溯", "追溯批次SS240602", "批次完整跟踪"],
    action: "cross_scenario_trace",
    target: "batch",
    description: "批次全链路追溯查询",
    fuzzyMatch: true,
    parameters: {
      batchNo: { type: "fuzzy", source: "query" }
    }
  }
];

// 合并所有规则
const allRules = [
  ...inventoryQueryRules,
  ...productionQueryRules,
  ...inspectionQueryRules,
  ...statusAnalysisRules,
  ...summaryRules,
  ...traceRules
];

console.log("📋 IQE增强NLP规则加载完成");
console.log(`📦 库存查询规则: ${inventoryQueryRules.length}条`);
console.log(`🏭 生产查询规则: ${productionQueryRules.length}条`);
console.log(`🧪 测试查询规则: ${inspectionQueryRules.length}条`);
console.log(`📊 状态分析规则: ${statusAnalysisRules.length}条`);
console.log(`📈 汇总统计规则: ${summaryRules.length}条`);
console.log(`🔍 追溯规则: ${traceRules.length}条`);
console.log(`📊 总计规则: ${allRules.length}条`);

export {
  inventoryQueryRules,
  productionQueryRules,
  inspectionQueryRules,
  statusAnalysisRules,
  summaryRules,
  traceRules,
  allRules
};
