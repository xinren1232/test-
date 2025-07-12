/**
 * 测试NG查询修复
 */

const testNGQuery = async () => {
  console.log('🧪 测试NG查询修复...\n');
  
  try {
    const response = await fetch('http://localhost:3001/api/intelligent-qa/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: '查询测试失败NG的记录'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ NG查询成功');
      console.log('📊 响应结构:', {
        success: result.success,
        hasData: !!result.data,
        hasAnswer: !!result.data?.answer,
        hasTableData: !!result.data?.data,
        dataLength: Array.isArray(result.data?.data) ? result.data.data.length : 0
      });
      
      if (result.success && result.data?.data && result.data.data.length > 0) {
        console.log(`📋 返回数据: ${result.data.data.length} 条记录`);
        console.log('🔍 示例数据:', result.data.data[0]);
      } else {
        console.log('⚠️ 无数据返回');
        console.log('📝 回答:', result.data?.answer);
      }
    } else {
      console.log(`❌ API调用失败: ${response.status}`);
      const errorText = await response.text();
      console.log('错误详情:', errorText);
    }
  } catch (error) {
    console.log(`❌ 请求异常: ${error.message}`);
  }
};

// 测试对比查询
const testComparisonQuery = async () => {
  console.log('\n🧪 测试对比查询...\n');
  
  try {
    const response = await fetch('http://localhost:3001/api/intelligent-qa/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: '对比聚龙和天马供应商表现'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 对比查询成功');
      console.log('📊 响应结构:', {
        success: result.success,
        hasData: !!result.data,
        hasAnswer: !!result.data?.answer,
        hasTableData: !!result.data?.data,
        dataLength: Array.isArray(result.data?.data) ? result.data.data.length : 0
      });
      
      if (result.success && result.data?.data && result.data.data.length > 0) {
        console.log(`📋 返回数据: ${result.data.data.length} 条记录`);
        console.log('🔍 示例数据:', result.data.data[0]);
      } else {
        console.log('⚠️ 无数据返回');
        console.log('📝 回答:', result.data?.answer);
      }
    } else {
      console.log(`❌ API调用失败: ${response.status}`);
      const errorText = await response.text();
      console.log('错误详情:', errorText);
    }
  } catch (error) {
    console.log(`❌ 请求异常: ${error.message}`);
  }
};

const runTests = async () => {
  await testNGQuery();
  await testComparisonQuery();
};

runTests().catch(console.error);
