import { View } from "react-native";
import { SafeScreen } from "@/src/components/layout/SafeScreen";
import { Text } from "@/src/components/ui/text";
import { Card } from "heroui-native";
import { PlaneTakeoff } from "lucide-react-native";

export default function RunwayScreen() {
  return (
    <SafeScreen className="bg-background">
      <View className="flex-1 justify-center px-6 gap-6">
        <View className="items-center mb-8">
          <View className="bg-primary/10 p-6 rounded-full mb-6">
            <PlaneTakeoff size={48} color="#C200FB" strokeWidth={2} />
          </View>
          <Text variant="subtitle" className="text-foreground font-black uppercase tracking-widest text-center">
            Runway
          </Text>
          <Text variant="default" className="text-foreground/40 text-center mt-2 px-8">
            Your financial future projected and visualized.
          </Text>
        </View>

        <Card variant="secondary" className="p-8 rounded-[32px] border border-white/5 items-center">
          <Text variant="large" className="text-foreground/20 font-bold uppercase tracking-widest mb-2">
            Status
          </Text>
          <Text variant="price" className="text-foreground/40 font-bold uppercase">
            Projection system offline
          </Text>
          <View className="mt-6 w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <View className="w-1/3 h-full bg-primary/20" />
          </View>
        </Card>

        <Text variant="small" className="text-foreground/20 text-center uppercase tracking-widest font-bold">
          Coming Soon
        </Text>
      </View>
    </SafeScreen>
  );
}
