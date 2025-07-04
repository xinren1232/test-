const axios = require('axios');

async function testFixedRules() {
    console.log('🧪 测试修复后的规则...\n');
    
    const testQueries = [
        '重庆工厂有哪些库存？',
        '聚龙供应商的材料状态如何？',
        '风险状态的材料有哪些？'
    ];
    
    for (let i = 0; i < testQueries.length; i++) {
        const query = testQueries[i];
        console.log(`\n📝 测试查询 ${i + 1}: "${query}"`);
        
        try {
            const response = await axios.post('http://localhost:3001/api/assistant/query', {
                query: query
            }, {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = response.data;
            console.log(`✅ 状态: ${response.status}`);
            console.log(`📊 服务: ${result.service || '未知'}`);
            console.log(`📄 响应格式: ${result.response?.includes('📊 **查询结果**') ? '标准文本格式' : 'HTML格式'}`);
            console.log(`📝 响应长度: ${result.response?.length || 0} 字符`);
            
            if (result.response?.includes('📊 **查询结果**')) {
                console.log('🎉 使用智能意图服务 - 格式正确！');
            } else {
                console.log('⚠️ 可能使用规则服务 - 需要检查');
            }
            
        } catch (error) {
            console.log(`❌ 错误: ${error.message}`);
            if (error.code === 'ECONNABORTED') {
                console.log('⏰ 请求超时');
            } else if (error.code === 'ECONNREFUSED') {
                console.log('🔌 连接被拒绝 - 后端可能未运行');
            }
        }
    }
}

testFixedRules().catch(console.error);
