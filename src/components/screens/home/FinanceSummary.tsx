import { RenderIf } from "@/src/components/helpers/render-if";
import { formatCurrency } from "@/src/components/lib/format-currency";
import { Text } from "@/src/components/ui/text";
import { Card } from "heroui-native";
import { TouchableOpacity, View } from "react-native";

export interface FinanceSummaryProps {
  safeToSpend: number;
  taxHostage: number;
  pendingCapital: number;
  isLoading: boolean;
  onTaxHostageLongPress?: () => void;
}

export function FinanceSummary({
  safeToSpend,
  taxHostage,
  pendingCapital,
  isLoading,
  onTaxHostageLongPress,
}: FinanceSummaryProps) {
  return (
    <View>
      <View className="gap-4">
        <Card variant="transparent" className="p-6 border rounded-xl">
          <Text variant="smallBold" className="text-foreground/40 mb-1">
            Safe to Spend
          </Text>
          <Text variant="subtitle">
            {isLoading ? "..." : formatCurrency(safeToSpend)}
          </Text>
        </Card>

        <TouchableOpacity
          onLongPress={onTaxHostageLongPress}
          delayLongPress={300}
        >
          <Card
            variant="transparent"
            className="p-4 rounded-xl border border-red-500/20 bg-red-500/5"
          >
            <Text variant="smallBold" className="text-red-500/60 mb-1">
              Tax Hostage
            </Text>
            <Text variant="large" className="text-red-500">
              {isLoading ? "..." : formatCurrency(taxHostage)}
            </Text>
          </Card>
        </TouchableOpacity>

        <RenderIf condition={pendingCapital > 0}>
          <Card
            variant="transparent"
            className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5"
          >
            <Text variant="smallBold" className="text-yellow-500/70 mb-1">
              Awaiting Client Payment
            </Text>
            <Text variant="large" className="text-yellow-500">
              {isLoading ? "..." : formatCurrency(pendingCapital)}
            </Text>
          </Card>
        </RenderIf>
      </View>
    </View>
  );
}