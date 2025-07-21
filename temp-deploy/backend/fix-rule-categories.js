import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 根据优先级获取分类
function getCategoryByPriority(priority) {
  switch (parseInt(priority)) {
    case 10: return '基础查询规则';
    case 20: return '进阶分析规则';
    case 30: return '高级统计规则';
    case 40: return '专项分析规则';
    case 50: return '趋势对比规则';
    case 9: return '中级规则';
    case 8: return '中级规则';
    case 7: return '高级规则';
    case 6: return '专项规则';
    case 5: return '排行规则';
    case 4: return '复杂规则';
    case 3: return '追溯规则';
    default: return '未分类';
  }
}

async function fixRuleCategories() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 检查规则分类情况...\n');
    
    // 1. 检查当前分类情况
    const [currentRules] = await connection.execute(`
      SELECT intent_name, priority, category 
      FROM nlp_intent_rules 
      ORDER BY priority DESC, intent_name
    `);
    
    console.log('📊 当前规则分类情况:');
    let nullCategoryCount = 0;
    currentRules.forEach((rule, index) => {
      const categoryStatus = rule.category ? rule.category : 'NULL';
      if (!rule.category) nullCategoryCount++;
      console.log(`${index + 1}. ${rule.intent_name}`);
      console.log(`   优先级: ${rule.priority}, 分类: ${categoryStatus}`);
    });
    
    console.log(`\n❌ 发现 ${nullCategoryCount} 条规则缺少分类信息`);
    
    // 2. 更新所有规则的分类
    console.log('\n🔧 开始更新规则分类...');
    
    for (const rule of currentRules) {
      const newCategory = getCategoryByPriority(rule.priority);
      
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET category = ? 
        WHERE intent_name = ?
      `, [newCategory, rule.intent_name]);
      
      console.log(`✅ 更新规则: ${rule.intent_name} -> ${newCategory}`);
    }
    
    // 3. 验证更新结果
    console.log('\n📈 验证更新结果...');
    
    const [updatedRules] = await connection.execute(`
      SELECT 
        category,
        COUNT(*) as count
      FROM nlp_intent_rules 
      WHERE status = 'active'
      GROUP BY category
      ORDER BY category
    `);
    
    console.log('\n📊 更新后的分类统计:');
    updatedRules.forEach(stat => {
      console.log(`  ${stat.category}: ${stat.count} 条规则`);
    });
    
    // 4. 显示详细分类
    console.log('\n📋 详细分类列表:');
    const [detailedRules] = await connection.execute(`
      SELECT intent_name, priority, category
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY priority DESC, intent_name
    `);
    
    const categoryGroups = {};
    detailedRules.forEach(rule => {
      if (!categoryGroups[rule.category]) {
        categoryGroups[rule.category] = [];
      }
      categoryGroups[rule.category].push(rule);
    });
    
    Object.keys(categoryGroups).forEach(category => {
      console.log(`\n${category} (${categoryGroups[category].length}条):`);
      categoryGroups[category].forEach((rule, index) => {
        console.log(`  ${index + 1}. ${rule.intent_name} (优先级: ${rule.priority})`);
      });
    });
    
    console.log('\n🎉 规则分类修复完成！');
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
  } finally {
    await connection.end();
  }
}

fixRuleCategories().catch(console.error);
