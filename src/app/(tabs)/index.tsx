import { View, Text, ScrollView } from "react-native";
import { SafeScreen } from "@/src/components/layout/SafeScreen";
import { useFinance } from "@/src/hooks/useFinance";

export default function PulseScreen() {
  const { safeToSpend, taxHostage, totalBleed, isLoading } = useFinance();

  if (isLoading) {
    return (
      <SafeScreen className="bg-black">
        <View className="flex-1 justify-center items-center">
          <Text className="text-white font-mono">PULSE SYNCING...</Text>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen className="bg-black">
      <ScrollView className="flex-1 px-6 pt-12">
        <View className="mb-12">
          <Text className="text-zinc-500 font-bold text-xs tracking-widest mb-2 uppercase">Safe to Spend</Text>
          <Text className="text-white text-7xl font-black tracking-tighter leading-none">
            ${safeToSpend.toLocaleString()}
          </Text>
        </View>

        <View className="flex-row gap-4 mb-8">
          <View className="flex-1 bg-zinc-900 p-6 border border-zinc-800">
            <Text className="text-red-500 font-bold text-[10px] tracking-widest uppercase mb-1">Tax Hostage</Text>
            <Text className="text-white text-2xl font-black">${taxHostage.toLocaleString()}</Text>
          </View>
          
          <View className="flex-1 bg-zinc-900 p-6 border border-zinc-800">
            <Text className="text-zinc-500 font-bold text-[10px] tracking-widest uppercase mb-1">Total Bleed</Text>
            <Text className="text-white text-2xl font-black">${totalBleed.toLocaleString()}</Text>
          </View>
        </View>

        <View className="mt-12 opacity-30">
          <Text className="text-white font-mono text-xs uppercase">No active bleed detected</Text>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
