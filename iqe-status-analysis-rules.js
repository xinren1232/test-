/**
 * IQE质量智能助手 - 状态分析规则设计
 * 物料状态、质量状态、批次状态等分析规则
 */

// 1. 物料状态分析规则
const materialStatusRules = [
  {
    intent: "analyze_material_overall_status",
    keywords: ["物料整体状态", "物料质量状态", "物料状态分析", "物料状态确认"],
    examples: ["OLED显示屏的整体质量状态", "电池盖物料状态分析", "物料整体状态确认"],
    description: "分析特定物料在库存、生产、测试三个环节的整体状态",
    target: "cross_scenario",
    parameters: {
      materialName: { type: "fuzzy", source: "query", required: true },
      materialCode: { type: "fuzzy", source: "query" }
    },
    analysis: {
      inventory: ["status", "quantity", "expiryTime"],
      production: ["defectRate", "defect"],
      inspection: ["testResult", "defect"]
    }
  },
  {
    intent: "analyze_material_risk_level",
    keywords: ["物料风险等级", "物料风险评估", "风险物料分析"],
    examples: ["评估OLED显示屏的风险等级", "物料风险分析", "高风险物料识别"],
    description: "基于多维度数据评估物料风险等级",
    target: "cross_scenario",
    parameters: {
      materialName: { type: "fuzzy", source: "query" }
    },
    riskFactors: {
      inventory: ["status", "expiryTime"],
      production: ["defectRate", "defect"],
      inspection: ["testResult", "failureRate"]
    }
  },
  {
    intent: "analyze_material_quality_trend",
    keywords: ["物料质量趋势", "质量变化趋势", "物料质量走向"],
    examples: ["OLED显示屏质量趋势分析", "物料质量变化情况", "质量趋势评估"],
    description: "分析物料质量随时间的变化趋势",
    target: "cross_scenario",
    parameters: {
      materialName: { type: "fuzzy", source: "query", required: true },
      timeRange: { type: "dateRange", source: "query", default: "30days" }
    }
  }
];

// 2. 批次状态分析规则
const batchStatusRules = [
  {
    intent: "analyze_batch_full_lifecycle",
    keywords: ["批次全生命周期", "批次完整状态", "批次全链路分析"],
    examples: ["批次TK240601的全生命周期分析", "SS240602批次完整状态", "批次全链路质量分析"],
    description: "分析批次从库存到生产到测试的完整生命周期",
    target: "cross_scenario",
    parameters: {
      batchNo: { type: "fuzzy", source: "query", required: true }
    },
    lifecycle: ["inventory", "production", "inspection"]
  },
  {
    intent: "analyze_batch_quality_performance",
    keywords: ["批次质量表现", "批次性能分析", "批次质量评估"],
    examples: ["批次TK240601的质量表现", "批次性能分析报告", "批次质量评估"],
    description: "评估批次在各个环节的质量表现",
    target: "cross_scenario",
    parameters: {
      batchNo: { type: "fuzzy", source: "query", required: true }
    },
    metrics: ["defectRate", "testPassRate", "inventoryStatus"]
  },
  {
    intent: "analyze_problematic_batches",
    keywords: ["问题批次", "异常批次", "质量问题批次", "不良批次"],
    examples: ["识别问题批次", "查找异常批次", "质量问题批次分析"],
    description: "识别和分析存在质量问题的批次",
    target: "cross_scenario",
    parameters: {
      timeRange: { type: "dateRange", source: "query", default: "30days" }
    },
    criteria: {
      inventory: ["status != '正常'"],
      production: ["defectRate > 3"],
      inspection: ["testResult = 'FAIL'"]
    }
  }
];

// 3. 供应商状态分析规则
const supplierStatusRules = [
  {
    intent: "analyze_supplier_quality_performance",
    keywords: ["供应商质量表现", "供应商性能分析", "供应商质量评估"],
    examples: ["BOE供应商质量表现", "聚龙供应商性能分析", "供应商质量评估报告"],
    description: "全面评估供应商的质量表现",
    target: "cross_scenario",
    parameters: {
      supplier: { type: "fuzzy", source: "query", required: true },
      timeRange: { type: "dateRange", source: "query", default: "90days" }
    },
    metrics: {
      inventory: ["riskItemCount", "totalQuantity"],
      production: ["avgDefectRate", "defectTypes"],
      inspection: ["testPassRate", "failureCount"]
    }
  },
  {
    intent: "analyze_supplier_risk_assessment",
    keywords: ["供应商风险评估", "供应商风险分析", "高风险供应商"],
    examples: ["供应商风险评估", "识别高风险供应商", "供应商风险分析报告"],
    description: "评估供应商的风险等级",
    target: "cross_scenario",
    parameters: {
      supplier: { type: "fuzzy", source: "query" }
    },
    riskIndicators: {
      inventory: ["riskItemRatio", "expiryRisk"],
      production: ["highDefectRateRatio", "defectVariety"],
      inspection: ["failureRate", "consecutiveFailures"]
    }
  },
  {
    intent: "compare_supplier_performance",
    keywords: ["供应商对比", "供应商比较", "供应商性能对比"],
    examples: ["BOE和聚龙供应商对比", "供应商性能比较", "多供应商质量对比"],
    description: "对比多个供应商的质量表现",
    target: "cross_scenario",
    parameters: {
      suppliers: { type: "list", source: "query", minCount: 2 },
      timeRange: { type: "dateRange", source: "query", default: "90days" }
    }
  }
];

// 4. 工厂状态分析规则
const factoryStatusRules = [
  {
    intent: "analyze_factory_material_status",
    keywords: ["工厂物料状态", "工厂所有物料", "工厂物料分析"],
    examples: ["深圳工厂所有物料状态分析", "上海工厂物料状态", "工厂物料整体情况"],
    description: "分析工厂所有物料的状态情况",
    target: "cross_scenario",
    parameters: {
      factory: { type: "fuzzy", source: "query", required: true }
    },
    analysis: {
      inventory: ["statusDistribution", "quantityAnalysis", "expiryAnalysis"],
      production: ["defectRateAnalysis", "defectTypeAnalysis"],
      inspection: ["testResultAnalysis", "qualityTrends"]
    }
  },
  {
    intent: "analyze_factory_quality_performance",
    keywords: ["工厂质量表现", "工厂生产质量", "工厂质量分析"],
    examples: ["深圳工厂质量表现", "工厂生产质量分析", "工厂质量评估"],
    description: "评估工厂的整体质量表现",
    target: "cross_scenario",
    parameters: {
      factory: { type: "fuzzy", source: "query", required: true },
      timeRange: { type: "dateRange", source: "query", default: "30days" }
    }
  },
  {
    intent: "compare_factory_performance",
    keywords: ["工厂对比", "工厂比较", "多工厂分析"],
    examples: ["深圳工厂和上海工厂对比", "工厂质量表现比较", "多工厂性能分析"],
    description: "对比多个工厂的质量表现",
    target: "cross_scenario",
    parameters: {
      factories: { type: "list", source: "query", minCount: 2 },
      timeRange: { type: "dateRange", source: "query", default: "30days" }
    }
  }
];

// 5. 项目/基线状态分析规则
const projectStatusRules = [
  {
    intent: "analyze_project_quality_status",
    keywords: ["项目质量状态", "项目物料状态", "项目质量分析"],
    examples: ["项目PRJ_001质量状态", "PRJ_002项目物料分析", "项目整体质量评估"],
    description: "分析项目相关的所有物料质量状态",
    target: "cross_scenario",
    parameters: {
      projectId: { type: "fuzzy", source: "query", required: true }
    }
  },
  {
    intent: "analyze_baseline_quality_status",
    keywords: ["基线质量状态", "基线物料状态", "基线质量分析"],
    examples: ["基线I6789质量状态", "I6790基线物料分析", "基线整体质量评估"],
    description: "分析基线相关的所有物料质量状态",
    target: "cross_scenario",
    parameters: {
      baseline: { type: "fuzzy", source: "query", required: true }
    }
  }
];

console.log("📊 IQE状态分析规则设计完成");
console.log(`🔍 物料状态规则: ${materialStatusRules.length}条`);
console.log(`📦 批次状态规则: ${batchStatusRules.length}条`);
console.log(`🏢 供应商状态规则: ${supplierStatusRules.length}条`);
console.log(`🏭 工厂状态规则: ${factoryStatusRules.length}条`);
console.log(`📋 项目状态规则: ${projectStatusRules.length}条`);
console.log(`📊 总计状态分析规则: ${materialStatusRules.length + batchStatusRules.length + supplierStatusRules.length + factoryStatusRules.length + projectStatusRules.length}条`);

export { 
  materialStatusRules, 
  batchStatusRules, 
  supplierStatusRules, 
  factoryStatusRules, 
  projectStatusRules 
};
