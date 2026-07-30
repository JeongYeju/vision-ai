export type GazePoint = { x: number; y: number } | null;

export type GazeAdapter = {
  kind: "webcam" | "mock";
  start: (onPoint: (point: GazePoint) => void) => Promise<void>;
  calibrate: (x: number, y: number) => void;
  stop: () => void;
};

type WebGazerLike = {
  begin: () => Promise<void>;
  end: () => void;
  setGazeListener: (listener: (data: GazePoint) => void) => WebGazerLike;
  clearGazeListener: () => WebGazerLike;
  showVideoPreview: (show: boolean) => WebGazerLike;
  showPredictionPoints: (show: boolean) => WebGazerLike;
  saveDataAcrossSessions: (save: boolean) => WebGazerLike;
  setTracker?: (tracker: "TFFacemesh") => WebGazerLike;
  setRegression?: (regression: "ridge") => WebGazerLike;
  recordScreenPosition?: (x: number, y: number, eventType: string) => void;
};

declare global {
  interface Window {
    webgazer?: WebGazerLike;
  }
}

const WEBGAZER_URLS = [
  "https://cdn.jsdelivr.net/npm/@webgazer-ts/core@0.2.0/dist/webgazer-ts.umd.cjs",
  "https://webgazer.cs.brown.edu/webgazer.js",
  "https://cdn.jsdelivr.net/npm/webgazer@3.5.3/dist/webgazer.min.js",
] as const;

async function loadWebGazer() {
  if (window.webgazer) return window.webgazer;

  for (const url of WEBGAZER_URLS) {
    try {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = url;
        script.async = true;
        script.crossOrigin = "anonymous";
        script.dataset.webgazer = "true";
        script.onload = () => resolve();
        script.onerror = () => {
          script.remove();
          reject(new Error("load"));
        };
        document.head.appendChild(script);
      });
      if (window.webgazer) return window.webgazer;
    } catch {
      document
        .querySelectorAll<HTMLScriptElement>("script[data-webgazer]")
        .forEach((script) => script.remove());
    }
  }
  throw new Error("load");
}

export function createWebcamGazeAdapter(): GazeAdapter {
  let tracker: WebGazerLike | null = null;

  return {
    kind: "webcam",
    async start(onPoint) {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("unsupported");
      }

      tracker = await loadWebGazer();

      const requiredMethods: Array<keyof WebGazerLike> = [
        "begin",
        "end",
        "setGazeListener",
        "clearGazeListener",
        "showVideoPreview",
        "showPredictionPoints",
        "saveDataAcrossSessions",
      ];
      const missingMethod = requiredMethods.find(
        (method) => typeof tracker?.[method] !== "function",
      );
      if (missingMethod) throw new Error(`api:${missingMethod}`);

      // WebGazer owns the camera lifecycle. Opening and immediately closing a
      // second stream first can leave browsers with a stale video track.
      tracker.saveDataAcrossSessions(false);
      tracker.setTracker?.("TFFacemesh");
      tracker.setRegression?.("ridge");
      tracker.showVideoPreview(true);
      tracker.showPredictionPoints(false);
      tracker.setGazeListener(onPoint);

      try {
        await tracker.begin();
      } catch (error) {
        try {
          tracker.clearGazeListener();
          tracker.end();
        } catch {
          // Preserve the original initialization error.
        }
        tracker = null;
        throw error;
      }
    },
    calibrate(x, y) {
      tracker?.recordScreenPosition?.(x, y, "click");
    },
    stop() {
      try {
        tracker?.clearGazeListener();
        tracker?.end();
      } finally {
        tracker = null;
      }
    },
  };
}

export function createMockGazeAdapter(): GazeAdapter {
  let listener: ((event: PointerEvent) => void) | null = null;

  return {
    kind: "mock",
    async start(onPoint) {
      listener = (event) => onPoint({ x: event.clientX, y: event.clientY });
      document.addEventListener("pointermove", listener, { passive: true });
    },
    calibrate() {
      // Pointer coordinates already map directly to the viewport.
    },
    stop() {
      if (listener) document.removeEventListener("pointermove", listener);
      listener = null;
    },
  };
}
