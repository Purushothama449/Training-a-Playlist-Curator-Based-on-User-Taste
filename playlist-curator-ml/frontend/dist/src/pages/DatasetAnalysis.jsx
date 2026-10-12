import React, { useState, useEffect, useRef } from 'react';
import { Database, Upload, Search, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { api } from '../services/api';

export default function DatasetAnalysis() {
  const fileInputRef = useRef(null);
  const [summary, setSummary] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [uploadMessage, setUploadMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, [page, search]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, prevRes] = await Promise.all([
        api.getDatasetSummary(),
        api.getDatasetPreview(page, 15, search)
      ]);
      setSummary(sumRes);
      setPreview(prevRes);
    } catch (err) {
      console.error("Dataset load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadMessage({ type: 'info', text: 'Uploading dataset...' });
    try {
      await api.uploadDataset(file);
      setUploadMessage({ type: 'success', text: `Dataset '${file.name}' loaded successfully!` });
      setPage(1);
      loadData();
    } catch (err) {
      setUploadMessage({ type: 'error', text: err.message || 'Dataset upload failed.' });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-400" />
            Dataset Analysis
          </h1>
          <p className="text-xs text-slate-400">Inspect dataset dimensions, metadata, columns, missing values, and raw records.</p>
        </div>

        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-glow px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 self-start md:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Custom CSV</span>
        </button>
      </div>

      {uploadMessage && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${
          uploadMessage.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-300' :
          uploadMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
          'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
        }`}>
          {uploadMessage.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-400" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          <span className="text-sm font-medium">{uploadMessage.text}</span>
        </div>
      )}

      {/* Overview Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="card-dark p-4 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400">Total Songs</span>
            <h3 className="text-xl font-bold text-white">{summary.total_songs?.toLocaleString()}</h3>
          </div>
          <div className="card-dark p-4 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400">Total Columns</span>
            <h3 className="text-xl font-bold text-indigo-400">{summary.total_columns}</h3>
          </div>
          <div className="card-dark p-4 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400">Playlists</span>
            <h3 className="text-xl font-bold text-purple-400">{summary.num_playlists}</h3>
          </div>
          <div className="card-dark p-4 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400">Audio Features</span>
            <h3 className="text-xl font-bold text-emerald-400">{summary.num_audio_features}</h3>
          </div>
          <div className="card-dark p-4 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400">Missing Values</span>
            <h3 className="text-xl font-bold text-amber-400">{summary.missing_values}</h3>
          </div>
          <div className="card-dark p-4 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400">Duplicate Rows</span>
            <h3 className="text-xl font-bold text-slate-300">{summary.duplicate_rows}</h3>
          </div>
        </div>
      )}

      {/* Dataset Preview Table Card */}
      <div className="card-dark p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-slate-100 text-base">Dataset Preview Table</h3>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search track, artist, genre..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                {preview?.columns?.map((col) => (
                  <th key={col} className="p-3 whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {preview?.data?.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/40 transition">
                  {preview.columns.map((col) => (
                    <td key={col} className="p-3 whitespace-nowrap text-slate-300">
                      {col === 'playlist' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                          {row[col]}
                        </span>
                      ) : (
                        String(row[col])
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {preview && (
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
            <span>Showing Page {preview.page} of {preview.total_pages} ({preview.total} records)</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="btn-secondary px-3 py-1.5 rounded-lg disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                disabled={page >= preview.total_pages}
                onClick={() => setPage(p => p + 1)}
                className="btn-secondary px-3 py-1.5 rounded-lg disabled:opacity-40 flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
