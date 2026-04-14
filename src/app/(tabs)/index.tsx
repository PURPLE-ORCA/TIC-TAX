import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeScreen } from '@/src/components/layout/SafeScreen';
import { Text } from '@/src/components/ui/text';
import { useFinance } from '@/src/hooks/useFinance';
import { TransactionSheet } from '@/src/components/finance/TransactionSheet';
import { Plus } from 'lucide-react-native';
import { Button, Card } from 'heroui-native';

export default function PulseTab() {
  const { safeToSpend, taxHostage, isLoading } = useFinance();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <SafeScreen safeArea="both" contentClassName="justify-between">
      {/* Header */}
      <View className="px-6 pt-12">
        <Text variant="smallBold" className="text-primary uppercase tracking-[4px] mb-4">
          Financial Pulse
        </Text>
        
        <View className="gap-4">
          <Card variant="secondary" className="p-6 rounded-3xl border border-white/5">
            <Text variant="smallBold" className="text-foreground/40 uppercase mb-1">
              Safe to Spend
            </Text>
            <Text 
              variant="title" 
              className="text-primary text-5xl font-black"
            >
              {isLoading ? '...' : formatCurrency(safeToSpend)}
            </Text>
          </Card>

          <Card variant="transparent" className="p-6 rounded-3xl border border-red-500/20 bg-red-500/5">
            <Text variant="smallBold" className="text-red-500/60 uppercase mb-1">
              Tax Hostage
            </Text>
            <Text 
              variant="subtitle" 
              className="text-red-500 font-bold"
            >
              {isLoading ? '...' : formatCurrency(taxHostage)}
            </Text>
          </Card>
        </View>
      </View>

      {/* FAB */}
      <View className="px-6 pb-6">
        <Button
          variant="primary"
          className="h-16 rounded-2xl shadow-lg shadow-primary/20"
          onPress={() => setIsSheetOpen(true)}
        >
          <Plus color="white" size={24} strokeWidth={3} />
          <Button.Label className="text-white font-bold text-lg ml-2">
            New Transaction
          </Button.Label>
        </Button>
      </View>

      <TransactionSheet 
        isOpen={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
      />
    </SafeScreen>
  );
}
