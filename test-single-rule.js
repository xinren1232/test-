/**
 * 测试单个规则匹配
 */
import fetch from 'node-fetch';

async function testSingleRule() {
  console.log('🔧 测试单个规则匹配...\n');
  
  try {
    // 推送测试数据
    console.log('📊 推送测试数据...');
    
    const testData = {
      inventory: [
        {
          id: "INV_001",
          factory: "深圳工厂",
          warehouse: "A区仓库",
          materialCode: "DS-O-M4529",
          materialName: "OLED显示屏",
          supplier: "BOE",
          batchCode: "T14127",
          quantity: 850,
          status: "正常",
          inboundTime: "2023-10-15",
          shelfLife: "2024-10-15",
          notes: "质量良好"
        }
      ],
      inspection: [],
      production: []
    };

    const updateResponse = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    if (updateResponse.ok) {
      console.log('✅ 测试数据推送成功');
    } else {
      console.log('❌ 测试数据推送失败');
      return;
    }

    // 测试查询
    console.log('\n🎯 测试查询: "查询深圳工厂的库存"');
    
    const response = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: '查询深圳工厂的库存',
        scenario: 'comprehensive_quality',
        analysisMode: 'professional',
        requireDataAnalysis: true
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ 查询执行成功');
      console.log('📋 数据源:', result.source);
      console.log('🤖 AI增强:', result.aiEnhanced);
      console.log('📄 匹配规则:', result.matchedRule);
      console.log('📄 回复长度:', result.reply.length);
      
      // 检查是否包含实际数据
      if (result.reply.includes('深圳工厂') && result.reply.includes('OLED显示屏')) {
        console.log('✅ 回复包含实际数据');
      } else {
        console.log('⚠️ 回复可能不包含实际数据');
      }
      
      console.log('\n📖 完整回复:');
      console.log(result.reply);
      
    } else {
      console.log('❌ 查询执行失败:', response.status);
    }

  } catch (error) {
    console.error('❌ 测试过程出错:', error.message);
  }
}

// 运行测试
testSingleRule();
