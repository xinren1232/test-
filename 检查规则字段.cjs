/**
 * 规则字段检查脚本 (CommonJS版本)
 */

const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 前端场景字段标准
const EXPECTED_FIELDS = {
  '库存场景': ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
  '测试场景': ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'],
  '上线场景': ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注'],
  '批次场景': ['批次号', '物料编码', '物料名称', '供应商', '数量', '入库日期', '产线异常', '测试异常', '备注']
};

async function checkRuleFields() {
  let connection;
  
  try {
    console.log('🔄 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 获取所有活跃规则
    console.log('📋 获取规则列表...');
    const [rules] = await connection.execute(`
      SELECT 
        id,
        intent_name,
        description,
        action_type,
        action_target,
        category
      FROM nlp_intent_rules 
      WHERE status = 'active'
      ORDER BY id ASC
      LIMIT 20
    `);
    
    console.log(`\n📊 找到 ${rules.length} 条规则 (显示前20条):\n`);
    
    let problemRules = [];
    
    // 分析每个规则
    rules.forEach((rule, index) => {
      console.log(`${index + 1}. [ID:${rule.id}] ${rule.intent_name}`);
      console.log(`   类型: ${rule.action_type}`);
      console.log(`   分类: ${rule.category || '未分类'}`);
      
      if (rule.action_type === 'SQL_QUERY' && rule.action_target) {
        // 分析SQL字段
        const hasChineseFields = /as\s+[\u4e00-\u9fa5]+/i.test(rule.action_target);
        const hasSelectStar = /SELECT\s+\*/i.test(rule.action_target);
        
        console.log(`   中文字段: ${hasChineseFields ? '✅' : '❌'}`);
        console.log(`   SELECT *: ${hasSelectStar ? '❌ 需要明确字段' : '✅'}`);
        
        // 检查是否符合场景字段要求
        let matchedScenario = null;
        for (const [scenario, keywords] of Object.entries({
          '库存场景': ['库存', '物料库存', 'inventory'],
          '测试场景': ['测试', 'NG', '不合格', 'lab_tests'],
          '上线场景': ['上线', '生产', 'production'],
          '批次场景': ['批次', 'batch']
        })) {
          if (keywords.some(keyword => 
            rule.intent_name.toLowerCase().includes(keyword.toLowerCase()) ||
            (rule.action_target && rule.action_target.toLowerCase().includes(keyword.toLowerCase()))
          )) {
            matchedScenario = scenario;
            break;
          }
        }
        
        if (matchedScenario) {
          console.log(`   匹配场景: ${matchedScenario}`);
          const expectedFields = EXPECTED_FIELDS[matchedScenario];
          
          // 检查字段完整性
          let missingFields = [];
          expectedFields.forEach(field => {
            if (!rule.action_target.includes(field)) {
              missingFields.push(field);
            }
          });
          
          if (missingFields.length > 0) {
            console.log(`   ❌ 缺少字段: ${missingFields.join(', ')}`);
            problemRules.push({
              id: rule.id,
              name: rule.intent_name,
              scenario: matchedScenario,
              missingFields: missingFields,
              hasChineseFields: hasChineseFields
            });
          } else {
            console.log(`   ✅ 字段完整`);
          }
        } else {
          console.log(`   ⚠️ 未匹配到场景`);
        }
        
        // 显示SQL片段
        const sqlPreview = rule.action_target.substring(0, 150).replace(/\s+/g, ' ');
        console.log(`   SQL: ${sqlPreview}...`);
      }
      
      console.log(''); // 空行分隔
    });
    
    // 问题规则汇总
    console.log('🔍 问题规则汇总:');
    console.log(`总检查规则: ${rules.length}`);
    console.log(`问题规则数: ${problemRules.length}`);
    
    if (problemRules.length > 0) {
      console.log('\n❌ 需要修复的规则:');
      problemRules.forEach((rule, index) => {
        console.log(`${index + 1}. [ID:${rule.id}] ${rule.name}`);
        console.log(`   场景: ${rule.scenario}`);
        console.log(`   缺少字段: ${rule.missingFields.join(', ')}`);
        console.log(`   中文字段: ${rule.hasChineseFields ? '有' : '无'}`);
        console.log('');
      });
    }
    
    // 统计分析
    const sqlRules = rules.filter(r => r.action_type === 'SQL_QUERY');
    const categorized = rules.filter(r => r.category && r.category !== '');
    
    console.log('📈 统计信息:');
    console.log(`   总规则数: ${rules.length}`);
    console.log(`   SQL规则: ${sqlRules.length}`);
    console.log(`   已分类: ${categorized.length}`);
    console.log(`   未分类: ${rules.length - categorized.length}`);
    console.log(`   问题规则: ${problemRules.length}`);
    console.log(`   完好规则: ${rules.length - problemRules.length}`);
    
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    console.error('详细错误:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ 数据库连接已关闭');
    }
  }
}

// 运行检查
checkRuleFields().catch(console.error);
