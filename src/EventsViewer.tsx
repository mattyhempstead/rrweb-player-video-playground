import type { eventWithTime } from "@rrweb/types";
import { useEffect, useRef, useState } from "react";
import jsonTree from "json-tree-viewer";
import "json-tree-viewer/libs/jsonTree/jsonTree.css";

export const EventsViewer = ({ events }: { events: eventWithTime[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    // Clear previous tree
    containerRef.current.innerHTML = "";

    // Create the tree with all events
    jsonTree.create(events, containerRef.current);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [events, isVisible]);

  return (
    <div className="events-viewer">
      <div className="events-viewer-header">
        <h3 className="events-viewer-title">Events Inspector</h3>
        <button
          className="events-viewer-btn"
          onClick={() => setIsVisible(!isVisible)}
        >
          {isVisible ? "Hide JSON" : "Show JSON"}
        </button>
      </div>
      {isVisible && <div ref={containerRef} className="events-tree-container" />}
    </div>
  );
};
