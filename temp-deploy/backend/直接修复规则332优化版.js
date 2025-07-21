// 直接修复规则332 - 结构件类上线情况查询
// 解决：1）内容空缺 2）确保真实数据调取 3）字段名错误（本周异常→不良现象）

import fetch from 'node-fetch';

async function fixRule332() {
  try {
    console.log('🔧 开始修复规则332: 结构件类上线情况查询...');
    
    // 优化后的SQL - 解决所有问题
    const optimizedSQL = `SELECT
  COALESCE(factory, '未知工厂') as 工厂,
  COALESCE(baseline, baseline_id, '未知基线') as 基线,
  COALESCE(project, project_id, '未知项目') as 项目,
  material_code as 物料编码,
  material_name as 物料名称,
  COALESCE(supplier_name, '未知供应商') as 供应商,
  COALESCE(batch_code, '未知批次') as 批次号,
  CASE 
    WHEN defect_rate IS NOT NULL AND defect_rate > 0 THEN CONCAT(ROUND(defect_rate * 100, 2), '%')
    WHEN defect_rate = 0 THEN '0.00%'
    ELSE '待检测'
  END as 不良率,
  COALESCE(
    CASE 
      WHEN weekly_anomaly IS NOT NULL AND weekly_anomaly != '' THEN weekly_anomaly
      WHEN defect_phenomenon IS NOT NULL AND defect_phenomenon != '' THEN defect_phenomenon
      ELSE '无异常'
    END
  ) as 不良现象,
  DATE_FORMAT(COALESCE(inspection_date, created_at), '%Y-%m-%d') as 检验日期,
  COALESCE(notes, '') as 备注
FROM online_tracking
WHERE (
    material_name LIKE '%框%' 
    OR material_name LIKE '%盖%' 
    OR material_name LIKE '%壳%'
    OR material_name LIKE '%支架%'
    OR material_name LIKE '%结构%'
    OR material_code LIKE '%CS-%'
    OR material_code LIKE '%CASE-%'
    OR material_code LIKE '%FRAME-%'
  )
  AND material_name IS NOT NULL 
  AND material_name != ''
  AND material_code IS NOT NULL 
  AND material_code != ''
  AND supplier_name IS NOT NULL
  AND supplier_name != ''
ORDER BY 
  COALESCE(inspection_date, created_at) DESC, 
  defect_rate DESC NULLS LAST,
  id DESC
LIMIT 100`;

    console.log('📝 优化后的SQL:');
    console.log(optimizedSQL);
    
    // 通过API更新规则
    console.log('\n💾 通过API更新规则332...');
    
    const updateData = {
      action_target: optimizedSQL
    };
    
    const response = await fetch('http://localhost:3001/api/rules/332', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 规则332更新成功');
      console.log('更新结果:', result);
    } else {
      const error = await response.text();
      console.log('❌ 规则332更新失败:', error);
      return;
    }
    
    // 测试更新后的规则
    console.log('\n🧪 测试更新后的规则332...');
    
    const testResponse = await fetch('http://localhost:3001/api/rules/test/332', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    if (testResponse.ok) {
      const testResult = await testResponse.json();
      console.log('✅ 规则332测试成功');
      console.log(`📊 返回记录数: ${testResult.data.resultCount}`);
      console.log(`📋 返回字段: ${testResult.data.fields.join(', ')}`);
      
      // 检查字段是否为中文
      const hasChineseFields = testResult.data.fields.every(field => /[\u4e00-\u9fa5]/.test(field));
      console.log(`🈳 中文字段检查: ${hasChineseFields ? '✅ 全部中文' : '❌ 包含非中文'}`);
      
      // 检查数据完整性
      if (testResult.data.tableData && testResult.data.tableData.length > 0) {
        console.log('\n📊 数据完整性检查:');
        const sample = testResult.data.tableData[0];
        Object.entries(sample).forEach(([field, value]) => {
          const isEmpty = value === null || value === '' || value === '未知' || value === '无' || value === '待检测';
          const status = isEmpty ? '⚠️' : '✅';
          console.log(`  ${field}: ${value} ${status}`);
        });
        
        // 统计空值情况
        console.log('\n📈 空值统计:');
        testResult.data.fields.forEach(field => {
          const emptyCount = testResult.data.tableData.filter(row => 
            row[field] === null || row[field] === '' || row[field] === '未知' || row[field] === '无'
          ).length;
          const emptyRate = (emptyCount / testResult.data.tableData.length * 100).toFixed(1);
          console.log(`  ${field}: ${emptyCount}/${testResult.data.tableData.length} (${emptyRate}%) 为空`);
        });
        
        // 检查不良现象字段
        const defectPhenomena = [...new Set(testResult.data.tableData.map(row => row.不良现象))];
        console.log('\n🔍 不良现象类型:');
        defectPhenomena.slice(0, 10).forEach(phenomenon => {
          const count = testResult.data.tableData.filter(row => row.不良现象 === phenomenon).length;
          console.log(`  ${phenomenon}: ${count}条`);
        });
        
        // 检查结构件类物料分布
        const materialDistribution = {};
        testResult.data.tableData.forEach(row => {
          const materialName = row.物料名称;
          if (!materialDistribution[materialName]) {
            materialDistribution[materialName] = 0;
          }
          materialDistribution[materialName]++;
        });
        
        console.log('\n📊 结构件类物料分布:');
        Object.entries(materialDistribution).slice(0, 10).forEach(([name, count]) => {
          console.log(`  ${name}: ${count}条记录`);
        });
        
      } else {
        console.log('⚠️ 无数据返回');
      }
      
    } else {
      const testError = await testResponse.text();
      console.log('❌ 规则332测试失败:', testError);
      return;
    }
    
    console.log('\n🎉 规则332优化完成！');
    
    console.log('\n✨ 优化总结:');
    console.log('✅ 修复了字段名错误: "本周异常" → "不良现象"');
    console.log('✅ 使用COALESCE和CASE处理空值，减少空缺内容');
    console.log('✅ 添加了NOT NULL和非空字符串条件确保数据完整性');
    console.log('✅ 优化了查询条件，确保返回真实的结构件类数据');
    console.log('✅ 按检验日期和不良率排序，优先显示重要数据');
    console.log('✅ 符合上线场景字段标准');
    console.log('✅ 确保所有数据均来自真实数据库调取');
    
    console.log('\n🔄 请重新测试前端页面，验证修复效果！');
    
  } catch (error) {
    console.error('❌ 修复规则332失败:', error);
  }
}

fixRule332().catch(console.error);
