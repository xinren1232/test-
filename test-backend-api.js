/**
 * 测试后端API连接
 */
import fetch from 'node-fetch';

async function testBackendAPI() {
  console.log('🔧 测试后端API连接...\n');
  
  try {
    // 1. 测试健康检查
    console.log('📊 步骤1: 测试健康检查...');
    
    try {
      const healthResponse = await fetch('http://localhost:3001/api/health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('✅ 健康检查成功:', healthData);
      } else {
        console.log('❌ 健康检查失败:', healthResponse.status);
      }
    } catch (error) {
      console.log('❌ 健康检查连接失败:', error.message);
      return;
    }

    // 2. 推送测试数据
    console.log('\n📊 步骤2: 推送测试数据...');
    
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

    try {
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
        console.log('❌ 测试数据推送失败:', updateResponse.status);
      }
    } catch (error) {
      console.log('❌ 测试数据推送错误:', error.message);
    }

    // 3. 测试查询API
    console.log('\n📊 步骤3: 测试查询API...');
    
    try {
      const queryResponse = await fetch('http://localhost:3001/api/assistant/query', {
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

      if (queryResponse.ok) {
        const result = await queryResponse.json();
        console.log('✅ 查询API成功');
        console.log('📋 数据源:', result.source);
        console.log('🤖 AI增强:', result.aiEnhanced);
        console.log('📄 匹配规则:', result.matchedRule);
        console.log('📄 回复长度:', result.reply.length);
        
        // 显示回复预览
        const preview = result.reply.length > 200 ? 
          result.reply.substring(0, 200) + '...' : 
          result.reply;
        console.log('📖 回复预览:', preview);
        
      } else {
        console.log('❌ 查询API失败:', queryResponse.status);
        const errorText = await queryResponse.text();
        console.log('❌ 错误详情:', errorText);
      }
    } catch (error) {
      console.log('❌ 查询API错误:', error.message);
    }

    console.log('\n🎯 后端API测试完成！');

  } catch (error) {
    console.error('❌ 测试过程出错:', error.message);
  }
}

// 运行测试
testBackendAPI();
