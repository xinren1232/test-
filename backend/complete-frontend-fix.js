import mysql from 'mysql2/promise';
import fetch from 'node-fetch';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
});

/**
 * 完整修复前端Function not supported问题
 */

async function completeFrontendFix() {
  try {
    console.log('🔧 开始完整修复前端Function not supported问题...\n');
    
    // 1. 验证后端数据库状态
    console.log('📋 1. 验证后端数据库状态...');
    await verifyBackendDatabase();
    
    // 2. 测试后端API服务
    console.log('\n🌐 2. 测试后端API服务...');
    await testBackendAPIService();
    
    // 3. 检查前端可能的问题
    console.log('\n🔍 3. 检查前端可能的问题...');
    await checkFrontendIssues();
    
    // 4. 提供完整解决方案
    console.log('\n💡 4. 提供完整解决方案...');
    await provideCompleteSolution();
    
    console.log('\n🎉 完整修复方案已生成！');
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
  } finally {
    await connection.end();
  }
}

/**
 * 验证后端数据库状态
 */
async function verifyBackendDatabase() {
  // 测试几个不同类型的规则
  const testRules = [
    '库存状态查询',
    '上线情况查询', 
    '测试结果查询',
    'BOE的LCD显示屏查询'
  ];
  
  let successCount = 0;
  
  for (const ruleName of testRules) {
    try {
      const [rules] = await connection.execute(`
        SELECT intent_name, action_target
        FROM nlp_intent_rules 
        WHERE intent_name LIKE '%${ruleName.split('的')[0]}%' AND status = 'active'
        LIMIT 1
      `);
      
      if (rules.length > 0) {
        const rule = rules[0];
        const [results] = await connection.execute(rule.action_target);
        
        // 检查是否有Function not supported错误
        const hasErrors = results.some(record => 
          Object.values(record).some(value => 
            typeof value === 'string' && value.includes('Function not supported')
          )
        );
        
        if (hasErrors) {
          console.log(`❌ ${rule.intent_name}: 包含Function not supported错误`);
        } else {
          console.log(`✅ ${rule.intent_name}: ${results.length}条记录，无错误`);
          successCount++;
        }
      }
    } catch (error) {
      console.log(`❌ ${ruleName}: SQL执行失败 - ${error.message.substring(0, 50)}...`);
    }
  }
  
  console.log(`\n📊 数据库测试结果: ${successCount}/${testRules.length} 成功`);
  
  if (successCount === testRules.length) {
    console.log('✅ 后端数据库100%正常，无Function not supported错误');
  } else {
    console.log('❌ 后端数据库仍有问题，需要进一步修复');
  }
}

/**
 * 测试后端API服务
 */
async function testBackendAPIService() {
  const apiURL = 'http://localhost:3001';
  
  // 1. 测试健康检查
  console.log('🏥 测试健康检查...');
  try {
    const healthResponse = await fetch(`${apiURL}/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log(`✅ 后端API服务正常运行: ${healthData.service}`);
    } else {
      console.log(`❌ 健康检查失败: ${healthResponse.status}`);
      return;
    }
  } catch (error) {
    console.log(`❌ 无法连接到后端API服务: ${error.message}`);
    console.log('💡 请确保运行: node backend/enhanced-qa-api.js');
    return;
  }
  
  // 2. 测试智能问答API
  console.log('\n🤖 测试智能问答API...');
  const testQuestions = [
    '查询库存状态',
    '查询BOE供应商',
    '查询测试结果'
  ];
  
  for (const question of testQuestions) {
    try {
      console.log(`📝 测试问题: "${question}"`);
      
      const response = await fetch(`${apiURL}/api/intelligent-qa/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          console.log(`  ✅ API调用成功: ${result.data.dataCount}条记录`);
          console.log(`  📋 匹配规则: ${result.data.matchedRule}`);
          
          // 检查返回数据是否有Function not supported错误
          if (result.data.queryData) {
            const hasErrors = result.data.queryData.some(record => 
              Object.values(record).some(value => 
                typeof value === 'string' && value.includes('Function not supported')
              )
            );
            
            if (hasErrors) {
              console.log(`  ❌ API返回数据包含Function not supported错误`);
            } else {
              console.log(`  ✅ API返回数据正常，无Function not supported错误`);
            }
          }
        } else {
          console.log(`  ❌ API返回失败: ${result.error || '未知错误'}`);
        }
      } else {
        console.log(`  ❌ API调用失败: ${response.status}`);
      }
    } catch (error) {
      console.log(`  ❌ API调用异常: ${error.message}`);
    }
  }
}

/**
 * 检查前端可能的问题
 */
async function checkFrontendIssues() {
  console.log('🔍 分析前端可能的问题源:');
  
  console.log('\n📋 可能的问题原因:');
  console.log('1. 前端缓存了旧的数据或规则');
  console.log('2. 前端在某些地方仍在使用VirtualSQLEngine');
  console.log('3. 前端API代理配置问题');
  console.log('4. 浏览器缓存问题');
  
  console.log('\n🎯 需要检查的前端文件:');
  console.log('- src/components/IntelligentQAInterface.vue (主要问答界面)');
  console.log('- src/utils/VirtualSQLEngine.js (如果存在)');
  console.log('- vite.config.js (API代理配置)');
  console.log('- localStorage (浏览器本地存储)');
  
  console.log('\n🔍 前端调用流程分析:');
  console.log('正确流程: 前端 -> /api/intelligent-qa/ask -> 后端API -> MySQL -> 返回真实数据');
  console.log('错误流程: 前端 -> VirtualSQLEngine -> Function not supported');
}

/**
 * 提供完整解决方案
 */
async function provideCompleteSolution() {
  console.log('💡 完整解决方案:');
  
  console.log('\n🚀 立即执行步骤:');
  console.log('1. 确保后端API服务正在运行:');
  console.log('   cd backend && node enhanced-qa-api.js');
  console.log('');
  console.log('2. 清除前端缓存 (在浏览器控制台执行):');
  console.log('   localStorage.clear()');
  console.log('   sessionStorage.clear()');
  console.log('');
  console.log('3. 硬刷新前端页面:');
  console.log('   Ctrl+Shift+R (Windows/Linux) 或 Cmd+Shift+R (Mac)');
  console.log('');
  console.log('4. 检查浏览器网络面板:');
  console.log('   F12 -> Network -> 查看API调用是否正确');
  
  console.log('\n🧪 验证修复的测试脚本:');
  const testScript = `
// 在浏览器控制台执行此脚本
async function verifyFix() {
  console.log('🧪 开始验证修复...');
  
  // 清除缓存
  localStorage.clear();
  sessionStorage.clear();
  console.log('✅ 缓存已清除');
  
  // 测试API调用
  try {
    const response = await fetch('/api/intelligent-qa/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: '查询库存状态' })
    });
    
    const result = await response.json();
    console.log('📡 API响应:', result);
    
    if (result.success && result.data.queryData) {
      const hasErrors = result.data.queryData.some(record => 
        Object.values(record).some(value => 
          typeof value === 'string' && value.includes('Function not supported')
        )
      );
      
      if (hasErrors) {
        console.log('❌ 仍有Function not supported错误');
        console.log('💡 请检查后端API是否正确启动');
      } else {
        console.log('✅ 修复成功！无Function not supported错误');
        console.log('📊 返回数据:', result.data.queryData.slice(0, 2));
      }
    } else {
      console.log('❌ API调用失败或无数据');
    }
  } catch (error) {
    console.log('❌ API调用异常:', error);
  }
}

verifyFix();
  `;
  
  console.log(testScript);
  
  console.log('\n📋 如果问题仍然存在:');
  console.log('1. 检查vite.config.js中的API代理配置');
  console.log('2. 确认前端开发服务器端口 (通常是5173)');
  console.log('3. 确认后端API服务器端口 (应该是3001)');
  console.log('4. 检查防火墙或网络连接问题');
  
  console.log('\n🔧 高级调试步骤:');
  console.log('1. 在浏览器开发者工具中查看Network面板');
  console.log('2. 检查API请求是否正确发送到 /api/intelligent-qa/ask');
  console.log('3. 查看API响应内容是否包含Function not supported');
  console.log('4. 如果API响应正常但前端仍显示错误，检查前端数据处理逻辑');
  
  console.log('\n✅ 预期结果:');
  console.log('修复成功后，前端应该显示:');
  console.log('- 正确的中文字段名 (工厂、仓库、物料编码等)');
  console.log('- 真实的IQE业务数据 (聚龙、BOE等供应商)');
  console.log('- 无Function not supported错误');
  console.log('- 完整的查询结果表格');
}

// 执行完整修复
completeFrontendFix();
