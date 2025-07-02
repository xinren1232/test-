/**
 * IQE质量智能助手场景分析
 * 基于用户提供的三个核心场景进行全面分析
 */

// 场景1: 物料库存管理
const inventorySchema = {
  name: "物料库存管理",
  table: "inventory", 
  fields: {
    factory: { name: "工厂", type: "string", examples: ["深圳工厂", "上海工厂", "北京工厂"] },
    warehouse: { name: "仓库", type: "string", examples: ["A区", "B区", "C区", "D区"] },
    materialCode: { name: "物料编码", type: "string", examples: ["MAT_001", "MAT_002"] },
    materialName: { name: "物料名称", type: "string", examples: ["OLED显示屏", "电池盖", "散热片"] },
    supplier: { name: "供应商", type: "string", examples: ["BOE", "聚龙", "富士康"] },
    batchNo: { name: "批次", type: "string", examples: ["TK240601", "SS240602"] },
    quantity: { name: "数量", type: "number", examples: [500, 1000, 800] },
    status: { name: "状态", type: "enum", values: ["正常", "风险", "冻结"] },
    inboundTime: { name: "入库时间", type: "datetime", examples: ["2024-06-01 10:00:00"] },
    expiryTime: { name: "到期时间", type: "datetime", examples: ["2024-12-01 10:00:00"] },
    remarks: { name: "备注", type: "text", examples: ["质量良好", "需要复检"] }
  }
};

// 场景2: 物料上线管理  
const productionSchema = {
  name: "物料上线管理",
  table: "production",
  fields: {
    factory: { name: "工厂", type: "string", examples: ["深圳工厂", "上海工厂"] },
    baseline: { name: "基线", type: "string", examples: ["I6789", "I6790"] },
    projectId: { name: "项目", type: "string", examples: ["PRJ_001", "PRJ_002"] },
    materialCode: { name: "物料编码", type: "string", examples: ["MAT_001", "MAT_002"] },
    materialName: { name: "物料名称", type: "string", examples: ["OLED显示屏", "电池盖"] },
    supplier: { name: "供应商", type: "string", examples: ["BOE", "聚龙"] },
    batchNo: { name: "批次", type: "string", examples: ["TK240601", "SS240602"] },
    defectRate: { name: "不良率", type: "number", examples: [0.5, 2.8, 4.2] },
    defect: { name: "不良现象", type: "string", examples: ["装配不良", "尺寸偏差", "表面划痕"] }
  }
};

// 场景3: 物料测试跟踪
const inspectionSchema = {
  name: "物料测试跟踪", 
  table: "inspection",
  fields: {
    testId: { name: "测试编号", type: "string", examples: ["TEST_001", "TEST_002"] },
    testDate: { name: "日期", type: "date", examples: ["2024-06-01", "2024-06-02"] },
    baseline: { name: "基线", type: "string", examples: ["I6789", "I6790"] },
    projectId: { name: "项目", type: "string", examples: ["PRJ_001", "PRJ_002"] },
    materialCode: { name: "物料编码", type: "string", examples: ["MAT_001", "MAT_002"] },
    materialName: { name: "物料名称", type: "string", examples: ["OLED显示屏", "电池盖"] },
    supplier: { name: "供应商", type: "string", examples: ["BOE", "聚龙"] },
    batchNo: { name: "批次", type: "string", examples: ["TK240601", "SS240602"] },
    testResult: { name: "测试结果", type: "enum", values: ["PASS", "FAIL"] },
    defect: { name: "不良现象", type: "string", examples: ["表面划痕", "尺寸偏差", "功能异常"] }
  }
};

// 关联字段分析
const relationshipFields = {
  primary: ["materialCode", "materialName", "batchNo"], // 主要关联字段
  secondary: ["supplier", "projectId", "baseline"], // 次要关联字段
  crossReference: {
    "inventory-production": ["materialCode", "batchNo", "supplier"],
    "inventory-inspection": ["materialCode", "batchNo", "supplier"], 
    "production-inspection": ["materialCode", "batchNo", "supplier", "projectId", "baseline"]
  }
};

// 查询复杂度分析
const queryComplexity = {
  basic: {
    description: "基础字段查询",
    examples: [
      "查询BOE供应商的物料",
      "查询批次TK240601的信息", 
      "查询深圳工厂的库存",
      "查询测试结果为FAIL的记录"
    ]
  },
  intermediate: {
    description: "状态分析查询",
    examples: [
      "查询风险状态的物料",
      "查询不良率超过3%的批次",
      "查询即将到期的库存",
      "查询测试通过率低的供应商"
    ]
  },
  advanced: {
    description: "复杂汇总分析",
    examples: [
      "物料整体质量状态确认",
      "工厂所有物料状态分析", 
      "供应商质量表现评估",
      "批次全生命周期质量追溯"
    ]
  },
  crossScenario: {
    description: "跨场景关联查询",
    examples: [
      "从库存到上线到测试的完整追溯",
      "物料在各个环节的质量表现",
      "项目相关的所有物料状态",
      "基线相关的质量数据汇总"
    ]
  }
};

// 业务规则分析
const businessRules = {
  qualityStatus: {
    description: "质量状态判定规则",
    rules: [
      "库存状态为'风险'或'冻结'的物料需要特别关注",
      "不良率>5%的批次被认为是高风险",
      "测试结果为FAIL的批次需要分析不良现象",
      "即将到期(30天内)的库存需要优先处理"
    ]
  },
  alertConditions: {
    description: "预警条件",
    rules: [
      "同一供应商连续3个批次测试失败",
      "同一物料在不同工厂的不良率差异>2%", 
      "库存数量低于安全库存(需要补充字段)",
      "批次在生产中出现新的不良现象"
    ]
  }
};

console.log("🔍 IQE质量智能助手场景分析完成");
console.log("\n📊 场景概览:");
console.log(`1. ${inventorySchema.name}: ${Object.keys(inventorySchema.fields).length}个字段`);
console.log(`2. ${productionSchema.name}: ${Object.keys(productionSchema.fields).length}个字段`);
console.log(`3. ${inspectionSchema.name}: ${Object.keys(inspectionSchema.fields).length}个字段`);

console.log("\n🔗 关联字段:");
console.log(`主要关联: ${relationshipFields.primary.join(', ')}`);
console.log(`次要关联: ${relationshipFields.secondary.join(', ')}`);

console.log("\n📈 查询复杂度层次:");
Object.entries(queryComplexity).forEach(([level, info]) => {
  console.log(`${level}: ${info.description} (${info.examples.length}个示例)`);
});

export { inventorySchema, productionSchema, inspectionSchema, relationshipFields, queryComplexity, businessRules };
