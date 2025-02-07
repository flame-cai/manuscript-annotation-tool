<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <header>
    <h1>Manuscript Annotation Tool</h1>
  </header>
  <RouterLink :to="{name:'upload-manuscript'}" class="btn btn-primary m-2">Annotate</RouterLink>
  <RouterLink :to="{name: 'uploaded-manuscripts'}" class="btn btn-primary m-2">Uploaded Manuscripts</RouterLink>
</template>
