import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 需要删除的重复规则
const RULES_TO_DELETE = [
  '物料库存查询',
  '物料上线情况查询', 
  '物料测试情况查询',
  'NG测试结果查询'
];

// 需要修复的规则
const RULES_TO_FIX = {
  '物料上线信息查询': {
    description: '查询物料上线的基本信息，按照前端上线页面字段显示',
    action_target: `
SELECT 
  factory as 工厂,
  project as 基线,
  project as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  CONCAT(ROUND(defect_rate * 100, 1), '%') as 不良率,
  exception_count as 本周异常,
  DATE_FORMAT(online_date, '%Y-%m-%d') as 检验日期
FROM online_tracking 
ORDER BY online_date DESC
LIMIT 10`
  }
};

// 重新分类的规则结构
const NEW_RULE_CATEGORIES = {
  // 基础查询规则 - Priority 10
  basic_queries: {
    priority: 10,
    rules: [
      // 库存类
      '物料库存信息查询',
      '供应商库存查询', 
      '批次库存信息查询',
      '库存状态查询',
      '风险库存查询',
      
      // 上线类
      '物料上线信息查询',
      '供应商上线情况查询',
      '批次上线情况查询',
      '项目物料不良查询',
      '基线物料不良查询',
      
      // 测试类
      '测试结果查询',
      '测试NG情况查询',
      '供应商测试情况查询',
      '项目测试情况查询',
      '基线测试情况查询',
      '批次测试情况查询',
      'OK测试结果查询'
    ]
  },
  
  // 进阶分析规则 - Priority 20
  advanced_analysis: {
    priority: 20,
    rules: [
      '批次信息查询',
      '物料上线Top不良',
      '物料测试Top不良',
      '批次质量分析',
      '供应商质量表现'
    ]
  },
  
  // 高级统计规则 - Priority 30
  advanced_statistics: {
    priority: 30,
    rules: [
      '批次不良率排行',
      '供应商不良专项分析',
      '工厂质量对比分析',
      '物料不良分析',
      '质量趋势分析',
      '供应商物料不良关联'
    ]
  },
  
  // 专项分析规则 - Priority 40
  specialized_analysis: {
    priority: 40,
    rules: [
      '电池物料不良分析',
      '包装盒物料不良分析', 
      '充电器物料不良分析',
      '高风险组合分析',
      '重复不良问题分析',
      '质量改善效果分析',
      '质量稳定性分析'
    ]
  },
  
  // 趋势对比规则 - Priority 50
  trend_comparison: {
    priority: 50,
    rules: [
      '工厂上线对比分析',
      '供应商上线质量分析',
      '物料上线趋势分析',
      '高不良率上线查询'
    ]
  }
};

async function optimizeRules() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔧 开始优化规则库...');
    
    // 1. 删除重复规则
    console.log('\n🗑️ 删除重复规则...');
    for (const ruleName of RULES_TO_DELETE) {
      await connection.execute(
        'DELETE FROM nlp_intent_rules WHERE intent_name = ?',
        [ruleName]
      );
      console.log(`✅ 已删除重复规则: ${ruleName}`);
    }
    
    // 2. 修复有问题的规则
    console.log('\n🔧 修复有问题的规则...');
    for (const [ruleName, fixes] of Object.entries(RULES_TO_FIX)) {
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET description = ?, action_target = ?, updated_at = NOW()
        WHERE intent_name = ?
      `, [fixes.description, fixes.action_target, ruleName]);
      console.log(`✅ 已修复规则: ${ruleName}`);
    }
    
    // 3. 重新分类和排序规则
    console.log('\n📋 重新分类和排序规则...');
    
    for (const [categoryName, categoryInfo] of Object.entries(NEW_RULE_CATEGORIES)) {
      console.log(`\n处理分类: ${categoryName} (Priority ${categoryInfo.priority})`);
      
      for (const ruleName of categoryInfo.rules) {
        const result = await connection.execute(`
          UPDATE nlp_intent_rules 
          SET priority = ?, updated_at = NOW()
          WHERE intent_name = ?
        `, [categoryInfo.priority, ruleName]);
        
        if (result[0].affectedRows > 0) {
          console.log(`  ✅ ${ruleName} -> Priority ${categoryInfo.priority}`);
        } else {
          console.log(`  ⚠️ ${ruleName} 未找到`);
        }
      }
    }
    
    // 4. 验证优化结果
    console.log('\n📊 验证优化结果...');
    
    const [finalRules] = await connection.execute(`
      SELECT intent_name, priority, description
      FROM nlp_intent_rules 
      ORDER BY priority, intent_name
    `);
    
    console.log(`\n📈 优化后规则总数: ${finalRules.length}`);
    
    // 按优先级分组显示
    const groupedRules = {};
    finalRules.forEach(rule => {
      if (!groupedRules[rule.priority]) {
        groupedRules[rule.priority] = [];
      }
      groupedRules[rule.priority].push(rule);
    });
    
    Object.keys(groupedRules).sort((a, b) => a - b).forEach(priority => {
      const categoryName = getCategoryName(priority);
      console.log(`\n${categoryName} - Priority ${priority} (${groupedRules[priority].length}个规则):`);
      groupedRules[priority].forEach((rule, i) => {
        console.log(`  ${i+1}. ${rule.intent_name}`);
      });
    });
    
    // 5. 测试修复后的规则
    console.log('\n🧪 测试修复后的规则...');
    
    const fixedRule = RULES_TO_FIX['物料上线信息查询'];
    if (fixedRule) {
      try {
        const [results] = await connection.execute(fixedRule.action_target);
        console.log(`✅ 物料上线信息查询修复成功: 返回${results.length}条记录`);
        if (results.length > 0) {
          console.log(`   字段: ${Object.keys(results[0]).join(', ')}`);
        }
      } catch (error) {
        console.log(`❌ 物料上线信息查询修复失败: ${error.message}`);
      }
    }
    
    console.log('\n✅ 规则库优化完成！');
    
  } catch (error) {
    console.error('❌ 优化过程中出现错误:', error);
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
    default: return '其他规则';
  }
}

optimizeRules();
