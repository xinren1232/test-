import{_ as S}from"./index-Bo1zM2q5.js";class k{constructor(){this.apiKey="sk-cab797574abf4288bcfaca253191565d",this.baseURL="https://api.deepseek.com",this.endpoint="/chat/completions",this.model="deepseek-chat"}get apiURL(){return`${this.baseURL}${this.endpoint}`}async testConnection(){var o;try{console.log("🔍 测试DeepSeek API连接...");const e=await fetch(this.apiURL,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.apiKey}`},body:JSON.stringify({model:this.model,messages:[{role:"user",content:"Hello"}],max_tokens:10,stream:!1})});if(!e.ok){const t=await e.json().catch(()=>({}));throw new Error(`API错误 ${e.status}: ${((o=t.error)==null?void 0:o.message)||e.statusText}`)}const s=await e.json();return console.log("✅ DeepSeek API连接成功"),!0}catch(e){return console.error("❌ DeepSeek API连接失败:",e),!1}}async queryAI(o,e){var s;try{console.log("🤖 调用DeepSeek AI大模型...");const t=this.buildSystemPrompt(e),n=this.buildUserPrompt(o,e),r=await fetch(this.apiURL,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.apiKey}`},body:JSON.stringify({model:this.model,messages:[{role:"system",content:t},{role:"user",content:n}],temperature:.7,max_tokens:2e3,stream:!1})});if(!r.ok){const i=((s=(await r.json().catch(()=>({}))).error)==null?void 0:s.message)||r.statusText;throw new Error(`DeepSeek API错误 ${r.status}: ${i}`)}const a=await r.json();if(console.log("✅ DeepSeek AI响应成功"),!a.choices||!a.choices[0]||!a.choices[0].message)throw new Error("DeepSeek API响应格式异常");const c=a.choices[0].message.content;return this.parseAIResponse(c,e)}catch(t){throw console.error("❌ DeepSeek AI调用失败:",t),t.message.includes("401")?new Error("API密钥无效，请检查DeepSeek API密钥配置"):t.message.includes("429")?new Error("API调用频率超限，请稍后重试"):t.message.includes("500")?new Error("DeepSeek服务器错误，请稍后重试"):t.name==="TypeError"&&t.message.includes("fetch")?new Error("网络连接失败，请检查网络连接"):t}}async queryAIStream(o,e,s){var t,n,r;try{console.log("🤖 启动DeepSeek AI流式调用...");const a=this.buildSystemPrompt(e),c=this.buildUserPrompt(o,e),l=await fetch(this.apiURL,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.apiKey}`},body:JSON.stringify({model:this.model,messages:[{role:"system",content:a},{role:"user",content:c}],temperature:.7,max_tokens:2e3,stream:!0})});if(!l.ok){const d=((t=(await l.json().catch(()=>({}))).error)==null?void 0:t.message)||l.statusText;throw new Error(`DeepSeek API错误 ${l.status}: ${d}`)}const i=l.body.getReader(),h=new TextDecoder;let u="";for(;;){const{done:p,value:d}=await i.read();if(p)break;const g=h.decode(d).split(`
`);for(const f of g)if(f.startsWith("data: ")){const y=f.slice(6);if(y==="[DONE]")continue;try{const m=((r=(n=JSON.parse(y).choices[0])==null?void 0:n.delta)==null?void 0:r.content)||"";m&&(u+=m,s(m))}catch{}}}return console.log("✅ DeepSeek AI流式响应完成"),this.parseAIResponse(u,e)}catch(a){throw console.error("❌ DeepSeek AI流式调用失败:",a),a.message.includes("401")?new Error("API密钥无效，请检查DeepSeek API密钥配置"):a.message.includes("429")?new Error("API调用频率超限，请稍后重试"):a.message.includes("500")?new Error("DeepSeek服务器错误，请稍后重试"):a.name==="TypeError"&&a.message.includes("fetch")?new Error("网络连接失败，请检查网络连接"):a}}buildSystemPrompt(o){const{inventoryData:e,testData:s,productionData:t,batchData:n}=o;return`你是IQE质量管理智能助手，专门分析质量管理数据并提供专业建议。

## 数据概况
- 库存数据: ${(e==null?void 0:e.length)||0} 条记录
- 测试数据: ${(s==null?void 0:s.length)||0} 条记录  
- 生产数据: ${(t==null?void 0:t.length)||0} 条记录
- 批次数据: ${(n==null?void 0:n.length)||0} 条记录

## 分析能力
你具备以下分析能力：
1. 库存风险评估和预警
2. 质量问题根因分析
3. 生产效率和不良率分析
4. 供应商表现评估
5. 跨场景关联分析
6. 趋势预测和建议

## 回复格式
请按以下JSON格式回复：
{
  "analysis": {
    "title": "分析标题",
    "summary": "分析摘要",
    "keyMetrics": [
      {"name": "指标名", "value": "数值", "unit": "单位", "trend": "up/down/stable"}
    ],
    "insights": [
      {"icon": "图标", "title": "洞察标题", "description": "详细描述", "priority": "high/medium/low"}
    ],
    "recommendations": [
      {"priority": "高/中/低", "title": "建议标题", "description": "具体建议"}
    ]
  },
  "response": "自然语言回复内容"
}

## 注意事项
- 基于实际数据进行分析，不要编造数据
- 提供具体可执行的建议
- 突出关键风险和改进机会
- 使用专业的质量管理术语`}buildUserPrompt(o,e){const{inventoryData:s,testData:t,productionData:n}=e,r=this.extractDataStats(e);return`用户问题: ${o}

## 当前数据统计
${r}

请基于以上实际数据，对用户问题进行深度分析，提供专业的质量管理建议。`}extractDataStats(o){const{inventoryData:e,testData:s,productionData:t}=o;let n="";if((e==null?void 0:e.length)>0){const r=e.filter(c=>c.status==="风险").length,a=e.filter(c=>c.status==="冻结").length;n+=`
库存统计:
- 总库存: ${e.length} 项
- 风险库存: ${r} 项
- 冻结库存: ${a} 项`}if((s==null?void 0:s.length)>0){const r=s.filter(c=>c.testResult==="FAIL").length,a=((s.length-r)/s.length*100).toFixed(1);n+=`
质量统计:
- 总测试: ${s.length} 项
- 不合格: ${r} 项
- 合格率: ${a}%`}if((t==null?void 0:t.length)>0){const r=(t.reduce((a,c)=>a+(c.defectRate||0),0)/t.length).toFixed(2);n+=`
生产统计:
- 总记录: ${t.length} 项
- 平均不良率: ${r}%`}return n}parseAIResponse(o,e){var s,t,n,r,a;try{const c=o.match(/\{[\s\S]*\}/);if(c){const l=JSON.parse(c[0]);return{type:"ai_analysis",title:((s=l.analysis)==null?void 0:s.title)||"AI分析结果",summary:((t=l.analysis)==null?void 0:t.summary)||"基于AI大模型的智能分析",keyMetrics:((n=l.analysis)==null?void 0:n.keyMetrics)||[],insights:((r=l.analysis)==null?void 0:r.insights)||[],recommendations:((a=l.analysis)==null?void 0:a.recommendations)||[],aiResponse:l.response||o,dataSources:["DeepSeek AI大模型","实时业务数据"]}}}catch{console.log("AI回复非JSON格式，使用文本解析")}return{type:"ai_analysis",title:"AI智能分析",summary:"基于DeepSeek AI大模型的深度分析",keyMetrics:this.extractMetricsFromText(o),insights:this.extractInsightsFromText(o),recommendations:this.extractRecommendationsFromText(o),aiResponse:o,dataSources:["DeepSeek AI大模型","实时业务数据"]}}extractMetricsFromText(o){const e=[],s=o.split(`
`);for(const t of s){const n=t.match(/(\d+(?:\.\d+)?)\s*(%|项|个|条)/);if(n){const r=n[1],a=n[2],c=t.replace(n[0],"").replace(/[：:]/g,"").trim();c&&c.length<20&&e.push({name:c,value:r,unit:a,trend:"info"})}}return e.slice(0,5)}extractInsightsFromText(o){const e=[],s=o.split(/[。！？.!?]/);for(const t of s)t.length>10&&t.length<100&&(t.includes("风险")||t.includes("问题")||t.includes("建议"))&&e.push({icon:t.includes("风险")?"⚠️":t.includes("问题")?"🔍":"💡",title:"关键发现",description:t.trim(),priority:t.includes("风险")?"high":"medium"});return e.slice(0,3)}extractRecommendationsFromText(o){const e=[],s=o.split(`
`);for(const t of s)(t.includes("建议")||t.includes("应该")||t.includes("需要"))&&e.push({priority:t.includes("紧急")||t.includes("立即")?"高":"中",title:"改进建议",description:t.trim()});return e.slice(0,3)}async chat(o,e={}){var s;try{console.log("🤖 发送聊天请求到DeepSeek API"),console.log("📝 消息数量:",o.length);const t={model:this.model,messages:o,max_tokens:e.max_tokens||2e3,temperature:e.temperature||.7,stream:e.stream||!1},n=await fetch(this.apiURL,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.apiKey}`},body:JSON.stringify(t)});if(!n.ok){const a=await n.json().catch(()=>({}));throw new Error(`API错误 ${n.status}: ${((s=a.error)==null?void 0:s.message)||n.statusText}`)}const r=await n.json();return console.log("✅ DeepSeek API响应成功"),r}catch(t){throw console.error("❌ 聊天请求失败:",t),t}}async enhancedChat(o,e={}){try{console.log("🚀 开始增强AI对话...");const s=o[o.length-1],t=await this.analyzeToolNeeds(s.content);let n=null,r=[];if(t.needsTools&&t.tools.length>0){console.log("🔧 检测到需要工具调用:",t.tools);const{toolService:a}=await S(async()=>{const{toolService:i}=await import("./toolService-Dl3bL2M-.js");return{toolService:i}},[]);for(const i of t.tools)try{const h=await a.executeTool(i.name,i.parameters);r.push(h),console.log(`✅ 工具 ${i.name} 执行成功`)}catch(h){console.warn(`⚠️ 工具 ${i.name} 执行失败:`,h.message),r.push({tool:i.name,success:!1,error:h.message})}const c=this.formatToolResults(r),l=[...o,{role:"system",content:`工具调用结果：
${c}

请基于以上工具调用结果回答用户的问题。`}];n=await this.chat(l,e)}else n=await this.chat(o,e);return{...n,enhanced:!0,tool_calls:r,tool_analysis:t}}catch(s){return console.error("❌ 增强对话失败:",s),await this.chat(o,e)}}async analyzeToolNeeds(o){const e={needsTools:!1,tools:[],confidence:0},s=o.toLowerCase();["搜索","查找","查询","最新","新闻","信息","什么是","介绍"].some(i=>s.includes(i))&&(e.needsTools=!0,e.tools.push({name:"web_search",parameters:{query:o,engine:"duckduckgo"}}),e.confidence+=.3),["时间","现在几点","当前时间","今天","日期"].some(i=>s.includes(i))&&(e.needsTools=!0,e.tools.push({name:"get_time",parameters:{}}),e.confidence+=.4);const r=["计算","算","等于","+","-","*","/","数学"],a=/\d/.test(s),c=/[+\-*/=]/.test(s);if((r.some(i=>s.includes(i))||c)&&a){e.needsTools=!0;const i=this.extractMathExpression(o);i&&(e.tools.push({name:"calculate",parameters:{expression:i}}),e.confidence+=.5)}if(["分析","统计","数据","库存","生产","测试","质量","报告"].some(i=>s.includes(i))){e.needsTools=!0;let i="inventory";s.includes("生产")?i="production":s.includes("测试")?i="testing":s.includes("批次")&&(i="batch"),e.tools.push({name:"analyze_data",parameters:{data_type:i}}),e.confidence+=.3}return e}extractMathExpression(o){const e=/[\d+\-*/().\s]+/g,s=o.match(e);return s&&s.length>0?s.reduce((n,r)=>n.length>r.length?n:r).trim():null}formatToolResults(o){if(!o||o.length===0)return"无工具调用结果";let e="";return o.forEach((s,t)=>{e+=`
=== 工具 ${t+1}: ${s.tool} ===
`,s.success?(e+=`状态: ✅ 成功
`,e+=`摘要: ${s.summary}
`,s.data&&(s.tool==="web_search"&&s.data.results?(e+=`搜索结果:
`,s.data.results.forEach((n,r)=>{e+=`${r+1}. ${n.title}
   ${n.snippet}
   ${n.url}

`})):s.tool==="analyze_data"&&s.data.analysis?(e+=`数据分析:
`,e+=JSON.stringify(s.data.analysis,null,2)):e+=`数据: ${JSON.stringify(s.data,null,2)}
`)):(e+=`状态: ❌ 失败
`,e+=`错误: ${s.error}
`),e+=`
`}),e}}const x=new k;export{x as a};
