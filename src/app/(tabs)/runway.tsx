import { View, Text } from "react-native";
import { SafeScreen } from "@/src/components/layout/SafeScreen";

export default function RunwayScreen() {
  return (
    <SafeScreen className="bg-black">
      <View className="flex-1 justify-center items-center">
        <Text className="text-white text-2xl font-black tracking-tighter">RUNWAY</Text>
        <Text className="text-zinc-500 mt-2">Projection system offline</Text>
      </View>
    </SafeScreen>
  );
}
