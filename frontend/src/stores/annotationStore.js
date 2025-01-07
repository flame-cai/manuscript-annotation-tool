import { defineStore } from "pinia";
import { ref } from "vue";

export const useAnnotationStore = defineStore('annotations',() => {
    const request = ref({});

    return { request }
})