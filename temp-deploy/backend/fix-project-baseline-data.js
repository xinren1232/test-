/**
 * 修复项目基线数据工具
 * 确保测试数据按照正确的项目基线映射关系生成
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

/**
 * 检查当前项目基线数据状态
 */
async function checkCurrentProjectBaselineData() {
  console.log('🔍 检查当前项目基线数据状态...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 检查lab_tests表的项目基线分布
    const [testStats] = await connection.execute(`
      SELECT 
        project_id,
        baseline_id,
        COUNT(*) as count
      FROM lab_tests 
      WHERE project_id IS NOT NULL AND baseline_id IS NOT NULL
      GROUP BY project_id, baseline_id
      ORDER BY baseline_id, project_id
    `);
    
    console.log('\n📊 当前测试数据中的项目基线分布:');
    if (testStats.length === 0) {
      console.log('❌ 没有找到项目基线数据！');
    } else {
      testStats.forEach(stat => {
        console.log(`${stat.baseline_id} -> ${stat.project_id}: ${stat.count}条记录`);
      });
    }
    
    // 检查online_tracking表的项目基线分布
    const [onlineStats] = await connection.execute(`
      SELECT
        project,
        COUNT(*) as count
      FROM online_tracking
      WHERE project IS NOT NULL
      GROUP BY project
      ORDER BY project
    `);

    console.log('\n📊 当前在线跟踪数据中的项目分布:');
    if (onlineStats.length === 0) {
      console.log('❌ 没有找到项目数据！');
    } else {
      onlineStats.forEach(stat => {
        console.log(`项目 ${stat.project}: ${stat.count}条记录`);
      });
    }
    
    return {
      testStats,
      onlineStats,
      hasProjectBaselineData: testStats.length > 0 || onlineStats.length > 0
    };
    
  } finally {
    await connection.end();
  }
}

/**
 * 为测试数据添加项目基线信息
 */
async function addProjectBaselineToTestData() {
  console.log('\n🔧 为测试数据添加项目基线信息...');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 首先检查是否已有项目基线字段
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
    
    // 获取所有测试记录
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

/**
 * 为在线跟踪数据添加项目基线信息
 */
async function addProjectBaselineToOnlineData() {
  console.log('\n🔧 为在线跟踪数据添加项目基线信息...');

  const connection = await mysql.createConnection(dbConfig);

  try {
    // 首先检查是否已有基线字段
    try {
      await connection.execute(`
        ALTER TABLE online_tracking
        ADD COLUMN baseline VARCHAR(10) AFTER project
      `);
      console.log('✅ 成功添加baseline字段');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ 字段已存在，跳过添加');
      } else {
        throw error;
      }
    }

    // 获取所有在线跟踪记录
    const [onlineRecords] = await connection.execute(`
      SELECT id, material_name, project FROM online_tracking
      WHERE baseline IS NULL OR baseline = ''
    `);

    console.log(`找到 ${onlineRecords.length} 条需要更新的在线跟踪记录`);

    let updateCount = 0;

    for (const record of onlineRecords) {
      const materialName = record.material_name;
      let selectedProject = record.project;

      // 如果没有项目信息，根据物料分配项目
      if (!selectedProject) {
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

/**
 * 验证项目基线数据修复结果
 */
async function validateProjectBaselineData() {
  console.log('\n🔍 验证项目基线数据修复结果...');
  
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
    
    console.log('\n📊 修复后的测试数据项目基线分布:');
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

    console.log('\n📊 修复后的在线跟踪数据项目基线分布:');
    onlineStats.forEach(stat => {
      console.log(`${stat.baseline} -> ${stat.project}: ${stat.count}条记录`);
    });
    
    // 验证映射关系是否正确
    const validationResults = [];

    // 验证测试数据
    for (const stat of testStats) {
      const expectedProjects = PROJECT_BASELINE_MAPPING[stat.baseline_id];
      if (expectedProjects && expectedProjects.includes(stat.project_id)) {
        validationResults.push({ ...stat, status: 'VALID', type: 'test' });
      } else {
        validationResults.push({ ...stat, status: 'INVALID', type: 'test' });
      }
    }

    // 验证在线跟踪数据
    for (const stat of onlineStats) {
      const expectedProjects = PROJECT_BASELINE_MAPPING[stat.baseline];
      if (expectedProjects && expectedProjects.includes(stat.project)) {
        validationResults.push({ ...stat, status: 'VALID', type: 'online' });
      } else {
        validationResults.push({ ...stat, status: 'INVALID', type: 'online' });
      }
    }
    
    const validCount = validationResults.filter(r => r.status === 'VALID').length;
    const invalidCount = validationResults.filter(r => r.status === 'INVALID').length;
    
    console.log(`\n📊 验证结果:`);
    console.log(`✅ 有效映射: ${validCount} 个`);
    console.log(`❌ 无效映射: ${invalidCount} 个`);
    
    return {
      testStats,
      onlineStats,
      validationResults,
      isValid: invalidCount === 0
    };
    
  } finally {
    await connection.end();
  }
}

async function main() {
  try {
    console.log('🚀 开始修复项目基线数据...\n');
    
    // 1. 检查当前状态
    const currentStatus = await checkCurrentProjectBaselineData();
    
    if (currentStatus.hasProjectBaselineData) {
      console.log('\n✅ 项目基线数据已存在，进行验证...');
      const validationResults = await validateProjectBaselineData();
      
      if (validationResults.isValid) {
        console.log('\n✅ 项目基线数据验证通过，无需修复！');
        return validationResults;
      }
    }
    
    // 2. 修复测试数据
    const testUpdateCount = await addProjectBaselineToTestData();

    // 3. 修复在线跟踪数据
    const onlineUpdateCount = await addProjectBaselineToOnlineData();
    
    // 4. 验证修复结果
    const validationResults = await validateProjectBaselineData();
    
    console.log('\n✅ 项目基线数据修复完成！');
    console.log(`📊 总计更新: 测试数据 ${testUpdateCount} 条，在线跟踪数据 ${onlineUpdateCount} 条`);

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
