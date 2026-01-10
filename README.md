# rrweb Player Playground

A simple tool to upload and replay [rrweb](https://www.rrweb.io/) session recordings.

**Live Demo:** https://mattyhempstead.github.io/rrweb-player-video-playground/

## Features

- Upload JSON files containing rrweb events
- Replay recordings with full playback controls
- View recording stats (duration, viewport, interactions, etc.)
- Inspect raw event JSON

## Expected Format

```json
{
  "events": [ ... ]
}
```

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Outputs to `/docs` for GitHub Pages hosting.
