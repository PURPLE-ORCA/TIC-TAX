import { View } from "react-native";
import { SafeScreen } from "@/src/components/layout/SafeScreen";
import { Text } from "@/src/components/ui/text";

export default function RunwayScreen() {
  return (
    <SafeScreen className="bg-black">
      <View className="flex-1 justify-center items-center gap-4">
        <Text className="text-2xl font-black tracking-tighter text-white uppercase">RUNWAY</Text>
        <Text className="text-zinc-500 uppercase font-bold">Projection system offline</Text>
      </View>
    </SafeScreen>
  );
}
