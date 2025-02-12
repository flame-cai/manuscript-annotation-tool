<script setup>
import { useAnnotationStore } from '@/stores/annotationStore'
import { ref, useTemplateRef } from 'vue'
import SegmentationPoint from './SegmentationPoint.vue';

const annotationStore = useAnnotationStore()
const segmentationCanvas = useTemplateRef('segmentationCanvas')
const points = ref();


//need to make this work for different screen sizes
function updateCanvasSize(width, height) {
  segmentationCanvas.value.style.width = width / 2  + 'px';
  segmentationCanvas.value.style.height = height / 2 + 'px';
}

fetch(
  import.meta.env.VITE_BACKEND_URL +
    `/segment/${Object.keys(annotationStore.recognitions)[0]}/${annotationStore.currentPage}`,
)
  .then((response) => response.json())
  .then((object) => {
    points.value = object['points'].map((point) => [point[0], point[1]])
    updateCanvasSize(object['dimensions'][0], object['dimensions'][1])
  })
</script>

<template>
  <div class="segmentation-container">
    <div class="segmentation-canvas" ref="segmentationCanvas">
      <SegmentationPoint v-for="(point, index) in points" :key="index" :coordinates="point"/>
    </div>
  </div>
</template>

<style>
.segmentation-container {
  background-color: var(--bs-body-bg);
  border: var(--bs-border-width) solid var(--bs-border-color);
  border-radius: 0.5em;
  padding: 0.5em;
  max-height: 85vh;
}

.segmentation-canvas {
  background-color: black;
  position: relative;
}
</style>
