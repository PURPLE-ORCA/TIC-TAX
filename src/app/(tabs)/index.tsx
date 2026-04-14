import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeScreen } from '@/src/components/layout/SafeScreen';
import { Text } from '@/src/components/ui/text';
import { useFinance } from '@/src/hooks/useFinance';
import { TransactionSheet } from '@/src/components/finance/TransactionSheet';
import { Plus } from 'lucide-react-native';
import { Button, Card } from 'heroui-native';
import { formatCurrency } from '@/src/lib/format-currency';

export default function PulseTab() {
  const { safeToSpend, taxHostage, isLoading } = useFinance();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <SafeScreen safeArea="both" contentClassName="justify-between">
      {/* Header */}
      <View className="px-6 pt-12">
        <Text variant="title" className="mb-4">
          Financial Pulse
        </Text>
        
        <View className="gap-4">
          <Card variant="transparent" className="p-6 border rounded-xl">
            <Text variant="smallBold" className="text-foreground/40 mb-1">
              Safe to Spend
            </Text>
            <Text 
              variant="subtitle" 
            >
              {isLoading ? '...' : formatCurrency(safeToSpend)}
            </Text>
          </Card>

          <Card variant="transparent" className="p-6 rounded-xl border border-red-500/20 bg-red-500/5">
            <Text variant="smallBold" className="text-red-500/60 mb-1">
              Tax Hostage
            </Text>
            <Text 
              variant="subtitle" 
              className="text-red-500"
            >
              {isLoading ? '...' : formatCurrency(taxHostage)}
            </Text>
          </Card>
        </View>
      </View>

      {/* FAB */}
      <View className="px-6 pb-6">
        <Button
          variant="tertiary"
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