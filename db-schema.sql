-- 智能质检系统数据库结构
-- 版本: 1.0
-- 日期: 2023-05-25

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 创建物料基本信息表
CREATE TABLE IF NOT EXISTS `materials` (
    `material_code` VARCHAR(20) PRIMARY KEY,
    `material_name` VARCHAR(100) NOT NULL,
    `specifications` TEXT,
    `unit` VARCHAR(10) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料基本信息表';

-- 创建供应商表
CREATE TABLE IF NOT EXISTS `suppliers` (
    `supplier_id` INT AUTO_INCREMENT PRIMARY KEY,
    `supplier_code` VARCHAR(20) UNIQUE NOT NULL,
    `supplier_name` VARCHAR(100) NOT NULL,
    `contact_person` VARCHAR(50),
    `contact_phone` VARCHAR(20),
    `address` TEXT,
    `risk_level` TINYINT DEFAULT 0 COMMENT '0:低风险 1:中风险 2:高风险',
    `status` TINYINT DEFAULT 1 COMMENT '0:停用 1:启用',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='供应商信息表';

-- 创建生产质量数据表
CREATE TABLE IF NOT EXISTS `production_quality_data` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `line_id` VARCHAR(20) NOT NULL COMMENT '产线ID',
    `batch_id` VARCHAR(20) NOT NULL COMMENT '批次号',
    `product_code` VARCHAR(20) NOT NULL COMMENT '产品编码',
    `param_name` VARCHAR(50) NOT NULL COMMENT '工艺参数',
    `param_value` DECIMAL(12,4) NOT NULL COMMENT '参数值',
    `record_time` DATETIME NOT NULL COMMENT '采集时间',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_line_batch` (`line_id`, `batch_id`),
    INDEX `idx_record_time` (`record_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产质量数据表';

-- 创建生产缺陷数据表
CREATE TABLE IF NOT EXISTS `production_defect_data` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `line_id` VARCHAR(20) NOT NULL COMMENT '产线ID',
    `batch_id` VARCHAR(20) NOT NULL COMMENT '批次号',
    `defect_type` VARCHAR(50) NOT NULL COMMENT '不良类型',
    `defect_qty` INT NOT NULL COMMENT '不良数量',
    `total_qty` INT NOT NULL COMMENT '总生产数量',
    `defect_rate` DECIMAL(5,2) NOT NULL COMMENT '不良率',
    `record_time` DATETIME NOT NULL COMMENT '采集时间',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_line_batch` (`line_id`, `batch_id`),
    INDEX `idx_record_time` (`record_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产缺陷数据表';

-- 创建物料-供应商关联表
CREATE TABLE IF NOT EXISTS `material_suppliers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `material_code` VARCHAR(20) NOT NULL,
    `supplier_id` INT NOT NULL,
    `is_primary` BOOLEAN DEFAULT FALSE COMMENT '是否为主要供应商',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`material_code`) REFERENCES `materials`(`material_code`),
    FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`supplier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物料与供应商关联表';

-- 创建仓库表
CREATE TABLE IF NOT EXISTS `warehouses` (
    `warehouse_id` VARCHAR(20) PRIMARY KEY,
    `warehouse_name` VARCHAR(100) NOT NULL,
    `warehouse_type` ENUM('general', 'laboratory', 'quality', 'production') NOT NULL COMMENT '仓库类型：普通仓库、实验室仓库、质量管理仓库、生产仓库',
    `location` VARCHAR(100) NOT NULL,
    `status` ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
    `manager` VARCHAR(50),
    `description` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='仓库信息表';

-- 创建库区表
CREATE TABLE IF NOT EXISTS `warehouse_areas` (
    `area_id` VARCHAR(20) PRIMARY KEY,
    `warehouse_id` VARCHAR(20) NOT NULL,
    `area_name` VARCHAR(100) NOT NULL,
    `area_type` VARCHAR(50) NOT NULL COMMENT '区域类型，如：原料区、成品区、样品区、待检区等',
    `temperature_range` VARCHAR(20) COMMENT '温度范围要求',
    `humidity_range` VARCHAR(20) COMMENT '湿度范围要求',
    `special_requirements` TEXT COMMENT '特殊要求',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`warehouse_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='仓库区域表';

-- 创建库存主表
CREATE TABLE IF NOT EXISTS `inventory` (
    `inventory_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `material_code` VARCHAR(20) NOT NULL,
    `batch_id` VARCHAR(20) NOT NULL,
    `quantity` DECIMAL(12,3) NOT NULL DEFAULT 0,
    `warehouse_id` VARCHAR(20) NOT NULL COMMENT '仓库ID',
    `area_id` VARCHAR(20) COMMENT '库区ID',
    `location` VARCHAR(50) NOT NULL COMMENT '库位',
    `factory` VARCHAR(50) NOT NULL COMMENT '工厂',
    `status` ENUM('normal','frozen','pending','rejected') NOT NULL DEFAULT 'normal',
    `arrival_time` DATETIME NOT NULL,
    `expiry_date` DATE,
    `created_by` VARCHAR(50),
    `frozen_reason` TEXT,
    `source_system` VARCHAR(50) COMMENT '数据来源系统',
    `lock_flag` TINYINT(1) DEFAULT 0 COMMENT '逻辑锁标志, 0未锁定，1锁定',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`material_code`) REFERENCES `materials`(`material_code`),
    FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`warehouse_id`),
    FOREIGN KEY (`area_id`) REFERENCES `warehouse_areas`(`area_id`),
    INDEX `idx_material_batch` (`material_code`, `batch_id`),
    INDEX `idx_warehouse_area` (`warehouse_id`, `area_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存信息表';

-- 创建实验室测试表
CREATE TABLE IF NOT EXISTS `lab_tests` (
    `test_id` VARCHAR(20) PRIMARY KEY,
    `material_code` VARCHAR(20) NOT NULL,
    `batch_id` VARCHAR(20) NOT NULL,
    `warehouse_id` VARCHAR(20) NOT NULL COMMENT '实验室仓库ID',
    `test_date` DATETIME NOT NULL,
    `test_item` VARCHAR(100) NOT NULL,
    `result` ENUM('OK','NG','有条件接收') NOT NULL,
    `defect_rate` DECIMAL(5,2),
    `tester` VARCHAR(50),
    `reviewer` VARCHAR(50),
    `test_source` VARCHAR(50),
    `test_parameters` JSON,
    `remarks` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`material_code`) REFERENCES `materials`(`material_code`),
    FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`warehouse_id`),
    INDEX `idx_material_batch` (`material_code`, `batch_id`),
    INDEX `idx_result` (`result`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='实验室测试记录表';

-- 创建样品管理表
CREATE TABLE IF NOT EXISTS `lab_samples` (
    `sample_id` VARCHAR(20) PRIMARY KEY,
    `material_code` VARCHAR(20) NOT NULL,
    `batch_id` VARCHAR(20) NOT NULL,
    `inventory_id` BIGINT,
    `warehouse_id` VARCHAR(20) NOT NULL COMMENT '实验室仓库ID',
    `sample_quantity` DECIMAL(12,3) NOT NULL,
    `sample_status` ENUM('pending','testing','complete','disposed') NOT NULL DEFAULT 'pending',
    `sample_date` DATETIME NOT NULL,
    `expiry_date` DATE,
    `storage_location` VARCHAR(100) NOT NULL,
    `storage_condition` TEXT,
    `collected_by` VARCHAR(50),
    `remarks` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`material_code`) REFERENCES `materials`(`material_code`),
    FOREIGN KEY (`inventory_id`) REFERENCES `inventory`(`inventory_id`),
    FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`warehouse_id`),
    INDEX `idx_material_batch` (`material_code`, `batch_id`),
    INDEX `idx_status` (`sample_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='实验室样品管理表';

-- 创建质量检验标准表
CREATE TABLE IF NOT EXISTS `quality_standards` (
    `standard_id` VARCHAR(20) PRIMARY KEY,
    `material_code` VARCHAR(20) NOT NULL,
    `standard_name` VARCHAR(100) NOT NULL,
    `version` VARCHAR(20) NOT NULL,
    `effective_date` DATE NOT NULL,
    `expiry_date` DATE,
    `standard_parameters` JSON NOT NULL COMMENT '质量标准参数',
    `approval_by` VARCHAR(50),
    `approval_date` DATE,
    `status` ENUM('draft','active','obsolete') NOT NULL DEFAULT 'draft',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`material_code`) REFERENCES `materials`(`material_code`),
    INDEX `idx_material_version` (`material_code`, `version`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='质量检验标准表';

-- 创建测试详细数据表
CREATE TABLE IF NOT EXISTS `test_details` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `test_id` VARCHAR(20) NOT NULL,
    `parameter` VARCHAR(50) NOT NULL,
    `value` VARCHAR(50) NOT NULL,
    `unit` VARCHAR(10),
    `standard` VARCHAR(50),
    `status` ENUM('OK','NG','WARNING') NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`test_id`) REFERENCES `lab_tests`(`test_id`),
    INDEX `idx_test_id` (`test_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='测试详细数据表';

-- 创建测试图片关联表
CREATE TABLE IF NOT EXISTS `test_images` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `test_id` VARCHAR(20) NOT NULL,
    `image_url` VARCHAR(255) NOT NULL,
    `caption` VARCHAR(100),
    `sort_order` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`test_id`) REFERENCES `lab_tests`(`test_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='测试图片关联表';

-- 创建生产线表
CREATE TABLE IF NOT EXISTS `production_lines` (
    `line_id` VARCHAR(20) PRIMARY KEY,
    `line_name` VARCHAR(50) NOT NULL,
    `factory_id` VARCHAR(20) NOT NULL,
    `status` ENUM('running','stopped','maintenance') DEFAULT 'running',
    `current_material_code` VARCHAR(20),
    `current_batch` VARCHAR(20),
    `manager` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`current_material_code`) REFERENCES `materials`(`material_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产线信息表';

-- 创建质量问题表
CREATE TABLE IF NOT EXISTS `quality_issues` (
    `issue_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `material_code` VARCHAR(20) NOT NULL,
    `batch_id` VARCHAR(20) NOT NULL,
    `warehouse_id` VARCHAR(20) COMMENT '质量管理仓库ID',
    `detection_date` DATETIME NOT NULL,
    `issue_type` VARCHAR(50) NOT NULL,
    `severity` ENUM('low','medium','high','critical') NOT NULL,
    `root_cause` TEXT,
    `action_taken` TEXT,
    `responsible_person` VARCHAR(50),
    `status` ENUM('open','in_progress','resolved','closed') DEFAULT 'open',
    `report_by` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`material_code`) REFERENCES `materials`(`material_code`),
    FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`warehouse_id`),
    INDEX `idx_material_batch` (`material_code`, `batch_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='质量问题表';

-- 创建库存历史表
CREATE TABLE IF NOT EXISTS `inventory_history` (
    `history_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `material_code` VARCHAR(20) NOT NULL,
    `batch_id` VARCHAR(20) NOT NULL,
    `warehouse_id` VARCHAR(20) NOT NULL,
    `operation_type` VARCHAR(20) NOT NULL,
    `quantity_change` DECIMAL(12,3) NOT NULL,
    `location_from` VARCHAR(50),
    `location_to` VARCHAR(50),
    `operator` VARCHAR(50),
    `operation_time` DATETIME NOT NULL,
    `notes` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`material_code`) REFERENCES `materials`(`material_code`),
    FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`warehouse_id`),
    INDEX `idx_material_batch` (`material_code`, `batch_id`),
    INDEX `idx_warehouse` (`warehouse_id`),
    INDEX `idx_operation_time` (`operation_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存历史表';

-- 创建AI预测记录表
CREATE TABLE IF NOT EXISTS `ai_predictions` (
    `prediction_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `prediction_type` ENUM('quality','risk','inventory','optimization') NOT NULL,
    `material_code` VARCHAR(20),
    `batch_id` VARCHAR(20),
    `warehouse_id` VARCHAR(20),
    `prediction_data` JSON NOT NULL,
    `confidence` DECIMAL(5,2) NOT NULL,
    `prediction_time` DATETIME NOT NULL,
    `is_validated` BOOLEAN DEFAULT FALSE,
    `validation_result` BOOLEAN,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`material_code`) REFERENCES `materials`(`material_code`),
    FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`warehouse_id`),
    INDEX `idx_material_batch` (`material_code`, `batch_id`),
    INDEX `idx_warehouse` (`warehouse_id`),
    INDEX `idx_prediction_type` (`prediction_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI预测记录表';

-- 当实验室测试结果为NG时，自动标记相关库存为待检状态
DELIMITER //
CREATE TRIGGER IF NOT EXISTS `after_test_insert`
AFTER INSERT ON `lab_tests`
FOR EACH ROW
BEGIN
    IF NEW.result = 'NG' THEN
        UPDATE `inventory` 
        SET `status` = 'pending',
            `frozen_reason` = CONCAT('测试失败: ', NEW.test_id),
            `updated_at` = NOW()
        WHERE `material_code` = NEW.material_code 
        AND `batch_id` = NEW.batch_id
        AND `status` = 'normal';
    END IF;
END //
DELIMITER ;

-- 批次冻结存储过程
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS `freeze_batch`(
    IN p_material_code VARCHAR(20),
    IN p_batch_id VARCHAR(20),
    IN p_warehouse_id VARCHAR(20),
    IN p_reason TEXT,
    IN p_operator VARCHAR(50)
)
BEGIN
    DECLARE affected_rows INT;
    
    -- 更新库存状态
    UPDATE `inventory`
    SET `status` = 'frozen',
        `frozen_reason` = p_reason,
        `updated_at` = NOW()
    WHERE `material_code` = p_material_code
    AND `batch_id` = p_batch_id
    AND `warehouse_id` = p_warehouse_id
    AND `status` != 'frozen';
    
    SET affected_rows = ROW_COUNT();
    
    -- 记录操作历史
    IF affected_rows > 0 THEN
        INSERT INTO `inventory_history` 
        (`material_code`, `batch_id`, `warehouse_id`, `operation_type`, `quantity_change`, `operator`, `operation_time`, `notes`)
        VALUES 
        (p_material_code, p_batch_id, p_warehouse_id, '冻结', 0, p_operator, NOW(), p_reason);
    END IF;
    
    -- 返回受影响的行数
    SELECT affected_rows AS affected_count;
END //
DELIMITER ;

-- 批次释放存储过程
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS `release_batch`(
    IN p_material_code VARCHAR(20),
    IN p_batch_id VARCHAR(20),
    IN p_warehouse_id VARCHAR(20),
    IN p_reason TEXT,
    IN p_operator VARCHAR(50)
)
BEGIN
    DECLARE affected_rows INT;
    
    -- 更新库存状态
    UPDATE `inventory`
    SET `status` = 'normal',
        `frozen_reason` = NULL,
        `updated_at` = NOW()
    WHERE `material_code` = p_material_code
    AND `batch_id` = p_batch_id
    AND `warehouse_id` = p_warehouse_id
    AND `status` = 'frozen';
    
    SET affected_rows = ROW_COUNT();
    
    -- 记录操作历史
    IF affected_rows > 0 THEN
        INSERT INTO `inventory_history` 
        (`material_code`, `batch_id`, `warehouse_id`, `operation_type`, `quantity_change`, `operator`, `operation_time`, `notes`)
        VALUES 
        (p_material_code, p_batch_id, p_warehouse_id, '释放', 0, p_operator, NOW(), p_reason);
    END IF;
    
    -- 返回受影响的行数
    SELECT affected_rows AS affected_count;
END //
DELIMITER ;

-- 库存转移存储过程
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS `transfer_inventory`(
    IN p_material_code VARCHAR(20),
    IN p_batch_id VARCHAR(20),
    IN p_quantity DECIMAL(12,3),
    IN p_from_warehouse VARCHAR(20),
    IN p_from_location VARCHAR(50),
    IN p_to_warehouse VARCHAR(20),
    IN p_to_location VARCHAR(50),
    IN p_operator VARCHAR(50),
    IN p_reason TEXT
)
BEGIN
    DECLARE from_inventory_id BIGINT;
    DECLARE from_current_quantity DECIMAL(12,3);
    DECLARE to_inventory_id BIGINT;
    
    -- 查找源库存
    SELECT inventory_id, quantity INTO from_inventory_id, from_current_quantity
    FROM inventory
    WHERE material_code = p_material_code
    AND batch_id = p_batch_id
    AND warehouse_id = p_from_warehouse
    AND location = p_from_location
    AND status = 'normal'
    LIMIT 1;
    
    -- 检查源库存是否存在且数量足够
    IF from_inventory_id IS NULL OR from_current_quantity < p_quantity THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '源库存不存在或数量不足';
    ELSE
        -- 开始事务
        START TRANSACTION;
        
        -- 减少源库存
        UPDATE inventory
        SET quantity = quantity - p_quantity,
            updated_at = NOW()
        WHERE inventory_id = from_inventory_id;
        
        -- 查找目标库存是否存在
        SELECT inventory_id INTO to_inventory_id
        FROM inventory
        WHERE material_code = p_material_code
        AND batch_id = p_batch_id
        AND warehouse_id = p_to_warehouse
        AND location = p_to_location
        AND status = 'normal'
        LIMIT 1;
        
        -- 如果目标库存存在，则增加数量；否则创建新库存记录
        IF to_inventory_id IS NOT NULL THEN
            UPDATE inventory
            SET quantity = quantity + p_quantity,
                updated_at = NOW()
            WHERE inventory_id = to_inventory_id;
        ELSE
            INSERT INTO inventory
            (material_code, batch_id, quantity, warehouse_id, location, factory, status, arrival_time, created_by)
            SELECT material_code, batch_id, p_quantity, p_to_warehouse, p_to_location, factory, status, NOW(), p_operator
            FROM inventory
            WHERE inventory_id = from_inventory_id;
        END IF;
        
        -- 记录库存历史
        INSERT INTO inventory_history
        (material_code, batch_id, warehouse_id, operation_type, quantity_change, location_from, location_to, operator, operation_time, notes)
        VALUES
        (p_material_code, p_batch_id, p_from_warehouse, '转出', -p_quantity, p_from_location, p_to_location, p_operator, NOW(), p_reason);
        
        INSERT INTO inventory_history
        (material_code, batch_id, warehouse_id, operation_type, quantity_change, location_from, location_to, operator, operation_time, notes)
        VALUES
        (p_material_code, p_batch_id, p_to_warehouse, '转入', p_quantity, p_from_location, p_to_location, p_operator, NOW(), p_reason);
        
        -- 提交事务
        COMMIT;
    END IF;
END //
DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1; 