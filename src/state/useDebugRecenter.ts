import { create } from "zustand";

interface DebugRecenterState {
  /** Points used for zoom calculation */
  fitPoints: { latitude: number; longitude: number }[];
  /** Computed center before sheet offset */
  center: { latitude: number; longitude: number } | null;
  /** Computed center after sheet offset */
  offsetCenter: { latitude: number; longitude: number } | null;
  /** Available height in pixels (above sheet) */
  availableHeight: number;
  /** Screen height in pixels */
  screenHeight: number;
  /** Sheet fraction (0-1) */
  sheetFraction: number;
  /** Target zoom from zoomToFitPoints */
  targetZoom: number;
  /** Current camera zoom */
  currentZoom: number;
  /** Final zoom used */
  finalZoom: number;
  /** Whether route was detected */
  hasRoute: boolean;
  /** Number of points collected */
  pointCount: number;
  /** Edge padding passed to fitToCoordinates */
  edgePadding: { top: number; right: number; bottom: number; left: number };

  setDebugInfo: (info: Partial<DebugRecenterState>) => void;
}

export const useDebugRecenter = create<DebugRecenterState>((set) => ({
  fitPoints: [],
  center: null,
  offsetCenter: null,
  availableHeight: 0,
  screenHeight: 0,
  sheetFraction: 0,
  targetZoom: 0,
  currentZoom: 0,
  finalZoom: 0,
  hasRoute: false,
  pointCount: 0,
  edgePadding: { top: 0, right: 0, bottom: 0, left: 0 },
  setDebugInfo: (info) => set(info),
}));
