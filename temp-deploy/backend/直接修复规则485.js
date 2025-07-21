import mysql from 'mysql2/promise';

async function fixRule485() {
  let connection;
  
  try {
    console.log('🔧 直接修复规则485...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 检查当前规则485
    console.log('\n🔍 检查当前规则485...');
    const [currentRule] = await connection.execute('SELECT * FROM nlp_intent_rules WHERE id = 485');
    if (currentRule.length > 0) {
      console.log('当前规则:', currentRule[0].intent_name);
      console.log('当前SQL:', currentRule[0].action_target);
    }
    
    // 2. 测试正确的SQL
    console.log('\n🧪 测试正确的SQL...');
    const correctSQL = `SELECT DISTINCT 
  supplier_name as 供应商,
  COUNT(*) as 记录数量
FROM inventory 
WHERE supplier_name IS NOT NULL AND supplier_name != ''
GROUP BY supplier_name
ORDER BY 记录数量 DESC`;
    
    try {
      const [testResult] = await connection.execute(correctSQL);
      console.log(`✅ SQL测试成功: ${testResult.length}条记录`);
      if (testResult.length > 0) {
        console.log('结果样本:', testResult.slice(0, 3));
      }
    } catch (error) {
      console.log(`❌ SQL测试失败: ${error.message}`);
      return;
    }
    
    // 3. 更新规则485
    console.log('\n🔧 更新规则485...');
    
    const triggers = [
      "供应商列表", "所有供应商", "有哪些供应商", "供应商有什么", "供应商都有什么",
      "系统里有哪些供应商", "查看供应商", "显示供应商", "供应商信息", "厂商列表", 
      "供货商", "制造商", "供应商", "查看所有供应商", "供应商都有哪些"
    ];
    
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = ?, trigger_words = ?, updated_at = NOW()
      WHERE id = 485
    `, [correctSQL, JSON.stringify(triggers)]);
    
    console.log('✅ 规则485已更新');
    
    // 4. 验证更新后的规则
    console.log('\n🔍 验证更新后的规则...');
    const [updatedRule] = await connection.execute('SELECT * FROM nlp_intent_rules WHERE id = 485');
    if (updatedRule.length > 0) {
      console.log('更新后SQL:', updatedRule[0].action_target);
      console.log('更新后触发词:', updatedRule[0].trigger_words);
    }
    
    // 5. 测试API调用
    console.log('\n🌐 测试API调用...');
    
    try {
      const testResponse = await fetch('http://localhost:3001/api/rules/test/485', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      if (testResponse.ok) {
        const testResult = await testResponse.json();
        if (testResult.success) {
          console.log(`✅ API测试成功: ${testResult.data.resultCount}条记录`);
          if (testResult.data.tableData && testResult.data.tableData.length > 0) {
            console.log('API返回数据样本:', testResult.data.tableData[0]);
          }
        } else {
          console.log(`❌ API测试失败: ${testResult.data.error}`);
        }
      } else {
        console.log(`❌ API请求失败: ${testResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ API测试异常: ${error.message}`);
    }
    
    // 6. 测试智能问答
    console.log('\n🤖 测试智能问答...');
    
    try {
      const queryResponse = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: '查看所有供应商' })
      });
      
      if (queryResponse.ok) {
        const queryResult = await queryResponse.json();
        if (queryResult.success) {
          console.log(`✅ 智能问答成功: 返回${queryResult.data.tableData ? queryResult.data.tableData.length : 0}条记录`);
          if (queryResult.data.tableData && queryResult.data.tableData.length > 0) {
            console.log('问答返回数据样本:', queryResult.data.tableData[0]);
          }
        } else {
          console.log(`❌ 智能问答失败: ${queryResult.error}`);
        }
      } else {
        console.log(`❌ 智能问答请求失败: ${queryResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ 智能问答异常: ${error.message}`);
    }
    
    console.log('\n🎉 规则485修复完成！');
    
  } catch (error) {
    console.error('❌ 规则485修复失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

fixRule485().catch(console.error);
