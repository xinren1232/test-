/**
 * 检查规则库字段与前端字段的不匹配问题
 */

const API_BASE_URL = 'http://localhost:3001';

// 前端页面的实际字段设计（不可更改）
const FRONTEND_ACTUAL_FIELDS = {
  inventory: {
    name: '库存页面',
    fields: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
    // 注意：前端显示的是"到期时间"，不是"到期日期"
  },
  online: {
    name: '上线页面',
    fields: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注']
  },
  testing: {
    name: '测试页面', 
    fields: ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注']
  },
  batch: {
    name: '批次管理页面',
    fields: ['批次号', '物料编码', '物料名称', '供应商', '数量', '入库日期', '产线异常', '测试异常', '备注']
  }
};

async function checkFieldMismatch() {
  try {
    console.log('🔍 检查规则库字段与前端字段的不匹配问题...\n');
    
    // 获取规则库
    const response = await fetch(`${API_BASE_URL}/api/rules`);
    const result = await response.json();
    
    if (!result.success) {
      console.log('❌ 获取规则失败');
      return;
    }
    
    const rules = result.data;
    console.log(`📊 总规则数: ${rules.length}\n`);
    
    // 找出库存相关规则
    const inventoryRules = rules.filter(rule => 
      (rule.category && rule.category.includes('库存')) ||
      (rule.intent_name && rule.intent_name.includes('库存'))
    );
    
    console.log(`📋 库存相关规则: ${inventoryRules.length}条\n`);
    
    // 检查每条库存规则的字段问题
    const fieldIssues = [];
    
    inventoryRules.forEach((rule, index) => {
      console.log(`规则${index + 1}: ${rule.intent_name}`);
      
      const sql = rule.action_target || '';
      console.log(`SQL片段: ${sql.substring(0, 200)}...`);
      
      // 检查关键字段问题
      const issues = [];
      
      // 1. 检查到期时间字段
      if (sql.includes('到期时间')) {
        if (sql.includes('未设置')) {
          issues.push('到期时间显示"未设置"，应该计算实际到期日期');
        }
        if (sql.includes('inbound_time') && sql.includes('到期时间')) {
          issues.push('到期时间错误使用inbound_time，应该使用计算字段');
        }
      } else {
        issues.push('缺少"到期时间"字段');
      }
      
      // 2. 检查工厂和仓库字段
      if (sql.includes('storage_location') && sql.includes('工厂') && sql.includes('仓库')) {
        issues.push('工厂和仓库都使用storage_location，需要区分');
      }
      
      // 3. 检查物料编码和物料名称
      if (!sql.includes('物料编码')) {
        issues.push('缺少"物料编码"字段');
      }
      if (!sql.includes('物料名称')) {
        issues.push('缺少"物料名称"字段');
      }
      
      // 4. 检查供应商字段
      if (!sql.includes('供应商')) {
        issues.push('缺少"供应商"字段');
      }
      
      if (issues.length > 0) {
        console.log(`   ❌ 发现问题:`);
        issues.forEach(issue => console.log(`      - ${issue}`));
        fieldIssues.push({
          rule: rule,
          issues: issues
        });
      } else {
        console.log(`   ✅ 字段正常`);
      }
      
      console.log('');
    });
    
    // 生成修复SQL
    if (fieldIssues.length > 0) {
      console.log('🔧 需要修复的规则:\n');
      generateFixSQL(fieldIssues);
    } else {
      console.log('✅ 所有库存规则字段都正常');
    }
    
  } catch (error) {
    console.error('❌ 检查过程中出现错误:', error);
  }
}

function generateFixSQL(fieldIssues) {
  console.log('-- 修复库存规则字段映射的SQL语句\n');
  
  fieldIssues.forEach((item, index) => {
    const rule = item.rule;
    console.log(`-- 修复规则: ${rule.intent_name}`);
    
    // 生成正确的库存查询SQL模板
    const correctSQL = `
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
LIMIT 50`;
    
    console.log(`UPDATE nlp_intent_rules SET action_target = '${correctSQL.trim()}' WHERE id = ${rule.id};\n`);
  });
  
  console.log('-- 执行以上SQL语句来修复字段映射问题');
}

checkFieldMismatch();
