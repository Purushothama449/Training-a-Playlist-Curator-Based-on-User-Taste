import React, { useState, useEffect } from 'react';
import { Headphones, Play, Sparkles, Music, Search } from 'lucide-react';
import { api } from '../services/api';

export default function SongRecommendation() {
  const [songs, setSongs] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [topN, setTopN] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getDatasetPreview(1, 50).then(res => {
      if (res && res.data) {
        setSongs(res.data);
        if (res.data.length > 0) {
          setSelectedTrackId(res.data[0].track_id);
          fetchRecommendations(res.data[0].track_id, 10);
        }
      }
    }).catch(() => {});
  }, []);

  const fetchRecommendations = async (trackId, limit) => {
    setLoading(true);
    try {
      const res = await api.getRecommendations({
        seed_track_id: trackId,
        top_n: limit
      });
      if (res && res.recommendations) {
        setRecommendations(res.recommendations);
      }
    } catch (err) {
      console.error("Recommendation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackChange = (trackId) => {
    setSelectedTrackId(trackId);
    fetchRecommendations(trackId, topN);
  };

  const handleLimitChange = (n) => {
    setTopN(n);
    fetchRecommendations(selectedTrackId, n);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Headphones className="w-6 h-6 text-emerald-400" />
          Content-Based Song Recommendation System
        </h1>
        <p className="text-xs text-slate-400">Discover structurally similar tracks by comparing scaled audio feature vectors using Cosine Similarity.</p>
      </div>

      {/* Control Panel */}
      <div className="card-dark p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
          <div className="space-y-1 flex-1">
            <label className="text-xs font-bold text-slate-300">Seed Track from Dataset:</label>
            <select
              value={selectedTrackId}
              onChange={(e) => handleTrackChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {songs.map(s => (
                <option key={s.track_id} value={s.track_id}>
                  {s.track_name} — {s.artist_name} ({s.playlist})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1 w-full sm:w-40">
            <label className="text-xs font-bold text-slate-300">Number of Recommendations:</label>
            <select
              value={topN}
              onChange={(e) => handleLimitChange(parseInt(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value={5}>Top 5 Tracks</option>
              <option value={10}>Top 10 Tracks</option>
              <option value={15}>Top 15 Tracks</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => fetchRecommendations(selectedTrackId, topN)}
          disabled={loading}
          className="btn-glow px-6 py-3 rounded-xl font-bold text-xs text-white flex items-center gap-2 self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? "Calculating Similarity..." : "Find Similar Tracks"}</span>
        </button>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
          <Music className="w-5 h-5 text-indigo-400" />
          Recommended Similar Songs ({recommendations.length})
        </h3>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-slate-500 text-sm">Computing cosine similarity matrix...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((song, idx) => (
              <div key={idx} className="card-dark p-4 card-hover flex flex-col justify-between space-y-3 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shrink-0 shadow">
                      <Music className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <h4 className="text-sm font-bold text-slate-100 truncate">{song.track_name}</h4>
                      <p className="text-xs text-slate-400 truncate">{song.artist_name}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
                    {song.similarity_percentage} Match
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-semibold text-indigo-400">
                    {song.playlist}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>Val: {song.features?.valence}</span>
                    <span>Nrg: {song.features?.energy}</span>
                    <button className="w-7 h-7 rounded-full bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition ml-1">
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
