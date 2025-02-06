<script setup>
import { ref, watch } from 'vue';
import Sanscript from '@indic-transliteration/sanscript';
import { useAnnotationStore } from '@/stores/annotationStore';

const BASE_PATH = 'http://localhost:5000/line-images'

const props = defineProps(['line_name', 'line_data', 'page_name', 'manuscript_name']);
const annotationStore = useAnnotationStore();

let isEntryCreated = false;

const devanagari = ref(props.line_data.predicted_label);
const hk = ref(Sanscript.t(props.line_data.predicted_label, 'devanagari', 'hk'))

watch(hk, function() {
    devanagari.value = Sanscript.t(hk.value, 'hk', 'devanagari')
})

watch(devanagari, function(){
    hk.value = Sanscript.t(devanagari.value, 'devanagari', 'hk');
    if (!isEntryCreated) {
        annotationStore.userAnnotations[0]["annotations"][props.page_name][props.line_name] = {};
        isEntryCreated = true;
    }
    annotationStore.userAnnotations[0]["annotations"][props.page_name][props.line_name]["ground_truth"] = devanagari.value;
})

</script>

<template>
    <img :src="`${BASE_PATH}/${props.manuscript_name}/${props.page_name}/${props.line_name}`" class="mb-2" />
    <input v-model="hk" type="text" class="form-control mb-2">
    <input v-model="devanagari" type="text" class="form-control mb-2"/>
</template>