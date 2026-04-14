import { Tabs } from "expo-router";
import { Activity, PlaneTakeoff } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#00120B',
          borderTopColor: 'rgba(255,255,255,0.05)',
          height: 90,
          paddingBottom: 35,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: '#C200FB',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.2)',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
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
            <PlaneTakeoff size={24} color={color} strokeWidth={focused ? 3 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}
