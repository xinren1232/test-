import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function systematicDataFlowCheck() {
  let connection;
  
  try {
    console.log('🔍 系统性排查数据流问题...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 检查您刚生成的数据
    console.log('\n📊 步骤1: 检查您刚生成的数据...');
    
    const [allTables] = await connection.execute(`
      SELECT table_name, table_rows 
      FROM information_schema.tables 
      WHERE table_schema = 'iqe_inspection' 
      AND table_name IN ('inventory', 'testing', 'online_tracking', 'batch_management')
      ORDER BY table_name
    `);
    
    console.log('数据库表状态:');
    allTables.forEach(table => {
      console.log(`  ${table.table_name}: ${table.table_rows}行`);
    });
    
    // 2. 详细检查online_tracking表
    console.log('\n📋 步骤2: 详细检查online_tracking表...');
    
    const [onlineCount] = await connection.execute(`
      SELECT COUNT(*) as count FROM online_tracking
    `);
    
    console.log(`online_tracking表总记录数: ${onlineCount[0].count}`);
    
    if (onlineCount[0].count > 0) {
      const [recentData] = await connection.execute(`
        SELECT 
          id, material_code, material_name, supplier_name, 
          project, baseline, factory, defect_rate, 
          operator, created_at
        FROM online_tracking 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      
      console.log('最新的5条记录:');
      recentData.forEach((row, index) => {
        console.log(`${index + 1}. ID:${row.id}`);
        console.log(`   物料:${row.material_code} - ${row.material_name}`);
        console.log(`   供应商:${row.supplier_name}`);
        console.log(`   项目:${row.project} | 基线:${row.baseline}`);
        console.log(`   工厂:${row.factory} | 不良率:${row.defect_rate}`);
        console.log(`   操作员:${row.operator} | 创建时间:${row.created_at}`);
        console.log('');
      });
      
      // 检查结构件数据
      const [structuralData] = await connection.execute(`
        SELECT COUNT(*) as count
        FROM online_tracking 
        WHERE (
          material_name LIKE '%框%' 
          OR material_name LIKE '%盖%' 
          OR material_name LIKE '%壳%'
          OR material_name LIKE '%支架%'
          OR material_name LIKE '%结构%'
          OR material_name LIKE '%保护套%'
          OR material_code LIKE '%CS-%'
          OR material_code LIKE '%CASE-%'
          OR material_code LIKE '%FRAME-%'
        )
      `);
      
      console.log(`符合结构件条件的记录数: ${structuralData[0].count}`);
      
      if (structuralData[0].count > 0) {
        const [structuralSamples] = await connection.execute(`
          SELECT material_code, material_name, supplier_name, project, baseline
          FROM online_tracking 
          WHERE (
            material_name LIKE '%框%' 
            OR material_name LIKE '%盖%' 
            OR material_name LIKE '%壳%'
            OR material_name LIKE '%支架%'
            OR material_name LIKE '%结构%'
            OR material_name LIKE '%保护套%'
            OR material_code LIKE '%CS-%'
            OR material_code LIKE '%CASE-%'
            OR material_code LIKE '%FRAME-%'
          )
          LIMIT 3
        `);
        
        console.log('结构件数据样本:');
        structuralSamples.forEach((row, index) => {
          console.log(`${index + 1}. ${row.material_code} - ${row.material_name} | 供应商:${row.supplier_name} | 项目:${row.project} | 基线:${row.baseline}`);
        });
      }
    } else {
      console.log('❌ online_tracking表为空！数据生成可能失败');
    }
    
    // 3. 检查规则332的SQL
    console.log('\n📋 步骤3: 检查规则332的SQL...');
    
    const [rule332] = await connection.execute(`
      SELECT id, intent_name, action_target, status, updated_at
      FROM nlp_intent_rules 
      WHERE id = 332
    `);
    
    if (rule332.length > 0) {
      console.log(`规则332状态: ${rule332[0].status}`);
      console.log(`最后更新: ${rule332[0].updated_at}`);
      console.log('SQL内容:');
      console.log(rule332[0].action_target);
    } else {
      console.log('❌ 规则332不存在！');
    }
    
    // 4. 直接执行规则332的SQL
    console.log('\n🧪 步骤4: 直接执行规则332的SQL...');
    
    if (rule332.length > 0) {
      try {
        const [sqlResults] = await connection.execute(rule332[0].action_target);
        console.log(`SQL执行结果: ${sqlResults.length}条记录`);
        
        if (sqlResults.length > 0) {
          console.log('前3条结果:');
          sqlResults.slice(0, 3).forEach((row, index) => {
            console.log(`${index + 1}. ${row.物料名称} | 工厂:${row.工厂} | 基线:${row.基线} | 项目:${row.项目}`);
          });
        } else {
          console.log('❌ SQL执行无结果！需要检查WHERE条件');
        }
      } catch (sqlError) {
        console.error('❌ SQL执行错误:', sqlError.message);
      }
    }
    
    // 5. 检查智能问答API的调用流程
    console.log('\n🔍 步骤5: 检查智能问答API调用流程...');
    
    // 检查规则匹配逻辑
    const testQuestion = "结构件材料的上线生产情况";
    console.log(`测试问题: "${testQuestion}"`);
    
    const [matchingRules] = await connection.execute(`
      SELECT id, intent_name, trigger_words, priority
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND (
        intent_name LIKE '%${testQuestion}%' OR
        trigger_words LIKE '%结构件%' OR
        trigger_words LIKE '%上线%' OR
        trigger_words LIKE '%生产%'
      )
      ORDER BY priority ASC
    `);
    
    console.log(`匹配的规则数量: ${matchingRules.length}`);
    matchingRules.forEach((rule, index) => {
      console.log(`${index + 1}. 规则${rule.id}: ${rule.intent_name}`);
      console.log(`   触发词: ${rule.trigger_words}`);
      console.log(`   优先级: ${rule.priority}`);
    });
    
    // 6. 检查数据生成到数据库的同步
    console.log('\n🔄 步骤6: 检查数据同步状态...');
    
    // 检查最近的数据创建时间
    if (onlineCount[0].count > 0) {
      const [timeCheck] = await connection.execute(`
        SELECT 
          MIN(created_at) as earliest,
          MAX(created_at) as latest,
          COUNT(*) as total
        FROM online_tracking
      `);
      
      console.log('数据时间分布:');
      console.log(`  最早记录: ${timeCheck[0].earliest}`);
      console.log(`  最新记录: ${timeCheck[0].latest}`);
      console.log(`  总记录数: ${timeCheck[0].total}`);
      
      // 检查最近5分钟内的数据
      const [recentCheck] = await connection.execute(`
        SELECT COUNT(*) as count
        FROM online_tracking
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
      `);
      
      console.log(`最近5分钟内的新数据: ${recentCheck[0].count}条`);
    }
    
    // 7. 问题诊断总结
    console.log('\n🔧 步骤7: 问题诊断总结...');
    
    const issues = [];
    
    if (onlineCount[0].count === 0) {
      issues.push('❌ online_tracking表为空 - 数据生成失败');
    }
    
    if (rule332.length === 0) {
      issues.push('❌ 规则332不存在');
    } else if (rule332[0].status !== 'active') {
      issues.push('❌ 规则332未激活');
    }
    
    if (matchingRules.length === 0) {
      issues.push('❌ 没有匹配的规则');
    }
    
    if (issues.length > 0) {
      console.log('发现的问题:');
      issues.forEach(issue => console.log(`  ${issue}`));
    } else {
      console.log('✅ 基础检查通过，可能是API调用或前端显示问题');
    }
    
    console.log('\n📝 下一步排查建议:');
    console.log('1. 检查前端数据生成是否成功同步到数据库');
    console.log('2. 检查智能问答API的规则匹配逻辑');
    console.log('3. 检查前端问答界面的API调用');
    console.log('4. 检查规则执行结果的格式化和返回');
    
  } catch (error) {
    console.error('❌ 排查失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

systematicDataFlowCheck().catch(console.error);
