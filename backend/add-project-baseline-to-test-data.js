/**
 * 为测试数据添加项目和基线字段
 * 
 * 根据项目基线映射关系，为lab_tests表添加project_id和baseline_id字段
 * 并根据物料类型智能分配项目和基线
 */

import mysql from 'mysql2/promise';

async function addProjectBaselineToTestData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection'
  });

  try {
    console.log('🔧 为测试数据添加项目和基线字段...');

    // 1. 检查并添加字段
    console.log('\n1. 检查数据库表结构...');
    
    try {
      await connection.execute(`
        ALTER TABLE lab_tests 
        ADD COLUMN project_id VARCHAR(10) AFTER material_name,
        ADD COLUMN baseline_id VARCHAR(10) AFTER project_id
      `);
      console.log('✅ 成功添加project_id和baseline_id字段');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ 字段已存在，跳过添加');
      } else {
        throw error;
      }
    }

    // 2. 定义项目基线映射关系
    const PROJECT_BASELINE_MAP = {
      "X6827": "I6789",
      "S665LN": "I6789", 
      "KI4K": "I6789",
      "X6828": "I6789",
      "X6831": "I6788",
      "KI5K": "I6788",
      "KI3K": "I6788",
      "S662LN": "I6787",
      "S663LN": "I6787",
      "S664LN": "I6787"
    };

    // 3. 定义物料与项目的关联关系
    const MATERIAL_PROJECT_MAP = {
      '电池盖': ['X6827', 'S665LN', 'X6828', 'S663LN'],
      '中框': ['X6827', 'S665LN', 'X6828', 'S664LN'],
      '手机卡托': ['X6827', 'S665LN', 'X6828'],
      '侧键': ['X6827', 'X6828', 'S664LN'],
      '装饰件': ['S663LN'],
      'LCD显示屏': ['X6831', 'KI5K'],
      'OLED显示屏': ['S665LN', 'KI5K'],
      '摄像头(CAM)': ['X6831', 'S662LN'],
      '电池': ['KI4K'],
      '充电器': ['KI5K'],
      '喇叭': ['KI4K'],
      '听筒': ['KI4K'],
      '保护套': ['S662LN'],
      '标签': ['X6831', 'S662LN'],
      '包装盒': ['S663LN', 'S664LN']
    };

    console.log('\n2. 为测试记录分配项目和基线...');

    // 4. 获取所有测试记录
    const [testRecords] = await connection.execute(`
      SELECT id, material_name FROM lab_tests 
      WHERE project_id IS NULL OR baseline_id IS NULL
    `);

    console.log(`找到 ${testRecords.length} 条需要更新的记录`);

    // 5. 为每条记录分配项目和基线
    let updateCount = 0;
    for (const record of testRecords) {
      const materialName = record.material_name;
      const possibleProjects = MATERIAL_PROJECT_MAP[materialName];
      
      if (possibleProjects && possibleProjects.length > 0) {
        // 随机选择一个项目
        const projectId = possibleProjects[Math.floor(Math.random() * possibleProjects.length)];
        const baselineId = PROJECT_BASELINE_MAP[projectId];
        
        // 更新记录
        await connection.execute(`
          UPDATE lab_tests 
          SET project_id = ?, baseline_id = ? 
          WHERE id = ?
        `, [projectId, baselineId, record.id]);
        
        updateCount++;
      } else {
        console.warn(`⚠️ 物料 ${materialName} 没有对应的项目映射`);
        
        // 为未映射的物料随机分配一个项目
        const allProjects = Object.keys(PROJECT_BASELINE_MAP);
        const randomProject = allProjects[Math.floor(Math.random() * allProjects.length)];
        const randomBaseline = PROJECT_BASELINE_MAP[randomProject];
        
        await connection.execute(`
          UPDATE lab_tests 
          SET project_id = ?, baseline_id = ? 
          WHERE id = ?
        `, [randomProject, randomBaseline, record.id]);
        
        updateCount++;
      }
    }

    console.log(`✅ 成功更新 ${updateCount} 条记录`);

    // 6. 验证更新结果
    console.log('\n3. 验证更新结果...');
    
    const [verifyResult] = await connection.execute(`
      SELECT 
        project_id as 项目,
        baseline_id as 基线,
        material_name as 物料类型,
        COUNT(*) as 记录数
      FROM lab_tests 
      WHERE project_id IS NOT NULL AND baseline_id IS NOT NULL
      GROUP BY project_id, baseline_id, material_name
      ORDER BY project_id, baseline_id
      LIMIT 10
    `);
    
    console.log('\n项目基线分配结果预览:');
    console.table(verifyResult);

    // 7. 检查项目基线分布
    const [distributionResult] = await connection.execute(`
      SELECT 
        project_id as 项目,
        baseline_id as 基线,
        COUNT(*) as 记录数
      FROM lab_tests 
      WHERE project_id IS NOT NULL AND baseline_id IS NOT NULL
      GROUP BY project_id, baseline_id
      ORDER BY project_id
    `);
    
    console.log('\n项目基线分布统计:');
    console.table(distributionResult);

    console.log('\n✅ 项目基线字段添加完成！');
    console.log('\n📋 更新总结:');
    console.log('- ✅ 为lab_tests表添加了project_id和baseline_id字段');
    console.log('- ✅ 根据物料类型智能分配了项目和基线');
    console.log('- ✅ 项目代码格式：X6827、S665LN、KI4K等');
    console.log('- ✅ 基线代码格式：I6789、I6788、I6787');
    console.log('- ✅ 现在可以在NLP规则中使用project_id和baseline_id字段');

  } catch (error) {
    console.error('❌ 添加项目基线字段失败:', error);
  } finally {
    await connection.end();
  }
}

// 执行添加
addProjectBaselineToTestData().catch(console.error);
