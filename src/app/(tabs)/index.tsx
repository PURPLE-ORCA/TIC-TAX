import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { SafeScreen } from '@/src/components/layout/SafeScreen';
import { Text } from '@/src/components/ui/text';
import { useFinance } from '@/src/hooks/useFinance';
import { TransactionSheet } from '@/src/components/finance/TransactionSheet';
import { Plus } from 'lucide-react-native';

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
      {/* Top Section: The Reality Check */}
      <View className="mt-20 px-4">
        <Text className="text-white/40 uppercase font-black tracking-widest mb-2">
          Safe to Spend
        </Text>
        <Text 
          variant="title" 
          className="text-white text-[64px] leading-18 font-black"
        >
          {isLoading ? '...' : formatCurrency(safeToSpend)}
        </Text>
        
        <View className="mt-8 border-t-4 border-red-600 pt-4">
          <Text className="text-red-600 uppercase font-black tracking-widest mb-1">
            Tax Hostage
          </Text>
          <Text 
            variant="subtitle" 
            className="text-red-600 font-black text-4xl"
          >
            {isLoading ? '...' : formatCurrency(taxHostage)}
          </Text>
        </View>
      </View>

      {/* FAB: Locked to bottom center */}
      <View className="absolute bottom-10 left-0 right-0 items-center">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsSheetOpen(true)}
          className="bg-black border-4 border-white w-20 h-20 items-center justify-center"
          style={{
            shadowColor: '#FFFFFF',
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 8,
          }}
        >
          <Plus color="white" size={40} strokeWidth={4} />
        </TouchableOpacity>
      </View>

      <TransactionSheet 
        isOpen={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
      />
    </SafeScreen>
  );
}
