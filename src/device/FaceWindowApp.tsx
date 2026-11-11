/**
 * Mock Physical Taby face — minimal black tile.
 * Assets are 280×456; rotated -90° for upright desktop viewing.
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  DEFAULT_ANIMATION_MAP,
  durationMsFor,
  gifForAnimationId,
  LOOPING_ANIMATION_IDS,
} from "./animationMap";
import {
  FACE_LABELS,
  publishFaceState,
  readFaceState,
  subscribeFaceState,
  type FaceDisplayState,
} from "./faceBus";

const IDLE_VARIANTS = ["idle_01_loop", "idle_02_loop"] as const;
const IDLE_STILL_PAUSE_MS = 900;

function nextIdle(current: string): string {
  const pool = IDLE_VARIANTS.filter((x) => x !== current);
  return pool[Math.floor(Math.random() * pool.length)] ?? "idle_01_loop";
}

function gifSrc(id: string, token: number): string | null {
  const path = gifForAnimationId(id);
  if (!path) return null;
  return `${path}?t=${token}`;
}

/** Inline styles so popup windows can’t miss delayed CSS. */
const shellStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  margin: 0,
  padding: 0,
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#000",
  overflow: "hidden",
};

const frameStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#000",
  overflow: "hidden",
};

const gifStyle: CSSProperties = {
  display: "block",
  background: "#000",
  /* 280×456 file → after -90° reads upright on desktop */
  width: "min(100vh, 100vw * 456 / 280)",
  height: "min(100vw, 100vh * 280 / 456)",
  objectFit: "fill",
  transform: "rotate(-90deg)",
  transformOrigin: "center center",
};

export function FaceWindowApp() {
  const [face, setFace] = useState<FaceDisplayState>(
    () =>
      readFaceState() ?? {
        animationId: "idle_01_loop",
        label: "Idle",
        at: Date.now(),
        connected: false,
      }
  );
  const [token, setToken] = useState(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastId = useRef(face.animationId);

  useEffect(() => {
    const prevHtml = document.documentElement.style.background;
    const prevBody = document.body.style.background;
    document.documentElement.style.background = "#000";
    document.body.style.background = "#000";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("face-window");
    document.body.classList.add("face-window");
    return () => {
      document.documentElement.style.background = prevHtml;
      document.body.style.background = prevBody;
      document.documentElement.classList.remove("face-window");
      document.body.classList.remove("face-window");
    };
  }, []);

  useEffect(() => {
    return subscribeFaceState((s) => {
      setFace(s);
      setToken((n) => n + 1);
    });
  }, []);

  useEffect(() => {
    lastId.current = face.animationId;
    if (idleTimer.current) clearTimeout(idleTimer.current);

    const id = face.animationId || "idle_01_loop";
    const isIdle =
      id === "idle" || id === "idle_01_loop" || id === "idle_02_loop";

    if (LOOPING_ANIMATION_IDS.has(id) && !isIdle) {
      const clipMs = durationMsFor(DEFAULT_ANIMATION_MAP, id);
      const extra = DEFAULT_ANIMATION_MAP.postDoneDelayMs ?? 1200;
      idleTimer.current = setTimeout(() => {
        if (lastId.current !== id) return;
        const pick =
          IDLE_VARIANTS[Math.floor(Math.random() * IDLE_VARIANTS.length)];
        publishFaceState({
          animationId: pick,
          label: FACE_LABELS[pick] ?? "Idle",
          at: Date.now(),
          connected: true,
        });
      }, clipMs + extra);
      return () => {
        if (idleTimer.current) clearTimeout(idleTimer.current);
      };
    }

    if (isIdle) {
      const clipMs = durationMsFor(DEFAULT_ANIMATION_MAP, id, 8000);
      idleTimer.current = setTimeout(() => {
        if (lastId.current !== id) return;
        const nxt = nextIdle(id === "idle" ? "idle_01_loop" : id);
        publishFaceState({
          animationId: nxt,
          label: FACE_LABELS[nxt] ?? "Idle",
          at: Date.now(),
          connected: true,
        });
      }, clipMs + IDLE_STILL_PAUSE_MS);
    }

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [face.animationId, face.connected, token]);

  const id = face.animationId || "idle_01_loop";
  const title = FACE_LABELS[id] ?? face.label ?? id;
  const src = gifSrc(id, token);

  return (
    <div
      className={`face-shell face-shell--minimal${face.connected ? " is-connected" : ""}`}
      style={shellStyle}
      title={title}
    >
      <div className="face-stage" style={frameStyle} aria-live="polite">
        <div className="face-gif-frame" style={frameStyle}>
          {src ? (
            <img
              key={`${id}-${token}`}
              src={src}
              alt={title}
              className="face-gif"
              style={gifStyle}
              draggable={false}
            />
          ) : (
            <div className="face-gif-missing" aria-hidden>
              ···
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
