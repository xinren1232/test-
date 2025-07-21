import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 根据您提供的截图，这些规则需要重新分类
const UNCATEGORIZED_RULES_MAPPING = {
  // 基础查询规则 - Priority 10
  '质量趋势分析': 30,  // 应该是高级统计规则
  '供应商质量表现': 20, // 应该是进阶分析规则
  '批次质量分析': 20,   // 应该是进阶分析规则
  '物料不良分析': 30,   // 应该是高级统计规则
  '供应商物料不良关联': 30, // 应该是高级统计规则
  '批次不良率排行': 30,  // 应该是高级统计规则
  '供应商不良专项分析': 30, // 应该是高级统计规则
  '工厂质量对比分析': 30,  // 应该是高级统计规则
  '电池物料不良分析': 40,  // 应该是专项分析规则
  '包装盒物料不良分析': 40, // 应该是专项分析规则
  '充电器物料不良分析': 40, // 应该是专项分析规则
  '高风险组合分析': 40,    // 应该是专项分析规则
  '重复不良问题分析': 40,  // 应该是专项分析规则
  '质量改善效果分析': 40,  // 应该是专项分析规则
  '质量稳定性分析': 40,    // 应该是专项分析规则
  '工厂上线对比分析': 50,  // 应该是趋势对比规则
  '供应商上线质量分析': 50, // 应该是趋势对比规则
  '物料上线趋势分析': 50,  // 应该是趋势对比规则
  '高不良率上线查询': 50   // 应该是趋势对比规则
};

async function fixUncategorizedRules() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔧 开始修复未分类的规则...');
    
    // 1. 查看当前所有规则的分类状态
    const [allRules] = await connection.execute(`
      SELECT intent_name, priority, description
      FROM nlp_intent_rules 
      ORDER BY priority, intent_name
    `);
    
    console.log(`\n📊 当前规则库状态 (共${allRules.length}个规则):`);
    
    // 按优先级分组显示
    const grouped = {};
    allRules.forEach(rule => {
      if (!grouped[rule.priority]) grouped[rule.priority] = [];
      grouped[rule.priority].push(rule);
    });
    
    Object.keys(grouped).sort((a,b) => a-b).forEach(priority => {
      const categoryName = getCategoryName(priority);
      console.log(`\n${categoryName} - Priority ${priority} (${grouped[priority].length}个):`);
      grouped[priority].forEach((rule, i) => {
        console.log(`  ${i+1}. ${rule.intent_name}`);
      });
    });
    
    // 2. 检查未正确分类的规则
    const uncategorized = allRules.filter(rule => 
      ![10, 20, 30, 40, 50].includes(rule.priority)
    );
    
    if (uncategorized.length > 0) {
      console.log(`\n⚠️ 发现${uncategorized.length}个未正确分类的规则:`);
      uncategorized.forEach((rule, i) => {
        console.log(`  ${i+1}. ${rule.intent_name} (Priority: ${rule.priority})`);
      });
    }
    
    // 3. 修复分类错误的规则
    console.log('\n🔧 修复规则分类...');
    
    let fixedCount = 0;
    for (const [ruleName, correctPriority] of Object.entries(UNCATEGORIZED_RULES_MAPPING)) {
      const rule = allRules.find(r => r.intent_name === ruleName);
      if (rule && rule.priority !== correctPriority) {
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET priority = ?, updated_at = NOW()
          WHERE intent_name = ?
        `, [correctPriority, ruleName]);
        
        console.log(`✅ ${ruleName}: Priority ${rule.priority} -> ${correctPriority}`);
        fixedCount++;
      }
    }
    
    // 4. 处理其他可能的未分类规则
    for (const rule of uncategorized) {
      if (!UNCATEGORIZED_RULES_MAPPING[rule.intent_name]) {
        // 根据规则名称自动分类
        let newPriority = 10; // 默认为基础查询
        
        if (rule.intent_name.includes('Top') || rule.intent_name.includes('排行')) {
          newPriority = 20; // 进阶分析
        } else if (rule.intent_name.includes('统计') || rule.intent_name.includes('分析')) {
          newPriority = 30; // 高级统计
        } else if (rule.intent_name.includes('专项') || rule.intent_name.includes('特定')) {
          newPriority = 40; // 专项分析
        } else if (rule.intent_name.includes('趋势') || rule.intent_name.includes('对比')) {
          newPriority = 50; // 趋势对比
        }
        
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET priority = ?, updated_at = NOW()
          WHERE intent_name = ?
        `, [newPriority, rule.intent_name]);
        
        console.log(`🔄 ${rule.intent_name}: Priority ${rule.priority} -> ${newPriority} (自动分类)`);
        fixedCount++;
      }
    }
    
    // 5. 验证修复结果
    console.log('\n📊 验证修复结果...');
    
    const [updatedRules] = await connection.execute(`
      SELECT intent_name, priority, description
      FROM nlp_intent_rules 
      ORDER BY priority, intent_name
    `);
    
    const updatedGrouped = {};
    updatedRules.forEach(rule => {
      if (!updatedGrouped[rule.priority]) updatedGrouped[rule.priority] = [];
      updatedGrouped[rule.priority].push(rule);
    });
    
    console.log(`\n📈 修复后规则库状态 (共${updatedRules.length}个规则):`);
    Object.keys(updatedGrouped).sort((a,b) => a-b).forEach(priority => {
      const categoryName = getCategoryName(priority);
      console.log(`\n${categoryName} - Priority ${priority} (${updatedGrouped[priority].length}个):`);
      updatedGrouped[priority].forEach((rule, i) => {
        console.log(`  ${i+1}. ${rule.intent_name}`);
      });
    });
    
    // 检查是否还有未分类的规则
    const stillUncategorized = updatedRules.filter(rule => 
      ![10, 20, 30, 40, 50].includes(rule.priority)
    );
    
    if (stillUncategorized.length === 0) {
      console.log('\n✅ 所有规则都已正确分类！');
    } else {
      console.log(`\n⚠️ 仍有${stillUncategorized.length}个规则未正确分类:`);
      stillUncategorized.forEach((rule, i) => {
        console.log(`  ${i+1}. ${rule.intent_name} (Priority: ${rule.priority})`);
      });
    }
    
    console.log(`\n🎯 总计修复了 ${fixedCount} 个规则的分类`);
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

function getCategoryName(priority) {
  switch (parseInt(priority)) {
    case 10: return '基础查询规则';
    case 20: return '进阶分析规则';
    case 30: return '高级统计规则';
    case 40: return '专项分析规则';
    case 50: return '趋势对比规则';
    default: return `未分类规则(Priority ${priority})`;
  }
}

fixUncategorizedRules();
