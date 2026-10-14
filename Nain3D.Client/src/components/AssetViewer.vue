<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  modelSrc: string | null;
  fileName: string | null;
  fileSizeBytes: number | null;
  isEvaluating: boolean;
}>();

const emit = defineEmits<{
  (e: 'fileSelected', file: File): void;
}>();

const isDragging = ref(false);
const autoRotate = ref(true);

function onDragOver(e: DragEvent) {
  e.preventDefault();
  isDragging.value = true;
}

function onDragLeave() {
  isDragging.value = false;
}

function onDrop(e: DragEvent) {
  e.preventDefault();
  isDragging.value = false;
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    const file = e.dataTransfer.files[0];
    if (file.name.toLowerCase().endsWith('.glb') || file.name.toLowerCase().endsWith('.gltf')) {
      emit('fileSelected', file);
    }
  }
}

function onFileInputChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    emit('fileSelected', target.files[0]);
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
</script>

<template>
  <div
    class="viewer-wrapper glass-panel"
    :class="{ dragging: isDragging }"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <!-- Top toolbar inside viewer -->
    <div class="viewer-toolbar">
      <div class="asset-info">
        <span class="toolbar-label">Active 3D Model:</span>
        <span class="toolbar-filename font-mono">{{ fileName || 'No asset loaded' }}</span>
        <span v-if="fileSizeBytes" class="badge badge-slate font-mono">{{ formatBytes(fileSizeBytes) }}</span>
      </div>

      <div class="toolbar-actions">
        <label v-if="modelSrc" class="control-toggle">
          <input v-model="autoRotate" type="checkbox" />
          <span>Auto-Rotate</span>
        </label>

        <label class="btn btn-secondary upload-btn">
          <input type="file" accept=".glb,.gltf" class="hidden-input" @change="onFileInputChange" />
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <span>Upload .GLB</span>
        </label>
      </div>
    </div>

    <!-- Active 3D canvas -->
    <div class="canvas-container">
      <model-viewer
        v-if="modelSrc"
        :src="modelSrc"
        camera-controls
        :auto-rotate="autoRotate ? '' : null"
        rotation-per-second="20deg"
        shadow-intensity="1.5"
        shadow-softness="0.8"
        exposure="1"
        camera-orbit="45deg 75deg 105%"
        interaction-prompt="auto"
        class="interactive-canvas"
      >
        <div slot="progress-bar" class="progress-bar-slot">
          <div class="progress-bar-inner"></div>
        </div>
      </model-viewer>

      <!-- Empty Dropzone State -->
      <div v-else class="empty-dropzone">
        <div class="dropzone-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        </div>
        <h3>Interactive 3D Viewport</h3>
        <p class="dropzone-text">
          Drag & drop any binary <strong>.glb</strong> asset here to inspect, or click below to upload.
        </p>
        <p class="dropzone-sub">
          Or load a bundled synthetic benchmark model using the <em>Demo 3D Samples</em> button above.
        </p>
      </div>

      <!-- Loading Overlay -->
      <div v-if="isEvaluating" class="evaluating-overlay">
        <div class="spinner"></div>
        <span>Evaluating 3D Geometric Contracts & AI Proposal...</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.viewer-wrapper {
  display: flex;
  flex-direction: column;
  height: 580px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
  transition: all 0.2s ease;
}

.viewer-wrapper.dragging {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 30px rgba(14, 165, 233, 0.4);
}

.viewer-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(10, 15, 30, 0.6);
  flex-wrap: wrap;
  gap: 0.75rem;
}

.asset-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toolbar-label {
  font-size: 0.8rem;
  color: var(--text-dim);
}

.toolbar-filename {
  font-size: 0.88rem;
  color: var(--text-main);
  font-weight: 600;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.control-toggle {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  cursor: pointer;
}

.upload-btn {
  padding: 0.45rem 0.85rem;
  font-size: 0.8rem;
  cursor: pointer;
}

.hidden-input {
  display: none;
}

.canvas-container {
  flex: 1;
  position: relative;
  background: radial-gradient(circle at 50% 50%, rgba(20, 30, 55, 0.5) 0%, rgba(6, 8, 17, 0.95) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.interactive-canvas {
  width: 100%;
  height: 100%;
  background-color: transparent;
  --poster-color: transparent;
}

.empty-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  max-width: 480px;
}

.dropzone-icon {
  color: var(--accent-cyan);
  margin-bottom: 1rem;
  opacity: 0.8;
}

.empty-dropzone h3 {
  font-family: var(--font-heading);
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.dropzone-text {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

.dropzone-sub {
  font-size: 0.8rem;
  color: var(--text-dim);
}

.evaluating-overlay {
  position: absolute;
  inset: 0;
  background: rgba(6, 8, 17, 0.75);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 0.9rem;
  color: #7dd3fc;
  z-index: 10;
}
</style>
