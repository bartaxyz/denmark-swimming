import { useEffect, useMemo } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Beach, Beaches } from "../../types";
import { useSelectedBeach } from "../state/useSelectedBeach";

export const SCALE_SELECTED = 1.3;
export const SCALE_UNSELECTED = 1;

export const HIGHLIGHT_OPACITY_SELECTED = 1;
export const HIGHLIGHT_OPACITY_UNSELECTED = 0;

export const useAnimatedMarker = (beachIds: number | number[]) => {
  const selectedBeachId = useMemo(
    () => useSelectedBeach.getState().selectedBeachId,
    []
  );
  const selected = (selectedBeachId?: number) => {
    return Array.isArray(beachIds)
      ? beachIds.some((beach) => beach === selectedBeachId)
      : beachIds === selectedBeachId;
  };

  const initialScale = selected(selectedBeachId)
    ? SCALE_SELECTED
    : SCALE_UNSELECTED;
  const initialHighlightOpacity = selected(selectedBeachId)
    ? HIGHLIGHT_OPACITY_SELECTED
    : HIGHLIGHT_OPACITY_UNSELECTED;

  const scale = useSharedValue(initialScale);
  const highlightOpacity = useSharedValue(initialHighlightOpacity);

  const update = (selectedBeachId?: number, firstRender?: boolean) => {
    const duration = firstRender ? 0 : 100;
    const isSelected = selected(selectedBeachId);

    scale.value = withTiming(isSelected ? SCALE_SELECTED : SCALE_UNSELECTED, {
      duration,
    });
    highlightOpacity.value = withTiming(
      isSelected ? HIGHLIGHT_OPACITY_SELECTED : HIGHLIGHT_OPACITY_UNSELECTED,
      {
        duration,
      }
    );
  };

  useEffect(() => {
    const unsubscribe = useSelectedBeach.subscribe(({ selectedBeachId }) =>
      update(selectedBeachId)
    );

    setTimeout(() => {
      update(useSelectedBeach.getState().selectedBeachId, true);
    }, 1000);

    return () => {
      unsubscribe();
    };
  }, []);

  const scaleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  const highlightOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: highlightOpacity.value,
    };
  });

  return {
    scaleStyle,
    highlightOpacityStyle,
  };
};
