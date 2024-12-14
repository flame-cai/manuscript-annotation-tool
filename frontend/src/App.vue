<script setup>
import Dropzone from 'dropzone';
import { ref, onMounted } from 'vue';


const uploadForm = ref()

onMounted(()=>{
  uploadForm.value = new Dropzone("#upload-form", {
    uploadMultiple: true,
    autoProcessQueue: false,
    parallelUploads: Infinity,
  })
})

const upload_url = import.meta.env.VITE_BACKEND_URL + "/upload-manuscript"
</script>

<template>
  <header>
    <h1>Manuscript Annotation Tool</h1>
    <form :action="upload_url" class="dropzone" id="upload-form"></form>
    <button @click="uploadForm.processQueue()" class="btn btn-primary">Submit</button>
  </header>
</template>

<style>
button {
  margin-top: 0.5em;
}
</style>