/**
 * 检查上线查询的SQL模板
 */

const API_BASE_URL = 'http://localhost:3001';

async function checkOnlineQuerySQL() {
  try {
    console.log('🔍 检查上线查询的SQL模板...\n');
    
    // 1. 获取所有规则
    console.log('1️⃣ 获取所有规则...');
    const rulesResponse = await fetch(`${API_BASE_URL}/api/rules`);
    const rulesResult = await rulesResponse.json();
    
    if (rulesResult.success && rulesResult.data) {
      const rules = rulesResult.data;
      
      // 查找上线相关的规则
      const onlineRules = rules.filter(rule => 
        rule.intent_name && (
          rule.intent_name.includes('上线') || 
          rule.intent_name.includes('在线') ||
          rule.intent_name.includes('跟踪')
        )
      );
      
      console.log(`找到 ${onlineRules.length} 条上线相关规则:`);
      
      onlineRules.forEach(rule => {
        console.log(`\n规则: ${rule.intent_name} (ID: ${rule.id})`);
        console.log(`描述: ${rule.description || '无描述'}`);
        console.log(`SQL模板:`);
        console.log(rule.action_target);
        console.log('─'.repeat(60));
      });
      
      // 2. 测试"查询上线信息"具体匹配到哪个规则
      console.log('\n2️⃣ 测试"查询上线信息"匹配的规则...');
      const queryResponse = await fetch(`${API_BASE_URL}/api/assistant/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '查询上线信息' })
      });
      
      const queryResult = await queryResponse.json();
      
      if (queryResult.success) {
        console.log(`✅ 查询成功，返回 ${queryResult.data?.tableData?.length || 0} 条记录`);
        
        // 检查是否有匹配的规则信息
        if (queryResult.matchedRule) {
          console.log(`匹配的规则: ${queryResult.matchedRule}`);
        }
        
        // 检查SQL执行情况
        if (queryResult.executedSQL) {
          console.log(`执行的SQL: ${queryResult.executedSQL}`);
        }
      } else {
        console.log('❌ 查询失败:', queryResult.message);
      }
      
      // 3. 分析LIMIT设置
      console.log('\n3️⃣ 分析LIMIT设置...');
      onlineRules.forEach(rule => {
        const sql = rule.action_target;
        const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
        
        if (limitMatch) {
          const limitValue = parseInt(limitMatch[1]);
          console.log(`${rule.intent_name}: LIMIT ${limitValue}`);
          
          if (limitValue > 100) {
            console.log(`  ⚠️  LIMIT值过高: ${limitValue}`);
          } else if (limitValue > 50) {
            console.log(`  ⚠️  LIMIT值较高: ${limitValue}`);
          } else {
            console.log(`  ✅ LIMIT值合理: ${limitValue}`);
          }
        } else {
          console.log(`${rule.intent_name}: ❌ 没有LIMIT限制`);
        }
      });
      
      // 4. 检查production_tracking表的实际记录数
      console.log('\n4️⃣ 检查production_tracking表的实际记录数...');
      const countResponse = await fetch(`${API_BASE_URL}/api/db-execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: 'SELECT COUNT(*) as total FROM production_tracking'
        })
      });
      
      if (countResponse.ok) {
        const countResult = await countResponse.json();
        const totalRecords = countResult.result[0].total;
        console.log(`production_tracking表总记录数: ${totalRecords}`);
        
        if (totalRecords === 1056) {
          console.log('✅ 记录数符合预期');
        } else if (totalRecords > 1056) {
          console.log(`⚠️  记录数超出预期，可能有重复数据: ${totalRecords - 1056} 条多余`);
        } else {
          console.log(`⚠️  记录数少于预期: 缺少 ${1056 - totalRecords} 条`);
        }
      }
      
    } else {
      console.log('❌ 获取规则失败');
    }
    
  } catch (error) {
    console.error('❌ 检查过程中出现错误:', error);
  }
}

checkOnlineQuerySQL();
