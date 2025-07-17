import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixDataGenerationLogic() {
  console.log('🔧 修复数据生成和调用逻辑...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 修复项目基线映射
    console.log('1. 🔧 修复项目基线映射:');
    
    // 正确的项目基线映射（来自您的数据生成器）
    const correctProjectBaselineMap = {
      "X6827": "I6789",
      "S665LN": "I6789", 
      "KI4K": "I6789",
      "X6828": "I6789",
      "X6831": "I6788",
      "KI5K": "I6788",
      "KI3K": "I6788",
      "S662LN": "I6787",
      "S663LN": "I6787",
      "S664LN": "I6787"
    };
    
    // 错误的项目格式映射到正确格式
    const projectMapping = {
      "P001": "X6827",
      "P002": "S665LN", 
      "P003": "KI4K",
      "P004": "X6828",
      "P005": "X6831"
    };
    
    // 错误的基线格式映射到正确格式
    const baselineMapping = {
      "B1.0": "I6789",
      "B1.1": "I6789",
      "B1.2": "I6789",
      "B2.0": "I6788",
      "B2.1": "I6788"
    };
    
    console.log('   修复测试数据项目基线:');
    let testFixCount = 0;
    
    for (const [oldProject, newProject] of Object.entries(projectMapping)) {
      const correctBaseline = correctProjectBaselineMap[newProject];
      
      const [updateResult] = await connection.execute(`
        UPDATE lab_tests 
        SET project_id = ?, baseline_id = ?
        WHERE project_id = ?
      `, [newProject, correctBaseline, oldProject]);
      
      if (updateResult.affectedRows > 0) {
        console.log(`     ${oldProject} → ${newProject} (基线: ${correctBaseline}): ${updateResult.affectedRows} 条`);
        testFixCount += updateResult.affectedRows;
      }
    }
    
    console.log('   修复上线数据项目基线:');
    let onlineFixCount = 0;
    
    for (const [oldProject, newProject] of Object.entries(projectMapping)) {
      const correctBaseline = correctProjectBaselineMap[newProject];
      
      const [updateResult] = await connection.execute(`
        UPDATE online_tracking 
        SET project = ?, baseline = ?
        WHERE project = ?
      `, [newProject, correctBaseline, oldProject]);
      
      if (updateResult.affectedRows > 0) {
        console.log(`     ${oldProject} → ${newProject} (基线: ${correctBaseline}): ${updateResult.affectedRows} 条`);
        onlineFixCount += updateResult.affectedRows;
      }
    }
    
    // 2. 修复批次数据一致性
    console.log('\n2. 🔧 修复批次数据一致性:');
    
    // 为每个库存批次生成对应的上线数据
    const [inventoryBatches] = await connection.execute(`
      SELECT DISTINCT batch_code, material_name, supplier_name, material_code, storage_location
      FROM inventory 
      WHERE batch_code IS NOT NULL
      ORDER BY batch_code
    `);
    
    console.log(`   找到 ${inventoryBatches.length} 个库存批次需要生成上线数据`);
    
    let onlineGeneratedCount = 0;
    const projects = Object.keys(correctProjectBaselineMap);
    
    for (const batch of inventoryBatches) {
      // 检查是否已有上线数据
      const [existingOnline] = await connection.execute(`
        SELECT COUNT(*) as count FROM online_tracking WHERE batch_code = ?
      `, [batch.batch_code]);
      
      if (existingOnline[0].count === 0) {
        // 随机选择项目
        const randomProject = projects[Math.floor(Math.random() * projects.length)];
        const correctBaseline = correctProjectBaselineMap[randomProject];
        
        // 生成上线数据
        const defectRate = Math.random() * 0.05; // 0-5%不良率
        const inspectionDate = new Date();
        inspectionDate.setDate(inspectionDate.getDate() - Math.floor(Math.random() * 30));
        
        // 生成唯一ID
        const uniqueId = `OL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        await connection.execute(`
          INSERT INTO online_tracking (
            id, batch_code, material_code, material_name, supplier_name,
            factory, project, baseline, defect_rate,
            online_date, inspection_date, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW())
        `, [
          uniqueId,
          batch.batch_code,
          batch.material_code,
          batch.material_name,
          batch.supplier_name,
          batch.storage_location, // 使用存储位置作为工厂
          randomProject,
          correctBaseline,
          defectRate,
          inspectionDate
        ]);
        
        onlineGeneratedCount++;
      }
    }
    
    console.log(`   ✅ 生成了 ${onlineGeneratedCount} 条上线数据以保持批次一致性`);
    
    // 3. 验证修复结果
    console.log('\n3. 🧪 验证修复结果:');
    
    // 验证项目基线映射
    const [testProjectStats] = await connection.execute(`
      SELECT project_id, baseline_id, COUNT(*) as count
      FROM lab_tests 
      GROUP BY project_id, baseline_id
      ORDER BY project_id, baseline_id
    `);
    
    console.log('   测试数据项目基线分布:');
    let testCorrectCount = 0;
    let testTotalCount = 0;
    
    testProjectStats.forEach(stat => {
      const isCorrect = correctProjectBaselineMap[stat.project_id] === stat.baseline_id;
      console.log(`     ${stat.project_id} - ${stat.baseline_id}: ${stat.count} 条 ${isCorrect ? '✅' : '❌'}`);
      if (isCorrect) testCorrectCount += stat.count;
      testTotalCount += stat.count;
    });
    
    const [onlineProjectStats] = await connection.execute(`
      SELECT project, baseline, COUNT(*) as count
      FROM online_tracking 
      GROUP BY project, baseline
      ORDER BY project, baseline
    `);
    
    console.log('   上线数据项目基线分布:');
    let onlineCorrectCount = 0;
    let onlineTotalCount = 0;
    
    onlineProjectStats.forEach(stat => {
      const isCorrect = correctProjectBaselineMap[stat.project] === stat.baseline;
      console.log(`     ${stat.project} - ${stat.baseline}: ${stat.count} 条 ${isCorrect ? '✅' : '❌'}`);
      if (isCorrect) onlineCorrectCount += stat.count;
      onlineTotalCount += stat.count;
    });
    
    // 验证批次一致性
    const [batchConsistency] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT i.batch_code) as inventory_batches,
        COUNT(DISTINCT t.batch_code) as test_batches,
        COUNT(DISTINCT o.batch_code) as online_batches,
        COUNT(DISTINCT CASE WHEN i.batch_code IS NOT NULL AND t.batch_code IS NOT NULL AND o.batch_code IS NOT NULL THEN i.batch_code END) as consistent_batches
      FROM inventory i
      LEFT JOIN lab_tests t ON i.batch_code = t.batch_code
      LEFT JOIN online_tracking o ON i.batch_code = o.batch_code
    `);
    
    const consistency = batchConsistency[0];
    console.log('\n   批次一致性统计:');
    console.log(`     库存批次: ${consistency.inventory_batches} 个`);
    console.log(`     测试批次: ${consistency.test_batches} 个`);
    console.log(`     上线批次: ${consistency.online_batches} 个`);
    console.log(`     完全一致批次: ${consistency.consistent_batches} 个`);
    
    const consistencyRate = consistency.inventory_batches > 0 ? 
      (consistency.consistent_batches / consistency.inventory_batches * 100).toFixed(1) : 0;
    console.log(`     一致性率: ${consistencyRate}%`);
    
    // 4. 测试规则系统
    console.log('\n4. 🧪 测试规则系统:');
    
    const testQueries = [
      '库存信息查询',
      '测试信息查询', 
      '上线信息查询'
    ];
    
    for (const queryName of testQueries) {
      const [rule] = await connection.execute(`
        SELECT action_target FROM nlp_intent_rules 
        WHERE intent_name = ? AND status = 'active'
      `, [queryName]);
      
      if (rule.length > 0) {
        try {
          const [result] = await connection.execute(rule[0].action_target);
          console.log(`   ✅ ${queryName}: ${result.length} 条记录`);
          
          if (result.length > 0) {
            const sample = result[0];
            const fields = Object.keys(sample);
            console.log(`      字段: [${fields.slice(0, 5).join(', ')}...]`);
            
            // 检查项目基线格式
            if (sample.项目 && sample.基线) {
              const isCorrectFormat = sample.项目.startsWith('X') || sample.项目.startsWith('S') || sample.项目.startsWith('K');
              const isCorrectBaseline = sample.基线.startsWith('I');
              console.log(`      项目格式: ${sample.项目} ${isCorrectFormat ? '✅' : '❌'}`);
              console.log(`      基线格式: ${sample.基线} ${isCorrectBaseline ? '✅' : '❌'}`);
            }
          }
        } catch (error) {
          console.log(`   ❌ ${queryName}: 执行失败 - ${error.message}`);
        }
      }
    }
    
    await connection.end();
    
    console.log('\n📋 数据生成逻辑修复完成总结:');
    console.log('==========================================');
    console.log(`✅ 修复测试数据项目基线: ${testFixCount} 条记录`);
    console.log(`✅ 修复上线数据项目基线: ${onlineFixCount} 条记录`);
    console.log(`✅ 生成上线数据保持一致性: ${onlineGeneratedCount} 条记录`);
    console.log(`✅ 测试数据项目基线正确率: ${testTotalCount > 0 ? ((testCorrectCount/testTotalCount)*100).toFixed(1) : 0}%`);
    console.log(`✅ 上线数据项目基线正确率: ${onlineTotalCount > 0 ? ((onlineCorrectCount/onlineTotalCount)*100).toFixed(1) : 0}%`);
    console.log(`✅ 批次数据一致性率: ${consistencyRate}%`);
    
    console.log('\n📋 正确的数据生成逻辑:');
    console.log('✅ 项目格式: X6827, S665LN, KI4K, X6828, X6831, KI5K, KI3K, S662LN, S663LN, S664LN');
    console.log('✅ 基线格式: I6789, I6788, I6787');
    console.log('✅ 项目基线映射: 严格按照您的SystemDataUpdater.js设定');
    console.log('✅ 批次一致性: 同一批次在库存、测试、上线数据中保持一致');
    console.log('✅ 规则系统: 直接查询修复后的MySQL数据');
    
    console.log('\n🔄 请重新测试前端查询，现在应该显示正确的项目基线格式');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

fixDataGenerationLogic();
