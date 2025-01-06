<script setup>
import { ref } from 'vue';
import UploadForm from './components/UploadForm.vue'
import AnnotationSection from './views/AnnotationSection.vue';
import { useAnnotationStore } from './stores/annotationStore';

const recognitions = ref([])

const annotationStore = useAnnotationStore();

function setThemeBasedOnPreference() {
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute("data-bs-theme", prefersDarkScheme ? "dark" : "light");
}

setThemeBasedOnPreference();
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    setThemeBasedOnPreference();
});

function uploaded(response) {
  recognitions.value = response;
  let manuscript_name = Object.values(response)[0][0].manuscript_name;
  annotationStore.annotations[manuscript_name] = {};

  for (const page of Object.keys(response)) {
    annotationStore.annotations[manuscript_name][page] = {};
    for (const line in response[page]) {
      const line_name = response[page][line]["line"];
      annotationStore.annotations[manuscript_name][page][line_name] = {}
      annotationStore.annotations[manuscript_name][page][line_name]["predicted_label"] = response[page][line]["predicted_label"]
      annotationStore.annotations[manuscript_name][page][line_name]["image_path"] = response[page][line]["image_path"]
      annotationStore.annotations[manuscript_name][page][line_name]["confidence_score"] = response[page][line]["confidence_score"]
    }
  }
  annotationStore.request[manuscript_name] = {};
  isUploaded.value = true; 
}

const isUploaded = ref(false);

</script>

<template>
  <header>
    <h1>Manuscript Annotation Tool</h1>
  </header>
  <main>
    <UploadForm v-if="!isUploaded" @upload="uploaded"/>
    <AnnotationSection :recognitions="recognitions" v-else />
  </main>
</template>

<style>
button {
  margin-top: 0.5em;
}
</style>