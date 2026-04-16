import type React from "react";
import { FlatList, View } from "react-native";
import { Chip } from "heroui-native";
import { Text } from "@/src/components/ui/text";
import { RenderIf } from "@/src/components/helpers/render-if";

interface ExpenseListProps<T> {
  data: readonly T[];
  keyExtractor: (item: T) => string;
  title?: string;
  badge?: React.ReactNode;
  isLoading?: boolean;
  scrollEnabled?: boolean;
  ListEmptyComponent?: React.ReactNode;
  renderItem: ({ item }: { item: T }) => React.ReactElement | null;
}

export function ExpenseList<T>({
  data,
  keyExtractor,
  title,
  badge,
  isLoading,
  scrollEnabled = true,
  ListEmptyComponent,
  renderItem,
}: ExpenseListProps<T>) {
  return (
    <View className="flex-1">
      <RenderIf condition={!!title}>
        <View className="flex-row items-center justify-between mb-2">
          <Text variant="smallBold">{title}</Text>
          <RenderIf condition={!!badge}>
            <Chip variant="soft" size="sm">
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
            {ListEmptyComponent || <Text>No items yet.</Text>}
          </RenderIf>
        }
        renderItem={renderItem}
      />
    </View>
  );
}

export default ExpenseList;