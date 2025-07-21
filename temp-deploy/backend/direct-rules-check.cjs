// 直接检查和创建规则
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function directRulesCheck() {
  let connection;
  
  try {
    console.log('🔧 直接检查和修复规则系统...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 确保表存在
    console.log('\n📋 确保assistant_rules表存在...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS assistant_rules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        intent_name VARCHAR(255) NOT NULL,
        description TEXT,
        action_type VARCHAR(50) DEFAULT 'SQL_QUERY',
        action_target TEXT,
        trigger_words JSON,
        example_query VARCHAR(255),
        priority INT DEFAULT 5,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ assistant_rules表已确保存在');
    
    // 2. 清空现有规则
    console.log('\n🗑️ 清空现有规则...');
    await connection.execute('DELETE FROM assistant_rules');
    console.log('✅ 现有规则已清空');
    
    // 3. 插入基础规则
    console.log('\n📝 插入基础规则...');
    
    const basicRules = [
      {
        intent_name: '库存基础查询',
        description: '查询库存基础信息',
        action_target: `SELECT 
          SUBSTRING_INDEX(storage_location, '-', 1) as '工厂',
          SUBSTRING_INDEX(storage_location, '-', -1) as '仓库',
          material_code as '物料编码',
          material_name as '物料名称',
          material_type as '物料类型',
          supplier_name as '供应商',
          quantity as '数量',
          status as '状态',
          DATE_FORMAT(inbound_time, '%Y-%m-%d %H:%i') as '入库时间',
          COALESCE(notes, '') as '备注'
        FROM inventory ORDER BY inbound_time DESC LIMIT 20`,
        trigger_words: JSON.stringify(['库存', '库存信息', '库存查询', '库存状态', '物料库存']),
        example_query: '查询库存信息',
        priority: 10
      },
      
      {
        intent_name: '供应商统计',
        description: '统计系统中的供应商',
        action_target: `SELECT 
          supplier_name as '供应商', 
          COUNT(*) as '库存记录数', 
          SUM(quantity) as '总数量' 
        FROM inventory 
        WHERE supplier_name IS NOT NULL 
        GROUP BY supplier_name 
        ORDER BY COUNT(*) DESC`,
        trigger_words: JSON.stringify(['供应商统计', '有哪些供应商', '供应商列表', '系统里有哪些供应商']),
        example_query: '系统里有哪些供应商？',
        priority: 6
      },
      
      {
        intent_name: '检验数据基础查询',
        description: '查询检验数据基础信息',
        action_target: `SELECT 
          test_id as '测试编号',
          DATE_FORMAT(test_date, '%Y-%m-%d') as '日期',
          material_name as '物料名称',
          supplier_name as '供应商',
          test_result as '测试结果',
          COALESCE(defect_desc, '') as '不合格描述',
          COALESCE(conclusion, '') as '备注'
        FROM lab_tests ORDER BY test_date DESC LIMIT 20`,
        trigger_words: JSON.stringify(['检验数据', '检验信息', '检验查询', '测试数据', '实验室数据']),
        example_query: '查询检验数据',
        priority: 10
      },
      
      {
        intent_name: '生产数据基础查询',
        description: '查询生产跟踪数据',
        action_target: `SELECT 
          id as '测试编号',
          DATE_FORMAT(online_date, '%Y-%m-%d') as '日期',
          project as '项目',
          workshop as '基线',
          material_name as '物料名称',
          supplier_name as '供应商',
          CONCAT('不良率: ', ROUND(defect_rate * 100, 2), '%') as '不合格描述',
          CONCAT('工厂: ', factory, ', 车间: ', workshop) as '备注'
        FROM online_tracking ORDER BY online_date DESC LIMIT 20`,
        trigger_words: JSON.stringify(['生产数据', '生产信息', '上线数据', '生产跟踪', '在线跟踪']),
        example_query: '查询生产数据',
        priority: 10
      },
      
      {
        intent_name: '按供应商查询库存',
        description: '根据供应商名称查询库存',
        action_target: `SELECT 
          SUBSTRING_INDEX(storage_location, '-', 1) as '工厂',
          material_name as '物料名称',
          supplier_name as '供应商',
          quantity as '数量',
          status as '状态',
          DATE_FORMAT(inbound_time, '%Y-%m-%d') as '入库时间'
        FROM inventory 
        WHERE supplier_name LIKE '%{supplier}%' 
        ORDER BY inbound_time DESC`,
        trigger_words: JSON.stringify(['供应商库存', '供应商', '{supplier}供应商', '{supplier}的库存']),
        example_query: '查询聚龙供应商的库存',
        priority: 8
      }
    ];
    
    let insertedCount = 0;
    for (const rule of basicRules) {
      try {
        await connection.execute(`
          INSERT INTO assistant_rules (
            intent_name, description, action_type, action_target,
            trigger_words, example_query, priority, status, created_at
          ) VALUES (?, ?, 'SQL_QUERY', ?, ?, ?, ?, 'active', NOW())
        `, [
          rule.intent_name,
          rule.description,
          rule.action_target,
          rule.trigger_words,
          rule.example_query,
          rule.priority
        ]);
        
        insertedCount++;
        console.log(`✅ 已插入规则: ${rule.intent_name}`);
        
      } catch (error) {
        console.error(`❌ 插入规则失败 [${rule.intent_name}]:`, error.message);
      }
    }
    
    console.log(`\n🎉 规则插入完成！共插入 ${insertedCount} 条规则`);
    
    // 4. 验证规则
    const [count] = await connection.execute('SELECT COUNT(*) as count FROM assistant_rules WHERE status = "active"');
    console.log(`📊 当前活跃规则数量: ${count[0].count}`);
    
    if (count[0].count > 0) {
      const [rules] = await connection.execute('SELECT intent_name, priority FROM assistant_rules WHERE status = "active" ORDER BY priority DESC');
      console.log('\n📋 已创建的规则:');
      rules.forEach((rule, index) => {
        console.log(`${index + 1}. ${rule.intent_name} (优先级: ${rule.priority})`);
      });
    }
    
  } catch (error) {
    console.error('❌ 操作失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

directRulesCheck();
