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

// Custom backspace handler
function handleBackspace(event) {
  // Check if the key pressed is Backspace
  if (event.key === 'Backspace') {
    const input = event.target
    const cursorPosition = input.selectionStart
    const currentValue = input.value

    // Check if cursor is at least 2 characters from the start
    if (cursorPosition < 2) return

    // Check if the character two indices behind the cursor is a halant (U+094D)
    const halantCharacter = '\u094D' // Devanagari Halant
    const characterBeforeHalant = currentValue[cursorPosition - 3]
    const characterAtHalantPosition = currentValue[cursorPosition - 2]

    // If the character two indices behind is NOT a halant, use default backspace
    if (characterAtHalantPosition !== halantCharacter) {
      return
    }

    // Prevent default backspace behavior
    event.preventDefault()

    // Remove the character before the cursor and insert ZWNJ
    const newValue = 
      currentValue.slice(0, cursorPosition - 1) + 
      '\u200C' + 
      currentValue.slice(cursorPosition)

    // Update the value
    devanagari.value = newValue

    // Set cursor position back to where it was
    input.value = newValue
    input.setSelectionRange(cursorPosition, cursorPosition)

    // Log for debugging
    console.log('Conditional Backspace pressed:', {
      originalValue: currentValue,
      newValue: newValue,
      insertedZWNJ: true,
      cursorPosition: cursorPosition,
      characterBeforeHalant: characterBeforeHalant,
      characterAtHalantPosition: characterAtHalantPosition
    })
  }
}

// Add event listener on component mount
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