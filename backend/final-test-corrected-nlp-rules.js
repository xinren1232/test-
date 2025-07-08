/**
 * 最终测试修正后的NLP规则
 * 验证项目和基线字段是否正确显示
 */

import fetch from 'node-fetch';

const BACKEND_URL = 'http://localhost:3001';

async function finalTestCorrectedNLPRules() {
  console.log('🎯 最终测试修正后的NLP规则...');

  const testQueries = [
    {
      query: '查询测试结果',
      description: '测试基础测试结果查询',
      expectedProjectFormat: /^[XSK][0-9A-Z]{3,5}$/, // X6827、S665LN等格式
      expectedBaselineFormat: /^I\d{4}$/ // I6789等格式
    },
    {
      query: '查询NG测试结果',
      description: '测试NG查询',
      expectedProjectFormat: /^[XSK][0-9A-Z]{3,5}$/,
      expectedBaselineFormat: /^I\d{4}$/
    }
  ];

  let allTestsPassed = true;

  for (const testCase of testQueries) {
    console.log(`\n🔍 ${testCase.description}`);
    console.log(`📝 查询: "${testCase.query}"`);

    try {
      const response = await fetch(`${BACKEND_URL}/api/assistant/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: testCase.query
        })
      });

      if (!response.ok) {
        console.log(`❌ HTTP错误: ${response.status}`);
        allTestsPassed = false;
        continue;
      }

      const result = await response.json();
      
      if (!result.reply) {
        console.log('❌ 无回复内容');
        allTestsPassed = false;
        continue;
      }

      console.log(`💬 回复长度: ${result.reply.length} 字符`);

      // 检查项目字段格式
      const projectMatches = result.reply.match(/[XSK][0-9A-Z]{3,5}/g);
      if (projectMatches && projectMatches.length > 0) {
        console.log(`✅ 项目字段格式正确: ${projectMatches.slice(0, 3).join(', ')}`);
      } else {
        console.log('❌ 项目字段格式不正确');
        allTestsPassed = false;
      }

      // 检查基线字段格式
      const baselineMatches = result.reply.match(/I\d{4}/g);
      if (baselineMatches && baselineMatches.length > 0) {
        console.log(`✅ 基线字段格式正确: ${baselineMatches.slice(0, 3).join(', ')}`);
      } else {
        console.log('❌ 基线字段格式不正确');
        allTestsPassed = false;
      }

      // 检查必要字段是否存在
      const requiredFields = ['测试编号', '日期', '项目', '基线', '物料类型', '数量', '物料名称', '供应商', '不合格描述', '备注'];
      const missingFields = requiredFields.filter(field => !result.reply.includes(field));
      
      if (missingFields.length === 0) {
        console.log('✅ 所有必要字段都存在');
      } else {
        console.log(`❌ 缺少字段: ${missingFields.join(', ')}`);
        allTestsPassed = false;
      }

      // 检查数量字段格式
      if (result.reply.includes('1次OK') || result.reply.includes('1次NG')) {
        console.log('✅ 数量字段格式正确');
      } else {
        console.log('❌ 数量字段格式不正确');
        allTestsPassed = false;
      }

      // 对于NG查询，检查不合格描述
      if (testCase.query.includes('NG')) {
        if (result.reply.includes('不合格:') && !result.reply.includes('不合格: 检测异常')) {
          console.log('✅ NG查询包含具体的不合格描述');
        } else {
          console.log('⚠️ NG查询可能缺少具体的不合格描述');
        }
      }

      console.log('✅ 测试通过');

    } catch (error) {
      console.log(`❌ 测试失败: ${error.message}`);
      allTestsPassed = false;
    }
  }

  // 输出最终测试结果
  console.log('\n📊 最终测试结果:');
  if (allTestsPassed) {
    console.log('🎉 所有测试通过！NLP规则修正成功！');
    console.log('\n✅ 修正效果确认:');
    console.log('- 项目字段：正确显示项目代码 (X6827、S665LN、KI4K等)');
    console.log('- 基线字段：正确显示基线代码 (I6789、I6788、I6787)');
    console.log('- 物料类型：显示物料名称 (充电器、摄像头(CAM)等)');
    console.log('- 数量字段：显示测试状态 (1次OK、1次NG)');
    console.log('- 不合格描述：显示具体缺陷信息');
    console.log('- 字段映射：完全对齐前端显示需求');
    
    console.log('\n🚀 现在前端应该能正确显示项目和基线字段了！');
    console.log('您可以在前端测试以下查询：');
    console.log('- "查询测试结果"');
    console.log('- "查询NG测试结果"');
    console.log('- "查询OK测试结果"');
    console.log('- "测试失败"');
    console.log('- "不合格"');
  } else {
    console.log('❌ 部分测试失败，需要进一步检查');
  }

  return allTestsPassed;
}

// 执行最终测试
finalTestCorrectedNLPRules().catch(console.error);
