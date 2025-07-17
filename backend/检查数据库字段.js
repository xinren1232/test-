import mysql from 'mysql2/promise';

async function checkDatabaseFields() {
  let connection;
  
  try {
    console.log('🔍 检查数据库字段...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 检查inventory表结构
    console.log('\n📋 inventory表结构:');
    const [inventoryColumns] = await connection.execute('DESCRIBE inventory');
    inventoryColumns.forEach(col => {
      console.log(`  ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // 2. 检查inventory表数据样本
    console.log('\n📊 inventory表数据样本:');
    const [inventorySample] = await connection.execute('SELECT * FROM inventory LIMIT 3');
    if (inventorySample.length > 0) {
      console.log('字段名:', Object.keys(inventorySample[0]));
      console.log('第一条记录:', inventorySample[0]);
    } else {
      console.log('❌ inventory表无数据');
    }
    
    // 3. 检查supplier字段的数据
    console.log('\n🏭 supplier字段数据:');
    const [supplierData] = await connection.execute(`
      SELECT supplier, COUNT(*) as count 
      FROM inventory 
      WHERE supplier IS NOT NULL AND supplier != ''
      GROUP BY supplier 
      ORDER BY count DESC
      LIMIT 10
    `);
    
    if (supplierData.length > 0) {
      console.log('供应商数据:');
      supplierData.forEach(row => {
        console.log(`  ${row.supplier}: ${row.count}条记录`);
      });
    } else {
      console.log('❌ 没有找到supplier数据');
    }
    
    // 4. 测试不同的字段名
    console.log('\n🧪 测试不同字段名:');
    
    const fieldVariants = ['supplier', 'supplier_name', 'supplierName'];
    
    for (const field of fieldVariants) {
      try {
        const [testResult] = await connection.execute(`
          SELECT DISTINCT ${field}, COUNT(*) as count 
          FROM inventory 
          WHERE ${field} IS NOT NULL AND ${field} != ''
          GROUP BY ${field} 
          ORDER BY count DESC
          LIMIT 5
        `);
        
        console.log(`✅ 字段 ${field}: ${testResult.length}个不同值`);
        if (testResult.length > 0) {
          testResult.forEach(row => {
            console.log(`   ${row[field]}: ${row.count}条`);
          });
        }
      } catch (error) {
        console.log(`❌ 字段 ${field}: ${error.message}`);
      }
    }
    
    // 5. 修复规则485的SQL
    console.log('\n🔧 修复规则485的SQL...');
    
    const correctSQL = `SELECT DISTINCT 
  supplier as 供应商,
  COUNT(*) as 记录数量
FROM inventory 
WHERE supplier IS NOT NULL AND supplier != ''
GROUP BY supplier
ORDER BY 记录数量 DESC`;
    
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = ?, updated_at = NOW()
      WHERE id = 485
    `, [correctSQL]);
    
    console.log('✅ 规则485 SQL已更新');
    
    // 6. 修复触发词格式
    console.log('\n🔧 修复规则485的触发词格式...');
    
    const triggers = [
      "供应商列表", "所有供应商", "有哪些供应商", "供应商有什么", "供应商都有什么",
      "系统里有哪些供应商", "查看供应商", "显示供应商", "供应商信息", "厂商列表", 
      "供货商", "制造商", "供应商", "查看所有供应商", "供应商都有哪些"
    ];
    
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET trigger_words = ?, updated_at = NOW()
      WHERE id = 485
    `, [JSON.stringify(triggers)]);
    
    console.log('✅ 规则485 触发词已更新');
    
    // 7. 测试修复后的规则
    console.log('\n🧪 测试修复后的规则485...');
    
    try {
      const [testResult] = await connection.execute(correctSQL);
      console.log(`✅ SQL测试成功: ${testResult.length}条记录`);
      if (testResult.length > 0) {
        console.log('结果样本:', testResult.slice(0, 3));
      }
    } catch (error) {
      console.log(`❌ SQL测试失败: ${error.message}`);
    }
    
    // 8. 测试API调用
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
    
    // 9. 测试智能问答
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
    
    console.log('\n🎉 数据库字段检查完成！');
    
  } catch (error) {
    console.error('❌ 数据库字段检查失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

checkDatabaseFields().catch(console.error);
