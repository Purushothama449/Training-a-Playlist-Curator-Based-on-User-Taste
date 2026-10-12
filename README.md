# AI Playlist Curator

**Training a Playlist Curator Based on User Taste**  
**Course:** UE24CS352A – Machine Learning  
**Institution:** PES University, Bengaluru, India

## Team Members
- **Purushothama K C** — SRN: PES1UG25AM810
- **Raghav G Uddihal** — SRN: PES1UG24AM215

---

## 1. Project Overview

AI Playlist Curator is a machine learning application that predicts a playlist category for a song using its audio features and recommends similar songs using cosine similarity. It combines playlist classification and content-based song recommendation in a web application.

The project includes a Python/FastAPI backend, a React frontend, notebooks for data exploration and model evaluation, and saved model artifacts.

## 2. Problem Statement

Organising a large music collection into playlists manually can be time-consuming. Finding songs with similar audio characteristics can also be difficult. Song titles and genre labels alone do not fully describe how a song sounds.

This project explores the use of measurable audio features to:
- Predict a playlist category for a song.
- Identify songs with similar audio-feature patterns.
- Present predictions and recommendations through a web application.

## 3. Project Objectives

- Explore and understand the music dataset.
- Clean the data and prepare audio features.
- Encode playlist categories for supervised classification.
- Train and compare multiple machine learning classifiers.
- Evaluate models using classification metrics.
- Predict a playlist category from a song's audio features.
- Recommend similar songs using cosine similarity.
- Connect the functionality to an interactive frontend.
- Provide licensed music previews where available through Jamendo.

## 4. Dataset and Audio Features

The project presentation reports the following dataset statistics. Confirm these values against the current dataset before final submission.

| Item | Reported value |
|---|---:|
| Songs | 5,721 |
| Playlist categories | 12 |
| Audio features | 11 |

The listed audio features are:

| Feature | Description |
|---|---|
| Danceability | Estimated suitability of a track for dancing |
| Energy | Perceived intensity and activity |
| Valence | Musical positivity |
| Tempo | Speed of the music, usually measured in beats per minute (BPM) |
| Loudness | Overall audio level, usually measured in decibels (dB) |
| Speechiness | Spoken-word characteristics |
| Acousticness | Estimated degree of acoustic sound |
| Instrumentalness | Estimated likelihood that a track has no vocals |
| Liveness | Estimated presence of a live audience |
| Key | Estimated musical key |
| Mode | Major/minor modality indicator |

**Target variable:** The playlist category assigned to each song.

The expected dataset path is `datasets/spotify_playlists.csv`. Confirm the exact filename in GitHub before running the notebooks.

## 5. Methodology

The project workflow is:

1. **Data exploration:** Inspect the dataset dimensions, columns, distributions, and data quality.
2. **Data cleaning:** Check for duplicates, missing values, and invalid values.
3. **Feature preparation:** Select the numerical audio features used by the models.
4. **Label encoding:** Convert playlist names into class labels.
5. **Feature scaling:** Apply `StandardScaler` where required to standardise features with different numerical ranges.
6. **Train/test split:** Separate training data from held-out test data.
7. **Model training:** Train the selected classifiers on the training set.
8. **Model evaluation:** Compare predictions on held-out data using appropriate metrics.
9. **Playlist prediction:** Apply the same fitted preprocessing pipeline to new song features before classification.
10. **Song recommendation:** Compare a reference song with candidate songs using cosine similarity and rank the results.

To avoid data leakage, the scaler should be fitted on the training data only, then reused to transform test data and new inputs.

## 6. Machine Learning Models

The project presentation lists five classifiers for comparison:

| Model | General approach |
|---|---|
| Logistic Regression | Classification using a linear decision function |
| K-Nearest Neighbors (KNN) | Predicts using nearby training examples |
| Random Forest | Combines multiple decision trees |
| Support Vector Machine (SVM, RBF kernel) | Uses a nonlinear kernel to form decision boundaries |
| Neural Network (MLP) | Learns nonlinear relationships through layers |

The models are trained and evaluated separately unless an ensemble method is explicitly implemented. Comparing multiple models does not automatically combine their predictions.

### Evaluation Metrics

- **Accuracy:** Proportion of all predictions that are correct.
- **Precision:** Proportion of predicted positives for a class that are correct.
- **Recall:** Proportion of actual positives for a class that are correctly identified.
- **F1-score:** Harmonic mean of precision and recall.

The presentation shows an SVM (RBF) accuracy of 87.4% in the application dashboard. Verify this against the final test-set evaluation before reporting it as a confirmed result. Add the measured results for the other models from the evaluation notebook; do not estimate missing values.

## 7. Similar-Song Recommendation

The recommendation component uses cosine similarity to compare numerical audio-feature vectors. Given a reference song, the system compares its features with candidate songs, calculates similarity scores, and ranks the candidates.

The formula is:

`cosine_similarity(A, B) = (A · B) / (||A|| × ||B||)`

Here, `A` and `B` are audio-feature vectors, `A · B` is their dot product, and `||A||` and `||B||` are their magnitudes.

A higher score indicates that the vectors point in a more similar direction. This reflects similarity in the selected feature space; it does not guarantee that a listener will prefer the recommended song.

## 8. Technology Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Recharts
- Lucide icons

### Backend
- Python
- FastAPI
- Uvicorn

### Machine Learning and Data Processing
- scikit-learn
- Pandas
- NumPy
- Joblib

### Music Previews
The project presentation lists the Jamendo API as an optional source of licensed preview audio where available. A preview may be a different track from the recommended song, so the preview track and source should be labelled accurately.

Check the current frontend package file and backend dependency file to confirm the exact installed dependencies.

## 9. Repository Structure

The GitHub screenshot shows the following top-level structure inside `playlist-curator-ml`. Nested contents should be checked directly in GitHub.

```text
Training-playlist-curator-user-taste/
└── playlist-curator-ml/
    ├── backend/
    ├── datasets/
    ├── frontend/
    │   └── dist/
    ├── notebooks/
    ├── venv/
    │   └── Scripts/
    ├── run.bat
    ├── setup.bat
    ├── setup.sh
    ├── test_backend.py
    └── README.md
```

The local VS Code view showed these notebooks:

```text
notebooks/
├── 01_data_exploration.ipynb
├── 02_preprocessing.ipynb
├── 03_model_training.ipynb
└── 04_model_evaluation.ipynb
```

The local VS Code view also showed a `trained_models/` folder containing `.joblib` files. Confirm whether these model artifacts are included in the GitHub repository and where the backend expects to load them.

### Repository Hygiene
- Do not commit the local `venv/` environment. Add `venv/` to `.gitignore` and remove tracked environment files from version control.
- Check whether `frontend/dist/` is accompanied by frontend source files such as `src/` and `package.json`. The build output alone is not a replacement for source code.
- Do not commit API keys, passwords, or other secrets.
- Review large datasets and model artifacts for repository size and licensing requirements.

## 10. Setup and Running the Project

The commands below are a typical setup. Check the actual repository files and setup scripts before running them because paths can vary.

### Prerequisites
- Git
- A Python version supported by the backend dependencies
- Node.js and npm, if the frontend source and `package.json` are present

### Clone the Repository

```bash
git clone https://github.com/Purushothama449/Training-playlist-curator-user-taste.git
cd Training-playlist-curator-user-taste/playlist-curator-ml
```

### Create a Python Environment (Windows PowerShell)

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

Install backend dependencies if `backend/requirements.txt` exists:

```powershell
python -m pip install -r backend\requirements.txt
```

If the requirements file is in a different location, use the path that exists in the repository.

### Start the Backend

If `backend/app/main.py` exists and defines a FastAPI object named `app`, a typical command from the project root is:

```powershell
python -m uvicorn app.main:app --reload --app-dir backend --port 8000
```

If this import path does not match the actual structure, inspect `backend/app/main.py` and the setup scripts for the correct command.

When running successfully, the backend is commonly available at `http://127.0.0.1:8000`. FastAPI documentation is commonly available at `http://127.0.0.1:8000/docs`.

### Start the Frontend

Run these commands only if the frontend source and `package.json` are present:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite. If the frontend cannot reach the backend, check the API base URL and backend CORS settings.

### Setup Scripts

The repository contains `setup.bat`, `setup.sh`, and `run.bat`. Review these scripts and follow the commands actually defined in them.

## 11. Testing

The GitHub screenshot shows `test_backend.py`. Use the tests supplied by the project to check backend behaviour. Useful checks may include:

- Dataset and model files load successfully.
- Prediction endpoints validate inputs and return the expected response format.
- The preprocessing pipeline uses the same feature order and scaler as training.
- Recommendations are ranked correctly.
- Invalid requests return useful error responses.
- The frontend handles API failures gracefully.

Document only tests that have actually been run and their results.


## 12. Limitations

- Audio features do not represent every aspect of personal music taste.
- Similarity in audio-feature space does not guarantee personal preference.
- Model performance depends on dataset quality, class balance, and evaluation procedure.
- The dashboard's reported accuracy should be verified against the final evaluation output.
- Jamendo preview availability and whether a preview matches the recommended song can vary.

## 13. Future Scope

Potential future improvements include:

- Personalised recommendations based on listening history.
- User feedback to adapt recommendations.
- Mood-aware playlist generation.
- A hybrid recommender combining playlist probabilities with song similarity.
- Additional features or embeddings for richer song representations.
- Recommendation evaluation using metrics such as Precision@K and Recall@K.

These are future possibilities and should not be described as implemented until they have been developed and tested.

## 14. Research Inspiration

This project is inspired by Amel Awadelkarim and Kevin Coelho's 2018 paper, *Training a Playlist Curator Based on User Taste*. Evaluate this implementation using its own dataset and experiments. Do not present results from the reference paper as results obtained by this project.

---

 
**Repository:** [Training-playlist-curator-user-taste](https://github.com/Purushothama449/Training-playlist-curator-user-taste)
