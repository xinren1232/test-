// 通过API检查规则
const http = require('http');

function getRules() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/rules',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

async function checkRulesAPI() {
  try {
    console.log('🔍 通过API获取规则列表...\n');
    
    const response = await getRules();
    
    if (response.success) {
      const rules = response.data;
      console.log(`✅ 获取到 ${rules.length} 条规则:\n`);
      
      rules.forEach((rule, index) => {
        console.log(`${index + 1}. 规则: ${rule.intent_name}`);
        console.log(`   描述: ${rule.description || 'N/A'}`);
        console.log(`   触发词: ${rule.trigger_words || 'N/A'}`);
        console.log(`   示例查询: ${rule.example_query || 'N/A'}`);
        console.log(`   目标: ${rule.action_target || 'N/A'}`);
        console.log(`   优先级: ${rule.priority || 'N/A'}`);
        console.log('');
      });
      
      // 分析规则匹配问题
      console.log('🧪 分析规则匹配问题:\n');
      
      const problemQueries = [
        { query: '显示检验结果', expected: '检验数据基础查询' },
        { query: '查询不合格产品', expected: '检验数据基础查询' },
        { query: '显示生产异常情况', expected: '生产数据基础查询' },
        { query: '生产数据统计', expected: '生产数据基础查询' }
      ];
      
      for (const test of problemQueries) {
        console.log(`🔍 查询: "${test.query}"`);
        console.log(`   期望匹配: ${test.expected}`);
        
        let matchedRule = null;
        for (const rule of rules) {
          let triggerWords = [];
          
          if (rule.trigger_words) {
            if (typeof rule.trigger_words === 'string') {
              try {
                // 尝试解析JSON
                const parsed = JSON.parse(rule.trigger_words);
                triggerWords = Array.isArray(parsed) ? parsed : [parsed];
              } catch (e) {
                // 如果不是JSON，按逗号分割
                triggerWords = rule.trigger_words.split(',').map(w => w.trim());
              }
            } else if (Array.isArray(rule.trigger_words)) {
              triggerWords = rule.trigger_words;
            }
          }
          
          if (triggerWords.some(word => test.query.includes(word))) {
            matchedRule = rule;
            break;
          }
        }
        
        if (!matchedRule) {
          matchedRule = rules.find(r => r.intent_name.includes('库存')) || rules[0];
        }
        
        console.log(`   实际匹配: ${matchedRule?.intent_name}`);
        console.log(`   匹配正确: ${matchedRule?.intent_name === test.expected ? '✅' : '❌'}`);
        console.log('');
      }
      
    } else {
      console.log('❌ 获取规则失败:', response);
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkRulesAPI();
