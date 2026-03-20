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
