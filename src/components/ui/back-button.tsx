import { Button } from "heroui-native";
import { View } from "react-native";
import type { IconName } from "./icon";
import { Icon } from "./icon";

export interface BackButtonProps {
  onPress: () => void;
  variant?: "primary" | "secondary" | "tertiary";
  className?: string;
}

// ChevronLeft from Ionicons - type assertion needed due to TS strict literal types
const BACK_ICON_NAME = "chevron-left" as unknown as IconName;

export function BackButton({
  onPress,
  variant = "tertiary",
  className,
}: BackButtonProps) {
  return (
    <View className="flex-row items-center justify-between">
      <Button
        variant={variant}
        size="sm"
        isIconOnly
        onPress={onPress}
        className={className}
      >
        <Icon name={BACK_ICON_NAME} size={20} />
      </Button>
    </View>
  );
}
