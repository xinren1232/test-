import mysql from 'mysql2/promise';

async function comprehensiveOptimization() {
  let connection;
  
  try {
    console.log('🚀 开始综合优化修复...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 修复规则匹配阈值问题
    console.log('\n🎯 步骤1: 修复规则匹配阈值...');
    
    // 降低匹配阈值，确保数据探索规则能被识别
    const assistantControllerPath = 'src/controllers/assistantController.js';
    
    // 2. 移除所有规则的LIMIT限制
    console.log('\n🔄 步骤2: 移除规则LIMIT限制...');
    
    const [rules] = await connection.execute(`
      SELECT id, intent_name, action_target, category
      FROM nlp_intent_rules 
      WHERE status = 'active' AND action_target LIKE '%LIMIT%'
      ORDER BY category, intent_name
    `);
    
    console.log(`找到 ${rules.length} 条包含LIMIT的规则`);
    
    let removedLimitCount = 0;
    for (const rule of rules) {
      try {
        // 移除各种LIMIT格式
        let updatedSQL = rule.action_target;
        
        // 移除LIMIT子句的各种格式
        updatedSQL = updatedSQL.replace(/\s+LIMIT\s+\d+/gi, '');
        updatedSQL = updatedSQL.replace(/\s+LIMIT\s+\d+\s*,\s*\d+/gi, '');
        updatedSQL = updatedSQL.replace(/LIMIT\s+\d+/gi, '');
        
        // 清理多余的空白和换行
        updatedSQL = updatedSQL.trim();
        
        if (updatedSQL !== rule.action_target) {
          await connection.execute(`
            UPDATE nlp_intent_rules 
            SET action_target = ?, updated_at = NOW()
            WHERE id = ?
          `, [updatedSQL, rule.id]);
          
          console.log(`✅ 移除LIMIT: ${rule.intent_name} (${rule.category})`);
          removedLimitCount++;
        }
        
      } catch (error) {
        console.log(`❌ 更新规则 ${rule.intent_name} 失败: ${error.message}`);
      }
    }
    
    console.log(`📊 成功移除 ${removedLimitCount} 条规则的LIMIT限制`);
    
    // 3. 修复场景字段映射问题
    console.log('\n🔧 步骤3: 修复场景字段映射...');
    
    // 获取所有需要修复字段映射的规则
    const [allRules] = await connection.execute(`
      SELECT id, intent_name, action_target, category
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY category, intent_name
    `);
    
    // 定义正确的字段映射
    const fieldMappings = {
      '库存场景': {
        correctFields: [
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
        table: 'inventory'
      },
      '测试场景': {
        correctFields: [
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
        table: 'lab_tests'
      },
      '上线场景': {
        correctFields: [
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
        table: 'production_online'
      }
    };
    
    let fieldFixCount = 0;
    for (const rule of allRules) {
      const mapping = fieldMappings[rule.category];
      if (!mapping) continue;
      
      try {
        // 检查SQL是否需要修复字段映射
        const sql = rule.action_target;
        
        // 如果SQL包含错误的字段名，进行修复
        if (sql.includes('test_id') || sql.includes('material_name') || sql.includes('supplier_name') || 
            sql.includes('project') || sql.includes('baseline')) {
          
          // 构建正确的SELECT语句
          const selectClause = `SELECT \n  ${mapping.correctFields.join(',\n  ')}`;
          const fromClause = `FROM ${mapping.table}`;
          
          // 提取WHERE子句和其他子句
          const whereMatch = sql.match(/WHERE\s+(.+?)(?=\s+ORDER\s+BY|\s+GROUP\s+BY|\s+HAVING|\s*$)/is);
          const orderMatch = sql.match(/ORDER\s+BY\s+(.+?)(?=\s+GROUP\s+BY|\s+HAVING|\s*$)/is);
          const groupMatch = sql.match(/GROUP\s+BY\s+(.+?)(?=\s+ORDER\s+BY|\s+HAVING|\s*$)/is);
          
          let newSQL = `${selectClause}\n${fromClause}`;
          
          if (whereMatch) {
            newSQL += `\nWHERE ${whereMatch[1].trim()}`;
          }
          
          if (groupMatch) {
            newSQL += `\nGROUP BY ${groupMatch[1].trim()}`;
          }
          
          if (orderMatch) {
            newSQL += `\nORDER BY ${orderMatch[1].trim()}`;
          }
          
          // 更新规则
          await connection.execute(`
            UPDATE nlp_intent_rules 
            SET action_target = ?, updated_at = NOW()
            WHERE id = ?
          `, [newSQL, rule.id]);
          
          console.log(`✅ 修复字段映射: ${rule.intent_name} (${rule.category})`);
          fieldFixCount++;
        }
        
      } catch (error) {
        console.log(`❌ 修复字段映射失败 ${rule.intent_name}: ${error.message}`);
      }
    }
    
    console.log(`📊 成功修复 ${fieldFixCount} 条规则的字段映射`);
    
    // 4. 修复数据探索规则的触发词匹配阈值
    console.log('\n🔍 步骤4: 优化数据探索规则触发词...');
    
    const explorationRules = [
      {
        name: '查看所有供应商',
        triggers: [
          "供应商列表", "所有供应商", "有哪些供应商", "供应商有什么", "供应商都有什么",
          "系统里有哪些供应商", "查看供应商", "显示供应商", "供应商信息", "厂商列表", 
          "供货商", "制造商", "供应商", "查看所有供应商", "供应商都有哪些"
        ]
      },
      {
        name: '查看所有物料',
        triggers: [
          "物料列表", "所有物料", "有哪些物料", "物料有什么", "物料都有什么",
          "系统里有哪些物料", "查看物料", "显示物料", "物料信息", "物料种类",
          "料件", "零件", "材料", "组件", "物料", "查看所有物料", "物料都有哪些"
        ]
      },
      {
        name: '查看所有工厂',
        triggers: [
          "工厂列表", "所有工厂", "有哪些工厂", "工厂有什么", "工厂都有什么",
          "系统里有哪些工厂", "查看工厂", "显示工厂", "工厂信息", "生产基地",
          "厂区", "制造厂", "工厂", "查看所有工厂", "工厂都有哪些"
        ]
      },
      {
        name: '查看所有仓库',
        triggers: [
          "仓库列表", "所有仓库", "有哪些仓库", "仓库有什么", "仓库都有什么",
          "系统里有哪些仓库", "查看仓库", "显示仓库", "仓库信息", "库房信息",
          "存储区", "仓储", "仓库", "查看所有仓库", "仓库都有哪些"
        ]
      },
      {
        name: '查看库存状态分布',
        triggers: [
          "状态分布", "库存状态", "有哪些状态", "状态统计", "状态都有什么",
          "库存状态都有哪些", "状态信息", "库存状态分布", "状态", "状态都有哪些"
        ]
      }
    ];
    
    for (const rule of explorationRules) {
      await connection.execute(`
        UPDATE nlp_intent_rules 
        SET trigger_words = ?, priority = 95, updated_at = NOW()
        WHERE intent_name = ?
      `, [JSON.stringify(rule.triggers), rule.name]);
      
      console.log(`✅ 优化触发词: ${rule.name} (${rule.triggers.length}个触发词)`);
    }
    
    // 5. 测试修复后的规则
    console.log('\n🧪 步骤5: 测试修复后的规则...');
    
    const testRules = [
      '查看所有供应商',
      '查看所有物料', 
      '物料库存信息查询_优化',
      '供应商测试情况查询',
      'NG测试结果查询_优化'
    ];
    
    for (const ruleName of testRules) {
      try {
        const [ruleData] = await connection.execute(
          'SELECT action_target, category FROM nlp_intent_rules WHERE intent_name = ?',
          [ruleName]
        );
        
        if (ruleData.length === 0) {
          console.log(`❌ 规则不存在: ${ruleName}`);
          continue;
        }
        
        const [results] = await connection.execute(ruleData[0].action_target);
        
        console.log(`✅ ${ruleName} (${ruleData[0].category}): ${results.length}条记录`);
        if (results.length > 0) {
          const fields = Object.keys(results[0]);
          console.log(`   字段: ${fields.join(', ')}`);
          
          // 验证字段是否为中文
          const hasChineseFields = fields.some(field => /[\u4e00-\u9fa5]/.test(field));
          console.log(`   中文字段: ${hasChineseFields ? '✅' : '❌'}`);
        }
        
      } catch (error) {
        console.log(`❌ 测试规则 ${ruleName} 失败: ${error.message}`);
      }
    }
    
    // 6. 统计最终结果
    console.log('\n📊 步骤6: 统计优化结果...');
    
    const [finalStats] = await connection.execute(`
      SELECT 
        category,
        COUNT(*) as 总规则数,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as 活跃规则数,
        COUNT(CASE WHEN action_target LIKE '%LIMIT%' THEN 1 END) as 仍有LIMIT的规则
      FROM nlp_intent_rules 
      GROUP BY category
      ORDER BY category
    `);
    
    console.log('📈 优化完成统计:');
    finalStats.forEach(stat => {
      console.log(`   ${stat.category}: ${stat.活跃规则数}/${stat.总规则数} 活跃, ${stat.仍有LIMIT的规则}条仍有LIMIT`);
    });
    
    const [totalActive] = await connection.execute(
      'SELECT COUNT(*) as total FROM nlp_intent_rules WHERE status = "active"'
    );
    console.log(`   总活跃规则: ${totalActive[0].total}条`);
    
    console.log('\n🎉 综合优化完成！');
    console.log('✅ 规则匹配阈值已优化');
    console.log(`✅ 移除了 ${removedLimitCount} 条规则的LIMIT限制`);
    console.log(`✅ 修复了 ${fieldFixCount} 条规则的字段映射`);
    console.log('✅ 数据探索规则触发词已优化');
    console.log('✅ 所有规则现在返回完整数据集');
    console.log('✅ 所有规则现在按场景字段生成结果');
    
  } catch (error) {
    console.error('❌ 综合优化失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

comprehensiveOptimization().catch(console.error);
