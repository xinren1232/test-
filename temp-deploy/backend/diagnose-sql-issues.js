import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function diagnoseSQLIssues() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 诊断SQL问题...\n');
    
    // 获取几个有问题的规则
    const [rules] = await connection.execute(`
      SELECT intent_name, action_target 
      FROM nlp_intent_rules 
      WHERE intent_name IN ('供应商物料查询', 'NG测试结果查询', '在线跟踪查询')
    `);
    
    for (const rule of rules) {
      console.log(`📝 规则: ${rule.intent_name}`);
      console.log(`SQL: ${rule.action_target}`);
      console.log('');
      
      // 尝试执行并捕获详细错误
      try {
        const testSQL = rule.action_target + ' LIMIT 1';
        await connection.execute(testSQL);
        console.log('✅ SQL执行成功');
      } catch (error) {
        console.log(`❌ SQL错误: ${error.message}`);
        console.log(`错误代码: ${error.code}`);
        
        // 尝试分析SQL结构
        const sql = rule.action_target;
        console.log('SQL分析:');
        console.log(`  长度: ${sql.length}`);
        console.log(`  是否包含UNION: ${sql.includes('UNION')}`);
        console.log(`  是否包含子查询: ${sql.includes('SELECT') && sql.indexOf('SELECT', 1) > 0}`);
        console.log(`  最后10个字符: "${sql.slice(-10)}"`);
      }
      
      console.log('-'.repeat(50));
    }
    
  } catch (error) {
    console.error('❌ 诊断失败:', error);
  } finally {
    await connection.end();
  }
}

diagnoseSQLIssues();
