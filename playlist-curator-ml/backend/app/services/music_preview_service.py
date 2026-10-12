import os
import json
import httpx
import difflib
import hashlib
from typing import Dict, Any, Optional

def load_env_file():
    env_paths = [
        os.path.join(os.path.dirname(__file__), "..", "..", ".env"),
        os.path.join(os.getcwd(), ".env"),
        os.path.join(os.getcwd(), "backend", ".env")
    ]
    for p in env_paths:
        if os.path.exists(p):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            os.environ.setdefault(k.strip(), v.strip())
            except Exception:
                pass

load_env_file()

JAMENDO_CLIENT_ID = os.getenv("JAMENDO_CLIENT_ID", "3dce8b55")
JAMENDO_BASE_URL = "https://api.jamendo.com/v3.0/tracks/"
CACHE_FILE_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "music_cache.json")

class MusicPreviewService:
    def __init__(self):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.cache_path = os.path.abspath(CACHE_FILE_PATH)
        self.load_cache()

    def load_cache(self):
        try:
            if os.path.exists(self.cache_path):
                with open(self.cache_path, "r", encoding="utf-8") as f:
                    self.cache = json.load(f)
        except Exception as e:
            print(f"[MusicPreviewService] Error loading cache: {e}")
            self.cache = {}

    def save_cache(self):
        try:
            os.makedirs(os.path.dirname(self.cache_path), exist_ok=True)
            with open(self.cache_path, "w", encoding="utf-8") as f:
                json.dump(self.cache, f, indent=2)
        except Exception as e:
            print(f"[MusicPreviewService] Error saving cache: {e}")

    def get_cache_key(self, track_name: str, artist_name: str) -> str:
        norm_title = str(track_name or "").strip().lower()
        norm_artist = str(artist_name or "").strip().lower()
        return f"{norm_title}|{norm_artist}"

    def resolve_preview_for_track(self, track: Dict[str, Any]) -> Dict[str, Any]:
        track_id = str(track.get("track_id", ""))
        track_name = str(track.get("track_name", track.get("title", "Unknown Track")))
        artist_name = str(track.get("artist_name", track.get("artist", "Unknown Artist")))
        genre = str(track.get("genre", "")).lower()
        playlist = str(track.get("playlist", "")).lower()

        cache_key = self.get_cache_key(track_name, artist_name)
        if cache_key in self.cache and self.cache[cache_key].get("audio_available"):
            return self.cache[cache_key]
        if track_id and track_id in self.cache and self.cache[track_id].get("audio_available"):
            return self.cache[track_id]

        print(f"[Jamendo] Searching: {track_name} - {artist_name}")

        # Attempt Jamendo resolution
        preview_data = self._fetch_jamendo_preview(
            track_name=track_name,
            artist_name=artist_name,
            genre=genre,
            playlist=playlist,
            features=track.get("features", {})
        )

        # Cache result
        self.cache[cache_key] = preview_data
        if track_id:
            self.cache[track_id] = preview_data
        self.save_cache()

        return preview_data

    def _fetch_jamendo_preview(
        self,
        track_name: str,
        artist_name: str,
        genre: str,
        playlist: str,
        features: Dict[str, float]
    ) -> Dict[str, Any]:
        client_id = os.getenv("JAMENDO_CLIENT_ID", JAMENDO_CLIENT_ID)

        # 1. Direct title search
        try:
            params = {
                "client_id": client_id,
                "format": "json",
                "limit": 5,
                "namesearch": track_name,
                "audioformat": "mp31"
            }
            res = httpx.get(JAMENDO_BASE_URL, params=params, timeout=2.0)
            if res.status_code == 200:
                results = res.json().get("results", [])
                if results:
                    target_query = f"{track_name} {artist_name}".lower()
                    for r in results:
                        candidate_name = f"{r.get('name', '')} {r.get('artist_name', '')}".lower()
                        ratio = difflib.SequenceMatcher(None, target_query, candidate_name).ratio()
                        if ratio >= 0.70 and r.get("audio"):
                            return self._format_jamendo_response(r, is_exact=True, ml_track=track_name)
        except Exception as e:
            print(f"[Jamendo] Direct search warning: {e}")

        # 2. Similar track search based on genre or playlist term
        terms = [t for t in [genre, playlist, "chill", "electronic", "instrumental"] if t]
        for term in terms:
            try:
                params = {
                    "client_id": client_id,
                    "format": "json",
                    "limit": 10,
                    "search": term.lower(),
                    "audioformat": "mp31"
                }
                res = httpx.get(JAMENDO_BASE_URL, params=params, timeout=2.0)
                if res.status_code == 200:
                    results = res.json().get("results", [])
                    if results:
                        h = int(hashlib.md5(f"{track_name}{artist_name}".encode("utf-8")).hexdigest(), 16)
                        picked = results[h % len(results)]
                        if picked.get("audio"):
                            return self._format_jamendo_response(picked, is_exact=False, ml_track=track_name)
            except Exception as e:
                print(f"[Jamendo] Search term '{term}' warning: {e}")

        # 3. Final Fallback if Jamendo API fails or is offline
        print(f"[Jamendo] No suitable match found for: {track_name} - {artist_name}")
        return {
            "audio_available": False,
            "audio_url": None,
            "is_exact_match": False,
            "preview_track_name": None,
            "preview_artist_name": None,
            "music_source": None,
            "source_url": None,
            "license": None,
            "attribution": "Music preview service temporarily unavailable.",
            "cover_image": None
        }

    def _format_jamendo_response(self, item: Dict[str, Any], is_exact: bool, ml_track: str) -> Dict[str, Any]:
        jamendo_id = str(item.get("id", ""))
        title = item.get("name", "Jamendo Track")
        artist = item.get("artist_name", "Jamendo Artist")
        audio_url = item.get("audio") or item.get("audiodownload")
        source_url = item.get("shareurl") or item.get("shorturl") or f"https://www.jamendo.com/track/{jamendo_id}"
        license_url = item.get("license_ccurl") or "https://creativecommons.org/licenses/by-nc/4.0/"
        cover_image = item.get("image") or item.get("album_image")

        if is_exact:
            attribution = f"Track: '{title}' by {artist} on Jamendo"
        else:
            attribution = f"Jamendo Licensed Similar Track: '{title}' by {artist}"

        print(f"[Jamendo] Match: {title} - {artist}")
        print(f"[Jamendo] Audio URL found: True")
        print(f"[Jamendo] Source URL found: True")

        return {
            "audio_available": True,
            "audio_url": audio_url,
            "is_exact_match": is_exact,
            "preview_track_name": title,
            "preview_artist_name": artist,
            "jamendo_track_id": jamendo_id,
            "music_source": "Jamendo",
            "source_url": source_url,
            "license": license_url,
            "attribution": attribution,
            "cover_image": cover_image
        }

music_preview_service = MusicPreviewService()
