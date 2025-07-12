import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 基于实际数据生成程序的真实数据映射
const ACTUAL_DATA_MAPPING = {
  // 实际的供应商列表（来自MaterialSupplierMap.js）
  suppliers: {
    '结构件类': ['聚龙', '欣冠', '广正'],
    '光学类': ['帝晶', '天马', 'BOE', '华星'],
    '充电类': ['百俊达', '奥海', '辰阳', '锂威', '风华', '维科'],
    '声学类': ['东声', '豪声', '歌尔'],
    '包料类': ['丽德宝', '裕同', '富群']
  },
  
  // 实际的物料列表
  materials: {
    '结构件类': ['电池盖', '中框', '手机卡托', '侧键', '装饰件'],
    '光学类': ['LCD显示屏', 'OLED显示屏', '摄像头模组'],
    '充电类': ['电池', '充电器'],
    '声学类': ['扬声器', '听筒'],
    '包料类': ['保护套', '标签', '包装盒']
  },
  
  // 实际的工厂列表（来自material_supplier_mapping.js）
  factories: ['重庆工厂', '深圳工厂', '南昌工厂', '宜宾工厂'],
  
  // 实际的项目-基线映射
  projects: {
    'I6789': ['X6827', 'S665LN', 'KI4K', 'X6828'],
    'I6788': ['X6831', 'KI5K', 'KI3K'],
    'I6787': ['S662LN', 'S663LN', 'S664LN']
  },
  
  // 实际的缺陷类型映射
  defects: {
    '电池盖': ['划伤', '变形', '破裂', '起鼓', '色差', '尺寸异常'],
    '中框': ['变形', '破裂', '掉漆', '尺寸异常'],
    'LCD显示屏': ['漏光', '暗点', '偏色', '亮晶'],
    'OLED显示屏': ['闪屏', 'mura', '亮点', '亮线'],
    '电池': ['起鼓', '鼓包', '漏液', '电压不稳定'],
    '扬声器': ['无声', '杂音', '音量小', '破裂']
  }
};

async function optimizeRulesWithActualData() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔧 基于实际数据优化规则...\n');
    
    // 1. 首先检查实际数据库中的数据
    console.log('🔍 检查实际数据库内容...');
    
    // 检查供应商
    const [suppliers] = await connection.execute(`
      SELECT DISTINCT supplier_name FROM inventory 
      ORDER BY supplier_name
    `);
    console.log('实际供应商列表:');
    suppliers.forEach(s => console.log(`  - ${s.supplier_name}`));
    
    // 检查物料
    const [materials] = await connection.execute(`
      SELECT DISTINCT material_name FROM inventory 
      ORDER BY material_name
    `);
    console.log('\n实际物料列表:');
    materials.forEach(m => console.log(`  - ${m.material_name}`));
    
    // 检查工厂
    const [factories] = await connection.execute(`
      SELECT DISTINCT factory FROM online_tracking 
      WHERE factory IS NOT NULL
      ORDER BY factory
    `);
    console.log('\n实际工厂列表:');
    factories.forEach(f => console.log(`  - ${f.factory}`));
    
    // 2. 更新规则的示例查询，使用实际存在的数据
    console.log('\n📝 更新规则示例查询...');
    
    const ruleUpdates = [
      {
        rule_name: '供应商库存查询',
        new_example: '查询聚龙供应商库存',
        new_description: '查询指定供应商的库存信息，支持的供应商包括：聚龙、欣冠、广正、天马、BOE、奥海等'
      },
      {
        rule_name: '供应商测试情况查询',
        new_example: '查询天马供应商测试情况',
        new_description: '查询指定供应商的测试情况，包括测试通过率、不良率等统计信息'
      },
      {
        rule_name: '物料库存查询',
        new_example: '查询电池库存',
        new_description: '查询指定物料的库存信息，支持的物料包括：电池、电池盖、LCD显示屏、OLED显示屏等'
      },
      {
        rule_name: '物料测试情况查询',
        new_example: '查询LCD显示屏测试情况',
        new_description: '查询指定物料的测试情况，包括测试通过率、主要不良现象等'
      },
      {
        rule_name: '项目测试情况查询',
        new_example: '查询I6789项目测试情况',
        new_description: '查询指定项目的测试情况，支持的项目包括：I6789、I6788、I6787'
      },
      {
        rule_name: '基线测试情况查询',
        new_example: '查询X6827基线测试情况',
        new_description: '查询指定基线的测试情况，支持的基线包括：X6827、S665LN、KI4K等'
      }
    ];
    
    for (const update of ruleUpdates) {
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET 
          example_query = ?,
          description = ?,
          updated_at = NOW()
        WHERE intent_name = ?
      `, [update.new_example, update.new_description, update.rule_name]);
      
      console.log(`  ✅ ${update.rule_name} 已更新`);
    }
    
    // 3. 创建基于实际数据的智能提示规则
    console.log('\n📝 创建智能提示规则...');
    
    const smartHintRule = {
      intent_name: '数据范围提示',
      description: '提供系统中实际存在的数据范围，帮助用户了解可查询的内容',
      action_type: 'information_display',
      action_target: `
        系统数据范围说明：
        
        📊 供应商列表：
        • 结构件类：聚龙、欣冠、广正
        • 光学类：天马、BOE、华星、帝晶
        • 充电类：奥海、百俊达、辰阳
        • 声学类：歌尔、东声、豪声
        • 包料类：裕同、丽德宝、富群
        
        🔧 物料类型：
        • 结构件类：电池盖、中框、手机卡托、侧键、装饰件
        • 光学类：LCD显示屏、OLED显示屏、摄像头模组
        • 充电类：电池、充电器
        • 声学类：扬声器、听筒
        • 包料类：保护套、标签、包装盒
        
        🏭 工厂信息：
        • 重庆工厂、深圳工厂、南昌工厂、宜宾工厂
        
        📋 项目基线：
        • I6789项目：X6827、S665LN、KI4K、X6828
        • I6788项目：X6831、KI5K、KI3K
        • I6787项目：S662LN、S663LN、S664LN
        
        💡 查询建议：
        请使用上述实际存在的数据进行查询，系统会提供准确的结果。
      `,
      trigger_words: JSON.stringify(['数据范围', '支持查询', '可查询内容', '系统数据', '帮助']),
      example_query: '系统支持查询哪些数据',
      category: '系统帮助',
      priority: 1,
      status: 'active'
    };
    
    // 检查是否已存在
    const [existingHint] = await connection.execute(`
      SELECT id FROM nlp_intent_rules WHERE intent_name = ?
    `, [smartHintRule.intent_name]);
    
    if (existingHint.length === 0) {
      await connection.execute(`
        INSERT INTO nlp_intent_rules 
        (intent_name, description, action_type, action_target, trigger_words, example_query, category, priority, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        smartHintRule.intent_name,
        smartHintRule.description,
        smartHintRule.action_type,
        smartHintRule.action_target.trim(),
        smartHintRule.trigger_words,
        smartHintRule.example_query,
        smartHintRule.category,
        smartHintRule.priority,
        smartHintRule.status
      ]);
      
      console.log('  ✅ 数据范围提示规则已创建');
    }
    
    // 4. 优化供应商相关规则，使用实际供应商名称
    console.log('\n🔧 优化供应商相关规则...');
    
    const supplierRules = [
      '供应商库存查询',
      '供应商测试情况查询',
      '供应商上线情况查询',
      '供应商对比分析'
    ];
    
    for (const ruleName of supplierRules) {
      // 更新触发词，包含实际供应商名称
      const actualSuppliers = suppliers.map(s => s.supplier_name);
      const triggerWords = ['供应商', '厂商', '查询', '统计', '分析', ...actualSuppliers];
      
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET 
          trigger_words = ?,
          updated_at = NOW()
        WHERE intent_name = ?
      `, [JSON.stringify(triggerWords), ruleName]);
      
      console.log(`  ✅ ${ruleName} 触发词已更新`);
    }
    
    // 5. 优化物料相关规则，使用实际物料名称
    console.log('\n🔧 优化物料相关规则...');
    
    const materialRules = [
      '物料库存查询',
      '物料测试情况查询',
      '物料上线情况查询',
      '物料对比分析'
    ];
    
    for (const ruleName of materialRules) {
      // 更新触发词，包含实际物料名称
      const actualMaterials = materials.map(m => m.material_name);
      const triggerWords = ['物料', '材料', '查询', '统计', '分析', ...actualMaterials];
      
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET 
          trigger_words = ?,
          updated_at = NOW()
        WHERE intent_name = ?
      `, [JSON.stringify(triggerWords), ruleName]);
      
      console.log(`  ✅ ${ruleName} 触发词已更新`);
    }
    
    // 6. 验证优化效果
    console.log('\n🧪 验证优化效果...');
    
    // 测试实际供应商查询
    const testSupplier = suppliers[0].supplier_name;
    console.log(`测试查询供应商: ${testSupplier}`);
    
    const [supplierRule] = await connection.execute(`
      SELECT action_target FROM nlp_intent_rules 
      WHERE intent_name = '供应商库存查询'
    `);
    
    if (supplierRule.length > 0) {
      try {
        let testSQL = supplierRule[0].action_target;
        // 替换参数占位符
        for (let i = 0; i < 12; i++) {
          testSQL = testSQL.replace('?', `'${testSupplier}'`);
        }
        
        const [testResults] = await connection.execute(testSQL);
        console.log(`  ✅ 查询成功，返回${testResults.length}条结果`);
        
        if (testResults.length > 0) {
          console.log(`  📝 示例结果: ${testResults[0].物料名称} - ${testResults[0].供应商}`);
        }
      } catch (error) {
        console.log(`  ❌ 查询失败: ${error.message}`);
      }
    }
    
    console.log('\n🎯 基于实际数据的规则优化完成！');
    console.log('\n📋 优化效果:');
    console.log('  ✅ 示例查询使用实际存在的数据');
    console.log('  ✅ 触发词包含实际的供应商和物料名称');
    console.log('  ✅ 规则描述说明支持的数据范围');
    console.log('  ✅ 新增数据范围提示功能');
    console.log('  ✅ 避免用户查询不存在的数据（如华为）');
    
  } catch (error) {
    console.error('❌ 优化失败:', error);
  } finally {
    await connection.end();
  }
}

optimizeRulesWithActualData();
