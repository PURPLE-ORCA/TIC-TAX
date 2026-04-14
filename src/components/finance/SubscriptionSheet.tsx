import React, { useState } from 'react';
import { View } from 'react-native';
import { 
  Dialog, 
  Button, 
  Input, 
  Label, 
  TextField,
  cn 
} from 'heroui-native';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Check } from 'lucide-react-native';
import { Text } from '@/src/components/ui/text';

interface SubscriptionSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscriptionSheet({ isOpen, onOpenChange }: SubscriptionSheetProps) {
  const [name, setName] = useState('');
  const [monthlyCost, setMonthlyCost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addSubscription = useMutation(api.subscriptions.addSubscription);

  const handleSubmit = async () => {
    const cost = parseFloat(monthlyCost);
    if (!name || isNaN(cost) || cost <= 0) return;

    setIsSubmitting(true);
    try {
      await addSubscription({
        name,
        monthlyCost: cost,
      });
      setName('');
      setMonthlyCost('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add subscription:', error);
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
              <Text variant="large" className="text-foreground font-bold">New SaaS Bleed</Text>
            </View>

            {/* Name Input */}
            <TextField>
              <Label className="text-foreground/40 font-bold mb-2 uppercase tracking-widest text-xs">Service Name</Label>
              <Input
                placeholder="e.g. ChatGPT"
                value={name}
                onChangeText={setName}
                className="bg-white/5 border-none h-14 text-xl font-bold text-foreground px-6 rounded-2xl"
                placeholderColorClassName="text-white/10"
                selectionColorClassName="accent-primary"
              />
            </TextField>

            {/* Monthly Cost Input */}
            <TextField>
              <Label className="text-foreground/40 font-bold mb-2 uppercase tracking-widest text-xs">Monthly Cost (MAD)</Label>
              <Input
                placeholder="0.00"
                value={monthlyCost}
                onChangeText={setMonthlyCost}
                keyboardType="decimal-pad"
                className="bg-white/5 border-none h-20 text-4xl font-black text-primary px-6 rounded-2xl"
                placeholderColorClassName="text-white/10"
                selectionColorClassName="accent-primary"
              />
            </TextField>

            {/* Submit Button */}
            <Button 
              variant="primary"
              className="h-16 rounded-2xl shadow-xl shadow-primary/30 mt-4"
              onPress={handleSubmit}
              isDisabled={!name || !monthlyCost || isSubmitting}
            >
              {isSubmitting ? (
                <Button.Label className="text-white font-bold text-lg">Adding...</Button.Label>
              ) : (
                <>
                  <Check color="white" size={24} strokeWidth={3} />
                  <Button.Label className="text-white font-bold text-lg ml-2">Add Subscription</Button.Label>
                </>
              )}
            </Button>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
