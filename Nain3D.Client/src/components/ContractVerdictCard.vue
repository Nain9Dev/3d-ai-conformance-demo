<script setup lang="ts">
import type { EvaluationResult, ProfileDefinition } from '../types/contracts';

defineProps<{
  evaluation: EvaluationResult | null;
  profiles: ProfileDefinition[];
  selectedProfileId: string | null;
}>();

const emit = defineEmits<{
  (e: 'changeProfile', profileId: string): void;
}>();
</script>

<template>
  <div class="glass-panel contract-card">
    <div class="card-header">
      <div class="title-wrap">
        <div class="icon-bubble">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path d="m9 12 2 2 4-4"></path>
          </svg>
        </div>
        <div>
          <h3>El Contrato Dispone</h3>
          <span class="sub-label">Deterministic Engineering Law & Gate</span>
        </div>
      </div>

      <!-- Profile Selector -->
      <div v-if="profiles.length > 0" class="profile-select-wrap">
        <label for="profile-select">Enforced Contract:</label>
        <select
          id="profile-select"
          :value="selectedProfileId || evaluation?.applied_profile.name || ''"
          class="profile-dropdown"
          @change="emit('changeProfile', ($event.target as HTMLSelectElement).value)"
        >
          <option
            v-for="p in profiles"
            :key="p.id"
            :value="p.name"
          >
            {{ p.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!evaluation" class="empty-state">
      <p>Awaiting 3D asset inspection to execute contract validation.</p>
    </div>

    <!-- Filled state -->
    <div v-else class="card-body">
      <!-- Authoritative Verdict Banner -->
      <div
        :class="[
          'verdict-banner',
          evaluation.verdict === 'CONFORMANT'
            ? 'banner-conformant'
            : evaluation.verdict === 'NON_CONFORMANT'
            ? 'banner-non-conformant'
            : 'banner-findings'
        ]"
      >
        <div class="verdict-icon">
          <svg v-if="evaluation.verdict === 'CONFORMANT'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="9 12 11 14 15 10"></polyline>
          </svg>
          <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <div class="verdict-text-wrap">
          <span class="verdict-title">
            {{
              evaluation.verdict === 'CONFORMANT'
                ? 'VEREDICTO: ACTIVO CONFORME'
                : 'VEREDICTO: ACTIVO RECHAZADO'
            }}
          </span>
          <span class="verdict-sub">
            {{
              evaluation.verdict === 'CONFORMANT'
                ? 'El activo cumple estrictamente todos los límites matemáticos del contrato.'
                : 'La IA propuso la categoría, pero el contrato técnico vetó el activo.'
            }}
          </span>
        </div>
      </div>

      <!-- Rules Evaluation List -->
      <div class="rules-section">
        <h4>Contract Checks Breakdown</h4>
        <div class="checks-list">
          <div
            v-for="check in evaluation.checks"
            :key="check.name"
            :class="['check-item', check.passed ? 'check-pass' : 'check-fail']"
          >
            <div class="check-top">
              <div class="check-title">
                <span class="status-symbol">{{ check.passed ? '✓' : '✕' }}</span>
                <strong>{{ check.label }}</strong>
              </div>
              <span
                :class="[
                  'badge',
                  check.passed ? 'badge-emerald' : 'badge-rose'
                ]"
              >
                {{ check.passed ? 'PASS' : 'FAIL' }}
              </span>
            </div>

            <div class="check-details">
              <div class="metric-pair">
                <span class="k">Evaluated:</span>
                <span class="v font-mono">{{ check.value }}</span>
              </div>
              <div class="metric-pair">
                <span class="k">Contract Limit:</span>
                <span class="v font-mono">{{ check.limit }}</span>
              </div>
            </div>

            <p class="check-msg">{{ check.message }}</p>
          </div>
        </div>
      </div>

      <!-- Audit Metadata Footer -->
      <div class="audit-metadata">
        <div class="meta-row">
          <span class="meta-k">Asset SHA-256:</span>
          <span class="meta-v font-mono text-dim">{{ evaluation.asset_sha256 }}</span>
        </div>
        <div class="meta-row">
          <span class="meta-k">Evaluation Latency:</span>
          <span class="meta-v font-mono text-cyan">{{ evaluation.evaluation_duration_ms }} ms</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contract-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  border-top: 3px solid var(--accent-cyan);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-wrap: wrap;
  gap: 0.75rem;
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
  background: rgba(14, 165, 233, 0.2);
  color: #38bdf8;
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

.profile-select-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.profile-dropdown {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--border-subtle);
  color: var(--text-main);
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  font-family: inherit;
}

.profile-dropdown:focus {
  border-color: var(--accent-cyan);
  outline: none;
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

.verdict-banner {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
}

.banner-conformant {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.35);
  box-shadow: 0 0 25px rgba(16, 185, 129, 0.15);
}

.banner-conformant .verdict-icon {
  color: #34d399;
}

.banner-non-conformant {
  background: rgba(244, 63, 94, 0.12);
  border-color: rgba(244, 63, 94, 0.35);
  box-shadow: 0 0 25px rgba(244, 63, 94, 0.15);
}

.banner-non-conformant .verdict-icon {
  color: #fb7185;
}

.verdict-text-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.verdict-title {
  font-family: var(--font-heading);
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.banner-conformant .verdict-title {
  color: #6ee7b7;
}

.banner-non-conformant .verdict-title {
  color: #fda4af;
}

.verdict-sub {
  font-size: 0.82rem;
  color: var(--text-muted);
}

.rules-section h4 {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-dim);
  margin-bottom: 0.75rem;
}

.checks-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.check-item {
  padding: 0.85rem 1rem;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.check-item.check-pass {
  border-left: 3px solid var(--accent-emerald);
}

.check-item.check-fail {
  border-left: 3px solid var(--accent-rose);
  background: rgba(244, 63, 94, 0.04);
}

.check-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.check-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.88rem;
}

.status-symbol {
  font-weight: 800;
  font-size: 0.95rem;
}

.check-pass .status-symbol {
  color: var(--accent-emerald);
}

.check-fail .status-symbol {
  color: var(--accent-rose);
}

.check-details {
  display: flex;
  gap: 1.5rem;
  font-size: 0.82rem;
}

.metric-pair {
  display: flex;
  gap: 0.35rem;
}

.metric-pair .k {
  color: var(--text-dim);
}

.metric-pair .v {
  color: var(--text-main);
  font-weight: 600;
}

.check-msg {
  font-size: 0.78rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.audit-metadata {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.78rem;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.meta-k {
  color: var(--text-dim);
}

.meta-v {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-cyan {
  color: #38bdf8;
  font-weight: 600;
}
</style>
