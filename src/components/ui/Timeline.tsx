import { View } from "react-native";
import { Icon, type IconName } from "./icon";
import { Text } from "./text";

export interface TimelineItemProps {
  icon: IconName;
  iconColor?: string;
  iconBgColor?: string;
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  isFirst?: boolean;
  isLast?: boolean;
}

export function TimelineItem({
  icon,
  iconColor = "#ffffff",
  iconBgColor = "bg-plum-deep",
  title,
  subtitle,
  rightContent,
  isFirst = false,
  isLast = false,
}: TimelineItemProps) {
  return (
    <View className="flex-row">
      {/* Timeline column */}
      <View
        className="flex-col items-center mr-3 self-stretch"
      >
        {/* Top connector line */}
        {!isFirst && <View className="w-px flex-1 bg-white/10" />}
        {isFirst && <View className="flex-1" />}

        {/* Icon circle */}
        <View
          className={`size-8 rounded-full items-center justify-center shrink-0 ${iconBgColor}`}
        >
          <Icon name={icon} size={18} color={iconColor} />
        </View>

        {/* Bottom connector line */}
        {!isLast && <View className="w-px flex-1" />}
        {isLast && <View className="flex-1" />}
      </View>

      {/* Content */}
      <View className="flex-1 flex-row justify-between items-center py-2">
        <View className="flex-1">
          <Text variant="smallBold">{title}</Text>
          {subtitle && (
            <Text variant="small">
              {subtitle}
            </Text>
          )}
        </View>
        {rightContent && <View className="ml-2">{rightContent}</View>}
      </View>
    </View>
  );
}
