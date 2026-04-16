import { api } from "@/convex/_generated/api";
import { RenderIf } from "@/src/components/helpers/render-if";
import { Show } from "@/src/components/helpers/show";
import { Text } from "@/src/components/ui/text";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useMutation } from "convex/react";
import {
  BottomSheet,
  Button,
  Chip,
  Label,
  Tabs,
  TextField,
  cn,
} from "heroui-native";
import { Check } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

interface TransactionSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = ["Taxi", "Food", "SaaS", "Junk"];

export function TransactionSheet({
  isOpen,
  onOpenChange,
}: TransactionSheetProps) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState<"IN" | "OUT">("OUT");
  const [isPending, setIsPending] = useState(false);
  const [category, setCategory] = useState("Junk");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const logTransaction = useMutation(api.transactions.logTransaction);

  const handleSubmit = async () => {
    const numAmount = Number.parseFloat(amount);
    if (Number.isNaN(numAmount) || numAmount <= 0) return;

    setIsSubmitting(true);
    try {
      await logTransaction({
        amount: numAmount,
        type,
        status: type === "IN" && isPending ? "PENDING" : "CLEARED",
        category: type === "IN" ? "Income" : category,
        note: note.trim() || undefined,
      });
      setAmount("");
      setNote("");
      setIsPending(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to log transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay className="bg-black/60" />
        <BottomSheet.Content
          index={0}
          snapPoints={["88%"]}
          enableDynamicSizing={false}
          enablePanDownToClose
          backgroundClassName="bg-background rounded-t-[40px] border-t border-white/5"
        >
          <View className="gap-8 pb-safe">
            <View className="items-center">
              <Text variant="large" className="text-foreground font-bold">
                New Transaction
              </Text>
            </View>

            {/* IN/OUT Toggle */}
            <Tabs
              value={type}
              onValueChange={(value) => {
                const nextType = value as "IN" | "OUT";
                setType(nextType);
                if (nextType === "OUT") {
                  setIsPending(false);
                }
              }}
              variant="secondary"
            >
              <Tabs.List className="rounded-xl">
                <Tabs.Indicator className="rounded-xl" />
                <Tabs.Trigger value="IN" className="rounded-xl flex-1">
                  {({ isSelected }) => (
                    <Tabs.Label
                      className={cn(
                        "font-bold",
                        isSelected ? "text-white" : "text-foreground/40",
                      )}
                    >
                      Income
                    </Tabs.Label>
                  )}
                </Tabs.Trigger>
                <Tabs.Trigger value="OUT" className="rounded-xl flex-1">
                  {({ isSelected }) => (
                    <Tabs.Label
                      className={cn(
                        "font-bold",
                        isSelected ? "text-white" : "text-foreground/40",
                      )}
                    >
                      Expense
                    </Tabs.Label>
                  )}
                </Tabs.Trigger>
              </Tabs.List>
            </Tabs>

            <RenderIf condition={type === "IN"}>
              <View className="gap-3">
                <Label>Income Mode</Label>
                <Tabs
                  value={isPending ? "PENDING" : "CLEARED"}
                  onValueChange={(value) => setIsPending(value === "PENDING")}
                  variant="secondary"
                >
                  <Tabs.List className="rounded-xl">
                    <Tabs.Indicator className="rounded-xl" />
                    <Tabs.Trigger value="CLEARED" className="rounded-xl flex-1">
                      {({ isSelected }) => (
                        <Tabs.Label
                          className={cn(
                            "font-semibold",
                            isSelected ? "text-white" : "text-foreground/50",
                          )}
                        >
                          Cash Received
                        </Tabs.Label>
                      )}
                    </Tabs.Trigger>
                    <Tabs.Trigger value="PENDING" className="rounded-xl flex-1">
                      {({ isSelected }) => (
                        <Tabs.Label
                          className={cn(
                            "font-semibold",
                            isSelected ? "text-white" : "text-foreground/50",
                          )}
                        >
                          Invoice Sent
                        </Tabs.Label>
                      )}
                    </Tabs.Trigger>
                  </Tabs.List>
                </Tabs>
              </View>
            </RenderIf>

            {/* Amount Input */}
            <TextField>
              <Label>Amount</Label>
              <BottomSheetTextInput
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                selectionColor="#f8fafc"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </TextField>

            {/* Note Input */}
            <TextField>
              <Label>Note</Label>
              <BottomSheetTextInput
                placeholder="Optional note (Client, reason, etc.)"
                value={note}
                onChangeText={setNote}
                selectionColor="#f8fafc"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </TextField>

            {/* Category Chips (only for OUT) */}
            <RenderIf condition={type === "OUT"}>
              <View className="gap-3">
                <Label>Category</Label>
                <View className="flex-row flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <Chip
                      key={cat}
                      onPress={() => setCategory(cat)}
                      className={cn(
                        "px-2 rounded-xl",
                        category === cat
                          ? "bg-primary border-primary"
                          : "bg-white/5",
                      )}
                    >
                      <Chip.Label
                        className={cn(
                          "font-bold",
                          category === cat
                            ? "text-white"
                            : "text-foreground/60",
                        )}
                      >
                        {cat}
                      </Chip.Label>
                    </Chip>
                  ))}
                </View>
              </View>
            </RenderIf>

            {/* Submit Button */}
            <Button
              variant="secondary"
              onPress={handleSubmit}
              isDisabled={!amount || isSubmitting}
            >
              <Show>
                <Show.When condition={isSubmitting}>
                  <Button.Label className="text-white font-bold text-lg">
                    Logging...
                  </Button.Label>
                </Show.When>
                <Show.Else>
                  <>
                    <Check color="white" size={24} strokeWidth={3} />
                    <Button.Label className="text-white font-bold text-lg ml-2">
                      Confirm
                    </Button.Label>
                  </>
                </Show.Else>
              </Show>
            </Button>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
    color: "#f8fafc",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderRadius: 12,
  },
});
