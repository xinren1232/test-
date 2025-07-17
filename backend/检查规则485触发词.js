import mysql from 'mysql2/promise';

async function checkRule485Triggers() {
  let connection;
  
  try {
    console.log('🔍 检查规则485触发词...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 查看规则485的触发词
    const [rule] = await connection.execute('SELECT * FROM nlp_intent_rules WHERE id = 485');
    if (rule.length > 0) {
      console.log('\n规则485信息:');
      console.log('名称:', rule[0].intent_name);
      console.log('分类:', rule[0].category);
      console.log('状态:', rule[0].status);
      console.log('优先级:', rule[0].priority);
      console.log('触发词:', rule[0].trigger_words);
      
      // 解析触发词
      try {
        const triggers = JSON.parse(rule[0].trigger_words);
        console.log('解析后的触发词:', triggers);
      } catch (error) {
        console.log('触发词解析失败:', error.message);
      }
    } else {
      console.log('❌ 规则485不存在');
      return;
    }
    
    // 2. 更新规则485的触发词
    console.log('\n🔧 更新规则485的触发词...');
    
    const newTriggers = [
      "供应商列表", "所有供应商", "有哪些供应商", "供应商有什么", "供应商都有什么",
      "系统里有哪些供应商", "查看供应商", "显示供应商", "供应商信息", "厂商列表", 
      "供货商", "制造商", "供应商", "查看所有供应商", "供应商都有哪些"
    ];
    
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET trigger_words = ?, priority = 95, updated_at = NOW()
      WHERE id = 485
    `, [JSON.stringify(newTriggers)]);
    
    console.log('✅ 规则485触发词已更新');
    console.log('新触发词:', newTriggers);
    
    // 3. 验证更新后的规则
    const [updatedRule] = await connection.execute('SELECT * FROM nlp_intent_rules WHERE id = 485');
    if (updatedRule.length > 0) {
      console.log('\n更新后的规则485:');
      console.log('触发词:', updatedRule[0].trigger_words);
      console.log('优先级:', updatedRule[0].priority);
    }
    
    console.log('\n🎉 规则485触发词检查完成！');
    
  } catch (error) {
    console.error('❌ 检查规则485触发词失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

checkRule485Triggers().catch(console.error);
