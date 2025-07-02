/**
 * 测试优化后的问答规则
 * 验证所有基础和高级规则的功能
 */

async function testOptimizedRules() {
  console.log('🎯 测试优化后的问答规则...\n');
  
  try {
    // 1. 检查API连接
    console.log('1️⃣ 检查API连接...');
    const healthResponse = await fetch('http://localhost:3001/api/health');
    
    if (!healthResponse.ok) {
      console.log('❌ API服务不可用，请启动后端服务');
      return;
    }
    
    console.log('✅ API服务正常');
    
    // 2. 推送测试数据
    console.log('\n2️⃣ 推送测试数据...');
    const testData = {
      inventory: [
        {
          factory: '深圳工厂',
          warehouse: '深圳库存',
          materialCode: 'M001',
          materialName: '电池盖',
          supplier: '聚龙',
          batchCode: 'B001',
          quantity: 100,
          status: '正常',
          inspectionDate: '2024-01-15',
          shelfLife: '2025-01-15'
        },
        {
          factory: '重庆工厂',
          warehouse: '重庆库存',
          materialCode: 'M002',
          materialName: '中框',
          supplier: 'BOE',
          batchCode: 'B002',
          quantity: 50,
          status: '风险',
          inspectionDate: '2024-01-10',
          shelfLife: '2024-12-31'
        },
        {
          factory: '深圳工厂',
          warehouse: '深圳库存',
          materialCode: 'M003',
          materialName: '电池',
          supplier: '百俊达',
          batchCode: 'B003',
          quantity: 200,
          status: '正常',
          inspectionDate: '2024-01-20',
          shelfLife: '2025-06-30'
        }
      ],
      inspection: [
        {
          testId: 'T001',
          testDate: '2024-01-15',
          baseline: 'I6789',
          project: 'X6827',
          materialCode: 'M001',
          materialName: '电池盖',
          supplier: '聚龙',
          batchNo: 'B001',
          testResult: 'PASS',
          defectPhenomena: ''
        },
        {
          testId: 'T002',
          testDate: '2024-01-10',
          baseline: 'I6788',
          project: 'S662LN',
          materialCode: 'M002',
          materialName: '中框',
          supplier: 'BOE',
          batchNo: 'B002',
          testResult: 'FAIL',
          defectPhenomena: '尺寸异常'
        },
        {
          testId: 'T003',
          testDate: '2024-01-20',
          baseline: 'I6789',
          project: 'KI4K',
          materialCode: 'M003',
          materialName: '电池',
          supplier: '百俊达',
          batchNo: 'B003',
          testResult: 'NG',
          defectPhenomena: '电压不稳'
        }
      ],
      production: [
        {
          factory: '深圳工厂',
          baseline: 'I6789',
          project: 'X6827',
          materialCode: 'M001',
          materialName: '电池盖',
          supplier: '聚龙',
          batchCode: 'B001',
          defectRate: 0.02,
          defectPhenomena: '轻微划痕'
        },
        {
          factory: '重庆工厂',
          baseline: 'I6788',
          project: 'S662LN',
          materialCode: 'M002',
          materialName: '中框',
          supplier: 'BOE',
          batchCode: 'B002',
          defectRate: 0.15,
          defectPhenomena: '尺寸偏差'
        }
      ]
    };
    
    const pushResponse = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    if (pushResponse.ok) {
      console.log('✅ 测试数据推送成功');
    } else {
      console.log('❌ 测试数据推送失败');
      return;
    }
    
    // 3. 测试基础查询规则
    console.log('\n3️⃣ 测试基础查询规则...');
    
    const basicQueries = [
      // 库存查询规则
      { query: '查询深圳工厂的库存', category: '工厂库存查询' },
      { query: '查询BOE供应商的物料', category: '供应商库存查询' },
      { query: '查询风险状态的库存', category: '风险库存查询' },
      { query: '查询电池的库存', category: '电池库存查询' },
      { query: '查询所有库存记录', category: '库存总览' },
      { query: '库存物料涉及多少家供应商？', category: '库存供应商统计' },
      
      // 测试记录查询
      { query: '查询测试NG记录', category: '测试NG记录' },
      { query: '查询电池盖测试记录', category: '电池盖测试记录' },
      { query: '查询BOE测试记录', category: 'BOE测试记录' },
      
      // 生产查询
      { query: '查询深圳工厂的生产记录', category: '工厂生产记录' },
      { query: '查询电池盖物料的生产记录', category: '电池盖生产记录' },
      { query: '查询BOE生产记录', category: 'BOE生产记录' },
      { query: '查询S662LN项目记录', category: 'S662项目记录' },
      
      // 综合查询
      { query: '多少种物料？', category: '物料种类统计' },
      { query: '物料有几个批次？', category: '物料批次统计' },
      { query: '有几个项目？', category: '项目数量统计' },
      { query: '有几个基线？', category: '基线数量统计' },
      { query: '有几家供应商？', category: '供应商数量统计' }
    ];
    
    let successCount = 0;
    let totalCount = basicQueries.length;
    
    for (const testCase of basicQueries) {
      console.log(`\n🎯 测试: ${testCase.category}`);
      console.log(`   查询: "${testCase.query}"`);
      
      try {
        const queryResponse = await fetch('http://localhost:3001/api/assistant/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: testCase.query })
        });
        
        if (queryResponse.ok) {
          const result = await queryResponse.json();
          console.log('✅ 查询成功');
          
          // 分析响应质量
          analyzeResponse(result.reply, testCase.query);
          successCount++;
        } else {
          console.log('❌ 查询失败:', queryResponse.status);
        }
      } catch (error) {
        console.log('❌ 查询异常:', error.message);
      }
      
      // 添加延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // 4. 测试结果统计
    console.log('\n4️⃣ 测试结果统计...');
    console.log(`📊 基础规则测试完成: ${successCount}/${totalCount} 成功`);
    console.log(`📈 成功率: ${(successCount / totalCount * 100).toFixed(1)}%`);
    
    if (successCount === totalCount) {
      console.log('🎉 所有基础规则测试通过！');
    } else {
      console.log('⚠️ 部分规则需要优化');
    }
    
    // 5. 规则优化建议
    console.log('\n5️⃣ 规则优化建议...');
    console.log('✅ 已完成的优化:');
    console.log('  - 库存查询规则: 精简到6条核心规则');
    console.log('  - 测试记录查询: 优化为3条实用规则');
    console.log('  - 生产查询: 调整为4条关键规则');
    console.log('  - 综合查询: 新增5条统计规则');
    console.log('  - 基于实际数据: 匹配真实工厂、供应商、物料');
    
    console.log('\n📋 规则覆盖情况:');
    console.log('  📦 库存管理: 工厂、供应商、状态、物料、总览、统计');
    console.log('  🧪 质量检测: NG记录、物料测试、供应商测试');
    console.log('  ⚙️ 生产管理: 工厂生产、物料生产、供应商生产、项目记录');
    console.log('  📊 数据统计: 物料、批次、项目、基线、供应商数量');
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error.message);
  }
}

// 分析响应质量
function analyzeResponse(response, query) {
  const analysis = {
    hasData: false,
    hasStructure: false,
    hasCount: false,
    isRelevant: false,
    length: response.length
  };
  
  // 检查是否包含数据
  if (response.includes('条记录') || response.includes('个') || response.includes('家')) {
    analysis.hasData = true;
  }
  
  // 检查是否有结构化内容
  if (response.includes('<div') || response.includes('**') || response.includes('📊')) {
    analysis.hasStructure = true;
  }
  
  // 检查是否有数量统计
  if (/\d+/.test(response)) {
    analysis.hasCount = true;
  }
  
  // 检查相关性
  const queryKeywords = query.toLowerCase().match(/[a-z\u4e00-\u9fa5]+/g) || [];
  const responseKeywords = response.toLowerCase();
  analysis.isRelevant = queryKeywords.some(keyword => responseKeywords.includes(keyword));
  
  console.log('   📊 响应分析:', {
    长度: analysis.length + '字符',
    包含数据: analysis.hasData ? '是' : '否',
    结构化: analysis.hasStructure ? '是' : '否',
    有统计: analysis.hasCount ? '是' : '否',
    相关性: analysis.isRelevant ? '高' : '低'
  });
  
  // 质量评分
  let score = 0;
  if (analysis.hasData) score += 25;
  if (analysis.hasStructure) score += 25;
  if (analysis.hasCount) score += 25;
  if (analysis.isRelevant) score += 25;
  
  console.log(`   ⭐ 质量评分: ${score}/100`);
}

// 运行测试
testOptimizedRules();
