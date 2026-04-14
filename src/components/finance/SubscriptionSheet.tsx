import React, { useState } from 'react';
import { View } from 'react-native';
import { 
  Dialog, 
  Button, 
  Input, 
  Label, 
  TextField,
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
          className="bg-background w-full pb-safe"
        >
          <View className="p-8 gap-8">
            <View className="items-center">
              <Text variant="large">New SaaS Bleed</Text>
            </View>

            {/* Name Input */}
            <TextField>
              <Label>Service Name</Label>
              <Input
                placeholder="e.g. ChatGPT"
                value={name}
                onChangeText={setName}
              />
            </TextField>

            {/* Monthly Cost Input */}
            <TextField>
              <Label>Monthly Cost (MAD)</Label>
              <Input
                placeholder="0.00"
                value={monthlyCost}
                onChangeText={setMonthlyCost}
                keyboardType="decimal-pad"
              />
            </TextField>

            {/* Submit Button */}
            <Button 
              variant="secondary"
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
