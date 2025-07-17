/**
 * 规则字段标准化脚本
 * 确保所有规则输出字段与前端场景设计完全对应
 */

import mysql from 'mysql2/promise';

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 前端场景字段映射标准
const FIELD_MAPPINGS = {
  // 库存页面字段标准
  inventory: {
    displayFields: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
    sqlMapping: {
      '工厂': 'factory',
      '仓库': 'warehouse',
      '物料编码': 'material_code',
      '物料名称': 'material_name', 
      '供应商': 'supplier_name',
      '数量': 'quantity',
      '状态': 'status',
      '入库时间': "DATE_FORMAT(inbound_time, '%Y-%m-%d')",
      '到期时间': "DATE_FORMAT(expiry_time, '%Y-%m-%d')",
      '备注': 'notes'
    },
    tableName: 'inventory'
  },

  // 上线页面字段标准
  online: {
    displayFields: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注'],
    sqlMapping: {
      '工厂': 'factory',
      '基线': 'baseline',
      '项目': 'project',
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '批次号': 'batch_code',
      '不良率': 'defect_rate',
      '本周异常': 'weekly_anomaly',
      '检验日期': "DATE_FORMAT(inspection_date, '%Y-%m-%d')",
      '备注': 'notes'
    },
    tableName: 'production_tracking'
  },

  // 测试页面字段标准
  testing: {
    displayFields: ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'],
    sqlMapping: {
      '测试编号': 'test_id',
      '日期': "DATE_FORMAT(test_date, '%Y-%m-%d')",
      '项目': 'project',
      '基线': 'baseline',
      '物料编码': 'material_code',
      '数量': 'quantity',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '测试结果': 'test_result',
      '不合格描述': 'defect_desc',
      '备注': 'notes'
    },
    tableName: 'lab_tests'
  },

  // 批次管理字段标准
  batch: {
    displayFields: ['批次号', '物料编码', '物料名称', '供应商', '数量', '入库日期', '产线异常', '测试异常', '备注'],
    sqlMapping: {
      '批次号': 'batch_code',
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '数量': 'quantity',
      '入库日期': "DATE_FORMAT(inbound_date, '%Y-%m-%d')",
      '产线异常': 'production_anomaly',
      '测试异常': 'test_anomaly',
      '备注': 'notes'
    },
    tableName: 'batch_management'
  }
};

// 规则场景分类
const RULE_CATEGORIES = {
  '库存场景': ['库存', '物料库存', '供应商库存', '工厂库存', '仓库库存'],
  '测试场景': ['测试', 'NG', '不合格', '测试结果', '检验', '质量'],
  '上线场景': ['上线', '生产', '产线', '跟踪', '批次上线'],
  '批次场景': ['批次', '批次管理', '批次信息', '异常批次']
};

class RuleFieldStandardizer {
  constructor() {
    this.connection = null;
    this.processedRules = [];
    this.errors = [];
  }

  /**
   * 连接数据库
   */
  async connect() {
    try {
      this.connection = await mysql.createConnection(dbConfig);
      console.log('✅ 数据库连接成功');
    } catch (error) {
      console.error('❌ 数据库连接失败:', error);
      throw error;
    }
  }

  /**
   * 断开数据库连接
   */
  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('✅ 数据库连接已关闭');
    }
  }

  /**
   * 获取所有活跃规则
   */
  async getAllActiveRules() {
    try {
      const [rules] = await this.connection.execute(`
        SELECT 
          id,
          intent_name,
          description,
          action_type,
          action_target,
          category,
          status
        FROM nlp_intent_rules 
        WHERE status = 'active'
        ORDER BY id ASC
      `);
      
      console.log(`📋 获取到 ${rules.length} 条活跃规则`);
      return rules;
    } catch (error) {
      console.error('❌ 获取规则失败:', error);
      throw error;
    }
  }

  /**
   * 识别规则所属场景
   */
  identifyRuleScenario(rule) {
    const ruleName = rule.intent_name.toLowerCase();
    const ruleDesc = (rule.description || '').toLowerCase();
    const ruleTarget = (rule.action_target || '').toLowerCase();
    
    for (const [scenario, keywords] of Object.entries(RULE_CATEGORIES)) {
      for (const keyword of keywords) {
        if (ruleName.includes(keyword.toLowerCase()) || 
            ruleDesc.includes(keyword.toLowerCase()) ||
            ruleTarget.includes(keyword.toLowerCase())) {
          return scenario;
        }
      }
    }
    
    return '未分类';
  }

  /**
   * 生成标准化的SQL查询
   */
  generateStandardizedSQL(scenario, originalSQL) {
    const mapping = FIELD_MAPPINGS[this.getScenarioKey(scenario)];
    if (!mapping) {
      return originalSQL; // 如果没有映射，返回原SQL
    }

    // 构建标准化的SELECT语句
    const selectFields = mapping.displayFields.map(field => {
      const sqlField = mapping.sqlMapping[field];
      return `${sqlField} as ${field}`;
    }).join(',\n  ');

    // 生成标准化SQL
    const standardSQL = `SELECT 
  ${selectFields}
FROM ${mapping.tableName}
WHERE 1=1`;

    return standardSQL;
  }

  /**
   * 获取场景对应的映射键
   */
  getScenarioKey(scenario) {
    const keyMap = {
      '库存场景': 'inventory',
      '测试场景': 'testing', 
      '上线场景': 'online',
      '批次场景': 'batch'
    };
    return keyMap[scenario] || null;
  }

  /**
   * 更新规则SQL
   */
  async updateRuleSQL(ruleId, newSQL, scenario) {
    try {
      await this.connection.execute(`
        UPDATE nlp_intent_rules 
        SET action_target = ?, category = ?
        WHERE id = ?
      `, [newSQL, scenario, ruleId]);
      
      return true;
    } catch (error) {
      console.error(`❌ 更新规则 ${ruleId} 失败:`, error);
      this.errors.push({ ruleId, error: error.message });
      return false;
    }
  }

  /**
   * 处理单个规则
   */
  async processRule(rule, dryRun = true) {
    const scenario = this.identifyRuleScenario(rule);
    const originalSQL = rule.action_target;
    
    // 只处理SQL_QUERY类型的规则
    if (rule.action_type !== 'SQL_QUERY') {
      console.log(`⏭️ 跳过非SQL规则: ${rule.intent_name} (${rule.action_type})`);
      return;
    }

    // 生成标准化SQL
    const standardizedSQL = this.generateStandardizedSQL(scenario, originalSQL);
    
    const processInfo = {
      id: rule.id,
      name: rule.intent_name,
      scenario: scenario,
      originalSQL: originalSQL.substring(0, 100) + '...',
      standardizedSQL: standardizedSQL.substring(0, 100) + '...',
      needsUpdate: originalSQL !== standardizedSQL
    };

    if (dryRun) {
      console.log(`🔍 [预览] 规则 ${rule.id}: ${rule.intent_name}`);
      console.log(`   场景: ${scenario}`);
      console.log(`   需要更新: ${processInfo.needsUpdate ? '是' : '否'}`);
    } else if (processInfo.needsUpdate) {
      const success = await this.updateRuleSQL(rule.id, standardizedSQL, scenario);
      if (success) {
        console.log(`✅ 更新规则 ${rule.id}: ${rule.intent_name}`);
      }
    }

    this.processedRules.push(processInfo);
  }

  /**
   * 批量处理所有规则
   */
  async processAllRules(dryRun = true) {
    try {
      console.log(`🚀 开始${dryRun ? '预览' : '执行'}规则标准化...`);
      
      const rules = await this.getAllActiveRules();
      
      for (const rule of rules) {
        await this.processRule(rule, dryRun);
      }
      
      this.generateReport(dryRun);
      
    } catch (error) {
      console.error('❌ 批量处理失败:', error);
      throw error;
    }
  }

  /**
   * 生成处理报告
   */
  generateReport(dryRun) {
    console.log('\n📊 处理报告:');
    console.log(`模式: ${dryRun ? '预览模式' : '执行模式'}`);
    console.log(`总规则数: ${this.processedRules.length}`);
    
    const needsUpdate = this.processedRules.filter(r => r.needsUpdate);
    console.log(`需要更新: ${needsUpdate.length}`);
    
    const byScenario = {};
    this.processedRules.forEach(rule => {
      byScenario[rule.scenario] = (byScenario[rule.scenario] || 0) + 1;
    });
    
    console.log('\n📋 按场景分布:');
    Object.entries(byScenario).forEach(([scenario, count]) => {
      console.log(`  ${scenario}: ${count}条`);
    });
    
    if (this.errors.length > 0) {
      console.log(`\n❌ 错误数: ${this.errors.length}`);
      this.errors.forEach(error => {
        console.log(`  规则 ${error.ruleId}: ${error.error}`);
      });
    }
  }
}

// 主函数
async function main() {
  const standardizer = new RuleFieldStandardizer();
  
  try {
    await standardizer.connect();
    
    // 检查命令行参数
    const args = process.argv.slice(2);
    const executeMode = args.includes('--execute');
    
    console.log('🔧 规则字段标准化工具');
    console.log('========================');
    
    if (!executeMode) {
      console.log('⚠️ 当前为预览模式，不会实际修改数据');
      console.log('要执行实际更新，请添加 --execute 参数');
    }
    
    await standardizer.processAllRules(!executeMode);
    
  } catch (error) {
    console.error('❌ 执行失败:', error);
  } finally {
    await standardizer.disconnect();
  }
}

// 运行脚本
main().catch(console.error);

export default RuleFieldStandardizer;
