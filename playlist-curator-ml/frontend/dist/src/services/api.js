const API_BASE = '/api';

async function handleResponse(response) {
  if (!response.ok) {
    let errorMsg = `Server error (${response.status})`;
    try {
      const errData = await response.json();
      if (errData.detail) {
        errorMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch (e) {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }
  return await response.json();
}

export const api = {
  // Config & Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  async getConfig() {
    const res = await fetch(`${API_BASE}/config`);
    return handleResponse(res);
  },

  // Dataset APIs
  async uploadDataset(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/dataset/upload`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async getDatasetSummary(targetCol = 'playlist') {
    const res = await fetch(`${API_BASE}/dataset/summary?target_col=${targetCol}`);
    return handleResponse(res);
  },

  async getDatasetPreview(page = 1, pageSize = 20, search = '') {
    const res = await fetch(`${API_BASE}/dataset/preview?page=${page}&page_size=${pageSize}&search=${encodeURIComponent(search)}`);
    return handleResponse(res);
  },

  // EDA APIs
  async getPlaylistDistribution() {
    const res = await fetch(`${API_BASE}/eda/playlist-distribution`);
    return handleResponse(res);
  },

  async getCorrelationMatrix() {
    const res = await fetch(`${API_BASE}/eda/correlation`);
    return handleResponse(res);
  },

  async getPcaData(maxSamples = 600) {
    const res = await fetch(`${API_BASE}/eda/pca?max_samples=${maxSamples}`);
    return handleResponse(res);
  },

  async getScatterData(featureX = 'valence', featureY = 'energy', sampleSize = 500) {
    const res = await fetch(`${API_BASE}/eda/scatter?feature_x=${featureX}&feature_y=${featureY}&sample_size=${sampleSize}`);
    return handleResponse(res);
  },

  async getFeatureDistributions(feature = 'danceability') {
    const res = await fetch(`${API_BASE}/eda/feature-distributions?feature=${feature}`);
    return handleResponse(res);
  },

  async getFeatureStats() {
    const res = await fetch(`${API_BASE}/eda/feature-stats`);
    return handleResponse(res);
  },

  // Model Training & Comparison APIs
  async trainModels(payload) {
    const res = await fetch(`${API_BASE}/models/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getModelsList() {
    const res = await fetch(`${API_BASE}/models`);
    return handleResponse(res);
  },

  async getModelComparison() {
    const res = await fetch(`${API_BASE}/models/comparison`);
    return handleResponse(res);
  },

  async getModelMetrics(modelName) {
    const res = await fetch(`${API_BASE}/models/${encodeURIComponent(modelName)}/metrics`);
    return handleResponse(res);
  },

  // Predict & Recommend APIs
  async predictPlaylist(payload) {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getRecommendations(payload) {
    const res = await fetch(`${API_BASE}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Insights API
  async getModelInsights() {
    const res = await fetch(`${API_BASE}/model/insights`);
    return handleResponse(res);
  }
};
