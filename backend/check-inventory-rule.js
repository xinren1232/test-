/**
 * 检查库存信息查询规则的SQL内容
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkInventoryRule() {
  console.log('🔍 检查库存信息查询规则...\n');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 查找库存信息查询规则
    const [rules] = await connection.execute(`
      SELECT 
        id,
        intent_name,
        action_target,
        category,
        status
      FROM nlp_intent_rules 
      WHERE intent_name = '库存信息查询' 
      AND status = 'active'
    `);
    
    if (rules.length === 0) {
      console.log('❌ 未找到库存信息查询规则');
      return;
    }
    
    const rule = rules[0];
    console.log('📋 库存信息查询规则详情:');
    console.log(`   ID: ${rule.id}`);
    console.log(`   名称: ${rule.intent_name}`);
    console.log(`   分类: ${rule.category}`);
    console.log(`   状态: ${rule.status}`);
    console.log('\n📝 SQL内容:');
    console.log(rule.action_target);
    
    // 检查是否包含LIMIT
    const hasLimit = rule.action_target.includes('LIMIT');
    console.log(`\n🔍 包含LIMIT限制: ${hasLimit ? '是' : '否'}`);
    
    if (hasLimit) {
      const limitMatch = rule.action_target.match(/LIMIT\s+(\d+)/i);
      if (limitMatch) {
        console.log(`   LIMIT值: ${limitMatch[1]}`);
        
        // 移除LIMIT限制
        console.log('\n🔧 移除LIMIT限制...');
        let updatedSQL = rule.action_target;
        updatedSQL = updatedSQL.replace(/\s+LIMIT\s+\d+/gi, '');
        updatedSQL = updatedSQL.trim();
        
        // 更新规则
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET action_target = ?, updated_at = NOW()
          WHERE id = ?
        `, [updatedSQL, rule.id]);
        
        console.log('✅ LIMIT限制已移除');
        console.log('\n📝 更新后的SQL:');
        console.log(updatedSQL);
      }
    }
    
    // 测试查询结果数量
    console.log('\n🧪 测试查询结果数量...');
    
    const testSQL = rule.action_target.replace(/\s+LIMIT\s+\d+/gi, '').trim();
    const [testResults] = await connection.execute(testSQL);
    console.log(`   查询返回: ${testResults.length} 条记录`);
    
    if (testResults.length > 0) {
      console.log('   示例数据:');
      console.log('  ', JSON.stringify(testResults[0], null, 4));
    }
    
  } finally {
    await connection.end();
  }
}

// 运行检查
checkInventoryRule().catch(console.error);
