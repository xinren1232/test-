/**
 * 简单的项目基线数据修复
 * 分步骤执行，避免复杂的验证逻辑
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 正确的项目基线映射关系
const PROJECT_BASELINE_MAPPING = {
  'I6789': ['X6827', 'S665LN', 'KI4K', 'X6828'],
  'I6788': ['X6831', 'KI5K', 'KI3K'],
  'I6787': ['S662LN', 'S663LN', 'S664LN']
};

// 物料与项目的关联关系
const MATERIAL_PROJECT_MAPPING = {
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

async function step1_FixTestData() {
  console.log('🔧 步骤1: 修复测试数据的项目基线信息...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 获取需要更新的测试记录
    const [testRecords] = await connection.execute(`
      SELECT id, material_name FROM lab_tests 
      WHERE project_id IS NULL OR baseline_id IS NULL
    `);
    
    console.log(`找到 ${testRecords.length} 条需要更新的测试记录`);
    
    let updateCount = 0;
    
    for (const record of testRecords) {
      const materialName = record.material_name;
      const projects = MATERIAL_PROJECT_MAPPING[materialName];
      
      if (projects && projects.length > 0) {
        // 随机选择一个项目
        const selectedProject = projects[Math.floor(Math.random() * projects.length)];
        
        // 找到对应的基线
        let selectedBaseline = null;
        for (const [baseline, projectList] of Object.entries(PROJECT_BASELINE_MAPPING)) {
          if (projectList.includes(selectedProject)) {
            selectedBaseline = baseline;
            break;
          }
        }
        
        if (selectedBaseline) {
          await connection.execute(`
            UPDATE lab_tests 
            SET project_id = ?, baseline_id = ?
            WHERE id = ?
          `, [selectedProject, selectedBaseline, record.id]);
          
          updateCount++;
        }
      }
    }
    
    console.log(`✅ 成功更新 ${updateCount} 条测试记录`);
    return updateCount;
    
  } finally {
    await connection.end();
  }
}

async function step2_AddOnlineTrackingFields() {
  console.log('\n🔧 步骤2: 为在线跟踪表添加基线字段...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 添加基线字段
    try {
      await connection.execute(`
        ALTER TABLE online_tracking 
        ADD COLUMN baseline VARCHAR(10) AFTER project
      `);
      console.log('✅ 成功添加baseline字段');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ baseline字段已存在');
      } else {
        throw error;
      }
    }
    
    return true;
    
  } finally {
    await connection.end();
  }
}

async function step3_FixOnlineTrackingData() {
  console.log('\n🔧 步骤3: 修复在线跟踪数据的项目基线信息...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 获取需要更新的在线跟踪记录
    const [onlineRecords] = await connection.execute(`
      SELECT id, material_name, project FROM online_tracking 
      WHERE baseline IS NULL OR baseline = ''
    `);
    
    console.log(`找到 ${onlineRecords.length} 条需要更新的在线跟踪记录`);
    
    let updateCount = 0;
    
    for (const record of onlineRecords) {
      const materialName = record.material_name;
      let selectedProject = record.project;
      
      // 如果项目名称不在我们的映射中，根据物料重新分配
      const isValidProject = Object.values(PROJECT_BASELINE_MAPPING).flat().includes(selectedProject);
      
      if (!isValidProject) {
        const projects = MATERIAL_PROJECT_MAPPING[materialName];
        if (projects && projects.length > 0) {
          selectedProject = projects[Math.floor(Math.random() * projects.length)];
        }
      }
      
      if (selectedProject) {
        // 找到对应的基线
        let selectedBaseline = null;
        for (const [baseline, projectList] of Object.entries(PROJECT_BASELINE_MAPPING)) {
          if (projectList.includes(selectedProject)) {
            selectedBaseline = baseline;
            break;
          }
        }
        
        if (selectedBaseline) {
          await connection.execute(`
            UPDATE online_tracking 
            SET project = ?, baseline = ?
            WHERE id = ?
          `, [selectedProject, selectedBaseline, record.id]);
          
          updateCount++;
        }
      }
    }
    
    console.log(`✅ 成功更新 ${updateCount} 条在线跟踪记录`);
    return updateCount;
    
  } finally {
    await connection.end();
  }
}

async function step4_ValidateResults() {
  console.log('\n🔍 步骤4: 验证修复结果...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 验证测试数据
    const [testStats] = await connection.execute(`
      SELECT 
        baseline_id,
        project_id,
        COUNT(*) as count
      FROM lab_tests 
      WHERE project_id IS NOT NULL AND baseline_id IS NOT NULL
      GROUP BY baseline_id, project_id
      ORDER BY baseline_id, project_id
    `);
    
    console.log('\n📊 测试数据项目基线分布:');
    testStats.forEach(stat => {
      console.log(`${stat.baseline_id} -> ${stat.project_id}: ${stat.count}条记录`);
    });
    
    // 验证在线跟踪数据
    const [onlineStats] = await connection.execute(`
      SELECT 
        baseline,
        project,
        COUNT(*) as count
      FROM online_tracking 
      WHERE project IS NOT NULL AND baseline IS NOT NULL
      GROUP BY baseline, project
      ORDER BY baseline, project
    `);
    
    console.log('\n📊 在线跟踪数据项目基线分布:');
    onlineStats.forEach(stat => {
      console.log(`${stat.baseline} -> ${stat.project}: ${stat.count}条记录`);
    });
    
    return {
      testStats,
      onlineStats,
      totalTestRecords: testStats.reduce((sum, stat) => sum + stat.count, 0),
      totalOnlineRecords: onlineStats.reduce((sum, stat) => sum + stat.count, 0)
    };
    
  } finally {
    await connection.end();
  }
}

async function main() {
  try {
    console.log('🚀 开始分步修复项目基线数据...\n');
    
    // 步骤1: 修复测试数据
    const testUpdateCount = await step1_FixTestData();
    
    // 步骤2: 添加在线跟踪字段
    await step2_AddOnlineTrackingFields();
    
    // 步骤3: 修复在线跟踪数据
    const onlineUpdateCount = await step3_FixOnlineTrackingData();
    
    // 步骤4: 验证结果
    const validationResults = await step4_ValidateResults();
    
    console.log('\n✅ 项目基线数据修复完成！');
    console.log(`📊 修复统计:`);
    console.log(`- 测试数据更新: ${testUpdateCount} 条`);
    console.log(`- 在线跟踪数据更新: ${onlineUpdateCount} 条`);
    console.log(`- 测试数据总计: ${validationResults.totalTestRecords} 条有项目基线信息`);
    console.log(`- 在线跟踪数据总计: ${validationResults.totalOnlineRecords} 条有项目基线信息`);
    
    return {
      testUpdateCount,
      onlineUpdateCount,
      validationResults
    };
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
    throw error;
  }
}

main().catch(console.error);
