// 通过示例问题验证后端规则效果
// 使用PowerShell调用API进行测试

const testCases = [
  // 数据探索类规则
  {
    ruleId: 485,
    name: '查看所有供应商',
    category: '数据探索',
    expectedFields: ['供应商', '记录数量'],
    description: '应该返回所有不重复的供应商，无数量限制',
    testType: 'noParam'
  },
  {
    ruleId: 480,
    name: '查看所有物料',
    category: '数据探索', 
    expectedFields: ['物料名称', '物料编码', '记录数量'],
    description: '应该返回所有不重复的物料，无数量限制',
    testType: 'noParam'
  },
  
  // 库存场景规则
  {
    ruleId: 243,
    name: '物料库存信息查询_优化',
    category: '库存场景',
    expectedFields: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
    description: '库存页面字段设计，需要参数',
    testType: 'withParam',
    testParam: '电池'
  },
  {
    ruleId: 324,
    name: '供应商库存查询_优化',
    category: '库存场景',
    expectedFields: ['工厂', '仓库', '物料编码', '物料名称', '供应商', '数量', '状态', '入库时间', '到期时间', '备注'],
    description: '库存页面字段设计，供应商查询',
    testType: 'withParam',
    testParam: '聚龙'
  },
  
  // 测试场景规则
  {
    ruleId: 314,
    name: 'Top缺陷排行查询',
    category: '测试场景',
    expectedFields: ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'],
    description: '测试页面字段设计，缺陷排行',
    testType: 'withParam',
    testParam: 'LCD'
  },
  {
    ruleId: 335,
    name: '光学类上线情况查询',
    category: '测试场景',
    expectedFields: ['测试编号', '日期', '项目', '基线', '物料编码', '数量', '物料名称', '供应商', '测试结果', '不合格描述', '备注'],
    description: '测试页面字段设计，光学类查询',
    testType: 'withParam',
    testParam: 'LCD'
  }
];

console.log('🔍 开始通过示例问题验证后端规则效果...');
console.log(`📋 将测试 ${testCases.length} 个关键规则\n`);

// 生成PowerShell测试脚本
const powershellScript = `
# 后端规则多维度验证脚本
Write-Host "🔍 开始后端规则多维度验证..." -ForegroundColor Green
Write-Host ""

$testResults = @()

${testCases.map((testCase, index) => `
# 测试${index + 1}: ${testCase.name}
Write-Host "${'='.repeat(80)}" -ForegroundColor Yellow
Write-Host "[${index + 1}/${testCases.length}] 测试规则${testCase.ruleId}: ${testCase.name}" -ForegroundColor Cyan
Write-Host "分类: ${testCase.category}" -ForegroundColor Gray
Write-Host "描述: ${testCase.description}" -ForegroundColor Gray
Write-Host "${'='.repeat(80)}" -ForegroundColor Yellow

try {
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/rules/test/${testCase.ruleId}" -Method POST -ContentType "application/json" -Body '{}'
    
    if ($result.success) {
        $data = $result.data
        
        # 维度1: 完整性检查
        Write-Host ""
        Write-Host "🔍 维度1: 完整性检查" -ForegroundColor Blue
        
        $hasData = $data.resultCount -gt 0
        $hasFields = $data.fields -and $data.fields.Count -gt 0
        $hasChineseFields = $true
        
        if ($hasFields) {
            foreach ($field in $data.fields) {
                if ($field -notmatch '[\\u4e00-\\u9fa5]') {
                    $hasChineseFields = $false
                    break
                }
            }
        }
        
        Write-Host "   数据完整性: $(if ($hasData) { '✅ 有数据' } else { '❌ 无数据' })"
        Write-Host "   字段完整性: $(if ($hasFields) { '✅ 有字段' } else { '❌ 无字段' })"
        Write-Host "   中文字段: $(if ($hasChineseFields) { '✅ 全部中文' } else { '❌ 包含非中文' })"
        
        # 维度2: 真实数据调用
        Write-Host ""
        Write-Host "🗄️ 维度2: 真实数据调用" -ForegroundColor Blue
        Write-Host "   数据源: $($data.dataSource)"
        Write-Host "   记录数量: $($data.resultCount)"
        Write-Host "   真实数据: $(if ($data.resultCount -gt 0) { '✅ 有真实数据' } else { '⚠️ 无数据返回' })"
        
        # 维度3: 数量限制检查
        Write-Host ""
        Write-Host "📊 维度3: 数量限制检查" -ForegroundColor Blue
        
        $isDataExploration = "${testCase.category}" -eq "数据探索"
        $hasReasonableLimit = $true
        
        if ($isDataExploration -and $data.resultCount -eq 10) {
            $hasReasonableLimit = $false
            Write-Host "   数量限制: ❌ 数据探索类不应限制为10条"
        } elseif ($isDataExploration) {
            Write-Host "   数量限制: ✅ 数据探索类无限制"
        } else {
            Write-Host "   数量限制: ✅ 查询类规则限制合理"
        }
        
        # 维度4: 场景字段设计呈现
        Write-Host ""
        Write-Host "🎯 维度4: 场景字段设计呈现" -ForegroundColor Blue
        
        $expectedFields = @(${testCase.expectedFields.map(field => `"${field}"`).join(', ')})
        $actualFields = $data.fields
        
        Write-Host "   期望字段 ($($expectedFields.Count)): $($expectedFields -join ', ')"
        Write-Host "   实际字段 ($($actualFields.Count)): $($actualFields -join ', ')"
        
        $missingFields = @()
        $extraFields = @()
        
        foreach ($field in $expectedFields) {
            if ($actualFields -notcontains $field) {
                $missingFields += $field
            }
        }
        
        foreach ($field in $actualFields) {
            if ($expectedFields -notcontains $field) {
                $extraFields += $field
            }
        }
        
        $fieldMatch = $missingFields.Count -eq 0
        Write-Host "   字段匹配: $(if ($fieldMatch) { '✅ 完全匹配' } else { '❌ 不匹配' })"
        
        if ($missingFields.Count -gt 0) {
            Write-Host "   缺少字段: $($missingFields -join ', ')" -ForegroundColor Red
        }
        
        if ($extraFields.Count -gt 0) {
            Write-Host "   额外字段: $($extraFields -join ', ')" -ForegroundColor Yellow
        }
        
        # 数据样本
        if ($data.tableData -and $data.tableData.Count -gt 0) {
            Write-Host ""
            Write-Host "📄 数据样本:" -ForegroundColor Blue
            $sample = $data.tableData[0]
            $sample.PSObject.Properties | ForEach-Object {
                $value = if ($_.Value -eq $null) { "NULL" } elseif ($_.Value -eq "") { "(空字符串)" } else { $_.Value }
                Write-Host "     $($_.Name): $value"
            }
        }
        
        # 总体评估
        Write-Host ""
        $overallPass = $hasData -and $hasChineseFields -and $hasReasonableLimit -and $fieldMatch
        Write-Host "📊 规则${testCase.ruleId}总体状态: $(if ($overallPass) { '✅ 通过' } else { '❌ 需要修复' })" -ForegroundColor $(if ($overallPass) { 'Green' } else { 'Red' })
        
        # 记录结果
        $testResults += [PSCustomObject]@{
            RuleId = ${testCase.ruleId}
            RuleName = "${testCase.name}"
            Category = "${testCase.category}"
            HasData = $hasData
            HasChineseFields = $hasChineseFields
            ReasonableLimit = $hasReasonableLimit
            FieldMatch = $fieldMatch
            OverallPass = $overallPass
            RecordCount = $data.resultCount
        }
        
    } else {
        Write-Host "❌ API调用失败: $($result.message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ 测试异常: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
`).join('')}

# 生成综合报告
Write-Host "📊 综合测试报告" -ForegroundColor Green
Write-Host "${'='.repeat(100)}" -ForegroundColor Yellow

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.OverallPass }).Count

Write-Host ""
Write-Host "📈 总体统计 ($totalTests 个规则):" -ForegroundColor Cyan
Write-Host "   完全通过: $passedTests/$totalTests ($([math]::Round($passedTests/$totalTests*100, 1))%)"
Write-Host "   存在问题: $($totalTests - $passedTests)/$totalTests ($([math]::Round(($totalTests - $passedTests)/$totalTests*100, 1))%)"

Write-Host ""
Write-Host "🔍 各维度统计:" -ForegroundColor Cyan
$hasDataCount = ($testResults | Where-Object { $_.HasData }).Count
$chineseFieldsCount = ($testResults | Where-Object { $_.HasChineseFields }).Count
$reasonableLimitCount = ($testResults | Where-Object { $_.ReasonableLimit }).Count
$fieldMatchCount = ($testResults | Where-Object { $_.FieldMatch }).Count

Write-Host "   有数据返回: $hasDataCount/$totalTests ($([math]::Round($hasDataCount/$totalTests*100, 1))%)"
Write-Host "   中文字段: $chineseFieldsCount/$totalTests ($([math]::Round($chineseFieldsCount/$totalTests*100, 1))%)"
Write-Host "   合理限制: $reasonableLimitCount/$totalTests ($([math]::Round($reasonableLimitCount/$totalTests*100, 1))%)"
Write-Host "   字段匹配: $fieldMatchCount/$totalTests ($([math]::Round($fieldMatchCount/$totalTests*100, 1))%)"

Write-Host ""
Write-Host "📋 按分类统计:" -ForegroundColor Cyan
$categories = $testResults | Group-Object Category
foreach ($category in $categories) {
    $categoryPassed = ($category.Group | Where-Object { $_.OverallPass }).Count
    $categoryTotal = $category.Count
    Write-Host "   $($category.Name): $categoryPassed/$categoryTotal 通过 ($([math]::Round($categoryPassed/$categoryTotal*100, 1))%)"
}

Write-Host ""
if ($passedTests -eq $totalTests) {
    Write-Host "🎉 所有规则测试通过！后端规则质量优秀！" -ForegroundColor Green
} elseif ($passedTests/$totalTests -ge 0.8) {
    Write-Host "⚠️ 大部分规则正常，少数需要优化" -ForegroundColor Yellow
} else {
    Write-Host "❌ 多个规则存在问题，需要重点修复" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 需要关注的规则:" -ForegroundColor Cyan
$problemRules = $testResults | Where-Object { -not $_.OverallPass }
foreach ($rule in $problemRules) {
    Write-Host "   规则$($rule.RuleId) ($($rule.Category)): $($rule.RuleName)"
}

Write-Host ""
Write-Host "🎉 多维度验证完成！" -ForegroundColor Green
`;

console.log('📝 生成的PowerShell测试脚本已准备完成');
console.log('🚀 开始执行测试...\n');

// 将脚本写入文件并执行
require('fs').writeFileSync('规则验证测试.ps1', powershellScript, 'utf8');

console.log('✅ PowerShell脚本已生成: 规则验证测试.ps1');
console.log('💡 请运行以下命令执行测试:');
console.log('   powershell -ExecutionPolicy Bypass -File 规则验证测试.ps1');
