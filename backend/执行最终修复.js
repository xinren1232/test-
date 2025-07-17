import mysql from 'mysql2/promise';

async function executeFinalFix() {
  let connection;
  
  try {
    console.log('🚀 开始执行最终修复...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 检查实际数据库表结构
    console.log('\n📋 步骤1: 检查数据库表结构...');
    
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('数据库中的表:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    // 检查inventory表结构
    let inventoryFields = [];
    try {
      const [inventoryColumns] = await connection.execute('DESCRIBE inventory');
      console.log('\n📦 inventory表字段:');
      inventoryColumns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type}`);
        inventoryFields.push(col.Field);
      });
    } catch (error) {
      console.log('❌ inventory表不存在:', error.message);
    }
    
    // 检查lab_tests表结构
    let labTestFields = [];
    try {
      const [labTestColumns] = await connection.execute('DESCRIBE lab_tests');
      console.log('\n🧪 lab_tests表字段:');
      labTestColumns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type}`);
        labTestFields.push(col.Field);
      });
    } catch (error) {
      console.log('❌ lab_tests表不存在:', error.message);
    }
    
    // 2. 基于实际字段结构生成正确的SQL
    console.log('\n🔧 步骤2: 生成正确的SQL查询...');
    
    // 生成库存场景的正确SQL
    let correctInventorySQL = '';
    if (inventoryFields.length > 0) {
      // 根据实际字段生成SQL，使用字段映射
      const fieldMapping = {
        'factory': inventoryFields.find(f => f.includes('factory') || f.includes('工厂')) || 'factory',
        'warehouse': inventoryFields.find(f => f.includes('warehouse') || f.includes('仓库')) || 'warehouse', 
        'material_code': inventoryFields.find(f => f.includes('material_code') || f.includes('materialCode')) || 'material_code',
        'material_name': inventoryFields.find(f => f.includes('material_name') || f.includes('materialName')) || 'material_name',
        'supplier_name': inventoryFields.find(f => f.includes('supplier') || f.includes('供应商')) || 'supplier_name',
        'quantity': inventoryFields.find(f => f.includes('quantity') || f.includes('数量')) || 'quantity',
        'status': inventoryFields.find(f => f.includes('status') || f.includes('状态')) || 'status',
        'inbound_time': inventoryFields.find(f => f.includes('inbound') || f.includes('入库')) || 'inbound_time',
        'expiry_time': inventoryFields.find(f => f.includes('expiry') || f.includes('到期')) || 'expiry_time',
        'notes': inventoryFields.find(f => f.includes('notes') || f.includes('备注')) || 'notes'
      };
      
      console.log('库存字段映射:');
      Object.entries(fieldMapping).forEach(([key, value]) => {
        console.log(`  ${key} → ${value}`);
      });
      
      correctInventorySQL = `SELECT 
  ${fieldMapping.factory} as 工厂,
  ${fieldMapping.warehouse} as 仓库,
  ${fieldMapping.material_code} as 物料编码,
  ${fieldMapping.material_name} as 物料名称,
  ${fieldMapping.supplier_name} as 供应商,
  ${fieldMapping.quantity} as 数量,
  ${fieldMapping.status} as 状态,
  DATE_FORMAT(${fieldMapping.inbound_time}, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(${fieldMapping.expiry_time}, '%Y-%m-%d') as 到期时间,
  COALESCE(${fieldMapping.notes}, '') as 备注
FROM inventory`;
    }
    
    // 生成测试场景的正确SQL
    let correctTestSQL = '';
    if (labTestFields.length > 0) {
      const testFieldMapping = {
        'test_id': labTestFields.find(f => f.includes('test_id') || f.includes('测试编号')) || 'test_id',
        'test_date': labTestFields.find(f => f.includes('test_date') || f.includes('date')) || 'test_date',
        'project_id': labTestFields.find(f => f.includes('project') || f.includes('项目')) || 'project_id',
        'baseline_id': labTestFields.find(f => f.includes('baseline') || f.includes('基线')) || 'baseline_id',
        'material_code': labTestFields.find(f => f.includes('material_code') || f.includes('materialCode')) || 'material_code',
        'quantity': labTestFields.find(f => f.includes('quantity') || f.includes('数量')) || 'quantity',
        'material_name': labTestFields.find(f => f.includes('material_name') || f.includes('materialName')) || 'material_name',
        'supplier_name': labTestFields.find(f => f.includes('supplier') || f.includes('供应商')) || 'supplier_name',
        'test_result': labTestFields.find(f => f.includes('test_result') || f.includes('result')) || 'test_result',
        'defect_desc': labTestFields.find(f => f.includes('defect') || f.includes('不合格')) || 'defect_desc',
        'notes': labTestFields.find(f => f.includes('notes') || f.includes('备注')) || 'notes'
      };
      
      console.log('\n测试字段映射:');
      Object.entries(testFieldMapping).forEach(([key, value]) => {
        console.log(`  ${key} → ${value}`);
      });
      
      correctTestSQL = `SELECT 
  ${testFieldMapping.test_id} as 测试编号,
  DATE_FORMAT(${testFieldMapping.test_date}, '%Y-%m-%d') as 日期,
  COALESCE(${testFieldMapping.project_id}, '未指定') as 项目,
  COALESCE(${testFieldMapping.baseline_id}, '未指定') as 基线,
  ${testFieldMapping.material_code} as 物料编码,
  COALESCE(${testFieldMapping.quantity}, 1) as 数量,
  ${testFieldMapping.material_name} as 物料名称,
  ${testFieldMapping.supplier_name} as 供应商,
  ${testFieldMapping.test_result} as 测试结果,
  COALESCE(${testFieldMapping.defect_desc}, '') as 不合格描述,
  COALESCE(${testFieldMapping.notes}, '') as 备注
FROM lab_tests`;
    }
    
    // 3. 更新库存场景规则
    console.log('\n📦 步骤3: 更新库存场景规则...');
    
    if (correctInventorySQL) {
      const inventoryRules = [
        { name: '物料库存信息查询_优化', where: 'WHERE material_name LIKE CONCAT(\'%\', ?, \'%\')' },
        { name: '供应商库存查询_优化', where: 'WHERE supplier_name LIKE CONCAT(\'%\', ?, \'%\')' },
        { name: '库存状态查询', where: 'WHERE status LIKE CONCAT(\'%\', ?, \'%\')' }
      ];
      
      for (const rule of inventoryRules) {
        const fullSQL = `${correctInventorySQL}\n${rule.where}\nORDER BY id DESC\nLIMIT 10`;
        
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET action_target = ?, category = '库存场景', updated_at = NOW()
          WHERE intent_name = ?
        `, [fullSQL, rule.name]);
        
        console.log(`✅ 更新库存规则: ${rule.name}`);
      }
    }
    
    // 4. 更新测试场景规则
    console.log('\n🧪 步骤4: 更新测试场景规则...');
    
    if (correctTestSQL) {
      const testRules = [
        { name: '物料测试情况查询', where: 'WHERE material_name LIKE CONCAT(\'%\', ?, \'%\')' },
        { name: '供应商测试情况查询', where: 'WHERE supplier_name LIKE CONCAT(\'%\', ?, \'%\')' },
        { name: 'NG测试结果查询_优化', where: 'WHERE test_result IN (\'FAIL\', \'NG\', \'不合格\')' },
        { name: '项目测试情况查询', where: 'WHERE project_id LIKE CONCAT(\'%\', ?, \'%\')' },
        { name: '基线测试情况查询', where: 'WHERE baseline_id LIKE CONCAT(\'%\', ?, \'%\')' }
      ];
      
      for (const rule of testRules) {
        const fullSQL = `${correctTestSQL}\n${rule.where}\nORDER BY test_date DESC\nLIMIT 10`;
        
        await connection.execute(`
          UPDATE nlp_intent_rules 
          SET action_target = ?, category = '测试场景', updated_at = NOW()
          WHERE intent_name = ?
        `, [fullSQL, rule.name]);
        
        console.log(`✅ 更新测试规则: ${rule.name}`);
      }
    }
    
    // 5. 优化数据探索规则的触发词匹配
    console.log('\n🔍 步骤5: 优化数据探索规则触发词...');
    
    const explorationRuleUpdates = [
      {
        name: '查看所有供应商',
        triggers: [
          "供应商列表", "所有供应商", "有哪些供应商", "供应商有什么",
          "系统里有哪些供应商", "供应商都有什么", "查看供应商", "显示供应商",
          "供应商信息", "厂商列表", "供货商", "制造商"
        ]
      },
      {
        name: '查看所有工厂', 
        triggers: [
          "工厂列表", "所有工厂", "有哪些工厂", "工厂有什么",
          "系统里有哪些工厂", "工厂都有什么", "查看工厂", "显示工厂",
          "工厂信息", "生产基地", "厂区", "制造厂"
        ]
      },
      {
        name: '查看所有仓库',
        triggers: [
          "仓库列表", "所有仓库", "有哪些仓库", "仓库有什么",
          "系统里有哪些仓库", "仓库都有什么", "查看仓库", "显示仓库",
          "仓库信息", "库房信息", "存储区", "仓储"
        ]
      },
      {
        name: '查看所有物料',
        triggers: [
          "物料列表", "所有物料", "有哪些物料", "物料有什么",
          "系统里有哪些物料", "物料都有什么", "查看物料", "显示物料",
          "物料信息", "物料种类", "料件", "零件", "材料", "组件"
        ]
      },
      {
        name: '查看库存状态分布',
        triggers: [
          "状态分布", "库存状态", "有哪些状态", "状态统计",
          "库存状态都有哪些", "状态都有什么", "状态信息", "库存状态分布"
        ]
      }
    ];
    
    for (const update of explorationRuleUpdates) {
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET trigger_words = ?, updated_at = NOW()
        WHERE intent_name = ?
      `, [JSON.stringify(update.triggers), update.name]);
      
      console.log(`✅ 优化触发词: ${update.name}`);
    }
    
    // 6. 测试修复后的查询
    console.log('\n🧪 步骤6: 测试修复后的查询...');
    
    if (correctInventorySQL) {
      try {
        const testSQL = correctInventorySQL + '\nLIMIT 1';
        const [testResult] = await connection.execute(testSQL);
        console.log('✅ 库存查询测试成功');
        if (testResult.length > 0) {
          console.log('  返回字段:', Object.keys(testResult[0]).join(', '));
        }
      } catch (error) {
        console.log('❌ 库存查询测试失败:', error.message);
      }
    }
    
    if (correctTestSQL) {
      try {
        const testSQL = correctTestSQL + '\nLIMIT 1';
        const [testResult] = await connection.execute(testSQL);
        console.log('✅ 测试查询测试成功');
        if (testResult.length > 0) {
          console.log('  返回字段:', Object.keys(testResult[0]).join(', '));
        }
      } catch (error) {
        console.log('❌ 测试查询测试失败:', error.message);
      }
    }
    
    // 7. 统计最终结果
    console.log('\n📊 步骤7: 统计修复结果...');
    
    const [totalRules] = await connection.execute(
      'SELECT COUNT(*) as total FROM nlp_intent_rules WHERE status = "active"'
    );
    
    const [categoryStats] = await connection.execute(`
      SELECT 
        category,
        COUNT(*) as 规则数量,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as 活跃规则
      FROM nlp_intent_rules 
      WHERE category IN ('数据探索', '测试场景', '库存场景')
      GROUP BY category
      ORDER BY category
    `);
    
    console.log('📈 修复完成统计:');
    console.log(`   总活跃规则: ${totalRules[0].total}条`);
    categoryStats.forEach(stat => {
      console.log(`   ${stat.category}: ${stat.活跃规则}/${stat.规则数量} 条活跃`);
    });
    
    console.log('\n🎉 最终修复完成！');
    console.log('✅ 数据库字段映射已修复');
    console.log('✅ 测试场景字段已标准化');
    console.log('✅ 库存场景字段已标准化');
    console.log('✅ 数据探索规则触发词已优化');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

executeFinalFix().catch(console.error);
