/**
 * 基于真实数据字段创建NLP规则
 * 根据用户提供的准确字段结构设计
 */

// 真实的NLP规则配置
const realNLPRules = [
  // 1. 库存查询规则
  {
    intent: "query_inventory_general",
    keywords: ["库存", "查库存", "库存情况", "物料库存", "查询库存"],
    description: "通用库存查询",
    action: "memory_query",
    target: "inventory",
    queryLogic: (data, query) => {
      let results = data.inventory || [];
      const queryLower = query.toLowerCase();
      
      // 工厂筛选
      if (queryLower.includes('重庆工厂')) results = results.filter(item => item.factory?.includes('重庆'));
      if (queryLower.includes('深圳工厂')) results = results.filter(item => item.factory?.includes('深圳'));
      if (queryLower.includes('宜宾工厂')) results = results.filter(item => item.factory?.includes('宜宾'));
      if (queryLower.includes('南昌工厂')) results = results.filter(item => item.factory?.includes('南昌'));
      
      // 供应商筛选 - 基于真实供应商
      const realSuppliers = ['歌尔股份', '蓝思科技', '比亚迪电子', '领益智造', '通达集团', '安洁科技', 
                           '致伸科技', '深南电路', '鹏鼎控股', '京东方BOE', '天马微电子', '和辉光电'];
      realSuppliers.forEach(supplier => {
        if (queryLower.includes(supplier)) {
          results = results.filter(item => item.supplier?.includes(supplier));
        }
      });
      
      // 物料类型筛选 - 基于真实物料类型
      if (queryLower.includes('显示') || queryLower.includes('屏幕')) {
        results = results.filter(item => item.materialType?.includes('显示') || item.materialName?.includes('屏'));
      }
      if (queryLower.includes('结构件')) {
        results = results.filter(item => item.materialType?.includes('结构件'));
      }
      if (queryLower.includes('电子贴片')) {
        results = results.filter(item => item.materialType?.includes('电子贴片'));
      }
      
      // 批次号筛选
      const batchMatch = query.match(/[A-Z0-9]{6,}/);
      if (batchMatch) {
        results = results.filter(item => item.batchNo?.includes(batchMatch[0]));
      }
      
      return results;
    }
  },

  // 2. 风险库存查询
  {
    intent: "query_risk_inventory",
    keywords: ["风险库存", "高风险", "异常库存", "风险物料", "风险状态"],
    description: "查询风险状态的库存",
    action: "memory_query",
    target: "inventory",
    queryLogic: (data, query) => {
      let results = data.inventory || [];
      return results.filter(item => item.status === '风险' || item.status === '异常');
    }
  },

  // 3. 冻结库存查询
  {
    intent: "query_frozen_inventory",
    keywords: ["冻结库存", "冻结物料", "冻结状态"],
    description: "查询冻结状态的库存",
    action: "memory_query", 
    target: "inventory",
    queryLogic: (data, query) => {
      let results = data.inventory || [];
      return results.filter(item => item.status === '冻结');
    }
  },

  // 4. 测试结果查询
  {
    intent: "query_test_results",
    keywords: ["测试结果", "检测结果", "实验结果", "测试报告", "检验结果"],
    description: "查询测试结果",
    action: "memory_query",
    target: "inspection",
    queryLogic: (data, query) => {
      let results = data.inspection || [];
      const queryLower = query.toLowerCase();
      
      // 批次号筛选
      const batchMatch = query.match(/[A-Z0-9]{6,}/);
      if (batchMatch) {
        results = results.filter(item => item.batchNo?.includes(batchMatch[0]));
      }
      
      // 供应商筛选
      const realSuppliers = ['歌尔股份', '蓝思科技', '比亚迪电子', '领益智造', '通达集团', '安洁科技'];
      realSuppliers.forEach(supplier => {
        if (queryLower.includes(supplier)) {
          results = results.filter(item => item.supplier?.includes(supplier));
        }
      });
      
      return results;
    }
  },

  // 5. 不合格测试查询
  {
    intent: "query_failed_tests",
    keywords: ["不合格", "不良测试", "测试不良", "失败测试", "测试异常", "FAIL"],
    description: "查询不合格的测试记录",
    action: "memory_query",
    target: "inspection", 
    queryLogic: (data, query) => {
      let results = data.inspection || [];
      return results.filter(item => item.testResult === 'FAIL' || item.testResult === '不合格');
    }
  },

  // 6. 生产情况查询
  {
    intent: "query_production",
    keywords: ["生产情况", "产线情况", "上线情况", "生产数据", "上线跟踪"],
    description: "查询生产上线情况",
    action: "memory_query",
    target: "production",
    queryLogic: (data, query) => {
      let results = data.production || [];
      const queryLower = query.toLowerCase();
      
      // 工厂筛选
      if (queryLower.includes('重庆工厂')) results = results.filter(item => item.factory?.includes('重庆'));
      if (queryLower.includes('深圳工厂')) results = results.filter(item => item.factory?.includes('深圳'));
      if (queryLower.includes('宜宾工厂')) results = results.filter(item => item.factory?.includes('宜宾'));
      if (queryLower.includes('南昌工厂')) results = results.filter(item => item.factory?.includes('南昌'));
      
      // 产线筛选
      if (queryLower.includes('产线01') || queryLower.includes('产线1')) {
        results = results.filter(item => item.line?.includes('01') || item.line?.includes('1'));
      }
      
      // 批次号筛选
      const batchMatch = query.match(/[A-Z0-9]{6,}/);
      if (batchMatch) {
        results = results.filter(item => item.batchNo?.includes(batchMatch[0]));
      }
      
      return results;
    }
  },

  // 7. 高不良率查询
  {
    intent: "query_high_defect_rate",
    keywords: ["高不良率", "不良率高", "质量问题", "生产异常", "不良率超标"],
    description: "查询高不良率的生产记录",
    action: "memory_query",
    target: "production",
    queryLogic: (data, query) => {
      let results = data.production || [];
      return results.filter(item => parseFloat(item.defectRate) > 5.0); // 不良率超过5%
    }
  },

  // 8. 项目基线查询
  {
    intent: "query_by_project",
    keywords: ["项目查询", "基线查询", "项目情况", "基线情况"],
    description: "按项目ID查询相关数据",
    action: "memory_query",
    target: "production",
    queryLogic: (data, query) => {
      let results = data.production || [];
      const queryLower = query.toLowerCase();
      
      // 项目ID匹配
      const projectMatch = query.match(/[A-Z]\d+[A-Z]*\d*/);
      if (projectMatch) {
        results = results.filter(item => item.projectId?.includes(projectMatch[0]));
      }
      
      return results;
    }
  },

  // 9. 工厂汇总统计
  {
    intent: "summarize_by_factory",
    keywords: ["工厂统计", "工厂汇总", "工厂概况", "工厂总览", "工厂表现"],
    description: "按工厂汇总统计数据",
    action: "memory_summary",
    target: "inventory",
    queryLogic: (data, query) => {
      const inventory = data.inventory || [];
      const production = data.production || [];
      
      const factoryStats = {};
      
      // 统计库存
      inventory.forEach(item => {
        const factory = item.factory || '未知工厂';
        if (!factoryStats[factory]) {
          factoryStats[factory] = { inventory: 0, production: 0, riskItems: 0 };
        }
        factoryStats[factory].inventory += item.quantity || 0;
        if (item.status === '风险') factoryStats[factory].riskItems++;
      });
      
      // 统计生产
      production.forEach(item => {
        const factory = item.factory || '未知工厂';
        if (!factoryStats[factory]) {
          factoryStats[factory] = { inventory: 0, production: 0, riskItems: 0 };
        }
        factoryStats[factory].production++;
      });
      
      return factoryStats;
    }
  },

  // 10. 供应商汇总统计
  {
    intent: "summarize_by_supplier", 
    keywords: ["供应商统计", "供应商汇总", "供应商概况", "供应商总览", "供应商表现"],
    description: "按供应商汇总统计数据",
    action: "memory_summary",
    target: "inventory",
    queryLogic: (data, query) => {
      const inventory = data.inventory || [];
      const inspection = data.inspection || [];
      
      const supplierStats = {};
      
      // 统计库存
      inventory.forEach(item => {
        const supplier = item.supplier || '未知供应商';
        if (!supplierStats[supplier]) {
          supplierStats[supplier] = { totalQuantity: 0, riskItems: 0, testRecords: 0, failedTests: 0 };
        }
        supplierStats[supplier].totalQuantity += item.quantity || 0;
        if (item.status === '风险') supplierStats[supplier].riskItems++;
      });
      
      // 统计测试
      inspection.forEach(item => {
        const supplier = item.supplier || '未知供应商';
        if (!supplierStats[supplier]) {
          supplierStats[supplier] = { totalQuantity: 0, riskItems: 0, testRecords: 0, failedTests: 0 };
        }
        supplierStats[supplier].testRecords++;
        if (item.testResult === 'FAIL') supplierStats[supplier].failedTests++;
      });
      
      return supplierStats;
    }
  }
];

export default realNLPRules;
