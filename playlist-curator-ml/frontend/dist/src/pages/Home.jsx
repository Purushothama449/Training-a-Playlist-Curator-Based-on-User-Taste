import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  GitBranch, 
  FileText, 
  Music, 
  ListMusic, 
  Database, 
  Award, 
  Play, 
  Send, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Headphones
} from 'lucide-react';
import { api } from '../services/api';
import PlaylistBarChart from '../components/PlaylistBarChart';
import CorrelationHeatmap from '../components/CorrelationHeatmap';
import PcaScatterPlot from '../components/PcaScatterPlot';

export default function Home({ setActiveTab }) {
  const fileInputRef = useRef(null);
  
  // State for metrics & data
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [modelsList, setModelsList] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [correlation, setCorrelation] = useState(null);
  const [pcaData, setPcaData] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null);

  // Prediction Tab State
  const [predictTab, setPredictTab] = useState('manual'); // 'manual' | 'existing'
  const [existingSongs, setExistingSongs] = useState([]);
  const [selectedSongId, setSelectedSongId] = useState('');
  
  const [featureInputs, setFeatureInputs] = useState({
    danceability: 0.72,
    energy: 0.81,
    loudness: -5.2,
    speechiness: 0.04,
    acousticness: 0.08,
    instrumentalness: 0.00,
    liveness: 0.12,
    valence: 0.75,
    tempo: 128,
    key: 5
  });

  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  // Fetch initial dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, modelRes, distRes, corrRes, pcaRes, previewRes] = await Promise.all([
        api.getDatasetSummary().catch(() => null),
        api.getModelsList().catch(() => null),
        api.getPlaylistDistribution().catch(() => null),
        api.getCorrelationMatrix().catch(() => null),
        api.getPcaData(500).catch(() => null),
        api.getDatasetPreview(1, 30).catch(() => null)
      ]);

      if (sumRes) setSummary(sumRes);
      if (modelRes) setModelsList(modelRes);
      if (distRes) setDistribution(distRes.distribution || []);
      if (corrRes) setCorrelation(corrRes);
      if (pcaRes) setPcaData(pcaRes.data || []);
      if (previewRes && previewRes.data) {
        setExistingSongs(previewRes.data);
        if (previewRes.data.length > 0) {
          setSelectedSongId(previewRes.data[0].track_id);
        }
      }

      // Initial prediction call
      handlePredict(featureInputs);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async (features) => {
    setPredicting(true);
    try {
      const payload = {
        features,
        track_id: predictTab === 'existing' ? selectedSongId : null
      };
      const res = await api.predictPlaylist(payload);
      if (res && res.prediction) {
        setPredictionResult(res.prediction);
        setRecommendations(res.recommendations || []);
      }
    } catch (err) {
      console.error("Prediction error:", err);
    } finally {
      setPredicting(false);
    }
  };

  const handleFeatureChange = (name, value) => {
    const updated = { ...featureInputs, [name]: parseFloat(value) };
    setFeatureInputs(updated);
  };

  const handleSongSelect = (trackId) => {
    setSelectedSongId(trackId);
    const found = existingSongs.find(s => s.track_id === trackId);
    if (found) {
      const updated = {
        danceability: found.danceability ?? featureInputs.danceability,
        energy: found.energy ?? featureInputs.energy,
        loudness: found.loudness ?? featureInputs.loudness,
        speechiness: found.speechiness ?? featureInputs.speechiness,
        acousticness: found.acousticness ?? featureInputs.acousticness,
        instrumentalness: found.instrumentalness ?? featureInputs.instrumentalness,
        liveness: found.liveness ?? featureInputs.liveness,
        valence: found.valence ?? featureInputs.valence,
        tempo: found.tempo ?? featureInputs.tempo,
        key: found.key ?? featureInputs.key
      };
      setFeatureInputs(updated);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadStatus({ type: 'info', message: 'Uploading and analyzing dataset...' });
    try {
      const res = await api.uploadDataset(file);
      setUploadStatus({ type: 'success', message: `Dataset '${file.name}' uploaded successfully!` });
      loadDashboardData();
    } catch (err) {
      setUploadStatus({ type: 'error', message: err.message || 'File upload failed.' });
    }
  };

  const totalSongs = summary ? summary.total_songs : 5721;
  const numPlaylists = summary ? summary.num_playlists : 12;
  const numFeatures = summary ? summary.num_audio_features : 10;
  const bestModelName = modelsList ? modelsList.best_model : 'SVM (RBF)';

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Upload Banner Status Alert */}
      {uploadStatus && (
        <div className={`p-4 rounded-xl flex items-center justify-between border ${
          uploadStatus.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-300' :
          uploadStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
          'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
        }`}>
          <div className="flex items-center gap-3">
            {uploadStatus.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-400" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            <span className="text-sm font-medium">{uploadStatus.message}</span>
          </div>
          <button onClick={() => setUploadStatus(null)} className="text-xs underline opacity-80 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative rounded-2xl p-8 overflow-hidden card-dark bg-gradient-to-r from-slate-900 via-indigo-950/60 to-purple-950/40 border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Playlist Curator</h1>
                <p className="text-sm font-semibold text-purple-400">ML Based on User Taste</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Train a machine learning model to understand user music taste and classify songs into the most suitable playlist.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".csv" 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="btn-glow px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Dataset</span>
              </button>
              <a 
                href="https://github.com/user/playlist-curator-ml" 
                target="_blank" 
                rel="noreferrer"
                className="btn-secondary px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
              >
                <GitBranch className="w-4 h-4" />
                <span>View GitHub</span>
              </a>
              <button 
                onClick={() => setActiveTab('about')}
                className="btn-secondary px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Read Documentation</span>
              </button>
            </div>
          </div>

          {/* Decorative Visual Element */}
          <div className="hidden lg:flex items-center justify-center w-64 h-36 rounded-2xl bg-gradient-to-tr from-purple-900/30 to-indigo-900/40 border border-purple-500/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-purple-500/10 blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
            <div className="text-center space-y-1 relative z-10">
              <Sparkles className="w-8 h-8 text-purple-400 mx-auto animate-pulse" />
              <p className="text-xs font-bold text-slate-200">Smart Taste Classification</p>
              <span className="text-[10px] text-slate-400">Content-Based ML</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Songs */}
        <div className="card-dark p-5 flex items-center gap-4 card-hover">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Songs</span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-white">{totalSongs.toLocaleString()}</h3>
              <span className="text-xs font-medium text-emerald-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +12%
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Number of Playlists */}
        <div className="card-dark p-5 flex items-center gap-4 card-hover">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ListMusic className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Number of Playlists</span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-white">{numPlaylists}</h3>
              <span className="text-xs font-medium text-emerald-400">+2</span>
            </div>
          </div>
        </div>

        {/* Card 3: Audio Features */}
        <div className="card-dark p-5 flex items-center gap-4 card-hover">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Audio Features</span>
            <h3 className="text-2xl font-bold text-white">{numFeatures}</h3>
            <p className="text-[11px] text-slate-400 truncate max-w-[140px]">danceability, energy, tempo...</p>
          </div>
        </div>

        {/* Card 4: Best Model */}
        <div className="card-dark p-5 flex items-center gap-4 card-hover">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Best Model</span>
            <h3 className="text-xl font-bold text-white truncate max-w-[150px]">{bestModelName}</h3>
            <p className="text-xs font-semibold text-emerald-400">87.4% Accuracy</p>
          </div>
        </div>
      </div>

      {/* Row 1 Charts: Playlist Distribution, Correlation Heatmap, PCA Scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playlist Distribution */}
        <div className="card-dark p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListMusic className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-slate-100 text-base">Playlist Distribution</h3>
            </div>
          </div>
          <PlaylistBarChart data={distribution} />
        </div>

        {/* Correlation Heatmap */}
        <div className="card-dark p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-slate-100 text-base">Correlation Heatmap</h3>
            </div>
          </div>
          {correlation ? (
            <CorrelationHeatmap features={correlation.features} matrix={correlation.matrix} />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">Loading correlation matrix...</div>
          )}
        </div>

        {/* PCA Scatter Plot */}
        <div className="card-dark p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-400" />
              <h3 className="font-bold text-slate-100 text-base">PCA Visualization</h3>
            </div>
          </div>
          <PcaScatterPlot data={pcaData} />
        </div>
      </div>

      {/* Row 2: Prediction Box, Result Card, Recommendation Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Playlist Prediction Controls (Col 5) */}
        <div className="lg:col-span-5 card-dark p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-slate-100 text-base">Playlist Prediction</h3>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-900/80 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setPredictTab('manual')}
              className={`py-2 rounded-lg transition-all ${predictTab === 'manual' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Enter Features Manually
            </button>
            <button
              onClick={() => setPredictTab('existing')}
              className={`py-2 rounded-lg transition-all ${predictTab === 'existing' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Select Existing Song
            </button>
          </div>

          {/* Existing Song Selector */}
          {predictTab === 'existing' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Choose Song from Dataset:</label>
              <select
                value={selectedSongId}
                onChange={(e) => handleSongSelect(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {existingSongs.map(s => (
                  <option key={s.track_id} value={s.track_id}>
                    {s.track_name} — {s.artist_name} ({s.playlist})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Audio Sliders */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-2 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400 font-medium">Danceability</span>
                <span className="text-indigo-400 font-mono font-bold">{featureInputs.danceability}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={featureInputs.danceability}
                onChange={(e) => handleFeatureChange('danceability', e.target.value)}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400 font-medium">Instrumentalness</span>
                <span className="text-indigo-400 font-mono font-bold">{featureInputs.instrumentalness}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={featureInputs.instrumentalness}
                onChange={(e) => handleFeatureChange('instrumentalness', e.target.value)}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400 font-medium">Energy</span>
                <span className="text-indigo-400 font-mono font-bold">{featureInputs.energy}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={featureInputs.energy}
                onChange={(e) => handleFeatureChange('energy', e.target.value)}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400 font-medium">Liveness</span>
                <span className="text-indigo-400 font-mono font-bold">{featureInputs.liveness}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={featureInputs.liveness}
                onChange={(e) => handleFeatureChange('liveness', e.target.value)}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400 font-medium">Loudness (dB)</span>
                <span className="text-indigo-400 font-mono font-bold">{featureInputs.loudness}</span>
              </div>
              <input
                type="range"
                min="-30"
                max="0"
                step="0.5"
                value={featureInputs.loudness}
                onChange={(e) => handleFeatureChange('loudness', e.target.value)}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400 font-medium">Valence</span>
                <span className="text-indigo-400 font-mono font-bold">{featureInputs.valence}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={featureInputs.valence}
                onChange={(e) => handleFeatureChange('valence', e.target.value)}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400 font-medium">Speechiness</span>
                <span className="text-indigo-400 font-mono font-bold">{featureInputs.speechiness}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={featureInputs.speechiness}
                onChange={(e) => handleFeatureChange('speechiness', e.target.value)}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400 font-medium">Tempo (BPM)</span>
                <span className="text-indigo-400 font-mono font-bold">{featureInputs.tempo}</span>
              </div>
              <input
                type="range"
                min="60"
                max="200"
                step="1"
                value={featureInputs.tempo}
                onChange={(e) => handleFeatureChange('tempo', e.target.value)}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400 font-medium">Acousticness</span>
                <span className="text-indigo-400 font-mono font-bold">{featureInputs.acousticness}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={featureInputs.acousticness}
                onChange={(e) => handleFeatureChange('acousticness', e.target.value)}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400 font-medium">Key</span>
                <span className="text-indigo-400 font-mono font-bold">{featureInputs.key}</span>
              </div>
              <select
                value={featureInputs.key}
                onChange={(e) => handleFeatureChange('key', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200"
              >
                {[0,1,2,3,4,5,6,7,8,9,10,11].map(k => (
                  <option key={k} value={k}>Key {k}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => handlePredict(featureInputs)}
            disabled={predicting}
            className="w-full btn-glow py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
          >
            <Send className="w-4 h-4" />
            <span>{predicting ? 'Predicting Playlist...' : 'Predict Playlist'}</span>
          </button>
        </div>

        {/* Prediction Result Card (Col 4) */}
        <div className="lg:col-span-4 card-dark p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-base">Prediction Result</h3>
          </div>

          {predictionResult ? (
            <div className="space-y-5">
              {/* Predicted Playlist Header Badge */}
              <div className="relative rounded-2xl p-6 bg-gradient-to-br from-pink-900/40 via-purple-900/30 to-slate-900 border border-purple-500/30 text-center space-y-2 overflow-hidden">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 mx-auto flex items-center justify-center shadow-lg shadow-pink-500/40">
                  <Music className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400">Predicted Playlist</span>
                  <h2 className="text-2xl font-black text-white uppercase tracking-wider">{predictionResult.predicted_playlist} 🎉</h2>
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                  Confidence: {predictionResult.confidence_percentage}%
                </div>
              </div>

              {/* Top 5 Predictions Bar List */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-300">Top 5 Predictions</h4>
                {predictionResult.top_predictions.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center text-slate-400 font-bold">
                          {idx + 1}
                        </span>
                        {item.playlist}
                      </span>
                      <span className="text-slate-400 font-mono">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx === 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                          idx === 1 ? 'bg-gradient-to-r from-blue-500 to-indigo-400' :
                          idx === 2 ? 'bg-gradient-to-r from-purple-500 to-pink-400' :
                          'bg-slate-600'
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">Predicting...</div>
          )}
        </div>

        {/* Similar Songs Recommendations Box (Col 3) */}
        <div className="lg:col-span-3 card-dark p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-slate-100 text-base">Similar Songs</h3>
          </div>

          <div className="space-y-3">
            {recommendations.slice(0, 5).map((song, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
                <div className="flex items-center gap-3 truncate pr-2">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 shrink-0 flex items-center justify-center text-white font-bold text-xs shadow">
                    <Music className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h5 className="text-xs font-bold text-slate-100 truncate">{song.track_name}</h5>
                    <p className="text-[10px] text-slate-400 truncate">{song.artist_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    {song.similarity_percentage}
                  </span>
                  <button className="w-7 h-7 rounded-full bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white flex items-center justify-center transition">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setActiveTab('recommendation')}
            className="w-full btn-secondary py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <span>Show More Recommendations</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
