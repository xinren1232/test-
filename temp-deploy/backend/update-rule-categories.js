import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 规则分类映射
const RULE_CATEGORY_MAPPING = {
  // 基础查询 - 库存查询
  '物料库存查询': '基础查询',
  '供应商库存查询': '基础查询',
  '批次库存信息查询': '基础查询',
  '库存状态查询': '基础查询',
  
  // 基础查询 - 上线查询
  '物料上线情况查询': '基础查询',
  '供应商上线情况查询': '基础查询',
  '批次上线情况查询': '基础查询',
  '项目物料不良查询': '基础查询',
  
  // 基础查询 - 测试查询
  '物料测试情况查询': '基础查询',
  '供应商测试情况查询': '基础查询',
  '测试NG情况查询': '基础查询',
  '项目测试情况查询': '基础查询',
  '基线测试情况查询': '基础查询',
  '基线物料不良查询': '基础查询',
  '批次测试情况查询': '基础查询',
  
  // 进阶查询
  '批次信息查询': '进阶查询',
  '物料上线Top不良': '进阶查询',
  '物料测试Top不良': '进阶查询',
  
  // 对比分析
  '供应商对比分析': '对比分析',
  '物料对比分析': '对比分析',
  
  // 专项分析
  '供应商质量评级': '专项分析',
  '光学类显示缺陷专项分析': '专项分析',
  '结构件类深度不良分析': '专项分析',
  '大类别Top不良分析': '专项分析',
  '重复缺陷分析': '专项分析',
  '物料大类别月度质量趋势': '专项分析',
  '物料大类别质量对比': '专项分析',
  '异常批次识别': '专项分析',
  
  // 统计报表
  '本月测试汇总': '统计报表',
  '物料大类查询': '统计报表',
  '光学类供应商质量排行': '统计报表',
  '结构件类供应商质量排行': '统计报表',
  
  // 物料专项
  '充电类物料查询': '物料专项',
  '包装盒物料查询': '物料专项',
  '电池物料查询': '物料专项',
  
  // 综合查询
  'NG测试结果查询': '综合查询',
  '供应商物料查询': '综合查询',
  '在线跟踪查询': '综合查询',
  '物料相关查询': '综合查询'
};

async function updateRuleCategories() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 统一更新规则分类...\n');
    
    // 获取所有规则
    const [rules] = await connection.execute('SELECT intent_name, category FROM nlp_intent_rules');
    
    console.log(`📊 当前规则总数: ${rules.length}条\n`);
    
    let updatedCount = 0;
    let unchangedCount = 0;
    
    for (const rule of rules) {
      const newCategory = RULE_CATEGORY_MAPPING[rule.intent_name];
      
      if (newCategory) {
        if (rule.category !== newCategory) {
          // 更新分类
          await connection.execute(
            'UPDATE nlp_intent_rules SET category = ?, updated_at = NOW() WHERE intent_name = ?',
            [newCategory, rule.intent_name]
          );
          
          console.log(`🔄 ${rule.intent_name}: ${rule.category || '未分类'} → ${newCategory}`);
          updatedCount++;
        } else {
          unchangedCount++;
        }
      } else {
        console.log(`⚠️  未找到分类映射: ${rule.intent_name}`);
      }
    }
    
    console.log('\n📈 更新统计:');
    console.log(`  🔄 已更新: ${updatedCount}条`);
    console.log(`  ✅ 无需更新: ${unchangedCount}条`);
    
    // 显示更新后的分类统计
    console.log('\n📊 更新后分类统计:');
    const [categoryStats] = await connection.execute(`
      SELECT 
        category,
        COUNT(*) as count
      FROM nlp_intent_rules 
      GROUP BY category 
      ORDER BY count DESC
    `);
    
    categoryStats.forEach(stat => {
      console.log(`  ${stat.category || '未分类'}: ${stat.count}条`);
    });
    
    // 验证分类完整性
    console.log('\n🔍 分类完整性验证:');
    const expectedCategories = [...new Set(Object.values(RULE_CATEGORY_MAPPING))];
    const actualCategories = categoryStats.map(s => s.category).filter(c => c);
    
    expectedCategories.forEach(expectedCat => {
      if (actualCategories.includes(expectedCat)) {
        const count = categoryStats.find(s => s.category === expectedCat)?.count || 0;
        console.log(`  ✅ ${expectedCat}: ${count}条`);
      } else {
        console.log(`  ❌ ${expectedCat}: 缺失`);
      }
    });
    
    // 检查未分类的规则
    const [unclassified] = await connection.execute(`
      SELECT intent_name 
      FROM nlp_intent_rules 
      WHERE category IS NULL OR category = '' OR category = '未分类'
    `);
    
    if (unclassified.length > 0) {
      console.log('\n⚠️  仍有未分类规则:');
      unclassified.forEach(rule => {
        console.log(`  - ${rule.intent_name}`);
      });
    } else {
      console.log('\n✅ 所有规则都已正确分类');
    }
    
    console.log('\n🎉 规则分类更新完成！');
    
  } catch (error) {
    console.error('❌ 更新失败:', error);
  } finally {
    await connection.end();
  }
}

updateRuleCategories();
