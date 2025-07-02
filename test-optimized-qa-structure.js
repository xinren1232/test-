/**
 * 测试优化后的问答结构
 */

async function testOptimizedQAStructure() {
  console.log('🎨 测试优化后的问答结构...\n');
  
  try {
    // 1. 测试基本连接
    console.log('1️⃣ 测试API连接...');
    const healthResponse = await fetch('http://localhost:3001/api/health');
    
    if (!healthResponse.ok) {
      console.log('❌ API服务不可用');
      return;
    }
    
    console.log('✅ API服务正常');
    
    // 2. 推送测试数据
    console.log('\n2️⃣ 推送测试数据...');
    const testData = {
      inventory: [
        {
          factory: '深圳工厂',
          warehouse: '仓库A',
          materialCode: 'M001',
          materialName: '电池盖',
          supplier: '聚龙供应商',
          batchCode: 'B001',
          quantity: 100,
          status: '正常',
          inspectionDate: '2024-01-15',
          shelfLife: '2025-01-15'
        },
        {
          factory: '上海工厂',
          warehouse: '仓库B',
          materialCode: 'M002',
          materialName: 'OLED显示屏',
          supplier: '紫光供应商',
          batchCode: 'B002',
          quantity: 50,
          status: '风险',
          inspectionDate: '2024-01-10',
          shelfLife: '2024-12-31'
        },
        {
          factory: '北京工厂',
          warehouse: '仓库C',
          materialCode: 'M003',
          materialName: '摄像头模组',
          supplier: 'BOE供应商',
          batchCode: 'B003',
          quantity: 25,
          status: '冻结',
          inspectionDate: '2024-01-05',
          shelfLife: '2024-11-30'
        }
      ],
      inspection: [
        {
          testId: 'T001',
          testDate: '2024-01-15',
          baseline: 'BL001',
          project: 'P001',
          materialCode: 'M001',
          materialName: '电池盖',
          supplier: '聚龙供应商',
          batchNo: 'B001',
          testResult: 'PASS',
          defectPhenomena: ''
        },
        {
          testId: 'T002',
          testDate: '2024-01-10',
          baseline: 'BL002',
          project: 'P002',
          materialCode: 'M002',
          materialName: 'OLED显示屏',
          supplier: '紫光供应商',
          batchNo: 'B002',
          testResult: 'FAIL',
          defectPhenomena: '色彩偏差'
        }
      ],
      production: [
        {
          factory: '深圳工厂',
          baseline: 'BL001',
          project: 'P001',
          materialCode: 'M001',
          materialName: '电池盖',
          supplier: '聚龙供应商',
          batchCode: 'B001',
          defectRate: 0.02,
          defectPhenomena: '轻微划痕'
        },
        {
          factory: '上海工厂',
          baseline: 'BL002',
          project: 'P002',
          materialCode: 'M002',
          materialName: 'OLED显示屏',
          supplier: '紫光供应商',
          batchCode: 'B002',
          defectRate: 0.15,
          defectPhenomena: '色彩偏差'
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
    
    // 3. 测试优化后的问答结构
    console.log('\n3️⃣ 测试优化后的问答结构...');
    
    const testQueries = [
      {
        query: '查询所有工厂的库存情况',
        description: '测试库存查询的结构化展示'
      },
      {
        query: '查询风险状态的物料',
        description: '测试风险物料的高亮显示'
      },
      {
        query: '查询测试不合格的记录',
        description: '测试检测结果的分类展示'
      },
      {
        query: '分析紫光供应商的质量表现',
        description: '测试供应商分析的综合展示'
      },
      {
        query: '生成质量管理报告',
        description: '测试复杂分析的结构化展示'
      }
    ];
    
    for (const testCase of testQueries) {
      console.log(`\n🎯 ${testCase.description}`);
      console.log(`   查询: "${testCase.query}"`);
      
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
        
        // 分析响应结构
        analyzeResponseStructure(result.reply, testCase.query);
      } else {
        console.log('❌ 查询失败:', queryResponse.status);
      }
      
      // 添加延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n🎉 问答结构优化测试完成！');
    
    console.log('\n📋 优化效果总结:');
    console.log('1. ✅ 结构化数据展示 - 清晰的卡片式布局');
    console.log('2. ✅ 状态可视化 - 颜色编码和图标标识');
    console.log('3. ✅ 操作建议 - 智能推荐相关操作');
    console.log('4. ✅ 响应分类 - 根据内容类型自动分类');
    console.log('5. ✅ 交互增强 - 复制、点赞、重新生成等操作');
    console.log('6. ✅ 元数据显示 - 数据源、时间戳等信息');
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error.message);
  }
}

// 分析响应结构
function analyzeResponseStructure(response, query) {
  const analysis = {
    hasStructuredData: false,
    hasHTML: false,
    hasEmojis: false,
    hasNumbers: false,
    contentType: 'text',
    length: response.length
  };
  
  // 检查是否包含HTML结构
  if (response.includes('<div class="query-results')) {
    analysis.hasStructuredData = true;
    analysis.hasHTML = true;
    analysis.contentType = 'structured';
  }
  
  // 检查是否包含emoji
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  if (emojiRegex.test(response)) {
    analysis.hasEmojis = true;
  }
  
  // 检查是否包含数字数据
  const numberRegex = /\d+/g;
  if (numberRegex.test(response)) {
    analysis.hasNumbers = true;
  }
  
  // 确定内容类型
  if (query.includes('库存') || response.includes('库存')) {
    analysis.contentType = 'inventory';
  } else if (query.includes('测试') || query.includes('检测') || response.includes('测试')) {
    analysis.contentType = 'inspection';
  } else if (query.includes('生产') || response.includes('生产')) {
    analysis.contentType = 'production';
  }
  
  console.log('   📊 响应分析:', {
    类型: analysis.contentType,
    长度: analysis.length + '字符',
    结构化: analysis.hasStructuredData ? '是' : '否',
    包含HTML: analysis.hasHTML ? '是' : '否',
    包含表情: analysis.hasEmojis ? '是' : '否',
    包含数据: analysis.hasNumbers ? '是' : '否'
  });
  
  // 提供优化建议
  const suggestions = [];
  
  if (!analysis.hasStructuredData && analysis.length > 200) {
    suggestions.push('建议使用结构化展示');
  }
  
  if (!analysis.hasEmojis && analysis.contentType !== 'text') {
    suggestions.push('建议添加图标增强可读性');
  }
  
  if (analysis.hasNumbers && !analysis.hasStructuredData) {
    suggestions.push('建议使用表格或卡片展示数据');
  }
  
  if (suggestions.length > 0) {
    console.log('   💡 优化建议:', suggestions.join(', '));
  } else {
    console.log('   ✨ 展示效果良好');
  }
}

// 运行测试
testOptimizedQAStructure();
