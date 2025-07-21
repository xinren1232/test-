import mysql from 'mysql2/promise';

async function checkRealFieldStructure() {
  let connection;
  
  try {
    console.log('🔍 检查数据库真实字段结构...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 检查所有表
    console.log('\n📋 步骤1: 检查所有表...');
    const [tables] = await connection.execute("SHOW TABLES");
    console.log('数据库中的表:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
    
    // 2. 检查每个主要表的字段结构
    console.log('\n📊 步骤2: 检查主要表的字段结构...');
    
    const mainTables = ['inventory', 'lab_tests', 'production_online'];
    const actualStructures = {};
    
    for (const tableName of mainTables) {
      try {
        console.log(`\n🔍 检查 ${tableName} 表:`);
        
        // 获取表结构
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        actualStructures[tableName] = columns;
        
        console.log('  字段结构:');
        columns.forEach(col => {
          console.log(`    ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? col.Key : ''}`);
        });
        
        // 获取数据样本
        const [sample] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 1`);
        if (sample.length > 0) {
          console.log('  数据样本字段:');
          Object.keys(sample[0]).forEach(field => {
            console.log(`    ${field}: ${sample[0][field]}`);
          });
        } else {
          console.log('  ⚠️ 表中没有数据');
        }
        
      } catch (error) {
        console.log(`  ❌ 检查${tableName}表失败: ${error.message}`);
      }
    }
    
    // 3. 对比我之前创建的字段映射
    console.log('\n🔄 步骤3: 对比字段映射...');
    
    const myPreviousMappings = {
      'inventory': {
        'storage_location': '工厂',
        'warehouse': '仓库', 
        'material_code': '物料编码',
        'material_name': '物料名称',
        'supplier_name': '供应商',
        'quantity': '数量',
        'status': '状态',
        'inbound_time': '入库时间',
        'updated_at': '到期时间',
        'notes': '备注'
      },
      'lab_tests': {
        'test_id': '测试编号',
        'test_date': '日期',
        'project_id': '项目',
        'baseline_id': '基线',
        'material_code': '物料编码',
        'quantity': '数量',
        'material_name': '物料名称',
        'supplier_name': '供应商',
        'test_result': '测试结果',
        'defect_desc': '不合格描述',
        'notes': '备注'
      },
      'production_online': {
        'factory': '工厂',
        'baseline_id': '基线',
        'project_id': '项目',
        'material_code': '物料编码',
        'material_name': '物料名称',
        'supplier_name': '供应商',
        'batch_no': '批次号',
        'defect_rate': '不良率',
        'weekly_exception': '本周异常',
        'online_time': '检验日期',
        'notes': '备注'
      }
    };
    
    console.log('字段映射对比结果:');
    
    for (const tableName of mainTables) {
      if (!actualStructures[tableName]) {
        console.log(`\n❌ ${tableName}表不存在，跳过对比`);
        continue;
      }
      
      console.log(`\n📋 ${tableName}表字段对比:`);
      
      const actualFields = actualStructures[tableName].map(col => col.Field);
      const myMappedFields = Object.keys(myPreviousMappings[tableName] || {});
      
      console.log(`  实际字段 (${actualFields.length}): ${actualFields.join(', ')}`);
      console.log(`  我的映射 (${myMappedFields.length}): ${myMappedFields.join(', ')}`);
      
      // 检查匹配情况
      const matchedFields = myMappedFields.filter(field => actualFields.includes(field));
      const missingFields = myMappedFields.filter(field => !actualFields.includes(field));
      const extraFields = actualFields.filter(field => !myMappedFields.includes(field));
      
      console.log(`  ✅ 匹配字段 (${matchedFields.length}): ${matchedFields.join(', ')}`);
      if (missingFields.length > 0) {
        console.log(`  ❌ 我映射但实际不存在 (${missingFields.length}): ${missingFields.join(', ')}`);
      }
      if (extraFields.length > 0) {
        console.log(`  ⚠️ 实际存在但我未映射 (${extraFields.length}): ${extraFields.join(', ')}`);
      }
      
      // 计算匹配率
      const matchRate = matchedFields.length / Math.max(actualFields.length, myMappedFields.length) * 100;
      console.log(`  📊 字段匹配率: ${matchRate.toFixed(1)}%`);
    }
    
    // 4. 生成正确的字段映射
    console.log('\n💡 步骤4: 生成正确的字段映射...');
    
    const correctMappings = {};
    
    for (const tableName of mainTables) {
      if (!actualStructures[tableName]) continue;
      
      const actualFields = actualStructures[tableName].map(col => col.Field);
      correctMappings[tableName] = {};
      
      console.log(`\n📝 ${tableName}表的正确字段映射:`);
      
      // 根据实际字段生成映射
      actualFields.forEach(field => {
        let chineseName = field; // 默认使用原字段名
        
        // 根据字段名推断中文名
        const fieldMappings = {
          'id': 'ID',
          'material_code': '物料编码',
          'material_name': '物料名称',
          'supplier_name': '供应商',
          'supplier': '供应商',
          'quantity': '数量',
          'status': '状态',
          'factory': '工厂',
          'warehouse': '仓库',
          'storage_location': '工厂',
          'inbound_time': '入库时间',
          'updated_at': '到期时间',
          'created_at': '创建时间',
          'notes': '备注',
          'test_id': '测试编号',
          'test_date': '日期',
          'project_id': '项目',
          'baseline_id': '基线',
          'test_result': '测试结果',
          'defect_desc': '不合格描述',
          'batch_no': '批次号',
          'defect_rate': '不良率',
          'weekly_exception': '本周异常',
          'online_time': '检验日期'
        };
        
        if (fieldMappings[field]) {
          chineseName = fieldMappings[field];
        }
        
        correctMappings[tableName][field] = chineseName;
        console.log(`    ${field} → ${chineseName}`);
      });
    }
    
    // 5. 输出修复建议
    console.log('\n🔧 步骤5: 修复建议...');
    
    console.log('修复建议:');
    console.log('1. 使用实际数据库字段结构更新规则SQL');
    console.log('2. 确保所有字段都有正确的中文别名');
    console.log('3. 处理日期字段时使用DATE_FORMAT并添加别名');
    console.log('4. 使用COALESCE处理可能的NULL值');
    
    // 输出正确的字段映射供参考
    console.log('\n📋 正确的字段映射 (JSON格式):');
    console.log(JSON.stringify(correctMappings, null, 2));
    
    console.log('\n🎉 真实字段结构检查完成！');
    
  } catch (error) {
    console.error('❌ 检查真实字段结构失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

checkRealFieldStructure().catch(console.error);
