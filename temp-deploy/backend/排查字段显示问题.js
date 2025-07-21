import mysql from 'mysql2/promise';

async function diagnoseFieldDisplayIssues() {
  let connection;
  
  try {
    console.log('🔍 开始排查规则字段显示问题...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 检查数据库表结构
    console.log('\n📋 步骤1: 检查数据库表结构...');
    
    const tables = ['inventory', 'lab_tests', 'production_online'];
    const tableStructures = {};
    
    for (const table of tables) {
      try {
        const [columns] = await connection.execute(`DESCRIBE ${table}`);
        tableStructures[table] = columns.map(col => ({
          field: col.Field,
          type: col.Type,
          null: col.Null,
          key: col.Key,
          default: col.Default
        }));
        console.log(`\n${table}表结构:`);
        tableStructures[table].forEach(col => {
          console.log(`  ${col.field} (${col.type})`);
        });
      } catch (error) {
        console.log(`❌ 检查${table}表失败:`, error.message);
      }
    }
    
    // 2. 检查有问题的规则
    console.log('\n🔍 步骤2: 检查有问题的规则...');
    
    const problemRules = [
      { id: 243, name: '物料库存信息查询_优化' },
      { id: 314, name: '物料测试情况查询' },
      { id: 335, name: '物料测试结果查询_优化' }
    ];
    
    for (const ruleInfo of problemRules) {
      console.log(`\n📝 检查规则${ruleInfo.id}: ${ruleInfo.name}`);
      
      try {
        const [rule] = await connection.execute(
          'SELECT id, intent_name, action_target, category FROM nlp_intent_rules WHERE id = ?',
          [ruleInfo.id]
        );
        
        if (rule.length === 0) {
          console.log(`❌ 规则${ruleInfo.id}不存在`);
          continue;
        }
        
        const ruleData = rule[0];
        console.log(`   分类: ${ruleData.category}`);
        console.log(`   SQL: ${ruleData.action_target}`);
        
        // 分析SQL中的字段映射
        const sql = ruleData.action_target;
        const selectMatch = sql.match(/SELECT\s+([\s\S]*?)\s+FROM/i);
        
        if (selectMatch) {
          const selectClause = selectMatch[1];
          console.log(`   SELECT子句: ${selectClause}`);
          
          // 检查是否有正确的AS别名
          const hasChineseAliases = /as\s+[\u4e00-\u9fa5]+/i.test(selectClause);
          console.log(`   中文别名检查: ${hasChineseAliases ? '✅ 有中文别名' : '❌ 缺少中文别名'}`);
          
          // 检查DATE_FORMAT函数
          const dateFormatMatches = selectClause.match(/DATE_FORMAT\([^)]+\)/g);
          if (dateFormatMatches) {
            console.log(`   DATE_FORMAT函数: ${dateFormatMatches.join(', ')}`);
            
            // 检查DATE_FORMAT是否有别名
            dateFormatMatches.forEach(dateFunc => {
              const hasAlias = /DATE_FORMAT\([^)]+\)\s+as\s+[\u4e00-\u9fa5]+/i.test(dateFunc);
              console.log(`     ${dateFunc}: ${hasAlias ? '✅ 有别名' : '❌ 缺少别名'}`);
            });
          }
        }
        
        // 3. 测试SQL执行
        console.log(`\n🧪 测试规则${ruleInfo.id}的SQL执行:`);
        
        try {
          let testSQL = sql;
          
          // 如果SQL包含参数，替换为测试值
          if (testSQL.includes('?')) {
            if (ruleData.category === '库存场景') {
              testSQL = testSQL.replace(/\?/g, "'电池'");
            } else if (ruleData.category === '测试场景') {
              testSQL = testSQL.replace(/\?/g, "'LCD'");
            } else {
              testSQL = testSQL.replace(/\?/g, "'测试'");
            }
          }
          
          // 限制结果数量
          if (!testSQL.includes('LIMIT')) {
            testSQL += ' LIMIT 3';
          }
          
          const [results] = await connection.execute(testSQL);
          console.log(`   ✅ SQL执行成功: ${results.length}条记录`);
          
          if (results.length > 0) {
            const fields = Object.keys(results[0]);
            console.log(`   返回字段: ${fields.join(', ')}`);
            
            // 检查字段是否为中文
            const chineseFields = fields.filter(field => /[\u4e00-\u9fa5]/.test(field));
            const nonChineseFields = fields.filter(field => !/[\u4e00-\u9fa5]/.test(field));
            
            console.log(`   ✅ 中文字段 (${chineseFields.length}): ${chineseFields.join(', ')}`);
            if (nonChineseFields.length > 0) {
              console.log(`   ❌ 非中文字段 (${nonChineseFields.length}): ${nonChineseFields.join(', ')}`);
            }
            
            console.log(`   数据样本:`, results[0]);
          }
          
        } catch (error) {
          console.log(`   ❌ SQL执行失败: ${error.message}`);
        }
        
      } catch (error) {
        console.log(`❌ 检查规则${ruleInfo.id}失败: ${error.message}`);
      }
    }
    
    // 4. 检查字段映射标准
    console.log('\n📏 步骤3: 检查字段映射标准...');
    
    const standardMappings = {
      'inventory': {
        'storage_location': '工厂',
        'warehouse': '仓库', 
        'material_code': '物料编码',
        'material_name': '物料名称',
        'supplier_name': '供应商',
        'quantity': '数量',
        'status': '状态',
        'inbound_time': '入库时间',
        'updated_at': '到期时间',
        'notes': '备注'
      },
      'lab_tests': {
        'test_id': '测试编号',
        'test_date': '日期',
        'project_id': '项目',
        'baseline_id': '基线',
        'material_code': '物料编码',
        'quantity': '数量',
        'material_name': '物料名称',
        'supplier_name': '供应商',
        'test_result': '测试结果',
        'defect_desc': '不合格描述',
        'notes': '备注'
      }
    };
    
    console.log('标准字段映射:');
    Object.keys(standardMappings).forEach(table => {
      console.log(`\n${table}表:`);
      Object.entries(standardMappings[table]).forEach(([field, chinese]) => {
        console.log(`  ${field} → ${chinese}`);
      });
    });
    
    // 5. 生成修复建议
    console.log('\n💡 步骤4: 生成修复建议...');
    
    console.log('修复建议:');
    console.log('1. 确保所有SELECT字段都有中文别名');
    console.log('2. DATE_FORMAT函数必须添加AS别名');
    console.log('3. 使用COALESCE处理NULL值');
    console.log('4. 统一字段映射标准');
    
    console.log('\n🎉 字段显示问题排查完成！');
    
  } catch (error) {
    console.error('❌ 排查字段显示问题失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

diagnoseFieldDisplayIssues().catch(console.error);
