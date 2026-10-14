<script setup lang="ts">
defineProps<{
  isHealthy: boolean;
}>();

const emit = defineEmits<{
  (e: 'openSamples'): void;
}>();
</script>

<template>
  <header class="header glass-panel">
    <div class="top-row">
      <div class="brand-section">
        <div class="logo-box">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        </div>
        <div>
          <div class="brand-title-wrap">
            <h1 class="gradient-title">Nain3D Gateway</h1>
            <span class="badge badge-purple">AI Inference</span>
            <span class="badge badge-cyan">Deterministic Contract</span>
          </div>
          <p class="tagline">
            Automated 3D Asset Validation Engine · <em>"La IA propone, el contrato dispone"</em>
          </p>
        </div>
      </div>

      <div class="actions-section">
        <button
          type="button"
          class="btn btn-secondary samples-btn"
          @click="emit('openSamples')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
          <span>Demo 3D Samples</span>
        </button>

        <div class="status-indicator">
          <span :class="['status-dot', isHealthy ? 'healthy' : 'unhealthy']"></span>
          <span class="status-text">{{ isHealthy ? 'API Online' : 'Connecting...' }}</span>
        </div>

        <a
          href="http://localhost:8104/docs"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-secondary nav-link-btn"
        >
          Scalar Docs
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>

        <a
          href="https://naindev.com"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-primary portfolio-btn"
        >
          naindev.com
        </a>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  margin-bottom: 2rem;
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.75rem;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(10, 15, 30, 0.78) 100%);
  border: 1px solid var(--border-subtle);
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-box {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(14, 165, 233, 0.25) 100%);
  border: 1px solid rgba(168, 85, 247, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.25);
}

.logo-icon {
  width: 26px;
  height: 26px;
  color: #c084fc;
}

.brand-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.brand-title-wrap h1 {
  font-size: 1.6rem;
  margin: 0;
  line-height: 1.2;
}

.tagline {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.tagline em {
  color: #7dd3fc;
  font-style: normal;
}

.actions-section {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.04);
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-subtle);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.healthy {
  background: var(--accent-emerald);
  box-shadow: 0 0 8px var(--accent-emerald);
}

.status-dot.unhealthy {
  background: var(--accent-rose);
  box-shadow: 0 0 8px var(--accent-rose);
}

@media (max-width: 768px) {
  .top-row {
    flex-direction: column;
    align-items: flex-start;
  }
  .actions-section {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
