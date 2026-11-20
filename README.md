# ASCII Christmas Tree & Split-Screen Reel Generator (Single-File Edition)

All-in-one Python script ([christmas_tree.py](christmas_tree.py)) combining an interactive 3D ASCII Christmas Tree window (`pygame` + `numpy` + `opencv`), a procedural 80s synth-pop / music-box soundtrack generator, and a vertical 9:16 split-screen MP4 Reel exporter (`1080×1920 @ 30fps`) with live scrolling syntax-highlighted source code.

## Features

- **3D Point-Cloud ASCII Engine**:
  - 25 whorls of drooping pine branches dusted with snow tips and dark inner-cone occlusion.
  - Textured bark trunk, 3.6-turn golden tinsel swags, 34 red/gold/silver baubles, and 170 twinkling branch-tip fairy lights.
  - 6 wrapped 3D gift boxes with crossed ribbons and bow loops orbiting around the base.
  - 5-pointed glowing top star with 8-way rays that bursts white at `t = 11.8s` and settles into warm gold.
  - Twinkling starry sky, falling snowflakes, perspective ground grid, multi-scale additive bloom, and typed holiday greeting (`M E R R Y   C H R I S T M A S   2 0 2 6`).
- **Integrated Audio & Custom Track Support**:
  - Built-in procedural 80s synth-pop & chime cover of *"Last Christmas"* (`D → Bm → Em → A` at `108 BPM`, default), traditional carol (`--theme traditional`), Jingle Bells (`--theme jingle_bells`), or any custom audio/video file via `--audio` + `--audio-start`.
  - Synced audio playback directly in the interactive window as well as MP4 Reel exports.
- **9:16 Split-Screen Reel Exporter (`--export`)**:
  - Top pane: full ASCII Christmas Tree animation.
  - Bottom pane: syntax-highlighted source code of `christmas_tree.py` scrolling smoothly in sync with each animation phase (`H.264 + AAC`).

## Setup

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

## Local Web Version

The browser version is a static, dependency-free page in `web/`. From the project folder run:

```powershell
python -m http.server 8000
```

Open [http://localhost:8000/web/](http://localhost:8000/web/) in a browser. Use the controls to pause the animation, toggle synthesized music, choose a tune, or tap the tree to toggle snow.

The website is also configured to deploy to GitHub Pages on every update to `web/`. Once the workflow completes, open [https://huutn24-boop.github.io/me-ri-chit-mot/](https://huutn24-boop.github.io/me-ri-chit-mot/).

## Usage

### 1. Run Interactive ASCII Window (with audio)
```powershell
python christmas_tree.py
```
Mobile portrait window (540×960), with touch controls:
```powershell
python christmas_tree.py --mobile
```
Touch the left or right side to scrub by one second; touch the center to pause/resume.

With a custom music track starting at `18.0s`:
```powershell
python christmas_tree.py --audio path\to\last_christmas.mp3 --audio-start 18.0
```
Controls:
- `Space`: Pause / Resume (video & audio)
- `R`: Restart choreography
- `Left` / `Right`: Scrub `-1s` / `+1s`
- `S`: Save screenshot into `output/`
- `Esc` / `Q`: Quit

### 2. Export Vertical Split-Screen Reel Video
```powershell
python christmas_tree.py --export output/christmas_tree_reel.mp4
```

Options:
- `--export [MP4]`: Export 9:16 MP4 Reel (defaults to `output/christmas_tree_reel.mp4`)
- `--res 1080p|720p`: Output resolution (`1080×1920` or `720×1280`, default `1080p`)
- `--fps 30`: Frame rate (default `30`)
- `--duration 20`: Reel duration in seconds (default `20.0`)
- `--author "@your.handle"`: Bottom-left signature handle (leave unset to hide it)
- `--message "M E R R Y   C H R I S T M A S   2 0 2 6"`: Greeting text
- `--audio path/to/song.mp3`: Custom music/video file (`.mp3`, `.m4a`, `.wav`, `.mp4`, etc.)
- `--audio-start 0.0`: Start offset in seconds when using `--audio`
- `--theme last_christmas|traditional|jingle_bells`: Built-in synthesized soundtrack (`last_christmas` default)
- `--no-audio`: Disable audio playback or export silent MP4

### 3. Run Tests
```powershell
python -m unittest discover -s tests -v
```
