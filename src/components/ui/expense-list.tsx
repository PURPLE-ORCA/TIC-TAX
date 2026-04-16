import type React from "react";
import { FlatList, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { RenderIf } from "@/src/components/helpers/render-if";

interface ExpenseListProps<T> {
  data: readonly T[];
  keyExtractor: (item: T) => string;
  title?: string;
  isLoading?: boolean;
  scrollEnabled?: boolean;
  ListEmptyComponent?: React.ReactNode;
  renderItem: ({ item }: { item: T }) => React.ReactElement | null;
}

export function ExpenseList<T>({
  data,
  keyExtractor,
  title,
  isLoading,
  scrollEnabled = true,
  ListEmptyComponent,
  renderItem,
}: ExpenseListProps<T>) {
  return (
    <View className="flex-1">
      <RenderIf condition={!!title}>
        <Text variant="smallBold" className="mb-2">
          {title}
        </Text>
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