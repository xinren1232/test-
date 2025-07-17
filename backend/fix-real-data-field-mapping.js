import mysql from 'mysql2/promise';

async function fixRealDataFieldMapping() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('🔧 修复规则的真实数据字段映射...\n');

    // 正确的字段映射模板
    const correctFieldMappings = {
      // 库存场景 - 数据库字段 -> 前端显示字段
      inventory: `SELECT
        storage_location as 工厂,
        storage_location as 仓库,
        material_code as 物料编码,
        material_name as 物料名称,
        supplier_name as 供应商,
        quantity as 数量,
        status as 状态,
        DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
        DATE_FORMAT(expiry_date, '%Y-%m-%d') as 到期时间,
        COALESCE(notes, '') as 备注
      FROM inventory`,
      
      // 测试场景 - 数据库字段 -> 前端显示字段
      testing: `SELECT
        test_id as 测试编号,
        DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
        COALESCE(project, '') as 项目,
        COALESCE(baseline, '') as 基线,
        material_code as 物料编码,
        quantity as 数量,
        material_name as 物料名称,
        supplier_name as 供应商,
        test_result as 测试结果,
        COALESCE(defect_desc, '') as 不合格描述,
        COALESCE(notes, '') as 备注
      FROM lab_tests`,
      
      // 上线场景 - 数据库字段 -> 前端显示字段
      online: `SELECT
        factory as 工厂,
        baseline as 基线,
        project as 项目,
        material_code as 物料编码,
        material_name as 物料名称,
        supplier_name as 供应商,
        batch_code as 批次号,
        defect_rate as 不良率,
        weekly_anomaly as 不良现象,
        DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期,
        COALESCE(notes, '') as 备注
      FROM online_tracking`
    };

    // 1. 修复库存相关规则
    console.log('📦 修复库存相关规则...');
    const inventoryRules = [
      'supplier_inventory_query',
      'BOE供应商库存查询',
      '东声供应商库存查询',
      '丽德宝供应商库存查询',
      '华星供应商库存查询',
      '天实供应商库存查询',
      '天马供应商库存查询',
      '奥海供应商库存查询',
      '富群供应商库存查询',
      '广正供应商库存查询',
      '怡同供应商库存查询',
      '欣冠供应商库存查询',
      '歌尔供应商库存查询',
      '结构件类库存查询',
      '光学类库存查询',
      '充电类库存查询',
      '声学类库存查询',
      '包装类库存查询'
    ];

    for (const ruleName of inventoryRules) {
      let sql = correctFieldMappings.inventory;
      
      // 根据规则类型添加WHERE条件
      if (ruleName.includes('供应商')) {
        const supplierName = ruleName.replace('供应商库存查询', '');
        if (supplierName !== 'supplier_inventory_query') {
          sql += ` WHERE supplier_name = '${supplierName}'`;
        } else {
          sql += ` WHERE supplier_name LIKE '%{{ supplier }}%'
            {% if material %} AND material_name LIKE '%{{ material }}%' {% endif %}
            {% if status %} AND status = '{{ status }}' {% endif %}
            {% if factory %} AND storage_location LIKE '%{{ factory }}%' {% endif %}`;
        }
      } else if (ruleName.includes('类')) {
        const materialCategories = {
          '结构件类': ['电池盖', '中框', '手机卡托', '侧键', '装饰件'],
          '光学类': ['LCD显示屏', 'OLED显示屏', '摄像头模组'],
          '充电类': ['电池', '充电器'],
          '声学类': ['扬声器', '听筒'],
          '包装类': ['保护套', '标签', '包装盒']
        };
        
        const categoryName = ruleName.replace('库存查询', '');
        const materials = materialCategories[categoryName];
        if (materials) {
          sql += ` WHERE material_name IN ('${materials.join("', '")}')`;
        }
      }
      
      sql += ` ORDER BY inbound_time DESC LIMIT 50`;
      
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET action_target = ? 
        WHERE intent_name = ?
      `, [sql, ruleName]);
      
      console.log(`  ✅ 修复规则: ${ruleName}`);
    }

    console.log('\n🧪 修复测试相关规则...');
    // 2. 修复测试相关规则
    const testingRules = [
      'supplier_testing_query',
      'BOE供应商测试查询',
      '东声供应商测试查询',
      '天马供应商测试查询',
      '歌尔供应商测试查询',
      '结构件类测试查询',
      '光学类测试查询',
      '充电类测试查询'
    ];

    for (const ruleName of testingRules) {
      let sql = correctFieldMappings.testing;
      
      if (ruleName.includes('供应商')) {
        const supplierName = ruleName.replace('供应商测试查询', '');
        if (supplierName !== 'supplier_testing_query') {
          sql += ` WHERE supplier_name = '${supplierName}'`;
        } else {
          sql += ` WHERE supplier_name LIKE '%{{ supplier }}%'
            {% if material %} AND material_name LIKE '%{{ material }}%' {% endif %}
            {% if test_result %} AND test_result = '{{ test_result }}' {% endif %}`;
        }
      } else if (ruleName.includes('类')) {
        const materialCategories = {
          '结构件类': ['电池盖', '中框', '手机卡托', '侧键', '装饰件'],
          '光学类': ['LCD显示屏', 'OLED显示屏', '摄像头模组'],
          '充电类': ['电池', '充电器']
        };
        
        const categoryName = ruleName.replace('测试查询', '');
        const materials = materialCategories[categoryName];
        if (materials) {
          sql += ` WHERE material_name IN ('${materials.join("', '")}')`;
        }
      }
      
      sql += ` ORDER BY test_date DESC LIMIT 50`;
      
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET action_target = ? 
        WHERE intent_name = ?
      `, [sql, ruleName]);
      
      console.log(`  ✅ 修复规则: ${ruleName}`);
    }

    console.log('\n📊 修复上线相关规则...');
    // 3. 修复上线相关规则
    const onlineRules = [
      'supplier_production_query',
      'BOE供应商上线查询',
      '天马供应商上线查询',
      '歌尔供应商上线查询'
    ];

    for (const ruleName of onlineRules) {
      let sql = correctFieldMappings.online;
      
      if (ruleName.includes('供应商')) {
        const supplierName = ruleName.replace('供应商上线查询', '');
        if (supplierName !== 'supplier_production_query') {
          sql += ` WHERE supplier_name = '${supplierName}'`;
        } else {
          sql += ` WHERE supplier_name LIKE '%{{ supplier }}%'
            {% if material %} AND material_name LIKE '%{{ material }}%' {% endif %}
            {% if project %} AND project LIKE '%{{ project }}%' {% endif %}`;
        }
      }
      
      sql += ` ORDER BY inspection_date DESC LIMIT 50`;
      
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET action_target = ? 
        WHERE intent_name = ?
      `, [sql, ruleName]);
      
      console.log(`  ✅ 修复规则: ${ruleName}`);
    }

    console.log('\n🎉 字段映射修复完成！');
    console.log('✅ 所有规则现在都使用正确的数据库字段映射到前端期望的字段名称');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  } finally {
    await connection.end();
  }
}

fixRealDataFieldMapping();
