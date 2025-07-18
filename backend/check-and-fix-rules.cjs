// 检查并修复规则表的example_query字段
const mysql = require('mysql2/promise');

async function checkAndFixRules() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('🔍 检查assistant_rules表结构...\n');
    
    // 1. 检查表结构
    const [structure] = await connection.execute('DESCRIBE assistant_rules');
    console.log('📋 assistant_rules表字段:');
    structure.forEach(field => {
      console.log(`   ${field.Field}: ${field.Type} (${field.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    // 2. 检查是否有example_query字段
    const hasExampleQuery = structure.some(field => field.Field === 'example_query');
    
    if (!hasExampleQuery) {
      console.log('\n❌ 缺少example_query字段，正在添加...');
      
      // 添加example_query字段
      await connection.execute(`
        ALTER TABLE assistant_rules 
        ADD COLUMN example_query TEXT COMMENT '示例查询'
      `);
      
      console.log('✅ 已添加example_query字段');
      
      // 为现有规则添加示例查询
      const updateQueries = [
        {
          id: 1,
          example_query: '查询库存信息'
        },
        {
          id: 3,
          example_query: '查询检验数据'
        },
        {
          id: 4,
          example_query: '查询生产数据'
        },
        {
          id: 5,
          example_query: '聚龙供应商库存'
        },
        {
          id: 6,
          example_query: 'LCD显示屏库存'
        }
      ];
      
      for (const update of updateQueries) {
        await connection.execute(
          'UPDATE assistant_rules SET example_query = ? WHERE id = ?',
          [update.example_query, update.id]
        );
        console.log(`✅ 更新规则${update.id}的示例查询: ${update.example_query}`);
      }
      
    } else {
      console.log('\n✅ example_query字段已存在');
    }
    
    // 3. 查看更新后的规则数据
    console.log('\n📋 更新后的规则列表:');
    const [rules] = await connection.execute(`
      SELECT id, intent_name, description, example_query, status
      FROM assistant_rules 
      WHERE status = 'active'
      ORDER BY priority DESC
      LIMIT 10
    `);
    
    rules.forEach((rule, index) => {
      console.log(`\n第${index + 1}条规则:`);
      console.log(`   ID: ${rule.id}`);
      console.log(`   意图: ${rule.intent_name}`);
      console.log(`   描述: ${rule.description}`);
      console.log(`   示例查询: ${rule.example_query || '未设置'}`);
      console.log(`   状态: ${rule.status}`);
    });
    
    console.log('\n🎯 规则表修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  } finally {
    await connection.end();
  }
}

checkAndFixRules();
