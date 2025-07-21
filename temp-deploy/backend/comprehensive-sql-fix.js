import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 基于实际表结构的完全重写SQL
const COMPLETE_SQL_REWRITES = {
  // 基础查询类
  '供应商库存查询': `
    SELECT 
      storage_location as 工厂,
      material_type as 物料类型,
      supplier_name as 供应商,
      SUM(quantity) as 总数量,
      status as 状态,
      COUNT(*) as 批次数量
    FROM inventory 
    WHERE supplier_name LIKE CONCAT('%', ?, '%')
    GROUP BY supplier_name, material_type, status
    ORDER BY 总数量 DESC 
    LIMIT 10
  `,
  
  '供应商测试情况查询': `
    SELECT 
      supplier_name as 供应商,
      COUNT(*) as 测试总数,
      SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) as 通过数量,
      ROUND(SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 通过率,
      COUNT(DISTINCT material_name) as 物料种类
    FROM lab_tests 
    WHERE supplier_name LIKE CONCAT('%', ?, '%')
    GROUP BY supplier_name
    ORDER BY 通过率 DESC 
    LIMIT 10
  `,
  
  '供应商上线情况查询': `
    SELECT 
      supplier_name as 供应商,
      COUNT(*) as 上线次数,
      AVG(defect_rate) as 平均不良率,
      SUM(exception_count) as 总异常次数,
      COUNT(DISTINCT material_name) as 物料种类
    FROM online_tracking 
    WHERE supplier_name LIKE CONCAT('%', ?, '%')
    GROUP BY supplier_name
    ORDER BY 平均不良率 ASC 
    LIMIT 10
  `,
  
  '物料库存查询': `
    SELECT 
      material_name as 物料名称,
      material_type as 物料类型,
      supplier_name as 供应商,
      SUM(quantity) as 总数量,
      COUNT(*) as 批次数量,
      status as 状态
    FROM inventory 
    WHERE material_name LIKE CONCAT('%', ?, '%')
    GROUP BY material_name, supplier_name, status
    ORDER BY 总数量 DESC 
    LIMIT 10
  `,
  
  '物料上线情况查询': `
    SELECT 
      material_name as 物料名称,
      supplier_name as 供应商,
      COUNT(*) as 上线次数,
      AVG(defect_rate) as 平均不良率,
      SUM(exception_count) as 总异常次数
    FROM online_tracking 
    WHERE material_name LIKE CONCAT('%', ?, '%')
    GROUP BY material_name, supplier_name
    ORDER BY 平均不良率 ASC 
    LIMIT 10
  `,
  
  '物料测试情况查询': `
    SELECT 
      material_name as 物料名称,
      supplier_name as 供应商,
      COUNT(*) as 测试总数,
      SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) as 通过数量,
      ROUND(SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 通过率
    FROM lab_tests 
    WHERE material_name LIKE CONCAT('%', ?, '%')
    GROUP BY material_name, supplier_name
    ORDER BY 通过率 DESC 
    LIMIT 10
  `,
  
  '批次库存信息查询': `
    SELECT 
      batch_code as 批次号,
      material_name as 物料名称,
      supplier_name as 供应商,
      quantity as 数量,
      status as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间
    FROM inventory 
    WHERE batch_code = ?
    ORDER BY inbound_time DESC 
    LIMIT 10
  `,
  
  '批次上线情况查询': `
    SELECT 
      batch_code as 批次号,
      material_name as 物料名称,
      supplier_name as 供应商,
      factory as 工厂,
      line as 生产线,
      DATE_FORMAT(online_date, '%Y-%m-%d') as 上线日期,
      defect_rate as 不良率,
      exception_count as 异常次数
    FROM online_tracking 
    WHERE batch_code = ?
    ORDER BY online_date DESC 
    LIMIT 10
  `,
  
  '批次测试情况查询': `
    SELECT 
      batch_code as 批次号,
      test_id as 测试编号,
      material_name as 物料名称,
      supplier_name as 供应商,
      test_result as 测试结果,
      DATE_FORMAT(test_date, '%Y-%m-%d') as 测试日期,
      defect_desc as 不合格描述
    FROM lab_tests 
    WHERE batch_code = ?
    ORDER BY test_date DESC 
    LIMIT 10
  `,
  
  '测试NG情况查询': `
    SELECT 
      test_id as 测试编号,
      DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
      material_name as 物料名称,
      supplier_name as 供应商,
      test_result as 测试结果,
      defect_desc as 不合格描述
    FROM lab_tests 
    WHERE test_result = 'NG'
    ORDER BY test_date DESC 
    LIMIT 10
  `,
  
  '项目测试情况查询': `
    SELECT 
      project_id as 项目,
      COUNT(*) as 测试总数,
      SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) as 通过数量,
      ROUND(SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 通过率,
      COUNT(DISTINCT material_name) as 物料种类
    FROM lab_tests 
    WHERE project_id LIKE CONCAT('%', ?, '%')
    GROUP BY project_id
    ORDER BY 通过率 DESC 
    LIMIT 10
  `,
  
  '基线测试情况查询': `
    SELECT 
      baseline_id as 基线,
      COUNT(*) as 测试总数,
      SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) as 通过数量,
      ROUND(SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 通过率,
      COUNT(DISTINCT material_name) as 物料种类
    FROM lab_tests 
    WHERE baseline_id LIKE CONCAT('%', ?, '%')
    GROUP BY baseline_id
    ORDER BY 通过率 DESC 
    LIMIT 10
  `,
  
  '基线物料不良查询': `
    SELECT 
      baseline_id as 基线,
      material_name as 物料名称,
      COUNT(*) as 不良次数,
      defect_desc as 主要不良描述
    FROM lab_tests 
    WHERE baseline_id LIKE CONCAT('%', ?, '%') AND test_result = 'NG'
    GROUP BY baseline_id, material_name, defect_desc
    ORDER BY 不良次数 DESC 
    LIMIT 10
  `,
  
  '本月测试汇总': `
    SELECT 
      DATE_FORMAT(test_date, '%Y-%m') as 月份,
      COUNT(*) as 测试总数,
      SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) as 通过数量,
      ROUND(SUM(CASE WHEN test_result = 'OK' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 通过率,
      COUNT(DISTINCT material_name) as 物料种类,
      COUNT(DISTINCT supplier_name) as 供应商数量
    FROM lab_tests 
    WHERE test_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    GROUP BY DATE_FORMAT(test_date, '%Y-%m')
    ORDER BY 月份 DESC 
    LIMIT 10
  `,
  
  // 综合查询类
  '在线跟踪查询': `
    SELECT 
      material_name as 物料名称,
      supplier_name as 供应商,
      factory as 工厂,
      line as 生产线,
      DATE_FORMAT(online_date, '%Y-%m-%d') as 上线日期,
      defect_rate as 不良率,
      exception_count as 异常次数
    FROM online_tracking 
    WHERE material_name LIKE CONCAT('%', ?, '%')
    ORDER BY online_date DESC 
    LIMIT 10
  `,
  
  '供应商物料查询': `
    SELECT 
      supplier_name as 供应商,
      material_name as 物料名称,
      material_type as 物料类型,
      SUM(quantity) as 总数量,
      COUNT(*) as 批次数量
    FROM inventory 
    WHERE supplier_name LIKE CONCAT('%', ?, '%')
    GROUP BY supplier_name, material_name, material_type
    ORDER BY 总数量 DESC 
    LIMIT 10
  `,
  
  // 对比分析类
  '供应商对比分析': `
    SELECT 
      supplier_name as 供应商,
      COUNT(*) as 测试数量,
      ROUND(AVG(CASE WHEN test_result = 'OK' THEN 100 ELSE 0 END), 2) as 测试通过率,
      COUNT(DISTINCT material_name) as 物料种类
    FROM lab_tests 
    WHERE supplier_name IN (?, ?)
    GROUP BY supplier_name
    ORDER BY 测试通过率 DESC
  `,
  
  '物料对比分析': `
    SELECT 
      material_name as 物料名称,
      COUNT(*) as 测试数量,
      ROUND(AVG(CASE WHEN test_result = 'OK' THEN 100 ELSE 0 END), 2) as 测试通过率,
      COUNT(DISTINCT supplier_name) as 供应商数量
    FROM lab_tests 
    WHERE material_name IN (?, ?)
    GROUP BY material_name
    ORDER BY 测试通过率 DESC
  `,
  
  // 进阶查询类
  '批次信息查询': `
    SELECT 
      i.batch_code as 批次号,
      i.material_name as 物料名称,
      i.supplier_name as 供应商,
      i.quantity as 库存数量,
      i.status as 库存状态,
      COALESCE(COUNT(l.test_id), 0) as 测试次数,
      COALESCE(AVG(CASE WHEN l.test_result = 'OK' THEN 100 ELSE 0 END), 0) as 测试通过率
    FROM inventory i
    LEFT JOIN lab_tests l ON i.batch_code = l.batch_code
    WHERE i.batch_code = ?
    GROUP BY i.batch_code, i.material_name, i.supplier_name, i.quantity, i.status
    LIMIT 10
  `,
  
  '物料上线Top不良': `
    SELECT 
      material_name as 物料名称,
      supplier_name as 供应商,
      COUNT(*) as 上线次数,
      AVG(defect_rate) as 平均不良率,
      SUM(exception_count) as 总异常次数
    FROM online_tracking 
    GROUP BY material_name, supplier_name
    HAVING COUNT(*) >= 3
    ORDER BY 平均不良率 DESC 
    LIMIT 10
  `,
  
  '物料测试Top不良': `
    SELECT 
      material_name as 物料名称,
      supplier_name as 供应商,
      COUNT(*) as 测试总数,
      SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) as 不良数量,
      ROUND(SUM(CASE WHEN test_result = 'NG' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as 不良率
    FROM lab_tests 
    GROUP BY material_name, supplier_name
    HAVING COUNT(*) >= 5
    ORDER BY 不良率 DESC 
    LIMIT 10
  `
};

async function comprehensiveSQLFix() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 开始全面SQL修复...\n');
    
    let fixedCount = 0;
    let totalRules = Object.keys(COMPLETE_SQL_REWRITES).length;
    
    for (const [ruleName, newSQL] of Object.entries(COMPLETE_SQL_REWRITES)) {
      console.log(`🔧 重写规则: ${ruleName}`);
      
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
        
        console.log('   ✅ SQL已重写');
        fixedCount++;
      } else {
        console.log('   ❌ 规则未找到');
      }
      console.log('');
    }
    
    console.log(`📊 修复完成: ${fixedCount}/${totalRules} 条规则已修复\n`);
    
    // 验证修复效果
    const validationResult = await validateFixedRules(connection);
    
    return validationResult;
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
    return null;
  } finally {
    await connection.end();
  }
}

// 验证修复后的规则
async function validateFixedRules(connection) {
  console.log('🔍 验证修复后的规则...\n');
  
  const [rules] = await connection.execute(`
    SELECT intent_name, action_target 
    FROM nlp_intent_rules 
    WHERE action_target IS NOT NULL
    ORDER BY intent_name
  `);
  
  let passCount = 0;
  let failCount = 0;
  const results = [];
  
  for (const rule of rules) {
    try {
      let sql = rule.action_target.trim();
      
      // 为测试添加参数占位符的默认值
      const testSQL = sql.replace(/\?/g, "'test'");
      
      // 如果没有LIMIT，添加LIMIT 1
      if (!testSQL.toUpperCase().includes('LIMIT')) {
        testSQL += ' LIMIT 1';
      }
      
      await connection.execute(testSQL);
      console.log(`✅ ${rule.intent_name}: SQL执行成功`);
      results.push({ name: rule.intent_name, status: 'success' });
      passCount++;
    } catch (error) {
      console.log(`❌ ${rule.intent_name}: ${error.message.substring(0, 100)}...`);
      results.push({ 
        name: rule.intent_name, 
        status: 'failed', 
        error: error.message 
      });
      failCount++;
    }
  }
  
  console.log(`\n📊 最终验证结果:`);
  console.log(`  ✅ 通过: ${passCount}条`);
  console.log(`  ❌ 失败: ${failCount}条`);
  console.log(`  成功率: ${((passCount / rules.length) * 100).toFixed(1)}%`);
  
  const successRate = (passCount / rules.length) * 100;
  
  if (successRate >= 95) {
    console.log('\n🎉 优秀！规则库质量极高，可以投入生产使用！');
  } else if (successRate >= 85) {
    console.log('\n👍 良好！规则库质量较高，大部分功能可用！');
  } else if (successRate >= 70) {
    console.log('\n⚠️  一般！规则库需要进一步优化！');
  } else {
    console.log('\n❌ 较差！规则库需要大幅改进！');
  }
  
  return {
    total: rules.length,
    passed: passCount,
    failed: failCount,
    successRate: successRate,
    results: results
  };
}

comprehensiveSQLFix();
