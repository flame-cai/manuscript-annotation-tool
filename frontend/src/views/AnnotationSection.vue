<script setup>
import { ref } from 'vue';
import AnnotationPage from '@/components/AnnotationPage.vue';
import { useAnnotationStore } from '@/stores/annotationStore';

const props = defineProps(['recognitions'])
const emit = defineEmits(['annotated'])
const annotationStore = useAnnotationStore();
const page = ref(Object.keys(props.recognitions).sort()[0]);

function uploadGroundTruth() {
  annotationStore.calculateLevenshteinDistances();
  fetch(import.meta.env.VITE_BACKEND_URL + "/fine-tune", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(annotationStore.request)
  }).then(()=>{
    emit('annotated');
  })
}

</script>

<template>
  <h2>Annotation Section</h2>
  <div class="mb-3">
    <button class="btn btn-primary" @click="uploadGroundTruth">Fine-tune</button>
  </div>
  <div class="mb-3">
    <label for="page" class="form-label">Page</label>
    <select class="form-select" id="page" v-model="page" placeholder="Select a model">
      <option v-for="(page_data, page_name) in props.recognitions" :key="page_name" :value="page_name">{{ page_name }}</option>
    </select>
  </div>
  <AnnotationPage v-for="(page_data, page_name) in props.recognitions" :key="page_data" :data="page_data" v-show="page === page_name"/>
</template>
