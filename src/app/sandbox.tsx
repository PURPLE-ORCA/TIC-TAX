import { api } from '@/convex/_generated/api';
import { SafeScreen } from '@/src/components/layout/SafeScreen';
import { Text } from '@/src/components/ui/text';
import { useFinance } from '@/src/hooks/useFinance';
import { formatCurrency } from '@/src/lib/format-currency';
import { useMutation } from 'convex/react';
import { router } from 'expo-router';
import { Button, Input, Label, TextField } from 'heroui-native';
import { Trash2, X } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';

type SandboxItem = {
  id: string;
  name: string;
  cost: number;
};

export default function SandboxScreen() {
  const { safeToSpend, totalBleed } = useFinance();
  const logTransaction = useMutation(api.transactions.logTransaction);

  const [cart, setCart] = useState<SandboxItem[]>([]);
  const [itemName, setItemName] = useState('');
  const [itemCost, setItemCost] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const totalCartCost = useMemo(() => cart.reduce((sum, item) => sum + item.cost, 0), [cart]);
  const remainingCapital = useMemo(() => safeToSpend - totalCartCost, [safeToSpend, totalCartCost]);
  const originalRunway = useMemo(() => safeToSpend / totalBleed, [safeToSpend, totalBleed]);
  const newRunway = useMemo(() => remainingCapital / totalBleed, [remainingCapital, totalBleed]);
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

  return (
    <SafeScreen safeArea="both" contentClassName="px-6 pt-6 pb-8 gap-6">
      <View className="flex-row items-center justify-between border border-foreground/20 bg-background px-4 py-3">
        <Text variant="smallBold">Sandbox</Text>
        <TouchableOpacity
          className="h-9 w-9 items-center justify-center border border-foreground/20"
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close sandbox"
        >
          <X size={16} color="#a1a1aa" />
        </TouchableOpacity>
      </View>

      <View className="border-2 border-red-500 bg-red-500/5 p-5">
        <Text variant="small" className="text-red-400 uppercase tracking-widest">
          Impact Panel
        </Text>
        <Text className="mt-2 text-4xl text-red-500">- {Math.max(0, runwayLostDays).toFixed(0)} Days</Text>
        <Text className="mt-2 text-foreground/70">
          Requires {formatCurrency(Math.max(0, hustleRequired)).replace('+ ', '')} in new invoices
        </Text>
      </View>

      <View className="flex-1 border border-foreground/20 p-4">
        <Text variant="smallBold" className="mb-3 uppercase tracking-widest">
          Cart
        </Text>

        <FlatList
          data={cart}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text className="text-foreground/50">No items yet. Add regret below.</Text>}
          renderItem={({ item }) => (
            <View className="mb-3 flex-row items-center justify-between border border-foreground/10 px-3 py-2">
              <View className="mr-3 flex-1">
                <Text numberOfLines={1}>{item.name}</Text>
                <Text className="text-primary">{formatCurrency(item.cost).replace('+ ', '')}</Text>
              </View>
              <Button variant="danger" size="sm" onPress={() => removeFromSandbox(item.id)}>
                <Trash2 size={14} color="#ffffff" />
                <Button.Label className="ml-1">Remove</Button.Label>
              </Button>
            </View>
          )}
        />
      </View>

      <View className="gap-3 border border-foreground/20 p-4">
        <Text variant="smallBold" className="uppercase tracking-widest">
          Input Panel
        </Text>
        <TextField>
          <Label>Item Name</Label>
          <Input
            placeholder="New headset"
            value={itemName}
            onChangeText={setItemName}
            selectionColorClassName="accent-primary"
          />
        </TextField>
        <TextField>
          <Label>Cost (MAD)</Label>
          <Input
            placeholder="499"
            value={itemCost}
            onChangeText={setItemCost}
            keyboardType="decimal-pad"
            selectionColorClassName="accent-primary"
          />
        </TextField>
        <Button variant="secondary" onPress={addToSandbox}>
          <Button.Label>Add to Sandbox</Button.Label>
        </Button>
      </View>

      <View className="gap-1 border border-primary bg-primary/10 p-4">
        <Text className="text-foreground/70">Remaining Capital: {formatCurrency(remainingCapital)}</Text>
        <Text className="text-foreground/70">Original Runway: {Number.isFinite(originalRunway) ? originalRunway.toFixed(2) : 'INF'} mo</Text>
        <Text className="text-foreground/70">New Runway: {Number.isFinite(newRunway) ? newRunway.toFixed(2) : 'INF'} mo</Text>
        <Button
          variant="primary"
          className="mt-2"
          onPress={executeTrade}
          isDisabled={cart.length === 0 || isExecuting}
        >
          <Button.Label>{isExecuting ? 'Executing...' : 'Execute Trade'}</Button.Label>
        </Button>
      </View>
    </SafeScreen>
  );
}
