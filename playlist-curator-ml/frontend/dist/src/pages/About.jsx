import React from 'react';
import { Info, BookOpen, GraduationCap, CheckCircle2, Code2, Server } from 'lucide-react';

export default function About() {
  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Info className="w-6 h-6 text-indigo-400" />
          About Project & Documentation
        </h1>
        <p className="text-xs text-slate-400">UE24CS352A Machine Learning Mini-Project — Academic Foundation & Technical Architecture.</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Academic Foundation */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Project Overview */}
          <div className="card-dark p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-400" />
              Machine Learning Mini-Project Overview
            </h3>
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong>Project Title:</strong> Training a Playlist Curator Based on User Taste
              </p>
              <p>
                <strong>Course Code:</strong> UE24CS352A — Machine Learning
              </p>
              <p>
                <strong>Problem Statement:</strong> Given a track vector x(i) in R^n representing audio features (danceability, energy, valence, tempo, etc.), train a multi-class classifier to assign the track to the most suitable user playlist y(i) in {'{1, ..., C}'}.
              </p>
            </div>
          </div>

          {/* Card 2: Academic Reference Paper */}
          <div className="card-dark p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-pink-400" />
              Academic Reference Paper Summary
            </h3>
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                Inspired by the Stanford University research paper:
                <br />
                <em>"Training a Playlist Curator Based on User Taste"</em> by <strong>Amel Awadelkarim</strong> and <strong>Kevin Coelho</strong> (Computational & Mathematical Engineering / Computer Science, Stanford University).
              </p>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h4 className="font-bold text-indigo-400">Key Scientific Findings from the Paper:</h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                  <li><strong>Feature Scaling is Critical:</strong> Rescaling features using mean subtraction and variance division boosted RBF SVM accuracy from 25% to 77-80%, and Perceptron accuracy from 13% to 76%.</li>
                  <li><strong>Model Comparisons:</strong> RBF SVM and single-hidden-layer Neural Networks achieved superior test accuracies compared to linear perceptrons and polynomial SVMs.</li>
                  <li><strong>Separability & PCA:</strong> Dimensionality reduction via 2D PCA demonstrates that certain user playlists are geometrically separable while others overlap significantly in audio space.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Monorepo Architecture & Deliverables */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-dark p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-400" />
              Monorepo System Architecture
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-900/90 font-mono text-[11px] text-slate-300 overflow-x-auto">
              <pre>{`playlist-curator-ml/
├── frontend/ (React + Vite + Tailwind CSS + Recharts)
│   ├── src/components/
│   ├── src/pages/
│   └── src/services/api.js
├── backend/ (FastAPI + Uvicorn + scikit-learn + pandas)
│   ├── app/ml/ (Loader, Preprocessing, Trainer, Predictor)
│   ├── app/routes/ (REST API Endpoints)
│   └── trained_models/ (joblib artifacts)
├── notebooks/ (01_EDA, 02_Train, 03_Eval)
├── datasets/ (spotify_playlists.csv)
├── docs/ (project_writeup.md)
├── setup.bat / run.bat
└── README.md`}</pre>
            </div>
          </div>

          <div className="card-dark p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
              Mini-Project Deliverables Checklist
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Full working Web Application (Frontend + Backend REST API)
              </li>
              <li className="flex items-center gap-2 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Dynamic CSV dataset upload & audio column detection
              </li>
              <li className="flex items-center gap-2 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" /> 5 ML Algorithms (Logistic Regression, KNN, Random Forest, SVM RBF, Neural Net)
              </li>
              <li className="flex items-center gap-2 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Content-based song recommendation via Cosine Similarity
              </li>
              <li className="flex items-center gap-2 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Comprehensive README, setup scripts, and final ZIP package
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
