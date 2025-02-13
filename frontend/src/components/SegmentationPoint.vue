<script setup>
import { onMounted, useTemplateRef } from 'vue'

const props = defineProps(['coordinates', 'isSelectMode'])
const point = useTemplateRef('point')

onMounted(() => {
  point.value.style.left = props.coordinates[0] + 'px'
  point.value.style.top = props.coordinates[1] + 'px'
})

function select() {
  if (props.isSelectMode) {
    point.value.style.backgroundColor = 'white'
  }
}
</script>

<template>
  <div ref="point" class="point" @mouseenter="select"></div>
</template>

<style>
.point {
  display: inline-block;
  position: absolute;
  background-color: gray;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
</style>
