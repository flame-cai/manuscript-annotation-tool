<script setup>
import { ref } from 'vue';
import AnnotationPage from './AnnotationPage.vue';

const props = defineProps(['recognitions'])
const BASE_PATH = 'http://localhost:5000/line-images'
const page = ref(Object.keys(props.recognitions).sort()[0]);
</script>

<template>
  <h2>Annotation Section</h2>
  <div class="mb-3">
    <label for="page" class="form-label">Page</label>
    <select class="form-select" id="page" v-model="page" placeholder="Select a model">
      <option v-for="(page_data, page_name) in props.recognitions" :key="page_name" :value="page_name">{{ page_name }}</option>
    </select>
  </div>
  <AnnotationPage v-for="(page_data, page_name) in props.recognitions" :key="page_data" :data="page_data" v-show="page === page_name"/>
</template>
