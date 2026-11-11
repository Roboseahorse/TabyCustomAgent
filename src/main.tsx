import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { FaceWindowApp } from "./device/FaceWindowApp";
import "./styles/tokens.css";
import "./App.css";

function detectFaceWindow(): boolean {
  const params = new URLSearchParams(window.location.search);
  if (params.get("face") === "1" || params.get("window") === "face") return true;
  // window.open(..., "face") sets this — survives some query-string quirks
  if (window.name === "face" || window.name === "taby-face") return true;
  if (window.location.hash === "#face") return true;
  try {
    if (sessionStorage.getItem("taby-render-face") === "1") return true;
  } catch {
    /* ignore */
  }
  return false;
}

const isFaceWindow = detectFaceWindow();

if (isFaceWindow) {
  try {
    sessionStorage.setItem("taby-render-face", "1");
  } catch {
    /* ignore */
  }
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
