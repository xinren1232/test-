import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 需要修复的规则和对应的修复方案
const SQL_FIXES = {
  '供应商上线情况查询': {
    issue: "Unknown column '平均不良率'",
    fix: (sql) => sql.replace(/ORDER BY 平均不良率/gi, 'ORDER BY defect_rate')
  },
  '测试NG情况查询': {
    issue: "Unknown column 'project'",
    fix: (sql) => sql.replace(/project as 项目/gi, 'project_id as 项目')
  }
};

// 通信包错误的规则 - 需要重新编写SQL
const MALFORMED_PACKET_RULES = [
  '供应商库存查询',
  '供应商测试情况查询', 
  '批次上线情况查询',
  '批次库存信息查询',
  '批次测试情况查询',
  '物料上线情况查询',
  '物料库存查询',
  '供应商对比分析',
  '物料对比分析'
];

// 重新编写的SQL模板
const NEW_SQL_TEMPLATES = {
  '供应商库存查询': `
    SELECT 
      storage_location as 工厂,
      storage_location as 仓库,
      material_type as 物料类型,
      supplier_name as 供应商名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
      notes as 备注
    FROM inventory 
    WHERE supplier_name LIKE CONCAT('%', COALESCE(?, ''), '%')
    ORDER BY inbound_time DESC 
    LIMIT 10
  `,
  
  '供应商测试情况查询': `
    SELECT 
      test_id as 测试编号,
      DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
      material_name as 物料名称,
      supplier_name as 供应商,
      test_result as 测试结果,
      defect_desc as 不合格描述,
      conclusion as 备注
    FROM lab_tests 
    WHERE supplier_name LIKE CONCAT('%', COALESCE(?, ''), '%')
    ORDER BY test_date DESC 
    LIMIT 10
  `,
  
  '批次上线情况查询': `
    SELECT 
      material_name as 物料名称,
      supplier_name as 供应商,
      batch_code as 批次号,
      factory as 工厂,
      workshop as 车间,
      line as 生产线,
      DATE_FORMAT(online_date, '%Y-%m-%d') as 上线日期,
      CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
      exception_count as 异常次数
    FROM online_tracking 
    WHERE batch_code = COALESCE(?, '')
    ORDER BY online_date DESC 
    LIMIT 10
  `,
  
  '批次库存信息查询': `
    SELECT 
      material_name as 物料名称,
      material_type as 物料类型,
      supplier_name as 供应商,
      batch_code as 批次号,
      quantity as 数量,
      storage_location as 存储位置,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
      notes as 备注
    FROM inventory 
    WHERE batch_code = COALESCE(?, '')
    ORDER BY inbound_time DESC 
    LIMIT 10
  `,
  
  '批次测试情况查询': `
    SELECT 
      test_id as 测试编号,
      material_name as 物料名称,
      supplier_name as 供应商,
      batch_code as 批次号,
      DATE_FORMAT(test_date, '%Y-%m-%d') as 测试日期,
      test_result as 测试结果,
      defect_desc as 不合格描述,
      conclusion as 备注
    FROM lab_tests 
    WHERE batch_code = COALESCE(?, '')
    ORDER BY test_date DESC 
    LIMIT 10
  `,
  
  '物料上线情况查询': `
    SELECT 
      material_name as 物料名称,
      supplier_name as 供应商,
      factory as 工厂,
      workshop as 车间,
      line as 生产线,
      DATE_FORMAT(online_date, '%Y-%m-%d') as 上线日期,
      CONCAT(ROUND(defect_rate * 100, 2), '%') as 不良率,
      exception_count as 异常次数
    FROM online_tracking 
    WHERE material_name LIKE CONCAT('%', COALESCE(?, ''), '%')
    ORDER BY online_date DESC 
    LIMIT 10
  `,
  
  '物料库存查询': `
    SELECT 
      material_name as 物料名称,
      material_type as 物料类型,
      supplier_name as 供应商,
      quantity as 数量,
      storage_location as 存储位置,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
      notes as 备注
    FROM inventory 
    WHERE material_name LIKE CONCAT('%', COALESCE(?, ''), '%')
    ORDER BY inbound_time DESC 
    LIMIT 10
  `,
  
  '供应商对比分析': `
    SELECT 
      supplier_name as 供应商,
      COUNT(*) as 库存数量,
      AVG(CASE WHEN status = '正常' THEN 1 ELSE 0 END) * 100 as 库存合格率,
      '库存数据' as 数据来源
    FROM inventory 
    WHERE supplier_name IN (COALESCE(?, ''), COALESCE(?, ''))
    GROUP BY supplier_name
    UNION ALL
    SELECT 
      supplier_name as 供应商,
      COUNT(*) as 测试数量,
      AVG(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) * 100 as 测试通过率,
      '测试数据' as 数据来源
    FROM lab_tests 
    WHERE supplier_name IN (COALESCE(?, ''), COALESCE(?, ''))
    GROUP BY supplier_name
    ORDER BY 数据来源, 供应商
  `,
  
  '物料对比分析': `
    SELECT 
      material_name as 物料名称,
      COUNT(*) as 库存数量,
      AVG(CASE WHEN status = '正常' THEN 1 ELSE 0 END) * 100 as 库存合格率,
      '库存数据' as 数据来源
    FROM inventory 
    WHERE material_name IN (COALESCE(?, ''), COALESCE(?, ''))
    GROUP BY material_name
    UNION ALL
    SELECT 
      material_name as 物料名称,
      COUNT(*) as 测试数量,
      AVG(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) * 100 as 测试通过率,
      '测试数据' as 数据来源
    FROM lab_tests 
    WHERE material_name IN (COALESCE(?, ''), COALESCE(?, ''))
    GROUP BY material_name
    ORDER BY 数据来源, 物料名称
  `
};

async function fixRemainingSQLIssues() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 修复剩余的SQL问题...\n');
    
    let fixedCount = 0;
    let totalIssues = Object.keys(SQL_FIXES).length + MALFORMED_PACKET_RULES.length;
    
    // 修复字段错误的规则
    for (const [ruleName, fixInfo] of Object.entries(SQL_FIXES)) {
      console.log(`🔧 修复规则: ${ruleName}`);
      console.log(`   问题: ${fixInfo.issue}`);
      
      const [rules] = await connection.execute(
        'SELECT id, action_target FROM nlp_intent_rules WHERE intent_name = ?',
        [ruleName]
      );
      
      if (rules.length > 0) {
        const rule = rules[0];
        const fixedSQL = fixInfo.fix(rule.action_target);
        
        await connection.execute(
          'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE id = ?',
          [fixedSQL, rule.id]
        );
        
        console.log('   ✅ 已修复');
        fixedCount++;
      } else {
        console.log('   ❌ 规则未找到');
      }
      console.log('');
    }
    
    // 修复通信包错误的规则
    for (const ruleName of MALFORMED_PACKET_RULES) {
      console.log(`🔧 重写规则: ${ruleName}`);
      console.log('   问题: Malformed communication packet');
      
      const [rules] = await connection.execute(
        'SELECT id FROM nlp_intent_rules WHERE intent_name = ?',
        [ruleName]
      );
      
      if (rules.length > 0 && NEW_SQL_TEMPLATES[ruleName]) {
        const rule = rules[0];
        const newSQL = NEW_SQL_TEMPLATES[ruleName].trim();
        
        await connection.execute(
          'UPDATE nlp_intent_rules SET action_target = ?, updated_at = NOW() WHERE id = ?',
          [newSQL, rule.id]
        );
        
        console.log('   ✅ 已重写SQL');
        fixedCount++;
      } else {
        console.log('   ❌ 规则未找到或无模板');
      }
      console.log('');
    }
    
    console.log(`📊 修复完成: ${fixedCount}/${totalIssues} 条规则已修复\n`);
    
    // 验证修复效果
    await validateAllRules(connection);
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    await connection.end();
  }
}

// 验证所有规则
async function validateAllRules(connection) {
  console.log('🔍 验证所有规则...\n');
  
  const [rules] = await connection.execute(`
    SELECT intent_name, action_target 
    FROM nlp_intent_rules 
    WHERE action_target IS NOT NULL
    ORDER BY intent_name
  `);
  
  let passCount = 0;
  let failCount = 0;
  const failedRules = [];
  
  for (const rule of rules) {
    try {
      let sql = rule.action_target.trim();
      
      // 如果SQL没有LIMIT，添加LIMIT 1进行测试
      if (!sql.toUpperCase().includes('LIMIT')) {
        sql += ' LIMIT 1';
      }
      
      await connection.execute(sql);
      console.log(`✅ ${rule.intent_name}: SQL执行成功`);
      passCount++;
    } catch (error) {
      console.log(`❌ ${rule.intent_name}: ${error.message}`);
      failedRules.push({
        name: rule.intent_name,
        error: error.message
      });
      failCount++;
    }
  }
  
  console.log(`\n📊 最终验证结果:`);
  console.log(`  ✅ 通过: ${passCount}条`);
  console.log(`  ❌ 失败: ${failCount}条`);
  console.log(`  成功率: ${((passCount / rules.length) * 100).toFixed(1)}%`);
  
  if (failCount === 0) {
    console.log('\n🎉 所有规则SQL执行成功！规则库修复完成！');
  } else {
    console.log('\n⚠️  仍有规则需要进一步修复:');
    failedRules.forEach(rule => {
      console.log(`  - ${rule.name}: ${rule.error}`);
    });
  }
  
  return { passCount, failCount, total: rules.length };
}

fixRemainingSQLIssues();
