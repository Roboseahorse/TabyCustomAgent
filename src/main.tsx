import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { FaceWindowApp } from "./device/FaceWindowApp";
import "./styles/tokens.css";
import "./App.css";

function syncDetectFaceWindow(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("face") === "1" || params.get("window") === "face") return true;
  } catch {
    /* ignore */
  }
  if (window.name === "face" || window.name === "taby-face") return true;
  if (window.location.hash === "#face" || window.location.hash.startsWith("#face"))
    return true;
  // Some Tauri builds put query in href oddly — accept any face=1 anywhere
  try {
    if (/[?&#]face=1(?:&|#|$)/.test(window.location.href)) return true;
  } catch {
    /* ignore */
  }
  return false;
}

async function tauriIsFaceWindow(): Promise<boolean> {
  try {
    const { getCurrentWebviewWindow } = await import(
      "@tauri-apps/api/webviewWindow"
    );
    const label = getCurrentWebviewWindow().label;
    return label === "face";
  } catch {
    return false;
  }
}

function mount(isFaceWindow: boolean) {
  if (isFaceWindow) {
    document.documentElement.classList.add("face-window");
    document.body.classList.add("face-window");
    document.documentElement.style.background = "#000";
    document.body.style.background = "#000";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";
    document.title = "Taby";
  }

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      {isFaceWindow ? <FaceWindowApp /> : <App />}
    </React.StrictMode>
  );
}

async function boot() {
  let isFace = syncDetectFaceWindow();
  if (!isFace) {
    isFace = await tauriIsFaceWindow();
  }
  mount(isFace);
}

void boot();
