import mysql from 'mysql2/promise';

async function checkBasicRules() {
  let connection;
  
  try {
    console.log('🔍 检查基础规则...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 检查几个重要的基础规则
    const basicRules = [243, 485, 480, 244, 245];
    
    for (const ruleId of basicRules) {
      console.log(`\n📋 检查规则${ruleId}:`);
      
      const [rule] = await connection.execute(
        'SELECT id, intent_name, category, action_target, trigger_words FROM nlp_intent_rules WHERE id = ?',
        [ruleId]
      );
      
      if (rule.length === 0) {
        console.log(`❌ 规则${ruleId}不存在`);
        continue;
      }
      
      const ruleInfo = rule[0];
      console.log(`   名称: ${ruleInfo.intent_name}`);
      console.log(`   分类: ${ruleInfo.category}`);
      console.log(`   SQL: ${ruleInfo.action_target.substring(0, 100)}...`);
      
      // 解析触发词
      try {
        const triggers = JSON.parse(ruleInfo.trigger_words);
        console.log(`   触发词: ${triggers.slice(0, 3).join(', ')}...`);
      } catch (error) {
        console.log(`   触发词解析失败: ${error.message}`);
      }
      
      // 测试SQL执行
      try {
        let testSQL = ruleInfo.action_target;
        
        // 如果SQL包含参数，替换为测试值
        if (testSQL.includes('?')) {
          if (ruleInfo.intent_name.includes('物料')) {
            testSQL = testSQL.replace(/\?/g, "'电池'");
          } else if (ruleInfo.intent_name.includes('供应商')) {
            testSQL = testSQL.replace(/\?/g, "'聚龙'");
          } else {
            testSQL = testSQL.replace(/\?/g, "'测试'");
          }
        }
        
        const [results] = await connection.execute(testSQL);
        console.log(`   ✅ SQL执行成功: ${results.length}条记录`);
        
        if (results.length > 0) {
          const fields = Object.keys(results[0]);
          console.log(`   字段: ${fields.join(', ')}`);
          
          // 检查是否为中文字段
          const hasChineseFields = fields.every(field => /[\u4e00-\u9fa5]/.test(field));
          console.log(`   中文字段: ${hasChineseFields ? '✅' : '❌'}`);
          
          console.log(`   样本数据: ${JSON.stringify(results[0])}`);
        }
        
      } catch (error) {
        console.log(`   ❌ SQL执行失败: ${error.message}`);
      }
    }
    
    // 检查数据库表的记录数
    console.log('\n📊 数据库表记录统计:');
    
    const tables = ['inventory', 'lab_tests', 'production_online'];
    for (const table of tables) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   ${table}: ${count[0].count}条记录`);
      } catch (error) {
        console.log(`   ${table}: 查询失败 - ${error.message}`);
      }
    }
    
    // 检查供应商数据
    console.log('\n🏭 供应商数据检查:');
    try {
      const [suppliers] = await connection.execute(`
        SELECT DISTINCT supplier_name, COUNT(*) as count 
        FROM inventory 
        WHERE supplier_name IS NOT NULL AND supplier_name != ''
        GROUP BY supplier_name 
        ORDER BY count DESC 
        LIMIT 5
      `);
      
      suppliers.forEach(supplier => {
        console.log(`   ${supplier.supplier_name}: ${supplier.count}条记录`);
      });
    } catch (error) {
      console.log(`   供应商查询失败: ${error.message}`);
    }
    
    // 检查物料数据
    console.log('\n📦 物料数据检查:');
    try {
      const [materials] = await connection.execute(`
        SELECT DISTINCT material_name, COUNT(*) as count 
        FROM inventory 
        WHERE material_name IS NOT NULL AND material_name != ''
        GROUP BY material_name 
        ORDER BY count DESC 
        LIMIT 5
      `);
      
      materials.forEach(material => {
        console.log(`   ${material.material_name}: ${material.count}条记录`);
      });
    } catch (error) {
      console.log(`   物料查询失败: ${error.message}`);
    }
    
    console.log('\n🎉 基础规则检查完成！');
    
  } catch (error) {
    console.error('❌ 基础规则检查失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

checkBasicRules().catch(console.error);
