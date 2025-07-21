import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function syncRulesToFrontend() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔄 同步所有规则到智能问答前端...\n');
    
    // 获取所有规则，按分类和排序
    const [allRules] = await connection.execute(`
      SELECT
        intent_name,
        category,
        description,
        example_query,
        trigger_words,
        sort_order,
        status,
        created_at,
        updated_at
      FROM nlp_intent_rules
      ORDER BY sort_order
    `);
    
    console.log(`📋 获取到 ${allRules.length} 条规则\n`);
    
    // 按分类组织规则
    const rulesByCategory = {};
    const categoryOrder = ['库存场景', '上线场景', '测试场景', '批次场景', '对比场景', '综合场景'];
    
    // 初始化分类
    categoryOrder.forEach(category => {
      rulesByCategory[category] = [];
    });
    
    // 分组规则
    allRules.forEach(rule => {
      const category = rule.category;
      if (rulesByCategory[category]) {
        rulesByCategory[category].push(rule);
      } else {
        // 如果有未知分类，创建新分类
        if (!rulesByCategory[category]) {
          rulesByCategory[category] = [];
        }
        rulesByCategory[category].push(rule);
      }
    });
    
    console.log('=== 按分类统计规则 ===');
    Object.entries(rulesByCategory).forEach(([category, rules]) => {
      if (rules.length > 0) {
        console.log(`${category}: ${rules.length} 条规则`);
      }
    });
    
    console.log('\n=== 详细规则列表 ===\n');
    
    let totalCount = 0;
    categoryOrder.forEach(category => {
      const rules = rulesByCategory[category];
      if (rules.length > 0) {
        console.log(`--- ${category} (${rules.length}条) ---`);
        rules.forEach((rule, index) => {
          totalCount++;
          const status = rule.status === 'active' ? '✅' : '❌';
          console.log(`  ${totalCount.toString().padStart(2, '0')}. ${rule.intent_name} ${status}`);
          if (rule.description) {
            console.log(`      描述: ${rule.description}`);
          }
          if (rule.example_query) {
            console.log(`      示例: ${rule.example_query}`);
          }
          if (rule.trigger_words) {
            try {
              const triggerWords = JSON.parse(rule.trigger_words);
              console.log(`      触发词: ${Array.isArray(triggerWords) ? triggerWords.join(', ') : triggerWords}`);
            } catch (e) {
              console.log(`      触发词: ${rule.trigger_words}`);
            }
          }
        });
        console.log('');
      }
    });
    
    // 生成前端可用的JSON格式
    const frontendRulesData = {
      categories: categoryOrder.map(categoryName => ({
        name: categoryName,
        displayName: categoryName,
        rules: rulesByCategory[categoryName].map(rule => {
          let triggerWords = [];
          if (rule.trigger_words) {
            try {
              triggerWords = JSON.parse(rule.trigger_words);
              if (!Array.isArray(triggerWords)) {
                triggerWords = [triggerWords];
              }
            } catch (e) {
              triggerWords = [rule.trigger_words];
            }
          }

          return {
            id: rule.intent_name,
            name: rule.intent_name,
            description: rule.description || `${categoryName}相关查询`,
            example: rule.example_query || '',
            keywords: triggerWords,
            category: rule.category,
            status: rule.status,
            sortOrder: rule.sort_order,
            createdAt: rule.created_at,
            updatedAt: rule.updated_at
          };
        })
      })).filter(category => category.rules.length > 0),
      totalRules: totalCount,
      lastUpdated: new Date().toISOString()
    };
    
    // 保存为JSON文件供前端使用
    const fs = await import('fs');
    const rulesJsonPath = '../frontend/src/data/rules.json';
    
    try {
      await fs.promises.writeFile(
        rulesJsonPath, 
        JSON.stringify(frontendRulesData, null, 2), 
        'utf8'
      );
      console.log(`✅ 规则数据已保存到: ${rulesJsonPath}`);
    } catch (error) {
      console.log(`⚠️  无法保存到前端目录: ${error.message}`);
      
      // 保存到当前目录
      await fs.promises.writeFile(
        'rules-for-frontend.json', 
        JSON.stringify(frontendRulesData, null, 2), 
        'utf8'
      );
      console.log(`✅ 规则数据已保存到: rules-for-frontend.json`);
    }
    
    console.log('\n=== 前端同步信息 ===');
    console.log('📊 规则总数:', frontendRulesData.totalRules);
    console.log('📂 分类数量:', frontendRulesData.categories.length);
    console.log('🕒 最后更新:', frontendRulesData.lastUpdated);
    
    console.log('\n=== 前端验证建议 ===');
    console.log('🔍 请在前端验证以下内容:');
    console.log('1. 左侧规则面板是否显示6个分类');
    console.log('2. 每个分类下的规则数量是否正确');
    console.log('3. 规则名称是否显示完整');
    console.log('4. 点击规则是否能正确触发查询');
    console.log('5. 查询结果是否显示中文字段名');
    
    console.log('\n=== 分类验证清单 ===');
    frontendRulesData.categories.forEach(category => {
      console.log(`📋 ${category.name}:`);
      console.log(`   - 规则数量: ${category.rules.length}`);
      console.log(`   - 前3个规则: ${category.rules.slice(0, 3).map(r => r.name).join(', ')}`);
      if (category.rules.length > 3) {
        console.log(`   - 还有 ${category.rules.length - 3} 个规则...`);
      }
    });
    
    // 检查是否有重复规则名
    const allRuleNames = allRules.map(r => r.intent_name);
    const duplicateNames = allRuleNames.filter((name, index) => allRuleNames.indexOf(name) !== index);
    
    if (duplicateNames.length > 0) {
      console.log('\n⚠️  发现重复规则名:');
      duplicateNames.forEach(name => {
        console.log(`   - ${name}`);
      });
    } else {
      console.log('\n✅ 所有规则名称唯一');
    }
    
    console.log('\n🎉 规则同步完成！');
    console.log('🔄 请刷新前端页面 http://localhost:5173/assistant 查看更新');
    
  } catch (error) {
    console.error('❌ 同步过程中出错:', error);
  } finally {
    await connection.end();
  }
}

syncRulesToFrontend();
