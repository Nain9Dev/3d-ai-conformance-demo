<script setup lang="ts">
import type { AiProposal, GeometricFeatures } from '../types/contracts';

defineProps<{
  proposal: AiProposal | null;
  features: GeometricFeatures | null;
}>();
</script>

<template>
  <div class="glass-panel proposal-card">
    <div class="card-header">
      <div class="title-wrap">
        <div class="icon-bubble">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5V11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-1.5C5.8 8.8 5 7.5 5 6a4 4 0 0 1 7-4z"></path>
            <path d="M9 18h6"></path>
            <path d="M10 22h4"></path>
          </svg>
        </div>
        <div>
          <h3>La IA Propone</h3>
          <span class="sub-label">Probabilistic Classification Layer</span>
        </div>
      </div>

      <span v-if="proposal" class="badge badge-purple">{{ proposal.source }}</span>
    </div>

    <!-- Empty state -->
    <div v-if="!proposal || !features" class="empty-state">
      <p>Load or upload a 3D asset to generate an AI proposal.</p>
    </div>

    <!-- Filled state -->
    <div v-else class="card-body">
      <div class="prediction-banner">
        <div class="pred-label">Proposed Category</div>
        <div class="pred-category gradient-purple">{{ proposal.predicted_category }}</div>
      </div>

      <!-- Confidence Gauge -->
      <div class="confidence-section">
        <div class="gauge-header">
          <span>Inference Confidence</span>
          <span class="font-mono font-bold">{{ (proposal.confidence * 100).toFixed(1) }}%</span>
        </div>
        <div class="gauge-track">
          <div
            class="gauge-fill"
            :style="{ width: `${proposal.confidence * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Reasoning text -->
      <div v-if="proposal.reasoning" class="reasoning-box">
        <span class="reason-title">Inference Reasoning:</span>
        <p class="reason-text">{{ proposal.reasoning }}</p>
      </div>

      <!-- Extracted Feature Vector -->
      <div class="features-summary">
        <h4>Extracted Geometric Features</h4>
        <div class="features-grid">
          <div class="feat-item">
            <span class="feat-k">Triangles</span>
            <span class="feat-v font-mono">{{ features.triangle_count.toLocaleString() }}</span>
          </div>
          <div class="feat-item">
            <span class="feat-k">Vertices</span>
            <span class="feat-v font-mono">{{ features.vertex_count.toLocaleString() }}</span>
          </div>
          <div class="feat-item">
            <span class="feat-k">Max Extent</span>
            <span class="feat-v font-mono">{{ features.max_dimension_m }} m</span>
          </div>
          <div class="feat-item">
            <span class="feat-k">Watertight</span>
            <span :class="['feat-v', features.is_watertight ? 'text-emerald' : 'text-amber']">
              {{ features.is_watertight ? 'Closed Solid' : 'Open Mesh' }}
            </span>
          </div>
          <div class="feat-item full-width">
            <span class="feat-k">Dimensions [X, Y, Z]</span>
            <span class="feat-v font-mono">{{ features.extents.join(' x ') }} m</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.proposal-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  border-top: 3px solid var(--accent-purple);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon-bubble {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: rgba(168, 85, 247, 0.2);
  color: #c084fc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-wrap h3 {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  line-height: 1.2;
}

.sub-label {
  font-size: 0.78rem;
  color: var(--text-dim);
}

.empty-state {
  padding: 2.5rem 1rem;
  text-align: center;
  color: var(--text-dim);
  font-size: 0.88rem;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.prediction-banner {
  background: rgba(168, 85, 247, 0.08);
  border: 1px solid rgba(168, 85, 247, 0.25);
  border-radius: var(--radius-md);
  padding: 1rem 1.25rem;
}

.pred-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-dim);
  margin-bottom: 0.25rem;
}

.pred-category {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 700;
}

.gradient-purple {
  background: linear-gradient(135deg, #ffffff 40%, #c084fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.confidence-section {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.gauge-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  color: var(--text-muted);
}

.gauge-track {
  height: 8px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.gauge-fill {
  height: 100%;
  border-radius: var(--radius-full);
  background: linear-gradient(90deg, #a855f7 0%, #38bdf8 100%);
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.reasoning-box {
  padding: 0.85rem 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
}

.reason-title {
  color: var(--text-dim);
  text-transform: uppercase;
  font-size: 0.72rem;
  display: block;
  margin-bottom: 0.25rem;
}

.reason-text {
  color: var(--text-main);
  line-height: 1.45;
}

.features-summary h4 {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-dim);
  margin-bottom: 0.75rem;
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
}

.feat-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.6rem 0.75rem;
  background: rgba(0, 0, 0, 0.25);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.feat-item.full-width {
  grid-column: 1 / -1;
}

.feat-k {
  font-size: 0.72rem;
  color: var(--text-dim);
}

.feat-v {
  font-size: 0.85rem;
  color: var(--text-main);
  font-weight: 600;
}

.text-emerald {
  color: var(--accent-emerald);
}

.text-amber {
  color: var(--accent-amber);
}

.font-bold {
  font-weight: 700;
}
</style>
