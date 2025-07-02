/**
 * 快速推送测试数据
 */
import fetch from 'node-fetch';

async function quickPushData() {
  console.log('🚀 快速推送测试数据...\n');
  
  try {
    const testData = {
      inventory: [
        {
          id: 'QUICK_001',
          materialName: '电池盖',
          materialCode: 'CS-S-B001',
          supplier: '聚龙',
          quantity: 1200,
          status: '正常',
          factory: '深圳工厂'
        },
        {
          id: 'QUICK_002',
          materialName: 'OLED显示屏',
          materialCode: 'CS-O-O001',
          supplier: 'BOE',
          quantity: 800,
          status: '风险',
          factory: '深圳工厂'
        },
        {
          id: 'QUICK_003',
          materialName: '锂电池',
          materialCode: 'CS-P-L001',
          supplier: '宁德时代',
          quantity: 600,
          status: '冻结',
          factory: '深圳工厂'
        }
      ],
      inspection: [
        {
          id: 'TEST_QUICK_001',
          materialName: 'OLED显示屏',
          supplier: 'BOE',
          testDate: '2024-06-27',
          testResult: 'FAIL'
        },
        {
          id: 'TEST_QUICK_002',
          materialName: '锂电池',
          supplier: '宁德时代',
          testDate: '2024-06-26',
          testResult: 'FAIL'
        }
      ],
      production: [
        {
          id: 'PROD_QUICK_001',
          materialName: '电池盖',
          supplier: '聚龙',
          factory: '深圳工厂',
          defectRate: 1.2
        },
        {
          id: 'PROD_QUICK_002',
          materialName: 'OLED显示屏',
          supplier: 'BOE',
          factory: '深圳工厂',
          defectRate: 3.5
        }
      ]
    };
    
    const response = await fetch('http://localhost:3002/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 数据推送成功:', result);
      
      // 测试查询
      console.log('\n🎯 测试查询...');
      const queryResponse = await fetch('http://localhost:3002/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: '显示质量趋势分析' })
      });
      
      if (queryResponse.ok) {
        const queryResult = await queryResponse.json();
        console.log('✅ 查询成功');
        console.log('📊 响应类型:', queryResult.type || 'text');
        if (queryResult.type === 'chart') {
          console.log('📋 图表类型:', queryResult.data.chartType);
        }
      }
      
    } else {
      console.log('❌ 数据推送失败:', response.status);
    }
    
    console.log('\n🎉 数据推送完成！现在可以测试智能问答助手了');
    
  } catch (error) {
    console.error('❌ 推送失败:', error.message);
  }
}

quickPushData().catch(console.error);
