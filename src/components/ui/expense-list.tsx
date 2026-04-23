import { RenderIf } from "@/src/components/helpers/render-if";
import { Text } from "@/src/components/ui/text";
import { Chip } from "heroui-native";
import type React from "react";
import { FlatList, View } from "react-native";

interface ExpenseListProps<T> {
  data: readonly T[];
  keyExtractor: (item: T) => string;
  title?: string;
  badge?: React.ReactNode;
  isLoading?: boolean;
  scrollEnabled?: boolean;
  renderItem: ({ item }: { item: T }) => React.ReactElement | null;
}

export function ExpenseList<T>({
  data,
  keyExtractor,
  title,
  badge,
  isLoading,
  scrollEnabled = true,
  renderItem,
}: ExpenseListProps<T>) {
  return (
    <View className="flex-1 py-4">
      <RenderIf condition={!!title}>
        <View className="flex-row items-center justify-between mb-2">
          <Text variant="large">{title}</Text>
          <RenderIf condition={!!badge}>
            <Chip variant="soft" color="danger" size="md">
              <Chip.Label>{badge}</Chip.Label>
            </Chip>
          </RenderIf>
        </View>
      </RenderIf>
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        ListEmptyComponent={
          <RenderIf condition={!isLoading}>
            <View className="py-40 items-center">
              <Text variant="small" className="text-foreground/20">
                No Items Yet
              </Text>
            </View>
          </RenderIf>
        }
        renderItem={renderItem}
      />
    </View>
  );
}

export default ExpenseList;
