import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 基于实际数据库字段和前端页面的正确SQL模板
const CORRECTED_SQL_TEMPLATES = {
  // 修复GROUP BY错误的规则
  '供应商库存查询': `
    SELECT 
      storage_location as 工厂,
      storage_location as 仓库,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
      DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
      notes as 备注
    FROM inventory 
    WHERE supplier_name LIKE CONCAT('%', ?, '%')
    ORDER BY inbound_time DESC 
    LIMIT 10
  `,
  
  '物料库存查询': `
    SELECT 
      storage_location as 工厂,
      storage_location as 仓库,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
      DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
      notes as 备注
    FROM inventory 
    WHERE material_name LIKE CONCAT('%', ?, '%')
    ORDER BY inbound_time DESC 
    LIMIT 10
  `,
  
  // 修复字段不存在错误的规则
  '项目物料不良查询': `
    SELECT 
      factory as 工厂,
      project as 项目,
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      batch_code as 批次号,
      CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
      exception_count as 本周异常,
      DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期
    FROM online_tracking 
    WHERE project LIKE CONCAT('%', ?, '%') AND defect_rate > 0
    ORDER BY defect_rate DESC 
    LIMIT 10
  `,
  
  // 修复专项分析类规则 - 基于实际字段重写
  '供应商质量评级': `
    SELECT 
      supplier_name as 供应商,
      COUNT(*) as 测试总数,
      SUM(CASE WHEN test_result = 'PASS' THEN 1 ELSE 0 END) as 通过数量,
      ROUND(SUM(CASE WHEN test_result = 'PASS' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 通过率,
      CASE 
        WHEN ROUND(SUM(CASE WHEN test_result = 'PASS' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) >= 95 THEN 'A级'
        WHEN ROUND(SUM(CASE WHEN test_result = 'PASS' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) >= 90 THEN 'B级'
        WHEN ROUND(SUM(CASE WHEN test_result = 'PASS' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) >= 80 THEN 'C级'
        ELSE 'D级'
      END as 质量等级
    FROM lab_tests 
    GROUP BY supplier_name
    HAVING COUNT(*) >= 5
    ORDER BY 通过率 DESC 
    LIMIT 10
  `,
  
  '光学类显示缺陷专项分析': `
    SELECT 
      material_name as 物料名称,
      supplier_name as 供应商,
      COUNT(*) as 测试总数,
      SUM(CASE WHEN test_result = 'FAIL' THEN 1 ELSE 0 END) as 不良数量,
      ROUND(SUM(CASE WHEN test_result = 'FAIL' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 不良率,
      defect_desc as 主要不良描述
    FROM lab_tests 
    WHERE material_name LIKE '%显示%' OR material_name LIKE '%屏%' OR material_name LIKE '%OLED%'
    GROUP BY material_name, supplier_name, defect_desc
    HAVING COUNT(*) >= 3
    ORDER BY 不良率 DESC 
    LIMIT 10
  `,
  
  '大类别Top不良分析': `
    SELECT 
      material_type as 物料大类,
      defect_desc as 主要不良,
      COUNT(*) as 出现次数,
      ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM lab_tests WHERE test_result = 'FAIL'), 2) as 占比
    FROM lab_tests 
    WHERE test_result = 'FAIL' AND defect_desc IS NOT NULL AND defect_desc != ''
    GROUP BY material_type, defect_desc
    ORDER BY 出现次数 DESC 
    LIMIT 10
  `,
  
  '异常批次识别': `
    SELECT 
      batch_code as 批次号,
      material_name as 物料名称,
      supplier_name as 供应商,
      COUNT(*) as 测试次数,
      SUM(CASE WHEN test_result = 'FAIL' THEN 1 ELSE 0 END) as 失败次数,
      ROUND(SUM(CASE WHEN test_result = 'FAIL' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 失败率,
      GROUP_CONCAT(DISTINCT defect_desc SEPARATOR '; ') as 主要缺陷
    FROM lab_tests 
    GROUP BY batch_code, material_name, supplier_name
    HAVING COUNT(*) >= 3 AND ROUND(SUM(CASE WHEN test_result = 'FAIL' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) > 20
    ORDER BY 失败率 DESC 
    LIMIT 10
  `,
  
  '物料大类别月度质量趋势': `
    SELECT 
      material_type as 物料大类,
      DATE_FORMAT(test_date, '%Y-%m') as 月份,
      COUNT(*) as 测试次数,
      SUM(CASE WHEN test_result = 'PASS' THEN 1 ELSE 0 END) as 通过次数,
      ROUND(SUM(CASE WHEN test_result = 'PASS' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 通过率
    FROM lab_tests 
    WHERE test_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    GROUP BY material_type, DATE_FORMAT(test_date, '%Y-%m')
    ORDER BY material_type, 月份 DESC 
    LIMIT 20
  `,
  
  '物料大类别质量对比': `
    SELECT 
      material_type as 物料大类,
      COUNT(*) as 测试总次数,
      SUM(CASE WHEN test_result = 'PASS' THEN 1 ELSE 0 END) as 通过次数,
      ROUND(SUM(CASE WHEN test_result = 'PASS' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 通过率,
      COUNT(DISTINCT supplier_name) as 供应商数量,
      COUNT(DISTINCT material_name) as 物料种类
    FROM lab_tests 
    GROUP BY material_type
    HAVING COUNT(*) >= 10
    ORDER BY 通过率 DESC 
    LIMIT 10
  `,
  
  '结构件类深度不良分析': `
    SELECT 
      material_name as 物料名称,
      supplier_name as 供应商,
      defect_desc as 不良描述,
      COUNT(*) as 出现次数,
      CASE 
        WHEN defect_desc LIKE '%划伤%' OR defect_desc LIKE '%破裂%' THEN '外观缺陷'
        WHEN defect_desc LIKE '%尺寸%' OR defect_desc LIKE '%精度%' THEN '尺寸问题'
        WHEN defect_desc LIKE '%强度%' OR defect_desc LIKE '%硬度%' THEN '强度问题'
        ELSE '其他问题'
      END as 缺陷类型
    FROM lab_tests 
    WHERE (material_name LIKE '%框%' OR material_name LIKE '%壳%' OR material_name LIKE '%支架%') 
      AND test_result = 'FAIL' AND defect_desc IS NOT NULL
    GROUP BY material_name, supplier_name, defect_desc
    ORDER BY 出现次数 DESC 
    LIMIT 10
  `,
  
  '重复缺陷分析': `
    SELECT 
      defect_desc as 缺陷描述,
      COUNT(*) as 出现次数,
      COUNT(DISTINCT material_name) as 涉及物料数,
      COUNT(DISTINCT supplier_name) as 涉及供应商数,
      GROUP_CONCAT(DISTINCT material_name SEPARATOR ', ') as 主要物料,
      GROUP_CONCAT(DISTINCT supplier_name SEPARATOR ', ') as 主要供应商
    FROM lab_tests 
    WHERE test_result = 'FAIL' AND defect_desc IS NOT NULL AND defect_desc != ''
    GROUP BY defect_desc
    HAVING COUNT(*) >= 5
    ORDER BY 出现次数 DESC 
    LIMIT 10
  `,
  
  '光学类供应商质量排行': `
    SELECT 
      supplier_name as 供应商,
      COUNT(*) as 测试总数,
      SUM(CASE WHEN test_result = 'PASS' THEN 1 ELSE 0 END) as 通过数量,
      ROUND(SUM(CASE WHEN test_result = 'PASS' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 通过率,
      COUNT(DISTINCT material_name) as 物料种类,
      GROUP_CONCAT(DISTINCT defect_desc ORDER BY defect_desc SEPARATOR '; ') as 主要不良
    FROM lab_tests 
    WHERE material_name LIKE '%显示%' OR material_name LIKE '%屏%' OR material_name LIKE '%OLED%'
    GROUP BY supplier_name
    HAVING COUNT(*) >= 5
    ORDER BY 通过率 DESC 
    LIMIT 10
  `,
  
  '结构件类供应商质量排行': `
    SELECT 
      supplier_name as 供应商,
      COUNT(*) as 测试总数,
      SUM(CASE WHEN test_result = 'PASS' THEN 1 ELSE 0 END) as 通过数量,
      ROUND(SUM(CASE WHEN test_result = 'PASS' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 通过率,
      COUNT(DISTINCT material_name) as 物料种类,
      GROUP_CONCAT(DISTINCT defect_desc ORDER BY defect_desc SEPARATOR '; ') as 主要不良
    FROM lab_tests 
    WHERE material_name LIKE '%框%' OR material_name LIKE '%壳%' OR material_name LIKE '%支架%'
    GROUP BY supplier_name
    HAVING COUNT(*) >= 5
    ORDER BY 通过率 DESC 
    LIMIT 10
  `,
  
  '物料相关查询': `
    SELECT 
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
      notes as 备注,
      '库存' as 数据来源
    FROM inventory 
    WHERE material_name LIKE CONCAT('%', ?, '%')
    UNION ALL
    SELECT 
      material_code as 物料编码,
      material_name as 物料名称,
      supplier_name as 供应商,
      'N/A' as 数量,
      test_result as 状态,
      DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
      defect_desc as 备注,
      '测试' as 数据来源
    FROM lab_tests 
    WHERE material_name LIKE CONCAT('%', ?, '%')
    ORDER BY 数据来源, 日期 DESC 
    LIMIT 20
  `
};

async function fixRemainingRulesWithActualFields() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 基于实际字段修复剩余问题规则...\n');
    
    let fixedCount = 0;
    let totalRules = Object.keys(CORRECTED_SQL_TEMPLATES).length;
    
    for (const [ruleName, newSQL] of Object.entries(CORRECTED_SQL_TEMPLATES)) {
      console.log(`🔧 修复规则: ${ruleName}`);
      
      const [rules] = await connection.execute(
        'SELECT id FROM nlp_intent_rules WHERE intent_name = ?',
        [ruleName]
      );
      
      if (rules.length > 0) {
        const rule = rules[0];
        const cleanSQL = newSQL.trim();
        
        await connection.execute(
          'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE id = ?',
          [cleanSQL, rule.id]
        );
        
        console.log('   ✅ SQL已修复');
        fixedCount++;
      } else {
        console.log('   ❌ 规则未找到');
      }
      console.log('');
    }
    
    console.log(`📊 修复完成: ${fixedCount}/${totalRules} 条规则已修复\n`);
    
    // 验证修复效果
    const validationResult = await validateAllFixedRules(connection);
    
    return validationResult;
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
    return null;
  } finally {
    await connection.end();
  }
}

// 验证所有修复后的规则
async function validateAllFixedRules(connection) {
  console.log('🔍 验证所有修复后的规则...\n');
  
  const [rules] = await connection.execute(`
    SELECT intent_name, action_target, category
    FROM nlp_intent_rules 
    WHERE action_target IS NOT NULL
    ORDER BY category, intent_name
  `);
  
  let passCount = 0;
  let failCount = 0;
  const results = [];
  
  for (const rule of rules) {
    try {
      let sql = rule.action_target.trim();
      
      // 为测试替换参数占位符
      const testSQL = sql.replace(/\?/g, "'test'");
      
      // 如果没有LIMIT，添加LIMIT 1
      if (!testSQL.toUpperCase().includes('LIMIT')) {
        testSQL += ' LIMIT 1';
      }
      
      await connection.execute(testSQL);
      console.log(`✅ ${rule.intent_name} (${rule.category}): SQL执行成功`);
      results.push({ name: rule.intent_name, category: rule.category, status: 'success' });
      passCount++;
    } catch (error) {
      console.log(`❌ ${rule.intent_name} (${rule.category}): ${error.message.substring(0, 80)}...`);
      results.push({ 
        name: rule.intent_name, 
        category: rule.category,
        status: 'failed', 
        error: error.message 
      });
      failCount++;
    }
  }
  
  // 生成最终报告
  generateFinalValidationReport(passCount, failCount, rules.length, results);
  
  return {
    total: rules.length,
    passed: passCount,
    failed: failCount,
    successRate: (passCount / rules.length) * 100,
    results: results
  };
}

function generateFinalValidationReport(passCount, failCount, total, results) {
  console.log(`\n📊 最终验证结果:`);
  console.log(`  ✅ 通过: ${passCount}条`);
  console.log(`  ❌ 失败: ${failCount}条`);
  console.log(`  成功率: ${((passCount / total) * 100).toFixed(1)}%`);
  
  const successRate = (passCount / total) * 100;
  
  if (successRate >= 95) {
    console.log('\n🏆 A+级 - 优秀！规则库质量极高，可以投入生产使用！');
  } else if (successRate >= 90) {
    console.log('\n🥇 A级 - 优秀！规则库质量很高，基本可以投入使用！');
  } else if (successRate >= 85) {
    console.log('\n🥈 B+级 - 良好！规则库质量较高，大部分功能可用！');
  } else if (successRate >= 80) {
    console.log('\n🥉 B级 - 良好！规则库质量尚可，需要小幅优化！');
  } else {
    console.log('\n⚠️  需要进一步优化！');
  }
  
  // 按分类统计成功率
  const categoryStats = {};
  results.forEach(result => {
    const category = result.category || '未分类';
    if (!categoryStats[category]) {
      categoryStats[category] = { total: 0, passed: 0 };
    }
    categoryStats[category].total++;
    if (result.status === 'success') {
      categoryStats[category].passed++;
    }
  });
  
  console.log('\n📋 分类成功率:');
  Object.entries(categoryStats).forEach(([category, stats]) => {
    const rate = ((stats.passed / stats.total) * 100).toFixed(1);
    console.log(`  ${category}: ${stats.passed}/${stats.total} (${rate}%)`);
  });
  
  if (failCount > 0) {
    console.log('\n❌ 仍需修复的规则:');
    results.filter(r => r.status === 'failed').slice(0, 5).forEach(rule => {
      console.log(`  - ${rule.name} (${rule.category})`);
    });
    if (failCount > 5) {
      console.log(`  ... 还有${failCount - 5}条`);
    }
  }
}

fixRemainingRulesWithActualFields();
