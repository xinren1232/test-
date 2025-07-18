// 分析各场景的核心字段需求
const mysql = require('mysql2/promise');

async function analyzeScenarioFields() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('🎯 分析各场景的核心字段需求...\n');
    
    // 获取真实数据
    const [syncData] = await connection.execute(`
      SELECT data_type, data_content 
      FROM frontend_data_sync 
      WHERE created_at = (SELECT MAX(created_at) FROM frontend_data_sync)
      ORDER BY data_type
    `);
    
    for (const row of syncData) {
      const data = JSON.parse(row.data_content);
      const firstRecord = data[0];
      
      console.log(`📋 ${row.data_type.toUpperCase()}场景字段分析:`);
      console.log('='.repeat(60));
      
      if (row.data_type === 'inventory') {
        console.log('🏢 库存管理场景 - 核心关注点:');
        console.log('  ✅ 物料信息: 物料名称、物料编号、物料类型');
        console.log('  ✅ 供应链信息: 供应商');
        console.log('  ✅ 存储信息: 工厂、仓库、存储位置');
        console.log('  ✅ 数量状态: 数量、状态（正常/风险/冻结）');
        console.log('  ✅ 批次追溯: 批次号、项目ID、基线ID');
        console.log('  ✅ 时间信息: 入库时间、更新时间');
        
        console.log('\n📊 建议显示字段（优先级排序）:');
        console.log('  1. 物料名称 - 最重要，用户首先关注的');
        console.log('  2. 物料编号 - 精确识别物料');
        console.log('  3. 供应商 - 供应链管理核心');
        console.log('  4. 数量 - 库存核心指标');
        console.log('  5. 状态 - 库存健康状况');
        console.log('  6. 工厂 - 地理位置信息');
        console.log('  7. 仓库 - 具体存储位置');
        console.log('  8. 批次号 - 质量追溯');
        console.log('  9. 入库时间 - 时效性');
        console.log('  10. 项目ID - 项目关联');
        
      } else if (row.data_type === 'inspection') {
        console.log('🔬 检验测试场景 - 核心关注点:');
        console.log('  ✅ 物料信息: 物料名称');
        console.log('  ✅ 供应商信息: 供应商');
        console.log('  ✅ 测试结果: 测试结果（PASS/FAIL）');
        console.log('  ✅ 质量信息: 缺陷描述');
        console.log('  ✅ 批次追溯: 批次号、项目ID');
        console.log('  ✅ 时间信息: 测试日期');
        
        console.log('\n📊 建议显示字段（优先级排序）:');
        console.log('  1. 测试结果 - 最关键，直接反映质量状况');
        console.log('  2. 物料名称 - 被测试的物料');
        console.log('  3. 供应商 - 质量责任方');
        console.log('  4. 测试日期 - 测试时效性');
        console.log('  5. 批次号 - 质量追溯');
        console.log('  6. 项目ID - 项目关联');
        console.log('  7. 缺陷描述 - 具体问题描述');
        
      } else if (row.data_type === 'production') {
        console.log('🏭 生产上线场景 - 核心关注点:');
        console.log('  ✅ 物料信息: 物料名称、物料编号');
        console.log('  ✅ 供应商信息: 供应商');
        console.log('  ✅ 生产信息: 工厂');
        console.log('  ✅ 质量指标: 缺陷率、缺陷描述');
        console.log('  ✅ 批次追溯: 批次号、项目ID、基线ID');
        console.log('  ✅ 时间信息: 上线时间');
        
        console.log('\n📊 建议显示字段（优先级排序）:');
        console.log('  1. 缺陷率 - 生产质量核心指标');
        console.log('  2. 物料名称 - 生产的物料');
        console.log('  3. 供应商 - 物料来源');
        console.log('  4. 工厂 - 生产地点');
        console.log('  5. 上线时间 - 生产时间');
        console.log('  6. 缺陷描述 - 具体质量问题');
        console.log('  7. 批次号 - 质量追溯');
        console.log('  8. 项目ID - 项目关联');
        console.log('  9. 基线ID - 技术基线');
        console.log('  10. 物料编号 - 精确识别');
      }
      
      console.log('\n📝 当前字段示例:');
      Object.keys(firstRecord).forEach((key, index) => {
        console.log(`  ${index + 1}. ${key}: ${firstRecord[key]}`);
      });
      
      console.log('\n' + '='.repeat(80) + '\n');
    }
    
    console.log('💡 优化建议:');
    console.log('1. 每个场景显示最相关的8-10个字段，避免信息过载');
    console.log('2. 按业务重要性排序字段顺序');
    console.log('3. 关键字段（如测试结果、缺陷率）放在前面');
    console.log('4. 统一时间格式显示');
    console.log('5. 数值字段添加单位和格式化');
    
  } catch (error) {
    console.error('❌ 分析失败:', error.message);
  } finally {
    await connection.end();
  }
}

analyzeScenarioFields();
