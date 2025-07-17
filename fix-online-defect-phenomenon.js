/**
 * 修复上线场景的不良现象显示问题
 * 根据不良率和异常数据显示具体的不良现象
 */

const API_BASE_URL = 'http://localhost:3001';

async function fixOnlineDefectPhenomenon() {
  try {
    console.log('🔧 修复上线场景的不良现象显示问题...\n');
    
    // 1. 分析online_tracking表的异常相关字段
    console.log('1️⃣ 分析online_tracking表的异常相关字段...');
    await analyzeOnlineTrackingDefectData();
    
    // 2. 检查不良率分布和异常模式
    console.log('\n2️⃣ 检查不良率分布和异常模式...');
    await analyzeDefectRatePatterns();
    
    // 3. 生成改进的不良现象逻辑
    console.log('\n3️⃣ 生成改进的不良现象逻辑...');
    await generateImprovedDefectLogic();
    
    // 4. 更新上线规则并验证
    console.log('\n4️⃣ 更新上线规则并验证...');
    await updateAndValidateOnlineRules();
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
  }
}

async function analyzeOnlineTrackingDefectData() {
  try {
    // 检查online_tracking表的异常相关字段
    const structureResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sql: `
          SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = 'iqe_inspection' AND TABLE_NAME = 'online_tracking'
          AND (COLUMN_NAME LIKE '%defect%' OR COLUMN_NAME LIKE '%exception%' OR 
               COLUMN_NAME LIKE '%anomaly%' OR COLUMN_NAME LIKE '%weekly%')
          ORDER BY ORDINAL_POSITION
        `
      })
    });
    
    if (structureResponse.ok) {
      const structureResult = await structureResponse.json();
      const columns = structureResult.result;
      
      console.log('📊 online_tracking表异常相关字段:');
      columns.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (可空: ${col.IS_NULLABLE})`);
      });
    }
    
    // 检查异常字段的数据分布
    const dataResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sql: `
          SELECT 
            COUNT(*) as total_records,
            COUNT(CASE WHEN defect_rate > 0 THEN 1 END) as has_defect_rate,
            COUNT(CASE WHEN exception_count > 0 THEN 1 END) as has_exception_count,
            COUNT(CASE WHEN weekly_anomaly IS NOT NULL AND weekly_anomaly != '' THEN 1 END) as has_weekly_anomaly,
            AVG(defect_rate) as avg_defect_rate,
            MAX(defect_rate) as max_defect_rate,
            AVG(exception_count) as avg_exception_count,
            MAX(exception_count) as max_exception_count
          FROM online_tracking
        `
      })
    });
    
    if (dataResponse.ok) {
      const dataResult = await dataResponse.json();
      const stats = dataResult.result[0];
      
      console.log('\n📊 异常数据统计:');
      console.log(`  总记录数: ${stats.total_records}`);
      console.log(`  有不良率的记录: ${stats.has_defect_rate}/${stats.total_records} (${Math.round(stats.has_defect_rate/stats.total_records*100)}%)`);
      console.log(`  有异常计数的记录: ${stats.has_exception_count}/${stats.total_records} (${Math.round(stats.has_exception_count/stats.total_records*100)}%)`);
      console.log(`  有周异常的记录: ${stats.has_weekly_anomaly}/${stats.total_records} (${Math.round(stats.has_weekly_anomaly/stats.total_records*100)}%)`);
      console.log(`  平均不良率: ${(stats.avg_defect_rate * 100).toFixed(2)}%`);
      console.log(`  最大不良率: ${(stats.max_defect_rate * 100).toFixed(2)}%`);
      console.log(`  平均异常计数: ${stats.avg_exception_count}`);
      console.log(`  最大异常计数: ${stats.max_exception_count}`);
    }
    
    // 查看有不良率的记录示例
    const sampleResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sql: `
          SELECT material_name, supplier_name, defect_rate, exception_count, weekly_anomaly
          FROM online_tracking 
          WHERE defect_rate > 0
          ORDER BY defect_rate DESC
          LIMIT 10
        `
      })
    });
    
    if (sampleResponse.ok) {
      const sampleResult = await sampleResponse.json();
      console.log('\n📋 有不良率的记录示例 (前10条):');
      sampleResult.result.forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.material_name} (${record.supplier_name})`);
        console.log(`     不良率: ${(record.defect_rate * 100).toFixed(2)}%`);
        console.log(`     异常计数: ${record.exception_count}`);
        console.log(`     周异常: ${record.weekly_anomaly || '[NULL]'}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ 分析异常数据时出错:', error);
  }
}

async function analyzeDefectRatePatterns() {
  try {
    // 分析不良率分布
    const rateDistributionResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sql: `
          SELECT 
            CASE 
              WHEN defect_rate = 0 THEN '0%'
              WHEN defect_rate <= 0.01 THEN '0-1%'
              WHEN defect_rate <= 0.03 THEN '1-3%'
              WHEN defect_rate <= 0.05 THEN '3-5%'
              ELSE '>5%'
            END as rate_range,
            COUNT(*) as count
          FROM online_tracking
          GROUP BY 
            CASE 
              WHEN defect_rate = 0 THEN '0%'
              WHEN defect_rate <= 0.01 THEN '0-1%'
              WHEN defect_rate <= 0.03 THEN '1-3%'
              WHEN defect_rate <= 0.05 THEN '3-5%'
              ELSE '>5%'
            END
          ORDER BY count DESC
        `
      })
    });
    
    if (rateDistributionResponse.ok) {
      const rateResult = await rateDistributionResponse.json();
      console.log('📊 不良率分布:');
      rateResult.result.forEach(row => {
        console.log(`  ${row.rate_range}: ${row.count}条记录`);
      });
    }
    
    // 分析物料类型与不良率的关系
    const materialDefectResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sql: `
          SELECT 
            material_name,
            COUNT(*) as total_count,
            COUNT(CASE WHEN defect_rate > 0 THEN 1 END) as defect_count,
            AVG(defect_rate) as avg_defect_rate,
            MAX(defect_rate) as max_defect_rate
          FROM online_tracking
          WHERE material_name IS NOT NULL
          GROUP BY material_name
          HAVING COUNT(*) > 10
          ORDER BY avg_defect_rate DESC
          LIMIT 10
        `
      })
    });
    
    if (materialDefectResponse.ok) {
      const materialResult = await materialDefectResponse.json();
      console.log('\n📊 物料类型不良率分析 (前10):');
      materialResult.result.forEach(row => {
        const defectPercentage = Math.round(row.defect_count / row.total_count * 100);
        console.log(`  ${row.material_name}:`);
        console.log(`    总数: ${row.total_count}, 有缺陷: ${row.defect_count} (${defectPercentage}%)`);
        console.log(`    平均不良率: ${(row.avg_defect_rate * 100).toFixed(2)}%`);
        console.log(`    最大不良率: ${(row.max_defect_rate * 100).toFixed(2)}%`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ 分析不良率模式时出错:', error);
  }
}

async function generateImprovedDefectLogic() {
  console.log('🔧 生成改进的不良现象逻辑...');

  // 使用真实的weekly_anomaly字段作为不良现象
  const improvedDefectLogic = `
CASE
  WHEN defect_rate = 0 THEN '无异常'
  WHEN defect_rate > 0 AND weekly_anomaly IS NOT NULL AND weekly_anomaly != '' THEN weekly_anomaly
  ELSE '未知异常'
END as 不良现象`;

  console.log('\n🔧 改进的不良现象逻辑:');
  console.log(improvedDefectLogic);

  console.log('\n💡 改进要点:');
  console.log('1. 不良率为0时显示"无异常"');
  console.log('2. 不良率>0时直接使用weekly_anomaly字段的真实缺陷描述');
  console.log('3. 显示真实的业务缺陷现象，如"划伤"、"色差"、"尺寸偏差"等');
  console.log('4. 保持数据的真实性和业务意义');

  return improvedDefectLogic;
}

async function updateAndValidateOnlineRules() {
  const improvedDefectLogic = await generateImprovedDefectLogic();
  
  // 完整的改进上线SQL模板
  const improvedOnlineSQL = `
SELECT 
  COALESCE(factory, '未知工厂') as 工厂,
  COALESCE(baseline, '') as 基线,
  COALESCE(project, '') as 项目,
  COALESCE(material_code, '') as 物料编码,
  COALESCE(material_name, '') as 物料名称,
  COALESCE(supplier_name, '') as 供应商,
  COALESCE(batch_code, '') as 批次号,
  COALESCE(CONCAT(ROUND(defect_rate * 100, 2), '%'), '0%') as 不良率,
  ${improvedDefectLogic},
  DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking 
ORDER BY inspection_date DESC 
LIMIT 50`.trim();
  
  console.log('🔧 更新上线规则...');
  
  // 上线规则ID列表
  const onlineRuleIds = [661, 727, 730, 733, 736, 739];
  
  let updatedCount = 0;
  
  for (const ruleId of onlineRuleIds) {
    try {
      let finalSQL = improvedOnlineSQL;
      
      // 为不同类别添加过滤条件
      if (ruleId === 727) { // 结构件类
        finalSQL = finalSQL.replace(
          'FROM online_tracking',
          `FROM online_tracking\nWHERE material_name LIKE '%结构%' OR material_name LIKE '%框架%' OR material_name LIKE '%外壳%' OR material_name LIKE '%支架%' OR material_name LIKE '%电池盖%' OR material_name LIKE '%中框%' OR material_name LIKE '%卡托%' OR material_name LIKE '%侧键%' OR material_name LIKE '%装饰件%'`
        );
      } else if (ruleId === 730) { // 光学类
        finalSQL = finalSQL.replace(
          'FROM online_tracking',
          `FROM online_tracking\nWHERE material_name LIKE '%显示%' OR material_name LIKE '%屏%' OR material_name LIKE '%光学%' OR material_name LIKE '%镜头%' OR material_name LIKE '%LCD%' OR material_name LIKE '%OLED%' OR material_name LIKE '%摄像头%'`
        );
      } else if (ruleId === 733) { // 充电类
        finalSQL = finalSQL.replace(
          'FROM online_tracking',
          `FROM online_tracking\nWHERE material_name LIKE '%充电%' OR material_name LIKE '%电池%' OR material_name LIKE '%电源%'`
        );
      } else if (ruleId === 736) { // 声学类
        finalSQL = finalSQL.replace(
          'FROM online_tracking',
          `FROM online_tracking\nWHERE material_name LIKE '%扬声器%' OR material_name LIKE '%听筒%' OR material_name LIKE '%麦克风%' OR material_name LIKE '%音频%' OR material_name LIKE '%喇叭%'`
        );
      } else if (ruleId === 739) { // 包装类
        finalSQL = finalSQL.replace(
          'FROM online_tracking',
          `FROM online_tracking\nWHERE material_name LIKE '%包装%' OR material_name LIKE '%保护套%' OR material_name LIKE '%标签%' OR material_name LIKE '%盒子%'`
        );
      }
      
      const response = await fetch(`${API_BASE_URL}/api/rules/${ruleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_target: finalSQL
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log(`  ✅ 更新规则 ${ruleId} 成功`);
          updatedCount++;
        } else {
          console.log(`  ❌ 更新规则 ${ruleId} 失败: ${result.message}`);
        }
      }
    } catch (error) {
      console.log(`  ❌ 更新规则 ${ruleId} 出错: ${error.message}`);
    }
  }
  
  console.log(`\n✅ 更新完成，成功更新 ${updatedCount} 条规则`);
  
  // 验证更新结果
  if (updatedCount > 0) {
    console.log('\n🔍 验证更新结果...');
    await validateImprovedOnlineRules();
  }
}

async function validateImprovedOnlineRules() {
  const testQueries = ['查询上线信息', '查询光学类上线'];
  
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
        
        if (data.length > 0) {
          console.log(`  📋 不良现象检查:`);
          
          // 检查前5条记录的不良现象
          data.slice(0, 5).forEach((record, index) => {
            const defectRate = record.不良率;
            const defectPhenomenon = record.不良现象;
            const materialName = record.物料名称;
            
            console.log(`    记录 ${index + 1}: ${materialName}`);
            console.log(`      不良率: ${defectRate}`);
            console.log(`      不良现象: ${defectPhenomenon}`);
            
            // 验证不良现象是否合理
            if (defectRate === '0.00%' && defectPhenomenon === '无异常') {
              console.log(`      ✅ 无缺陷记录正确`);
            } else if (defectRate !== '0.00%' && defectPhenomenon !== '无异常') {
              console.log(`      ✅ 有缺陷记录显示具体现象`);
            } else {
              console.log(`      ⚠️  不良现象可能不匹配`);
            }
            console.log('');
          });
          
          // 统计不良现象分布
          const phenomenonCounts = {};
          data.forEach(record => {
            const phenomenon = record.不良现象;
            phenomenonCounts[phenomenon] = (phenomenonCounts[phenomenon] || 0) + 1;
          });
          
          console.log(`  📊 不良现象分布:`);
          Object.entries(phenomenonCounts).forEach(([phenomenon, count]) => {
            console.log(`    ${phenomenon}: ${count}条`);
          });
        }
      } else {
        console.log(`  ❌ 查询失败: ${result.message || '未知错误'}`);
      }
    } catch (error) {
      console.log(`  ❌ 查询出错: ${error.message}`);
    }
  }
}

fixOnlineDefectPhenomenon();
