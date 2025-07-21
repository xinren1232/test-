/**
 * 数据清洗数据库存储服务
 * 将处理结果存储到数据库以便后续查询
 */

import mysql from 'mysql2/promise';

export class DataCleaningDatabaseService {
  constructor() {
    this.dbConfig = {
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99',
      database: 'iqe_inspection'
    };

    this.initialized = false;
    this.initPromise = this.initDatabase();
  }

  /**
   * 初始化数据库表结构
   */
  async initDatabase() {
    try {
      const connection = await mysql.createConnection(this.dbConfig);
      
      // 创建文件管理表
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS data_cleaning_files (
          id VARCHAR(50) PRIMARY KEY,
          filename VARCHAR(255) NOT NULL,
          filepath VARCHAR(500),
          mimetype VARCHAR(100),
          size BIGINT,
          upload_time DATETIME,
          status ENUM('待处理', '处理中', '已处理', '失败') DEFAULT '待处理',
          source_system VARCHAR(100),
          uploader VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      // 创建处理结果表
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS data_cleaning_results (
          id INT AUTO_INCREMENT PRIMARY KEY,
          file_id VARCHAR(50) NOT NULL,
          process_time DATETIME,
          total_chunks INT DEFAULT 0,
          structured_fields INT DEFAULT 0,
          rules_applied INT DEFAULT 0,
          quality_score INT DEFAULT 0,
          config_used JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (file_id) REFERENCES data_cleaning_files(id) ON DELETE CASCADE
        )
      `);
      
      // 创建结构化数据表
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS extracted_structured_data (
          id INT AUTO_INCREMENT PRIMARY KEY,
          file_id VARCHAR(50) NOT NULL,
          result_id INT,
          material_code VARCHAR(100),
          material_name VARCHAR(200),
          supplier VARCHAR(200),
          issue_type VARCHAR(200),
          description TEXT,
          temporary_action TEXT,
          responsible_dept VARCHAR(100),
          occurrence_date DATE,
          process_status VARCHAR(50),
          measurements VARCHAR(500),
          source_chunk VARCHAR(100),
          source_position VARCHAR(200),
          extraction_method ENUM('traditional', 'ai', 'hybrid') DEFAULT 'traditional',
          confidence_score INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (file_id) REFERENCES data_cleaning_files(id) ON DELETE CASCADE,
          FOREIGN KEY (result_id) REFERENCES data_cleaning_results(id) ON DELETE CASCADE
        )
      `);
      
      // 创建分块数据表
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS extracted_chunks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          file_id VARCHAR(50) NOT NULL,
          result_id INT,
          chunk_id VARCHAR(100),
          chunk_type VARCHAR(50),
          content TEXT,
          position VARCHAR(200),
          source VARCHAR(50),
          labels JSON,
          metadata JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (file_id) REFERENCES data_cleaning_files(id) ON DELETE CASCADE,
          FOREIGN KEY (result_id) REFERENCES data_cleaning_results(id) ON DELETE CASCADE
        )
      `);
      
      // 创建处理日志表
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS data_cleaning_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          file_id VARCHAR(50) NOT NULL,
          result_id INT,
          log_level ENUM('INFO', 'WARN', 'ERROR') DEFAULT 'INFO',
          message TEXT,
          timestamp DATETIME,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (file_id) REFERENCES data_cleaning_files(id) ON DELETE CASCADE,
          FOREIGN KEY (result_id) REFERENCES data_cleaning_results(id) ON DELETE CASCADE
        )
      `);
      
      // 创建清洗配置表
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS data_cleaning_configs (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(200) NOT NULL,
          config_data JSON,
          is_default BOOLEAN DEFAULT FALSE,
          created_by VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      await connection.end();
      this.initialized = true;
      console.log('✅ 数据清洗数据库表初始化完成');

    } catch (error) {
      console.error('❌ 数据库初始化失败:', error);
      throw error;
    }
  }

  /**
   * 确保数据库已初始化
   */
  async ensureInitialized() {
    if (!this.initialized) {
      await this.initPromise;
    }
  }

  /**
   * 保存文件信息
   */
  async saveFileInfo(fileInfo) {
    await this.ensureInitialized();
    const connection = await mysql.createConnection(this.dbConfig);
    
    try {
      await connection.execute(`
        INSERT INTO data_cleaning_files 
        (id, filename, filepath, mimetype, size, upload_time, status, source_system, uploader)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        fileInfo.id,
        fileInfo.filename,
        fileInfo.filepath,
        fileInfo.mimetype,
        fileInfo.size,
        new Date(fileInfo.upload_time),
        fileInfo.status,
        fileInfo.source_system,
        fileInfo.uploader || 'system'
      ]);
      
      console.log(`✅ 文件信息已保存到数据库: ${fileInfo.filename}`);
      return fileInfo;
      
    } finally {
      await connection.end();
    }
  }

  /**
   * 获取文件列表
   */
  async getFileList(limit = 100, offset = 0) {
    const connection = await mysql.createConnection(this.dbConfig);
    
    try {
      const [files] = await connection.execute(`
        SELECT * FROM data_cleaning_files 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `, [limit, offset]);
      
      return files;
      
    } finally {
      await connection.end();
    }
  }

  /**
   * 根据ID获取文件信息
   */
  async getFileById(fileId) {
    const connection = await mysql.createConnection(this.dbConfig);
    
    try {
      const [files] = await connection.execute(`
        SELECT * FROM data_cleaning_files WHERE id = ?
      `, [fileId]);
      
      return files[0] || null;
      
    } finally {
      await connection.end();
    }
  }

  /**
   * 更新文件状态
   */
  async updateFileStatus(fileId, status) {
    const connection = await mysql.createConnection(this.dbConfig);
    
    try {
      await connection.execute(`
        UPDATE data_cleaning_files 
        SET status = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [status, fileId]);
      
      console.log(`✅ 文件状态已更新: ${fileId} -> ${status}`);
      
    } finally {
      await connection.end();
    }
  }

  /**
   * 删除文件及相关数据
   */
  async deleteFile(fileId) {
    const connection = await mysql.createConnection(this.dbConfig);
    
    try {
      // 由于设置了外键约束，删除文件记录会自动删除相关数据
      const [result] = await connection.execute(`
        DELETE FROM data_cleaning_files WHERE id = ?
      `, [fileId]);
      
      console.log(`✅ 文件及相关数据已删除: ${fileId}`);
      return result.affectedRows > 0;
      
    } finally {
      await connection.end();
    }
  }

  /**
   * 保存处理结果
   */
  async saveProcessResult(fileId, processResult) {
    const connection = await mysql.createConnection(this.dbConfig);
    
    try {
      await connection.beginTransaction();
      
      // 1. 保存处理结果主记录
      const [resultInsert] = await connection.execute(`
        INSERT INTO data_cleaning_results 
        (file_id, process_time, total_chunks, structured_fields, rules_applied, quality_score, config_used)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        fileId,
        new Date(processResult.processTime),
        processResult.totalChunks,
        processResult.structuredFields,
        processResult.rulesApplied,
        processResult.qualityScore,
        JSON.stringify(processResult.config)
      ]);
      
      const resultId = resultInsert.insertId;
      
      // 2. 保存结构化数据
      if (processResult.structuredData && processResult.structuredData.length > 0) {
        for (const data of processResult.structuredData) {
          await connection.execute(`
            INSERT INTO extracted_structured_data 
            (file_id, result_id, material_code, material_name, supplier, issue_type, 
             description, temporary_action, responsible_dept, occurrence_date, 
             process_status, measurements, source_chunk, source_position, 
             extraction_method, confidence_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            fileId, resultId,
            data.MaterialCode || null,
            data.MaterialName || null,
            data.Supplier || null,
            data.IssueType || null,
            data.Description || null,
            data.TemporaryAction || null,
            data.ResponsibleDept || null,
            data.OccurrenceDate || null,
            data.ProcessStatus || null,
            data.Measurements || null,
            data.source_chunk || null,
            data.source_position || null,
            data.extractionMethod || 'traditional',
            data.finalConfidence || data.confidence || 0
          ]);
        }
      }
      
      // 3. 保存分块数据
      if (processResult.chunks && processResult.chunks.length > 0) {
        for (const chunk of processResult.chunks) {
          await connection.execute(`
            INSERT INTO extracted_chunks 
            (file_id, result_id, chunk_id, chunk_type, content, position, source, labels, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            fileId, resultId,
            chunk.chunk_id,
            chunk.type,
            chunk.content,
            chunk.position,
            chunk.source,
            JSON.stringify(chunk.labels || []),
            JSON.stringify(chunk.metadata || {})
          ]);
        }
      }
      
      // 4. 保存处理日志
      if (processResult.logs && processResult.logs.length > 0) {
        for (const log of processResult.logs) {
          await connection.execute(`
            INSERT INTO data_cleaning_logs 
            (file_id, result_id, log_level, message, timestamp)
            VALUES (?, ?, ?, ?, ?)
          `, [
            fileId, resultId,
            log.level,
            log.message,
            new Date(log.timestamp)
          ]);
        }
      }
      
      await connection.commit();
      console.log(`✅ 处理结果已保存到数据库: ${fileId}`);
      
      return resultId;
      
    } catch (error) {
      await connection.rollback();
      console.error('❌ 保存处理结果失败:', error);
      throw error;
    } finally {
      await connection.end();
    }
  }

  /**
   * 获取处理结果
   */
  async getProcessResult(fileId) {
    const connection = await mysql.createConnection(this.dbConfig);
    
    try {
      // 获取处理结果主记录
      const [results] = await connection.execute(`
        SELECT * FROM data_cleaning_results WHERE file_id = ? ORDER BY created_at DESC LIMIT 1
      `, [fileId]);
      
      if (results.length === 0) {
        return null;
      }
      
      const result = results[0];
      const resultId = result.id;
      
      // 获取结构化数据
      const [structuredData] = await connection.execute(`
        SELECT * FROM extracted_structured_data WHERE result_id = ?
      `, [resultId]);
      
      // 获取分块数据
      const [chunks] = await connection.execute(`
        SELECT * FROM extracted_chunks WHERE result_id = ?
      `, [resultId]);
      
      // 获取处理日志
      const [logs] = await connection.execute(`
        SELECT * FROM data_cleaning_logs WHERE result_id = ? ORDER BY timestamp
      `, [resultId]);
      
      return {
        ...result,
        config: JSON.parse(result.config_used || '{}'),
        structuredData: structuredData,
        chunks: chunks.map(chunk => ({
          ...chunk,
          labels: JSON.parse(chunk.labels || '[]'),
          metadata: JSON.parse(chunk.metadata || '{}')
        })),
        logs: logs
      };
      
    } finally {
      await connection.end();
    }
  }

  /**
   * 获取处理统计信息
   */
  async getProcessingStats() {
    const connection = await mysql.createConnection(this.dbConfig);
    
    try {
      // 文件统计
      const [fileStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total_files,
          SUM(CASE WHEN status = '已处理' THEN 1 ELSE 0 END) as processed_files,
          SUM(CASE WHEN status = '待处理' THEN 1 ELSE 0 END) as pending_files,
          SUM(CASE WHEN status = '失败' THEN 1 ELSE 0 END) as failed_files
        FROM data_cleaning_files
      `);
      
      // 处理结果统计
      const [resultStats] = await connection.execute(`
        SELECT 
          SUM(total_chunks) as total_chunks,
          SUM(structured_fields) as total_structured_fields,
          AVG(quality_score) as avg_quality_score
        FROM data_cleaning_results
      `);
      
      return {
        ...fileStats[0],
        ...resultStats[0],
        avg_quality_score: Math.round(resultStats[0].avg_quality_score || 0)
      };
      
    } finally {
      await connection.end();
    }
  }

  /**
   * 搜索结构化数据
   */
  async searchStructuredData(searchParams) {
    const connection = await mysql.createConnection(this.dbConfig);
    
    try {
      let query = `
        SELECT esd.*, dcf.filename 
        FROM extracted_structured_data esd
        JOIN data_cleaning_files dcf ON esd.file_id = dcf.id
        WHERE 1=1
      `;
      const params = [];
      
      if (searchParams.materialCode) {
        query += ` AND esd.material_code LIKE ?`;
        params.push(`%${searchParams.materialCode}%`);
      }
      
      if (searchParams.issueType) {
        query += ` AND esd.issue_type LIKE ?`;
        params.push(`%${searchParams.issueType}%`);
      }
      
      if (searchParams.supplier) {
        query += ` AND esd.supplier LIKE ?`;
        params.push(`%${searchParams.supplier}%`);
      }
      
      if (searchParams.dateFrom) {
        query += ` AND esd.occurrence_date >= ?`;
        params.push(searchParams.dateFrom);
      }
      
      if (searchParams.dateTo) {
        query += ` AND esd.occurrence_date <= ?`;
        params.push(searchParams.dateTo);
      }
      
      query += ` ORDER BY esd.created_at DESC LIMIT 100`;
      
      const [results] = await connection.execute(query, params);
      return results;
      
    } finally {
      await connection.end();
    }
  }
}
