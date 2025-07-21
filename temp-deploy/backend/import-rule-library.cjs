// 导入规则库到数据库
const mysql = require('mysql2/promise');
const fs = require('fs');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function importRuleLibrary() {
  let connection;
  try {
    console.log('📚 开始导入规则库...\n');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 1. 读取规则库文件
    console.log('1. 读取规则库文件:');
    
    const ruleLibraryPath = 'rules-for-frontend.json';
    if (!fs.existsSync(ruleLibraryPath)) {
      console.log('❌ 规则库文件不存在:', ruleLibraryPath);
      return;
    }
    
    const ruleLibraryData = JSON.parse(fs.readFileSync(ruleLibraryPath, 'utf8'));
    console.log(`✅ 成功读取规则库文件`);
    console.log(`📊 分类数: ${ruleLibraryData.categories.length}`);
    
    // 2. 统计规则总数
    let totalRules = 0;
    for (const category of ruleLibraryData.categories) {
      totalRules += category.rules.length;
    }
    console.log(`📊 规则总数: ${totalRules}`);
    
    // 3. 清空现有规则（可选）
    console.log('\n2. 清空现有规则:');
    const [existingCount] = await connection.execute(`SELECT COUNT(*) as count FROM nlp_intent_rules`);
    console.log(`现有规则数: ${existingCount[0].count}`);
    
    if (existingCount[0].count > 0) {
      await connection.execute(`DELETE FROM nlp_intent_rules`);
      console.log('✅ 已清空现有规则');
    }
    
    // 4. 导入新规则
    console.log('\n3. 导入新规则:');
    
    let importedCount = 0;
    let ruleId = 1;
    
    for (const category of ruleLibraryData.categories) {
      console.log(`\n分类: ${category.name} (${category.rules.length} 条规则)`);
      
      for (const rule of category.rules) {
        try {
          // 处理触发词
          let triggerWords = [];
          if (rule.keywords && rule.keywords.length > 0) {
            // 扁平化关键词数组
            for (const keywordGroup of rule.keywords) {
              if (Array.isArray(keywordGroup)) {
                triggerWords.push(...keywordGroup);
              } else {
                triggerWords.push(keywordGroup);
              }
            }
          }
          
          // 生成基础SQL模板（根据分类）
          let sqlTemplate = '';
          if (category.name.includes('库存')) {
            sqlTemplate = `
              SELECT 
                material_name as 物料名称,
                supplier_name as 供应商,
                CAST(quantity AS CHAR) as 数量,
                status as 状态,
                DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库日期
              FROM inventory 
              WHERE status = '正常'
              ORDER BY inbound_time DESC
              LIMIT 100
            `.trim();
          } else if (category.name.includes('检验') || category.name.includes('测试')) {
            sqlTemplate = `
              SELECT 
                test_id as 测试编号,
                material_name as 物料名称,
                test_result as 测试结果,
                conclusion as 结论
              FROM lab_tests 
              ORDER BY test_date DESC
              LIMIT 100
            `.trim();
          } else if (category.name.includes('生产') || category.name.includes('上线')) {
            sqlTemplate = `
              SELECT 
                batch_code as 批次号,
                material_name as 物料名称,
                factory as 工厂,
                CONCAT(ROUND(defect_rate * 100, 2), '%') as 缺陷率
              FROM online_tracking 
              ORDER BY online_date DESC
              LIMIT 100
            `.trim();
          } else {
            // 默认查询库存
            sqlTemplate = `
              SELECT 
                material_name as 物料名称,
                supplier_name as 供应商,
                CAST(quantity AS CHAR) as 数量,
                status as 状态
              FROM inventory 
              LIMIT 100
            `.trim();
          }
          
          // 插入规则
          await connection.execute(`
            INSERT INTO nlp_intent_rules (
              id, intent_name, description, category, example_query, 
              trigger_words, action_target, status, priority, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          `, [
            ruleId,
            rule.name || rule.id,
            rule.description || '',
            category.name,
            rule.example || '',
            JSON.stringify(triggerWords),
            sqlTemplate,
            rule.status || 'active',
            rule.sortOrder || ruleId
          ]);
          
          importedCount++;
          ruleId++;
          
          if (importedCount % 10 === 0) {
            console.log(`  已导入 ${importedCount} 条规则...`);
          }
          
        } catch (error) {
          console.log(`  ❌ 导入规则失败: ${rule.name} - ${error.message}`);
        }
      }
    }
    
    console.log(`\n✅ 规则导入完成: ${importedCount} 条`);
    
    // 5. 验证导入结果
    console.log('\n4. 验证导入结果:');
    
    const [finalCount] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
      FROM nlp_intent_rules
    `);
    
    console.log(`总规则数: ${finalCount[0].total}`);
    console.log(`活跃规则: ${finalCount[0].active}`);
    
    // 分类统计
    const [categoryStats] = await connection.execute(`
      SELECT category, COUNT(*) as count
      FROM nlp_intent_rules 
      WHERE status = 'active'
      GROUP BY category
      ORDER BY count DESC
    `);
    
    console.log('\n分类统计:');
    for (const cat of categoryStats) {
      console.log(`${cat.category}: ${cat.count} 条`);
    }
    
    // 6. 测试几个规则
    console.log('\n5. 测试规则匹配:');
    
    const testQueries = ['库存查询', '检验结果', '生产情况'];
    
    for (const query of testQueries) {
      const [matchedRules] = await connection.execute(`
        SELECT id, intent_name, trigger_words
        FROM nlp_intent_rules 
        WHERE status = 'active'
        AND (
          intent_name LIKE ? OR
          trigger_words LIKE ? OR
          JSON_CONTAINS(trigger_words, ?)
        )
        LIMIT 1
      `, [`%${query}%`, `%${query}%`, `"${query}"`]);
      
      if (matchedRules.length > 0) {
        console.log(`✅ "${query}" → 规则 ${matchedRules[0].id}: ${matchedRules[0].intent_name}`);
      } else {
        console.log(`❌ "${query}" → 未找到匹配规则`);
      }
    }
    
    await connection.end();
    
    console.log('\n🎉 规则库导入完成！');
    console.log('\n💡 下一步:');
    console.log('1. 重启后端服务');
    console.log('2. 测试前端查询功能');
    console.log('3. 验证规则匹配效果');
    
  } catch (error) {
    console.error('❌ 导入失败:', error.message);
    if (connection) await connection.end();
  }
}

importRuleLibrary();
