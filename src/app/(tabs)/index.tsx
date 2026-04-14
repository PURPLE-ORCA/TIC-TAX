import React, { useState } from 'react';
import { View, FlatList } from 'react-native';
import { SafeScreen } from '@/src/components/layout/SafeScreen';
import { Text } from '@/src/components/ui/text';
import { useFinance } from '@/src/hooks/useFinance';
import { TransactionSheet } from '@/src/components/finance/TransactionSheet';
import { Button, Card } from 'heroui-native';
import { formatCurrency } from '@/src/lib/format-currency';

export default function PulseTab() {
  const { safeToSpend, taxHostage, recentTransactions, isLoading } = useFinance();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <SafeScreen safeArea="both" contentClassName="px-6 pt-12 pb-6">
      {/* Header */}
      <View>
        <Text variant="title" className="mb-4">
          Pulse
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

      {/* Trigger */}
      <View className="mt-8 mb-10">
        <Button
          className="rounded-xl bg-primary/15 h-14"
          onPress={() => setIsSheetOpen(true)}
        >
          <Button.Label className="text-primary font-bold text-lg">
            New Transaction
          </Button.Label>
        </Button>
      </View>

      {/* Recent Transactions List */}
      <View className="flex-1">
        <Text variant="xsBold" className="text-foreground/30 uppercase tracking-[2px] mb-4">
          Recent Activity
        </Text>
        
        <FlatList
          data={recentTransactions}
          keyExtractor={(item: any) => item._id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !isLoading ? (
              <Text variant="small" className="text-foreground/20 italic mt-2">
                No transactions yet.
              </Text>
            ) : null
          }
          renderItem={({ item: tx }) => (
            <View className="flex-row justify-between py-4 border-b border-foreground/5">
              <Text variant="small" className="text-foreground/80">
                {tx.category}
              </Text>
              <Text 
                variant="smallBold" 
                className={tx.type === "IN" ? "text-green-500" : "text-foreground/40"}
              >
                {formatCurrency(tx.type === "IN" ? tx.amount : -tx.amount)}
              </Text>
            </View>
          )}
        />
      </View>

      <TransactionSheet 
        isOpen={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
      />
    </SafeScreen>
  );
}
