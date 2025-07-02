/**
 * 测试图表修复
 */
import fetch from 'node-fetch';

async function testChartFix() {
  console.log('🔧 测试图表修复\n');
  
  try {
    // 1. 推送数据
    console.log('📊 步骤1: 推送测试数据...');
    
    const testData = {
      inventory: [
        {
          id: 'FIX_001',
          materialName: '电池盖',
          materialCode: 'CS-S-B001',
          supplier: '聚龙',
          quantity: 1200,
          status: '正常',
          factory: '深圳工厂'
        }
      ],
      inspection: [],
      production: []
    };
    
    const pushResponse = await fetch('http://localhost:3002/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    if (pushResponse.ok) {
      console.log('✅ 数据推送成功');
    } else {
      console.log('❌ 数据推送失败:', pushResponse.status);
    }
    
    // 2. 测试图表查询
    console.log('\n📊 步骤2: 测试图表查询...');
    
    const chartQuery = '显示质量趋势分析';
    console.log(`🎯 查询: "${chartQuery}"`);
    
    const queryResponse = await fetch('http://localhost:3002/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: chartQuery })
    });
    
    console.log('📋 响应状态:', queryResponse.status);
    
    if (queryResponse.ok) {
      const result = await queryResponse.json();
      console.log('📊 响应结构:', Object.keys(result));
      
      if (result.type === 'chart') {
        console.log('🎉 成功返回图表数据！');
        console.log('📋 图表类型:', result.data.chartType);
        console.log('📝 图表标题:', result.data.chartTitle);
        console.log('💬 文本总结:', result.textSummary?.substring(0, 50) + '...');
      } else if (result.reply) {
        console.log('📝 返回文本回复（非图表）');
        console.log('内容预览:', result.reply.substring(0, 100) + '...');
        
        // 检查是否包含图表相关内容
        if (result.reply.includes('趋势') || result.reply.includes('图表')) {
          console.log('⚠️ 文本回复中包含图表相关内容，可能是识别问题');
        }
      } else {
        console.log('❓ 未知响应格式');
        console.log('完整响应:', result);
      }
    } else {
      const error = await queryResponse.text();
      console.log('❌ 查询失败:', error);
    }
    
    // 3. 测试其他图表查询
    console.log('\n📊 步骤3: 测试其他图表查询...');
    
    const otherQueries = [
      '供应商对比分析',
      '库存状态分布图'
    ];
    
    for (const query of otherQueries) {
      console.log(`\n🎯 查询: "${query}"`);
      
      const response = await fetch('http://localhost:3002/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.type === 'chart') {
          console.log('✅ 返回图表数据');
        } else {
          console.log('📝 返回文本数据');
        }
      } else {
        console.log('❌ 查询失败');
      }
    }
    
    console.log('\n🎉 图表修复测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testChartFix().catch(console.error);
