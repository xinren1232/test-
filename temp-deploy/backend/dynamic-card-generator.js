/**
 * 动态卡片生成器
 * 根据查询类型和结果动态生成对应的统计卡片
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

/**
 * 识别查询场景类型
 */
function identifyScenarioType(query, ruleName) {
  const queryLower = query.toLowerCase();
  const ruleNameLower = ruleName.toLowerCase();
  
  // 库存场景识别
  if (queryLower.includes('库存') || ruleNameLower.includes('库存') || 
      queryLower.includes('仓库') || queryLower.includes('入库')) {
    return 'inventory';
  }
  
  // 上线/生产场景识别
  if (queryLower.includes('上线') || ruleNameLower.includes('上线') ||
      queryLower.includes('生产') || queryLower.includes('在线') ||
      ruleNameLower.includes('跟踪') || queryLower.includes('跟踪')) {
    return 'online';
  }
  
  // 测试场景识别
  if (queryLower.includes('测试') || ruleNameLower.includes('测试') ||
      queryLower.includes('检测') || queryLower.includes('检验') ||
      queryLower.includes('ng') || ruleNameLower.includes('ng')) {
    return 'testing';
  }
  
  // 批次场景
  if (queryLower.includes('批次') || ruleNameLower.includes('批次')) {
    return 'batch';
  }
  
  // 默认为通用场景
  return 'general';
}

/**
 * 生成库存场景卡片
 */
async function generateInventoryScenarioCards(queryData = null) {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 如果有查询数据，基于查询数据生成统计
    let whereClause = '';
    if (queryData && queryData.length > 0) {
      // 从查询数据中提取条件
      const materials = [...new Set(queryData.map(item => item.物料名称 || item.material_name))];
      const suppliers = [...new Set(queryData.map(item => item.供应商 || item.supplier_name))];
      
      if (materials.length > 0) {
        whereClause = `WHERE material_name IN (${materials.map(m => `'${m}'`).join(',')})`;
      }
    }
    
    // 1. 物料/批次统计
    const [materialStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT material_name) as 物料种类,
        COUNT(DISTINCT batch_code) as 批次数量
      FROM inventory ${whereClause}
    `);
    
    // 2. 供应商统计
    const [supplierStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT supplier_name) as 供应商数量
      FROM inventory ${whereClause}
    `);
    
    // 3. 风险库存统计
    const [riskStats] = await connection.execute(`
      SELECT 
        COUNT(*) as 风险库存数量,
        COALESCE(SUM(quantity), 0) as 风险库存总量
      FROM inventory 
      WHERE status = '风险' ${whereClause ? 'AND ' + whereClause.replace('WHERE ', '') : ''}
    `);
    
    // 4. 冻结库存统计
    const [frozenStats] = await connection.execute(`
      SELECT 
        COUNT(*) as 冻结库存数量,
        COALESCE(SUM(quantity), 0) as 冻结库存总量
      FROM inventory 
      WHERE status = '冻结' ${whereClause ? 'AND ' + whereClause.replace('WHERE ', '') : ''}
    `);
    
    return [
      {
        title: '物料/批次',
        value: materialStats[0].物料种类,
        subtitle: `${materialStats[0].批次数量}个批次`,
        type: 'info',
        icon: '📦',
        color: '#409EFF'
      },
      {
        title: '供应商',
        value: supplierStats[0].供应商数量,
        subtitle: '数量统计',
        type: 'success',
        icon: '🏢',
        color: '#67C23A'
      },
      {
        title: '风险库存',
        value: riskStats[0].风险库存数量,
        subtitle: `${riskStats[0].风险库存总量}件`,
        type: 'warning',
        icon: '⚠️',
        color: '#E6A23C'
      },
      {
        title: '冻结库存',
        value: frozenStats[0].冻结库存数量,
        subtitle: `${frozenStats[0].冻结库存总量}件`,
        type: 'danger',
        icon: '🔒',
        color: '#F56C6C'
      }
    ];
    
  } finally {
    await connection.end();
  }
}

/**
 * 生成上线场景卡片
 */
async function generateOnlineScenarioCards(queryData = null) {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    let whereClause = '';
    if (queryData && queryData.length > 0) {
      const materials = [...new Set(queryData.map(item => item.物料名称 || item.material_name))];
      if (materials.length > 0) {
        whereClause = `WHERE material_name IN (${materials.map(m => `'${m}'`).join(',')})`;
      }
    }
    
    // 1. 物料/批次统计
    const [materialStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT material_name) as 物料种类,
        COUNT(DISTINCT batch_code) as 批次数量
      FROM online_tracking ${whereClause}
    `);
    
    // 2. 项目统计
    const [projectStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT project) as 项目数量,
        COUNT(DISTINCT baseline) as 基线数量
      FROM online_tracking ${whereClause}
    `);
    
    // 3. 供应商统计
    const [supplierStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT supplier_name) as 供应商数量
      FROM online_tracking ${whereClause}
    `);
    
    // 4. 不良统计（3%为分界）
    const [defectStats] = await connection.execute(`
      SELECT 
        SUM(CASE WHEN defect_rate <= 0.03 THEN 1 ELSE 0 END) as 标准内,
        SUM(CASE WHEN defect_rate > 0.03 THEN 1 ELSE 0 END) as 标准外
      FROM online_tracking
      WHERE defect_rate IS NOT NULL ${whereClause ? 'AND ' + whereClause.replace('WHERE ', '') : ''}
    `);
    
    return [
      {
        title: '物料/批次',
        value: materialStats[0].物料种类 || 0,
        subtitle: `${materialStats[0].批次数量 || 0}个批次`,
        type: 'info',
        icon: '📦',
        color: '#409EFF'
      },
      {
        title: '项目',
        value: projectStats[0].项目数量 || 0,
        subtitle: `${projectStats[0].基线数量 || 0}个基线`,
        type: 'primary',
        icon: '🎯',
        color: '#606266'
      },
      {
        title: '供应商',
        value: supplierStats[0].供应商数量 || 0,
        subtitle: '数量统计',
        type: 'success',
        icon: '🏢',
        color: '#67C23A'
      },
      {
        title: '不良分析',
        value: defectStats[0].标准外 || 0,
        subtitle: `标准内${defectStats[0].标准内 || 0}个`,
        type: (defectStats[0].标准外 || 0) > 0 ? 'warning' : 'success',
        icon: '📊',
        color: (defectStats[0].标准外 || 0) > 0 ? '#E6A23C' : '#67C23A'
      }
    ];
    
  } finally {
    await connection.end();
  }
}

/**
 * 生成测试场景卡片
 */
async function generateTestingScenarioCards(queryData = null) {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    let whereClause = '';
    if (queryData && queryData.length > 0) {
      const materials = [...new Set(queryData.map(item => item.物料名称 || item.material_name))];
      if (materials.length > 0) {
        whereClause = `WHERE material_name IN (${materials.map(m => `'${m}'`).join(',')})`;
      }
    }
    
    // 1. 物料/批次统计
    const [materialStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT material_name) as 物料种类,
        COUNT(DISTINCT batch_code) as 批次数量
      FROM lab_tests ${whereClause}
    `);
    
    // 2. 项目统计
    const [projectStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT project_id) as 项目数量,
        COUNT(DISTINCT baseline_id) as 基线数量
      FROM lab_tests
      WHERE project_id IS NOT NULL ${whereClause ? 'AND ' + whereClause.replace('WHERE ', '') : ''}
    `);
    
    // 3. 供应商统计
    const [supplierStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT supplier_name) as 供应商数量
      FROM lab_tests ${whereClause}
    `);
    
    // 4. NG批次统计
    const [ngStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT batch_code) as NG批次数量,
        COUNT(*) as NG测试次数
      FROM lab_tests 
      WHERE (test_result = 'FAIL' OR conclusion = 'NG') 
      ${whereClause ? 'AND ' + whereClause.replace('WHERE ', '') : ''}
    `);
    
    return [
      {
        title: '物料/批次',
        value: materialStats[0].物料种类 || 0,
        subtitle: `${materialStats[0].批次数量 || 0}个批次`,
        type: 'info',
        icon: '📦',
        color: '#409EFF'
      },
      {
        title: '项目',
        value: projectStats[0].项目数量 || 0,
        subtitle: `${projectStats[0].基线数量 || 0}个基线`,
        type: 'primary',
        icon: '🎯',
        color: '#606266'
      },
      {
        title: '供应商',
        value: supplierStats[0].供应商数量 || 0,
        subtitle: '数量统计',
        type: 'success',
        icon: '🏢',
        color: '#67C23A'
      },
      {
        title: 'NG批次',
        value: ngStats[0].NG批次数量 || 0,
        subtitle: `${ngStats[0].NG测试次数 || 0}次NG`,
        type: (ngStats[0].NG批次数量 || 0) > 0 ? 'danger' : 'success',
        icon: '❌',
        color: (ngStats[0].NG批次数量 || 0) > 0 ? '#F56C6C' : '#67C23A'
      }
    ];
    
  } finally {
    await connection.end();
  }
}

/**
 * 主要的动态卡片生成函数
 */
async function generateDynamicCards(query, ruleName, queryData = null) {
  console.log(`🎯 为查询"${query}"生成动态卡片...`);
  
  try {
    // 1. 识别场景类型
    const scenarioType = identifyScenarioType(query, ruleName);
    console.log(`识别场景类型: ${scenarioType}`);
    
    // 2. 根据场景类型生成对应卡片
    let cards = [];
    
    switch (scenarioType) {
      case 'inventory':
        cards = await generateInventoryScenarioCards(queryData);
        break;
      case 'online':
        cards = await generateOnlineScenarioCards(queryData);
        break;
      case 'testing':
        cards = await generateTestingScenarioCards(queryData);
        break;
      default:
        // 通用场景，返回基础统计
        cards = await generateGeneralCards();
        break;
    }
    
    console.log(`生成了 ${cards.length} 个统计卡片`);
    return {
      scenarioType,
      cards,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('生成动态卡片失败:', error);
    return {
      scenarioType: 'error',
      cards: [],
      error: error.message
    };
  }
}

/**
 * 生成通用统计卡片
 */
async function generateGeneralCards() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const [inventoryCount] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
    const [testCount] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
    const [onlineCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
    const [materialCount] = await connection.execute('SELECT COUNT(DISTINCT material_name) as count FROM inventory');
    
    return [
      {
        title: '库存记录',
        value: inventoryCount[0].count,
        subtitle: '总库存数据',
        type: 'info',
        icon: '📦',
        color: '#409EFF'
      },
      {
        title: '测试记录',
        value: testCount[0].count,
        subtitle: '总测试数据',
        type: 'primary',
        icon: '🧪',
        color: '#606266'
      },
      {
        title: '上线记录',
        value: onlineCount[0].count,
        subtitle: '总上线数据',
        type: 'success',
        icon: '🚀',
        color: '#67C23A'
      },
      {
        title: '物料种类',
        value: materialCount[0].count,
        subtitle: '不同物料',
        type: 'warning',
        icon: '📋',
        color: '#E6A23C'
      }
    ];
    
  } finally {
    await connection.end();
  }
}

// 导出主要函数
export { generateDynamicCards, identifyScenarioType };

// 测试函数
async function testDynamicCardGeneration() {
  console.log('🧪 测试动态卡片生成...\n');
  
  const testCases = [
    { query: '查询结构件类库存', ruleName: '结构件类库存查询' },
    { query: '查询LCD上线情况', ruleName: '物料上线情况查询' },
    { query: '查询NG测试结果', ruleName: 'NG测试结果查询' },
    { query: '查询批次信息', ruleName: '批次信息查询' }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n=== 测试: ${testCase.query} ===`);
    const result = await generateDynamicCards(testCase.query, testCase.ruleName);
    
    console.log(`场景类型: ${result.scenarioType}`);
    console.log(`卡片数量: ${result.cards.length}`);
    
    result.cards.forEach((card, index) => {
      console.log(`${index + 1}. ${card.icon} ${card.title}: ${card.value} (${card.subtitle})`);
    });
  }
}

// 如果直接运行此文件，执行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  testDynamicCardGeneration().catch(console.error);
}
