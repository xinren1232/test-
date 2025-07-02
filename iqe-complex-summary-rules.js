/**
 * IQE质量智能助手 - 复杂汇总规则设计
 * 物料整体质量状态确认、工厂物料状态分析等复杂规则
 */

// 1. 物料整体质量状态确认规则
const materialQualityConfirmationRules = [
  {
    intent: "confirm_material_overall_quality",
    keywords: ["物料整体质量状态确认", "物料质量状态确认", "物料整体状态确认"],
    examples: ["确认OLED显示屏的整体质量状态", "电池盖物料质量状态确认", "物料整体质量评估确认"],
    description: "全面确认物料在库存、生产、测试各环节的质量状态",
    target: "cross_scenario_analysis",
    parameters: {
      materialName: { type: "fuzzy", source: "query", required: true },
      materialCode: { type: "fuzzy", source: "query" },
      timeRange: { type: "dateRange", source: "query", default: "90days" }
    },
    analysisScope: {
      inventory: {
        metrics: ["totalQuantity", "statusDistribution", "expiryRisk", "warehouseDistribution"],
        calculations: ["riskRatio", "expiryWithin30Days", "quantityByStatus"]
      },
      production: {
        metrics: ["totalBatches", "avgDefectRate", "defectTypes", "factoryPerformance"],
        calculations: ["defectTrend", "qualityStability", "performanceByFactory"]
      },
      inspection: {
        metrics: ["totalTests", "passRate", "failureReasons", "testTrends"],
        calculations: ["qualityTrend", "failurePatterns", "testEfficiency"]
      }
    },
    qualityAssessment: {
      overall: "综合质量等级评定",
      recommendations: "质量改进建议",
      riskAlerts: "风险预警信息"
    }
  },
  {
    intent: "generate_material_quality_report",
    keywords: ["物料质量报告", "物料质量汇总报告", "物料质量分析报告"],
    examples: ["生成OLED显示屏质量报告", "物料质量汇总报告", "物料质量分析报告"],
    description: "生成物料的详细质量分析报告",
    target: "cross_scenario_analysis",
    parameters: {
      materialName: { type: "fuzzy", source: "query", required: true },
      reportType: { type: "enum", values: ["summary", "detailed", "trend"], default: "detailed" },
      timeRange: { type: "dateRange", source: "query", default: "90days" }
    },
    reportSections: {
      executive_summary: "执行摘要",
      inventory_analysis: "库存状态分析",
      production_analysis: "生产质量分析", 
      inspection_analysis: "测试质量分析",
      risk_assessment: "风险评估",
      recommendations: "改进建议"
    }
  }
];

// 2. 工厂物料状态分析规则
const factoryMaterialAnalysisRules = [
  {
    intent: "analyze_factory_all_materials",
    keywords: ["工厂所有物料状态分析", "工厂物料整体分析", "工厂全部物料状态"],
    examples: ["深圳工厂所有物料状态分析", "上海工厂物料整体分析", "工厂全部物料质量状态"],
    description: "分析工厂所有物料的综合状态",
    target: "factory_comprehensive_analysis",
    parameters: {
      factory: { type: "fuzzy", source: "query", required: true },
      timeRange: { type: "dateRange", source: "query", default: "30days" }
    },
    analysisScope: {
      inventory: {
        overview: ["totalMaterials", "totalQuantity", "statusBreakdown"],
        details: ["materialList", "quantityByMaterial", "statusByMaterial", "expiryAnalysis"]
      },
      production: {
        overview: ["totalBatches", "avgDefectRate", "productionVolume"],
        details: ["defectRateByMaterial", "defectTypeAnalysis", "productionTrends"]
      },
      inspection: {
        overview: ["totalTests", "overallPassRate", "testVolume"],
        details: ["passRateByMaterial", "failureAnalysis", "testTrends"]
      }
    },
    outputFormat: {
      dashboard: "工厂物料状态仪表板",
      heatmap: "物料质量热力图",
      trends: "质量趋势图表",
      alerts: "异常预警列表"
    }
  },
  {
    intent: "factory_material_risk_assessment",
    keywords: ["工厂物料风险评估", "工厂风险物料分析", "工厂物料风险状态"],
    examples: ["深圳工厂物料风险评估", "工厂风险物料分析", "工厂物料风险状态评估"],
    description: "评估工厂所有物料的风险状态",
    target: "factory_risk_analysis",
    parameters: {
      factory: { type: "fuzzy", source: "query", required: true },
      riskLevel: { type: "enum", values: ["all", "high", "medium", "low"], default: "all" }
    },
    riskCategories: {
      inventory_risk: ["过期风险", "库存不足", "状态异常"],
      production_risk: ["高不良率", "质量不稳定", "新增缺陷"],
      inspection_risk: ["测试失败", "质量下降", "检验异常"]
    }
  }
];

// 3. 供应商综合评估规则
const supplierComprehensiveRules = [
  {
    intent: "comprehensive_supplier_evaluation",
    keywords: ["供应商综合评估", "供应商全面评估", "供应商质量评估"],
    examples: ["BOE供应商综合评估", "供应商全面质量评估", "供应商综合表现评估"],
    description: "对供应商进行全面的质量表现评估",
    target: "supplier_comprehensive_analysis",
    parameters: {
      supplier: { type: "fuzzy", source: "query", required: true },
      timeRange: { type: "dateRange", source: "query", default: "180days" }
    },
    evaluationDimensions: {
      delivery_quality: {
        metrics: ["库存状态分布", "物料质量稳定性", "交付及时性"],
        weight: 0.3
      },
      production_quality: {
        metrics: ["平均不良率", "质量稳定性", "缺陷类型多样性"],
        weight: 0.4
      },
      inspection_quality: {
        metrics: ["测试通过率", "质量趋势", "问题响应速度"],
        weight: 0.3
      }
    },
    scoringSystem: {
      excellent: "90-100分",
      good: "80-89分", 
      average: "70-79分",
      poor: "60-69分",
      critical: "60分以下"
    }
  },
  {
    intent: "supplier_ranking_analysis",
    keywords: ["供应商排名", "供应商对比排名", "供应商质量排行"],
    examples: ["供应商质量排名", "供应商表现排行榜", "供应商对比排名"],
    description: "对所有供应商进行质量表现排名",
    target: "supplier_ranking_analysis",
    parameters: {
      timeRange: { type: "dateRange", source: "query", default: "90days" },
      rankingCriteria: { type: "enum", values: ["overall", "quality", "stability"], default: "overall" }
    }
  }
];

// 4. 跨时间维度分析规则
const timeBasedAnalysisRules = [
  {
    intent: "quality_trend_analysis",
    keywords: ["质量趋势分析", "质量变化趋势", "质量走向分析"],
    examples: ["整体质量趋势分析", "质量变化趋势", "质量改善趋势"],
    description: "分析整体质量随时间的变化趋势",
    target: "time_series_analysis",
    parameters: {
      scope: { type: "enum", values: ["overall", "factory", "supplier", "material"], default: "overall" },
      timeRange: { type: "dateRange", source: "query", default: "180days" },
      granularity: { type: "enum", values: ["daily", "weekly", "monthly"], default: "weekly" }
    }
  },
  {
    intent: "seasonal_quality_analysis",
    keywords: ["季节性质量分析", "周期性质量分析", "质量周期性"],
    examples: ["季节性质量变化分析", "质量周期性分析", "季节质量模式"],
    description: "分析质量的季节性或周期性变化模式",
    target: "seasonal_analysis",
    parameters: {
      timeRange: { type: "dateRange", source: "query", default: "365days" },
      analysisType: { type: "enum", values: ["seasonal", "monthly", "weekly"], default: "seasonal" }
    }
  }
];

// 5. 预警和预测规则
const alertAndPredictionRules = [
  {
    intent: "quality_alert_analysis",
    keywords: ["质量预警分析", "质量告警", "质量异常预警"],
    examples: ["质量预警分析", "当前质量告警", "质量异常预警"],
    description: "分析当前的质量预警和异常情况",
    target: "alert_analysis",
    parameters: {
      alertLevel: { type: "enum", values: ["all", "critical", "warning", "info"], default: "all" },
      timeRange: { type: "dateRange", source: "query", default: "7days" }
    },
    alertTypes: {
      inventory_alerts: ["过期预警", "库存不足", "状态异常"],
      production_alerts: ["不良率超标", "新增缺陷", "质量下降"],
      inspection_alerts: ["测试失败率高", "连续失败", "质量异常"]
    }
  },
  {
    intent: "quality_prediction_analysis",
    keywords: ["质量预测分析", "质量趋势预测", "质量预测"],
    examples: ["质量趋势预测", "未来质量预测", "质量预测分析"],
    description: "基于历史数据预测未来质量趋势",
    target: "prediction_analysis",
    parameters: {
      predictionPeriod: { type: "enum", values: ["7days", "30days", "90days"], default: "30days" },
      scope: { type: "enum", values: ["overall", "factory", "supplier", "material"], default: "overall" }
    }
  }
];

console.log("🔬 IQE复杂汇总规则设计完成");
console.log(`🎯 物料质量确认规则: ${materialQualityConfirmationRules.length}条`);
console.log(`🏭 工厂物料分析规则: ${factoryMaterialAnalysisRules.length}条`);
console.log(`🏢 供应商综合评估规则: ${supplierComprehensiveRules.length}条`);
console.log(`📈 时间维度分析规则: ${timeBasedAnalysisRules.length}条`);
console.log(`⚠️ 预警预测规则: ${alertAndPredictionRules.length}条`);
console.log(`📊 总计复杂汇总规则: ${materialQualityConfirmationRules.length + factoryMaterialAnalysisRules.length + supplierComprehensiveRules.length + timeBasedAnalysisRules.length + alertAndPredictionRules.length}条`);

export { 
  materialQualityConfirmationRules,
  factoryMaterialAnalysisRules,
  supplierComprehensiveRules,
  timeBasedAnalysisRules,
  alertAndPredictionRules
};
