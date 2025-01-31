<script setup>
import { useAnnotationStore } from '@/stores/annotationStore';
import AnnotationBlock from './AnnotationBlock.vue'

const props = defineProps(['data', ])
const annotationStore = useAnnotationStore();

annotationStore.userAnnotations[0]["annotations"][props.data[0].page] = {};

</script>

<template>
  <div>
    <div v-for="line in props.data" :key="line">
      <AnnotationBlock :line="line" />
    </div>
  </div>
</template>
