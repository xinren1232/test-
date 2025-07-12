import fetch from 'node-fetch';

async function testCategories() {
  try {
    console.log('🔍 测试规则分类情况...\n');
    
    const response = await fetch('http://localhost:3001/api/rules');
    const data = await response.json();
    
    if (data.success && data.data) {
      console.log('✅ 规则总数:', data.data.length);
      
      const categories = {};
      data.data.forEach(rule => {
        const cat = rule.category || '未分类';
        categories[cat] = (categories[cat] || 0) + 1;
      });
      
      console.log('\n📊 分类统计:');
      Object.entries(categories).forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count} 条`);
      });
      
      // 显示前10条规则的分类情况
      console.log('\n📋 前10条规则示例:');
      data.data.slice(0, 10).forEach((rule, i) => {
        console.log(`${i+1}. ${rule.intent_name}`);
        console.log(`   分类: ${rule.category || '未分类'} | 优先级: ${rule.priority}`);
      });
      
      // 检查是否还有未分类的规则
      const uncategorized = data.data.filter(rule => !rule.category || rule.category === '未分类');
      if (uncategorized.length > 0) {
        console.log(`\n⚠️  发现 ${uncategorized.length} 条未分类规则:`);
        uncategorized.forEach(rule => {
          console.log(`  - ${rule.intent_name} (优先级: ${rule.priority})`);
        });
      } else {
        console.log('\n✅ 所有规则都已正确分类！');
      }
      
    } else {
      console.log('❌ API返回错误:', data);
    }
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
  }
}

testCategories();
