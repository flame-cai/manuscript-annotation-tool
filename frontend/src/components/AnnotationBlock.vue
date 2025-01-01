<script setup>
import { ref, watch } from 'vue';
import Sanscript from '@indic-transliteration/sanscript';
import { useAnnotationStore } from '@/stores/annotationStore';

const BASE_PATH = 'http://localhost:5000/line-images'

const props = defineProps(['line']);
const annotationStore = useAnnotationStore();

console.log(props.line);

const devanagari = ref(props.line.predicted_label);
const hk = ref(Sanscript.t(props.line.predicted_label, 'devanagari', 'hk'))

watch(hk, function() {
    devanagari.value = Sanscript.t(hk.value, 'hk', 'devanagari')
})

watch(devanagari, function(){
    hk.value = Sanscript.t(devanagari.value, 'devanagari', 'hk');
    annotationStore.request[props.line.manuscript_name][props.line.page][props.line.line] = devanagari.value;
})

</script>

<template>
    <img :src="`${BASE_PATH}/${props.line.manuscript_name}/${props.line.page}/${props.line.line}`" class="mb-2" />
    <input v-model="hk" type="text" class="form-control mb-2">
    <input v-model="devanagari" type="text" class="form-control mb-2"/>
</template>