import React, { useState, useEffect } from 'react';
import { LineChart, BarChart2, Sparkles, Activity, Layers } from 'lucide-react';
import { api } from '../services/api';
import PlaylistBarChart from '../components/PlaylistBarChart';
import CorrelationHeatmap from '../components/CorrelationHeatmap';
import PcaScatterPlot from '../components/PcaScatterPlot';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';

export default function EDA() {
  const [distribution, setDistribution] = useState([]);
  const [correlation, setCorrelation] = useState(null);
  const [pcaData, setPcaData] = useState([]);
  const [scatterEnergyValence, setScatterEnergyValence] = useState([]);
  const [scatterDanceEnergy, setScatterDanceEnergy] = useState([]);
  const [featureDist, setFeatureDist] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState('danceability');
  const [stats, setStats] = useState([]);

  useEffect(() => {
    loadEdaData();
  }, []);

  useEffect(() => {
    loadFeatureHistogram(selectedFeature);
  }, [selectedFeature]);

  const loadEdaData = async () => {
    try {
      const [distRes, corrRes, pcaRes, sc1Res, sc2Res, statsRes] = await Promise.all([
        api.getPlaylistDistribution(),
        api.getCorrelationMatrix(),
        api.getPcaData(600),
        api.getScatterData('valence', 'energy', 400),
        api.getScatterData('danceability', 'energy', 400),
        api.getFeatureStats()
      ]);

      setDistribution(distRes.distribution || []);
      setCorrelation(corrRes);
      setPcaData(pcaRes.data || []);
      setScatterEnergyValence(sc1Res.points || []);
      setScatterDanceEnergy(sc2Res.points || []);
      setStats(statsRes.stats || []);
    } catch (err) {
      console.error("EDA load error:", err);
    }
  };

  const loadFeatureHistogram = async (feat) => {
    try {
      const res = await api.getFeatureDistributions(feat);
      setFeatureDist(res);
    } catch (err) {
      console.error("Histogram error:", err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <LineChart className="w-6 h-6 text-purple-400" />
          Exploratory Data Analysis (EDA)
        </h1>
        <p className="text-xs text-slate-400">Discover underlying patterns, audio feature distributions, correlations, and playlist separability.</p>
      </div>

      {/* Row 1: Playlist Distribution & Feature Histogram */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-dark p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-400" />
              1. Playlist Track Distribution
            </h3>
          </div>
          <PlaylistBarChart data={distribution} />
        </div>

        {/* Feature Histogram Selector */}
        <div className="card-dark p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              2. Feature Frequency Histogram
            </h3>
            <select
              value={selectedFeature}
              onChange={(e) => setSelectedFeature(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200"
            >
              {['danceability', 'energy', 'valence', 'tempo', 'acousticness', 'speechiness', 'loudness', 'instrumentalness', 'liveness'].map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {featureDist ? (
            <div className="space-y-3">
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featureDist.histogram} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="range" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-25} textAnchor="end" />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff' }} />
                    <Bar dataKey="count" fill="#818cf8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-around text-xs text-slate-400 pt-1 border-t border-slate-800">
                <span>Mean: <strong className="text-white">{featureDist.mean}</strong></span>
                <span>Std Dev: <strong className="text-white">{featureDist.std}</strong></span>
                <span>Min: <strong className="text-white">{featureDist.min}</strong></span>
                <span>Max: <strong className="text-white">{featureDist.max}</strong></span>
              </div>
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center text-slate-500 text-sm">Loading histogram...</div>
          )}
        </div>
      </div>

      {/* Row 2: Correlation Heatmap & PCA Scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-dark p-5 space-y-4">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            3. Feature Correlation Matrix Heatmap
          </h3>
          {correlation && <CorrelationHeatmap features={correlation.features} matrix={correlation.matrix} />}
        </div>

        <div className="card-dark p-5 space-y-4">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            4. PCA 2D Playlist Separability Map
          </h3>
          <PcaScatterPlot data={pcaData} />
        </div>
      </div>

      {/* Row 3: Scatter Plots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter 1: Energy vs Valence */}
        <div className="card-dark p-5 space-y-4">
          <h3 className="font-bold text-slate-100 text-base">5. Energy vs. Valence Scatter Plot</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                <XAxis type="number" dataKey="x" name="Valence" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis type="number" dataKey="y" name="Energy" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip content={({ payload }) => {
                  if (payload && payload.length) {
                    const pt = payload[0].payload;
                    return (
                      <div className="bg-[#0f172a] border border-slate-700 p-2 rounded text-xs text-white">
                        <p className="font-bold text-indigo-400">{pt.track_name}</p>
                        <p className="text-slate-300">Valence: {pt.x} | Energy: {pt.y}</p>
                        <p className="text-slate-400 text-[10px]">Playlist: {pt.playlist}</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Scatter data={scatterEnergyValence} fill="#ec4899" opacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scatter 2: Danceability vs Energy */}
        <div className="card-dark p-5 space-y-4">
          <h3 className="font-bold text-slate-100 text-base">6. Danceability vs. Energy Scatter Plot</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                <XAxis type="number" dataKey="x" name="Danceability" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis type="number" dataKey="y" name="Energy" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip content={({ payload }) => {
                  if (payload && payload.length) {
                    const pt = payload[0].payload;
                    return (
                      <div className="bg-[#0f172a] border border-slate-700 p-2 rounded text-xs text-white">
                        <p className="font-bold text-emerald-400">{pt.track_name}</p>
                        <p className="text-slate-300">Danceability: {pt.x} | Energy: {pt.y}</p>
                        <p className="text-slate-400 text-[10px]">Playlist: {pt.playlist}</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Scatter data={scatterDanceEnergy} fill="#10b981" opacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Playlist-wise Feature Statistics Table */}
      <div className="card-dark p-5 space-y-4">
        <h3 className="font-bold text-slate-100 text-base">7. Playlist-Wise Average Audio Feature Profiles</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Playlist</th>
                <th className="p-3">Danceability</th>
                <th className="p-3">Energy</th>
                <th className="p-3">Valence</th>
                <th className="p-3">Tempo</th>
                <th className="p-3">Acousticness</th>
                <th className="p-3">Speechiness</th>
                <th className="p-3">Loudness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {stats.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-bold font-sans text-indigo-400">{row.playlist}</td>
                  <td className="p-3 text-slate-300">{row.danceability}</td>
                  <td className="p-3 text-slate-300">{row.energy}</td>
                  <td className="p-3 text-slate-300">{row.valence}</td>
                  <td className="p-3 text-slate-300">{row.tempo}</td>
                  <td className="p-3 text-slate-300">{row.acousticness}</td>
                  <td className="p-3 text-slate-300">{row.speechiness}</td>
                  <td className="p-3 text-slate-300">{row.loudness}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
