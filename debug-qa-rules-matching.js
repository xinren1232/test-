/**
 * 调试问答规则匹配问题
 */
import fetch from 'node-fetch';

async function debugQARulesMatching() {
  console.log('🔧 调试问答规则匹配问题...\n');
  
  try {
    // 1. 首先检查后端数据状态
    console.log('📊 步骤1: 检查后端数据状态...');
    
    try {
      const healthResponse = await fetch('http://localhost:3001/api/health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('✅ 后端服务正常:', healthData.message);
      } else {
        console.log('❌ 后端服务异常:', healthResponse.status);
        return;
      }
    } catch (error) {
      console.log('❌ 后端服务连接失败:', error.message);
      return;
    }

    // 2. 推送测试数据确保有数据可查询
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
        },
        {
          id: "INV_002",
          factory: "重庆工厂",
          warehouse: "B区仓库",
          materialCode: "DS-B-M3421",
          materialName: "电池盖",
          supplier: "立讯精密",
          batchCode: "T14128",
          quantity: 1200,
          status: "正常",
          inboundTime: "2023-10-16",
          shelfLife: "2024-10-16",
          notes: "新到货"
        }
      ],
      inspection: [
        {
          id: "TEST_001",
          testDate: "2023-10-15",
          materialName: "OLED显示屏",
          testResult: "PASS",
          defectPhenomena: "无"
        }
      ],
      production: [
        {
          id: "PROD_001",
          materialName: "OLED显示屏",
          defectRate: 2.1,
          defect: "轻微色差"
        }
      ]
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

    // 3. 测试具体的规则查询
    console.log('\n📊 步骤3: 测试具体的规则查询...');
    
    const testQueries = [
      {
        name: '查询深圳工厂库存',
        query: '查询深圳工厂的库存',
        expectedMatch: 'query_inventory_general'
      },
      {
        name: '查询深圳工厂库存情况',
        query: '查询深圳工厂的库存情况',
        expectedMatch: 'query_inventory_general'
      },
      {
        name: '查询BOE供应商物料',
        query: '查询BOE供应商的物料',
        expectedMatch: 'query_inventory_general'
      },
      {
        name: '查询OLED显示屏库存',
        query: '查询OLED显示屏的库存',
        expectedMatch: 'query_material_by_name'
      },
      {
        name: '库存查询',
        query: '库存查询',
        expectedMatch: 'query_inventory_general'
      }
    ];

    for (const testCase of testQueries) {
      console.log(`\n🎯 测试查询: "${testCase.query}"`);
      console.log(`📝 期望匹配: ${testCase.expectedMatch}`);
      
      try {
        const startTime = Date.now();
        
        const response = await fetch('http://localhost:3001/api/assistant/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: testCase.query,
            scenario: 'comprehensive_quality',
            analysisMode: 'professional',
            requireDataAnalysis: true
          })
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        if (response.ok) {
          const result = await response.json();
          console.log('✅ 查询执行成功');
          console.log('📋 数据源:', result.source || '未知');
          console.log('🤖 AI增强:', result.aiEnhanced ? '是' : '否');
          console.log('📄 匹配规则:', result.matchedRule || '无');
          console.log('⏱️ 响应时间:', responseTime, 'ms');
          console.log('📄 回复长度:', result.reply.length, '字符');
          
          // 分析回复内容
          if (result.reply.includes('抱歉') || result.reply.includes('无法') || result.reply.includes('暂时')) {
            console.log('⚠️ 回复显示查询失败');
          } else if (result.reply.includes('深圳工厂') || result.reply.includes('BOE') || result.reply.includes('OLED')) {
            console.log('✅ 回复包含相关内容');
          } else {
            console.log('⚠️ 回复内容可能不相关');
          }
          
          // 显示回复预览
          const preview = result.reply.length > 200 ? 
            result.reply.substring(0, 200) + '...' : 
            result.reply;
          console.log('📖 回复预览:', preview);
          
        } else {
          console.log('❌ 查询执行失败:', response.status, response.statusText);
          const errorText = await response.text();
          console.log('❌ 错误详情:', errorText);
        }
      } catch (error) {
        console.log('❌ 查询执行错误:', error.message);
      }
      
      console.log('-'.repeat(60));
    }

    console.log('\n🎯 问答规则匹配调试完成！');

  } catch (error) {
    console.error('❌ 调试过程出错:', error.message);
  }
}

// 运行调试
debugQARulesMatching();
