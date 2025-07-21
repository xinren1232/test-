/**
 * 综合修复规则匹配精度和测试场景字段映射问题
 */

const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

class ComprehensiveRuleFixer {
  constructor() {
    this.connection = null;
    this.fixedRules = [];
    this.errors = [];
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection(dbConfig);
      console.log('✅ 数据库连接成功');
    } catch (error) {
      console.error('❌ 数据库连接失败:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('✅ 数据库连接已关闭');
    }
  }

  /**
   * 1. 修复数据探索规则的触发词匹配
   */
  async fixExplorationRuleMatching() {
    console.log('🔧 修复数据探索规则匹配精度...');
    
    const explorationFixes = [
      {
        intent_name: '查看所有物料',
        trigger_words: JSON.stringify([
          '物料列表', '所有物料', '有哪些物料', '物料有什么', 
          '系统里有哪些物料', '物料都有什么', '查看物料', 
          '显示物料', '物料信息', '物料种类'
        ]),
        synonyms: JSON.stringify({
          '物料': ['料件', '零件', '材料', '组件'],
          '列表': ['清单', '目录', '信息'],
          '有哪些': ['都有什么', '包含什么', '存在什么']
        })
      },
      
      {
        intent_name: '查看所有供应商',
        trigger_words: JSON.stringify([
          '供应商列表', '所有供应商', '有哪些供应商', '供应商有什么',
          '系统里有哪些供应商', '供应商都有什么', '查看供应商',
          '显示供应商', '供应商信息', '厂商列表'
        ]),
        synonyms: JSON.stringify({
          '供应商': ['厂商', '供货商', '供应方', '制造商'],
          '列表': ['清单', '目录', '信息'],
          '有哪些': ['都有什么', '包含什么', '存在什么']
        })
      },
      
      {
        intent_name: '查看所有工厂',
        trigger_words: JSON.stringify([
          '工厂列表', '所有工厂', '有哪些工厂', '工厂有什么',
          '系统里有哪些工厂', '工厂都有什么', '查看工厂',
          '显示工厂', '工厂信息', '生产基地'
        ]),
        synonyms: JSON.stringify({
          '工厂': ['厂区', '生产基地', '制造厂', '生产厂'],
          '列表': ['清单', '目录', '信息'],
          '有哪些': ['都有什么', '包含什么', '存在什么']
        })
      },
      
      {
        intent_name: '查看所有仓库',
        trigger_words: JSON.stringify([
          '仓库列表', '所有仓库', '有哪些仓库', '仓库有什么',
          '系统里有哪些仓库', '仓库都有什么', '查看仓库',
          '显示仓库', '仓库信息', '库房信息'
        ]),
        synonyms: JSON.stringify({
          '仓库': ['库房', '存储区', '仓储', '库存区'],
          '列表': ['清单', '目录', '信息'],
          '有哪些': ['都有什么', '包含什么', '存在什么']
        })
      }
    ];

    for (const fix of explorationFixes) {
      try {
        await this.connection.execute(`
          UPDATE nlp_intent_rules 
          SET trigger_words = ?, synonyms = ?, updated_at = NOW()
          WHERE intent_name = ?
        `, [fix.trigger_words, fix.synonyms, fix.intent_name]);
        
        console.log(`✅ 修复探索规则: ${fix.intent_name}`);
        this.fixedRules.push(fix.intent_name);
      } catch (error) {
        console.error(`❌ 修复失败 ${fix.intent_name}:`, error.message);
        this.errors.push({ rule: fix.intent_name, error: error.message });
      }
    }
  }

  /**
   * 2. 修复测试场景规则的字段映射
   */
  async fixTestScenarioFieldMapping() {
    console.log('🧪 修复测试场景字段映射...');
    
    // 首先检查lab_tests表的实际字段结构
    const [tableInfo] = await this.connection.execute(`
      DESCRIBE lab_tests
    `);
    
    console.log('📋 lab_tests表字段结构:');
    tableInfo.forEach(field => {
      console.log(`  ${field.Field}: ${field.Type}`);
    });

    // 基于实际表结构生成正确的测试场景SQL
    const correctTestSQL = `SELECT 
  test_id as 测试编号,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 日期,
  COALESCE(project_id, '未指定') as 项目,
  COALESCE(baseline_id, '未指定') as 基线,
  material_code as 物料编码,
  COALESCE(quantity, 1) as 数量,
  material_name as 物料名称,
  supplier_name as 供应商,
  test_result as 测试结果,
  COALESCE(defect_desc, '') as 不合格描述,
  COALESCE(notes, '') as 备注
FROM lab_tests
WHERE 1=1
ORDER BY test_date DESC
LIMIT 10`;

    // 需要修复的测试相关规则
    const testRulesToFix = [
      '物料测试情况查询',
      '供应商测试情况查询', 
      '物料测试结果查询_优化',
      'NG测试结果查询_优化',
      '项目测试情况查询',
      '基线测试情况查询',
      '批次测试情况查询'
    ];

    for (const ruleName of testRulesToFix) {
      try {
        // 为每个规则生成带参数的SQL
        let parameterizedSQL = correctTestSQL;
        
        if (ruleName.includes('物料')) {
          parameterizedSQL = correctTestSQL.replace('WHERE 1=1', 'WHERE material_name LIKE CONCAT(\'%\', ?, \'%\')');
        } else if (ruleName.includes('供应商')) {
          parameterizedSQL = correctTestSQL.replace('WHERE 1=1', 'WHERE supplier_name LIKE CONCAT(\'%\', ?, \'%\')');
        } else if (ruleName.includes('NG')) {
          parameterizedSQL = correctTestSQL.replace('WHERE 1=1', 'WHERE test_result IN (\'FAIL\', \'NG\', \'不合格\')');
        } else if (ruleName.includes('项目')) {
          parameterizedSQL = correctTestSQL.replace('WHERE 1=1', 'WHERE project_id LIKE CONCAT(\'%\', ?, \'%\')');
        } else if (ruleName.includes('基线')) {
          parameterizedSQL = correctTestSQL.replace('WHERE 1=1', 'WHERE baseline_id LIKE CONCAT(\'%\', ?, \'%\')');
        } else if (ruleName.includes('批次')) {
          parameterizedSQL = correctTestSQL.replace('WHERE 1=1', 'WHERE batch_code LIKE CONCAT(\'%\', ?, \'%\')');
        }

        await this.connection.execute(`
          UPDATE nlp_intent_rules 
          SET action_target = ?, category = '测试场景', updated_at = NOW()
          WHERE intent_name = ?
        `, [parameterizedSQL, ruleName]);
        
        console.log(`✅ 修复测试规则: ${ruleName}`);
        this.fixedRules.push(ruleName);
      } catch (error) {
        console.error(`❌ 修复失败 ${ruleName}:`, error.message);
        this.errors.push({ rule: ruleName, error: error.message });
      }
    }
  }

  /**
   * 3. 修复库存场景规则的字段映射
   */
  async fixInventoryScenarioFieldMapping() {
    console.log('📦 修复库存场景字段映射...');
    
    // 检查inventory表的实际字段结构
    const [tableInfo] = await this.connection.execute(`
      DESCRIBE inventory
    `);
    
    console.log('📋 inventory表字段结构:');
    tableInfo.forEach(field => {
      console.log(`  ${field.Field}: ${field.Type}`);
    });

    // 基于实际表结构生成正确的库存场景SQL
    const correctInventorySQL = `SELECT 
  factory as 工厂,
  warehouse as 仓库,
  material_code as 物料编码,
  material_name as 物料名称,
  supplier_name as 供应商,
  quantity as 数量,
  status as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(expiry_time, '%Y-%m-%d') as 到期时间,
  notes as 备注
FROM inventory
WHERE 1=1
ORDER BY inbound_time DESC
LIMIT 10`;

    // 需要修复的库存相关规则
    const inventoryRulesToFix = [
      '物料库存信息查询_优化',
      '供应商库存查询_优化',
      '库存状态查询',
      '批次库存信息查询'
    ];

    for (const ruleName of inventoryRulesToFix) {
      try {
        let parameterizedSQL = correctInventorySQL;
        
        if (ruleName.includes('物料')) {
          parameterizedSQL = correctInventorySQL.replace('WHERE 1=1', 'WHERE material_name LIKE CONCAT(\'%\', ?, \'%\')');
        } else if (ruleName.includes('供应商')) {
          parameterizedSQL = correctInventorySQL.replace('WHERE 1=1', 'WHERE supplier_name LIKE CONCAT(\'%\', ?, \'%\')');
        } else if (ruleName.includes('状态')) {
          parameterizedSQL = correctInventorySQL.replace('WHERE 1=1', 'WHERE status LIKE CONCAT(\'%\', ?, \'%\')');
        } else if (ruleName.includes('批次')) {
          parameterizedSQL = correctInventorySQL.replace('WHERE 1=1', 'WHERE batch_code LIKE CONCAT(\'%\', ?, \'%\')');
        }

        await this.connection.execute(`
          UPDATE nlp_intent_rules 
          SET action_target = ?, category = '库存场景', updated_at = NOW()
          WHERE intent_name = ?
        `, [parameterizedSQL, ruleName]);
        
        console.log(`✅ 修复库存规则: ${ruleName}`);
        this.fixedRules.push(ruleName);
      } catch (error) {
        console.error(`❌ 修复失败 ${ruleName}:`, error.message);
        this.errors.push({ rule: ruleName, error: error.message });
      }
    }
  }

  /**
   * 4. 添加缺失的数据探索规则
   */
  async addMissingExplorationRules() {
    console.log('➕ 添加缺失的数据探索规则...');
    
    const missingRules = [
      {
        intent_name: '查看库存状态分布',
        description: '显示库存中各种状态的分布情况',
        action_target: `SELECT status as 状态, COUNT(*) as 数量, 
                       ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM inventory), 2) as 占比
                       FROM inventory 
                       WHERE status IS NOT NULL
                       GROUP BY status 
                       ORDER BY 数量 DESC`,
        trigger_words: JSON.stringify(['状态分布', '库存状态', '有哪些状态', '状态统计']),
        example_query: '库存状态都有哪些？',
        category: '数据探索'
      },
      
      {
        intent_name: '查看测试结果分布',
        description: '显示测试结果的分布情况',
        action_target: `SELECT test_result as 测试结果, COUNT(*) as 数量,
                       ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM lab_tests), 2) as 占比
                       FROM lab_tests 
                       WHERE test_result IS NOT NULL
                       GROUP BY test_result 
                       ORDER BY 数量 DESC`,
        trigger_words: JSON.stringify(['测试结果分布', '测试状态', '合格率', '测试统计']),
        example_query: '测试结果都有哪些？',
        category: '数据探索'
      }
    ];

    for (const rule of missingRules) {
      try {
        await this.connection.execute(`
          INSERT INTO nlp_intent_rules 
          (intent_name, description, action_type, action_target, trigger_words, example_query, category, priority, status, synonyms, created_at, updated_at)
          VALUES (?, ?, 'SQL_QUERY', ?, ?, ?, ?, 50, 'active', '{}', NOW(), NOW())
          ON DUPLICATE KEY UPDATE
          action_target = VALUES(action_target),
          trigger_words = VALUES(trigger_words),
          updated_at = NOW()
        `, [
          rule.intent_name,
          rule.description,
          rule.action_target,
          rule.trigger_words,
          rule.example_query,
          rule.category
        ]);
        
        console.log(`✅ 添加探索规则: ${rule.intent_name}`);
        this.fixedRules.push(rule.intent_name);
      } catch (error) {
        console.error(`❌ 添加失败 ${rule.intent_name}:`, error.message);
        this.errors.push({ rule: rule.intent_name, error: error.message });
      }
    }
  }

  /**
   * 执行所有修复操作
   */
  async executeAllFixes() {
    try {
      await this.connect();
      
      console.log('🚀 开始综合修复规则匹配和字段映射问题...\n');
      
      await this.fixExplorationRuleMatching();
      console.log('');
      
      await this.fixTestScenarioFieldMapping();
      console.log('');
      
      await this.fixInventoryScenarioFieldMapping();
      console.log('');
      
      await this.addMissingExplorationRules();
      console.log('');
      
      // 统计最终结果
      const [totalRules] = await this.connection.execute(
        'SELECT COUNT(*) as total FROM nlp_intent_rules WHERE status = "active"'
      );
      
      const [explorationRules] = await this.connection.execute(
        'SELECT COUNT(*) as total FROM nlp_intent_rules WHERE category = "数据探索" AND status = "active"'
      );
      
      const [testRules] = await this.connection.execute(
        'SELECT COUNT(*) as total FROM nlp_intent_rules WHERE category = "测试场景" AND status = "active"'
      );
      
      const [inventoryRules] = await this.connection.execute(
        'SELECT COUNT(*) as total FROM nlp_intent_rules WHERE category = "库存场景" AND status = "active"'
      );

      console.log('🎉 综合修复完成！');
      console.log('📊 修复统计:');
      console.log(`   修复成功: ${this.fixedRules.length}条规则`);
      console.log(`   修复失败: ${this.errors.length}条规则`);
      console.log('');
      console.log('📈 规则分布:');
      console.log(`   总活跃规则: ${totalRules[0].total}条`);
      console.log(`   数据探索规则: ${explorationRules[0].total}条`);
      console.log(`   测试场景规则: ${testRules[0].total}条`);
      console.log(`   库存场景规则: ${inventoryRules[0].total}条`);
      
      if (this.errors.length > 0) {
        console.log('\n❌ 修复失败的规则:');
        this.errors.forEach(error => {
          console.log(`   ${error.rule}: ${error.error}`);
        });
      }
      
    } catch (error) {
      console.error('❌ 综合修复失败:', error);
    } finally {
      await this.disconnect();
    }
  }
}

// 执行修复
const fixer = new ComprehensiveRuleFixer();
fixer.executeAllFixes().catch(console.error);
