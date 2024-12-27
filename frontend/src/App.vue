<script setup>
import { ref } from 'vue';
import UploadForm from './components/UploadForm.vue'
import AnnotationSection from './components/AnnotationSection.vue';

function setThemeBasedOnPreference() {
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute("data-bs-theme", prefersDarkScheme ? "dark" : "light");
}
setThemeBasedOnPreference();
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    setThemeBasedOnPreference();
});

const isUploaded = ref(false);

</script>

<template>
  <header>
    <h1>Manuscript Annotation Tool</h1>
  </header>
  <main>
    <UploadForm v-if="!isUploaded" @upload="isUploaded = true"/>
    <AnnotationSection v-else />
  </main>
</template>

<style>
button {
  margin-top: 0.5em;
}
</style>