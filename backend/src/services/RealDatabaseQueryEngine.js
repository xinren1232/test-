/**
 * 真实数据库查询引擎
 * 直接从MySQL数据库执行SQL查询，替代虚拟SQL引擎
 */

import mysql from 'mysql2/promise';
import { logger } from '../utils/logger.js';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

/**
 * 执行真实数据库查询
 * @param {string} sql - SQL查询语句
 * @param {Object} params - 查询参数
 * @returns {Array} 查询结果
 */
export async function executeRealDatabaseQuery(sql, params = {}) {
  let connection;
  
  try {
    logger.info('🗃️ 执行真实数据库查询:', sql.substring(0, 200) + '...');
    
    connection = await mysql.createConnection(dbConfig);
    
    // 处理参数替换
    let processedSQL = sql;
    if (params && Object.keys(params).length > 0) {
      // 替换命名参数
      Object.entries(params).forEach(([key, value]) => {
        const placeholder = `:${key}`;
        if (processedSQL.includes(placeholder)) {
          processedSQL = processedSQL.replace(new RegExp(placeholder, 'g'), `'${value}'`);
        }
      });
      
      // 替换问号占位符
      const paramValues = Object.values(params);
      let paramIndex = 0;
      processedSQL = processedSQL.replace(/\?/g, () => {
        if (paramIndex < paramValues.length) {
          return `'${paramValues[paramIndex++]}'`;
        }
        return '?';
      });
    }
    
    logger.debug('🔍 处理后的SQL:', processedSQL);
    
    // 执行查询
    const [results] = await connection.execute(processedSQL);
    
    logger.info(`✅ 数据库查询成功，返回 ${results.length} 条记录`);
    
    // 记录查询结果的字段信息
    if (results.length > 0) {
      const fields = Object.keys(results[0]);
      const hasChineseFields = fields.some(field => /[\u4e00-\u9fa5]/.test(field));
      logger.debug(`📋 返回字段: ${fields.join(', ')}`);
      logger.debug(`🈳 包含中文字段: ${hasChineseFields ? '是' : '否'}`);
      
      // 检查是否有Function not supported错误
      const hasErrors = results.some(record => 
        Object.values(record).some(value => 
          typeof value === 'string' && value.includes('Function not supported')
        )
      );
      
      if (hasErrors) {
        logger.warn('⚠️ 查询结果中包含Function not supported错误');
      }
    }
    
    return results;
    
  } catch (error) {
    logger.error('❌ 数据库查询失败:', error.message);
    throw new Error(`数据库查询失败: ${error.message}`);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * 测试数据库连接
 * @returns {boolean} 连接是否成功
 */
export async function testDatabaseConnection() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.execute('SELECT 1');
    logger.info('✅ 数据库连接测试成功');
    return true;
  } catch (error) {
    logger.error('❌ 数据库连接测试失败:', error.message);
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * 获取数据库表信息
 * @returns {Object} 表信息
 */
export async function getDatabaseTableInfo() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // 获取所有表
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME, TABLE_ROWS 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'iqe_inspection'
    `);
    
    const tableInfo = {};
    
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      
      // 获取表字段信息
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = 'iqe_inspection' AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
      `, [tableName]);
      
      tableInfo[tableName] = {
        rowCount: table.TABLE_ROWS,
        columns: columns.map(col => ({
          name: col.COLUMN_NAME,
          type: col.DATA_TYPE,
          nullable: col.IS_NULLABLE === 'YES',
          default: col.COLUMN_DEFAULT
        }))
      };
    }
    
    logger.info('📊 数据库表信息获取成功');
    return tableInfo;
    
  } catch (error) {
    logger.error('❌ 获取数据库表信息失败:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * 验证SQL语句语法
 * @param {string} sql - SQL语句
 * @returns {Object} 验证结果
 */
export async function validateSQL(sql) {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // 使用EXPLAIN来验证SQL语法
    const explainSQL = `EXPLAIN ${sql}`;
    await connection.execute(explainSQL);
    
    return { valid: true, message: 'SQL语法正确' };
    
  } catch (error) {
    return { 
      valid: false, 
      message: `SQL语法错误: ${error.message}` 
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * 获取数据库统计信息
 * @returns {Object} 统计信息
 */
export async function getDatabaseStats() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const stats = {};
    
    // 获取各表的记录数
    const tables = ['inventory', 'online_tracking', 'lab_tests', 'nlp_intent_rules'];
    
    for (const table of tables) {
      try {
        const [result] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        stats[table] = result[0].count;
      } catch (error) {
        stats[table] = 0;
      }
    }
    
    logger.info('📈 数据库统计信息获取成功:', stats);
    return stats;
    
  } catch (error) {
    logger.error('❌ 获取数据库统计信息失败:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export default {
  executeRealDatabaseQuery,
  testDatabaseConnection,
  getDatabaseTableInfo,
  validateSQL,
  getDatabaseStats
};
