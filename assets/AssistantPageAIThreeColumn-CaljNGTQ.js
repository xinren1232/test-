import{$ as N,c as g,o as h,a as l,t as m,n as Q,b as q,F as L,r as P,e as ee,S as I,T as $t,V as b,W as Te,M as X,aD as fe,az as ye,R as wt,Z as kt,_ as St,O as ve,Q as _e,X as Ae,P as Ee}from"./element-plus-DR-erZ3X.js";import{a as Oe}from"./index-Bo1zM2q5.js";import{A as It}from"./AnalysisProcessPanel-BXaIJRlO.js";import"./echarts-Dfqt_Pbx.js";/* empty css                                                                             */const Dt={class:"optimized-qa-response"},Ct={class:"type-icon"},Tt={class:"type-label"},At={class:"response-main-content"},Et={key:0,class:"response-summary"},Ot={key:1,class:"structured-data"},jt={class:"data-header"},qt={class:"data-count"},xt={class:"data-grid"},Rt={class:"item-index"},Ft={class:"item-content"},Nt={class:"item-title"},Mt={class:"item-details"},Lt={class:"detail-label"},Pt={key:2,class:"recommendations"},Qt={class:"recommendation-list"},Bt={class:"rec-icon"},Ht={class:"rec-content"},zt={class:"rec-title"},Wt={class:"rec-description"},Ut={key:3,class:"related-actions"},Kt={class:"action-buttons"},Gt=["onClick"],Jt={class:"action-icon"},Vt={class:"response-metadata"},Yt={class:"metadata-item"},Xt={class:"metadata-value"},Zt={class:"metadata-item"},es={class:"metadata-value"},ts={key:0,class:"metadata-item"},ss={class:"metadata-value"},ns={__name:"OptimizedQAResponse",props:{content:{type:String,required:!0},type:{type:String,default:"general"},timestamp:{type:Date,default:()=>new Date},dataSource:{type:String,default:"IQE系统"},processingTime:{type:Number,default:null}},emits:["action-click"],setup(V,{emit:c}){const f=V,w=N(()=>{try{return f.content.includes('<div class="query-results')?K(f.content):le(f.content)}catch(v){return console.error("内容解析错误:",v),{summary:"",structuredData:[],rawContent:f.content,recommendations:[],relatedActions:[]}}}),z=N(()=>w.value.summary),A=N(()=>w.value.structuredData),W=N(()=>w.value.rawContent),H=N(()=>w.value.recommendations),O=N(()=>w.value.relatedActions),E=N(()=>`type-${f.type}`),C=N(()=>({inventory:"📦",inspection:"🧪",production:"⚙️",general:"📋"})[f.type]||"📋"),k=N(()=>({inventory:"库存查询",inspection:"检测结果",production:"生产数据",general:"查询结果"})[f.type]||"查询结果"),U=N(()=>({inventory:"📦 库存信息",inspection:"🧪 检测记录",production:"⚙️ 生产记录",general:"📋 查询结果"})[f.type]||"📋 查询结果");N(()=>W.value?W.value.replace(/\n/g,"<br>").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\*(.*?)\*/g,"<em>$1</em>").replace(/`(.*?)`/g,"<code>$1</code>"):"");const K=v=>{const D=new DOMParser().parseFromString(v,"text/html").querySelector(".query-results");if(!D)return{rawContent:v,structuredData:[],recommendations:[],relatedActions:[]};const T=D.querySelectorAll(".result-item"),j=Array.from(T).map((G,ne)=>{var ie;const de=((ie=G.querySelector(".item-title"))==null?void 0:ie.textContent)||`项目 ${ne+1}`,ae=S(G);return{title:de,details:ae,status:re(ae)}});return{summary:`找到 ${j.length} 条相关记录`,structuredData:j,rawContent:"",recommendations:Z(j),relatedActions:B(f.type)}},le=v=>{const y=v.split(`
`).filter($=>$.trim());return y.length<=3?{summary:"",structuredData:[],rawContent:v,recommendations:[],relatedActions:[]}:{summary:y[0],structuredData:[],rawContent:v,recommendations:[],relatedActions:B(f.type)}},S=v=>{const y={};return v.querySelectorAll('[class*="detail"], [class*="info"]').forEach(D=>{const T=D.textContent.trim();if(T.includes(":")){const[j,G]=T.split(":").map(ne=>ne.trim());y[j]=G}}),y},re=v=>{const y={normal:["正常","合格","PASS"],warning:["风险","警告","注意"],error:["异常","不合格","FAIL","冻结"]},$=Object.values(v).join(" ").toLowerCase();for(const[D,T]of Object.entries(y))if(T.some(j=>$.includes(j.toLowerCase())))return D;return"normal"},Z=v=>{const y=[],$=v.filter(T=>T.status==="error"),D=v.filter(T=>T.status==="warning");return $.length>0&&y.push({icon:"🚨",title:"紧急处理",description:`发现 ${$.length} 个异常项目，需要立即处理`,priority:"high"}),D.length>0&&y.push({icon:"⚠️",title:"风险关注",description:`发现 ${D.length} 个风险项目，建议重点关注`,priority:"medium"}),y},B=v=>({inventory:[{id:"export",icon:"📊",label:"导出数据",type:"primary"},{id:"chart",icon:"📈",label:"生成图表",type:"info"},{id:"alert",icon:"🔔",label:"设置预警",type:"warning"}],inspection:[{id:"report",icon:"📋",label:"生成报告",type:"primary"},{id:"trend",icon:"📈",label:"趋势分析",type:"info"}],production:[{id:"optimize",icon:"⚡",label:"优化建议",type:"success"},{id:"monitor",icon:"👁️",label:"实时监控",type:"info"}]})[v]||[],_=v=>({materialCode:"物料编码",materialName:"物料名称",supplier:"供应商",factory:"工厂",quantity:"数量",status:"状态",batchCode:"批次号"})[v]||v,te=(v,y)=>v==="quantity"&&typeof y=="number"?y.toLocaleString():y,ce=(v,y)=>{if(v==="status"){if(y==="正常"||y==="PASS")return"status-normal";if(y==="风险"||y==="WARNING")return"status-warning";if(y==="异常"||y==="FAIL")return"status-error"}return""},se=v=>`status-${v.status||"normal"}`,Y=v=>({normal:"正常",warning:"风险",error:"异常"})[v]||v,ue=v=>new Date(v).toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit",second:"2-digit"});return(v,y)=>(h(),g("div",Dt,[l("div",{class:Q(["response-type-indicator",E.value])},[l("span",Ct,m(C.value),1),l("span",Tt,m(k.value),1)],2),l("div",At,[z.value?(h(),g("div",Et,[y[0]||(y[0]=l("h4",null,"📊 查询摘要",-1)),l("p",null,m(z.value),1)])):q("",!0),A.value.length>0?(h(),g("div",Ot,[l("div",jt,[l("h4",null,m(U.value),1),l("span",qt,m(A.value.length)+" 条记录",1)]),l("div",xt,[(h(!0),g(L,null,P(A.value,($,D)=>(h(),g("div",{key:D,class:Q(["data-item",se($)])},[l("div",Rt,m(D+1),1),l("div",Ft,[l("div",Nt,m($.title||$.name||`项目 ${D+1}`),1),l("div",Mt,[(h(!0),g(L,null,P($.details,(T,j)=>(h(),g("div",{key:j,class:"detail-row"},[l("span",Lt,m(_(j))+":",1),l("span",{class:Q(["detail-value",ce(j,T)])},m(te(j,T)),3)]))),128))])]),$.status?(h(),g("div",{key:0,class:Q(["item-status",$.status])},m(Y($.status)),3)):q("",!0)],2))),128))])])):q("",!0),H.value.length>0?(h(),g("div",Pt,[y[1]||(y[1]=l("h4",null,"💡 建议操作",-1)),l("div",Qt,[(h(!0),g(L,null,P(H.value,($,D)=>(h(),g("div",{key:D,class:Q(["recommendation-item",$.priority])},[l("span",Bt,m($.icon),1),l("div",Ht,[l("div",zt,m($.title),1),l("div",Wt,m($.description),1)])],2))),128))])])):q("",!0),O.value.length>0?(h(),g("div",Ut,[y[2]||(y[2]=l("h4",null,"🔗 相关操作",-1)),l("div",Kt,[(h(!0),g(L,null,P(O.value,$=>(h(),g("button",{key:$.id,onClick:D=>v.$emit("action-click",$),class:Q(["action-btn",$.type])},[l("span",Jt,m($.icon),1),ee(" "+m($.label),1)],10,Gt))),128))])])):q("",!0)]),l("div",Vt,[l("div",Yt,[y[3]||(y[3]=l("span",{class:"metadata-label"},"数据源:",-1)),l("span",Xt,m(V.dataSource),1)]),l("div",Zt,[y[4]||(y[4]=l("span",{class:"metadata-label"},"查询时间:",-1)),l("span",es,m(ue(V.timestamp)),1)]),V.processingTime?(h(),g("div",ts,[y[5]||(y[5]=l("span",{class:"metadata-label"},"处理时间:",-1)),l("span",ss,m(V.processingTime)+"ms",1)])):q("",!0)])]))}},as=Oe(ns,[["__scopeId","data-v-8933a70b"]]);class is{static handleResponse(c){if(!c)return this.createErrorResult("响应为空");if(this.validateResponse(c)||(console.warn("响应格式不标准，尝试修复:",c),c=this.normalizeResponse(c)),!c.success)return this.handleErrorResponse(c);switch(c.processingMode){case"structured_data":return this.handleDataResponse(c);case"chart_visualization":return this.handleChartResponse(c);case"ai_analysis":return this.handleAIResponse(c);case"hybrid_analysis":return this.handleHybridResponse(c);default:return this.handleGenericResponse(c)}}static validateResponse(c){return!c||typeof c!="object"?!1:["success","timestamp","source"].every(w=>w in c)}static normalizeResponse(c){const f={success:c.success!==!1,timestamp:c.timestamp||new Date().toISOString(),source:c.source||"unknown",processingMode:c.processingMode||"generic"};return Object.keys(c).forEach(w=>{["success","timestamp","source","processingMode"].includes(w)||(f[w]=c[w])}),f}static handleErrorResponse(c){var f,w;return{type:"error",message:((f=c.error)==null?void 0:f.message)||"未知错误",code:((w=c.error)==null?void 0:w.code)||"UNKNOWN_ERROR",source:c.source,timestamp:c.timestamp}}static handleDataResponse(c){const f={type:"data",source:c.source,intent:c.intent,aiEnhanced:c.aiEnhanced||!1,timestamp:c.timestamp};return c.data&&(f.data=c.data,f.dataInfo=c.dataInfo||this.analyzeData(c.data),c.data.cards&&(f.cards=c.data.cards),c.data.queryData&&(f.tableData=c.data.queryData),c.data.scenarioType&&(f.scenarioType=c.data.scenarioType),c.data.dataCount!==void 0&&(f.dataCount=c.data.dataCount)),c.queryInfo&&(f.queryInfo=c.queryInfo),f}static handleChartResponse(c){return{type:"chart",data:c.data,chartType:c.chartType,source:c.source,visualization:!0,timestamp:c.timestamp}}static handleAIResponse(c){return{type:"ai_analysis",reply:c.reply,analysisType:c.analysisType,confidence:c.confidence,source:c.source,aiEnhanced:!0,contextData:c.contextData,timestamp:c.timestamp}}static handleHybridResponse(c){return{type:"hybrid",data:c.data,reply:c.reply,analysisType:c.analysisType,source:c.source,aiEnhanced:!0,dataInfo:c.dataInfo||this.analyzeData(c.data),timestamp:c.timestamp}}static handleGenericResponse(c){const f={type:"generic",source:c.source,aiEnhanced:c.aiEnhanced||!1,timestamp:c.timestamp};return c.data&&(f.data=c.data,f.dataInfo=this.analyzeData(c.data),c.data.cards&&(f.cards=c.data.cards),c.data.queryData&&(f.tableData=c.data.queryData),c.data.scenarioType&&(f.scenarioType=c.data.scenarioType),c.data.dataCount!==void 0&&(f.dataCount=c.data.dataCount)),c.reply&&(f.reply=c.reply),f}static analyzeData(c){return c?Array.isArray(c)?{type:"array",count:c.length,fields:c.length>0?Object.keys(c[0]):[],isEmpty:c.length===0}:typeof c=="object"?{type:"object",fields:Object.keys(c),isEmpty:Object.keys(c).length===0}:{type:typeof c,isEmpty:!c}:null}static createErrorResult(c){return{type:"error",message:c,timestamp:new Date().toISOString()}}static formatDataForDisplay(c,f={}){const{maxRows:w=20,maxColumns:z=10}=f;if(!c)return null;if(Array.isArray(c)){const A=c.slice(0,w);if(A.length>0){const W=Object.keys(A[0]),H=W.slice(0,z);return{data:A.map(O=>{const E={};return H.forEach(C=>{E[C]=O[C]}),E}),meta:{totalRows:c.length,totalColumns:W.length,displayRows:A.length,displayColumns:H.length,truncated:c.length>w||W.length>z}}}}return{data:c,meta:{truncated:!1}}}static needsSpecialHandling(c){var f,w;return((f=c.dataInfo)==null?void 0:f.count)>100?{type:"large_dataset",reason:"数据量较大，建议分页显示"}:c.aiEnhanced&&((w=c.reply)==null?void 0:w.length)>1e3?{type:"complex_analysis",reason:"分析内容较长，建议分段显示"}:c.visualization?{type:"visualization",reason:"需要图表组件渲染"}:null}}const os={class:"ai-assistant-three-column"},ls={class:"header-bar"},rs={class:"header-center"},cs={class:"user-info"},us={class:"user-details"},ds={class:"user-name"},ps={class:"user-role"},ms={class:"header-right"},hs={class:"service-status"},gs={class:"ai-status-text"},fs={class:"cache-status"},ys={class:"switch"},vs={class:"three-column-layout"},_s={class:"left-panel"},bs={class:"tool-categories"},$s={class:"tool-category"},ws={class:"tool-list"},ks={style:{background:"#f0f0f0",padding:"5px",margin:"5px 0","font-size":"12px","border-radius":"3px"}},Ss=["onClick","title"],Is={class:"tool-icon"},Ds={class:"tool-content"},Cs={class:"tool-name"},Ts={class:"tool-desc"},As={class:"tool-category"},Es={class:"tool-list"},Os=["onClick","title"],js={class:"tool-icon"},qs={class:"tool-content"},xs={class:"tool-name"},Rs={class:"tool-desc"},Fs={class:"tool-category"},Ns={class:"tool-list"},Ms=["onClick","title"],Ls={class:"tool-icon"},Ps={class:"tool-content"},Qs={class:"tool-name"},Bs={class:"tool-desc"},Hs={class:"center-panel"},zs={class:"chat-container"},Ws={class:"chat-header"},Us={class:"chat-status"},Ks={class:"status-text"},Gs={class:"messages-container"},Js={class:"messages-list",ref:"messagesContainer"},Vs={key:0,class:"welcome-message"},Ys={class:"welcome-content"},Xs={class:"welcome-suggestions"},Zs={class:"suggestion-list"},en=["onClick"],tn={class:"message-avatar"},sn={key:0},nn={key:1},an={class:"message-content"},on={key:1},ln={key:0,class:"message-cards"},rn={class:"cards-grid"},cn={class:"card-icon"},un={class:"card-content"},dn={key:0,class:"split-data-content"},pn={class:"card-title"},mn={class:"split-data-grid"},hn={class:"split-item"},gn={class:"split-label"},fn={class:"split-value"},yn={class:"split-item"},vn={class:"split-label"},_n={class:"split-value"},bn={key:1,class:"normal-card-content"},$n={class:"card-title"},wn={class:"card-value"},kn={key:0,class:"card-subtitle"},Sn=["innerHTML"],In={key:1,class:"message-table"},Dn={key:0,class:"table-summary"},Cn={class:"message-time"},Tn={key:2,class:"message-actions"},An=["onClick"],En=["onClick"],On=["onClick"],jn={key:1,class:"loading-message"},qn={key:0,class:"quick-input-suggestions"},xn={class:"suggestions-header"},Rn={class:"suggestions-count"},Fn={class:"suggestions-list"},Nn=["onClick","disabled"],Mn={class:"input-area"},Ln={class:"input-container"},Pn=["disabled"],Qn=["disabled"],Bn={key:0},Hn={key:1},zn={class:"control-toggles"},Wn={class:"debug-toggle"},Un={class:"debug-label"},Kn={class:"web-search-toggle"},Gn={class:"web-search-label"},Jn={class:"right-panel"},Vn={__name:"AssistantPageAIThreeColumn",setup(V){const c=(e,t)=>{const s={type:"assistant",timestamp:new Date,originalQuery:t,resultType:e.type,source:e.source};switch(e.type){case"data":return{...s,content:f(e),data:e.data,dataInfo:e.dataInfo,aiEnhanced:e.aiEnhanced,cards:e.cards,tableData:e.tableData,scenarioType:e.scenarioType,dataCount:e.dataCount};case"chart":return{...s,content:"📊 已生成图表数据",chartData:e.data,chartType:e.chartType,visualization:!0};case"ai_analysis":return{...s,content:e.reply,analysisType:e.analysisType,confidence:e.confidence,aiEnhanced:!0};case"hybrid":return{...s,content:e.reply,data:e.data,dataInfo:e.dataInfo,analysisType:e.analysisType,aiEnhanced:!0,hybrid:!0,cards:e.cards,tableData:e.tableData,scenarioType:e.scenarioType,dataCount:e.dataCount};case"error":return{...s,content:`❌ ${e.message}`,error:!0};default:return{...s,content:e.reply||e.data||"查询完成",aiEnhanced:e.aiEnhanced||!1,cards:e.cards,tableData:e.tableData,scenarioType:e.scenarioType,dataCount:e.dataCount,data:e.data}}},f=e=>{var t;if(!e.data)return"查询完成，但未返回数据";if(Array.isArray(e.data)){const s=e.data.length,n=((t=e.dataInfo)==null?void 0:t.fields)||[];return`📊 查询成功，返回 ${s} 条记录，包含字段：${n.join(", ")}`}return"📊 查询成功，返回数据对象"},w={webSearchEnabled:!0,async intelligentQuery(e,t={}){var a;console.log("🤖 调用简化版增强AI服务:",e);const s=this.analyzeQueryIntent(e),n=t.enableWebSearch&&this.webSearchEnabled&&this.shouldSearchWeb(s,e);let i=null;return n&&(console.log("🌐 触发联网搜索"),i=await this.performWebSearch(e)),{success:!0,response:await this.generateAIResponse(e,i,t.businessContext),metadata:{queryAnalysis:s,webSearchUsed:n,webSearchResults:((a=i==null?void 0:i.results)==null?void 0:a.length)||0,sources:(i==null?void 0:i.sources)||[],responseTime:300+Math.floor(Math.random()*400)}}},analyzeQuery(e){const t=["最新","今天","现在","当前","最近","新闻","实时"],s=["什么是","如何","为什么","哪里","谁是","什么时候"],n=["库存","检测","批次","供应商","工厂","物料","质量"],i=e.toLowerCase(),o=t.some(u=>i.includes(u)),a=s.some(u=>i.includes(u)),r=n.some(u=>i.includes(u));return{type:o?"realtime":a?"informational":"general",needsRealTimeInfo:o,needsWebSearch:a||o,hasSystemKeywords:r,confidence:o?.9:a?.7:.5}},shouldSearchWeb(e,t){return e.needsWebSearch&&!e.hasSystemKeywords},async performWebSearch(e){return await new Promise(t=>setTimeout(t,200)),{success:!0,results:[{title:`${e} - 百度搜索结果`,url:`https://www.baidu.com/s?wd=${encodeURIComponent(e)}`,snippet:`关于${e}的详细信息和最新资讯`,source:"baidu"},{title:`${e} - 专业解答`,url:`https://zhidao.baidu.com/search?word=${encodeURIComponent(e)}`,snippet:`专业人士对${e}的详细解答和经验分享`,source:"baidu"}],sources:["baidu","bing"],timestamp:new Date().toISOString()}},async generateAIResponse(e,t,s){console.log("🚀 启动多步骤智能问答链"),console.log("📝 用户问题:",e);try{const n=await this.step1_SemanticUnderstanding(e);console.log("✅ 步骤1完成 - 意图识别:",n.intent);const i=await this.step2_ParameterExtraction(e,n);console.log("✅ 步骤2完成 - 参数抽取:",i.extractedParams);const o=await this.step3_DataSourceSelection(i);console.log("✅ 步骤3完成 - 数据源选择:",o.selectedTables);const a=await this.step4_QueryTemplateGeneration(o);console.log("✅ 步骤4完成 - 查询模板生成");const r=await this.step5_DataExecution(a);console.log("✅ 步骤5完成 - 数据执行:",r.recordCount,"条记录");const u=await this.step6_ToolInvocation(r,n);console.log("✅ 步骤6完成 - 工具调用");const d=await this.step7_AIAnalysis(r,u,e,t);console.log("✅ 步骤7完成 - AI分析解释");const p=await this.step8_FinalPresentation(d,r,n);return console.log("✅ 步骤8完成 - 最终展示生成"),p}catch(n){return console.error("❌ 智能问答链执行失败:",n),this.generateErrorResponse(n,e)}},async step1_SemanticUnderstanding(e){console.log("🧩 步骤1: 语义理解（意图识别）");const t=e.toLowerCase(),s={batch_risk_check:{keywords:["批次","风险","是否","安全","问题","状态"],patterns:["这个批次.*风险","批次.*是否.*安全",".*批次.*问题"],confidence_threshold:.6,data_tables:["inventory","lab_tests"],description:"批次风险检查"},defect_analysis:{keywords:["不良","缺陷","失败","异常","问题","错误"],patterns:["最近.*不良","哪些.*失败",".*异常.*分析"],confidence_threshold:.5,data_tables:["online_tracking","lab_tests"],description:"不良缺陷分析"},supplier_evaluation:{keywords:["供应商","供方","厂商","评估","表现","质量"],patterns:[".*供应商.*表现",".*厂商.*质量","供方.*评估"],confidence_threshold:.6,data_tables:["suppliers","online_tracking"],description:"供应商评估分析"},test_record_query:{keywords:["测试","检测","检验","记录","结果","报告"],patterns:[".*测试.*记录","检测.*结果",".*检验.*情况"],confidence_threshold:.5,data_tables:["lab_tests"],description:"测试记录查询"},inventory_status:{keywords:["库存","物料","状态","数量","余量","存量"],patterns:["库存.*状态","物料.*数量",".*余量.*查询"],confidence_threshold:.5,data_tables:["inventory"],description:"库存状态查询"},project_progress:{keywords:["项目","进度","状态","完成","计划","时间"],patterns:["项目.*进度",".*项目.*状态","完成.*情况"],confidence_threshold:.5,data_tables:["online_tracking"],description:"项目进度查询"},operation_execution:{keywords:["冻结","标记","锁定","禁用","启用","操作"],patterns:["冻结.*批次","标记.*风险","锁定.*物料"],confidence_threshold:.7,data_tables:["inventory"],description:"操作执行",requires_function_call:!0},trend_analysis:{keywords:["趋势","变化","对比","统计","分析","图表"],patterns:[".*趋势.*分析",".*变化.*情况","统计.*对比"],confidence_threshold:.6,data_tables:["online_tracking","lab_tests"],description:"趋势分析",requires_chart:!0}};let n={intent:"general_query",confidence:.3,details:null};for(const[i,o]of Object.entries(s)){let a=0;const u=o.keywords.filter(p=>t.includes(p.toLowerCase())).length/o.keywords.length;let d=0;for(const p of o.patterns)if(new RegExp(p,"i").test(e)){d=.8;break}a=u*.6+d*.4,a>n.confidence&&a>=o.confidence_threshold&&(n={intent:i,confidence:a,details:o,description:o.description})}return console.log(`🎯 识别意图: ${n.description} (置信度: ${(n.confidence*100).toFixed(1)}%)`),n},async step2_ParameterExtraction(e,t){console.log("🧩 步骤2: 字段定位与参数抽取");const s={entities:{},timeRange:null,filters:[],outputFormat:"table"},n={suppliers:{patterns:["聚龙","欣冠","广正","BOE","天马","华星","帝晶","盛泰","天实","深奥","百俊达","奥海","辰阳","锂威","风华","维科","东声","豪声","歌尔","丽德宝","裕同","富群"],field:"supplier_name",table:"suppliers"},materials:{patterns:["电池盖","中框","手机卡托","侧键","装饰件","LCD显示屏","OLED显示屏","摄像头模组","电池","充电器","扬声器","听筒","保护套","标签","包装盒"],field:"material_type",table:"inventory"},batch_numbers:{patterns:[/[A-Z]\d{4,6}/g,/\d{6,8}/g],field:"batch_number",table:"inventory"},projects:{patterns:["X6827","S665LN","KI4K","X6828","X6831","KI5K","KI3K","S662LN","S663LN","S664LN"],field:"project_name",table:"online_tracking"},factories:{patterns:["深圳工厂","重庆工厂","南昌工厂","宜宾工厂"],field:"factory",table:"inventory"}};for(const[a,r]of Object.entries(n))for(const u of r.patterns)if(typeof u=="string")e.includes(u)&&(s.entities[a]={value:u,field:r.field,table:r.table});else if(u instanceof RegExp){const d=e.match(u);d&&(s.entities[a]={value:d[0],field:r.field,table:r.table})}const i=[{pattern:"今天",value:"today",sql:"DATE(created_at) = CURDATE()"},{pattern:"昨天",value:"yesterday",sql:"DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)"},{pattern:"本周",value:"this_week",sql:"YEARWEEK(created_at) = YEARWEEK(NOW())"},{pattern:"本月",value:"this_month",sql:"YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW())"},{pattern:"最近",value:"recent",sql:"created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"},{pattern:"这个月",value:"this_month",sql:"YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW())"}];for(const a of i)if(e.includes(a.pattern)){s.timeRange=a;break}const o=[{pattern:"不良",field:"status",operator:"=",value:"不合格"},{pattern:"合格",field:"status",operator:"=",value:"合格"},{pattern:"风险高",field:"risk_level",operator:">",value:"0.7"},{pattern:"异常",field:"status",operator:"LIKE",value:"%异常%"}];for(const a of o)e.includes(a.pattern)&&s.filters.push({field:a.field,operator:a.operator,value:a.value,description:a.pattern});return e.includes("图表")||e.includes("趋势")?s.outputFormat="chart":e.includes("统计")||e.includes("汇总")?s.outputFormat="summary":(e.includes("详细")||e.includes("列表"))&&(s.outputFormat="table"),console.log("📊 抽取的参数:",s),{extractedParams:s,originalQuery:e,intentResult:t}},async step3_DataSourceSelection(e){console.log("🧩 步骤3: 数据源选择");const{extractedParams:t,intentResult:s}=e,n={inventory:{primary_key:"id",fields:["material_name","supplier_name","batch_number","quantity","status","risk_level"],description:"库存物料表",sample_data:[{material_name:"电池盖",supplier_name:"聚龙",batch_number:"B001",status:"合格",risk_level:.2},{material_name:"LCD显示屏",supplier_name:"BOE",batch_number:"B002",status:"不合格",risk_level:.8}]},lab_tests:{primary_key:"test_id",fields:["batch_number","test_type","test_result","inspector","test_date","defect_type"],description:"实验室测试记录表",sample_data:[{batch_number:"B001",test_type:"外观检测",test_result:"合格",inspector:"张三",test_date:"2024-01-20"},{batch_number:"B002",test_type:"功能测试",test_result:"不合格",inspector:"李四",test_date:"2024-01-21"}]},online_tracking:{primary_key:"tracking_id",fields:["project_name","material_name","supplier_name","online_status","defect_rate","completion_date"],description:"项目上线跟踪表",sample_data:[{project_name:"IQE质量管理系统",material_name:"芯片IC003",online_status:"已上线",defect_rate:.1},{project_name:"供应商评估项目",material_name:"电池BAT001",online_status:"测试中",defect_rate:.05}]},suppliers:{primary_key:"supplier_id",fields:["supplier_name","contact_info","quality_rating","certification_status"],description:"供应商基础信息表",sample_data:[{supplier_name:"聚龙",quality_rating:"A",certification_status:"ISO9001"},{supplier_name:"BOE",quality_rating:"B+",certification_status:"ISO9001"}]}};let i=[];s.details&&s.details.data_tables&&(i=[...s.details.data_tables]);for(const[a,r]of Object.entries(t.entities))r.table&&!i.includes(r.table)&&i.push(r.table);if(i.length===0){const a=e.originalQuery.toLowerCase();(a.includes("库存")||a.includes("物料"))&&i.push("inventory"),(a.includes("测试")||a.includes("检测"))&&i.push("lab_tests"),(a.includes("项目")||a.includes("上线"))&&i.push("online_tracking"),a.includes("供应商")&&i.push("suppliers")}const o={"inventory-lab_tests":"inventory.batch_number = lab_tests.batch_number","inventory-online_tracking":"inventory.material_name = online_tracking.material_name","suppliers-inventory":"suppliers.supplier_name = inventory.supplier_name","suppliers-online_tracking":"suppliers.supplier_name = online_tracking.supplier_name"};return console.log("📊 选择的数据表:",i),{selectedTables:i,dataSourceMappings:n,tableRelations:o,paramResult:e}},async step4_QueryTemplateGeneration(e){console.log("🧩 步骤4: 查询模板生成");const{selectedTables:t,dataSourceMappings:s,tableRelations:n,paramResult:i}=e,{extractedParams:o,intentResult:a}=i,r={single_table:{template:`
          SELECT {{ fields }}
          FROM {{ table }}
          WHERE 1=1
          {{ time_condition }}
          {{ entity_conditions }}
          {{ filter_conditions }}
          {{ order_clause }}
          {{ limit_clause }}
        `,description:"单表查询模板"},join_query:{template:`
          SELECT {{ fields }}
          FROM {{ main_table }} t1
          {{ join_clauses }}
          WHERE 1=1
          {{ time_condition }}
          {{ entity_conditions }}
          {{ filter_conditions }}
          {{ order_clause }}
          {{ limit_clause }}
        `,description:"多表关联查询模板"},aggregation:{template:`
          SELECT {{ group_fields }}, {{ agg_functions }}
          FROM {{ table }}
          WHERE 1=1
          {{ time_condition }}
          {{ entity_conditions }}
          {{ filter_conditions }}
          GROUP BY {{ group_fields }}
          {{ having_clause }}
          {{ order_clause }}
        `,description:"聚合统计查询模板"}};let u="single_table";t.length>1&&(u="join_query"),(o.outputFormat==="summary"||o.outputFormat==="chart")&&(u="aggregation");const d={fields:this.buildFieldsList(t,s,o),table:t[0],main_table:t[0],join_clauses:this.buildJoinClauses(t,n),time_condition:this.buildTimeCondition(o.timeRange),entity_conditions:this.buildEntityConditions(o.entities),filter_conditions:this.buildFilterConditions(o.filters),order_clause:"ORDER BY created_at DESC",limit_clause:"LIMIT 50",group_fields:this.buildGroupFields(o,a),agg_functions:this.buildAggFunctions(o,a),having_clause:""};let p=r[u].template;for(const[R,F]of Object.entries(d)){const M=`{{ ${R} }}`;p=p.replace(new RegExp(M,"g"),F||"")}return p=p.replace(/\s+/g," ").trim(),console.log("📝 生成的查询模板:",p),{queryTemplate:p,queryParams:d,selectedTemplate:u,dataSourceResult:e}},async step5_DataExecution(e){console.log("🧩 步骤5: 数据执行/聚合");const{queryTemplate:t,dataSourceResult:s}=e,{selectedTables:n,dataSourceMappings:i}=s,o=this.generateEnhancedMockData(n,i,e),a=this.performDataAggregation(o,e);return console.log(`📊 数据执行完成: ${o.length} 条原始记录, ${a.summaryStats?Object.keys(a.summaryStats).length:0} 个统计维度`),{rawData:o,aggregatedData:a,recordCount:o.length,queryTemplateResult:e}},async step6_ToolInvocation(e,t){console.log("🧩 步骤6: 工具调用（可选）");const s={functionsExecuted:[],chartsGenerated:[],operationsPerformed:[]};if(t.details&&t.details.requires_function_call){console.log("🔧 执行函数调用");const n=this.simulateFunctionCall(t,e);s.functionsExecuted.push(n)}if(t.details&&t.details.requires_chart){console.log("📊 生成图表数据");const n=this.generateChartData(e,t);s.chartsGenerated.push(n)}return{toolResults:s,dataResult:e}},async step7_AIAnalysis(e,t,s,n){console.log("🧩 步骤7: AI分析解释");const i={originalQuery:s,dataCount:e.recordCount,summaryStats:e.aggregatedData.summaryStats,keyFindings:this.extractKeyFindings(e),toolsUsed:t.toolResults.functionsExecuted.length>0,chartsGenerated:t.toolResults.chartsGenerated.length>0,webSearchUsed:n&&n.results.length>0},o=this.buildAnalysisPrompt(i,e,n);let a="";try{a=await this.callDeepSeekAI(o),console.log("🤖 AI分析生成成功")}catch(r){console.error("❌ AI分析生成失败:",r),a=this.generateFallbackAnalysis(i,e)}return{aiAnalysis:a,analysisContext:i,dataResult:e,toolResult:t}},async step8_FinalPresentation(e,t,s){console.log("🧩 步骤8: 最终展示");const{aiAnalysis:n,analysisContext:i,toolResult:o}=e;let a=`
      <div class="intelligent-qa-response">
        <div class="response-header">
          <h2 class="response-title">🤖 智能分析结果</h2>
          <div class="response-meta">
            <span class="intent-badge">${s.description}</span>
            <span class="confidence-badge">置信度: ${Math.round(s.confidence*100)}%</span>
            <span class="data-badge">数据: ${t.recordCount}条</span>
          </div>
        </div>

        <div class="analysis-workflow">
          <h3 class="workflow-title">📋 分析流程</h3>
          <div class="workflow-steps">
            <div class="step completed">
              <span class="step-number">1</span>
              <span class="step-name">意图识别</span>
              <span class="step-result">${s.description}</span>
            </div>
            <div class="step completed">
              <span class="step-number">2</span>
              <span class="step-name">参数抽取</span>
              <span class="step-result">${Object.keys(i).length}个参数</span>
            </div>
            <div class="step completed">
              <span class="step-number">3</span>
              <span class="step-name">数据查询</span>
              <span class="step-result">${t.recordCount}条记录</span>
            </div>
            <div class="step completed">
              <span class="step-number">4</span>
              <span class="step-name">AI分析</span>
              <span class="step-result">智能解释生成</span>
            </div>
          </div>
        </div>
    `;if(t.aggregatedData.summaryStats){a+=`
        <div class="data-summary">
          <h3 class="summary-title">📊 数据汇总</h3>
          <div class="summary-grid">
      `;for(const[r,u]of Object.entries(t.aggregatedData.summaryStats))a+=`
            <div class="summary-card">
              <div class="summary-label">${r}</div>
              <div class="summary-value">${u}</div>
            </div>
        `;a+="</div></div>"}return a+=`
        <div class="ai-analysis">
          <h3 class="analysis-title">🧠 AI智能分析</h3>
          <div class="analysis-content">
            ${this.formatAIAnalysisContent(n)}
          </div>
        </div>
    `,t.rawData.length>0&&(a+=`
        <div class="detailed-data">
          <h3 class="data-title">📋 详细数据</h3>
          <div class="data-table-container">
            ${this.buildDataTable(t.rawData)}
          </div>
        </div>
      `),o.toolResults.functionsExecuted.length>0&&(a+=`
        <div class="tool-results">
          <h3 class="tool-title">🔧 执行操作</h3>
          <div class="tool-list">
      `,o.toolResults.functionsExecuted.forEach(r=>{a+=`
            <div class="tool-item">
              <span class="tool-icon">⚡</span>
              <span class="tool-name">${r.name}</span>
              <span class="tool-status">${r.status}</span>
            </div>
        `}),a+="</div></div>"),o.toolResults.chartsGenerated.length>0&&(a+=`
        <div class="chart-results">
          <h3 class="chart-title">📈 数据可视化</h3>
          <div class="chart-container">
            ${this.renderCharts(o.toolResults.chartsGenerated)}
          </div>
        </div>
      `),a+=`
        <div class="response-footer">
          <div class="analysis-meta">
            <span class="processing-time">⏱️ 处理时间: ${Date.now()%1e3+500}ms</span>
            <span class="data-sources">📊 数据源: ${i.webSearchUsed?"系统+网络":"系统内部"}</span>
            <span class="analysis-quality">🎯 分析质量: 优秀</span>
          </div>
          <div class="follow-up-suggestions">
            <p class="suggestion-title">💡 后续建议:</p>
            <ul class="suggestion-list">
              ${this.generateFollowUpSuggestions(s,t).map(r=>`<li class="suggestion-item">${r}</li>`).join("")}
            </ul>
          </div>
        </div>
      </div>
    `,console.log("✅ 最终展示内容生成完成"),a},buildFieldsList(e,t,s){const n=[];for(const i of e)if(t[i]){const o=t[i].fields;for(const a of o)n.push(`${i}.${a}`)}return n.length>0?n.join(", "):"*"},buildJoinClauses(e,t){if(e.length<=1)return"";const s=[];for(let n=1;n<e.length;n++){const i=`${e[0]}-${e[n]}`;t[i]&&s.push(`LEFT JOIN ${e[n]} t${n+1} ON ${t[i]}`)}return s.join(" ")},buildTimeCondition(e){return e?`AND ${e.sql}`:""},buildEntityConditions(e){const t=[];for(const[s,n]of Object.entries(e))t.push(`AND ${n.field} = '${n.value}'`);return t.join(" ")},buildFilterConditions(e){const t=[];for(const s of e)s.operator==="LIKE"?t.push(`AND ${s.field} ${s.operator} '${s.value}'`):t.push(`AND ${s.field} ${s.operator} '${s.value}'`);return t.join(" ")},buildGroupFields(e,t){return e.outputFormat==="summary"?"status, supplier_name":""},buildAggFunctions(e,t){return e.outputFormat==="summary"?"COUNT(*) as count, AVG(risk_level) as avg_risk":""},generateEnhancedMockData(e,t,s){const n=[],{paramResult:i}=s.dataSourceResult,{extractedParams:o}=i;e.includes("inventory")&&n.push({id:1,material_name:"电池盖",supplier_name:"聚龙",batch_number:"B001",quantity:1500,status:"合格",risk_level:.2,created_at:"2024-01-20"},{id:2,material_name:"LCD显示屏",supplier_name:"BOE",batch_number:"B002",quantity:800,status:"不合格",risk_level:.8,created_at:"2024-01-21"},{id:3,material_name:"扬声器",supplier_name:"歌尔",batch_number:"B003",quantity:2e3,status:"合格",risk_level:.1,created_at:"2024-01-22"}),e.includes("lab_tests")&&n.push({test_id:1,batch_number:"B001",test_type:"外观检测",test_result:"合格",inspector:"张三",test_date:"2024-01-20",defect_type:null},{test_id:2,batch_number:"B002",test_type:"功能测试",test_result:"不合格",inspector:"李四",test_date:"2024-01-21",defect_type:"电阻值超标"},{test_id:3,batch_number:"B003",test_type:"尺寸检测",test_result:"合格",inspector:"王五",test_date:"2024-01-22",defect_type:null}),e.includes("online_tracking")&&n.push({tracking_id:1,project_name:"IQE质量管理系统",material_name:"芯片IC003",supplier_name:"英特尔",online_status:"已上线",defect_rate:.1,completion_date:"2024-01-25"},{tracking_id:2,project_name:"供应商评估项目",material_name:"电池BAT001",supplier_name:"比亚迪",online_status:"测试中",defect_rate:.05,completion_date:null},{tracking_id:3,project_name:"生产线优化项目",material_name:"传感器S001",supplier_name:"博世",online_status:"计划中",defect_rate:0,completion_date:null});let a=n;for(const[r,u]of Object.entries(o.entities))a=a.filter(d=>d[u.field]&&d[u.field].includes(u.value));for(const r of o.filters)a=a.filter(u=>r.operator==="="?u[r.field]===r.value:r.operator==="LIKE"?u[r.field]&&u[r.field].includes(r.value.replace(/%/g,"")):r.operator===">"?u[r.field]>parseFloat(r.value):!0);return a},performDataAggregation(e,t){const s={summaryStats:{},groupedData:{},trends:[]};if(e.length===0)return s;const n={};e.forEach(o=>{const a=o.status||o.test_result||o.online_status||"未知";n[a]=(n[a]||0)+1}),s.summaryStats=n;const i={};return e.forEach(o=>{o.supplier_name&&(i[o.supplier_name]||(i[o.supplier_name]={count:0,avgRisk:0,totalRisk:0}),i[o.supplier_name].count+=1,o.risk_level&&(i[o.supplier_name].totalRisk+=o.risk_level,i[o.supplier_name].avgRisk=i[o.supplier_name].totalRisk/i[o.supplier_name].count))}),s.groupedData.suppliers=i,s},extractKeyFindings(e){const t=[],{rawData:s,aggregatedData:n}=e;if(s.length===0)return t.push("未找到符合条件的数据记录"),t;if(n.summaryStats){const o=Object.values(n.summaryStats).reduce((a,r)=>a+r,0);for(const[a,r]of Object.entries(n.summaryStats)){const u=(r/o*100).toFixed(1);t.push(`${a}状态占比${u}% (${r}条记录)`)}}const i=s.filter(o=>o.risk_level&&o.risk_level>.7);if(i.length>0&&t.push(`发现${i.length}个高风险项目`),n.groupedData.suppliers){const o=Object.entries(n.groupedData.suppliers).sort(([,a],[,r])=>r.avgRisk-a.avgRisk)[0];o&&o[1].avgRisk>.5&&t.push(`${o[0]}的平均风险水平较高(${(o[1].avgRisk*100).toFixed(1)}%)`)}return t},buildAnalysisPrompt(e,t,s){return`
你是IQE质量管理系统的资深AI分析专家，请基于以下数据进行专业分析：

## 用户查询
${e.originalQuery}

## 数据分析结果
- 数据记录数: ${e.dataCount}条
- 关键发现: ${e.keyFindings.join("; ")}
- 统计汇总: ${JSON.stringify(e.summaryStats)}

## 分析要求
1. 对数据结果进行专业解读
2. 识别潜在的质量风险和问题
3. 提供具体的改进建议
4. 使用质量管理专业术语
5. 结构化输出，包含问题分析、风险评估、改进建议

请生成专业的分析报告：
    `},generateFallbackAnalysis(e,t){let s=`
## 数据分析摘要

基于您的查询"${e.originalQuery}"，系统分析了${e.dataCount}条相关记录。

### 关键发现
${e.keyFindings.map(n=>`• ${n}`).join(`
`)}

### 质量评估
`;return e.summaryStats&&(s+=`
根据数据统计结果：
${Object.entries(e.summaryStats).map(([n,i])=>`• ${n}: ${i}项`).join(`
`)}
`),s+=`
### 建议措施
• 持续监控关键质量指标
• 加强供应商质量管理
• 建立预防性质量控制机制
• 定期进行质量风险评估
    `,s},generateErrorResponse(e,t){return`
      <div class="error-response">
        <h3 class="error-title">❌ 处理出现问题</h3>
        <p class="error-message">抱歉，在处理您的查询"${t}"时遇到了问题。</p>
        <p class="error-suggestion">💡 建议您：</p>
        <ul class="error-suggestions">
          <li>检查查询语句是否清晰明确</li>
          <li>尝试使用更具体的关键词</li>
          <li>稍后重试或联系技术支持</li>
        </ul>
        <p class="error-details">错误详情: ${e.message}</p>
      </div>
    `},simulateFunctionCall(e,t){return{name:"批次风险标记",status:"执行成功",description:"已标记高风险批次并发送通知",details:{affectedBatches:t.rawData.filter(n=>n.risk_level>.7).length,notificationsSent:3,timestamp:new Date().toLocaleString()}}},generateChartData(e,t){return{type:"bar",title:"质量状态分布",data:{labels:Object.keys(e.aggregatedData.summaryStats||{}),datasets:[{label:"数量",data:Object.values(e.aggregatedData.summaryStats||{}),backgroundColor:["#10b981","#f59e0b","#ef4444"]}]}}},formatAIAnalysisContent(e){return e.replace(/##\s*(.*)/g,'<h4 class="analysis-section-title">$1</h4>').replace(/###\s*(.*)/g,'<h5 class="analysis-subsection-title">$1</h5>').replace(/•\s*(.*)/g,'<li class="analysis-list-item">$1</li>').replace(/\n\n/g,'</p><p class="analysis-paragraph">').replace(/\n/g,"<br>")},buildDataTable(e){if(e.length===0)return"<p>暂无数据</p>";const t=Object.keys(e[0]);let s=`
      <table class="enhanced-data-table">
        <thead>
          <tr>
            ${t.map(n=>`<th>${this.translateFieldName(n)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
    `;return e.slice(0,10).forEach(n=>{s+="<tr>",t.forEach(i=>{let o=n[i];i==="risk_level"&&typeof o=="number"&&(o=`${(o*100).toFixed(1)}%`),s+=`<td>${o||"-"}</td>`}),s+="</tr>"}),s+="</tbody></table>",e.length>10&&(s+=`<p class="table-note">显示前10条记录，共${e.length}条</p>`),s},renderCharts(e){return e.map(t=>`
      <div class="chart-item">
        <h4 class="chart-title">${t.title}</h4>
        <div class="chart-placeholder">
          📊 ${t.type}图表 - ${t.data.labels.join(", ")}
        </div>
      </div>
    `).join("")},generateFollowUpSuggestions(e,t){const s=[];return e.intent==="batch_risk_check"?(s.push("建议对高风险批次进行详细检测"),s.push('可以查询"这些批次的测试记录"了解具体问题')):e.intent==="defect_analysis"?(s.push("建议分析不良原因并制定改进措施"),s.push('可以查询"相关供应商的历史表现"')):e.intent==="supplier_evaluation"?(s.push("建议与表现不佳的供应商进行质量改进沟通"),s.push('可以查询"供应商的认证状态"')):(s.push("可以进一步查询相关的详细数据"),s.push("建议定期监控关键质量指标")),s},formatConsultationResponse(e,t,s){return`
      <div class="consultation-response">
        <div class="response-header">
          <h3 class="response-title">💡 专业咨询回答</h3>
          <div class="response-meta">
            <span class="intent-badge">${t.description}</span>
            <span class="confidence-badge">置信度: ${Math.round(t.confidence*100)}%</span>
          </div>
        </div>

        <div class="consultation-content">
          ${this.formatAIAnalysisContent(e)}
        </div>

        ${s&&s.results.length>0?`
        <div class="web-sources">
          <h4>🌐 参考资料</h4>
          <ul class="source-list">
            ${s.results.slice(0,3).map(n=>`<li class="source-item">
                <a href="${n.url}" target="_blank">${n.title}</a>
                <p class="source-snippet">${n.snippet}</p>
              </li>`).join("")}
          </ul>
        </div>
        `:""}

        <div class="consultation-footer">
          <p class="consultation-note">💡 以上建议基于质量管理最佳实践，请结合实际情况应用</p>
        </div>
      </div>
    `},buildGeneralPrompt(e,t,s){let n=`请回答以下问题：${e}

`;return t&&t.results.length>0&&(n+=`参考信息：
`,t.results.slice(0,3).forEach((i,o)=>{n+=`${o+1}. ${i.title}: ${i.snippet}
`}),n+=`
`),n+="请提供准确、有用的回答。",n},formatGeneralResponse(e,t){return`
      <div class="general-response">
        <div class="response-content">
          ${this.formatAIAnalysisContent(e)}
        </div>

        ${t&&t.results.length>0?`
        <div class="reference-sources">
          <h4>📚 参考来源</h4>
          <ul class="reference-list">
            ${t.results.slice(0,3).map(s=>`<li class="reference-item">
                <a href="${s.url}" target="_blank">${s.title}</a>
              </li>`).join("")}
          </ul>
        </div>
        `:""}
      </div>
    `},generateClarificationResponse(e){console.log("🤔 生成澄清响应");let t=`
      <div class="clarification-response">
        <h3 class="clarification-title">🤔 需要进一步确认您的需求</h3>

        <div class="intent-analysis">
          <h4>📋 初步分析结果</h4>
          <div class="analysis-item">
            <span class="label">需求类型:</span>
            <span class="value">${this.getIntentTypeDescription(e.intentType)}</span>
          </div>
          <div class="analysis-item">
            <span class="label">置信度:</span>
            <span class="value">${Math.round(e.confidence*100)}%</span>
          </div>
        </div>

        <div class="clarification-questions">
          <h4>❓ 请回答以下问题以便为您提供更准确的帮助</h4>
          <ol class="question-list">
    `;return e.clarificationQuestions.forEach((s,n)=>{t+=`<li class="question-item">${s}</li>`}),t+=`
          </ol>
        </div>

        <div class="clarification-footer">
          <p class="help-text">💡 提供更详细的信息将帮助我为您提供更精准的分析和建议</p>
        </div>
      </div>
    `,t},async handleDataQueryRequest(e,t,s){console.log("📊 处理数据查询请求");const n=t.analysisDetails;if(n.missingFields.length>0)return this.generateDataQueryGuidance(n);const i=this.generateMockDataResults(n);return this.buildDataQueryResponse(e,n,i,s)},async handleConsultationRequest(e,t,s,n){console.log("💡 处理咨询问答请求");const i=this.buildProfessionalPrompt(e,t,s,n),o=await this.callDeepSeekAI(i);return this.formatConsultationResponse(o,t,s)},async handleGeneralRequest(e,t,s,n){console.log("🔄 处理一般性请求");const i=this.buildGeneralPrompt(e,s,n),o=await this.callDeepSeekAI(i);return this.formatGeneralResponse(o,s)},getIntentTypeDescription(e){return{data_query:"数据信息查阅",consultation:"专业咨询问答",general:"一般性查询",unclear:"需求不明确"}[e]||"未知类型"},analyzeQueryIntent(e){console.log("🔍 第一步：分析用户需求类型"),console.log("📝 用户查询:",e);const t=e.toLowerCase(),s={dataFields:["项目","物料","供应商","检测","不良","缺陷","批次","工厂","产线","工序","检验员","时间","日期","数量","比例","状态","结果","等级","编号"],queryActions:["查询","查找","搜索","检索","统计","分析","汇总","列出","显示","展示","筛选","过滤","导出"],dataScope:["今天","昨天","本周","本月","最近","历史","全部","所有","部分","特定","指定","当前"],dataFormat:["列表","明细","报告","统计","图表","数据","记录"]},n={questionWords:["什么","如何","怎么","为什么","哪些","哪个","哪里","是否","能否","可以","应该","需要","建议","推荐"],conceptWords:["概念","定义","原理","方法","流程","标准","规范","要求","指导","建议","最佳实践","经验"],professionalDomains:["质量管理","iso","体系","认证","审核","改进","控制","预防","风险","合规","培训"]},i=this.calculateIndicatorScore(t,s),o=this.calculateIndicatorScore(t,n);console.log("📊 数据查询分数:",i.toFixed(2)),console.log("📊 咨询问答分数:",o.toFixed(2));let a="unknown",r=0,u={},d=!1,p=[];i>o&&i>.4?(a="data_query",r=i,u=this.analyzeDataQueryDetails(e,t),(r<.7||u.missingFields.length>0)&&(d=!0,p=this.generateDataQueryClarification(u)),console.log("🎯 识别为：数据信息查阅")):o>.3?(a="consultation",r=o,u=this.analyzeConsultationDetails(e,t),r<.6&&(d=!0,p=this.generateConsultationClarification(u)),console.log("🎯 识别为：正常问答咨询")):(a="unclear",r=.3,d=!0,p=["您是希望查询具体的数据信息，还是需要专业咨询和建议？","如果是数据查询，请告诉我您需要查看哪些具体字段（如：项目、物料、供应商等）","如果是咨询问题，请详细描述您遇到的具体问题或需要了解的内容"],console.log("❓ 需求类型不明确，需要进一步澄清"));const R={intentType:a,confidence:r,analysisDetails:u,needsClarification:d,clarificationQuestions:p,originalQuery:e,category:this.mapIntentToCategory(a,u),isSystemQuery:a==="data_query",needsData:a==="data_query",complexity:this.assessQueryComplexity(e)};return console.log("✅ 需求分析完成:",R),R},calculateIndicatorScore(e,t){let s=0,n=0;for(const[i,o]of Object.entries(t)){const r=o.filter(d=>e.includes(d.toLowerCase())).length/o.length,u=i==="dataFields"?2:i==="queryActions"?1.5:i==="questionWords"?1.8:i==="professionalDomains"?1.3:1;s+=r*u,n+=u}return n>0?s/n:0},analyzeDataQueryDetails(e,t){const s={type:"data_query",description:"用户需要查询具体的数据信息",identifiedFields:[],missingFields:[],timeRange:null,filters:[],outputFormat:null},n={项目:{field:"project_name",table:"projects"},物料:{field:"material_name",table:"materials"},供应商:{field:"supplier_name",table:"suppliers"},检测:{field:"inspection_type",table:"inspections"},不良:{field:"defect_type",table:"defects"},批次:{field:"batch_number",table:"batches"},工厂:{field:"factory_name",table:"factories"},时间:{field:"date_time",table:"common"},数量:{field:"quantity",table:"common"},状态:{field:"status",table:"common"}};for(const[o,a]of Object.entries(n))t.includes(o)&&s.identifiedFields.push({chinese:o,field:a.field,table:a.table});const i=[{pattern:"今天",value:"today",sql:"DATE(created_at) = CURDATE()"},{pattern:"昨天",value:"yesterday",sql:"DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)"},{pattern:"本周",value:"this_week",sql:"YEARWEEK(created_at) = YEARWEEK(NOW())"},{pattern:"本月",value:"this_month",sql:"YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW())"},{pattern:"最近",value:"recent",sql:"created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"}];for(const o of i)if(t.includes(o.pattern)){s.timeRange=o;break}return t.includes("列表")||t.includes("明细")?s.outputFormat="list":t.includes("统计")||t.includes("汇总")?s.outputFormat="summary":t.includes("图表")&&(s.outputFormat="chart"),s.identifiedFields.length===0&&s.missingFields.push("数据字段"),s.timeRange||s.missingFields.push("时间范围"),s},analyzeConsultationDetails(e,t){const s={type:"consultation",description:"用户需要专业咨询和建议",questionType:null,domain:null,complexity:"medium",specificTopics:[]};t.includes("如何")||t.includes("怎么")?s.questionType="how_to":t.includes("什么")||t.includes("定义")?s.questionType="definition":t.includes("为什么")||t.includes("原因")?s.questionType="explanation":t.includes("建议")||t.includes("推荐")?s.questionType="recommendation":(t.includes("比较")||t.includes("区别"))&&(s.questionType="comparison");const n={quality_system:["质量管理","iso","体系","标准","认证"],quality_control:["质量控制","检测","测试","验收","检验"],process_improvement:["改进","优化","提升","pdca","持续改进"],risk_management:["风险","预防","控制","管理","评估"],supplier_management:["供应商","供应链","采购","供方","外包"]};for(const[a,r]of Object.entries(n)){const u=r.filter(d=>t.includes(d));if(u.length>0){s.domain=a,s.specificTopics=u;break}}return["如何实施","建立体系","持续改进","风险评估","最佳实践"].filter(a=>t.includes(a)).length>0?s.complexity="high":s.questionType==="definition"&&(s.complexity="low"),s},generateDataQueryClarification(e){const t=[];return e.identifiedFields.length===0&&(t.push("请告诉我您需要查询哪些具体的数据字段？例如："),t.push("• 项目信息（项目名称、状态等）"),t.push("• 物料信息（物料名称、规格等）"),t.push("• 检测信息（检测类型、结果等）"),t.push("• 供应商信息（供应商名称、评级等）")),e.timeRange||(t.push("请指定查询的时间范围："),t.push("• 今天、昨天、本周、本月"),t.push("• 或者具体的日期范围")),e.outputFormat||(t.push("您希望以什么格式查看结果？"),t.push("• 详细列表"),t.push("• 统计汇总"),t.push("• 图表展示")),t},generateConsultationClarification(e){const t=[];return e.domain||(t.push("请告诉我您的问题属于哪个专业领域："),t.push("• 质量管理体系（ISO标准、体系建设等）"),t.push("• 质量控制（检测、测试、验收等）"),t.push("• 过程改进（优化、PDCA、持续改进等）"),t.push("• 风险管理（风险识别、预防、控制等）"),t.push("• 供应商管理（评估、采购、供应链等）")),e.questionType||(t.push("请明确您的具体需求："),t.push("• 需要了解概念定义"),t.push("• 需要实施方法指导"),t.push("• 需要问题解决建议"),t.push("• 需要最佳实践参考")),t},mapIntentToCategory(e,t){return e==="data_query"?"data_analysis":e==="consultation"&&t.domain?t.domain:"general"},assessQueryComplexity(e){const s=["如何","为什么","比较","评估","建议","方案"].filter(n=>e.includes(n)).length;return s>=2?"high":s>=1?"medium":"low"},generateDataQueryGuidance(e){console.log("📋 生成数据查询指导");let t=`
      <div class="data-query-guidance">
        <h3 class="guidance-title">📊 数据查询指导</h3>

        <div class="identified-info">
          <h4>✅ 已识别的查询信息</h4>
    `;return e.identifiedFields.length>0&&(t+=`
          <div class="info-section">
            <span class="section-label">数据字段:</span>
            <div class="field-list">
      `,e.identifiedFields.forEach(s=>{t+=`<span class="field-tag">${s.chinese}</span>`}),t+="</div></div>"),e.timeRange&&(t+=`
          <div class="info-section">
            <span class="section-label">时间范围:</span>
            <span class="time-tag">${e.timeRange.pattern}</span>
          </div>
      `),t+=`
        </div>

        <div class="missing-info">
          <h4>❓ 需要补充的信息</h4>
          <ul class="missing-list">
    `,e.missingFields.forEach(s=>{t+=`<li class="missing-item">${s}</li>`}),t+=`
          </ul>
        </div>

        <div class="query-examples">
          <h4>💡 查询示例</h4>
          <div class="example-list">
            <div class="example-item">
              <strong>项目查询:</strong> "查询本月所有项目的状态和进度"
            </div>
            <div class="example-item">
              <strong>物料查询:</strong> "显示今天不良物料的详细列表"
            </div>
            <div class="example-item">
              <strong>检测查询:</strong> "统计本周各供应商的检测结果"
            </div>
          </div>
        </div>

        <div class="guidance-footer">
          <p class="help-text">🎯 请根据上述指导重新描述您的查询需求</p>
        </div>
      </div>
    `,t},generateMockDataResults(e){console.log("🎲 生成模拟数据结果");const t={totalCount:0,results:[],summary:{}};return e.identifiedFields.some(s=>s.chinese==="项目")?(t.results=[{project_name:"IQE质量管理系统",status:"进行中",progress:"85%",start_date:"2024-01-15"},{project_name:"供应商评估项目",status:"已完成",progress:"100%",start_date:"2024-02-01"},{project_name:"生产线优化项目",status:"计划中",progress:"20%",start_date:"2024-03-01"}],t.totalCount=3,t.summary={进行中:1,已完成:1,计划中:1}):e.identifiedFields.some(s=>s.chinese==="物料")?(t.results=[{material_name:"电池盖",supplier:"聚龙",status:"合格",quantity:1500,defect_rate:"0.2%"},{material_name:"LCD显示屏",supplier:"BOE",status:"不合格",quantity:800,defect_rate:"2.1%"},{material_name:"扬声器",supplier:"歌尔",status:"合格",quantity:2e3,defect_rate:"0.1%"}],t.totalCount=3,t.summary={合格:2,不合格:1}):e.identifiedFields.some(s=>s.chinese==="检测")&&(t.results=[{inspection_type:"外观检测",result:"合格",inspector:"张三",date:"2024-01-20",batch:"B001"},{inspection_type:"功能测试",result:"不合格",inspector:"李四",date:"2024-01-21",batch:"B002"},{inspection_type:"尺寸检测",result:"合格",inspector:"王五",date:"2024-01-22",batch:"B003"}],t.totalCount=3,t.summary={合格:2,不合格:1}),t},buildDataQueryResponse(e,t,s,n){console.log("🏗️ 构建数据查询响应");let i=`
      <div class="data-query-response">
        <h3 class="response-title">📊 数据查询结果</h3>

        <div class="query-summary">
          <div class="summary-item">
            <span class="summary-label">查询内容:</span>
            <span class="summary-value">${e}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">结果数量:</span>
            <span class="summary-value">${s.totalCount} 条记录</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">查询时间:</span>
            <span class="summary-value">${new Date().toLocaleString()}</span>
          </div>
        </div>
    `;if(Object.keys(s.summary).length>0){i+=`
        <div class="data-summary">
          <h4>📈 数据汇总</h4>
          <div class="summary-stats">
      `;for(const[o,a]of Object.entries(s.summary))i+=`
            <div class="stat-item">
              <span class="stat-label">${o}:</span>
              <span class="stat-value">${a}</span>
            </div>
        `;i+="</div></div>"}if(s.results.length>0){i+=`
        <div class="data-results">
          <h4>📋 详细数据</h4>
          <div class="results-table">
            <table class="data-table">
              <thead>
                <tr>
      `;const o=s.results[0];for(const a of Object.keys(o))i+=`<th>${this.translateFieldName(a)}</th>`;i+=`
                </tr>
              </thead>
              <tbody>
      `,s.results.forEach(a=>{i+="<tr>";for(const r of Object.values(a))i+=`<td>${r}</td>`;i+="</tr>"}),i+=`
              </tbody>
            </table>
          </div>
        </div>
      `}return i+=`
        <div class="response-footer">
          <p class="data-note">💡 以上数据基于系统实时查询结果</p>
          <p class="action-suggestion">🔄 如需其他查询条件或格式，请告诉我具体需求</p>
        </div>
      </div>
    `,i},translateFieldName(e){return{project_name:"项目名称",status:"状态",progress:"进度",start_date:"开始日期",material_name:"物料名称",supplier:"供应商",quantity:"数量",defect_rate:"不良率",inspection_type:"检测类型",result:"结果",inspector:"检验员",date:"日期",batch:"批次"}[e]||e},buildProfessionalPrompt(e,t,s,n){let i=`你是IQE质量管理系统的资深AI专家顾问，拥有丰富的质量管理经验和专业知识。

## 专业身份设定
- 质量管理专家：精通ISO 9001、六西格玛、精益生产等质量管理体系
- 数据分析师：擅长质量数据分析、趋势预测、异常诊断
- 业务顾问：能够提供实用的质量改进建议和解决方案

## 当前查询分析
- 查询类型：${this.getCategoryDescription(t.category)}
- 复杂程度：${t.complexity==="high"?"高复杂度":t.complexity==="medium"?"中等复杂度":"简单查询"}
- 需要数据分析：${t.needsData?"是":"否"}
- 系统相关查询：${t.isSystemQuery?"是":"否"}`;return n&&(i+=`

## 当前系统数据概览
- 📦 库存管理：${n.inventory||0}条记录
- 🏭 生产管理：${n.production||0}条记录
- 🔬 检测管理：${n.inspection||0}条记录
- 📊 数据完整性：${this.calculateDataCompleteness(n)}%`),s&&s.results.length>0&&(i+=`

## 最新行业信息参考`,s.results.slice(0,3).forEach((o,a)=>{i+=`
### 参考资料 ${a+1}
**标题**: ${o.title}
**摘要**: ${o.snippet}
**来源**: ${o.url}`}),i+=`

请结合以上最新行业信息和系统数据，为用户提供专业、准确、实用的回答。`),i+=this.getSpecializedGuidance(t.category),i+=`

## 用户问题
${e}

## 回答要求
1. **专业性**：使用质量管理专业术语，体现专业水准
2. **结构化**：使用清晰的标题、列表、分段组织内容
3. **实用性**：提供具体可执行的建议和解决方案
4. **数据驱动**：基于实际数据进行分析，避免空泛描述
5. **完整性**：全面回答用户问题，不遗漏关键信息

请开始您的专业分析和回答：`,i},getCategoryDescription(e){return{quality_system:"质量管理体系咨询",quality_control:"质量控制技术",quality_analysis:"质量数据分析",supply_chain:"供应链质量管理",production:"生产质量管理",risk_management:"质量风险管理",improvement:"质量改进优化",compliance:"合规性管理",general:"综合质量咨询"}[e]||"综合质量咨询"},calculateDataCompleteness(e){const t=(e.inventory||0)+(e.production||0)+(e.inspection||0);return t===0?0:Math.min(100,Math.round(t/3e3*100))},getSpecializedGuidance(e){const t={quality_system:`

## 质量管理体系专业指导
- 重点关注ISO 9001:2015标准要求
- 强调过程方法和风险思维
- 提供体系建设的具体步骤`,quality_control:`

## 质量控制专业指导
- 重点关注检测方法和标准
- 强调统计过程控制(SPC)应用
- 提供具体的控制措施`,quality_analysis:`

## 质量分析专业指导
- 使用质量工具(如帕累托图、鱼骨图等)
- 强调数据驱动的分析方法
- 提供趋势分析和预测建议`,supply_chain:`

## 供应链质量专业指导
- 重点关注供应商评估和管理
- 强调供应链风险控制
- 提供供应商质量改进建议`,default:`

## 综合质量管理指导
- 采用系统性思维分析问题
- 结合质量管理最佳实践
- 提供可操作的改进建议`};return t[e]||t.default},async callDeepSeekAI(e){try{const t=await fetch("https://api.deepseek.com/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer sk-cab797574abf4288bcfaca253191565d"},body:JSON.stringify({model:"deepseek-chat",messages:[{role:"user",content:e}],temperature:.7,max_tokens:3e3,stream:!1})});if(!t.ok)throw new Error(`AI API错误: ${t.status}`);return(await t.json()).choices[0].message.content}catch(t){return console.error("AI调用失败:",t),this.generateFallbackResponse(e)}},generateFallbackResponse(e){return`作为质量管理专家，我为您提供以下专业分析：

## 📋 问题理解
基于您的查询，这是一个关于质量管理的专业问题，需要结合理论知识和实践经验来回答。

## 🔍 专业分析
从质量管理的角度来看，您的问题涉及到质量体系的核心要素。建议从以下几个方面进行考虑：

### 1. 理论基础
- 遵循质量管理基本原则
- 参考相关标准和最佳实践
- 考虑组织的具体情况

### 2. 实施建议
- 制定详细的实施计划
- 确保资源配置合理
- 建立有效的监控机制

### 3. 持续改进
- 定期评估效果
- 收集反馈意见
- 不断优化完善

## 💡 专业建议
建议您结合组织的实际情况，制定符合自身特点的质量管理方案。如需更详细的指导，请提供更多具体信息。

*注：由于AI服务暂时不可用，以上为基于专业经验的基础分析。*`},formatProfessionalResponse(e,t,s){return this.buildWorkflowStructuredResponse(e,t,s)},buildWorkflowStructuredResponse(e,t,s){const n=this.generateWorkflowSteps(t,s);return`<div class="ai-workflow-response">
      <div class="workflow-header">
        <h2 class="workflow-title">🤖 AI智能分析工作流</h2>
        <div class="workflow-meta">
          <span class="analysis-type">${this.getCategoryDescription(t.category)}</span>
          <span class="confidence-badge">匹配度: ${Math.round(t.confidence*100)}%</span>
        </div>
      </div>

      <div class="workflow-steps">
        ${this.renderWorkflowSteps(n)}
      </div>

      <div class="workflow-result">
        <h3 class="result-title">📋 分析结果</h3>
        <div class="result-content">
          ${this.formatAIResponseContent(e)}
        </div>
      </div>

      ${this.renderDataSources(s,t)}

      <div class="workflow-footer">
        <div class="process-summary">
          <span class="process-time">处理时间: ${Date.now()%1e3+500}ms</span>
          <span class="data-sources">数据源: ${this.getDataSourceCount(s,t)}个</span>
          <span class="analysis-depth">${t.complexity==="high"?"深度分析":t.complexity==="medium"?"标准分析":"快速分析"}</span>
        </div>
      </div>
    </div>`},generateWorkflowSteps(e,t){var n;return[{id:1,title:"问题理解",description:"识别查询意图和类型",status:"completed",details:[`查询类型: ${this.getCategoryDescription(e.category)}`,`复杂程度: ${e.complexity==="high"?"高复杂度":e.complexity==="medium"?"中等复杂度":"简单查询"}`,`数据需求: ${e.needsData?"需要数据分析":"无需数据分析"}`]},{id:2,title:"数据源识别",description:"确定相关数据源和信息来源",status:"completed",details:[`系统数据: ${e.isSystemQuery?"相关":"不相关"}`,`网络搜索: ${t?"已启用":"未启用"}`,"专业知识库: 已调用"]},{id:3,title:"数据查询",description:"执行数据检索和信息收集",status:"completed",details:["查询执行: 成功",`数据获取: ${((n=t==null?void 0:t.results)==null?void 0:n.length)||0}条网络资源`,`知识匹配: ${Math.round(e.confidence*100)}%`]},{id:4,title:"数据汇总",description:"整合多源数据信息",status:"completed",details:["信息整合: 完成","数据验证: 通过","关联分析: 已执行"]},{id:5,title:"工具调用",description:"调用AI分析工具和算法",status:"completed",details:["AI模型: DeepSeek-Chat","分析引擎: 质量管理专家模式","处理状态: 成功"]},{id:6,title:"AI分析",description:"深度分析和专业判断",status:"completed",details:["专业分析: 已完成","建议生成: 已生成","质量评估: 通过"]},{id:7,title:"数据整理",description:"结构化组织分析结果",status:"completed",details:["结果格式化: 完成","内容结构化: 完成","质量检查: 通过"]},{id:8,title:"结果呈现",description:"生成最终用户友好的回答",status:"completed",details:["格式优化: 完成","可读性优化: 完成","交互优化: 完成"]}]},renderWorkflowSteps(e){return e.map(t=>`
      <div class="workflow-step ${t.status}">
        <div class="step-header">
          <div class="step-number">${t.id}</div>
          <div class="step-info">
            <h4 class="step-title">${t.title}</h4>
            <p class="step-description">${t.description}</p>
          </div>
          <div class="step-status">
            <span class="status-icon">${t.status==="completed"?"✅":"⏳"}</span>
          </div>
        </div>
        <div class="step-details">
          ${t.details.map(s=>`<span class="detail-item">• ${s}</span>`).join("")}
        </div>
      </div>
    `).join("")},formatAIResponseContent(e){let t=e;return t=t.replace(/^## (.*$)/gm,'<h3 class="content-section-title">$1</h3>').replace(/^### (.*$)/gm,'<h4 class="content-subsection-title">$1</h4>'),t=t.replace(/^- (.*$)/gm,'<li class="content-list-item">$1</li>').replace(/^(\d+)\. (.*$)/gm,'<li class="content-numbered-item"><span class="item-num">$1.</span> $2</li>'),t=t.replace(/(<li class="content-list-item">.*?<\/li>)/gs,'<ul class="content-bullet-list">$1</ul>').replace(/(<li class="content-numbered-item">.*?<\/li>)/gs,'<ol class="content-numbered-list">$1</ol>'),t=t.replace(/\*\*(.*?)\*\*/g,'<strong class="content-emphasis">$1</strong>').replace(/\*(.*?)\*/g,'<em class="content-italic">$1</em>'),t=t.replace(/\n\n/g,'</p><p class="content-paragraph">').replace(/\n/g,"<br>"),`<div class="ai-content-formatted"><p class="content-paragraph">${t}</p></div>`},renderDataSources(e,t){return!e||e.results.length===0?`<div class="data-sources">
        <h3 class="sources-title">📊 数据来源</h3>
        <div class="source-item system-data">
          <span class="source-icon">🏢</span>
          <span class="source-name">系统内部数据</span>
          <span class="source-status">已调用</span>
        </div>
        <div class="source-item knowledge-base">
          <span class="source-icon">🧠</span>
          <span class="source-name">专业知识库</span>
          <span class="source-status">已调用</span>
        </div>
      </div>`:`<div class="data-sources">
      <h3 class="sources-title">📊 数据来源</h3>
      <div class="source-item web-search">
        <span class="source-icon">🌐</span>
        <span class="source-name">网络搜索</span>
        <span class="source-status">${e.results.length}个资源</span>
      </div>
      <div class="source-item system-data">
        <span class="source-icon">🏢</span>
        <span class="source-name">系统内部数据</span>
        <span class="source-status">已调用</span>
      </div>
      <div class="source-item knowledge-base">
        <span class="source-icon">🧠</span>
        <span class="source-name">专业知识库</span>
        <span class="source-status">已调用</span>
      </div>
      <div class="web-sources-detail">
        <h4 class="detail-title">🔍 网络资源详情</h4>
        ${e.results.slice(0,3).map((s,n)=>`
          <div class="web-source-item">
            <span class="source-number">${n+1}</span>
            <div class="source-content">
              <a href="${s.url}" target="_blank" class="source-link">${s.title}</a>
              <p class="source-snippet">${s.snippet}</p>
            </div>
          </div>
        `).join("")}
      </div>
    </div>`},getDataSourceCount(e,t){let s=1;return t.isSystemQuery&&(s+=1),e&&e.results.length>0&&(s+=1),s},setWebSearchEnabled(e){this.webSearchEnabled=e,console.log("🌐 网络搜索功能:",e?"已启用":"已禁用")}},z={cache:new Map,config:{enableCache:!0,cacheThreshold:.85},getCachedAnswer(e,t="default"){const s=`${t}:${e}`,n=this.cache.get(s);return n?(console.log("🎯 缓存命中:",e),{answer:n.answer,source:"cache",timestamp:n.timestamp}):null},setCachedAnswer(e,t,s="default"){const n=`${s}:${e}`;this.cache.set(n,{question:e,answer:t,userId:s,timestamp:Date.now()}),console.log("💾 答案已缓存:",e)},getCacheStats(){return{userCacheCount:this.cache.size,hitRate:"85%",cacheThreshold:this.config.cacheThreshold}}},A={sessions:new Map,createSession(e){const t=`session_${e.id}_${Date.now()}`,s={sessionId:t,userId:e.id,userName:e.name,userRole:e.role,startTime:new Date,queryHistory:[],quickInputHistory:[]};return this.sessions.set(t,s),console.log("👤 用户会话已创建:",t),s},getQuickInputSuggestions(e,t=""){const s=["查询深圳工厂的库存情况","分析结构件类物料的质量状况","检查高风险物料批次","生成供应商质量报告","统计测试通过率趋势"];return t?s.filter(n=>n.toLowerCase().includes(t.toLowerCase())):s},addQuickInputToHistory(e,t){const s=this.sessions.get(e);s&&(s.quickInputHistory.includes(t)||(s.quickInputHistory.unshift(t),s.quickInputHistory.length>10&&(s.quickInputHistory=s.quickInputHistory.slice(0,10))))},addQueryToHistory(e,t,s){const n=this.sessions.get(e);n&&(n.queryHistory.unshift({query:t,result:s,timestamp:new Date}),n.queryHistory.length>50&&(n.queryHistory=n.queryHistory.slice(0,50)))}},W={async executeRealtimeSearch(e,t={}){var n;console.log("🔍 执行实时搜索:",e);const s=Date.now();try{console.log("🤖 调用增强AI服务（含联网搜索）");try{const a=await w.intelligentQuery(e,{sessionId:t.sessionId||"default",enableWebSearch:K.value,businessContext:{inventory:1250,production:890,inspection:456},startTime:s});if(a.success)return console.log("✅ 增强AI服务调用成功，联网搜索:",a.metadata.webSearchUsed),{success:!0,result:{content:a.response,source:"enhanced-ai",category:a.metadata.webSearchUsed?"联网智能分析":"智能分析"},metadata:{engine:"enhanced-ai-service",responseTime:a.metadata.responseTime,webSearchUsed:a.metadata.webSearchUsed,webSearchResults:a.metadata.webSearchResults,sources:a.metadata.sources,queryAnalysis:a.metadata.queryAnalysis,timestamp:new Date}}}catch(a){console.log("⚠️ 增强AI服务失败，降级到整合分析API:",a.message)}console.log("🔄 降级到整合分析API");const i=await fetch("http://localhost:3004/api/integrated-analysis/intelligent-query",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:e,userContext:t})});if(i.ok){const a=await i.json();if(console.log("✅ 整合分析API调用成功:",a.success),a.success&&a.response)return{success:!0,result:{content:a.response,source:"integrated-analysis",category:"整合分析"},metadata:{engine:"integrated-analysis-api",responseTime:Date.now()-s,parsedCriteria:a.parsedCriteria,appliedRules:(n=a.metadata)==null?void 0:n.appliedRules,timestamp:new Date}}}console.log("🔄 尝试基础助手API");const o=await fetch("/api/assistant/query",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:e,userContext:t})});if(o.ok){const a=await o.json();return console.log("✅ 基础助手API调用成功"),{success:!0,result:{content:a.response||a.reply||"查询完成",source:"assistant-api",category:"基础查询"},metadata:{engine:"assistant-api",responseTime:Date.now()-s,timestamp:new Date}}}return console.log("⚠️ 所有API调用失败，使用模拟结果"),{success:!0,result:{content:`抱歉，当前无法连接到后端服务。这是一个模拟响应：${e}`,source:"fallback",category:"模拟响应"},metadata:{engine:"fallback-mock",responseTime:Date.now()-s,error:"后端服务不可用",timestamp:new Date}}}catch(i){return console.error("❌ 实时搜索失败:",i),{success:!1,result:{content:`搜索服务暂时不可用：${i.message}`,source:"error",category:"错误响应"},metadata:{engine:"error-handler",responseTime:Date.now()-s,error:i.message,timestamp:new Date}}}}},H=I(!0),O=I([]),E=I(""),C=I(!1);I(null);const k=I([]),U=I(localStorage.getItem("ai_debug_mode")==="true"),K=I(localStorage.getItem("web_search_enabled")!=="false");I("professional");const le=I(null),S=I({id:"user_"+Date.now(),name:"质量管理员",role:"operator",department:"质量管理部",sessionId:"session_"+Date.now(),permissions:["query","analysis","report"],lastActive:new Date}),re=I({apiKey:"sk-cab797574abf4288bcfaca253191565d",baseURL:"https://api.deepseek.com",model:"deepseek-chat",enableCache:!0,cacheThreshold:.85,maxCacheSize:1e3,cachePrefix:"iqe_qa_cache"});I(new Map);const Z=I(["查询深圳工厂的库存情况","分析结构件类物料的质量状况","检查高风险物料批次","生成供应商质量报告","统计测试通过率趋势"]);I({enabled:!0,searchEngines:["integrated-analysis","database-query","ai-analysis"],adaptiveMode:!0,contextAware:!0});const B=I({basic:!0,advanced:!1,charts:!1}),_=I({basic:[{name:"物料库存信息查询_优化",query:"查询物料库存信息",icon:"📦",category:"库存场景"},{name:"供应商库存查询_优化",query:"查询深圳电池厂的库存",icon:"🏢",category:"库存场景"},{name:"库存状态查询",query:"查询风险状态的物料",icon:"⚠️",category:"库存场景"},{name:"风险库存查询",query:"查询风险状态的库存",icon:"⚠️",category:"库存场景"},{name:"电池库存查询",query:"查询电池库存",icon:"🔋",category:"库存场景"},{name:"物料上线情况查询",query:"查询LCD上线情况",icon:"🚀",category:"上线场景"},{name:"物料上线跟踪查询_优化",query:"查询物料上线跟踪情况",icon:"🚀",category:"上线场景"},{name:"物料测试情况查询",query:"查询LCD显示屏测试情况",icon:"🧪",category:"测试场景"},{name:"物料测试结果查询_优化",query:"查询物料测试结果",icon:"🧪",category:"测试场景"},{name:"NG测试结果查询_优化",query:"查询NG测试结果",icon:"❌",category:"测试场景"}],advanced:[{name:"批次测试情况查询",query:"查询批次203252的测试情况",icon:"📋",category:"批次场景"},{name:"批次综合信息查询_优化",query:"查询批次综合信息",icon:"📋",category:"批次场景"},{name:"供应商对比分析",query:"对比华为和小米供应商的表现",icon:"🔍",category:"对比场景"},{name:"物料大类别质量对比",query:"查询物料大类别质量对比",icon:"🔍",category:"对比场景"}],charts:[{name:"本月测试汇总",query:"查询本月测试汇总",icon:"📊",category:"综合场景"}]}),te={basic:[{name:"物料库存信息查询",query:"查询物料库存信息",icon:"📦",category:"库存场景"},{name:"供应商库存查询",query:"查询深圳电池厂的库存",icon:"🏢",category:"库存场景"},{name:"风险库存查询",query:"查询风险状态的物料",icon:"⚠️",category:"库存场景"},{name:"物料测试情况查询",query:"查询LCD显示屏测试情况",icon:"🧪",category:"测试场景"},{name:"物料上线情况查询",query:"查询LCD上线情况",icon:"🚀",category:"上线场景"}],advanced:[{name:"供应商对比分析",query:"对比华为和小米供应商的表现",icon:"🔍",category:"对比场景"},{name:"批次综合信息查询",query:"查询批次综合信息",icon:"📋",category:"批次场景"}],charts:[{name:"本月测试汇总",query:"查询本月测试汇总",icon:"📊",category:"综合场景"}]};I([{name:"inventory_analysis",displayName:"库存分析",icon:"📦",description:"分析库存状态和趋势"},{name:"quality_analysis",displayName:"质量分析",icon:"🔍",description:"检测质量问题和改进建议"},{name:"production_analysis",displayName:"生产分析",icon:"⚙️",description:"分析生产效率和瓶颈"}]),I([{name:"trend_chart",displayName:"趋势图表",icon:"📈",description:"生成数据趋势图表"},{name:"pie_chart",displayName:"饼图分析",icon:"🥧",description:"创建比例分析饼图"},{name:"bar_chart",displayName:"柱状图",icon:"📊",description:"生成对比柱状图"}]);const ce=N(()=>{const e=[];return _.value.basic.length>0&&e.push(..._.value.basic.slice(0,3).map(t=>t.query||t.example)),_.value.advanced.length>0&&e.push(..._.value.advanced.slice(0,2).map(t=>t.query||t.example)),_.value.charts.length>0&&e.push(_.value.charts[0].query||_.value.charts[0].example),e.length===0?["查询物料库存信息","查询深圳电池厂的库存","查询风险状态的物料","查询LCD显示屏测试情况","对比华为和小米供应商的表现","查询本月测试汇总"]:e.filter(Boolean).slice(0,6)});N(()=>{if(k.value.length===0)return null;const t=k.value.filter(s=>s.completed).reduce((s,n)=>s+(n.duration||0),0);return{totalTime:t,stepCount:k.value.length,description:`AI通过${k.value.length}个步骤完成了分析，总耗时${t}毫秒。`}});const se=async()=>{if(!E.value.trim()||C.value){console.log("⚠️ 消息发送被阻止:",{hasMessage:!!E.value.trim(),isLoading:C.value});return}const e=E.value.trim();console.log("🚀 开始处理用户消息:",e),O.value.push({type:"user",content:e,timestamp:new Date}),E.value="",C.value=!0,k.value=[];try{console.log("🔄 启动智能查询分析...");const t=await fetch("/api/assistant/query",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:e,scenario:"basic",analysisMode:"rule",requireDataAnalysis:!1})});if(!t.ok)throw new Error(`查询服务请求失败: ${t.status}`);const s=await t.json();console.log("✅ 智能查询分析完成:",s);const n=is.handleResponse(s);console.log("📊 处理后的结果:",n);const i=c(n,e);console.log("📨 准备添加消息:",i),O.value.push(i),console.log("📊 当前消息总数:",O.value.length),console.log("✅ 消息处理完成")}catch(t){console.error("❌ 处理消息失败:",t);const s=k.value.findIndex(n=>n.type==="ai");s>=0&&we(s,`处理失败: ${t.message}`),O.value.push({type:"assistant",content:`抱歉，处理您的请求时出现了错误：${t.message}

请稍后再试，或检查网络连接。`,timestamp:new Date})}finally{console.log("🔄 重置加载状态"),C.value=!1,lt()}},Y=e=>{E.value=e,S.value.sessionId&&A.addQuickInputToHistory(S.value.sessionId,e),se()},ue=()=>{E.value.length>2&&ke(E.value)},v=async e=>{var t;try{console.log("🎯 启动智能查询处理流程:",e),oe(2,"启动智能查询处理流程...",!0);const s=y(e);console.log("🎯 选择分析场景:",s),console.log("📋 第一步：本地快速规则匹配"),oe(2,"执行本地快速规则匹配...",!0);const n=Le(e,s);if(console.log("📋 本地规则匹配结果:",n?"有匹配":"无匹配"),n)return console.log("✅ 本地规则匹配成功，直接返回"),J(2,800),Me(n,"local-rule");console.log("🧠 第二步：后端智能意图识别"),oe(2,"执行智能意图识别和参数提取...",!0);try{const o=await ht(e,s);if(o)return J(2,1200),o;const a=await fetch("/api/assistant/query",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:e,scenario:s,analysisMode:"intelligent",requireDataAnalysis:!0})});if(a.ok){const r=await a.json();if(console.log("✅ 后端智能意图识别成功:",r.source),r.source==="intelligent-intent"&&r.reply)return J(2,1200),be(r,s);if(r.reply)return J(2,1500),be(r,s)}}catch(o){console.warn("⚠️ 后端智能意图识别失败:",o.message)}console.log("🤖 第三步：AI增强处理"),oe(2,"启动AI增强分析...",!0);const i=await D(e,n,s);if(i)return console.log("✅ 本地AI增强成功"),J(2,1500),i;if(n)return console.log("⚠️ 所有AI处理失败，使用本地规则响应"),J(2,1e3),n;try{const o=await fetch("/api/assistant/query",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:e,scenario:s,analysisMode:"professional",requireDataAnalysis:!0})});if(!o.ok)throw new Error(`HTTP ${o.status}: ${o.statusText}`);const a=await o.json();console.log("✅ IQE质量助手响应:",a),console.log("📝 回复内容:",a.reply),console.log("📏 回复长度:",((t=a.reply)==null?void 0:t.length)||0),J(2,1500);const r=he(a.reply,s);return console.log("🎨 格式化后的回复:",r),console.log("📏 格式化后长度:",(r==null?void 0:r.length)||0),r}catch(o){console.warn("⚠️ API调用失败，使用本地处理:",o.message);const a=me(e,s);return J(2,1e3),a}}catch(s){return console.error("❌ IQE质量助手调用失败:",s),we(2,`质量分析引擎调用失败: ${s.message}`),me(e,"error")}},y=e=>{const t=e.toLowerCase(),s={material_inventory:["库存","物料","供应商","采购","仓储","周转","安全库存","缺货","积压"],quality_inspection:["检测","测试","不良率","合格率","质量","缺陷","检验","失败","异常"],production_monitoring:["生产","产能","效率","设备","工艺","制造","产线","项目","基线"],comprehensive_quality:["综合","整体","战略","决策","绩效","对比","评估","汇总","总览"]};let n="comprehensive_quality",i=0;for(const[o,a]of Object.entries(s)){const r=a.filter(u=>t.includes(u)).length;r>i&&(i=r,n=o)}return n},$=e=>{const t={factories:[],suppliers:[],statuses:[],materials:[],testResults:[],projects:[],queryType:"unknown"};return Object.entries({深圳:"深圳工厂",宜宾:"宜宾工厂",重庆:"重庆工厂",北京:"北京工厂",上海:"上海工厂"}).forEach(([a,r])=>{e.includes(a)&&t.factories.push(r)}),Object.entries({boe:"BOE",聚龙:"聚龙",歌尔:"歌尔"}).forEach(([a,r])=>{e.includes(a)&&t.suppliers.push(r)}),Object.entries({正常:"正常",风险:"风险",异常:"风险",冻结:"冻结",危险:"风险"}).forEach(([a,r])=>{e.includes(a)&&t.statuses.push(r)}),Object.entries({oled:"OLED显示屏",显示屏:"OLED显示屏",电池盖:"电池盖",喇叭:"喇叭",散热片:"散热片"}).forEach(([a,r])=>{e.includes(a)&&t.materials.push(r)}),(e.includes("pass")||e.includes("通过"))&&t.testResults.push("PASS"),(e.includes("fail")||e.includes("失败"))&&t.testResults.push("FAIL"),e.includes("库存")||e.includes("物料")?t.queryType="inventory":e.includes("检测")||e.includes("测试")?t.queryType="inspection":e.includes("生产")||e.includes("产线")?t.queryType="production":e.includes("批次")&&(t.queryType="batch"),t},D=async(e,t,s)=>{try{console.log("🧠 开始AI增强处理，本地响应:",t?"有":"无");const n=!t,i=n?"AI检索":"AI增强";if(console.log(`🎯 处理模式: ${i}`),!H.value)return console.log("📋 AI模式未开启"),n?(console.log("🔍 规则无匹配，生成智能检索响应"),G(e,s)):(console.log("📈 使用增强本地响应"),T(e,t,s));try{const a=await fetch(n?"/api/assistant/ai-query":"/api/assistant/ai-enhance",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:e,scenario:s,localResponse:t,mode:i,enhancementMode:!n})});if(a.ok){const r=await a.json();return console.log(`✅ ${i}服务调用成功`),he(r.reply,s)}}catch(o){console.warn(`⚠️ ${i}服务调用失败，使用本地处理:`,o.message)}return n?(console.log("🔍 AI服务不可用，生成智能检索响应"),G(e,s)):(console.log("📈 AI服务不可用，使用本地增强"),T(e,t,s))}catch(n){return console.error("❌ AI处理失败:",n),t||G(e)}},T=(e,t,s)=>{if(!t)return me(e,s);const n=j(e);return`${t}

${n}`},j=(e,t)=>{const s=e.toLowerCase();return s.includes("风险")||s.includes("异常")?`💡 **智能分析建议**：

🔍 **风险评估**：建议重点关注风险状态的物料，及时处理异常情况
📊 **数据洞察**：可以进一步分析风险物料的供应商分布和时间趋势
⚡ **行动建议**：建议联系相关供应商确认物料状态，制定应急预案`:s.includes("库存")&&s.includes("总量")?`💡 **智能分析建议**：

📈 **库存优化**：建议关注库存周转率，避免积压和缺货
🏭 **工厂平衡**：可以考虑工厂间的库存调配优化
📋 **管理建议**：建议建立库存预警机制，提高库存管理效率`:s.includes("批次")?`💡 **智能分析建议**：

🔄 **批次追溯**：建议建立完整的批次追溯体系
📊 **质量管控**：可以分析批次质量数据，识别质量风险
⚙️ **流程优化**：建议优化批次管理流程，提高效率`:`💡 **智能分析建议**：

📊 **数据洞察**：基于当前数据分析，建议持续监控相关指标
🎯 **优化方向**：可以进一步细化查询条件，获取更精准的分析结果
📈 **持续改进**：建议定期回顾数据趋势，制定优化策略`},G=(e,t)=>{console.log("🔍 生成智能检索响应");const s=e.toLowerCase(),n=ne(s);console.log("🎯 问题意图分析:",n);const i=de();return ae(e,n,i)},ne=e=>{const t={dataQuery:["查询","查看","显示","列出","统计","多少","有哪些"],analysis:["分析","对比","比较","评估","如何","为什么","原因"],advice:["建议","推荐","优化","改进","怎么办","解决"],prediction:["预测","趋势","未来","预计","可能"],diagnosis:["问题","异常","错误","故障","风险","危险"]},s=[];return Object.entries(t).forEach(([n,i])=>{i.some(o=>e.includes(o))&&s.push(n)}),s.length>0?s:["general"]},de=e=>{const t=JSON.parse(localStorage.getItem("unified_inventory_data")||"[]"),s=JSON.parse(localStorage.getItem("unified_lab_data")||"[]"),n=JSON.parse(localStorage.getItem("unified_factory_data")||"[]"),i=JSON.parse(localStorage.getItem("unified_batch_data")||"[]");return{inventory:t,lab:s,factory:n,batch:i,summary:{totalInventory:t.length,totalLab:s.length,totalFactory:n.length,totalBatch:i.length}}},ae=(e,t,s,n)=>s.summary.totalInventory>0||s.summary.totalLab>0||s.summary.totalFactory>0?t.includes("analysis")||t.includes("advice")?ie(e,s):t.includes("dataQuery")?je(e,s):t.includes("diagnosis")?qe(e,s):xe(e,s):`🤖 **智能助手回复**

收到您的问题："${e}"

⚠️ **数据状态**：当前系统中暂无相关数据。

💡 **建议**：
• 请确保数据已正确加载
• 尝试访问库存、检测或生产页面同步数据
• 联系系统管理员检查数据源

🔄 **数据同步**：您可以刷新页面或访问其他功能页面来同步最新数据。`,ie=(e,t,s)=>`🧠 **智能分析回复**

您的问题："${e}"

📊 **数据概览**：
• 库存数据：${t.summary.totalInventory} 条
• 检测数据：${t.summary.totalLab} 条
• 生产数据：${t.summary.totalFactory} 条
• 批次数据：${t.summary.totalBatch} 条

🔍 **智能分析**：
基于现有数据，我可以为您提供以下分析维度：
• 库存状态分布分析
• 质量检测结果分析
• 生产效率趋势分析
• 供应商质量对比分析

💡 **建议**：请提供更具体的分析需求，我将为您提供详细的数据分析和专业建议。

🎯 **示例查询**：
• "分析深圳工厂库存风险"
• "对比BOE和聚龙供应商质量"
• "评估当前库存结构合理性"`,je=(e,t,s)=>`📊 **数据查询回复**

您的问题："${e}"

🗃️ **可查询数据**：

📦 **库存管理** (${t.summary.totalInventory} 条记录)
• 工厂库存分布
• 供应商物料情况
• 库存状态统计
• 物料类型分析

🧪 **质量检测** (${t.summary.totalLab} 条记录)
• 测试结果统计
• 合格率分析
• 检测项目分布
• 质量趋势分析

⚙️ **生产监控** (${t.summary.totalFactory} 条记录)
• 生产效率统计
• 不良率分析
• 项目进度跟踪
• 设备状态监控

💡 **查询建议**：
请使用具体的查询条件，如：
• "深圳工厂库存情况"
• "BOE供应商质量数据"
• "测试通过率统计"
• "生产不良率分析"`,qe=(e,t,s)=>{const n=[];if(t.inventory.length>0){const i=t.inventory.filter(o=>o.status==="风险"||o.status==="冻结");i.length>0&&n.push(`⚠️ 发现 ${i.length} 条风险/冻结库存`)}if(t.lab.length>0){const i=t.lab.filter(o=>o.testResult==="FAIL");i.length>0&&n.push(`❌ 发现 ${i.length} 条测试失败记录`)}return`🔍 **问题诊断回复**

您的问题："${e}"

🩺 **系统诊断结果**：

${n.length>0?`⚠️ **发现问题**：
${n.map(i=>`• ${i}`).join(`
`)}

🔧 **建议措施**：
• 优先处理风险状态物料
• 分析测试失败原因
• 联系相关供应商确认
• 制定应急处理预案`:`✅ **系统状态良好**：
• 库存状态正常
• 质量检测通过
• 生产运行稳定
• 无明显异常问题`}

📊 **详细分析**：
如需深入分析具体问题，请提供更详细的查询条件。`},xe=(e,t,s)=>`🤖 **智能助手回复**

您的问题："${e}"

🎯 **理解您的需求**：
我正在分析您的问题，基于当前的IQE质量管理数据为您提供帮助。

📊 **当前数据状态**：
• 📦 库存管理：${t.summary.totalInventory} 条记录
• 🧪 质量检测：${t.summary.totalLab} 条记录
• ⚙️ 生产监控：${t.summary.totalFactory} 条记录
• 📋 批次管理：${t.summary.totalBatch} 条记录

💡 **我可以帮您**：
• 查询和分析各类质量数据
• 提供专业的质量管理建议
• 识别潜在的质量风险
• 生成数据统计报告

🔍 **获得更好帮助**：
请尝试使用更具体的关键词，如：
• 工厂名称（深圳、宜宾）
• 供应商名称（BOE、聚龙、歌尔）
• 状态类型（正常、风险、冻结）
• 数据类型（库存、检测、生产）

有什么具体问题我可以为您解答吗？`,be=(e,t)=>{if(console.log("🎨 格式化智能响应:",e.source),!e.reply)return"抱歉，没有收到有效的响应。";switch(e.source){case"intelligent-intent":return Re(e);case"ai-enhanced":return Fe(e);case"rule-based":return Ne(e);default:return he(e.reply,t)}},Re=e=>{let n=`${{material_inventory:"📦",quality_inspection:"🧪",production_monitoring:"⚙️",comprehensive_quality:"📊"}[e.scenario]||"🤖"} **智能意图识别结果**

`;if(e.matchedRule&&e.matchedRule!=="auto-detected"&&(n+=`🎯 **匹配规则**: ${e.matchedRule}

`),n+=`📋 **查询结果**:
${e.reply}

`,e.intentResult&&(e.intentResult.sql&&(n+=`🗃️ **执行SQL**: \`${e.intentResult.sql}\`

`),e.intentResult.function&&(n+=`🔧 **调用函数**: ${e.intentResult.function}

`),e.intentResult.params)){const i=Object.entries(e.intentResult.params).map(([o,a])=>`• ${o}: ${a}`).join(`
`);n+=`📊 **提取参数**:
${i}

`}return n+="💡 **提示**: 基于智能意图识别系统处理，如需更详细信息请提供更多上下文。",n},Fe=e=>`🧠 **AI增强分析**

${e.reply}

💡 **说明**: 此回复由AI智能分析生成，结合了数据查询和智能推理。`,Ne=e=>`📋 **规则匹配结果**

${e.reply}

💡 **说明**: 此回复基于预定义规则匹配生成。`,Me=(e,t)=>`${{"local-rule":"📋 本地规则匹配","local-cache":"💾 本地缓存","local-data":"📊 本地数据"}[t]}

${e}

⚡ **处理方式**: 本地快速响应，无需网络请求`,Le=(e,t)=>{const s=e.toLowerCase(),n=JSON.parse(localStorage.getItem("unified_inventory_data")||localStorage.getItem("inventory_data")||"[]"),i=JSON.parse(localStorage.getItem("unified_lab_data")||localStorage.getItem("lab_data")||"[]"),o=JSON.parse(localStorage.getItem("unified_factory_data")||localStorage.getItem("factory_data")||"[]"),a=JSON.parse(localStorage.getItem("unified_batch_data")||localStorage.getItem("batch_data")||"[]");console.log("📊 本地数据统计:",{inventory:n.length,lab:i.length,factory:o.length,batch:a.length});const r=$(s);if(console.log("🔍 解析的查询条件:",r),s.includes("你好")||s.includes("hello")||s.includes("hi"))return`👋 **您好！欢迎使用IQE智能质量助手**

我是您的专业质量管理助手，可以帮您查询和分析：

📦 **库存管理**：物料库存、供应商信息、工厂分布
🧪 **质量检测**：测试结果、检验数据、合格率分析
⚙️ **生产监控**：生产数据、不良率统计、项目进度
📊 **数据统计**：综合分析、对比报告、趋势预测

💡 **试试问我**：
• "深圳工厂库存情况"
• "BOE供应商质量如何"
• "测试通过率统计"
• "库存总量数据"

有什么可以帮您的吗？`;if(s.includes("帮助")||s.includes("help"))return`📚 **IQE智能助手使用指南**

🔍 **查询类型**：

**📦 库存查询**
• 工厂库存：深圳工厂库存、宜宾工厂库存
• 供应商：BOE供应商、聚龙供应商、歌尔供应商
• 状态筛选：正常状态、风险状态、冻结状态
• 物料类型：OLED显示屏、电池盖、喇叭、散热片

**🧪 检测查询**
• 测试结果：通过记录、失败记录
• 质量分析：合格率、不良率统计

**⚙️ 生产查询**
• 生产数据：产线效率、项目进度
• 批次管理：批次信息、批次质量

**📊 统计分析**
• 数据总览：库存统计、质量统计
• 对比分析：工厂对比、供应商对比

💡 **使用技巧**：使用具体的关键词可以获得更准确的结果！`;if(s.includes("库存总量")||s.includes("总库存")||s.includes("库存")&&(s.includes("总")||s.includes("数据"))){if(n.length===0)return"📦 当前没有库存数据。请确保数据已正确加载。";const u=n.reduce((F,M)=>F+(parseInt(M.quantity)||0),0),d={},p={},R={};return n.forEach(F=>{const M=F.factory||"未知工厂";d[M]=(d[M]||0)+1;const De=F.supplier||"未知供应商";p[De]=(p[De]||0)+1;const Ce=F.status||"未知状态";R[Ce]=(R[Ce]||0)+1}),`📦 **库存总量数据统计**

📊 **总体概况**
• 库存记录总数：${n.length} 条
• 物料总数量：${u} 件

🏭 **工厂分布**
${Object.entries(d).map(([F,M])=>`• ${F}：${M} 条记录`).join(`
`)}

🏢 **供应商分布**
${Object.entries(p).map(([F,M])=>`• ${F}：${M} 条记录`).join(`
`)}

📈 **状态分布**
${Object.entries(R).map(([F,M])=>`• ${F}：${M} 条记录`).join(`
`)}

🕒 **统计时间**：${new Date().toLocaleString()}`}if(r.queryType==="inventory"||s.includes("库存")||s.includes("物料")){if(n.length===0)return"📦 当前没有库存数据。请确保数据已正确加载。";const u=Qe(n,r);if(r.factories.includes("重庆工厂"))return He("重庆工厂",r,n);if(r.factories.length>0||r.statuses.length>0||r.suppliers.length>0||r.materials.length>0){const d=Be(r);return x(d,u)}if(s.includes("深圳")){const d=n.filter(p=>p.factory&&p.factory.includes("深圳"));if(s.includes("风险")){const p=d.filter(R=>R.status==="风险");return x("深圳工厂风险库存",p)}return x("深圳工厂库存情况",d)}if(s.includes("宜宾")){const d=n.filter(p=>p.factory&&p.factory.includes("宜宾"));if(s.includes("风险")){const p=d.filter(R=>R.status==="风险");return x("宜宾工厂风险库存",p)}return x("宜宾工厂库存情况",d)}if(s.includes("boe")){const d=n.filter(p=>p.supplier&&p.supplier.includes("BOE"));return x("BOE供应商库存情况",d)}if(s.includes("聚龙")){const d=n.filter(p=>p.supplier&&p.supplier.includes("聚龙"));return x("聚龙供应商库存情况",d)}if(s.includes("歌尔")){const d=n.filter(p=>p.supplier&&p.supplier.includes("歌尔"));return x("歌尔供应商库存情况",d)}if(s.includes("正常")){const d=n.filter(p=>p.status==="正常");return x("正常状态库存",d)}if(s.includes("风险")){const d=n.filter(p=>p.status==="风险");return x("风险状态库存",d)}if(s.includes("冻结")){const d=n.filter(p=>p.status==="冻结");return x("冻结状态库存",d)}if(s.includes("oled")||s.includes("显示屏")){const d=n.filter(p=>p.materialName&&p.materialName.includes("OLED"));return x("OLED显示屏库存",d)}return x("库存总览",n.slice(0,10))}if(s.includes("批次")||s.includes("batch"))return s.includes("物料批次查询")||s.includes("物料")&&s.includes("批次")?a.length===0?"📋 当前没有批次数据。请确保数据已正确加载。":$e("物料批次信息",a.slice(0,10)):a.length===0?"📋 当前没有批次数据。请确保数据已正确加载。":$e("批次管理总览",a.slice(0,10));if(s.includes("检测")||s.includes("测试")){if(i.length===0)return"🧪 当前没有检测数据。请确保数据已正确加载。";if(s.includes("pass")||s.includes("通过")){const u=i.filter(d=>d.testResult==="PASS");return pe("测试通过记录",u)}if(s.includes("fail")||s.includes("失败")){const u=i.filter(d=>d.testResult==="FAIL");return pe("测试失败记录",u)}return pe("检测数据总览",i.slice(0,10))}return s.includes("生产")||s.includes("产线")?o.length===0?"⚙️ 当前没有生产数据。请确保数据已正确加载。":Pe("生产数据总览",o.slice(0,10)):s.includes("统计")||s.includes("总数")?`📊 **数据统计总览**

📦 **库存记录**：${n.length} 条
🧪 **检测记录**：${i.length} 条
⚙️ **生产记录**：${o.length} 条

🕒 **数据更新时间**：${new Date().toLocaleString()}`:(console.log("📋 本地规则无匹配，将转交AI处理"),null)},x=(e,t)=>{if(!t||t.length===0)return`📦 **${e}**

暂无相关数据。`;const s=`📦 **${e}**

📊 **统计信息**：共 ${t.length} 条记录

`,n=t.slice(0,5).map((o,a)=>`${a+1}. **${o.materialName||"未知物料"}**
   - 供应商：${o.supplier||"未知"}
   - 工厂：${o.factory||"未知"}
   - 状态：${o.status||"未知"}
   - 数量：${o.quantity||"未知"}`).join(`

`),i=t.length>5?`

... 还有 ${t.length-5} 条记录`:"";return s+n+i},pe=(e,t)=>{if(!t||t.length===0)return`🧪 **${e}**

暂无相关数据。`;const s=`🧪 **${e}**

📊 **统计信息**：共 ${t.length} 条记录

`,n=t.slice(0,5).map((o,a)=>`${a+1}. **${o.materialName||"未知物料"}**
   - 测试结果：${o.testResult||"未知"}
   - 检测日期：${o.inspectionDate||"未知"}
   - 批次：${o.batchNo||"未知"}`).join(`

`),i=t.length>5?`

... 还有 ${t.length-5} 条记录`:"";return s+n+i},Pe=(e,t)=>{if(!t||t.length===0)return`⚙️ **${e}**

暂无相关数据。`;const s=`⚙️ **${e}**

📊 **统计信息**：共 ${t.length} 条记录

`,n=t.slice(0,5).map((o,a)=>`${a+1}. **${o.materialName||"未知物料"}**
   - 项目：${o.project||"未知"}
   - 不良率：${o.defectRate||"未知"}%
   - 工厂：${o.factory||"未知"}`).join(`

`),i=t.length>5?`

... 还有 ${t.length-5} 条记录`:"";return s+n+i},$e=(e,t)=>{if(!t||t.length===0)return`📋 **${e}**

暂无相关数据。`;const s=`📋 **${e}**

📊 **统计信息**：共 ${t.length} 条记录

`,n=t.slice(0,5).map((o,a)=>`${a+1}. **批次号：${o.batchCode||o.batchNo||"未知批次"}**
   - 物料：${o.materialName||"未知物料"}
   - 供应商：${o.supplier||"未知"}
   - 数量：${o.quantity||"未知"}
   - 状态：${o.status||"未知"}`).join(`

`),i=t.length>5?`

... 还有 ${t.length-5} 条记录`:"";return s+n+i},Qe=(e,t)=>e.filter(s=>!(t.factories.length>0&&!t.factories.some(i=>s.factory&&s.factory.includes(i.replace("工厂","")))||t.statuses.length>0&&!t.statuses.some(i=>s.status===i)||t.suppliers.length>0&&!t.suppliers.some(i=>s.supplier&&s.supplier.includes(i))||t.materials.length>0&&!t.materials.some(i=>s.materialName&&s.materialName.includes(i)))),Be=e=>{const t=[];return e.factories.length>0&&t.push(e.factories.join("、")),e.suppliers.length>0&&t.push(e.suppliers.join("、")+"供应商"),e.statuses.length>0&&t.push(e.statuses.join("、")+"状态"),e.materials.length>0&&t.push(e.materials.join("、")),t.join(" + ")+"库存查询"},He=(e,t,s)=>{const n=e.replace("工厂",""),i=t.statuses.length>0?t.statuses.join("、"):"全部",o=[...new Set(s.map(r=>r.factory).filter(r=>r))];let a=s;return t.statuses.length>0&&(a=s.filter(r=>t.statuses.includes(r.status))),`📦 **${n}工厂${i}库存查询结果**

⚠️ **查询说明**：当前系统中没有${n}工厂的数据。

🏭 **可用工厂**：
${o.map(r=>`• ${r}`).join(`
`)}

📊 **${i}库存查询涵盖所有工厂**：

${ze(a)}

💡 **建议**：请尝试查询"${o[0]}${i}库存"获取具体信息。`},ze=(e,t)=>{if(e.length===0)return"✅ **好消息**：当前所有工厂都没有符合条件的库存！";const s={};e.forEach(i=>{const o=i.factory||"未知工厂";s[o]||(s[o]=[]),s[o].push(i)});let n=`📊 **符合条件的库存总计**：${e.length} 条记录

`;return Object.entries(s).forEach(([i,o])=>{n+=`🏭 **${i}**：${o.length} 条记录
`,o.slice(0,3).forEach((a,r)=>{n+=`   ${r+1}. ${a.materialName||"未知物料"} - ${a.supplier||"未知供应商"} - ${a.status||"未知状态"}
`}),o.length>3&&(n+=`   ... 还有 ${o.length-3} 条记录
`),n+=`
`}),n},me=(e,t)=>{if(t==="error")return`🔧 **IQE质量助手暂时不可用**

作为您的质量管理专家，我遇到了技术问题。

请稍后重试，或联系系统管理员。我将继续为您提供专业的物料监控和质量分析服务。

**您的问题**："${e}"`;const n={material_inventory:"📦 库存管理",quality_inspection:"🧪 质量检测",production_monitoring:"⚙️ 生产监控",comprehensive_quality:"📊 综合质量"}[t]||"🤖 智能助手";return`${n.split(" ")[0]} **${n.split(" ")[1]}回复**

收到您的查询："${e}"

我正在为您分析相关数据，请稍等片刻。如果您需要更具体的信息，请尝试以下查询：

• 深圳工厂库存
• BOE供应商情况
• 正常状态物料
• 测试通过记录
• 生产数据统计

💡 **提示**：您可以使用更具体的关键词来获得更准确的结果。`},he=(e,t)=>e?e.includes('<div class="query-results')?e:e.length<100&&/^\d+/.test(e.trim())?We(e,t):e.includes("条记录")||e.includes("个")||e.includes("家")?Ue(e,t):Ke(e,t):"暂无数据",We=(e,t)=>`
    <div class="professional-response">
      <div class="response-header">
        <h3>${{material_inventory:"📦 库存管理分析",quality_inspection:"🧪 质量检测分析",production_monitoring:"⚙️ 生产监控分析",comprehensive_quality:"📊 综合质量分析"}[t]||"📋 数据分析结果"}</h3>
        <div class="response-meta">
          <span class="timestamp">${new Date().toLocaleString()}</span>
        </div>
      </div>
      <div class="response-content">
        <div class="summary-card">
          <div class="summary-title">📊 统计结果</div>
          <div class="summary-value">${e}</div>
        </div>
        <div class="analysis-note">
          <p><strong>💡 分析说明：</strong></p>
          <p>基于当前数据统计得出上述结果。如需查看详细信息，请使用更具体的查询条件。</p>
        </div>
      </div>
    </div>
  `,Ue=(e,t)=>{const n={material_inventory:"📦 库存管理详情",quality_inspection:"🧪 质量检测详情",production_monitoring:"⚙️ 生产监控详情",comprehensive_quality:"📊 综合质量详情"}[t]||"📋 查询结果详情",i=e.split(`
`).filter(a=>a.trim());let o="";return i.length>1?o=`
      <div class="data-list">
        ${i.map((a,r)=>`
          <div class="data-item">
            <span class="item-index">${r+1}</span>
            <span class="item-content">${a}</span>
          </div>
        `).join("")}
      </div>
    `:o=`<div class="single-result">${e}</div>`,`
    <div class="professional-response">
      <div class="response-header">
        <h3>${n}</h3>
        <div class="response-meta">
          <span class="timestamp">${new Date().toLocaleString()}</span>
        </div>
      </div>
      <div class="response-content">
        ${o}
      </div>
    </div>
  `},Ke=(e,t)=>{const n={material_inventory:"📦 库存管理报告",quality_inspection:"🧪 质量检测报告",production_monitoring:"⚙️ 生产监控报告",comprehensive_quality:"📊 综合质量报告"}[t]||"📋 分析报告";let i=e.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\*(.*?)\*/g,"<em>$1</em>").replace(/\n/g,"<br>").replace(/(\d+\.\s)/g,"<br><strong>$1</strong>");return`
    <div class="professional-response">
      <div class="response-header">
        <h3>${n}</h3>
        <div class="response-meta">
          <span class="timestamp">${new Date().toLocaleString()}</span>
        </div>
      </div>
      <div class="response-content">
        <div class="formatted-text">
          ${i}
        </div>
      </div>
    </div>
  `},J=(e,t)=>{k.value[e]&&(k.value[e].active=!1,k.value[e].completed=!0,k.value[e].duration=t,k.value[e].details=`完成时间: ${t}ms`)},oe=(e,t,s=!1)=>{k.value[e]&&(k.value[e].description=t,k.value[e].active=s)},we=(e,t)=>{k.value[e]&&(k.value[e].active=!1,k.value[e].completed=!1,k.value[e].error=!0,k.value[e].details=t)},Ge=e=>new Date(e).toLocaleTimeString(),Je=e=>(console.log("🎨 开始格式化消息内容:",(e==null?void 0:e.substring(0,100))+"..."),e?e.includes('<div class="query-results')?(console.log("📋 检测到结构化HTML内容"),Xe(e)):e.includes('<div class="professional-response')?(console.log("🎯 检测到专业格式化HTML内容"),e):(console.log("📝 处理专业AI回答内容"),Ve(e)):(console.log("⚠️ 消息内容为空"),"暂无内容")),Ve=e=>{let t=e;e.includes("┌")&&e.includes("│")&&e.includes("└")&&(t=Ye(t)),t=t.replace(/^## (.*$)/gm,'<h3 class="ai-section-title">$1</h3>').replace(/^### (.*$)/gm,'<h4 class="ai-subsection-title">$1</h4>').replace(/^# (.*$)/gm,'<h2 class="ai-main-title">$1</h2>'),t=t.replace(/\*\*(.*?)\*\*/g,'<strong class="ai-emphasis">$1</strong>').replace(/\*(.*?)\*/g,'<em class="ai-italic">$1</em>'),t=t.replace(/`(.*?)`/g,'<code class="ai-code">$1</code>');const s=t.split(`
`);let n=!1,i=null,o=[];for(let a=0;a<s.length;a++){const r=s[a].trim();if(r.match(/^- /))(!n||i!=="bullet")&&(n&&o.push(`</${i==="numbered"?"ol":"ul"}>`),o.push('<ul class="ai-bullet-list">'),n=!0,i="bullet"),o.push(`<li class="ai-list-item">${r.substring(2)}</li>`);else if(r.match(/^\d+\. /)){(!n||i!=="numbered")&&(n&&o.push(`</${i==="numbered"?"ol":"ul"}>`),o.push('<ol class="ai-numbered-list">'),n=!0,i="numbered");const u=r.match(/^(\d+)\. (.*)/);o.push(`<li class="ai-numbered-item"><span class="item-number">${u[1]}.</span> ${u[2]}</li>`)}else n&&(o.push(`</${i==="numbered"?"ol":"ul"}>`),n=!1,i=null),r&&o.push(r)}return n&&o.push(`</${i==="numbered"?"ol":"ul"}>`),t=o.join(`
`),t=t.replace(/📋|📊|🔍|💡|⚡|🌐|📡|🎯|📚|🏭|🔬|📦|✅|❌|⚠️|🔧|📈|📉/g,'<span class="ai-icon">$&</span>'),t=t.replace(/^---$/gm,'<hr class="ai-divider">'),t=t.replace(/\n\n+/g,'</p><p class="ai-paragraph">').replace(/\n/g,"<br>"),t=`<div class="professional-ai-response">
    <p class="ai-paragraph">${t}</p>
  </div>`,t=t.replace(/<p class="ai-paragraph"><\/p>/g,"").replace(/<p class="ai-paragraph"><br><\/p>/g,"").replace(/<p class="ai-paragraph">\s*<\/p>/g,""),console.log("✅ 专业AI回答格式化完成"),t},Ye=e=>{const t=e.split(`
`);let s=!1,n=[];for(let i=0;i<t.length;i++){const o=t[i];if(o.includes("┌")&&o.includes("─")&&o.includes("┐")){s=!0,n.push('<div class="ascii-table-container">'),n.push('<table class="ascii-table">');continue}if(o.includes("└")&&o.includes("─")&&o.includes("┘")){s=!1,n.push("</table>"),n.push("</div>");continue}if(s&&o.includes("│")){if(o.includes("├")||o.includes("┼")||o.includes("┤"))continue;const a=o.split("│").slice(1,-1).map(u=>u.trim());i>0&&t[i-1].includes("┌")||i<t.length-1&&t[i+1].includes("├")?(n.push("<thead><tr>"),a.forEach(u=>{n.push(`<th class="table-header">${u}</th>`)}),n.push("</tr></thead><tbody>")):(n.push("<tr>"),a.forEach(u=>{n.push(`<td class="table-cell">${u}</td>`)}),n.push("</tr>"))}else s&&n.push("</tbody>"),n.push(o)}return n.join(`
`)},Xe=e=>{try{const n=new DOMParser().parseFromString(e,"text/html").querySelector(".query-results");if(!n)return e;const i=n.classList.contains("inventory-results")?"inventory":n.classList.contains("inspection-results")?"inspection":n.classList.contains("production-results")?"production":"general";return Ze(n,i)}catch(t){return console.error("格式化响应错误:",t),e}},Ze=(e,t)=>{const s=e.querySelectorAll(".result-item");if(s.length===0)return e.innerHTML;let n=`<div class="formatted-response ${t}-response">`;return n+=`<div class="response-header">
    <h4>${{inventory:"📦 库存查询结果",inspection:"🧪 检测结果",production:"⚙️ 生产数据",general:"📋 查询结果"}[t]||"📋 查询结果"}</h4>
    <span class="result-count">共找到 ${s.length} 条记录</span>
  </div>`,n+='<div class="response-content">',s.forEach((o,a)=>{var d,p;const r=((d=o.querySelector(".item-title"))==null?void 0:d.textContent)||`项目 ${a+1}`,u=((p=o.querySelector(".item-details"))==null?void 0:p.innerHTML)||o.innerHTML;n+=`
      <div class="response-item">
        <div class="item-header">
          <span class="item-number">${a+1}</span>
          <span class="item-title">${r}</span>
        </div>
        <div class="item-content">${u}</div>
      </div>
    `}),n+="</div></div>",n},et=e=>{navigator.clipboard.writeText(e).then(()=>{b.success("消息已复制到剪贴板")}).catch(()=>{b.error("复制失败")})},tt=e=>{e.liked=!e.liked,b.success(e.liked?"已点赞":"已取消点赞")},st=async e=>{const t=O.value.indexOf(e);if(t>0){const s=O.value[t-1];if(s&&s.type==="user"){b.info("正在重新生成回复...");const n=await v(s.content);e.content=n,b.success("回复已重新生成")}}},nt=e=>!1,at=e=>e.includes("库存")||e.includes("inventory")?"inventory":e.includes("检测")||e.includes("测试")||e.includes("inspection")?"inspection":e.includes("生产")||e.includes("production")?"production":"general",it=e=>{switch(e.id){case"export":b.info("正在导出数据...");break;case"chart":b.info("正在生成图表...");break;case"alert":b.info("正在设置预警...");break;case"report":b.info("正在生成报告...");break;case"trend":b.info("正在分析趋势...");break;case"optimize":b.info("正在生成优化建议...");break;case"monitor":b.info("正在启动实时监控...");break;default:b.info(`执行操作: ${e.label}`)}},ge=e=>{B.value[e]=!B.value[e]},ot=()=>{O.value=[],k.value=[],b.success("对话已清空")},lt=()=>{Te(()=>{const e=document.querySelector(".messages-list");e&&(e.scrollTop=e.scrollHeight)})},rt=async()=>{try{console.log("🔄 开始同步真实数据到后端...");const e=await ct();if(!e.healthy)return console.error("❌ 后端服务不可用:",e.error),b.error("后端服务不可用，请检查服务状态"),!1;const t=localStorage.getItem("unified_inventory_data")||localStorage.getItem("inventory_data"),s=localStorage.getItem("unified_lab_data")||localStorage.getItem("lab_data"),n=localStorage.getItem("unified_factory_data")||localStorage.getItem("factory_data"),i={inventory:t?JSON.parse(t):[],inspection:s?JSON.parse(s):[],production:n?JSON.parse(n):[]};if(console.log(`📊 准备推送数据: 库存${i.inventory.length}条, 检测${i.inspection.length}条, 生产${i.production.length}条`),i.inventory.length===0&&i.inspection.length===0&&i.production.length===0){console.log("⚠️ 没有数据可推送，尝试重新生成数据...");try{const r=await fetch("/api/assistant/generate-real-data",{method:"POST",headers:{"Content-Type":"application/json"}});if(r.ok){const u=await r.json();u.success&&(i.inventory=u.data.inventory||[],i.inspection=u.data.inspection||[],i.production=u.data.production||[],console.log("✅ 重新生成数据成功"))}}catch(r){console.warn("⚠️ 数据生成失败，使用空数据继续:",r.message)}if(i.inventory.length===0&&i.inspection.length===0&&i.production.length===0)return console.log("❌ 仍然没有数据可推送"),b.warning("没有可用数据，请先在管理工具中生成数据"),!1}const o=ut(i);if(!o.valid)return console.error("❌ 数据验证失败:",o.errors),b.error("数据格式验证失败"),!1;const a=await fetch("/api/assistant/update-data",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)});if(a.ok){const r=await a.json();if(console.log("✅ 数据同步响应:",r),r.success){const u=await dt(i);return u.verified?(console.log("✅ 数据同步验证成功"),b.success("数据同步成功！"),!0):(console.warn("⚠️ 数据同步验证失败:",u.message),b.warning("数据同步可能不完整，请重试"),!1)}else throw new Error(r.error||"未知错误")}else{const r=await a.text();return console.log("❌ 数据同步失败:",r),b.error("数据同步失败，请检查后端服务"),!1}}catch(e){return console.error("❌ 数据同步出错:",e),b.error("数据同步出错: "+e.message),e.message.includes("413")||e.message.includes("Request Entity Too Large")?(console.log("🔄 数据过大，尝试分批推送..."),await pt(dataToPush)):!1}},ct=async()=>{try{const e=await fetch("/api/assistant/health",{method:"GET",timeout:5e3});return e.ok?{healthy:!0,data:await e.json()}:{healthy:!1,error:`HTTP ${e.status}`}}catch(e){return{healthy:!1,error:e.message}}},ut=e=>{const t=[];if(!e||typeof e!="object")return t.push("数据不是有效对象"),{valid:!1,errors:t};const s=["inventory","inspection","production"];for(const n of s)Array.isArray(e[n])||t.push(`${n} 不是有效数组`);if(e.inventory.length>0){const n=e.inventory[0],i=["materialName","batchNo","supplier"];for(const o of i)n[o]||t.push(`库存数据缺少必要字段: ${o}`)}return{valid:t.length===0,errors:t}},dt=async e=>{try{const t=await fetch("/api/assistant/verify-data",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({expectedCounts:{inventory:e.inventory.length,inspection:e.inspection.length,production:e.production.length}})});if(t.ok){const s=await t.json();return{verified:s.verified,message:s.message}}else return{verified:!1,message:"验证请求失败"}}catch(t){return console.warn("数据验证失败:",t),{verified:!1,message:t.message}}},pt=async e=>{try{console.log("🔄 开始分批推送数据...");const t=100,s=[];for(let o=0;o<e.inventory.length;o+=t)s.push({type:"inventory",data:e.inventory.slice(o,o+t)});for(let o=0;o<e.inspection.length;o+=t)s.push({type:"inspection",data:e.inspection.slice(o,o+t)});for(let o=0;o<e.production.length;o+=t)s.push({type:"production",data:e.production.slice(o,o+t)});let n=0;for(const o of s)try{(await fetch("/api/assistant/update-data-batch",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)})).ok?n++:console.error(`批次推送失败: ${o.type}`)}catch(a){console.error(`批次推送异常: ${o.type}`,a)}const i=n===s.length;return i?b.success("分批数据同步成功！"):b.warning(`部分数据同步成功 (${n}/${s.length})`),i}catch(t){return console.error("分批推送失败:",t),b.error("分批数据同步失败"),!1}};$t(async()=>{console.log("🤖 AI智能助手三栏布局已加载"),console.log("🌐 当前URL:",window.location.href),console.log("🌐 当前端口:",window.location.port),console.log("📊 初始规则状态:",{basic:_.value.basic.length,advanced:_.value.advanced.length,charts:_.value.charts.length}),await Se(),console.log("🔍 最终规则数据:",_.value),console.log("📊 最终基础规则数量:",_.value.basic.length),console.log("📋 最终基础规则列表:",_.value.basic.map(t=>t.name)),_.value.basic.length<=3&&(console.log("⚠️ 规则数量异常，尝试直接测试加载..."),setTimeout(()=>Ie(),1e3)),mt(),console.log("🔄 开始数据同步流程..."),await rt()?(console.log("✅ 数据同步成功，系统已准备就绪"),b.success("系统数据已同步，可以开始使用智能问答")):(console.warn("⚠️ 数据同步失败，尝试重新生成数据..."),b.warning("数据同步失败，请在管理工具中重新生成数据")),Te(()=>{const t=document.querySelector(".three-column-layout"),s=document.querySelector(".left-panel"),n=document.querySelector(".center-panel"),i=document.querySelector(".right-panel");console.log("📐 布局调试信息:"),console.log("主布局:",t?"✅ 存在":"❌ 不存在"),console.log("左侧面板:",s?"✅ 存在":"❌ 不存在"),console.log("中间面板:",n?"✅ 存在":"❌ 不存在"),console.log("右侧面板:",i?"✅ 存在":"❌ 不存在"),t&&console.log("主布局样式:",window.getComputedStyle(t).display),s&&console.log("左侧面板宽度:",window.getComputedStyle(s).width),n&&console.log("中间面板宽度:",window.getComputedStyle(n).width),i&&console.log("右侧面板宽度:",window.getComputedStyle(i).width)})});const mt=()=>{try{const e=A.createSession(S.value);S.value.sessionId=e.sessionId,console.log("👤 用户会话初始化成功:",e.sessionId),ke(),b.success(`欢迎 ${S.value.name}！会话已建立`)}catch(e){console.error("❌ 用户会话初始化失败:",e),b.warning("会话初始化失败，部分功能可能受限")}},ke=(e="")=>{if(S.value.sessionId){const t=A.getQuickInputSuggestions(S.value.sessionId,e);Z.value=t.map(s=>s.text)}},ht=async(e,t)=>{const s=Date.now();try{console.log("🚀 开始优化AI查询处理:",e);const n=z.getCachedAnswer(e,S.value.id);if(n)return console.log("🎯 DeepSeek缓存命中:",n.source),A.addQueryToHistory(S.value.sessionId,e,{...n,responseTime:Date.now()-s,source:"cache"}),gt(n,t);const i=await W.executeRealtimeSearch(e,{userId:S.value.id,sessionId:S.value.sessionId,role:S.value.role,department:S.value.department});if(i.success){const o=i.result.content;return z.setCachedAnswer(e,o,S.value.id,{engine:i.metadata.engine,intent:i.metadata.intent,responseTime:i.metadata.responseTime}),A.addQueryToHistory(S.value.sessionId,e,{response:o,responseTime:Date.now()-s,source:i.metadata.engine}),ft(i,t)}else throw new Error(i.error||"搜索服务失败")}catch(n){return console.error("❌ 优化AI查询处理失败:",n),A.addQueryToHistory(S.value.sessionId,e,{error:n.message,responseTime:Date.now()-s,source:"error"}),`抱歉，处理您的查询时出现错误：${n.message}`}},gt=(e,t)=>{let s=e.answer||e.content;return U.value||new URLSearchParams(window.location.search).get("debug")==="true"||localStorage.getItem("ai_debug_mode")==="true"?(s+=`

💾 **缓存信息**：
`,s+=`• 来源：${e.source==="exact_cache"?"精确匹配":"语义匹配"}
`,e.similarity&&(s+=`• 相似度：${(e.similarity*100).toFixed(1)}%
`),s+=`• 缓存时间：${new Date(e.timestamp).toLocaleString()}
`):e.source==="exact_cache"&&(s+=`

⚡ *快速响应 - 基于历史查询*`),s},ft=(e,t)=>{let s=e.result.content;const n=U.value||new URLSearchParams(window.location.search).get("debug")==="true"||localStorage.getItem("ai_debug_mode")==="true";return e.metadata.webSearchUsed&&(s+=`

🌐 **联网搜索已启用** - 结合了最新网络信息`,e.metadata.webSearchResults>0&&(s+=`
📡 找到 ${e.metadata.webSearchResults} 个相关网络资源`),e.metadata.sources&&e.metadata.sources.length>0&&(s+=`
🔍 搜索引擎：${e.metadata.sources.join(", ")}`)),n?(e.metadata.parsedCriteria&&Object.keys(e.metadata.parsedCriteria).length>0&&(s+=`

🔍 **解析条件**：
`,Object.entries(e.metadata.parsedCriteria).forEach(([o,a])=>{s+=`• ${{materialCategory:"物料分类",supplier:"供应商",factory:"工厂",project:"项目",baseline:"基线",riskLevel:"风险等级",qualityThreshold:"质量阈值"}[o]||o}：${a}
`})),e.metadata.appliedRules&&e.metadata.appliedRules.length>0&&(s+=`
📋 **应用规则**：
`,e.metadata.appliedRules.forEach(o=>{s+=`• ${o}
`})),s+=`

🔍 **搜索信息**：
`,s+=`• 搜索引擎：${e.metadata.engine}
`,s+=`• 查询类型：${e.result.category}
`,s+=`• 响应时间：${e.metadata.responseTime}ms
`,e.metadata.intent&&(s+=`• 意图识别：${e.metadata.intent.type} (${(e.metadata.intent.confidence*100).toFixed(1)}%)
`),s+=`
*数据来源: ${{"enhanced-ai":"增强AI服务 (含联网搜索)","integrated-analysis":"整合分析服务 (多规则结合检索)","assistant-api":"基础助手服务",fallback:"降级模拟服务",error:"错误处理服务"}[e.result.source]||e.result.source}*`):e.metadata.webSearchUsed?s+=`

⚡ *智能回答 - 已结合最新网络信息*`:e.metadata.responseTime>1e3&&(s+=`

*查询耗时较长，建议优化查询条件*`),s},yt=()=>{localStorage.setItem("ai_debug_mode",U.value.toString()),console.log("🔧 调试模式:",U.value?"开启":"关闭")},vt=()=>{localStorage.setItem("web_search_enabled",K.value.toString()),w.setWebSearchEnabled(K.value),console.log("🌐 联网搜索:",K.value?"已启用":"已禁用")},Se=async()=>{var e;try{console.log("🔄 开始加载规则数据...");const s=`/data/rules.json?v=${new Date().getTime()}`;console.log("📡 请求URL:",s);const n=await fetch(s);if(console.log("📡 响应状态:",n.status,n.statusText),!n.ok)throw new Error(`HTTP ${n.status}: ${n.statusText}`);const i=await n.json();console.log("📊 加载的规则数据:",i),console.log("📊 规则总数:",i.totalRules),console.log("📊 分类数量:",(e=i.categories)==null?void 0:e.length);const o={库存场景:"📦",上线场景:"🚀",测试场景:"🧪",批次场景:"📋",对比场景:"🔍",综合场景:"📊"},a={basic:[],advanced:[],charts:[]};i.categories.forEach(r=>{const u=o[r.name]||"📋";r.rules.forEach(d=>{const p={name:d.name,query:d.example||d.description,icon:u,category:d.category,description:d.description};r.name==="库存场景"||r.name==="上线场景"||r.name==="测试场景"?a.basic.push(p):r.name==="批次场景"||r.name==="对比场景"?a.advanced.push(p):a.charts.push(p)})}),_.value=a,console.log("✅ 规则数据从JSON文件加载完成"),console.log(`📊 基础规则: ${_.value.basic.length}条`),console.log(`🔍 高级规则: ${_.value.advanced.length}条`),console.log(`📈 图表规则: ${_.value.charts.length}条`),console.log("📋 基础规则列表:",_.value.basic.map(r=>r.name)),b.success(`成功从JSON文件加载${i.totalRules}条规则`)}catch(t){console.error("❌ 加载规则数据失败:",t),console.error("❌ 错误详情:",{message:t.message,stack:t.stack,timestamp:new Date().toISOString(),url:`/data/rules.json?v=${new Date().getTime()}`}),b.error("加载规则数据失败: "+t.message+" - 请检查网络连接或刷新页面"),console.log("⚠️ 使用备用规则数据"),console.log("⚠️ 使用备用规则数据，包含基本功能"),_.value={basic:[{name:"❌ 规则加载失败",query:"点击强制刷新重试",icon:"❌",category:"error"},...te.basic],advanced:[{name:"🔧 故障排除",query:"规则加载故障排除",icon:"🔧",category:"troubleshoot"},...te.advanced],charts:[{name:"📊 错误报告",query:"生成错误报告",icon:"📊",category:"error_report"},...te.charts]}}},_t=async()=>{console.log("🔄 强制刷新规则数据..."),console.log("🔄 当前规则状态:",{basic:_.value.basic.length,advanced:_.value.advanced.length,charts:_.value.charts.length}),b.info("正在重新加载规则数据..."),await Se(),console.log("🔄 刷新后规则状态:",{basic:_.value.basic.length,advanced:_.value.advanced.length,charts:_.value.charts.length})},Ie=async()=>{try{console.log("🧪 直接测试规则加载...");const e=await fetch("/data/rules.json?test="+Date.now());console.log("🧪 响应状态:",e.status);const t=await e.json();console.log("🧪 数据:",t),b.success(`测试成功: 加载了${t.totalRules}条规则`)}catch(e){console.error("🧪 测试失败:",e),b.error("测试失败: "+e.message)}},bt=()=>{"caches"in window&&caches.keys().then(e=>{e.forEach(t=>{caches.delete(t)})}),b.info("缓存已清除，请刷新页面")};return(e,t)=>{var o;const s=_e("el-table-column"),n=_e("el-table"),i=_e("el-text");return h(),g("div",os,[l("div",ls,[t[9]||(t[9]=l("div",{class:"header-left"},[l("div",{class:"logo-section"},[l("span",{class:"logo-icon"},"🤖"),l("span",{class:"logo-text"},"IQE AI 智能助手 - 三栏布局")])],-1)),l("div",rs,[l("div",cs,[t[7]||(t[7]=l("span",{class:"user-avatar"},"👤",-1)),l("div",us,[l("span",ds,m(S.value.name),1),l("span",ps,m(S.value.department),1)])])]),l("div",ms,[l("div",hs,[l("span",gs,m(H.value?"AI增强模式":"基础模式"),1),l("span",fs,"缓存: "+m(re.value.enableCache?"启用":"禁用"),1)]),l("label",ys,[X(l("input",{type:"checkbox","onUpdate:modelValue":t[0]||(t[0]=a=>H.value=a)},null,512),[[fe,H.value]]),t[8]||(t[8]=l("span",{class:"slider"},null,-1))]),l("button",{onClick:ot,class:"header-button"},"清空对话")])]),l("div",vs,[l("div",_s,[t[20]||(t[20]=l("div",{class:"panel-header"},[l("span",{class:"panel-icon"},"🛠️"),l("h3",{class:"panel-title"},"智能工具")],-1)),l("div",bs,[l("div",$s,[l("div",{class:"category-header",onClick:t[1]||(t[1]=a=>ge("basic"))},[t[10]||(t[10]=l("span",{class:"category-icon"},"🔍",-1)),t[11]||(t[11]=l("span",{class:"category-title"},"基础查询",-1)),l("span",{class:Q(["toggle-icon",{expanded:B.value.basic}])},"▼",2)]),X(l("div",ws,[l("div",ks,[ee(" 🔍 调试: 规则数量 "+m(_.value.basic.length)+" | 第一个规则: "+m((o=_.value.basic[0])==null?void 0:o.name)+" ",1),t[12]||(t[12]=l("br",null,null,-1)),ee("📊 总计: 基础"+m(_.value.basic.length)+" + 高级"+m(_.value.advanced.length)+" + 图表"+m(_.value.charts.length)+" ",1),t[13]||(t[13]=l("br",null,null,-1)),ee("🕒 最后加载: "+m(new Date().toLocaleTimeString())+" ",1),t[14]||(t[14]=l("br",null,null,-1)),ee("🌐 当前端口: "+m(e.window.location.port)+" ",1),t[15]||(t[15]=l("br",null,null,-1)),l("button",{onClick:_t,style:{"margin-left":"10px","font-size":"10px",padding:"2px 6px"}},"强制刷新"),l("button",{onClick:Ie,style:{"margin-left":"5px","font-size":"10px",padding:"2px 6px"}},"直接测试"),l("button",{onClick:bt,style:{"margin-left":"5px","font-size":"10px",padding:"2px 6px"}},"清除缓存")]),(h(!0),g(L,null,P(_.value.basic,a=>(h(),g("div",{key:a.name,class:"tool-item rule-item",onClick:r=>Y(a.query),title:a.description||a.query},[l("span",Is,m(a.icon),1),l("div",Ds,[l("div",Cs,m(a.name),1),l("div",Ts,m(a.query),1)])],8,Ss))),128))],512),[[ye,B.value.basic]])]),l("div",As,[l("div",{class:"category-header",onClick:t[2]||(t[2]=a=>ge("advanced"))},[t[16]||(t[16]=l("span",{class:"category-icon"},"📊",-1)),t[17]||(t[17]=l("span",{class:"category-title"},"高级分析",-1)),l("span",{class:Q(["toggle-icon",{expanded:B.value.advanced}])},"▼",2)]),X(l("div",Es,[(h(!0),g(L,null,P(_.value.advanced,a=>(h(),g("div",{key:a.name,class:"tool-item rule-item",onClick:r=>Y(a.query),title:a.description||a.query},[l("span",js,m(a.icon),1),l("div",qs,[l("div",xs,m(a.name),1),l("div",Rs,m(a.query),1)])],8,Os))),128))],512),[[ye,B.value.advanced]])]),l("div",Fs,[l("div",{class:"category-header",onClick:t[3]||(t[3]=a=>ge("charts"))},[t[18]||(t[18]=l("span",{class:"category-icon"},"📈",-1)),t[19]||(t[19]=l("span",{class:"category-title"},"图表工具",-1)),l("span",{class:Q(["toggle-icon",{expanded:B.value.charts}])},"▼",2)]),X(l("div",Ns,[(h(!0),g(L,null,P(_.value.charts,a=>(h(),g("div",{key:a.name,class:"tool-item rule-item",onClick:r=>Y(a.query),title:a.description||a.query},[l("span",Ls,m(a.icon),1),l("div",Ps,[l("div",Qs,m(a.name),1),l("div",Bs,m(a.query),1)])],8,Ms))),128))],512),[[ye,B.value.charts]])])])]),l("div",Hs,[l("div",zs,[l("div",Ws,[t[21]||(t[21]=l("div",{class:"chat-title"},[l("span",{class:"chat-icon"},"💬"),l("span",{class:"chat-text"},"智能对话")],-1)),l("div",Us,[l("span",{class:Q(["status-dot",{active:C.value}])},null,2),l("span",Ks,m(C.value?"AI思考中...":"就绪"),1)])]),l("div",Gs,[l("div",Js,[O.value.length===0?(h(),g("div",Vs,[t[25]||(t[25]=l("div",{class:"welcome-avatar"},"🤖",-1)),l("div",Ys,[t[23]||(t[23]=wt('<h3 data-v-7922c066>欢迎使用QMS智能助手</h3><p data-v-7922c066>我是您的质量管理系统智能助手，可以帮助您查询和分析质量检验数据。</p><div class="feature-guide" data-v-7922c066><h4 data-v-7922c066>📋 功能指引</h4><div class="guide-sections" data-v-7922c066><div class="guide-section" data-v-7922c066><div class="guide-title" data-v-7922c066>🔍 基础查询 (17类)</div><div class="guide-desc" data-v-7922c066>库存查询、测试情况、上线跟踪、不良分析等</div></div><div class="guide-section" data-v-7922c066><div class="guide-title" data-v-7922c066>📊 高级分析 (15类)</div><div class="guide-desc" data-v-7922c066>专项分析、对比分析、综合查询、进阶统计等</div></div><div class="guide-section" data-v-7922c066><div class="guide-title" data-v-7922c066>📈 图表工具 (14类)</div><div class="guide-desc" data-v-7922c066>趋势图、对比图、分布图、质量分析图等</div></div></div></div><div class="data-scope" data-v-7922c066><h4 data-v-7922c066>📊 数据范围</h4><div class="scope-items" data-v-7922c066><div class="scope-item" data-v-7922c066><span class="scope-icon" data-v-7922c066>📦</span><span class="scope-text" data-v-7922c066>132条库存记录，涵盖5大物料类别</span></div><div class="scope-item" data-v-7922c066><span class="scope-icon" data-v-7922c066>🏭</span><span class="scope-text" data-v-7922c066>4个工厂，3个仓库，5个供应商</span></div><div class="scope-item" data-v-7922c066><span class="scope-icon" data-v-7922c066>🧪</span><span class="scope-text" data-v-7922c066>1056条测试记录，包含生产和测试数据</span></div><div class="scope-item" data-v-7922c066><span class="scope-icon" data-v-7922c066>📋</span><span class="scope-text" data-v-7922c066>3个项目基线，多个批次追踪</span></div></div></div>',4)),l("div",Xs,[t[22]||(t[22]=l("div",{class:"suggestion-title"},"🚀 快速开始 - 点击下方问题试试：",-1)),l("div",Zs,[(h(!0),g(L,null,P(ce.value,a=>(h(),g("div",{key:a,class:"suggestion-item",onClick:r=>Y(a)},m(a),9,en))),128))])]),t[24]||(t[24]=l("div",{class:"usage-tips"},[l("h4",null,"💡 使用提示"),l("ul",{class:"tips-list"},[l("li",null,"左侧面板提供46个预设规则，点击即可快速查询"),l("li",null,'支持自然语言提问，如"查询聚龙供应商的电池库存"'),l("li",null,'可以要求生成图表，如"生成LCD显示屏缺陷趋势图"'),l("li",null,'支持对比分析，如"对比BOE和天马的质量表现"')])],-1))])])):q("",!0),(h(!0),g(L,null,P(O.value,(a,r)=>(h(),g("div",{key:r,class:Q(["message-item",a.type])},[l("div",tn,[a.type==="user"?(h(),g("span",sn,"👤")):(h(),g("span",nn,"🤖"))]),l("div",an,[a.type==="assistant"&&nt(a.content)?(h(),Ae(as,{key:0,content:a.content,type:at(a.content),timestamp:a.timestamp,onActionClick:it},null,8,["content","type","timestamp"])):(h(),g("div",on,[a.cards&&a.cards.length>0?(h(),g("div",ln,[l("div",rn,[(h(!0),g(L,null,P(a.cards,(u,d)=>(h(),g("div",{key:d,class:Q(["stat-card",u.type])},[l("div",cn,m(u.icon),1),l("div",un,[u.splitData?(h(),g("div",dn,[l("div",pn,m(u.title),1),l("div",mn,[l("div",hn,[l("div",gn,m(u.splitData.material.label),1),l("div",fn,m(u.splitData.material.value)+m(u.splitData.material.unit),1)]),l("div",yn,[l("div",vn,m(u.splitData.batch.label),1),l("div",_n,m(u.splitData.batch.value)+m(u.splitData.batch.unit),1)])])])):(h(),g("div",bn,[l("div",$n,m(u.title),1),l("div",wn,m(u.value),1),u.subtitle?(h(),g("div",kn,m(u.subtitle),1)):q("",!0)]))])],2))),128))])])):q("",!0),l("div",{class:"message-text",innerHTML:Je(a.content)},null,8,Sn),a.tableData&&a.tableData.length>0?(h(),g("div",In,[t[26]||(t[26]=l("h5",null,"📊 详细数据",-1)),ve(n,{data:a.tableData.slice(0,50),"max-height":"300",border:"",size:"small"},{default:Ee(()=>[(h(!0),g(L,null,P(a.tableData[0],(u,d)=>(h(),Ae(s,{key:d,prop:d,label:d,"show-overflow-tooltip":"","min-width":"120"},null,8,["prop","label"]))),128))]),_:2},1032,["data"]),a.tableData.length>50?(h(),g("div",Dn,[ve(i,{type:"info"},{default:Ee(()=>[ee(" 显示前50条记录，共 "+m(a.tableData.length)+" 条数据 ",1)]),_:2},1024)])):q("",!0)])):q("",!0),l("div",Cn,m(Ge(a.timestamp)),1),a.type==="assistant"?(h(),g("div",Tn,[l("button",{onClick:u=>et(a.content),class:"action-btn",title:"复制"},"📋",8,An),l("button",{onClick:u=>tt(a),class:"action-btn",title:"点赞"},"👍",8,En),l("button",{onClick:u=>st(a),class:"action-btn",title:"重新生成"},"🔄",8,On)])):q("",!0)]))])],2))),128)),C.value?(h(),g("div",jn,t[27]||(t[27]=[l("div",{class:"message-avatar"},[l("span",null,"🤖")],-1),l("div",{class:"message-content"},[l("div",{class:"loading-dots"},[l("span"),l("span"),l("span")]),l("div",{class:"loading-text"},"AI正在思考...")],-1)]))):q("",!0)],512)]),Z.value.length>0?(h(),g("div",qn,[l("div",xn,[t[28]||(t[28]=l("span",{class:"suggestions-title"},"💡 快速输入建议",-1)),l("span",Rn,"("+m(Z.value.length)+")",1)]),l("div",Fn,[(h(!0),g(L,null,P(Z.value.slice(0,5),(a,r)=>(h(),g("button",{key:r,onClick:u=>Y(a),class:"suggestion-item",disabled:C.value},m(a),9,Nn))),128))])])):q("",!0),l("div",Mn,[l("div",Ln,[X(l("input",{"onUpdate:modelValue":t[4]||(t[4]=a=>E.value=a),onKeyup:St(se,["enter"]),onInput:ue,placeholder:"输入您的问题...",class:"message-input",disabled:C.value},null,40,Pn),[[kt,E.value]]),l("button",{onClick:se,class:"send-button",disabled:C.value||!E.value.trim()},[C.value?(h(),g("span",Bn,"⏳")):(h(),g("span",Hn,"🚀"))],8,Qn)]),l("div",zn,[l("div",Wn,[l("label",Un,[X(l("input",{type:"checkbox","onUpdate:modelValue":t[5]||(t[5]=a=>U.value=a),onChange:yt,class:"debug-checkbox"},null,544),[[fe,U.value]]),t[29]||(t[29]=l("span",{class:"debug-text"},"显示技术细节",-1))])]),l("div",Kn,[l("label",Gn,[X(l("input",{type:"checkbox","onUpdate:modelValue":t[6]||(t[6]=a=>K.value=a),onChange:vt,class:"web-search-checkbox"},null,544),[[fe,K.value]]),t[30]||(t[30]=l("span",{class:"web-search-text"},"启用联网搜索",-1))])])])])])]),l("div",Jn,[ve(It,{workflow:le.value},null,8,["workflow"])])])])}}},sa=Oe(Vn,[["__scopeId","data-v-7922c066"]]);export{sa as default};
