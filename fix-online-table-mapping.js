/**
 * 修复上线查询表映射问题
 * 将查询从production_tracking表改为online_tracking表
 */

const API_BASE_URL = 'http://localhost:3001';

async function fixOnlineTableMapping() {
  try {
    console.log('🔧 修复上线查询表映射问题...\n');
    
    // 1. 验证online_tracking表的数据和结构
    console.log('1️⃣ 验证online_tracking表的数据和结构...');
    await verifyOnlineTrackingTable();
    
    // 2. 修复所有上线查询规则，使用正确的表和字段
    console.log('\n2️⃣ 修复所有上线查询规则...');
    await fixOnlineQueryRules();
    
    // 3. 验证修复结果
    console.log('\n3️⃣ 验证修复结果...');
    await validateFixedOnlineRules();
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
  }
}

async function verifyOnlineTrackingTable() {
  try {
    // 检查online_tracking表结构
    const structureResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sql: `
          SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = 'iqe_inspection' AND TABLE_NAME = 'online_tracking'
          ORDER BY ORDINAL_POSITION
        `
      })
    });
    
    if (structureResponse.ok) {
      const structureResult = await structureResponse.json();
      const columns = structureResult.result;
      
      console.log('📊 online_tracking表结构:');
      columns.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (可空: ${col.IS_NULLABLE})`);
      });
      
      // 检查关键字段
      const keyFields = ['factory', 'baseline', 'project', 'batch_code', 'defect_rate', 'inspection_date'];
      const existingFields = keyFields.filter(field => 
        columns.some(col => col.COLUMN_NAME === field)
      );
      const missingFields = keyFields.filter(field => 
        !columns.some(col => col.COLUMN_NAME === field)
      );
      
      console.log(`\n✅ 存在的关键字段: ${existingFields.join(', ')}`);
      if (missingFields.length > 0) {
        console.log(`❌ 缺失的关键字段: ${missingFields.join(', ')}`);
      }
    }
    
    // 检查记录数
    const countResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sql: 'SELECT COUNT(*) as count FROM online_tracking'
      })
    });
    
    if (countResponse.ok) {
      const countResult = await countResponse.json();
      const recordCount = countResult.result[0].count;
      console.log(`\n📊 online_tracking表记录数: ${recordCount}`);
      
      if (recordCount === 1188) {
        console.log('✅ 记录数符合预期 (1188条)');
      } else {
        console.log(`⚠️  记录数与预期不符，预期1188条，实际${recordCount}条`);
      }
    }
    
    // 查看前3条数据示例
    const dataResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sql: 'SELECT * FROM online_tracking LIMIT 3'
      })
    });
    
    if (dataResponse.ok) {
      const dataResult = await dataResponse.json();
      const records = dataResult.result;
      
      console.log('\n📋 前3条记录示例:');
      records.forEach((record, index) => {
        console.log(`\n记录 ${index + 1}:`);
        console.log(`  factory: ${record.factory || '[NULL]'}`);
        console.log(`  baseline: ${record.baseline || '[NULL]'}`);
        console.log(`  project: ${record.project || '[NULL]'}`);
        console.log(`  material_code: ${record.material_code || '[NULL]'}`);
        console.log(`  material_name: ${record.material_name || '[NULL]'}`);
        console.log(`  supplier_name: ${record.supplier_name || '[NULL]'}`);
        console.log(`  batch_code: ${record.batch_code || '[NULL]'}`);
        console.log(`  defect_rate: ${record.defect_rate || '[NULL]'}`);
        console.log(`  inspection_date: ${record.inspection_date || '[NULL]'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 验证online_tracking表时出错:', error);
  }
}

async function fixOnlineQueryRules() {
  // 正确的online_tracking表SQL模板
  const correctOnlineSQL = `
SELECT 
  COALESCE(factory, '未知工厂') as 工厂,
  COALESCE(baseline, '') as 基线,
  COALESCE(project, '') as 项目,
  COALESCE(material_code, '') as 物料编码,
  COALESCE(material_name, '') as 物料名称,
  COALESCE(supplier_name, '') as 供应商,
  COALESCE(batch_code, '') as 批次号,
  COALESCE(CONCAT(ROUND(defect_rate * 100, 2), '%'), '0%') as 不良率,
  CASE 
    WHEN exception_count > 0 THEN '有异常'
    ELSE '无异常'
  END as 不良现象,
  DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking 
ORDER BY inspection_date DESC 
LIMIT 50`.trim();
  
  // 需要修复的上线规则
  const onlineRules = [
    { id: 661, name: '上线信息查询' },
    { id: 727, name: '结构件类上线查询', condition: "WHERE material_name LIKE '%结构%' OR material_name LIKE '%框架%' OR material_name LIKE '%外壳%' OR material_name LIKE '%支架%' OR material_name LIKE '%电池盖%' OR material_name LIKE '%中框%' OR material_name LIKE '%卡托%' OR material_name LIKE '%侧键%' OR material_name LIKE '%装饰件%'" },
    { id: 730, name: '光学类上线查询', condition: "WHERE material_name LIKE '%显示%' OR material_name LIKE '%屏%' OR material_name LIKE '%光学%' OR material_name LIKE '%镜头%' OR material_name LIKE '%LCD%' OR material_name LIKE '%OLED%' OR material_name LIKE '%摄像头%'" },
    { id: 733, name: '充电类上线查询', condition: "WHERE material_name LIKE '%充电%' OR material_name LIKE '%电池%' OR material_name LIKE '%电源%'" },
    { id: 736, name: '声学类上线查询', condition: "WHERE material_name LIKE '%扬声器%' OR material_name LIKE '%听筒%' OR material_name LIKE '%麦克风%' OR material_name LIKE '%音频%' OR material_name LIKE '%喇叭%'" },
    { id: 739, name: '包装类上线查询', condition: "WHERE material_name LIKE '%包装%' OR material_name LIKE '%保护套%' OR material_name LIKE '%标签%' OR material_name LIKE '%盒子%'" }
  ];
  
  let fixedCount = 0;
  
  for (const rule of onlineRules) {
    console.log(`修复规则: ${rule.name} (ID: ${rule.id})`);
    
    try {
      let finalSQL = correctOnlineSQL;
      
      // 添加过滤条件
      if (rule.condition) {
        finalSQL = finalSQL.replace(
          'FROM online_tracking',
          `FROM online_tracking\n${rule.condition}`
        );
        console.log(`  添加条件: ${rule.condition}`);
      }
      
      const response = await fetch(`${API_BASE_URL}/api/rules/${rule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_target: finalSQL
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log(`  ✅ 修复成功`);
          fixedCount++;
        } else {
          console.log(`  ❌ 修复失败: ${result.message}`);
        }
      } else {
        console.log(`  ❌ API请求失败: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`  ❌ 修复出错: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log(`🎉 上线规则修复完成！`);
  console.log(`✅ 成功修复: ${fixedCount} 条规则`);
}

async function validateFixedOnlineRules() {
  const testQueries = [
    '查询上线信息',
    '查询充电类上线',
    '查询光学类上线'
  ];
  
  for (const query of testQueries) {
    console.log(`\n测试查询: ${query}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/assistant/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.tableData) {
        const data = result.data.tableData;
        console.log(`  ✅ 查询成功，返回 ${data.length} 条记录`);
        
        if (data.length <= 50) {
          console.log(`  ✅ LIMIT限制生效`);
        }
        
        if (data.length > 0) {
          const firstRecord = data[0];
          
          console.log(`    工厂: ${firstRecord.工厂}`);
          console.log(`    基线: ${firstRecord.基线}`);
          console.log(`    项目: ${firstRecord.项目}`);
          console.log(`    物料编码: ${firstRecord.物料编码}`);
          console.log(`    物料名称: ${firstRecord.物料名称}`);
          console.log(`    供应商: ${firstRecord.供应商}`);
          console.log(`    批次号: ${firstRecord.批次号}`);
          console.log(`    不良率: ${firstRecord.不良率}`);
          console.log(`    不良现象: ${firstRecord.不良现象}`);
          console.log(`    检验日期: ${firstRecord.检验日期}`);
          
          // 检查数据完整性
          const hasCompleteData = firstRecord.工厂 && firstRecord.工厂 !== '未知工厂' &&
                                 firstRecord.基线 && firstRecord.项目 && 
                                 firstRecord.批次号 && firstRecord.不良率 !== '0%';
          
          if (hasCompleteData) {
            console.log(`  ✅ 数据完整，包含真实的工厂、基线、项目、批次等信息`);
          } else {
            console.log(`  ⚠️  数据可能不完整，某些字段为空或默认值`);
          }
        }
      } else {
        console.log(`  ❌ 查询失败`);
        if (result.message) {
          console.log(`    错误信息: ${result.message}`);
        }
      }
    } catch (error) {
      console.log(`  ❌ 查询出错: ${error.message}`);
    }
  }
  
  console.log('\n✅ 验证完成');
}

fixOnlineTableMapping();
