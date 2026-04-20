import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { TransactionSheet } from "@/src/components/finance/TransactionSheet";
import { useFinance } from "@/src/components/hooks/useFinance";
import { SafeScreen } from "@/src/components/layout/SafeScreen";
import { formatCurrency } from "@/src/components/lib/format-currency";
import { ClearInvoiceDialog } from "@/src/components/screens/home/ClearInvoiceDialog";
import { DeleteTransactionDialog } from "@/src/components/screens/home/DeleteTransactionDialog";
import { FinanceSummary } from "@/src/components/screens/home/FinanceSummary";
import { PayTaxesDialog } from "@/src/components/screens/home/PayTaxesDialog";
import { CustomButton } from "@/src/components/ui/custom-button";
import { PlumGradientBackground } from "@/src/components/ui/PlumGradientBackground";
import { Text } from "@/src/components/ui/text";
import { TimelineItem } from "@/src/components/ui/Timeline";
import { useMutation } from "convex/react";
import { Card } from "heroui-native";
import { useState } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";

export default function PulseTab() {
  const {
    safeToSpend,
    taxHostage,
    pendingCapital,
    recentTransactions,
    isLoading,
  } = useFinance();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] =
    useState<Id<"transactions"> | null>(null);
  const [pendingClearId, setPendingClearId] =
    useState<Id<"transactions"> | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isTaxesDialogOpen, setIsTaxesDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearingInvoice, setIsClearingInvoice] = useState(false);
  const [isPayingTaxes, setIsPayingTaxes] = useState(false);
  const deleteTransaction = useMutation(api.transactions.deleteTransaction);
  const clearInvoice = useMutation(api.transactions.clearInvoice);
  const markTaxesPaid = useMutation(api.transactions.markTaxesPaid);
  type RecentTransaction = (typeof recentTransactions)[number];

  const openDeleteDialog = (id: Id<"transactions">) => {
    setPendingDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDialogChange = (open: boolean) => {
    setIsDeleteDialogOpen(open);
    if (!open) setPendingDeleteId(null);
  };

  const openClearDialog = (id: Id<"transactions">) => {
    setPendingClearId(id);
    setIsClearDialogOpen(true);
  };

  const handleClearDialogChange = (open: boolean) => {
    setIsClearDialogOpen(open);
    if (!open) setPendingClearId(null);
  };

  const handleTransactionLongPress = (tx: RecentTransaction) => {
    if (tx.type === "IN" && tx.status === "PENDING") {
      openClearDialog(tx._id);
      return;
    }

    openDeleteDialog(tx._id);
  };

  const getTransactionIcon = (tx: RecentTransaction) => {
    if (tx.type === "IN" && tx.status === "PENDING") {
      return { name: "time-outline" as const, color: "#fbbf24" };
    }
    if (tx.type === "IN") {
      return { name: "arrow-down-outline" as const, color: "green" };
    }
    return { name: "arrow-up-outline" as const, color: "red" };
  };

  const getTransactionTone = (tx: RecentTransaction) => {
    if (tx.type !== "IN") return "text-white/40";
    if (tx.status === "PENDING") return "text-yellow-400";
    return "text-emerald-400";
  };

  const getTransactionAmount = (tx: RecentTransaction) =>
    tx.type === "IN" ? tx.amount : -tx.amount;

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

  const confirmClearInvoice = async () => {
    if (!pendingClearId || isClearingInvoice) return;

    setIsClearingInvoice(true);
    try {
      await clearInvoice({ id: pendingClearId });
      setIsClearDialogOpen(false);
      setPendingClearId(null);
    } catch (error) {
      console.error("Failed to clear invoice:", error);
    } finally {
      setIsClearingInvoice(false);
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
    <SafeScreen
      safeArea="both"
      className="relative overflow-hidden bg-transparent"
    >
      <PlumGradientBackground />

      {/* Finance Summary */}
      <FinanceSummary
        safeToSpend={safeToSpend}
        taxHostage={taxHostage}
        pendingCapital={pendingCapital}
        isLoading={isLoading}
        onTaxHostageLongPress={() => setIsTaxesDialogOpen(true)}
      />

      {/* Recent Activity */}
      <Card variant="transparent" className="flex-1 py-4 px-2">
        <Text variant="large" className="mb-4">
          Recent Activity
        </Text>
        <FlatList
          data={recentTransactions}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !isLoading ? (
              <View className="py-20 items-center">
                <Text variant="small" className="text-white/20">
                  No Items Yet
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item: tx, index }) => {
            const icon = getTransactionIcon(tx);
            return (
              <TouchableOpacity
                onLongPress={() => handleTransactionLongPress(tx)}
                delayLongPress={300}
              >
                <TimelineItem
                  icon={icon.name}
                  iconColor={icon.color}
                  iconBgColor="bg-plum-deep"
                  title={tx.note || tx.category}
                  subtitle={tx.note ? tx.category : undefined}
                  isFirst={index === 0}
                  isLast={index === recentTransactions.length - 1}
                  rightContent={
                    <Text variant="xs" className={getTransactionTone(tx)}>
                      {formatCurrency(getTransactionAmount(tx))}
                    </Text>
                  }
                />
              </TouchableOpacity>
            );
          }}
        />
      </Card>

      <CustomButton
        variant="secondary"
        label="New Transaction"
        onPress={() => setIsSheetOpen(true)}
      />
      <TransactionSheet isOpen={isSheetOpen} onOpenChange={setIsSheetOpen} />

      <DeleteTransactionDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={handleDeleteDialogChange}
        onConfirm={confirmDeleteTransaction}
        isLoading={isDeleting}
      />

      <ClearInvoiceDialog
        isOpen={isClearDialogOpen}
        onOpenChange={handleClearDialogChange}
        onConfirm={confirmClearInvoice}
        isLoading={isClearingInvoice}
      />

      <PayTaxesDialog
        isOpen={isTaxesDialogOpen}
        onOpenChange={setIsTaxesDialogOpen}
        onConfirm={confirmMarkTaxesPaid}
        isLoading={isPayingTaxes}
      />
    </SafeScreen>
  );
}
