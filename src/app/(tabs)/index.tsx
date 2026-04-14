import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { SafeScreen } from '@/src/components/layout/SafeScreen';
import { Text } from '@/src/components/ui/text';
import { CustomButton } from '@/src/components/ui/custom-button';
import { useFinance } from '@/src/hooks/useFinance';
import { TransactionSheet } from "@/src/components/finance/TransactionSheet";
import { Card } from 'heroui-native';
import { formatCurrency } from '@/src/lib/format-currency';

export default function PulseTab() {
  const { safeToSpend, taxHostage, recentTransactions, isLoading } = useFinance();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const deleteTransaction = useMutation(api.transactions.deleteTransaction);
  const markTaxesPaid = useMutation(api.transactions.markTaxesPaid);

  const handleDeleteTransaction = (id: Id<'transactions'>) => {
    Alert.alert('Delete Transaction?', undefined, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTransaction({ id });
          } catch (error) {
            console.error('Failed to delete transaction:', error);
          }
        },
      },
    ]);
  };

  const handleMarkTaxesPaid = () => {
    Alert.alert(
      'Pay the Piper?',
      'Mark all current taxes as paid? This will reset the hostage counter to 0 MAD.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await markTaxesPaid({});
            } catch (error) {
              console.error('Failed to mark taxes paid:', error);
            }
          },
        },
      ],
    );
  };

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

          <TouchableOpacity onLongPress={handleMarkTaxesPaid} delayLongPress={300}>
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
          </TouchableOpacity>
        </View>
      </View>

      {/* Trigger */}
      <View className="mt-8 mb-10">
        <CustomButton
          variant="secondary"
          label="New Transaction"
          onPress={() => setIsSheetOpen(true)}
        />
      </View>

      {/* Recent Transactions List */}
      <View className="flex-1">
        <Text className="mb-4">
          Recent Activity
        </Text>
        
        <FlatList
          data={recentTransactions}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !isLoading ? (
              <Text >
                No transactions yet.
              </Text>
            ) : null
          }
          renderItem={({ item: tx }) => (
            <TouchableOpacity
              className="flex-row justify-between py-4 border-b border-foreground/5"
              onLongPress={() => handleDeleteTransaction(tx._id)}
              delayLongPress={300}
            >
              <Text 
                variant={tx.note ? "default" : "small"} 
                className={tx.note ? "text-foreground font-semibold" : "text-foreground/80"}
              >
                {tx.note || tx.category}
              </Text>
              <Text 
                variant="smallBold" 
                className={tx.type === "IN" ? "text-green-500" : "text-foreground/40"}
              >
                {formatCurrency(tx.type === "IN" ? tx.amount : -tx.amount)}
              </Text>
            </TouchableOpacity>
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
