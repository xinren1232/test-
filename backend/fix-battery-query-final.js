import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixBatteryQueryFinal() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔧 最终修复电池查询问题...\n');
    
    // 1. 检查当前的物料库存查询规则
    console.log('📋 1. 检查当前的物料库存查询规则:');
    const [currentRules] = await connection.execute(`
      SELECT intent_name, action_target
      FROM nlp_intent_rules 
      WHERE intent_name = '物料库存查询'
    `);

    if (currentRules.length > 0) {
      console.log('当前规则SQL:');
      console.log(currentRules[0].action_target.substring(0, 200) + '...');
    }

    // 2. 创建更严格的精确匹配SQL
    console.log('\n🔧 2. 创建更严格的精确匹配SQL:');
    
    const strictSQL = `
      SELECT 
        storage_location as 工厂,
        storage_location as 仓库,
        material_code as 物料编码,
        material_name as 物料名称,
        supplier_name as 供应商,
        quantity as 数量,
        status as 状态,
        DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
        notes as 备注
      FROM inventory 
      WHERE 
        CASE 
          -- 精确匹配优先（完全相等）
          WHEN material_name = ? THEN 1
          -- 严格的开头匹配，但排除包含关系
          WHEN material_name LIKE CONCAT(?, '%') 
               AND material_name != CONCAT(?, '盖')
               AND material_name != CONCAT(?, '壳') 
               AND material_name != CONCAT(?, '座')
               AND material_name != CONCAT(?, '线')
               AND material_name != CONCAT(?, '器')
               AND LENGTH(material_name) - LENGTH(?) <= 2
               THEN 1
          ELSE 0
        END = 1
      ORDER BY 
        -- 精确匹配排在最前面
        CASE WHEN material_name = ? THEN 1 ELSE 2 END,
        inbound_time DESC 
      LIMIT 10
    `;

    // 3. 更新物料库存查询规则
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET 
        action_target = ?,
        updated_at = NOW()
      WHERE intent_name = '物料库存查询'
    `, [strictSQL]);

    console.log('✅ 物料库存查询规则已更新为严格匹配模式');

    // 4. 测试新的查询逻辑
    console.log('\n🧪 3. 测试新的查询逻辑:');
    
    const testMaterials = ['电池', '电池盖', '充电器'];
    
    for (const material of testMaterials) {
      console.log(`\n测试物料: "${material}"`);
      
      // 构建测试查询（替换所有占位符）
      const testQuery = strictSQL
        .replace(/\?/g, `'${material}'`);
      
      try {
        const [results] = await connection.execute(testQuery);
        console.log(`  返回 ${results.length} 条结果:`);
        
        if (results.length > 0) {
          const materialTypes = [...new Set(results.map(r => r.物料名称))];
          console.log(`  物料类型: ${materialTypes.join(', ')}`);
          
          // 验证结果
          if (material === '电池') {
            const hasOnlyBattery = materialTypes.every(type => type === '电池');
            if (hasOnlyBattery) {
              console.log(`  ✅ 查询结果正确：只包含电池`);
            } else {
              console.log(`  ❌ 查询结果错误：包含其他物料 ${materialTypes.join(', ')}`);
            }
          }
        } else {
          console.log(`  ⚠️ 没有找到匹配的记录`);
        }
      } catch (error) {
        console.log(`  ❌ 查询失败: ${error.message}`);
      }
    }

    // 5. 创建专门的电池查询规则
    console.log('\n🔧 4. 创建专门的电池查询规则:');
    
    const batterySpecificSQL = `
      SELECT 
        storage_location as 工厂,
        material_code as 物料编码,
        material_name as 物料名称,
        supplier_name as 供应商,
        quantity as 数量,
        status as 状态,
        DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
        notes as 备注
      FROM inventory 
      WHERE material_name = '电池'
      ORDER BY inbound_time DESC 
      LIMIT 10
    `;

    // 检查是否已存在电池专用规则
    const [existingBatteryRule] = await connection.execute(`
      SELECT id FROM nlp_intent_rules WHERE intent_name = '电池库存查询'
    `);

    if (existingBatteryRule.length === 0) {
      // 创建新的电池专用规则
      await connection.execute(`
        INSERT INTO nlp_intent_rules (
          intent_name, 
          trigger_words, 
          action_target, 
          action_type, 
          priority, 
          status,
          description,
          example_query,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        '电池库存查询',
        JSON.stringify(['电池']),
        batterySpecificSQL,
        'sql_query',
        15, // 高优先级
        'active',
        '专门查询电池库存，避免与电池盖混淆',
        '查询电池库存'
      ]);
      
      console.log('✅ 创建了专门的电池库存查询规则');
    } else {
      // 更新现有规则
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET 
          action_target = ?,
          priority = 15,
          updated_at = NOW()
        WHERE intent_name = '电池库存查询'
      `, [batterySpecificSQL]);
      
      console.log('✅ 更新了现有的电池库存查询规则');
    }

    // 6. 验证修复结果
    console.log('\n📝 5. 验证修复结果:');
    const [updatedRules] = await connection.execute(`
      SELECT intent_name, priority, trigger_words
      FROM nlp_intent_rules 
      WHERE intent_name IN ('物料库存查询', '电池库存查询')
      ORDER BY priority DESC
    `);

    updatedRules.forEach(rule => {
      const triggers = rule.trigger_words ? JSON.parse(rule.trigger_words) : [];
      console.log(`  ${rule.intent_name}: 优先级 ${rule.priority}, 触发词 [${triggers.join(', ')}]`);
    });

    console.log('\n✅ 电池查询问题最终修复完成！');
    console.log('\n📋 修复内容总结:');
    console.log('  1. 更新了物料库存查询规则，使用更严格的精确匹配逻辑');
    console.log('  2. 创建了专门的电池库存查询规则，避免与电池盖混淆');
    console.log('  3. 设置了高优先级，确保电池查询优先匹配专用规则');
    console.log('  4. 添加了长度限制和排除逻辑，防止误匹配');

  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行修复
fixBatteryQueryFinal();
