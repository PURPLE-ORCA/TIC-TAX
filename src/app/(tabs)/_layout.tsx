import { Tabs } from "expo-router";
import { Activity, PlaneTakeoff } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#1A1A1A',
          height: 80,
          paddingBottom: 25,
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#404040',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "PULSE",
          tabBarIcon: ({ color }) => <Activity size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="runway"
        options={{
          title: "RUNWAY",
          tabBarIcon: ({ color }) => <PlaneTakeoff size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
