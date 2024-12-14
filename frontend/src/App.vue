<script setup>
import Dropzone from 'dropzone';
import { ref, onMounted } from 'vue';

function setThemeBasedOnPreference() {
    // Get the user's color scheme preference
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;

    // Set the data-bs-theme attribute on the root HTML element
    document.documentElement.setAttribute("data-bs-theme", prefersDarkScheme ? "dark" : "light");
}

// Run the function on page load
setThemeBasedOnPreference();

// Optional: Listen for changes in the user's color scheme preference
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    setThemeBasedOnPreference();
});

const uploadForm = ref()
const manuscriptName = ref()

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
    <div class="mb-3">
      <label for="manuscriptName" class="form-label">Manuscript Name</label>
      <input type="text" class="form-control" id="manuscriptName" v-model="manuscriptName">
    </div>
    <form :action="upload_url" class="dropzone" id="upload-form">
      <div class="previews"></div>
      <input type="hidden" name="manuscript_name" :value="manuscriptName"/>
    </form>
    <button @click="uploadForm.processQueue()" class="btn btn-primary">Submit</button>
  </header>
</template>

<style>
button {
  margin-top: 0.5em;
}
</style>