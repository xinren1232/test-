/**
 * 简化版规则字段检查脚本
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkRuleFields() {
  let connection;
  
  try {
    console.log('🔄 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 获取所有活跃规则
    console.log('📋 获取规则列表...');
    const [rules] = await connection.execute(`
      SELECT 
        id,
        intent_name,
        description,
        action_type,
        action_target,
        category
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY id ASC
      LIMIT 10
    `);
    
    console.log(`\n📊 找到 ${rules.length} 条规则 (显示前10条):\n`);
    
    // 分析每个规则
    rules.forEach((rule, index) => {
      console.log(`${index + 1}. ID: ${rule.id}`);
      console.log(`   名称: ${rule.intent_name}`);
      console.log(`   类型: ${rule.action_type}`);
      console.log(`   分类: ${rule.category || '未分类'}`);
      
      if (rule.action_type === 'SQL_QUERY' && rule.action_target) {
        // 提取SELECT字段
        const sqlMatch = rule.action_target.match(/SELECT\s+(.*?)\s+FROM/is);
        if (sqlMatch) {
          const selectPart = sqlMatch[1].replace(/\s+/g, ' ').substring(0, 100);
          console.log(`   字段: ${selectPart}...`);
        }
      }
      
      console.log(''); // 空行分隔
    });
    
    // 统计分析
    const sqlRules = rules.filter(r => r.action_type === 'SQL_QUERY');
    const categorized = rules.filter(r => r.category && r.category !== '');
    
    console.log('📈 统计信息:');
    console.log(`   总规则数: ${rules.length}`);
    console.log(`   SQL规则: ${sqlRules.length}`);
    console.log(`   已分类: ${categorized.length}`);
    console.log(`   未分类: ${rules.length - categorized.length}`);
    
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ 数据库连接已关闭');
    }
  }
}

// 运行检查
checkRuleFields().catch(console.error);
