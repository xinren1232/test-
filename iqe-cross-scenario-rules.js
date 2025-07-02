/**
 * IQE质量智能助手 - 跨场景关联规则设计
 * 库存-上线-测试三个场景之间的关联查询规则
 */

// 1. 库存到生产关联规则
const inventoryToProductionRules = [
  {
    intent: "trace_inventory_to_production",
    keywords: ["库存到生产", "库存上线情况", "库存生产追踪"],
    examples: ["查询库存物料的生产情况", "库存批次的上线记录", "物料从库存到生产的追踪"],
    description: "追踪库存物料在生产环节的情况",
    target: "inventory_production_link",
    parameters: {
      materialName: { type: "fuzzy", source: "query" },
      batchNo: { type: "fuzzy", source: "query" },
      supplier: { type: "fuzzy", source: "query" },
      factory: { type: "fuzzy", source: "query" }
    },
    linkFields: ["materialCode", "batchNo", "supplier"],
    analysis: {
      inventory_status: "库存状态分析",
      production_performance: "生产表现分析",
      correlation: "库存状态与生产质量关联性"
    }
  },
  {
    intent: "analyze_inventory_production_correlation",
    keywords: ["库存生产关联", "库存状态与生产质量", "库存生产相关性"],
    examples: ["分析库存状态与生产质量的关联", "库存风险对生产的影响", "库存生产相关性分析"],
    description: "分析库存状态与生产质量之间的关联性",
    target: "correlation_analysis",
    parameters: {
      timeRange: { type: "dateRange", source: "query", default: "90days" },
      analysisScope: { type: "enum", values: ["all", "factory", "supplier", "material"], default: "all" }
    }
  }
];

// 2. 生产到测试关联规则
const productionToInspectionRules = [
  {
    intent: "trace_production_to_inspection",
    keywords: ["生产到测试", "上线测试情况", "生产测试追踪"],
    examples: ["查询生产批次的测试情况", "上线物料的检验记录", "生产到测试的追踪"],
    description: "追踪生产批次在测试环节的情况",
    target: "production_inspection_link",
    parameters: {
      materialName: { type: "fuzzy", source: "query" },
      batchNo: { type: "fuzzy", source: "query" },
      projectId: { type: "fuzzy", source: "query" },
      baseline: { type: "fuzzy", source: "query" }
    },
    linkFields: ["materialCode", "batchNo", "supplier", "projectId", "baseline"],
    analysis: {
      production_quality: "生产质量分析",
      inspection_results: "测试结果分析",
      quality_consistency: "生产与测试质量一致性"
    }
  },
  {
    intent: "analyze_production_inspection_correlation",
    keywords: ["生产测试关联", "不良率与测试结果", "生产测试相关性"],
    examples: ["分析不良率与测试结果的关联", "生产质量对测试的影响", "生产测试相关性分析"],
    description: "分析生产质量与测试结果之间的关联性",
    target: "correlation_analysis",
    parameters: {
      timeRange: { type: "dateRange", source: "query", default: "90days" },
      correlationMetrics: ["defectRate", "testPassRate", "defectTypes"]
    }
  }
];

// 3. 库存到测试关联规则
const inventoryToInspectionRules = [
  {
    intent: "trace_inventory_to_inspection",
    keywords: ["库存到测试", "库存测试情况", "库存检验追踪"],
    examples: ["查询库存物料的测试情况", "库存批次的检验记录", "物料从库存到测试的追踪"],
    description: "追踪库存物料在测试环节的情况",
    target: "inventory_inspection_link",
    parameters: {
      materialName: { type: "fuzzy", source: "query" },
      batchNo: { type: "fuzzy", source: "query" },
      supplier: { type: "fuzzy", source: "query" }
    },
    linkFields: ["materialCode", "batchNo", "supplier"],
    analysis: {
      inventory_quality: "库存质量状态",
      inspection_performance: "测试表现分析",
      early_detection: "早期质量问题识别"
    }
  }
];

// 4. 全链路追踪规则
const fullChainTraceRules = [
  {
    intent: "full_chain_material_trace",
    keywords: ["物料全链路追踪", "物料完整追踪", "物料全生命周期"],
    examples: ["OLED显示屏全链路追踪", "物料完整生命周期追踪", "物料全流程质量追踪"],
    description: "追踪物料在库存、生产、测试全链路的情况",
    target: "full_chain_trace",
    parameters: {
      materialName: { type: "fuzzy", source: "query", required: true },
      materialCode: { type: "fuzzy", source: "query" },
      timeRange: { type: "dateRange", source: "query", default: "90days" }
    },
    traceScope: {
      inventory: ["入库记录", "库存状态", "数量变化", "状态变更"],
      production: ["上线记录", "生产质量", "不良情况", "工厂分布"],
      inspection: ["测试记录", "测试结果", "质量趋势", "问题分析"]
    }
  },
  {
    intent: "full_chain_batch_trace",
    keywords: ["批次全链路追踪", "批次完整追踪", "批次全生命周期"],
    examples: ["批次TK240601全链路追踪", "批次完整生命周期追踪", "批次全流程质量追踪"],
    description: "追踪批次在库存、生产、测试全链路的情况",
    target: "full_chain_trace",
    parameters: {
      batchNo: { type: "fuzzy", source: "query", required: true }
    },
    traceScope: {
      inventory: ["库存信息", "入库时间", "当前状态", "库存位置"],
      production: ["生产记录", "上线时间", "质量表现", "生产工厂"],
      inspection: ["测试记录", "测试时间", "测试结果", "质量评估"]
    }
  },
  {
    intent: "full_chain_supplier_trace",
    keywords: ["供应商全链路追踪", "供应商完整追踪", "供应商全流程"],
    examples: ["BOE供应商全链路追踪", "供应商完整质量追踪", "供应商全流程分析"],
    description: "追踪供应商物料在全链路的质量表现",
    target: "full_chain_trace",
    parameters: {
      supplier: { type: "fuzzy", source: "query", required: true },
      timeRange: { type: "dateRange", source: "query", default: "180days" }
    }
  }
];

// 5. 项目/基线关联规则
const projectBaselineRules = [
  {
    intent: "project_full_material_trace",
    keywords: ["项目物料追踪", "项目全链路", "项目物料状态"],
    examples: ["项目PRJ_001物料全链路追踪", "项目物料完整状态", "项目相关物料分析"],
    description: "追踪项目相关的所有物料在全链路的情况",
    target: "project_trace",
    parameters: {
      projectId: { type: "fuzzy", source: "query", required: true }
    },
    traceScope: {
      inventory: "项目相关库存物料",
      production: "项目生产记录",
      inspection: "项目测试记录"
    }
  },
  {
    intent: "baseline_full_material_trace",
    keywords: ["基线物料追踪", "基线全链路", "基线物料状态"],
    examples: ["基线I6789物料全链路追踪", "基线物料完整状态", "基线相关物料分析"],
    description: "追踪基线相关的所有物料在全链路的情况",
    target: "baseline_trace",
    parameters: {
      baseline: { type: "fuzzy", source: "query", required: true }
    }
  }
];

// 6. 质量影响链分析规则
const qualityImpactChainRules = [
  {
    intent: "analyze_quality_impact_chain",
    keywords: ["质量影响链", "质量传递分析", "质量影响传递"],
    examples: ["分析质量问题的影响链", "质量问题传递分析", "质量影响链追踪"],
    description: "分析质量问题在各环节之间的影响和传递",
    target: "quality_impact_analysis",
    parameters: {
      startPoint: { type: "enum", values: ["inventory", "production", "inspection"] },
      materialName: { type: "fuzzy", source: "query" },
      timeRange: { type: "dateRange", source: "query", default: "90days" }
    },
    impactAnalysis: {
      upstream_impact: "上游影响分析",
      downstream_impact: "下游影响分析",
      root_cause: "根因分析",
      prevention: "预防措施建议"
    }
  },
  {
    intent: "identify_quality_bottlenecks",
    keywords: ["质量瓶颈识别", "质量薄弱环节", "质量问题环节"],
    examples: ["识别质量瓶颈环节", "查找质量薄弱环节", "质量问题环节分析"],
    description: "识别全链路中的质量瓶颈和薄弱环节",
    target: "bottleneck_analysis",
    parameters: {
      analysisScope: { type: "enum", values: ["all", "factory", "supplier", "material"], default: "all" },
      timeRange: { type: "dateRange", source: "query", default: "90days" }
    }
  }
];

console.log("🔗 IQE跨场景关联规则设计完成");
console.log(`📦➡️🏭 库存到生产规则: ${inventoryToProductionRules.length}条`);
console.log(`🏭➡️🧪 生产到测试规则: ${productionToInspectionRules.length}条`);
console.log(`📦➡️🧪 库存到测试规则: ${inventoryToInspectionRules.length}条`);
console.log(`🔄 全链路追踪规则: ${fullChainTraceRules.length}条`);
console.log(`📋 项目基线规则: ${projectBaselineRules.length}条`);
console.log(`⚡ 质量影响链规则: ${qualityImpactChainRules.length}条`);
console.log(`📊 总计跨场景规则: ${inventoryToProductionRules.length + productionToInspectionRules.length + inventoryToInspectionRules.length + fullChainTraceRules.length + projectBaselineRules.length + qualityImpactChainRules.length}条`);

export { 
  inventoryToProductionRules,
  productionToInspectionRules,
  inventoryToInspectionRules,
  fullChainTraceRules,
  projectBaselineRules,
  qualityImpactChainRules
};
