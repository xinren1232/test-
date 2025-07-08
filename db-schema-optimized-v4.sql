-- IQE质量检验系统数据库设计 (优化版 v4)
-- 基于前端实际字段需求进行精确对齐

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- 库存表 (对齐前端库存页面字段)
-- 前端字段: 工厂,仓库,物料类型,供应商名称,供应商,数量,状态,入库时间,到期时间,备注
-- ----------------------------
DROP TABLE IF EXISTS `inventory`;
CREATE TABLE `inventory` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `batch_code` VARCHAR(50) NOT NULL COMMENT '批次号',
  `material_code` VARCHAR(50) NOT NULL COMMENT '物料编码',
  `material_name` VARCHAR(100) COMMENT '物料名称',
  `material_type` VARCHAR(50) COMMENT '物料类型', -- 对应前端"物料类型"
  `supplier_code` VARCHAR(50) COMMENT '供应商编码', -- 对应前端"供应商"
  `supplier_name` VARCHAR(100) COMMENT '供应商名称', -- 对应前端"供应商名称"
  `factory` VARCHAR(50) COMMENT '工厂', -- 对应前端"工厂"
  `warehouse` VARCHAR(50) COMMENT '仓库', -- 对应前端"仓库"
  `quantity` INT NOT NULL COMMENT '数量', -- 对应前端"数量"
  `status` VARCHAR(20) DEFAULT 'normal' COMMENT '状态(normal/risk/frozen)', -- 对应前端"状态"
  `inbound_time` DATETIME COMMENT '入库时间', -- 对应前端"入库时间"
  `expiry_time` DATETIME COMMENT '到期时间', -- 对应前端"到期时间"
  `notes` TEXT COMMENT '备注', -- 对应前端"备注"
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_batch_code` (`batch_code`),
  INDEX `idx_material_code` (`material_code`),
  INDEX `idx_factory` (`factory`),
  INDEX `idx_warehouse` (`warehouse`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存数据表';

-- ----------------------------
-- 实验室测试记录表 (对齐前端上线数据/测试跟踪页面字段)
-- 前端字段: 测试编号,日期,项目,基线,物料类型,数量,物料名称,供应商,不合格描述,备注
-- ----------------------------
DROP TABLE IF EXISTS `lab_tests`;
CREATE TABLE `lab_tests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `test_id` VARCHAR(50) NOT NULL UNIQUE COMMENT '测试编号', -- 对应前端"测试编号"
  `test_date` DATE COMMENT '日期', -- 对应前端"日期"
  `project` VARCHAR(100) COMMENT '项目', -- 对应前端"项目"
  `baseline` VARCHAR(100) COMMENT '基线', -- 对应前端"基线"
  `material_type` VARCHAR(50) COMMENT '物料类型', -- 对应前端"物料类型"
  `quantity` INT COMMENT '数量', -- 对应前端"数量"
  `material_name` VARCHAR(100) COMMENT '物料名称', -- 对应前端"物料名称"
  `supplier_name` VARCHAR(100) COMMENT '供应商', -- 对应前端"供应商"
  `defect_desc` VARCHAR(255) COMMENT '不合格描述', -- 对应前端"不合格描述"
  `notes` TEXT COMMENT '备注', -- 对应前端"备注"
  -- 额外的技术字段
  `batch_code` VARCHAR(50) COMMENT '批次号',
  `material_code` VARCHAR(50) COMMENT '物料编码',
  `test_result` VARCHAR(20) COMMENT '测试结果(PASS/FAIL)',
  `tester` VARCHAR(50) COMMENT '测试员',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_test_id` (`test_id`),
  INDEX `idx_test_date` (`test_date`),
  INDEX `idx_project` (`project`),
  INDEX `idx_baseline` (`baseline`),
  INDEX `idx_material_type` (`material_type`),
  INDEX `idx_test_result` (`test_result`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='实验室测试记录表';

-- ----------------------------
-- 生产跟踪表 (对齐前端测试跟踪页面字段)
-- 前端字段: 测试编号,日期,项目,基线,物料类型,数量,物料名称,供应商,不合格描述,备注
-- ----------------------------
DROP TABLE IF EXISTS `production_tracking`;
CREATE TABLE `production_tracking` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `test_id` VARCHAR(50) NOT NULL COMMENT '测试编号', -- 对应前端"测试编号"
  `test_date` DATE COMMENT '日期', -- 对应前端"日期"
  `project` VARCHAR(100) COMMENT '项目', -- 对应前端"项目"
  `baseline` VARCHAR(100) COMMENT '基线', -- 对应前端"基线"
  `material_type` VARCHAR(50) COMMENT '物料类型', -- 对应前端"物料类型"
  `quantity` INT COMMENT '数量', -- 对应前端"数量"
  `material_name` VARCHAR(100) COMMENT '物料名称', -- 对应前端"物料名称"
  `supplier_name` VARCHAR(100) COMMENT '供应商', -- 对应前端"供应商"
  `defect_desc` VARCHAR(255) COMMENT '不合格描述', -- 对应前端"不合格描述"
  `notes` TEXT COMMENT '备注', -- 对应前端"备注"
  -- 额外的技术字段
  `batch_code` VARCHAR(50) COMMENT '批次号',
  `material_code` VARCHAR(50) COMMENT '物料编码',
  `production_result` VARCHAR(20) COMMENT '生产结果(OK/NG)',
  `operator` VARCHAR(50) COMMENT '操作员',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_test_id` (`test_id`),
  INDEX `idx_test_date` (`test_date`),
  INDEX `idx_project` (`project`),
  INDEX `idx_baseline` (`baseline`),
  INDEX `idx_material_type` (`material_type`),
  INDEX `idx_production_result` (`production_result`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产跟踪表';

-- ----------------------------
-- NLP意图规则表 (基于实际字段优化)
-- ----------------------------
DROP TABLE IF EXISTS `nlp_intent_rules`;
CREATE TABLE `nlp_intent_rules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `intent_name` VARCHAR(100) NOT NULL COMMENT '意图名称/关键字',
  `description` VARCHAR(255) COMMENT '规则描述',
  `action_type` VARCHAR(50) NOT NULL COMMENT '动作类型 (SQL_QUERY, FUNCTION_CALL, API_CALL)',
  `action_target` TEXT NOT NULL COMMENT '动作目标 (SQL查询或函数名)',
  `parameters` JSON COMMENT '参数定义',
  `trigger_words` JSON COMMENT '触发关键词数组',
  `synonyms` JSON COMMENT '同义词映射',
  `example_query` VARCHAR(255) COMMENT '示例问题',
  `priority` INT DEFAULT 1 COMMENT '优先级',
  `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态 (active/inactive)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_intent_name` (`intent_name`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='NLP意图规则表';

SET FOREIGN_KEY_CHECKS = 1;
