import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function verifyCategorization() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔍 验证规则分类修复结果...');
    
    // 1. 获取所有规则及其分类
    const [allRules] = await connection.execute(`
      SELECT id, intent_name, priority, description
      FROM nlp_intent_rules 
      ORDER BY priority, intent_name
    `);
    
    console.log(`\n📊 规则库状态验证 (共${allRules.length}个规则):`);
    
    // 2. 按优先级分组统计
    const categoryStats = {};
    allRules.forEach(rule => {
      const category = getCategoryByPriority(rule.priority);
      if (!categoryStats[category]) {
        categoryStats[category] = [];
      }
      categoryStats[category].push(rule);
    });
    
    // 3. 显示分类统计
    console.log('\n📋 分类统计:');
    Object.keys(categoryStats).forEach(category => {
      const rules = categoryStats[category];
      const tagType = getCategoryTagType(category);
      const label = getCategoryLabel(category);
      
      console.log(`\n${category} (${rules.length}个规则) - 标签: ${label} (${tagType}):`);
      rules.forEach((rule, i) => {
        console.log(`  ${i+1}. ${rule.intent_name} (Priority: ${rule.priority})`);
      });
    });
    
    // 4. 检查是否还有未分类的规则
    const uncategorized = allRules.filter(rule => 
      getCategoryByPriority(rule.priority) === '未分类'
    );
    
    if (uncategorized.length > 0) {
      console.log(`\n⚠️ 仍有${uncategorized.length}个未分类的规则:`);
      uncategorized.forEach((rule, i) => {
        console.log(`  ${i+1}. ${rule.intent_name} (Priority: ${rule.priority})`);
      });
    } else {
      console.log('\n✅ 所有规则都已正确分类！');
    }
    
    // 5. 验证前端分类逻辑
    console.log('\n🎨 前端分类标签验证:');
    Object.keys(categoryStats).forEach(category => {
      const tagType = getCategoryTagType(category);
      const label = getCategoryLabel(category);
      console.log(`${category}: 标签="${label}", 类型="${tagType}"`);
    });
    
    // 6. 模拟前端数据格式
    console.log('\n📱 模拟前端数据格式:');
    const frontendData = allRules.slice(0, 5).map(rule => ({
      id: rule.id,
      intent_name: rule.intent_name,
      priority: rule.priority,
      category: getCategoryByPriority(rule.priority),
      categoryLabel: getCategoryLabel(getCategoryByPriority(rule.priority)),
      categoryTagType: getCategoryTagType(getCategoryByPriority(rule.priority))
    }));
    
    console.table(frontendData);
    
    console.log('\n✅ 分类修复验证完成！');
    
  } catch (error) {
    console.error('❌ 验证过程中出现错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 分类映射函数（与前端保持一致）
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

function getCategoryTagType(category) {
  switch (category) {
    case '基础查询规则': return 'success';
    case '进阶分析规则': return 'primary';
    case '高级统计规则': return 'warning';
    case '专项分析规则': return 'danger';
    case '趋势对比规则': return 'info';
    default: return '';
  }
}

function getCategoryLabel(category) {
  switch (category) {
    case '基础查询规则': return '基础';
    case '进阶分析规则': return '进阶';
    case '高级统计规则': return '统计';
    case '专项分析规则': return '专项';
    case '趋势对比规则': return '趋势';
    default: return '未分类';
  }
}

verifyCategorization();
