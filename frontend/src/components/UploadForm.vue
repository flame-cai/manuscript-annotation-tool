<script setup>
import Dropzone from 'dropzone';

import { ref, onMounted } from 'vue';
const uploadForm = ref()
const manuscriptName = ref()

onMounted(()=>{
  uploadForm.value = new Dropzone("#upload-form", {
    uploadMultiple: true,
    autoProcessQueue: false,
    parallelUploads: Infinity,
  })
  uploadForm.value.on("completemultiple", ()=>{
	emit('upload')
  })
})

const UPLOAD_URL = import.meta.env.VITE_BACKEND_URL + "/upload-manuscript"

const emit = defineEmits(['upload',])

</script>

<template>
	<div class="mb-3">
	      <label for="manuscriptName" class="form-label">Manuscript Name</label>
	      <input type="text" class="form-control" id="manuscriptName" v-model="manuscriptName">
	    </div>
	    <form :action="UPLOAD_URL" class="dropzone" id="upload-form">
	      <div class="previews"></div>
	      <input type="hidden" name="manuscript_name" :value="manuscriptName"/>
	    </form>
	    <button @click="uploadForm.processQueue()" class="btn btn-primary">Submit</button>
</template>
