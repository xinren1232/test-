/**
 * 测试修复后的测试规则
 */

const API_BASE_URL = 'http://localhost:3001';

async function testFixedTestingRules() {
  try {
    console.log('🧪 测试修复后的测试规则...\n');
    
    // 测试基础查询
    console.log('1️⃣ 测试基础测试信息查询...');
    const basicResponse = await fetch(`${API_BASE_URL}/api/assistant/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '查询测试信息' })
    });
    
    const basicResult = await basicResponse.json();
    
    if (basicResult.success && basicResult.data && basicResult.data.tableData) {
      const data = basicResult.data.tableData;
      console.log(`✅ 基础查询成功，返回 ${data.length} 条记录`);
      
      if (data.length > 0) {
        const firstRecord = data[0];
        console.log('第一条记录的字段内容:');
        console.log(`  测试编号: "${firstRecord.测试编号}"`);
        console.log(`  日期: "${firstRecord.日期}"`);
        console.log(`  项目: "${firstRecord.项目}"`);
        console.log(`  基线: "${firstRecord.基线}"`);
        console.log(`  物料编码: "${firstRecord.物料编码}"`);
        console.log(`  数量: ${firstRecord.数量}`);
        console.log(`  物料名称: "${firstRecord.物料名称}"`);
        console.log(`  供应商: "${firstRecord.供应商}"`);
        console.log(`  测试结果: "${firstRecord.测试结果}"`);
        console.log(`  不合格描述: "${firstRecord.不合格描述}"`);
        console.log(`  备注: "${firstRecord.备注}"`);
        
        // 检查关键字段是否有数据
        const hasData = firstRecord.物料编码 && firstRecord.物料名称 && firstRecord.供应商;
        if (hasData) {
          console.log('✅ 关键字段都有数据');
        } else {
          console.log('⚠️  关键字段仍然为空');
        }
      }
    } else {
      console.log('❌ 基础查询失败');
    }
    
    console.log('\n' + '─'.repeat(60) + '\n');
    
    // 测试供应商查询
    console.log('2️⃣ 测试供应商测试查询...');
    const supplierResponse = await fetch(`${API_BASE_URL}/api/assistant/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '查询聚龙供应商的测试' })
    });
    
    const supplierResult = await supplierResponse.json();
    
    if (supplierResult.success && supplierResult.data && supplierResult.data.tableData) {
      const data = supplierResult.data.tableData;
      console.log(`✅ 供应商查询成功，返回 ${data.length} 条记录`);
      
      if (data.length > 0) {
        // 检查是否都是聚龙供应商的数据
        const allJulong = data.every(record => record.供应商 === '聚龙');
        if (allJulong) {
          console.log('✅ 供应商过滤正确，所有记录都是聚龙供应商');
        } else {
          console.log('⚠️  供应商过滤可能有问题');
          const suppliers = [...new Set(data.map(record => record.供应商))];
          console.log(`实际供应商: ${suppliers.join(', ')}`);
        }
      }
    } else {
      console.log('❌ 供应商查询失败');
    }
    
    console.log('\n' + '─'.repeat(60) + '\n');
    
    // 测试物料类型查询（这个可能会失败，因为lab_tests表没有material_type字段）
    console.log('3️⃣ 测试物料类型查询...');
    const typeResponse = await fetch(`${API_BASE_URL}/api/assistant/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '查询光学类测试' })
    });
    
    const typeResult = await typeResponse.json();
    
    if (typeResult.success && typeResult.data && typeResult.data.tableData) {
      const data = typeResult.data.tableData;
      console.log(`✅ 物料类型查询成功，返回 ${data.length} 条记录`);
    } else {
      console.log('❌ 物料类型查询失败');
      if (typeResult.message) {
        console.log(`错误信息: ${typeResult.message}`);
        if (typeResult.message.includes('material_type')) {
          console.log('⚠️  lab_tests表缺少material_type字段，需要修复物料类型查询规则');
        }
      }
    }
    
    console.log('\n' + '─'.repeat(60) + '\n');
    
    // 检查数据库表结构
    console.log('4️⃣ 检查lab_tests表结构...');
    await checkLabTestsStructure();
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  }
}

async function checkLabTestsStructure() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/debug/inventory`);
    const result = await response.json();
    
    if (result.success) {
      console.log('📊 数据库表结构信息:');
      console.log(`  inventory表记录数: ${result.nullStatistics.total_records}`);
      
      // 这里我们需要一个专门检查lab_tests表结构的API
      console.log('💡 建议: 需要添加检查lab_tests表结构的API端点');
    }
    
  } catch (error) {
    console.error('❌ 检查表结构失败:', error);
  }
}

testFixedTestingRules();
