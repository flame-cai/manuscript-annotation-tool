<script setup>
import { reactive, ref, watch, onMounted } from 'vue'
import Sanscript from '@indic-transliteration/sanscript'
import { useAnnotationStore } from '@/stores/annotationStore'

const BASE_PATH = `${import.meta.env.VITE_BACKEND_URL}/line-images`

const props = defineProps(['line_name', 'line_data', 'page_name', 'manuscript_name'])
const annotationStore = useAnnotationStore()

const isHK = ref(false)

const textboxClassObject = reactive({
  'form-control': true,
  'mb-2': true,
  'me-2': true,
  'devanagari-textbox': true,
  'is-valid': false,
})

const devanagari = ref(props.line_data.predicted_label)
const hk = ref(Sanscript.t(props.line_data.predicted_label, 'devanagari', 'hk'))

const devanagariInput = ref(null)

watch(hk, function () {
  if (!isHK.value) return
  devanagari.value = Sanscript.t(hk.value, 'hk', 'devanagari')
})

function toggleHK() {
  hk.value = Sanscript.t(devanagari.value, 'devanagari', 'hk')
  isHK.value = !isHK.value
}

function save() {
  annotationStore.userAnnotations[0]['annotations'][props.page_name][props.line_name] = {}
  annotationStore.userAnnotations[0]['annotations'][props.page_name][props.line_name][
    'ground_truth'
  ] = devanagari.value
  textboxClassObject['is-valid'] = true
}

function handleBackspace(event) {
  if (event.key === 'Backspace') {
    const input = event.target
    const cursorPosition = input.selectionStart
    const currentValue = input.value

    // Check if we have enough characters to check
    if (cursorPosition < 3) return

    // Define special characters
    const halantCharacter = '\u094D' // Devanagari Halant
    const zwnj = '\u200C' // Zero-Width Non-Joiner

    // Get characters at specific positions
    const characterAtHalantPosition = currentValue[cursorPosition - 2]
    const characterRelativeMinus1 = currentValue[cursorPosition - 1]
    const characterRelativeMinus2 = currentValue[cursorPosition - 3]

    // Condition 1: Special ZWNJ handling when halant is two indices behind
    if (characterAtHalantPosition === halantCharacter) {
      event.preventDefault()

      const prevFiveChars = currentValue.slice(Math.max(0, cursorPosition - 5), cursorPosition)

      const newValue = 
        currentValue.slice(0, cursorPosition - 1) + 
        '\u200C' + 
        currentValue.slice(cursorPosition)

      devanagari.value = newValue

      input.value = newValue
      input.setSelectionRange(cursorPosition, cursorPosition)

      const afterFiveChars = newValue.slice(Math.max(0, cursorPosition - 5), cursorPosition)

      console.log('Conditional Backspace (Halant Case):', {
        beforeDeletion: {
          value: currentValue,
          prevFiveChars: prevFiveChars,
          cursorPosition: cursorPosition
        },
        afterDeletion: {
          value: newValue,
          nextFiveChars: afterFiveChars,
          cursorPosition: cursorPosition
        }
      })
      return
    }

    // Condition 2: Default backspace when ZWNJ is at relative -1 and halant is at relative -2
    if (
      characterRelativeMinus1 === zwnj && 
      characterRelativeMinus2 === halantCharacter
    ) {
      // Do nothing, allow default backspace behavior
      console.log('Default Backspace (ZWNJ after Halant)')
      return
    }
  }
}

onMounted(() => {
  if (devanagariInput.value) {
    devanagariInput.value.addEventListener('keydown', handleBackspace)
  }
})
</script>

<template>
  <img
    :src="`${BASE_PATH}/${props.manuscript_name}/${props.page_name}/${props.line_name}`"
    class="mb-2 manuscript-segment-img"
  />
  <div class="annotation-input">
    <input 
      ref="devanagariInput"
      v-model="devanagari" 
      type="text" 
      :class="textboxClassObject" 
    />
    <button class="btn btn-primary mb-2 me-2" @click="toggleHK">Roman</button>
    <button class="btn btn-success mb-2 me-2" @click="save">Save</button>
  </div>
  <input v-model="hk" type="text" class="form-control mb-2" v-if="isHK" />
</template>

<style>
.manuscript-segment-img {
  display: block;
}

.annotation-input {
  width: 100%;
  display: flex;
}

.devanagari-textbox {
  flex-grow: 1;
  display: inline-block;
}
</style>