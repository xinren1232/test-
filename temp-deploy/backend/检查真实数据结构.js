import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkRealDataStructure() {
  let connection;
  
  try {
    console.log('🔍 检查真实数据结构和内容...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 检查所有表
    console.log('\n📊 步骤1: 检查数据库中的所有表...');
    
    const [tables] = await connection.execute(`
      SHOW TABLES
    `);
    
    console.log('数据库中的表:');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`${index + 1}. ${tableName}`);
    });
    
    // 2. 检查online_tracking表的真实数据样本
    console.log('\n📋 步骤2: 检查online_tracking表的真实数据样本...');
    
    const [onlineData] = await connection.execute(`
      SELECT * FROM online_tracking 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log('online_tracking表数据样本:');
    if (onlineData.length > 0) {
      console.log('字段列表:', Object.keys(onlineData[0]));
      onlineData.forEach((row, index) => {
        console.log(`\n样本${index + 1}:`);
        Object.entries(row).forEach(([field, value]) => {
          console.log(`  ${field}: ${value === null ? 'NULL' : value === '' ? '(空)' : value}`);
        });
      });
    } else {
      console.log('❌ online_tracking表无数据');
    }
    
    // 3. 检查inventory表的真实数据
    console.log('\n📦 步骤3: 检查inventory表的真实数据...');
    
    const [inventoryData] = await connection.execute(`
      SELECT * FROM inventory 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    
    console.log('inventory表数据样本:');
    if (inventoryData.length > 0) {
      console.log('字段列表:', Object.keys(inventoryData[0]));
      inventoryData.forEach((row, index) => {
        console.log(`\n样本${index + 1}:`);
        Object.entries(row).forEach(([field, value]) => {
          console.log(`  ${field}: ${value === null ? 'NULL' : value === '' ? '(空)' : value}`);
        });
      });
    } else {
      console.log('❌ inventory表无数据');
    }
    
    // 4. 检查testing表的真实数据
    console.log('\n🧪 步骤4: 检查testing表的真实数据...');
    
    const [testingData] = await connection.execute(`
      SELECT * FROM testing 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    
    console.log('testing表数据样本:');
    if (testingData.length > 0) {
      console.log('字段列表:', Object.keys(testingData[0]));
      testingData.forEach((row, index) => {
        console.log(`\n样本${index + 1}:`);
        Object.entries(row).forEach(([field, value]) => {
          console.log(`  ${field}: ${value === null ? 'NULL' : value === '' ? '(空)' : value}`);
        });
      });
    } else {
      console.log('❌ testing表无数据');
    }
    
    // 5. 检查batch_management表的真实数据
    console.log('\n📋 步骤5: 检查batch_management表的真实数据...');
    
    const [batchData] = await connection.execute(`
      SELECT * FROM batch_management 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    
    console.log('batch_management表数据样本:');
    if (batchData.length > 0) {
      console.log('字段列表:', Object.keys(batchData[0]));
      batchData.forEach((row, index) => {
        console.log(`\n样本${index + 1}:`);
        Object.entries(row).forEach(([field, value]) => {
          console.log(`  ${field}: ${value === null ? 'NULL' : value === '' ? '(空)' : value}`);
        });
      });
    } else {
      console.log('❌ batch_management表无数据');
    }
    
    // 6. 检查真实的基线和项目数据
    console.log('\n🔍 步骤6: 检查真实的基线和项目数据分布...');
    
    // 检查基线分布
    const [baselineDistribution] = await connection.execute(`
      SELECT 
        baseline,
        COUNT(*) as count
      FROM online_tracking 
      WHERE baseline IS NOT NULL AND baseline != ''
      GROUP BY baseline
      ORDER BY count DESC
    `);
    
    console.log('真实基线分布:');
    baselineDistribution.forEach(row => {
      console.log(`  ${row.baseline}: ${row.count}条`);
    });
    
    // 检查项目分布
    const [projectDistribution] = await connection.execute(`
      SELECT 
        project,
        COUNT(*) as count
      FROM online_tracking 
      WHERE project IS NOT NULL AND project != ''
      GROUP BY project
      ORDER BY count DESC
    `);
    
    console.log('真实项目分布:');
    projectDistribution.forEach(row => {
      console.log(`  ${row.project}: ${row.count}条`);
    });
    
    // 7. 检查真实的供应商和工厂数据
    console.log('\n🏭 步骤7: 检查真实的供应商和工厂数据...');
    
    // 检查供应商分布
    const [supplierDistribution] = await connection.execute(`
      SELECT 
        supplier_name,
        COUNT(*) as count
      FROM online_tracking 
      WHERE supplier_name IS NOT NULL AND supplier_name != ''
      GROUP BY supplier_name
      ORDER BY count DESC
      LIMIT 10
    `);
    
    console.log('真实供应商分布:');
    supplierDistribution.forEach(row => {
      console.log(`  ${row.supplier_name}: ${row.count}条`);
    });
    
    // 检查工厂分布
    const [factoryDistribution] = await connection.execute(`
      SELECT 
        factory,
        COUNT(*) as count
      FROM online_tracking 
      WHERE factory IS NOT NULL AND factory != ''
      GROUP BY factory
      ORDER BY count DESC
    `);
    
    console.log('真实工厂分布:');
    factoryDistribution.forEach(row => {
      console.log(`  ${row.factory}: ${row.count}条`);
    });
    
    // 8. 检查规则332当前的SQL
    console.log('\n📋 步骤8: 检查规则332当前的SQL...');
    
    const [currentRule] = await connection.execute(`
      SELECT id, rule_name, action_target 
      FROM nlp_intent_rules 
      WHERE id = 332
    `);
    
    if (currentRule.length > 0) {
      console.log(`规则名称: ${currentRule[0].rule_name}`);
      console.log('当前SQL:');
      console.log(currentRule[0].action_target);
      
      // 检查LIMIT限制
      const sql = currentRule[0].action_target;
      const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
      if (limitMatch) {
        console.log(`\n⚠️  发现LIMIT限制: ${limitMatch[1]}条`);
      }
    }
    
    console.log('\n🎉 真实数据结构检查完成！');
    
    console.log('\n📊 关键发现总结:');
    console.log('1. 需要确认哪些是您的真实数据表');
    console.log('2. 需要确认真实的基线、项目、供应商命名');
    console.log('3. 需要确认是否有LIMIT限制影响数据显示');
    console.log('4. 需要确认数据生成vs真实数据调取的逻辑');
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

checkRealDataStructure().catch(console.error);
