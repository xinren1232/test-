/**
 * 优化的问答规则配置 V2.0 - 基于用户实际需求
 * 根据真实数据结构和用户要求精心设计
 */

// 实际工厂列表 (只保留一个用于演示)
export const ACTUAL_FACTORIES = ['深圳工厂', '重庆工厂', '南昌工厂', '宜宾工厂'];

// 实际供应商列表 (只保留BOE，其他供应商根据实际数据匹配)
export const ACTUAL_SUPPLIERS = [
  'BOE', '歌尔股份', '聚龙', '欣冠', '广正', '帝晶', '天马', '华星',
  '盛泰', '天实', '深奥', '百俊达', '奥海', '辰阳', '锂威', '风华',
  '维科', '东声', '豪声', '丽德宝', '裕同', '富群'
];

// 实际物料列表 (基于真实数据)
export const ACTUAL_MATERIALS = [
  '电池盖', '中框', '手机卡托', '侧键', '装饰件',
  'LCD显示屏', 'OLED显示屏', '摄像头模组',
  '电池', '充电器', '扬声器', '听筒',
  '保护套', '标签', '包装盒'
];

// 实际项目列表 (基于ProjectBaselineMap.js)
export const ACTUAL_PROJECTS = [
  'X6827', 'S665LN', 'KI4K', 'X6828', 'X6831', 'KI5K', 'KI3K',
  'S662LN', 'S663LN', 'S664LN'
];

// 实际基线列表
export const ACTUAL_BASELINES = ['I6789', 'I6788', 'I6787'];

// 优化的基础问答规则
export const OPTIMIZED_QA_RULES_V2 = {
  // 库存查询规则 (按用户要求优化)
  inventory: [
    // 1) 工厂库存查询：只保留一个工厂
    { 
      name: '工厂库存查询', 
      query: '查询深圳工厂的库存', 
      icon: '🏭', 
      category: 'inventory',
      intent: 'query_inventory_by_factory',
      description: '查询指定工厂的库存情况'
    },
    
    // 2) 供应商库存查询：只保留BOE
    { 
      name: '供应商库存查询', 
      query: '查询BOE供应商的物料', 
      icon: '🏢', 
      category: 'inventory',
      intent: 'query_inventory_by_supplier',
      description: '查询BOE供应商的物料库存'
    },
    
    // 3) 物料状态查询：只保留风险库存
    { 
      name: '风险库存查询', 
      query: '查询风险状态的库存', 
      icon: '⚠️', 
      category: 'inventory',
      intent: 'query_inventory_by_status',
      description: '查询风险状态的库存物料'
    },
    
    // 4) 物料种类查询：只保留电池库存
    { 
      name: '电池库存查询', 
      query: '查询电池的库存', 
      icon: '🔋', 
      category: 'inventory',
      intent: 'query_inventory_by_material',
      description: '查询电池类物料的库存'
    },
    
    // 5) 库存总览
    { 
      name: '库存总览', 
      query: '查询所有库存记录', 
      icon: '📦', 
      category: 'inventory',
      intent: 'query_all_inventory',
      description: '查询所有库存记录总览'
    },
    
    // 6) 库存供应商统计
    { 
      name: '库存供应商统计', 
      query: '库存物料涉及多少家供应商？', 
      icon: '🏭', 
      category: 'inventory',
      intent: 'count_inventory_suppliers',
      description: '统计库存物料涉及的供应商数量'
    }
  ],

  // 测试记录查询规则 (按用户要求优化)
  quality: [
    // 1) 测试状态查询：改为测试NG记录
    { 
      name: '测试NG记录', 
      query: '查询测试NG记录', 
      icon: '❌', 
      category: 'quality',
      intent: 'query_test_ng_records',
      description: '查询测试不合格(NG)的记录'
    },
    
    // 2) 物料测试记录：电池盖测试记录
    { 
      name: '电池盖测试记录', 
      query: '查询电池盖测试记录', 
      icon: '🧪', 
      category: 'quality',
      intent: 'query_material_test_records',
      description: '查询电池盖物料的测试记录'
    },
    
    // 3) 供应商测试记录：BOE测试记录
    { 
      name: 'BOE测试记录', 
      query: '查询BOE测试记录', 
      icon: '🔍', 
      category: 'quality',
      intent: 'query_supplier_test_records',
      description: '查询BOE供应商的测试记录'
    }
  ],

  // 生产查询规则 (按用户要求优化)
  production: [
    // 1) 工厂生产记录查询：只保留一个
    { 
      name: '工厂生产记录', 
      query: '查询深圳工厂的生产记录', 
      icon: '⚙️', 
      category: 'production',
      intent: 'query_production_by_factory',
      description: '查询深圳工厂的生产记录'
    },
    
    // 2) 物料生产记录查询：电池盖物料
    { 
      name: '电池盖生产记录', 
      query: '查询电池盖物料的生产记录', 
      icon: '🔧', 
      category: 'production',
      intent: 'query_production_by_material',
      description: '查询电池盖物料的生产记录'
    },
    
    // 3) 供应商生产记录：BOE生产记录
    { 
      name: 'BOE生产记录', 
      query: '查询BOE生产记录', 
      icon: '🏢', 
      category: 'production',
      intent: 'query_production_by_supplier',
      description: '查询BOE供应商的生产记录'
    },
    
    // 4) 项目不良记录查询：S662测试记录
    { 
      name: 'S662项目记录', 
      query: '查询S662LN项目记录', 
      icon: '📋', 
      category: 'production',
      intent: 'query_production_by_project',
      description: '查询S662LN项目的生产记录'
    }
  ],

  // 综合查询规则 (按用户要求优化)
  summary: [
    // 1) 多少种物料？
    { 
      name: '物料种类统计', 
      query: '多少种物料？', 
      icon: '📊', 
      category: 'summary',
      intent: 'count_material_types',
      description: '统计系统中的物料种类数量'
    },
    
    // 2) 物料有几个批次？
    { 
      name: '物料批次统计', 
      query: '物料有几个批次？', 
      icon: '🏷️', 
      category: 'summary',
      intent: 'count_material_batches',
      description: '统计物料的批次数量'
    },
    
    // 3) 有几个项目？
    { 
      name: '项目数量统计', 
      query: '有几个项目？', 
      icon: '📈', 
      category: 'summary',
      intent: 'count_projects',
      description: '统计系统中的项目数量'
    },
    
    // 4) 有几个基线？
    { 
      name: '基线数量统计', 
      query: '有几个基线？', 
      icon: '📐', 
      category: 'summary',
      intent: 'count_baselines',
      description: '统计系统中的基线数量'
    },
    
    // 5) 有几家供应商？
    { 
      name: '供应商数量统计', 
      query: '有几家供应商？', 
      icon: '🏭', 
      category: 'summary',
      intent: 'count_suppliers',
      description: '统计系统中的供应商数量'
    }
  ]
};

// 进阶问答规则 (高级分析)
export const ADVANCED_QA_RULES_V2 = {
  // 物料分析
  material_analysis: [
    { 
      name: '物料综合分析', 
      query: '分析电池盖物料的库存、测试、生产记录数据汇总', 
      icon: '📊', 
      category: 'analysis',
      intent: 'analyze_material_comprehensive',
      description: '对指定物料进行库存、测试、生产的综合分析'
    },
    { 
      name: '供应商综合分析', 
      query: '分析BOE供应商的库存、测试、生产记录数据汇总', 
      icon: '🏢', 
      category: 'analysis',
      intent: 'analyze_supplier_comprehensive',
      description: '对指定供应商进行全方位数据分析'
    }
  ],

  // 对比分析
  comparison_analysis: [
    { 
      name: '物料批次对比', 
      query: '对比电池盖和中框的批次数据', 
      icon: '⚖️', 
      category: 'comparison',
      intent: 'compare_material_batches',
      description: '对比不同物料的批次数据差异'
    },
    { 
      name: '供应商差异对比', 
      query: '对比BOE和歌尔股份的供应商差异', 
      icon: '🔄', 
      category: 'comparison',
      intent: 'compare_supplier_performance',
      description: '对比不同供应商的表现差异'
    }
  ],

  // 风险分析
  risk_analysis: [
    { 
      name: '库存风险分析', 
      query: '分析当前库存的风险状况和预警', 
      icon: '⚠️', 
      category: 'risk',
      intent: 'analyze_inventory_risks',
      description: '分析库存风险状况并提供预警'
    },
    { 
      name: '质量风险分析', 
      query: '分析测试不合格的风险趋势', 
      icon: '🚨', 
      category: 'risk',
      intent: 'analyze_quality_risks',
      description: '分析质量风险趋势和预测'
    },
    { 
      name: '生产风险分析', 
      query: '分析生产不良率的风险评估', 
      icon: '📉', 
      category: 'risk',
      intent: 'analyze_production_risks',
      description: '分析生产风险并进行评估'
    }
  ]
};

// 复杂图表规则
export const CHART_QA_RULES_V2 = {
  distribution_charts: [
    { 
      name: '库存状态分布图', 
      query: '生成库存状态分布饼图', 
      icon: '🥧', 
      category: 'chart',
      intent: 'generate_inventory_status_pie',
      description: '生成库存状态分布的饼图'
    },
    { 
      name: '供应商物料分布', 
      query: '生成供应商物料分布柱状图', 
      icon: '📊', 
      category: 'chart',
      intent: 'generate_supplier_material_bar',
      description: '生成供应商物料分布的柱状图'
    }
  ],

  comparison_charts: [
    { 
      name: '工厂库存对比', 
      query: '生成各工厂库存对比图表', 
      icon: '📈', 
      category: 'chart',
      intent: 'generate_factory_inventory_comparison',
      description: '生成各工厂库存对比图表'
    },
    { 
      name: '物料批次分布', 
      query: '生成物料批次分布雷达图', 
      icon: '🎯', 
      category: 'chart',
      intent: 'generate_material_batch_radar',
      description: '生成物料批次分布的雷达图'
    }
  ],

  trend_charts: [
    { 
      name: '测试合格率趋势', 
      query: '生成测试合格率趋势图', 
      icon: '📉', 
      category: 'chart',
      intent: 'generate_test_pass_rate_trend',
      description: '生成测试合格率的趋势图'
    },
    { 
      name: '生产不良率分析', 
      query: '生成生产不良率分析图表', 
      icon: '⚠️', 
      category: 'chart',
      intent: 'generate_production_defect_analysis',
      description: '生成生产不良率分析图表'
    }
  ]
};

// 导出所有规则
export default {
  ACTUAL_FACTORIES,
  ACTUAL_SUPPLIERS,
  ACTUAL_MATERIALS,
  ACTUAL_PROJECTS,
  ACTUAL_BASELINES,
  OPTIMIZED_QA_RULES_V2,
  ADVANCED_QA_RULES_V2,
  CHART_QA_RULES_V2
};
