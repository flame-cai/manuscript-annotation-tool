<script setup>
import Dropzone from 'dropzone';
import { onMounted } from 'vue';

onMounted(()=>{
  let uploadForm = new Dropzone("#upload-form", {
    uploadMultiple: true,
    autoProcessQueue: false,
  })
})

const upload_url = import.meta.env.VITE_BACKEND_URL + "/upload-manuscript"
</script>

<template>
  <header>
    <h1>Manuscript Annotation Tool</h1>
    <form :action="upload_url" class="dropzone" id="upload-form"></form>
    <button @click="console.log(uploadForm)">Submit</button>
  </header>
</template>