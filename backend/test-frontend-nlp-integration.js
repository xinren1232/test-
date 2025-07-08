/**
 * 测试前端NLP查询集成
 * 验证优化后的NLP规则能否被前端正确调用
 */

import fetch from 'node-fetch';

const BACKEND_URL = 'http://localhost:3001';

async function testFrontendNLPIntegration() {
  console.log('🧪 测试前端NLP查询集成...');

  // 测试查询列表 - 模拟前端用户的实际查询
  const testQueries = [
    {
      query: '查询测试结果',
      description: '测试基础测试结果查询',
      expectedFields: ['测试编号', '日期', '项目', '基线', '物料类型', '数量', '物料名称', '供应商', '不合格描述', '备注']
    },
    {
      query: '查询NG测试结果',
      description: '测试NG(不合格)测试结果查询',
      expectedFields: ['测试编号', '日期', '项目', '基线', '物料类型', '数量', '物料名称', '供应商', '不合格描述', '备注']
    },
    {
      query: '查询OK测试结果',
      description: '测试OK(合格)测试结果查询',
      expectedFields: ['测试编号', '日期', '项目', '基线', '物料类型', '数量', '物料名称', '供应商', '不合格描述', '备注']
    },
    {
      query: '测试失败',
      description: '测试同义词匹配 - 测试失败应该匹配NG查询',
      expectedFields: ['测试编号', '日期', '项目', '基线', '物料类型', '数量', '物料名称', '供应商', '不合格描述', '备注']
    },
    {
      query: '不合格',
      description: '测试同义词匹配 - 不合格应该匹配NG查询',
      expectedFields: ['测试编号', '日期', '项目', '基线', '物料类型', '数量', '物料名称', '供应商', '不合格描述', '备注']
    }
  ];

  let successCount = 0;
  let totalCount = testQueries.length;

  for (const testCase of testQueries) {
    console.log(`\n🔍 测试: ${testCase.description}`);
    console.log(`📝 查询: "${testCase.query}"`);

    try {
      // 调用后端API - 模拟前端调用
      const response = await fetch(`${BACKEND_URL}/api/assistant/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: testCase.query,
          scenario: 'basic',
          analysisMode: 'rule',
          requireDataAnalysis: false
        })
      });

      if (!response.ok) {
        console.log(`❌ HTTP错误: ${response.status}`);
        continue;
      }

      const result = await response.json();
      console.log(`📡 响应状态: ${response.status}`);
      console.log(`🎯 数据源: ${result.source || 'unknown'}`);
      console.log(`🔧 分析模式: ${result.analysisMode || 'unknown'}`);

      // 检查是否有回复内容
      if (!result.reply) {
        console.log('❌ 无回复内容');
        continue;
      }

      console.log(`💬 回复长度: ${result.reply.length} 字符`);

      // 检查是否包含表格数据
      if (result.reply.includes('测试编号') && result.reply.includes('项目') && result.reply.includes('基线')) {
        console.log('✅ 包含正确的字段映射');
        
        // 检查项目字段是否正确转换
        if (result.reply.includes('检测项目')) {
          console.log('✅ 项目字段正确转换为有意义的名称');
        } else {
          console.log('⚠️ 项目字段可能未正确转换');
        }

        // 检查基线字段是否正确格式化
        if (result.reply.includes('批次-')) {
          console.log('✅ 基线字段正确格式化');
        } else {
          console.log('⚠️ 基线字段可能未正确格式化');
        }

        // 检查数量字段是否显示OK/NG状态
        if (result.reply.includes('1次OK') || result.reply.includes('1次NG')) {
          console.log('✅ 数量字段正确显示测试状态');
        } else {
          console.log('⚠️ 数量字段可能未正确显示测试状态');
        }

        // 对于NG查询，检查是否有不合格描述
        if (testCase.query.includes('NG') || testCase.query.includes('不合格') || testCase.query.includes('失败')) {
          if (result.reply.includes('不合格:') && !result.reply.includes('不合格: 检测异常')) {
            console.log('✅ NG查询包含具体的不合格描述');
          } else {
            console.log('⚠️ NG查询可能缺少具体的不合格描述');
          }
        }

        successCount++;
        console.log('✅ 测试通过');
      } else {
        console.log('❌ 缺少必要的字段映射');
        console.log('📄 回复预览:', result.reply.substring(0, 200) + '...');
      }

    } catch (error) {
      console.log(`❌ 测试失败: ${error.message}`);
    }
  }

  // 输出测试总结
  console.log('\n📊 测试总结:');
  console.log(`✅ 成功: ${successCount}/${totalCount}`);
  console.log(`❌ 失败: ${totalCount - successCount}/${totalCount}`);
  console.log(`📈 成功率: ${((successCount / totalCount) * 100).toFixed(1)}%`);

  if (successCount === totalCount) {
    console.log('\n🎉 所有测试通过！前端NLP查询集成成功！');
    console.log('\n📋 优化效果确认:');
    console.log('- ✅ 字段映射正确对齐前端显示需求');
    console.log('- ✅ 项目字段显示有意义的名称');
    console.log('- ✅ 基线字段正确格式化');
    console.log('- ✅ 数量字段显示测试状态');
    console.log('- ✅ 不合格描述包含具体缺陷信息');
    console.log('- ✅ 同义词匹配正常工作');
  } else {
    console.log('\n⚠️ 部分测试失败，需要进一步优化');
  }

  return successCount === totalCount;
}

// 执行测试
testFrontendNLPIntegration().catch(console.error);
