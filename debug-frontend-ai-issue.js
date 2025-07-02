/**
 * 调试前端AI问答功能问题
 */
import fetch from 'node-fetch';

async function debugFrontendAIIssue() {
  console.log('🔧 调试前端AI问答功能问题...\n');
  
  try {
    // 1. 检查后端服务状态
    console.log('📊 步骤1: 检查后端服务状态...');
    
    try {
      const healthResponse = await fetch('http://localhost:3001/api/health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('✅ 后端服务正常:', healthData.message);
      } else {
        console.log('❌ 后端服务异常:', healthResponse.status);
      }
    } catch (error) {
      console.log('❌ 后端服务连接失败:', error.message);
      return;
    }

    // 2. 测试前端代理路径
    console.log('\n📊 步骤2: 测试前端代理路径...');
    
    const testQuery = {
      query: '你好，请介绍一下你的功能',
      scenario: 'comprehensive_quality',
      analysisMode: 'professional',
      requireDataAnalysis: true
    };

    // 测试直接后端访问
    console.log('🎯 测试直接后端访问...');
    try {
      const directResponse = await fetch('http://localhost:3001/api/assistant/query', {
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
        console.log('📄 回复预览:', directResult.reply.substring(0, 100) + '...');
      } else {
        console.log('❌ 直接后端访问失败:', directResponse.status, directResponse.statusText);
        const errorText = await directResponse.text();
        console.log('❌ 错误详情:', errorText);
      }
    } catch (error) {
      console.log('❌ 直接后端访问错误:', error.message);
    }

    // 测试前端代理访问
    console.log('\n🎯 测试前端代理访问...');
    try {
      const proxyResponse = await fetch('http://localhost:5173/api/assistant/query', {
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
        console.log('📄 回复预览:', proxyResult.reply.substring(0, 100) + '...');
      } else {
        console.log('❌ 前端代理访问失败:', proxyResponse.status, proxyResponse.statusText);
        const errorText = await proxyResponse.text();
        console.log('❌ 错误详情:', errorText);
      }
    } catch (error) {
      console.log('❌ 前端代理访问错误:', error.message);
    }

    // 3. 检查前端服务状态
    console.log('\n📊 步骤3: 检查前端服务状态...');
    try {
      const frontendResponse = await fetch('http://localhost:5173/');
      if (frontendResponse.ok) {
        console.log('✅ 前端服务正常运行');
      } else {
        console.log('❌ 前端服务异常:', frontendResponse.status);
      }
    } catch (error) {
      console.log('❌ 前端服务连接失败:', error.message);
    }

    // 4. 测试不同类型的查询
    console.log('\n📊 步骤4: 测试不同类型的查询...');
    
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
        name: '简单问候',
        query: '你好',
        scenario: 'comprehensive_quality'
      }
    ];

    for (const testCase of testQueries) {
      console.log(`\n🎯 测试${testCase.name}: "${testCase.query}"`);
      
      try {
        const response = await fetch('http://localhost:3001/api/assistant/query', {
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
          console.log('📄 回复长度:', result.reply.length, '字符');
          
          // 检查回复内容
          if (result.reply && result.reply.length > 0) {
            console.log('✅ 回复内容正常');
          } else {
            console.log('⚠️ 回复内容为空');
          }
        } else {
          console.log('❌ 查询失败:', response.status, response.statusText);
          const errorText = await response.text();
          console.log('❌ 错误详情:', errorText);
        }
      } catch (error) {
        console.log('❌ 查询错误:', error.message);
      }
    }

    console.log('\n🎯 前端AI问答功能调试完成！');

  } catch (error) {
    console.error('❌ 调试过程出错:', error.message);
  }
}

// 运行调试
debugFrontendAIIssue();
