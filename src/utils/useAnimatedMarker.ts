import { useEffect, useMemo } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Beach, Beaches } from "../../types";
import { useSelectedBeach } from "../state/useSelectedBeach";

const SCALE_SELECTED = 1.3;
const SCALE_UNSELECTED = 1;

const HIGHLIGHT_OPACITY_SELECTED = 1;
const HIGHLIGHT_OPACITY_UNSELECTED = 0;

export const useAnimatedMarker = (beaches: Beach | Beaches, log?: boolean) => {
  const selectedBeachId = useMemo(
    () => useSelectedBeach.getState().selectedBeachId,
    []
  );
  const selected = (selectedBeachId?: number) => {
    return Array.isArray(beaches)
      ? beaches.some((beach) => beach.id === selectedBeachId)
      : beaches.id === selectedBeachId;
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
    scale,
    highlightOpacity,
    scaleStyle,
    highlightOpacityStyle,
  };
};
