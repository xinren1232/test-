/**
 * 测试最终修复结果
 */
import fetch from 'node-fetch';

async function testFinalFix() {
  console.log('🎯 测试最终修复结果...\n');
  
  try {
    // 1. 推送测试数据
    console.log('📊 步骤1: 推送测试数据...');
    
    const testData = {
      inventory: [
        {
          id: 'INV_001',
          materialName: '电池盖',
          materialCode: 'CS-S-B001',
          materialType: '结构件类',
          batchNo: 'JL2024001',
          supplier: '聚龙',
          quantity: 1200,
          status: '正常',
          warehouse: '深圳库存',
          factory: '深圳工厂'
        },
        {
          id: 'INV_002',
          materialName: 'OLED显示屏',
          materialCode: 'CS-O-O001',
          materialType: '光学类',
          batchNo: 'BOE2024001',
          supplier: 'BOE',
          quantity: 800,
          status: '风险',
          warehouse: '深圳库存',
          factory: '深圳工厂'
        },
        {
          id: 'INV_003',
          materialName: '中框',
          materialCode: 'CS-S-Z001',
          materialType: '结构件类',
          batchNo: 'JL2024002',
          supplier: '聚龙',
          quantity: 500,
          status: '冻结',
          warehouse: '重庆库存',
          factory: '重庆工厂'
        }
      ],
      inspection: [
        {
          id: 'TEST_001',
          materialName: 'OLED显示屏',
          batchNo: 'BOE2024001',
          supplier: 'BOE',
          testDate: '2025-06-11',
          testResult: 'FAIL',
          defectDescription: '显示异常'
        }
      ],
      production: [
        {
          id: 'PROD_001',
          materialName: '电池盖',
          batchNo: 'JL2024001',
          supplier: '聚龙',
          factory: '深圳工厂',
          defectRate: 1.2
        }
      ]
    };
    
    // 推送到后端
    const pushResponse = await fetch('http://localhost:3002/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    if (!pushResponse.ok) {
      throw new Error(`数据推送失败: ${pushResponse.status}`);
    }
    
    const pushResult = await pushResponse.json();
    console.log('✅ 数据推送成功:', pushResult.message);
    
    // 2. 测试前端代理API调用（修复后）
    console.log('\n📊 步骤2: 测试修复后的前端代理API调用...');
    
    const testQueries = [
      '查询聚龙供应商的物料',
      '查询深圳工厂的库存情况',
      '目前有哪些风险库存？',
      '查询冻结状态的物料',
      '有哪些测试不合格的记录？',
      '工厂数据汇总'
    ];
    
    let successCount = 0;
    let totalCount = testQueries.length;
    
    for (const query of testQueries) {
      console.log(`\n🎯 测试查询: "${query}"`);
      
      try {
        // 通过前端代理调用
        const proxyResponse = await fetch('http://localhost:5173/api/assistant/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query })
        });
        
        if (proxyResponse.ok) {
          const proxyResult = await proxyResponse.json();
          
          if (proxyResult.reply && proxyResult.reply.length > 50) {
            console.log('✅ 查询成功');
            console.log('📋 内容长度:', proxyResult.reply.length);
            console.log('📋 内容预览:', proxyResult.reply.substring(0, 80) + '...');
            successCount++;
          } else {
            console.log('⚠️ 查询返回内容过短');
            console.log('📋 完整响应:', proxyResult.reply || '无内容');
          }
        } else {
          console.log('❌ 前端代理失败:', proxyResponse.status);
          const errorText = await proxyResponse.text();
          console.log('📋 错误详情:', errorText.substring(0, 100));
        }
      } catch (error) {
        console.log('❌ 前端代理调用异常:', error.message);
      }
    }
    
    // 3. 总结结果
    console.log('\n🎉 测试完成！');
    console.log(`\n📊 测试结果统计:`);
    console.log(`✅ 成功查询: ${successCount}/${totalCount}`);
    console.log(`📈 成功率: ${((successCount / totalCount) * 100).toFixed(1)}%`);
    
    if (successCount === totalCount) {
      console.log('\n🎉 恭喜！所有查询都成功了！');
      console.log('现在你可以在前端正常使用问答功能了。');
    } else if (successCount > 0) {
      console.log('\n⚠️ 部分查询成功，可能需要进一步调试。');
      console.log('建议检查失败的查询规则。');
    } else {
      console.log('\n❌ 所有查询都失败了。');
      console.log('建议检查前端配置和环境变量。');
    }
    
    // 4. 提供使用指南
    console.log('\n📋 使用指南:');
    console.log('1. 确保前端服务已重启以应用配置更改');
    console.log('2. 在前端数据管理页面生成数据');
    console.log('3. 在问答助手页面测试以下查询:');
    console.log('   - "查询聚龙供应商的物料"');
    console.log('   - "查询深圳工厂的库存情况"');
    console.log('   - "目前有哪些风险库存？"');
    console.log('   - "工厂数据汇总"');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testFinalFix().catch(console.error);
