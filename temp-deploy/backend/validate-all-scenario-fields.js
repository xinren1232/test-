import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function validateAllScenarioFields() {
  console.log('🔍 验证所有场景字段映射...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. 检查所有表的实际字段结构
    console.log('1. 📊 检查所有表的实际字段结构:\n');
    
    const tables = ['inventory', 'lab_tests', 'online_tracking'];
    const tableFields = {};
    
    for (const table of tables) {
      console.log(`${table}表字段:`);
      const [columns] = await connection.execute(`DESCRIBE ${table}`);
      tableFields[table] = columns.map(col => col.Field);
      columns.forEach(col => {
        console.log(`   - ${col.Field}: ${col.Type}`);
      });
      console.log('');
    }
    
    // 2. 定义实际页面字段要求
    console.log('2. 📋 实际页面字段要求:\n');
    
    const pageFieldRequirements = {
      '库存场景': {
        requiredFields: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
        tableName: 'inventory',
        description: '库存页面字段'
      },
      '测试场景': {
        requiredFields: ['测试编号', '日期', '项目', '基线', '物料编码', '物料名称', '供应商', '测试结果', '不合格描述', '备注'],
        tableName: 'lab_tests',
        description: '测试页面字段（注意：无数量字段）'
      },
      '上线场景': {
        requiredFields: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注'],
        tableName: 'online_tracking',
        description: '上线页面字段'
      }
    };
    
    Object.entries(pageFieldRequirements).forEach(([scenario, config]) => {
      console.log(`${scenario} (${config.description}):`);
      console.log(`   期望字段: [${config.requiredFields.join(', ')}]`);
      console.log(`   字段数量: ${config.requiredFields.length} 个\n`);
    });
    
    // 3. 验证当前规则的字段映射
    console.log('3. 🧪 验证当前规则的字段映射:\n');
    
    for (const [scenario, config] of Object.entries(pageFieldRequirements)) {
      console.log(`验证 ${scenario}:`);
      
      // 获取该场景的一个示例规则
      const [sampleRule] = await connection.execute(`
        SELECT intent_name, action_target
        FROM nlp_intent_rules 
        WHERE status = 'active'
        AND category = ?
        LIMIT 1
      `, [scenario]);
      
      if (sampleRule.length > 0) {
        console.log(`   示例规则: ${sampleRule[0].intent_name}`);
        
        try {
          // 执行SQL获取实际返回字段
          const [result] = await connection.execute(sampleRule[0].action_target);
          
          if (result.length > 0) {
            const actualFields = Object.keys(result[0]);
            console.log(`   实际返回字段: [${actualFields.join(', ')}]`);
            console.log(`   实际字段数量: ${actualFields.length} 个`);
            
            // 检查字段匹配度
            const missingFields = config.requiredFields.filter(field => !actualFields.includes(field));
            const extraFields = actualFields.filter(field => !config.requiredFields.includes(field));
            
            if (missingFields.length === 0 && extraFields.length === 0) {
              console.log(`   ✅ 字段完全匹配`);
            } else {
              if (missingFields.length > 0) {
                console.log(`   ❌ 缺少字段: [${missingFields.join(', ')}]`);
              }
              if (extraFields.length > 0) {
                console.log(`   ⚠️  多余字段: [${extraFields.join(', ')}]`);
              }
            }
            
            // 显示数据样本
            const sample = result[0];
            console.log(`   📄 数据样本:`);
            Object.entries(sample).slice(0, 5).forEach(([key, value]) => {
              console.log(`      ${key}: ${value}`);
            });
            
          } else {
            console.log(`   ❌ 无数据返回`);
          }
          
        } catch (error) {
          console.log(`   ❌ SQL执行失败: ${error.message}`);
        }
      } else {
        console.log(`   ❌ 未找到${scenario}规则`);
      }
      
      console.log('');
    }
    
    // 4. 检查特定问题
    console.log('4. 🔍 检查特定问题:\n');
    
    // 检查测试场景是否还有数量字段
    console.log('检查测试场景数量字段问题:');
    const [testRule] = await connection.execute(`
      SELECT action_target
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND category = '测试场景'
      AND intent_name = '测试信息查询'
    `);
    
    if (testRule.length > 0) {
      const [testResult] = await connection.execute(testRule[0].action_target);
      if (testResult.length > 0) {
        const testFields = Object.keys(testResult[0]);
        const hasQuantity = testFields.includes('数量');
        
        if (hasQuantity) {
          console.log('   ❌ 测试场景仍包含数量字段');
        } else {
          console.log('   ✅ 测试场景已正确删除数量字段');
        }
      }
    }
    
    // 检查上线场景的特殊字段
    console.log('\n检查上线场景特殊字段:');
    const [onlineRule] = await connection.execute(`
      SELECT action_target
      FROM nlp_intent_rules 
      WHERE status = 'active'
      AND category = '上线场景'
      AND intent_name = '上线信息查询'
    `);
    
    if (onlineRule.length > 0) {
      const [onlineResult] = await connection.execute(onlineRule[0].action_target);
      if (onlineResult.length > 0) {
        const onlineFields = Object.keys(onlineResult[0]);
        const requiredSpecialFields = ['不良率', '本周异常', '批次号'];
        
        const missingSpecialFields = requiredSpecialFields.filter(field => !onlineFields.includes(field));
        
        if (missingSpecialFields.length === 0) {
          console.log('   ✅ 上线场景特殊字段完整');
        } else {
          console.log(`   ❌ 上线场景缺少特殊字段: [${missingSpecialFields.join(', ')}]`);
        }
      }
    }
    
    // 5. 总结报告
    console.log('\n📋 字段映射验证总结:');
    console.log('==========================================');
    
    // 统计规则数量
    const [scenarioStats] = await connection.execute(`
      SELECT category, COUNT(*) as count 
      FROM nlp_intent_rules 
      WHERE status = 'active' 
      GROUP BY category
    `);
    
    scenarioStats.forEach(stat => {
      console.log(`✅ ${stat.category}: ${stat.count} 条规则`);
    });
    
    console.log('\n📋 字段映射要求:');
    console.log('✅ 库存场景: 10个字段 (包含数量)');
    console.log('✅ 测试场景: 10个字段 (不含数量)');
    console.log('✅ 上线场景: 11个字段 (包含不良率、本周异常)');
    
    console.log('\n🔄 建议操作:');
    console.log('1. 重新测试前端测试信息查询');
    console.log('2. 验证数量字段已从测试场景删除');
    console.log('3. 确认所有字段与实际页面一致');
    console.log('4. 检查数据显示完整性');
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 验证失败:', error.message);
  }
}

validateAllScenarioFields();
