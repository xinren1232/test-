/**
 * 修复规则优先级，确保状态查询规则优先匹配
 */
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixRulePriority() {
  console.log('🔧 修复规则优先级\n');

  try {
    const connection = await mysql.createConnection(dbConfig);

    // 1. 提高状态查询规则的优先级到最高
    console.log('📝 步骤1: 提高状态查询规则优先级...');
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET priority = 15
      WHERE intent_name = '状态查询,风险查询,冻结查询,正常查询'
    `);

    // 2. 调整供应商查询规则的触发词，移除通用词汇
    console.log('📝 步骤2: 优化供应商查询规则触发词...');
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET 
        trigger_words = ?,
        priority = 8
      WHERE intent_name = '真实供应商查询'
    `, [
      JSON.stringify(['聚龙', '欣冠', '广正', '富群', '怡同', '丽德宝', '东声', '歌尔', '天马', 'BOE', '瑞声', '盛泰'])
    ]);

    // 3. 调整工厂查询规则的触发词
    console.log('📝 步骤3: 优化工厂查询规则触发词...');
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET 
        trigger_words = ?,
        priority = 9
      WHERE intent_name = '工厂库存查询,查询工厂,工厂情况'
    `, [
      JSON.stringify(['重庆工厂', '深圳工厂', '南昌工厂', '宜宾工厂', '重庆', '深圳', '南昌', '宜宾'])
    ]);

    // 4. 调整供应商物料查询规则的触发词
    console.log('📝 步骤4: 优化供应商物料查询规则触发词...');
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET 
        trigger_words = ?,
        priority = 7
      WHERE intent_name = '供应商物料查询,供应商分析'
    `, [
      JSON.stringify(['供应商分析', '物料分析', '聚龙', '欣冠', '广正'])
    ]);

    await connection.end();

    console.log('\n🎉 规则优先级修复完成！');
    console.log('✅ 状态查询规则现在具有最高优先级 (15)');
    console.log('✅ 供应商查询规则触发词已优化，移除了通用词汇');
    console.log('✅ 各规则优先级已重新平衡');

  } catch (error) {
    console.error('❌ 修复优先级失败:', error);
  }
}

// 运行修复
fixRulePriority();
