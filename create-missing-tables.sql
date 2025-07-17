-- 创建缺失的数据库表

USE iqe_inspection;

-- 创建生产跟踪表 (production_tracking)
CREATE TABLE IF NOT EXISTS production_tracking (
  id VARCHAR(50) PRIMARY KEY,
  test_id VARCHAR(50),
  test_date DATE,
  project VARCHAR(50),
  baseline VARCHAR(50),
  material_code VARCHAR(50),
  quantity INT DEFAULT 1,
  material_name VARCHAR(100),
  supplier_name VARCHAR(100),
  defect_desc TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建批次管理表 (batch_management)
CREATE TABLE IF NOT EXISTS batch_management (
  id VARCHAR(50) PRIMARY KEY,
  batch_code VARCHAR(50) UNIQUE,
  material_code VARCHAR(50),
  material_name VARCHAR(100),
  supplier_name VARCHAR(100),
  quantity INT DEFAULT 1,
  entry_date DATE,
  production_exception TEXT,
  test_exception TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX idx_production_tracking_material ON production_tracking(material_code);
CREATE INDEX idx_production_tracking_supplier ON production_tracking(supplier_name);
CREATE INDEX idx_production_tracking_date ON production_tracking(test_date);

CREATE INDEX idx_batch_management_material ON batch_management(material_code);
CREATE INDEX idx_batch_management_supplier ON batch_management(supplier_name);
CREATE INDEX idx_batch_management_batch ON batch_management(batch_code);
CREATE INDEX idx_batch_management_date ON batch_management(entry_date);

-- 显示创建结果
SELECT 'Tables created successfully' AS status;
