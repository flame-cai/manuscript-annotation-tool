<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <header>
    <h1>Manuscript Annotation Tool</h1>
  </header>
  <RouterLink :to="{name:'upload-manuscript'}" class="btn btn-primary">Annotate</RouterLink>
</template>
