import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, Legend, ZAxis } from 'recharts';

const COLOR_MAP = {
  'Chill': '#38bdf8',
  'Workout': '#f43f5e',
  'Party': '#10b981',
  'Romantic': '#ec4899',
  'Sad': '#eab308',
  'Acoustic': '#f97316',
  'Focus': '#3b82f6',
  'Travel': '#a855f7',
  'Jazz': '#8b5cf6',
  'Rock': '#ef4444',
  'Hip Hop': '#06b6d4',
  'Others': '#64748b'
};

export default function PcaScatterPlot({ data }) {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-500 text-sm">No PCA data available</div>;
  }

  // Group data by playlist
  const grouped = data.reduce((acc, pt) => {
    const pl = pt.playlist || 'Others';
    if (!acc[pl]) acc[pl] = [];
    acc[pl].push(pt);
    return acc;
  }, {});

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
          <XAxis 
            type="number" 
            dataKey="pc1" 
            name="PC 1" 
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
          />
          <YAxis 
            type="number" 
            dataKey="pc2" 
            name="PC 2" 
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
          />
          <ZAxis type="number" range={[20, 20]} />
          <Tooltip 
            content={({ payload }) => {
              if (payload && payload.length) {
                const pt = payload[0].payload;
                return (
                  <div className="bg-[#0f172a] border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs text-white">
                    <p className="font-bold text-indigo-400">{pt.track_name}</p>
                    <p className="text-slate-300">{pt.artist_name}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-200">
                      Playlist: {pt.playlist}
                    </span>
                  </div>
                );
              }
              return null;
            }}
          />
          {Object.keys(grouped).map((plName) => (
            <Scatter
              key={plName}
              name={plName}
              data={grouped[plName]}
              fill={COLOR_MAP[plName] || '#818cf8'}
              opacity={0.8}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
