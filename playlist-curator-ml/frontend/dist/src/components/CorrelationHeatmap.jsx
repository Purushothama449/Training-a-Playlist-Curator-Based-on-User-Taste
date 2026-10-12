import React from 'react';

export default function CorrelationHeatmap({ features, matrix }) {
  if (!features || !matrix || features.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-500 text-sm">No correlation data available</div>;
  }

  // Color mapping helper: -1 (blue/cool) -> 0 (neutral dark) -> +1 (red/warm)
  const getCellColor = (val) => {
    if (val === 1) return 'bg-indigo-600/90 text-white font-bold';
    if (val > 0.5) return 'bg-red-500/80 text-white';
    if (val > 0.2) return 'bg-red-400/40 text-red-200';
    if (val > -0.2) return 'bg-slate-800/40 text-slate-400';
    if (val > -0.5) return 'bg-blue-400/40 text-blue-200';
    return 'bg-blue-600/80 text-white';
  };

  return (
    <div className="overflow-x-auto p-1">
      <table className="w-full text-center border-collapse text-[10px]">
        <thead>
          <tr>
            <th className="p-1"></th>
            {features.map((f, i) => (
              <th key={i} className="p-1 text-slate-400 font-medium truncate max-w-[50px] -rotate-45 origin-bottom-left">
                {f}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, rIdx) => (
            <tr key={rIdx}>
              <td className="p-1 text-right font-medium text-slate-400 truncate max-w-[65px]">
                {features[rIdx]}
              </td>
              {row.map((val, cIdx) => (
                <td 
                  key={cIdx} 
                  className={`p-1 border border-slate-900 rounded-sm ${getCellColor(val)} transition-all duration-150 hover:scale-110 cursor-pointer`}
                  title={`${features[rIdx]} vs ${features[cIdx]}: ${val}`}
                >
                  {val.toFixed(2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
