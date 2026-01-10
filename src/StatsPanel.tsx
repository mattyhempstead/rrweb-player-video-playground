import type { eventWithTime } from "@rrweb/types";

// rrweb event types
const EventType = {
  DomContentLoaded: 0,
  Load: 1,
  FullSnapshot: 2,
  IncrementalSnapshot: 3,
  Meta: 4,
  Custom: 5,
  Plugin: 6,
} as const;

// Incremental snapshot source types
const IncrementalSource = {
  Mutation: 0,
  MouseMove: 1,
  MouseInteraction: 2,
  Scroll: 3,
  ViewportResize: 4,
  Input: 5,
  TouchMove: 6,
  MediaInteraction: 7,
  StyleSheetRule: 8,
  CanvasMutation: 9,
  Font: 10,
  Log: 11,
  Drag: 12,
  StyleDeclaration: 13,
  Selection: 14,
  AdoptedStyleSheet: 15,
  CustomElement: 16,
} as const;

export type RecordingStats = {
  totalEvents: number;
  fileSize: number;
  url: string | null;
  duration: number;
  viewport: { width: number; height: number } | null;
  startTime: Date | null;
  endTime: Date | null;
  eventTypes: Record<string, number>;
  interactions: {
    clicks: number;
    scrolls: number;
    inputs: number;
    mouseMoves: number;
    touchMoves: number;
  };
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
};

export const calculateStats = (events: eventWithTime[], fileSize: number): RecordingStats => {
  const stats: RecordingStats = {
    totalEvents: events.length,
    fileSize,
    url: null,
    duration: 0,
    viewport: null,
    startTime: null,
    endTime: null,
    eventTypes: {
      "Full Snapshot": 0,
      Incremental: 0,
      Meta: 0,
      Custom: 0,
      Other: 0,
    },
    interactions: {
      clicks: 0,
      scrolls: 0,
      inputs: 0,
      mouseMoves: 0,
      touchMoves: 0,
    },
  };

  if (events.length === 0) return stats;

  const timestamps = events.map((e) => e.timestamp).sort((a, b) => a - b);
  stats.startTime = new Date(timestamps[0]);
  stats.endTime = new Date(timestamps[timestamps.length - 1]);
  stats.duration = timestamps[timestamps.length - 1] - timestamps[0];

  for (const event of events) {
    // Count event types
    switch (event.type) {
      case EventType.FullSnapshot:
        stats.eventTypes["Full Snapshot"]++;
        break;
      case EventType.IncrementalSnapshot:
        stats.eventTypes["Incremental"]++;
        break;
      case EventType.Meta:
        stats.eventTypes["Meta"]++;
        break;
      case EventType.Custom:
        stats.eventTypes["Custom"]++;
        break;
      default:
        stats.eventTypes["Other"]++;
    }

    // Extract meta info
    if (event.type === EventType.Meta) {
      const data = event.data as { href?: string; width?: number; height?: number };
      if (data.href && !stats.url) {
        stats.url = data.href;
      }
      if (data.width && data.height && !stats.viewport) {
        stats.viewport = { width: data.width, height: data.height };
      }
    }

    // Count interactions from incremental snapshots
    if (event.type === EventType.IncrementalSnapshot) {
      const data = event.data as { source?: number };
      switch (data.source) {
        case IncrementalSource.MouseInteraction:
          stats.interactions.clicks++;
          break;
        case IncrementalSource.Scroll:
          stats.interactions.scrolls++;
          break;
        case IncrementalSource.Input:
          stats.interactions.inputs++;
          break;
        case IncrementalSource.MouseMove:
          stats.interactions.mouseMoves++;
          break;
        case IncrementalSource.TouchMove:
          stats.interactions.touchMoves++;
          break;
      }
    }
  }

  return stats;
};

export const StatsPanel = ({ stats }: { stats: RecordingStats }) => {
  return (
    <div className="stats-panel">
      <h3 className="stats-title">Recording Info</h3>

      <div className="stat-url">
        <span className="stat-label">URL</span>
        <span className="stat-value-url">{stats.url ?? "Unknown"}</span>
      </div>

      <div className="stats-grid">
        <div className="stat-group">
          <div className="stat-item">
            <span className="stat-label">Duration</span>
            <span className="stat-value">{formatDuration(stats.duration)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Viewport</span>
            <span className="stat-value">
              {stats.viewport ? `${stats.viewport.width} × ${stats.viewport.height}` : "Unknown"}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Recorded</span>
            <span className="stat-value">
              {stats.startTime ? stats.startTime.toLocaleDateString() : "Unknown"}
            </span>
          </div>
        </div>

        <div className="stat-group">
          <div className="stat-item">
            <span className="stat-label">Total Events</span>
            <span className="stat-value">{stats.totalEvents.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">File Size</span>
            <span className="stat-value">{formatBytes(stats.fileSize)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">DOM Mutations</span>
            <span className="stat-value">{stats.eventTypes["Incremental"].toLocaleString()}</span>
          </div>
        </div>

        <div className="stat-group">
          <div className="stat-item">
            <span className="stat-label">Clicks</span>
            <span className="stat-value">{stats.interactions.clicks.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Scrolls</span>
            <span className="stat-value">{stats.interactions.scrolls.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Inputs</span>
            <span className="stat-value">{stats.interactions.inputs.toLocaleString()}</span>
          </div>
        </div>

        <div className="stat-group">
          <div className="stat-item">
            <span className="stat-label">Mouse Moves</span>
            <span className="stat-value">{stats.interactions.mouseMoves.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Touch Moves</span>
            <span className="stat-value">{stats.interactions.touchMoves.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
