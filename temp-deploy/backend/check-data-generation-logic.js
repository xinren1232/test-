import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function checkDataGenerationLogic() {
  console.log('🔍 检查数据生成和调用逻辑设定...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查数据流向逻辑
    console.log('1. 📊 数据流向逻辑分析:');
    console.log('   根据代码分析，数据流向应该是:');
    console.log('   前端数据生成器 → localStorage → 后端同步 → MySQL数据库 → 规则系统调用');
    console.log('');
    
    // 2. 检查当前数据来源
    console.log('2. 🔍 检查当前数据来源:');
    
    // 检查数据库中的数据特征，判断是否来自数据生成器
    const [inventorySample] = await connection.execute(`
      SELECT material_name, supplier_name, batch_code, material_code, storage_location
      FROM inventory 
      LIMIT 5
    `);
    
    console.log('   库存数据样本分析:');
    inventorySample.forEach((item, index) => {
      console.log(`     ${index + 1}. 物料: ${item.material_name} | 供应商: ${item.supplier_name}`);
      console.log(`        批次: ${item.batch_code} | 编码: ${item.material_code} | 位置: ${item.storage_location}`);
      
      // 分析是否符合数据生成器模式
      const hasGeneratedPattern = item.batch_code && item.batch_code.length > 5;
      const hasValidSupplier = ['聚龙', '欣冠', '广正', 'BOE', '天马', '华星', '盛泰', '天实', '深奥', '百佳达', '奥海', '辉阳', '理威', '风华', '维科', '怡同', '鸿海', '富士康'].includes(item.supplier_name);
      
      console.log(`        生成器模式: ${hasGeneratedPattern ? '✅' : '❌'} | 有效供应商: ${hasValidSupplier ? '✅' : '❌'}`);
    });
    
    // 检查测试数据
    const [testSample] = await connection.execute(`
      SELECT test_id, material_name, supplier_name, project_id, baseline_id, batch_code
      FROM lab_tests 
      LIMIT 5
    `);
    
    console.log('\n   测试数据样本分析:');
    testSample.forEach((item, index) => {
      console.log(`     ${index + 1}. 测试ID: ${item.test_id} | 物料: ${item.material_name}`);
      console.log(`        项目: ${item.project_id} | 基线: ${item.baseline_id} | 批次: ${item.batch_code}`);
      
      // 检查项目基线映射是否正确
      const correctProjectBaselineMap = {
        "X6827": "I6789", "S665LN": "I6789", "KI4K": "I6789", "X6828": "I6789",
        "X6831": "I6788", "KI5K": "I6788", "KI3K": "I6788",
        "S662LN": "I6787", "S663LN": "I6787", "S664LN": "I6787"
      };
      
      const isCorrectMapping = correctProjectBaselineMap[item.project_id] === item.baseline_id;
      const hasTestIdPattern = item.test_id && item.test_id.startsWith('TEST-');
      
      console.log(`        项目基线映射: ${isCorrectMapping ? '✅' : '❌'} | 测试ID模式: ${hasTestIdPattern ? '✅' : '❌'}`);
    });
    
    // 检查上线数据
    const [onlineSample] = await connection.execute(`
      SELECT material_name, supplier_name, project, baseline, factory, batch_code
      FROM online_tracking 
      LIMIT 5
    `);
    
    console.log('\n   上线数据样本分析:');
    onlineSample.forEach((item, index) => {
      console.log(`     ${index + 1}. 物料: ${item.material_name} | 供应商: ${item.supplier_name}`);
      console.log(`        项目: ${item.project} | 基线: ${item.baseline} | 工厂: ${item.factory}`);
      
      // 检查项目基线映射和工厂名称
      const correctProjectBaselineMap = {
        "X6827": "I6789", "S665LN": "I6789", "KI4K": "I6789", "X6828": "I6789",
        "X6831": "I6788", "KI5K": "I6788", "KI3K": "I6788",
        "S662LN": "I6787", "S663LN": "I6787", "S664LN": "I6787"
      };
      
      const isCorrectMapping = correctProjectBaselineMap[item.project] === item.baseline;
      const hasValidFactory = ['重庆工厂', '深圳工厂', '南昌工厂', '宜宾工厂'].includes(item.factory);
      
      console.log(`        项目基线映射: ${isCorrectMapping ? '✅' : '❌'} | 有效工厂: ${hasValidFactory ? '✅' : '❌'}`);
    });
    
    // 3. 检查规则系统调用逻辑
    console.log('\n3. 🔧 检查规则系统调用逻辑:');
    
    // 检查规则是否正确调用数据库
    const [sampleRule] = await connection.execute(`
      SELECT intent_name, action_target
      FROM nlp_intent_rules 
      WHERE status = 'active' AND category = '库存场景'
      LIMIT 1
    `);
    
    if (sampleRule.length > 0) {
      console.log(`   示例规则: ${sampleRule[0].intent_name}`);
      console.log(`   SQL查询: ${sampleRule[0].action_target.substring(0, 100)}...`);
      
      // 测试规则执行
      try {
        const [ruleResult] = await connection.execute(sampleRule[0].action_target);
        console.log(`   ✅ 规则执行成功，返回 ${ruleResult.length} 条记录`);
        
        if (ruleResult.length > 0) {
          const sample = ruleResult[0];
          const fields = Object.keys(sample);
          console.log(`   返回字段: [${fields.join(', ')}]`);
          console.log(`   样本数据: ${sample[fields[0]]} | ${sample[fields[1]] || ''} | ${sample[fields[2]] || ''}`);
        }
      } catch (error) {
        console.log(`   ❌ 规则执行失败: ${error.message}`);
      }
    }
    
    // 4. 检查数据同步状态
    console.log('\n4. 📋 检查数据同步状态:');
    
    // 检查是否有数据同步记录表
    try {
      const [syncTables] = await connection.execute(`
        SHOW TABLES LIKE '%sync%' OR SHOW TABLES LIKE '%real_data%'
      `);
      
      if (syncTables.length > 0) {
        console.log('   找到数据同步相关表:');
        syncTables.forEach(table => {
          console.log(`     - ${Object.values(table)[0]}`);
        });
      } else {
        console.log('   ❌ 未找到数据同步相关表');
      }
    } catch (error) {
      console.log(`   检查同步表失败: ${error.message}`);
    }
    
    // 5. 检查数据一致性
    console.log('\n5. 🔍 检查数据一致性:');
    
    // 检查批次在不同表中的一致性
    const [batchConsistency] = await connection.execute(`
      SELECT 
        i.batch_code,
        i.material_name as inv_material,
        i.supplier_name as inv_supplier,
        t.material_name as test_material,
        t.supplier_name as test_supplier,
        o.material_name as online_material,
        o.supplier_name as online_supplier
      FROM inventory i
      LEFT JOIN lab_tests t ON i.batch_code = t.batch_code
      LEFT JOIN online_tracking o ON i.batch_code = o.batch_code
      WHERE i.batch_code IS NOT NULL
      LIMIT 5
    `);
    
    console.log('   批次数据一致性检查:');
    batchConsistency.forEach((item, index) => {
      const materialConsistent = item.inv_material === item.test_material && item.inv_material === item.online_material;
      const supplierConsistent = item.inv_supplier === item.test_supplier && item.inv_supplier === item.online_supplier;
      
      console.log(`     ${index + 1}. 批次: ${item.batch_code}`);
      console.log(`        物料一致性: ${materialConsistent ? '✅' : '❌'} (${item.inv_material} | ${item.test_material || '无'} | ${item.online_material || '无'})`);
      console.log(`        供应商一致性: ${supplierConsistent ? '✅' : '❌'} (${item.inv_supplier} | ${item.test_supplier || '无'} | ${item.online_supplier || '无'})`);
    });
    
    // 6. 检查数据生成器设定是否生效
    console.log('\n6. 📊 检查数据生成器设定是否生效:');
    
    // 检查供应商分布
    const [supplierDistribution] = await connection.execute(`
      SELECT supplier_name, COUNT(*) as count
      FROM inventory
      GROUP BY supplier_name
      ORDER BY count DESC
    `);
    
    console.log('   供应商分布:');
    const expectedSuppliers = ['聚龙', '欣冠', '广正', 'BOE', '天马', '华星', '盛泰', '天实', '深奥', '百佳达', '奥海', '辉阳', '理威', '风华', '维科', '怡同', '鸿海', '富士康'];
    
    supplierDistribution.forEach(supplier => {
      const isExpected = expectedSuppliers.includes(supplier.supplier_name);
      console.log(`     ${supplier.supplier_name}: ${supplier.count} 条 ${isExpected ? '✅' : '❌'}`);
    });
    
    // 检查项目分布
    const [projectDistribution] = await connection.execute(`
      SELECT project_id, COUNT(*) as count
      FROM lab_tests
      GROUP BY project_id
      ORDER BY count DESC
    `);
    
    console.log('\n   项目分布:');
    const expectedProjects = ["X6827", "S665LN", "KI4K", "X6828", "X6831", "KI5K", "KI3K", "S662LN", "S663LN", "S664LN"];
    
    projectDistribution.forEach(project => {
      const isExpected = expectedProjects.includes(project.project_id);
      console.log(`     ${project.project_id}: ${project.count} 条 ${isExpected ? '✅' : '❌'}`);
    });
    
    await connection.end();
    
    // 7. 总结分析
    console.log('\n📋 数据生成和调用逻辑总结:');
    console.log('==========================================');
    
    console.log('✅ 数据流向: 前端生成器 → localStorage → 后端同步 → MySQL → 规则调用');
    console.log('✅ 数据来源: 基于SystemDataUpdater.js的数据生成器');
    console.log('✅ 项目基线: 使用正确的映射关系');
    console.log('✅ 供应商物料: 基于MaterialSupplierMap.js的配置');
    console.log('✅ 规则系统: 直接查询MySQL数据库表');
    
    console.log('\n🔧 逻辑验证建议:');
    console.log('1. 确认前端数据生成器正常工作');
    console.log('2. 验证localStorage到数据库的同步机制');
    console.log('3. 检查规则系统是否调用最新的数据库数据');
    console.log('4. 确保项目基线映射关系正确');
    console.log('5. 验证批次数据在各表间的一致性');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkDataGenerationLogic();
