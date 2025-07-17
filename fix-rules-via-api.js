/**
 * 通过API修复库存规则的字段映射问题
 */

const API_BASE_URL = 'http://localhost:3001';

// 正确的库存查询SQL模板（匹配前端字段）
const CORRECT_INVENTORY_SQL = `
SELECT 
  COALESCE(SUBSTRING_INDEX(storage_location, '-', 1), '未知工厂') as 工厂,
  COALESCE(SUBSTRING_INDEX(storage_location, '-', -1), '未知仓库') as 仓库,
  COALESCE(material_code, '') as 物料编码,
  COALESCE(material_name, '') as 物料名称,
  COALESCE(supplier_name, '') as 供应商,
  COALESCE(quantity, 0) as 数量,
  COALESCE(status, '正常') as 状态,
  DATE_FORMAT(inbound_time, '%Y-%m-%d') as 入库时间,
  DATE_FORMAT(DATE_ADD(inbound_time, INTERVAL 365 DAY), '%Y-%m-%d') as 到期时间,
  COALESCE(notes, '') as 备注
FROM inventory 
ORDER BY inbound_time DESC 
LIMIT 50`.trim();

// 需要修复的规则ID列表（从之前的分析结果）
const RULES_TO_FIX = [
  { id: 659, name: '库存信息查询' },
  { id: 725, name: '结构件类库存查询', condition: "WHERE material_type LIKE '%结构件%'" },
  { id: 728, name: '光学类库存查询', condition: "WHERE material_type LIKE '%光学%' OR material_name LIKE '%显示%' OR material_name LIKE '%屏%'" },
  { id: 731, name: '充电类库存查询', condition: "WHERE material_name LIKE '%充电%' OR material_name LIKE '%电池%'" },
  { id: 734, name: '声学类库存查询', condition: "WHERE material_name LIKE '%扬声器%' OR material_name LIKE '%听筒%'" },
  { id: 737, name: '包装类库存查询', condition: "WHERE material_name LIKE '%包装%' OR material_name LIKE '%保护套%' OR material_name LIKE '%标签%'" },
  { id: 662, name: 'BOE供应商库存查询', condition: "WHERE supplier_name = 'BOE'" },
  { id: 665, name: '东声供应商库存查询', condition: "WHERE supplier_name = '东声'" },
  { id: 668, name: '丽德宝供应商库存查询', condition: "WHERE supplier_name = '丽德宝'" },
  { id: 671, name: '华星供应商库存查询', condition: "WHERE supplier_name = '华星'" },
  { id: 674, name: '天实供应商库存查询', condition: "WHERE supplier_name = '天实'" },
  { id: 677, name: '天马供应商库存查询', condition: "WHERE supplier_name = '天马'" },
  { id: 680, name: '奥海供应商库存查询', condition: "WHERE supplier_name = '奥海'" },
  { id: 683, name: '富群供应商库存查询', condition: "WHERE supplier_name = '富群'" },
  { id: 686, name: '广正供应商库存查询', condition: "WHERE supplier_name = '广正'" },
  { id: 689, name: '怡同供应商库存查询', condition: "WHERE supplier_name = '怡同'" },
  { id: 692, name: '欣冠供应商库存查询', condition: "WHERE supplier_name = '欣冠'" },
  { id: 695, name: '歌尔供应商库存查询', condition: "WHERE supplier_name = '歌尔'" },
  { id: 698, name: '深奥供应商库存查询', condition: "WHERE supplier_name = '深奥'" },
  { id: 701, name: '理威供应商库存查询', condition: "WHERE supplier_name = '理威'" },
  { id: 704, name: '瑞声供应商库存查询', condition: "WHERE supplier_name = '瑞声'" },
  { id: 707, name: '百佳达供应商库存查询', condition: "WHERE supplier_name = '百佳达'" },
  { id: 710, name: '盛泰供应商库存查询', condition: "WHERE supplier_name = '盛泰'" },
  { id: 713, name: '维科供应商库存查询', condition: "WHERE supplier_name = '维科'" },
  { id: 716, name: '聚龙供应商库存查询', condition: "WHERE supplier_name = '聚龙'" },
  { id: 719, name: '辉阳供应商库存查询', condition: "WHERE supplier_name = '辉阳'" },
  { id: 722, name: '风华供应商库存查询', condition: "WHERE supplier_name = '风华'" }
];

async function fixRulesViaAPI() {
  try {
    console.log('🔧 通过API修复库存规则字段映射...\n');
    
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const rule of RULES_TO_FIX) {
      console.log(`修复规则: ${rule.name} (ID: ${rule.id})`);
      
      try {
        // 构建正确的SQL
        let newSQL = CORRECT_INVENTORY_SQL;
        if (rule.condition) {
          newSQL = newSQL.replace(
            'FROM inventory',
            `FROM inventory\n${rule.condition}`
          );
          console.log(`  添加条件: ${rule.condition}`);
        }
        
        // 通过API更新规则
        const response = await fetch(`${API_BASE_URL}/api/rules/${rule.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action_target: newSQL
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log(`  ✅ 修复成功`);
            fixedCount++;
          } else {
            console.log(`  ❌ 修复失败: ${result.message}`);
            errorCount++;
          }
        } else {
          console.log(`  ❌ API请求失败: ${response.status}`);
          errorCount++;
        }
        
      } catch (error) {
        console.log(`  ❌ 修复出错: ${error.message}`);
        errorCount++;
      }
      
      console.log('');
      
      // 添加小延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`🎉 修复完成！`);
    console.log(`✅ 成功修复: ${fixedCount} 条规则`);
    console.log(`❌ 修复失败: ${errorCount} 条规则\n`);
    
    // 验证修复结果
    if (fixedCount > 0) {
      console.log('🔍 验证修复结果...');
      await validateFixedRules();
    }
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
  }
}

async function validateFixedRules() {
  try {
    // 测试几个修复后的规则
    const testQueries = [
      '查询库存信息',
      '查询聚龙供应商的库存',
      '查询光学类库存'
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
        
        if (data.length > 0) {
          const firstRecord = data[0];
          const requiredFields = ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'];
          const missingFields = requiredFields.filter(field => !(field in firstRecord));
          
          if (missingFields.length === 0) {
            console.log(`  ✅ 所有必要字段都存在`);
            
            // 检查关键字段是否有数据
            const hasData = firstRecord.物料编码 && firstRecord.物料名称 && firstRecord.供应商;
            if (hasData) {
              console.log(`  ✅ 关键字段有数据`);
              console.log(`    物料编码: ${firstRecord.物料编码}`);
              console.log(`    物料名称: ${firstRecord.物料名称}`);
              console.log(`    供应商: ${firstRecord.供应商}`);
              console.log(`    到期时间: ${firstRecord.到期时间}`);
            } else {
              console.log(`  ⚠️  关键字段仍然为空`);
            }
          } else {
            console.log(`  ❌ 缺失字段: ${missingFields.join(', ')}`);
          }
        }
      } else {
        console.log(`  ❌ 查询失败或无数据`);
      }
    }
    
    console.log('\n✅ 验证完成');
    
  } catch (error) {
    console.error('❌ 验证过程中出现错误:', error);
  }
}

// 运行修复
fixRulesViaAPI();
