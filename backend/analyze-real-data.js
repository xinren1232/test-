/**
 * 分析真实数据并更新问答系统
 */
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function analyzeRealData() {
  console.log('🔍 分析真实数据...');
  
  const frontendDataPath = path.join(process.cwd(), '../ai-inspection-dashboard/src/data');
  
  try {
    // 1. 读取物料供应商映射数据
    console.log('📋 读取物料供应商映射数据...');
    const mappingPath = path.join(frontendDataPath, 'material_supplier_mapping.js');
    const mappingContent = fs.readFileSync(mappingPath, 'utf8');
    
    // 提取真实的物料名称和供应商
    const materialNames = [];
    const supplierNames = [];
    
    // 简单的正则提取（这里可以更精确）
    const nameMatches = mappingContent.match(/name:\s*"([^"]+)"/g);
    const supplierMatches = mappingContent.match(/suppliers:\s*\[([^\]]+)\]/g);
    
    if (nameMatches) {
      nameMatches.forEach(match => {
        const name = match.match(/name:\s*"([^"]+)"/)[1];
        if (!materialNames.includes(name)) {
          materialNames.push(name);
        }
      });
    }
    
    if (supplierMatches) {
      supplierMatches.forEach(match => {
        const suppliersStr = match.match(/suppliers:\s*\[([^\]]+)\]/)[1];
        const suppliers = suppliersStr.match(/"([^"]+)"/g);
        if (suppliers) {
          suppliers.forEach(supplier => {
            const name = supplier.replace(/"/g, '');
            if (!supplierNames.includes(name)) {
              supplierNames.push(name);
            }
          });
        }
      });
    }
    
    console.log('✅ 提取到的真实物料名称 (前20个):');
    console.log(materialNames.slice(0, 20));
    
    console.log('✅ 提取到的真实供应商名称 (前20个):');
    console.log(supplierNames.slice(0, 20));
    
    // 2. 读取JSON数据文件
    console.log('\n📄 读取JSON数据文件...');
    
    const jsonFiles = ['factory_data.json', 'lab_data.json', 'online_data.json'];
    const realData = {};
    
    for (const file of jsonFiles) {
      const filePath = path.join(frontendDataPath, file);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const data = JSON.parse(content);
          realData[file.replace('.json', '')] = data;
          console.log(`✅ ${file}: ${data.length} 条记录`);
          
          // 显示前2条数据的结构
          if (data.length > 0) {
            console.log(`   示例数据结构:`, Object.keys(data[0]));
            console.log(`   前2条数据:`, data.slice(0, 2));
          }
        } catch (e) {
          console.log(`❌ ${file}: 解析失败 - ${e.message}`);
        }
      } else {
        console.log(`⚠️ ${file}: 文件不存在`);
      }
    }
    
    // 3. 基于真实数据更新数据库
    console.log('\n🔄 基于真实数据更新数据库...');
    
    const connection = await mysql.createConnection(dbConfig);
    
    // 清空现有数据
    await connection.query('DELETE FROM inventory');
    await connection.query('DELETE FROM lab_tests');
    await connection.query('DELETE FROM online_tracking');
    
    // 同步真实数据到数据库
    if (realData.factory_data && realData.factory_data.length > 0) {
      console.log('📦 同步工厂数据到库存表...');
      
      for (const item of realData.factory_data.slice(0, 50)) { // 限制50条避免太多
        await connection.query(`
          INSERT INTO inventory (
            id, batch_code, material_code, material_name, material_type,
            supplier_name, quantity, inbound_time, storage_location,
            status, risk_level, inspector, notes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          item.id || `INV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          item.batch_number || item.batchCode || `BATCH${Math.floor(Math.random() * 900000) + 100000}`,
          item.id || item.materialCode || `MAT_${item.id}`,
          item.name || item.materialName || '未知物料',
          item.category || item.materialType || '电子元件',
          item.supplier || item.supplierName || '未知供应商',
          item.quantity || Math.floor(Math.random() * 10000) + 1000,
          item.arrival_date || item.inspectionDate || '2025-06-27',
          item.factory || item.storageLocation || '深圳工厂',
          item.inspection_level === '正常' ? '正常' : (item.status || '正常'),
          item.defect_rate > 1.5 ? 'high' : (item.defect_rate > 0.5 ? 'medium' : 'low'),
          '系统管理员',
          item.notes || `不良率: ${item.defect_rate || 0}%`
        ]);
      }
      
      console.log(`✅ 同步了 ${Math.min(realData.factory_data.length, 50)} 条库存数据`);
    }
    
    if (realData.lab_data && realData.lab_data.length > 0) {
      console.log('🧪 同步实验室数据...');
      
      for (const item of realData.lab_data.slice(0, 30)) {
        await connection.query(`
          INSERT INTO lab_tests (
            id, test_id, batch_code, material_code, material_name,
            supplier_name, test_date, test_item, test_result,
            conclusion, defect_desc, tester, reviewer, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          item.id || `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          item.test_id || item.testId || `TEST_${Math.random().toString(36).substr(2, 9)}`,
          item.batch_number || item.batchCode || `BATCH${Math.floor(Math.random() * 900000) + 100000}`,
          item.material_id || item.materialCode || `MAT_${item.id}`,
          item.material_name || item.materialName || '未知物料',
          item.supplier || item.supplierName || '未知供应商',
          item.test_date || item.testDate || '2025-06-27',
          item.test_type || item.testItem || '常规测试',
          item.result || item.testResult || 'PASS',
          item.result === 'PASS' || item.testResult === 'OK' ? '合格' : '不合格',
          item.defect_description || item.defectDesc || null,
          '测试员',
          '审核员'
        ]);
      }
      
      console.log(`✅ 同步了 ${Math.min(realData.lab_data.length, 30)} 条测试数据`);
    }
    
    if (realData.online_data && realData.online_data.length > 0) {
      console.log('🏭 同步上线数据...');
      
      for (const item of realData.online_data.slice(0, 30)) {
        await connection.query(`
          INSERT INTO online_tracking (
            id, batch_code, material_code, material_name, supplier_name,
            online_date, use_time, factory, workshop, line, project,
            defect_rate, exception_count, operator, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          item.id || `ONLINE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          item.batch_number || item.batchCode || `BATCH${Math.floor(Math.random() * 900000) + 100000}`,
          item.material_id || item.materialCode || `MAT_${item.id}`,
          item.material_name || item.materialName || '未知物料',
          item.supplier || item.supplierName || '未知供应商',
          item.production_date || item.useTime || '2025-06-27',
          item.production_date || item.useTime || '2025-06-27',
          item.factory || '深圳工厂',
          item.workshop || item.baselineId || '车间A',
          item.line || item.projectId || '产线1',
          item.project || item.projectId || 'PROJECT_001',
          (item.defect_rate || Math.random() * 2) / 100,
          item.defect_count || Math.floor(Math.random() * 5),
          '操作员'
        ]);
      }
      
      console.log(`✅ 同步了 ${Math.min(realData.online_data.length, 30)} 条上线数据`);
    }
    
    // 4. 基于真实数据更新NLP规则
    console.log('\n🔧 基于真实数据更新NLP规则...');
    
    // 更新物料名称和供应商的提取模式
    const materialPatterns = materialNames.slice(0, 20).map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const supplierPatterns = supplierNames.slice(0, 20).map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    
    await connection.query(`
      UPDATE nlp_intent_rules 
      SET parameters = ?
      WHERE intent_name = '查询库存,库存查询,查库存,库存情况,物料库存'
    `, [JSON.stringify([
      {
        name: 'search_term',
        type: 'string',
        description: '搜索关键词（物料编码、物料名称或批次号）',
        extract_patterns: [
          ...materialPatterns.slice(0, 10),
          ...supplierPatterns.slice(0, 10),
          'BATCH\\d+',
          'MAT_\\w+',
          '\\d{6}'
        ]
      }
    ])]);
    
    await connection.end();
    
    console.log('🎉 真实数据分析和同步完成！');
    console.log('\n📊 数据统计:');
    console.log(`- 物料名称: ${materialNames.length} 种`);
    console.log(`- 供应商: ${supplierNames.length} 家`);
    console.log(`- 工厂数据: ${realData.factory_data?.length || 0} 条`);
    console.log(`- 实验室数据: ${realData.lab_data?.length || 0} 条`);
    console.log(`- 上线数据: ${realData.online_data?.length || 0} 条`);
    
  } catch (error) {
    console.error('❌ 分析失败:', error);
  }
}

analyzeRealData();
