import React, { useState } from 'react';
import { View } from 'react-native';
import { 
  Dialog, 
  Button, 
  Input, 
  Chip, 
  Label, 
  TextField,
  cn 
} from 'heroui-native';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Check } from 'lucide-react-native';
import { Text } from '@/src/components/ui/text';

interface TransactionSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = ['Taxi', 'Food', 'SaaS', 'Junk'];

export function TransactionSheet({ isOpen, onOpenChange }: TransactionSheetProps) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'IN' | 'OUT'>('OUT');
  const [category, setCategory] = useState('Junk');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const logTransaction = useMutation(api.transactions.logTransaction);

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setIsSubmitting(true);
    try {
      await logTransaction({
        amount: numAmount,
        type,
        category: type === 'IN' ? 'Income' : category,
        note: note.trim() || undefined,
      });
      setAmount('');
      setNote('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to log transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal className="justify-end p-0">
        <Dialog.Overlay className="bg-black/60" />
        <Dialog.Content 
          className="bg-background rounded-t-[40px] border-t border-white/5 w-full pb-safe"
        >
          <View className="p-8 gap-8">
            <View className="items-center">
              <View className="w-12 h-1.5 bg-white/10 rounded-full mb-2" />
              <Text variant="large" className="text-foreground font-bold">New Transaction</Text>
            </View>

            {/* IN/OUT Toggle */}
            <View className="flex-row p-1.5 rounded-2xl">
              <Button 
                variant={type === 'IN' ? 'primary' : 'ghost'}
                className={cn(
                  "flex-1 h-12 rounded-xl",
                  type === 'IN' ? "shadow-md shadow-primary/20" : ""
                )}
                onPress={() => setType('IN')}
              >
                <Button.Label className={cn("font-bold ml-2", type === 'IN' ? "text-white" : "text-foreground/40")}>
                  Income
                </Button.Label>
              </Button>
              <Button 
                variant={type === 'OUT' ? 'primary' : 'ghost'}
                className={cn(
                  "flex-1 h-12 rounded-xl",
                  type === 'OUT' ? "shadow-md shadow-primary/20" : ""
                )}
                onPress={() => setType('OUT')}
              >
                <Button.Label className={cn("font-bold ml-2", type === 'OUT' ? "text-white" : "text-foreground/40")}>
                  Expense
                </Button.Label>
              </Button>
            </View>

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

            {/* Category Chips (only for OUT) */}
            {type === 'OUT' && (
              <View className="gap-3">
                <Label >Category</Label>
                <View className="flex-row flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <Chip 
                      key={cat}
                      onPress={() => setCategory(cat)}
                      className={cn(
                        "px-5 py-2.5 rounded-xl border border-white/5",
                        category === cat ? "bg-primary border-primary" : "bg-white/5"
                      )}
                    >
                      <Chip.Label className={cn(
                        "font-bold",
                        category === cat ? "text-white" : "text-foreground/60"
                      )}>
                        {cat}
                      </Chip.Label>
                    </Chip>
                  ))}
                </View>
              </View>
            )}

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

            {/* Submit Button */}
            <Button 
              variant="secondary"
              onPress={handleSubmit}
              isDisabled={!amount || isSubmitting}
            >
              {isSubmitting ? (
                <Button.Label className="text-white font-bold text-lg">Logging...</Button.Label>
              ) : (
                <>
                  <Check color="white" size={24} strokeWidth={3} />
                  <Button.Label className="text-white font-bold text-lg ml-2">Confirm</Button.Label>
                </>
              )}
            </Button>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

