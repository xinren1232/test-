import mysql from 'mysql2/promise';

async function fixRule307() {
  let connection;
  
  try {
    console.log('🔧 直接修复规则307: 供应商对比分析...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 正确的SQL
    const correctSQL = `SELECT
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(updated_at, '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory
WHERE supplier_name LIKE CONCAT('%', ?, '%')
ORDER BY supplier_name, id DESC`;
    
    console.log('🔧 更新规则307...');
    
    // 直接更新数据库
    const [updateResult] = await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = ?, updated_at = NOW()
      WHERE id = 307
    `, [correctSQL]);
    
    console.log(`✅ 更新结果: 影响行数 ${updateResult.affectedRows}`);
    
    // 验证更新
    const [verifyResult] = await connection.execute(
      'SELECT id, intent_name, action_target FROM nlp_intent_rules WHERE id = 307'
    );
    
    if (verifyResult.length > 0) {
      console.log('✅ 验证成功:');
      console.log(`规则名称: ${verifyResult[0].intent_name}`);
      console.log(`更新后SQL: ${verifyResult[0].action_target}`);
    }
    
    // 测试修复后的SQL
    console.log('\n🧪 测试修复后的SQL...');
    
    const testSQL = correctSQL.replace('?', "'聚龙'");
    const [testResults] = await connection.execute(testSQL);
    
    console.log(`✅ SQL测试成功: ${testResults.length}条记录`);
    
    if (testResults.length > 0) {
      const fields = Object.keys(testResults[0]);
      console.log(`返回字段: ${fields.join(', ')}`);
      
      // 检查字段是否为中文
      const hasChineseFields = fields.every(field => /[\u4e00-\u9fa5]/.test(field));
      console.log(`中文字段检查: ${hasChineseFields ? '✅ 全部中文' : '❌ 包含非中文'}`);
      
      // 显示数据样本
      console.log('\n📄 数据样本:');
      const sample = testResults[0];
      Object.entries(sample).slice(0, 5).forEach(([field, value]) => {
        console.log(`  ${field}: ${value}`);
      });
    }
    
    console.log('\n🎉 规则307修复完成！');
    
  } catch (error) {
    console.error('❌ 修复规则307失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

fixRule307().catch(console.error);
