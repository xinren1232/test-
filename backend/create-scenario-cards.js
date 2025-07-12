/**
 * 创建场景化统计卡片系统
 * 为不同查询场景设计专门的统计卡片
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

/**
 * 库存场景统计卡片
 */
async function generateInventoryCards(queryData) {
  console.log('📦 生成库存场景统计卡片...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 1. 物料/批次统计
    const [materialStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT material_name) as 物料种类,
        COUNT(DISTINCT batch_code) as 批次数量,
        COUNT(*) as 总记录数
      FROM inventory
    `);
    
    // 2. 供应商统计
    const [supplierStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT supplier_name) as 供应商数量,
        COUNT(*) as 总记录数
      FROM inventory
    `);
    
    // 3. 风险库存统计
    const [riskStats] = await connection.execute(`
      SELECT 
        COUNT(*) as 风险库存数量,
        SUM(quantity) as 风险库存总量
      FROM inventory 
      WHERE status = '风险'
    `);
    
    // 4. 冻结库存统计
    const [frozenStats] = await connection.execute(`
      SELECT 
        COUNT(*) as 冻结库存数量,
        SUM(quantity) as 冻结库存总量
      FROM inventory 
      WHERE status = '冻结'
    `);
    
    const cards = [
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
        subtitle: `${supplierStats[0].总记录数}条记录`,
        type: 'success',
        icon: '🏢'
      },
      {
        title: '风险库存',
        value: riskStats[0].风险库存数量 || 0,
        subtitle: `${riskStats[0].风险库存总量 || 0}件`,
        type: 'warning',
        icon: '⚠️'
      },
      {
        title: '冻结库存',
        value: frozenStats[0].冻结库存数量 || 0,
        subtitle: `${frozenStats[0].冻结库存总量 || 0}件`,
        type: 'danger',
        icon: '🔒'
      }
    ];
    
    console.log('库存场景卡片:', cards);
    return cards;
    
  } finally {
    await connection.end();
  }
}

/**
 * 上线/生产场景统计卡片
 */
async function generateOnlineCards(queryData) {
  console.log('🚀 生成上线场景统计卡片...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 1. 物料/批次统计
    const [materialStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT material_name) as 物料种类,
        COUNT(DISTINCT batch_code) as 批次数量
      FROM online_tracking
    `);
    
    // 2. 项目统计
    const [projectStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT project) as 项目数量,
        COUNT(DISTINCT baseline) as 基线数量
      FROM online_tracking
    `);
    
    // 3. 供应商统计
    const [supplierStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT supplier_name) as 供应商数量
      FROM online_tracking
    `);
    
    // 4. 不良统计（3%为分界）
    const [defectStats] = await connection.execute(`
      SELECT 
        SUM(CASE WHEN defect_rate <= 0.03 THEN 1 ELSE 0 END) as 标准内,
        SUM(CASE WHEN defect_rate > 0.03 THEN 1 ELSE 0 END) as 标准外,
        COUNT(*) as 总数
      FROM online_tracking
      WHERE defect_rate IS NOT NULL
    `);
    
    const cards = [
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
        subtitle: '参与上线',
        type: 'success',
        icon: '🏢'
      },
      {
        title: '不良分析',
        value: defectStats[0].标准外 || 0,
        subtitle: `标准内${defectStats[0].标准内 || 0}个`,
        type: defectStats[0].标准外 > 0 ? 'warning' : 'success',
        icon: '📊'
      }
    ];
    
    console.log('上线场景卡片:', cards);
    return cards;
    
  } finally {
    await connection.end();
  }
}

/**
 * 测试场景统计卡片
 */
async function generateTestCards(queryData) {
  console.log('🧪 生成测试场景统计卡片...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 1. 物料/批次统计
    const [materialStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT material_name) as 物料种类,
        COUNT(DISTINCT batch_code) as 批次数量
      FROM lab_tests
    `);
    
    // 2. 项目统计
    const [projectStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT project_id) as 项目数量,
        COUNT(DISTINCT baseline_id) as 基线数量
      FROM lab_tests
      WHERE project_id IS NOT NULL
    `);
    
    // 3. 供应商统计
    const [supplierStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT supplier_name) as 供应商数量
      FROM lab_tests
    `);
    
    // 4. NG批次统计
    const [ngStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT batch_code) as NG批次数量,
        COUNT(*) as NG测试次数
      FROM lab_tests 
      WHERE test_result = 'FAIL' OR conclusion = 'NG'
    `);
    
    const cards = [
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
        subtitle: '参与测试',
        type: 'success',
        icon: '🏢'
      },
      {
        title: 'NG批次',
        value: ngStats[0].NG批次数量 || 0,
        subtitle: `${ngStats[0].NG测试次数 || 0}次NG`,
        type: ngStats[0].NG批次数量 > 0 ? 'danger' : 'success',
        icon: '❌'
      }
    ];
    
    console.log('测试场景卡片:', cards);
    return cards;
    
  } finally {
    await connection.end();
  }
}

/**
 * 根据查询类型生成对应的统计卡片
 */
async function generateScenarioCards(queryType, queryData = null) {
  console.log(`🎯 生成${queryType}场景的统计卡片...`);
  
  try {
    switch (queryType) {
      case 'inventory':
      case '库存':
        return await generateInventoryCards(queryData);
        
      case 'online':
      case 'production':
      case '上线':
      case '生产':
        return await generateOnlineCards(queryData);
        
      case 'testing':
      case 'test':
      case '测试':
        return await generateTestCards(queryData);
        
      default:
        // 默认返回通用统计卡片
        return await generateGeneralCards(queryData);
    }
  } catch (error) {
    console.error(`生成${queryType}场景卡片失败:`, error);
    return [];
  }
}

/**
 * 通用统计卡片（当无法确定具体场景时）
 */
async function generateGeneralCards(queryData) {
  console.log('📊 生成通用统计卡片...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 获取基本统计信息
    const [inventoryCount] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
    const [testCount] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
    const [onlineCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
    const [materialCount] = await connection.execute('SELECT COUNT(DISTINCT material_name) as count FROM inventory');
    
    const cards = [
      {
        title: '库存记录',
        value: inventoryCount[0].count,
        subtitle: '总库存数据',
        type: 'info',
        icon: '📦'
      },
      {
        title: '测试记录',
        value: testCount[0].count,
        subtitle: '总测试数据',
        type: 'primary',
        icon: '🧪'
      },
      {
        title: '上线记录',
        value: onlineCount[0].count,
        subtitle: '总上线数据',
        type: 'success',
        icon: '🚀'
      },
      {
        title: '物料种类',
        value: materialCount[0].count,
        subtitle: '不同物料',
        type: 'warning',
        icon: '📋'
      }
    ];
    
    return cards;
    
  } finally {
    await connection.end();
  }
}

/**
 * 测试所有场景的卡片生成
 */
async function testAllScenarios() {
  console.log('🧪 测试所有场景的卡片生成...\n');
  
  const scenarios = ['inventory', 'online', 'testing'];
  
  for (const scenario of scenarios) {
    console.log(`\n=== 测试${scenario}场景 ===`);
    const cards = await generateScenarioCards(scenario);
    
    console.log(`生成了 ${cards.length} 个统计卡片:`);
    cards.forEach((card, index) => {
      console.log(`${index + 1}. ${card.icon} ${card.title}: ${card.value} (${card.subtitle})`);
    });
  }
}

async function main() {
  try {
    console.log('🚀 开始创建场景化统计卡片系统...\n');
    
    // 测试所有场景
    await testAllScenarios();
    
    console.log('\n✅ 场景化统计卡片系统创建完成！');
    console.log('\n📋 卡片设计规范:');
    console.log('库存场景: 物料/批次 | 供应商 | 风险库存 | 冻结库存');
    console.log('上线场景: 物料/批次 | 项目 | 供应商 | 不良分析(3%分界)');
    console.log('测试场景: 物料/批次 | 项目 | 供应商 | NG批次');
    
    return {
      success: true,
      scenarios: ['inventory', 'online', 'testing'],
      cardTypes: ['info', 'primary', 'success', 'warning', 'danger']
    };
    
  } catch (error) {
    console.error('❌ 创建过程中发生错误:', error);
    throw error;
  }
}

// 导出函数供其他模块使用
export { generateScenarioCards, generateInventoryCards, generateOnlineCards, generateTestCards };

main().catch(console.error);
