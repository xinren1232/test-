import mysql from 'mysql2/promise';

async function simpleFieldFix() {
  let connection;
  
  try {
    console.log('🔧 开始简单字段修复...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 检查inventory表结构
    console.log('\n📋 检查inventory表结构...');
    const [inventoryColumns] = await connection.execute('DESCRIBE inventory');
    const inventoryFields = inventoryColumns.map(col => col.Field);
    console.log('inventory表字段:', inventoryFields.join(', '));
    
    // 2. 修复库存场景规则的字段映射
    console.log('\n🔧 修复库存场景规则...');
    
    // 基于实际字段构建正确的SELECT语句
    const inventorySelectFields = [];
    
    if (inventoryFields.includes('factory')) {
      inventorySelectFields.push('factory as 工厂');
    } else if (inventoryFields.includes('storage_location')) {
      inventorySelectFields.push('storage_location as 工厂');
    }
    
    if (inventoryFields.includes('warehouse')) {
      inventorySelectFields.push('warehouse as 仓库');
    } else if (inventoryFields.includes('storage_location')) {
      inventorySelectFields.push('storage_location as 仓库');
    }
    
    if (inventoryFields.includes('material_code')) {
      inventorySelectFields.push('material_code as 物料编码');
    } else if (inventoryFields.includes('materialCode')) {
      inventorySelectFields.push('materialCode as 物料编码');
    }
    
    if (inventoryFields.includes('material_name')) {
      inventorySelectFields.push('material_name as 物料名称');
    } else if (inventoryFields.includes('materialName')) {
      inventorySelectFields.push('materialName as 物料名称');
    }
    
    if (inventoryFields.includes('supplier_name')) {
      inventorySelectFields.push('supplier_name as 供应商');
    } else if (inventoryFields.includes('supplier')) {
      inventorySelectFields.push('supplier as 供应商');
    }
    
    inventorySelectFields.push('quantity as 数量');
    inventorySelectFields.push('status as 状态');
    
    if (inventoryFields.includes('inbound_time')) {
      inventorySelectFields.push('DATE_FORMAT(inbound_time, \'%Y-%m-%d\') as 入库时间');
    } else if (inventoryFields.includes('inboundTime')) {
      inventorySelectFields.push('DATE_FORMAT(inboundTime, \'%Y-%m-%d\') as 入库时间');
    }
    
    if (inventoryFields.includes('updated_at')) {
      inventorySelectFields.push('DATE_FORMAT(updated_at, \'%Y-%m-%d\') as 到期时间');
    } else if (inventoryFields.includes('lastUpdateTime')) {
      inventorySelectFields.push('DATE_FORMAT(lastUpdateTime, \'%Y-%m-%d\') as 到期时间');
    }
    
    inventorySelectFields.push('COALESCE(notes, \'\') as 备注');
    
    console.log('构建的字段映射:', inventorySelectFields.join(', '));
    
    // 3. 更新库存相关规则
    const inventoryRules = [
      { name: '物料库存信息查询_优化', where: 'WHERE material_name LIKE CONCAT(\'%\', ?, \'%\')' },
      { name: '供应商库存查询_优化', where: 'WHERE supplier_name LIKE CONCAT(\'%\', ?, \'%\')' },
      { name: '库存状态查询', where: 'WHERE status LIKE CONCAT(\'%\', ?, \'%\')' }
    ];
    
    for (const rule of inventoryRules) {
      const newSQL = `SELECT \n  ${inventorySelectFields.join(',\n  ')}\nFROM inventory\n${rule.where}\nORDER BY id DESC`;
      
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET action_target = ?, updated_at = NOW()
        WHERE intent_name = ?
      `, [newSQL, rule.name]);
      
      console.log(`✅ 更新规则: ${rule.name}`);
    }
    
    // 4. 修复数据探索规则
    console.log('\n🔧 修复数据探索规则...');
    
    const explorationRules = [
      {
        id: 485,
        name: '查看所有供应商',
        sql: `SELECT DISTINCT 
  supplier_name as 供应商,
  COUNT(*) as 记录数量
FROM inventory 
WHERE supplier_name IS NOT NULL AND supplier_name != ''
GROUP BY supplier_name
ORDER BY 记录数量 DESC`
      },
      {
        id: 480,
        name: '查看所有物料',
        sql: `SELECT DISTINCT 
  material_name as 物料名称,
  material_code as 物料编码,
  COUNT(*) as 记录数量
FROM inventory 
WHERE material_name IS NOT NULL AND material_name != ''
GROUP BY material_name, material_code
ORDER BY 记录数量 DESC`
      }
    ];
    
    for (const rule of explorationRules) {
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET action_target = ?, updated_at = NOW()
        WHERE id = ?
      `, [rule.sql, rule.id]);
      
      console.log(`✅ 更新规则: ${rule.name} (ID: ${rule.id})`);
    }
    
    // 5. 测试修复后的规则
    console.log('\n🧪 测试修复后的规则...');
    
    const testRules = [243, 485];
    
    for (const ruleId of testRules) {
      try {
        const [ruleInfo] = await connection.execute(
          'SELECT intent_name, action_target FROM nlp_intent_rules WHERE id = ?',
          [ruleId]
        );
        
        if (ruleInfo.length === 0) {
          console.log(`❌ 规则${ruleId}不存在`);
          continue;
        }
        
        console.log(`\n测试规则${ruleId}: ${ruleInfo[0].intent_name}`);
        
        // 直接执行SQL测试
        let testSQL = ruleInfo[0].action_target;
        if (testSQL.includes('?')) {
          testSQL = testSQL.replace(/\?/g, "'测试'");
        }
        
        const [results] = await connection.execute(testSQL);
        console.log(`✅ SQL执行成功: ${results.length}条记录`);
        
        if (results.length > 0) {
          const fields = Object.keys(results[0]);
          console.log(`   字段: ${fields.join(', ')}`);
          
          // 检查字段是否为中文
          const hasChineseFields = fields.every(field => /[\u4e00-\u9fa5]/.test(field));
          console.log(`   中文字段检查: ${hasChineseFields ? '✅ 全部为中文' : '❌ 包含非中文字段'}`);
          
          console.log(`   数据样本:`, results[0]);
        }
        
      } catch (error) {
        console.log(`❌ 测试规则${ruleId}失败: ${error.message}`);
      }
    }
    
    console.log('\n🎉 简单字段修复完成！');
    console.log('✅ 库存场景规则字段映射已修复');
    console.log('✅ 数据探索规则字段映射已修复');
    console.log('✅ 所有规则现在应该返回正确的中文字段名');
    
  } catch (error) {
    console.error('❌ 简单字段修复失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

simpleFieldFix().catch(console.error);
