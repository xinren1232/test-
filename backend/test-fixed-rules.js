import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function testFixedRules() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🧪 测试修复后的规则...\n');
    
    // 1. 测试库存查询规则
    console.log('=== 测试库存查询规则 ===');
    const [inventoryRules] = await connection.execute(
      'SELECT intent_name, action_target FROM nlp_intent_rules WHERE intent_name LIKE "%库存%" LIMIT 3'
    );
    
    for (const rule of inventoryRules) {
      console.log(`\n规则: ${rule.intent_name}`);
      console.log('SQL查询:');
      console.log(rule.action_target.substring(0, 200) + '...');
      
      try {
        const [result] = await connection.execute(rule.action_target);
        console.log(`✅ 查询成功，返回 ${result.length} 条记录`);
        
        if (result.length > 0) {
          console.log('返回字段:', Object.keys(result[0]).join(', '));
          
          // 检查是否包含前端需要的字段
          const requiredFields = ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'];
          const actualFields = Object.keys(result[0]);
          const missingFields = requiredFields.filter(field => !actualFields.includes(field));
          
          if (missingFields.length === 0) {
            console.log('✅ 所有必需字段都存在');
          } else {
            console.log('❌ 缺少字段:', missingFields.join(', '));
          }
        }
      } catch (error) {
        console.log('❌ 查询失败:', error.message);
      }
    }
    
    // 2. 测试上线跟踪规则
    console.log('\n=== 测试上线跟踪规则 ===');
    const [onlineRules] = await connection.execute(
      'SELECT intent_name, action_target FROM nlp_intent_rules WHERE intent_name LIKE "%上线%" OR intent_name LIKE "%跟踪%" LIMIT 2'
    );
    
    for (const rule of onlineRules) {
      console.log(`\n规则: ${rule.intent_name}`);
      
      try {
        const [result] = await connection.execute(rule.action_target);
        console.log(`✅ 查询成功，返回 ${result.length} 条记录`);
        
        if (result.length > 0) {
          console.log('返回字段:', Object.keys(result[0]).join(', '));
        }
      } catch (error) {
        console.log('❌ 查询失败:', error.message);
      }
    }
    
    // 3. 测试测试结果规则
    console.log('\n=== 测试测试结果规则 ===');
    const [testRules] = await connection.execute(
      'SELECT intent_name, action_target FROM nlp_intent_rules WHERE intent_name LIKE "%测试%" OR intent_name LIKE "%NG%" LIMIT 2'
    );
    
    for (const rule of testRules) {
      console.log(`\n规则: ${rule.intent_name}`);
      
      try {
        const [result] = await connection.execute(rule.action_target);
        console.log(`✅ 查询成功，返回 ${result.length} 条记录`);
        
        if (result.length > 0) {
          console.log('返回字段:', Object.keys(result[0]).join(', '));
        }
      } catch (error) {
        console.log('❌ 查询失败:', error.message);
      }
    }
    
    console.log('\n✅ 规则测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
  } finally {
    await connection.end();
  }
}

testFixedRules();
