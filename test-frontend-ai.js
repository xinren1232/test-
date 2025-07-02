/**
 * 测试前端AI问答功能的网络请求
 */
import fetch from 'node-fetch';

async function testFrontendAI() {
  console.log('🔧 测试前端AI问答功能...\n');
  
  try {
    // 1. 测试前端代理路径
    console.log('📊 步骤1: 测试前端代理路径...');
    
    const frontendProxyUrl = 'http://localhost:5173/api/assistant/query';
    const directBackendUrl = 'http://localhost:3001/api/assistant/query';
    
    const testQuery = {
      query: '你好，请介绍一下你的功能',
      scenario: 'comprehensive_quality',
      analysisMode: 'professional',
      requireDataAnalysis: true
    };

    // 测试直接后端访问
    console.log('🎯 测试直接后端访问...');
    try {
      const directResponse = await fetch(directBackendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testQuery)
      });

      if (directResponse.ok) {
        const directResult = await directResponse.json();
        console.log('✅ 直接后端访问成功');
        console.log('📋 数据源:', directResult.source || '未知');
        console.log('🤖 AI增强:', directResult.aiEnhanced ? '是' : '否');
        console.log('📄 回复长度:', directResult.reply.length, '字符');
      } else {
        console.log('❌ 直接后端访问失败:', directResponse.status, directResponse.statusText);
      }
    } catch (error) {
      console.log('❌ 直接后端访问错误:', error.message);
    }

    // 测试前端代理访问
    console.log('\n🎯 测试前端代理访问...');
    try {
      const proxyResponse = await fetch(frontendProxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testQuery)
      });

      if (proxyResponse.ok) {
        const proxyResult = await proxyResponse.json();
        console.log('✅ 前端代理访问成功');
        console.log('📋 数据源:', proxyResult.source || '未知');
        console.log('🤖 AI增强:', proxyResult.aiEnhanced ? '是' : '否');
        console.log('📄 回复长度:', proxyResult.reply.length, '字符');
      } else {
        console.log('❌ 前端代理访问失败:', proxyResponse.status, proxyResponse.statusText);
        const errorText = await proxyResponse.text();
        console.log('❌ 错误详情:', errorText);
      }
    } catch (error) {
      console.log('❌ 前端代理访问错误:', error.message);
    }

    // 2. 测试不同类型的查询
    console.log('\n📊 步骤2: 测试不同类型的查询...');
    
    const testQueries = [
      {
        name: 'AI增强查询',
        query: '请分析一下当前的质量管理情况',
        scenario: 'comprehensive_quality'
      },
      {
        name: '业务数据查询',
        query: '查询深圳工厂的库存',
        scenario: 'material_inventory'
      },
      {
        name: '质量检测查询',
        query: '查询测试不合格的记录',
        scenario: 'quality_inspection'
      }
    ];

    for (const testCase of testQueries) {
      console.log(`\n🎯 测试${testCase.name}: "${testCase.query}"`);
      
      try {
        const response = await fetch(directBackendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: testCase.query,
            scenario: testCase.scenario,
            analysisMode: 'professional',
            requireDataAnalysis: true
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ 查询成功');
          console.log('📋 数据源:', result.source || '未知');
          console.log('🤖 AI增强:', result.aiEnhanced ? '是' : '否');
          console.log('📄 匹配规则:', result.matchedRule || '无');
          console.log('📄 回复长度:', result.reply.length, '字符');
        } else {
          console.log('❌ 查询失败:', response.status, response.statusText);
        }
      } catch (error) {
        console.log('❌ 查询错误:', error.message);
      }
    }

    console.log('\n🎯 前端AI问答功能测试完成！');

  } catch (error) {
    console.error('❌ 测试过程出错:', error.message);
  }
}

// 运行测试
testFrontendAI();
