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
import { ArrowDown, ArrowUp, Check } from 'lucide-react-native';

interface TransactionSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = ['Taxi', 'Food', 'SaaS', 'Junk'];

export function TransactionSheet({ isOpen, onOpenChange }: TransactionSheetProps) {
  const [amount, setAmount] = useState('');
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
      });
      setAmount('');
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
        <Dialog.Overlay />
        <Dialog.Content 
          className="bg-black border-t-4 border-white rounded-none w-full"
          animation={{
            scale: { value: 1 },
          }}
        >
          <View className="p-6 gap-8 pb-10">
            {/* IN/OUT Toggle */}
            <View className="flex-row gap-4">
              <Button 
                className={cn(
                  "flex-1 border-4 h-16 rounded-none",
                  type === 'IN' ? "bg-white border-white" : "bg-black border-white/20"
                )}
                onPress={() => setType('IN')}
              >
                <ArrowUp color={type === 'IN' ? 'black' : 'white'} size={24} />
                <Button.Label className={cn("font-black text-xl", type === 'IN' ? "text-black" : "text-white")}>
                  IN
                </Button.Label>
              </Button>
              <Button 
                className={cn(
                  "flex-1 border-4 h-16 rounded-none",
                  type === 'OUT' ? "bg-white border-white" : "bg-black border-white/20"
                )}
                onPress={() => setType('OUT')}
              >
                <ArrowDown color={type === 'OUT' ? 'black' : 'white'} size={24} />
                <Button.Label className={cn("font-black text-xl", type === 'OUT' ? "text-black" : "text-white")}>
                  OUT
                </Button.Label>
              </Button>
            </View>

            {/* Amount Input */}
            <TextField>
              <Label className="text-white font-bold mb-2 uppercase tracking-widest">Amount</Label>
              <Input
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                className="bg-black border-4 border-white h-24 text-5xl font-black text-white px-4 rounded-none"
                placeholderColorClassName="text-white/20"
                selectionColorClassName="accent-white"
                autoFocus
              />
            </TextField>

            {/* Category Chips (only for OUT) */}
            {type === 'OUT' && (
              <View className="gap-3">
                <Label className="text-white font-bold uppercase tracking-widest">Category</Label>
                <View className="flex-row flex-wrap gap-3">
                  {CATEGORIES.map((cat) => (
                    <Chip 
                      key={cat}
                      onPress={() => setCategory(cat)}
                      className={cn(
                        "px-6 py-3 border-2 rounded-none",
                        category === cat ? "bg-white border-white" : "bg-black border-white/40"
                      )}
                    >
                      <Chip.Label className={cn(
                        "font-bold uppercase",
                        category === cat ? "text-black" : "text-white"
                      )}>
                        {cat}
                      </Chip.Label>
                    </Chip>
                  ))}
                </View>
              </View>
            )}

            {/* Submit Button */}
            <Button 
              className="bg-white h-20 border-4 border-white rounded-none mt-4"
              onPress={handleSubmit}
              isDisabled={!amount || isSubmitting}
            >
              {isSubmitting ? (
                <Button.Label className="text-black font-black text-2xl uppercase italic">Logging...</Button.Label>
              ) : (
                <>
                  <Check color="black" size={32} strokeWidth={4} />
                  <Button.Label className="text-black font-black text-2xl uppercase">Confirm</Button.Label>
                </>
              )}
            </Button>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

