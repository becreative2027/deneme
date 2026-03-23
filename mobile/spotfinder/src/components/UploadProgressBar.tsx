/**
 * UploadProgressBar — animated horizontal progress bar for media uploads.
 *
 * Usage:
 *   <UploadProgressBar progress={uploadFraction} visible={isUploading} />
 *
 * `progress` is a 0–1 fraction. The bar smoothly animates to each new value.
 * Fades out automatically when `visible` becomes false.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme';

interface Props {
  /** Upload progress 0–1 */
  progress: number;
  /** Whether the bar is shown */
  visible: boolean;
}

export function UploadProgressBar({ progress, visible }: Props) {
  const { colors } = useTheme();
  const widthAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Animate width when progress changes
  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: progress,
      useNativeDriver: false, // width % cannot use native driver
      speed: 20,
      bounciness: 0,
    }).start();
  }, [progress, widthAnim]);

  // Fade in/out based on visible
  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, opacityAnim]);

  const widthPercent = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.wrapper, { opacity: opacityAnim }]}>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: colors.primary, width: widthPercent },
          ]}
        />
        {/* Shimmer highlight */}
        <Animated.View
          style={[
            styles.shimmer,
            { width: widthPercent },
          ]}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 2,
  },
});
