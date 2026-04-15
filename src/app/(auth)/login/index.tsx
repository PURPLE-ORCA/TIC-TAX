import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeScreen } from '@/src/components/layout/SafeScreen';
import { Text } from '@/src/components/ui/text';
import { Button, Input, TextField, Label, Card } from 'heroui-native';
import { useAuthActions } from "@convex-dev/auth/react";
import { Lock, Mail } from 'lucide-react-native';

export default function LoginScreen() {
  const [step, setStep] = useState<'signin' | 'link-sent'>('signin');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuthActions();

  const handleSignIn = async () => {
    if (!email) return;
    setIsLoading(true);
    try {
      await signIn("resend", { email });
      setStep('link-sent');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeScreen safeArea="both" contentClassName="justify-center px-6">
      <View className="mb-12 items-center">
        <View className="bg-primary/10 p-6 rounded-[32px] mb-6">
          <Lock size={48} color="#C200FB" strokeWidth={2} />
        </View>
        <Text variant="title" className="text-foreground text-4xl font-black text-center">
          TIC-TAX
        </Text>
        <Text variant="default" className="text-foreground/40 text-center mt-2 font-medium">
          Control your tax liability with style.
        </Text>
      </View>

      <Card variant="secondary" className="p-8 rounded-[40px] border border-white/5">
        {step === 'signin' ? (
          <View className="gap-6">
            <TextField>
              <Label className="text-foreground/40 font-bold mb-2 uppercase tracking-widest text-xs ml-1">Email Address</Label>
              <View className="relative justify-center">
                <Input
                  placeholder="name@company.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="bg-white/5 border-none h-16 px-12 rounded-2xl text-foreground font-semibold"
                  placeholderColorClassName="text-white/10"
                  selectionColorClassName="accent-primary"
                />
                <View className="absolute left-4">
                  <Mail size={20} color="rgba(255,255,255,0.2)" />
                </View>
              </View>
            </TextField>

            <Button
              variant="primary"
              className="h-16 rounded-2xl shadow-xl shadow-primary/20 mt-2"
              onPress={handleSignIn}
              isDisabled={!email || isLoading}
            >
              <Button.Label className="text-white font-bold text-lg">
                {isLoading ? 'Sending Magic Link...' : 'Get Magic Link'}
              </Button.Label>
            </Button>
          </View>
        ) : (
          <View className="items-center py-4">
            <View className="bg-green-500/10 p-4 rounded-full mb-4">
              <Mail size={32} color="#22c55e" />
            </View>
            <Text variant="large" className="text-foreground font-bold text-center">Check your email</Text>
            <Text variant="default" className="text-foreground/40 text-center mt-2">
              We've sent a magic link to {email}
            </Text>
            <Button
              variant="tertiary"
              className="mt-6"
              onPress={() => setStep('signin')}
            >
              <Button.Label className="text-primary font-bold">Back to Login</Button.Label>
            </Button>
          </View>
        )}
      </Card>

      <View className="mt-12 items-center">
        <Text variant="xsBold" className="text-foreground/20 uppercase tracking-[4px]">
          Securely Powered by Convex
        </Text>
      </View>
    </SafeScreen>
  );
}
