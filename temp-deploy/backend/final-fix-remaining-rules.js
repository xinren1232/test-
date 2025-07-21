/**
 * 最终修复剩余的失败规则
 */

import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection',
    port: 3306
};

async function finalFixRules() {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        console.log('🔧 开始最终修复剩余的失败规则...\n');
        
        // 获取所有规则并逐一修复
        const [rules] = await connection.execute(`
            SELECT id, intent_name, action_target 
            FROM nlp_intent_rules 
            ORDER BY id
        `);
        
        let fixedCount = 0;
        
        for (const rule of rules) {
            let sql = rule.action_target;
            let needsUpdate = false;
            let originalSql = sql;
            
            // 1. 修复 online_tracking 表中的 '工厂' 字段问题
            if (sql.includes('FROM online_tracking') && sql.includes('工厂')) {
                sql = sql.replace(/工厂,?\s*/g, '');
                sql = sql.replace(/,\s*,/g, ',');
                sql = sql.replace(/SELECT\s*,/g, 'SELECT ');
                needsUpdate = true;
            }
            
            // 2. 修复 inventory 表中的字段
            if (sql.includes('FROM inventory')) {
                sql = sql.replace(/工厂/g, 'storage_location');
                sql = sql.replace(/仓库/g, 'storage_location');
                needsUpdate = true;
            }
            
            // 3. 修复字符集冲突
            if (sql.includes('批次号') && sql.includes('=')) {
                sql = sql.replace(/批次号\s*=\s*'([^']+)'/g, "batch_code COLLATE utf8mb4_unicode_ci = '$1'");
                sql = sql.replace(/batch_code\s*=\s*'([^']+)'/g, "batch_code COLLATE utf8mb4_unicode_ci = '$1'");
                needsUpdate = true;
            }
            
            // 4. 修复所有中文字段名
            const fieldMappings = {
                '物料编码': 'material_code',
                '物料名称': 'material_name',
                '供应商': 'supplier_name',
                '数量': 'quantity',
                '状态': 'status',
                '入库时间': 'inbound_time',
                '到期时间': 'inbound_time',
                '备注': 'notes',
                '基线': 'baseline',
                '项目': 'project',
                '批次号': 'batch_code',
                '不良率': 'defect_rate',
                '本周异常': 'exception_count',
                '检验日期': 'inspection_date',
                '入库日期': 'inbound_time',
                '产线异常': 'exception_count',
                '测试异常': 'defect_desc'
            };
            
            Object.entries(fieldMappings).forEach(([chinese, english]) => {
                if (sql.includes(chinese)) {
                    const regex = new RegExp(`\\b${chinese}\\b`, 'g');
                    sql = sql.replace(regex, english);
                    needsUpdate = true;
                }
            });
            
            // 5. 清理SQL语法问题
            sql = sql.replace(/,\s*FROM/g, ' FROM');
            sql = sql.replace(/SELECT\s*,/g, 'SELECT ');
            sql = sql.replace(/,\s*,/g, ',');
            
            // 更新规则
            if (needsUpdate && sql !== originalSql) {
                try {
                    await connection.execute(
                        'UPDATE nlp_intent_rules SET action_target = ? WHERE id = ?',
                        [sql, rule.id]
                    );
                    console.log(`✅ 修复规则 ${rule.id}: ${rule.intent_name}`);
                    fixedCount++;
                } catch (updateError) {
                    console.log(`❌ 更新失败 ${rule.id}: ${updateError.message}`);
                }
            }
        }
        
        console.log(`\n🎉 修复完成！共修复 ${fixedCount} 条规则`);
        
        // 快速测试几条规则
        console.log('\n🔍 测试修复结果...');
        await quickTest(connection);
        
    } catch (error) {
        console.error('❌ 修复过程中发生错误:', error);
    } finally {
        await connection.end();
    }
}

async function quickTest(connection) {
    const testRuleIds = [243, 302, 348, 394, 280]; // 测试几条代表性规则
    let successCount = 0;
    
    for (const ruleId of testRuleIds) {
        try {
            const [rules] = await connection.execute(
                'SELECT intent_name, action_target FROM nlp_intent_rules WHERE id = ?',
                [ruleId]
            );
            
            if (rules.length === 0) continue;
            
            const rule = rules[0];
            let sql = rule.action_target;
            
            // 简单参数替换
            sql = sql.replace(/\$\{[^}]+\}/g, "'test'");
            sql = sql.replace(/LIMIT\s+\d+/gi, 'LIMIT 1');
            
            const [rows] = await connection.execute(sql);
            console.log(`   ✅ ${rule.intent_name}: ${rows.length} 条数据`);
            successCount++;
            
        } catch (error) {
            console.log(`   ❌ 规则 ${ruleId}: ${error.message}`);
        }
    }
    
    console.log(`\n📊 测试结果: ${successCount}/${testRuleIds.length} 成功`);
}

finalFixRules().catch(console.error);
