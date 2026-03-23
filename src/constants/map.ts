import { HEADER_HEIGHT } from "../components/BeachDetailHeader";

/** Padding (in pixels) around fitted coordinates */
export const MAP_FIT_PADDING = 80;

/** Small bounding box offset (in degrees) when user location is unavailable */
export const BEACH_BBOX_OFFSET = 0.02;

/** Default zoom level for the Denmark overview */
export const DENMARK_ZOOM = 7;

/** Zoom level when centering on the user's location */
export const LOCATE_ZOOM = 12;

/** Delay (in ms) before checking if fitToCoordinates zoomed out */
export const ZOOM_CHECK_DELAY = 500;

/** Height of the collapsed sheet header (in pixels) */
export const SHEET_HEADER_HEIGHT = HEADER_HEIGHT;

/** Minimum zoom level when selecting a beach (Google Maps zoom scale) */
export const BEACH_MIN_ZOOM = 12;

/** Minimum altitude when selecting a beach (Apple Maps — lower = more zoomed in) */
export const BEACH_MAX_ALTITUDE = 5000;

/** Maximum zoom level for recenter (prevents zooming in too close on a single point) */
export const RECENTER_MAX_ZOOM = 15;

/** Minimum altitude for recenter on Apple Maps (prevents zooming in too close) */
export const RECENTER_MIN_ALTITUDE = 1000;
