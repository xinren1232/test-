import OptimizedQueryProcessor from './src/services/OptimizedQueryProcessor.js';
import fetch from 'node-fetch';

async function testAPIvsDirect() {
  try {
    console.log('🧪 测试API调用 vs 直接调用的差异...\n');
    
    const query = '供应商对比分析';
    
    // 1. 直接调用 OptimizedQueryProcessor
    console.log('📋 1. 直接调用 OptimizedQueryProcessor:');
    const processor = new OptimizedQueryProcessor();
    await processor.initialize();
    
    const directResult = await processor.processQuery(query, {});
    console.log('✅ 直接调用结果:');
    console.log(`  - 成功: ${directResult.success}`);
    console.log(`  - 来源: ${directResult.source}`);
    console.log(`  - 处理模式: ${directResult.processingMode}`);
    console.log(`  - 数据: ${Array.isArray(directResult.data) ? directResult.data.length + ' 条记录' : typeof directResult.data}`);
    
    // 2. API调用
    console.log('\n📋 2. API调用:');
    const response = await fetch('http://localhost:3001/api/assistant/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });
    
    const apiResult = await response.json();
    console.log('✅ API调用结果:');
    console.log(`  - 成功: ${apiResult.success}`);
    console.log(`  - 来源: ${apiResult.source}`);
    console.log(`  - 处理模式: ${apiResult.processingMode}`);
    console.log(`  - 数据: ${Array.isArray(apiResult.data) ? apiResult.data.length + ' 条记录' : typeof apiResult.data}`);
    console.log(`  - 回复: ${apiResult.reply ? apiResult.reply.substring(0, 100) + '...' : '无'}`);
    
    // 3. 比较结果
    console.log('\n📊 结果比较:');
    if (directResult.success === apiResult.success) {
      console.log('✅ 成功状态一致');
    } else {
      console.log('❌ 成功状态不一致');
      console.log(`  直接调用: ${directResult.success}`);
      console.log(`  API调用: ${apiResult.success}`);
    }
    
    if (directResult.source === apiResult.source) {
      console.log('✅ 数据来源一致');
    } else {
      console.log('❌ 数据来源不一致');
      console.log(`  直接调用: ${directResult.source}`);
      console.log(`  API调用: ${apiResult.source}`);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testAPIvsDirect();
