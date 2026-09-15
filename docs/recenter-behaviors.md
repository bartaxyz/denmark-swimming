# Map Recenter — Expected Behaviors

## Triggers

### 1. App launch (map loaded)
- **Event**: `onMapLoaded` fires on MapView
- **Behavior**: Recenter to the selected beach (if persisted from previous session). If no beach selected, show Denmark overview.

### 2. Beach selected
- **Event**: `setSelectedBeachId` called with a new beach ID
- **Behavior**: Recenter to show the beach (and user location + route if available).
- **Note**: Deselecting (clearing) does NOT recenter.

### 3. Locate button pressed
- **Event**: User taps the locate button
- **Behavior**:
  - If location available: recenter immediately.
  - If location not available: fire-and-forget permission request. Recenter immediately to beach. When location arrives, recenter again (via `.then` callback).
  - If permission denied: show alert. Still recenter to beach.

### 4. First location obtained
- **Event**: User's location becomes available for the first time (permission granted + GPS fix)
- **Behavior**: Recenter to include the user's location alongside the selected beach.
- **Note**: Subsequent location updates (user moving) should NOT trigger recenter. Only the initial acquisition matters.

### 5. Route loaded
- **Event**: Directions API returns a new route (SWR `onSuccess`)
- **Behavior**: Recenter to fit the full route polyline + beach + user location.
- **Note**: Only if the route actually changed (not a SWR revalidation returning the same data).

### 6. Sheet detent changed
- **Event**: User drags the bottom sheet to a new snap point
- **Behavior**: Recenter with updated padding to keep content visible above the sheet.
- **Note**: Skip recenter when sheet goes full-screen (detent = 1).

## Non-triggers

- **Location updates** (user moving): do NOT recenter. The map's built-in `showsUserLocation` handles the blue dot.
- **Store hydration** (`onRehydrateStorage`): do NOT recenter. The map isn't mounted yet. Use `onMapLoaded` instead.
- **Navigation back** (returning from settings): the map stays mounted in the Stack. Polyline remounts via `useFocusEffect` key trick (Android drops native overlays).

## Recenter calculation

- Uses `fitToCoordinates` with `edgePadding` — lets the map engine handle zoom natively.
- **Top padding**: safe area inset + top indicator height + `EDGE_PADDING`
- **Bottom padding**: safe area inset + sheet pixels + icon button size (when visible) + `EDGE_PADDING`
- **Side padding**: `EDGE_PADDING`
- All values derived from exported component constants, no magic numbers.
