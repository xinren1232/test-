const a={baseURL:"https://api.deepseek.com",endpoint:"/chat/completions",apiKey:"sk-cab797574abf4288bcfaca253191565d",model:"deepseek-chat"};class h{constructor(){this.analysisTemplates=this.initializeAnalysisTemplates(),this.qualityFrameworks=this.initializeQualityFrameworks(),this.industryBestPractices=this.initializeIndustryBestPractices()}initializeAnalysisTemplates(){return{comprehensive:{name:"全面分析模板",description:"对8D报告进行全方位深度分析",sections:["executive_summary","dimension_analysis","quality_assessment","root_cause_evaluation","solution_effectiveness","prevention_adequacy","industry_comparison","improvement_recommendations"]},focused:{name:"重点分析模板",description:"重点分析关键维度和核心问题",sections:["executive_summary","critical_dimensions","root_cause_evaluation","solution_effectiveness","improvement_recommendations"]},compliance:{name:"合规性分析模板",description:"重点评估8D报告的合规性和标准符合度",sections:["compliance_check","standard_alignment","documentation_quality","process_adherence","improvement_recommendations"]}}}initializeQualityFrameworks(){return{iso9001:{name:"ISO 9001质量管理体系",criteria:["客户导向","领导作用","全员参与","过程方法","改进","循证决策","关系管理"]},sixSigma:{name:"Six Sigma质量管理",criteria:["DMAIC方法论","数据驱动决策","统计分析","过程能力","缺陷预防"]},lean:{name:"精益生产",criteria:["价值流分析","浪费消除","持续改进","标准化作业","快速响应"]}}}initializeIndustryBestPractices(){return{automotive:{name:"汽车行业",standards:["IATF 16949","VDA 6.3","APQP","PPAP"],keyFocus:["零缺陷","预防为主","持续改进","供应链质量"]},aerospace:{name:"航空航天",standards:["AS9100","AS9110","AS9120"],keyFocus:["安全第一","可追溯性","风险管理","配置管理"]},medical:{name:"医疗器械",standards:["ISO 13485","FDA QSR","MDR"],keyFocus:["患者安全","法规合规","风险控制","设计控制"]},electronics:{name:"电子制造",standards:["IPC标准","J-STD","JEDEC"],keyFocus:["可靠性","测试验证","静电防护","工艺控制"]}}}async analyze8DReport(e,t,s={},i={}){try{console.log("🤖 开始8D报告AI分析...");const{template:r="comprehensive",industry:n="general",framework:o="iso9001",language:f="zh-CN",depth:g="detailed"}=i,c=this.buildAnalysisContext(e,t,s,{template:r,industry:n,framework:o}),l=this.buildAnalysisPrompt(c,i),u=await this.callDeepSeekAI(l),d=this.parseAIAnalysis(u,r),m=this.enhanceAnalysis(d,c),p=this.generateAnalysisReport(m,c,i);return console.log("✅ 8D报告AI分析完成"),{success:!0,analysis:m,report:p,context:c,metadata:{analysisTime:new Date().toISOString(),template:r,industry:n,framework:o,aiModel:a.model}}}catch(r){return console.error("❌ 8D报告AI分析失败:",r),{success:!1,error:r.message,fallbackAnalysis:this.generateFallbackAnalysis(e,t)}}}buildAnalysisContext(e,t,s,i){return{reportInfo:{type:"8D质量管理报告",date:s.reportDate||new Date().toISOString().split("T")[0],reportNumber:s.reportNumber||"N/A",customer:s.customer||"N/A",product:s.product||"N/A",severity:s.severity||"N/A"},dimensionSummary:this.summarizeDimensions(e),qualitySummary:{overallScore:t.overall.score,grade:t.overall.grade,status:t.overall.status,topIssues:t.recommendations.slice(0,3),strengths:this.identifyStrengths(t)},analysisConfig:{template:i.template,industry:i.industry,framework:i.framework,focusAreas:this.determineFocusAreas(e,t)},industryContext:this.industryBestPractices[i.industry]||this.industryBestPractices.general,qualityFramework:this.qualityFrameworks[i.framework]||this.qualityFrameworks.iso9001}}summarizeDimensions(e){const t={};return Object.keys(e).forEach(s=>{const i=e[s];t[s]={extracted:i.extracted,confidence:i.confidence,quality:i.quality,keyFields:this.extractKeyFields(i.fields),issues:i.issues||[],completeness:this.calculateDimensionCompleteness(i)}}),t}extractKeyFields(e){const t={};return Object.keys(e).forEach(s=>{const i=e[s];i&&i.value&&i.confidence>.6&&(t[s]={value:i.value.substring(0,100),confidence:i.confidence})}),t}calculateDimensionCompleteness(e){if(!e.extracted)return 0;const t=Object.keys(e.fields).length,s=Object.values(e.fields).filter(i=>i&&i.value).length;return t>0?s/t:0}identifyStrengths(e){const t=[];return Object.keys(e.dimensions).forEach(s=>{const i=e.dimensions[s];i.score>80&&t.push({area:s,score:i.score,description:`${s}维度表现优秀`})}),Object.keys(e.metrics).forEach(s=>{const i=e.metrics[s];i.value>.8&&t.push({area:s,score:i.value*100,description:`${s}指标表现良好`})}),t.slice(0,5)}determineFocusAreas(e,t){const s=[];return t.overall.score<60&&s.push("overall_quality_improvement"),Object.keys(t.dimensions).forEach(r=>{t.dimensions[r].score<50&&s.push(`${r}_improvement`)}),["D2","D4","D5"].forEach(r=>{const n=e[r];(!n||!n.extracted||n.confidence<.6)&&s.push(`${r}_critical_review`)}),s.slice(0,5)}buildAnalysisPrompt(e,t){const{template:s,depth:i,language:r}=t;return`
# 8D质量管理报告专业分析请求

## 分析师角色
你是一位资深的质量管理专家，具有20年以上的8D问题解决经验，熟悉ISO 9001、Six Sigma、精益生产等质量管理体系，擅长根因分析和系统性问题解决。

## 报告基本信息
- **报告类型**: ${e.reportInfo.type}
- **报告日期**: ${e.reportInfo.date}
- **报告编号**: ${e.reportInfo.reportNumber}
- **客户**: ${e.reportInfo.customer}
- **产品**: ${e.reportInfo.product}
- **严重程度**: ${e.reportInfo.severity}

## 当前质量状况
- **总体评分**: ${e.qualitySummary.overallScore.toFixed(1)}分 (${e.qualitySummary.grade}级)
- **状态**: ${e.qualitySummary.status}
- **主要问题**: ${e.qualitySummary.topIssues.map(n=>n.description).join("; ")}

## 8D维度分析数据
${this.formatDimensionData(e.dimensionSummary)}

## 分析要求

### 1. 执行摘要 (Executive Summary)
- 报告整体质量评估
- 关键发现和主要问题
- 核心建议概述
- 业务影响评估

### 2. 8D维度深度分析
请逐一分析8个维度的表现：

**D1 - 团队组建**
- 团队配置合理性
- 角色分工清晰度
- 专业能力匹配度
- 改进建议

**D2 - 问题描述**
- 问题描述完整性
- 量化数据充分性
- 影响范围清晰度
- 客户视角考虑

**D3 - 临时措施**
- 措施有效性评估
- 实施及时性
- 验证充分性
- 风险控制能力

**D4 - 根因分析**
- 分析方法科学性
- 根因识别准确性
- 证据支撑充分性
- 系统性思考深度

**D5 - 永久措施**
- 措施针对性
- 可执行性评估
- 预期效果合理性
- 资源需求考虑

**D6 - 措施实施**
- 实施进度管控
- 验证方法有效性
- 效果评估客观性
- 持续监控机制

**D7 - 预防措施**
- 预防思维体现
- 系统性改进程度
- 标准化建设
- 知识管理水平

**D8 - 团队表彰**
- 贡献识别全面性
- 激励机制有效性
- 经验总结深度
- 知识传承机制

### 3. 质量管理体系评估
基于${e.qualityFramework.name}框架：
${e.qualityFramework.criteria.map(n=>`- ${n}符合度评估`).join(`
`)}

### 4. 根因分析评估
- 分析方法选择合理性
- 分析深度和广度
- 证据链完整性
- 根因验证充分性

### 5. 解决方案有效性评估
- 临时措施与永久措施的协调性
- 解决方案的系统性
- 实施可行性
- 预期效果评估

### 6. 预防措施充分性评估
- 预防思维体现程度
- 系统性改进措施
- 标准化和制度化程度
- 持续改进机制

### 7. 行业对标分析
${e.industryContext?`
基于${e.industryContext.name}行业最佳实践：
- 标准符合度: ${e.industryContext.standards.join(", ")}
- 关键关注点: ${e.industryContext.keyFocus.join(", ")}
`:"基于通用质量管理最佳实践进行对标分析"}

### 8. 改进建议
请提供具体的、可执行的改进建议：
- **高优先级建议** (立即执行)
- **中优先级建议** (3个月内)
- **长期建议** (6-12个月)

每个建议应包括：
- 具体措施
- 预期效果
- 实施难度
- 资源需求
- 成功指标

## 输出要求
- 使用专业的质量管理术语
- 提供具体的数据支撑
- 给出可量化的改进目标
- 考虑实际业务场景
- 输出格式为结构化的Markdown

请基于以上信息进行深度专业分析，输出一份高质量的8D报告分析报告。
`}formatDimensionData(e){let t="";return Object.keys(e).forEach(s=>{const i=e[s];t+=`
**${s}维度**:
- 提取状态: ${i.extracted?"✅ 已提取":"❌ 未提取"}
- 置信度: ${(i.confidence*100).toFixed(1)}%
- 完整性: ${(i.completeness*100).toFixed(1)}%
- 主要问题: ${i.issues.join(", ")||"无"}
- 关键信息: ${Object.keys(i.keyFields).join(", ")||"无"}
`}),t}async callDeepSeekAI(e){try{const t=await fetch(`${a.baseURL}${a.endpoint}`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${a.apiKey}`},body:JSON.stringify({model:a.model,messages:[{role:"system",content:"你是一位资深的质量管理专家，专门从事8D问题解决和质量体系建设。请用专业、客观、建设性的语言进行分析。"},{role:"user",content:e}],temperature:.7,max_tokens:4e3,stream:!1})});if(!t.ok)throw new Error(`DeepSeek API调用失败: ${t.status}`);return(await t.json()).choices[0].message.content}catch(t){throw console.error("AI调用失败:",t),new Error(`AI分析服务不可用: ${t.message}`)}}parseAIAnalysis(e,t){try{const s=this.extractSections(e);return{executiveSummary:s.executiveSummary||this.extractExecutiveSummary(e),dimensionAnalysis:s.dimensionAnalysis||this.extractDimensionAnalysis(e),qualityAssessment:s.qualityAssessment||this.extractQualityAssessment(e),rootCauseEvaluation:s.rootCauseEvaluation||this.extractRootCauseEvaluation(e),solutionEffectiveness:s.solutionEffectiveness||this.extractSolutionEffectiveness(e),preventionAdequacy:s.preventionAdequacy||this.extractPreventionAdequacy(e),industryComparison:s.industryComparison||this.extractIndustryComparison(e),recommendations:s.recommendations||this.extractRecommendations(e),rawAnalysis:e}}catch(s){return console.warn("AI分析结果解析失败，使用原始内容:",s),{rawAnalysis:e,executiveSummary:this.extractExecutiveSummary(e),recommendations:this.extractRecommendations(e)}}}extractSections(e){const t={},s={executiveSummary:/(?:执行摘要|Executive Summary)[：:]?\s*([\s\S]*?)(?=\n#+\s|$)/i,dimensionAnalysis:/(?:8D维度|维度分析|Dimension Analysis)[：:]?\s*([\s\S]*?)(?=\n#+\s|$)/i,qualityAssessment:/(?:质量评估|Quality Assessment)[：:]?\s*([\s\S]*?)(?=\n#+\s|$)/i,rootCauseEvaluation:/(?:根因分析|Root Cause)[：:]?\s*([\s\S]*?)(?=\n#+\s|$)/i,solutionEffectiveness:/(?:解决方案|Solution)[：:]?\s*([\s\S]*?)(?=\n#+\s|$)/i,preventionAdequacy:/(?:预防措施|Prevention)[：:]?\s*([\s\S]*?)(?=\n#+\s|$)/i,industryComparison:/(?:行业对标|Industry)[：:]?\s*([\s\S]*?)(?=\n#+\s|$)/i,recommendations:/(?:改进建议|建议|Recommendations?)[：:]?\s*([\s\S]*?)(?=\n#+\s|$)/i};return Object.keys(s).forEach(i=>{const r=e.match(s[i]);r&&r[1]&&(t[i]=r[1].trim())}),t}extractExecutiveSummary(e){const t=[/(?:执行摘要|Executive Summary)[：:]?\s*([\s\S]*?)(?=\n#+\s|(?:8D维度|维度分析))/i,/^([\s\S]*?)(?=\n#+\s|(?:8D维度|维度分析))/i];for(const i of t){const r=e.match(i);if(r&&r[1]&&r[1].length>50)return r[1].trim()}return e.split(`

`).filter(i=>i.trim().length>20).slice(0,2).join(`

`)}extractDimensionAnalysis(e){const t={},s={D1:/D1[^D]*?团队组建[：:]?\s*([\s\S]*?)(?=D2|$)/i,D2:/D2[^D]*?问题描述[：:]?\s*([\s\S]*?)(?=D3|$)/i,D3:/D3[^D]*?临时措施[：:]?\s*([\s\S]*?)(?=D4|$)/i,D4:/D4[^D]*?根因分析[：:]?\s*([\s\S]*?)(?=D5|$)/i,D5:/D5[^D]*?永久措施[：:]?\s*([\s\S]*?)(?=D6|$)/i,D6:/D6[^D]*?措施实施[：:]?\s*([\s\S]*?)(?=D7|$)/i,D7:/D7[^D]*?预防措施[：:]?\s*([\s\S]*?)(?=D8|$)/i,D8:/D8[^D]*?团队表彰[：:]?\s*([\s\S]*?)(?=\n#+\s|$)/i};return Object.keys(s).forEach(i=>{const r=e.match(s[i]);r&&r[1]&&(t[i]=r[1].trim())}),t}extractQualityAssessment(e){const t=/(?:质量管理体系评估|质量评估)[：:]?\s*([\s\S]*?)(?=\n#+\s|(?:根因分析|改进建议))/i,s=e.match(t);return s&&s[1]?s[1].trim():null}extractRootCauseEvaluation(e){const t=/(?:根因分析评估|根因分析)[：:]?\s*([\s\S]*?)(?=\n#+\s|(?:解决方案|改进建议))/i,s=e.match(t);return s&&s[1]?s[1].trim():null}extractSolutionEffectiveness(e){const t=/(?:解决方案有效性|解决方案)[：:]?\s*([\s\S]*?)(?=\n#+\s|(?:预防措施|改进建议))/i,s=e.match(t);return s&&s[1]?s[1].trim():null}extractPreventionAdequacy(e){const t=/(?:预防措施充分性|预防措施评估)[：:]?\s*([\s\S]*?)(?=\n#+\s|(?:行业对标|改进建议))/i,s=e.match(t);return s&&s[1]?s[1].trim():null}extractIndustryComparison(e){const t=/(?:行业对标|行业比较)[：:]?\s*([\s\S]*?)(?=\n#+\s|(?:改进建议))/i,s=e.match(t);return s&&s[1]?s[1].trim():null}extractRecommendations(e){const t=/(?:改进建议|建议|Recommendations?)[：:]?\s*([\s\S]*?)$/i,s=e.match(t);return s&&s[1]?this.parseRecommendations(s[1].trim()):[]}parseRecommendations(e){const t=[],s={high:/(?:高优先级|立即执行|紧急)[：:]?\s*([\s\S]*?)(?=(?:中优先级|低优先级|长期)|$)/i,medium:/(?:中优先级|3个月内)[：:]?\s*([\s\S]*?)(?=(?:低优先级|长期)|$)/i,low:/(?:低优先级|长期建议|6-12个月)[：:]?\s*([\s\S]*?)$/i};return Object.keys(s).forEach(i=>{const r=e.match(s[i]);r&&r[1]&&this.parseRecommendationItems(r[1].trim()).forEach(o=>{t.push({priority:i,...o})})}),t.length===0&&this.parseRecommendationItems(e).forEach(r=>{t.push({priority:"medium",...r})}),t}parseRecommendationItems(e){const t=[];return e.split(`
`).filter(i=>i.trim().length>10).forEach(i=>{const r=i.trim();if(r.startsWith("#")||r.startsWith("**"))return;const n=r.match(/^[-*•]\s*(.+)/);n?t.push({description:n[1].trim(),category:"general",impact:"medium",effort:"medium"}):r.length>20&&t.push({description:r,category:"general",impact:"medium",effort:"medium"})}),t.slice(0,10)}enhanceAnalysis(e,t){return{...e,quantitativeAssessment:this.generateQuantitativeAssessment(t),riskAssessment:this.generateRiskAssessment(t),costBenefitAnalysis:this.generateCostBenefitAnalysis(t),implementationRoadmap:this.generateImplementationRoadmap(e.recommendations),successMetrics:this.generateSuccessMetrics(t)}}generateQuantitativeAssessment(e){return{overallMaturity:this.calculateMaturityLevel(e),dimensionScores:this.calculateDimensionScores(e),improvementPotential:this.calculateImprovementPotential(e),complianceLevel:this.calculateComplianceLevel(e)}}calculateMaturityLevel(e){const t=e.qualitySummary.overallScore;return t>=90?{level:5,name:"优化级",description:"持续优化和创新"}:t>=80?{level:4,name:"管理级",description:"量化管理和控制"}:t>=70?{level:3,name:"已定义级",description:"标准化和文档化"}:t>=60?{level:2,name:"可重复级",description:"基本流程建立"}:{level:1,name:"初始级",description:"临时性和混乱"}}calculateDimensionScores(e){const t={};return Object.keys(e.dimensionSummary).forEach(s=>{var r,n;const i=e.dimensionSummary[s];t[s]={completeness:i.completeness*100,confidence:i.confidence*100,quality:((r=i.quality)==null?void 0:r.overall)*100||0,overall:(i.completeness+i.confidence+(((n=i.quality)==null?void 0:n.overall)||0))/3*100}}),t}calculateImprovementPotential(e){const t=e.qualitySummary.overallScore,s=100,i=s-t;return{currentScore:t,maxPossibleScore:s,improvementPotential:i,improvementPercentage:i/s*100,priority:i>30?"high":i>15?"medium":"low"}}calculateComplianceLevel(e){const t=e.qualityFramework.criteria,s=e.qualitySummary.overallScore;return{framework:e.qualityFramework.name,overallCompliance:s,criteriaCompliance:t.map(i=>({criterion:i,compliance:Math.max(0,s+(Math.random()-.5)*20),status:s>70?"compliant":s>50?"partial":"non-compliant"}))}}generateRiskAssessment(e){const t=[];return e.qualitySummary.overallScore<60&&t.push({type:"quality",level:"high",description:"整体质量水平偏低，存在系统性风险",impact:"high",probability:"high",mitigation:"立即启动质量改进计划"}),Object.keys(e.dimensionSummary).forEach(s=>{const i=e.dimensionSummary[s];(!i.extracted||i.confidence<.5)&&t.push({type:"dimension",level:"medium",description:`${s}维度信息不完整或不准确`,impact:"medium",probability:"medium",mitigation:`补充和完善${s}维度信息`})}),t.slice(0,5)}generateCostBenefitAnalysis(e){const t=this.calculateImprovementPotential(e);return{estimatedCost:{low:"5-10万元",medium:"10-30万元",high:"30-100万元"},expectedBenefit:{qualityImprovement:`${t.improvementPercentage.toFixed(1)}%`,costReduction:"预计减少质量成本20-40%",customerSatisfaction:"提升客户满意度15-25%",processEfficiency:"提升流程效率10-20%"},roi:{timeframe:"6-12个月",expectedReturn:"200-400%",paybackPeriod:"3-6个月"}}}generateImplementationRoadmap(e){const t={immediate:[],shortTerm:[],mediumTerm:[],longTerm:[]};return e.forEach(s=>{switch(s.priority){case"high":t.immediate.push(s);break;case"medium":t.shortTerm.push(s);break;case"low":t.mediumTerm.push(s);break;default:t.longTerm.push(s)}}),t}generateSuccessMetrics(e){return{qualityMetrics:[{name:"8D报告完整性",target:"≥90%",current:`${e.qualitySummary.overallScore.toFixed(1)}%`},{name:"维度信息准确性",target:"≥85%",current:"待提升"},{name:"问题解决及时性",target:"≤7天",current:"待评估"},{name:"客户满意度",target:"≥95%",current:"待调研"}],processMetrics:[{name:"8D流程标准化率",target:"100%",current:"待完善"},{name:"团队响应时间",target:"≤24小时",current:"待优化"},{name:"根因分析准确率",target:"≥90%",current:"待验证"},{name:"预防措施有效性",target:"≥80%",current:"待跟踪"}],businessMetrics:[{name:"质量成本降低",target:"20-40%",current:"基准建立中"},{name:"重复问题发生率",target:"≤5%",current:"待统计"},{name:"客户投诉减少",target:"30-50%",current:"待监控"},{name:"ROI实现",target:"≥200%",current:"项目启动"}]}}generateAnalysisReport(e,t,s){return{title:"8D质量管理报告AI分析报告",subtitle:`基于${t.qualityFramework.name}框架的专业分析`,metadata:{reportDate:new Date().toISOString().split("T")[0],analysisTemplate:s.template,industry:s.industry,framework:s.framework,aiModel:a.model,analysisDepth:s.depth},summary:{overallAssessment:t.qualitySummary,keyFindings:this.extractKeyFindings(e),criticalIssues:this.extractCriticalIssues(e),majorStrengths:t.qualitySummary.strengths},detailedAnalysis:e,actionPlan:{immediateActions:e.implementationRoadmap.immediate,shortTermActions:e.implementationRoadmap.shortTerm,longTermActions:e.implementationRoadmap.longTerm},monitoring:{successMetrics:e.successMetrics,reviewSchedule:this.generateReviewSchedule(),escalationCriteria:this.generateEscalationCriteria()}}}extractKeyFindings(e){const t=[];return e.executiveSummary&&e.executiveSummary.split(/[。！？.!?]/).slice(0,3).forEach(i=>{i.trim().length>20&&t.push(i.trim())}),t}extractCriticalIssues(e){const t=[];return e.riskAssessment&&e.riskAssessment.forEach(s=>{s.level==="high"&&t.push({description:s.description,impact:s.impact,mitigation:s.mitigation})}),t}generateReviewSchedule(){return[{milestone:"1周后",focus:"立即行动项执行情况检查"},{milestone:"1个月后",focus:"短期改进措施效果评估"},{milestone:"3个月后",focus:"中期目标达成情况审查"},{milestone:"6个月后",focus:"整体改进效果综合评估"},{milestone:"12个月后",focus:"年度质量管理体系审查"}]}generateEscalationCriteria(){return[{condition:"关键指标连续2周未改善",action:"升级至部门经理"},{condition:"客户投诉增加超过20%",action:"立即升级至总经理"},{condition:"重大质量事故发生",action:"启动应急响应机制"},{condition:"改进计划延期超过1个月",action:"重新评估资源配置"}]}generateFallbackAnalysis(e,t){return{executiveSummary:`基于数据分析，该8D报告整体质量评分为${t.overall.score.toFixed(1)}分，等级为${t.overall.grade}。主要问题集中在信息完整性和分析深度方面，建议重点改进问题描述、根因分析和预防措施等关键维度。`,recommendations:[{priority:"high",description:"补充完善问题描述，增加量化数据和具体影响范围",category:"D2改进",impact:"high",effort:"medium"},{priority:"high",description:"深化根因分析，使用系统性分析方法并提供充分证据",category:"D4改进",impact:"high",effort:"high"},{priority:"medium",description:"建立系统性预防措施，包括流程改进和培训计划",category:"D7改进",impact:"medium",effort:"medium"}],riskAssessment:[{type:"quality",level:t.overall.score<60?"high":"medium",description:"报告质量水平需要改进，可能影响问题解决效果",mitigation:"立即启动质量改进计划"}]}}}const S=new h;export{h as EightDAIAnalysisEngine,S as default};
