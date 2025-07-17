/**
 * 使用正确的production_tracking表字段修复上线规则
 */

const API_BASE_URL = 'http://localhost:3001';

async function fixProductionTrackingRules() {
  try {
    console.log('🔧 使用正确的production_tracking表字段修复上线规则...\n');
    
    // 根据实际字段生成的正确SQL模板
    const correctProductionSQL = `
SELECT 
  '未知工厂' as 工厂,
  COALESCE(baseline, '') as 基线,
  COALESCE(project, '') as 项目,
  COALESCE(material_code, '') as 物料编码,
  COALESCE(material_name, '') as 物料名称,
  COALESCE(supplier_name, '') as 供应商,
  '' as 批次号,
  '0%' as 不良率,
  '' as 不良现象,
  DATE_FORMAT(test_date, '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM production_tracking 
ORDER BY test_date DESC 
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
        let finalSQL = correctProductionSQL;
        
        // 添加过滤条件
        if (rule.condition) {
          finalSQL = finalSQL.replace(
            'FROM production_tracking',
            `FROM production_tracking\n${rule.condition}`
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
    console.log(`✅ 成功修复: ${fixedCount} 条规则\n`);
    
    // 验证修复结果
    if (fixedCount > 0) {
      console.log('🔍 验证修复结果...');
      await validateProductionRules();
    }
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
  }
}

async function validateProductionRules() {
  try {
    const testQueries = [
      '查询上线信息',
      '查询充电类上线',
      '查询光学类上线'
    ];
    
    for (const query of testQueries) {
      console.log(`\n测试查询: ${query}`);
      
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
        } else {
          console.log(`  ⚠️  记录数过多: ${data.length} 条`);
        }
        
        if (data.length > 0) {
          const firstRecord = data[0];
          
          // 检查关键字段
          console.log(`    物料编码: ${firstRecord.物料编码}`);
          console.log(`    物料名称: ${firstRecord.物料名称}`);
          console.log(`    供应商: ${firstRecord.供应商}`);
          console.log(`    检验日期: ${firstRecord.检验日期}`);
          
          // 检查数据质量
          const hasValidData = firstRecord.物料编码 && firstRecord.物料编码.includes('-') && 
                              firstRecord.物料名称 && firstRecord.供应商;
          
          if (hasValidData) {
            console.log(`  ✅ 数据质量良好，包含真实物料信息`);
          } else {
            console.log(`  ⚠️  数据质量需要改善`);
          }
          
          // 检查过滤是否正确
          if (query.includes('充电类')) {
            const hasChargingMaterials = data.slice(0, 3).some(record => 
              record.物料名称.includes('充电') || 
              record.物料名称.includes('电池') || 
              record.物料名称.includes('电源')
            );
            if (hasChargingMaterials) {
              console.log(`  ✅ 充电类过滤正确`);
            } else {
              console.log(`  ⚠️  充电类过滤可能不准确`);
            }
          }
          
          if (query.includes('光学类')) {
            const hasOpticalMaterials = data.slice(0, 3).some(record => 
              record.物料名称.includes('显示') || 
              record.物料名称.includes('屏') || 
              record.物料名称.includes('摄像头') ||
              record.物料名称.includes('LCD') ||
              record.物料名称.includes('OLED')
            );
            if (hasOpticalMaterials) {
              console.log(`  ✅ 光学类过滤正确`);
            } else {
              console.log(`  ⚠️  光学类过滤可能不准确`);
            }
          }
        }
      } else {
        console.log(`  ❌ 查询失败`);
        if (result.message) {
          console.log(`    错误信息: ${result.message}`);
        }
      }
    }
    
    console.log('\n✅ 验证完成');
    
  } catch (error) {
    console.error('❌ 验证过程中出现错误:', error);
  }
}

fixProductionTrackingRules();
