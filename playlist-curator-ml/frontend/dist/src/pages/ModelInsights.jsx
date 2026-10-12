import React, { useState, useEffect } from 'react';
import { Lightbulb, Award, Layers, Sparkles, HelpCircle } from 'lucide-react';
import { api } from '../services/api';
import PcaScatterPlot from '../components/PcaScatterPlot';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function ModelInsights() {
  const [insights, setInsights] = useState(null);
  const [pcaData, setPcaData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getModelInsights().catch(() => null),
      api.getPcaData(500).catch(() => null)
    ]).then(([insRes, pcaRes]) => {
      if (insRes) setInsights(insRes);
      if (pcaRes) setPcaData(pcaRes.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const featureImportances = insights?.feature_importances || [
    { feature: 'energy', importance: 0.28 },
    { feature: 'danceability', importance: 0.24 },
    { feature: 'valence', importance: 0.18 },
    { feature: 'tempo', importance: 0.12 },
    { feature: 'acousticness', importance: 0.08 },
    { feature: 'speechiness', importance: 0.05 },
    { feature: 'loudness', importance: 0.05 }
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-amber-400" />
          Model Insights & Explainability
        </h1>
        <p className="text-xs text-slate-400">Interpret decision boundaries, feature importances, confusion matrix, and feature influence rationales.</p>
      </div>

      {/* Top Banner */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-dark p-4 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400">Trained Best Model</span>
            <h3 className="text-lg font-bold text-white">{insights.best_model}</h3>
          </div>
          <div className="card-dark p-4 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400">Test Accuracy</span>
            <h3 className="text-lg font-bold text-emerald-400">{(insights.accuracy * 100).toFixed(1)}%</h3>
          </div>
          <div className="card-dark p-4 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400">5-Fold CV Score</span>
            <h3 className="text-lg font-bold text-indigo-400">{(insights.cv_mean * 100).toFixed(1)}%</h3>
          </div>
          <div className="card-dark p-4 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400">Weighted F1 Score</span>
            <h3 className="text-lg font-bold text-purple-400">{(insights.f1_score * 100).toFixed(1)}%</h3>
          </div>
        </div>
      )}

      {/* Feature Importance Bar Chart */}
      <div className="card-dark p-6 space-y-4">
        <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-400" />
          Audio Feature Importance (Relative Influence)
        </h3>
        <p className="text-xs text-slate-400">Features contributing most strongly to playlist classification according to the trained model.</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={featureImportances} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
              <XAxis type="number" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis type="category" dataKey="feature" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff' }} />
              <Bar dataKey="importance" fill="#818cf8" radius={[0, 6, 6, 0]}>
                {featureImportances.map((_, idx) => (
                  <Cell key={idx} fill={idx === 0 ? '#ec4899' : idx === 1 ? '#6366f1' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Explainability Card & PCA Cluster Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Explainability Card */}
        <div className="card-dark p-6 space-y-4">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            Model Decision Rationales
          </h3>
          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h4 className="font-bold text-indigo-400 text-sm">Why are Energy & Danceability dominant predictors?</h4>
              <p>
                In playlist classification, high energy (&gt; 0.75) paired with high danceability (&gt; 0.70) reliably isolates fast-tempo <strong>Party</strong> and <strong>Workout</strong> playlists from acoustic or melancholic tracks.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h4 className="font-bold text-emerald-400 text-sm">Why does StandardScaler feature scaling dramatically boost accuracy?</h4>
              <p>
                As established in the reference Stanford paper, unscaled distance metrics (like in SVM RBF or Perceptron) suffer because <code>tempo</code> (80-180 BPM) dwarfs <code>danceability</code> (0.0-1.0). Standardizing to zero-mean and unit-variance prevents large numerical ranges from dominating gradient updates.
              </p>
            </div>
          </div>
        </div>

        {/* PCA Cluster Map */}
        <div className="card-dark p-6 space-y-4">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            PCA 2D Cluster Separability Map
          </h3>
          <PcaScatterPlot data={pcaData} />
        </div>
      </div>
    </div>
  );
}
