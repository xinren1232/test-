/**
 * 测试统一规则API
 * 验证 /api/rules 和 /api/assistant/rules 返回相同格式
 */

import fetch from 'node-fetch';

async function testUnifiedAPI() {
  console.log('🧪 测试统一规则API...\n');
  
  try {
    // 测试主要规则API
    console.log('📤 测试 /api/rules...');
    const response1 = await fetch('http://localhost:3001/api/rules');
    const result1 = await response1.json();
    
    console.log('📊 /api/rules 响应:');
    console.log(`  状态: ${response1.status}`);
    console.log(`  成功: ${result1.success}`);
    console.log(`  数量: ${result1.count}`);
    console.log(`  数据字段: ${result1.data ? 'data' : result1.rules ? 'rules' : '未知'}`);
    console.log(`  数据类型: ${Array.isArray(result1.data || result1.rules) ? '数组' : '非数组'}`);
    
    // 测试助手规则API
    console.log('\n📤 测试 /api/assistant/rules...');
    const response2 = await fetch('http://localhost:3001/api/assistant/rules');
    const result2 = await response2.json();
    
    console.log('📊 /api/assistant/rules 响应:');
    console.log(`  状态: ${response2.status}`);
    console.log(`  成功: ${result2.success}`);
    console.log(`  数量: ${result2.count}`);
    console.log(`  数据字段: ${result2.data ? 'data' : result2.rules ? 'rules' : '未知'}`);
    console.log(`  数据类型: ${Array.isArray(result2.data || result2.rules) ? '数组' : '非数组'}`);
    
    // 比较结果
    console.log('\n🔍 API格式对比:');
    const format1 = {
      success: result1.success,
      count: result1.count,
      hasData: !!result1.data,
      hasRules: !!result1.rules,
      dataLength: (result1.data || result1.rules || []).length
    };
    
    const format2 = {
      success: result2.success,
      count: result2.count,
      hasData: !!result2.data,
      hasRules: !!result2.rules,
      dataLength: (result2.data || result2.rules || []).length
    };
    
    console.log('  /api/rules 格式:', format1);
    console.log('  /api/assistant/rules 格式:', format2);
    
    // 验证统一性
    const isUnified = 
      format1.success === format2.success &&
      format1.count === format2.count &&
      format1.hasData === format2.hasData &&
      format1.hasRules === format2.hasRules &&
      format1.dataLength === format2.dataLength;
    
    if (isUnified) {
      console.log('\n✅ API格式统一成功！');
      console.log('📋 统一格式特征:');
      console.log(`  - 都使用 success 字段: ${format1.success}`);
      console.log(`  - 都使用 count 字段: ${format1.count}`);
      console.log(`  - 都使用 data 字段: ${format1.hasData}`);
      console.log(`  - 数据数量一致: ${format1.dataLength}`);
    } else {
      console.log('\n❌ API格式不统一！');
      console.log('需要进一步修复格式差异');
    }
    
    // 测试数据结构
    const data1 = result1.data || result1.rules || [];
    const data2 = result2.data || result2.rules || [];
    
    if (data1.length > 0 && data2.length > 0) {
      console.log('\n📝 数据结构对比:');
      console.log('  第一条规则字段 (/api/rules):', Object.keys(data1[0]));
      console.log('  第一条规则字段 (/api/assistant/rules):', Object.keys(data2[0]));
      
      const fieldsMatch = JSON.stringify(Object.keys(data1[0]).sort()) === 
                         JSON.stringify(Object.keys(data2[0]).sort());
      
      console.log(`  字段结构一致: ${fieldsMatch ? '✅' : '❌'}`);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testUnifiedAPI();
