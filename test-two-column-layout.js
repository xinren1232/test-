/**
 * 测试新的两列布局AI功能
 */

import fetch from 'node-fetch';

async function testTwoColumnLayout() {
  console.log('🎯 测试两列布局AI功能...\n');

  try {
    // 1. 测试AI健康状态
    console.log('1. 测试AI健康状态...');
    const healthResponse = await fetch('http://localhost:3002/api/assistant/ai-health');
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ AI健康状态:', health.status);
    } else {
      console.log('❌ AI健康检查失败');
      return;
    }

    // 2. 测试复杂分析查询
    console.log('\n2. 测试复杂分析查询...');
    const complexQuery = '分析深圳工厂的整体质量状况，包括库存风险和生产表现';
    
    const queryResponse = await fetch('http://localhost:3002/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: complexQuery })
    });

    if (queryResponse.ok) {
      const result = await queryResponse.json();
      console.log('✅ 复杂查询成功');
      console.log('   查询:', complexQuery);
      console.log('   来源:', result.source);
      console.log('   回复长度:', result.reply.length, '字符');
      console.log('   回复预览:', result.reply.substring(0, 200) + '...');
      
      // 分析回复内容，检查是否包含结构化信息
      const reply = result.reply.toLowerCase();
      console.log('\n📊 回复内容分析:');
      console.log('   包含"质量":', reply.includes('质量') ? '✅' : '❌');
      console.log('   包含"库存":', reply.includes('库存') ? '✅' : '❌');
      console.log('   包含"风险":', reply.includes('风险') ? '✅' : '❌');
      console.log('   包含"建议":', reply.includes('建议') ? '✅' : '❌');
      console.log('   包含"分析":', reply.includes('分析') ? '✅' : '❌');
      
    } else {
      console.log('❌ 复杂查询失败');
    }

    // 3. 测试质量问题分析
    console.log('\n3. 测试质量问题分析...');
    const qualityQuery = '为什么最近的生产不良率有所上升？请分析原因';
    
    const qualityResponse = await fetch('http://localhost:3002/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: qualityQuery })
    });

    if (qualityResponse.ok) {
      const result = await qualityResponse.json();
      console.log('✅ 质量分析成功');
      console.log('   查询:', qualityQuery);
      console.log('   来源:', result.source);
      console.log('   回复预览:', result.reply.substring(0, 200) + '...');
    } else {
      console.log('❌ 质量分析失败');
    }

    // 4. 测试供应商评估
    console.log('\n4. 测试供应商评估...');
    const supplierQuery = '评估紫光供应商的质量表现和风险状况';
    
    const supplierResponse = await fetch('http://localhost:3002/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: supplierQuery })
    });

    if (supplierResponse.ok) {
      const result = await supplierResponse.json();
      console.log('✅ 供应商评估成功');
      console.log('   查询:', supplierQuery);
      console.log('   来源:', result.source);
      console.log('   回复预览:', result.reply.substring(0, 200) + '...');
    } else {
      console.log('❌ 供应商评估失败');
    }

    // 5. 测试优化建议
    console.log('\n5. 测试优化建议...');
    const optimizeQuery = '如何优化当前的质量管理流程？';
    
    const optimizeResponse = await fetch('http://localhost:3002/api/assistant/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: optimizeQuery })
    });

    if (optimizeResponse.ok) {
      const result = await optimizeResponse.json();
      console.log('✅ 优化建议成功');
      console.log('   查询:', optimizeQuery);
      console.log('   来源:', result.source);
      console.log('   回复预览:', result.reply.substring(0, 200) + '...');
    } else {
      console.log('❌ 优化建议失败');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }

  console.log('\n🎯 两列布局测试完成！');
  console.log('\n💡 使用说明:');
  console.log('1. 访问 http://localhost:5173/#/assistant-ai 查看新的两列布局');
  console.log('2. 左侧是对话区域，显示问答过程');
  console.log('3. 右侧是分析结果面板，显示结构化的分析结果');
  console.log('4. 开启AI增强模式后，右侧面板会显示关键指标、洞察和建议');
}

testTwoColumnLayout();
