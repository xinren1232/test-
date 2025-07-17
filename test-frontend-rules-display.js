/**
 * 测试前端智能问答页面的规则显示更新
 */

const API_BASE_URL = 'http://localhost:3001';

async function testFrontendRulesDisplay() {
  try {
    console.log('🧪 测试前端智能问答页面的规则显示更新...\n');
    
    // 1. 测试后端规则API
    console.log('1️⃣ 测试后端规则API...');
    await testBackendRulesAPI();
    
    // 2. 验证规则分类
    console.log('\n2️⃣ 验证规则分类...');
    await validateRuleCategories();
    
    // 3. 测试示例查询
    console.log('\n3️⃣ 测试示例查询...');
    await testExampleQueries();
    
    // 4. 生成前端验证指南
    console.log('\n4️⃣ 生成前端验证指南...');
    generateFrontendValidationGuide();
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  }
}

async function testBackendRulesAPI() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/rules`);
    
    if (response.ok) {
      const result = await response.json();
      
      if (result.success && result.data) {
        console.log(`✅ 后端规则API正常，返回 ${result.data.length} 条规则`);
        
        // 分析规则分布
        const categoryStats = {};
        result.data.forEach(rule => {
          const desc = rule.description ? rule.description.toLowerCase() : '';
          const target = rule.action_target ? rule.action_target.toLowerCase() : '';
          
          let category = '其他';
          if (desc.includes('库存') || target.includes('inventory')) {
            category = '库存场景';
          } else if (desc.includes('上线') || target.includes('online_tracking')) {
            category = '上线场景';
          } else if (desc.includes('测试') || desc.includes('检验') || target.includes('lab_tests')) {
            category = '测试场景';
          } else {
            category = '高级场景';
          }
          
          categoryStats[category] = (categoryStats[category] || 0) + 1;
        });
        
        console.log('📊 规则分类统计:');
        Object.entries(categoryStats).forEach(([category, count]) => {
          console.log(`  ${category}: ${count} 条规则`);
        });
        
        return result.data;
      } else {
        console.log('❌ 后端规则API返回格式错误');
        return null;
      }
    } else {
      console.log(`❌ 后端规则API请求失败: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ 后端规则API连接失败: ${error.message}`);
    return null;
  }
}

async function validateRuleCategories() {
  try {
    const rules = await testBackendRulesAPI();
    if (!rules) return;
    
    // 验证每个场景的规则示例
    const scenarios = ['库存场景', '上线场景', '测试场景', '高级场景'];
    
    scenarios.forEach(scenario => {
      console.log(`\n📋 ${scenario} 规则示例:`);
      
      const scenarioRules = rules.filter(rule => {
        const desc = rule.description ? rule.description.toLowerCase() : '';
        const target = rule.action_target ? rule.action_target.toLowerCase() : '';
        
        switch (scenario) {
          case '库存场景':
            return desc.includes('库存') || target.includes('inventory');
          case '上线场景':
            return desc.includes('上线') || target.includes('online_tracking');
          case '测试场景':
            return desc.includes('测试') || desc.includes('检验') || target.includes('lab_tests');
          case '高级场景':
            return !desc.includes('库存') && !desc.includes('上线') && !desc.includes('测试') && !desc.includes('检验');
          default:
            return false;
        }
      });
      
      if (scenarioRules.length > 0) {
        scenarioRules.slice(0, 5).forEach((rule, index) => {
          console.log(`  ${index + 1}. ${rule.intent_name || rule.description}`);
          console.log(`     示例: ${rule.example_query || '无示例'}`);
        });
        
        if (scenarioRules.length > 5) {
          console.log(`  ... 还有 ${scenarioRules.length - 5} 条规则`);
        }
      } else {
        console.log(`  ⚠️  该场景暂无规则`);
      }
    });
    
  } catch (error) {
    console.error('❌ 验证规则分类时出错:', error);
  }
}

async function testExampleQueries() {
  const testQueries = [
    { query: '查询库存信息', expectedCategory: '库存场景' },
    { query: '查询上线信息', expectedCategory: '上线场景' },
    { query: '查询测试信息', expectedCategory: '测试场景' },
    { query: '查询充电类库存', expectedCategory: '库存场景' },
    { query: '查询光学类上线', expectedCategory: '上线场景' },
    { query: '查询结构件类测试', expectedCategory: '测试场景' }
  ];
  
  for (const testCase of testQueries) {
    console.log(`\n🧪 测试查询: ${testCase.query}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/assistant/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: testCase.query })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          console.log(`  ✅ 查询成功`);
          
          if (result.data && result.data.tableData) {
            console.log(`  📊 返回数据: ${result.data.tableData.length} 条记录`);
            
            // 检查字段
            if (result.data.tableData.length > 0) {
              const fields = Object.keys(result.data.tableData[0]);
              console.log(`  📋 字段: ${fields.join(', ')}`);
            }
          }
        } else {
          console.log(`  ❌ 查询失败: ${result.message || '未知错误'}`);
        }
      } else {
        console.log(`  ❌ 请求失败: ${response.status}`);
      }
    } catch (error) {
      console.log(`  ❌ 查询出错: ${error.message}`);
    }
  }
}

function generateFrontendValidationGuide() {
  console.log('📋 前端验证指南:');
  console.log('=' .repeat(60));
  
  console.log('\n✅ 已完成的更新:');
  console.log('1. 更新了 AssistantPage.vue 的 refreshRules 方法');
  console.log('2. 修改了规则分类逻辑，使用中文分类名');
  console.log('3. 更新了 expandedCategories 配置');
  console.log('4. 修正了图标映射');
  
  console.log('\n🔍 验证步骤:');
  console.log('1. 启动前端服务: npm run dev (在 ai-inspection-dashboard 目录)');
  console.log('2. 访问: http://localhost:5173/assistant');
  console.log('3. 检查左侧规则面板是否显示以下分类:');
  console.log('   📦 库存场景 (应该展开)');
  console.log('   🏭 上线场景 (应该展开)');
  console.log('   🔬 测试场景 (应该展开)');
  console.log('   📈 高级场景 (应该折叠)');
  
  console.log('\n🧪 功能测试:');
  console.log('1. 点击各个分类，查看规则列表');
  console.log('2. 点击规则示例按钮，测试查询功能');
  console.log('3. 在输入框中输入查询，验证响应');
  console.log('4. 检查右侧面板的数据统计是否正确');
  
  console.log('\n📊 预期结果:');
  console.log('- 库存场景: 约27条规则 (基础查询 + 分类查询 + 供应商查询)');
  console.log('- 上线场景: 约27条规则 (基础查询 + 分类查询 + 供应商查询)');
  console.log('- 测试场景: 约27条规则 (基础查询 + 分类查询 + 供应商查询)');
  console.log('- 高级场景: 其他规则');
  
  console.log('\n🔧 如果遇到问题:');
  console.log('1. 检查浏览器控制台是否有错误');
  console.log('2. 确认后端服务正在运行 (端口3001)');
  console.log('3. 检查 /api/assistant/rules 接口是否正常');
  console.log('4. 验证规则数据的 category 字段是否正确');
  
  console.log('\n🎯 成功标志:');
  console.log('✅ 左侧面板显示4个主要场景分类');
  console.log('✅ 每个分类下有相应的规则列表');
  console.log('✅ 点击规则示例能正常查询');
  console.log('✅ 查询结果显示正确的数据表格');
  console.log('✅ 右侧统计面板显示正确的数据量');
  
  console.log('\n=' .repeat(60));
}

// 运行测试
testFrontendRulesDisplay();
