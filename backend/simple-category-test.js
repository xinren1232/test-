/**
 * 简单的物料大类测试
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function testCategoryQuery() {
  console.log('🧪 测试物料大类查询...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 使用正确的字段映射测试结构件类查询
    const sql = `
SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory
WHERE (material_name = '电池盖' OR material_name = '中框' OR material_name = '手机卡托' OR material_name = '侧键' OR material_name = '装饰件')
ORDER BY material_name, inbound_time DESC
LIMIT 10`;
    
    console.log('执行结构件类查询...');
    const [results] = await connection.execute(sql);
    
    console.log(`📊 查询结果: ${results.length} 条记录`);
    if (results.length > 0) {
      const foundMaterials = [...new Set(results.map(r => r.物料名称))];
      console.log(`找到的物料: ${foundMaterials.join(', ')}`);
      
      console.log('\n详细记录:');
      results.forEach((record, index) => {
        console.log(`${index + 1}. ${record.物料名称} - ${record.供应商} - ${record.数量}个 (${record.状态}) - ${record.工厂}`);
      });
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ 查询失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

async function updateOneRule() {
  console.log('\n🔧 更新一个规则作为示例...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 查找结构件类库存查询规则
    const [rules] = await connection.execute(`
      SELECT id, intent_name, action_target 
      FROM nlp_intent_rules 
      WHERE intent_name = '结构件类库存查询' AND status = 'active'
    `);
    
    if (rules.length > 0) {
      const rule = rules[0];
      console.log(`找到规则: ${rule.intent_name}`);
      
      // 更新规则的SQL
      const newSQL = `
SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory
WHERE (material_name = '电池盖' OR material_name = '中框' OR material_name = '手机卡托' OR material_name = '侧键' OR material_name = '装饰件')
ORDER BY material_name, inbound_time DESC
LIMIT 50`;
      
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET action_target = ?, updated_at = NOW()
        WHERE id = ?
      `, [newSQL, rule.id]);
      
      console.log('✅ 规则更新成功');
      return true;
    } else {
      console.log('❌ 未找到结构件类库存查询规则');
      return false;
    }
    
  } finally {
    await connection.end();
  }
}

async function main() {
  try {
    console.log('🚀 开始简单的物料大类测试...\n');
    
    // 1. 测试查询
    const queryResults = await testCategoryQuery();
    
    // 2. 更新一个规则
    const updateResult = await updateOneRule();
    
    console.log('\n✅ 测试完成！');
    console.log(`📊 统计:`);
    console.log(`- 查询结果: ${queryResults.length} 条记录`);
    console.log(`- 规则更新: ${updateResult ? '成功' : '失败'}`);
    
    return {
      queryResults,
      updateResult
    };
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    throw error;
  }
}

main().catch(console.error);
