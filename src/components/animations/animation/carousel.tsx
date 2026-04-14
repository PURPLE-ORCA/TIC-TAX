import { type ReactNode } from 'react';
import { Pressable, useWindowDimensions, type ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

type CarouselConfig = {
  horizontalPadding?: number;
  visibleItems?: number;
  peekRatio?: number;
  gap?: number;
};

type CarouselProps<T> = {
  data: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T, index: number) => string;
  onItemPress?: (item: T, index: number) => void;
  config?: CarouselConfig;
  snap?: boolean;
  activeScale?: number;
  contentContainerStyle?: ViewStyle;
};

const INACTIVE_SCALE_FACTOR = 0.95;

const DEFAULTS: Required<CarouselConfig> = {
  horizontalPadding: 8,
  visibleItems: 2,
  peekRatio: 0.15,
  gap: 6,
};

function Carousel<T>({
  data,
  renderItem,
  keyExtractor,
  onItemPress,
  config,
  snap,
  activeScale = 1,
  contentContainerStyle,
}: CarouselProps<T>) {
  const { width: screenWidth } = useWindowDimensions();
  const scrollX = useSharedValue(0);

  const { horizontalPadding, visibleItems, peekRatio, gap } = { ...DEFAULTS, ...config };

  const availableWidth = screenWidth - horizontalPadding * 2;
  const itemWidth = availableWidth / (visibleItems + peekRatio * 2);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.set(e.contentOffset.x);
    },
  });

  return (
    <Animated.ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="items-start pb-2"
      contentContainerStyle={[{ paddingHorizontal: horizontalPadding, gap }, contentContainerStyle]}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      {...(snap && {
        snapToInterval: itemWidth + gap,
        decelerationRate: 'fast',
        disableIntervalMomentum: true,
      })}
    >
      {Array.isArray(data) &&
        data.map((item, index) => (
          <CarouselItem
            key={keyExtractor(item, index)}
            item={item}
            index={index}
            scrollX={scrollX}
            itemWidth={itemWidth}
            gap={gap}
            activeScale={activeScale}
            renderItem={renderItem}
            onPress={onItemPress}
          />
        ))}
    </Animated.ScrollView>
  );
}

// ── Item ──────────────────────────────────────────────────

type CarouselItemProps<T> = {
  item: T;
  index: number;
  scrollX: SharedValue<number>;
  itemWidth: number;
  gap: number;
  activeScale: number;
  renderItem: (item: T, index: number) => ReactNode;
  onPress?: (item: T, index: number) => void;
};

function CarouselItem<T>({
  item,
  index,
  scrollX,
  itemWidth,
  gap,
  activeScale,
  renderItem,
  onPress,
}: CarouselItemProps<T>) {
  const inactiveScale = activeScale * INACTIVE_SCALE_FACTOR;

  const animatedStyle = useAnimatedStyle(() => {
    const offset = index * (itemWidth + gap);

    const scale = interpolate(
      scrollX.get(),
      [offset - itemWidth, offset, offset + itemWidth],
      [inactiveScale, activeScale, inactiveScale],
      'clamp',
    );

    return { transform: [{ scale }] };
  });

  return (
    <Animated.View style={[{ width: itemWidth }, animatedStyle]}>
      <Pressable
        onPress={onPress ? () => onPress(item, index) : undefined}
        className="flex-1 rounded-3xl overflow-hidden"
      >
        {renderItem(item, index)}
      </Pressable>
    </Animated.View>
  );
}

export default Carousel;
export type { CarouselProps, CarouselConfig };
