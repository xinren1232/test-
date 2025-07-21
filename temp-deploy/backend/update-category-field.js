import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function updateCategoryField() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔧 开始更新category字段...');
    
    // 1. 获取所有规则
    const [allRules] = await connection.execute(`
      SELECT id, intent_name, priority, category
      FROM nlp_intent_rules 
      ORDER BY priority, intent_name
    `);
    
    console.log(`\n📊 当前规则状态 (共${allRules.length}个规则):`);
    
    // 2. 统计当前category分布
    const categoryStats = {};
    allRules.forEach(rule => {
      if (!categoryStats[rule.category]) {
        categoryStats[rule.category] = 0;
      }
      categoryStats[rule.category]++;
    });
    
    console.log('\n📋 当前category分布:');
    Object.keys(categoryStats).forEach(category => {
      console.log(`  '${category}': ${categoryStats[category]}个规则`);
    });
    
    // 3. 根据priority更新category
    console.log('\n🔄 根据priority更新category字段...');
    
    let updatedCount = 0;
    
    for (const rule of allRules) {
      const newCategory = getCategoryByPriority(rule.priority);
      
      if (rule.category !== newCategory) {
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET category = ?, updated_at = NOW()
          WHERE id = ?
        `, [newCategory, rule.id]);
        
        console.log(`✅ ${rule.intent_name}: '${rule.category}' -> '${newCategory}'`);
        updatedCount++;
      }
    }
    
    console.log(`\n📈 总计更新了 ${updatedCount} 个规则的category字段`);
    
    // 4. 验证更新结果
    console.log('\n🔍 验证更新结果...');
    
    const [updatedRules] = await connection.execute(`
      SELECT priority, category, COUNT(*) as count
      FROM nlp_intent_rules 
      GROUP BY priority, category
      ORDER BY priority
    `);
    
    console.log('\n📊 更新后的分布:');
    updatedRules.forEach(stat => {
      console.log(`  Priority ${stat.priority} -> '${stat.category}': ${stat.count}个规则`);
    });
    
    // 5. 检查是否还有未分类的规则
    const [uncategorized] = await connection.execute(`
      SELECT intent_name, priority, category
      FROM nlp_intent_rules 
      WHERE category = '未分类'
    `);
    
    if (uncategorized.length > 0) {
      console.log(`\n⚠️ 仍有${uncategorized.length}个未分类的规则:`);
      uncategorized.forEach((rule, i) => {
        console.log(`  ${i+1}. ${rule.intent_name} (Priority: ${rule.priority})`);
      });
    } else {
      console.log('\n✅ 所有规则都已正确分类！');
    }
    
    // 6. 生成最终的分类统计
    const [finalStats] = await connection.execute(`
      SELECT category, COUNT(*) as count
      FROM nlp_intent_rules 
      GROUP BY category
      ORDER BY count DESC
    `);
    
    console.log('\n📈 最终分类统计:');
    finalStats.forEach(stat => {
      console.log(`  ${stat.category}: ${stat.count}个规则`);
    });
    
    console.log('\n✅ Category字段更新完成！');
    
  } catch (error) {
    console.error('❌ 更新过程中出现错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 根据优先级获取分类（与前端保持一致）
function getCategoryByPriority(priority) {
  switch (parseInt(priority)) {
    case 10: return '基础查询规则';
    case 20: return '进阶分析规则';
    case 30: return '高级统计规则';
    case 40: return '专项分析规则';
    case 50: return '趋势对比规则';
    default: return '未分类';
  }
}

updateCategoryField();
