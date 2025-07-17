import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
});

/**
 * 修复action_type字段问题并验证物料大类更新效果
 */

async function fixActionTypeAndVerify() {
  try {
    console.log('🔧 修复action_type字段问题...\n');
    
    // 1. 检查表结构
    console.log('📋 1. 检查表结构...');
    const [tableInfo] = await connection.execute('DESCRIBE nlp_intent_rules');
    const hasActionType = tableInfo.some(col => col.Field === 'action_type');
    
    if (hasActionType) {
      console.log('✅ action_type字段存在');
      
      // 更新所有缺少action_type的记录
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET action_type = 'SQL_QUERY' 
        WHERE action_type IS NULL OR action_type = ''
      `);
      console.log('✅ 已更新所有记录的action_type字段');
    } else {
      console.log('⚠️ action_type字段不存在，跳过修复');
    }
    
    // 2. 验证物料大类规则
    console.log('\n📊 2. 验证物料大类规则...');
    await verifyMaterialCategoryRules();
    
    // 3. 验证供应商规则
    console.log('\n🏭 3. 验证供应商规则...');
    await verifySupplierRules();
    
    // 4. 验证缺陷规则
    console.log('\n🔍 4. 验证缺陷规则...');
    await verifyDefectRules();
    
    // 5. 测试综合查询
    console.log('\n🧪 5. 测试综合查询...');
    await testComprehensiveQueries();
    
    console.log('\n🎉 修复和验证完成！');
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
  } finally {
    await connection.end();
  }
}

/**
 * 验证物料大类规则
 */
async function verifyMaterialCategoryRules() {
  const categories = ['结构件类', '光学类', '充电类', '声学类', '包料类'];
  
  for (const category of categories) {
    const ruleName = `${category}库存查询`;
    
    try {
      const [rules] = await connection.execute(`
        SELECT action_target, trigger_words
        FROM nlp_intent_rules 
        WHERE intent_name = ? AND status = 'active'
      `, [ruleName]);
      
      if (rules.length > 0) {
        const [results] = await connection.execute(rules[0].action_target);
        console.log(`✅ ${ruleName}: ${results.length}条记录`);
        
        if (results.length > 0) {
          // 检查是否包含该类别的物料
          const materialNames = results.map(r => r.物料名称 || r.material_name);
          console.log(`   物料示例: ${materialNames.slice(0, 3).join(', ')}`);
        }
        
        // 检查示例问题
        try {
          const examples = JSON.parse(rules[0].trigger_words);
          console.log(`   示例问题: ${examples.slice(0, 2).join(', ')}`);
        } catch (e) {
          console.log(`   ⚠️ 示例问题格式错误`);
        }
      } else {
        console.log(`❌ ${ruleName}: 规则不存在`);
      }
    } catch (error) {
      console.log(`❌ ${ruleName}: 测试失败 - ${error.message.substring(0, 50)}...`);
    }
  }
}

/**
 * 验证供应商规则
 */
async function verifySupplierRules() {
  const suppliers = ['聚龙', 'BOE', '天马', '歌尔', '丽德宝'];
  
  for (const supplier of suppliers) {
    const ruleName = `${supplier}供应商库存查询`;
    
    try {
      const [rules] = await connection.execute(`
        SELECT action_target
        FROM nlp_intent_rules 
        WHERE intent_name = ? AND status = 'active'
      `, [ruleName]);
      
      if (rules.length > 0) {
        const [results] = await connection.execute(rules[0].action_target);
        console.log(`✅ ${ruleName}: ${results.length}条记录`);
        
        if (results.length > 0) {
          // 验证是否都是该供应商的数据
          const supplierNames = [...new Set(results.map(r => r.供应商 || r.supplier_name))];
          const isCorrectSupplier = supplierNames.length === 1 && supplierNames[0] === supplier;
          console.log(`   供应商匹配: ${isCorrectSupplier ? '✅ 正确' : '❌ 错误'} (${supplierNames.join(', ')})`);
        }
      } else {
        console.log(`❌ ${ruleName}: 规则不存在`);
      }
    } catch (error) {
      console.log(`❌ ${ruleName}: 测试失败 - ${error.message.substring(0, 50)}...`);
    }
  }
}

/**
 * 验证缺陷规则
 */
async function verifyDefectRules() {
  const defects = ['划伤', '漏光', '无声', '破损', '脱落'];
  
  for (const defect of defects) {
    const ruleName = `${defect}缺陷查询`;
    
    try {
      const [rules] = await connection.execute(`
        SELECT action_target
        FROM nlp_intent_rules 
        WHERE intent_name = ? AND status = 'active'
      `, [ruleName]);
      
      if (rules.length > 0) {
        const [results] = await connection.execute(rules[0].action_target);
        console.log(`✅ ${ruleName}: ${results.length}条记录`);
        
        if (results.length > 0) {
          // 检查是否包含相关缺陷描述
          const defectDescriptions = results.map(r => r.不合格描述 || r.defect_description).filter(d => d);
          const hasRelatedDefects = defectDescriptions.some(desc => desc.includes(defect));
          console.log(`   缺陷匹配: ${hasRelatedDefects ? '✅ 包含' : '⚠️ 未包含'}相关描述`);
        }
      } else {
        console.log(`❌ ${ruleName}: 规则不存在`);
      }
    } catch (error) {
      console.log(`❌ ${ruleName}: 测试失败 - ${error.message.substring(0, 50)}...`);
    }
  }
}

/**
 * 测试综合查询
 */
async function testComprehensiveQueries() {
  const comprehensiveRules = ['物料大类质量对比', '供应商能力分析'];
  
  for (const ruleName of comprehensiveRules) {
    try {
      const [rules] = await connection.execute(`
        SELECT action_target, trigger_words
        FROM nlp_intent_rules 
        WHERE intent_name = ? AND status = 'active'
      `, [ruleName]);
      
      if (rules.length > 0) {
        const [results] = await connection.execute(rules[0].action_target);
        console.log(`✅ ${ruleName}: ${results.length}条记录`);
        
        if (results.length > 0) {
          const fields = Object.keys(results[0]);
          console.log(`   返回字段: ${fields.join(', ')}`);
          
          // 显示示例数据
          const example = results[0];
          console.log(`   示例数据:`);
          Object.entries(example).slice(0, 3).forEach(([key, value]) => {
            console.log(`     ${key}: ${value}`);
          });
        }
        
        // 检查示例问题
        try {
          const examples = JSON.parse(rules[0].trigger_words);
          console.log(`   示例问题: ${examples.slice(0, 2).join(', ')}`);
        } catch (e) {
          console.log(`   ⚠️ 示例问题格式错误`);
        }
      } else {
        console.log(`❌ ${ruleName}: 规则不存在`);
      }
    } catch (error) {
      console.log(`❌ ${ruleName}: 测试失败 - ${error.message.substring(0, 50)}...`);
    }
  }
}

// 执行修复和验证
fixActionTypeAndVerify();
