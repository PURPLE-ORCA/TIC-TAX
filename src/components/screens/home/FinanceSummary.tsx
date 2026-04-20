import { LottieLoading } from "@/src/components/animations/LottieLoading";
import { RenderIf } from "@/src/components/helpers/render-if";
import { formatCurrencyNoSign } from "@/src/components/lib/format-currency";
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
          <View className="flex flex-row justify-between items-center">
            <View>
              <Text variant="smallBold" className="mb-1">
                Safe to Spend
              </Text>
              <Text variant="subtitle">
                {isLoading ? "..." : formatCurrencyNoSign(safeToSpend)}
              </Text>
            </View>
              <LottieLoading size={100} />
          </View>
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
                {isLoading ? "..." : formatCurrencyNoSign(taxHostage)}
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
                  {isLoading ? "..." : formatCurrencyNoSign(pendingCapital)}
                </Text>
              </PlumCard>
            </View>
          </RenderIf>
        </View>
      </View>
  );
}
