<script setup>
import Dropzone from 'dropzone'

import { ref, onMounted } from 'vue'

const uploadForm = ref()
const manuscriptName = ref()
const models = ref([])
const modelSelected = ref('')

fetch(import.meta.env.VITE_BACKEND_URL + '/models')
.then((response)=>response.json())
.then((object) => {
	models.value = object;
})

onMounted(() => {
  uploadForm.value = new Dropzone('#upload-form', {
    uploadMultiple: true,
    autoProcessQueue: false,
    parallelUploads: Infinity,
  })
  uploadForm.value.on('completemultiple', function(files) {
    emit('upload', JSON.parse(files[0].xhr.response))
  })
})

const UPLOAD_URL = import.meta.env.VITE_BACKEND_URL + '/upload-manuscript'

const emit = defineEmits(['upload'])
</script>

<template>
  <div class="mb-3">
    <label for="manuscriptName" class="form-label">Manuscript Name</label>
    <input type="text" class="form-control" id="manuscriptName" v-model="manuscriptName" />
  </div>
  <div class="mb-3">
    <label for="model" class="form-label">Model</label>
    <select class="form-select" id="model" v-model="modelSelected" placeholder="Select a model">
		<option disabled hidden value="" >Select a model</option>
		<option v-for="model in models" :key="model" :value="model">{{ model }}</option>
	</select>
  </div>
  <form :action="UPLOAD_URL" class="dropzone" id="upload-form">
    <div class="previews"></div>
    <input type="hidden" name="manuscript_name" :value="manuscriptName" />
	<input type="hidden" name="model" :value="modelSelected" />
  </form>
  <button @click="uploadForm.processQueue()" class="btn btn-primary">Submit</button>
</template>
