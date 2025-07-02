/**
 * 测试图表查询并查看日志
 */
import fetch from 'node-fetch';

async function testChartWithLogs() {
  console.log('🔧 测试图表查询并查看日志\n');
  
  try {
    // 1. 推送数据
    console.log('📊 步骤1: 推送测试数据...');
    
    const testData = {
      inventory: [
        {
          id: 'LOG_001',
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
      return;
    }
    
    // 2. 测试图表查询
    console.log('\n📊 步骤2: 测试图表查询...');
    
    const chartQuery = '显示质量趋势分析';
    console.log(`🎯 发送查询: "${chartQuery}"`);
    
    const queryResponse = await fetch('http://localhost:3002/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: chartQuery })
    });
    
    console.log('📋 响应状态:', queryResponse.status);
    console.log('📋 响应头:', Object.fromEntries(queryResponse.headers.entries()));
    
    if (queryResponse.ok) {
      const result = await queryResponse.json();
      console.log('\n📊 响应分析:');
      console.log('  - 响应类型:', typeof result);
      console.log('  - 响应键:', Object.keys(result));
      
      if (result.type === 'chart') {
        console.log('🎉 成功返回图表数据！');
        console.log('📋 图表类型:', result.data.chartType);
        console.log('📝 图表标题:', result.data.chartTitle);
        console.log('💬 文本总结:', result.textSummary?.substring(0, 50) + '...');
        
        // 验证图表数据结构
        console.log('\n📊 图表数据验证:');
        const chartData = result.data.chartData;
        if (chartData.categories) {
          console.log(`  - 类别数: ${chartData.categories.length}`);
        }
        if (chartData.series) {
          console.log(`  - 系列数: ${chartData.series.length}`);
        }
        
      } else if (result.reply) {
        console.log('📝 返回文本回复（非图表）');
        console.log('内容预览:', result.reply.substring(0, 150) + '...');
        
        // 检查是否包含图表相关内容
        if (result.reply.includes('趋势') || result.reply.includes('图表')) {
          console.log('⚠️ 文本回复中包含图表相关内容，可能是识别问题');
        }
        
        // 检查是否是默认回复
        if (result.reply.includes('抱歉，我暂时无法理解')) {
          console.log('❌ 返回了默认的无法理解回复');
        }
        
      } else {
        console.log('❓ 未知响应格式');
        console.log('完整响应:', JSON.stringify(result, null, 2));
      }
    } else {
      const error = await queryResponse.text();
      console.log('❌ 查询失败:', error);
    }
    
    console.log('\n🎉 测试完成！');
    console.log('💡 请检查后端控制台日志以查看详细的处理过程');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testChartWithLogs().catch(console.error);
