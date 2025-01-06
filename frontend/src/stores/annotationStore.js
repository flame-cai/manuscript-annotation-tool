import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'

export const useAnnotationStore = defineStore('annotations', () => {
  const annotations = ref({})
  const request = ref({})

  function levenshteinDistance(str1 = '', str2 = '') {
    const track = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null))
    for (let i = 0; i <= str1.length; i += 1) {
      track[0][i] = i
    }
    for (let j = 0; j <= str2.length; j += 1) {
      track[j][0] = j
    }
    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        track[j][i] = Math.min(
          track[j][i - 1] + 1, // deletion
          track[j - 1][i] + 1, // insertion
          track[j - 1][i - 1] + indicator, // substitution
        )
      }
    }
    return track[str2.length][str1.length]
  }

  function calculateLevenshteinDistances() {
    const manuscript_name = Object.keys(annotations.value)[0]
    for (const page in request.value[manuscript_name]) {
      for (const line in request.value[manuscript_name][page]) {
        request.value[manuscript_name][page][line]['levenshtein_distance'] = levenshteinDistance(
          annotations.value[manuscript_name][page][line]['predicted_label'],
          request.value[manuscript_name][page][line]['ground_truth'],
        );
      }
    }
  }

  return { annotations, request, calculateLevenshteinDistances }
})

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useAnnotationStore, import.meta.hot))
}