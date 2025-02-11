<script setup>
import { useAnnotationStore } from '@/stores/annotationStore'

const annotationStore = useAnnotationStore()

function updateCanvasSize(width, height) {
  const container = document.querySelector('.segmentation-container')
  const maxWidth = container.clientWidth - 40
  const maxHeight = window.innerHeight - 200

  const scale = Math.min(maxWidth / width, maxHeight / height, 1)

  width *= scale
  height *= scale

  const segmentationCanvas = document.getElementById('segmentationCanvas')
  segmentationCanvas.style.width = width + 'px'
  segmentationCanvas.style.height = height + 'px'
}

fetch(
  import.meta.env.VITE_BACKEND_URL +
    `/segment/${Object.keys(annotationStore.recognitions)[0]}/${annotationStore.currentPage}`,
)
  .then((response) => response.json())
  .then((object) => {
    updateCanvasSize(object['dimensions'][0], object['dimensions'][1])
  })
</script>

<template>
  <div class="segmentation-container">
    <div class="segmentation-canvas" id="segmentationCanvas"></div>
  </div>
</template>

<style>
.segmentation-container {
  border: 1px solid white;
  border-radius: 0.5em;
  padding: 0.5em;
  height: 85vh;
  width: 100%;
}
</style>
