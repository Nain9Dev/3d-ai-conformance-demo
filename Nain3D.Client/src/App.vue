<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api, ApiError } from './services/api';
import type {
  EvaluationResult,
  ProfileDefinition,
  SampleAsset,
} from './types/contracts';

import HeaderNav from './components/HeaderNav.vue';
import AssetViewer from './components/AssetViewer.vue';
import AiProposalCard from './components/AiProposalCard.vue';
import ContractVerdictCard from './components/ContractVerdictCard.vue';
import SamplesDrawer from './components/SamplesDrawer.vue';

const isHealthy = ref(false);
const isEvaluating = ref(false);
const errorMessage = ref<string | null>(null);

const activeModelSrc = ref<string | null>(null);
const activeFileName = ref<string | null>(null);
const activeFileSizeBytes = ref<number | null>(null);

const evaluation = ref<EvaluationResult | null>(null);
const profiles = ref<ProfileDefinition[]>([]);
const samples = ref<SampleAsset[]>([]);
const isSamplesModalOpen = ref(false);
const selectedProfileOverride = ref<string | null>(null);

// Stored current file to allow re-evaluating with profile overrides
let currentUploadedFile: File | null = null;

async function checkServerHealth() {
  try {
    const res = await api.checkHealth();
    isHealthy.value = res.status === 'Healthy';
  } catch {
    isHealthy.value = false;
  }
}

async function loadInitialMetadata() {
  try {
    const [pList, sList] = await Promise.all([
      api.listProfiles(),
      api.listSamples(),
    ]);
    profiles.value = pList;
    samples.value = sList;

    // Automatically load the first synthetic sample to show a live 3D asset on startup
    if (sList.length > 0) {
      await handleSelectSample(sList[0].id);
    }
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : String(err);
  }
}

async function handleFileSelected(file: File) {
  currentUploadedFile = file;
  activeFileName.value = file.name;
  activeFileSizeBytes.value = file.size;
  errorMessage.value = null;

  // Create local object URL for model-viewer to display instantly
  if (activeModelSrc.value && activeModelSrc.value.startsWith('blob:')) {
    URL.revokeObjectURL(activeModelSrc.value);
  }
  activeModelSrc.value = URL.createObjectURL(file);

  await executeEvaluation(file, selectedProfileOverride.value || undefined);
}

async function handleSelectSample(sampleId: string) {
  isSamplesModalOpen.value = false;
  isEvaluating.value = true;
  errorMessage.value = null;

  try {
    const { result, blobUrl } = await api.evaluateSample(
      sampleId,
      selectedProfileOverride.value || undefined
    );

    if (activeModelSrc.value && activeModelSrc.value.startsWith('blob:')) {
      URL.revokeObjectURL(activeModelSrc.value);
    }

    activeModelSrc.value = blobUrl;
    activeFileName.value = `${sampleId}.glb`;
    activeFileSizeBytes.value = result.asset_size_bytes;
    evaluation.value = result;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      errorMessage.value = err.detail || err.message;
    } else {
      errorMessage.value = String(err);
    }
  } finally {
    isEvaluating.value = false;
  }
}

async function executeEvaluation(file: File, overrideProfile?: string) {
  isEvaluating.value = true;
  errorMessage.value = null;

  try {
    const result = await api.evaluateFile(file, overrideProfile);
    evaluation.value = result;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      errorMessage.value = err.detail || err.message;
    } else {
      errorMessage.value = String(err);
    }
  } finally {
    isEvaluating.value = false;
  }
}

async function handleProfileChanged(profileName: string) {
  selectedProfileOverride.value = profileName;
  if (currentUploadedFile) {
    await executeEvaluation(currentUploadedFile, profileName);
  }
}

onMounted(() => {
  checkServerHealth();
  loadInitialMetadata();
});
</script>

<template>
  <div class="app-layout">
    <div class="content-container">
      <HeaderNav
        :is-healthy="isHealthy"
        @open-samples="isSamplesModalOpen = true"
      />

      <!-- Error feedback banner if any -->
      <div v-if="errorMessage" class="glass-panel error-banner">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Main Showcase Grid -->
      <main class="showcase-grid">
        <!-- Left: 3D Viewport Column -->
        <div class="viewport-column">
          <AssetViewer
            :model-src="activeModelSrc"
            :file-name="activeFileName"
            :file-size-bytes="activeFileSizeBytes"
            :is-evaluating="isEvaluating"
            @file-selected="handleFileSelected"
          />
        </div>

        <!-- Right: Verification Dual-Contract Column -->
        <div class="dual-contract-column">
          <AiProposalCard
            :proposal="evaluation?.ai_proposal || null"
            :features="evaluation?.features || null"
          />

          <ContractVerdictCard
            :evaluation="evaluation"
            :profiles="profiles"
            :selected-profile-id="selectedProfileOverride"
            @change-profile="handleProfileChanged"
          />
        </div>
      </main>

      <!-- Footer -->
      <footer class="app-footer glass-panel">
        <div class="footer-left">
          <span class="footer-brand font-heading">Nain3D Gateway</span>
          <span class="footer-sep">·</span>
          <span class="footer-meta">Deterministic 3D Conformance Engine</span>
          <span class="footer-sep">·</span>
          <span class="footer-meta">FastAPI + Pydantic v2 + Trimesh</span>
        </div>
        <div class="footer-right">
          <a href="http://localhost:8104/docs" target="_blank" rel="noopener noreferrer" class="footer-link">Scalar OpenApi</a>
          <span class="footer-sep">·</span>
          <a href="https://github.com/Nain9Dev/3d-ai-conformance-demo" target="_blank" rel="noopener noreferrer" class="footer-link">GitHub Repository</a>
          <span class="footer-sep">·</span>
          <a href="https://naindev.com" target="_blank" rel="noopener noreferrer" class="footer-link highlight">naindev.com</a>
        </div>
      </footer>
    </div>

    <!-- Samples Modal -->
    <SamplesDrawer
      :is-open="isSamplesModalOpen"
      :samples="samples"
      :is-loading="isEvaluating"
      @close="isSamplesModalOpen = false"
      @select-sample="handleSelectSample"
    />
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  padding: 1.5rem 1rem 3rem 1rem;
  display: flex;
  justify-content: center;
}

.content-container {
  width: 100%;
  max-width: 1240px;
  display: flex;
  flex-direction: column;
}

.error-banner {
  margin-bottom: 1.5rem;
  padding: 1rem 1.25rem;
  background: rgba(244, 63, 94, 0.12);
  border-left: 4px solid var(--accent-rose);
  color: #fb7185;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
}

.showcase-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.viewport-column {
  display: flex;
  flex-direction: column;
}

.dual-contract-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.app-footer {
  padding: 1.25rem 1.75rem;
  border-radius: var(--radius-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.82rem;
  color: var(--text-dim);
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.footer-brand {
  color: var(--text-main);
  font-weight: 700;
}

.footer-sep {
  color: rgba(255, 255, 255, 0.15);
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.footer-link {
  color: var(--text-muted);
  transition: color 0.2s;
}

.footer-link:hover {
  color: var(--text-main);
}

.footer-link.highlight {
  color: #38bdf8;
  font-weight: 600;
}

@media (max-width: 1024px) {
  .showcase-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .app-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
