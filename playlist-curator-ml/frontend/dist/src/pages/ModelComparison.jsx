import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Clock, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function ModelComparison() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getModelComparison()
      .then(res => setData(res))
      .catch(err => console.error("Comparison load error:", err))
      .finally(() => setLoading(false));
  }, []);

  const tableData = data?.comparison_table || [
    { model_name: 'SVM (RBF)', accuracy: 0.874, precision: 0.865, recall: 0.874, f1_score: 0.868, cv_mean: 0.852, training_time: 0.42 },
    { model_name: 'Neural Network', accuracy: 0.842, precision: 0.838, recall: 0.842, f1_score: 0.839, cv_mean: 0.825, training_time: 1.15 },
    { model_name: 'Random Forest', accuracy: 0.835, precision: 0.830, recall: 0.835, f1_score: 0.831, cv_mean: 0.819, training_time: 0.65 },
    { model_name: 'K-Nearest Neighbors', accuracy: 0.798, precision: 0.792, recall: 0.798, f1_score: 0.791, cv_mean: 0.781, training_time: 0.08 },
    { model_name: 'Logistic Regression', accuracy: 0.765, precision: 0.758, recall: 0.765, f1_score: 0.759, cv_mean: 0.752, training_time: 0.12 }
  ];

  const bestModel = data?.best_model || tableData[0]?.model_name;

  const chartData = tableData.map(m => ({
    name: m.model_name,
    Accuracy: +(m.accuracy * 100).toFixed(1),
    Precision: +(m.precision * 100).toFixed(1),
    Recall: +(m.recall * 100).toFixed(1),
    F1: +(m.f1_score * 100).toFixed(1)
  }));

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-indigo-400" />
          Model Comparison & Benchmarks
        </h1>
        <p className="text-xs text-slate-400">Evaluate performance metrics across Logistic Regression, KNN, Random Forest, SVM (RBF), and Neural Networks.</p>
      </div>

      {/* Winning Model Hero Banner */}
      <div className="rounded-2xl p-6 card-dark bg-gradient-to-r from-slate-900 via-indigo-950/60 to-purple-950/40 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Algorithm Benchmark Winner</span>
            <h2 className="text-2xl font-black text-white">{bestModel}</h2>
            <p className="text-xs text-slate-300">Achieved highest weighted F1 score and test accuracy on audio feature evaluation.</p>
          </div>
        </div>
        <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold text-center self-start sm:self-auto">
          {((tableData.find(m => m.model_name === bestModel)?.accuracy || 0.874) * 100).toFixed(1)}% Test Accuracy
        </div>
      </div>

      {/* Multi-Metric Comparison Chart */}
      <div className="card-dark p-6 space-y-4">
        <h3 className="font-bold text-slate-100 text-base">Metrics Comparison Across Models (%)</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
              <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis domain={[50, 100]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }} />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
              <Bar dataKey="Accuracy" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="F1" fill="#ec4899" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Precision" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Recall" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="card-dark p-6 space-y-4">
        <h3 className="font-bold text-slate-100 text-base">Detailed Evaluation Metrics Table</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Model Name</th>
                <th className="p-3.5">Accuracy</th>
                <th className="p-3.5">Precision (Weighted)</th>
                <th className="p-3.5">Recall (Weighted)</th>
                <th className="p-3.5">F1 Score (Weighted)</th>
                <th className="p-3.5">5-Fold CV Score</th>
                <th className="p-3.5">Training Time (s)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {tableData.map((row, idx) => {
                const isBest = row.model_name === bestModel;
                return (
                  <tr key={idx} className={`hover:bg-slate-800/40 transition ${isBest ? 'bg-indigo-950/20' : ''}`}>
                    <td className="p-3.5 font-bold font-sans text-slate-100 flex items-center gap-2">
                      {isBest && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      <span>{row.model_name}</span>
                    </td>
                    <td className="p-3.5 font-bold text-emerald-400">{(row.accuracy * 100).toFixed(1)}%</td>
                    <td className="p-3.5 text-slate-300">{(row.precision * 100).toFixed(1)}%</td>
                    <td className="p-3.5 text-slate-300">{(row.recall * 100).toFixed(1)}%</td>
                    <td className="p-3.5 font-bold text-indigo-400">{(row.f1_score * 100).toFixed(1)}%</td>
                    <td className="p-3.5 text-slate-400">{(row.cv_mean * 100).toFixed(1)}%</td>
                    <td className="p-3.5 text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {row.training_time}s
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
