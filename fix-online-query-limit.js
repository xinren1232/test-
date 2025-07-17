/**
 * 修复上线查询的LIMIT限制和表名问题
 */

const API_BASE_URL = 'http://localhost:3001';

async function fixOnlineQueryLimit() {
  try {
    console.log('🔧 修复上线查询的LIMIT限制和表名问题...\n');
    
    // 1. 检查表名问题
    console.log('1️⃣ 检查表名问题...');
    await checkTableNames();
    
    // 2. 修复上线查询规则，添加LIMIT限制
    console.log('\n2️⃣ 修复上线查询规则，添加LIMIT限制...');
    await fixOnlineRulesWithLimit();
    
    // 3. 验证修复结果
    console.log('\n3️⃣ 验证修复结果...');
    await validateFixedRules();
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
  }
}

async function checkTableNames() {
  try {
    // 检查online_tracking表是否存在
    const onlineResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sql: 'SELECT COUNT(*) as count FROM online_tracking'
      })
    });
    
    // 检查production_tracking表是否存在
    const productionResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sql: 'SELECT COUNT(*) as count FROM production_tracking'
      })
    });
    
    if (onlineResponse.ok) {
      const onlineResult = await onlineResponse.json();
      const onlineCount = onlineResult.result[0].count;
      console.log(`online_tracking表记录数: ${onlineCount}`);
    } else {
      console.log('online_tracking表不存在或查询失败');
    }
    
    if (productionResponse.ok) {
      const productionResult = await productionResponse.json();
      const productionCount = productionResult.result[0].count;
      console.log(`production_tracking表记录数: ${productionCount}`);
    } else {
      console.log('production_tracking表不存在或查询失败');
    }
  } catch (error) {
    console.error('❌ 检查表名时出错:', error);
  }
}

async function fixOnlineRulesWithLimit() {
  try {
    // 正确的上线查询SQL模板（使用production_tracking表，添加LIMIT）
    const correctOnlineSQL = `
SELECT
  COALESCE(factory, '未知工厂') as 工厂,
  COALESCE(baseline_id, '') as 基线,
  COALESCE(project_id, '') as 项目,
  COALESCE(material_code, '无编码') as 物料编码,
  COALESCE(material_name, '未知物料') as 物料名称,
  COALESCE(supplier_name, '未知供应商') as 供应商,
  COALESCE(batch_code, '无批次') as 批次号,
  COALESCE(CONCAT(ROUND(defect_rate * 100, 2), '%'), '0%') as 不良率,
  COALESCE(defect_phenomenon, '') as 不良现象,
  DATE_FORMAT(inspection_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM production_tracking
ORDER BY inspection_date DESC
LIMIT 50`.trim();
    
    // 需要修复的上线规则ID列表（没有LIMIT的规则）
    const onlineRuleIds = [661, 727, 730, 733, 736, 739]; // 上线信息查询和各类别查询
    
    let fixedCount = 0;
    
    for (const ruleId of onlineRuleIds) {
      try {
        let finalSQL = correctOnlineSQL;
        
        // 为特定类别添加过滤条件
        if (ruleId === 727) { // 结构件类
          finalSQL = correctOnlineSQL.replace(
            'FROM production_tracking',
            `FROM production_tracking
WHERE material_name LIKE '%结构%' OR material_name LIKE '%框架%' OR material_name LIKE '%外壳%' OR material_name LIKE '%支架%' OR material_name LIKE '%电池盖%' OR material_name LIKE '%中框%' OR material_name LIKE '%卡托%' OR material_name LIKE '%侧键%' OR material_name LIKE '%装饰件%'`
          );
        } else if (ruleId === 730) { // 光学类
          finalSQL = correctOnlineSQL.replace(
            'FROM production_tracking',
            `FROM production_tracking
WHERE material_name LIKE '%显示%' OR material_name LIKE '%屏%' OR material_name LIKE '%光学%' OR material_name LIKE '%镜头%' OR material_name LIKE '%LCD%' OR material_name LIKE '%OLED%' OR material_name LIKE '%摄像头%'`
          );
        } else if (ruleId === 733) { // 充电类
          finalSQL = correctOnlineSQL.replace(
            'FROM production_tracking',
            `FROM production_tracking
WHERE material_name LIKE '%充电%' OR material_name LIKE '%电池%' OR material_name LIKE '%电源%'`
          );
        } else if (ruleId === 736) { // 声学类
          finalSQL = correctOnlineSQL.replace(
            'FROM production_tracking',
            `FROM production_tracking
WHERE material_name LIKE '%扬声器%' OR material_name LIKE '%听筒%' OR material_name LIKE '%麦克风%' OR material_name LIKE '%音频%' OR material_name LIKE '%喇叭%'`
          );
        } else if (ruleId === 739) { // 包装类
          finalSQL = correctOnlineSQL.replace(
            'FROM production_tracking',
            `FROM production_tracking
WHERE material_name LIKE '%包装%' OR material_name LIKE '%保护套%' OR material_name LIKE '%标签%' OR material_name LIKE '%盒子%'`
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
            console.log(`✅ 修复规则 ${ruleId} 成功`);
            fixedCount++;
          } else {
            console.log(`❌ 修复规则 ${ruleId} 失败: ${result.message}`);
          }
        } else {
          console.log(`❌ 修复规则 ${ruleId} 请求失败: ${response.status}`);
        }
        
      } catch (error) {
        console.log(`❌ 修复规则 ${ruleId} 出错: ${error.message}`);
      }
    }
    
    console.log(`\n✅ 修复完成，成功修复 ${fixedCount} 条规则`);
    
  } catch (error) {
    console.error('❌ 修复规则时出错:', error);
  }
}

async function validateFixedRules() {
  try {
    // 测试上线信息查询
    const response = await fetch(`${API_BASE_URL}/api/assistant/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '查询上线信息' })
    });
    
    const result = await response.json();
    
    if (result.success && result.data && result.data.tableData) {
      const data = result.data.tableData;
      console.log(`✅ 上线信息查询成功，返回 ${data.length} 条记录`);
      
      if (data.length <= 50) {
        console.log('✅ LIMIT限制生效，记录数合理');
      } else {
        console.log(`⚠️  记录数仍然过多: ${data.length} 条`);
      }
      
      if (data.length > 0) {
        console.log('\n前3条记录验证:');
        data.slice(0, 3).forEach((record, index) => {
          console.log(`记录 ${index + 1}:`);
          console.log(`  工厂: ${record.工厂}`);
          console.log(`  物料名称: ${record.物料名称}`);
          console.log(`  供应商: ${record.供应商}`);
          console.log(`  批次号: ${record.批次号}`);
          console.log(`  不良率: ${record.不良率}`);
          console.log(`  检验日期: ${record.检验日期}`);
        });
        
        // 检查数据是否来自正确的表
        const hasValidData = data.some(record => 
          record.物料编码 && record.物料编码.includes('-') && 
          record.物料名称 && record.供应商
        );
        
        if (hasValidData) {
          console.log('\n✅ 数据来源正确，包含真实的物料编码和信息');
        } else {
          console.log('\n⚠️  数据可能不是来自正确的表');
        }
      }
    } else {
      console.log('❌ 上线信息查询失败');
      if (result.message) {
        console.log(`错误信息: ${result.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ 验证时出错:', error);
  }
}

fixOnlineQueryLimit();
