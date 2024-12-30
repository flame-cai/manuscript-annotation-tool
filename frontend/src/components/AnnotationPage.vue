<script setup>
import AnnotationBlock from './AnnotationBlock.vue'
const props = defineProps(['data'])


</script>

<template>
  <div>
    <div v-for="line in props.data" :key="line">
      <AnnotationBlock :line="line" />
    </div>
  </div>
</template>
