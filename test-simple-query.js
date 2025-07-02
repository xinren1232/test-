/**
 * 简单测试多步骤AI服务
 */

import axios from 'axios';

async function testSimpleQuery() {
  console.log('🧪 测试简单查询...');
  
  try {
    const response = await axios.post('http://localhost:3005/api/multi-step-query', {
      question: '你好，请介绍一下系统功能'
    }, {
      timeout: 10000
    });
    
    console.log('✅ 查询成功');
    console.log('📊 响应状态:', response.status);
    console.log('🔄 工作流状态:', response.data.workflow?.status);
    console.log('📝 步骤数量:', response.data.workflow?.steps?.length);
    
    if (response.data.workflow?.steps) {
      response.data.workflow.steps.forEach((step, index) => {
        console.log(`步骤${step.step}: ${step.name} - ${step.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 查询失败:', error.message);
    if (error.response) {
      console.error('📄 错误响应:', error.response.data);
    }
  }
}

testSimpleQuery();
