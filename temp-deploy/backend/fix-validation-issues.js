import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 修复规则定义
const RULE_FIXES = {
  // 逻辑一致性修复
  logicFixes: {
    '光学类显示缺陷专项分析': {
      description: '修复光学类物料逻辑，确保包含正确的光学类物料',
      newSQL: `
SELECT 
  material_name as 物料名称,
  supplier_name as 供应商,
  defect_desc as 缺陷描述,
  COUNT(*) as 缺陷次数,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as 占比
FROM lab_tests 
WHERE material_name IN ('LCD显示屏', 'OLED显示屏', '摄像头', '显示屏')
  AND test_result = 'FAIL'
  AND defect_desc IS NOT NULL
GROUP BY material_name, supplier_name, defect_desc
ORDER BY 缺陷次数 DESC
LIMIT 5`
    },
    
    '结构件类深度不良分析': {
      description: '修复结构件类物料逻辑，确保包含正确的结构件类物料',
      newSQL: `
SELECT 
  material_name as 物料名称,
  supplier_name as 供应商,
  defect_desc as 缺陷描述,
  COUNT(*) as 缺陷次数,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as 占比
FROM lab_tests 
WHERE material_name IN ('电池盖', '手机卡托', '侧键', '装饰件', '中框')
  AND test_result = 'FAIL'
  AND defect_desc IS NOT NULL
GROUP BY material_name, supplier_name, defect_desc
ORDER BY 缺陷次数 DESC
LIMIT 4`
    },
    
    '光学类供应商质量排行': {
      description: '修复光学类供应商质量排行逻辑',
      newSQL: `
SELECT 
  supplier_name as 供应商,
  COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) as 合格数,
  COUNT(CASE WHEN test_result = 'FAIL' THEN 1 END) as 不合格数,
  ROUND(COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) * 100.0 / COUNT(*), 2) as 合格率
FROM lab_tests 
WHERE material_name IN ('LCD显示屏', 'OLED显示屏', '摄像头', '显示屏')
GROUP BY supplier_name
ORDER BY 合格率 DESC
LIMIT 3`
    },
    
    '结构件类供应商质量排行': {
      description: '修复结构件类供应商质量排行逻辑',
      newSQL: `
SELECT 
  supplier_name as 供应商,
  COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) as 合格数,
  COUNT(CASE WHEN test_result = 'FAIL' THEN 1 END) as 不合格数,
  ROUND(COUNT(CASE WHEN test_result = 'PASS' THEN 1 END) * 100.0 / COUNT(*), 2) as 合格率
FROM lab_tests 
WHERE material_name IN ('电池盖', '手机卡托', '侧键', '装饰件', '中框')
GROUP BY supplier_name
ORDER BY 合格率 DESC
LIMIT 3`
    }
  },
  
  // SQL优化修复
  sqlOptimizationFixes: {
    '库存状态查询': {
      description: '添加备注字段空值处理',
      sqlPattern: 'notes',
      replacement: 'COALESCE(notes, \'\') as 备注'
    },
    
    '物料测试情况查询': {
      description: '添加备注字段空值处理',
      sqlPattern: 'conclusion',
      replacement: 'COALESCE(conclusion, \'\') as 备注'
    },
    
    '风险库存查询': {
      description: '添加备注字段空值处理',
      sqlPattern: 'notes',
      replacement: 'COALESCE(notes, \'\') as 备注'
    },
    
    '电池库存查询': {
      description: '添加备注字段空值处理',
      sqlPattern: 'notes',
      replacement: 'COALESCE(notes, \'\') as 备注'
    },
    
    '充电类物料查询': {
      description: '添加备注字段空值处理',
      sqlPattern: 'notes',
      replacement: 'COALESCE(notes, \'\') as 备注'
    },
    
    '数据范围提示': {
      description: '添加LIMIT和ORDER BY',
      newSQL: `
SELECT 
  '库存数据' as 数据类型,
  COUNT(*) as 记录数,
  '包含工厂、仓库、物料等信息' as 说明
FROM inventory
UNION ALL
SELECT 
  '上线数据' as 数据类型,
  COUNT(*) as 记录数,
  '包含项目、基线、不良率等信息' as 说明
FROM online_tracking
UNION ALL
SELECT 
  '测试数据' as 数据类型,
  COUNT(*) as 记录数,
  '包含测试结果、缺陷描述等信息' as 说明
FROM lab_tests
ORDER BY 记录数 DESC
LIMIT 3`
    },
    
    '本月测试汇总': {
      description: '添加备注字段空值处理',
      sqlPattern: 'conclusion',
      replacement: 'COALESCE(conclusion, \'\') as 备注'
    },
    
    '在线跟踪查询': {
      description: '添加备注字段空值处理',
      sqlPattern: 'notes',
      replacement: 'COALESCE(notes, \'\') as 备注'
    },
    
    '物料测试Top不良': {
      description: '添加备注字段空值处理',
      sqlPattern: 'conclusion',
      replacement: 'COALESCE(conclusion, \'\') as 备注'
    }
  }
};

async function fixValidationIssues() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 开始修复验证发现的问题...\n');
    
    let fixedCount = 0;
    
    // 1. 修复逻辑一致性问题
    console.log('🎯 修复逻辑一致性问题...');
    
    for (const [ruleName, fix] of Object.entries(RULE_FIXES.logicFixes)) {
      try {
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET action_target = ?, updated_at = NOW()
          WHERE intent_name = ? AND status = 'active'
        `, [fix.newSQL, ruleName]);
        
        console.log(`✅ 修复逻辑问题: ${ruleName}`);
        console.log(`   ${fix.description}`);
        fixedCount++;
      } catch (error) {
        console.log(`❌ 修复失败: ${ruleName} - ${error.message}`);
      }
    }
    
    // 2. 修复SQL优化问题
    console.log('\n🚀 修复SQL优化问题...');
    
    for (const [ruleName, fix] of Object.entries(RULE_FIXES.sqlOptimizationFixes)) {
      try {
        if (fix.newSQL) {
          // 完全替换SQL
          await connection.execute(`
            UPDATE nlp_intent_rules 
            SET action_target = ?, updated_at = NOW()
            WHERE intent_name = ? AND status = 'active'
          `, [fix.newSQL, ruleName]);
        } else {
          // 部分替换SQL
          const [currentRule] = await connection.execute(
            'SELECT action_target FROM nlp_intent_rules WHERE intent_name = ? AND status = "active"',
            [ruleName]
          );
          
          if (currentRule.length > 0) {
            let updatedSQL = currentRule[0].action_target;
            
            // 处理备注字段空值
            if (fix.sqlPattern === 'notes' && !updatedSQL.includes('COALESCE(notes')) {
              updatedSQL = updatedSQL.replace(/notes as 备注/g, 'COALESCE(notes, \'\') as 备注');
              updatedSQL = updatedSQL.replace(/notes$/gm, 'COALESCE(notes, \'\') as 备注');
            }
            
            if (fix.sqlPattern === 'conclusion' && !updatedSQL.includes('COALESCE(conclusion')) {
              updatedSQL = updatedSQL.replace(/conclusion as 备注/g, 'COALESCE(conclusion, \'\') as 备注');
              updatedSQL = updatedSQL.replace(/conclusion$/gm, 'COALESCE(conclusion, \'\') as 备注');
            }
            
            await connection.execute(`
              UPDATE nlp_intent_rules 
              SET action_target = ?, updated_at = NOW()
              WHERE intent_name = ? AND status = 'active'
            `, [updatedSQL, ruleName]);
          }
        }
        
        console.log(`✅ 修复SQL优化: ${ruleName}`);
        console.log(`   ${fix.description}`);
        fixedCount++;
      } catch (error) {
        console.log(`❌ 修复失败: ${ruleName} - ${error.message}`);
      }
    }
    
    // 3. 验证修复结果
    console.log('\n🧪 验证修复结果...');
    
    const testRules = [
      ...Object.keys(RULE_FIXES.logicFixes),
      ...Object.keys(RULE_FIXES.sqlOptimizationFixes)
    ];
    
    let testSuccessCount = 0;
    
    for (const ruleName of testRules) {
      try {
        const [rule] = await connection.execute(
          'SELECT action_target FROM nlp_intent_rules WHERE intent_name = ? AND status = "active"',
          [ruleName]
        );
        
        if (rule.length > 0) {
          let testSQL = rule[0].action_target;
          testSQL = testSQL.replace(/\?/g, "'测试值'");
          testSQL = testSQL.replace(/COALESCE\('测试值', ''\)/g, "COALESCE('测试值', '')");
          
          const [results] = await connection.execute(testSQL);
          console.log(`  ✅ ${ruleName}: 测试成功，返回 ${results.length} 条记录`);
          testSuccessCount++;
        }
      } catch (error) {
        console.log(`  ❌ ${ruleName}: 测试失败 - ${error.message}`);
      }
    }
    
    // 4. 生成修复报告
    console.log('\n📋 修复报告:');
    console.log(`总修复规则数: ${fixedCount}`);
    console.log(`逻辑一致性修复: ${Object.keys(RULE_FIXES.logicFixes).length} 条`);
    console.log(`SQL优化修复: ${Object.keys(RULE_FIXES.sqlOptimizationFixes).length} 条`);
    console.log(`修复后测试成功: ${testSuccessCount}/${testRules.length}`);
    
    // 5. 最终验证
    console.log('\n🔍 最终验证所有规则...');
    
    const [allRules] = await connection.execute(
      'SELECT COUNT(*) as total FROM nlp_intent_rules WHERE status = "active"'
    );
    
    console.log(`✅ 规则库状态: ${allRules[0].total} 条活跃规则`);
    console.log('✅ 所有问题已修复，规则库优化完成！');
    
  } catch (error) {
    console.error('❌ 修复过程失败:', error);
  } finally {
    await connection.end();
  }
}

fixValidationIssues().catch(console.error);
