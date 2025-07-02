/**
 * 创建优化的数据库架构
 */
import mysql from 'mysql2/promise';

async function createOptimizedSchema() {
  console.log('🔄 开始创建优化的数据库架构...');
  
  try {
    // 连接到MySQL
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99'
    });
    
    console.log('✅ 连接到MySQL成功！');
    
    // 删除并重新创建数据库
    await connection.query('DROP DATABASE IF EXISTS `iqe_inspection`');
    await connection.query('CREATE DATABASE `iqe_inspection` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    await connection.query('USE `iqe_inspection`');
    
    console.log('✅ 数据库重新创建成功！');
    
    // 创建库存表
    await connection.query(`
      CREATE TABLE \`inventory\` (
        \`id\` VARCHAR(50) PRIMARY KEY COMMENT '唯一ID',
        \`batch_code\` VARCHAR(50) NOT NULL COMMENT '批次号',
        \`material_code\` VARCHAR(50) NOT NULL COMMENT '物料编码',
        \`material_name\` VARCHAR(100) COMMENT '物料名称',
        \`material_type\` VARCHAR(50) COMMENT '物料类型',
        \`supplier_name\` VARCHAR(100) COMMENT '供应商',
        \`quantity\` INT NOT NULL COMMENT '库存数量',
        \`inbound_time\` DATETIME COMMENT '入库时间',
        \`storage_location\` VARCHAR(100) COMMENT '库位',
        \`status\` VARCHAR(20) DEFAULT 'pending' COMMENT '状态',
        \`risk_level\` VARCHAR(20) DEFAULT 'low' COMMENT '风险等级',
        \`inspector\` VARCHAR(50) COMMENT '检验员',
        \`notes\` TEXT COMMENT '备注',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_batch_code\` (\`batch_code\`),
        INDEX \`idx_material_code\` (\`material_code\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存数据表'
    `);
    
    console.log('✅ 库存表创建成功！');
    
    // 创建测试记录表
    await connection.query(`
      CREATE TABLE \`lab_tests\` (
        \`id\` VARCHAR(50) PRIMARY KEY COMMENT '唯一ID',
        \`test_id\` VARCHAR(50) NOT NULL UNIQUE COMMENT '测试ID',
        \`batch_code\` VARCHAR(50) NOT NULL COMMENT '批次号',
        \`material_code\` VARCHAR(50) NOT NULL COMMENT '物料编码',
        \`material_name\` VARCHAR(100) COMMENT '物料名称',
        \`supplier_name\` VARCHAR(100) COMMENT '供应商',
        \`test_date\` DATE COMMENT '测试日期',
        \`test_item\` VARCHAR(100) COMMENT '测试项目',
        \`test_result\` VARCHAR(20) COMMENT '测试结果 (OK/NG)',
        \`conclusion\` VARCHAR(255) COMMENT '测试结论',
        \`defect_desc\` VARCHAR(255) COMMENT '不良描述',
        \`tester\` VARCHAR(50) COMMENT '测试员',
        \`reviewer\` VARCHAR(50) COMMENT '审核员',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_batch_code\` (\`batch_code\`),
        INDEX \`idx_material_code\` (\`material_code\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='实验室测试记录'
    `);
    
    console.log('✅ 测试记录表创建成功！');
    
    // 创建产线跟踪表
    await connection.query(`
      CREATE TABLE \`online_tracking\` (
        \`id\` VARCHAR(50) PRIMARY KEY COMMENT '唯一ID',
        \`batch_code\` VARCHAR(50) NOT NULL COMMENT '批次号',
        \`material_code\` VARCHAR(50) NOT NULL COMMENT '物料编码',
        \`material_name\` VARCHAR(100) COMMENT '物料名称',
        \`supplier_name\` VARCHAR(100) COMMENT '供应商',
        \`online_date\` DATE COMMENT '上线日期',
        \`use_time\` DATETIME COMMENT '使用时间',
        \`factory\` VARCHAR(50) COMMENT '工厂',
        \`workshop\` VARCHAR(50) COMMENT '车间',
        \`line\` VARCHAR(50) COMMENT '产线',
        \`project\` VARCHAR(100) COMMENT '使用项目',
        \`defect_rate\` DECIMAL(5, 4) DEFAULT 0.00 COMMENT '不良率',
        \`exception_count\` INT DEFAULT 0 COMMENT '异常计数',
        \`operator\` VARCHAR(50) COMMENT '操作员',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_batch_code\` (\`batch_code\`),
        INDEX \`idx_material_code\` (\`material_code\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产线物料上线跟踪'
    `);
    
    console.log('✅ 产线跟踪表创建成功！');
    
    // 创建NLP意图规则表
    await connection.query(`
      CREATE TABLE \`nlp_intent_rules\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`intent_name\` VARCHAR(100) NOT NULL UNIQUE COMMENT '意图名称/关键字',
        \`description\` VARCHAR(255) COMMENT '规则描述',
        \`action_type\` VARCHAR(50) NOT NULL COMMENT '动作类型',
        \`action_target\` TEXT NOT NULL COMMENT '动作目标',
        \`parameters\` JSON COMMENT '参数定义',
        \`example_query\` VARCHAR(255) COMMENT '示例问题',
        \`status\` VARCHAR(20) DEFAULT 'active' COMMENT '状态',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_intent_name\` (\`intent_name\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='NLP意图规则表'
    `);
    
    console.log('✅ NLP意图规则表创建成功！');
    
    await connection.end();
    console.log('🎉 优化的数据库架构创建完成！');
    
  } catch (error) {
    console.error('❌ 数据库架构创建失败:', error);
    process.exit(1);
  }
}

createOptimizedSchema();
