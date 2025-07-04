/**
 * 修复规则的触发词，确保智能意图服务能正确匹配
 */
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixRuleTriggerWords() {
  console.log('🔧 修复规则触发词\n');

  try {
    const connection = await mysql.createConnection(dbConfig);

    // 1. 更新状态查询规则
    console.log('📝 步骤1: 更新状态查询规则触发词...');
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET 
        trigger_words = ?,
        synonyms = ?
      WHERE intent_name = '状态查询,风险查询,冻结查询,正常查询'
    `, [
      JSON.stringify(['状态', '风险', '冻结', '正常', '查询']),
      JSON.stringify({
        '风险': ['异常', '危险', '问题'],
        '冻结': ['锁定', '暂停'],
        '正常': ['良好', '合格'],
        '查询': ['查看', '检查', '搜索']
      })
    ]);

    // 2. 更新工厂库存查询规则
    console.log('📝 步骤2: 更新工厂库存查询规则触发词...');
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET 
        trigger_words = ?,
        synonyms = ?
      WHERE intent_name = '工厂库存查询,查询工厂,工厂情况'
    `, [
      JSON.stringify(['工厂', '库存', '查询', '重庆', '深圳', '南昌', '宜宾']),
      JSON.stringify({
        '工厂': ['厂区', '生产基地'],
        '库存': ['物料', '存货', '仓储'],
        '查询': ['查看', '检查', '搜索']
      })
    ]);

    // 3. 更新供应商物料查询规则
    console.log('📝 步骤3: 更新供应商物料查询规则触发词...');
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET 
        trigger_words = ?,
        synonyms = ?
      WHERE intent_name = '供应商物料查询,供应商分析'
    `, [
      JSON.stringify(['供应商', '物料', '分析', '聚龙', '欣冠', '广正']),
      JSON.stringify({
        '供应商': ['厂商', '供货商'],
        '物料': ['材料', '零件', '组件'],
        '分析': ['统计', '查看', '检查']
      })
    ]);

    // 4. 更新真实供应商查询规则
    console.log('📝 步骤4: 更新真实供应商查询规则触发词...');
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET 
        trigger_words = ?,
        synonyms = ?
      WHERE intent_name = '真实供应商查询'
    `, [
      JSON.stringify(['供应商', '查询', '聚龙', '欣冠', '广正', '库存']),
      JSON.stringify({
        '供应商': ['厂商', '供货商'],
        '查询': ['查看', '检查', '搜索'],
        '库存': ['物料', '存货']
      })
    ]);

    // 5. 更新真实物料质量分析规则
    console.log('📝 步骤5: 更新真实物料质量分析规则触发词...');
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET 
        trigger_words = ?,
        synonyms = ?
      WHERE intent_name = '真实物料质量分析'
    `, [
      JSON.stringify(['物料', '质量', '分析', '摄像头', '包装盒', '听筒']),
      JSON.stringify({
        '物料': ['材料', '零件', '组件'],
        '质量': ['品质', '状态'],
        '分析': ['统计', '查看', '检查']
      })
    ]);

    // 6. 更新真实车间生产分析规则
    console.log('📝 步骤6: 更新真实车间生产分析规则触发词...');
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET 
        trigger_words = ?,
        synonyms = ?
      WHERE intent_name = '真实车间生产分析'
    `, [
      JSON.stringify(['车间', '生产', '分析', '工厂', '产线']),
      JSON.stringify({
        '车间': ['工厂', '生产线'],
        '生产': ['制造', '加工'],
        '分析': ['统计', '查看', '检查']
      })
    ]);

    await connection.end();

    console.log('\n🎉 触发词修复完成！');
    console.log('✅ 所有规则已添加正确的触发词和同义词');
    console.log('✅ 智能意图服务现在应该能正确匹配查询');

  } catch (error) {
    console.error('❌ 修复触发词失败:', error);
  }
}

// 运行修复
fixRuleTriggerWords();
