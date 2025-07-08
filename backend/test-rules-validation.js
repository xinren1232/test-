import { Sequelize } from 'sequelize';

// 数据库连接配置
const sequelize = new Sequelize('iqe_inspection', 'root', 'root123', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

// 测试规则的SQL查询
const testRules = [
  {
    id: 1,
    name: '库存总量查询',
    sql: 'SELECT COUNT(*) as total_count FROM inventory',
    expectedResult: 'should return count > 0'
  },
  {
    id: 2,
    name: '库存状态分布',
    sql: 'SELECT status, COUNT(*) as count FROM inventory GROUP BY status ORDER BY count DESC',
    expectedResult: 'should return status distribution'
  },
  {
    id: 3,
    name: '供应商数量统计',
    sql: 'SELECT supplier_name, COUNT(*) as material_count FROM inventory GROUP BY supplier_name ORDER BY material_count DESC',
    expectedResult: 'should return supplier statistics'
  },
  {
    id: 4,
    name: '工厂库存分布',
    sql: 'SELECT storage_location, COUNT(*) as count FROM inventory GROUP BY storage_location ORDER BY count DESC',
    expectedResult: 'should return factory distribution'
  },
  {
    id: 5,
    name: '物料类型统计',
    sql: 'SELECT material_name, COUNT(*) as count FROM inventory GROUP BY material_name ORDER BY count DESC',
    expectedResult: 'should return material statistics'
  },
  {
    id: 6,
    name: '测试记录总数',
    sql: 'SELECT COUNT(*) as total_tests FROM lab_tests',
    expectedResult: 'should return test count > 0'
  },
  {
    id: 7,
    name: '测试通过率统计',
    sql: 'SELECT test_result, COUNT(*) as count, ROUND(COUNT(*)*100.0/(SELECT COUNT(*) FROM lab_tests), 2) as percentage FROM lab_tests GROUP BY test_result',
    expectedResult: 'should return pass/fail statistics'
  },
  {
    id: 8,
    name: '生产记录总数',
    sql: 'SELECT COUNT(*) as total_production FROM online_tracking',
    expectedResult: 'should return production count > 0'
  },
  {
    id: 9,
    name: '生产工厂分布',
    sql: 'SELECT factory, COUNT(*) as count FROM online_tracking GROUP BY factory ORDER BY count DESC',
    expectedResult: 'should return factory production stats'
  },
  {
    id: 10,
    name: '项目统计',
    sql: 'SELECT project, COUNT(*) as count FROM online_tracking GROUP BY project ORDER BY count DESC',
    expectedResult: 'should return project statistics'
  }
];

// 测试有问题的规则
const problematicRules = [
  {
    id: 15,
    name: '失败测试查询（修复后）',
    sql: 'SELECT material_name, test_item, defect_desc, test_date FROM lab_tests WHERE test_result = "FAIL"',
    expectedResult: 'should return failed tests'
  },
  {
    id: 21,
    name: '物料测试通过率（修复后）',
    sql: 'SELECT material_name, COUNT(*) as total_tests, SUM(CASE WHEN test_result = "PASS" THEN 1 ELSE 0 END) as pass_count, ROUND(SUM(CASE WHEN test_result = "PASS" THEN 1 ELSE 0 END)*100.0/COUNT(*), 2) as pass_rate FROM lab_tests GROUP BY material_name HAVING COUNT(*) > 0 ORDER BY pass_rate DESC',
    expectedResult: 'should return material pass rates'
  },
  {
    id: 29,
    name: '供应商多样性分析（修复后）',
    sql: 'SELECT supplier_name, COUNT(DISTINCT storage_location) as factory_count, COUNT(*) as material_count FROM inventory GROUP BY supplier_name ORDER BY factory_count DESC, material_count DESC',
    expectedResult: 'should return supplier diversity'
  }
];

async function validateRules() {
  try {
    await sequelize.authenticate();
    console.log('✅ 连接到数据库成功！\n');

    console.log('🧪 开始验证基础规则...\n');
    
    let successCount = 0;
    let totalCount = testRules.length;

    for (const rule of testRules) {
      console.log(`🔍 测试规则 ${rule.id}: ${rule.name}`);
      console.log(`📝 SQL: ${rule.sql}`);
      
      try {
        const results = await sequelize.query(rule.sql, { type: Sequelize.QueryTypes.SELECT });
        
        if (results && results.length > 0) {
          console.log(`✅ 成功 - 返回 ${results.length} 条记录`);
          console.log(`📊 样本数据:`, results[0]);
          successCount++;
        } else {
          console.log(`⚠️ 警告 - 查询成功但无数据`);
        }
      } catch (error) {
        console.log(`❌ 失败 - ${error.message}`);
      }
      
      console.log(''); // 空行分隔
    }

    console.log(`📊 基础规则验证结果: ${successCount}/${totalCount} 成功\n`);

    // 测试修复后的规则
    console.log('🔧 测试修复后的规则...\n');
    
    let fixedSuccessCount = 0;
    let fixedTotalCount = problematicRules.length;

    for (const rule of problematicRules) {
      console.log(`🔍 测试修复规则 ${rule.id}: ${rule.name}`);
      console.log(`📝 SQL: ${rule.sql}`);
      
      try {
        const results = await sequelize.query(rule.sql, { type: Sequelize.QueryTypes.SELECT });
        
        if (results && results.length > 0) {
          console.log(`✅ 成功 - 返回 ${results.length} 条记录`);
          console.log(`📊 样本数据:`, results[0]);
          fixedSuccessCount++;
        } else {
          console.log(`⚠️ 警告 - 查询成功但无数据`);
        }
      } catch (error) {
        console.log(`❌ 失败 - ${error.message}`);
      }
      
      console.log(''); // 空行分隔
    }

    console.log(`📊 修复规则验证结果: ${fixedSuccessCount}/${fixedTotalCount} 成功\n`);

    // 测试复杂JOIN查询
    console.log('🔗 测试复杂JOIN查询...\n');
    
    const joinQueries = [
      {
        name: '物料测试覆盖率',
        sql: 'SELECT i.material_name, COUNT(DISTINCT i.id) as inventory_count, COUNT(DISTINCT l.id) as test_count, CASE WHEN COUNT(DISTINCT l.id) > 0 THEN "已测试" ELSE "未测试" END as test_status FROM inventory i LEFT JOIN lab_tests l ON i.material_name = l.material_name GROUP BY i.material_name ORDER BY test_count DESC LIMIT 5'
      },
      {
        name: '物料流转分析',
        sql: 'SELECT i.material_name, i.supplier_name, COUNT(DISTINCT i.storage_location) as storage_locations, COUNT(DISTINCT o.factory) as production_factories, CASE WHEN COUNT(DISTINCT o.factory) > 0 THEN "已投产" ELSE "未投产" END as production_status FROM inventory i LEFT JOIN online_tracking o ON i.material_name = o.material_name GROUP BY i.material_name, i.supplier_name ORDER BY production_factories DESC LIMIT 5'
      }
    ];

    let joinSuccessCount = 0;
    for (const query of joinQueries) {
      console.log(`🔍 测试: ${query.name}`);
      
      try {
        const results = await sequelize.query(query.sql, { type: Sequelize.QueryTypes.SELECT });
        console.log(`✅ 成功 - 返回 ${results.length} 条记录`);
        if (results.length > 0) {
          console.log(`📊 样本数据:`, results[0]);
        }
        joinSuccessCount++;
      } catch (error) {
        console.log(`❌ 失败 - ${error.message}`);
      }
      console.log('');
    }

    console.log(`📊 JOIN查询验证结果: ${joinSuccessCount}/${joinQueries.length} 成功\n`);

    console.log('🎉 规则验证完成！');
    console.log(`📈 总体成功率: ${(successCount + fixedSuccessCount + joinSuccessCount)}/${(totalCount + fixedTotalCount + joinQueries.length)} = ${Math.round((successCount + fixedSuccessCount + joinSuccessCount) * 100 / (totalCount + fixedTotalCount + joinQueries.length))}%`);

  } catch (error) {
    console.error('❌ 验证失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

validateRules();
