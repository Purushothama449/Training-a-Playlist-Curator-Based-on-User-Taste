import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import DatasetAnalysis from './pages/DatasetAnalysis';
import EDA from './pages/EDA';
import ModelTraining from './pages/ModelTraining';
import ModelComparison from './pages/ModelComparison';
import PlaylistPrediction from './pages/PlaylistPrediction';
import SongRecommendation from './pages/SongRecommendation';
import ModelInsights from './pages/ModelInsights';
import About from './pages/About';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="flex min-h-screen bg-[#090d16] text-slate-100 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {activeTab === 'home' && <Home setActiveTab={setActiveTab} />}
        {activeTab === 'dataset' && <DatasetAnalysis />}
        {activeTab === 'eda' && <EDA />}
        {activeTab === 'training' && <ModelTraining setActiveTab={setActiveTab} />}
        {activeTab === 'comparison' && <ModelComparison />}
        {activeTab === 'prediction' && <PlaylistPrediction />}
        {activeTab === 'recommendation' && <SongRecommendation />}
        {activeTab === 'insights' && <ModelInsights />}
        {activeTab === 'about' && <About />}
      </main>
    </div>
  );
}
