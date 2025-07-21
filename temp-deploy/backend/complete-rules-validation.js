import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 智能规则匹配函数
async function intelligentRuleMatching(query, connection) {
  // 提取关键词
  const keywords = query.toLowerCase().match(/[\u4e00-\u9fa5a-zA-Z0-9]+/g) || [];

  // 构建匹配条件 - 改为AND逻辑，提高匹配精度
  const conditions = [];
  const params = [];

  // 为每个关键词创建匹配条件
  keywords.forEach(keyword => {
    conditions.push('(intent_name LIKE ? OR trigger_words LIKE ? OR example_query LIKE ?)');
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  });

  if (conditions.length === 0) return [];

  // 使用OR逻辑但按匹配度排序
  const sql = `
    SELECT
      intent_name,
      category,
      priority,
      example_query,
      action_target,
      trigger_words,
      (
        CASE WHEN intent_name LIKE ? THEN 100 ELSE 0 END +
        CASE WHEN trigger_words LIKE ? THEN 50 ELSE 0 END +
        CASE WHEN example_query LIKE ? THEN 30 ELSE 0 END
      ) as match_score
    FROM nlp_intent_rules
    WHERE status = 'active'
    AND (${conditions.join(' OR ')})
    ORDER BY match_score DESC, priority DESC, sort_order ASC
    LIMIT 5
  `;

  // 添加查询字符串的参数用于计算匹配分数
  const scoreParams = [`%${query}%`, `%${query}%`, `%${query}%`];
  const allParams = [...scoreParams, ...params];

  const [matches] = await connection.execute(sql, allParams);
  return matches;
}

async function completeRulesValidation() {
  console.log('🔍 完整规则系统验证...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 系统概览
    console.log('1. 📊 系统概览:');
    const [totalCount] = await connection.execute('SELECT COUNT(*) as count FROM nlp_intent_rules WHERE status = "active"');
    console.log(`   总规则数: ${totalCount[0].count}`);
    
    const [categoryStats] = await connection.execute(`
      SELECT category, COUNT(*) as count 
      FROM nlp_intent_rules 
      WHERE status = 'active' 
      GROUP BY category
      ORDER BY count DESC
    `);
    
    console.log('   分类统计:');
    categoryStats.forEach(stat => {
      console.log(`     - ${stat.category}: ${stat.count} 条`);
    });
    
    // 2. 核心测试用例
    console.log('\n2. 🧪 核心测试用例验证:\n');
    
    const testCases = [
      {
        query: '查询聚龙供应商的库存',
        expected: '聚龙供应商库存查询',
        category: '库存场景'
      },
      {
        query: '查询结构件类测试情况',
        expected: '结构件类测试查询',
        category: '测试场景'
      },
      {
        query: 'BOE供应商上线情况',
        expected: 'BOE供应商上线查询',
        category: '上线场景'
      },
      {
        query: '查询光学类库存',
        expected: '光学类库存查询',
        category: '库存场景'
      },
      {
        query: '物料测试情况',
        expected: '物料测试情况查询',
        category: '测试场景'
      },
      {
        query: '查询充电类上线情况',
        expected: '充电类上线查询',
        category: '上线场景'
      }
    ];
    
    let passedTests = 0;
    
    for (const testCase of testCases) {
      console.log(`🔍 测试: "${testCase.query}"`);
      
      const matches = await intelligentRuleMatching(testCase.query, connection);
      
      if (matches.length > 0) {
        const topMatch = matches[0];
        const isCorrect = topMatch.intent_name === testCase.expected && 
                         topMatch.category === testCase.category;
        
        if (isCorrect) {
          console.log(`   ✅ 匹配正确: ${topMatch.intent_name} (${topMatch.category})`);
          passedTests++;
        } else {
          console.log(`   ⚠️  匹配结果: ${topMatch.intent_name} (${topMatch.category})`);
          console.log(`   📋 期望结果: ${testCase.expected} (${testCase.category})`);
        }
      } else {
        console.log(`   ❌ 未找到匹配规则`);
      }
      console.log('');
    }
    
    console.log(`📊 测试结果: ${passedTests}/${testCases.length} 通过 (${Math.round(passedTests/testCases.length*100)}%)\n`);
    
    // 3. SQL模板验证
    console.log('3. 🗄️ SQL模板验证:\n');
    
    const [sampleSQLs] = await connection.execute(`
      SELECT intent_name, category, action_target
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND intent_name IN (
        '聚龙供应商库存查询',
        '结构件类测试查询', 
        'BOE供应商上线查询'
      )
    `);
    
    sampleSQLs.forEach(rule => {
      console.log(`📋 ${rule.intent_name} (${rule.category}):`);
      console.log(`   SQL: ${rule.action_target.substring(0, 100)}...`);
      
      // 验证SQL包含正确字段
      const requiredFields = {
        '库存场景': ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
        '测试场景': ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'],
        '上线场景': ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注']
      };
      
      const fields = requiredFields[rule.category] || [];
      const missingFields = fields.filter(field => !rule.action_target.includes(field));
      
      if (missingFields.length === 0) {
        console.log(`   ✅ 字段完整`);
      } else {
        console.log(`   ⚠️  缺少字段: ${missingFields.join(', ')}`);
      }
      console.log('');
    });
    
    // 4. 供应商覆盖度检查
    console.log('4. 🏢 供应商覆盖度检查:\n');
    
    const expectedSuppliers = [
      '聚龙', '欣冠', '广正', '帝晶', '天马', 'BOE', '华星', '盛泰', 
      '天实', '深奥', '百俊达', '奥海', '辰阳', '锂威', '风华', '维科',
      '东声', '豪声', '歌尔', '丽德宝', '裕同', '富群'
    ];
    
    const [supplierRules] = await connection.execute(`
      SELECT DISTINCT SUBSTRING_INDEX(intent_name, '供应商', 1) as supplier
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND intent_name LIKE '%供应商%查询'
      ORDER BY supplier
    `);
    
    const coveredSuppliers = supplierRules.map(r => r.supplier);
    const missingSuppliers = expectedSuppliers.filter(s => !coveredSuppliers.includes(s));
    
    console.log(`   覆盖供应商: ${coveredSuppliers.length}/${expectedSuppliers.length}`);
    if (missingSuppliers.length > 0) {
      console.log(`   缺少供应商: ${missingSuppliers.join(', ')}`);
    } else {
      console.log(`   ✅ 供应商覆盖完整`);
    }
    
    // 5. 物料大类覆盖度检查
    console.log('\n5. 📦 物料大类覆盖度检查:\n');
    
    const expectedCategories = ['结构件类', '光学类', '充电类', '声学类', '包装类'];
    
    const [categoryRules] = await connection.execute(`
      SELECT DISTINCT SUBSTRING_INDEX(intent_name, '库存查询', 1) as category
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND intent_name LIKE '%类库存查询'
      ORDER BY category
    `);
    
    const coveredCategories = categoryRules.map(r => r.category);
    const missingCategories = expectedCategories.filter(c => !coveredCategories.includes(c));
    
    console.log(`   覆盖大类: ${coveredCategories.length}/${expectedCategories.length}`);
    if (missingCategories.length > 0) {
      console.log(`   缺少大类: ${missingCategories.join(', ')}`);
    } else {
      console.log(`   ✅ 物料大类覆盖完整`);
    }
    
    // 6. 总结报告
    console.log('\n📋 验证总结报告:');
    console.log('================');
    console.log(`✅ 规则总数: ${totalCount[0].count} 条`);
    console.log(`✅ 测试通过率: ${Math.round(passedTests/testCases.length*100)}%`);
    console.log(`✅ 供应商覆盖: ${coveredSuppliers.length}/${expectedSuppliers.length}`);
    console.log(`✅ 大类覆盖: ${coveredCategories.length}/${expectedCategories.length}`);
    console.log(`✅ 基于真实字段设计`);
    console.log(`✅ 支持三个场景查询`);
    
    if (passedTests === testCases.length && missingSuppliers.length === 0 && missingCategories.length === 0) {
      console.log('\n🎉 规则系统验证通过！可以投入使用。');
    } else {
      console.log('\n⚠️  发现问题，需要进一步优化。');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 验证失败:', error.message);
  }
}

completeRulesValidation();
