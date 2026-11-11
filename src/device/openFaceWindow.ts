/**
 * Open the mock Taby face window.
 * Prefer Tauri WebviewWindow (label "face"); fall back to window.open.
 *
 * Production note: do not rely only on ?face=1 — main.tsx also checks
 * getCurrentWebviewWindow().label === "face".
 */

const FACE_LABEL = "face";
/** Landscape window after -90° face correction (ratio ~456:280) */
const FACE_W = 342;
const FACE_H = 210;

function browserFaceUrl(): string {
  const url = new URL(window.location.href);
  url.searchParams.set("face", "1");
  url.hash = "face";
  url.searchParams.set("_fw", String(Date.now()));
  return url.toString();
}

export async function openFaceWindow(): Promise<"tauri" | "browser" | "failed"> {
  try {
    const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow");
    const existing = await WebviewWindow.getByLabel(FACE_LABEL);
    if (existing) {
      try {
        const { LogicalSize } = await import("@tauri-apps/api/dpi");
        await existing.setSize(new LogicalSize(FACE_W, FACE_H));
      } catch {
        /* optional */
      }
      await existing.setFocus();
      await existing.show();
      return "tauri";
    }

    const win = new WebviewWindow(FACE_LABEL, {
      // Relative URL — Tauri resolves against the app frontend
      url: "/?face=1#face",
      title: "Taby",
      width: FACE_W,
      height: FACE_H,
      resizable: false,
      center: true,
      focus: true,
      visible: true,
      decorations: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
    });

    await new Promise<void>((resolve) => {
      win.once("tauri://created", () => resolve());
      win.once("tauri://error", () => resolve());
      setTimeout(() => resolve(), 2000);
    });
    return "tauri";
  } catch {
    /* browser / non-Tauri */
  }

  try {
    const features = `popup=yes,width=${FACE_W},height=${FACE_H},resizable=no`;
    const w = window.open(browserFaceUrl(), FACE_LABEL, features);
    if (!w) return "failed";
    try {
      w.resizeTo(FACE_W, FACE_H);
      w.focus();
    } catch {
      /* ignore */
    }
    return "browser";
  } catch {
    return "failed";
  }
}
