<script setup>
// import { ref } from 'vue'
import { RouterView } from 'vue-router'
// import { useAnnotationStore } from '@/stores/annotationStore'

// const recognitions = ref([])
// const annotationStore = useAnnotationStore()

// function uploaded(response) {
//   recognitions.value = response
//   const manuscript_name = Object.values(response)[0][0].manuscript_name
//   const selected_model = Object.values(response)[0][0].selected_model
//   annotationStore.annotations[manuscript_name] = {}

//   for (const page of Object.keys(response)) {
//     annotationStore.annotations[manuscript_name][page] = {}
//     for (const line in response[page]) {
//       const line_name = response[page][line]['line']
//       annotationStore.annotations[manuscript_name][page][line_name] = {}
//       annotationStore.annotations[manuscript_name][page][line_name]['predicted_label'] =
//         response[page][line]['predicted_label']
//       annotationStore.annotations[manuscript_name][page][line_name]['image_path'] =
//         response[page][line]['image_path']
//       annotationStore.annotations[manuscript_name][page][line_name]['confidence_score'] =
//         response[page][line]['confidence_score']
//     }
//   }
//   annotationStore.userAnnotations.push({
//     manuscript_name: manuscript_name,
//     selected_model: selected_model,
//     annotations: {},
//   })
//   isUploaded.value = true
// }

// const isUploaded = ref(false)
</script>
<template>
  <header>
    <h1>Manuscript Annotation Tool</h1>
  </header>
  <RouterView />
  <!-- <UploadForm v-if="!isUploaded" @upload="uploaded" />
  <AnnotationSection :recognitions="recognitions" @annotated="isUploaded = false" v-else /> -->
</template>
