import { api } from "@/convex/_generated/api";
import { SubscriptionSheet } from "@/src/components/finance/SubscriptionSheet";
import { DeleteSubscriptionDialog } from "@/src/components/screens/runway/DeleteSubscriptionDialog";
import { ExpenseList } from "@/src/components/ui/expense-list";
import { useFinance } from "@/src/components/hooks/useFinance";
import { SafeScreen } from "@/src/components/layout/SafeScreen";
import { formatCurrency } from "@/src/components/lib/format-currency";
import { formatRunway } from "@/src/components/lib/format-runway";
import { CustomButton } from "@/src/components/ui/custom-button";
import { Text } from "@/src/components/ui/text";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { Calculator, Flame, Skull } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";

export default function RunwayScreen() {
  const router = useRouter();
  const { safeToSpend, isLoading: financeLoading } = useFinance();
  const subscriptions = useQuery(api.subscriptions.getSubscriptions) ?? [];
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<
    (typeof subscriptions)[number]["_id"] | null
  >(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteSubscription = useMutation(api.subscriptions.deleteSubscription);

  const openDeleteDialog = (id: (typeof subscriptions)[number]["_id"]) => {
    setPendingDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDialogChange = (open: boolean) => {
    setIsDeleteDialogOpen(open);
    if (!open) setPendingDeleteId(null);
  };

  const confirmDeleteSubscription = async () => {
    if (!pendingDeleteId || isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteSubscription({ id: pendingDeleteId });
      setIsDeleteDialogOpen(false);
      setPendingDeleteId(null);
    } catch (error) {
      console.error("Failed to delete subscription:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const monthlyBurn = useMemo(() => {
    return subscriptions.reduce((sum, sub) => sum + sub.monthlyCost, 0);
  }, [subscriptions]);

  const runwayMonths = useMemo(() => {
    if (monthlyBurn === 0) return Number.POSITIVE_INFINITY;
    return safeToSpend / monthlyBurn;
  }, [safeToSpend, monthlyBurn]);

  const isCritical = runwayMonths < 2;

  const renderSubscription = ({
    item,
  }: {
    item: (typeof subscriptions)[0];
  }) => (
    <TouchableOpacity
      className="flex-row justify-between items-center py-2 border-b border-white/5"
      onLongPress={() => openDeleteDialog(item._id)}
      delayLongPress={300}
    >
      <View className="flex-1 mr-4">
        <Text numberOfLines={1}>{item.name}</Text>
      </View>
      <View className="items-end">
        <Text className="text-primary text-xl">
          {formatCurrency(item.monthlyCost).replace("+ ", "")}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeScreen safeArea="both">
      <View className="flex-row justify-end">
        <TouchableOpacity
          className="size-12 items-center justify-center rounded-xl"
          onPress={() => router.push("/sandbox")}
          accessibilityRole="button"
          accessibilityLabel="Open opportunity cost sandbox"
        >
          <Calculator size={18} color="#c200fb" />
        </TouchableOpacity>
      </View>

      {/* Top Section: The Survival Clock */}
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

      {/* Middle Section: The SaaS Bleed */}
      <View className="flex-1 mt-6">
        <ExpenseList
          data={subscriptions}
          keyExtractor={(item) => item._id}
          title="Continuous Bleed"
          badge={`${subscriptions.length} ACTIVE`}
          renderItem={renderSubscription}
        />
      </View>

      {/* Bottom Section: Action */}
      <View>
        <CustomButton
          variant="secondary"
          label="New Bleeding"
          onPress={() => setIsSheetOpen(true)}
        />
      </View>

      <SubscriptionSheet isOpen={isSheetOpen} onOpenChange={setIsSheetOpen} />

      <DeleteSubscriptionDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={handleDeleteDialogChange}
        onConfirm={confirmDeleteSubscription}
        isLoading={isDeleting}
      />
    </SafeScreen>
  );
}
