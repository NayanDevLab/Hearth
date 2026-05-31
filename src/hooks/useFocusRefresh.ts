// useFocusRefresh — replaces the hasFocused+useFocusEffect boilerplate used across all list screens.
//
// First time the screen gains focus: calls `onFirstFocus` (shows shimmer/full load).
// Every subsequent focus (navigate-back after create/edit): calls `onRefresh` (quiet RefreshControl).

import { useCallback, useRef } from 'react';

import { useFocusEffect } from 'expo-router';

export function useFocusRefresh(onFirstFocus: () => void, onRefresh: () => void): void {
  const hasFocused = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!hasFocused.current) {
        hasFocused.current = true;
        onFirstFocus();
      } else {
        onRefresh();
      }
    }, [onFirstFocus, onRefresh])
  );
}
