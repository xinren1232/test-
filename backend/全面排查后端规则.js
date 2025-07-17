import mysql from 'mysql2/promise';

async function comprehensiveRuleAudit() {
  let connection;
  
  try {
    console.log('🔍 开始全面排查后端规则问题...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 获取所有规则
    console.log('\n📋 步骤1: 获取所有规则...');
    
    const [allRules] = await connection.execute(`
      SELECT id, intent_name, category, action_target, created_at
      FROM nlp_intent_rules 
      ORDER BY category, id
    `);
    
    console.log(`找到 ${allRules.length} 条规则`);
    
    // 按分类统计
    const categoryStats = {};
    allRules.forEach(rule => {
      if (!categoryStats[rule.category]) {
        categoryStats[rule.category] = 0;
      }
      categoryStats[rule.category]++;
    });
    
    console.log('按分类统计:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}条规则`);
    });
    
    // 2. 检查数据同步状态问题
    console.log('\n🔄 步骤2: 检查数据同步状态...');
    
    // 检查数据库表和数据
    const tables = ['inventory', 'lab_tests', 'online_tracking'];
    const tableData = {};
    
    for (const table of tables) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        tableData[table] = count[0].count;
        console.log(`   ${table}: ${tableData[table]}条记录`);
      } catch (error) {
        console.log(`   ❌ ${table}: 表不存在或查询失败`);
        tableData[table] = 0;
      }
    }
    
    const totalRecords = Object.values(tableData).reduce((sum, count) => sum + count, 0);
    console.log(`   总记录数: ${totalRecords}条`);
    
    // 3. 逐个检查规则
    console.log('\n🔍 步骤3: 逐个检查规则...');
    
    const auditResults = [];
    let processedCount = 0;
    
    for (const rule of allRules) {
      processedCount++;
      console.log(`\n[${processedCount}/${allRules.length}] 检查规则${rule.id}: ${rule.intent_name}`);
      console.log(`   分类: ${rule.category}`);
      
      const result = {
        ruleId: rule.id,
        ruleName: rule.intent_name,
        category: rule.category,
        issues: [],
        fixes: [],
        sql: rule.action_target,
        hasLimit: false,
        limitValue: null,
        hasChineseFields: false,
        fieldCount: 0,
        recordCount: 0,
        canExecute: false
      };
      
      try {
        const sql = rule.action_target;
        console.log(`   SQL: ${sql.substring(0, 100)}...`);
        
        // 检查LIMIT限制
        const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
        if (limitMatch) {
          result.hasLimit = true;
          result.limitValue = parseInt(limitMatch[1]);
          result.issues.push(`包含LIMIT ${result.limitValue}限制`);
          
          // 生成修复建议
          if (rule.category === '数据探索') {
            result.fixes.push('移除LIMIT限制，返回完整数据');
          } else {
            result.fixes.push(`调整LIMIT为合理值（如100）`);
          }
        }
        
        // 尝试执行SQL
        try {
          let testSQL = sql;
          
          // 处理参数
          if (testSQL.includes('?')) {
            // 根据分类使用不同的测试参数
            if (rule.category.includes('库存')) {
              testSQL = testSQL.replace(/\?/g, "'电池'");
            } else if (rule.category.includes('测试')) {
              testSQL = testSQL.replace(/\?/g, "'LCD'");
            } else {
              testSQL = testSQL.replace(/\?/g, "'测试'");
            }
          }
          
          const [results] = await connection.execute(testSQL);
          result.canExecute = true;
          result.recordCount = results.length;
          
          if (results.length > 0) {
            const fields = Object.keys(results[0]);
            result.fieldCount = fields.length;
            result.hasChineseFields = fields.every(field => /[\u4e00-\u9fa5]/.test(field));
            
            if (!result.hasChineseFields) {
              const nonChineseFields = fields.filter(field => !/[\u4e00-\u9fa5]/.test(field));
              result.issues.push(`包含非中文字段: ${nonChineseFields.join(', ')}`);
              result.fixes.push('为所有字段添加中文别名');
            }
            
            console.log(`   📊 执行结果: ${result.recordCount}条记录, ${result.fieldCount}个字段`);
            console.log(`   🏷️ 字段: ${fields.join(', ')}`);
            console.log(`   ${result.hasChineseFields ? '✅' : '❌'} 中文字段: ${result.hasChineseFields}`);
          } else {
            result.issues.push('无数据返回');
            if (testSQL.includes('?')) {
              result.fixes.push('检查参数处理逻辑');
            } else {
              result.fixes.push('检查数据源和查询条件');
            }
          }
          
        } catch (sqlError) {
          result.issues.push(`SQL执行失败: ${sqlError.message}`);
          result.fixes.push('修复SQL语法错误');
          console.log(`   ❌ SQL执行失败: ${sqlError.message}`);
        }
        
      } catch (error) {
        result.issues.push(`规则检查异常: ${error.message}`);
        console.log(`   ❌ 检查异常: ${error.message}`);
      }
      
      auditResults.push(result);
      
      // 显示当前规则状态
      const status = result.issues.length === 0 ? '✅ 正常' : `❌ ${result.issues.length}个问题`;
      console.log(`   状态: ${status}`);
    }
    
    // 4. 生成审计报告
    console.log('\n📊 步骤4: 生成审计报告...');
    console.log('='.repeat(80));
    
    const totalRules = auditResults.length;
    const normalRules = auditResults.filter(r => r.issues.length === 0);
    const problemRules = auditResults.filter(r => r.issues.length > 0);
    
    console.log(`\n📈 总体统计:`);
    console.log(`   总规则数: ${totalRules}`);
    console.log(`   正常规则: ${normalRules.length} (${(normalRules.length/totalRules*100).toFixed(1)}%)`);
    console.log(`   问题规则: ${problemRules.length} (${(problemRules.length/totalRules*100).toFixed(1)}%)`);
    
    // 按分类统计问题
    console.log(`\n📋 按分类统计问题:`);
    Object.keys(categoryStats).forEach(category => {
      const categoryRules = auditResults.filter(r => r.category === category);
      const categoryProblems = categoryRules.filter(r => r.issues.length > 0);
      console.log(`   ${category}: ${categoryProblems.length}/${categoryRules.length} 有问题`);
    });
    
    // 问题类型统计
    console.log(`\n🔍 问题类型统计:`);
    const issueTypes = {};
    problemRules.forEach(rule => {
      rule.issues.forEach(issue => {
        const issueType = issue.split(':')[0];
        if (!issueTypes[issueType]) {
          issueTypes[issueType] = 0;
        }
        issueTypes[issueType]++;
      });
    });
    
    Object.entries(issueTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}个规则`);
    });
    
    // LIMIT限制统计
    const limitRules = auditResults.filter(r => r.hasLimit);
    console.log(`\n⚠️ LIMIT限制统计:`);
    console.log(`   包含LIMIT的规则: ${limitRules.length}/${totalRules}`);
    
    const limitStats = {};
    limitRules.forEach(rule => {
      const limit = rule.limitValue;
      if (!limitStats[limit]) {
        limitStats[limit] = 0;
      }
      limitStats[limit]++;
    });
    
    Object.entries(limitStats).forEach(([limit, count]) => {
      console.log(`   LIMIT ${limit}: ${count}个规则`);
    });
    
    // 字段问题统计
    const fieldIssueRules = auditResults.filter(r => !r.hasChineseFields && r.canExecute);
    console.log(`\n🏷️ 字段问题统计:`);
    console.log(`   字段映射有问题的规则: ${fieldIssueRules.length}/${totalRules}`);
    
    // 5. 批量修复字段映射问题
    console.log('\n🔧 步骤5: 批量修复字段映射问题...');

    const fieldMappingFixes = {
      // 库存场景字段映射修复
      'inventory': {
        'factory': 'storage_location',
        'warehouse': 'storage_location', // 使用storage_location作为仓库
        'materialCode': 'material_code',
        'materialName': 'material_name',
        'supplierName': 'supplier_name',
        'inboundTime': 'inbound_time',
        'updatedAt': 'updated_at'
      },
      // 测试场景字段映射修复
      'lab_tests': {
        'testId': 'test_id',
        'testDate': 'test_date',
        'projectId': 'project_id',
        'baselineId': 'baseline_id',
        'materialCode': 'material_code',
        'materialName': 'material_name',
        'supplierName': 'supplier_name',
        'testResult': 'test_result',
        'defectDesc': 'defect_desc'
      }
    };

    console.log('开始批量修复字段映射...');

    let fixedCount = 0;
    const problemRulesForFix = auditResults.filter(r => r.issues.length > 0);

    for (const rule of problemRulesForFix) {
      try {
        let sql = rule.sql;
        let needsUpdate = false;

        // 根据规则分类选择修复映射
        let mappings = {};
        if (rule.category === '库存场景') {
          mappings = fieldMappingFixes.inventory;
        } else if (rule.category === '测试场景') {
          mappings = fieldMappingFixes.lab_tests;
        }

        // 应用字段映射修复
        Object.entries(mappings).forEach(([oldField, newField]) => {
          const regex = new RegExp(`\\b${oldField}\\b`, 'g');
          if (regex.test(sql)) {
            sql = sql.replace(regex, newField);
            needsUpdate = true;
          }
        });

        // 如果需要更新，执行更新
        if (needsUpdate) {
          await connection.execute(`
            UPDATE nlp_intent_rules
            SET action_target = ?, updated_at = NOW()
            WHERE id = ?
          `, [sql, rule.ruleId]);

          fixedCount++;
          console.log(`   ✅ 修复规则${rule.ruleId}: ${rule.ruleName}`);
        }

      } catch (error) {
        console.log(`   ❌ 修复规则${rule.ruleId}失败: ${error.message}`);
      }
    }

    console.log(`\n📊 批量修复结果: 修复了 ${fixedCount} 个规则`);

    console.log('\n🎉 全面排查和修复完成！');

  } catch (error) {
    console.error('❌ 全面排查后端规则失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

comprehensiveRuleAudit().catch(console.error);
