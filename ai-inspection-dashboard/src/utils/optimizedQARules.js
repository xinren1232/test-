/**
 * 优化的问答规则配置 - 基于实际数据
 * 移除重复规则，匹配实际数据结构
 */

// 实际工厂列表
export const ACTUAL_FACTORIES = ['重庆工厂', '深圳工厂', '南昌工厂', '宜宾工厂'];

// ✅ 实际供应商列表 (基于MaterialSupplierMap.js - 与实际数据一致)
export const ACTUAL_SUPPLIERS = [
  // 结构件供应商 - 实际数据
  '聚龙', '欣冠', '广正',

  // 光学供应商 - 实际数据
  'BOE', '天马', '华星', '盛泰', '天实', '深奥',

  // 电池与充电供应商 - 实际数据
  '百佳达', '奥海', '辉阳', '理威', '风华', '维科',

  // 声学供应商 - 实际数据
  '东声', '瑞声', '歌尔',

  // 包装供应商 - 实际数据
  '丽德宝', '怡同', '富群'
];

// ✅ 实际物料列表 (基于MaterialSupplierMap.js - 与实际数据一致)
export const ACTUAL_MATERIALS = [
  // 结构件类 - 实际数据
  '电池盖', '中框', '手机卡托', '侧键', '装饰件',

  // 光学类 - 实际数据
  'LCD显示屏', 'OLED显示屏', '摄像头(CAM)',

  // 电池与充电类 - 实际数据
  '电池', '充电器',

  // 声学类 - 实际数据
  '喇叭', '听筒',

  // 包装类 - 实际数据
  '保护套', '标签', '包装盒'
];

// 实际缺陷类型
export const ACTUAL_DEFECT_TYPES = [
  // 结构件缺陷
  '划伤', '变形', '破裂', '起鼓', '色差', '尺寸异常', '掉漆', '注塑不良', '毛刺', '脱落', '卡键', '松动', '偏位',
  
  // 光学缺陷
  '亮点', '暗点', '色偏', '亮度不均', '对焦异常', '成像模糊', '色彩失真',
  
  // 电子缺陷
  '电压异常', '电流异常', '充电异常', '放电异常', '接触不良', '短路',
  
  // 声学缺陷
  '音质异常', '音量异常', '杂音', '无声', '频响异常',
  
  // 包装缺陷
  '印刷不良', '尺寸偏差', '破损', '污渍'
];

// 优化的基础问答规则
export const OPTIMIZED_QA_RULES = {
  // 库存查询规则 (精简到15条)
  inventory: [
    // 按工厂查询 (实际工厂)
    { name: '重庆工厂库存', query: '查询重庆工厂的库存情况', intent: 'query_inventory_by_factory' },
    { name: '深圳工厂库存', query: '查询深圳工厂的库存情况', intent: 'query_inventory_by_factory' },
    { name: '南昌工厂库存', query: '查询南昌工厂的库存情况', intent: 'query_inventory_by_factory' },
    { name: '宜宾工厂库存', query: '查询宜宾工厂的库存情况', intent: 'query_inventory_by_factory' },

    // 按供应商查询 (主要供应商)
    { name: 'BOE供应商物料', query: '查询BOE供应商的物料', intent: 'query_inventory_by_supplier' },
    { name: '歌尔股份物料', query: '查询歌尔股份的物料', intent: 'query_inventory_by_supplier' },
    { name: '立讯精密物料', query: '查询立讯精密的物料', intent: 'query_inventory_by_supplier' },
    { name: '比亚迪电子物料', query: '查询比亚迪电子的物料', intent: 'query_inventory_by_supplier' },

    // 按状态查询
    { name: '正常库存', query: '查询正常状态的库存', intent: 'query_inventory_by_status' },
    { name: '风险库存', query: '查询风险状态的库存', intent: 'query_inventory_by_status' },
    { name: '冻结库存', query: '查询冻结状态的库存', intent: 'query_inventory_by_status' },

    // 按物料类型查询 (实际物料)
    { name: 'LCD显示屏库存', query: '查询LCD显示屏库存', intent: 'query_inventory_by_material' },
    { name: '电池库存', query: '查询电池库存', intent: 'query_inventory_by_material' },
    { name: '摄像头模组库存', query: '查询摄像头模组库存', intent: 'query_inventory_by_material' },

    // 库存统计
    { name: '库存总览', query: '显示库存总体情况', intent: 'query_inventory_overview' }
  ],

  // 质量查询规则 (精简到12条)
  quality: [
    // 测试结果查询
    { name: '测试不合格记录', query: '查询测试不合格的记录', intent: 'query_lab_test_negative' },
    { name: '测试合格记录', query: '查询测试合格的记录', intent: 'query_lab_test_positive' },
    { name: '最新检验结果', query: '查询最新的检验结果', intent: 'query_lab_test_recent' },

    // 按缺陷类型查询 (实际缺陷)
    { name: '划伤缺陷', query: '查询划伤缺陷的记录', intent: 'query_lab_test_by_defect' },
    { name: '变形缺陷', query: '查询变形缺陷的记录', intent: 'query_lab_test_by_defect' },
    { name: '尺寸异常', query: '查询尺寸异常的记录', intent: 'query_lab_test_by_defect' },

    // 按供应商质量查询
    { name: 'BOE质量表现', query: '分析BOE供应商的质量表现', intent: 'query_supplier_quality' },
    { name: '歌尔股份质量', query: '分析歌尔股份的质量表现', intent: 'query_supplier_quality' },

    // 质量统计
    { name: '质量合格率', query: '统计整体质量合格率', intent: 'query_quality_pass_rate' },
    { name: '缺陷率分析', query: '分析各物料的缺陷率', intent: 'query_defect_rate_analysis' },
    { name: '质量趋势分析', query: '显示质量变化趋势', intent: 'query_quality_trend' },
    { name: '质量风险评估', query: '评估质量风险状况', intent: 'query_quality_risk' }
  ],

  // 生产查询规则 (精简到10条)
  production: [
    // 按工厂查询
    { name: '重庆工厂生产', query: '查询重庆工厂的生产情况', intent: 'query_production_by_factory' },
    { name: '深圳工厂生产', query: '查询深圳工厂的生产情况', intent: 'query_production_by_factory' },

    // 按供应商查询
    { name: 'BOE生产表现', query: '查询BOE供应商的生产表现', intent: 'query_production_by_supplier' },
    { name: '歌尔股份生产', query: '查询歌尔股份的生产表现', intent: 'query_production_by_supplier' },

    // 缺陷率分析
    { name: '高缺陷率物料', query: '查询缺陷率高的物料', intent: 'query_high_defect_rate' },
    { name: '缺陷率趋势', query: '分析缺陷率变化趋势', intent: 'query_defect_trend' },

    // 生产统计
    { name: '生产数据汇总', query: '汇总生产数据', intent: 'query_production_summary' },
    { name: '产能分析', query: '分析各工厂产能情况', intent: 'query_production_capacity' },
    { name: '批次追踪', query: '追踪生产批次信息', intent: 'query_batch_tracking' },
    { name: '生产效率分析', query: '分析生产效率', intent: 'query_production_efficiency' }
  ],

  // 综合分析规则 (精简到8条)
  summary: [
    // 物料维度汇总
    { name: '物料汇总报告', query: '汇总所有物料信息', intent: 'query_material_summary' },
    { name: '物料质量汇总', query: '汇总物料质量状况', intent: 'query_material_quality_summary' },

    // 供应商维度汇总
    { name: '供应商表现汇总', query: '汇总供应商表现', intent: 'query_supplier_summary' },
    { name: '供应商对比分析', query: '对比分析各供应商', intent: 'query_supplier_comparison' },

    // 工厂维度汇总
    { name: '工厂运营汇总', query: '汇总工厂运营状况', intent: 'query_factory_summary' },
    { name: '工厂对比分析', query: '对比分析各工厂', intent: 'query_factory_comparison' },

    // 批次维度汇总
    { name: '批次管理汇总', query: '汇总批次管理信息', intent: 'query_batch_summary' },
    { name: '批次质量分析', query: '分析批次质量状况', intent: 'query_batch_quality_analysis' }
  ]
};

// 高级规则配置
export const ADVANCED_QA_RULES = {
  // 统计分析规则
  statistics: [
    { name: '质量统计分析', query: '显示质量统计分析', intent: 'query_quality_statistics' },
    { name: '库存统计分析', query: '显示库存统计分析', intent: 'query_inventory_statistics' },
    { name: '生产统计分析', query: '显示生产统计分析', intent: 'query_production_statistics' },
    { name: '供应商统计', query: '统计供应商表现', intent: 'query_supplier_statistics' }
  ],

  // 对比分析规则
  comparison: [
    { name: '工厂对比', query: '对比各工厂表现', intent: 'query_factory_comparison' },
    { name: '供应商对比', query: '对比供应商表现', intent: 'query_supplier_comparison' },
    { name: '物料对比', query: '对比物料质量', intent: 'query_material_comparison' },
    { name: '时间对比', query: '对比不同时期数据', intent: 'query_time_comparison' }
  ],

  // 风险分析规则
  risk: [
    { name: '质量风险分析', query: '分析质量风险', intent: 'query_quality_risk_analysis' },
    { name: '库存风险分析', query: '分析库存风险', intent: 'query_inventory_risk_analysis' },
    { name: '供应商风险', query: '评估供应商风险', intent: 'query_supplier_risk' },
    { name: '综合风险评估', query: '综合风险评估', intent: 'query_comprehensive_risk' }
  ]
};

// 图表规则配置
export const CHART_QA_RULES = {
  // 趋势图表
  trend: [
    { name: '质量趋势图', query: '显示质量趋势图表', intent: 'chart_quality_trend' },
    { name: '库存趋势图', query: '显示库存趋势图表', intent: 'chart_inventory_trend' },
    { name: '缺陷率趋势', query: '显示缺陷率趋势', intent: 'chart_defect_trend' }
  ],

  // 分布图表
  distribution: [
    { name: '库存分布图', query: '显示库存分布图', intent: 'chart_inventory_distribution' },
    { name: '质量分布图', query: '显示质量分布图', intent: 'chart_quality_distribution' },
    { name: '供应商分布', query: '显示供应商分布', intent: 'chart_supplier_distribution' }
  ],

  // 对比图表
  comparison: [
    { name: '工厂对比图', query: '显示工厂对比图表', intent: 'chart_factory_comparison' },
    { name: '供应商对比图', query: '显示供应商对比图表', intent: 'chart_supplier_comparison' }
  ]
};

// 导出所有规则
export default {
  ACTUAL_FACTORIES,
  ACTUAL_SUPPLIERS,
  ACTUAL_MATERIALS,
  ACTUAL_DEFECT_TYPES,
  OPTIMIZED_QA_RULES,
  ADVANCED_QA_RULES,
  CHART_QA_RULES
};
