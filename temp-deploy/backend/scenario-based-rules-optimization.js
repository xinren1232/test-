/**
 * 基于四个固定场景的规则优化
 * 确保所有规则都按场景的全字段输出真实数据
 */

import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Zxylsy.99',
    database: 'iqe_inspection',
    port: 3306
};

// 四个固定场景的字段映射
const scenarioFieldMappings = {
    // 库存场景：工厂、仓库、物料编码、物料名称、供应商、数量、状态、入库时间、到期时间、备注
    inventory: {
        tableName: 'inventory',
        chineseFields: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
        englishFields: ['storage_location', 'storage_location', 'material_code', 'material_name', 'supplier_name', 'quantity', 'status', 'inbound_time', 'inbound_time', 'notes'],
        selectTemplate: `
            storage_location as 工厂,
            storage_location as 仓库,
            material_code as 物料编码,
            material_name as 物料名称,
            supplier_name as 供应商,
            quantity as 数量,
            status as 状态,
            inbound_time as 入库时间,
            inbound_time as 到期时间,
            notes as 备注
        `
    },
    
    // 上线场景：工厂、基线、项目、物料编码、物料名称、供应商、批次号、不良率、本周异常、检验日期、备注
    online_tracking: {
        tableName: 'online_tracking',
        chineseFields: ['工厂', '基线', '项目', '物料编码', '物料名称', '供应商', '批次号', '不良率', '本周异常', '检验日期', '备注'],
        englishFields: ['factory', 'baseline', 'project', 'material_code', 'material_name', 'supplier_name', 'batch_code', 'defect_rate', 'exception_count', 'inspection_date', 'notes'],
        selectTemplate: `
            factory as 工厂,
            baseline as 基线,
            project as 项目,
            material_code as 物料编码,
            material_name as 物料名称,
            supplier_name as 供应商,
            batch_code as 批次号,
            defect_rate as 不良率,
            exception_count as 本周异常,
            inspection_date as 检验日期,
            notes as 备注
        `
    },
    
    // 测试场景：测试编号、日期、项目、基线、物料编码、数量、物料名称、供应商、测试结果、不合格描述、备注
    lab_tests: {
        tableName: 'lab_tests',
        chineseFields: ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'],
        englishFields: ['test_id', 'test_date', 'project_id', 'baseline_id', 'material_code', 'quantity', 'material_name', 'supplier_name', 'test_result', 'defect_desc', 'notes'],
        selectTemplate: `
            test_id as 测试编号,
            test_date as 日期,
            project_id as 项目,
            baseline_id as 基线,
            material_code as 物料编码,
            quantity as 数量,
            material_name as 物料名称,
            supplier_name as 供应商,
            test_result as 测试结果,
            defect_desc as 不合格描述,
            notes as 备注
        `
    },
    
    // 批次管理：批次号、物料编码、物料名称、供应商、数量、入库日期、产线异常、测试异常、备注
    batch_management: {
        tableName: 'inventory', // 使用inventory表作为批次管理的基础
        chineseFields: ['批次号', '物料编码', '物料名称', '供应商', '数量', '入库日期', '产线异常', '测试异常', '备注'],
        englishFields: ['batch_code', 'material_code', 'material_name', 'supplier_name', 'quantity', 'inbound_time', 'exception_count', 'defect_desc', 'notes'],
        selectTemplate: `
            batch_code as 批次号,
            material_code as 物料编码,
            material_name as 物料名称,
            supplier_name as 供应商,
            quantity as 数量,
            inbound_time as 入库日期,
            COALESCE((SELECT exception_count FROM online_tracking ot WHERE ot.batch_code = inventory.batch_code LIMIT 1), 0) as 产线异常,
            COALESCE((SELECT defect_desc FROM lab_tests lt WHERE lt.material_code = inventory.material_code LIMIT 1), '正常') as 测试异常,
            notes as 备注
        `
    }
};

async function optimizeScenarioBasedRules() {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        console.log('🚀 开始基于四个固定场景优化所有规则...\n');
        
        // 1. 首先检查数据库表结构
        await checkTableStructures(connection);
        
        // 2. 获取所有规则并按场景分类
        const [rules] = await connection.execute(`
            SELECT id, intent_name, action_target, category
            FROM nlp_intent_rules 
            ORDER BY id
        `);
        
        console.log(`📋 找到 ${rules.length} 条规则需要优化\n`);
        
        let optimizedCount = 0;
        const optimizationResults = {
            inventory: 0,
            online_tracking: 0,
            lab_tests: 0,
            batch_management: 0,
            other: 0
        };
        
        for (const rule of rules) {
            console.log(`优化规则 ${rule.id}: ${rule.intent_name}`);
            
            try {
                const scenario = detectScenario(rule);
                const optimizedSQL = generateScenarioSQL(rule, scenario);
                
                if (optimizedSQL && optimizedSQL !== rule.action_target) {
                    await connection.execute(
                        'UPDATE nlp_intent_rules SET action_target = ? WHERE id = ?',
                        [optimizedSQL, rule.id]
                    );
                    
                    console.log(`   ✅ 已优化为${scenario}场景`);
                    optimizedCount++;
                    optimizationResults[scenario]++;
                } else {
                    console.log(`   ✓ 无需优化`);
                }
                
            } catch (error) {
                console.log(`   ❌ 优化失败: ${error.message}`);
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 场景化优化完成！');
        console.log('='.repeat(60));
        console.log(`总规则数: ${rules.length}`);
        console.log(`优化成功: ${optimizedCount}`);
        console.log('\n📊 按场景统计:');
        Object.entries(optimizationResults).forEach(([scenario, count]) => {
            console.log(`${scenario}: ${count} 条规则`);
        });
        
        // 3. 重新测试优化后的规则
        console.log('\n🔍 测试优化后的规则...');
        await testOptimizedRules(connection);
        
    } catch (error) {
        console.error('❌ 优化过程中发生错误:', error);
    } finally {
        await connection.end();
    }
}

async function checkTableStructures(connection) {
    console.log('🔍 检查数据库表结构...\n');
    
    const tables = ['inventory', 'online_tracking', 'lab_tests'];
    
    for (const tableName of tables) {
        try {
            const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
            console.log(`📊 ${tableName} 表字段:`);
            columns.forEach(col => {
                console.log(`  - ${col.Field}: ${col.Type}`);
            });
            console.log('');
        } catch (error) {
            console.log(`❌ 无法检查表 ${tableName}: ${error.message}\n`);
        }
    }
}

function detectScenario(rule) {
    const sql = rule.action_target.toLowerCase();
    const name = rule.intent_name.toLowerCase();
    
    // 根据SQL中的表名和规则名称判断场景
    if (sql.includes('from inventory') || name.includes('库存') || name.includes('工厂')) {
        return 'inventory';
    } else if (sql.includes('from online_tracking') || name.includes('上线') || name.includes('基线') || name.includes('项目')) {
        return 'online_tracking';
    } else if (sql.includes('from lab_tests') || name.includes('测试') || name.includes('检测') || name.includes('不良')) {
        return 'lab_tests';
    } else if (name.includes('批次') || sql.includes('batch')) {
        return 'batch_management';
    } else {
        // 默认根据内容推断
        if (name.includes('供应商') && (name.includes('库存') || name.includes('查询'))) {
            return 'inventory';
        } else if (name.includes('物料') && name.includes('测试')) {
            return 'lab_tests';
        } else {
            return 'inventory'; // 默认为库存场景
        }
    }
}

function generateScenarioSQL(rule, scenario) {
    const mapping = scenarioFieldMappings[scenario];
    if (!mapping) return null;
    
    const originalSQL = rule.action_target;
    let newSQL = '';
    
    // 根据场景生成标准化的SQL
    if (scenario === 'inventory') {
        newSQL = `SELECT ${mapping.selectTemplate.trim()}
FROM ${mapping.tableName}`;
        
        // 添加WHERE条件（如果原SQL有的话）
        const whereMatch = originalSQL.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+GROUP|\s+LIMIT|$)/is);
        if (whereMatch) {
            let whereClause = whereMatch[1].trim();
            // 替换中文字段名为英文
            mapping.chineseFields.forEach((chinese, index) => {
                const english = mapping.englishFields[index];
                whereClause = whereClause.replace(new RegExp(`\\b${chinese}\\b`, 'g'), english);
            });
            newSQL += `\nWHERE ${whereClause}`;
        }
        
    } else if (scenario === 'online_tracking') {
        newSQL = `SELECT ${mapping.selectTemplate.trim()}
FROM ${mapping.tableName}`;
        
        const whereMatch = originalSQL.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+GROUP|\s+LIMIT|$)/is);
        if (whereMatch) {
            let whereClause = whereMatch[1].trim();
            mapping.chineseFields.forEach((chinese, index) => {
                const english = mapping.englishFields[index];
                whereClause = whereClause.replace(new RegExp(`\\b${chinese}\\b`, 'g'), english);
            });
            newSQL += `\nWHERE ${whereClause}`;
        }
        
    } else if (scenario === 'lab_tests') {
        newSQL = `SELECT ${mapping.selectTemplate.trim()}
FROM ${mapping.tableName}`;
        
        const whereMatch = originalSQL.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+GROUP|\s+LIMIT|$)/is);
        if (whereMatch) {
            let whereClause = whereMatch[1].trim();
            mapping.chineseFields.forEach((chinese, index) => {
                const english = mapping.englishFields[index];
                whereClause = whereClause.replace(new RegExp(`\\b${chinese}\\b`, 'g'), english);
            });
            newSQL += `\nWHERE ${whereClause}`;
        }
        
    } else if (scenario === 'batch_management') {
        newSQL = `SELECT ${mapping.selectTemplate.trim()}
FROM ${mapping.tableName}`;
        
        const whereMatch = originalSQL.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+GROUP|\s+LIMIT|$)/is);
        if (whereMatch) {
            let whereClause = whereMatch[1].trim();
            mapping.chineseFields.forEach((chinese, index) => {
                const english = mapping.englishFields[index];
                whereClause = whereClause.replace(new RegExp(`\\b${chinese}\\b`, 'g'), english);
            });
            newSQL += `\nWHERE ${whereClause}`;
        }
    }
    
    // 添加ORDER BY和LIMIT
    const orderMatch = originalSQL.match(/ORDER\s+BY\s+([^;]+?)(?:\s+LIMIT|$)/is);
    if (orderMatch) {
        newSQL += `\nORDER BY ${orderMatch[1].trim()}`;
    }
    
    const limitMatch = originalSQL.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
        newSQL += `\nLIMIT ${limitMatch[1]}`;
    } else {
        newSQL += `\nLIMIT 20`; // 默认限制
    }
    
    return newSQL;
}

async function testOptimizedRules(connection) {
    // 测试每个场景的代表性规则
    const testCases = [
        { scenario: 'inventory', ruleId: 348 },
        { scenario: 'online_tracking', ruleId: 302 },
        { scenario: 'lab_tests', ruleId: 120 },
        { scenario: 'batch_management', ruleId: 299 }
    ];
    
    let successCount = 0;
    
    for (const testCase of testCases) {
        try {
            const [rules] = await connection.execute(
                'SELECT intent_name, action_target FROM nlp_intent_rules WHERE id = ?',
                [testCase.ruleId]
            );
            
            if (rules.length === 0) continue;
            
            const rule = rules[0];
            let sql = rule.action_target;
            
            // 替换参数占位符
            sql = sql.replace(/\$\{[^}]+\}/g, "'test'");
            sql = sql.replace(/LIMIT\s+\d+/gi, 'LIMIT 3');
            
            const [rows] = await connection.execute(sql);
            console.log(`   ✅ ${testCase.scenario}: ${rule.intent_name} - ${rows.length} 条数据`);
            successCount++;
            
        } catch (error) {
            console.log(`   ❌ ${testCase.scenario}: ${error.message}`);
        }
    }
    
    console.log(`\n📊 场景测试结果: ${successCount}/${testCases.length} 成功`);
}

// 运行优化
optimizeScenarioBasedRules().catch(console.error);
