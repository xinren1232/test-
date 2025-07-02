/**
 * 设计新增规则场景
 * 基于分析结果设计更全面的查询场景
 */

// 新增规则场景设计
const newRuleScenarios = {
  
  // ========== 1. 趋势分析场景 ==========
  trendAnalysis: [
    {
      intent: "trend_quality_analysis",
      keywords: ["质量趋势", "趋势分析", "质量变化", "质量走势", "历史趋势"],
      description: "分析质量数据的时间趋势",
      action: "trend_analysis",
      target: "quality_trend",
      chartType: "line",
      examples: [
        "最近3个月的质量趋势如何？",
        "显示BOE供应商的质量走势",
        "分析电池盖的质量变化趋势"
      ],
      parameters: {
        timeRange: { type: "period", default: "3months" },
        supplier: { type: "fuzzy", source: "query" },
        materialName: { type: "fuzzy", source: "query" }
      },
      responseFormat: "chart_with_analysis"
    },
    {
      intent: "trend_inventory_analysis", 
      keywords: ["库存趋势", "库存变化", "库存走势", "入库趋势"],
      description: "分析库存数据的时间趋势",
      action: "trend_analysis",
      target: "inventory_trend",
      chartType: "area",
      examples: [
        "显示最近半年的库存趋势",
        "深圳工厂的库存变化情况",
        "分析各供应商的供货趋势"
      ]
    },
    {
      intent: "trend_defect_analysis",
      keywords: ["不良率趋势", "缺陷趋势", "故障趋势", "异常趋势"],
      description: "分析不良率和缺陷的时间趋势",
      action: "trend_analysis", 
      target: "defect_trend",
      chartType: "line",
      examples: [
        "显示生产线不良率趋势",
        "分析各工厂的缺陷率变化",
        "查看异常情况的发展趋势"
      ]
    }
  ],

  // ========== 2. 对比分析场景 ==========
  comparisonAnalysis: [
    {
      intent: "compare_suppliers",
      keywords: ["供应商对比", "供应商比较", "哪个供应商更好", "供应商排名"],
      description: "对比不同供应商的表现",
      action: "comparison_analysis",
      target: "supplier_comparison", 
      chartType: "radar",
      examples: [
        "对比BOE和聚龙的供应商表现",
        "哪个供应商质量最好？",
        "显示所有供应商的综合排名"
      ],
      metrics: ["质量合格率", "交付及时率", "不良率", "风险等级"]
    },
    {
      intent: "compare_factories",
      keywords: ["工厂对比", "工厂比较", "哪个工厂更好", "工厂排名"],
      description: "对比不同工厂的表现",
      action: "comparison_analysis",
      target: "factory_comparison",
      chartType: "bar",
      examples: [
        "对比深圳工厂和重庆工厂",
        "哪个工厂效率最高？",
        "显示各工厂的生产情况对比"
      ]
    },
    {
      intent: "compare_materials",
      keywords: ["物料对比", "物料比较", "哪种物料更好", "物料排名"],
      description: "对比不同物料的质量表现",
      action: "comparison_analysis",
      target: "material_comparison",
      chartType: "column",
      examples: [
        "对比电池盖和OLED显示屏的质量",
        "哪种物料问题最多？",
        "显示各物料的质量对比"
      ]
    }
  ],

  // ========== 3. 统计分析场景 ==========
  statisticalAnalysis: [
    {
      intent: "distribution_analysis",
      keywords: ["分布情况", "分布分析", "占比分析", "比例分析"],
      description: "分析数据的分布情况",
      action: "statistical_analysis",
      target: "distribution",
      chartType: "pie",
      examples: [
        "显示各状态库存的分布情况",
        "分析供应商的占比分布",
        "查看不同工厂的产量分布"
      ]
    },
    {
      intent: "correlation_analysis",
      keywords: ["关联分析", "相关性分析", "影响因素", "关系分析"],
      description: "分析数据间的关联关系",
      action: "statistical_analysis",
      target: "correlation",
      chartType: "scatter",
      examples: [
        "分析供应商与质量的关系",
        "查看批次与不良率的关联",
        "显示库存量与风险的相关性"
      ]
    },
    {
      intent: "outlier_detection",
      keywords: ["异常检测", "离群值", "异常数据", "数据异常"],
      description: "检测数据中的异常值",
      action: "statistical_analysis",
      target: "outliers",
      chartType: "box",
      examples: [
        "检测库存数据中的异常值",
        "找出不良率异常的批次",
        "识别质量数据的离群值"
      ]
    }
  ],

  // ========== 4. 预测分析场景 ==========
  predictiveAnalysis: [
    {
      intent: "quality_prediction",
      keywords: ["质量预测", "预测质量", "质量预警", "质量风险预测"],
      description: "预测质量风险和趋势",
      action: "predictive_analysis",
      target: "quality_forecast",
      chartType: "forecast_line",
      examples: [
        "预测下个月的质量情况",
        "哪些批次可能出现质量问题？",
        "预测供应商的质量风险"
      ]
    },
    {
      intent: "inventory_prediction",
      keywords: ["库存预测", "预测库存", "库存预警", "库存不足预警"],
      description: "预测库存需求和风险",
      action: "predictive_analysis", 
      target: "inventory_forecast",
      chartType: "forecast_area",
      examples: [
        "预测下周的库存需求",
        "哪些物料可能库存不足？",
        "预测库存风险情况"
      ]
    }
  ],

  // ========== 5. 智能推荐场景 ==========
  intelligentRecommendation: [
    {
      intent: "improvement_recommendation",
      keywords: ["改进建议", "优化建议", "改善方案", "提升建议"],
      description: "基于数据分析提供改进建议",
      action: "recommendation",
      target: "improvement_suggestions",
      examples: [
        "给出质量改进建议",
        "如何优化库存管理？",
        "提供供应商管理建议"
      ]
    },
    {
      intent: "related_query_suggestion",
      keywords: ["相关查询", "推荐查询", "还想了解", "深入分析"],
      description: "推荐相关的查询内容",
      action: "recommendation",
      target: "query_suggestions",
      examples: [
        "基于当前查询推荐相关分析",
        "还可以查看哪些相关数据？",
        "推荐深度分析内容"
      ]
    }
  ],

  // ========== 6. 多维度分析场景 ==========
  multidimensionalAnalysis: [
    {
      intent: "comprehensive_dashboard",
      keywords: ["综合仪表板", "全面分析", "整体情况", "综合报告"],
      description: "生成综合分析仪表板",
      action: "dashboard_generation",
      target: "comprehensive_dashboard",
      chartType: "dashboard",
      examples: [
        "生成质量管理综合仪表板",
        "显示整体运营情况",
        "创建供应商管理仪表板"
      ]
    },
    {
      intent: "drill_down_analysis",
      keywords: ["深入分析", "详细分析", "钻取分析", "细分分析"],
      description: "对数据进行深入钻取分析",
      action: "drill_down",
      target: "detailed_analysis",
      examples: [
        "深入分析BOE供应商的详细情况",
        "钻取查看电池盖的具体问题",
        "详细分析深圳工厂的生产数据"
      ]
    }
  ]
};

// 生成规则配置
function generateRuleConfigurations() {
  console.log('🎯 新增规则场景设计\n');
  
  let totalRules = 0;
  
  Object.keys(newRuleScenarios).forEach(category => {
    const categoryName = {
      trendAnalysis: '趋势分析',
      comparisonAnalysis: '对比分析', 
      statisticalAnalysis: '统计分析',
      predictiveAnalysis: '预测分析',
      intelligentRecommendation: '智能推荐',
      multidimensionalAnalysis: '多维度分析'
    }[category];
    
    console.log(`📂 ${categoryName} (${newRuleScenarios[category].length} 条规则)`);
    
    newRuleScenarios[category].forEach((rule, index) => {
      console.log(`  ${index + 1}. ${rule.intent}`);
      console.log(`     描述: ${rule.description}`);
      console.log(`     关键词: ${rule.keywords.slice(0, 3).join(', ')}...`);
      if (rule.chartType) {
        console.log(`     图表类型: ${rule.chartType}`);
      }
      console.log(`     示例: ${rule.examples[0]}`);
      console.log('');
      totalRules++;
    });
  });
  
  console.log(`📊 总计新增规则: ${totalRules} 条`);
  console.log(`📈 规则增长: ${Math.round((totalRules / 32) * 100)}%`);
  
  return newRuleScenarios;
}

// 生成实现优先级
function generateImplementationPriority() {
  console.log('\n🎯 实现优先级建议\n');
  
  const priorities = [
    {
      priority: 1,
      category: '趋势分析 + 图表可视化',
      reason: '用户最需要的功能，影响最大',
      estimatedTime: '1-2周',
      rules: ['trend_quality_analysis', 'trend_inventory_analysis', 'trend_defect_analysis']
    },
    {
      priority: 2,
      category: '对比分析 + 统计分析',
      reason: '提供业务洞察，增强分析能力',
      estimatedTime: '2-3周',
      rules: ['compare_suppliers', 'distribution_analysis', 'correlation_analysis']
    },
    {
      priority: 3,
      category: '智能推荐 + 多维度分析',
      reason: '提升用户体验，增加粘性',
      estimatedTime: '2-3周',
      rules: ['improvement_recommendation', 'comprehensive_dashboard']
    },
    {
      priority: 4,
      category: '预测分析',
      reason: '高级功能，需要更多数据积累',
      estimatedTime: '3-4周',
      rules: ['quality_prediction', 'inventory_prediction']
    }
  ];
  
  priorities.forEach(item => {
    console.log(`优先级 ${item.priority}: ${item.category}`);
    console.log(`  原因: ${item.reason}`);
    console.log(`  预估时间: ${item.estimatedTime}`);
    console.log(`  包含规则: ${item.rules.join(', ')}`);
    console.log('');
  });
}

// 执行设计
console.log('🚀 开始设计新增规则场景...\n');
const scenarios = generateRuleConfigurations();
generateImplementationPriority();

console.log('🎉 新增规则场景设计完成！');

export default newRuleScenarios;
