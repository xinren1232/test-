import fetch from 'node-fetch';

async function debugRuleMatching() {
    console.log('🔍 调试规则匹配过程...\n');
    
    const testQueries = [
        "深圳工厂的库存情况",
        "深圳工厂",
        "供应商库存"
    ];
    
    for (const query of testQueries) {
        console.log(`🧪 测试查询: "${query}"`);
        
        try {
            const response = await fetch('http://localhost:3001/api/assistant/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query })
            });
            
            const result = await response.json();
            
            console.log(`📊 匹配结果:`);
            console.log(`  - 匹配规则: ${result.matchedRule || '未知'}`);
            console.log(`  - 数据源: ${result.source || '未知'}`);
            console.log(`  - 分析模式: ${result.analysisMode || '未知'}`);
            console.log(`  - 结果数量: ${result.data ? result.data.length : 0}`);
            console.log(`  - 回复长度: ${result.reply ? result.reply.length : 0} 字符`);

            if (result.intentResult) {
                console.log(`  - 意图处理成功: ${result.intentResult.success}`);
                console.log(`  - 意图名称: ${result.intentResult.intent || '未知'}`);
                console.log(`  - 意图来源: ${result.intentResult.source || '未知'}`);
                if (result.intentResult.resultCount !== undefined) {
                    console.log(`  - 查询结果数: ${result.intentResult.resultCount}`);
                }
            }
            
        } catch (error) {
            console.log(`❌ 查询失败: ${error.message}`);
        }
        
        console.log('');
    }
}

debugRuleMatching().catch(console.error);
