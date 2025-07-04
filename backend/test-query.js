/**
 * 测试查询功能
 * 测试基于真实数据的查询分析和执行
 */

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection',
  charset: 'utf8mb4'
};

// 基于真实数据结构的智能查询分析函数（重新设计）
function analyzeQuery(query) {
  console.log(`🔍 分析查询: "${query}"`);

  const analysis = {
    type: 'general',
    keywords: [],
    filters: {},
    limit: 10
  };

  // 先进行实体提取，然后根据实体确定查询类型
  let hasInventoryEntity = false;

  // 1. 先提取工厂信息 - 基于真实工厂名称（最高优先级）
  const factoryPatterns = [
    /(重庆工厂|深圳工厂|南昌工厂|宜宾工厂)/,  // 真实工厂名称
    /(测试工厂)/                            // 测试工厂
  ];

  for (const pattern of factoryPatterns) {
    const factoryMatch = query.match(pattern);
    if (factoryMatch) {
      console.log(`🏭 工厂匹配成功: "${factoryMatch[1]}"`);
      analysis.filters.factory = factoryMatch[1];
      analysis.keywords.push(factoryMatch[1]);
      hasInventoryEntity = true;
      break;
    }
  }

  // 2. 提取供应商信息 - 基于真实供应商名称模式（避免与工厂冲突）
  if (!analysis.filters.factory) { // 只有在没有匹配到工厂时才匹配供应商
    const supplierPatterns = [
      // 真实供应商名称模式
      /(歌尔股份|蓝思科技|比亚迪电子|领益智造|通达集团|安洁科技)/,
      /(舜宇光学|大立光电|欧菲光|丘钛科技|信利光电)/,
      /(宁德时代|比亚迪|欣旺达|德赛电池|ATL)/,
      /(瑞声科技|AAC|美律实业|豪威科技)/,
      /(立讯精密|富士康|和硕|广达|仁宝)/,
      // 通用模式
      /([A-Za-z\u4e00-\u9fa5]+(?:电子|科技|集团|公司|有限公司|股份|光学|精密|制造))/,
      /([A-Za-z\u4e00-\u9fa5]*供应商[A-Za-z0-9]*)/,
      /(测试供应商[A-Za-z0-9]*)/
    ];

    for (const pattern of supplierPatterns) {
      const supplierMatch = query.match(pattern);
      if (supplierMatch) {
        console.log(`🎯 供应商匹配成功: "${supplierMatch[1]}"`);
        analysis.filters.supplier = supplierMatch[1];
        analysis.keywords.push(supplierMatch[1]);
        hasInventoryEntity = true;
        break;
      }
    }
  }

  // 3. 提取物料信息 - 基于真实物料名称模式
  const materialPatterns = [
    // 结构件类
    /(手机壳料-后盖|手机壳料-中框|手机卡托|侧键|五金小件|装饰件|保护套|硅胶套|后摄镜片)/,
    // 显示与光学类
    /(LCD显示屏|OLED显示屏|摄像头|触摸屏|保护玻璃|镜头模组)/,
    // 电子贴片料
    /(PCB主板|芯片|电容|电阻|电感|连接器|天线|传感器)/,
    // 电池与充电类
    /(电池|充电器|充电线|无线充电器)/,
    // 声学与音频类
    /(喇叭|听筒|麦克风|音频芯片)/,
    // 包装与辅料类
    /(包装盒|标签|说明书|保修卡|辅料类)/
  ];

  for (const pattern of materialPatterns) {
    const materialMatch = query.match(pattern);
    if (materialMatch) {
      console.log(`🔧 物料匹配成功: "${materialMatch[1]}"`);
      analysis.filters.material = materialMatch[1];
      analysis.keywords.push(materialMatch[1]);
      hasInventoryEntity = true;
      break;
    }
  }

  // 4. 提取状态信息 - 基于真实状态值
  if (query.includes('风险') || query.includes('异常')) {
    analysis.filters.status = '风险';
    hasInventoryEntity = true;
  }
  if (query.includes('正常')) {
    analysis.filters.status = '正常';
    hasInventoryEntity = true;
  }
  if (query.includes('冻结')) {
    analysis.filters.status = '冻结';
    hasInventoryEntity = true;
  }

  // 5. 根据实体和关键词确定查询类型
  if (analysis.filters.supplier || analysis.filters.factory || analysis.filters.material ||
      analysis.filters.status || hasInventoryEntity ||
      query.includes('库存') || query.includes('物料') || query.includes('批次') || query.includes('供应商')) {
    analysis.type = 'inventory';
  } else if (query.includes('测试') || query.includes('检验') || query.includes('实验') || query.includes('合格') || query.includes('不合格')) {
    analysis.type = 'test';
  } else if (query.includes('生产') || query.includes('在线') || query.includes('产线') || query.includes('不良率')) {
    analysis.type = 'production';
  }

  console.log('📋 查询分析结果:', analysis);
  return analysis;
}

// 处理库存查询
async function handleInventoryQuery(query, queryInfo, connection) {
  let whereConditions = [];
  let params = [];

  console.log('🔍 处理库存查询，分析结果:', queryInfo);

  // 构建WHERE条件 - 基于真实数据库字段
  if (queryInfo.filters.supplier) {
    whereConditions.push('supplier_name LIKE ?');
    params.push(`%${queryInfo.filters.supplier}%`);
    console.log(`📝 添加供应商条件: ${queryInfo.filters.supplier}`);
  }

  if (queryInfo.filters.factory) {
    whereConditions.push('storage_location LIKE ?');
    params.push(`%${queryInfo.filters.factory}%`);
    console.log(`📝 添加工厂条件: ${queryInfo.filters.factory}`);
  }

  if (queryInfo.filters.material) {
    whereConditions.push('(material_name LIKE ? OR material_code LIKE ?)');
    params.push(`%${queryInfo.filters.material}%`, `%${queryInfo.filters.material}%`);
    console.log(`📝 添加物料条件: ${queryInfo.filters.material}`);
  }

  if (queryInfo.filters.status) {
    whereConditions.push('status = ?');
    params.push(queryInfo.filters.status);
    console.log(`📝 添加状态条件: ${queryInfo.filters.status}`);
  }

  const whereClause = whereConditions.length > 0 ?
    'WHERE ' + whereConditions.join(' AND ') : '';

  const sql = `
    SELECT
      material_code as 物料编码,
      material_name as 物料名称,
      batch_code as 批次号,
      supplier_name as 供应商,
      quantity as 数量,
      storage_location as 工厂,
      status as 状态,
      risk_level as 风险等级
    FROM inventory
    ${whereClause}
    ORDER BY inbound_time DESC
    LIMIT ${queryInfo.limit}
  `;

  console.log('📊 执行库存查询SQL:', sql);
  console.log('📊 查询参数:', params);

  const [rows] = await connection.execute(sql, params);

  if (rows.length > 0) {
    let result = `📦 查询到 ${rows.length} 条库存记录：\n\n`;
    rows.forEach((row, index) => {
      result += `${index + 1}. ${row.物料名称} (${row.物料编码})\n`;
      result += `   批次: ${row.批次号} | 供应商: ${row.供应商}\n`;
      result += `   数量: ${row.数量} | 工厂: ${row.工厂}\n`;
      result += `   状态: ${row.状态} | 风险: ${row.风险等级}\n\n`;
    });
    return result;
  } else {
    return `📦 未找到符合条件的库存记录。\n查询条件: ${query}`;
  }
}

async function testQueries() {
  console.log('🚀 开始测试查询功能...\n');
  
  let connection;
  try {
    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功\n');
    
    // 测试查询 - 使用更简单的查询语句
    const testQueries = [
      '大立光电',
      '深圳工厂',
      'LCD显示屏',
      '比亚迪',
      '喇叭',
      '正常状态物料'
    ];
    
    for (const query of testQueries) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`🔍 测试查询: "${query}"`);
      console.log(`${'='.repeat(50)}`);
      
      const analysis = analyzeQuery(query);
      
      if (analysis.type === 'inventory') {
        const result = await handleInventoryQuery(query, analysis, connection);
        console.log('\n📋 查询结果:');
        console.log(result);
      } else {
        console.log('❌ 非库存查询，跳过');
      }
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

// 运行测试
testQueries().catch(console.error);
