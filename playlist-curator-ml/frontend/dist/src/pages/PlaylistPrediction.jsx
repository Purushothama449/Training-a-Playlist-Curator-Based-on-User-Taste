import React, { useState, useEffect } from 'react';
import { Music, Send, Award, Sparkles, CheckCircle2, Play } from 'lucide-react';
import { api } from '../services/api';

export default function PlaylistPrediction() {
  const [predictTab, setPredictTab] = useState('manual');
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

  useEffect(() => {
    api.getDatasetPreview(1, 40).then(res => {
      if (res && res.data) {
        setExistingSongs(res.data);
        if (res.data.length > 0) setSelectedSongId(res.data[0].track_id);
      }
    }).catch(() => {});

    // Initial prediction
    handlePredict(featureInputs);
  }, []);

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

  const handleFeatureChange = (name, val) => {
    setFeatureInputs(prev => ({ ...prev, [name]: parseFloat(val) }));
  };

  const handleSongSelect = (trackId) => {
    setSelectedSongId(trackId);
    const found = existingSongs.find(s => s.track_id === trackId);
    if (found) {
      setFeatureInputs({
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
      });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Music className="w-6 h-6 text-purple-400" />
          Playlist Prediction Workspace
        </h1>
        <p className="text-xs text-slate-400">Input track audio characteristics or select a song from dataset to predict the optimal user playlist.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (Col 6) */}
        <div className="lg:col-span-6 card-dark p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100 text-base">Track Audio Input Parameters</h3>
          </div>

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

          {predictTab === 'existing' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Choose Song from Dataset:</label>
              <select
                value={selectedSongId}
                onChange={(e) => handleSongSelect(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {existingSongs.map(s => (
                  <option key={s.track_id} value={s.track_id}>
                    {s.track_name} — {s.artist_name} ({s.playlist})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Slider Inputs */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-2 text-xs">
            {Object.keys(featureInputs).map(feat => (
              <div key={feat}>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400 capitalize font-medium">{feat}</span>
                  <span className="text-indigo-400 font-mono font-bold">{featureInputs[feat]}</span>
                </div>
                {feat === 'key' ? (
                  <select
                    value={featureInputs.key}
                    onChange={(e) => handleFeatureChange('key', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1 text-xs text-slate-200"
                  >
                    {[0,1,2,3,4,5,6,7,8,9,10,11].map(k => (
                      <option key={k} value={k}>Key {k}</option>
                    ))}
                  </select>
                ) : feat === 'tempo' ? (
                  <input
                    type="range"
                    min="60"
                    max="200"
                    step="1"
                    value={featureInputs.tempo}
                    onChange={(e) => handleFeatureChange('tempo', e.target.value)}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                ) : feat === 'loudness' ? (
                  <input
                    type="range"
                    min="-30"
                    max="0"
                    step="0.5"
                    value={featureInputs.loudness}
                    onChange={(e) => handleFeatureChange('loudness', e.target.value)}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                ) : (
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={featureInputs[feat]}
                    onChange={(e) => handleFeatureChange(feat, e.target.value)}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => handlePredict(featureInputs)}
            disabled={predicting}
            className="w-full btn-glow py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
          >
            <Send className="w-4 h-4" />
            <span>{predicting ? "Classifying Playlist..." : "Predict Playlist"}</span>
          </button>
        </div>

        {/* Prediction Results Column (Col 6) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main Card */}
          <div className="card-dark p-6 space-y-5">
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Machine Learning Prediction Output
            </h3>

            {predictionResult ? (
              <div className="space-y-6">
                <div className="rounded-2xl p-6 bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-slate-900 border border-purple-500/30 text-center space-y-2">
                  <span className="text-xs font-semibold text-slate-400">Classified Playlist</span>
                  <h2 className="text-3xl font-black text-white uppercase tracking-wider">{predictionResult.predicted_playlist} 🎉</h2>
                  <div className="inline-block px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                    Confidence: {predictionResult.confidence_percentage}%
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300">Playlist Class Probability Distribution</h4>
                  {predictionResult.top_predictions.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-300">{item.playlist}</span>
                        <span className="text-slate-400 font-mono">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            idx === 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                            idx === 1 ? 'bg-gradient-to-r from-indigo-500 to-purple-400' :
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
        </div>
      </div>
    </div>
  );
}
