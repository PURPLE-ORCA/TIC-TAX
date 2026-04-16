import { Flame, Skull } from "lucide-react-native";
import { View } from "react-native";

import { Text } from "@/src/components/ui/text";

export interface SurvivalClockProps {
  runwayMonths: number;
  monthlyBurn: number;
  safeToSpend: number;
  financeLoading: boolean;
  isCritical: boolean;
  formatRunway: (months: number) => string;
  formatCurrency: (amount: number) => string;
}

export function SurvivalClock({
  runwayMonths,
  monthlyBurn,
  safeToSpend,
  financeLoading,
  isCritical,
  formatRunway,
  formatCurrency,
}: SurvivalClockProps) {
  return (
    <View className="items-center py-2 gap-2">
      <View className="flex-row items-center gap-2 mb-2">
        {isCritical ? (
          <Skull size={14} color="#ef4444" />
        ) : (
          <Flame size={14} color="#22c55e" />
        )}
        <Text
          className={
            isCritical
              ? "text-red-500 tracking-widest text-[10px]"
              : "text-green-500 tracking-widest text-[10px]"
          }
        >
          The Survival Clock
        </Text>
      </View>

      <View className="items-center">
        <Text
          className={`text-8xl tracking-tighter ${isCritical ? "text-red-500" : "text-foreground"}`}
        >
          {formatRunway(runwayMonths)}
        </Text>
        <Text>Survival Time</Text>
      </View>

      <View className="border-primary px-8 py-4 rounded-xl flex-row items-center gap-6 border">
        <View>
          <Text variant="small">Monthly Burn</Text>
          <Text className="text-foreground text-xl">
            {formatCurrency(monthlyBurn).replace("+ ", "")}
          </Text>
        </View>
        <View className="w-px h-10 bg-primary" />
        <View>
          <Text variant="small">Safe Capital</Text>
          <Text className="text-foreground text-xl">
            {financeLoading
              ? "..."
              : formatCurrency(safeToSpend).replace("+ ", "")}
          </Text>
        </View>
      </View>
    </View>
  );
}