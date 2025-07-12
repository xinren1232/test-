/**
 * 测试动态卡片生成功能
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 识别查询场景类型
function identifyScenarioType(query, ruleName) {
  const queryLower = query.toLowerCase();
  const ruleNameLower = ruleName.toLowerCase();
  
  if (queryLower.includes('库存') || ruleNameLower.includes('库存')) {
    return 'inventory';
  }
  
  if (queryLower.includes('上线') || ruleNameLower.includes('上线') ||
      queryLower.includes('跟踪') || ruleNameLower.includes('跟踪')) {
    return 'online';
  }
  
  if (queryLower.includes('测试') || ruleNameLower.includes('测试') ||
      queryLower.includes('ng') || ruleNameLower.includes('ng')) {
    return 'testing';
  }
  
  return 'general';
}

// 生成库存场景卡片
async function generateInventoryCards() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const [materialStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT material_name) as 物料种类,
        COUNT(DISTINCT batch_code) as 批次数量
      FROM inventory
    `);
    
    const [supplierStats] = await connection.execute(`
      SELECT COUNT(DISTINCT supplier_name) as 供应商数量 FROM inventory
    `);
    
    const [riskStats] = await connection.execute(`
      SELECT COUNT(*) as 风险库存数量, COALESCE(SUM(quantity), 0) as 风险库存总量
      FROM inventory WHERE status = '风险'
    `);
    
    const [frozenStats] = await connection.execute(`
      SELECT COUNT(*) as 冻结库存数量, COALESCE(SUM(quantity), 0) as 冻结库存总量
      FROM inventory WHERE status = '冻结'
    `);
    
    return [
      {
        title: '物料/批次',
        value: materialStats[0].物料种类,
        subtitle: `${materialStats[0].批次数量}个批次`,
        type: 'info',
        icon: '📦'
      },
      {
        title: '供应商',
        value: supplierStats[0].供应商数量,
        subtitle: '数量统计',
        type: 'success',
        icon: '🏢'
      },
      {
        title: '风险库存',
        value: riskStats[0].风险库存数量,
        subtitle: `${riskStats[0].风险库存总量}件`,
        type: 'warning',
        icon: '⚠️'
      },
      {
        title: '冻结库存',
        value: frozenStats[0].冻结库存数量,
        subtitle: `${frozenStats[0].冻结库存总量}件`,
        type: 'danger',
        icon: '🔒'
      }
    ];
    
  } finally {
    await connection.end();
  }
}

// 生成上线场景卡片
async function generateOnlineCards() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const [materialStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT material_name) as 物料种类,
        COUNT(DISTINCT batch_code) as 批次数量
      FROM online_tracking
    `);
    
    const [projectStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT project) as 项目数量,
        COUNT(DISTINCT baseline) as 基线数量
      FROM online_tracking
    `);
    
    const [supplierStats] = await connection.execute(`
      SELECT COUNT(DISTINCT supplier_name) as 供应商数量 FROM online_tracking
    `);
    
    const [defectStats] = await connection.execute(`
      SELECT 
        SUM(CASE WHEN defect_rate <= 0.03 THEN 1 ELSE 0 END) as 标准内,
        SUM(CASE WHEN defect_rate > 0.03 THEN 1 ELSE 0 END) as 标准外
      FROM online_tracking WHERE defect_rate IS NOT NULL
    `);
    
    return [
      {
        title: '物料/批次',
        value: materialStats[0].物料种类 || 0,
        subtitle: `${materialStats[0].批次数量 || 0}个批次`,
        type: 'info',
        icon: '📦'
      },
      {
        title: '项目',
        value: projectStats[0].项目数量 || 0,
        subtitle: `${projectStats[0].基线数量 || 0}个基线`,
        type: 'primary',
        icon: '🎯'
      },
      {
        title: '供应商',
        value: supplierStats[0].供应商数量 || 0,
        subtitle: '数量统计',
        type: 'success',
        icon: '🏢'
      },
      {
        title: '不良分析',
        value: defectStats[0].标准外 || 0,
        subtitle: `标准内${defectStats[0].标准内 || 0}个`,
        type: (defectStats[0].标准外 || 0) > 0 ? 'warning' : 'success',
        icon: '📊'
      }
    ];
    
  } finally {
    await connection.end();
  }
}

// 生成测试场景卡片
async function generateTestingCards() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const [materialStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT material_name) as 物料种类,
        COUNT(DISTINCT batch_code) as 批次数量
      FROM lab_tests
    `);
    
    const [projectStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT project_id) as 项目数量,
        COUNT(DISTINCT baseline_id) as 基线数量
      FROM lab_tests WHERE project_id IS NOT NULL
    `);
    
    const [supplierStats] = await connection.execute(`
      SELECT COUNT(DISTINCT supplier_name) as 供应商数量 FROM lab_tests
    `);
    
    const [ngStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT batch_code) as NG批次数量,
        COUNT(*) as NG测试次数
      FROM lab_tests WHERE test_result = 'FAIL' OR conclusion = 'NG'
    `);
    
    return [
      {
        title: '物料/批次',
        value: materialStats[0].物料种类 || 0,
        subtitle: `${materialStats[0].批次数量 || 0}个批次`,
        type: 'info',
        icon: '📦'
      },
      {
        title: '项目',
        value: projectStats[0].项目数量 || 0,
        subtitle: `${projectStats[0].基线数量 || 0}个基线`,
        type: 'primary',
        icon: '🎯'
      },
      {
        title: '供应商',
        value: supplierStats[0].供应商数量 || 0,
        subtitle: '数量统计',
        type: 'success',
        icon: '🏢'
      },
      {
        title: 'NG批次',
        value: ngStats[0].NG批次数量 || 0,
        subtitle: `${ngStats[0].NG测试次数 || 0}次NG`,
        type: (ngStats[0].NG批次数量 || 0) > 0 ? 'danger' : 'success',
        icon: '❌'
      }
    ];
    
  } finally {
    await connection.end();
  }
}

// 主要的动态卡片生成函数
async function generateDynamicCards(query, ruleName) {
  console.log(`🎯 为查询"${query}"生成动态卡片...`);
  
  const scenarioType = identifyScenarioType(query, ruleName);
  console.log(`识别场景类型: ${scenarioType}`);
  
  let cards = [];
  
  switch (scenarioType) {
    case 'inventory':
      cards = await generateInventoryCards();
      break;
    case 'online':
      cards = await generateOnlineCards();
      break;
    case 'testing':
      cards = await generateTestingCards();
      break;
    default:
      cards = [];
      break;
  }
  
  console.log(`生成了 ${cards.length} 个统计卡片`);
  return { scenarioType, cards };
}

async function main() {
  try {
    console.log('🧪 测试动态卡片生成...\n');
    
    const testCases = [
      { query: '查询结构件类库存', ruleName: '结构件类库存查询' },
      { query: '查询LCD上线情况', ruleName: '物料上线情况查询' },
      { query: '查询NG测试结果', ruleName: 'NG测试结果查询' }
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
    
    console.log('\n✅ 动态卡片生成测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

main().catch(console.error);
