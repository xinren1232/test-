import initializeDatabase from './src/models/index.js';

async function fixInventoryFieldMapping() {
  console.log('🔧 修复库存字段映射问题...\n');
  
  try {
    const db = await initializeDatabase();
    const sequelize = db.sequelize;

    // 1. 检查inventory表的实际字段
    console.log('=== 第一步：检查inventory表实际字段 ===');
    const inventoryColumns = await sequelize.query('DESCRIBE inventory', {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log('📦 inventory表实际字段:');
    inventoryColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });
    
    const actualFields = inventoryColumns.map(col => col.Field);
    
    // 2. 检查online_tracking表是否有factory字段
    console.log('\n=== 第二步：检查online_tracking表字段 ===');
    const onlineColumns = await sequelize.query('DESCRIBE online_tracking', {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log('🏭 online_tracking表实际字段:');
    onlineColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });
    
    const hasFactory = onlineColumns.some(col => col.Field === 'factory');
    console.log(`online_tracking表${hasFactory ? '有' : '没有'}factory字段`);

    // 3. 根据实际字段修复库存查询规则
    console.log('\n=== 第三步：修复库存查询规则 ===');
    
    // 构建正确的库存查询SQL，基于实际存在的字段
    let inventoryQuerySQL = `SELECT `;
    
    // 工厂字段 - 如果inventory表没有factory字段，使用固定值或从其他表关联
    if (actualFields.includes('factory')) {
      inventoryQuerySQL += `COALESCE(factory, '未指定') as 工厂,`;
    } else {
      inventoryQuerySQL += `'未指定' as 工厂,`;
    }
    
    // 仓库字段
    if (actualFields.includes('storage_location')) {
      inventoryQuerySQL += `COALESCE(storage_location, '未指定') as 仓库,`;
    } else if (actualFields.includes('warehouse')) {
      inventoryQuerySQL += `COALESCE(warehouse, '未指定') as 仓库,`;
    } else {
      inventoryQuerySQL += `'未指定' as 仓库,`;
    }
    
    // 物料类型字段
    if (actualFields.includes('material_type')) {
      inventoryQuerySQL += `COALESCE(material_type, material_code) as 物料类型,`;
    } else {
      inventoryQuerySQL += `material_code as 物料类型,`;
    }
    
    // 其他字段
    inventoryQuerySQL += `
      supplier_name as 供应商名称,
      supplier_name as 供应商,
      quantity as 数量,
      COALESCE(status, '正常') as 状态,
      DATE_FORMAT(inbound_time, '%Y-%m-%d %H:%i') as 入库时间,
      DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
      COALESCE(notes, '') as 备注
    FROM inventory 
    ORDER BY inbound_time DESC`;
    
    console.log('修复后的库存查询SQL:');
    console.log(inventoryQuerySQL);
    
    // 4. 更新数据库中的库存查询规则
    await sequelize.query(`
      UPDATE nlp_intent_rules 
      SET 
        action_target = '${inventoryQuerySQL.replace(/'/g, "''")}',
        description = '查询库存信息，显示与前端页面一致的字段（基于实际数据库字段）',
        example_query = '查询库存信息'
      WHERE intent_name LIKE '%库存%' AND action_target LIKE '%inventory%'
    `);
    console.log('✅ 库存查询规则已修复');

    // 5. 测试修复后的查询
    console.log('\n=== 第四步：测试修复后的查询 ===');
    
    const testResult = await sequelize.query(inventoryQuerySQL + ' LIMIT 3', {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log('📊 测试查询结果:');
    if (testResult.length > 0) {
      console.log('返回字段:', Object.keys(testResult[0]).join(', '));
      console.log('前端要求字段: 工厂,仓库,物料类型,供应商名称,供应商,数量,状态,入库时间,到期时间,备注');
      
      const actualFields = Object.keys(testResult[0]);
      const requiredFields = ['工厂', '仓库', '物料类型', '供应商名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'];
      
      const missingFields = requiredFields.filter(field => !actualFields.includes(field));
      const extraFields = actualFields.filter(field => !requiredFields.includes(field));
      
      if (missingFields.length === 0 && extraFields.length === 0) {
        console.log('✅ 字段完全对齐');
      } else {
        console.log('❌ 字段不完全对齐');
        if (missingFields.length > 0) console.log('缺少字段:', missingFields.join(', '));
        if (extraFields.length > 0) console.log('多余字段:', extraFields.join(', '));
      }
      
      console.log('\n📋 示例数据:');
      testResult.forEach((row, index) => {
        console.log(`${index + 1}. ${row.物料类型} - ${row.供应商} (数量: ${row.数量})`);
      });
    } else {
      console.log('❌ 没有查询到数据');
    }

    // 6. 检查并修复其他可能有字段问题的规则
    console.log('\n=== 第五步：检查其他规则的字段问题 ===');
    
    const rulesWithFieldIssues = await sequelize.query(`
      SELECT intent_name, action_target 
      FROM nlp_intent_rules 
      WHERE action_target LIKE '%factory%' 
         OR action_target LIKE '%warehouse%'
         OR action_target LIKE '%risk_level%'
      ORDER BY intent_name
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    if (rulesWithFieldIssues.length > 0) {
      console.log(`发现 ${rulesWithFieldIssues.length} 个规则可能有字段问题:`);
      rulesWithFieldIssues.forEach(rule => {
        console.log(`- ${rule.intent_name}`);
      });
      
      // 修复这些规则中的字段问题
      for (const rule of rulesWithFieldIssues) {
        let fixedSQL = rule.action_target;
        
        // 替换不存在的字段
        if (!actualFields.includes('factory')) {
          fixedSQL = fixedSQL.replace(/factory/g, "'未指定' as factory");
        }
        if (!actualFields.includes('warehouse')) {
          fixedSQL = fixedSQL.replace(/warehouse/g, "storage_location");
        }
        if (!actualFields.includes('risk_level')) {
          fixedSQL = fixedSQL.replace(/risk_level/g, "'正常' as risk_level");
        }
        
        if (fixedSQL !== rule.action_target) {
          await sequelize.query(`
            UPDATE nlp_intent_rules 
            SET action_target = ?
            WHERE intent_name = ?
          `, {
            replacements: [fixedSQL, rule.intent_name],
            type: sequelize.QueryTypes.UPDATE
          });
          console.log(`✅ 已修复规则: ${rule.intent_name}`);
        }
      }
    } else {
      console.log('✅ 没有发现其他字段问题');
    }

    console.log('\n🎉 库存字段映射修复完成！');
    
    await sequelize.close();
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
    throw error;
  }
}

fixInventoryFieldMapping().catch(console.error);
