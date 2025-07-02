/**
 * IQE质量智能助手 - 基础查询规则设计
 * 基于三个核心场景的全面基础查询规则
 */

// 1. 物料库存管理 - 基础查询规则
const inventoryBasicRules = [
  // 1.1 单字段查询
  {
    intent: "query_inventory_by_factory",
    keywords: ["工厂库存", "工厂物料", "工厂的库存", "工厂的物料"],
    examples: ["查询深圳工厂的库存", "深圳工厂有哪些物料", "上海工厂库存情况"],
    target: "inventory",
    parameters: { factory: { type: "fuzzy", source: "query" } }
  },
  {
    intent: "query_inventory_by_warehouse", 
    keywords: ["仓库库存", "仓库物料", "仓库的库存"],
    examples: ["查询A区仓库的库存", "B区有哪些物料", "C区库存情况"],
    target: "inventory",
    parameters: { warehouse: { type: "fuzzy", source: "query" } }
  },
  {
    intent: "query_inventory_by_material",
    keywords: ["物料库存", "物料编码", "物料名称"],
    examples: ["查询OLED显示屏的库存", "MAT_001的库存情况", "电池盖库存"],
    target: "inventory", 
    parameters: { 
      materialName: { type: "fuzzy", source: "query" },
      materialCode: { type: "fuzzy", source: "query" }
    }
  },
  {
    intent: "query_inventory_by_supplier",
    keywords: ["供应商库存", "供应商物料", "供应商的库存"],
    examples: ["查询BOE供应商的库存", "聚龙供应商有哪些物料", "富士康的库存情况"],
    target: "inventory",
    parameters: { supplier: { type: "fuzzy", source: "query" } }
  },
  {
    intent: "query_inventory_by_batch",
    keywords: ["批次库存", "批次物料", "批次信息"],
    examples: ["查询批次TK240601的库存", "SS240602批次信息", "批次库存情况"],
    target: "inventory",
    parameters: { batchNo: { type: "fuzzy", source: "query" } }
  },
  {
    intent: "query_inventory_by_status",
    keywords: ["库存状态", "物料状态", "正常库存", "风险库存", "冻结库存"],
    examples: ["查询风险状态的库存", "正常库存有哪些", "冻结物料情况"],
    target: "inventory",
    parameters: { status: { type: "enum", values: ["正常", "风险", "冻结"] } }
  },
  
  // 1.2 多字段组合查询
  {
    intent: "query_inventory_factory_supplier",
    keywords: ["工厂", "供应商", "库存"],
    examples: ["查询深圳工厂BOE供应商的库存", "上海工厂聚龙的物料"],
    target: "inventory",
    parameters: { 
      factory: { type: "fuzzy", source: "query" },
      supplier: { type: "fuzzy", source: "query" }
    }
  },
  {
    intent: "query_inventory_material_status",
    keywords: ["物料", "状态", "库存"],
    examples: ["查询OLED显示屏的风险库存", "电池盖正常状态库存"],
    target: "inventory",
    parameters: {
      materialName: { type: "fuzzy", source: "query" },
      status: { type: "enum", values: ["正常", "风险", "冻结"] }
    }
  }
];

// 2. 物料上线管理 - 基础查询规则
const productionBasicRules = [
  // 2.1 单字段查询
  {
    intent: "query_production_by_factory",
    keywords: ["工厂生产", "工厂上线", "工厂的生产"],
    examples: ["查询深圳工厂的生产情况", "上海工厂上线记录", "北京工厂生产数据"],
    target: "production",
    parameters: { factory: { type: "fuzzy", source: "query" } }
  },
  {
    intent: "query_production_by_project",
    keywords: ["项目生产", "项目上线", "项目的生产"],
    examples: ["查询项目PRJ_001的生产情况", "PRJ_002项目上线记录"],
    target: "production", 
    parameters: { projectId: { type: "fuzzy", source: "query" } }
  },
  {
    intent: "query_production_by_baseline",
    keywords: ["基线生产", "基线上线", "基线的生产"],
    examples: ["查询基线I6789的生产情况", "I6790基线上线记录"],
    target: "production",
    parameters: { baseline: { type: "fuzzy", source: "query" } }
  },
  {
    intent: "query_production_by_defect_rate",
    keywords: ["不良率", "高不良率", "低不良率", "不良率超过", "不良率低于"],
    examples: ["查询不良率超过3%的记录", "低不良率的生产批次", "不良率高的物料"],
    target: "production",
    parameters: { 
      defectRateThreshold: { type: "number", source: "query" },
      defectRateOperator: { type: "operator", values: [">", "<", ">=", "<=", "="] }
    }
  },
  {
    intent: "query_production_by_defect",
    keywords: ["不良现象", "生产不良", "质量问题", "缺陷"],
    examples: ["查询装配不良的记录", "有尺寸偏差的批次", "表面划痕问题"],
    target: "production",
    parameters: { defect: { type: "fuzzy", source: "query" } }
  },
  
  // 2.2 多字段组合查询
  {
    intent: "query_production_project_material",
    keywords: ["项目", "物料", "生产"],
    examples: ["查询项目PRJ_001中OLED显示屏的生产情况", "PRJ_002项目电池盖上线记录"],
    target: "production",
    parameters: {
      projectId: { type: "fuzzy", source: "query" },
      materialName: { type: "fuzzy", source: "query" }
    }
  },
  {
    intent: "query_production_factory_defect",
    keywords: ["工厂", "不良", "生产"],
    examples: ["查询深圳工厂的不良记录", "上海工厂质量问题", "工厂生产缺陷"],
    target: "production",
    parameters: {
      factory: { type: "fuzzy", source: "query" },
      defect: { type: "fuzzy", source: "query" }
    }
  }
];

// 3. 物料测试跟踪 - 基础查询规则  
const inspectionBasicRules = [
  // 3.1 单字段查询
  {
    intent: "query_inspection_by_test_id",
    keywords: ["测试编号", "测试ID", "测试记录"],
    examples: ["查询测试编号TEST_001", "TEST_002测试记录", "测试ID查询"],
    target: "inspection",
    parameters: { testId: { type: "fuzzy", source: "query" } }
  },
  {
    intent: "query_inspection_by_date",
    keywords: ["测试日期", "测试时间", "日期测试"],
    examples: ["查询2024-06-01的测试记录", "今天的测试情况", "昨天测试结果"],
    target: "inspection",
    parameters: { testDate: { type: "date", source: "query" } }
  },
  {
    intent: "query_inspection_by_result",
    keywords: ["测试结果", "测试通过", "测试失败", "PASS", "FAIL"],
    examples: ["查询测试失败的记录", "PASS的测试结果", "测试不合格的批次"],
    target: "inspection",
    parameters: { testResult: { type: "enum", values: ["PASS", "FAIL"] } }
  },
  {
    intent: "query_inspection_by_project",
    keywords: ["项目测试", "项目的测试", "项目检验"],
    examples: ["查询项目PRJ_001的测试记录", "PRJ_002项目测试情况"],
    target: "inspection",
    parameters: { projectId: { type: "fuzzy", source: "query" } }
  },
  {
    intent: "query_inspection_by_baseline",
    keywords: ["基线测试", "基线的测试", "基线检验"],
    examples: ["查询基线I6789的测试记录", "I6790基线测试情况"],
    target: "inspection", 
    parameters: { baseline: { type: "fuzzy", source: "query" } }
  },
  
  // 3.2 多字段组合查询
  {
    intent: "query_inspection_material_result",
    keywords: ["物料", "测试结果", "检验"],
    examples: ["查询OLED显示屏的测试失败记录", "电池盖PASS的测试结果"],
    target: "inspection",
    parameters: {
      materialName: { type: "fuzzy", source: "query" },
      testResult: { type: "enum", values: ["PASS", "FAIL"] }
    }
  },
  {
    intent: "query_inspection_supplier_result", 
    keywords: ["供应商", "测试结果", "检验"],
    examples: ["查询BOE供应商的测试失败记录", "聚龙测试通过情况"],
    target: "inspection",
    parameters: {
      supplier: { type: "fuzzy", source: "query" },
      testResult: { type: "enum", values: ["PASS", "FAIL"] }
    }
  }
];

// 4. 时间相关查询规则
const timeBasedRules = [
  {
    intent: "query_inventory_expiring_soon",
    keywords: ["即将到期", "快到期", "到期提醒", "过期风险"],
    examples: ["查询即将到期的库存", "30天内到期的物料", "过期风险物料"],
    target: "inventory",
    parameters: {
      expiryDays: { type: "number", default: 30 },
      timeOperator: { type: "operator", default: "<=" }
    }
  },
  {
    intent: "query_inventory_by_inbound_time",
    keywords: ["入库时间", "最近入库", "入库日期"],
    examples: ["查询最近入库的物料", "今天入库的库存", "本周入库情况"],
    target: "inventory",
    parameters: {
      inboundTimeRange: { type: "dateRange", source: "query" }
    }
  }
];

// 5. 数量相关查询规则
const quantityBasedRules = [
  {
    intent: "query_inventory_by_quantity",
    keywords: ["库存数量", "数量大于", "数量小于", "库存量"],
    examples: ["查询数量大于1000的库存", "库存量少的物料", "数量充足的库存"],
    target: "inventory",
    parameters: {
      quantityThreshold: { type: "number", source: "query" },
      quantityOperator: { type: "operator", values: [">", "<", ">=", "<=", "="] }
    }
  },
  {
    intent: "query_inventory_low_stock",
    keywords: ["库存不足", "低库存", "缺货", "库存告警"],
    examples: ["查询库存不足的物料", "低库存预警", "缺货物料"],
    target: "inventory",
    parameters: {
      lowStockThreshold: { type: "number", default: 100 }
    }
  }
];

console.log("📋 IQE基础查询规则设计完成");
console.log(`📦 库存管理规则: ${inventoryBasicRules.length}条`);
console.log(`🏭 上线管理规则: ${productionBasicRules.length}条`);
console.log(`🧪 测试跟踪规则: ${inspectionBasicRules.length}条`);
console.log(`⏰ 时间相关规则: ${timeBasedRules.length}条`);
console.log(`📊 数量相关规则: ${quantityBasedRules.length}条`);
console.log(`📊 总计基础规则: ${inventoryBasicRules.length + productionBasicRules.length + inspectionBasicRules.length + timeBasedRules.length + quantityBasedRules.length}条`);

export { inventoryBasicRules, productionBasicRules, inspectionBasicRules, timeBasedRules, quantityBasedRules };
