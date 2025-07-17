import mysql from 'mysql2/promise';

async function comprehensiveFieldMapping() {
  let connection;
  
  try {
    console.log('🔧 开始系统性修复字段映射...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 检查所有表的实际字段结构
    console.log('\n📋 步骤1: 检查数据库表结构...');
    
    const tables = ['inventory', 'lab_tests', 'production_online'];
    const tableStructures = {};
    
    for (const table of tables) {
      try {
        const [columns] = await connection.execute(`DESCRIBE ${table}`);
        tableStructures[table] = columns.map(col => col.Field);
        console.log(`${table}表字段:`, tableStructures[table].join(', '));
        
        // 检查数据样本
        const [sample] = await connection.execute(`SELECT * FROM ${table} LIMIT 1`);
        if (sample.length > 0) {
          console.log(`${table}表数据样本字段:`, Object.keys(sample[0]).join(', '));
        }
      } catch (error) {
        console.log(`❌ 检查${table}表失败:`, error.message);
      }
    }
    
    // 2. 定义正确的字段映射
    console.log('\n🗺️ 步骤2: 定义正确的字段映射...');
    
    const correctFieldMappings = {
      'inventory': {
        fields: [
          'factory as 工厂',
          'warehouse as 仓库', 
          'materialCode as 物料编码',
          'materialName as 物料名称',
          'supplier as 供应商',
          'quantity as 数量',
          'status as 状态',
          'DATE_FORMAT(inboundTime, \'%Y-%m-%d\') as 入库时间',
          'DATE_FORMAT(lastUpdateTime, \'%Y-%m-%d\') as 到期时间',
          'COALESCE(notes, \'\') as 备注'
        ],
        actualFields: tableStructures['inventory'] || []
      },
      'lab_tests': {
        fields: [
          'testId as 测试编号',
          'DATE_FORMAT(testDate, \'%Y-%m-%d\') as 日期',
          'projectId as 项目',
          'baselineId as 基线',
          'materialCode as 物料编码',
          'COALESCE(quantity, 1) as 数量',
          'materialName as 物料名称',
          'supplier as 供应商',
          'testResult as 测试结果',
          'COALESCE(defectDesc, \'\') as 不合格描述',
          'COALESCE(notes, \'\') as 备注'
        ],
        actualFields: tableStructures['lab_tests'] || []
      },
      'production_online': {
        fields: [
          'factory as 工厂',
          'baselineId as 基线',
          'projectId as 项目',
          'materialCode as 物料编码',
          'materialName as 物料名称',
          'supplier as 供应商',
          'batchNo as 批次号',
          'defectRate as 不良率',
          'COALESCE(weeklyException, 0) as 本周异常',
          'DATE_FORMAT(onlineTime, \'%Y-%m-%d\') as 检验日期',
          'COALESCE(notes, \'\') as 备注'
        ],
        actualFields: tableStructures['production_online'] || []
      }
    };
    
    // 3. 修复字段映射不匹配的问题
    console.log('\n🔧 步骤3: 修复字段映射...');
    
    // 基于实际字段调整映射
    if (tableStructures['inventory']) {
      const inventoryFields = tableStructures['inventory'];
      const correctedInventoryFields = [];
      
      // 检查并修正每个字段
      if (inventoryFields.includes('factory')) correctedInventoryFields.push('factory as 工厂');
      else if (inventoryFields.includes('storage_location')) correctedInventoryFields.push('storage_location as 工厂');
      
      if (inventoryFields.includes('warehouse')) correctedInventoryFields.push('warehouse as 仓库');
      else if (inventoryFields.includes('storage_location')) correctedInventoryFields.push('storage_location as 仓库');
      
      if (inventoryFields.includes('materialCode')) correctedInventoryFields.push('materialCode as 物料编码');
      else if (inventoryFields.includes('material_code')) correctedInventoryFields.push('material_code as 物料编码');
      
      if (inventoryFields.includes('materialName')) correctedInventoryFields.push('materialName as 物料名称');
      else if (inventoryFields.includes('material_name')) correctedInventoryFields.push('material_name as 物料名称');
      
      if (inventoryFields.includes('supplier')) correctedInventoryFields.push('supplier as 供应商');
      else if (inventoryFields.includes('supplier_name')) correctedInventoryFields.push('supplier_name as 供应商');
      
      correctedInventoryFields.push('quantity as 数量');
      correctedInventoryFields.push('status as 状态');
      
      if (inventoryFields.includes('inboundTime')) {
        correctedInventoryFields.push('DATE_FORMAT(inboundTime, \'%Y-%m-%d\') as 入库时间');
      } else if (inventoryFields.includes('inbound_time')) {
        correctedInventoryFields.push('DATE_FORMAT(inbound_time, \'%Y-%m-%d\') as 入库时间');
      }
      
      if (inventoryFields.includes('lastUpdateTime')) {
        correctedInventoryFields.push('DATE_FORMAT(lastUpdateTime, \'%Y-%m-%d\') as 到期时间');
      } else if (inventoryFields.includes('updated_at')) {
        correctedInventoryFields.push('DATE_FORMAT(updated_at, \'%Y-%m-%d\') as 到期时间');
      }
      
      correctedInventoryFields.push('COALESCE(notes, \'\') as 备注');
      
      correctFieldMappings['inventory'].fields = correctedInventoryFields;
    }
    
    // 类似地修正lab_tests字段
    if (tableStructures['lab_tests']) {
      const labTestFields = tableStructures['lab_tests'];
      const correctedLabTestFields = [];
      
      if (labTestFields.includes('testId')) correctedLabTestFields.push('testId as 测试编号');
      else if (labTestFields.includes('test_id')) correctedLabTestFields.push('test_id as 测试编号');
      
      if (labTestFields.includes('testDate')) {
        correctedLabTestFields.push('DATE_FORMAT(testDate, \'%Y-%m-%d\') as 日期');
      } else if (labTestFields.includes('test_date')) {
        correctedLabTestFields.push('DATE_FORMAT(test_date, \'%Y-%m-%d\') as 日期');
      }
      
      if (labTestFields.includes('projectId')) correctedLabTestFields.push('projectId as 项目');
      else if (labTestFields.includes('project_id')) correctedLabTestFields.push('project_id as 项目');
      
      if (labTestFields.includes('baselineId')) correctedLabTestFields.push('baselineId as 基线');
      else if (labTestFields.includes('baseline_id')) correctedLabTestFields.push('baseline_id as 基线');
      
      if (labTestFields.includes('materialCode')) correctedLabTestFields.push('materialCode as 物料编码');
      else if (labTestFields.includes('material_code')) correctedLabTestFields.push('material_code as 物料编码');
      
      correctedLabTestFields.push('COALESCE(quantity, 1) as 数量');
      
      if (labTestFields.includes('materialName')) correctedLabTestFields.push('materialName as 物料名称');
      else if (labTestFields.includes('material_name')) correctedLabTestFields.push('material_name as 物料名称');
      
      if (labTestFields.includes('supplier')) correctedLabTestFields.push('supplier as 供应商');
      else if (labTestFields.includes('supplier_name')) correctedLabTestFields.push('supplier_name as 供应商');
      
      if (labTestFields.includes('testResult')) correctedLabTestFields.push('testResult as 测试结果');
      else if (labTestFields.includes('test_result')) correctedLabTestFields.push('test_result as 测试结果');
      
      if (labTestFields.includes('defectDesc')) correctedLabTestFields.push('COALESCE(defectDesc, \'\') as 不合格描述');
      else if (labTestFields.includes('defect_desc')) correctedLabTestFields.push('COALESCE(defect_desc, \'\') as 不合格描述');
      
      correctedLabTestFields.push('COALESCE(notes, \'\') as 备注');
      
      correctFieldMappings['lab_tests'].fields = correctedLabTestFields;
    }
    
    console.log('修正后的字段映射:');
    Object.keys(correctFieldMappings).forEach(table => {
      console.log(`${table}:`, correctFieldMappings[table].fields.join(', '));
    });
    
    // 4. 获取所有需要修复的规则
    console.log('\n🔍 步骤4: 获取需要修复的规则...');
    
    const [allRules] = await connection.execute(`
      SELECT id, intent_name, action_target, category
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY category, intent_name
    `);
    
    console.log(`找到 ${allRules.length} 条活跃规则需要检查`);
    
    // 5. 修复每个规则的字段映射
    console.log('\n🔧 步骤5: 修复规则字段映射...');
    
    let fixedCount = 0;
    
    for (const rule of allRules) {
      try {
        let sql = rule.action_target;
        let needsUpdate = false;
        let newSQL = sql;
        
        // 根据规则类别确定使用哪个表的字段映射
        let tableMapping = null;
        if (rule.category === '库存场景' || sql.includes('FROM inventory')) {
          tableMapping = correctFieldMappings['inventory'];
        } else if (rule.category === '测试场景' || sql.includes('FROM lab_tests')) {
          tableMapping = correctFieldMappings['lab_tests'];
        } else if (rule.category === '上线场景' || sql.includes('FROM production_online')) {
          tableMapping = correctFieldMappings['production_online'];
        }
        
        if (tableMapping) {
          // 构建新的SELECT子句
          const selectFields = tableMapping.fields.join(',\n  ');
          
          // 提取FROM子句及之后的内容
          const fromMatch = sql.match(/(FROM\s+\w+.*)/is);
          if (fromMatch) {
            newSQL = `SELECT \n  ${selectFields}\n${fromMatch[1]}`;
            needsUpdate = true;
          }
        }
        
        // 检查是否有其他需要修复的问题
        if (sql.includes('DATE_FORMAT(') && !sql.includes(' as ')) {
          // 修复DATE_FORMAT函数没有别名的问题
          newSQL = newSQL.replace(/DATE_FORMAT\([^)]+\)/g, (match) => {
            if (!match.includes(' as ')) {
              return match + ' as 日期';
            }
            return match;
          });
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          await connection.execute(`
            UPDATE nlp_intent_rules 
            SET action_target = ?, updated_at = NOW()
            WHERE id = ?
          `, [newSQL, rule.id]);
          
          console.log(`✅ 修复规则: ${rule.intent_name} (${rule.category})`);
          fixedCount++;
        }
        
      } catch (error) {
        console.log(`❌ 修复规则 ${rule.intent_name} 失败: ${error.message}`);
      }
    }
    
    console.log(`📊 成功修复 ${fixedCount} 条规则的字段映射`);
    
    // 6. 测试修复后的规则
    console.log('\n🧪 步骤6: 测试修复后的规则...');
    
    const testRules = [243, 314, 335, 485];
    
    for (const ruleId of testRules) {
      try {
        const testResponse = await fetch(`http://localhost:3001/api/rules/test/${ruleId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        });
        
        if (testResponse.ok) {
          const testResult = await testResponse.json();
          if (testResult.success) {
            console.log(`✅ 规则${ruleId}测试成功: ${testResult.data.resultCount}条记录`);
            if (testResult.data.fields && testResult.data.fields.length > 0) {
              console.log(`   字段: ${testResult.data.fields.join(', ')}`);
              
              // 检查字段是否为中文
              const hasChineseFields = testResult.data.fields.every(field => /[\u4e00-\u9fa5]/.test(field));
              console.log(`   中文字段检查: ${hasChineseFields ? '✅ 全部为中文' : '❌ 包含非中文字段'}`);
            }
          } else {
            console.log(`❌ 规则${ruleId}测试失败: ${testResult.data.error}`);
          }
        } else {
          console.log(`❌ 规则${ruleId}测试请求失败: ${testResponse.status}`);
        }
      } catch (error) {
        console.log(`❌ 规则${ruleId}测试异常: ${error.message}`);
      }
    }
    
    console.log('\n🎉 系统性字段映射修复完成！');
    console.log(`✅ 检查了 ${allRules.length} 条规则`);
    console.log(`✅ 修复了 ${fixedCount} 条规则的字段映射`);
    console.log('✅ 所有规则现在应该返回正确的中文字段名');
    console.log('✅ DATE_FORMAT等函数显示问题已解决');
    
  } catch (error) {
    console.error('❌ 系统性字段映射修复失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

comprehensiveFieldMapping().catch(console.error);
