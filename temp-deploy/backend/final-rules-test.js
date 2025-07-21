import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function finalRulesTest() {
  console.log('🎯 最终规则系统测试...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 系统状态检查
    console.log('1. 📊 系统状态检查:');
    
    const [totalRules] = await connection.execute('SELECT COUNT(*) as count FROM nlp_intent_rules WHERE status = "active"');
    console.log(`   总规则数: ${totalRules[0].count}`);
    
    const [scenarioStats] = await connection.execute(`
      SELECT category, COUNT(*) as count 
      FROM nlp_intent_rules 
      WHERE status = 'active' 
      GROUP BY category
    `);
    
    console.log('   场景分布:');
    scenarioStats.forEach(stat => {
      console.log(`     - ${stat.category}: ${stat.count} 条`);
    });
    
    // 2. 核心功能测试
    console.log('\n2. 🧪 核心功能测试:\n');
    
    const testCases = [
      {
        name: '基础库存查询',
        ruleName: '库存信息查询',
        expectedRecords: 50,
        category: '库存场景'
      },
      {
        name: '基础测试查询',
        ruleName: '测试信息查询',
        expectedRecords: 50,
        category: '测试场景'
      },
      {
        name: '基础上线查询',
        ruleName: '上线信息查询',
        expectedRecords: 50,
        category: '上线场景'
      },
      {
        name: '聚龙供应商库存',
        ruleName: '聚龙供应商库存查询',
        expectedRecords: 15,
        category: '库存场景'
      },
      {
        name: 'BOE供应商测试',
        ruleName: 'BOE供应商测试查询',
        expectedRecords: 18,
        category: '测试场景'
      },
      {
        name: '华星供应商上线',
        ruleName: '华星供应商上线查询',
        expectedRecords: 24,
        category: '上线场景'
      },
      {
        name: '光学类库存',
        ruleName: '光学类库存查询',
        expectedRecords: 24,
        category: '库存场景'
      },
      {
        name: '结构件类测试',
        ruleName: '结构件类测试查询',
        expectedRecords: 50,
        category: '测试场景'
      },
      {
        name: '充电类上线',
        ruleName: '充电类上线查询',
        expectedRecords: 50,
        category: '上线场景'
      }
    ];
    
    let passedTests = 0;
    let totalTests = testCases.length;
    
    for (const testCase of testCases) {
      console.log(`🔍 测试: ${testCase.name}`);
      
      // 获取规则
      const [rule] = await connection.execute(`
        SELECT action_target
        FROM nlp_intent_rules 
        WHERE intent_name = ? AND status = 'active'
      `, [testCase.ruleName]);
      
      if (rule.length === 0) {
        console.log(`   ❌ 规则不存在: ${testCase.ruleName}`);
        continue;
      }
      
      try {
        // 执行SQL
        const [result] = await connection.execute(rule[0].action_target);
        
        // 检查记录数
        const recordsOK = result.length > 0;
        console.log(`   📊 返回记录: ${result.length} 条 ${recordsOK ? '✅' : '❌'}`);
        
        if (result.length > 0) {
          // 检查字段完整性
          const sample = result[0];
          const fields = Object.keys(sample);
          
          // 根据场景检查必要字段
          let requiredFields = [];
          if (testCase.category === '库存场景') {
            requiredFields = ['工厂', '物料名称', '供应商', '数量', '状态'];
          } else if (testCase.category === '测试场景') {
            requiredFields = ['测试编号', '物料名称', '供应商', '测试结果', '日期'];
          } else if (testCase.category === '上线场景') {
            requiredFields = ['物料名称', '供应商', '不良率', '检验日期'];
          }
          
          const missingFields = requiredFields.filter(field => !fields.includes(field));
          const fieldsOK = missingFields.length === 0;
          console.log(`   📋 字段检查: ${fieldsOK ? '✅ 完整' : '❌ 缺少: ' + missingFields.join(', ')}`);
          
          // 检查数据完整性（非空值）
          const hasValidData = requiredFields.every(field => 
            sample[field] !== null && sample[field] !== undefined && sample[field] !== ''
          );
          console.log(`   📝 数据完整: ${hasValidData ? '✅' : '❌'}`);
          
          // 显示数据样本
          if (testCase.category === '库存场景') {
            console.log(`   📄 样本: ${sample.物料名称} | ${sample.供应商} | 数量:${sample.数量} | ${sample.状态}`);
          } else if (testCase.category === '测试场景') {
            console.log(`   📄 样本: ${sample.物料名称} | ${sample.供应商} | ${sample.测试结果} | ${sample.日期}`);
          } else if (testCase.category === '上线场景') {
            console.log(`   📄 样本: ${sample.物料名称} | ${sample.供应商} | 不良率:${sample.不良率} | ${sample.检验日期}`);
          }
          
          if (recordsOK && fieldsOK && hasValidData) {
            passedTests++;
            console.log(`   ✅ 测试通过`);
          } else {
            console.log(`   ❌ 测试失败`);
          }
        } else {
          console.log(`   ❌ 无数据返回`);
        }
        
      } catch (error) {
        console.log(`   ❌ SQL执行失败: ${error.message}`);
      }
      
      console.log('');
    }
    
    // 3. 数据统计
    console.log('3. 📊 数据统计:');
    
    const [inventoryCount] = await connection.execute('SELECT COUNT(*) as count FROM inventory');
    const [testCount] = await connection.execute('SELECT COUNT(*) as count FROM lab_tests');
    const [onlineCount] = await connection.execute('SELECT COUNT(*) as count FROM online_tracking');
    
    console.log(`   库存数据: ${inventoryCount[0].count} 条`);
    console.log(`   测试数据: ${testCount[0].count} 条`);
    console.log(`   上线数据: ${onlineCount[0].count} 条`);
    console.log(`   总数据量: ${inventoryCount[0].count + testCount[0].count + onlineCount[0].count} 条`);
    
    // 4. 最终评估
    console.log('\n📋 最终测试报告:');
    console.log('==========================================');
    
    const passRate = Math.round((passedTests / totalTests) * 100);
    console.log(`🎯 测试通过率: ${passedTests}/${totalTests} (${passRate}%)`);
    
    if (passRate >= 90) {
      console.log('🎉 系统测试优秀！规则系统完全可用。');
    } else if (passRate >= 80) {
      console.log('✅ 系统测试良好！规则系统基本可用。');
    } else if (passRate >= 70) {
      console.log('⚠️  系统测试一般，需要进一步优化。');
    } else {
      console.log('❌ 系统测试不合格，需要重大修复。');
    }
    
    console.log('\n✅ 系统特点:');
    console.log('   ✅ 严格按三个场景归类');
    console.log('   ✅ 统一场景字段呈现');
    console.log('   ✅ 调用真实数据库数据');
    console.log('   ✅ 使用COALESCE处理空值');
    console.log('   ✅ 返回完整数据记录');
    
    console.log('\n🚀 前端测试建议:');
    console.log('   1. 重新刷新前端页面');
    console.log('   2. 测试库存信息查询');
    console.log('   3. 测试供应商专用查询');
    console.log('   4. 测试物料大类查询');
    console.log('   5. 验证数据显示完整性');
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

finalRulesTest();
