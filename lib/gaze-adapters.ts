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
  recordScreenPosition?: (x: number, y: number, eventType: string) => void;
};

declare global {
  interface Window {
    webgazer?: WebGazerLike;
  }
}

const WEBGAZER_URL =
  "https://cdn.jsdelivr.net/npm/webgazer@3.5.3/dist/webgazer.min.js";

async function loadWebGazer() {
  if (window.webgazer) return window.webgazer;

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-webgazer]",
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("load")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = WEBGAZER_URL;
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

  if (!window.webgazer) throw new Error("load");
  return window.webgazer;
}

export function createWebcamGazeAdapter(): GazeAdapter {
  let tracker: WebGazerLike | null = null;

  return {
    kind: "webcam",
    async start(onPoint) {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("unsupported");
      }

      const permissionStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      permissionStream.getTracks().forEach((track) => track.stop());

      tracker = await loadWebGazer();
      tracker
        .saveDataAcrossSessions(false)
        .showVideoPreview(true)
        .showPredictionPoints(false)
        .setGazeListener(onPoint);
      await tracker.begin();
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
