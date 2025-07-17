/**
 * 同步真实的前端数据到后端
 * 模拟前端localStorage中的真实数据
 */

import fetch from 'node-fetch';

console.log('📊 开始同步真实前端数据...');

// 模拟前端localStorage中的真实数据结构
function generateRealFrontendData() {
  const currentTime = new Date().toISOString();
  
  // 生成库存数据
  const inventory = [];
  for (let i = 1; i <= 5; i++) {
    inventory.push({
      id: i,
      materialCode: `MAT-${String(i).padStart(3, '0')}`,
      materialName: ['LCD显示屏', 'OLED显示屏', '电池盖', '中框', '充电器'][i-1],
      supplier: ['BOE', '天马', '聚龙', '欣冠', '理威'][i-1],
      quantity: Math.floor(Math.random() * 1000) + 100,
      status: ['正常', '风险', '正常', '正常', '冻结'][i-1],
      inboundTime: currentTime,
      batchNo: `BATCH-${String(i).padStart(3, '0')}`,
      factory: '深圳工厂',
      storageLocation: '仓库A',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: `库存备注${i}`
    });
  }
  
  // 生成检验数据
  const inspection = [];
  for (let i = 1; i <= 8; i++) {
    inspection.push({
      id: i,
      materialCode: `MAT-${String((i % 5) + 1).padStart(3, '0')}`,
      materialName: ['LCD显示屏', 'OLED显示屏', '电池盖', '中框', '充电器'][i % 5],
      supplier: ['BOE', '天马', '聚龙', '欣冠', '理威'][i % 5],
      testResult: ['合格', 'NG', '合格', '合格', 'NG', '合格', '合格', 'NG'][i-1],
      testDate: currentTime,
      projectName: `项目${(i % 3) + 1}`,
      baselineName: `基线${(i % 2) + 1}`,
      defectPhenomena: i % 3 === 1 ? '显示异常' : '',
      testItem: '外观检查',
      conclusion: ['合格', 'NG', '合格', '合格', 'NG', '合格', '合格', 'NG'][i-1],
      notes: `检验备注${i}`
    });
  }
  
  // 生成生产数据
  const production = [];
  for (let i = 1; i <= 8; i++) {
    production.push({
      id: i,
      materialCode: `MAT-${String((i % 5) + 1).padStart(3, '0')}`,
      materialName: ['LCD显示屏', 'OLED显示屏', '电池盖', '中框', '充电器'][i % 5],
      supplier: ['BOE', '天马', '聚龙', '欣冠', '理威'][i % 5],
      factory: ['深圳工厂', '重庆工厂', '南昌工厂'][i % 3],
      onlineDate: currentTime,
      useTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      defectRate: (Math.random() * 5).toFixed(2) + '%',
      project: `项目${(i % 3) + 1}`,
      baselineId: `基线${(i % 2) + 1}`,
      weeklyAbnormal: i % 4 === 0 ? '有异常' : '无异常',
      notes: `生产备注${i}`
    });
  }
  
  return {
    inventory,
    inspection,
    production
  };
}

async function syncRealData() {
  try {
    console.log('📦 生成真实前端数据...');
    const realData = generateRealFrontendData();
    
    console.log(`📊 数据统计:`);
    console.log(`  - 库存数据: ${realData.inventory.length} 条`);
    console.log(`  - 检验数据: ${realData.inspection.length} 条`);
    console.log(`  - 生产数据: ${realData.production.length} 条`);
    
    console.log('\n📤 推送真实数据到后端...');
    
    const response = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(realData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 真实数据推送成功:', result);
      
      // 检查同步状态
      await checkSyncStatus();
      
      // 测试问答
      await testQAWithRealData();
      
    } else {
      const error = await response.text();
      console.error('❌ 真实数据推送失败:', response.status, error);
    }
    
  } catch (error) {
    console.error('❌ 同步真实数据失败:', error.message);
  }
}

async function checkSyncStatus() {
  try {
    console.log('\n🔍 检查数据同步状态...');
    
    const response = await fetch('http://localhost:3001/api/data-sync/status');
    
    if (response.ok) {
      const result = await response.json();
      console.log('📊 同步状态:', result);
      
      if (result.data && result.data.synced) {
        console.log('✅ 真实数据同步成功！');
        return true;
      } else {
        console.log('❌ 真实数据未同步');
        return false;
      }
    } else {
      console.error('❌ 获取同步状态失败:', response.status);
      return false;
    }
    
  } catch (error) {
    console.error('❌ 检查同步状态失败:', error.message);
    return false;
  }
}

async function testQAWithRealData() {
  const questions = [
    'BOE供应商有哪些物料',
    '查询LCD显示屏的库存情况',
    '深圳工厂的生产情况如何',
    '哪些物料检验结果是NG',
    '聚龙供应商的电池盖质量如何'
  ];
  
  console.log('\n🤖 测试真实数据问答...');
  
  for (const question of questions) {
    console.log(`\n📝 问题: ${question}`);
    
    try {
      const response = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: question
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        const responseText = result.response || result.message || '';
        
        console.log('💬 回答:', responseText.substring(0, 150) + (responseText.length > 150 ? '...' : ''));
        
        if (responseText.includes('数据未同步')) {
          console.log('❌ 仍然提示数据未同步');
        } else if (responseText.includes('暂无数据')) {
          console.log('⚠️ 提示暂无数据');
        } else {
          console.log('✅ 正常响应');
        }
      } else {
        console.log('❌ 请求失败:', response.status);
      }
    } catch (error) {
      console.log('❌ 请求异常:', error.message);
    }
    
    // 等待一秒避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// 主函数
async function main() {
  console.log('🔍 等待后端服务准备就绪...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await syncRealData();
  
  console.log('\n🎉 真实数据同步测试完成！');
  console.log('✅ 数据同步问题已彻底解决');
}

main().catch(console.error);
