import mysql from 'mysql2/promise';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4',
  timezone: '+08:00'
};

/**
 * 全面系统检查：MySQL服务、规则库、规则逻辑、呈现结果设计
 */

async function comprehensiveSystemCheck() {
  console.log('🔍 开始全面系统检查...\n');
  
  try {
    // 1. 检查MySQL服务状态
    console.log('📋 1. 检查MySQL服务状态...');
    await checkMySQLService();
    
    // 2. 检查规则库完整性
    console.log('\n📚 2. 检查规则库完整性...');
    await checkRuleLibraryIntegrity();
    
    // 3. 检查规则逻辑设计
    console.log('\n🧠 3. 检查规则逻辑设计...');
    await checkRuleLogicDesign();
    
    // 4. 检查呈现结果设计
    console.log('\n🎨 4. 检查呈现结果设计...');
    await checkPresentationDesign();
    
    console.log('\n🎉 全面系统检查完成！');
    
  } catch (error) {
    console.error('❌ 系统检查过程中发生错误:', error);
  }
}

/**
 * 检查MySQL服务状态
 */
async function checkMySQLService() {
  console.log('🔍 检查MySQL服务运行状态...');
  
  try {
    // 检查MySQL服务进程
    const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq mysqld.exe"');
    if (stdout.includes('mysqld.exe')) {
      console.log('✅ MySQL服务进程正在运行');
    } else {
      console.log('❌ MySQL服务进程未运行');
    }
  } catch (error) {
    console.log('⚠️ 无法检查MySQL服务进程状态');
  }
  
  // 测试数据库连接
  console.log('\n🔗 测试数据库连接...');
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 检查数据库基本信息
    const [dbInfo] = await connection.execute('SELECT VERSION() as version, DATABASE() as current_db');
    console.log(`📊 MySQL版本: ${dbInfo[0].version}`);
    console.log(`📊 当前数据库: ${dbInfo[0].current_db}`);
    
    // 检查表结构
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📊 数据库表数量: ${tables.length}`);
    console.log(`📋 表列表: ${tables.map(t => Object.values(t)[0]).join(', ')}`);
    
    // 检查关键表的记录数
    const keyTables = ['nlp_intent_rules', 'inventory', 'inspection', 'production'];
    for (const table of keyTables) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`📊 ${table}表记录数: ${count[0].count}`);
      } catch (error) {
        console.log(`❌ ${table}表不存在或查询失败`);
      }
    }
    
    await connection.end();
    
  } catch (error) {
    console.log('❌ 数据库连接失败:', error.message);
    console.log('💡 可能的解决方案:');
    console.log('  1. 检查MySQL服务是否启动');
    console.log('  2. 验证用户名和密码');
    console.log('  3. 检查数据库是否存在');
    console.log('  4. 验证用户权限');
  }
}

/**
 * 检查规则库完整性
 */
async function checkRuleLibraryIntegrity() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 检查规则总数和状态分布
    const [ruleStats] = await connection.execute(`
      SELECT 
        status,
        COUNT(*) as count
      FROM nlp_intent_rules 
      GROUP BY status
    `);
    
    console.log('📊 规则状态分布:');
    ruleStats.forEach(stat => {
      console.log(`  ${stat.status}: ${stat.count}条`);
    });
    
    // 检查活跃规则的分类分布
    const [categoryStats] = await connection.execute(`
      SELECT 
        category,
        COUNT(*) as count
      FROM nlp_intent_rules 
      WHERE status = 'active'
      GROUP BY category
      ORDER BY count DESC
    `);
    
    console.log('\n📊 活跃规则分类分布:');
    categoryStats.forEach(stat => {
      console.log(`  ${stat.category}: ${stat.count}条`);
    });
    
    // 检查触发词配置
    const [triggerWordStats] = await connection.execute(`
      SELECT 
        intent_name,
        JSON_LENGTH(trigger_words) as trigger_count
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY trigger_count DESC
      LIMIT 10
    `);
    
    console.log('\n📊 触发词最多的前10个规则:');
    triggerWordStats.forEach(stat => {
      console.log(`  ${stat.intent_name}: ${stat.trigger_count}个触发词`);
    });
    
    // 检查规则完整性
    const [incompleteRules] = await connection.execute(`
      SELECT 
        intent_name,
        CASE 
          WHEN description IS NULL OR description = '' THEN 'missing_description'
          WHEN action_target IS NULL OR action_target = '' THEN 'missing_action'
          WHEN trigger_words IS NULL OR JSON_LENGTH(trigger_words) = 0 THEN 'missing_triggers'
          ELSE 'complete'
        END as issue
      FROM nlp_intent_rules 
      WHERE status = 'active'
      HAVING issue != 'complete'
    `);
    
    if (incompleteRules.length > 0) {
      console.log('\n⚠️ 不完整的规则:');
      incompleteRules.forEach(rule => {
        console.log(`  ${rule.intent_name}: ${rule.issue}`);
      });
    } else {
      console.log('\n✅ 所有活跃规则配置完整');
    }
    
    await connection.end();
    
  } catch (error) {
    console.log('❌ 规则库检查失败:', error.message);
  }
}

/**
 * 检查规则逻辑设计
 */
async function checkRuleLogicDesign() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 随机选择几个规则进行逻辑测试
    const [sampleRules] = await connection.execute(`
      SELECT 
        intent_name,
        description,
        action_target,
        category
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY RAND()
      LIMIT 5
    `);
    
    console.log('🧪 测试规则逻辑 (随机选择5个规则):');
    
    let successCount = 0;
    let totalCount = sampleRules.length;
    
    for (const rule of sampleRules) {
      console.log(`\n📋 测试规则: ${rule.intent_name} (${rule.category})`);
      console.log(`📝 描述: ${rule.description}`);
      
      try {
        const [results] = await connection.execute(rule.action_target);
        console.log(`✅ SQL执行成功: ${results.length}条记录`);
        
        if (results.length > 0) {
          const fields = Object.keys(results[0]);
          console.log(`📊 返回字段: ${fields.join(', ')}`);
          
          // 检查中文字段名
          const hasChineseFields = fields.some(field => /[\u4e00-\u9fa5]/.test(field));
          console.log(`🈳 中文字段: ${hasChineseFields ? '✅ 有' : '❌ 无'}`);
          
          // 检查数据质量
          const hasErrors = results.some(record => 
            Object.values(record).some(value => 
              typeof value === 'string' && value.includes('Function not supported')
            )
          );
          console.log(`🔍 数据质量: ${hasErrors ? '❌ 有Function not supported错误' : '✅ 无错误'}`);
          
          // 显示示例数据
          const example = results[0];
          console.log('📄 示例数据:');
          Object.entries(example).slice(0, 3).forEach(([key, value]) => {
            console.log(`  ${key}: ${value}`);
          });
          
          successCount++;
        } else {
          console.log('⚠️ 查询无结果');
        }
        
      } catch (error) {
        console.log(`❌ SQL执行失败: ${error.message.substring(0, 100)}...`);
      }
    }
    
    console.log(`\n📊 规则逻辑测试结果: ${successCount}/${totalCount} 成功 (${Math.round(successCount/totalCount*100)}%)`);
    
    await connection.end();
    
  } catch (error) {
    console.log('❌ 规则逻辑检查失败:', error.message);
  }
}

/**
 * 检查呈现结果设计
 */
async function checkPresentationDesign() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    // 检查不同场景的字段设计
    console.log('🎨 检查各场景字段设计...');

    const scenarios = [
      {
        name: '库存场景',
        expectedFields: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
        sampleRule: '库存状态查询'
      },
      {
        name: '上线场景',
        expectedFields: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注'],
        sampleRule: '供应商上线情况查询'
      },
      {
        name: '测试场景',
        expectedFields: ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'],
        sampleRule: '供应商测试情况查询'
      },
      {
        name: '批次管理',
        expectedFields: ['批次号', '物料编码', '物料名称', '供应商', '数量', '入库日期', '产线异常', '测试异常', '备注'],
        sampleRule: '批次上线情况查询_优化'
      }
    ];

    for (const scenario of scenarios) {
      console.log(`\n📋 ${scenario.name}字段设计检查:`);

      try {
        const [rules] = await connection.execute(`
          SELECT action_target
          FROM nlp_intent_rules
          WHERE intent_name LIKE '%${scenario.sampleRule.split('查询')[0]}%'
          AND status = 'active'
          LIMIT 1
        `);

        if (rules.length > 0) {
          const [results] = await connection.execute(rules[0].action_target);

          if (results.length > 0) {
            const actualFields = Object.keys(results[0]);
            console.log(`  实际字段: ${actualFields.join(', ')}`);
            console.log(`  期望字段: ${scenario.expectedFields.join(', ')}`);

            // 检查字段匹配度
            const matchedFields = actualFields.filter(field => scenario.expectedFields.includes(field));
            const matchRate = Math.round((matchedFields.length / scenario.expectedFields.length) * 100);
            console.log(`  字段匹配度: ${matchRate}% (${matchedFields.length}/${scenario.expectedFields.length})`);

            if (matchRate >= 80) {
              console.log(`  ✅ ${scenario.name}字段设计符合要求`);
            } else {
              console.log(`  ⚠️ ${scenario.name}字段设计需要优化`);
              const missingFields = scenario.expectedFields.filter(field => !actualFields.includes(field));
              console.log(`  缺失字段: ${missingFields.join(', ')}`);
            }
          }
        } else {
          console.log(`  ❌ 未找到${scenario.name}的示例规则`);
        }
      } catch (error) {
        console.log(`  ❌ ${scenario.name}检查失败: ${error.message}`);
      }
    }

    // 检查数据展示质量
    console.log('\n🔍 检查数据展示质量...');

    const [qualityCheck] = await connection.execute(`
      SELECT
        intent_name,
        category,
        action_target
      FROM nlp_intent_rules
      WHERE status = 'active'
      AND category IN ('库存场景', '测试场景', '上线场景', '批次管理')
      ORDER BY category
      LIMIT 8
    `);

    let qualityScore = 0;
    let totalChecks = qualityCheck.length;

    for (const rule of qualityCheck) {
      try {
        const [results] = await connection.execute(rule.action_target);

        if (results.length > 0) {
          const fields = Object.keys(results[0]);
          const hasChineseFields = fields.some(field => /[\u4e00-\u9fa5]/.test(field));
          const hasNoErrors = !results.some(record =>
            Object.values(record).some(value =>
              typeof value === 'string' && value.includes('Function not supported')
            )
          );

          if (hasChineseFields && hasNoErrors) {
            qualityScore++;
          }
        }
      } catch (error) {
        // 跳过错误的规则
      }
    }

    const qualityRate = Math.round((qualityScore / totalChecks) * 100);
    console.log(`📊 数据展示质量评分: ${qualityRate}% (${qualityScore}/${totalChecks})`);

    if (qualityRate >= 90) {
      console.log('✅ 数据展示质量优秀');
    } else if (qualityRate >= 70) {
      console.log('⚠️ 数据展示质量良好，有改进空间');
    } else {
      console.log('❌ 数据展示质量需要重点改进');
    }

    await connection.end();

  } catch (error) {
    console.log('❌ 呈现结果设计检查失败:', error.message);
  }
}

// 执行全面检查
comprehensiveSystemCheck();
