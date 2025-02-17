<script setup>
import { useCssModule } from 'vue'
import { RouterLink } from 'vue-router'
const landingPage = useCssModule()
</script>

<template>
  <div :class="landingPage['landing-container']">
    <header>
      <img src="../../public/flame-logo.svg" alt="Flame logo" :class="landingPage.logo" />
      <h1>Manuscript Annotation Tool</h1>
    </header>
    <div :class="landingPage.links">
      <RouterLink :to="{ name: 'upload-manuscript' }" class="btn btn-primary m-2"
        >Annotate</RouterLink
      >
      <RouterLink :to="{ name: 'uploaded-manuscripts' }" class="btn btn-primary m-2"
        >Uploaded Manuscripts</RouterLink
      >
    </div>
  </div>
</template>

<style module>
.landing-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.logo {
  height: 35vh;
  display: block;
  margin: auto;
}
</style>
