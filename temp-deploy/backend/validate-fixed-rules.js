import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function validateFixedRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 验证修正后的规则...');
    
    // 获取所有规则
    const [rules] = await connection.execute('SELECT * FROM nlp_intent_rules ORDER BY intent_name');
    
    console.log(`\n开始验证 ${rules.length} 条规则：\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const rule of rules) {
      console.log(`📋 验证规则: ${rule.intent_name}`);
      
      try {
        // 尝试执行SQL查询
        const [results] = await connection.execute(rule.action_target);
        console.log(`✅ SQL执行成功，返回 ${results.length} 条记录`);
        
        // 检查返回的字段是否符合前端显示要求
        if (results.length > 0) {
          const fields = Object.keys(results[0]);
          console.log(`   字段: ${fields.join(', ')}`);
          
          // 检查是否还有问题字段
          const problematicFields = fields.filter(field => 
            field.includes('workshop') || 
            field.includes('车间') || 
            field.includes('line') || 
            field.includes('生产线') ||
            field.includes('risk_level') ||
            field.includes('风险等级')
          );
          
          if (problematicFields.length > 0) {
            console.log(`⚠️  仍存在问题字段: ${problematicFields.join(', ')}`);
          }
        }
        
        successCount++;
        
      } catch (error) {
        console.log(`❌ SQL执行失败: ${error.message}`);
        errorCount++;
      }
      
      console.log('---\n');
    }
    
    console.log(`\n📊 验证结果统计:`);
    console.log(`✅ 成功: ${successCount} 条`);
    console.log(`❌ 失败: ${errorCount} 条`);
    console.log(`📈 成功率: ${((successCount / rules.length) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ 验证失败:', error);
  } finally {
    await connection.end();
  }
}

validateFixedRules();
