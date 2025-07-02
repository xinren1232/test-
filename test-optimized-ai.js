/**
 * 测试优化版多步骤AI问答服务
 */

import axios from 'axios';

const OPTIMIZED_SERVICE_URL = 'http://localhost:3005';

async function testOptimizedAI() {
  console.log('🧪 开始测试优化版多步骤AI问答服务...');
  
  try {
    // 测试健康检查
    console.log('\n1. 测试健康检查...');
    const healthResponse = await axios.get(`${OPTIMIZED_SERVICE_URL}/api/health`);
    console.log('✅ 健康检查通过:', healthResponse.data);
    
    // 测试多步骤查询
    console.log('\n2. 测试多步骤查询...');
    const testQuestions = [
      '查询IC存储器的库存情况',
      '查询美光科技供应商的物料',
      '查询富士康的库存',
      '分析显示屏的质量状况'
    ];
    
    for (const question of testQuestions) {
      console.log(`\n📝 测试问题: ${question}`);
      
      try {
        const startTime = Date.now();
        const response = await axios.post(`${OPTIMIZED_SERVICE_URL}/api/multi-step-query`, {
          question: question
        });
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`⏱️ 响应时间: ${duration}ms`);
        console.log(`✅ 查询状态: ${response.data.success ? '成功' : '失败'}`);
        
        if (response.data.success) {
          const workflow = response.data.workflow;
          console.log(`📊 工作流状态: ${workflow.status}`);
          console.log(`🔢 步骤数量: ${workflow.steps.length}`);
          console.log(`⏰ 总耗时: ${workflow.totalTime}ms`);
          
          // 显示各步骤状态
          workflow.steps.forEach(step => {
            const stepTime = step.endTime ? new Date(step.endTime) - new Date(step.startTime) : 0;
            console.log(`  步骤${step.step}: ${step.name} - ${step.status} (${stepTime}ms)`);
          });
          
          // 显示结果摘要
          if (response.data.result) {
            const result = response.data.result;
            console.log(`📋 回答长度: ${result.answer ? result.answer.length : 0} 字符`);
            console.log(`📊 数据记录: ${result.data ? result.data.reduce((sum, d) => sum + d.count, 0) : 0} 条`);
            
            // 显示部分回答内容
            if (result.answer) {
              const preview = result.answer.substring(0, 200);
              console.log(`📝 回答预览: ${preview}${result.answer.length > 200 ? '...' : ''}`);
            }
          }
        } else {
          console.log(`❌ 查询失败: ${response.data.error}`);
        }
        
      } catch (error) {
        console.error(`❌ 测试失败: ${error.message}`);
        if (error.response) {
          console.error(`   状态码: ${error.response.status}`);
          console.error(`   错误详情: ${JSON.stringify(error.response.data, null, 2)}`);
        }
      }
      
      // 等待一秒再进行下一个测试
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎉 优化版AI测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
testOptimizedAI();
