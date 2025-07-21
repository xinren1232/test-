import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

async function fixJsonFormat() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔧 修复JSON格式...');
    
    // 直接更新为正确的JSON格式
    const updates = [
      ['电池盖', '["划伤","堵漆","起翘","色差"]'],
      ['中框', '["变形","破裂","堵漆","尺寸异常"]'],
      ['手机卡托', '["注塑不良","尺寸异常","堵漆","毛边"]'],
      ['侧键', '["脱落","卡键","尺寸异常","松动"]'],
      ['装饰件', '["掉色","偏位","脱落"]'],
      ['LCD显示屏', '["漏光","暗点","亮屏","偏色"]'],
      ['OLED显示屏', '["闪屏","mura","亮线"]'],
      ['摄像头模组', '["刮花","底座破裂","脱污","无法拍照"]'],
      ['电池', '["起鼓","放电","漏液","电压不稳定"]'],
      ['充电器', '["无法充电","外壳破裂","输出功率异常","发热异常"]'],
      ['喇叭', '["无声","杂声","音量小","破裂"]'],
      ['听筒', '["无声","杂声","音量小","破裂"]'],
      ['保护套', '["尺寸偏差","发黄","模具压痕"]'],
      ['标签', '["脱落","错印","logo错误","尺寸异常"]'],
      ['包装盒', '["破损","logo错误","错印","尺寸异常"]']
    ];
    
    for (const [materialName, defects] of updates) {
      await connection.execute(
        'UPDATE material_subcategories SET common_defects = ? WHERE material_name = ?',
        [defects, materialName]
      );
      console.log(`✅ 更新 ${materialName}`);
    }
    
    console.log('✅ JSON格式修复完成');
    
    // 验证修复结果
    const [results] = await connection.execute('SELECT material_name, common_defects FROM material_subcategories LIMIT 5');
    console.log('\n验证结果:');
    results.forEach(row => {
      try {
        const defects = JSON.parse(row.common_defects);
        console.log(`  ${row.material_name}: ${defects.join(', ')}`);
      } catch (error) {
        console.log(`  ${row.material_name}: JSON解析失败`);
      }
    });
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixJsonFormat();
