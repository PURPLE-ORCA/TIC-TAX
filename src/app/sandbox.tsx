import { api } from '@/convex/_generated/api';
import { SafeScreen } from '@/src/components/layout/SafeScreen';
import { ExpenseList } from '@/src/components/ui/expense-list';
import { CustomButton } from '@/src/components/ui/custom-button';
import { Text } from '@/src/components/ui/text';
import { useFinance } from '@/src/components/hooks/useFinance';
import { formatCurrency } from '@/src/components/lib/format-currency';
import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import { Button, Input, Label, TextField } from 'heroui-native';
import { Skull, X, Zap } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

type SandboxItem = {
  id: string;
  name: string;
  cost: number;
};

export default function SandboxScreen() {
  const router = useRouter();
  const { safeToSpend, totalBleed } = useFinance();
  const logTransaction = useMutation(api.transactions.logTransaction);

  const [cart, setCart] = useState<SandboxItem[]>([]);
  const [itemName, setItemName] = useState('');
  const [itemCost, setItemCost] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const totalCartCost = useMemo(() => cart.reduce((sum, item) => sum + item.cost, 0), [cart]);
  const remainingCapital = useMemo(() => safeToSpend - totalCartCost, [safeToSpend, totalCartCost]);
  const originalRunway = useMemo(() => totalBleed > 0 ? safeToSpend / totalBleed : 0, [safeToSpend, totalBleed]);
  const newRunway = useMemo(() => totalBleed > 0 ? remainingCapital / totalBleed : 0, [remainingCapital, totalBleed]);
  const runwayLostDays = useMemo(() => (originalRunway - newRunway) * 30, [originalRunway, newRunway]);
  const hustleRequired = useMemo(() => totalCartCost / 0.99, [totalCartCost]);

  const addToSandbox = () => {
    const cleanName = itemName.trim();
    const cost = Number.parseFloat(itemCost);
    if (!cleanName || Number.isNaN(cost) || cost <= 0) return;

    const nextItem: SandboxItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: cleanName,
      cost,
    };

    setCart((prev) => [...prev, nextItem]);
    setItemName('');
    setItemCost('');
  };

  const removeFromSandbox = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const executeTrade = async () => {
    if (cart.length === 0 || isExecuting) return;

    setIsExecuting(true);
    try {
      await Promise.all(
        cart.map((item) =>
          logTransaction({
            type: 'OUT',
            amount: item.cost,
            category: 'Sandbox',
            note: item.name,
          }),
        ),
      );
      router.back();
    } catch (error) {
      console.error('Failed to execute sandbox trade:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const renderCartItem = ({ item }: { item: SandboxItem }) => (
    <TouchableOpacity
      className="flex-row justify-between items-center py-4 border-b border-foreground/5"
      onLongPress={() => removeFromSandbox(item.id)}
      delayLongPress={300}
    >
      <View className="flex-1 mr-4">
        <Text numberOfLines={1}>{item.name}</Text>
      </View>
      <View className="items-end">
        <Text variant="price" className="text-red-500">
          -{formatCurrency(item.cost).replace("+ ", "")}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeScreen safeArea="both">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <Button 
          variant="tertiary" 
          size="sm" 
          onPress={() => router.back()}
        >
          <X size={20} color="#a1a1aa" />
        </Button>
      </View>

      {/* Impact Section: The Opportunity Cost */}
      <View className="items-center py-4 gap-2">
        <View className="flex-row items-center gap-2 mb-2">
          <Skull size={14} color="#ef4444" />
          <Text variant="small" className="text-red-500 font-bold">
            OPPORTUNITY COST
          </Text>
        </View>

        <View className="items-center">
          <Text
          variant='title'
            className="text-red-500 font-bold"
          >
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
      </View>

      {/* Middle Section: The Regret List */}
      <View className="flex-1 mt-6">
        <ExpenseList
          data={cart}
          keyExtractor={(item) => item.id}
          title="The Regret List"
          badge={`${cart.length} ITEMS`}
          renderItem={renderCartItem}
        />
      </View>

      {/* Bottom Section: Input & Action */}
      <View className="gap-4 pt-6">
        <View className="flex-row gap-3">
          <View className="flex-1">
            <TextField>
              <Label>Item</Label>
              <Input
                placeholder="New headset"
                value={itemName}
                onChangeText={setItemName}
              />
            </TextField>
          </View>
          <View className="flex-1">
            <TextField>
              <Label>Cost </Label>
              <Input
                placeholder="499"
                value={itemCost}
                onChangeText={setItemCost}
                keyboardType="decimal-pad"
              />
            </TextField>
          </View>
        </View>

        <CustomButton
          variant="secondary"
          label="Add to Sandbox"
          onPress={addToSandbox}
        />

        <CustomButton
          variant="primary"
          label={isExecuting ? 'Executing...' : 'Execute Trade'}
          onPress={executeTrade}
          isDisabled={cart.length === 0 || isExecuting}
        />
      </View>
    </SafeScreen>
  );
}
