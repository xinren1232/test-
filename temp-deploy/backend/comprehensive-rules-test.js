/**
 * 全面测试134条规则的功能和数据调取
 * 检查规则的SQL查询、参数提取、数据返回等
 */

import mysql from 'mysql2/promise';

// 数据库配置
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection',
    port: 3306
};

// 创建数据库连接
const connection = await mysql.createConnection(dbConfig);

async function testAllRules() {
    console.log('🔍 开始全面测试所有规则...\n');
    
    try {
        // 1. 检查规则总数
        const [ruleCount] = await connection.execute(
            'SELECT COUNT(*) as total FROM nlp_intent_rules WHERE status = "active"'
        );
        console.log(`📊 活跃规则总数: ${ruleCount[0].total}`);

        // 2. 获取所有规则
        const [rules] = await connection.execute(`
            SELECT id, intent_name as rule_name, category, action_type, action_target as sql_template,
                   parameters, trigger_words, example_query as example_questions
            FROM nlp_intent_rules
            WHERE status = "active" OR status IS NULL
            ORDER BY category, intent_name
        `);
        
        console.log(`\n📋 开始逐一测试 ${rules.length} 条规则:\n`);
        
        let successCount = 0;
        let failureCount = 0;
        const failedRules = [];
        
        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            console.log(`\n${i + 1}. 测试规则: ${rule.rule_name}`);
            console.log(`   分类: ${rule.category}`);
            console.log(`   动作类型: ${rule.action_type}`);
            
            try {
                // 测试SQL模板
                if (rule.sql_template) {
                    const testResult = await testRuleSQL(rule);
                    if (testResult.success) {
                        console.log(`   ✅ SQL测试通过 - 返回 ${testResult.rowCount} 条数据`);
                        successCount++;
                    } else {
                        console.log(`   ❌ SQL测试失败: ${testResult.error}`);
                        failureCount++;
                        failedRules.push({
                            id: rule.id,
                            name: rule.rule_name,
                            error: testResult.error,
                            sql: rule.sql_template
                        });
                    }
                } else {
                    console.log(`   ⚠️  无SQL模板`);
                    failureCount++;
                    failedRules.push({
                        id: rule.id,
                        name: rule.rule_name,
                        error: '缺少SQL模板',
                        sql: null
                    });
                }
                
                // 测试参数提取
                if (rule.parameters) {
                    try {
                        const params = JSON.parse(rule.parameters);
                        console.log(`   📝 参数配置: ${Object.keys(params).join(', ')}`);
                    } catch (e) {
                        console.log(`   ⚠️  参数格式错误: ${e.message}`);
                    }
                }
                
                // 测试触发词
                if (rule.trigger_words) {
                    try {
                        const triggers = JSON.parse(rule.trigger_words);
                        console.log(`   🔤 触发词数量: ${triggers.length}`);
                    } catch (e) {
                        console.log(`   ⚠️  触发词格式错误: ${e.message}`);
                    }
                }
                
            } catch (error) {
                console.log(`   ❌ 规则测试异常: ${error.message}`);
                failureCount++;
                failedRules.push({
                    id: rule.id,
                    name: rule.rule_name,
                    error: error.message,
                    sql: rule.sql_template
                });
            }
        }
        
        // 输出测试总结
        console.log('\n' + '='.repeat(80));
        console.log('📊 测试总结报告');
        console.log('='.repeat(80));
        console.log(`总规则数: ${rules.length}`);
        console.log(`成功: ${successCount} (${(successCount/rules.length*100).toFixed(1)}%)`);
        console.log(`失败: ${failureCount} (${(failureCount/rules.length*100).toFixed(1)}%)`);
        
        if (failedRules.length > 0) {
            console.log('\n❌ 失败规则详情:');
            failedRules.forEach((rule, index) => {
                console.log(`\n${index + 1}. ${rule.name} (ID: ${rule.id})`);
                console.log(`   错误: ${rule.error}`);
                if (rule.sql) {
                    console.log(`   SQL: ${rule.sql.substring(0, 100)}...`);
                }
            });
        }
        
        // 按分类统计
        console.log('\n📈 按分类统计:');
        const categoryStats = {};
        rules.forEach(rule => {
            if (!categoryStats[rule.category]) {
                categoryStats[rule.category] = { total: 0, success: 0, failed: 0 };
            }
            categoryStats[rule.category].total++;
            
            const isFailed = failedRules.some(f => f.id === rule.id);
            if (isFailed) {
                categoryStats[rule.category].failed++;
            } else {
                categoryStats[rule.category].success++;
            }
        });
        
        Object.entries(categoryStats).forEach(([category, stats]) => {
            const successRate = (stats.success / stats.total * 100).toFixed(1);
            console.log(`${category}: ${stats.success}/${stats.total} (${successRate}%)`);
        });
        
    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error);
    } finally {
        await connection.end();
    }
}

async function testRuleSQL(rule) {
    try {
        let sql = rule.sql_template;
        
        // 替换常见的参数占位符为测试值
        const testParams = {
            '${material_code}': 'LCD_BOE_001',
            '${supplier_name}': 'BOE',
            '${factory_name}': '深圳工厂',
            '${batch_number}': 'BATCH001',
            '${project_name}': 'Project_A',
            '${baseline_name}': 'Baseline_1',
            '${material_name}': 'LCD显示屏',
            '${category}': '光学类',
            '${status}': '正常',
            '${test_result}': 'NG'
        };
        
        // 替换参数
        Object.entries(testParams).forEach(([param, value]) => {
            sql = sql.replace(new RegExp(param.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), `'${value}'`);
        });
        
        // 移除可能的LIMIT限制进行测试
        sql = sql.replace(/LIMIT\s+\d+/gi, 'LIMIT 5');
        
        // 执行查询
        const [rows] = await connection.execute(sql);
        
        return {
            success: true,
            rowCount: rows.length,
            data: rows.slice(0, 2) // 只返回前2条作为示例
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// 运行测试
testAllRules().catch(console.error);
