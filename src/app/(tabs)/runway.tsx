import React, { useState, useMemo } from 'react';
import { View, FlatList } from 'react-native';
import { SafeScreen } from '@/src/components/layout/SafeScreen';
import { Text } from '@/src/components/ui/text';
import { useFinance } from '@/src/hooks/useFinance';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { formatCurrency } from '@/src/lib/format-currency';
import { Button } from 'heroui-native';
import { Plus, Flame, Skull } from 'lucide-react-native';
import { SubscriptionSheet } from '@/src/components/finance/SubscriptionSheet';

export default function RunwayScreen() {
  const { safeToSpend, isLoading: financeLoading } = useFinance();
  const subscriptions = useQuery(api.subscriptions.getSubscriptions) ?? [];
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const monthlyBurn = useMemo(() => {
    return subscriptions.reduce((sum, sub) => sum + sub.monthlyCost, 0);
  }, [subscriptions]);

  const runwayMonths = useMemo(() => {
    if (monthlyBurn === 0) return Infinity;
    return safeToSpend / monthlyBurn;
  }, [safeToSpend, monthlyBurn]);

  const isCritical = runwayMonths < 2;

  const renderSubscription = ({ item }: { item: typeof subscriptions[0] }) => (
    <View className="flex-row justify-between items-center py-6 border-b border-white/5">
      <View className="flex-1 mr-4">
        <Text className="text-foreground font-bold text-lg" numberOfLines={1}>{item.name}</Text>
        <Text className="text-foreground/40 text-[10px] uppercase tracking-[2px] font-black">Recurring Parasite</Text>
      </View>
      <View className="items-end">
        <Text className="text-primary font-black text-xl">
          {formatCurrency(item.monthlyCost).replace('+ ', '')}
        </Text>
        <Text className="text-foreground/20 text-[10px] font-bold">/ MO</Text>
      </View>
    </View>
  );

  return (
    <SafeScreen safeArea="both" contentClassName="px-6">
      {/* Top Section: The Survival Clock */}
      <View className="items-center py-12 gap-2">
        <View className="flex-row items-center gap-2 mb-2">
          {isCritical ? <Skull size={14} color="#ef4444" /> : <Flame size={14} color="#22c55e" />}
          <Text className={isCritical ? "text-red-500 font-black uppercase tracking-widest text-[10px]" : "text-green-500 font-black uppercase tracking-widest text-[10px]"}>
            The Survival Clock
          </Text>
        </View>
        
        <View className="items-center">
          <Text 
            className={`text-9xl font-black tracking-tighter ${isCritical ? 'text-red-500' : 'text-foreground'}`}
          >
            {runwayMonths === Infinity ? '∞' : runwayMonths.toFixed(1)}
          </Text>
          <Text className="text-foreground/40 font-black uppercase tracking-[4px] text-[10px] -mt-2.5">
            Months of Runway
          </Text>
        </View>

        <View className="mt-10 bg-white/5 px-8 py-4 rounded-xl flex-row items-center gap-6 border border-white/5">
          <View>
            <Text className="text-foreground/30 font-black uppercase tracking-widest text-[9px] mb-1">Monthly Burn</Text>
            <Text className="text-foreground font-black text-xl">
              {formatCurrency(monthlyBurn).replace('+ ', '')}
            </Text>
          </View>
          <View className="w-px h-10 bg-white/10" />
          <View>
            <Text className="text-foreground/30 font-black uppercase tracking-widest text-[9px] mb-1">Safe Capital</Text>
            <Text className="text-foreground font-black text-xl">
              {financeLoading ? '...' : formatCurrency(safeToSpend).replace('+ ', '')}
            </Text>
          </View>
        </View>
      </View>

      {/* Middle Section: The SaaS Bleed */}
      <View className="flex-1 mt-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-foreground/40 font-black uppercase tracking-[3px] text-[10px]">
            The SaaS Bleed
          </Text>
          <View className="bg-primary/10 px-2 py-0.5 rounded-md">
            <Text className="text-primary font-black text-[9px]">
              {subscriptions.length} ACTIVE
            </Text>
          </View>
        </View>

        <FlatList
          data={subscriptions}
          renderItem={renderSubscription}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
          ListEmptyComponent={
            <View className="py-20 items-center opacity-20 border border-dashed border-white/10 rounded-3xl">
              <Text className="font-bold text-xs uppercase tracking-widest">Zero Parasites Detected</Text>
            </View>
          }
        />
      </View>

      {/* Bottom Section: Action */}
      <View className="mt-12 mb-6">
        <Button 
          variant="primary" 
          className="h-18 rounded-xl shadow-2xl shadow-primary/30 flex-row gap-3 bg-primary"
          onPress={() => setIsSheetOpen(true)}
        >
          <Plus color="white" size={20} strokeWidth={4} />
          <Button.Label className="text-white font-black text-lg uppercase tracking-widest">Add Bleed</Button.Label>
        </Button>
      </View>

      <SubscriptionSheet 
        isOpen={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
      />
    </SafeScreen>
  );
}
