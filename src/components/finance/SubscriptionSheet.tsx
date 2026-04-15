import React, { useState } from 'react';
import { View } from 'react-native';
import { 
  BottomSheet,
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
    const cost = Number.parseFloat(monthlyCost);
    if (!name || Number.isNaN(cost) || cost <= 0) return;

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
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay className="bg-black/60" />
        <BottomSheet.Content
          index={0}
          snapPoints={['62%']}
          enableDynamicSizing={false}
          enablePanDownToClose
          backgroundClassName="bg-background"
        >
          <View className="gap-8 pb-safe">
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
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
