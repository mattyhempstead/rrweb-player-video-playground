import type { eventWithTime } from "@rrweb/types";
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import rrwebPlayer from "rrweb-player";
import "rrweb-player/dist/style.css";
import { EventsViewer } from "./EventsViewer";
import { calculateStats, StatsPanel } from "./StatsPanel";

export const App = () => {
  const [events, setEvents] = useState<eventWithTime[] | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<rrwebPlayer | null>(null);

  const stats = useMemo(() => {
    if (!events) return null;
    return calculateStats(events, fileSize);
  }, [events, fileSize]);

  const handleFileUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(file.size);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content !== "string") {
        setError("Failed to read file");
        return;
      }

      try {
        const parsed = JSON.parse(content) as unknown;

        // Extract events from { events: [...] } format
        if (parsed && typeof parsed === "object" && "events" in parsed) {
          const eventsData = (parsed as { events: unknown }).events;
          if (!Array.isArray(eventsData)) {
            setError("The 'events' field must be an array");
            return;
          }
          setEvents(eventsData as eventWithTime[]);
          return;
        }

        setError("JSON must have an 'events' array property");
      } catch {
        setError("Invalid JSON file");
      }
    };
    reader.onerror = () => setError("Failed to read file");
    reader.readAsText(file);
  }, []);

  const clearPlayer = useCallback(() => {
    setEvents(null);
    setFileName(null);
    setFileSize(0);
    setError(null);
    if (playerInstanceRef.current) {
      playerInstanceRef.current.pause();
      playerInstanceRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!events || !playerContainerRef.current) return;

    // Clear previous player
    if (playerInstanceRef.current) {
      playerInstanceRef.current.pause();
      playerInstanceRef.current = null;
    }
    playerContainerRef.current.innerHTML = "";

    // Create new player
    playerInstanceRef.current = new rrwebPlayer({
      target: playerContainerRef.current,
      props: {
        events,
        showController: true,
        autoPlay: false,
      },
    });

    return () => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.pause();
        playerInstanceRef.current = null;
      }
    };
  }, [events]);

  return (
    <div className="container">
      <header className="header">
        <h1>rrweb Player</h1>
        <p className="subtitle">Upload a JSON file of rrweb events to replay</p>
      </header>

      <div className="upload-section">
        <label className="upload-button">
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="file-input"
          />
          <span className="upload-icon">📁</span>
          <span>Choose JSON File</span>
        </label>

        {fileName && (
          <div className="file-info">
            <span className="file-name">{fileName}</span>
            <button onClick={clearPlayer} className="clear-button">
              ✕
            </button>
          </div>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {events && (
        <>
          <div className="player-wrapper">
            <div ref={playerContainerRef} className="player-container" />
          </div>
          {stats && <StatsPanel stats={stats} />}
          <EventsViewer events={events} />
        </>
      )}

      {!events && !error && (
        <div className="placeholder">
          <div className="placeholder-icon">🎬</div>
          <p>Upload a JSON file to start watching</p>
          <div className="format-hint">
            <p className="format-title">Expected format:</p>
            <pre className="format-code">{`{
  "events": [ ... ]
}`}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
