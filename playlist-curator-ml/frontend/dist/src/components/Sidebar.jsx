import React from 'react';
import { 
  Home, 
  BarChart2, 
  LineChart, 
  Settings, 
  TrendingUp, 
  Music, 
  Headphones, 
  Lightbulb, 
  Info,
  Radio
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'dataset', label: 'Dataset Analysis', icon: BarChart2 },
  { id: 'eda', label: 'Exploratory Data Analysis', icon: LineChart },
  { id: 'training', label: 'Model Training', icon: Settings },
  { id: 'comparison', label: 'Model Comparison', icon: TrendingUp },
  { id: 'prediction', label: 'Playlist Prediction', icon: Music },
  { id: 'recommendation', label: 'Song Recommendation', icon: Headphones },
  { id: 'insights', label: 'Model Insights', icon: Lightbulb },
  { id: 'about', label: 'About', icon: Info },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="w-64 bg-[#0d121f] border-r border-slate-800/80 flex flex-col justify-between p-4 shrink-0 min-h-screen sticky top-0 z-30">
      <div>
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 px-3 py-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide leading-tight">AI Playlist Curator</h1>
            <p className="text-xs text-slate-400 font-medium">ML Based on User Taste</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-900/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Music ML Project Footer Banner */}
      <div className="mt-8 p-3.5 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-900/40 border border-slate-800/80">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Music ML Project</h4>
            <span className="text-[10px] text-emerald-400 font-semibold">Active Model Online</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 leading-snug">
          Classify songs into user playlists using machine learning.
        </p>
      </div>
    </aside>
  );
}
