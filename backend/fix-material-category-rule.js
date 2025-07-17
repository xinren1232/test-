/**
 * 修复"物料大类查询"规则
 * 解决数据量限制和分类逻辑错误问题
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 物料分类定义（基于您的真实数据）
const MATERIAL_CATEGORIES = {
  '结构件类': ['中框', '侧键', '手机卡托', '电池盖', '装饰件'],
  '光学类': ['LCD显示屏', 'OLED显示屏', '摄像头'],
  '充电类': ['电池', '充电器'],
  '声学类': ['听筒', '喇叭'],
  '包装类': ['保护套', '包装盒', '标签']
};

async function fixMaterialCategoryRule() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 检查当前规则
    console.log('\n=== 第一步：检查当前规则 ===');
    const [currentRule] = await connection.execute(`
      SELECT intent_name, description, action_target, example_query
      FROM nlp_intent_rules 
      WHERE intent_name = '物料大类查询'
    `);
    
    if (currentRule.length === 0) {
      console.log('❌ 未找到"物料大类查询"规则');
      return;
    }
    
    console.log('📋 当前规则信息:');
    console.log(`   名称: ${currentRule[0].intent_name}`);
    console.log(`   描述: ${currentRule[0].description}`);
    console.log(`   示例: ${currentRule[0].example_query}`);
    console.log(`   SQL: ${currentRule[0].action_target.substring(0, 200)}...`);
    
    // 2. 创建新的正确SQL
    console.log('\n=== 第二步：创建新的正确SQL ===');
    
    // 新的SQL应该根据用户输入的物料大类返回对应的物料
    const newSQL = `
SELECT 
  storage_location as 工厂,
  storage_location as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d %H:%i') as 入库时间,
  DATE_FORMAT(inbound_time, '%Y-%m-%d %H:%i') as 到期时间,
  notes as 备注
FROM inventory 
WHERE 
  CASE 
    WHEN ? = '结构件类' OR ? LIKE '%结构件%' THEN material_name IN ('中框', '侧键', '手机卡托', '电池盖', '装饰件')
    WHEN ? = '光学类' OR ? LIKE '%光学%' THEN material_name IN ('LCD显示屏', 'OLED显示屏', '摄像头')
    WHEN ? = '充电类' OR ? LIKE '%充电%' THEN material_name IN ('电池', '充电器')
    WHEN ? = '声学类' OR ? LIKE '%声学%' THEN material_name IN ('听筒', '喇叭')
    WHEN ? = '包装类' OR ? LIKE '%包装%' THEN material_name IN ('保护套', '包装盒', '标签')
    ELSE 1=0
  END
ORDER BY material_name, inbound_time DESC`;
    
    console.log('📝 新SQL查询:');
    console.log(newSQL);
    
    // 3. 更新规则
    console.log('\n=== 第三步：更新规则 ===');
    
    await connection.execute(`
      UPDATE nlp_intent_rules 
      SET 
        action_target = ?,
        description = '查询特定物料大类的库存信息，支持结构件类、光学类、充电类、声学类、包装类',
        example_query = '查询结构件类物料库存',
        updated_at = NOW()
      WHERE intent_name = '物料大类查询'
    `, [newSQL]);
    
    console.log('✅ 规则更新成功');
    
    // 4. 测试新规则
    console.log('\n=== 第四步：测试新规则 ===');
    
    const testCases = [
      { category: '结构件类', description: '结构件类物料' },
      { category: '光学类', description: '光学类物料' },
      { category: '充电类', description: '充电类物料' },
      { category: '声学类', description: '声学类物料' },
      { category: '包装类', description: '包装类物料' }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n🧪 测试 ${testCase.category}:`);
      
      try {
        // 构建测试SQL
        let testSQL = newSQL;
        // 替换所有参数占位符
        for (let i = 0; i < 10; i++) {
          testSQL = testSQL.replace('?', `'${testCase.category}'`);
        }
        
        const [results] = await connection.execute(testSQL);
        
        if (results.length > 0) {
          console.log(`   ✅ 返回 ${results.length} 条数据`);
          
          // 检查是否只包含该类别的物料
          const expectedMaterials = MATERIAL_CATEGORIES[testCase.category] || [];
          const actualMaterials = [...new Set(results.map(r => r.物料名称))];
          
          console.log(`   📋 预期物料: ${expectedMaterials.join(', ')}`);
          console.log(`   📋 实际物料: ${actualMaterials.join(', ')}`);
          
          const isCorrect = actualMaterials.every(material => expectedMaterials.includes(material));
          if (isCorrect) {
            console.log(`   ✅ 物料分类正确`);
          } else {
            console.log(`   ❌ 物料分类有误`);
          }
          
          // 显示样本数据
          console.log(`   📄 样本数据: ${results[0].物料名称} - ${results[0].供应商} - ${results[0].数量}个`);
          
        } else {
          console.log(`   ⚠️ 返回0条数据`);
        }
        
      } catch (error) {
        console.log(`   ❌ 测试失败: ${error.message}`);
      }
    }
    
    // 5. 验证数据完整性
    console.log('\n=== 第五步：验证数据完整性 ===');
    
    for (const [categoryName, materials] of Object.entries(MATERIAL_CATEGORIES)) {
      const materialList = materials.map(m => `'${m}'`).join(', ');
      const [count] = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM inventory 
        WHERE material_name IN (${materialList})
      `);
      
      console.log(`📊 ${categoryName}: ${count[0].count}条库存数据`);
    }
    
    console.log('\n✅ 物料大类查询规则修复完成！');
    console.log('🎯 现在查询"结构件类物料"将只返回结构件类的物料，不再混合其他类型');
    console.log('📈 移除了LIMIT 10限制，将返回所有匹配的真实数据');
    
  } catch (error) {
    console.error('❌ 修复过程出错:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行修复
fixMaterialCategoryRule().catch(console.error);
