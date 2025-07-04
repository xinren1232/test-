/**
 * API问题诊断脚本
 * 用于诊断数据同步和问答查询的后端服务问题
 */

import fetch from 'node-fetch';

async function diagnoseAPIIssue() {
  console.log('🔍 开始诊断API问题...\n');
  
  // 1. 测试后端健康检查
  console.log('📊 步骤1: 测试后端健康检查...');
  try {
    const healthResponse = await fetch('http://localhost:3001/api/health');
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ 后端健康检查成功:', healthData);
    } else {
      console.log('❌ 后端健康检查失败:', healthResponse.status);
      const errorText = await healthResponse.text();
      console.log('错误详情:', errorText);
    }
  } catch (error) {
    console.log('❌ 后端连接失败:', error.message);
  }
  
  // 2. 测试数据同步API
  console.log('\n📊 步骤2: 测试数据同步API...');
  const testData = {
    inventory: [
      {
        batchNo: 'TEST001',
        materialName: '测试物料',
        supplier: '测试供应商',
        quantity: 100,
        factory: '测试工厂',
        status: '正常'
      }
    ],
    lab: [],
    production: []
  };
  
  try {
    const syncResponse = await fetch('http://localhost:3001/api/assistant/update-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    if (syncResponse.ok) {
      const syncResult = await syncResponse.json();
      console.log('✅ 数据同步成功:', syncResult.message);
    } else {
      console.log('❌ 数据同步失败:', syncResponse.status);
      const errorText = await syncResponse.text();
      console.log('错误详情:', errorText);
    }
  } catch (error) {
    console.log('❌ 数据同步连接失败:', error.message);
  }
  
  // 3. 测试问答查询API
  console.log('\n📊 步骤3: 测试问答查询API...');
  try {
    const queryResponse = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: '查询库存状态' })
    });
    
    if (queryResponse.ok) {
      const queryResult = await queryResponse.json();
      console.log('✅ 问答查询成功');
      console.log('📋 回复预览:', queryResult.reply?.substring(0, 100) + '...');
    } else {
      console.log('❌ 问答查询失败:', queryResponse.status);
      const errorText = await queryResponse.text();
      console.log('错误详情:', errorText);
    }
  } catch (error) {
    console.log('❌ 问答查询连接失败:', error.message);
  }
  
  // 4. 测试前端代理
  console.log('\n📊 步骤4: 测试前端代理...');
  try {
    const proxyResponse = await fetch('http://localhost:5173/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: '测试前端代理' })
    });
    
    if (proxyResponse.ok) {
      const proxyResult = await proxyResponse.json();
      console.log('✅ 前端代理成功');
      console.log('📋 回复预览:', proxyResult.reply?.substring(0, 100) + '...');
    } else {
      console.log('❌ 前端代理失败:', proxyResponse.status);
      const errorText = await proxyResponse.text();
      console.log('错误详情:', errorText);
    }
  } catch (error) {
    console.log('❌ 前端代理连接失败:', error.message);
  }
  
  console.log('\n🎉 诊断完成！');
}

// 运行诊断
diagnoseAPIIssue().catch(console.error);
