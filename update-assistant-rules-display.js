/**
 * 更新智能问答页面左侧规则显示
 * 将优化后的规则库同步到前端显示
 */

const API_BASE_URL = 'http://localhost:3001';

async function updateAssistantRulesDisplay() {
  try {
    console.log('🔄 更新智能问答页面左侧规则显示...\n');
    
    // 1. 获取当前所有规则
    console.log('1️⃣ 获取当前所有规则...');
    const allRules = await getAllRules();
    
    // 2. 按场景和类别组织规则
    console.log('\n2️⃣ 按场景和类别组织规则...');
    const organizedRules = organizeRulesByScenario(allRules);
    
    // 3. 生成规则显示配置
    console.log('\n3️⃣ 生成规则显示配置...');
    const rulesConfig = generateRulesDisplayConfig(organizedRules);
    
    // 4. 输出前端配置文件
    console.log('\n4️⃣ 输出前端配置文件...');
    await generateFrontendConfig(rulesConfig);
    
    // 5. 验证规则显示
    console.log('\n5️⃣ 验证规则显示...');
    await validateRulesDisplay(rulesConfig);
    
  } catch (error) {
    console.error('❌ 更新过程中出现错误:', error);
  }
}

async function getAllRules() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/rules`);
    if (response.ok) {
      const result = await response.json();
      const allRules = result.data || result.rules || [];
      
      console.log(`📊 获取到 ${allRules.length} 条规则`);
      return allRules;
    } else {
      console.log('❌ 获取规则列表失败');
      return [];
    }
  } catch (error) {
    console.error('❌ 获取规则时出错:', error);
    return [];
  }
}

function organizeRulesByScenario(allRules) {
  const organized = {
    inventory: {
      name: '库存查询',
      icon: '📦',
      basic: [],
      category: [],
      supplier: []
    },
    online: {
      name: '上线查询', 
      icon: '🏭',
      basic: [],
      category: [],
      supplier: []
    },
    test: {
      name: '测试查询',
      icon: '🔬',
      basic: [],
      category: [],
      supplier: []
    }
  };
  
  allRules.forEach(rule => {
    const desc = rule.description ? rule.description.toLowerCase() : '';
    const target = rule.action_target ? rule.action_target.toLowerCase() : '';
    
    // 确定场景
    let scenario = null;
    if (desc.includes('库存') || target.includes('inventory')) {
      scenario = 'inventory';
    } else if (desc.includes('上线') || target.includes('online_tracking')) {
      scenario = 'online';
    } else if (desc.includes('测试') || desc.includes('检验') || target.includes('lab_tests')) {
      scenario = 'test';
    }
    
    if (scenario) {
      // 确定类别
      if (desc.includes('供应商')) {
        organized[scenario].supplier.push(rule);
      } else if (desc.includes('充电') || desc.includes('光学') || desc.includes('结构') || 
                desc.includes('声学') || desc.includes('包装')) {
        organized[scenario].category.push(rule);
      } else {
        organized[scenario].basic.push(rule);
      }
    }
  });
  
  // 输出组织结果
  Object.entries(organized).forEach(([key, scenario]) => {
    console.log(`📋 ${scenario.name}:`);
    console.log(`  基础查询: ${scenario.basic.length} 条`);
    console.log(`  分类查询: ${scenario.category.length} 条`);
    console.log(`  供应商查询: ${scenario.supplier.length} 条`);
  });
  
  return organized;
}

function generateRulesDisplayConfig(organizedRules) {
  const config = {
    title: '智能问答规则库',
    categories: []
  };
  
  // 库存查询分类
  config.categories.push({
    id: 'inventory',
    name: '📦 库存查询',
    expanded: true,
    subcategories: [
      {
        id: 'inventory-basic',
        name: '基础查询',
        rules: [
          { id: 'inventory-basic-1', name: '查询库存信息', example: '查询库存信息' },
          { id: 'inventory-basic-2', name: '库存状态查询', example: '查询库存状态' }
        ]
      },
      {
        id: 'inventory-category',
        name: '分类查询',
        rules: [
          { id: 'inventory-category-1', name: '充电类库存', example: '查询充电类库存' },
          { id: 'inventory-category-2', name: '光学类库存', example: '查询光学类库存' },
          { id: 'inventory-category-3', name: '结构件类库存', example: '查询结构件类库存' },
          { id: 'inventory-category-4', name: '声学类库存', example: '查询声学类库存' },
          { id: 'inventory-category-5', name: '包装类库存', example: '查询包装类库存' }
        ]
      },
      {
        id: 'inventory-supplier',
        name: '供应商查询',
        rules: generateSupplierRules('库存', ['聚龙', '天马', '东声', '丽德宝', '华星', '天实', '奥海', '富群', '广正', '怡同'])
      }
    ]
  });
  
  // 上线查询分类
  config.categories.push({
    id: 'online',
    name: '🏭 上线查询',
    expanded: true,
    subcategories: [
      {
        id: 'online-basic',
        name: '基础查询',
        rules: [
          { id: 'online-basic-1', name: '查询上线信息', example: '查询上线信息' },
          { id: 'online-basic-2', name: '上线状态查询', example: '查询上线状态' }
        ]
      },
      {
        id: 'online-category',
        name: '分类查询',
        rules: [
          { id: 'online-category-1', name: '充电类上线', example: '查询充电类上线' },
          { id: 'online-category-2', name: '光学类上线', example: '查询光学类上线' },
          { id: 'online-category-3', name: '结构件类上线', example: '查询结构件类上线' },
          { id: 'online-category-4', name: '声学类上线', example: '查询声学类上线' },
          { id: 'online-category-5', name: '包装类上线', example: '查询包装类上线' }
        ]
      },
      {
        id: 'online-supplier',
        name: '供应商查询',
        rules: generateSupplierRules('上线', ['聚龙', '天马', '东声', '丽德宝', '华星', '天实', '奥海', '富群', '广正', '怡同'])
      }
    ]
  });
  
  // 测试查询分类
  config.categories.push({
    id: 'test',
    name: '🔬 测试查询',
    expanded: true,
    subcategories: [
      {
        id: 'test-basic',
        name: '基础查询',
        rules: [
          { id: 'test-basic-1', name: '查询测试信息', example: '查询测试信息' },
          { id: 'test-basic-2', name: '测试结果查询', example: '查询测试结果' }
        ]
      },
      {
        id: 'test-category',
        name: '分类查询',
        rules: [
          { id: 'test-category-1', name: '充电类测试', example: '查询充电类测试' },
          { id: 'test-category-2', name: '光学类测试', example: '查询光学类测试' },
          { id: 'test-category-3', name: '结构件类测试', example: '查询结构件类测试' },
          { id: 'test-category-4', name: '声学类测试', example: '查询声学类测试' },
          { id: 'test-category-5', name: '包装类测试', example: '查询包装类测试' }
        ]
      },
      {
        id: 'test-supplier',
        name: '供应商查询',
        rules: generateSupplierRules('测试', ['聚龙', '天马', '东声', '丽德宝', '华星', '天实', '奥海', '富群', '广正', '怡同'])
      }
    ]
  });
  
  // 高级查询分类
  config.categories.push({
    id: 'advanced',
    name: '🎯 高级查询',
    expanded: false,
    subcategories: [
      {
        id: 'advanced-analysis',
        name: '数据分析',
        rules: [
          { id: 'advanced-analysis-1', name: '不良率分析', example: '分析不良率趋势' },
          { id: 'advanced-analysis-2', name: '供应商对比', example: '对比供应商质量' },
          { id: 'advanced-analysis-3', name: '批次追溯', example: '追溯批次信息' }
        ]
      },
      {
        id: 'advanced-report',
        name: '报表查询',
        rules: [
          { id: 'advanced-report-1', name: '质量报告', example: '生成质量报告' },
          { id: 'advanced-report-2', name: '异常统计', example: '统计异常情况' },
          { id: 'advanced-report-3', name: '趋势分析', example: '分析质量趋势' }
        ]
      }
    ]
  });
  
  return config;
}

function generateSupplierRules(scenario, suppliers) {
  return suppliers.map((supplier, index) => ({
    id: `${scenario.toLowerCase()}-supplier-${index + 1}`,
    name: `${supplier}供应商${scenario}`,
    example: `查询${supplier}供应商${scenario}`
  }));
}

async function generateFrontendConfig(rulesConfig) {
  console.log('📝 生成前端配置文件...');
  console.log('配置包含:');
  console.log(`  - ${rulesConfig.categories.length} 个主要分类`);
  console.log(`  - ${rulesConfig.categories.reduce((sum, cat) => sum + cat.subcategories.length, 0)} 个子分类`);
  console.log(`  - ${rulesConfig.categories.reduce((sum, cat) => sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.rules.length, 0), 0)} 条规则`);

  // 现在直接更新前端页面的规则显示
  console.log('\n🔄 直接更新前端智能问答页面的规则显示...');
  await updateAssistantPageRules(rulesConfig);
}

async function updateAssistantPageRules(rulesConfig) {
  try {
    // 调用后端API来更新前端规则显示
    const response = await fetch(`${API_BASE_URL}/api/assistant/update-rules-display`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rulesConfig: rulesConfig,
        timestamp: new Date().toISOString()
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ 前端规则显示更新成功');
      console.log(`📊 更新统计: ${result.message || '规则显示已同步'}`);
    } else {
      console.log('⚠️  API更新失败，生成手动更新指南...');
      await generateManualUpdateGuide(rulesConfig);
    }
  } catch (error) {
    console.log('⚠️  API调用失败，生成手动更新指南...');
    await generateManualUpdateGuide(rulesConfig);
  }
}

async function generateManualUpdateGuide(rulesConfig) {
  console.log('\n📋 手动更新指南:');
  console.log('=' .repeat(80));

  console.log('\n1️⃣ 更新智能问答页面的规则库数据:');
  console.log('   文件位置: ai-inspection-dashboard/src/pages/AssistantPage.vue');
  console.log('   找到 refreshRules 方法，确保它能正确加载以下规则分类:');

  // 生成规则分类映射
  const categoryMapping = {
    '库存场景': rulesConfig.categories.find(c => c.id === 'inventory'),
    '上线场景': rulesConfig.categories.find(c => c.id === 'online'),
    '测试场景': rulesConfig.categories.find(c => c.id === 'test'),
    '高级场景': rulesConfig.categories.find(c => c.id === 'advanced')
  };

  Object.entries(categoryMapping).forEach(([chineseName, category]) => {
    if (category) {
      console.log(`\n   📂 ${chineseName}:`);
      category.subcategories.forEach(sub => {
        console.log(`     - ${sub.name}: ${sub.rules.length} 条规则`);
        sub.rules.slice(0, 3).forEach(rule => {
          console.log(`       * ${rule.name} (${rule.example})`);
        });
        if (sub.rules.length > 3) {
          console.log(`       ... 还有 ${sub.rules.length - 3} 条规则`);
        }
      });
    }
  });

  console.log('\n2️⃣ 确保后端API /api/assistant/rules 返回正确的规则数据');
  console.log('   规则应该包含以下字段:');
  console.log('   - intent_name: 规则名称');
  console.log('   - description: 规则描述');
  console.log('   - category: 规则分类 (库存场景/上线场景/测试场景)');
  console.log('   - example_query: 示例查询');
  console.log('   - action_type: 操作类型');

  console.log('\n3️⃣ 验证前端规则显示:');
  console.log('   访问: http://localhost:5173/assistant');
  console.log('   检查左侧规则面板是否显示了所有规则分类');
  console.log('   点击规则示例按钮测试查询功能');

  console.log('\n4️⃣ 如需手动更新规则数据，可以修改以下部分:');
  console.log(`
// 在 AssistantPage.vue 的 refreshRules 方法中
const refreshRules = async () => {
  loadingRules.value = true;
  try {
    const response = await fetch('/api/assistant/rules');
    const result = await response.json();

    if (result.success && result.data) {
      // 按分类组织规则 - 确保使用中文分类名
      const categorizedRules = {
        '库存场景': [],
        '上线场景': [],
        '测试场景': [],
        '高级场景': []
      };

      result.data.forEach(rule => {
        // 根据规则内容智能分类
        if (rule.description.includes('库存') || rule.action_target.includes('inventory')) {
          categorizedRules['库存场景'].push(rule);
        } else if (rule.description.includes('上线') || rule.action_target.includes('online_tracking')) {
          categorizedRules['上线场景'].push(rule);
        } else if (rule.description.includes('测试') || rule.action_target.includes('lab_tests')) {
          categorizedRules['测试场景'].push(rule);
        } else {
          categorizedRules['高级场景'].push(rule);
        }
      });

      rulesLibrary.value = categorizedRules;
      totalRulesCount.value = result.data.length;
    }
  } catch (error) {
    console.error('加载规则失败:', error);
  } finally {
    loadingRules.value = false;
  }
};`);

  console.log('\n=' .repeat(80));
}

async function validateRulesDisplay(rulesConfig) {
  console.log('🔍 验证规则显示配置...');
  
  // 验证配置结构
  let validationPassed = true;
  
  if (!rulesConfig.categories || rulesConfig.categories.length === 0) {
    console.log('❌ 配置中没有分类');
    validationPassed = false;
  }
  
  rulesConfig.categories.forEach((category, index) => {
    if (!category.id || !category.name) {
      console.log(`❌ 分类 ${index + 1} 缺少必要字段`);
      validationPassed = false;
    }
    
    if (!category.subcategories || category.subcategories.length === 0) {
      console.log(`❌ 分类 ${category.name} 没有子分类`);
      validationPassed = false;
    }
    
    category.subcategories.forEach((subcategory, subIndex) => {
      if (!subcategory.id || !subcategory.name || !subcategory.rules) {
        console.log(`❌ 子分类 ${category.name} > ${subIndex + 1} 结构不完整`);
        validationPassed = false;
      }
    });
  });
  
  if (validationPassed) {
    console.log('✅ 规则显示配置验证通过');
    
    // 输出配置摘要
    console.log('\n📊 配置摘要:');
    rulesConfig.categories.forEach(category => {
      console.log(`${category.name}:`);
      category.subcategories.forEach(sub => {
        console.log(`  ${sub.name}: ${sub.rules.length} 条规则`);
      });
    });
  } else {
    console.log('❌ 规则显示配置验证失败');
  }
  
  return validationPassed;
}

// 运行更新
updateAssistantRulesDisplay();
