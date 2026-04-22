import { Tabs } from "expo-router";
import { Activity, PlaneTakeoff } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();
  const tabBarPaddingBottom = Math.max(bottom, 12);
  const tabBarHeight = 62 + tabBarPaddingBottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#06000A",
          borderTopColor: "rgba(255,255,255,0.05)",
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: "#C200FB",
        tabBarInactiveTintColor: "rgba(255,255,255,0.2)",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "bold",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Pulse",
          tabBarIcon: ({ color, focused }) => (
            <Activity size={24} color={color} strokeWidth={focused ? 3 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="runway"
        options={{
          title: "Runway",
          tabBarIcon: ({ color, focused }) => (
            <PlaneTakeoff
              size={24}
              color={color}
              strokeWidth={focused ? 3 : 2}
            />
          ),
        }}
      />
    </Tabs>
  );
}
