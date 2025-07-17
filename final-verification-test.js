/**
 * 最终验证测试 - 智能问答页面规则显示更新
 */

const API_BASE_URL = 'http://localhost:3001';

async function runFinalVerification() {
  console.log('🎯 开始最终验证测试...\n');
  
  try {
    // 1. 验证后端API
    console.log('1️⃣ 验证后端API...');
    const apiResult = await verifyBackendAPI();
    
    // 2. 验证规则分类
    console.log('\n2️⃣ 验证规则分类...');
    const categoryResult = await verifyRuleCategories();
    
    // 3. 验证查询功能
    console.log('\n3️⃣ 验证查询功能...');
    const queryResult = await verifyQueryFunctionality();
    
    // 4. 生成最终报告
    console.log('\n4️⃣ 生成最终报告...');
    generateFinalReport(apiResult, categoryResult, queryResult);
    
  } catch (error) {
    console.error('❌ 最终验证过程中出现错误:', error);
  }
}

async function verifyBackendAPI() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/rules`);
    
    if (response.ok) {
      const result = await response.json();
      
      if (result.success && result.data) {
        console.log(`✅ 后端API正常，返回 ${result.data.length} 条规则`);
        
        // 检查规则结构
        const sampleRule = result.data[0];
        const hasRequiredFields = sampleRule.id && sampleRule.intent_name && sampleRule.category;
        
        console.log(`✅ 规则结构检查: ${hasRequiredFields ? '通过' : '失败'}`);
        
        return {
          success: true,
          count: result.data.length,
          structure: hasRequiredFields,
          data: result.data
        };
      } else {
        console.log('❌ 后端API返回格式错误');
        return { success: false, error: 'API返回格式错误' };
      }
    } else {
      console.log(`❌ 后端API请求失败: ${response.status}`);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.log(`❌ 后端API连接失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function verifyRuleCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/rules`);
    const result = await response.json();
    
    if (result.success && result.data) {
      // 统计各场景规则数量
      const categoryStats = {
        '库存场景': 0,
        '上线场景': 0,
        '测试场景': 0,
        '高级场景': 0,
        '其他': 0
      };
      
      result.data.forEach(rule => {
        const category = rule.category || '其他';
        if (categoryStats.hasOwnProperty(category)) {
          categoryStats[category]++;
        } else {
          categoryStats['其他']++;
        }
      });
      
      console.log('📊 规则分类统计:');
      Object.entries(categoryStats).forEach(([category, count]) => {
        console.log(`  ${category}: ${count} 条规则`);
      });
      
      // 验证分类是否均衡
      const mainCategories = ['库存场景', '上线场景', '测试场景'];
      const isBalanced = mainCategories.every(cat => categoryStats[cat] > 0);
      
      console.log(`✅ 分类均衡检查: ${isBalanced ? '通过' : '失败'}`);
      
      return {
        success: true,
        stats: categoryStats,
        balanced: isBalanced
      };
    } else {
      return { success: false, error: '无法获取规则数据' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function verifyQueryFunctionality() {
  const testQueries = [
    { query: '查询库存信息', expectedCategory: '库存场景' },
    { query: '查询上线信息', expectedCategory: '上线场景' },
    { query: '查询测试信息', expectedCategory: '测试场景' }
  ];
  
  const results = [];
  
  for (const testCase of testQueries) {
    console.log(`🧪 测试查询: ${testCase.query}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/assistant/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: testCase.query })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data && result.data.tableData) {
          console.log(`  ✅ 查询成功，返回 ${result.data.tableData.length} 条记录`);
          
          results.push({
            query: testCase.query,
            success: true,
            recordCount: result.data.tableData.length,
            fields: result.data.tableData.length > 0 ? Object.keys(result.data.tableData[0]) : []
          });
        } else {
          console.log(`  ❌ 查询失败: ${result.message || '未知错误'}`);
          results.push({
            query: testCase.query,
            success: false,
            error: result.message || '未知错误'
          });
        }
      } else {
        console.log(`  ❌ 请求失败: ${response.status}`);
        results.push({
          query: testCase.query,
          success: false,
          error: `HTTP ${response.status}`
        });
      }
    } catch (error) {
      console.log(`  ❌ 查询出错: ${error.message}`);
      results.push({
        query: testCase.query,
        success: false,
        error: error.message
      });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  console.log(`✅ 查询功能测试: ${successCount}/${results.length} 通过`);
  
  return {
    success: successCount === results.length,
    results: results,
    passRate: successCount / results.length
  };
}

function generateFinalReport(apiResult, categoryResult, queryResult) {
  console.log('\n' + '='.repeat(60));
  console.log('📋 最终验证报告');
  console.log('='.repeat(60));
  
  console.log('\n✅ 已完成的更新:');
  console.log('1. 修正了 AssistantPageNew.vue 的规则加载逻辑');
  console.log('2. 从 JSON 文件加载改为从 /api/rules API 加载');
  console.log('3. 实现了智能规则分类逻辑');
  console.log('4. 更新了错误处理和日志输出');
  
  console.log('\n📊 验证结果:');
  console.log(`后端API: ${apiResult.success ? '✅ 正常' : '❌ 异常'}`);
  if (apiResult.success) {
    console.log(`  规则数量: ${apiResult.count} 条`);
    console.log(`  数据结构: ${apiResult.structure ? '✅ 完整' : '❌ 缺失'}`);
  }
  
  console.log(`规则分类: ${categoryResult.success ? '✅ 正常' : '❌ 异常'}`);
  if (categoryResult.success) {
    console.log(`  分类均衡: ${categoryResult.balanced ? '✅ 是' : '❌ 否'}`);
    Object.entries(categoryResult.stats).forEach(([cat, count]) => {
      if (count > 0) {
        console.log(`  ${cat}: ${count} 条`);
      }
    });
  }
  
  console.log(`查询功能: ${queryResult.success ? '✅ 正常' : '❌ 异常'}`);
  console.log(`  通过率: ${Math.round(queryResult.passRate * 100)}%`);
  
  console.log('\n🎯 验证结论:');
  const allPassed = apiResult.success && categoryResult.success && queryResult.success;
  
  if (allPassed) {
    console.log('🎉 所有测试通过！智能问答页面规则显示更新成功！');
    console.log('\n📱 用户验证步骤:');
    console.log('1. 访问: http://localhost:5174/assistant');
    console.log('2. 查看左侧规则按钮是否按新分类显示');
    console.log('3. 点击规则按钮测试查询功能');
    console.log('4. 检查浏览器控制台的日志输出');
    console.log('5. 确认看到 "从后端API加载规则" 而不是 "从JSON文件加载"');
  } else {
    console.log('⚠️  部分测试未通过，需要进一步检查');
    console.log('\n🔧 建议操作:');
    console.log('1. 检查后端服务是否正常运行');
    console.log('2. 确认前端文件是否正确保存');
    console.log('3. 硬刷新浏览器页面');
    console.log('4. 查看浏览器控制台错误信息');
  }
  
  console.log('\n' + '='.repeat(60));
}

// 运行最终验证
runFinalVerification();
