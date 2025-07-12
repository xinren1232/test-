// 测试前端分类逻辑
const testCategories = [
  '基础查询规则',
  '进阶分析规则', 
  '高级统计规则',
  '专项分析规则',
  '趋势对比规则',
  '未分类'
];

// 前端分类标签类型函数（复制自前端代码）
function getCategoryTagType(category) {
  switch (category) {
    case '基础查询规则':
      return 'success';
    case '进阶分析规则':
      return 'primary';
    case '高级统计规则':
      return 'warning';
    case '专项分析规则':
      return 'danger';
    case '趋势对比规则':
      return 'info';
    default:
      return '';
  }
}

// 前端分类标签文本函数（复制自前端代码）
function getCategoryLabel(category) {
  switch (category) {
    case '基础查询规则':
      return '基础';
    case '进阶分析规则':
      return '进阶';
    case '高级统计规则':
      return '统计';
    case '专项分析规则':
      return '专项';
    case '趋势对比规则':
      return '趋势';
    default:
      return '未分类';
  }
}

// RulesService中的分类函数（复制自前端代码）
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

// RulesService中的颜色函数（复制自前端代码）
function getCategoryColor(category) {
  const colorMap = {
    '基础查询规则': '#67C23A',
    '进阶分析规则': '#409EFF',
    '高级统计规则': '#E6A23C',
    '专项分析规则': '#F56C6C',
    '趋势对比规则': '#909399',
    '未分类': '#C0C4CC'
  };
  return colorMap[category] || '#C0C4CC';
}

console.log('🧪 测试前端分类逻辑...\n');

console.log('📋 分类标签测试:');
testCategories.forEach(category => {
  const tagType = getCategoryTagType(category);
  const label = getCategoryLabel(category);
  const color = getCategoryColor(category);
  
  console.log(`${category}:`);
  console.log(`  标签: "${label}" (类型: ${tagType})`);
  console.log(`  颜色: ${color}`);
  console.log('');
});

console.log('🔢 优先级映射测试:');
[10, 20, 30, 40, 50, 99].forEach(priority => {
  const category = getCategoryByPriority(priority);
  const tagType = getCategoryTagType(category);
  const label = getCategoryLabel(category);
  
  console.log(`Priority ${priority} -> "${category}" -> "${label}" (${tagType})`);
});

console.log('\n✅ 前端分类逻辑测试完成！');

// 模拟API数据测试
console.log('\n📱 模拟前端数据处理:');
const mockApiData = [
  { id: 1, intent_name: '物料库存信息查询', category: '基础查询规则', priority: 10 },
  { id: 2, intent_name: '批次信息查询', category: '进阶分析规则', priority: 20 },
  { id: 3, intent_name: '质量趋势分析', category: '高级统计规则', priority: 30 },
  { id: 4, intent_name: '电池物料不良分析', category: '专项分析规则', priority: 40 },
  { id: 5, intent_name: '工厂上线对比分析', category: '趋势对比规则', priority: 50 }
];

mockApiData.forEach(rule => {
  const tagType = getCategoryTagType(rule.category);
  const label = getCategoryLabel(rule.category);
  
  console.log(`${rule.intent_name}:`);
  console.log(`  Category: "${rule.category}"`);
  console.log(`  显示标签: "${label}" (${tagType})`);
  console.log('');
});

console.log('✅ 模拟数据处理测试完成！');
