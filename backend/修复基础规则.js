import mysql from 'mysql2/promise';

async function fixBasicRules() {
  let connection;
  
  try {
    console.log('🔧 修复基础规则...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 修复规则480 - 查看所有物料
    console.log('\n🔧 修复规则480 - 查看所有物料...');
    
    const rule480SQL = `SELECT DISTINCT 
  material_name as 物料名称,
  material_code as 物料编码,
  COUNT(*) as 记录数量
FROM inventory 
WHERE material_name IS NOT NULL AND material_name != ''
GROUP BY material_name, material_code
ORDER BY 记录数量 DESC`;
    
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET action_target = ?, updated_at = NOW()
      WHERE id = 480
    `, [rule480SQL]);
    
    console.log('✅ 规则480 SQL已更新');
    
    // 测试修复后的规则480
    try {
      const [results480] = await connection.execute(rule480SQL);
      console.log(`✅ 规则480测试成功: ${results480.length}条记录`);
      if (results480.length > 0) {
        console.log('字段:', Object.keys(results480[0]).join(', '));
        console.log('样本:', results480[0]);
      }
    } catch (error) {
      console.log(`❌ 规则480测试失败: ${error.message}`);
    }
    
    // 2. 修复触发词格式问题
    console.log('\n🔧 修复触发词格式...');
    
    const triggerWordFixes = [
      {
        id: 243,
        name: '物料大类查询',
        triggers: ["物料大类", "大类查询", "物料分类", "查看物料大类", "物料类别"]
      },
      {
        id: 485,
        name: '查看所有供应商',
        triggers: ["供应商列表", "所有供应商", "有哪些供应商", "供应商有什么", "供应商都有什么", "系统里有哪些供应商", "查看供应商", "显示供应商", "供应商信息", "厂商列表", "供货商", "制造商", "供应商", "查看所有供应商", "供应商都有哪些"]
      },
      {
        id: 480,
        name: '查看所有物料',
        triggers: ["物料列表", "所有物料", "有哪些物料", "物料有什么", "物料都有什么", "系统里有哪些物料", "查看物料", "显示物料", "物料信息", "查看所有物料", "物料都有哪些"]
      }
    ];
    
    for (const fix of triggerWordFixes) {
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET trigger_words = ?, updated_at = NOW()
        WHERE id = ?
      `, [JSON.stringify(fix.triggers), fix.id]);
      
      console.log(`✅ 规则${fix.id} (${fix.name}) 触发词已更新`);
    }
    
    // 3. 检查production表名
    console.log('\n🔍 检查production表...');
    
    try {
      const [tables] = await connection.execute("SHOW TABLES LIKE '%production%'");
      console.log('找到的production相关表:', tables.map(t => Object.values(t)[0]));
      
      // 尝试不同的表名
      const possibleNames = ['production_online', 'online_production', 'production', 'online'];
      
      for (const tableName of possibleNames) {
        try {
          const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
          console.log(`✅ 表${tableName}存在: ${count[0].count}条记录`);
        } catch (error) {
          console.log(`❌ 表${tableName}不存在`);
        }
      }
    } catch (error) {
      console.log(`检查表失败: ${error.message}`);
    }
    
    // 4. 测试修复后的基础规则
    console.log('\n🧪 测试修复后的基础规则...');
    
    const testRules = [243, 480, 485];
    
    for (const ruleId of testRules) {
      try {
        const testResponse = await fetch(`http://localhost:3001/api/rules/test/${ruleId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        });
        
        if (testResponse.ok) {
          const testResult = await testResponse.json();
          if (testResult.success) {
            console.log(`✅ 规则${ruleId}测试成功: ${testResult.data.resultCount}条记录`);
            if (testResult.data.fields && testResult.data.fields.length > 0) {
              console.log(`   字段: ${testResult.data.fields.join(', ')}`);
              
              // 检查字段是否为中文
              const hasChineseFields = testResult.data.fields.every(field => /[\u4e00-\u9fa5]/.test(field));
              console.log(`   中文字段检查: ${hasChineseFields ? '✅ 全部为中文' : '❌ 包含非中文字段'}`);
            }
          } else {
            console.log(`❌ 规则${ruleId}测试失败: ${testResult.data?.error || '未知错误'}`);
          }
        } else {
          console.log(`❌ 规则${ruleId}测试请求失败: ${testResponse.status}`);
        }
      } catch (error) {
        console.log(`❌ 规则${ruleId}测试异常: ${error.message}`);
      }
    }
    
    console.log('\n🎉 基础规则修复完成！');
    console.log('✅ 规则480字段名已修复');
    console.log('✅ 触发词格式已修复');
    console.log('✅ 基础规则测试完成');
    
  } catch (error) {
    console.error('❌ 基础规则修复失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

fixBasicRules().catch(console.error);
