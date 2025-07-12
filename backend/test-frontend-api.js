import fetch from 'node-fetch';

async function testFrontendAPI() {
  try {
    console.log('🔍 测试前端API分类显示...\n');
    
    // 测试规则列表API
    console.log('📡 测试 /api/rules 接口...');
    const rulesResponse = await fetch('http://localhost:3001/api/rules');
    const rulesData = await rulesResponse.json();
    
    if (rulesData.success && rulesData.data) {
      console.log(`✅ 规则总数: ${rulesData.data.length}条\n`);
      
      // 统计分类
      const categoryStats = {};
      rulesData.data.forEach(rule => {
        const category = rule.category || '未分类';
        categoryStats[category] = (categoryStats[category] || 0) + 1;
      });
      
      console.log('📊 API返回的分类统计:');
      Object.entries(categoryStats).forEach(([category, count]) => {
        console.log(`  ${category}: ${count}条`);
      });
      
      // 检查是否有未分类的规则
      const unclassified = rulesData.data.filter(rule => 
        !rule.category || rule.category === '' || rule.category === '未分类'
      );
      
      if (unclassified.length > 0) {
        console.log(`\n❌ 发现 ${unclassified.length} 条未分类规则:`);
        unclassified.forEach(rule => {
          console.log(`  - ${rule.intent_name}`);
        });
      } else {
        console.log('\n✅ 所有规则都已正确分类');
      }
      
      // 显示前5条规则的详细信息
      console.log('\n📋 前5条规则示例:');
      rulesData.data.slice(0, 5).forEach((rule, i) => {
        console.log(`${i+1}. ${rule.intent_name}`);
        console.log(`   分类: "${rule.category}"`);
        console.log(`   描述: ${rule.description}`);
        console.log('');
      });
      
    } else {
      console.log('❌ 规则API调用失败:', rulesData.message);
    }
    
    // 测试分类统计API
    console.log('\n📡 测试 /api/rules/categories 接口...');
    const categoriesResponse = await fetch('http://localhost:3001/api/rules/categories');
    const categoriesData = await categoriesResponse.json();
    
    if (categoriesData.success && categoriesData.data) {
      console.log('✅ 分类API调用成功\n');
      
      console.log('📊 分类统计结果:');
      categoriesData.data.categories.forEach(category => {
        console.log(`  ${category.name}: ${category.count}条`);
        if (category.rules.length > 0) {
          console.log(`    示例规则: ${category.rules[0].name}`);
        }
      });
      
      console.log(`\n📈 总体统计:`);
      console.log(`  总规则数: ${categoriesData.data.totalRules}`);
      console.log(`  活跃规则数: ${categoriesData.data.activeRules}`);
      
    } else {
      console.log('❌ 分类API调用失败:', categoriesData.message);
    }
    
  } catch (error) {
    console.error('❌ API测试失败:', error.message);
  }
}

// 模拟前端分类显示逻辑
function simulateFrontendDisplay() {
  console.log('\n🎨 模拟前端分类显示逻辑...\n');
  
  const testCategories = [
    '基础查询',
    '进阶查询', 
    '专项分析',
    '统计报表',
    '物料专项',
    '对比分析',
    '综合查询',
    '未分类'
  ];
  
  // 前端分类标签类型函数
  function getCategoryTagType(category) {
    switch (category) {
      case '基础查询':
        return 'success';
      case '进阶查询':
        return 'primary';
      case '专项分析':
        return 'danger';
      case '统计报表':
        return 'warning';
      case '物料专项':
        return 'info';
      case '对比分析':
        return 'primary';
      case '综合查询':
        return 'success';
      default:
        return '';
    }
  }
  
  // 前端分类标签文本函数
  function getCategoryLabel(category) {
    switch (category) {
      case '基础查询':
        return '基础查询';
      case '进阶查询':
        return '进阶查询';
      case '专项分析':
        return '专项分析';
      case '统计报表':
        return '统计报表';
      case '物料专项':
        return '物料专项';
      case '对比分析':
        return '对比分析';
      case '综合查询':
        return '综合查询';
      default:
        return '未分类';
    }
  }
  
  console.log('🏷️  分类标签测试:');
  testCategories.forEach(category => {
    const tagType = getCategoryTagType(category);
    const label = getCategoryLabel(category);
    console.log(`  ${category} → 显示: "${label}" (${tagType || 'default'})`);
  });
}

// 运行测试
testFrontendAPI().then(() => {
  simulateFrontendDisplay();
  console.log('\n🎉 前端API测试完成！');
});
