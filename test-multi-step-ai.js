/**
 * 测试多步骤AI问答服务
 */

import axios from 'axios';

const MULTI_STEP_SERVICE_URL = 'http://localhost:3005';

async function testMultiStepAI() {
  console.log('🧪 开始测试多步骤AI问答服务...');
  
  try {
    // 测试健康检查
    console.log('\n1. 测试健康检查...');
    const healthResponse = await axios.get(`${MULTI_STEP_SERVICE_URL}/api/health`);
    console.log('✅ 健康检查通过:', healthResponse.data);
    
    // 测试多步骤查询
    console.log('\n2. 测试多步骤查询...');
    const testQuestions = [
      '查询深圳工厂的库存情况',
      '分析结构件类物料的质量状况',
      '检查高风险物料批次',
      '生成供应商质量报告'
    ];
    
    for (const question of testQuestions) {
      console.log(`\n📝 测试问题: ${question}`);
      
      try {
        const startTime = Date.now();
        const response = await axios.post(`${MULTI_STEP_SERVICE_URL}/api/multi-step-query`, {
          question: question
        });
        const endTime = Date.now();
        
        console.log(`⏱️ 处理耗时: ${endTime - startTime}ms`);
        console.log('📊 工作流状态:', response.data.workflow?.status);
        console.log('🔢 完成步骤数:', response.data.workflow?.steps?.filter(s => s.status === 'completed').length);
        console.log('📋 意图识别:', response.data.workflow?.steps?.[0]?.result?.intent);
        console.log('🗃️ 数据源数量:', response.data.workflow?.steps?.[1]?.result?.length || 0);
        console.log('📈 数据记录数:', response.data.workflow?.steps?.[2]?.result?.results?.reduce((sum, r) => sum + r.count, 0) || 0);
        
        if (response.data.success) {
          console.log('✅ 查询成功');
        } else {
          console.log('❌ 查询失败:', response.data.error);
        }
        
        // 显示分析结果预览
        const analysis = response.data.result?.answer;
        if (analysis) {
          console.log('🤖 AI分析预览:', analysis.substring(0, 200) + '...');
        }
        
      } catch (error) {
        console.error(`❌ 查询失败: ${question}`, error.message);
      }
      
      // 等待一下再进行下一个测试
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎉 多步骤AI问答服务测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testMultiStepAI();
