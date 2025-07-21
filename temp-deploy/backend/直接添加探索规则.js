/**
 * 直接通过数据库添加数据探索规则
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function addExplorationRules() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 要添加的探索规则
    const rules = [
      {
        intent_name: '查看所有物料',
        description: '显示系统中所有可用的物料列表',
        trigger_words: JSON.stringify(['物料列表', '所有物料', '有哪些物料', '物料有什么', '系统里有哪些物料']),
        example_query: '系统里有哪些物料？',
        sql: `SELECT DISTINCT material_name as 物料名称, material_code as 物料编码, COUNT(*) as 记录数量
FROM inventory 
WHERE material_name IS NOT NULL AND material_name != ''
GROUP BY material_name, material_code 
ORDER BY 记录数量 DESC`
      },
      
      {
        intent_name: '查看所有仓库',
        description: '显示系统中所有可用的仓库列表',
        trigger_words: JSON.stringify(['仓库列表', '所有仓库', '有哪些仓库', '仓库有什么', '系统里有哪些仓库']),
        example_query: '系统里有哪些仓库？',
        sql: `SELECT DISTINCT warehouse as 仓库名称, COUNT(*) as 记录数量
FROM inventory 
WHERE warehouse IS NOT NULL AND warehouse != ''
GROUP BY warehouse 
ORDER BY 记录数量 DESC`
      },
      
      {
        intent_name: '查看供应商物料组合',
        description: '显示每个供应商提供的物料种类',
        trigger_words: JSON.stringify(['供应商物料', '供应商提供什么物料', '哪个供应商有什么物料', '各个供应商都提供哪些物料']),
        example_query: '各个供应商都提供哪些物料？',
        sql: `SELECT supplier_name as 供应商, 
       GROUP_CONCAT(DISTINCT material_name ORDER BY material_name SEPARATOR ', ') as 物料列表,
       COUNT(DISTINCT material_name) as 物料种类数
FROM inventory 
WHERE supplier_name IS NOT NULL AND material_name IS NOT NULL
GROUP BY supplier_name 
ORDER BY 物料种类数 DESC`
      },
      
      {
        intent_name: '查看工厂仓库组合',
        description: '显示每个工厂对应的仓库分布',
        trigger_words: JSON.stringify(['工厂仓库', '工厂有哪些仓库', '仓库分布', '各个工厂都有哪些仓库']),
        example_query: '各个工厂都有哪些仓库？',
        sql: `SELECT factory as 工厂, 
       GROUP_CONCAT(DISTINCT warehouse ORDER BY warehouse SEPARATOR ', ') as 仓库列表,
       COUNT(DISTINCT warehouse) as 仓库数量
FROM inventory 
WHERE factory IS NOT NULL AND warehouse IS NOT NULL
GROUP BY factory 
ORDER BY 仓库数量 DESC`
      }
    ];
    
    let successCount = 0;
    
    for (const rule of rules) {
      try {
        // 使用 INSERT ... ON DUPLICATE KEY UPDATE
        await connection.execute(`
          INSERT INTO nlp_intent_rules
          (intent_name, description, action_type, action_target, trigger_words, example_query, category, priority, status, synonyms, created_at, updated_at)
          VALUES (?, ?, 'SQL_QUERY', ?, ?, ?, '数据探索', 50, 'active', '{}', NOW(), NOW())
          ON DUPLICATE KEY UPDATE
          description = VALUES(description),
          action_target = VALUES(action_target),
          trigger_words = VALUES(trigger_words),
          example_query = VALUES(example_query),
          updated_at = NOW()
        `, [
          rule.intent_name,
          rule.description,
          rule.sql,
          rule.trigger_words,
          rule.example_query
        ]);
        
        console.log(`✅ 添加/更新规则: ${rule.intent_name}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ 处理规则失败 ${rule.intent_name}:`, error.message);
      }
    }
    
    // 统计结果
    const [totalRules] = await connection.execute(
      'SELECT COUNT(*) as total FROM nlp_intent_rules WHERE status = "active"'
    );
    
    const [explorationRules] = await connection.execute(
      'SELECT COUNT(*) as total FROM nlp_intent_rules WHERE category = "数据探索" AND status = "active"'
    );
    
    console.log(`\n📊 规则添加完成:`);
    console.log(`   成功添加: ${successCount}条`);
    console.log(`   数据探索规则: ${explorationRules[0].total}条`);
    console.log(`   总活跃规则: ${totalRules[0].total}条`);
    
  } catch (error) {
    console.error('❌ 执行失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ 数据库连接已关闭');
    }
  }
}

// 运行添加
addExplorationRules();
