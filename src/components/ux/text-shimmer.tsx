import { useThemeColor } from 'heroui-native';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { Easing } from 'react-native-reanimated';
import Shimmer from "@/src/components/animations/animation/shimmer";
import { Text } from "@/src/components/ui/text";

interface TextShimmerProps {
  children: ReactNode;
  className?: string;
}

export default function TextShimmer({ children, className }: TextShimmerProps) {
  const foregroundColor = useThemeColor('foreground') as string;

  return (
    <Shimmer>
      <Shimmer.Mask
        background={<View className="flex-1 bg-muted/70" />}
        overlay={
          <Shimmer.Overlay
            width="100%"
            animation={{
              type: 'timing',
              config: { duration: 2000, easing: Easing.in(Easing.ease) },
            }}
          >
            <View
              className="flex-1"
              style={{
                experimental_backgroundImage: `linear-gradient(to right, transparent 0%, ${foregroundColor} 40%, ${foregroundColor} 60%, transparent 100%)`,
              }}
            />
          </Shimmer.Overlay>
        }
      >
        <Text className={className}>
          {children}
        </Text>
      </Shimmer.Mask>
    </Shimmer>
  );
}
