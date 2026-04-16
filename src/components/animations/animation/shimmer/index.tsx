import MaskedView from '@react-native-masked-view/masked-view';
import { createContext, type Ref, use } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import { styles } from './styles';
import type {
  ShimmerContextValue,
  ShimmerMaskProps,
  ShimmerOverlayProps,
  ShimmerProps,
} from './types';
import { useShimmerAnimation } from './use-shimmer-animation';
import { useTrackDistance } from './use-track-distance';

export const ShimmerContext = createContext<ShimmerContextValue | null>(null);

const useShimmer = (): ShimmerContextValue => {
  const context = use(ShimmerContext);
  if (!context) {
    throw new Error('useShimmer must be used within Shimmer component');
  }
  return context;
};

const overlayContainerStyle = {
  alignItems: 'center',
  justifyContent: 'center',
} as const;

const debugArrowStyle = {
  position: 'absolute',
  backgroundColor: 'transparent',
  borderStyle: 'solid',
  borderLeftWidth: 18,
  borderTopWidth: 8,
  borderBottomWidth: 8,
  borderLeftColor: 'green',
  borderTopColor: 'transparent',
  borderBottomColor: 'transparent',
} as const;

/** Root component. Measures its own dimensions and provides context to children. */
function ShimmerRoot({ ref, debug = false, children, style, onLayout, ...props }: ShimmerProps) {
  const containerWidth = useSharedValue(0);
  const containerHeight = useSharedValue(0);

  const containerDiagonal = useDerivedValue(() => {
    const width = containerWidth.get();
    const height = containerHeight.get();

    if (width <= 0 || height <= 0) return 0;
    return Math.sqrt(width * width + height * height);
  });

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    containerWidth.set(width);
    containerHeight.set(height);
    onLayout?.(event);
  };

  const contextValue: ShimmerContextValue = {
    containerWidth,
    containerHeight,
    containerDiagonal,
    debug,
  };

  return (
    <ShimmerContext value={contextValue}>
      <View
        ref={ref}
        style={[styles.container, style, debug && styles.containerDebug]}
        onLayout={handleContainerLayout}
        {...props}
      >
        {children}
      </View>
    </ShimmerContext>
  );
}

ShimmerRoot.displayName = 'Shimmer';

/** Animated overlay that sweeps across the Shimmer container. */
function ShimmerOverlay({
  ref,
  children,
  width,
  trackAngle = 0,
  overlayAngle = 0,
  duration,
  initialDelay,
  repeatDelay,
  animation,
  progress: externalProgress,
  onProgress,
}: ShimmerOverlayProps & { ref?: Ref<Animated.View> }) {
  const { containerWidth, containerHeight, debug } = useShimmer();

  const overlayWidth = useDerivedValue(() => {
    if (typeof width === 'number') {
      return width;
    }
    const percentage = Number.parseFloat(width);
    return (containerWidth.get() * percentage) / 100;
  });

  const internalProgress = useSharedValue(0);
  const activeProgress = externalProgress ?? internalProgress;
  const autoPlay = externalProgress === undefined;

  const trackDistance = useTrackDistance({ containerWidth, containerHeight, trackAngle });

  const { animatedStyle, rotateContainerHeight } = useShimmerAnimation({
    trackAngle,
    overlayAngle,
    containerWidth,
    containerHeight,
    overlayWidth,
    trackDistance,
    progress: activeProgress,
    duration,
    initialDelay,
    repeatDelay,
    animation,
    autoPlay,
  });

  const trackSizeStyle = useAnimatedStyle(() => ({
    width: trackDistance.get(),
  }));

  const rotateSizeStyle = useAnimatedStyle(() => ({
    width: overlayWidth.get(),
    height: rotateContainerHeight.get(),
  }));

  useAnimatedReaction(
    () => activeProgress.get(),
    (currentProgress) => {
      if (!onProgress) return;
      onProgress.set(currentProgress);
    },
  );

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          ...overlayContainerStyle,
          transform: [{ rotate: `${trackAngle}deg` }],
        },
      ]}
      pointerEvents="none"
    >
      <Animated.View style={[trackSizeStyle, debug && styles.trackDebug]}>
        <Animated.View
          ref={ref}
          style={[styles.translateContainer, animatedStyle, debug && styles.overlayDebug]}
        >
          <Animated.View
            style={[
              styles.rotateContainer,
              rotateSizeStyle,
              { transform: [{ rotate: `${overlayAngle}deg` }] },
            ]}
          >
            {children}
          </Animated.View>
        </Animated.View>
      </Animated.View>
      {debug ? <View style={debugArrowStyle} /> : null}
    </View>
  );
}

ShimmerOverlay.displayName = 'Shimmer.Overlay';

/**
 * Clips the overlay to children's alpha channel via MaskedView.
 * Children must use opaque colors (e.g. text-black) for the mask to work.
 */
const ShimmerMask = ({ children, overlay, background }: ShimmerMaskProps) => {
  const { debug } = useShimmer();

  return (
    <>
      <MaskedView maskElement={children}>
        <View
          style={styles.maskSizer}
          pointerEvents="none"
          accessible={false}
          accessibilityElementsHidden={true}
          importantForAccessibility="no-hide-descendants"
        >
          {children}
        </View>
        {background !== undefined && <View style={StyleSheet.absoluteFill}>{background}</View>}
        {debug ? null : overlay}
      </MaskedView>
      {debug ? overlay : null}
    </>
  );
};

ShimmerMask.displayName = 'Shimmer.Mask';

const Shimmer = Object.assign(ShimmerRoot, {
  Overlay: ShimmerOverlay,
  Mask: ShimmerMask,
});

export default Shimmer;
