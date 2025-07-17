/**
 * 修复数据探索规则
 * 确保用户能够先探索数据内容，再执行具体查询
 */

async function fixExplorationRules() {
  console.log('🔧 修复数据探索规则');
  console.log('==================');
  
  // 需要添加/修复的探索规则
  const explorationRules = [
    {
      intent_name: '查看所有物料',
      description: '显示系统中所有可用的物料列表',
      trigger_words: ['物料列表', '所有物料', '有哪些物料', '物料有什么', '系统里有哪些物料'],
      example_query: '系统里有哪些物料？',
      sql: `SELECT DISTINCT material_name as 物料名称, material_code as 物料编码, COUNT(*) as 记录数量
FROM inventory 
WHERE material_name IS NOT NULL AND material_name != ''
GROUP BY material_name, material_code 
ORDER BY 记录数量 DESC`,
      category: '数据探索'
    },
    
    {
      intent_name: '查看所有仓库',
      description: '显示系统中所有可用的仓库列表',
      trigger_words: ['仓库列表', '所有仓库', '有哪些仓库', '仓库有什么', '系统里有哪些仓库'],
      example_query: '系统里有哪些仓库？',
      sql: `SELECT DISTINCT warehouse as 仓库名称, COUNT(*) as 记录数量
FROM inventory 
WHERE warehouse IS NOT NULL AND warehouse != ''
GROUP BY warehouse 
ORDER BY 记录数量 DESC`,
      category: '数据探索'
    },
    
    {
      intent_name: '查看供应商物料组合',
      description: '显示每个供应商提供的物料种类',
      trigger_words: ['供应商物料', '供应商提供什么物料', '哪个供应商有什么物料', '各个供应商都提供哪些物料'],
      example_query: '各个供应商都提供哪些物料？',
      sql: `SELECT supplier_name as 供应商, 
       GROUP_CONCAT(DISTINCT material_name ORDER BY material_name SEPARATOR ', ') as 物料列表,
       COUNT(DISTINCT material_name) as 物料种类数
FROM inventory 
WHERE supplier_name IS NOT NULL AND material_name IS NOT NULL
GROUP BY supplier_name 
ORDER BY 物料种类数 DESC`,
      category: '数据探索'
    }
  ];

  try {
    // 逐个处理规则
    for (const rule of explorationRules) {
      console.log(`\n🔄 处理规则: ${rule.intent_name}`);
      
      // 构建请求数据
      const ruleData = {
        intent_name: rule.intent_name,
        description: rule.description,
        action_type: 'SQL_QUERY',
        action_target: rule.sql,
        trigger_words: JSON.stringify(rule.trigger_words),
        example_query: rule.example_query,
        category: rule.category,
        priority: 50,
        status: 'active',
        synonyms: JSON.stringify({})
      };

      // 发送到后端API
      const response = await fetch('http://localhost:3001/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ 规则处理成功: ${rule.intent_name}`);
      } else {
        console.log(`❌ 规则处理失败: ${rule.intent_name} - ${response.status}`);
      }
    }

    // 测试修复后的规则
    console.log('\n🧪 测试修复后的探索规则...');
    
    const testQueries = [
      '系统里有哪些物料？',
      '系统里有哪些仓库？', 
      '各个供应商都提供哪些物料？'
    ];

    for (const query of testQueries) {
      console.log(`\n🔍 测试查询: "${query}"`);
      
      const testResponse = await fetch('http://localhost:3001/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query })
      });

      const testResult = await testResponse.json();
      const answer = testResult.reply?.data?.answer || testResult.reply?.message || '无响应';
      console.log(`🤖 系统回复: ${answer.substring(0, 100)}...`);
    }

    console.log('\n✅ 数据探索规则修复完成！');
    console.log('\n💡 现在用户可以：');
    console.log('1. 先问"系统里有哪些供应商？"了解可用选项');
    console.log('2. 再问"查询聚龙供应商的库存"执行具体查询');
    console.log('3. 探索"各个供应商都提供哪些物料？"了解组合关系');
    console.log('4. 基于探索结果进行精确的信息检索');

  } catch (error) {
    console.error('❌ 修复过程失败:', error.message);
  }
}

// 运行修复
fixExplorationRules();
