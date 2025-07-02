/**
 * 重置数据库 - 使用优化的SQL设计
 */
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function resetDatabase() {
  console.log('🔄 开始重置数据库...');
  
  try {
    // 连接到MySQL
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Zxylsy.99'
    });
    
    console.log('✅ 连接到MySQL成功！');
    
    // 删除并重新创建数据库
    await connection.execute('DROP DATABASE IF EXISTS `iqe_inspection`');
    await connection.execute('CREATE DATABASE `iqe_inspection` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    await connection.execute('USE `iqe_inspection`');
    
    console.log('✅ 数据库重新创建成功！');
    
    // 读取并执行优化的SQL文件
    const sqlPath = path.join(__dirname, '..', 'db-schema-optimized.sql');
    const sqlContent = await fs.readFile(sqlPath, 'utf8');
    
    // 分割SQL语句并执行
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
        } catch (error) {
          if (!error.message.includes('Unknown database')) {
            console.log('执行SQL:', statement.substring(0, 100) + '...');
            console.error('SQL执行错误:', error.message);
          }
        }
      }
    }
    
    console.log('✅ 数据库架构创建完成！');
    
    // 检查创建的表
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📊 创建的表:', tables.map(t => Object.values(t)[0]));
    
    await connection.end();
    console.log('🎉 数据库重置完成！');
    
  } catch (error) {
    console.error('❌ 数据库重置失败:', error);
    process.exit(1);
  }
}

resetDatabase();
