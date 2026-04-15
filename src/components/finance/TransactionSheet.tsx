import { api } from "@/convex/_generated/api";
import { Text } from "@/src/components/ui/text";
import { useMutation } from "convex/react";
import {
  BottomSheet,
  Button,
  Chip,
  Input,
  Label,
  Tabs,
  TextField,
  cn,
} from "heroui-native";
import { Check } from "lucide-react-native";
import React, { useState } from "react";
import { View } from "react-native";

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
        category: type === "IN" ? "Income" : category,
        note: note.trim() || undefined,
      });
      setAmount("");
      setNote("");
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
              onValueChange={(value) => setType(value as "IN" | "OUT")}
              variant="primary"
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

            {/* Amount Input */}
            <TextField>
              <Label>Amount</Label>
              <Input
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                selectionColorClassName="accent-primary"
                autoFocus
              />
            </TextField>

            {/* Note Input */}
            <TextField>
              <Label>Note</Label>
              <Input
                placeholder="Optional note (Client, reason, etc.)"
                value={note}
                onChangeText={setNote}
                selectionColorClassName="accent-primary"
              />
            </TextField>

            {/* Category Chips (only for OUT) */}
            {type === "OUT" && (
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
            )}

            {/* Submit Button */}
            <Button
              variant="secondary"
              onPress={handleSubmit}
              isDisabled={!amount || isSubmitting}
            >
              {isSubmitting ? (
                <Button.Label className="text-white font-bold text-lg">
                  Logging...
                </Button.Label>
              ) : (
                <>
                  <Check color="white" size={24} strokeWidth={3} />
                  <Button.Label className="text-white font-bold text-lg ml-2">
                    Confirm
                  </Button.Label>
                </>
              )}
            </Button>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
