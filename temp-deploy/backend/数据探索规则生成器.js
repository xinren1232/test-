/**
 * 数据探索规则生成器
 * 支持用户先探索数据内容，再执行具体查询
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 数据探索规则模板
const EXPLORATION_RULES = [
  // 基础探索规则
  {
    intent_name: '查看所有供应商',
    description: '显示系统中所有可用的供应商列表',
    trigger_words: ['供应商列表', '所有供应商', '有哪些供应商', '供应商有什么'],
    example_query: '系统里有哪些供应商？',
    sql_template: `
      SELECT DISTINCT supplier_name as 供应商名称, COUNT(*) as 记录数量
      FROM inventory 
      WHERE supplier_name IS NOT NULL AND supplier_name != ''
      GROUP BY supplier_name 
      ORDER BY 记录数量 DESC
    `,
    category: '数据探索',
    response_template: '系统中共有 {count} 个供应商：{list}。您可以选择任一供应商进行详细查询。'
  },
  
  {
    intent_name: '查看所有物料',
    description: '显示系统中所有可用的物料列表',
    trigger_words: ['物料列表', '所有物料', '有哪些物料', '物料有什么'],
    example_query: '系统里有哪些物料？',
    sql_template: `
      SELECT DISTINCT material_name as 物料名称, material_code as 物料编码, COUNT(*) as 记录数量
      FROM inventory 
      WHERE material_name IS NOT NULL AND material_name != ''
      GROUP BY material_name, material_code 
      ORDER BY 记录数量 DESC
    `,
    category: '数据探索',
    response_template: '系统中共有 {count} 种物料：{list}。您可以选择任一物料进行详细查询。'
  },

  {
    intent_name: '查看所有工厂',
    description: '显示系统中所有可用的工厂列表',
    trigger_words: ['工厂列表', '所有工厂', '有哪些工厂', '工厂有什么'],
    example_query: '系统里有哪些工厂？',
    sql_template: `
      SELECT DISTINCT factory as 工厂名称, COUNT(*) as 记录数量
      FROM inventory 
      WHERE factory IS NOT NULL AND factory != ''
      GROUP BY factory 
      ORDER BY 记录数量 DESC
    `,
    category: '数据探索',
    response_template: '系统中共有 {count} 个工厂：{list}。您可以选择任一工厂进行详细查询。'
  },

  {
    intent_name: '查看所有仓库',
    description: '显示系统中所有可用的仓库列表',
    trigger_words: ['仓库列表', '所有仓库', '有哪些仓库', '仓库有什么'],
    example_query: '系统里有哪些仓库？',
    sql_template: `
      SELECT DISTINCT warehouse as 仓库名称, COUNT(*) as 记录数量
      FROM inventory 
      WHERE warehouse IS NOT NULL AND warehouse != ''
      GROUP BY warehouse 
      ORDER BY 记录数量 DESC
    `,
    category: '数据探索',
    response_template: '系统中共有 {count} 个仓库：{list}。您可以选择任一仓库进行详细查询。'
  },

  {
    intent_name: '查看所有项目',
    description: '显示系统中所有可用的项目列表',
    trigger_words: ['项目列表', '所有项目', '有哪些项目', '项目有什么'],
    example_query: '系统里有哪些项目？',
    sql_template: `
      SELECT DISTINCT project_id as 项目编号, COUNT(*) as 记录数量
      FROM lab_tests 
      WHERE project_id IS NOT NULL AND project_id != ''
      GROUP BY project_id 
      ORDER BY 记录数量 DESC
    `,
    category: '数据探索',
    response_template: '系统中共有 {count} 个项目：{list}。您可以选择任一项目进行详细查询。'
  },

  {
    intent_name: '查看所有基线',
    description: '显示系统中所有可用的基线列表',
    trigger_words: ['基线列表', '所有基线', '有哪些基线', '基线有什么'],
    example_query: '系统里有哪些基线？',
    sql_template: `
      SELECT DISTINCT baseline_id as 基线编号, COUNT(*) as 记录数量
      FROM lab_tests 
      WHERE baseline_id IS NOT NULL AND baseline_id != ''
      GROUP BY baseline_id 
      ORDER BY 记录数量 DESC
    `,
    category: '数据探索',
    response_template: '系统中共有 {count} 个基线：{list}。您可以选择任一基线进行详细查询。'
  },

  // 组合探索规则
  {
    intent_name: '查看供应商物料组合',
    description: '显示每个供应商提供的物料种类',
    trigger_words: ['供应商物料', '供应商提供什么物料', '哪个供应商有什么物料'],
    example_query: '各个供应商都提供哪些物料？',
    sql_template: `
      SELECT supplier_name as 供应商, 
             GROUP_CONCAT(DISTINCT material_name ORDER BY material_name) as 物料列表,
             COUNT(DISTINCT material_name) as 物料种类数
      FROM inventory 
      WHERE supplier_name IS NOT NULL AND material_name IS NOT NULL
      GROUP BY supplier_name 
      ORDER BY 物料种类数 DESC
    `,
    category: '数据探索',
    response_template: '供应商物料分布：{details}。您可以选择特定供应商和物料组合进行查询。'
  },

  {
    intent_name: '查看工厂仓库组合',
    description: '显示每个工厂对应的仓库分布',
    trigger_words: ['工厂仓库', '工厂有哪些仓库', '仓库分布'],
    example_query: '各个工厂都有哪些仓库？',
    sql_template: `
      SELECT factory as 工厂, 
             GROUP_CONCAT(DISTINCT warehouse ORDER BY warehouse) as 仓库列表,
             COUNT(DISTINCT warehouse) as 仓库数量
      FROM inventory 
      WHERE factory IS NOT NULL AND warehouse IS NOT NULL
      GROUP BY factory 
      ORDER BY 仓库数量 DESC
    `,
    category: '数据探索',
    response_template: '工厂仓库分布：{details}。您可以选择特定工厂和仓库组合进行查询。'
  },

  // 状态探索规则
  {
    intent_name: '查看库存状态分布',
    description: '显示库存中各种状态的分布情况',
    trigger_words: ['状态分布', '库存状态', '有哪些状态'],
    example_query: '库存状态都有哪些？',
    sql_template: `
      SELECT status as 状态, COUNT(*) as 数量, 
             ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM inventory), 2) as 占比
      FROM inventory 
      WHERE status IS NOT NULL
      GROUP BY status 
      ORDER BY 数量 DESC
    `,
    category: '数据探索',
    response_template: '库存状态分布：{details}。您可以选择特定状态进行详细查询。'
  },

  {
    intent_name: '查看测试结果分布',
    description: '显示测试结果的分布情况',
    trigger_words: ['测试结果分布', '测试状态', '合格率'],
    example_query: '测试结果都有哪些？',
    sql_template: `
      SELECT test_result as 测试结果, COUNT(*) as 数量,
             ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM lab_tests), 2) as 占比
      FROM lab_tests 
      WHERE test_result IS NOT NULL
      GROUP BY test_result 
      ORDER BY 数量 DESC
    `,
    category: '数据探索',
    response_template: '测试结果分布：{details}。您可以选择特定结果进行详细分析。'
  }
];

class DataExplorationRuleGenerator {
  constructor() {
    this.connection = null;
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
   * 生成数据探索规则
   */
  async generateExplorationRules() {
    console.log('🔍 开始生成数据探索规则...');
    
    let successCount = 0;
    let errorCount = 0;

    for (const rule of EXPLORATION_RULES) {
      try {
        // 检查规则是否已存在
        const [existing] = await this.connection.execute(
          'SELECT id FROM nlp_intent_rules WHERE intent_name = ?',
          [rule.intent_name]
        );

        if (existing.length > 0) {
          // 更新现有规则
          await this.connection.execute(`
            UPDATE nlp_intent_rules 
            SET description = ?, action_target = ?, trigger_words = ?, 
                example_query = ?, category = ?, synonyms = ?
            WHERE intent_name = ?
          `, [
            rule.description,
            rule.sql_template.trim(),
            JSON.stringify(rule.trigger_words),
            rule.example_query,
            rule.category,
            JSON.stringify({}),
            rule.intent_name
          ]);
          console.log(`🔄 更新规则: ${rule.intent_name}`);
        } else {
          // 插入新规则
          await this.connection.execute(`
            INSERT INTO nlp_intent_rules 
            (intent_name, description, action_type, action_target, trigger_words, 
             example_query, category, priority, status, synonyms)
            VALUES (?, ?, 'SQL_QUERY', ?, ?, ?, ?, 50, 'active', ?)
          `, [
            rule.intent_name,
            rule.description,
            rule.sql_template.trim(),
            JSON.stringify(rule.trigger_words),
            rule.example_query,
            rule.category,
            JSON.stringify({})
          ]);
          console.log(`✅ 新增规则: ${rule.intent_name}`);
        }
        
        successCount++;
      } catch (error) {
        console.error(`❌ 处理规则失败 ${rule.intent_name}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 数据探索规则生成完成:`);
    console.log(`   成功: ${successCount}条`);
    console.log(`   失败: ${errorCount}条`);
    console.log(`   总计: ${EXPLORATION_RULES.length}条`);
  }

  /**
   * 生成确认查询规则
   */
  async generateConfirmationRules() {
    console.log('🔍 开始生成确认查询规则...');

    const confirmationRules = [
      {
        intent_name: '确认查询意图',
        description: '用户确认要执行的具体查询',
        trigger_words: ['确认', '是的', '对', '执行', '查询', '好的'],
        sql_template: 'CONFIRMATION_QUERY',
        category: '查询确认',
        example_query: '确认查询聚龙供应商的电池盖库存'
      }
    ];

    for (const rule of confirmationRules) {
      try {
        const [existing] = await this.connection.execute(
          'SELECT id FROM nlp_intent_rules WHERE intent_name = ?',
          [rule.intent_name]
        );

        if (existing.length === 0) {
          await this.connection.execute(`
            INSERT INTO nlp_intent_rules 
            (intent_name, description, action_type, action_target, trigger_words, 
             example_query, category, priority, status, synonyms)
            VALUES (?, ?, 'CONFIRMATION', ?, ?, ?, ?, 100, 'active', ?)
          `, [
            rule.intent_name,
            rule.description,
            rule.sql_template,
            JSON.stringify(rule.trigger_words),
            rule.example_query,
            rule.category,
            JSON.stringify({})
          ]);
          console.log(`✅ 新增确认规则: ${rule.intent_name}`);
        }
      } catch (error) {
        console.error(`❌ 处理确认规则失败:`, error.message);
      }
    }
  }

  /**
   * 执行完整的规则生成
   */
  async generateAllRules() {
    try {
      await this.connect();
      await this.generateExplorationRules();
      await this.generateConfirmationRules();
      
      // 统计最终规则数量
      const [totalRules] = await this.connection.execute(
        'SELECT COUNT(*) as total FROM nlp_intent_rules WHERE status = "active"'
      );
      
      const [explorationRules] = await this.connection.execute(
        'SELECT COUNT(*) as total FROM nlp_intent_rules WHERE category = "数据探索" AND status = "active"'
      );

      console.log(`\n🎯 规则库统计:`);
      console.log(`   总活跃规则: ${totalRules[0].total}条`);
      console.log(`   数据探索规则: ${explorationRules[0].total}条`);
      
    } catch (error) {
      console.error('❌ 规则生成失败:', error);
    } finally {
      await this.disconnect();
    }
  }
}

// 主函数
async function main() {
  const generator = new DataExplorationRuleGenerator();
  
  console.log('🚀 IQE数据探索规则生成器');
  console.log('==========================');
  console.log('📋 支持用户先探索数据内容，再执行具体查询');
  
  await generator.generateAllRules();
}

// 运行生成器
main().catch(console.error);

export default DataExplorationRuleGenerator;
