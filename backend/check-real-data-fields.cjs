// 检查真实数据的字段结构
const mysql = require('mysql2/promise');

async function checkRealDataFields() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('🔍 检查真实数据的字段结构...\n');
    
    // 获取最新的真实数据
    const [syncData] = await connection.execute(`
      SELECT data_type, data_content 
      FROM frontend_data_sync 
      WHERE created_at = (SELECT MAX(created_at) FROM frontend_data_sync)
      ORDER BY data_type
    `);
    
    for (const row of syncData) {
      console.log(`📋 ${row.data_type.toUpperCase()}数据字段结构:`);
      console.log('='.repeat(50));
      
      const data = JSON.parse(row.data_content);
      
      if (data.length > 0) {
        const firstRecord = data[0];
        console.log('🔍 第一条记录的所有字段:');
        Object.keys(firstRecord).forEach(key => {
          const value = firstRecord[key];
          const type = typeof value;
          console.log(`  ${key}: ${value} (${type})`);
        });
        
        console.log('\n📊 字段统计:');
        console.log(`  总记录数: ${data.length}`);
        console.log(`  字段数量: ${Object.keys(firstRecord).length}`);
        
        // 检查关键字段的值分布
        if (row.data_type === 'inventory') {
          console.log('\n🏭 供应商分布:');
          const suppliers = [...new Set(data.map(item => item.supplier).filter(Boolean))];
          suppliers.slice(0, 10).forEach(supplier => {
            const count = data.filter(item => item.supplier === supplier).length;
            console.log(`    ${supplier}: ${count}条`);
          });
          
          console.log('\n📦 物料分布:');
          const materials = [...new Set(data.map(item => item.materialName).filter(Boolean))];
          materials.slice(0, 10).forEach(material => {
            const count = data.filter(item => item.materialName === material).length;
            console.log(`    ${material}: ${count}条`);
          });
          
          console.log('\n🏢 工厂分布:');
          const factories = [...new Set(data.map(item => item.factory).filter(Boolean))];
          factories.forEach(factory => {
            const count = data.filter(item => item.factory === factory).length;
            console.log(`    ${factory}: ${count}条`);
          });
          
          console.log('\n📊 状态分布:');
          const statuses = [...new Set(data.map(item => item.status).filter(Boolean))];
          statuses.forEach(status => {
            const count = data.filter(item => item.status === status).length;
            console.log(`    ${status}: ${count}条`);
          });
        }
        
        if (row.data_type === 'inspection') {
          console.log('\n🔬 测试结果分布:');
          const results = [...new Set(data.map(item => item.testResult).filter(Boolean))];
          results.forEach(result => {
            const count = data.filter(item => item.testResult === result).length;
            console.log(`    ${result}: ${count}条`);
          });
          
          console.log('\n🏭 供应商分布:');
          const suppliers = [...new Set(data.map(item => item.supplier).filter(Boolean))];
          suppliers.slice(0, 10).forEach(supplier => {
            const count = data.filter(item => item.supplier === supplier).length;
            console.log(`    ${supplier}: ${count}条`);
          });
        }
        
        if (row.data_type === 'production') {
          console.log('\n🏭 工厂分布:');
          const factories = [...new Set(data.map(item => item.factory).filter(Boolean))];
          factories.forEach(factory => {
            const count = data.filter(item => item.factory === factory).length;
            console.log(`    ${factory}: ${count}条`);
          });
          
          console.log('\n📊 项目分布:');
          const projects = [...new Set(data.map(item => item.projectId).filter(Boolean))];
          projects.slice(0, 10).forEach(project => {
            const count = data.filter(item => item.projectId === project).length;
            console.log(`    ${project}: ${count}条`);
          });
          
          console.log('\n⚠️ 缺陷率统计:');
          const defectRates = data.map(item => item.defectRate).filter(rate => rate !== undefined && rate !== null);
          if (defectRates.length > 0) {
            const avgDefectRate = defectRates.reduce((sum, rate) => sum + rate, 0) / defectRates.length;
            const maxDefectRate = Math.max(...defectRates);
            const minDefectRate = Math.min(...defectRates);
            console.log(`    平均缺陷率: ${(avgDefectRate * 100).toFixed(2)}%`);
            console.log(`    最高缺陷率: ${(maxDefectRate * 100).toFixed(2)}%`);
            console.log(`    最低缺陷率: ${(minDefectRate * 100).toFixed(2)}%`);
          }
        }
        
        console.log('\n📝 样本记录 (前3条):');
        data.slice(0, 3).forEach((record, index) => {
          console.log(`\n  记录 ${index + 1}:`);
          Object.keys(record).forEach(key => {
            console.log(`    ${key}: ${record[key]}`);
          });
        });
      }
      
      console.log('\n' + '='.repeat(80) + '\n');
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await connection.end();
  }
}

checkRealDataFields();
