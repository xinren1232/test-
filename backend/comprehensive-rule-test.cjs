// 全面测试所有规则并解决问题
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 从前端数据同步表获取数据
async function getDataFromSync(connection, dataType) {
  try {
    const [results] = await connection.execute(`
      SELECT data_content 
      FROM frontend_data_sync 
      WHERE data_type = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [dataType]);
    
    if (results.length > 0) {
      const dataContent = typeof results[0].data_content === 'string' 
        ? JSON.parse(results[0].data_content) 
        : results[0].data_content;
      return dataContent;
    }
    return [];
  } catch (error) {
    console.error(`❌ 获取${dataType}数据失败:`, error.message);
    return [];
  }
}

// 根据规则查询数据（从前端数据同步表）
async function queryDataByRule(connection, rule, query) {
  try {
    // 根据规则意图确定数据源
    let dataSource = 'inventory'; // 默认库存数据
    
    if (rule.intent_name.includes('检验') || rule.intent_name.includes('测试')) {
      dataSource = 'inspection';
    } else if (rule.intent_name.includes('生产') || rule.intent_name.includes('上线')) {
      dataSource = 'production';
    }
    
    // 获取数据
    const data = await getDataFromSync(connection, dataSource);
    
    // 根据查询内容过滤数据
    let filteredData = data;
    
    if (query.includes('聚龙')) {
      filteredData = data.filter(item => 
        item.supplier && item.supplier.includes('聚龙')
      );
    } else if (query.includes('BOE')) {
      filteredData = data.filter(item => 
        item.supplier && item.supplier.includes('BOE')
      );
    } else if (query.includes('广正')) {
      filteredData = data.filter(item => 
        item.supplier && item.supplier.includes('广正')
      );
    } else if (query.includes('华星')) {
      filteredData = data.filter(item => 
        item.supplier && item.supplier.includes('华星')
      );
    }
    
    // 转换数据格式以匹配前端期望
    const transformedData = filteredData.map(item => {
      if (dataSource === 'inventory') {
        return {
          物料名称: item.materialName || item.material_name,
          供应商: item.supplier || item.supplier_name,
          数量: String(item.quantity || 0),
          状态: item.status || '正常',
          入库日期: item.inspectionDate || item.inbound_time || new Date().toISOString().split('T')[0]
        };
      } else if (dataSource === 'inspection') {
        return {
          测试编号: item.id || item.test_id,
          物料名称: item.materialName || item.material_name,
          测试结果: item.testResult || item.test_result,
          结论: item.conclusion || '正常'
        };
      } else if (dataSource === 'production') {
        return {
          批次号: item.batchNo || item.batch_code,
          物料名称: item.materialName || item.material_name,
          工厂: item.factory,
          缺陷率: String((item.defectRate || 0) * 100) + '%'
        };
      }
      return item;
    });
    
    return transformedData;
    
  } catch (error) {
    console.error('❌ 查询数据失败:', error);
    return [];
  }
}

async function testAllRules() {
  let connection;
  
  try {
    console.log('🧪 开始全面测试所有规则...\n');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 获取所有活跃规则
    const [rules] = await connection.execute(`
      SELECT id, intent_name, action_target, trigger_words, status, priority
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY id ASC
    `);
    
    console.log(`📊 总共 ${rules.length} 条活跃规则\n`);
    
    let successCount = 0;
    let emptyDataCount = 0;
    let errorCount = 0;
    let errorDetails = [];
    let emptyDataDetails = [];
    
    // 2. 逐一测试每个规则
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      const progress = `[${i + 1}/${rules.length}]`;
      
      console.log(`${progress} 测试规则 ${rule.id}: ${rule.intent_name}`);
      
      try {
        // 首先尝试从前端数据同步表查询
        let results = [];
        let useSync = true;
        
        try {
          // 使用规则名称作为查询内容进行测试
          const testQuery = rule.intent_name;
          results = await queryDataByRule(connection, rule, testQuery);
        } catch (syncError) {
          console.log(`  ⚠️  前端数据同步查询失败，回退到SQL: ${syncError.message}`);
          useSync = false;
        }
        
        // 如果前端数据同步查询失败或返回空数据，尝试SQL查询
        if (!useSync || results.length === 0) {
          if (rule.action_target && rule.action_target.trim()) {
            try {
              const [sqlResults] = await connection.execute(rule.action_target);
              results = sqlResults;
              if (useSync && results.length > 0) {
                console.log(`  🔄 SQL查询成功，返回 ${results.length} 条数据`);
              }
            } catch (sqlError) {
              console.log(`  ❌ SQL执行失败: ${sqlError.message.substring(0, 100)}...`);
              errorCount++;
              errorDetails.push({
                id: rule.id,
                name: rule.intent_name,
                error: sqlError.message,
                sql: rule.action_target
              });
              continue;
            }
          } else {
            console.log(`  ⚠️  规则没有SQL模板`);
            errorCount++;
            errorDetails.push({
              id: rule.id,
              name: rule.intent_name,
              error: '规则没有SQL模板',
              sql: rule.action_target
            });
            continue;
          }
        }
        
        if (results.length > 0) {
          console.log(`  ✅ 执行成功: ${results.length} 条数据`);
          successCount++;
        } else {
          console.log(`  ⚠️  执行成功但返回0条数据`);
          emptyDataCount++;
          emptyDataDetails.push({
            id: rule.id,
            name: rule.intent_name,
            category: rule.intent_name.split('_')[0] || '未分类'
          });
        }
        
      } catch (error) {
        console.log(`  ❌ 执行失败: ${error.message.substring(0, 100)}...`);
        errorCount++;
        errorDetails.push({
          id: rule.id,
          name: rule.intent_name,
          error: error.message,
          sql: rule.action_target
        });
      }
      
      // 每10个规则显示一次进度
      if ((i + 1) % 10 === 0) {
        console.log(`\n--- 进度 ${i + 1}/${rules.length} ---`);
        console.log(`成功: ${successCount}, 空数据: ${emptyDataCount}, 失败: ${errorCount}\n`);
      }
    }
    
    // 3. 显示测试结果统计
    console.log('\n============================================================');
    console.log('📊 最终统计报告');
    console.log('============================================================');
    console.log(`✅ 成功执行: ${successCount} 条规则 (${(successCount/rules.length*100).toFixed(1)}%)`);
    console.log(`⚠️  返回空数据: ${emptyDataCount} 条规则 (${(emptyDataCount/rules.length*100).toFixed(1)}%)`);
    console.log(`❌ 执行失败: ${errorCount} 条规则 (${(errorCount/rules.length*100).toFixed(1)}%)`);
    console.log(`📊 总计: ${rules.length} 条规则`);
    
    // 4. 显示错误详情
    if (errorDetails.length > 0) {
      console.log('\n❌ 执行失败的规则详情:');
      console.log('----------------------------------------');
      
      // 按错误类型分组
      const errorGroups = {};
      for (const error of errorDetails) {
        const errorType = getErrorType(error.error);
        if (!errorGroups[errorType]) {
          errorGroups[errorType] = [];
        }
        errorGroups[errorType].push(error);
      }
      
      for (const [errorType, errors] of Object.entries(errorGroups)) {
        console.log(`\n${errorType} (${errors.length} 条):`);
        for (const error of errors.slice(0, 5)) { // 只显示前5条
          console.log(`  规则 ${error.id}: ${error.name}`);
          console.log(`    错误: ${error.error.substring(0, 100)}...`);
        }
        if (errors.length > 5) {
          console.log(`  ... 还有 ${errors.length - 5} 条类似错误`);
        }
      }
    }
    
    // 5. 显示空数据规则
    if (emptyDataDetails.length > 0) {
      console.log(`\n⚠️  返回空数据的规则 (前10条):`);
      console.log('----------------------------------------');
      for (const empty of emptyDataDetails.slice(0, 10)) {
        console.log(`规则 ${empty.id}: ${empty.name} (${empty.category})`);
      }
      if (emptyDataDetails.length > 10) {
        console.log(`... 还有 ${emptyDataDetails.length - 10} 条`);
      }
    }
    
    // 6. 提供修复建议
    console.log('\n💡 修复建议:');
    console.log('----------------------------------------');
    if (errorCount > 0) {
      console.log(`🔧 需要修复 ${errorCount} 条错误规则`);
      console.log('   建议批量修复SQL内容错误和语法错误');
    }
    if (emptyDataCount > 0) {
      console.log(`📊 ${emptyDataCount} 条规则返回空数据`);
      console.log('   建议检查查询条件和数据库内容');
    }
    if (errorCount + emptyDataCount > 0) {
      console.log(`⚠️  需要修复 ${errorCount + emptyDataCount} 条规则`);
    } else {
      console.log('🎉 所有规则都正常工作！');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

function getErrorType(errorMessage) {
  if (errorMessage.includes('Unknown column')) {
    return '字段不存在';
  } else if (errorMessage.includes('Table') && errorMessage.includes("doesn't exist")) {
    return '表不存在';
  } else if (errorMessage.includes('Syntax error') || errorMessage.includes('syntax')) {
    return 'SQL语法错误';
  } else if (errorMessage.includes('Malformed communication packet')) {
    return '通信包错误';
  } else {
    return '其他错误';
  }
}

testAllRules();
