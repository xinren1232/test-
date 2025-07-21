import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root', 
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function updateExampleQuery() {
  const connection = await mysql.createConnection(dbConfig);
  
  await connection.execute(`
    UPDATE nlp_intent_rules 
    SET example_query = '查询结构件类物料库存'
    WHERE intent_name = '物料大类查询'
  `);
  
  console.log('✅ 示例问题已更新为: 查询结构件类物料库存');
  await connection.end();
}

updateExampleQuery().catch(console.error);
