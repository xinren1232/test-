/**
 * 综合规则优化执行脚本
 * 直接执行规则标准化和字段定义更新
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 基于数据生成程序的字段定义
const FIELD_DEFINITIONS = {
  materialSuppliers: {
    "电池盖": ["聚龙", "欣冠", "广正"],
    "中框": ["聚龙", "欣冠", "广正"],
    "手机卡托": ["聚龙", "欣冠", "广正"],
    "侧键": ["聚龙", "欣冠", "广正"],
    "装饰件": ["聚龙", "欣冠", "广正"],
    "LCD显示屏": ["帝晶", "天马", "BOE"],
    "OLED显示屏": ["BOE", "天马", "华星"],
    "摄像头模组": ["盛泰", "天实", "深奥"],
    "电池": ["百俊达", "奥海", "辰阳"],
    "充电器": ["锂威", "风华", "维科"],
    "扬声器": ["东声", "豪声", "歌尔"],
    "听筒": ["东声", "豪声", "歌尔"],
    "保护套": ["丽德宝", "裕同", "富群"],
    "标签": ["丽德宝", "裕同", "富群"],
    "包装盒": ["丽德宝", "裕同", "富群"]
  },
  factories: ["重庆工厂", "深圳工厂", "南昌工厂", "宜宾工厂"],
  warehouses: ["中央库存", "重庆库存", "深圳库存"],
  statusOptions: ["正常", "风险", "冻结"],
  testResults: ["PASS", "FAIL"]
};

// 前端场景字段映射
const SCENE_MAPPINGS = {
  inventory: {
    name: '库存场景',
    fields: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
    table: 'inventory'
  },
  testing: {
    name: '测试场景', 
    fields: ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'],
    table: 'lab_tests'
  },
  online: {
    name: '上线场景',
    fields: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注'],
    table: 'production_tracking'
  },
  batch: {
    name: '批次场景',
    fields: ['批次号', '物料编码', '物料名称', '供应商', '数量', '入库日期', '产线异常', '测试异常', '备注'],
    table: 'batch_management'
  }
};

async function executeRuleOptimization() {
  let connection;
  
  try {
    console.log('🚀 开始执行综合规则优化...');
    
    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 获取所有活跃规则
    const [rules] = await connection.execute(`
      SELECT id, intent_name, description, action_type, action_target, category
      FROM nlp_intent_rules 
      WHERE status = 'active' AND action_type = 'SQL_QUERY'
      ORDER BY id ASC
    `);
    
    console.log(`📋 找到 ${rules.length} 条SQL规则需要优化`);
    
    let updatedCount = 0;
    let processedCount = 0;
    
    // 处理每个规则
    for (const rule of rules) {
      processedCount++;
      console.log(`\n🔄 处理规则 ${processedCount}/${rules.length}: [ID:${rule.id}] ${rule.intent_name}`);
      
      // 识别场景
      const scene = identifyScene(rule);
      if (!scene) {
        console.log('   ⏭️ 跳过：无法识别场景');
        continue;
      }
      
      const mapping = SCENE_MAPPINGS[scene];
      console.log(`   📍 识别场景: ${mapping.name}`);
      
      // 生成标准化SQL
      const standardSQL = generateStandardSQL(mapping, rule);
      
      // 生成触发词和同义词
      const triggerWords = generateTriggerWords(mapping, rule);
      const synonyms = generateSynonyms(mapping);
      
      // 检查是否需要更新
      const needsUpdate = rule.action_target !== standardSQL || 
                         rule.category !== mapping.name;
      
      if (needsUpdate) {
        try {
          await connection.execute(`
            UPDATE nlp_intent_rules 
            SET action_target = ?, category = ?, trigger_words = ?, synonyms = ?
            WHERE id = ?
          `, [standardSQL, mapping.name, JSON.stringify(triggerWords), JSON.stringify(synonyms), rule.id]);
          
          console.log('   ✅ 更新成功');
          updatedCount++;
        } catch (error) {
          console.log(`   ❌ 更新失败: ${error.message}`);
        }
      } else {
        console.log('   ✅ 无需更新');
      }
    }
    
    console.log('\n🎉 优化完成！');
    console.log(`📊 处理统计:`);
    console.log(`   总规则数: ${rules.length}`);
    console.log(`   已处理: ${processedCount}`);
    console.log(`   已更新: ${updatedCount}`);
    console.log(`   跳过数: ${rules.length - processedCount}`);
    
    // 验证更新结果
    console.log('\n🔍 验证更新结果...');
    const [updatedRules] = await connection.execute(`
      SELECT category, COUNT(*) as count
      FROM nlp_intent_rules 
      WHERE status = 'active' AND category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
    `);
    
    console.log('📈 按场景分布:');
    updatedRules.forEach(row => {
      console.log(`   ${row.category}: ${row.count}条`);
    });
    
  } catch (error) {
    console.error('❌ 执行失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ 数据库连接已关闭');
    }
  }
}

// 识别规则场景
function identifyScene(rule) {
  const text = `${rule.intent_name} ${rule.description || ''} ${rule.action_target || ''}`.toLowerCase();
  
  const sceneKeywords = {
    'inventory': ['库存', '物料库存', 'inventory', '仓库', '入库', '到期'],
    'testing': ['测试', 'NG', '不合格', 'lab_tests', '检验', '质量', '缺陷'],
    'online': ['上线', '生产', 'production', '产线', '批次上线', '不良率'],
    'batch': ['批次', 'batch', '批次管理', '批次信息']
  };

  for (const [scene, keywords] of Object.entries(sceneKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return scene;
    }
  }
  
  return null;
}

// 生成标准化SQL
function generateStandardSQL(mapping, rule) {
  const fieldMappings = {
    inventory: {
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
    testing: {
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
    online: {
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
    batch: {
      '批次号': 'batch_code',
      '物料编码': 'material_code',
      '物料名称': 'material_name',
      '供应商': 'supplier_name',
      '数量': 'quantity',
      '入库日期': "DATE_FORMAT(inbound_date, '%Y-%m-%d')",
      '产线异常': 'production_anomaly',
      '测试异常': 'test_anomaly',
      '备注': 'notes'
    }
  };

  const sceneKey = Object.keys(SCENE_MAPPINGS).find(key => SCENE_MAPPINGS[key].name === mapping.name);
  const sqlMapping = fieldMappings[sceneKey];
  
  if (!sqlMapping) return rule.action_target;

  const selectFields = mapping.fields.map(field => {
    const sqlField = sqlMapping[field];
    return `  ${sqlField} as ${field}`;
  }).join(',\n');

  return `SELECT 
${selectFields}
FROM ${mapping.table}
WHERE 1=1
ORDER BY id DESC
LIMIT 10`;
}

// 生成触发词
function generateTriggerWords(mapping, rule) {
  const words = [...mapping.fields];
  
  // 添加场景相关词汇
  const sceneWords = {
    '库存场景': ['库存', '物料库存', '仓库', '入库'],
    '测试场景': ['测试', '检验', '质量', 'NG', '不合格'],
    '上线场景': ['上线', '生产', '产线', '不良率'],
    '批次场景': ['批次', '批次管理', '批次信息']
  };
  
  if (sceneWords[mapping.name]) {
    words.push(...sceneWords[mapping.name]);
  }
  
  // 添加供应商名称
  words.push(...Object.values(FIELD_DEFINITIONS.materialSuppliers).flat());
  
  return [...new Set(words)];
}

// 生成同义词
function generateSynonyms(mapping) {
  return {
    '物料编码': ['料号', '编码', '物料号'],
    '物料名称': ['物料', '料件', '零件'],
    '供应商': ['厂商', '供货商', '供应方'],
    '工厂': ['厂区', '生产基地', '制造厂'],
    '仓库': ['库房', '存储区', '仓储'],
    '状态': ['情况', '状况', '条件'],
    '测试结果': ['检验结果', '测试状态'],
    '不合格描述': ['缺陷描述', '问题描述'],
    '批次号': ['批号', '批次'],
    '不良率': ['缺陷率', '异常率']
  };
}

// 执行优化
executeRuleOptimization().catch(console.error);
