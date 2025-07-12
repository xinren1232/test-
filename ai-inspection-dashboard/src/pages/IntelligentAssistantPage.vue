<template>
  <div class="intelligent-assistant-page">
    <IntelligentQAInterface />
  </div>
</template>

<script>
import IntelligentQAInterface from '../components/IntelligentQAInterface.vue'

export default {
  name: 'IntelligentAssistantPage',
  components: {
    IntelligentQAInterface
  }
}
</script>

<style scoped>
.intelligent-assistant-page {
  height: 100vh;
  overflow: hidden;
}
</style>
