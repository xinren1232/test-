/**
 * 检查上线生产数据的完整性和真实性
 */

const API_BASE_URL = 'http://localhost:3001';

async function checkProductionDataIntegrity() {
  try {
    console.log('🔍 检查上线生产数据的完整性和真实性...\n');
    
    // 1. 检查production_tracking表的实际数据量
    console.log('1️⃣ 检查production_tracking表的实际数据量...');
    await checkProductionTableStats();
    
    // 2. 检查上线查询的实际结果
    console.log('\n2️⃣ 检查上线查询的实际结果...');
    await checkProductionQueryResults();
    
    // 3. 分析数据来源和重复情况
    console.log('\n3️⃣ 分析数据来源和重复情况...');
    await analyzeDataSource();
    
    // 4. 验证数据是否来自MaterialCodeMap.js
    console.log('\n4️⃣ 验证数据是否来自MaterialCodeMap.js...');
    await validateDataSource();
    
  } catch (error) {
    console.error('❌ 检查过程中出现错误:', error);
  }
}

async function checkProductionTableStats() {
  try {
    // 检查production_tracking表的记录数
    const response = await fetch(`${API_BASE_URL}/api/db-execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sql: `
          SELECT 
            COUNT(*) as total_records,
            COUNT(DISTINCT material_code) as unique_materials,
            COUNT(DISTINCT supplier_name) as unique_suppliers,
            COUNT(DISTINCT factory) as unique_factories,
            MIN(created_at) as earliest_record,
            MAX(created_at) as latest_record
          FROM production_tracking
        `
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      const stats = result.result[0];
      
      console.log('📊 production_tracking表统计:');
      console.log(`  总记录数: ${stats.total_records}`);
      console.log(`  唯一物料数: ${stats.unique_materials}`);
      console.log(`  唯一供应商数: ${stats.unique_suppliers}`);
      console.log(`  唯一工厂数: ${stats.unique_factories}`);
      console.log(`  最早记录: ${stats.earliest_record}`);
      console.log(`  最新记录: ${stats.latest_record}`);
      
      if (stats.total_records > 1056) {
        console.log(`⚠️  记录数超出预期！预期1056条，实际${stats.total_records}条`);
      } else if (stats.total_records === 1056) {
        console.log(`✅ 记录数符合预期: ${stats.total_records}条`);
      } else {
        console.log(`⚠️  记录数少于预期！预期1056条，实际${stats.total_records}条`);
      }
    } else {
      console.log('❌ 获取表统计失败');
    }
  } catch (error) {
    console.error('❌ 检查表统计时出错:', error);
  }
}

async function checkProductionQueryResults() {
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
      console.log(`📋 上线信息查询结果: ${data.length} 条记录`);
      
      if (data.length > 0) {
        console.log('\n前5条记录详情:');
        data.slice(0, 5).forEach((record, index) => {
          console.log(`记录 ${index + 1}:`);
          console.log(`  工厂: ${record.工厂}`);
          console.log(`  基线: ${record.基线}`);
          console.log(`  项目: ${record.项目}`);
          console.log(`  物料编码: ${record.物料编码}`);
          console.log(`  物料名称: ${record.物料名称}`);
          console.log(`  供应商: ${record.供应商}`);
          console.log(`  批次号: ${record.批次号}`);
          console.log(`  不良率: ${record.不良率}`);
          console.log(`  检验日期: ${record.检验日期}`);
          console.log('');
        });
        
        // 分析数据多样性
        const uniqueMaterials = [...new Set(data.slice(0, 20).map(r => r.物料名称))];
        const uniqueSuppliers = [...new Set(data.slice(0, 20).map(r => r.供应商))];
        const uniqueFactories = [...new Set(data.slice(0, 20).map(r => r.工厂))];
        const uniqueProjects = [...new Set(data.slice(0, 20).map(r => r.项目))];
        
        console.log('📊 数据多样性分析 (前20条):');
        console.log(`  物料种类: ${uniqueMaterials.length} (${uniqueMaterials.slice(0, 3).join(', ')}...)`);
        console.log(`  供应商数量: ${uniqueSuppliers.length} (${uniqueSuppliers.slice(0, 3).join(', ')}...)`);
        console.log(`  工厂数量: ${uniqueFactories.length} (${uniqueFactories.slice(0, 3).join(', ')}...)`);
        console.log(`  项目数量: ${uniqueProjects.length} (${uniqueProjects.slice(0, 3).join(', ')}...)`);
        
        // 检查是否有重复数据
        const materialCodes = data.slice(0, 50).map(r => r.物料编码);
        const uniqueMaterialCodes = [...new Set(materialCodes)];
        if (materialCodes.length > uniqueMaterialCodes.length) {
          console.log(`⚠️  发现重复的物料编码: ${materialCodes.length - uniqueMaterialCodes.length} 个重复`);
        } else {
          console.log(`✅ 物料编码无重复`);
        }
      }
    } else {
      console.log('❌ 上线信息查询失败');
      if (result.message) {
        console.log(`错误信息: ${result.message}`);
      }
    }
  } catch (error) {
    console.error('❌ 检查查询结果时出错:', error);
  }
}

async function analyzeDataSource() {
  try {
    // 检查数据创建时间分布
    const response = await fetch(`${API_BASE_URL}/api/db-execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sql: `
          SELECT 
            DATE(created_at) as create_date,
            COUNT(*) as record_count,
            COUNT(DISTINCT material_code) as unique_materials
          FROM production_tracking 
          GROUP BY DATE(created_at)
          ORDER BY create_date DESC
          LIMIT 10
        `
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      const dateStats = result.result;
      
      console.log('📅 数据创建时间分布:');
      dateStats.forEach(stat => {
        console.log(`  ${stat.create_date}: ${stat.record_count}条记录, ${stat.unique_materials}种物料`);
      });
      
      // 检查是否有多次数据同步
      if (dateStats.length > 1) {
        console.log('⚠️  发现多个创建日期，可能存在重复数据同步');
      } else {
        console.log('✅ 数据创建时间一致');
      }
    } else {
      console.log('❌ 获取数据创建时间分布失败');
    }
  } catch (error) {
    console.error('❌ 分析数据来源时出错:', error);
  }
}

async function validateDataSource() {
  try {
    // 检查物料编码格式，验证是否来自MaterialCodeMap.js
    const response = await fetch(`${API_BASE_URL}/api/db-execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sql: `
          SELECT 
            material_code,
            material_name,
            supplier_name,
            COUNT(*) as count
          FROM production_tracking 
          WHERE material_code IS NOT NULL AND material_code != ''
          GROUP BY material_code, material_name, supplier_name
          ORDER BY count DESC
          LIMIT 10
        `
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      const codeStats = result.result;
      
      console.log('🔍 物料编码格式验证:');
      codeStats.forEach(stat => {
        console.log(`  ${stat.material_code} | ${stat.material_name} | ${stat.supplier_name} | ${stat.count}条`);
      });
      
      // 检查编码格式是否符合MaterialCodeMap.js的生成规则
      const hasValidFormat = codeStats.some(stat => {
        const code = stat.material_code;
        // MaterialCodeMap.js生成的格式: 前缀-供应商首字母+4位数字
        return /^[A-Z]+-[A-Z]\d{4}$/.test(code) || /^[A-Z]{2,}-[A-Z]\d{4}$/.test(code);
      });
      
      if (hasValidFormat) {
        console.log('✅ 物料编码格式符合MaterialCodeMap.js生成规则');
      } else {
        console.log('⚠️  物料编码格式不符合MaterialCodeMap.js生成规则');
      }
      
      // 检查是否有重复的物料编码
      const duplicates = codeStats.filter(stat => stat.count > 8); // 每个物料应该有8条上线记录
      if (duplicates.length > 0) {
        console.log('⚠️  发现异常重复的物料编码:');
        duplicates.forEach(dup => {
          console.log(`    ${dup.material_code}: ${dup.count}条 (预期8条)`);
        });
      } else {
        console.log('✅ 物料编码重复次数正常');
      }
    } else {
      console.log('❌ 验证数据源失败');
    }
  } catch (error) {
    console.error('❌ 验证数据源时出错:', error);
  }
}

checkProductionDataIntegrity();
