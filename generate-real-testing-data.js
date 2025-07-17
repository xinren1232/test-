/**
 * 生成真实的多样化测试数据
 */

const API_BASE_URL = 'http://localhost:3001';

// 真实的数据配置
const REAL_DATA_CONFIG = {
  // 工厂列表
  factories: ['深圳工厂', '重庆工厂', '南昌工厂', '宜宾工厂'],
  
  // 项目ID列表（根据代码检索结果）
  projectIds: ["X6827", "S665LN", "KI4K", "X6828", "X6831", "KI5K", "S662LN", "S663LN", "S664LN"],
  
  // 基线ID列表（根据项目ID映射）
  baselineMapping: {
    "X6827": "I6789", "S665LN": "I6789", "KI4K": "I6789", "X6828": "I6789",
    "X6831": "I6788", "KI5K": "I6788",
    "S662LN": "I6787", "S663LN": "I6787", "S664LN": "I6787"
  },
  
  // 物料信息（按类别分组）
  materials: {
    结构件类: [
      { name: '电池盖', code_prefix: 'CS-B' },
      { name: '中框', code_prefix: 'CS-M' },
      { name: '手机卡托', code_prefix: 'SIM' },
      { name: '侧键', code_prefix: 'KEY' },
      { name: '装饰件', code_prefix: 'DEC' }
    ],
    光学类: [
      { name: 'LCD显示屏', code_prefix: 'DS-L' },
      { name: 'OLED显示屏', code_prefix: 'DS-O' },
      { name: '摄像头(CAM)', code_prefix: 'CAM' }
    ],
    充电类: [
      { name: '电池', code_prefix: 'BAT' },
      { name: '充电器', code_prefix: 'CHG' }
    ],
    声学类: [
      { name: '喇叭', code_prefix: 'SPK' },
      { name: '听筒', code_prefix: 'REC' }
    ],
    包材类: [
      { name: '保护套', code_prefix: 'CASE' },
      { name: '标签', code_prefix: 'LABEL' },
      { name: '包装盒', code_prefix: 'BOX' }
    ]
  },
  
  // 供应商列表
  suppliers: ['聚龙', '欣冠', '广正', 'BOE', '天马', '华星', '天实', '盛泰', '深奥', '百佳达', '奥海', '辉阳', '理威', '风华', '维科', '东声', '瑞声', '歌尔', '丽德宝', '怡同', '富群'],
  
  // 测试结果
  testResults: ['合格', '不合格'],
  
  // 不合格描述
  defectDescs: ['外观缺陷', '功能异常', '尺寸偏差', '性能不达标', '显示异常', '连接不良', '材质问题']
};

function generateMaterialCode(materialName, supplier) {
  // 找到物料的code_prefix
  let codePrefix = 'MAT';
  for (const [category, materials] of Object.entries(REAL_DATA_CONFIG.materials)) {
    const material = materials.find(m => m.name === materialName);
    if (material) {
      codePrefix = material.code_prefix;
      break;
    }
  }
  
  // 生成物料编码：前缀-供应商首字母+4位数字
  const supplierPrefix = supplier.charAt(0);
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `${codePrefix}-${supplierPrefix}${randomDigits}`;
}

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRealTestingData() {
  console.log('🏭 生成真实的多样化测试数据...\n');
  
  const inventory = [];
  const inspection = [];
  const production = [];
  
  // 1. 生成132条库存数据
  console.log('📦 生成132条库存数据...');
  for (let i = 1; i <= 132; i++) {
    const factory = randomChoice(REAL_DATA_CONFIG.factories);
    const supplier = randomChoice(REAL_DATA_CONFIG.suppliers);
    
    // 随机选择物料类别和物料
    const categories = Object.keys(REAL_DATA_CONFIG.materials);
    const category = randomChoice(categories);
    const material = randomChoice(REAL_DATA_CONFIG.materials[category]);
    
    const materialCode = generateMaterialCode(material.name, supplier);
    
    // 生成入库时间（最近30天内）
    const inboundTime = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    
    inventory.push({
      id: `INV-${i}`,
      materialCode: materialCode,
      materialName: material.name,
      supplier: supplier,
      quantity: Math.floor(Math.random() * 1000) + 100,
      factory: factory,
      warehouse: factory.replace('工厂', '仓库'),
      status: Math.random() < 0.1 ? '风险' : '正常',
      storage_date: inboundTime.toISOString().split('T')[0],
      remarks: `${material.name}库存备注`
    });
  }
  
  // 2. 为每个库存批次生成3条测试记录（396条）
  console.log('🧪 为每个库存批次生成3条测试记录...');
  let testId = 1;
  
  for (const inventoryItem of inventory) {
    for (let testIndex = 1; testIndex <= 3; testIndex++) {
      const projectId = randomChoice(REAL_DATA_CONFIG.projectIds);
      const baselineId = REAL_DATA_CONFIG.baselineMapping[projectId];
      const testResult = randomChoice(REAL_DATA_CONFIG.testResults);
      
      // 测试时间应该在入库时间之后
      const testTime = new Date(new Date(inventoryItem.storage_date).getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000);
      
      inspection.push({
        id: `TEST-${testId}`,
        testId: `TEST-${String(testId).padStart(3, '0')}`,
        materialCode: inventoryItem.materialCode,
        materialName: inventoryItem.materialName,
        supplier: inventoryItem.supplier,
        projectId: projectId,
        baselineId: baselineId,
        quantity: Math.floor(Math.random() * 50) + 10,
        test_date: testTime.toISOString().split('T')[0],
        testResult: testResult,
        defectDescription: testResult === '不合格' ? randomChoice(REAL_DATA_CONFIG.defectDescs) : '',
        notes: `${inventoryItem.materialName}测试记录${testIndex}`
      });
      
      testId++;
    }
  }
  
  // 3. 为每个库存批次生成8条生产记录（1056条）
  console.log('🏭 为每个库存批次生成8条生产记录...');
  let prodId = 1;
  
  for (const inventoryItem of inventory) {
    for (let prodIndex = 1; prodIndex <= 8; prodIndex++) {
      const projectId = randomChoice(REAL_DATA_CONFIG.projectIds);
      const baselineId = REAL_DATA_CONFIG.baselineMapping[projectId];
      
      // 生产时间应该在入库时间之后
      const prodTime = new Date(new Date(inventoryItem.storage_date).getTime() + Math.random() * 15 * 24 * 60 * 60 * 1000);
      
      production.push({
        id: `PROD-${prodId}`,
        materialCode: inventoryItem.materialCode,
        materialName: inventoryItem.materialName,
        supplier: inventoryItem.supplier,
        factory: inventoryItem.factory,
        projectId: projectId,
        baselineId: baselineId,
        quantity: Math.floor(Math.random() * 200) + 50,
        inspection_date: prodTime.toISOString().split('T')[0],
        defect_phenomenon: Math.random() < 0.1 ? randomChoice(REAL_DATA_CONFIG.defectDescs) : '',
        remarks: `${inventoryItem.materialName}生产记录${prodIndex}`
      });
      
      prodId++;
    }
  }
  
  console.log(`✅ 数据生成完成:`);
  console.log(`   📦 库存数据: ${inventory.length} 条`);
  console.log(`   🧪 测试数据: ${inspection.length} 条`);
  console.log(`   🏭 生产数据: ${production.length} 条`);
  
  return { inventory, inspection, production, batches: [] };
}

async function syncRealDataToBackend() {
  try {
    console.log('\n📡 同步真实数据到后端...\n');
    
    // 生成数据
    const realData = generateRealTestingData();
    
    // 同步到后端
    const response = await fetch(`${API_BASE_URL}/api/assistant/update-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(realData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 数据同步成功:', result);
      
      // 验证同步结果
      console.log('\n🔍 验证同步结果...');
      await validateSyncedData();
      
    } else {
      console.log('❌ 数据同步失败:', response.status);
    }
    
  } catch (error) {
    console.error('❌ 同步过程中出现错误:', error);
  }
}

async function validateSyncedData() {
  try {
    // 测试查询
    const response = await fetch(`${API_BASE_URL}/api/assistant/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '查询测试信息' })
    });
    
    const result = await response.json();
    
    if (result.success && result.data && result.data.tableData) {
      const data = result.data.tableData;
      console.log(`✅ 查询成功，返回 ${data.length} 条记录`);
      
      if (data.length > 0) {
        const firstRecord = data[0];
        console.log('\n第一条记录验证:');
        console.log(`  工厂: "${firstRecord.工厂}"`);
        console.log(`  基线: "${firstRecord.基线}"`);
        console.log(`  项目: "${firstRecord.项目}"`);
        console.log(`  物料编码: "${firstRecord.物料编码}"`);
        console.log(`  物料名称: "${firstRecord.物料名称}"`);
        console.log(`  供应商: "${firstRecord.供应商}"`);
        
        // 检查数据多样性
        const uniqueMaterials = [...new Set(data.slice(0, 10).map(r => r.物料名称))];
        const uniqueSuppliers = [...new Set(data.slice(0, 10).map(r => r.供应商))];
        const uniqueProjects = [...new Set(data.slice(0, 10).map(r => r.项目))];
        
        console.log(`\n数据多样性检查 (前10条):`);
        console.log(`  物料种类: ${uniqueMaterials.length} (${uniqueMaterials.join(', ')})`);
        console.log(`  供应商数量: ${uniqueSuppliers.length} (${uniqueSuppliers.join(', ')})`);
        console.log(`  项目数量: ${uniqueProjects.length} (${uniqueProjects.join(', ')})`);
        
        if (uniqueMaterials.length > 1 && uniqueSuppliers.length > 1 && uniqueProjects.length >= 1) {
          console.log('✅ 数据多样性良好');
        } else {
          console.log('⚠️  数据多样性不足');
        }
      }
    } else {
      console.log('❌ 验证查询失败');
    }
    
  } catch (error) {
    console.error('❌ 验证过程中出现错误:', error);
  }
}

// 运行数据生成和同步
syncRealDataToBackend();
