/**
 * 模拟前端数据推送过程
 */
import fetch from 'node-fetch';

async function simulateFrontendPush() {
  console.log('🎭 模拟前端数据推送过程...\n');
  
  try {
    // 1. 模拟前端localStorage中的真实数据结构
    console.log('📊 步骤1: 模拟前端localStorage数据...');
    
    const mockFrontendData = {
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
          factory: '深圳工厂',
          notes: '正常库存'
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
          factory: '深圳工厂',
          notes: '需要重点关注'
        },
        {
          id: 'INV_003',
          materialName: '锂电池',
          materialCode: 'CS-P-L001',
          materialType: '电源类',
          batchNo: 'CATL2024001',
          supplier: '宁德时代',
          quantity: 600,
          status: '冻结',
          warehouse: '深圳库存',
          factory: '深圳工厂',
          notes: '质量问题，暂停使用'
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
        },
        {
          id: 'TEST_002',
          materialName: '锂电池',
          batchNo: 'CATL2024001',
          supplier: '宁德时代',
          testDate: '2025-06-10',
          testResult: 'FAIL',
          defectDescription: '电压不稳定'
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
        },
        {
          id: 'PROD_002',
          materialName: 'OLED显示屏',
          batchNo: 'BOE2024001',
          supplier: 'BOE',
          factory: '深圳工厂',
          defectRate: 3.5
        }
      ]
    };
    
    console.log('📋 模拟数据统计:');
    console.log(`  - 库存数据: ${mockFrontendData.inventory.length} 条`);
    console.log(`  - 检测数据: ${mockFrontendData.inspection.length} 条`);
    console.log(`  - 生产数据: ${mockFrontendData.production.length} 条`);
    
    // 2. 计算数据大小
    const dataSize = JSON.stringify(mockFrontendData).length;
    console.log(`  - 数据大小: ${(dataSize / 1024).toFixed(2)} KB`);
    
    // 3. 模拟前端的推送逻辑
    console.log('\n📊 步骤2: 模拟前端推送逻辑...');
    
    // 3.1 尝试通过前端代理推送
    console.log('🔄 尝试通过前端代理推送...');
    try {
      const proxyResponse = await fetch('http://localhost:5173/api/assistant/update-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockFrontendData)
      });
      
      if (proxyResponse.ok) {
        const proxyResult = await proxyResponse.json();
        console.log('✅ 前端代理推送成功:', proxyResult);
      } else {
        const errorText = await proxyResponse.text();
        console.log('❌ 前端代理推送失败:', proxyResponse.status, errorText);
        
        // 3.2 如果代理失败，尝试直接推送
        console.log('🔄 尝试直接后端推送...');
        const directResponse = await fetch('http://localhost:3001/api/assistant/update-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockFrontendData)
        });
        
        if (directResponse.ok) {
          const directResult = await directResponse.json();
          console.log('✅ 直接后端推送成功:', directResult);
        } else {
          const directErrorText = await directResponse.text();
          console.log('❌ 直接后端推送也失败:', directResponse.status, directErrorText);
        }
      }
    } catch (error) {
      console.log('❌ 推送过程中出现异常:', error.message);
    }
    
    // 4. 验证数据是否成功推送
    console.log('\n📊 步骤3: 验证数据推送结果...');
    
    const testQuery = '查询所有库存状态';
    console.log(`🎯 测试查询: "${testQuery}"`);
    
    const queryResponse = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: testQuery })
    });
    
    if (queryResponse.ok) {
      const queryResult = await queryResponse.json();
      console.log('📋 查询结果:');
      console.log('─'.repeat(50));
      console.log(queryResult.reply);
      console.log('─'.repeat(50));
      
      // 检查结果是否包含我们推送的数据
      const hasElectricCover = queryResult.reply.includes('电池盖');
      const hasOLEDScreen = queryResult.reply.includes('OLED显示屏');
      const hasLithiumBattery = queryResult.reply.includes('锂电池');
      
      console.log('\n🔍 数据验证:');
      console.log(`  - 包含电池盖: ${hasElectricCover ? '✅' : '❌'}`);
      console.log(`  - 包含OLED显示屏: ${hasOLEDScreen ? '✅' : '❌'}`);
      console.log(`  - 包含锂电池: ${hasLithiumBattery ? '✅' : '❌'}`);
      
      if (hasElectricCover && hasOLEDScreen && hasLithiumBattery) {
        console.log('\n🎉 数据推送验证成功！所有测试数据都已正确推送。');
      } else {
        console.log('\n⚠️ 数据推送可能不完整，部分数据未找到。');
      }
    } else {
      console.log('❌ 查询验证失败:', queryResponse.status);
    }
    
    console.log('\n🎉 模拟推送过程完成！');
    
  } catch (error) {
    console.error('❌ 模拟推送过程中出错:', error.message);
  }
}

simulateFrontendPush().catch(console.error);
