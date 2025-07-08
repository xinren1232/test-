/**
 * 测试工厂查询修复
 */
import fetch from 'node-fetch';

async function testFactoryQuery() {
  console.log('🧪 测试工厂查询修复...\n');
  
  const testQuery = '深圳工厂的库存情况';
  
  try {
    console.log(`🔍 测试查询: "${testQuery}"`);
    
    const response = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: testQuery
      })
    });
    
    console.log(`📡 HTTP状态: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ HTTP错误: ${response.status}`);
      console.log(`📄 错误内容: ${errorText}`);
      return;
    }
    
    const result = await response.json();
    console.log(`✅ 响应成功`);
    
    // 检查响应结构
    if (result.success !== undefined) {
      console.log(`🎯 成功状态: ${result.success}`);
    }
    
    if (result.reply) {
      console.log(`💬 回复内容长度: ${result.reply.length} 字符`);
      console.log(`📄 回复预览: ${result.reply.substring(0, 300)}...`);
    }
    
    if (result.data) {
      console.log(`📊 数据内容长度: ${result.data.length} 字符`);
      console.log(`📄 数据预览: ${result.data.substring(0, 300)}...`);
    }
    
    if (result.results) {
      console.log(`📋 结果数量: ${result.results.length} 条记录`);
      if (result.results.length > 0) {
        console.log(`📄 样本记录:`, result.results[0]);
        console.log('✅ 工厂查询修复成功！');
      } else {
        console.log('❌ 工厂查询返回空结果');
      }
    }
    
    console.log(`🔍 数据源: ${result.source || '未知'}`);
    
  } catch (error) {
    console.log(`❌ 查询失败: ${error.message}`);
    console.log(`🔍 错误详情:`, error);
  }
}

testFactoryQuery().catch(console.error);
