# 后端规则多维度验证脚本
Write-Host "🔍 开始后端规则多维度验证..." -ForegroundColor Green
Write-Host ""

$testResults = @()

# 测试1: 查看所有供应商
Write-Host "================================================================================" -ForegroundColor Yellow
Write-Host "[1/6] 测试规则485: 查看所有供应商" -ForegroundColor Cyan
Write-Host "分类: 数据探索" -ForegroundColor Gray
Write-Host "描述: 应该返回所有不重复的供应商，无数量限制" -ForegroundColor Gray
Write-Host "================================================================================" -ForegroundColor Yellow

try {
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/rules/test/485" -Method POST -ContentType "application/json" -Body '{}'
    
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
                if ($field -notmatch '[\u4e00-\u9fa5]') {
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
        
        $isDataExploration = $true
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
        
        $expectedFields = @("供应商", "记录数量")
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
        Write-Host "📊 规则485总体状态: $(if ($overallPass) { '✅ 通过' } else { '❌ 需要修复' })" -ForegroundColor $(if ($overallPass) { 'Green' } else { 'Red' })
        
        # 记录结果
        $testResults += [PSCustomObject]@{
            RuleId = 485
            RuleName = "查看所有供应商"
            Category = "数据探索"
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

# 测试2: 查看所有物料
Write-Host "================================================================================" -ForegroundColor Yellow
Write-Host "[2/6] 测试规则480: 查看所有物料" -ForegroundColor Cyan
Write-Host "分类: 数据探索" -ForegroundColor Gray
Write-Host "描述: 应该返回所有不重复的物料，无数量限制" -ForegroundColor Gray
Write-Host "================================================================================" -ForegroundColor Yellow

try {
    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/rules/test/480" -Method POST -ContentType "application/json" -Body '{}'
    
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
                if ($field -notmatch '[\u4e00-\u9fa5]') {
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
        
        $isDataExploration = $true
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
        
        $expectedFields = @("物料名称", "物料编码", "记录数量")
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
        Write-Host "📊 规则480总体状态: $(if ($overallPass) { '✅ 通过' } else { '❌ 需要修复' })" -ForegroundColor $(if ($overallPass) { 'Green' } else { 'Red' })
        
        # 记录结果
        $testResults += [PSCustomObject]@{
            RuleId = 480
            RuleName = "查看所有物料"
            Category = "数据探索"
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
