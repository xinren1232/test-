<template>
  <div class="relation-diagram">
    <div v-if="!relations || relations.length === 0" class="no-relations">
      <el-empty description="没有字段关系可显示" />
    </div>
    <div v-else class="diagram-container">
      <div ref="diagramRef" class="mermaid-diagram"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

// 组件属性
const props = defineProps({
  relations: {
    type: Array,
    required: true
  }
});

// 图表容器引用
const diagramRef = ref(null);

// 初始化Mermaid
function initMermaid() {
  // 动态加载mermaid
  if (!window.mermaid) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@11.6.0/dist/mermaid.min.js';
    script.onload = () => {
      if (window.mermaid) {
        window.mermaid.initialize({
          startOnLoad: true,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'sans-serif',
          flowchart: {
            htmlLabels: true,
            curve: 'basis'
          }
        });
        renderDiagram();
      }
    };
    document.head.appendChild(script);
  } else {
    window.mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'sans-serif',
      flowchart: {
        htmlLabels: true,
        curve: 'basis'
      }
    });
  }
}

// 渲染关系图
function renderDiagram() {
  if (!diagramRef.value || !props.relations || props.relations.length === 0 || !window.mermaid) return;
  
  try {
    // 清空容器
    diagramRef.value.innerHTML = '';
    
    // 构建图表定义
    const diagramDef = buildDiagramDefinition();
    
    // 渲染图表
    window.mermaid.render('diagram', diagramDef, (svgCode) => {
      diagramRef.value.innerHTML = svgCode;
    });
  } catch (error) {
    console.error('渲染关系图失败:', error);
    diagramRef.value.innerHTML = `<div class="error-message">渲染关系图失败: ${error.message}</div>`;
  }
}

// 构建图表定义
function buildDiagramDefinition() {
  // 收集所有模块
  const modules = new Set();
  props.relations.forEach(relation => {
    modules.add(relation.sourceModule);
    modules.add(relation.targetModule);
  });
  
  // 构建图表定义
  let def = 'erDiagram\n';
  
  // 添加实体
  modules.forEach(module => {
    def += `  ${formatModuleName(module)} {\n`;
    def += `    string id\n`;
    def += `  }\n`;
  });
  
  // 添加关系
  props.relations.forEach(relation => {
    const sourceModule = formatModuleName(relation.sourceModule);
    const targetModule = formatModuleName(relation.targetModule);
    const relationSymbol = getRelationSymbol(relation.relationType);
    const label = `"${relation.sourceField} -> ${relation.targetField}"`;
    
    def += `  ${sourceModule} ${relationSymbol} ${targetModule} : ${label}\n`;
  });
  
  return def;
}

// 格式化模块名称
function formatModuleName(name) {
  return name.replace(/[^a-zA-Z0-9]/g, '_');
}

// 获取关系符号
function getRelationSymbol(relationType) {
  switch (relationType) {
    case 'oneToOne':
      return '||--||';
    case 'oneToMany':
      return '||--|{';
    case 'manyToOne':
      return '}|--||';
    case 'manyToMany':
      return '}|--|{';
    default:
      return '||--o{';
  }
}

// 监听关系变化
watch(() => props.relations, () => {
  renderDiagram();
}, { deep: true });

// 组件挂载时初始化
onMounted(() => {
  initMermaid();
});
</script>

<style scoped>
.relation-diagram {
  width: 100%;
}

.no-relations {
  padding: 40px 0;
  text-align: center;
}

.diagram-container {
  width: 100%;
  overflow: auto;
}

.mermaid-diagram {
  min-height: 400px;
}

.error-message {
  color: #f56c6c;
  padding: 20px;
  text-align: center;
  border: 1px solid #f56c6c;
  border-radius: 4px;
  margin: 20px 0;
}
</style> 