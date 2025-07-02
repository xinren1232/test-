/**
 * 修复参数JSON存储问题
 */
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixParametersJSON() {
  console.log('🔧 修复参数JSON存储问题...');
  
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // 修复库存查询规则
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET parameters = ?
      WHERE intent_name = '查询库存,库存查询,查库存,库存情况,物料库存'
    `, [JSON.stringify([
      {
        name: 'search_term',
        type: 'string',
        description: '搜索关键词（物料编码、物料名称或批次号）',
        extract_patterns: [
          'CS-[A-Z]\\d+',
          'CS-[A-Z]-[A-Z]\\d+',
          '\\d{6}',
          '电容',
          '电芯'
        ]
      }
    ])]);
    
    // 修复测试结果查询规则
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET parameters = ?
      WHERE intent_name = '测试结果,检测结果,实验结果,测试报告,检验结果'
    `, [JSON.stringify([
      {
        name: 'search_term',
        type: 'string',
        description: '搜索关键词（批次号、物料编码或物料名称）',
        extract_patterns: [
          'CS-[A-Z]\\d+',
          'CS-[A-Z]-[A-Z]\\d+',
          '\\d{6}',
          '电容',
          '电芯'
        ]
      }
    ])]);
    
    // 修复生产情况查询规则
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET parameters = ?
      WHERE intent_name = '生产情况,产线情况,工厂使用,上线情况,生产数据'
    `, [JSON.stringify([
      {
        name: 'search_term',
        type: 'string',
        description: '搜索关键词（工厂名称、物料编码或批次号）',
        extract_patterns: [
          '重庆工厂',
          '深圳工厂',
          '南昌工厂',
          '宜宾工厂',
          'CS-[A-Z]\\d+',
          '\\d{6}'
        ]
      }
    ])]);
    
    console.log('✅ 参数JSON修复完成！');
    
    // 验证修复结果
    const [rules] = await connection.query(`
      SELECT intent_name, parameters 
      FROM nlp_intent_rules 
      WHERE intent_name LIKE '%库存%' 
      LIMIT 1
    `);
    
    if (rules.length > 0) {
      console.log('📋 验证修复结果:');
      try {
        const params = JSON.parse(rules[0].parameters);
        console.log('参数解析成功:', params);
      } catch (e) {
        console.log('参数解析仍然失败:', e.message);
      }
    }
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixParametersJSON();
