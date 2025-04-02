<template>
  <div class="manuscript-viewer">
    <div class="toolbar">
      <h2>{{ manuscriptName }} - Page {{ currentPage }}</h2>
      <div class="controls">
        <button @click="previousPage" :disabled="loading">Previous</button>
        <button @click="nextPage" :disabled="loading">Next</button>
        <div class="toggle-container">
          <label>
            <input type="checkbox" v-model="showPoints" />
            Show Points
          </label>
          <label>
            <input type="checkbox" v-model="showGraph" />
            Show Graph
          </label>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="loading" class="loading">
      Loading page data...
    </div>

    <div v-else class="visualization-container" ref="container">
      <div class="image-container" :style="{ width: `${dimensions[0]}px`, height: `${dimensions[1]}px` }">
        <!-- Background image -->
        <img 
          v-if="imageData" 
          :src="`data:image/jpeg;base64,${imageData}`" 
          :width="dimensions[0]" 
          :height="dimensions[1]" 
          class="manuscript-image"
          @load="imageLoaded = true"
        />
        
        <!-- Points overlay -->
        <div 
          v-if="showPoints && points.length > 0" 
          class="points-overlay"
        >
          <div 
            v-for="(point, index) in points" 
            :key="`point-${index}`"
            class="point"
            :style="{
              left: `${point.coordinates[0]}px`,
              top: `${point.coordinates[1]}px`
            }"
            :title="`Point ${index}: (${point.coordinates[0]}, ${point.coordinates[1]})`"
          ></div>
        </div>
        
        <!-- Graph overlay -->
        <svg 
          v-if="showGraph && graph.nodes && graph.edges" 
          class="graph-overlay"
          :width="dimensions[0]"
          :height="dimensions[1]"
        >
          <line
            v-for="(edge, index) in graph.edges"
            :key="`edge-${index}`"
            :x1="graph.nodes[edge.source].x"
            :y1="graph.nodes[edge.source].y"
            :x2="graph.nodes[edge.target].x"
            :y2="graph.nodes[edge.target].y"
            :stroke="edge.label === 0 ? '#3498db' : '#e74c3c'"
            stroke-width="1.5"
            :stroke-opacity="0.7"
          />
          <circle
            v-for="(node, index) in graph.nodes"
            :key="`node-${index}`"
            :cx="node.x"
            :cy="node.y"
            r="3"
            fill="#2ecc71"
            :fill-opacity="0.8"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useAnnotationStore } from '@/stores/annotationStore';

const annotationStore = useAnnotationStore();

const manuscriptName = computed(() => Object.keys(annotationStore.recognitions)[0] || '');
const currentPage = computed(() => annotationStore.currentPage);

const loading = ref(true);
const error = ref(null);
const dimensions = ref([0, 0]);
const points = ref([]);
const graph = ref({ nodes: [], edges: [] });
const imageData = ref('');
const imageLoaded = ref(false);
const showPoints = ref(true);
const showGraph = ref(true);

// Container ref for potential scrolling/zooming features
const container = ref(null);

const updateCanvasSize = (width, height) => {
  dimensions.value = [width, height];
};

const fetchPageData = async () => {
  if (!manuscriptName.value || !currentPage.value) return;
  
  loading.value = true;
  error.value = null;
  points.value = [];
  graph.value = { nodes: [], edges: [] };
  imageData.value = '';
  imageLoaded.value = false;
  
  try {
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + `/semi-segment/${manuscriptName.value}/${currentPage.value}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch page data');
    }
    
    const data = await response.json();
    
    // Update canvas size
    updateCanvasSize(data.dimensions[0], data.dimensions[1]);
    
    // Process points
    points.value = data.points.map(point => ({
      coordinates: [point[0], point[1]],
      segment: null,
    }));
    
    // Process graph
    if (data.graph) {
      graph.value = data.graph;
    }
    
    // Process image
    if (data.image) {
      console.log('loading image..')
      imageData.value = data.image;
    }
  } catch (err) {
    console.error('Error fetching page data:', err);
    error.value = err.message || 'Failed to load page data';
  } finally {
    loading.value = false;
  }
};

const nextPage = () => {
  // Implement page navigation logic
  annotationStore.setCurrentPage(String(Number(currentPage.value) + 1));
};

const previousPage = () => {
  if (Number(currentPage.value) > 1) {
    annotationStore.setCurrentPage(String(Number(currentPage.value) - 1));
  }
};

// Watch for page changes
watch(
  () => annotationStore.currentPage,
  () => {
    fetchPageData();
  }
);

// Initial data fetch
onMounted(() => {
  fetchPageData();
});
</script>

<style scoped>
.manuscript-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.toggle-container {
  display: flex;
  gap: 1rem;
}

.visualization-container {
  flex: 1;
  overflow: auto;
  position: relative;
  padding: 1rem;
  background-color: #eee;
}

.image-container {
  position: relative;
  margin: 0 auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.manuscript-image {
  display: block;
}

.points-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.point {
  position: absolute;
  width: 6px;
  height: 6px;
  margin-left: -3px;
  margin-top: -3px;
  background-color: rgba(255, 0, 0, 0.7);
  border-radius: 50%;
}

.graph-overlay {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #6c757d;
}

.error-message {
  margin: 1rem;
  padding: 1rem;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 0.25rem;
}

button {
  padding: 0.375rem 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

button:hover {
  background-color: #0069d9;
}

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
</style>