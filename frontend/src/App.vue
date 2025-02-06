<script setup>
import { RouterView } from 'vue-router'

function setThemeBasedOnPreference() {
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.setAttribute('data-bs-theme', prefersDarkScheme ? 'dark' : 'light')
}

setThemeBasedOnPreference()

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  setThemeBasedOnPreference()
})

</script>

<template>
  <main>
    <RouterView />
    <!-- <UploadForm v-if="!isUploaded" @upload="uploaded" />
    <AnnotationSection :recognitions="recognitions" @annotated="isUploaded = false" v-else /> -->
  </main>
</template>

<style>
button {
  margin-top: 0.5em;
}
</style>
