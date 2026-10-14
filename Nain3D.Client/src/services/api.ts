import type {
  EvaluationResult,
  ProfileDefinition,
  SampleAsset,
} from '../types/contracts';

const BASE_URL = '';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail?: string
  ) {
    super(detail || `API error ${status}`);
    this.name = 'ApiError';
  }
}

export const api = {
  async listProfiles(): Promise<ProfileDefinition[]> {
    const res = await fetch(`${BASE_URL}/api/v1/conformance/profiles`);
    if (!res.ok) {
      throw new ApiError(res.status, await res.text());
    }
    return res.json();
  },

  async listSamples(): Promise<SampleAsset[]> {
    const res = await fetch(`${BASE_URL}/api/v1/conformance/samples`);
    if (!res.ok) {
      throw new ApiError(res.status, await res.text());
    }
    return res.json();
  },

  getSampleDownloadUrl(sampleId: string): string {
    return `${BASE_URL}/api/v1/conformance/samples/${sampleId}/download`;
  },

  async evaluateFile(file: File, overrideProfile?: string): Promise<EvaluationResult> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    if (overrideProfile) {
      formData.append('override_profile', overrideProfile);
    }

    const res = await fetch(`${BASE_URL}/api/v1/conformance/evaluate`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      let detail = 'Error evaluating 3D model';
      try {
        const errJson = await res.json();
        detail = errJson.detail || detail;
      } catch {
        detail = await res.text();
      }
      throw new ApiError(res.status, detail);
    }

    return res.json();
  },

  async evaluateSample(sampleId: string, overrideProfile?: string): Promise<{ result: EvaluationResult; blobUrl: string }> {
    const downloadRes = await fetch(this.getSampleDownloadUrl(sampleId));
    if (!downloadRes.ok) {
      throw new ApiError(downloadRes.status, 'Could not retrieve sample 3D model');
    }

    const blob = await downloadRes.blob();
    const file = new File([blob], `${sampleId}.glb`, { type: 'model/gltf-binary' });
    const blobUrl = URL.createObjectURL(blob);

    const result = await this.evaluateFile(file, overrideProfile);
    return { result, blobUrl };
  },

  async checkHealth(): Promise<{ status: string; engine?: string }> {
    const res = await fetch(`${BASE_URL}/health/ready`);
    if (!res.ok) {
      return { status: 'Unhealthy' };
    }
    return res.json();
  },
};
