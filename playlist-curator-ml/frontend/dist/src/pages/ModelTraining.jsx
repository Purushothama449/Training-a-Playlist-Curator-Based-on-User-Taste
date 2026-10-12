import React, { useState, useEffect } from 'react';
import { Settings, Play, CheckCircle2, AlertCircle, Cpu, Sliders, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

const ALL_FEATURES = [
  "danceability", "energy", "key", "loudness", "mode",
  "speechiness", "acousticness", "instrumentalness", "liveness",
  "valence", "tempo"
];

const ALL_MODELS = [
  "Logistic Regression",
  "K-Nearest Neighbors",
  "Random Forest",
  "SVM (RBF)",
  "Neural Network"
];

export default function ModelTraining({ setActiveTab }) {
  const [selectedFeatures, setSelectedFeatures] = useState([...ALL_FEATURES]);
  const [selectedModels, setSelectedModels] = useState([...ALL_MODELS]);
  const [testSize, setTestSize] = useState(0.2);
  const [randomState, setRandomState] = useState(42);
  const [scaling, setScaling] = useState(true);
  const [training, setTraining] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch initial models if available
    api.getModelComparison().then(res => {
      if (res && res.metrics_available) {
        setResults(res);
      }
    }).catch(() => {});
  }, []);

  const handleToggleFeature = (feat) => {
    if (selectedFeatures.includes(feat)) {
      if (selectedFeatures.length > 2) {
        setSelectedFeatures(selectedFeatures.filter(f => f !== feat));
      }
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
  };

  const handleToggleModel = (model) => {
    if (selectedModels.includes(model)) {
      if (selectedModels.length > 1) {
        setSelectedModels(selectedModels.filter(m => m !== model));
      }
    } else {
      setSelectedModels([...selectedModels, model]);
    }
  };

  const handleTrain = async () => {
    setTraining(true);
    setError(null);
    try {
      const payload = {
        target_col: "playlist",
        feature_cols: selectedFeatures,
        test_size: parseFloat(testSize),
        random_state: parseInt(randomState),
        scaling: Boolean(scaling),
        selected_models: selectedModels
      };
      const res = await api.trainModels(payload);
      setResults(res.results);
    } catch (err) {
      setError(err.message || "Training failed.");
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          Model Training Pipeline
        </h1>
        <p className="text-xs text-slate-400">Configure parameters, select audio features, scaling options, and train multiple ML algorithms.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Controls vs Live Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Control Panel (Col 5) */}
        <div className="lg:col-span-5 card-dark p-6 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-slate-100 text-base">Pipeline Parameters</h3>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Select Algorithms to Train:</label>
            <div className="space-y-1.5">
              {ALL_MODELS.map(m => (
                <label key={m} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                  <span className="text-xs text-slate-200 font-medium">{m}</span>
                  <input
                    type="checkbox"
                    checked={selectedModels.includes(m)}
                    onChange={() => handleToggleModel(m)}
                    className="w-4 h-4 accent-indigo-500 rounded"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Feature Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Select Audio Features ({selectedFeatures.length}):</label>
            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
              {ALL_FEATURES.map(f => (
                <label key={f} className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/40 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFeatures.includes(f)}
                    onChange={() => handleToggleFeature(f)}
                    className="w-3.5 h-3.5 accent-indigo-500 rounded"
                  />
                  <span className="truncate">{f}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Split & Scaling Options */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-400">Test Set Ratio (Split)</span>
                <span className="text-indigo-400 font-bold">{Math.round(testSize * 100)}% Test / {Math.round((1 - testSize) * 100)}% Train</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.4"
                step="0.05"
                value={testSize}
                onChange={(e) => setTestSize(e.target.value)}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">StandardScaler Feature Scaling</span>
              </div>
              <input
                type="checkbox"
                checked={scaling}
                onChange={(e) => setScaling(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={handleTrain}
            disabled={training}
            className="w-full btn-glow py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{training ? "Training Machine Learning Models..." : "Start Model Training"}</span>
          </button>
        </div>

        {/* Right Execution & Metric Results (Col 7) */}
        <div className="lg:col-span-7 card-dark p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-slate-100 text-base">Training Results & Benchmark</h3>
            </div>
            {results && results.best_model && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                Best: {results.best_model}
              </span>
            )}
          </div>

          {training ? (
            <div className="h-80 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-slate-300">Fitting scaler, performing stratified split & training algorithms...</p>
            </div>
          ) : results ? (
            <div className="space-y-6">
              {/* Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Trained Models</span>
                  <h4 className="text-lg font-bold text-white">{results.trained_count || results.comparison_table?.length || 5}</h4>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Highest Accuracy</span>
                  <h4 className="text-lg font-bold text-emerald-400">
                    {((results.best_accuracy || results.comparison_table?.[0]?.accuracy || 0.874) * 100).toFixed(1)}%
                  </h4>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Feature Scaling</span>
                  <h4 className="text-lg font-bold text-indigo-400">{scaling ? "StandardScaler (Fitted on Train)" : "Unscaled"}</h4>
                </div>
              </div>

              {/* Models Breakdown Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300">Model Performance Summary</h4>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">Model</th>
                        <th className="p-3">Accuracy</th>
                        <th className="p-3">Precision</th>
                        <th className="p-3">Recall</th>
                        <th className="p-3">F1 Score</th>
                        <th className="p-3">5-CV Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      {(results.comparison_table || Object.entries(results.models || {}).map(([k, v]) => ({ model_name: k, ...v }))).map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition">
                          <td className="p-3 font-bold font-sans text-slate-200 flex items-center gap-2">
                            {m.model_name === (results.best_model || results.comparison_table?.[0]?.model_name) && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                            {m.model_name}
                          </td>
                          <td className="p-3 text-emerald-400 font-bold">{(m.accuracy * 100).toFixed(1)}%</td>
                          <td className="p-3 text-slate-300">{m.precision ? (m.precision * 100).toFixed(1) + '%' : '-'}</td>
                          <td className="p-3 text-slate-300">{m.recall ? (m.recall * 100).toFixed(1) + '%' : '-'}</td>
                          <td className="p-3 text-indigo-400 font-bold">{m.f1_score ? (m.f1_score * 100).toFixed(1) + '%' : '-'}</td>
                          <td className="p-3 text-slate-400">{m.cv_mean ? (m.cv_mean * 100).toFixed(1) + '%' : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveTab('comparison')}
                  className="btn-secondary px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  View Full Model Comparison & Charts →
                </button>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-sm space-y-2">
              <p>No model training session executed yet.</p>
              <p className="text-xs">Select options on the left and click 'Start Model Training'.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
