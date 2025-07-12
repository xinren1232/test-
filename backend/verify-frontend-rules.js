import fs from 'fs';

async function verifyFrontendRules() {
  try {
    console.log('🔍 验证前端规则加载...\n');
    
    // 检查前端规则文件
    const frontendRulesPath = '../frontend/src/data/rules.json';
    
    if (!fs.existsSync(frontendRulesPath)) {
      console.error('❌ 前端规则文件不存在:', frontendRulesPath);
      return;
    }
    
    const rulesData = JSON.parse(fs.readFileSync(frontendRulesPath, 'utf8'));
    
    console.log('📊 前端规则文件验证:');
    console.log(`   文件路径: ${frontendRulesPath}`);
    console.log(`   总规则数: ${rulesData.totalRules}`);
    console.log(`   分类数量: ${rulesData.categories.length}`);
    console.log(`   最后更新: ${rulesData.lastUpdated}`);
    
    console.log('\n📋 分类详情:');
    rulesData.categories.forEach((category, index) => {
      console.log(`   ${index + 1}. ${category.name}: ${category.rules.length} 条规则`);
      
      // 显示前3个规则作为示例
      const sampleRules = category.rules.slice(0, 3);
      sampleRules.forEach((rule, ruleIndex) => {
        console.log(`      ${ruleIndex + 1}. ${rule.name}`);
        if (rule.example) {
          console.log(`         示例: ${rule.example}`);
        }
      });
      
      if (category.rules.length > 3) {
        console.log(`      ... 还有 ${category.rules.length - 3} 个规则`);
      }
      console.log('');
    });
    
    // 验证数据结构
    console.log('🔍 数据结构验证:');
    
    let structureValid = true;
    const requiredFields = ['id', 'name', 'description', 'category', 'status'];
    
    for (const category of rulesData.categories) {
      for (const rule of category.rules) {
        for (const field of requiredFields) {
          if (!rule[field]) {
            console.log(`   ❌ 规则 "${rule.name || 'Unknown'}" 缺少字段: ${field}`);
            structureValid = false;
          }
        }
      }
    }
    
    if (structureValid) {
      console.log('   ✅ 所有规则数据结构完整');
    }
    
    // 检查规则名称唯一性
    console.log('\n🔍 规则名称唯一性检查:');
    const allRuleNames = [];
    rulesData.categories.forEach(category => {
      category.rules.forEach(rule => {
        allRuleNames.push(rule.name);
      });
    });
    
    const duplicateNames = allRuleNames.filter((name, index) => allRuleNames.indexOf(name) !== index);
    
    if (duplicateNames.length === 0) {
      console.log('   ✅ 所有规则名称唯一');
    } else {
      console.log('   ❌ 发现重复规则名称:');
      duplicateNames.forEach(name => {
        console.log(`      - ${name}`);
      });
    }
    
    console.log('\n🎯 前端集成建议:');
    console.log('1. 确保前端页面能正确加载 /src/data/rules.json');
    console.log('2. 验证规则按分类正确显示在左侧面板');
    console.log('3. 测试点击规则能触发相应查询');
    console.log('4. 检查规则描述和示例是否正确显示');
    
    console.log('\n📱 前端测试步骤:');
    console.log('1. 打开 http://localhost:5173/assistant');
    console.log('2. 检查左侧面板是否显示6个分类');
    console.log('3. 展开每个分类，验证规则数量');
    console.log('4. 点击几个规则测试功能');
    console.log('5. 验证查询结果格式');
    
    console.log('\n✅ 前端规则验证完成！');
    
  } catch (error) {
    console.error('❌ 验证过程中出错:', error);
  }
}

verifyFrontendRules();
