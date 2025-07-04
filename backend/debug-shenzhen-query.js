/**
 * 调试深圳工厂查询问题
 */
import axios from 'axios';

async function debugShenzhenQuery() {
  console.log('🔍 调试深圳工厂查询问题\n');
  
  try {
    const query = "查询深圳工厂库存";
    console.log(`🎯 测试查询: "${query}"`);
    
    const response = await axios.post('http://localhost:3001/api/assistant/query', {
      query: query
    });
    
    console.log('\n📋 完整响应:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // 检查响应来源
    if (response.data.source) {
      console.log(`\n🎯 响应来源: ${response.data.source}`);
      
      if (response.data.source === 'intelligent-intent') {
        console.log('✅ 智能意图服务正常工作');
        
        if (response.data.intentResult) {
          console.log('\n📊 SQL查询结果:');
          console.log('SQL:', response.data.intentResult.sql);
          console.log('参数:', response.data.intentResult.params);
          console.log('结果数量:', response.data.intentResult.results?.length || 0);
          
          if (response.data.intentResult.results && response.data.intentResult.results.length > 0) {
            console.log('\n📦 前5条结果:');
            console.table(response.data.intentResult.results.slice(0, 5));
          }
        }
      } else {
        console.log(`❌ 查询被 ${response.data.source} 处理，而不是智能意图服务`);
      }
    }
    
  } catch (error) {
    console.error('❌ 查询失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

debugShenzhenQuery();
