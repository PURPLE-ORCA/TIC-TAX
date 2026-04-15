import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { TransactionSheet } from "@/src/components/finance/TransactionSheet";
import { useFinance } from "@/src/components/hooks/useFinance";
import { SafeScreen } from "@/src/components/layout/SafeScreen";
import { formatCurrency } from "@/src/components/lib/format-currency";
import { CustomButton } from "@/src/components/ui/custom-button";
import { Text } from "@/src/components/ui/text";
import { useMutation } from "convex/react";
import { Button, Card, Dialog } from "heroui-native";
import React, { useState } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";

export default function PulseTab() {
  const { safeToSpend, taxHostage, recentTransactions, isLoading } =
    useFinance();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] =
    useState<Id<"transactions"> | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTaxesDialogOpen, setIsTaxesDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPayingTaxes, setIsPayingTaxes] = useState(false);
  const deleteTransaction = useMutation(api.transactions.deleteTransaction);
  const markTaxesPaid = useMutation(api.transactions.markTaxesPaid);

  const openDeleteDialog = (id: Id<"transactions">) => {
    setPendingDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDialogChange = (open: boolean) => {
    setIsDeleteDialogOpen(open);
    if (!open) setPendingDeleteId(null);
  };

  const confirmDeleteTransaction = async () => {
    if (!pendingDeleteId || isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteTransaction({ id: pendingDeleteId });
      setIsDeleteDialogOpen(false);
      setPendingDeleteId(null);
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmMarkTaxesPaid = async () => {
    if (isPayingTaxes) return;

    setIsPayingTaxes(true);
    try {
      await markTaxesPaid({});
      setIsTaxesDialogOpen(false);
    } catch (error) {
      console.error("Failed to mark taxes paid:", error);
    } finally {
      setIsPayingTaxes(false);
    }
  };

  return (
    <SafeScreen safeArea="both">
      {/* Header */}
      <View>
        <View className="gap-4">
          <Card variant="transparent" className="p-6 border rounded-xl">
            <Text variant="smallBold" className="text-foreground/40 mb-1">
              Safe to Spend
            </Text>
            <Text variant="subtitle">
              {isLoading ? "..." : formatCurrency(safeToSpend)}
            </Text>
          </Card>

          <TouchableOpacity
            onLongPress={() => setIsTaxesDialogOpen(true)}
            delayLongPress={300}
          >
            <Card
              variant="transparent"
              className="p-6 rounded-xl border border-red-500/20 bg-red-500/5"
            >
              <Text variant="smallBold" className="text-red-500/60 mb-1">
                Tax Hostage
              </Text>
              <Text variant="subtitle" className="text-red-500">
                {isLoading ? "..." : formatCurrency(taxHostage)}
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
        <Text className="mb-4">Recent Activity</Text>

        <FlatList
          data={recentTransactions}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !isLoading ? <Text>No transactions yet.</Text> : null
          }
          renderItem={({ item: tx }) => (
            <TouchableOpacity
              className="flex-row justify-between py-4 border-b border-foreground/5"
              onLongPress={() => openDeleteDialog(tx._id)}
              delayLongPress={300}
            >
              <Text
                variant={tx.note ? "default" : "small"}
                className={
                  tx.note
                    ? "text-foreground font-semibold"
                    : "text-foreground/80"
                }
              >
                {tx.note || tx.category}
              </Text>
              <Text
                variant="smallBold"
                className={
                  tx.type === "IN" ? "text-green-500" : "text-foreground/40"
                }
              >
                {formatCurrency(tx.type === "IN" ? tx.amount : -tx.amount)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <TransactionSheet isOpen={isSheetOpen} onOpenChange={setIsSheetOpen} />

      <Dialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={handleDeleteDialogChange}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="bg-black/60" />
          <Dialog.Content className="mx-6 rounded-2xl border border-foreground/10 bg-background p-6">
            <Dialog.Close variant="ghost" />
            <View className="mb-6 gap-1.5">
              <Dialog.Title>Delete Transaction?</Dialog.Title>
              <Dialog.Description>
                This action cannot be undone.
              </Dialog.Description>
            </View>
            <View className="flex-row justify-end gap-3">
              <Button
                variant="tertiary"
                size="sm"
                onPress={() => handleDeleteDialogChange(false)}
              >
                <Button.Label>Cancel</Button.Label>
              </Button>
              <Button
                variant="danger"
                size="sm"
                onPress={confirmDeleteTransaction}
                isDisabled={isDeleting}
              >
                <Button.Label>
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button.Label>
              </Button>
            </View>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>

      <Dialog isOpen={isTaxesDialogOpen} onOpenChange={setIsTaxesDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-black/60" />
          <Dialog.Content className="mx-6 rounded-2xl border border-foreground/10 bg-background p-6">
            <Dialog.Close variant="ghost" />
            <View className="mb-6 gap-1.5">
              <Dialog.Title>Pay the Piper?</Dialog.Title>
              <Dialog.Description>
                Mark all current taxes as paid? This resets hostage counter to 0
                MAD.
              </Dialog.Description>
            </View>
            <View className="flex-row justify-end gap-3">
              <Button
                variant="tertiary"
                size="sm"
                onPress={() => setIsTaxesDialogOpen(false)}
              >
                <Button.Label>Cancel</Button.Label>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onPress={confirmMarkTaxesPaid}
                isDisabled={isPayingTaxes}
              >
                <Button.Label>
                  {isPayingTaxes ? "Confirming..." : "Confirm"}
                </Button.Label>
              </Button>
            </View>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </SafeScreen>
  );
}
