<template>
  <div class="mermaid-diagram">
    <div class="mermaid" ref="mermaidRef">{{ diagram }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import mermaid from 'mermaid';

const props = defineProps({
  diagram: {
    type: String,
    required: true
  }
});

const mermaidRef = ref(null);

// 初始化Mermaid配置
const initMermaid = () => {
  mermaid.initialize({
    startOnLoad: true,
    theme: 'default',
    securityLevel: 'loose',
    flowchart: {
      htmlLabels: true,
      curve: 'basis'
    }
  });
};

// 渲染图表
const renderDiagram = () => {
  if (mermaidRef.value) {
    try {
      mermaidRef.value.removeAttribute('data-processed');
      mermaid.init(undefined, mermaidRef.value);
    } catch (error) {
      console.error('Mermaid rendering error:', error);
    }
  }
};

// 组件挂载时初始化并渲染
onMounted(() => {
  initMermaid();
  renderDiagram();
});

// 监听图表内容变化，重新渲染
watch(() => props.diagram, () => {
  setTimeout(renderDiagram, 0);
});
</script>

<style scoped>
.mermaid-diagram {
  margin: 20px 0;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
  overflow-x: auto;
}
</style> 