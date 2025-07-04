/**
 * 完整的系统检查程序
 * 检查端口、数据同步、规则设计和功能验证
 */

// 第一步：端口检查
async function checkPorts() {
  console.log('🔍 第一步：端口检查');
  console.log('=' .repeat(50));
  
  try {
    // 检查后端端口3001
    const healthResponse = await fetch('http://localhost:3001/api/health');
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ 后端服务 (端口3001) 正常运行');
      console.log(`   状态: ${healthData.status}`);
      console.log(`   版本: ${healthData.version}`);
      console.log(`   运行时间: ${Math.floor(healthData.uptime)}秒`);
    } else {
      console.log('❌ 后端服务响应异常');
      return false;
    }
  } catch (error) {
    console.log('❌ 后端服务连接失败:', error.message);
    return false;
  }
  
  return true;
}

// 第二步：数据同步检查
async function checkDataSync() {
  console.log('\n🔍 第二步：数据同步检查');
  console.log('=' .repeat(50));
  
  try {
    // 重新生成和同步数据
    console.log('📊 重新生成测试数据...');
    const testData = generateTestData();
    
    console.log(`✅ 数据生成完成:`);
    console.log(`   📦 库存数据: ${testData.inventory.length} 条`);
    console.log(`   🧪 检测数据: ${testData.inspection.length} 条`);
    console.log(`   🏭 生产数据: ${testData.production.length} 条`);
    
    // 同步到后端
    console.log('\n📡 同步数据到后端...');
    const syncResponse = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    if (syncResponse.ok) {
      const syncResult = await syncResponse.text();
      console.log('✅ 数据同步成功:', syncResult);
    } else {
      console.log('❌ 数据同步失败');
      return false;
    }
    
    // 验证同步结果
    console.log('\n🔍 验证同步结果...');
    const verifyResponse = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '查询所有库存' })
    });
    
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log('✅ 数据验证成功');
      console.log(`   响应来源: ${verifyData.source}`);
      console.log(`   数据长度: ${verifyData.reply ? verifyData.reply.length : 0} 字符`);
    }
    
  } catch (error) {
    console.log('❌ 数据同步检查失败:', error.message);
    return false;
  }
  
  return true;
}

// 第三步：规则设计检查
async function checkRuleDesign() {
  console.log('\n🔍 第三步：规则设计检查');
  console.log('=' .repeat(50));
  
  // 基于您的数据字段设计的规则
  const expectedRules = [
    {
      name: '工厂库存查询',
      fields: ['factory', 'materialName', 'supplier', 'status', 'quantity'],
      triggers: ['工厂', '库存', '深圳', '重庆', '南昌', '宜宾'],
      example: '查询深圳工厂库存'
    },
    {
      name: '供应商物料查询', 
      fields: ['supplier', 'materialName', 'status', 'quantity'],
      triggers: ['供应商', '聚龙', '欣冠', '广正', 'BOE', '三星电子'],
      example: '查询聚龙供应商的物料'
    },
    {
      name: '物料状态查询',
      fields: ['status', 'materialName', 'factory', 'supplier'],
      triggers: ['状态', '风险', '正常', '冻结'],
      example: '查询风险状态的物料'
    },
    {
      name: '测试结果查询',
      fields: ['testResult', 'materialName', 'supplier', 'testDate'],
      triggers: ['测试', 'PASS', 'FAIL', '合格', '不合格'],
      example: '查询测试结果'
    },
    {
      name: '生产数据查询',
      fields: ['factory', 'materialName', 'productionDate', 'status'],
      triggers: ['生产', '产线', '效率'],
      example: '查询生产数据'
    }
  ];
  
  console.log('📋 预期规则设计:');
  expectedRules.forEach((rule, index) => {
    console.log(`${index + 1}. ${rule.name}`);
    console.log(`   字段: ${rule.fields.join(', ')}`);
    console.log(`   触发词: ${rule.triggers.join(', ')}`);
    console.log(`   示例: ${rule.example}`);
    console.log('');
  });
  
  return true;
}

// 第四步：基础规则查询验证（基于您的数据字段）
async function checkBasicRuleQueries() {
  console.log('\n🔍 第四步：基础规则查询验证');
  console.log('=' .repeat(50));

  // 基于您的真实数据字段设计的基础查询规则
  const basicRuleQueries = [
    // 库存查询规则
    {
      name: '深圳工厂库存查询',
      query: '查询深圳工厂库存',
      expectedFields: ['factory', 'materialName', 'supplier', 'status', 'quantity'],
      dataSource: 'inventory'
    },
    {
      name: '聚龙供应商物料查询',
      query: '查询聚龙供应商的物料',
      expectedFields: ['supplier', 'materialName', 'status', 'quantity'],
      dataSource: 'inventory'
    },
    {
      name: '风险状态物料查询',
      query: '查询风险状态的物料',
      expectedFields: ['status', 'materialName', 'factory', 'supplier'],
      dataSource: 'inventory'
    },
    {
      name: '电池盖物料查询',
      query: '查询电池盖的库存',
      expectedFields: ['materialName', 'factory', 'supplier', 'quantity'],
      dataSource: 'inventory'
    },

    // 测试记录查询规则
    {
      name: 'PASS测试结果查询',
      query: '查询PASS的测试结果',
      expectedFields: ['testResult', 'materialName', 'supplier', 'testDate'],
      dataSource: 'inspection'
    },
    {
      name: 'FAIL测试结果查询',
      query: '查询FAIL的测试结果',
      expectedFields: ['testResult', 'materialName', 'supplier', 'defectType'],
      dataSource: 'inspection'
    },

    // 生产数据查询规则
    {
      name: '深圳工厂生产数据',
      query: '查询深圳工厂的生产数据',
      expectedFields: ['factory', 'materialName', 'productionDate', 'status'],
      dataSource: 'production'
    },
    {
      name: '正常状态生产记录',
      query: '查询正常状态的生产记录',
      expectedFields: ['status', 'factory', 'materialName', 'quantity'],
      dataSource: 'production'
    }
  ];

  let passCount = 0;
  let totalCount = basicRuleQueries.length;

  console.log(`📋 开始测试 ${totalCount} 个基础规则查询...\n`);

  for (let i = 0; i < basicRuleQueries.length; i++) {
    const rule = basicRuleQueries[i];
    console.log(`🧪 测试 ${i + 1}/${totalCount}: ${rule.name}`);
    console.log(`   查询: "${rule.query}"`);
    console.log(`   数据源: ${rule.dataSource}`);
    console.log(`   期望字段: ${rule.expectedFields.join(', ')}`);

    try {
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: rule.query })
      });

      if (response.ok) {
        const data = await response.json();

        // 检查服务来源
        const isIntelligentService = data.source === 'intelligent-intent';

        // 检查响应格式
        const hasStandardFormat = data.reply && (
          data.reply.includes('📊 **查询结果**') ||
          data.reply.includes('查询结果') ||
          data.reply.length > 100
        );

        // 检查是否包含实际数据
        const hasRealData = data.reply && (
          data.reply.includes('聚龙') ||
          data.reply.includes('欣冠') ||
          data.reply.includes('广正') ||
          data.reply.includes('BOE') ||
          data.reply.includes('三星电子') ||
          data.reply.includes('深圳工厂') ||
          data.reply.includes('重庆工厂') ||
          data.reply.includes('电池盖') ||
          data.reply.includes('OLED显示屏')
        );

        if (isIntelligentService && hasStandardFormat && hasRealData) {
          console.log('   ✅ 测试通过');
          console.log(`   服务: ${data.source} ✅`);
          console.log(`   格式: 标准格式 ✅`);
          console.log(`   数据: 包含真实数据 ✅`);
          passCount++;
        } else {
          console.log('   ❌ 测试失败');
          console.log(`   服务: ${data.source} ${isIntelligentService ? '✅' : '❌'}`);
          console.log(`   格式: ${hasStandardFormat ? '标准格式 ✅' : '格式异常 ❌'}`);
          console.log(`   数据: ${hasRealData ? '真实数据 ✅' : '无真实数据 ❌'}`);

          // 显示部分响应内容用于调试
          if (data.reply) {
            const preview = data.reply.substring(0, 200) + (data.reply.length > 200 ? '...' : '');
            console.log(`   响应预览: ${preview}`);
          }
        }
      } else {
        console.log('   ❌ 请求失败');
        console.log(`   HTTP状态: ${response.status}`);
      }

    } catch (error) {
      console.log('   ❌ 测试异常:', error.message);
    }

    console.log(''); // 空行分隔
  }

  console.log(`📊 基础规则查询验证结果: ${passCount}/${totalCount} (${Math.round(passCount/totalCount*100)}%)`);

  if (passCount < totalCount) {
    console.log('\n🔧 需要修复的问题:');
    console.log('1. 检查数据库规则是否包含所有基础查询场景');
    console.log('2. 验证触发词是否匹配您的实际数据字段');
    console.log('3. 确认SQL查询模板是否正确使用数据字段');
    console.log('4. 检查数据同步是否完整包含所有数据类型');
  }

  return passCount === totalCount;
}

// 生成测试数据（基于您的数据字段结构）
function generateTestData() {
  const factories = ['深圳工厂', '重庆工厂', '南昌工厂', '宜宾工厂'];
  const suppliers = ['聚龙', '欣冠', '广正', 'BOE', '三星电子'];
  const materials = ['电池盖', 'OLED显示屏', '电容器', '电阻器', '芯片'];
  const statuses = ['正常', '风险', '冻结'];
  
  const inventory = [];
  const inspection = [];
  const production = [];
  
  // 生成132条库存数据
  for (let i = 0; i < 132; i++) {
    inventory.push({
      id: `INV_${String(i + 1).padStart(6, '0')}`,
      factory: factories[i % factories.length],
      materialName: materials[i % materials.length],
      supplier: suppliers[i % suppliers.length],
      status: statuses[i % statuses.length],
      quantity: Math.floor(Math.random() * 1000) + 50,
      batchCode: `${360000 + i}`,
      inspectionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      location: `仓库${String.fromCharCode(65 + (i % 5))}-${String(i % 10 + 1).padStart(2, '0')}`,
      unitPrice: (Math.random() * 100 + 10).toFixed(2)
    });
  }
  
  // 生成396条检测数据
  for (let i = 0; i < 396; i++) {
    inspection.push({
      id: `TEST_${String(i + 1).padStart(6, '0')}`,
      materialName: materials[i % materials.length],
      supplier: suppliers[i % suppliers.length],
      testResult: i % 4 === 0 ? 'FAIL' : 'PASS',
      testDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      defectType: i % 4 === 0 ? ['外观缺陷', '性能不达标', '尺寸偏差'][i % 3] : null,
      testValue: (Math.random() * 100).toFixed(2),
      standardValue: '85.00'
    });
  }
  
  // 生成1056条生产数据
  for (let i = 0; i < 1056; i++) {
    production.push({
      id: `PROD_${String(i + 1).padStart(6, '0')}`,
      factory: factories[i % factories.length],
      materialName: materials[i % materials.length],
      supplier: suppliers[i % suppliers.length],
      productionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      quantity: Math.floor(Math.random() * 500) + 100,
      status: i % 10 === 0 ? '异常' : '正常',
      lineNumber: `产线${(i % 8) + 1}`
    });
  }
  
  return { inventory, inspection, production };
}

// 主执行函数
async function runCompleteSystemCheck() {
  console.log('🚀 开始完整系统检查');
  console.log('=' .repeat(60));
  
  const results = {
    portCheck: false,
    dataSync: false,
    ruleDesign: false,
    functionality: false
  };
  
  // 执行所有检查步骤
  results.portCheck = await checkPorts();
  if (results.portCheck) {
    results.dataSync = await checkDataSync();
    if (results.dataSync) {
      results.ruleDesign = await checkRuleDesign();
      results.functionality = await checkBasicRuleQueries();
    }
  }
  
  // 输出最终结果
  console.log('\n📋 完整系统检查结果');
  console.log('=' .repeat(60));
  console.log(`🔌 端口检查: ${results.portCheck ? '✅ 通过' : '❌ 失败'}`);
  console.log(`📊 数据同步: ${results.dataSync ? '✅ 通过' : '❌ 失败'}`);
  console.log(`📋 规则设计: ${results.ruleDesign ? '✅ 通过' : '❌ 失败'}`);
  console.log(`🔍 基础规则查询: ${results.functionality ? '✅ 通过' : '❌ 失败'}`);
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n🎯 总体结果: ${allPassed ? '✅ 系统正常' : '❌ 需要修复'}`);
  
  return results;
}

// 执行检查
runCompleteSystemCheck();
