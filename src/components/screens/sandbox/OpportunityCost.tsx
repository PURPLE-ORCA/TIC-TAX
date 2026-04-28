import { Text } from '@/src/components/ui/text';
import { Skull } from 'lucide-react-native';
import type React from 'react';
import { View } from 'react-native';

export interface OpportunityCostProps {
  runwayLostDays: number;
  hustleRequired: number;
  remainingCapital: number;
  safeToSpend: number;
  totalCartCost: number;
  formatCurrency: (value: number) => string;
}

export function OpportunityCost({
  runwayLostDays,
  hustleRequired,
  remainingCapital,
  safeToSpend,
  totalCartCost,
  formatCurrency,
}: OpportunityCostProps): React.JSX.Element {
  return (
    <View className="items-center py-4 gap-2">
      <View className="flex-row items-center gap-2 mb-2">
        <Skull size={14} color="#ef4444" />
        <Text variant="small" className="text-red-500 font-bold">
          OPPORTUNITY COST
        </Text>
      </View>

      <View className="items-center">
        <Text variant="title" className="text-red-500 font-bold">
          -{Math.max(0, runwayLostDays).toFixed(0)}
        </Text>
        <Text variant="smallBold" className="text-red-500/60 uppercase tracking-widest">
          Days of Survival Lost
        </Text>
      </View>

      <View className="mt-2 px-6 py-2 rounded-2xl bg-foreground/5 items-center">
        <Text variant="xs" className="text-center">
          Requires {formatCurrency(Math.max(0, hustleRequired)).replace('+ ', '')} in new invoices to offset
        </Text>
      </View>

      <View className="mt-4 px-6 py-3 rounded-2xl bg-emerald-500/10 items-center">
        <Text variant="smallBold" className="text-emerald-400">
          {formatCurrency(Math.max(0, remainingCapital))}
        </Text>
        <Text variant="xs" className="text-center text-white/40">
          {formatCurrency(safeToSpend).replace('+ ', '')} - {formatCurrency(totalCartCost).replace('+ ', '')}
        </Text>
      </View>
    </View>
  );
}