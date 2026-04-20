import { RenderIf } from "@/src/components/helpers/render-if";
import { formatCurrency } from "@/src/components/lib/format-currency";
import { PlumCard } from "@/src/components/ui/PlumCard";
import { Text } from "@/src/components/ui/text";
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

      <View className="py-4 gap-4">
        {/* Safe to Spend Card */}
        <PlumCard className="p-6">
          <Text variant="smallBold" className="mb-1">
            Safe to Spend
          </Text>
          <Text variant="subtitle">
            {isLoading ? "..." : formatCurrency(safeToSpend)}
          </Text>
        </PlumCard>

        <View className="flex flex-row gap-4">
          <TouchableOpacity
            className="flex-1"
            onLongPress={onTaxHostageLongPress}
            delayLongPress={300}
          >
            <PlumCard className="">
              <Text variant="small" className="mb-1">
                Tax Hostage
              </Text>
              <Text variant="smallBold">
                {isLoading ? "..." : formatCurrency(taxHostage)}
              </Text>
            </PlumCard>
          </TouchableOpacity>

          <RenderIf condition={pendingCapital > 0}>
            <View className="flex-1">
              <PlumCard className="">
                <Text variant="small" className="mb-1">
                  Awaiting Payment
                </Text>
                <Text variant="smallBold">
                  {isLoading ? "..." : formatCurrency(pendingCapital)}
                </Text>
              </PlumCard>
            </View>
          </RenderIf>
        </View>
      </View>
  );
}
