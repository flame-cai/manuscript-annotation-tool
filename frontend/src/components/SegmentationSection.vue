<script setup>
import { useAnnotationStore } from '@/stores/annotationStore'
import { onMounted, useTemplateRef } from 'vue'

const annotationStore = useAnnotationStore()
const segmentationCanvas = useTemplateRef('segmentationCanvas')
let points

function updateCanvasSize(width, height) {
  // const container = document.querySelector('.segmentation-container')
  // const maxWidth = container.clientWidth - 40
  // const maxHeight = window.innerHeight - 200

  // const scale = Math.min(maxWidth / width, maxHeight / height, 1)

  // width *= scale
  // height *= scale
  // console.log(width, height)
  segmentationCanvas.value.width = width
  segmentationCanvas.value.height = height
}

function drawPoints() {
  const ctx = segmentationCanvas.value.getContext('2d')
  ctx.clearRect(0, 0, segmentationCanvas.value.width, segmentationCanvas.value.height)
  points.forEach((point, index) => {
    ctx.beginPath()
    ctx.arc(point[0], point[1], 5, 0, Math.PI * 2)
    ctx.fillStyle = 'gray'
    ctx.fill()
  })
}

onMounted(() => {
  fetch(
    import.meta.env.VITE_BACKEND_URL +
      `/segment/${Object.keys(annotationStore.recognitions)[0]}/${annotationStore.currentPage}`,
  )
    .then((response) => response.json())
    .then((object) => {
      points = object['points']
      updateCanvasSize(object['dimensions'][0], object['dimensions'][1])
      drawPoints()
    })
})
</script>

<template>
  <div class="segmentation-container">
    <canvas class="segmentation-canvas" ref="segmentationCanvas"></canvas>
  </div>
</template>

<style>
.segmentation-container {
  background-color: var(--bs-body-bg);
  border: var(--bs-border-width) solid var(--bs-border-color);
  border-radius: 0.5em;
  padding: 0.5em;
  max-height: 85vh;
  /* width: 100%; */
}

.segmentation-canvas {
  background-color: black;
}
</style>
