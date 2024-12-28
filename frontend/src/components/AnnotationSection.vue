<script setup>
const props = defineProps(['recognitions'])
const BASE_PATH = 'http://localhost:5000/line-images'
</script>

<template>
  Annotation Section
  <div v-for="page in props.recognitions" :key="page">
    <div v-for="line in page" :key="line">
      <img :src="`${BASE_PATH}/${line.manuscript_name}/${line.page}/${line.line}`" />
      <p>{{ line.predicted_label }}</p>
    </div>
  </div>
</template>
