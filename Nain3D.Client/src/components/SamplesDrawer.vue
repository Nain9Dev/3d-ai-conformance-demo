<script setup lang="ts">
import type { SampleAsset } from '../types/contracts';

defineProps<{
  isOpen: boolean;
  samples: SampleAsset[];
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'selectSample', sampleId: string): void;
}>();
</script>

<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="emit('close')">
    <div class="glass-panel modal-card">
      <div class="modal-header">
        <div>
          <h3>Synthetic Benchmark 3D Models</h3>
          <p class="modal-subtitle">Instant evaluation with zero external dependencies</p>
        </div>
        <button type="button" class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <div class="samples-grid">
          <div
            v-for="sample in samples"
            :key="sample.id"
            class="sample-card"
            @click="emit('selectSample', sample.id)"
          >
            <div class="sample-top">
              <span class="sample-name font-heading">{{ sample.name }}</span>
              <span
                :class="[
                  'badge',
                  sample.expected_verdict === 'CONFORMANT' ? 'badge-emerald' : 'badge-rose'
                ]"
              >
                {{ sample.expected_verdict }}
              </span>
            </div>

            <div class="sample-cat">
              <strong>Expected Category:</strong> {{ sample.category }}
            </div>

            <p class="sample-desc">{{ sample.description }}</p>

            <button
              type="button"
              class="btn btn-secondary load-sample-btn"
              :disabled="isLoading"
            >
              Load & Evaluate
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(4, 7, 14, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-card {
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  padding: 1.75rem;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 15, 28, 0.98) 100%);
  border: 1px solid var(--border-highlight);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.modal-header h3 {
  font-family: var(--font-heading);
  font-size: 1.3rem;
  font-weight: 700;
}

.modal-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
}

.close-btn {
  font-size: 1.25rem;
  color: var(--text-dim);
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--text-main);
}

.modal-body {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.samples-grid {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.sample-card {
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sample-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(14, 165, 233, 0.4);
}

.sample-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sample-name {
  font-weight: 700;
  font-size: 1rem;
}

.sample-cat {
  font-size: 0.82rem;
  color: var(--text-muted);
}

.sample-desc {
  font-size: 0.8rem;
  color: var(--text-dim);
  line-height: 1.4;
}

.load-sample-btn {
  align-self: flex-start;
  padding: 0.35rem 0.75rem;
  font-size: 0.78rem;
  margin-top: 0.25rem;
}
</style>
