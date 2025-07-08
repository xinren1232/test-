/**
 * 测试智能意图服务的数据库查询功能
 */

import { intelligentIntentService } from './src/services/intelligentIntentService.js';

const testIntentDatabaseQuery = async () => {
  console.log('🧪 测试智能意图服务数据库查询...\n');
  
  try {
    // 初始化智能意图服务
    console.log('🚀 初始化智能意图服务...');
    await intelligentIntentService.initialize();
    console.log('✅ 智能意图服务初始化完成\n');
    
    // 测试简单查询
    console.log('📊 测试查询: "库存总量查询"');
    const result1 = await intelligentIntentService.processQuery('库存总量查询');
    
    console.log('📋 查询结果:');
    console.log(`  - 成功状态: ${result1.success}`);
    console.log(`  - 数据源: ${result1.source}`);
    console.log(`  - 数据长度: ${result1.data ? result1.data.length : 0} 字符`);
    
    if (result1.sql) {
      console.log(`  - SQL语句: ${result1.sql}`);
    }
    
    if (result1.results && result1.results.length > 0) {
      console.log(`  - 结果数量: ${result1.results.length} 条`);
      console.log(`  - 第一条记录:`, result1.results[0]);
    }
    
    console.log(`  - 数据预览: ${result1.data ? result1.data.substring(0, 100) : '无数据'}...\n`);
    
    // 测试状态查询
    console.log('📊 测试查询: "查询风险状态的库存"');
    const result2 = await intelligentIntentService.processQuery('查询风险状态的库存');
    
    console.log('📋 查询结果:');
    console.log(`  - 成功状态: ${result2.success}`);
    console.log(`  - 数据源: ${result2.source}`);
    console.log(`  - 数据长度: ${result2.data ? result2.data.length : 0} 字符`);
    
    if (result2.sql) {
      console.log(`  - SQL语句: ${result2.sql}`);
    }
    
    if (result2.results && result2.results.length > 0) {
      console.log(`  - 结果数量: ${result2.results.length} 条`);
      console.log(`  - 第一条记录:`, result2.results[0]);
    }
    
    console.log(`  - 数据预览: ${result2.data ? result2.data.substring(0, 100) : '无数据'}...\n`);
    
    // 测试测试结果查询
    console.log('📊 测试查询: "统计测试结果"');
    const result3 = await intelligentIntentService.processQuery('统计测试结果');
    
    console.log('📋 查询结果:');
    console.log(`  - 成功状态: ${result3.success}`);
    console.log(`  - 数据源: ${result3.source}`);
    console.log(`  - 数据长度: ${result3.data ? result3.data.length : 0} 字符`);
    
    if (result3.sql) {
      console.log(`  - SQL语句: ${result3.sql}`);
    }
    
    if (result3.results && result3.results.length > 0) {
      console.log(`  - 结果数量: ${result3.results.length} 条`);
      console.log(`  - 第一条记录:`, result3.results[0]);
    }
    
    console.log(`  - 数据预览: ${result3.data ? result3.data.substring(0, 100) : '无数据'}...\n`);
    
    console.log('🎉 智能意图服务数据库查询测试完成！');
    
  } catch (error) {
    console.log(`❌ 测试失败: ${error.message}`);
    console.log(`🔍 错误详情:`, error);
  }
};

testIntentDatabaseQuery().catch(console.error);
